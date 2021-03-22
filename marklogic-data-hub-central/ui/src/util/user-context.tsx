import React, {useContext, useEffect, useRef, useState} from "react";
import {Subscription} from "rxjs";
import axios from "axios";
import {createUserPreferences, getUserPreferences, updateUserPreferences} from "../services/user-preferences";
import {IUserContextInterface, UserContextInterface} from "../types/user-types";
import {ViewSettingsType} from "../types/view-types";
import {AuthoritiesContext} from "./authorities";
import {StompContext, STOMPState} from "./stomp";
import {resetEnvironment, setEnvironment} from "../util/environment";
import {useInterval} from "../hooks/use-interval";
import {MAX_SESSION_TIME} from "../config/application.config";

const defaultUserData = {
  name: "",
  authenticated: false,
  error: {
    title: "",
    message: "",
    type: ""
  },
  pageRoute: "/tiles",
  maxSessionTime: MAX_SESSION_TIME
};

let CryptoJS = require("crypto-js");

export function getViewSettings (): ViewSettingsType {
  const data: any = JSON.parse(sessionStorage.getItem("dataHubViewSettings") ?? JSON.stringify({}));
  return data;
}

export function setViewSettings (data: ViewSettingsType): void {
  sessionStorage.setItem("dataHubViewSettings", JSON.stringify(data));
}

export const UserContext = React.createContext<IUserContextInterface>({
  user: defaultUserData,
  loginAuthenticated: () => {},
  sessionAuthenticated: () => {},
  userNotAuthenticated: () => {},
  handleError: () => {},
  clearErrorMessage: () => {},
  setPageRoute: () => {},
  setAlertMessage: () => {},
  resetSessionTime: () => {},
  getSessionTime: () => { return defaultUserData.maxSessionTime; }
});

