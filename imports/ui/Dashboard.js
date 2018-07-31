import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col, Card, Table, CardHeader, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { Offers as OffersCollection } from '../api/offers.js';
import { Products as ProductsCollection } from '../api/products.js';
import { Categories as CategoriesCollection } from '../api/categories.js';
import { FamilyPlans, FamilyPlanParticipants } from '../api/familyPlans.js';
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

    dashboardAction(acceptBool) {
        let _that = this;
        Meteor.call("respond.to.pending.offer", this.state.selectedOfferId, acceptBool, function (err, res) {
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
                                <Table bordered>
                                    <tbody>
                                        {this.props.lookingFor.map((o) => {
                                            let _p = _.find(this.props.products, function (p) {
                                                return p._id === o.productId;
                                            });

                                            return (<tr key={o._id}>
                                                <td>{"Someone's " + (_p && _p.name)}</td>
                                                <td>{o.status === "pending" ? (o.lastActionByUserId === o.userId ? "Waiting for response" : <Button onClick={this.toggle.bind(this, o._id)}>Respond to offer</Button>) : <span>No offers <Button onClick={this.deleteOffer.bind(this, o._id)} color="danger">Delete request</Button></span>}</td>
                                            </tr>);
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
                            <CardHeader>Offering...</CardHeader>
                            <CardBody>
                                {this.props.offering.map((o) => {
                                    let _p = _.find(this.props.products, function (p) {
                                        return p._id === o.productId;
                                    });
                                    let _members = _.filter(this.props.membersOfMyPlans, function (m) {return m.familyPlanId === o._id && m.userId !== Meteor.userId();});

                                    return (<div key={o._id}>
                                        {"Your " + (_p && _p.name) + " (" + _members.length + " requests)"}
                                        <Table bordered>
                                            <tbody>
                                                {_members.map((m) => {
                                                    let _u = _.find(this.props.users, function (u) { return u._id === m.userId; });

                                                    return (<tr key={m._id}>
                                                        <td>{_u && _u.username}</td>
                                                        <td>{m.lastActionByUserId !== m.userId ? "Waiting for response" : <Button onClick={this.toggle.bind(this, m._id)}>Respond to offer</Button>}
                                                        </td>
                                                    </tr>);
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>);
                                })}
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
    let _plansSub = Meteor.subscribe("yourFamilyPlans");
    let _membershipsSub = Meteor.subscribe("yourFamilyPlanMemberships");
    let _myPlans = FamilyPlans.find({userId: Meteor.userId()}).fetch();
    let _myPlanMemberships = FamilyPlanParticipants.find({userId: Meteor.userId()}).fetch();
    console.log("_myPlans", _myPlans);
    console.log("_myPlanMemberships", _myPlanMemberships);
    let _lookingFor = _.filter(_myPlanMemberships, function (m) {
        return m.status === "new" || m.status === "pending";
    });
    let _myPlanIds = _.pluck(_myPlans, "_id");
    let _membersOfMyPlans = _myPlans.length > 0 && Meteor.subscribe("familyPlanParticipants", _myPlanIds).ready() &&
        FamilyPlanParticipants.find({familyPlanId: {$in: _myPlanIds}}).fetch() || [];
    console.log("members of my plans: ", _membersOfMyPlans);


    // let _offersSub = Meteor.subscribe("userOffers");
    let _allOffers = OffersCollection.find({}).fetch();
    let _offers = _.filter(_allOffers, function (o) { return o.userId === Meteor.userId(); });


    let _userSpecificOffers = _offers;
    let _userSpecificOfferIds = _.pluck(_userSpecificOffers, "_id");
    let _proposedIds = _.pluck(_userSpecificOffers, "proposedMatchOfferId");
    let _finalIds = _.pluck(_userSpecificOffers, "finalMatchOfferId");
    let _allOfferIds = _.union(_userSpecificOfferIds, _proposedIds, _finalIds);
    // let _allOffersSub = _allOfferIds.length > 0 && Meteor.subscribe("offersByIds", _allOfferIds);



    let _productsSub = Meteor.subscribe("products");
    let _products = ProductsCollection.find({}).fetch();
    let _lookingForOffers = _.filter(_offers, function (o) {
        return !o.offer && !o.finalMatchOfferId;
    });
    let _offeringOffers = _.filter(_offers, function (o) {
        return o.offer && !o.finalMatchOfferId;
    });
    let _splittingOffers = _.filter(_offers, function (o) {
        return o.finalMatchOfferId;
    });
    let _usersSub = _membersOfMyPlans.length > 0 && Meteor.subscribe("users", _.pluck(_membersOfMyPlans, "userId"));

    return {
        membersOfMyPlans: _membersOfMyPlans,
        allOffers: _allOffers,
        currentUser: Meteor.user(),
        lookingFor: _lookingFor,
        offering: _myPlans,
        splittingOffers: _splittingOffers,
        products: _products,
        users: Users.find({}).fetch(),
    };
})(Dashboard);