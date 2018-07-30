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

        let _userOffers = Offers.find({userId: this.userId}).fetch();
        let _userOfferIds = _.pluck(_userOffers, "_id");
        let _proposedIds = _.pluck(_userOffers, "proposedMatchOfferId");
        let _finalIds = _.pluck(_userOffers, "finalMatchOfferId");
        let _allOfferIds = _.union(_userOfferIds, _proposedIds, _finalIds);

        return Offers.find({userId: this.userId});
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
        'accept.offer.tentative'(offerId) {
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

            // link the two offers
            Offers.update(_openOfferFromRecipientId, { $set: { proposedMatchOfferId: _offer._id, price: _offer.price, lastActionUserId: this.userId } });
            Offers.update(_offer._id, { $set: { proposedMatchOfferId: _openOfferFromRecipientId, lastActionUserId: this.userId } });

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

            if (!acceptBool) {
                // if declining offer, clear proposedMatchOfferId of both records
                Offers.update(_o1._id, { $unset: { proposedMatchOfferId: "", lastActionUserId: "" } });
                Offers.update(_o2._id, { $unset: { proposedMatchOfferId: "", lastActionUserId: "" } });
            } else {
                Offers.update(_o1._id, { $set: { finalMatchOfferId: _o2._id, lastActionUserId: this.userId } });
                Offers.update(_o2._id, { $set: { finalMatchOfferId: _o1._id, price: _o1.price, lastActionUserId: this.userId } });
            }
        },
    });
}