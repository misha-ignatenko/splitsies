import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col } from 'reactstrap';

import { Offers as OffersCollection } from '../api/offers.js';
import { Products as ProductsCollection } from '../api/products.js';
import { Categories as CategoriesCollection } from '../api/categories.js';

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        console.log(this.props.offers);
        return (
            <div>
                <Row>

                </Row>
                <br/>
            </div>
        );
    }
}

export default withTracker((props) => {
    let _offersSub = Meteor.subscribe("userOffers");
    let _offers = _offersSub.ready() && OffersCollection.find({}).fetch();

    return {
        currentUser: Meteor.user(),
        offers: _offers,
    };
})(Dashboard);