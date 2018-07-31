import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';

export const Offers = new Mongo.Collection('offers');

if (Meteor.isServer) {
    Meteor.publish('openOffers', function tasksPublication(offeringBool, optionalProductId) {
        check(offeringBool, Boolean);
        check(optionalProductId, Match.OneOf(Array, undefined));

        let _qry = {
            offer: offeringBool,
            proposedMatchOfferId: {$exists: false},
            finalMatchOfferId: {$exists: false},
        };

        if (!_.isUndefined(optionalProductId)) {
            _qry.productId = {$in: optionalProductId};
        }

        return Offers.find(_qry);
    });

    Meteor.publish("userOffers", function userOffers() {
        if (!this.userId) {
            return this.ready();
        }
        console.log("userOffers");

        return Offers.find({userId: this.userId});
    });

    Meteor.publish("offersExpand", function offersExpand(offerIds) {
        if (!this.userId) {
            return this.ready();
        }

        check(offerIds, Array);
        console.log("offersExpand");

        return Offers.find({
            $or: [
                { _id: { $in: offerIds } },
                { proposedMatchOfferId: { $in: offerIds } },
                { finalMatchOfferId: { $in: offerIds } },
            ],
        });
    });

    Meteor.publish("offersByIds", function offersByIds(offerIds) {
        if (!this.userId) {
            return this.ready();
        }

        check(offerIds, Array);
        
        return Offers.find({_id: { $in: offerIds } });
    });


    Meteor.methods({
        'create.new.offer'(productId, offeringBool, price, notes) {
            check(productId, String);
            check(offeringBool, Boolean);
            check(price, Number);
            check(notes, String);

            if (!this.userId) {
                throw new Meteor.Error('not-authorized');
            }

            Offers.insert({
                userId: this.userId,
                offer: offeringBool,
                productId: productId,
                price: price,
                notes: notes,
            });
        },
        'delete.offer'(offerId) {
            check(offerId, String);

            let _o = Offers.findOne(offerId);

            if (!this.userId || !_o || _o.userId !== this.userId) {
                throw new Meteor.Error('not-authorized');
            }

            if (!_o.proposedMatchOfferId && !_o.finalMatchOfferId) {
                Offers.remove(offerId);
            } else {
                throw new Meteor.Error("Cannot delete offer because it's either pending or final");
            }
        },
        'accept.offer.tentatively'(offerId) {
            check(offerId, String);

            // Make sure the user is logged in before inserting a task
            if (! this.userId) {
                throw new Meteor.Error('not-authorized');
            }

            let _status = "";
            let _offer = Offers.findOne(offerId);

            // check if user already has an open offer (offer: false) for that product
            let _recipientOfferQuery = {
                userId: this.userId,
                offer: !_offer.offer,
                productId: _offer.productId,
                proposedMatchOfferId: {$exists: false},
                finalMatchOfferId: {$exists: false},
            };
            let _openOfferFromRecipient = Offers.findOne(_recipientOfferQuery);
            let _openOfferFromRecipientId = _openOfferFromRecipient && _openOfferFromRecipient._id;

            // if no open offer from recipient exists, create one
            if (!_openOfferFromRecipientId) {
                _openOfferFromRecipientId = Offers.insert({
                    userId: _recipientOfferQuery.userId,
                    offer: _recipientOfferQuery.offer,
                    productId: _recipientOfferQuery.productId
                });
            }

            let _offerTrueId = _offer.offer ? _offer._id : _openOfferFromRecipientId;
            let _offerFalseId = !_offer.offer ? _offer._id : _openOfferFromRecipientId;

            // link the two offers
            Offers.update(_offerTrueId, { $set: { lastActionUserId: this.userId } });
            Offers.update(_offerFalseId, { $set: { proposedMatchOfferId: _offerTrueId, lastActionUserId: this.userId } });

            return {
                status: _status,
            };
        },
        'respond.to.tentative.offer'(offerId, acceptBool) {
            check(offerId, String);
            check(acceptBool, Boolean);

            if (!this.userId) {
                throw new Meteor.Error('not-authorized');
            }

            // find proposedMatchOfferId
            let _o1 = Offers.findOne(offerId);
            let _o2 = Offers.findOne(_o1.proposedMatchOfferId);

            let _offerTrueId = _o1.offer ? _o1._id : _o2._id;
            let _offerFalseId = !_o1.offer ? _o1._id : _o2._id;

            if (!acceptBool) {
                // if declining offer, clear proposedMatchOfferId of both records
                Offers.update(_offerTrueId, { $unset: { proposedMatchOfferId: "", lastActionUserId: "" } });
                Offers.update(_offerFalseId, { $unset: { proposedMatchOfferId: "", lastActionUserId: "" } });
            } else {
                Offers.update(_offerFalseId, { $set: { finalMatchOfferId: _offerTrueId, lastActionUserId: this.userId } });
            }
        },
    });
}