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

        return Offers.find({userId: this.userId});
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
            Offers.update(_openOfferFromRecipientId, { $set: { proposedMatchOfferId: _offer._id, price: _offer.price } });
            Offers.update(_offer._id, { $set: { proposedMatchOfferId: _openOfferFromRecipientId } });

            return {
                status: _status,
            };
        },
    });
}