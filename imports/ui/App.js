import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { Row, Col } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Tasks } from '../api/tasks.js';

import Product from './Product.js';
import AccountsUIWrapper from './AccountsUIWrapper.js';

// App component - represents the whole app
class App extends Component {
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

    render() {
        return (
            <div className="container">
                <header>
                    <Row>
                        <Col sm="8"><img src='images/logo.png' style={{height: 75}}/></Col>
                        <Col sm="4"><AccountsUIWrapper /></Col>
                    </Row>
                </header>

                <Row>
                    {this.renderProducts()}
                </Row>
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('tasks');

    return {
        tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
        currentUser: Meteor.user(),
        products: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    };
})(App);