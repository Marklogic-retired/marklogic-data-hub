import React, { useContext, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../util/user-context';

const ResetEnv:React.FC = () => {
  const { userNotAuthenticated, handleError, resetSessionTime } = useContext(UserContext);

  useEffect(() => {
    axios.post(`/api/environment/reset`, {})
      .then(res => {
          console.log('env reset, logging out');
          userNotAuthenticated();
      })
      .catch(err => {
        handleError(err);
      })
      .finally(() => {
        resetSessionTime();
      })
  });

  return <div/>
}

export default withRouter(ResetEnv);