import React, {useState, useContext, useEffect} from "react";
import {RouteComponentProps, withRouter, useLocation, useHistory} from "react-router-dom";
import {Modal} from "react-bootstrap";
import axios from "axios";

import {UserContext} from "@util/user-context";
import {useInterval} from "../../hooks/use-interval";
import {MAX_SESSION_TIME, SESSION_WARNING_COUNTDOWN} from "@config/application.config";
import {getSystemInfo} from "@api/environment";
import {HCButton, HCModal} from "@components/common";

interface Props extends RouteComponentProps<any>{
}

const SESSION_BTN_TEXT = {
  ok: "Continue Session",
  cancel: "Log Out"
};

const ERROR_BTN_TEXT = {
  ok: "OK",
  cancel: "Cancel"
};

const ModalStatus: React.FC<Props> = (props) => {
  const {
    user,
    userNotAuthenticated,
    handleError,
    clearErrorMessage,
    getSessionTime,
  } = useContext(UserContext);
  const [showModal, toggleModal] = useState(false);
  const [sessionTime, setSessionTime] = useState(SESSION_WARNING_COUNTDOWN);
  const [title, setTitle] = useState("Session Timeout");
  const [buttonText, setButtonText] = useState(SESSION_BTN_TEXT);
  const [sessionWarning, setSessionWarning] = useState(false);
  const location = useLocation();
  const history = useHistory();
  let sessionCount = MAX_SESSION_TIME;

  useEffect(() => {
    if (user.error.type === "MODAL") {
      axios.get("/api/environment/systemInfo")
        .then(res => {
          setTitle(user.error.title);
          setButtonText(ERROR_BTN_TEXT);
          toggleModal(true);
        })
        .catch(err => {
          if (err.response) {
            handleError(err);
          } else {
            toggleModal(true); // For testing
            history.push("/noresponse");
          }
        });
    } else if (sessionWarning &&
               // Ignore session warning if in no-response state
               location.pathname !== "/noresponse") {
      setTitle("Session Timeout");
      setButtonText(SESSION_BTN_TEXT);
      toggleModal(true);
    } else {
      toggleModal(false);
    }
  }, [sessionWarning, user.error.type]);



  useInterval(async () => {
    if (user.authenticated) {
      sessionCount = getSessionTime();
      if (sessionCount <= SESSION_WARNING_COUNTDOWN && !sessionWarning) {
        setSessionWarning(true);
      } else if (sessionCount > SESSION_WARNING_COUNTDOWN && user.error.type !== "MODAL") {
        setSessionWarning(false);
        toggleModal(false);
      }
      if (sessionWarning) {
        if (sessionTime <= 0) {
          onCancel();
        } else {
          setSessionTime(getSessionTime());
        }
      }
    } else if (showModal && user.error.type !== "MODAL") {
      toggleModal(false);
    }
  }, 1000);

  const onOk = async () => {
    if (user.error.type === "MODAL") {
      clearErrorMessage();
    } else if (sessionWarning) {
      // refresh session
      try {
        await getSystemInfo();
      } catch (error) {
        if (error.response) {
          handleError(error);
        } else {
          history.push("/noresponse");
        }
      } finally {
        setSessionTime(SESSION_WARNING_COUNTDOWN);
        setSessionWarning(false);
        toggleModal(false);
      }
    }
  };

  const onCancel = async () => {
    if (user.error.type === "MODAL") {
      props.history.push("/error");

    } else if (sessionWarning) {
      try {
        let response = await axios.get(`/api/logout`);
        if (response.status === 200) {
          userNotAuthenticated();
        }
      } catch (error) {
        if (error.response) {
          handleError(error);
        } else {
          userNotAuthenticated();
        }
      } finally {
        setSessionTime(SESSION_WARNING_COUNTDOWN);
        setSessionWarning(false);
      }
    }
    toggleModal(false);
  };

  return (
    <HCModal
      show={showModal}
      style={{zIndex: "5000"}}
      onHide={onCancel}
    >
      <Modal.Header className={"pe-4"}>
        <span className={"fs-4"}>{title}</span>
        {sessionWarning ? null : <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button> }
      </Modal.Header>
      <Modal.Body className={"py-4"}>
        {sessionWarning && user.error.type !== "MODAL" && <p>Due to Inactivity, you will be logged out in <b>{sessionTime} seconds</b></p>}
        {user.error.type === "MODAL" && <p>{user.error.message}</p>}
      </Modal.Body>
      <Modal.Footer className={"d-flex justify-content-end py-2"}>
        <HCButton className={"me-2"} variant="outline-light" aria-label={buttonText.cancel} onClick={onCancel}>
          {buttonText.cancel}
        </HCButton>
        <HCButton aria-label={buttonText.ok} variant="primary" type="submit" onClick={onOk}>
          {buttonText.ok}
        </HCButton>
      </Modal.Footer>
    </HCModal>
  );
};

export default withRouter(ModalStatus);


