import React, { useState, useEffect } from 'react';
import { twizzlersLogin, hcLogin } from "../api/api";
import { auth } from "../config/auth";
import config from "../config/config.json"; // TODO load from database via endpoint
interface UserContextInterface {
    userid: string;
    config: any;
    handleTwizzlersLogin: any;
    handleHCLogin: any;
    handleGetConfig: any;
}
  
const defaultState = {
    userid: "",
    config: "",
    handleTwizzlersLogin: () => {},
    handleHCLogin: () => {},
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

  const [userid, setUserid] = useState<string>("");
  const [authorities, setAuthorities] = useState<any>(null);

  const handleTwizzlersLogin = () => {
    let sr = twizzlersLogin();
    sr.then(result => {
        if (result && result.data) {
            console.log("handleTwizzlersLogin result", result);
            setUserid(result.data);
        }
    }).catch(error => {
        console.error(error);
    })
  };

  useEffect(() => {
    if (userid) {
      console.log("useEffect userid", userid);
      handleHCLogin();
    }
  }, [userid]);

  const handleHCLogin = () => {
    let sr = hcLogin(auth.hubCentral.username, auth.hubCentral.password, userid);
    sr.then(result => {
        if (result && result.data) {
            console.log("handleHCLogin result", result);
            localStorage.setItem("loginResp", JSON.stringify(result.data));
            setAuthorities(result.data.authorities);
        }
    }).catch(error => {
        console.error(error);
    })
  };

  useEffect(() => {
    if (authorities) {
      console.log("useEffect authorities", authorities);
      handleGetConfig();
    }
  }, [authorities]);

  const handleGetConfig = () => {
    console.log("handleGetConfig");
    // TODO load from database via endpoint
    // let sr = getConfig(userid);
    // sr.then(result => {
    //     if (result && result.data) {
    //         console.log("handleGetConfig result", result);
    //     }
    // }).catch(error => {
    //     console.error(error);
    // })
  };

  return (
    <UserContext.Provider
      value={{
        userid,
        config,
        handleTwizzlersLogin,
        handleHCLogin,
        handleGetConfig
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;