const UserProvider: React.FC<{ children: any }> = ({children}) => {

  const [user, setUser] = useState<UserContextInterface>(defaultUserData);
  const [stompMessageSubscription, setStompMessageSubscription] = useState<Subscription|null>(null);
  const [unsubscribeId, setUnsubscribeId] = useState<string|null>(null);
  const sessionUser = localStorage.getItem("dataHubUser");
  const authoritiesService = useContext(AuthoritiesContext);
  const stompService = useContext(StompContext);
  const sessionCount = useRef<number>(MAX_SESSION_TIME);
  let sessionTimer = true;

  const setSessionTime = (timeInSeconds) => {
    sessionCount.current = timeInSeconds;
  };

  const resetSessionMonitor = () => {
    // unsubscribe from STOMP/WebSockets
    if (unsubscribeId) {
      stompService.unsubscribe(unsubscribeId);
      setUnsubscribeId(null);
    }
    // unsubscribe from message queue, so we don't double up subscriptions on login/logout
    if (stompMessageSubscription !== null) {
      stompMessageSubscription.unsubscribe();
      setStompMessageSubscription(null);
    }
    const closedWebSockets = new Promise<STOMPState>(resolve => {
      if (stompService.isClosed() || stompService.isTrying()) {
        resolve(stompService.state.getValue());
      } else {
        stompService.state.asObservable().subscribe((value) => {
          if (value.valueOf() === STOMPState.CLOSED) {
            resolve(value);
          }
        });
      }
    });
    stompService.disconnect();
    return closedWebSockets;
  };

  const subscribeToMonitorSession = () => {
    const hubCentralSessionToken = localStorage.getItem("hubCentralSessionToken");
    if (hubCentralSessionToken) {
      if (!stompMessageSubscription) {
        setStompMessageSubscription(stompService.messages.subscribe((message) => {
          setSessionTime(parseInt(JSON.parse(message.body).sessionTimeout));
        }));
      }
      if (!unsubscribeId) {
        stompService.subscribe(`/topic/sessionStatus/${hubCentralSessionToken}`, (msgId: string) => {
          setUnsubscribeId(msgId);
        });
      }
    }
  };
  const monitorSession = () => {
    if (stompService.isClosed()) {
      stompService.configure(window.location.origin + "/websocket");
      stompService.tryConnect().then(subscribeToMonitorSession);
    }
  };

  const loginAuthenticated = async (username: string, authResponse: any) => {
    setEnvironment();
    let session = await axios("/api/environment/systemInfo");
    setSessionTime(parseInt(session.data["sessionTimeout"]));

    localStorage.setItem("dataHubUser", username);
    localStorage.setItem("serviceName", session.data.serviceName);
    localStorage.setItem("hubCentralSessionToken", session.data.sessionToken);
    monitorSession();
    sessionStorage.setItem("dataHubViewSettings", JSON.stringify({}));

    if (session.data.pendoKey) {
      window.usePendo && window.usePendo(session.data.pendoKey);
      window.pendo && window.pendo.initialize({
        excludeAllText: true,
        excludeTitle: true
      });
      window.pendo && window.pendo.identify({
        visitor: {
          id: CryptoJS.SHA256(session.data.serviceName + username).toString(CryptoJS.enc.Hex),
          authorities: authResponse.authorities || []
        },
        account: {
          id: session.data.serviceName,
          dataHubVersion: session.data.dataHubVersion,
          marklogicVersion: session.data.marklogicVersion
        }
      });
    }

    const authorities: string[] =  authResponse.authorities || [];
    authoritiesService.setAuthorities(authorities);

    let userPreferences = getUserPreferences(username);
    if (userPreferences) {
      setUser({
        ...user,
        name: username,
        authenticated: true,
        pageRoute: defaultUserData.pageRoute,
        maxSessionTime: sessionCount.current
      });
    } else {
      createUserPreferences(username);
      setUser({
        ...user,
        name: username,
        authenticated: true,
        pageRoute: defaultUserData.pageRoute,
        maxSessionTime: sessionCount.current
      });
    }
  };

  const sessionAuthenticated = (username: string) => {
    monitorSession();
    localStorage.setItem("dataHubUser", username);
    let userPreferences = getUserPreferences(username);
    if (userPreferences) {
      setUser({
        ...user,
        name: username,
        authenticated: true,
        pageRoute: defaultUserData.pageRoute,
        maxSessionTime: sessionCount.current
      });
    } else {
      createUserPreferences(username);
      setUser({...user, name: username, authenticated: true});
    }
  };

  const userNotAuthenticated = () => {
    setUser({...user, name: "", authenticated: false, pageRoute: defaultUserData.pageRoute});
    resetSessionMonitor().then(() => {
      localStorage.setItem("dataHubUser", "");
      localStorage.setItem("serviceName", "");
      localStorage.setItem("loginResp", "");
      localStorage.setItem("hubCentralSessionToken", "");
      authoritiesService.setAuthorities([]);
      resetEnvironment();
    });
  };

  const handleError = (error) => {
    const DEFAULT_MESSAGE = "Internal Server Error";
    switch (error.response.status) {
    case 401: {
      localStorage.setItem("dataHubUser", "");
      localStorage.setItem("loginResp", "");
      setUser({...user, name: "", authenticated: false});
      break;
    }
    case 400:
    case 403:
    case 405:
    case 408:
    case 414: {
      console.error("HTTP ERROR", error.response);
      let title = error.response.status + " " + error.response.statusText;
      let message = DEFAULT_MESSAGE;

      if (error.response.data.hasOwnProperty("message")) {
        message = error.response.data.message;
      }
      setUser({
        ...user,
        error: {
          title: title,
          message: message,
          type: "ALERT"
        }
      });
      break;
    }
    case 404: {
      setUser({
        ...user,
        // redirect: true,
        error: {
          title: error.response.data.error,
          message: error.response.data.message || DEFAULT_MESSAGE,
          type: "ALERT"
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
      console.error("HTTP ERROR ", error.response);
      let title = error.response.status + " " + error.response.statusText;
      let message = DEFAULT_MESSAGE;

      if (error.response.data.hasOwnProperty("message")) {
        message = error.response.data.message;
      }
      setUser({
        ...user,
        error: {
          title,
          message,
          type: "MODAL"
        }
      });
      break;
    }
    default: {
      console.error("HTTP ERROR ", error.response);

      setUser({
        ...user,
        error: {
          title: DEFAULT_MESSAGE,
          message: "Please check the console for more information",
          type: "MODAL"
        }
      });
      break;
    }
    }
  };

  const clearErrorMessage = () => {
    setUser({...user, error: {title: "", message: "", type: ""}});
  };

  const setPageRoute = (route: string) => {
    updateUserPreferences(user.name, {pageRoute: route});
  };

  const setAlertMessage = (title: string, message: string) => {
    setUser({
      ...user,
      error: {
        title,
        message,
        type: "ALERT"
      }
    });
  };

  const resetSessionTime = () => {
    setSessionTime(user.maxSessionTime);
  };

  const getSessionTime = () => {
    return sessionCount.current;
  };

  useEffect(() => {
    if (sessionUser) {
      sessionAuthenticated(sessionUser);
      let loginResponse = JSON.parse(localStorage.getItem("loginResp") || "{}");
      if (JSON.stringify(loginResponse) !== JSON.stringify({})) {
        loginAuthenticated(sessionUser, loginResponse);
      }
    }
  }, []);

  useInterval(() => {
    if (user.authenticated && sessionTimer) {
      setSessionTime(getSessionTime() - 1);
    }
  }, 1000);

  return (
    <UserContext.Provider value={{
      user,
      loginAuthenticated,
      sessionAuthenticated,
      userNotAuthenticated,
      handleError,
      clearErrorMessage,
      setPageRoute,
      setAlertMessage,
      getSessionTime,
      resetSessionTime
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
