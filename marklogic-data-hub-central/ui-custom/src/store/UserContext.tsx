import React, { useState, useEffect } from 'react';
import { getLoginAddress, getUserid, login, getConfig } from "../api/api";
interface UserContextInterface {
    userid: string;
    loginAddress: string;
    config: any;
    handleGetLoginAddress: any;
    handleGetUserid: any;
    handleLogin: any;
    handleGetConfig: any;
}
  
const defaultState = {
    userid: "",
    loginAddress: "",
    config: {},
    handleGetLoginAddress: () => {},
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

  const [loginAddress, setLoginAddress] = useState<string>("");
  const [userid, setUserid] = useState<string>("");
  const [authorities, setAuthorites] = useState<any>(null);
  const [config, setConfig] = useState<any>({});

  const handleGetLoginAddress = () => {
    let sr = getLoginAddress();
    sr.then(result => {
        if (result && result.data) {
            setLoginAddress(result.data);
        }
    }).catch(error => {
        console.error(error);
    })
  };

  useEffect(() => {
    if (loginAddress) {
      handleGetUserid();
    }
  }, [loginAddress]);

  const handleGetUserid = () => {
    let sr = getUserid(loginAddress);
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
    let sr = login("", "", userid); // empty auth values for HC login
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
    let sr = getConfig(userid);
    sr.then(result => {
        if (result && result.data) {
            setConfig(result.data);
        }
    }).catch(error => {
        console.error(error);
    })
  };

  return (
    <UserContext.Provider
      value={{
        userid,
        loginAddress,
        config,
        handleGetLoginAddress,
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