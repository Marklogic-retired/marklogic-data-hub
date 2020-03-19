import React, { useState, useEffect, useContext } from 'react';
import { 
  createUserPreferences,
  getUserPreferences, 
  updateUserPreferences
} from '../services/user-preferences';
import { RolesContext } from './roles';
import {setEnvironment, getEnvironment, resetEnvironment} from '../util/environment';

type UserContextInterface = {
  name: string,
  // email: string,
  authenticated: boolean,
  redirect: boolean,
  error : any,
  tableView: boolean,
  pageRoute: string,
  maxSessionTime: number
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
  tableView: true,
  pageRoute: '/view',
  maxSessionTime: 300
}

interface IUserContextInterface {
  user: UserContextInterface;
  loginAuthenticated: (username: string, authResponse: any) => void;
  sessionAuthenticated: (username: string) => void;
  userNotAuthenticated: () => void;
  handleError: (error:any) => void;
  clearErrorMessage: () => void;
  clearRedirect: () => void;
  setTableView: (viewType: boolean) => void;
  setPageRoute: (route: string) => void;
  setAlertMessage: (title: string, message: string) => void;
}

export const UserContext = React.createContext<IUserContextInterface>({
  user: defaultUserData,
  loginAuthenticated: () => {},
  sessionAuthenticated: () => {},
  userNotAuthenticated: () => {},
  handleError: () => {},
  clearErrorMessage: () => {},
  clearRedirect: () => {},
  setTableView: () => {},
  setPageRoute: () => {},
  setAlertMessage: () => {}
});

const UserProvider: React.FC<{ children: any }> = ({children}) => {
  
  const [user, setUser] = useState<UserContextInterface>(defaultUserData);
  const sessionUser = localStorage.getItem('dataHubUser');
  const rolesService = useContext(RolesContext);

  const loginAuthenticated = (username: string, authResponse: any) => {
    if(authResponse.isInstalled) {
      setEnvironment();
    }
    localStorage.setItem('dataHubUser', username);
    localStorage.setItem('dhIsInstalled', authResponse.isInstalled);
    localStorage.setItem('dhUserHasManagePrivileges', authResponse.hasManagePrivileges);
    localStorage.setItem('projectName', authResponse.projectName);

    const roles: string[] =  authResponse.roles || [];
    rolesService.setRoles(roles);

    let userPreferences = getUserPreferences(username);
    if (userPreferences) {
      let values = JSON.parse(userPreferences);
      setUser({ 
        ...user,
        name: username,
        authenticated: true,
        redirect: true,
        tableView: values.tableView,
        pageRoute: values.pageRoute      
      });
    } else {
      createUserPreferences(username);
      setUser({ 
        ...user,
        name: username,
        authenticated: true,
        redirect: true
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
        tableView: values.tableView,
        pageRoute: values.pageRoute 
      });
    } else {
      createUserPreferences(username);
      setUser({ ...user,name: username, authenticated: true });
    }
  };

  const userNotAuthenticated = () => {
    localStorage.setItem('dataHubUser', '');
    localStorage.setItem('dhIsInstalled', '');
    localStorage.setItem('dhUserHasManagePrivileges', '');
    localStorage.setItem('projectName', '');
    localStorage.setItem('loginResp','');
    rolesService.setRoles([]);
    resetEnvironment();
    setUser({ ...user,name: '', authenticated: false, redirect: true });
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

  const setTableView = (view) => {
    updateUserPreferences(user.name, { tableView: view });
    setUser({...user, tableView: view });
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

  useEffect(() => {
    if (sessionUser) {
      sessionAuthenticated(sessionUser);
      let loginResponse = JSON.parse(localStorage.getItem('loginResp') || '{}')
      if(JSON.stringify(loginResponse) !== JSON.stringify({})){
        loginAuthenticated(sessionUser,loginResponse);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ 
      user,
      loginAuthenticated,
      sessionAuthenticated,
      userNotAuthenticated,
      handleError, 
      clearErrorMessage,
      clearRedirect,
      setTableView,
      setPageRoute,
      setAlertMessage
    }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider;