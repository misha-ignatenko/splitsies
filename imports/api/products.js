import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';

export const Products = new Mongo.Collection('products');

if (Meteor.isServer) {
    Meteor.publish('products', function productsPublication(optionalProductIds) {
        check(optionalProductIds, Match.OneOf(Array, undefined));

        let _query = {};
        if (!_.isUndefined(optionalProductIds)) {
            _query._id = {$in: optionalProductIds};
        }

        return Products.find(_query);
    });
}