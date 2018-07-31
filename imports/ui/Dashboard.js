import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col, Card, Table, CardHeader, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { Offers as OffersCollection } from '../api/offers.js';
import { Products as ProductsCollection } from '../api/products.js';
import { Categories as CategoriesCollection } from '../api/categories.js';
import { Users } from '../api/users.js';

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            selectedOfferId: undefined,
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle(offerId) {
        this.setState({
            modal: !this.state.modal,
            selectedOfferId: offerId,
        });
    }

    deleteOffer(offerId) {
        Meteor.call("delete.offer", offerId);
    }

    openAndPendingOffersSummary(key) {
        let _offers = this.props[key];

        return (<Table bordered>
            <tbody>
                {_offers.map((o) => {
                    let _p = _.find(this.props.products, function (p) {
                        return p._id === o.productId;
                    });

                    return (<tr key={o._id}>
                        <td>{(o.offer ? "Your " : "Someone's ") + (_p && _p.name) + " for $" + o.price}</td>
                        <td>{o.proposedMatchOfferId ? (o.lastActionUserId === o.userId ? "Waiting for response" : <Button onClick={this.toggle.bind(this, o._id)}>Respond to offer</Button>) : <span>No offers <Button onClick={this.deleteOffer.bind(this, o._id)} color="danger">Delete request</Button></span>}</td>
                    </tr>);
                })}
            </tbody>
        </Table>);
    }

    dashboardAction(acceptBool) {
        let _that = this;
        Meteor.call("respond.to.tentative.offer", this.state.selectedOfferId, acceptBool, function (err, res) {
            if (!err) {
                _that.toggle();
            };
        });
    }

    render() {
        return (
            <div>
                <Row>
                    <Col sm="12">
                        <Card>
                            <CardHeader>Looking for...</CardHeader>
                            <CardBody>
                                {this.openAndPendingOffersSummary("lookingForOffers")}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col sm="12">
                        <Card>
                            <CardHeader>Offering...</CardHeader>
                            <CardBody>
                                <Table bordered>
                                    <tbody>
                                        {this.props.offeringOffers.map((o) => {
                                            let _p = _.find(this.props.products, function (p) {
                                                return p._id === o.productId;
                                            });

                                            let _linkedOpenOffers = _.filter(this.props.allOffers, function (ofr) {
                                                return ofr.proposedMatchOfferId === o._id && !ofr.finalMatchOfferId && ofr._id !== o._id;
                                            });

                                            let _linkedClosedOffers = _.filter(this.props.allOffers, function (ofr) {
                                                return ofr.finalMatchOfferId === o._id && ofr._id !== o._id;
                                            });
                                            console.log("_linkedClosedOffers: ", _linkedClosedOffers);

                                            return _linkedOpenOffers.length > 0 ? _linkedOpenOffers.map((off) => {

                                                return (<tr key={off._id}>
                                                    <td>Your {_p && _p.name}</td>
                                                    <td><Button onClick={this.toggle.bind(this, off._id)}>Respond to offer</Button></td>
                                                </tr>);
                                            }): <tr key={o._id}>
                                                    <td>Your {_p && _p.name}</td>
                                                    <td>No offers</td>
                                                </tr>;
                                        })}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col sm="12">
                        <Card>
                            <CardHeader>Splitting...</CardHeader>
                            <CardBody>
                                <Table bordered>
                                    <tbody>
                                        {this.props.splittingOffers.map((o) => {
                                            let _p = _.find(this.props.products, function (p) {return p._id === o.productId;});
                                            let _partner = _.find(this.props.allOffers, function (ofr) {return ofr._id === o.finalMatchOfferId;});
                                            let _partnerUserId = _partner && _partner.userId;
                                            let _partnerUser = _partnerUserId && _.find(this.props.users, function (u) {return u._id === _partnerUserId;});

                                            return (<tr key={o._id}>
                                                <td>{(o.offer ? "Your " : ((_partnerUser && _partnerUser.username) + "'s ")) + (_p && _p.name) + (o.offer ? " with " + (_partnerUser && _partnerUser.username) : "")}</td>
                                                <td>{(o.offer ? "+" : "-") + "$" + o.price}</td>
                                            </tr>);
                                        })}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <br/>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
                    <ModalBody>
                        Lorem ipsum dolor sit amet.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.dashboardAction.bind(this, true)}>Accept</Button>{' '}
                        <Button color="primary" onClick={this.dashboardAction.bind(this, false)}>Decline</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default withTracker((props) => {
    let _offersSub = Meteor.subscribe("userOffers");
    let _allOffers = OffersCollection.find({}).fetch();
    let _offers = _.filter(_allOffers, function (o) { return o.userId === Meteor.userId(); });


    let _userSpecificOffers = _offers;
    let _userSpecificOfferIds = _.pluck(_userSpecificOffers, "_id");
    let _proposedIds = _.pluck(_userSpecificOffers, "proposedMatchOfferId");
    let _finalIds = _.pluck(_userSpecificOffers, "finalMatchOfferId");
    let _allOfferIds = _.union(_userSpecificOfferIds, _proposedIds, _finalIds);
    let _allOffersSub = _allOfferIds.length > 0 && Meteor.subscribe("offersExpand", _allOfferIds);



    let _productsSub = _offers.length > 0 && Meteor.subscribe("products", _.pluck(_offers, "productId"));
    let _products = _productsSub && _productsSub.ready() && ProductsCollection.find({}).fetch() || [];
    let _lookingForOffers = _.filter(_offers, function (o) {
        return !o.offer && !o.finalMatchOfferId;
    });
    let _offeringOffers = _.filter(_offers, function (o) {return o.offer;});
    let _splittingOffers = _.filter(_offers, function (o) {
        return o.finalMatchOfferId;
    });
    let _usersSub = _allOffers.length > 0 && Meteor.subscribe("users", _.pluck(_allOffers, "userId"));

    return {
        allOffers: _allOffers,
        currentUser: Meteor.user(),
        lookingForOffers: _lookingForOffers,
        offeringOffers: _offeringOffers,
        splittingOffers: _splittingOffers,
        products: _products,
        users: Users.find({}).fetch(),
    };
})(Dashboard);