import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { Switch } from 'react-router';
import { Route, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { UserContext } from './util/user-context';
import SearchProvider from './util/search-context';
import ModelingProvider from './util/modeling-context';
import CurationProvider from './util/curation-context';

import Header from './components/header/header';
import Footer from './components/footer/footer';
import Login from './pages/Login';
import TilesView from './pages/TilesView';
import NoMatchRedirect from './pages/noMatchRedirect';
import NoResponse from './pages/NoResponse';
import ModalStatus from './components/modal-status/modal-status';
import NavigationPrompt from './components/navigation-prompt/navigation-prompt';

import './App.scss';
import { Application } from './config/application.config';
import { themes, themeMap } from './config/themes.config';
import { getEnvironment } from './util/environment';

interface Props extends RouteComponentProps<any> {}

const App: React.FC<Props> = ({history, location}) => {
  const {
    user,
    handleError
  } = useContext(UserContext);

  const PrivateRoute = ({ children, ...rest }) => (
    <Route {...rest} render={ props => (
      user.authenticated === true ? (
        children
      ) : (
        <Redirect push={true} to={{
          pathname: '/',
          state: { from: props.location }
        }}/>
      )
    )}/>
  );

  const getPageRoute = (loc) => {
    if (loc.search && loc.search.startsWith("?from=")) {
      return decodeURIComponent(loc.search.substring(6));
    } else if (loc.pathname !== '/' && loc.pathname !== '/noresponse') {
      return loc.pathname
    } else {
      return user.pageRoute;
    }
  }

  useEffect(() => {
    if (user.authenticated){
      if (location.pathname === '/') {
        history.push(user.pageRoute);
      } else if (location.pathname === '/tiles/run/add'){
        history.push('/tiles/run');
      } else {
        history.push(location.pathname);
      }
    } else {
      if (user.error.type !== '') {
        history.push('/error');
      }
      user.pageRoute = getPageRoute(location);
    }
  }, [user]);

  useEffect(() => {
    // On route change...
    if (user.authenticated) {
      axios.get('/api/environment/systemInfo')
      .then(res => {})
      // Timeouts throw 401s and are caught here
      .catch(err => {
          if (err.response) {
            handleError(err);
          } else {
            history.push('/noresponse');
          }
      })
    }
  }, [location.pathname]);

  const path = location['pathname'];
  const pageTheme = (themeMap[path]) ? themes[themeMap[path]] : themes['default'];
  document.body.classList.add(pageTheme['bodyBg']);
  document.title = Application.title;

  return (
    <div id="background" style={pageTheme['background']}>
      <SearchProvider>
        <ModelingProvider>
          <CurationProvider>
            <Header environment={getEnvironment()} />
            <ModalStatus/>
            <NavigationPrompt/>
            <main>
              <div className="contentContainer">
              <Switch>
                <Route path="/" exact component={Login}/>
                <Route path="/noresponse" exact component={NoResponse} />
                <PrivateRoute path="/tiles" exact>
                  <TilesView/>
                </PrivateRoute>
                <PrivateRoute path="/tiles/load" exact>
                  <TilesView id='load'/>
                </PrivateRoute>
                <PrivateRoute path="/tiles/model" exact>
                  <TilesView id='model'/>
                </PrivateRoute>
                <PrivateRoute path="/tiles/curate" exact>
                  <TilesView id='curate'/>
                </PrivateRoute>
                <PrivateRoute path="/tiles/curate/match" exact>
                  <TilesView id='curate'/>
                </PrivateRoute>
                <PrivateRoute path="/tiles/run" exact>
                  <TilesView id='run'/>
                </PrivateRoute>
                <PrivateRoute path="/tiles/run/add" exact>
                  <TilesView id='run' addingStepToFlow='true' />
                </PrivateRoute>
                <PrivateRoute path="/tiles/explore" exact>
                  <TilesView id='explore'/>
                </PrivateRoute>
                <PrivateRoute path="/tiles/explore/detail">
                  <TilesView id='explore'/>
                </PrivateRoute>
                <Route component={NoMatchRedirect}/>
              </Switch>
              </div>
              <Footer pageTheme={pageTheme}/>
            </main>
          </CurationProvider>
        </ModelingProvider>
      </SearchProvider>
    </div>
  );
}

export default withRouter(App);
