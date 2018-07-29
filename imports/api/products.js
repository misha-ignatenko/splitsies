import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Products = new Mongo.Collection('products');

if (Meteor.isServer) {
    Meteor.publish('products', function productsPublication() {
        return Products.find({});
    });
}