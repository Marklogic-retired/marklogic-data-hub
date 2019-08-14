import React, { useContext, useState } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Form, Icon, Input, Button } from 'antd';
import styles from './login-form.module.scss';
import { AuthContext } from '../../util/auth-context';
import useForm from '../../hooks/use-form';

interface Props extends RouteComponentProps<any> {}

const LoginForm: React.FC<Props> = ({ history }) => {

  const { userAuthenticated } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isUsernameTouched, setUsernameTouched] = useState(false);
  const [isPasswordTouched, setPasswordTouched] = useState(false);

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    console.log('submitted values', username);
    if (username === 'admin' && password === 'admin') {
      userAuthenticated(username);
      history.push('/view');
    } 
  }

  const handleChange = (event) => {
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
  }

  return (
    <Form onSubmit={handleSubmit} className={styles.login}>
      <Form.Item 
        hasFeedback 
        validateStatus={(username || !isUsernameTouched) ? '' : 'error'}
        help={(username || !isUsernameTouched) ? '' : 'Please input your username!'}>
        <Input
          id="username"
          prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="Username"
          value={username}
          onChange={handleChange}
        />
      </Form.Item>
      <Form.Item 
        hasFeedback 
        validateStatus={(password || !isPasswordTouched) ? '' : 'error'}
        help={(password || !isPasswordTouched) ? '' : 'Please input your password!'}>
        <Input
          id="password"
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="Password"
          type="password"
          value={password}
          onChange={handleChange}
        />
      </Form.Item>
      <Form.Item>
        <a className={styles.forgot} href="">
          Forgot password?
        </a>
        <Button type="primary" htmlType="submit" className={styles.loginButton}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

export default withRouter(LoginForm);