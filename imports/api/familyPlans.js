import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const FamilyPlans = new Mongo.Collection('familyPlans');
export const FamilyPlanParticipants = new Mongo.Collection('familyPlanParticipants');

if (Meteor.isServer) {

    async function _sendEmail(userId, emailText) {
        let _emails = await _getUserEmailAddresses(userId);

        if (_emails.length > 0) {
            let _msg = {
                to: _emails,
                from: "m.ign415@gmail.com",
                subject: "Splitsies: spend together",
                html: emailText + "<br/><strong>Check your dashboard here: <a href='https://splitsies.meteorapp.com/dashboard'>https://splitsies.meteorapp.com/dashboard</a></strong>",
            };
        }
    }

    async function _unlinkFamilyPlanParticipant(actingUserId, familyPlanParticipantId) {
        await FamilyPlanParticipants.updateAsync(familyPlanParticipantId, {$set: {status: "new", lastActionByUserId: actingUserId,}, $unset: {familyPlanId: ""}});
    }

    async function _getUserEmailAddresses(userId) {
        let _u = await Meteor.users.findOneAsync(userId);
        let _emails = _u && _u.emails && _.pluck(_u.emails, "address") || [];
        return _emails;
    }

    async function _notifyFamilyPlanParticipant(familyPlanParticipantId, newStatus, oldStatus) {
        let _fpp = await FamilyPlanParticipants.findOneAsync(familyPlanParticipantId);
        let _youAreInitiating = _fpp && _fpp.userId === _fpp.lastActionByUserId;
        let _emailText = "";
        if (newStatus === "joined") {
            let _fp = _fpp && _fpp.familyPlanId && await FamilyPlans.findOneAsync(_fpp.familyPlanId);
            let _emails = _fp && _fp.userId && await _getUserEmailAddresses(_fp.userId);
            _emailText = "You've successfully joined a family plan. Owner's email(s): " + _emails.join(", ");
        } else if (newStatus === "pending") {
            if (_youAreInitiating) {
                _emailText = "Your request to join is now pending approval from the family plan owner.";
            } else {
                _emailText = "You have a pending offer from the family plan owner. Go to your dashboard to approve or decline.";
            }
        } else if (newStatus === "new") {
            if (_youAreInitiating) {
                if (oldStatus === "pending") {
                    _emailText = "You declined a request to join a family plan.";
                } else {
                    _emailText = "You posted an offer to join someone's family plan.";
                }
            } else {
                if (oldStatus === "joined") {
                    _emailText = "You have been removed from a family plan.";
                } else {
                    _emailText = "The family plan owner has declined your request to join.";
                }
            }
        }
        _fpp && await _sendEmail(_fpp.userId, _emailText);
    }

    async function _notifyFamilyPlanOwner(familyPlanId, newStatus) {
        let _fp = await FamilyPlans.findOneAsync(familyPlanId);
        let _emailText = newStatus;
        _fp && await _sendEmail(_fp.userId, _emailText);
    }

    Meteor.publish('openOffers', function openOffersPublication(offeringBool, productIds) {
        check(offeringBool, Boolean);
        check(productIds, Array);

        if (offeringBool) {
            return FamilyPlans.find({
                $where: function() { return this.members < this.capacity },
                productId: { $in: productIds },
            });
        } else {
            return FamilyPlanParticipants.find({
                productId: { $in: productIds },
                status: "new",
                familyPlanId: { $exists: false },
            });
        }
    });

    Meteor.publish("openPlanParticipantsPerProduct", function openPlanParticipants() {
        return FamilyPlanParticipants.find({status: "new", familyPlanId: { $exists: false }}, {fields: {productId: 1}});
    });

    Meteor.publish("openPlansPerProduct", function openPlansPerProduct() {
        return FamilyPlans.find({$where: function() { return this.members < this.capacity }}, {fields: {productId: 1, userId: 1}});
    });

    Meteor.publish("yourFamilyPlanMemberships", function yourFamilyPlanMemberships() {
        if (!this.userId) {
            return this.ready();
        }

        return FamilyPlanParticipants.find({userId: this.userId});
    });

    Meteor.publish("usersFamilyPlanMemberships", function usersFamilyPlanMemberships(userIds) {
        check(userIds, Array);
        if (!this.userId) {
            return this.ready();
        }

        return FamilyPlanParticipants.find({userId: {$in: userIds}});
    });

    Meteor.publish("yourFamilyPlans", function yourFamilyPlans() {
        if (!this.userId) {
            return this.ready();
        }

        return FamilyPlans.find({userId: this.userId});
    });

    Meteor.publish("familyPlansByIds", function familyPlansByIds(familyPlanIds) {
        check(familyPlanIds, Array);

        if (!this.userId) {
            return this.ready();
        }

        return FamilyPlans.find({_id: {$in: familyPlanIds}});
    });

    Meteor.publish("familyPlanParticipants", function familyPlanParticipants(familyPlanIds) {
        check(familyPlanIds, Array);

        if (!this.userId) {
            return this.ready();
        }

        return FamilyPlanParticipants.find({familyPlanId: { $in: familyPlanIds } });
    });

    Meteor.methods({
        async 'create.new.offer'(productId, offeringBool, price, capacity, notes) {
            check(productId, String);
            check(offeringBool, Boolean);
            check(price, Number);
            check(capacity, Number);
            check(notes, String);

            if (!this.userId) {
                throw new Meteor.Error("You need to be logged in.");
            }

            if (offeringBool) {
                // create a FamilyPlans and FamilyPlanParticipants objects for the user
                let _familyPlanId = await FamilyPlans.insertAsync({
                    productId: productId,
                    price: price,
                    userId: this.userId,
                    capacity: capacity,
                    notes: notes,
                    members: 1,
                });

                return FamilyPlanParticipants.insertAsync({
                    userId: this.userId,
                    familyPlanId: _familyPlanId,
                    status: "joined",
                    productId: productId,
                    lastActionByUserId: this.userId,
                    price: parseFloat((price / capacity).toFixed(2)),
                });
            } else {
                // create a new FamilyPlanParticipants without a planId field, with productId field, status "new"
                return FamilyPlanParticipants.insertAsync({
                    userId: this.userId,
                    status: "new",
                    productId: productId,
                    lastActionByUserId: this.userId,
                    price: price,
                });
            }
        },
        async "terminateFamilyPlanParticipant"(familyPlanParticipantId) {
            check(familyPlanParticipantId, String);

            let _participant = await FamilyPlanParticipants.findOneAsync(familyPlanParticipantId);
            let _plan = await FamilyPlans.findOneAsync(_participant.familyPlanId);

            if (!this.userId || !_plan) {
                throw new Meteor.Error("You need to be logged in and there should be a plan.");
            }

            let _oldStatus = _participant.status;
            await _unlinkFamilyPlanParticipant(this.userId, familyPlanParticipantId);
            await _notifyFamilyPlanParticipant(familyPlanParticipantId, "new", _oldStatus);

            await FamilyPlans.updateAsync(_participant.familyPlanId, { $inc: { members: -1 } });
            await _notifyFamilyPlanOwner(_participant.familyPlanId, "You have removed a participant from your family plan.");
        },
        async "deleteFamilyPlan"(familyPlanId) {
            check(familyPlanId, String);

            let _plan = await FamilyPlans.findOneAsync(familyPlanId);
            if (!this.userId || !_plan || this.userId !== _plan.userId) {
                throw new Meteor.Error("You need to be logged in and be the owner of this family plan.");
            }

            // unlink the people that were in this plan
            let _membersToNotify = await FamilyPlanParticipants.find({familyPlanId: familyPlanId, userId: {$ne: this.userId}}).fetchAsync();
            for (const fpp of _membersToNotify) {
                let _oldStatus = fpp.status;
                await _unlinkFamilyPlanParticipant(this.userId, fpp._id);
                await _notifyFamilyPlanParticipant(fpp._id, "new", _oldStatus);
            }

            // remove yourself from your plan
            await FamilyPlanParticipants.removeAsync({userId: this.userId, familyPlanId: familyPlanId});

            // delete the family plan
            await _notifyFamilyPlanOwner(familyPlanId, "You have deleted your family plan.");
            await FamilyPlans.removeAsync(familyPlanId);
        },
        async 'delete.offer'(offerId) {
            check(offerId, String);

            let _o = await FamilyPlanParticipants.findOneAsync(offerId);

            if (!this.userId || !_o || _o.userId !== this.userId) {
                throw new Meteor.Error("You need to be logged in and be the owner of this family plan.");
            }

            // if status was "pending" or "joined" (i.e., document has familyPlanId property), decrease members by 1
            if (_o.familyPlanId) {
                await FamilyPlans.updateAsync(_o.familyPlanId, { $inc: { members: -1 } });
            }

            await FamilyPlanParticipants.removeAsync(offerId);
        },
        async 'respond.tentatively'(id, offeringBool, familyPlanDetails) {
            check(id, String);
            check(offeringBool, Boolean);

            if (!this.userId) {
                throw new Meteor.Error("You need to be logged in.");
            }

            if (offeringBool) {
                // this means someone is joining your family plan
                // check if you already have an open family plan offer for others to join
                let _joinee = await FamilyPlanParticipants.findOneAsync(id);
                let _oldStatus = _joinee.status;

                let _yourFamilyPlan = await FamilyPlans.findOneAsync({
                    userId: this.userId,
                    productId: _joinee.productId,
                    $where: function() { return this.members < this.capacity },
                });

                let _familyPlanId;
                if (!_yourFamilyPlan) {
                    check(familyPlanDetails, Object);
                    check(familyPlanDetails.price, Number);
                    check(familyPlanDetails.capacity, Number);
                    check(familyPlanDetails.notes, String);

                    // create a FamilyPlan and a FamilyPlanParticipant for yourself
                    _familyPlanId = await FamilyPlans.insertAsync({
                        productId: _joinee.productId,
                        price: familyPlanDetails.price,
                        userId: this.userId,
                        capacity: familyPlanDetails.capacity,
                        notes: familyPlanDetails.notes,
                        members: 1,
                    });
                    await FamilyPlanParticipants.insertAsync({
                        userId: this.userId,
                        familyPlanId: _familyPlanId,
                        status: "joined",
                        productId: _joinee.productId,
                        lastActionByUserId: this.userId,
                        price: parseFloat((familyPlanDetails.price / familyPlanDetails.capacity).toFixed(2)),
                    });
                } else {
                    _familyPlanId = _yourFamilyPlan._id;
                }

                // increment members by 1
                await FamilyPlans.updateAsync(_familyPlanId, { $inc: { members: 1 } });

                // link joinee and mark their status as pending
                await FamilyPlanParticipants.updateAsync(_joinee._id, { $set: { familyPlanId: _familyPlanId, status: "pending", lastActionByUserId: this.userId, } });
                await _notifyFamilyPlanParticipant(_joinee._id, "pending", _oldStatus);
                await _notifyFamilyPlanOwner(_familyPlanId, "You sent a request for someone to join your family plan.");
            } else {
                // this means you are joining someone else's existing, open family plan
                let _familyPlan = await FamilyPlans.findOneAsync(id);

                // check if you have any open offers (status "new")
                let _yourOpenOffer = await FamilyPlanParticipants.findOneAsync({
                    userId: this.userId,
                    productId: _familyPlan.productId,
                    status: "new",
                });

                if (!_yourOpenOffer) {
                    let _fppId = await FamilyPlanParticipants.insertAsync({
                        userId: this.userId,
                        familyPlanId: _familyPlan._id,
                        status: "pending",
                        productId: _familyPlan.productId,
                        lastActionByUserId: this.userId,
                        price: parseFloat((_familyPlan.price / _familyPlan.capacity).toFixed(2)),
                    });
                    await _notifyFamilyPlanParticipant(_fppId, "pending", "nonExistent");
                } else {
                    await FamilyPlanParticipants.updateAsync(_yourOpenOffer._id, { $set: { familyPlanId: _familyPlan._id, status: "pending", lastActionByUserId: this.userId, } });
                    let _oldStatus = _yourOpenOffer.status;
                    await _notifyFamilyPlanParticipant(_yourOpenOffer._id, "pending", _oldStatus);
                }

                // increment members by 1
                await FamilyPlans.updateAsync(_familyPlan._id, { $inc: { members: 1 } });
                await _notifyFamilyPlanOwner(_familyPlan._id, "Someone has requested to join your family plan.");
            }
        },
        async "respond.to.pending.offer"(familyPlanParticipantId, acceptBool) {
            check(familyPlanParticipantId, String);
            check(acceptBool, Boolean);

            if (!this.userId) {
                throw new Meteor.Error("You need to be logged in.");
            }

            let _participant = await FamilyPlanParticipants.findOneAsync(familyPlanParticipantId);
            let _oldStatus = _participant.status;

            if (acceptBool) {
                // set status to "joined"
                await FamilyPlanParticipants.updateAsync(familyPlanParticipantId, {$set: {status: "joined", lastActionByUserId: this.userId,}});
            } else {
                // decrease FamilyPlan members by 1
                await FamilyPlans.updateAsync(_participant.familyPlanId, { $inc: { members: -1 } });

                // set status to "new", unset familyPlanId
                await _unlinkFamilyPlanParticipant(this.userId, familyPlanParticipantId);
            }

            let _planOwnerIsInitiating = _participant.userId === this.userId;
            await _notifyFamilyPlanParticipant(familyPlanParticipantId, acceptBool ? "joined" : "new", _oldStatus);
            await _notifyFamilyPlanOwner(_participant.familyPlanId, acceptBool ? ("Your family plan now has one more member. The new member's email(s) is(are): " + await _getUserEmailAddresses(_participant.userId)) : (_planOwnerIsInitiating ? "You have declined someone's request to join your family plan." : "A potential participant has declined your request for them to join your family plan."));
        },
    })
}
