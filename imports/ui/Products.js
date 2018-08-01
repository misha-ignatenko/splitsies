import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col, Input, Button } from 'reactstrap';

import { Products as ProductsCollection } from '../api/products.js';
import { Categories as CategoriesCollection } from '../api/categories.js';
import { FamilyPlans, FamilyPlanParticipants } from '../api/familyPlans.js';

import Product from './Product.js';

class Products extends Component {
    constructor(props) {
        super(props);

        this.state = {
            productSearchStr: "",
        };
    }

    renderProducts(categoryId) {
        let _cat = _.find(this.props.categories, function (c) { return c._id === categoryId; });
        let _searchStr = this.state.productSearchStr;
        let _productsInCategory = _.filter(this.props.products, function (product) {
            let _matchesSearch = _.some([product.name, product.description, product.company, _cat.name, _cat.description], function (itemToCheck) {
                return itemToCheck.toLowerCase().indexOf(_searchStr) >= 0;
            });

            return product.categoryId === categoryId && _matchesSearch;
        });

        return _productsInCategory.map((product) => {
            let _openOffersCount = _.filter(this.props.openOffers, function (offer) {
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

    filterProducts(event) {
        this.setState({
            productSearchStr: event.target.value.toLowerCase(),
        });
    }

    addProductAction() {
        this.props.history.push("/product/new");
    }

    render() {
        return (
            <div>
                {this.props.offering ? (<h2>You are <span className="offering">offering your</span> family plan for others to join.</h2>)
                :
                (<h2>You are <span className="looking">looking to join</span> someone's family plan.</h2>)}
                <Row>
                    <Col sm="8">
                        <Input placeholder="Product search" type="text" onChange={this.filterProducts.bind(this)}/>
                    </Col>
                    <Col sm="2">

                    </Col>
                    <Col sm="2">
                        <Button onClick={this.addProductAction.bind(this)}>+</Button>
                    </Col>
                </Row>
                {this.renderCategories()}
            </div>
        );
    }
}

export default withTracker((props) => {
    let _offersSubscr;
    let _productsSub = Meteor.subscribe("products");
    let _categoriesSub = Meteor.subscribe("categories");
    let _openOffers = [];
    if (_.has(props, "offering")) {
        if (props.offering) {
            Meteor.subscribe("openPlanParticipantsPerProduct");
            _openOffers = FamilyPlanParticipants.find().fetch();
        } else {
            Meteor.subscribe("openPlansPerProduct");
            _openOffers = FamilyPlans.find({userId: {$ne: Meteor.userId()}}).fetch();
        }
        // _offersSubscr = Meteor.subscribe("openOffers", !props.offering);
    }
    // let _offersReady = _offersSubscr && _offersSubscr.ready();

    return {
        currentUser: Meteor.user(),
        // offersReady: _offersReady,
        products: ProductsCollection.find({}).fetch(),
        categories: CategoriesCollection.find({}).fetch(),
        openOffers: _openOffers,
    };
})(Products);