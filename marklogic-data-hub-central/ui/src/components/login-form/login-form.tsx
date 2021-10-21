import React, {useContext, useState} from "react";
import {Row, Col, Form} from "react-bootstrap";
import axios from "axios";
import styles from "./login-form.module.scss";
import {UserContext} from "../../util/user-context";
import {Spinner} from "react-bootstrap";
import {Lock, Person} from "react-bootstrap-icons";
import {HCAlert, HCButton, HCInput} from "../common";

const LoginForm: React.FC = () => {

  const {loginAuthenticated} = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameTouched, setUsernameTouched] = useState(false);
  const [isPasswordTouched, setPasswordTouched] = useState(false);
  const [message, setMessage] = useState({show: false, text: ""});


  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();
    try {
      setIsLoading(true);
      let response = await axios.post("/api/login", {
        username,
        password
      });
      if (response.status === 200) {
        setMessage({show: false, text: ""});
        setIsLoading(false);
        localStorage.setItem("loginResp", JSON.stringify(response.data));
        loginAuthenticated(username, response.data);
      }
    } catch (error) {
      let message = "Internal Server Error"; // Default on error
      if (error.response.status === 401) {
        message = "The username and password combination is not recognized by MarkLogic.";
      } else if (error.response.status === 403) {
        message = "User does not have the required permissions to run Data Hub.";
      }
      setIsLoading(false);
      setMessage({show: true, text: message});
    }
  };

  const handleChange = (event: { target: { id: string; value: React.SetStateAction<string>; }; }) => {
    //if empty, set validator. otherwise, set username
    if (event.target.id === "username") {
      if (event.target.value === " ") {
        setUsernameTouched(false);
      } else {
        setUsernameTouched(true);
        setUsername(event.target.value);
      }
    }

    //if empty, set validator. otherwise, set password
    if (event.target.id === "password") {
      if (event.target.value === " ") {
        setPasswordTouched(false);
      } else {
        setPasswordTouched(true);
        setPassword(event.target.value);
      }
    }
  };

  return (
    <>
      <div className={styles.unauthorized} style={message.show ? {display: "block"} : {display: "none"}}>
        <HCAlert variant="danger" showIcon >{message.text}</HCAlert>
      </div>

      <div className={styles.loginForm}>
        <Form onSubmit={handleSubmit} className={`container-fluid ${styles.loginForm}`}>
          <Row className={"mb-2"}>
            <Col>
              <HCInput
                id="username"
                prefix={<Person className={styles.usernameIcon} />}
                placeholder="Enter username"
                classNameFull={"bg-white"}
                value={username}
                onChange={handleChange}
                onBlur={handleChange}
                error={(username || !isUsernameTouched) ? false : true}
              />
            </Col>
            <Col lg={12} className={`d-block text-start ${styles.validationError}`}>
              {(username || !isUsernameTouched) ? "" : "Username is required"}
            </Col>
          </Row>
          <Row className={"mb-2"}>
            <Col>
              <HCInput
                id="password"
                prefix={<Lock className={styles.passwordIcon} />}
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={handleChange}
                onBlur={handleChange}
                error={(password || !isPasswordTouched) ? false : true}
              />
            </Col>
            <Col lg={12} className={`d-block text-start ${styles.validationError}`}>
              {(password || !isPasswordTouched) ? "" : "Password is required"}
            </Col>
          </Row>
          { /* <div className={styles.help}>
            <span className={styles.remember}>
              <Checkbox className={styles.rememberCheck}>Remember me</Checkbox>
            </span>
            <a className={styles.forgot} href="" data-cy="forgot">
              Forgot password?
            </a>
          </div> */ }
          <Row>
            <Col className={`d-flex ${styles.loginButton}`}>
              <HCButton
                id="submit"
                variant="primary"
                type="submit"
              >
                Log In
              </HCButton>
            </Col>
          </Row>
        </Form>
        {isLoading && <div className={styles.loginSpinner}><Spinner animation="border" variant="primary" /></div>}
      </div>
    </>
  );
};

export default LoginForm;
