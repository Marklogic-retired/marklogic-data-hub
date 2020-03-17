import React, { useContext, useEffect } from 'react';
import { Result } from 'antd';
import { withRouter } from 'react-router-dom';
import { UserContext } from '../util/user-context';
import { MlButton } from 'marklogic-ui-library';


const NoMatchRedirect = ({history}) => {

  const { user, clearErrorMessage } = useContext(UserContext);

  useEffect(() => {
    clearErrorMessage();
  }, []);

  const backToHomePage = () => {
    return user.authenticated ? history.push('/home') : history.push('/');
  }
  return (
      <Result
          status={404}
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={<MlButton type="primary" onClick={backToHomePage}>Back Home</MlButton>}
      />
  )
}

export default withRouter(NoMatchRedirect);