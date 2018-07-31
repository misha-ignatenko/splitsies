import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col } from 'reactstrap';

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
                    history={this.props.history}
                    key={product._id}
                    openOffersCount={_openOffersCount}
                    productData={product}
                    offering={this.props.offering}
                />
            );
        })
    }

    renderCategories() {
        return this.props.categories.map((category) => {
            return (
                <div key={category._id}>
                    <Row>
                        <Col sm="12"><h3>{category.name}</h3>{category.description}</Col>
                        {this.renderProducts(category._id)}
                    </Row>
                    <br/>
                </div>
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

export default withTracker((props) => {
    let _offersSubscr;
    let _productsSub = Meteor.subscribe("products");
    let _categoriesSub = Meteor.subscribe("categories");
    if (_.has(props, "offering")) {
        // _offersSubscr = Meteor.subscribe("openOffers", !props.offering);
    }
    // let _offersReady = _offersSubscr && _offersSubscr.ready();

    return {
        currentUser: Meteor.user(),
        // offersReady: _offersReady,
        products: ProductsCollection.find({}).fetch(),
        categories: CategoriesCollection.find({}).fetch(),
    };
})(Products);