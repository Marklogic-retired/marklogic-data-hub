import React, {useState, useEffect, useContext} from 'react';
import { RolesContext } from './roles';

type UserContextInterface = {
  name: string,
  // email: string,
  authenticated: boolean,
  redirect: boolean,
  error : any,
  tableView: boolean
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
  tableView: true
}

interface IAuthContextInterface {
  user: UserContextInterface;
  loginAuthenticated: (username: string, authResponse: any) => void;
  sessionAuthenticated: (username: string) => void;
  userNotAuthenticated: () => void;
  handleError: (error:any) => void;
  clearErrorMessage: () => void;
  clearRedirect: () => void;
  setTableView: (viewType: boolean) => void;
}

export const AuthContext = React.createContext<IAuthContextInterface>({
  user: defaultUserData,
  loginAuthenticated: () => {},
  sessionAuthenticated: () => {},
  userNotAuthenticated: () => {},
  handleError: () => {},
  clearErrorMessage: () => {},
  clearRedirect: () => {},
  setTableView: () => {}
});

const AuthProvider: React.FC<{ children: any }> = ({children}) => {

  const [user, setUser] = useState(defaultUserData);
  const sessionUser = localStorage.getItem('dataHubUser');
  const rolesService = useContext(RolesContext);

  const loginAuthenticated = (username: string, authResponse: any) => {
    localStorage.setItem('dataHubUser', username);
    localStorage.setItem('dhIsInstalled', authResponse.isInstalled);
    localStorage.setItem('dhUserHasManagePrivileges', authResponse.hasManagePrivileges);
    localStorage.setItem('projectName', authResponse.projectName);
    const roles: string[] =  authResponse.roles || [];
    rolesService.setRoles(roles);
    setUser({ ...user,name: username, authenticated: true, redirect: true });
  };

  const sessionAuthenticated = (username: string) => {
    localStorage.setItem('dataHubUser', username);
    setUser({ ...user,name: username, authenticated: true });
  };

  const userNotAuthenticated = () => {
    localStorage.setItem('dataHubUser', '');
    localStorage.setItem('dhIsInstalled', '');
    localStorage.setItem('dhUserHasManagePrivileges', '');
    localStorage.setItem('projectName', '');
    rolesService.setRoles([]);
    setUser({ ...user,name: '', authenticated: false, redirect: true });
  };

  const handleError = (error: { response: { status: any; statusText: any; data: { hasOwnProperty: { (arg0: any): any; (arg0: any): any; }; message: any; error: any; }; }; resonse: any; }) => {
    const DEFAULT_MESSAGE = 'Internal Server Error';
    switch (error.response.status) {
      case 401: {
        userNotAuthenticated();
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

  const setTableView = (view: boolean) => {
    setUser({...user, tableView: view });
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
      clearRedirect,
      setTableView,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;
