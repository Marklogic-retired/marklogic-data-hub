import React, { useContext, useEffect, useState } from 'react';
import { Result } from 'antd';
import { withRouter } from 'react-router-dom';
import { UserContext } from '../util/user-context';
import { useInterval } from '../hooks/use-interval';
import { MLButton } from '@marklogic/design-system';


const NoMatchRedirect = ({history}) => {

  const { user, clearErrorMessage, userNotAuthenticated } = useContext(UserContext);
  let sessionCount = 0;

  useEffect(() => {
    clearErrorMessage();
  }, []);

  const backToHomePage = () => {
    return user.authenticated ? history.push('/view') : history.push('/');
  }

  useInterval(() => {
    if (sessionCount === user.maxSessionTime) {
      userNotAuthenticated();
    } else {
      sessionCount += 1;
    }
  }, 1000);

  return (
      <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={<MLButton type="primary" onClick={backToHomePage}>Back Home</MLButton>}
      />
  )
}

export default withRouter(NoMatchRedirect);
