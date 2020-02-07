import React, { useEffect, useContext, useState } from 'react';
import { Switch } from 'react-router';
import { Route, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { AuthContext } from './util/auth-context';
import Header from './components/header/header';
import ProjectInfoHeader from './components/project-info-header/project-info-header';
import Footer from './components/footer/footer';
import Login from './pages/Login';
import Home from './pages/Home';
import Reset from './pages/Reset';
import Install from './pages/Install';
import LoadData from './pages/LoadData';
import ProjectInfo from './pages/ProjectInfo';
import NoMatchRedirect from './pages/no-match-redirect';
import './App.css';
import { themes, themeMap } from './config/themes.config';
import axios from 'axios';

interface Props extends RouteComponentProps<any> {}

const App: React.FC<Props> = ({history, location}) => {
  document.title = 'MarkLogic Data Hub';
  const { user, clearErrorMessage, clearRedirect, handleError } = useContext(AuthContext);
  const [asyncError, setAsyncError] = useState(false);
  const [showProjectHeader, setShowProjectHeader] = useState(false);

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
      if(localStorage.getItem('dhIsInstalled')==='true' && localStorage.getItem('projectName') != ''){
        setShowProjectHeader(true);
      }

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
    else {
      setShowProjectHeader(false);
    }
    if (user.redirect) {
      if (user.error.type !== '') {
        clearRedirect();
        history.push('/error');
      } else if (!user.authenticated) {
        history.push('/');
      }
    }
    if (user.error.type === 'MODAL') {
      setAsyncError(true);
    } else {
      setAsyncError(false);
    }
  }, [user]);

  // Handle timeout (returns status 401)
  useEffect(() => {
    // TODO access non-specific endpoint
    axios.get('/api/artifacts/loadData')
      .then(res => {})
      .catch(err => {
          handleError(err);
      })
  }, [location.pathname]);

  const path = location['pathname'];
  const pageTheme = (themeMap[path]) ? themes[themeMap[path]] : themes['default'];
  document.body.classList.add(pageTheme['bodyBg']);

  return (
    <div id="background" style={pageTheme['background']}>
      <Header/>
      <main>
      {showProjectHeader &&(<ProjectInfoHeader/>)}
      { !asyncError && (
        <Switch>
          <Route path="/" exact component={Login}/>
          <PrivateRoute path="/home" exact>
            <Home/>
          </PrivateRoute>
          <PrivateRoute path="/install" exact>
            <Install/>
          </PrivateRoute>
          <PrivateRoute path="/load-data" exact>
            <LoadData/>
          </PrivateRoute>
          <PrivateRoute path="/project-info" exact>
            <ProjectInfo/>
          </PrivateRoute>
          <Route path="/reset" exact component={Reset}/>
          <Route component={NoMatchRedirect}/>
        </Switch>
      )}
      </main>
      <Footer pageTheme={pageTheme}/>
    </div>
  );
}

export default withRouter(App);
