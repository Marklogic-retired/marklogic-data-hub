import React, { useContext, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../util/auth-context';

const ResetEnv:React.FC = () => {
  const { userNotAuthenticated, handleError } = useContext(AuthContext);

  useEffect(() => {
    axios.post(`/api/environment/reset`, {})
      .then(res => {
          console.log('env reset, logging out');
          userNotAuthenticated();
      })
      .catch(err => {
        handleError(err);
      })
  });

  return <div/>
}

export default withRouter(ResetEnv);