import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Form, FormGroup, InputGroup, InputGroupAddon, Input, Button, Label } from 'reactstrap';

import { Products as ProductsCollection } from '../api/products.js';
import { FamilyPlans, FamilyPlanParticipants } from '../api/familyPlans.js';

class NewOffer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            capacity: 1,
        };
    }

    submitOffer() {
        Meteor.call("create.new.offer", this.props.product._id, this.props.offering, this.state.price, this.state.capacity, this.state.notes, function (err, res) {
            console.log(err, res);
        });
    }

    changeInput(type, event) {
        event.preventDefault();
        let _st = {};
        _st[type] = _.contains(["price", "capacity"], type) ? parseFloat(event.target.value) : event.target.value;
        this.setState(_st);
    }

    render() {
        return (
            <div>
                <h3>{this.props.offering ? "Share your family plan with others." : "Join someone's family plan."}</h3>
                <h3>{this.props.product.name}</h3>
                <Form>
                    <FormGroup>
                        <InputGroup>
                            <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                            <Input placeholder="Price" type="number" step="0.01" onChange={this.changeInput.bind(this, "price")}/>
                        </InputGroup>
                    </FormGroup>
                    {this.props.offering && <FormGroup>
                        <InputGroup>
                            <Input placeholder="Capacity" type="number" step="1" onChange={this.changeInput.bind(this, "capacity")}/>
                        </InputGroup>
                    </FormGroup>}
                    <FormGroup>
                        <Label for="exampleText">Other notes</Label>
                        <Input type="textarea" name="text" id="exampleText" onChange={this.changeInput.bind(this, "notes")}/>
                    </FormGroup>
                    <Button onClick={this.submitOffer.bind(this)}>Submit</Button>
                </Form>
                <br/>
            </div>
        );
    }
}

export default withTracker((props) => {
    let _productsSub = Meteor.subscribe("products", [props.productId]);
    let _product = _productsSub.ready() && ProductsCollection.findOne();
    let _offersSub = Meteor.subscribe("openOffers", props.offering, [props.productId]);

    return {
        currentUser: Meteor.user(),
        product: _product,
    };
})(NewOffer);