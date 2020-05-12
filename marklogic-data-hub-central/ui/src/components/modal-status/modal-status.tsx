import React, { useState, useContext, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import axios from "axios";

import { UserContext } from '../../util/user-context';
import { useInterval } from '../../hooks/use-interval';
import { SESSION_WARNING_COUNTDOWN } from '../../config/application.config';

interface Props extends RouteComponentProps<any>{
};

const SESSION_BTN_TEXT = {
  ok: 'Continue Session',
  cancel: 'Log Out'
}

const ERROR_BTN_TEXT = {
  ok: 'OK',
  cancel: 'Cancel'
}

const ModalStatus: React.FC<Props> = (props) => {
  const {
    user,
    userNotAuthenticated,
    handleError,
    clearErrorMessage,
    resetSessionTime,
    getSessionTime
  } = useContext(UserContext);
  const [showModal, toggleModal] = useState(false);
  const [sessionTime, setSessionTime] = useState(SESSION_WARNING_COUNTDOWN);
  const [title, setTitle] = useState('Session Timeout');
  const [buttonText, setButtonText] = useState(SESSION_BTN_TEXT);
  const [sessionWarning, setSessionWarning] = useState(false);
  let sessionCount;

  useEffect(() => {
    if (user.error.type === 'MODAL') {
        setTitle(user.error.title);
        setButtonText(ERROR_BTN_TEXT);
        toggleModal(true);
    } else if (sessionWarning) {
        setTitle('Session Timeout');
        setButtonText(SESSION_BTN_TEXT);
        toggleModal(true);

    } else {
        toggleModal(false);
    }
  }, [sessionWarning, user.error.type]);



  useInterval(() => {
    sessionCount = getSessionTime();
    if(sessionCount <= SESSION_WARNING_COUNTDOWN && !sessionWarning){
        setSessionWarning(true);
    }
    if(sessionWarning) {
        if (sessionTime === 0) {
            onCancel();
        } else {
            setSessionTime(sessionTime - 1);
        }
    }
  }, 1000);

  const onOk = async () => {
    if (user.error.type === 'MODAL') {
      clearErrorMessage();

    } else if (sessionWarning) {
      // refresh session
      try {
        await axios.get('/api/info');
      } catch (error) {
        handleError(error);
      } finally {
        resetSessionTime();
        setSessionTime(SESSION_WARNING_COUNTDOWN);
        setSessionWarning(false);
        toggleModal(false);
      }
    }
  };

  const onCancel = async () => {
    if (user.error.type === 'MODAL') {
      props.history.push('/error');

    } else if (sessionWarning) {
      try {
        let response = await axios.get(`/api/logout`);
        if (response.status === 200 ) {
          userNotAuthenticated();
        }
      } catch (error) {
        handleError(error);
      } finally {
        setSessionTime(SESSION_WARNING_COUNTDOWN);
        setSessionWarning(false);
      }
    }
    toggleModal(false);
  };

  return (
    <Modal
      visible={showModal}
      closable={sessionWarning ? false : true }
      zIndex={5000}
      title={title}
      cancelText={buttonText.cancel}
      onCancel={() => onCancel()}
      okText={buttonText.ok}
      onOk={() => onOk()}
      maskClosable={sessionWarning ? false : true }
    >
      {sessionWarning && user.error.type !== 'MODAL' && <p>Due to Inactivity, you will be logged out in <b>{sessionTime} seconds</b></p>}
      {user.error.type === 'MODAL' && <p>{user.error.message}</p>}
    </Modal>
  )
}

export default withRouter(ModalStatus);


