import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Categories = new Mongo.Collection('categories');

if (Meteor.isServer) {
    Meteor.publish('categories', function productsPublication() {
        return Categories.find({});
    });

    Meteor.methods({
        "create.new.category"(catName, catDescr) {
            check(catName, String);
            check(catDescr, String);

            if (!this.userId) {
                throw new Meteor.Error("You need to be logged in");
            }

            if (Categories.findOne({name: catName})) {
                throw new Meteor.Error("This category already exists: " + catName);
            }

            return Categories.insert({name: catName, description: catDescr});
        },
    });
}