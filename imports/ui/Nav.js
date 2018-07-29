import React from 'react';
import { Row, Col } from 'reactstrap';

import AccountsUIWrapper from './AccountsUIWrapper.js';

export default class Nav extends React.Component {

    render() {
        return (
            <div>
                <header>
                    <Row>
                        <Col sm="8"><img src='images/logo.png' style={{height: 75}}/></Col>
                        <Col sm="4"><AccountsUIWrapper /></Col>
                    </Row>
                </header>
                <br/>
            </div>
        );
    }
}