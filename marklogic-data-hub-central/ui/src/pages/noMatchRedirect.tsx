import React, {useContext, useEffect} from "react";
import {Result} from "antd";
import {withRouter} from "react-router-dom";
import {UserContext} from "../util/user-context";
import HCButton from "../components/common/hc-button/hc-button";


const NoMatchRedirect = ({history}) => {

  const {user, clearErrorMessage} = useContext(UserContext);

  useEffect(() => {
    clearErrorMessage();
  }, []);

  const backToHomePage = () => {
    return user.authenticated ? history.push("/tiles") : history.push("/");
  };
  return (
    <Result
      status={404}
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={<HCButton variant="primary" aria-label="back home" onClick={backToHomePage}>Back Home</HCButton>}
    />
  );
};

export default withRouter(NoMatchRedirect);
