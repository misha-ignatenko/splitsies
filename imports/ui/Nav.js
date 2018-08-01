import React from 'react';
import { Row, Col } from 'reactstrap';

import AccountsUIWrapper from './AccountsUIWrapper.js';

export default class Nav extends React.Component {

    render() {
        return (
            <div>
                <header>
                    <Row>
                        <Col sm="8"><a href="/"><img src='/images/splitsies_white_text.svg' style={{height: 75}}/></a></Col>
                        <Col sm="4"><a href="/dashboard">Dashboard</a><AccountsUIWrapper /></Col>
                    </Row>
                </header>
                <br/>
            </div>
        );
    }
}