import React from 'react';
import { Router, Route, Switch } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';
import Nav from '../../ui/Nav.js';
import Home from '../../ui/Home.js';
import Products from '../../ui/Products.js';

const browserHistory = createBrowserHistory();

export const renderRoutes = () => (
    <div className="container">
        <Nav />

        <Router history={browserHistory}>
            <Switch>
                <Route exact path="/" component={Home}/>
                <Route exact path="/offering" component={Products}/>
                <Route exact path="/looking" component={Products}/>
                {/*<Route exact path="/lists/:id" component={ListPageContainer}/>*/}
                {/*<Route exact path="/signin" component={AuthPageSignIn}/>*/}
                {/*<Route exact path="/join" component={AuthPageJoin}/>*/}
                {/*<Route component={NotFoundPage}/>*/}
            </Switch>
        </Router>
    </div>
);