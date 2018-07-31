import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Form, FormGroup, InputGroup, InputGroupAddon, Input, Button, Label } from 'reactstrap';

import { Products as ProductsCollection } from '../api/products.js';
import { Offers as OffersCollection } from '../api/offers.js';

class NewOffer extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    submitOffer() {
        console.log(this.state);
        console.log(this.props);
        Meteor.call("create.new.offer", this.props.product._id, this.props.offering, parseFloat(this.state.price), this.state.notes, function (err, res) {
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
                <h3>{this.props.product.name}</h3>
                <Form>
                    <FormGroup>
                        <InputGroup>
                            <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                            <Input placeholder="Total cost of plan" type="number" step="0.01" onChange={this.changeInput.bind(this, "price")}/>
                            <Input placeholder="Max capacity (# of people) in plan" type="number" step="1" onChange={this.changeInput.bind(this, "capacity")}/>
                        </InputGroup>
                    </FormGroup>
                    ${this.state.price && this.state.capacity && (this.state.price / this.state.capacity).toFixed(2)} per person
                    <FormGroup>
                        <Label for="exampleText">Other notes</Label>
                        <Input type="textarea" name="text" id="exampleText" onChange={this.changeInput.bind(this, "notes")}/>
                    </FormGroup>
                    {this.props.offers && this.props.offers.length === 0 ?
                        <Button onClick={this.submitOffer.bind(this)}>Submit</Button> :
                        <h3>You already have an open offer for this product.</h3>
                    }
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
    let _offers = _offersSub.ready() && OffersCollection.find({userId: Meteor.userId()}).fetch();

    return {
        currentUser: Meteor.user(),
        product: _product,
        offers: _offers,
    };
})(NewOffer);