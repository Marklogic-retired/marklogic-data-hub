import React, { useState } from 'react';

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
  
  const [name, setName] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const userAuthenticated = (username: string) => {
    setAuthenticated(true);
    setName(username);
  };

  const userNotAuthenticated = () => {
    setName('');
    setAuthenticated(false);
  };
  return (
    <AuthContext.Provider value={{ user: {name, authenticated}, userAuthenticated, userNotAuthenticated}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;