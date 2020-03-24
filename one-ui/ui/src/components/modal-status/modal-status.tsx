import React, { useState, useContext } from 'react';
import { Modal } from 'antd';
import axios from "axios";

import { UserContext } from '../../util/user-context';
import { useInterval } from '../../hooks/use-interval';
import { SESSION_WARNING_COUNTDOWN } from '../../config/application.config';

interface Props {
  visible: boolean;
};

const ModalStatus: React.FC<Props> = (props) => {
  const { 
    user,
    userNotAuthenticated,
    handleError,
    resetSessionTime,
    setSessionWarning
  } = useContext(UserContext);
  const [sessionTime, setSessionTime] = useState(SESSION_WARNING_COUNTDOWN);

  useInterval(() => {
    if (user.sessionWarning) {
      if (sessionTime === 0) {
        handleLogout();
      } else {
        setSessionTime(sessionTime - 1);
      }
    }
  }, 1000);

  const continueSession = async () => {
    // refresh session
    try {
      await axios('/api/info');
    } catch (error) {
      handleError(error);
    } finally {
      setSessionTime(SESSION_WARNING_COUNTDOWN);
      resetSessionTime();
      setSessionWarning(false);
    }
  };

  const handleLogout = async () => {
    try {
      let response = await axios(`/api/logout`);
      if (response.status === 200 ) {
        userNotAuthenticated();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setSessionTime(SESSION_WARNING_COUNTDOWN);
    }
  };

  return (
    <Modal
      visible={props.visible} 
      closable={false}
      title={"Session Timeout"} 
      cancelText="Log Out"
      onCancel={() => handleLogout()} 
      okText="Continue Session"
      onOk={() => continueSession()}
      maskClosable={false}
    >
      <p data-testid='inactivity'>Due to Inactivity, you will be logged out in <b>{sessionTime} seconds</b></p>
    </Modal>
  )
}

export default ModalStatus;


