import React, { useEffect, useContext, useState } from 'react';
import { Switch } from 'react-router';
import { Route, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { UserContext } from './util/user-context';
import SearchProvider from './util/search-context';
import ModelingProvider from './util/modeling-context';

import Header from './components/header/header';
import Footer from './components/footer/footer';
import Login from './pages/Login';
import Home from './pages/Home';
import ProjectInfo from './pages/ProjectInfo';
import Load from './pages/Load';
import Run from './pages/Run';
import TilesView from './pages/TilesView';
import NoMatchRedirect from './pages/noMatchRedirect';
import View from './pages/View';
import Browse from './pages/Browse';

import Detail from './pages/Detail';
import Modeling from './pages/Modeling';

import './App.scss';
import { Application } from './config/application.config';
import { themes, themeMap } from './config/themes.config';
import axios from 'axios';
import Curate from './pages/Curate';
import ModalStatus from './components/modal-status/modal-status';


interface Props extends RouteComponentProps<any> {}

const App: React.FC<Props> = ({history, location}) => {
  const {
    user,
    clearRedirect,
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
  )

  useEffect(() => {
    if (user.authenticated){
      if (user.redirect) {
        clearRedirect();
      }
      if (location.state && !user.redirect && user.error.type === '') {
        if (location.state.hasOwnProperty('from')) {
          history.push(location.state['from'].pathname);
        }
      }
      if (user.redirect || location.pathname === '/') {
        if (location.state && location.state.hasOwnProperty('from')) {
            history.push(location.state['from'].pathname);
        } else {
            history.push('/tiles');
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
    axios.get('/api/environment/project-info')
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
      <ModalStatus/>
      <main>
      <Switch>
        <Route path="/" exact component={Login}/>
        <PrivateRoute path="/home" exact>
          <Home/>
        </PrivateRoute>
        <PrivateRoute path="/project-info" exact>
          <ProjectInfo/>
        </PrivateRoute>
        <PrivateRoute path="/load" exact>
          <Load/>
        </PrivateRoute>
        <PrivateRoute path="/curate" exact>
          <Curate/>
        </PrivateRoute>
        <PrivateRoute path="/run" exact>
          <Run/>
        </PrivateRoute>
        <SearchProvider>
          <PrivateRoute path="/view" exact>
              <View/>
          </PrivateRoute>
          <PrivateRoute path="/browse" exact>
              <Browse/>
          </PrivateRoute>
          <PrivateRoute path="/detail/:pk/:uri">
            <Detail/>
          </PrivateRoute>
          <ModelingProvider>
            <PrivateRoute path="/model" exact>
              <Modeling/>
            </PrivateRoute>
            <PrivateRoute path="/tiles" exact>
              <TilesView/>
            </PrivateRoute>  
          </ModelingProvider>
        </SearchProvider>
        <Route component={NoMatchRedirect}/>
      </Switch>
      </main>
      <Footer pageTheme={pageTheme}/>
    </div>
  );
}

export default withRouter(App);
