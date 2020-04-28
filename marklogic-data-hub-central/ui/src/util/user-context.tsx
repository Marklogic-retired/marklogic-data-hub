import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  createUserPreferences,
  getUserPreferences,
  updateUserPreferences
} from '../services/user-preferences';
import { AuthoritiesContext } from './authorities';
import {setEnvironment, getEnvironment} from '../util/environment';
import { useInterval } from '../hooks/use-interval';
import { SESSION_WARNING_COUNTDOWN } from '../config/application.config';

type UserContextInterface = {
  name: string,
  // email: string,
  authenticated: boolean,
  redirect: boolean,
  error : any,
  pageRoute: string,
  maxSessionTime: number,
  sessionWarning: boolean
}

const defaultUserData = {
  name: '',
  // email: '',
  authenticated: false,
  redirect: false,
  error : {
    title: '',
    message: '',
    type: ''
  },
  pageRoute: '/view',
  maxSessionTime: 300,
  sessionWarning: false
}

interface IUserContextInterface {
  user: UserContextInterface;
  loginAuthenticated: (username: string, authResponse: any) => void;
  sessionAuthenticated: (username: string) => void;
  userNotAuthenticated: () => void;
  handleError: (error:any) => void;
  clearErrorMessage: () => void;
  clearRedirect: () => void;
  setPageRoute: (route: string) => void;
  setAlertMessage: (title: string, message: string) => void;
  resetSessionTime: () => void;
  setSessionWarning: (sessionWarning: boolean) => void;
  toggleSessionTimer: (runSessionTimer: boolean) => void;
}

export const UserContext = React.createContext<IUserContextInterface>({
  user: defaultUserData,
  loginAuthenticated: () => {},
  sessionAuthenticated: () => {},
  userNotAuthenticated: () => {},
  handleError: () => {},
  clearErrorMessage: () => {},
  clearRedirect: () => {},
  setPageRoute: () => {},
  setAlertMessage: () => {},
  resetSessionTime: () => {},
  setSessionWarning: () => {},
  toggleSessionTimer: () => {}
});

