import React from 'react';
import LoginForm from '../components/login-form/login-form';

type Props = { checkLogin: any};
const Home: React.FC<Props> = props => {
  return (
    <>
    <LoginForm checkLogin={props.checkLogin}/>    
    </>
  );
}

export default Home;