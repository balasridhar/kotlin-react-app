import React, { Component } from 'react';
import './App.css';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CoffeeShopsList from './CoffeeShopsList';
import CoffeeShopEdit from './CoffeeShopEdit';
import Api from './Api';
import NavBar from './NavBar';
import { Security, SecureRoute, ImplicitCallback } from '@okta/okta-react';
import { withAuth } from '@okta/okta-react';



const AuthWrapper = withAuth(class WrappedRoutes extends Component {
  constructor(props) {
    super(props);
    this.state = { authenticated: null, user: null, api: new Api() };
    this.checkAuthentication = this.checkAuthentication.bind(this);
  }
  async checkAuthentication() {
    const authenticated = await this.props.auth.isAuthenticated();
    if (authenticated !== this.state.authenticated) {
      if (authenticated) {
        const user = await this.props.auth.getUser();
        let accessToken = await this.props.auth.getAccessToken();
        this.setState({ authenticated, user, api: new Api(accessToken) });
      }
      else {
        this.setState({ authenticated, user:null, api: new Api() });
      }
    }
  }
  async componentDidMount() {
    this.checkAuthentication();
  }
  async componentDidUpdate() {
    this.checkAuthentication();
  }
  async login() {
    if (this.state.authenticated === null) return; // do nothing if auth isn't loaded yet
    this.props.auth.login('/');
  }
  async logout() {
    this.props.auth.logout('/');
  }
  render() {
    let {authenticated, user, api} = this.state;
    if (authenticated === null) {
      return null;
    }
    const navbar = <NavBar
      isAuthenticated={authenticated}
      login={this.login.bind(this)}
      logout={this.logout.bind(this)}
    />;
    return (
      <Switch>
        <Route
          path='/'
          exact={true}
          render={(props) => <Home {...props} authenticated={authenticated} user={user} api={api} navbar={navbar} />}
        />
        <SecureRoute
          path='/coffee-shops'
          exact={true}
          render={(props) => <CoffeeShopsList {...props} authenticated={authenticated} user={user} api={api} navbar={navbar}/>}
        />
        <SecureRoute
          path='/coffee-shops/:id'
          render={(props) => <CoffeeShopEdit {...props} authenticated={authenticated} user={user} api={api} navbar={navbar}/>}
        />
      </Switch>
    )
  }
});
class App extends Component {
  render() {
    return (
      <Router>
        <Security issuer='https://dev-148710.okta.com/oauth2/default'
              clientId='0oaagrqkyHes6DLjl4x6'
              redirectUri={window.location.origin + '/implicit/callback'}
              pkce={true}>
          <Route path='/implicit/callback' component={ImplicitCallback} />
          <AuthWrapper />
        </Security>
      </Router>
    )
  }
}

/*const api = new Api();

class App extends Component {
  render() {
     const navbar = <NavBar/>;
     return (
       <Router>
         <Switch>
           <Route
             path='/'
             exact={true}
             render={(props) => <Home {...props} api={api} navbar={navbar}/>}
           />
           <Route
             path='/coffee-shops'
             exact={true}
             render={(props) => <CoffeeShopsList {...props} api={api} navbar={navbar}/>}
           />
           <Route
             path='/coffee-shops/:id'
             render={(props) => <CoffeeShopEdit {...props} api={api} navbar={navbar}/>}
           />
         </Switch>
       </Router>
     )
   }
}*/

export default App;
