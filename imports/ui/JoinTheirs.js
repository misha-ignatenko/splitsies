import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

class JoinTheirs extends Component {
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
})(JoinTheirs);