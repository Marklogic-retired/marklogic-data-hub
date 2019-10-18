import React, { useState, useEffect } from 'react';

type UserContextInterface = {
  name: string,
  // email: string,
  authenticated: boolean,
  error : any
}

const defaultUserData = {
  name: '',
  // email: '',
  authenticated: false,
  error : {title: '', message:''}
}

interface IAuthContextInterface {
  user: UserContextInterface;
  userAuthenticated: (username: string) => void;
  userNotAuthenticated: () => void;
  setErrorMessage:(error:any)=> void;
  clearErrorMessage:()=>void;
}

export const AuthContext = React.createContext<IAuthContextInterface>({
  user: defaultUserData,
  userAuthenticated: () => {},
  userNotAuthenticated: () => {},
  setErrorMessage:()=> {},
  clearErrorMessage:()=> {}
});

const AuthProvider: React.FC<{ children: any }> = ({children}) => {
  
  const [user, setUser] = useState(defaultUserData);
  const sessionUser = sessionStorage.getItem('dataHubExplorerUser');

  const userAuthenticated = (username: string) => {
    sessionStorage.setItem('dataHubExplorerUser', username);
    setUser({ ...user,name: username, authenticated: true });
  };

  const userNotAuthenticated = () => {
    sessionStorage.setItem('dataHubExplorerUser', '');
    setUser({ ...user,name: '', authenticated: false });
  };

  const setErrorMessage =(error)=>{
    console.log(error)
    setUser({...user,error})
  }

  const clearErrorMessage =()=>{
    setUser({...user,error : {title:'',message: ''}})
  }

  useEffect(() => {
    if (sessionUser) {
      userAuthenticated(sessionUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, userAuthenticated, userNotAuthenticated,setErrorMessage,clearErrorMessage}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;