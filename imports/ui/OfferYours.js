import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

class OfferYours extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div>

            </div>
        );
    }
}

export default withTracker((props) => {

    return {
        currentUser: Meteor.user(),
    };
})(OfferYours);