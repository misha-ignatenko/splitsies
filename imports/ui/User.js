import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Input, Modal, ModalHeader, ModalBody, ModalFooter, ButtonGroup, Button, Alert, Label, Row, Col,
    Card, CardBody, CardTitle, CardText } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Users } from '../api/users.js';
import { Verifications } from '../api/verifications.js';
import { FamilyPlanParticipants } from '../api/familyPlans.js';

class User extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            verificationType: "",
            details: "",
            alertVisible: false,
            alertMessage: "",
            alertType: "",
        };

        this.toggle = this.toggle.bind(this);
        this.onDismiss = this.onDismiss.bind(this);
    }

    onDismiss() {
        this.setState({ alertVisible: false });
    }

    addVerification() {
        console.log("adding verification");
        let _that = this;
        Meteor.call("addVerification", this.state.verificationType, this.state.details, function (err, res) {
            if (!err) {
                _that.toggle();
                _that.setState({
                    alertVisible: true,
                    alertType: "success",
                    alertMessage: "Verification added successfully."
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

    toggle() {
        this.setState({modal: !this.state.modal});
    }

    changeInput(type, event) {
        event.preventDefault();
        let _st = {};
        _st[type] = event.target.value || "";
        this.setState(_st);
    }

    setVerificationType(type) {
        this.setState({verificationType: type});
    }

    render() {
        let _viewingYourProfile = this.props.profileUser && this.props.currentUser && this.props.profileUser._id === this.props.currentUser._id;
        let _plansJoined = _.filter(this.props.memberships, function (m) {return m.status === "joined";});
        let _plansPending = _.filter(this.props.memberships, function (m) {return m.status === "pending";});

        return (
            <div>
                {_viewingYourProfile && <Button onClick={this.toggle.bind(this)}>Add verification</Button>}

                <h3>{this.props.profileUser && this.props.profileUser.username}</h3>

                {this.props.verficiations.length === 0 && "No verifications on file"}

                <br/>
                <Row>
                    {this.props.verficiations.map((v) => {

                        return <Col sm="4" key={v._id}>
                            <Card>
                                <CardBody>
                                    <CardTitle>{v.type}</CardTitle>
                                    <CardText>{v.type === "Social Media" ?
                                        <a target="_blank" href={v.details}>{v.details.split(".com")[0].split("www.")[1]}</a> :
                                        <span><FontAwesomeIcon color="green" icon="check-circle" size="2x"/> verified</span>}
                                    </CardText>
                                </CardBody>
                            </Card>
                            <br/>
                        </Col>
                    })}
                </Row>

                <h1>Currently going Splitsies on {_plansJoined.length + _plansPending.length} shared plans{_plansPending.length > 0 && (" (" + _plansPending.length + " pending)")}.</h1>

                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Adding verification</ModalHeader>
                    <ModalBody>
                        <Label>Type (click one to select):</Label>
                        <br/>
                        <ButtonGroup>
                            <Button color="info" onClick={this.setVerificationType.bind(this, "Social Media")} active={this.state.verificationType === "Social Media"}>Social Media</Button>
                            <Button color="info" onClick={this.setVerificationType.bind(this, "Phone")} active={this.state.verificationType === "Phone"}>Phone</Button>
                            <Button color="info" onClick={this.setVerificationType.bind(this, "Government ID")} active={this.state.verificationType === "Government ID"}>Government ID</Button>
                        </ButtonGroup>
                        <br/><br/>
                        {this.state.verificationType === "Social Media" ?
                            "A link to your social media profile" :
                            this.state.verificationType === "Phone" ? "Enter your phone number" :
                                this.state.verificationType === "Government ID" ?
                                    "Enter your driver's license ID" :
                                    ""
                        }
                        <Input placeholder="Details (required)" type="text" onChange={this.changeInput.bind(this, "details")}/>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.addVerification.bind(this)}>Submit</Button>{' '}
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
    let _userId = props.match.params.userId || Meteor.userId();
    let _sub = Meteor.subscribe("users", [_userId]);
    let _userObj = Users.findOne({$or: [{_id: _userId}, {username: _userId}]});

    let _verificationsSub = _userObj && Meteor.subscribe("verificationsForUserIds", [_userObj._id]);
    let _verifications = Verifications.find().fetch();
    let _fppSub = _userObj && Meteor.subscribe("usersFamilyPlanMemberships", [_userObj._id]);

    return {
        currentUser: Meteor.user(),
        profileUser: _userObj,
        verficiations: _verifications,
        memberships: FamilyPlanParticipants.find().fetch(),
    };
})(User);