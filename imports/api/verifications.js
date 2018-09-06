import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';

import { Users } from "./users.js";

export const Verifications = new Mongo.Collection("verifications");

if (Meteor.isServer) {

    Meteor.publish("verificationsForUserIds", function verificationsForUserIds(userIds) {
        check(userIds, Array);

        if (!this.userId) {
            return this.ready();
        }

        let _query = {userId: {$in: userIds}};
        return Verifications.find(_query);
    });

    Meteor.methods({
        "addVerification"(type, details) {
            check(type, String);
            check(details, String);
            if (!this.userId) {
                throw new Meteor.Error("You need to be logged in.");
            }
            if (details.length === 0) {
                throw new Meteor.Error("Details are required.");
            }

            console.log(type, details);
            return Verifications.insert({userId: this.userId, type: type, details: details});
        },
        "removeVerification"(verificationId) {
            check(verificationId, String);
            if (!this.userId) {
                throw new Meteor.Error("You need to be logged in.");
            }

            Verifications.remove(verificationId);
        },
    });
}