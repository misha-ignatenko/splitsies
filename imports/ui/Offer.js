import React, { Component } from 'react';
import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button, Col } from 'reactstrap';

export default class Offer extends Component {

    render() {
        console.log(this.props);

        return (
            <Col sm="3">
                <Card>
                    <CardBody>
                        {/*<CardTitle>{this.props.productData.name}</CardTitle>*/}
                        {/*<CardText>{this.props.productData.description}</CardText>*/}
                        {/*<CardText>{this.props.openOffersCount} offers</CardText>*/}
                        <Button>Connect</Button>
                    </CardBody>
                </Card>
            </Col>
        );
    }
}