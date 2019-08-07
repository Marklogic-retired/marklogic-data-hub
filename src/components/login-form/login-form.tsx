import React, { useContext } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Form, Icon, Input, Button } from 'antd';
import styles from './login-form.module.scss';
import { AuthContext } from '../../util/auth-context';
import useForm from '../../hooks/use-form';


interface Props extends RouteComponentProps<any> {}

const LoginForm: React.FC<Props> = ({ history }) => {
  const defaultFormInputs = {
    username: '',
    password: ''
  }
  const { userAuthenticated } = useContext(AuthContext);

  const submitForm = () => {
    console.log('submitted values', values);
    if (values.username === 'admin' && values.password === 'admin') {
      userAuthenticated(values.username);
      history.push('/view');
    }
  }
 const { values, handleChange, handleSubmit } = useForm(defaultFormInputs, submitForm);   // TODO Add validate status functionality
   return (
      <Form onSubmit={handleSubmit} className={styles.login}>
        <Form.Item hasFeedback validateStatus="">
          <Input
            id="username"
            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Username"
            value={values.username}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item hasFeedback validateStatus="">
          <Input
            id="password"
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Password"
            type="password"
            value={values.password}
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