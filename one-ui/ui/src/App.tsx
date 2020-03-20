import React, { useEffect, useContext, useState } from 'react';
import { Switch } from 'react-router';
import { Route, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import { UserContext } from './util/user-context';
import SearchProvider from './util/search-context';
import { useInterval } from './hooks/use-interval';
import { SESSION_WARNING } from './config/application.config';

import Header from './components/header/header';
import Footer from './components/footer/footer';
import Login from './pages/Login';
import Home from './pages/Home';
import Install from './pages/Install';
import ProjectInfo from './pages/ProjectInfo';
import LoadData from './pages/LoadData';
import Bench from './pages/Bench';
import Reset from './pages/Reset';
import NoMatchRedirect from './pages/noMatchRedirect';
import View from './pages/View';
import Browse from './pages/Browse';
import Detail from './pages/Detail';
import EntityTypes from './pages/EntityTypes';

import './App.scss';
import { Application }from './config/application.config';
import { themes, themeMap } from './config/themes.config';
import axios from 'axios';



interface Props extends RouteComponentProps<any> {}

const App: React.FC<Props> = ({history, location}) => {
  const { 
    user,
    userNotAuthenticated,
    clearRedirect,
    handleError,
    setSessionWarning,
    resetSessionTime
  } = useContext(UserContext);
  const [sessionTime, setSessionTime] = useState(SESSION_WARNING);

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
        if (localStorage.getItem('dhIsInstalled') === 'false' && localStorage.getItem('dhUserHasManagePrivileges') === 'true') {
          history.push('/install');
        } else if (location.state && location.state.hasOwnProperty('from')) {
            history.push(location.state['from'].pathname);
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

  useInterval(() => {
    if (user.sessionWarning) {
      if (sessionTime === 0) {
        handleLogout();
      } else {
        setSessionTime(sessionTime - 1);
      }
    }
  }, 1000);

  const continueSession = async () => {
    // refresh session
    try {
      await axios('/api/info');
    } catch (error) {
      handleError(error);
    } finally {
      setSessionTime(SESSION_WARNING);
      setSessionWarning(false);
    }
  }

  const handleLogout = async () => {
    try {
      let response = await axios(`/api/logout`);
      if (response.status === 200 ) {
        userNotAuthenticated();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setSessionTime(SESSION_WARNING);
    }
  };

  return (
    <div id="background" style={pageTheme['background']}>
      <Header/>
      <Modal 
        visible={user.sessionWarning} 
        closable={false}
        title={"Session Timeout"} 
        cancelText="Log Out"
        onCancel={() => handleLogout()} 
        okText="Continue Session"
        onOk={() => continueSession()}
      >
        <p data-cy="inactivity">Due to Inactivity, you will be logged out in {sessionTime} seconds</p>
      </Modal>
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
          <EntityTypes/>
        </PrivateRoute>
        <PrivateRoute path="/bench" exact>
          <Bench/>
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
        </SearchProvider>
        <Route path="/reset" exact component={Reset}/>
        <Route component={NoMatchRedirect}/>
      </Switch>
      </main>
      <Footer pageTheme={pageTheme}/>
    </div>
  );
}

export default withRouter(App);
