import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Offers = new Mongo.Collection('offers');

if (Meteor.isServer) {
    Meteor.publish('openOffers', function tasksPublication(offeringBool) {
        check(offeringBool, Boolean);
        console.log("offeringBool: ", offeringBool);

        return Offers.find({
            offering: offeringBool,
            proposedMatchOfferId: {$exists: false},
            finalMatchOfferId: {$exists: false},
        });
    });
}