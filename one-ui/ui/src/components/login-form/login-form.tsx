import React, { useContext, useState, useEffect } from 'react';
import { Form, Icon, Input, Button, Typography, Checkbox } from 'antd';
import axios from 'axios';
import styles from './login-form.module.scss';
import { AuthContext } from '../../util/auth-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import { MlButton } from 'marklogic-ui-library';

const { Text } = Typography;

const LoginForm: React.FC = () => {

  const { loginAuthenticated } = useContext(AuthContext);
  const [isHostSet, setHostSet] = useState(true);
  const [host, setHost] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorResponse, setErrorResponse] = useState('');
  const [isHostTouched, setHostTouched] = useState(false);
  const [isUsernameTouched, setUsernameTouched] = useState(false);
  const [isPasswordTouched, setPasswordTouched] = useState(false);

  useEffect(() => {
    axios.get('/api/environment/initialized')
      .then(res => {
          setHostSet(res.data.isInitialized);
      })
      .catch(err => {
          console.log(err);
      })
  }, []);
  
  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();
    try {
      setIsLoading(true);
      let response = await axios.post('/api/login', {
        mlHost: host,
        username,
        password
      });
      if (response.status === 200) {
        setErrorResponse('');
        setIsLoading(false);
        console.log(response);
        loginAuthenticated(username, response.data);
      } 
    } catch (error) {
      let message = error.response.data.message === 'Unauthorized' ? 
        'Username/password combination not recognized' : 
        'Internal Server Error';
      console.log('LOGIN ERROR', error.response);
      setIsLoading(false);
      setErrorResponse(message);
    }
  }

  const handleChange = (event: { target: { id: string; value: React.SetStateAction<string>; }; }) => {
    //if empty, set validator. otherwise, set username
    if (event.target.id === 'username') {
      if (event.target.value === ' ') {
        setUsernameTouched(false);
      }
      else {
        setUsernameTouched(true);
        setUsername(event.target.value);
      }
    }

    //if empty, set validator. otherwise, set password
    if (event.target.id === 'password') {
      if (event.target.value === ' ') {
        setPasswordTouched(false);
      }
      else {
        setPasswordTouched(true);
        setPassword(event.target.value);
      }
    }

    //if empty, set validator. otherwise, set host
    if (event.target.id === 'host') {
      if (event.target.value === ' ') {
        setHostTouched(false);
      }
      else {
        setHostTouched(true);
        setHost(event.target.value);
      }
    }
  }

  // Form field for host name input
  let hostField;
  if (!isHostSet) {
    hostField = 
    <>
      <label className={styles.formLabel}>MarkLogic Host Name:</label>
      <Form.Item 
        className={styles.host}
        hasFeedback 
        validateStatus={(host || !isHostTouched) ? '' : 'error'}
        help={(host || !isHostTouched) ? '' : 'Host name is required'}
      >
        <Input
          id="host"
          prefix={<Icon type="cloud-server" className={styles.hostIcon} />}
          placeholder="Enter host name"
          value={host}
          onChange={handleChange}
        />
      </Form.Item>
      <label className={styles.formLabel}>
        MarkLogic Credentials:
        <i className={styles.questionIcon}><FontAwesomeIcon icon={faQuestionCircle} /></i>
      </label>
    </>;
  }

  return (
    <Form onSubmit={handleSubmit} className={styles.loginForm} data-cy='login'>

      {hostField}

      <Form.Item 
        className={styles.username}
        hasFeedback 
        validateStatus={(username || !isUsernameTouched) ? '' : 'error'}
        help={(username || !isUsernameTouched) ? '' : 'Username is required'}
      >
        <Input
          id="username"
          prefix={<Icon type="user" className={styles.usernameIcon} />}
          placeholder="Enter username"
          value={username}
          onChange={handleChange}
        />
      </Form.Item>
      <Form.Item 
        className={styles.password}
        hasFeedback 
        validateStatus={(password || !isPasswordTouched) ? '' : 'error'}
        help={(password || !isPasswordTouched) ? '' : 'Password is required'}
      >
        <Input
          id="password"
          prefix={<Icon type="lock" className={styles.passwordIcon} />}
          placeholder="Enter password"
          type="password"
          value={password}
          onChange={handleChange}
        />
      </Form.Item>
        <div className={styles.help}>
          <span className={styles.remember}>
            <Checkbox className={styles.rememberCheck}>Remember me</Checkbox>
          </span>
          <a className={styles.forgot} href="" data-cy="forgot">
            Forgot password?
          </a>
        </div>
        <Form.Item className={styles.loginButton}>
          <MlButton id="submit" type="primary" size="default" disabled={isLoading} htmlType="submit">
            Log In
          </MlButton>
          <div className={styles.unauthorized}>
            <Text type="danger" data-cy="invalid-credentials">{errorResponse}</Text>
          </div>
      </Form.Item>
    </Form>
  );
}

export default LoginForm;