const UserProvider: React.FC<{ children: any }> = ({children}) => {

  const [user, setUser] = useState<UserContextInterface>(defaultUserData);
  const sessionUser = localStorage.getItem('dataHubUser');
  const authoritiesService = useContext(AuthoritiesContext);
  let sessionCount = 300;
  let sessionTimer = true;

  const loginAuthenticated = async (username: string, authResponse: any) => {
    setEnvironment();
    let session = await axios('/api/info');
    sessionCount = parseInt(session.data['sessionTimeout']);

    localStorage.setItem('dataHubUser', username);
    localStorage.setItem('projectName', authResponse.projectName);

    const authorities: string[] =  authResponse.authorities || [];
    authoritiesService.setAuthorities(authorities);

    let userPreferences = getUserPreferences(username);
    if (userPreferences) {
      let values = JSON.parse(userPreferences);
      setUser({
        ...user,
        name: username,
        authenticated: true,
        redirect: true,
        pageRoute: values.pageRoute,
        maxSessionTime: sessionCount,
        sessionWarning: false
      });
    } else {
      createUserPreferences(username);
      setUser({
        ...user,
        name: username,
        authenticated: true,
        redirect: true,
        maxSessionTime: sessionCount,
        sessionWarning: false
      });
    }
  };

  const sessionAuthenticated = (username: string) => {
    localStorage.setItem('dataHubUser', username);
    let userPreferences = getUserPreferences(username);
    if (userPreferences) {
      let values = JSON.parse(userPreferences);
      setUser({
        ...user,
        name: username,
        authenticated: true,
        pageRoute: values.pageRoute,
        maxSessionTime: sessionCount,
        sessionWarning: false
      });
    } else {
      createUserPreferences(username);
      setUser({ ...user,name: username, authenticated: true, sessionWarning: false });
    }
  };

  const userNotAuthenticated = () => {
    localStorage.setItem('dataHubUser', '');
    localStorage.setItem('projectName', '');
    localStorage.setItem('loginResp','');
    authoritiesService.setAuthorities([]);
    setUser({ ...user,name: '', authenticated: false, redirect: true, sessionWarning: false });
  };

  const handleError = (error) => {
    const DEFAULT_MESSAGE = 'Internal Server Error';
    switch (error.response.status) {
      case 401: {
        localStorage.setItem('dataHubUser', '');
        setUser({ ...user, name: '', authenticated: false });
        break;
      }
      case 400:
      case 403:
      case 405:
      case 408:
      case 414: {
        console.log('HTTP ERROR', error.resonse);
        let title = error.response.status + ' ' + error.response.statusText;
        let message = DEFAULT_MESSAGE;

        if (error.response.data.hasOwnProperty('message')) {
          message = error.response.data.message;
        }
        setUser({
          ...user,
          error: {
            title: title,
            message: message,
            type: 'ALERT'
          }
        });
        break;
      }
      case 404: {
        setUser({
          ...user,
          redirect: true,
          error: {
            title: error.response.data.error,
            message: error.response.data.message || DEFAULT_MESSAGE,
            type: 'ALERT'
          }
        });
      break;
      }
      case 500:
      case 501:
      case 502:
      case 503:
      case 504:
      case 505:
      case 511: {
        console.log('HTTP ERROR ', error.response);
        let title = error.response.status + ' ' + error.response.statusText;
        let message = DEFAULT_MESSAGE;

        if (error.response.data.hasOwnProperty('message')) {
          message = error.response.data.message;
        }
        setUser({
          ...user,
          error: {
            title,
            message,
            type: 'MODAL'
          }
        });
        break;
      }
      default: {
        console.log('HTTP ERROR ', error.response);

        setUser({
          ...user,
          error: {
            title: DEFAULT_MESSAGE,
            message: 'Please check the console for more information',
            type: 'MODAL'
          }
        });
        break;
      }
    }
  }

  const clearErrorMessage = () => {
    setUser({ ...user, error : { title:'', message: '', type: '' }});
  }
  const clearRedirect = () => {
    setUser({ ...user, redirect: false });
  }

  const setPageRoute = (route: string) => {
    updateUserPreferences(user.name, { pageRoute: route });
  }

  const setAlertMessage = (title: string, message: string) => {
    setUser({
      ...user,
      error: {
        title,
        message,
        type: 'ALERT'
      }
    });
  }

  const resetSessionTime = () => {
    sessionCount = user.maxSessionTime;
  }

  const setSessionWarning = (sessionWarning: boolean) => {
    setUser({ ...user, sessionWarning });
  }

  const toggleSessionTimer = (runSessionTimer: boolean) => {
    sessionTimer = runSessionTimer;
    sessionCount = user.maxSessionTime;
  }

  useEffect(() => {
    if (sessionUser) {
      sessionAuthenticated(sessionUser);
      let loginResponse = JSON.parse(localStorage.getItem('loginResp') || '{}')
      if(JSON.stringify(loginResponse) !== JSON.stringify({})){
        loginAuthenticated(sessionUser,loginResponse);
      }
    }
  }, []);

  useInterval(() => {
    if (user.authenticated && sessionTimer) {
      if (sessionCount === SESSION_WARNING_COUNTDOWN) {
        setSessionWarning(true);
      } else {
        sessionCount -= 1;
      }
    }
  }, 1000);

  return (
    <UserContext.Provider value={{
      user,
      loginAuthenticated,
      sessionAuthenticated,
      userNotAuthenticated,
      handleError,
      clearErrorMessage,
      clearRedirect,
      setPageRoute,
      setAlertMessage,
      resetSessionTime,
      setSessionWarning,
      toggleSessionTimer
    }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider;
