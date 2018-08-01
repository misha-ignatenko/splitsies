import React, { Component } from 'react';
import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button, Col } from 'reactstrap';

// Task component - represents a single todo item
export default class Product extends Component {

    productAction() {
        this.props.history.push((this.props.offering ? '/offering' : "/looking") + "/offers/" + this.props.productData._id);
    }

    newOffer() {
        this.props.history.push((this.props.offering ? '/offering' : "/looking") + "/new/" + this.props.productData._id);
    }

    render() {

        return (
            <Col sm="4">
                <Card>
                    <CardImg style={{ height: 125, objectFit: "contain" }} src={this.props.productData.logoUrl || "https://placeholdit.imgix.net/~text?txtsize=33&txt=318%C3%97180&w=318&h=180"} alt="Card image cap" />
                    <CardBody>
                        <CardTitle>{this.props.productData.name}</CardTitle>
                        <CardText>{this.props.productData.description}</CardText>
                        <Button onClick={this.productAction.bind(this)}>{this.props.offering ? (this.props.openOffersCount + " people are looking to join your family plan") : ("Explore " + this.props.openOffersCount + " open family plans")}</Button>
                        {' '}
                        <Button onClick={this.newOffer.bind(this)}>Name your price</Button>
                    </CardBody>
                </Card>
            </Col>
        );
    }
}