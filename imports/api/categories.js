import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Categories = new Mongo.Collection('categories');

if (Meteor.isServer) {
    Meteor.publish('categories', function productsPublication() {
        return Categories.find({});
    });
}