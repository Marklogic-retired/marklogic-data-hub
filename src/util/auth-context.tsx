import React, { useState, useEffect } from 'react';

type UserContextInterface = {
  name: string,
  // email: string,
  authenticated: boolean,
  redirect: boolean,
  error : any
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
  }
}

interface IAuthContextInterface {
  user: UserContextInterface;
  loginAuthenticated: (username: string) => void;
  sessionAuthenticated: (username: string) => void;
  userNotAuthenticated: () => void;
  handleError: (error:any) => void;
  clearErrorMessage: () => void;
  clearRedirect: () => void;
}

export const AuthContext = React.createContext<IAuthContextInterface>({
  user: defaultUserData,
  loginAuthenticated: () => {},
  sessionAuthenticated: () => {},
  userNotAuthenticated: () => {},
  handleError: () => {},
  clearErrorMessage: () => {},
  clearRedirect: () => {}
});

const AuthProvider: React.FC<{ children: any }> = ({children}) => {
  
  const [user, setUser] = useState(defaultUserData);
  const sessionUser = localStorage.getItem('dataHubExplorerUser');

  const loginAuthenticated = (username: string) => {
    localStorage.setItem('dataHubExplorerUser', username);
    setUser({ ...user,name: username, authenticated: true, redirect: true });
  };

  const sessionAuthenticated = (username: string) => {
    localStorage.setItem('dataHubExplorerUser', username);
    setUser({ ...user,name: username, authenticated: true });
  };

  const userNotAuthenticated = () => {
    localStorage.setItem('dataHubExplorerUser', '');
    setUser({ ...user,name: '', authenticated: false });
  };

  const handleError = (error) => {
    const DEFAULT_MESSAGE = 'Internal Server Error';
  
    switch (error.response.status) {
      case 401:
        localStorage.setItem('dataHubExplorerUser', '');
        setUser({ ...user, name: '', authenticated: false });
        break;
      case 400:
      case 403:
      case 405:
      case 408:
      case 414:
        setUser({ 
          ...user,
          error: {
            title: error.response.data.error,
            message: error.response.data.message || DEFAULT_MESSAGE,
            type: 'ALERT'
          }
        });
        break;
      case 404:
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
      case 500:
      case 501:
      case 502:
      case 503:
      case 504:
      case 505:
      case 511:
        let title = '';
        let message = '';
  
        if (error.response.data.hasOwnProperty('message')) {
          title = error.response.data.error;
          message = error.response.data.message;
        } else {
          title = error.response.status + ' ' + error.response.statusText;
          message = error.response.data || DEFAULT_MESSAGE;
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
      default:
        break;
    }
  }

  const clearErrorMessage = () => {
    setUser({ ...user, error : { title:'', message: '', type: '' }});
  }
  const clearRedirect = () => {
    setUser({ ...user, redirect: false });
  }

  useEffect(() => {
    if (sessionUser) {
      sessionAuthenticated(sessionUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user,
      loginAuthenticated,
      sessionAuthenticated,
      userNotAuthenticated,
      handleError, 
      clearErrorMessage,
      clearRedirect
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;