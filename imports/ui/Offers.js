import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col, Card, CardBody, CardTitle, CardText, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form,
    FormGroup, InputGroup, InputGroupAddon, Input, Label, Alert } from 'reactstrap';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

library.add(faCheckCircle, faTimesCircle);

import { FamilyPlans, FamilyPlanParticipants } from '../api/familyPlans.js';
import { Products as ProductsCollection } from '../api/products.js';
import { Users } from '../api/users.js';

class Offers extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            selectedOfferId: undefined,
            alertVisible: false,
            alertMessage: "",
            alertType: "",
        };

        this.toggle = this.toggle.bind(this);
        this.onDismiss = this.onDismiss.bind(this);
    }

    offerAction() {
        let _that = this;
        let _familyPlanDetails = {};
        if (this.props.renderInputForm) {
            _familyPlanDetails = {
                price: this.state.price,
                capacity: this.state.capacity,
                notes: this.state.notes,
            };
        }


        Meteor.call("respond.tentatively", this.state.selectedOfferId, this.props.offering, _familyPlanDetails, function (err, res) {
            if (!err) {
                _that.toggle();
                _that.setState({
                    alertVisible: true,
                    alertType: "success",
                    alertMessage: "Your response is now pending approval from " + (_that.props.offering ? "requestor" : "owner") + "."
                });
            } else {
                _that.setState({
                    alertVisible: true,
                    alertType: "danger",
                    alertMessage: "There's been an error: " + err.message + "."
                });
            }
        });
    }

    changeInput(type, event) {
        event.preventDefault();
        let _st = {};
        _st[type] = _.contains(["price", "capacity"], type) ? parseFloat(event.target.value) : event.target.value;
        this.setState(_st);
    }

    toggle(offerId) {
        this.setState({
            modal: !this.state.modal,
            selectedOfferId: offerId,
        });
    }

    onDismiss() {
        this.setState({ alertVisible: false });
    }

    renderOffers() {
        return this.props.offers.map((offer) => {
            let _u = _.find(this.props.users, function (u) {
                return u._id === offer.userId;
            });
            let _username = _u.username;
            return (
                <Col key={offer._id} sm="3">
                    <Card>
                        <CardBody>
                            <CardTitle>{_u.verified ? <FontAwesomeIcon color="green" icon="check-circle" size="1x"/> : <FontAwesomeIcon color="grey" icon="times-circle" size="1x"/>}{' '}{_username}</CardTitle>
                            <CardText>${offer.price}</CardText>
                            <Button disabled={this.props.currentUser && offer.userId === this.props.currentUser._id} onClick={this.toggle.bind(this, offer._id)}>Connect</Button>
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
                    <Col sm="12"><h3>{this.props.offering ? "These people are looking to join a family plan." : "You can join these family plans."}</h3></Col>
                    <Col sm="12"><h3>{this.props.product.name}</h3></Col>
                    {this.props.product && this.props.users && this.renderOffers()}
                </Row>
                <br/>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>{this.props.product.name}</ModalHeader>
                    <ModalBody>
                        {this.props.renderInputForm ? <Form>
                            Please provide your offer details.
                            <FormGroup>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                                    <Input placeholder="Price" type="number" step="0.01" onChange={this.changeInput.bind(this, "price")}/>
                                </InputGroup>
                            </FormGroup>
                            <FormGroup>
                                <InputGroup>
                                    <Input placeholder="Capacity" type="number" step="1" onChange={this.changeInput.bind(this, "capacity")}/>
                                </InputGroup>
                            </FormGroup>
                            <FormGroup>
                                <Label for="exampleText">Other notes</Label>
                                <Input type="textarea" name="text" id="exampleText" onChange={this.changeInput.bind(this, "notes")}/>
                            </FormGroup>
                        </Form> : "Send your request."}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.offerAction.bind(this)}>Send</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                <Alert color={this.state.alertType} isOpen={this.state.alertVisible} toggle={this.onDismiss}>
                    {this.state.alertMessage}
                </Alert>
            </div>
        );
    }
}

export default withTracker((props) => {
    let _plansYoureIn = [];
    if (!props.offering) {
        let _yourMembershipsSub = Meteor.subscribe("yourFamilyPlanMemberships");
        _plansYoureIn = _.pluck(FamilyPlanParticipants.find({userId: Meteor.userId(), status: {$ne: "new"}}).fetch(), "familyPlanId");
    }
    let _offersSub = Meteor.subscribe("openOffers", !props.offering, [props.productId]);
    let _counterOffersSub = Meteor.subscribe("openOffers", props.offering, [props.productId]);
    let _productsSub = Meteor.subscribe("products", [props.productId]);
    let _product = _productsSub.ready() && ProductsCollection.findOne();
    let _qry = {status: "new", productId: props.productId};
    let _offers = props.offering ? FamilyPlanParticipants.find(_qry).fetch() : FamilyPlans.find({_id: {$nin: _plansYoureIn}}).fetch();
    let _counterOffers = !props.offering ? FamilyPlanParticipants.find(_qry).fetch() : FamilyPlans.find({}).fetch();
    let _usersSub = _offers && Meteor.subscribe("users", _.pluck(_offers, "userId"));

    return {
        plansYoureIn: _plansYoureIn,
        currentUser: Meteor.user(),
        offers: _offers,
        renderInputForm: props.offering && _.filter(_counterOffers, function (co) { return co.userId === Meteor.userId(); }).length === 0,
        product: _product,
        users: _usersSub && _usersSub.ready() && Users.find({}).fetch(),
    };
})(Offers);