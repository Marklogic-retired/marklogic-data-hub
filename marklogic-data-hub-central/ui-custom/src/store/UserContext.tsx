import React, { useState, useEffect } from 'react';
import { getProxy, getUserid, login, getConfig } from "../api/api";
import { auth } from "../config/auth";
interface UserContextInterface {
    userid: string;
    proxy: string;
    config: any;
    handleGetProxy: any;
    handleGetUserid: any;
    handleLogin: any;
    handleGetConfig: any;
}
  
const defaultState = {
    userid: "",
    proxy: "",
    config: {},
    handleGetProxy: () => {},
    handleGetUserid: () => {},
    handleLogin: () => {},
    handleGetConfig: () => {}
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
  const [authorities, setAuthorites] = useState<any>(null);
  const [config, setConfig] = useState<any>({});

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
    sr.then(result => {
      if (result && result.data) {
        setAuthorites(result.data.authorities);
      }
    }).catch(error => {
        console.error(error);
    })
  };

  useEffect(() => {
    if (authorities !== null) {
      handleGetConfig();
    }
  }, [authorities]);

  const handleGetConfig = () => {
    // TODO load from database via endpoint
    let sr = getConfig(userid);
    sr.then(result => {
        // if (result && result.data) {
        //     console.log("handleGetConfig result", result);
        // }
        setConfig(result);
    }).catch(error => {
        console.error(error);
    })
  };

  return (
    <UserContext.Provider
      value={{
        userid,
        proxy,
        config,
        handleGetProxy,
        handleGetUserid,
        handleLogin,
        handleGetConfig
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;