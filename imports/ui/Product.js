import React, { Component } from 'react';
import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button, Col } from 'reactstrap';

// Task component - represents a single todo item
export default class Product extends Component {

    render() {

        return (
            <Col sm="4">
                <Card>
                    <CardImg top width="100%" src="https://placeholdit.imgix.net/~text?txtsize=33&txt=318%C3%97180&w=318&h=180" alt="Card image cap" />
                    <CardBody>
                        <CardTitle>Card title</CardTitle>
                        <CardSubtitle>Card subtitle</CardSubtitle>
                        <CardText>{this.props.openOffersCount} offers</CardText>
                        <Button>Button</Button>
                    </CardBody>
                </Card>
            </Col>
        );
    }
}