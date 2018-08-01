import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Form, FormGroup, InputGroup, InputGroupAddon, Input, Button, Label, Row, Col, Card, CardBody, CardText, CardTitle } from 'reactstrap';

import { Products } from '../api/products.js';
import { Categories } from '../api/categories.js';

class NewProduct extends Component {
    constructor(props) {
        super(props);

        this.state = {
            capacity: 1,
            creatingNewBool: false,
            selectedCategoryId: undefined,
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

    newCatInfo(fieldName, event) {
        let _st = {};
        _st[fieldName] = event.target.value;
        this.setState(_st);

    }

    selectCategory(catId) {
        this.setCreatingNew(false);
        this.setSelectedCategory(catId);
    }

    selectCreatingNew() {
        this.setCreatingNew(true);
        this.setSelectedCategory(undefined);
    }

    setSelectedCategory(catId) {
        this.setState({
            selectedCategoryId: catId,
        });
    }

    setCreatingNew(bool) {
        this.setState({
            creatingNewBool: bool,
        });
    }

    newProductInfo(fieldName) {

    }

    createNewProduct() {
        
    }

    render() {
        return (
            <div>
                <h3>Choose a category or create a new one.</h3>
                <Row>
                    {this.props.categories.map((c) => {

                        return (<Col sm="6" key={c._id}>
                            <Card color={this.state.selectedCategoryId === c._id ? "primary" : ""} onClick={this.selectCategory.bind(this, c._id)}>
                                <CardBody>
                                    <CardTitle>{c.name}</CardTitle>
                                    <CardText>{c.description}</CardText>
                                </CardBody>
                            </Card>
                            <br/>
                        </Col>);
                    })}
                    <Col sm="6" onClick={this.selectCreatingNew.bind(this)}>
                        <Card color={this.state.creatingNewBool ? "primary" : ""}>
                            <CardBody>
                                <CardTitle><Input placeholder="Category name" type="text" onChange={this.newCatInfo.bind(this, "name")}/></CardTitle>
                                <CardText><Input placeholder="Category description" type="text" onChange={this.newCatInfo.bind(this, "description")}/></CardText>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <br/>
                {this.state.creatingNewBool || this.state.selectedCategoryId ? <Form>
                        <h3>Enter product info.</h3>
                        <Input placeholder="Name" type="text" onChange={this.newProductInfo.bind(this, "name")}/>
                        <Input placeholder="Description" type="text" onChange={this.newProductInfo.bind(this, "description")}/>
                        <Input placeholder="Company" type="text" onChange={this.newProductInfo.bind(this, "company")}/>
                        <Input placeholder="Logo URL" type="text" onChange={this.newProductInfo.bind(this, "logoUrl")}/>
                        <Button onClick={this.createNewProduct.bind(this)}>Submit</Button>
                    </Form> : null}
                <br/>
            </div>
        );
    }
}

export default withTracker((props) => {
    let _productsSub = Meteor.subscribe("products");
    let _catSub = Meteor.subscribe("categories");

    return {
        currentUser: Meteor.user(),
        products: Products.find().fetch(),
        categories: Categories.find().fetch(),
    };
})(NewProduct);