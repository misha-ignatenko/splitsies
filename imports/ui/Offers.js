import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col, Card, CardBody, CardTitle, CardText, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { Offers as OffersCollection } from '../api/offers.js';
import { Products as ProductsCollection } from '../api/products.js';
import { Categories as CategoriesCollection } from '../api/categories.js';
import { Users } from '../api/users.js';

class Offers extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            selectedOfferId: undefined,
        };

        this.toggle = this.toggle.bind(this);
    }

    offerAction() {
        let _that = this;
        Meteor.call('accept.offer.tentative', this.state.selectedOfferId, function (err, res) {
            console.log(err, res);
            if (!err && res) {
                _that.toggle();
            }
        });
    }

    toggle(offerId) {
        this.setState({
            modal: !this.state.modal,
            selectedOfferId: offerId,
        });
    }

    renderOffers() {
        return this.props.offers.map((offer) => {
            let _username = _.find(this.props.users, function (u) {
                return u._id === offer.userId;
            }).username;
            return (
                <Col key={offer._id} sm="3">
                    <Card>
                        <CardBody>
                            <CardTitle>{_username}</CardTitle>
                            <CardText>${offer.price}</CardText>
                            <Button disabled={offer.userId === this.props.currentUser._id} onClick={this.toggle.bind(this, offer._id)}>Connect</Button>
                        </CardBody>
                    </Card>
                </Col>
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
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
                    <ModalBody>
                        Lorem ipsum dolor sit amet.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.offerAction.bind(this)}>Send</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default withTracker((props) => {
    let _offersSub = Meteor.subscribe("openOffers", !props.offering, [props.productId]);
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