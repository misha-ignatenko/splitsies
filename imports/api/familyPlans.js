import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const FamilyPlans = new Mongo.Collection('familyPlans');
export const FamilyPlanParticipants = new Mongo.Collection('familyPlanParticipants');

if (Meteor.isServer) {
    Meteor.publish('openOffers', function openOffersPublication(offeringBool, productIds) {
        check(offeringBool, Boolean);
        check(productIds, Array);

        if (offeringBool) {
            console.log("here");
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

    Meteor.publish("yourFamilyPlanMemberships", function yourFamilyPlanMemberships() {
        if (!this.userId) {
            return this.ready();
        }

        return FamilyPlanParticipants.find({userId: this.userId});
    });

    Meteor.publish("yourFamilyPlans", function yourFamilyPlans() {
        if (!this.userId) {
            return this.ready();
        }

        return FamilyPlans.find({userId: this.userId});
    });

    Meteor.methods({
        'create.new.offer'(productId, offeringBool, price, capacity, notes) {
            check(productId, String);
            check(offeringBool, Boolean);
            check(price, Number);
            check(capacity, Number);
            check(notes, String);

            if (!this.userId) {
                throw new Meteor.Error('not-authorized');
            }

            console.log(productId, offeringBool, price, capacity, notes);
            if (offeringBool) {
                // create a FamilyPlans and FamilyPlanParticipants objects for the user
                let _familyPlanId = FamilyPlans.insert({
                    productId: productId,
                    price: price,
                    userId: this.userId,
                    capacity: capacity,
                    notes: notes,
                    members: 1,
                });

                FamilyPlanParticipants.insert({
                    userId: this.userId,
                    familyPlanId: _familyPlanId,
                    status: "joined",
                    productId: productId,
                    lastActionByUserId: this.userId,
                });
            } else {
                // create a new FamilyPlanParticipants without a planId field, with productId field, status "new"
                FamilyPlanParticipants.insert({
                    userId: this.userId,
                    status: "new",
                    productId: productId,
                    lastActionByUserId: this.userId,
                });
            }
        },
        'delete.offer'(offerId) {
            check(offerId, String);

            let _o = FamilyPlanParticipants.findOne(offerId);

            if (!this.userId || !_o || _o.userId !== this.userId) {
                throw new Meteor.Error('not-authorized');
            }

            // if status was "pending" or "joined" (i.e., document has familyPlanId property), decrease members by 1
            if (_o.familyPlanId) {
                FamilyPlans.update(_o.familyPlanId, { $inc: { members: -1 } });
            }

            FamilyPlanParticipants.remove(offerId);
        },
        'respond.tentatively'(id, offeringBool, familyPlanDetails) {
            check(id, String);
            check(offeringBool, Boolean);
            check(familyPlanDetails, Object);

            console.log(id, offeringBool);

            if (offeringBool) {
                // this means someone is joining your family plan
                // check if you already have an open family plan offer for others to join
                let _joinee = FamilyPlanParticipants.findOne(id);
                console.log("joinee: ", _joinee);

                let _yourFamilyPlan = FamilyPlans.findOne({
                    userId: this.userId,
                    productId: _joinee.productId,
                    $where: function() { return this.members < this.capacity },
                });

                console.log("your family plan: ", _yourFamilyPlan);
                let _familyPlanId;
                if (!_yourFamilyPlan) {
                    // create a FamilyPlan and a FamilyPlanParticipant for yourself
                    _familyPlanId = FamilyPlans.insert({
                        productId: _joinee.productId,
                        price: familyPlanDetails.price,
                        userId: this.userId,
                        capacity: familyPlanDetails.capacity,
                        notes: familyPlanDetails.notes,
                        members: 1,
                    });
                    FamilyPlanParticipants.insert({
                        userId: this.userId,
                        familyPlanId: _familyPlanId,
                        status: "joined",
                        productId: _joinee.productId,
                        lastActionByUserId: this.userId,
                    });
                } else {
                    _familyPlanId = _yourFamilyPlan._id;
                }

                // increment members by 1
                FamilyPlans.update(_familyPlanId, { $inc: { members: 1 } });

                // link joinee and mark their status as pending
                FamilyPlanParticipants.update(_joinee._id, { $set: { familyPlanId: _familyPlanId, status: "pending", lastActionByUserId: this.userId, } });
            } else {
                // this means you are joining someone else's existing, open family plan
                let _familyPlan = FamilyPlans.findOne(id);
                console.log("you are joining this family plan: ", _familyPlan);

                // check if you have any open offers (status "new")
                let _yourOpenOffer = FamilyPlanParticipants.findOne({
                    userId: this.userId,
                    productId: _familyPlan.productId,
                    status: "new",
                });

                console.log("you are already looking to join someone: ", _yourOpenOffer);

                if (!_yourOpenOffer) {
                    FamilyPlanParticipants.insert({
                        userId: this.userId,
                        familyPlanId: _familyPlan._id,
                        status: "pending",
                        productId: _familyPlan.productId,
                        lastActionByUserId: this.userId,
                    });
                } else {
                    FamilyPlanParticipants.update(_yourOpenOffer._id, { $set: { familyPlanId: _familyPlan._id, status: "pending", lastActionByUserId: this.userId, } });
                }

                // increment members by 1
                FamilyPlans.update(_familyPlan._id, { $inc: { members: 1 } });
            }
        },
    })
}