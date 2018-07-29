import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col } from 'reactstrap';

import { Offers as OffersCollection } from '../api/offers.js';
import { Products as ProductsCollection } from '../api/products.js';
import { Categories as CategoriesCollection } from '../api/categories.js';
import { Users } from '../api/users.js';

import Offer from './Offer.js';

class Offers extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    renderOffers() {
        return this.props.offers.map((offer) => {
            let _username = _.find(this.props.users, function (u) {
                return u._id === offer.userId;
            }).username;
            return (
                <Offer key={offer._id} username={_username} offer={offer} product={this.props.product}/>
            );
        })
    }

    render() {
        return (
            <div>
                <Row>
                    <Col sm="12"><h3>Viewing open offers for: {this.props.product.name}</h3></Col>
                    {this.props.product && this.props.users && this.renderOffers()}
                </Row>
                <br/>
            </div>
        );
    }
}

export default withTracker((props) => {
    let _offersSub = Meteor.subscribe("openOffers", !props.offering, props.productId);
    let _categoriesSub = Meteor.subscribe("categories");
    let _productsSub = Meteor.subscribe("products", [props.productId]);
    let _product = _productsSub.ready() && ProductsCollection.findOne();
    // let _category = _product && _categoriesSub.ready() && CategoriesCollection.findOne(_product.categoryId);
    let _offers = _offersSub.ready() && OffersCollection.find({}).fetch();
    let _usersSub = _offers && Meteor.subscribe("users", _.pluck(_offers, "userId"));

    return {
        currentUser: Meteor.user(),
        offers: _offers,
        product: _product,
        // category: _category,
        users: _usersSub && _usersSub.ready() && Users.find({}).fetch(),
    };
})(Offers);