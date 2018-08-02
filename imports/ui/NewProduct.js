import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Form, Input, Button, Row, Col, Card, CardBody, CardText, CardTitle, Alert } from 'reactstrap';

import { Products } from '../api/products.js';
import { Categories } from '../api/categories.js';

class NewProduct extends Component {
    constructor(props) {
        super(props);

        this.state = {
            creatingNewBool: false,
            newCategoryName: "",
            newCategoryDescription: "",
            name: "",
            description: "",
            company: "",
            logoUrl: "",
            selectedCategoryId: undefined,
            alertVisible: false,
            alertMessage: "",
            alertType: "",
        };

        this.onDismiss = this.onDismiss.bind(this);
    }

    onDismiss() {
        this.setState({ alertVisible: false });
    }

    inputInfo(fieldName, event) {
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

    createNewProduct() {
        let _that = this;
        Meteor.call("create.new.product", this.state.selectedCategoryId, this.state.name, this.state.description, this.state.company, this.state.logoUrl, function (err, res) {
            if (!err && res) {
                _that.setState({
                    alertVisible: true,
                    alertType: "success",
                    alertMessage: "Product created successfully."
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

    submit() {
        let _that = this;
        if (this.state.creatingNewBool) {
            Meteor.call("create.new.category", this.state.newCategoryName, this.state.newCategoryDescription, function (err, res) {
                if (!err && res) {
                    _that.selectCategory(res);
                    _that.createNewProduct();
                }
            });
        } else {
            _that.createNewProduct();
        }


    }

    render() {
        let _renderSubmitButton = ((this.state.creatingNewBool && this.state.newCategoryName.length > 0) || (!this.state.creatingNewBool && this.state.selectedCategoryId)) &&
            this.state.name.length > 0;

        return (
            <div>
                <h3>Choose a category or create a new one.</h3>
                <Alert color={this.state.alertType} isOpen={this.state.alertVisible} toggle={this.onDismiss}>
                    {this.state.alertMessage}
                </Alert>
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
                                <CardTitle><Input placeholder="Category name*" type="text" onChange={this.inputInfo.bind(this, "newCategoryName")}/></CardTitle>
                                <CardText><Input placeholder="Category description" type="text" onChange={this.inputInfo.bind(this, "newCategoryDescription")}/></CardText>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <br/>
                {this.state.creatingNewBool || this.state.selectedCategoryId ? <Form>
                        <h3>Enter product info.</h3>
                        <Input placeholder="Name*" type="text" onChange={this.inputInfo.bind(this, "name")}/>
                        <Input placeholder="Description" type="text" onChange={this.inputInfo.bind(this, "description")}/>
                        <Input placeholder="Company" type="text" onChange={this.inputInfo.bind(this, "company")}/>
                        <Input placeholder="Logo URL" type="text" onChange={this.inputInfo.bind(this, "logoUrl")}/>
                        {_renderSubmitButton && <Button onClick={this.submit.bind(this)}>Submit</Button>}
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