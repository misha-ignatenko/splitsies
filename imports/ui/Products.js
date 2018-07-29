import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col } from 'reactstrap';

import { Offers } from '../api/offers.js';
import { Products as ProductsCollection } from '../api/products.js';
import { Categories as CategoriesCollection } from '../api/categories.js';

import Product from './Product.js';

class Products extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    renderProducts(categoryId) {
        let _productsInCategory = _.filter(this.props.products, function (product) {
            return product.categoryId === categoryId;
        });
        return _productsInCategory.map((product) => {
            let _openOffersCount = _.filter(this.props.offers, function (offer) {
                return offer.productId === product._id;
            }).length;

            return (
                <Product
                    key={product._id}
                    openOffersCount={_openOffersCount}
                    productData={product}
                />
            );
        })
    }

    renderCategories() {
        return this.props.categories.map((category) => {
            return (
                <Row key={category._id}>
                    <Col sm="12"><h3>{category.name}</h3>{category.description}</Col>
                    {this.renderProducts(category._id)}
                </Row>
            );
        })
    }

    render() {
        return (
            <div>
                {this.renderCategories()}
            </div>
        );
    }
}

export default withTracker(() => {
    let _offersSubscr;
    let _productsSub = Meteor.subscribe("products");
    let _categoriesSub = Meteor.subscribe("categories");
    let _path = window.location.pathname;
    if (_path === "/offering") {
        _offersSubscr = Meteor.subscribe("openOffers", false);
    } else if (_path === "/looking") {
        _offersSubscr = Meteor.subscribe("openOffers", true);
    }
    let _offersReady = _offersSubscr && _offersSubscr.ready();

    return {
        currentUser: Meteor.user(),
        offersReady: _offersReady,
        offers: Offers.find({}).fetch(),
        products: ProductsCollection.find({}).fetch(),
        categories: CategoriesCollection.find({}).fetch(),
    };
})(Products);