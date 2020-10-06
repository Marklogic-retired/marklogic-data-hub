import React from 'react';
import styles from './Login.module.scss';
import LoginForm from '../components/login-form/login-form';
const Login: React.FC = () => {

  return (
    <div>
      <div className={styles.content}>
        <div className={styles.loginContainer}>
          <LoginForm/>
        </div>
      </div>
    </div>
  );
};

export default Login;