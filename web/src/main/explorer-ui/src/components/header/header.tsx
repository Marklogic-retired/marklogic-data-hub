import React, { useContext } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Layout, Menu, Icon } from 'antd';
import styles from './header.module.scss';
import DatahubIcon from '../datahub-icon/datahub-icon';
import { AuthContext } from '../../util/auth-context';


interface Props extends RouteComponentProps<any> {}

const { SubMenu } = Menu;

const Header:React.FC<Props> = ({history}) => {
  const { user, userNotAuthenticated } = useContext(AuthContext);

  const handleLogout = () => {
    userNotAuthenticated();
    history.push('/');
  };

  const showMenu = user.authenticated && (
    <Menu 
      mode="horizontal"
      theme="dark"
      defaultSelectedKeys={['view']}
      style={{ lineHeight: '64px' }}
    >
      <Menu.Item key="view">
        View Entities
        <Link to="/view"/>
      </Menu.Item>
      <Menu.Item key="browse">
        Browse Entities
        <Link to="/browse"/>
      </Menu.Item>
      <SubMenu className = {styles.user}  title={<span><Icon style={{fontSize: '18px'}} type="user" /><span>{user.name}</span></span>}>
        <Menu.Item onClick={handleLogout}>Sign Out</Menu.Item>
      </SubMenu>
    </Menu>
  )
    return (
    <Layout.Header>
      <div className={styles.iconContain}>
        <div className={styles.icon}>
          <DatahubIcon size={65} fill='silver' view='0 0 100 100'/>
        </div>
      </div>
      <div className={styles.title}>Data Hub Explorer</div>
      {showMenu}
       <div className={styles.helpContain}>
        <Icon className={styles.help} type="question-circle"/>
      </div> 
    </Layout.Header>
    )
}

export default withRouter(Header);