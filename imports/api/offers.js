import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';

export const Offers = new Mongo.Collection('offers');

if (Meteor.isServer) {
    Meteor.publish('openOffers', function tasksPublication(offeringBool, optionalProductId) {
        check(offeringBool, Boolean);
        check(optionalProductId, Match.OneOf(String, undefined));

        let _qry = {
            offering: offeringBool,
            proposedMatchOfferId: {$exists: false},
            finalMatchOfferId: {$exists: false},
            userId: {$ne: this.userId},
        };

        if (!_.isUndefined(optionalProductId)) {
            _qry.productId = optionalProductId;
        }

        return Offers.find(_qry);
    });


    Meteor.methods({
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
                offering: !_offer.offering,
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
                    offering: _recipientOfferQuery.offering,
                    productId: _recipientOfferQuery.productId
                });
                console.log("created a dummy offer: ", _openOfferFromRecipientId);
            }

            // link the two offers
            Offers.update(_openOfferFromRecipientId, { $set: { proposedMatchOfferId: _offer._id } });
            Offers.update(_offer._id, { $set: { proposedMatchOfferId: _openOfferFromRecipientId } });

            return {
                status: _status,
            };
        },
    });
}