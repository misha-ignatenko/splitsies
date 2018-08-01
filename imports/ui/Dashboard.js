import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col, Card, Table, CardHeader, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter, Progress } from 'reactstrap';

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
                                    let _members = _.filter(this.props.membersOfMyPlans, function (m) {return m.status !== "joined" && m.familyPlanId === o._id && m.userId !== Meteor.userId();});

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
                                        {this.props.splittingPlans.map((o) => {
                                            let _youOwnPlan = o.userId === Meteor.userId();
                                            let _p = _.find(this.props.products, function (p) {return p._id === o.productId;});
                                            let _planOwner = _.find(this.props.users, function (u) {return u._id === o.userId;});
                                            let _members = _.filter(this.props.splittingParticipants, function (m) { return m.familyPlanId === o._id; });
                                            let _numJoined = _members.length;
                                            let _numPending = o.members - _members.length;

                                            return (<tr key={o._id}>
                                                <td>{_youOwnPlan ? "Your " : ((_planOwner && _planOwner.username) + "'s ")}{_p && _p.name}{' (' + _members.length + ' out of ' + o.capacity + ' members max)'}
                                                <br/>
                                                    <Progress multi>
                                                        <Progress bar color="success" value={100 * _numJoined / o.capacity}>Joined ({_numJoined})</Progress>
                                                        {_numPending > 0 && <Progress bar color="info" value={100 *_numPending / o.capacity}>Pending ({_numPending})</Progress>}
                                                    </Progress>
                                                </td>
                                                <td>{_youOwnPlan ? "+" : "-"}{"$"}{_youOwnPlan ? (o.price * (_members.length - 1) / (_members.length)).toFixed(2) : (o.price / _members.length).toFixed(2)}</td>
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
    let _lookingFor = _.filter(_myPlanMemberships, function (m) {
        return m.status === "new" || m.status === "pending";
    });

    // IDs of plans that you're the owner of
    let _myPlanIds = _.pluck(_myPlans, "_id");
    let _membersOfMyPlans = _myPlans.length > 0 && Meteor.subscribe("familyPlanParticipants", _myPlanIds).ready() &&
        FamilyPlanParticipants.find({familyPlanId: {$in: _myPlanIds}}).fetch() || [];

    // plans you are offering that aren't at their capacity yet (based on number of people that fully joined)
    let _offering = _.filter(_myPlans, function (p) {
        let _joined = _.filter(_membersOfMyPlans, function (m) { return m.familyPlanId === p._id && m.status === "joined"; });
        return p.capacity > _joined.length;
    });

    // plan IDs I am a member of
    // todo: is all this necessary?
    let _planIdsIAmSplittingWithOthers = _.pluck(_.filter(_myPlanMemberships, function (m) {return m.status === "joined";}), "familyPlanId");
    let _participantsOfPlansIHaveSplitWithOthers = _planIdsIAmSplittingWithOthers.length > 0 &&
        Meteor.subscribe("familyPlanParticipants", _planIdsIAmSplittingWithOthers).ready() &&
        FamilyPlanParticipants.find({familyPlanId: {$in: _planIdsIAmSplittingWithOthers}, status: "joined"}).fetch() || [];
    let _userIdsOfPeopleIAmSplittingPlansWith = _.pluck(_participantsOfPlansIHaveSplitWithOthers, "userId");
    let _plansIAmSplitting = _planIdsIAmSplittingWithOthers.length > 0 &&
        Meteor.subscribe("familyPlansByIds", _planIdsIAmSplittingWithOthers).ready() &&
        FamilyPlans.find({_id: {$in: _planIdsIAmSplittingWithOthers}}).fetch() || [];


    // let _offersSub = Meteor.subscribe("userOffers");



    let _productsSub = Meteor.subscribe("products");
    let _products = ProductsCollection.find({}).fetch();
    let _usersSub = Meteor.subscribe("users", _.union(_.pluck(_membersOfMyPlans, "userId"), _userIdsOfPeopleIAmSplittingPlansWith));

    return {
        membersOfMyPlans: _membersOfMyPlans,
        allOffers: [],
        currentUser: Meteor.user(),
        lookingFor: _lookingFor,
        offering: _offering,
        splittingPlans: _plansIAmSplitting,
        splittingParticipants: _participantsOfPlansIHaveSplitWithOthers,
        products: _products,
        users: Users.find({}).fetch(),
    };
})(Dashboard);