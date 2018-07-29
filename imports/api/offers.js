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
        };

        if (!_.isUndefined(optionalProductId)) {
            _qry.productId = optionalProductId;
        }

        return Offers.find(_qry);
    });
}