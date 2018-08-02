import React from 'react';
import { Row, Col } from 'reactstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

library.add(faUser);

import AccountsUIWrapper from './AccountsUIWrapper.js';

export default class Nav extends React.Component {

    render() {
        return (
            <div>
                <header>
                    <Row>
                        <Col sm="8"><a href="/"><img src='/images/splitsies_white_text.svg' style={{height: 75}}/></a></Col>
                        <Col sm="4" style={{marginTop: 15}}><a style={{padding: 8}} href="/dashboard"><FontAwesomeIcon color="white" icon="user" size="2x"/></a><AccountsUIWrapper /></Col>
                    </Row>
                </header>
                <br/>
            </div>
        );
    }
}