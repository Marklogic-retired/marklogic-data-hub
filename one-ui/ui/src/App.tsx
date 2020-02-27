import React, { useEffect, useContext, useState } from 'react';
import { Switch } from 'react-router';
import { Route, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { AuthContext } from './util/auth-context';

import Header from './components/header/header';
import Footer from './components/footer/footer';
import Login from './pages/Login';
import Home from './pages/Home';
import Install from './pages/Install';
import ProjectInfo from './pages/ProjectInfo';
import LoadData from './pages/LoadData';
import EntityTiles from './components/entities/entity-tiles';
import Bench from './pages/Bench';
import Reset from './pages/Reset';
import NoMatchRedirect from './pages/noMatchRedirect';

import './App.css';
import Application from './config/application.config';
import { themes, themeMap } from './config/themes.config';
import axios from 'axios';
import Entities from './pages/Entities';


interface Props extends RouteComponentProps<any> {}

const App: React.FC<Props> = ({history, location}) => {
  const { user, clearRedirect, handleError } = useContext(AuthContext);

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
  )

  useEffect(() => {
    if (user.authenticated){
      if (user.redirect) {
        clearRedirect();
      }
      if (location.state && !user.redirect && user.error.type === '') {
        if (location.state.hasOwnProperty('from')) {
          history.push(location.state.from.pathname);
        }
      }
      if (user.redirect || location.pathname === '/') {
        if (localStorage.getItem('dhIsInstalled') === 'false' && localStorage.getItem('dhUserHasManagePrivileges') === 'true') {
          history.push('/install');
        } else if (location.state && location.state.hasOwnProperty('from')) {
            history.push(location.state.from.pathname);
        } else {
            history.push('/home');
        }
      }
    }
    if (user.redirect) {
      if (user.error.type !== '') {
        clearRedirect();
        history.push('/error');
      } else if (!user.authenticated) {
        history.push('/');
      }
    }
  }, [user]);

  useEffect(() => {
    // On route change...
    axios.get('/api/environment/project')
      .then(res => {})
      // Timeouts throw 401s and are caught here
      .catch(err => {
          handleError(err);
      })
  }, [location.pathname]);

  const path = location['pathname'];
  const pageTheme = (themeMap[path]) ? themes[themeMap[path]] : themes['default'];
  document.body.classList.add(pageTheme['bodyBg']);
  document.title = Application.title;

  return (
    <div id="background" style={pageTheme['background']}>
      <Header/>
      <main>
      <Switch>
        <Route path="/" exact component={Login}/>
        <PrivateRoute path="/home" exact>
          <Home/>
        </PrivateRoute>
        <PrivateRoute path="/install" exact>
          <Install/>
        </PrivateRoute>
        <PrivateRoute path="/project-info" exact>
          <ProjectInfo/>
        </PrivateRoute>
        <PrivateRoute path="/load-data" exact>
          <LoadData/>
        </PrivateRoute>
        <PrivateRoute path="/entity-tiles" exact>
          <Entities/>
        </PrivateRoute>
        <PrivateRoute path="/bench" exact>
          <Bench/>
        </PrivateRoute>
        <Route path="/reset" exact component={Reset}/>
        <Route component={NoMatchRedirect}/>
      </Switch>
      </main>
      <Footer pageTheme={pageTheme}/>
    </div>
  );
}

export default withRouter(App);
