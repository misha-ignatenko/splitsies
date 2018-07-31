import React from 'react';
import { Router, Route, Switch } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';
import Nav from '../../ui/Nav.js';
import Home from '../../ui/Home.js';
import Products from '../../ui/Products.js';
import Offers from '../../ui/Offers.js';
import NewOffer from '../../ui/NewOffer.js';
import Dashboard from '../../ui/Dashboard.js';
import JoinTheirs from '../../ui/JoinTheirs.js';
import OfferYours from '../../ui/OfferYours.js';

const browserHistory = createBrowserHistory();

export const renderRoutes = () => (
    <div className="container">
        <Nav />

        <Router history={browserHistory}>
            <Switch>
                <Route exact path="/" component={Home}/>
                <Route exact path="/offerYours" component={(props) => <OfferYours history={props.history} />}/>
                <Route exact path="/joinTheirs" component={(props) => <JoinTheirs history={props.history} />}/>
                <Route exact path="/offering" component={(props) => <Products history={props.history} offering={true}/>}/>
                <Route exact path="/looking" component={(props) => <Products history={props.history} offering={false}/>}/>
                <Route exact path="/offering/offers/:productId" component={(props) => <Offers history={props.history} offering={true} productId={props.match.params.productId}/>}/>
                <Route exact path="/offering/new/:productId" component={(props) => <NewOffer history={props.history} offering={true} productId={props.match.params.productId}/>}/>
                <Route exact path="/looking/offers/:productId" component={(props) => <Offers history={props.history} offering={false} productId={props.match.params.productId}/>}/>
                <Route exact path="/looking/new/:productId" component={(props) => <NewOffer history={props.history} offering={false} productId={props.match.params.productId}/>}/>
                {/*<Route exact path="/lists/:id" component={ListPageContainer}/>*/}
                <Route exact path="/dashboard" component={Dashboard}/>
                {/*<Route exact path="/join" component={AuthPageJoin}/>*/}
                {/*<Route component={NotFoundPage}/>*/}
            </Switch>
        </Router>
    </div>
);