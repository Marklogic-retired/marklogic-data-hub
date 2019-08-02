import React from 'react';
import { Form, Icon, Input, Button } from 'antd';
import styles from './login-form.module.scss';
type Props = {
 checkLogin: any;
}
type State = {
 username: string;
 password: string;
};
class LoginForm extends React.Component<Props, State> {
 readonly state: State = {
   username: '',
   password: ''
 };
 handleSubmit = (event: any) => {
   const { username, password } = this.state;
   event.preventDefault();
   this.props.checkLogin(username, password);
 };
 handleChange = (event: any)=> {
   const key = event.target.id;
   this.setState({[key]: event.target.value} as Pick<State, keyof State>);
 }
 render() {
   // TODO Add validate status functionality
   return (
     <Form onSubmit={this.handleSubmit} className={styles.login}>
       <Form.Item hasFeedback validateStatus="">
         <Input
           id="username"
           prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
           placeholder="UserName"
           value={this.state.username}
           onChange={this.handleChange}
         />
       </Form.Item>
       <Form.Item hasFeedback validateStatus="">
         <Input
           id="password"
           prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
           placeholder="Password"
           type="password"
           value={this.state.password}
           onChange={this.handleChange}
         />
       </Form.Item>
       <Form.Item>
         <Button type="primary" htmlType="submit" className={styles.loginButton}>
           Log in
         </Button>
       </Form.Item>
     </Form>
   );
 }
}
export default LoginForm