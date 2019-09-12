import React, { useState, useEffect } from 'react';

type UserContextInterface = {
  name: string,
  // email: string,
  authenticated: boolean
}

const defaultUserData = {
  name: '',
  // email: '',
  authenticated: false
}

interface IAuthContextInterface {
  user: UserContextInterface;
  userAuthenticated: (username: string) => void;
  userNotAuthenticated: () => void;
}

export const AuthContext = React.createContext<IAuthContextInterface>({
  user: defaultUserData,
  userAuthenticated: () => {},
  userNotAuthenticated: () => {}
});

const AuthProvider: React.FC<{ children: any }> = ({children}) => {
  
  const [user, setUser] = useState({ name: '', authenticated: false });
  const sessionUser = sessionStorage.getItem('dataHubExplorerUser');

  const userAuthenticated = (username: string) => {
    sessionStorage.setItem('dataHubExplorerUser', username);
    setUser({ name: username, authenticated: true });
  };

  const userNotAuthenticated = () => {
    sessionStorage.setItem('dataHubExplorerUser', '');
    setUser({ name: '', authenticated: false });
  };

  useEffect(() => {
    if (sessionUser) {
      userAuthenticated(sessionUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, userAuthenticated, userNotAuthenticated}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;