import React, {useContext, useState} from "react";
import {Form, Icon, Input, Alert, Button} from "antd";
import axios from "axios";
import styles from "./login-form.module.scss";
import {UserContext} from "../../util/user-context";
import Spinner from "react-bootstrap/Spinner";

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
        <Alert message={message.text} type="error" showIcon />
      </div>

      <div className={styles.loginForm}>
        <Form onSubmit={handleSubmit} className={styles.loginForm}>

          <Form.Item
            className={styles.username}
            hasFeedback
            validateStatus={(username || !isUsernameTouched) ? "" : "error"}
            help={(username || !isUsernameTouched) ? "" : "Username is required"}
          >
            <Input
              id="username"
              prefix={<Icon type="user" className={styles.usernameIcon} />}
              placeholder="Enter username"
              value={username}
              onChange={handleChange}
              onBlur={handleChange}
            />
          </Form.Item>
          <Form.Item
            className={styles.password}
            hasFeedback
            validateStatus={(password || !isPasswordTouched) ? "" : "error"}
            help={(password || !isPasswordTouched) ? "" : "Password is required"}
          >
            <Input
              id="password"
              prefix={<Icon type="lock" className={styles.passwordIcon} />}
              placeholder="Enter password"
              type="password"
              value={password}
              onChange={handleChange}
              onBlur={handleChange}
            />
          </Form.Item>
          { /* <div className={styles.help}>
            <span className={styles.remember}>
              <Checkbox className={styles.rememberCheck}>Remember me</Checkbox>
            </span>
            <a className={styles.forgot} href="" data-cy="forgot">
              Forgot password?
            </a>
          </div> */ }
          <Form.Item className={styles.loginButton}>
            <Button
              id="submit"
              type="primary"
              size="default"
              htmlType="submit"
            >
              Log In
            </Button>
          </Form.Item>
        </Form>
        {isLoading && <div className={styles.loginSpinner}><Spinner animation="border" variant="primary" /></div>}
      </div>
    </>
  );
};

export default LoginForm;
