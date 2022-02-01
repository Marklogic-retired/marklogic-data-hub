import React, { useState, useEffect } from 'react';
import { twizzlersLogin, hcLogin, hcGetSession } from "../api/api";
import { auth } from "../config/auth";
interface UserContextInterface {
    userid: string;
    handleTwizzlersLogin: any;
    handleHCLogin: any;
    handleHCGetSession: any;
}
  
const defaultState = {
    userid: "",
    handleTwizzlersLogin: () => {},
    handleHCLogin: () => {},
    handleHCGetSession: () => {}
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
  const [authorities, setAuthorities] = useState<any>([]);

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
    if (authorities.length > 0) {
      console.log("useEffect authorities", authorities);
      handleHCGetSession();
    }
  }, [authorities]);

  const handleHCGetSession = () => {
    let sr = hcGetSession(userid);
    sr.then(result => {
        if (result && result.data) {
            console.log("handleHCGetSession result", result);
        }
    }).catch(error => {
        console.error(error);
    })
  };

  return (
    <UserContext.Provider
      value={{
        userid,
        handleTwizzlersLogin,
        handleHCLogin,
        handleHCGetSession
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;