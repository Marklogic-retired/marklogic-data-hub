import React, { useState, useEffect } from 'react';
import { getProxy, getUserid, login } from "../api/api";
import { auth } from "../config/auth";
interface UserContextInterface {
    userid: string;
    proxy: string;
    handleGetProxy: any;
    handleGetUserid: any;
    handleLogin: any;
}
  
const defaultState = {
    userid: "",
    proxy: "",
    handleGetProxy: () => {},
    handleGetUserid: () => {},
    handleLogin: () => {}
};

/**
 * Component for storing user-oriented state such as authentication.
 *
 * @component
 * @prop {string} userid - User UUID value.
 * @prop {handleLogin} handleDetail - Method for requesting UUID from login endpoint. 
 * @example
 * TBD
 */
export const UserContext = React.createContext<UserContextInterface>(defaultState);

const UserProvider: React.FC = ({ children }) => {

  const [proxy, setProxy] = useState<string>("");
  const [userid, setUserid] = useState<string>("");

  const handleGetProxy = () => {
    let sr = getProxy();
    sr.then(result => {
        if (result && result.data) {
            setProxy(result.data);
        }
    }).catch(error => {
        console.error(error);
    })
  };

  useEffect(() => {
    if (proxy) {
      handleGetUserid();
    }
  }, [proxy]);

  const handleGetUserid = () => {
    let sr = getUserid(proxy);
    sr.then(result => {
        if (result && result.data) {
            setUserid(result.data);
        }
    }).catch(error => {
        console.error(error);
    })
  };

  useEffect(() => {
    if (userid) {
      handleLogin();
    }
  }, [userid]);

  const handleLogin = () => {
    let sr = login(auth.hubCentral.username, auth.hubCentral.password, userid);
    sr.then(() => {})
    .catch(error => {
        console.error(error);
    })
  };

  return (
    <UserContext.Provider
      value={{
        userid,
        proxy,
        handleGetProxy,
        handleGetUserid,
        handleLogin
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;