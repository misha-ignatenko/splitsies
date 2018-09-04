import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { Users } from '../api/users.js';

class User extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    render() {
        return (
            <div>
                hi
            </div>
        );
    }
}

export default withTracker((props) => {
    let _userId = props.match.params.userId || Meteor.userId();
    let _sub = Meteor.subscribe("users", [_userId]);

    return {
        currentUser: Meteor.user(),
        profileUser: Users.findOne(_userId),
    };
})(User);