import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { Row, Col, Card, CardTitle, CardText, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import Product from './Product.js';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    renderProducts() {
        return this.props.products.map((product) => {

            return (
                <Product
                    key={product._id}
                />
            );
        })
    }

    homeAction(offeringBool) {
        this.props.history.push(offeringBool ? '/offering' : "/looking");
    }

    render() {
        return (
            <div>

                <Row>
                    <Col sm="6">
                        <Card body>
                            <CardTitle>Looking to split (share theirs)</CardTitle>
                            <CardText>You would like to pay someone for sharing their subscription with you.</CardText>
                            <Button onClick={this.homeAction.bind(this, false)}>Go</Button>
                        </Card>
                    </Col>
                    <Col sm="6">
                        <Card body>
                            <CardTitle>Offering to split (share yours)</CardTitle>
                            <CardText>You would like to get paid for sharing your subscription with someone.</CardText>
                            <Button onClick={this.homeAction.bind(this, true)}>Go</Button>
                        </Card>
                    </Col>
                </Row>
                <br/>
            </div>
        );
    }
}

export default withTracker(() => {

    return {
        currentUser: Meteor.user(),
    };
})(Home);