import React, { useState, useEffect } from 'react';
import { 
  createUserPreferences,
  getUserPreferences, 
  updateUserPreferences
} from '../services/user-preferences';

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
  loginAuthenticated: (username: string, sessionTime: number) => void;
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
  const sessionUser = localStorage.getItem('dataHubExplorerUser');

  const loginAuthenticated = (username: string, sessionTime: number) => {
    localStorage.setItem('dataHubExplorerUser', username);
    let userPreferences = getUserPreferences(username);
    if (userPreferences) {
      let values = JSON.parse(userPreferences);
      setUser({ 
        ...user,
        name: username,
        authenticated: true,
        redirect: true,
        tableView: values.tableView,
        pageRoute: values.pageRoute,
        maxSessionTime: sessionTime 
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
    localStorage.setItem('dataHubExplorerUser', username);
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
    localStorage.setItem('dataHubExplorerUser', '');
    setUser({ ...user,name: '', authenticated: false });
  };

  const handleError = (error) => {
    const DEFAULT_MESSAGE = 'Internal Server Error';
    switch (error.response.status) {
      case 401: {
        localStorage.setItem('dataHubExplorerUser', '');
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