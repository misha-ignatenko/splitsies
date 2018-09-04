import React from 'react';
import { Router, Route, Switch } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';
import Nav from '../../ui/Nav.js';
import Home from '../../ui/Home.js';
import Products from '../../ui/Products.js';
import Offers from '../../ui/Offers.js';
import NewOffer from '../../ui/NewOffer.js';
import Dashboard from '../../ui/Dashboard.js';
import NewProduct from '../../ui/NewProduct.js';
import User from '../../ui/User.js';

const browserHistory = createBrowserHistory();

export const renderRoutes = () => (
    <div className="container">
        <Nav />

        <Router history={browserHistory}>
            <Switch>
                <Route exact path="/" component={Home}/>
                <Route exact path="/offering" component={(props) => <Products history={props.history} offering={true}/>}/>
                <Route exact path="/looking" component={(props) => <Products history={props.history} offering={false}/>}/>
                <Route exact path="/offering/offers/:productId" component={(props) => <Offers history={props.history} offering={true} productId={props.match.params.productId}/>}/>
                <Route exact path="/offering/new/:productId" component={(props) => <NewOffer history={props.history} offering={true} productId={props.match.params.productId}/>}/>
                <Route exact path="/looking/offers/:productId" component={(props) => <Offers history={props.history} offering={false} productId={props.match.params.productId}/>}/>
                <Route exact path="/looking/new/:productId" component={(props) => <NewOffer history={props.history} offering={false} productId={props.match.params.productId}/>}/>
                <Route exact path="/user/:userId" component={User}/>
                <Route exact path="/user" component={User}/>
                <Route exact path="/dashboard" component={Dashboard}/>
                <Route exact path="/product/new" component={NewProduct}/>
                {/*<Route exact path="/join" component={AuthPageJoin}/>*/}
                {/*<Route component={NotFoundPage}/>*/}
            </Switch>
        </Router>
    </div>
);