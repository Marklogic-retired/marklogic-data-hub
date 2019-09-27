import React, { useContext, useState, useEffect } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import axios from 'axios';
import { Layout, Menu, Icon } from 'antd';
import styles from './header.module.scss';
import DatahubIcon from '../datahub-icon/datahub-icon';
import { AuthContext } from '../../util/auth-context';


interface Props extends RouteComponentProps<any> {}

const { SubMenu } = Menu;

const Header:React.FC<Props> = ({ location }) => {
  const { user, userNotAuthenticated } = useContext(AuthContext);
  const [selectedMenu, setSelectedMenu] = useState<string[]>([]);
  
  const handleLogout = async () => {
    try {
      let response = await axios(`/datahub/v2/logout`);
      console.log('response', response);
      userNotAuthenticated();
    } catch (error) {
      // console.log(error.response);
    }
  };

  useEffect(() => {
    let path = location.pathname.split('/');
    if (path[1] === 'detail'){
      setSelectedMenu(['/browse']);
    } else {
      setSelectedMenu([location.pathname]);
    }
  }, [location.pathname]);

  const showMenu = user.authenticated && (
    <Menu
      id="menu-links" 
      mode="horizontal"
      theme="dark"
      selectedKeys={selectedMenu}
      style={{ lineHeight: '64px' }}
    >
      <Menu.Item key="/view">
        View Entities
        <Link to="/view"/>
      </Menu.Item>
      <Menu.Item key="/browse">
        Browse Documents
        <Link to="/browse"/>
      </Menu.Item>
      <SubMenu className={styles.user} title={<span><Icon style={{fontSize: '18px'}} type="user" /><span id="username">{user.name}</span></span>}>
        <Menu.Item id="sign-out" onClick={handleLogout}>Sign Out</Menu.Item>
      </SubMenu>
    </Menu>
  )
  return (
    <Layout.Header>
      <div className={styles.iconContain}>
        <div id="logo" className={styles.icon}>
          <DatahubIcon size={65} fill='silver' view='0 0 100 100'/>
        </div>
      </div>
      <div id="title" className={styles.title}>Data Hub Explorer</div>
      {showMenu}
      <a id="help-icon" className={styles.helpContain} target="_blank" rel="noopener noreferrer" href="https://www.marklogic.com/">
        <Icon className={styles.help} type="question-circle"/>
      </a>
    </Layout.Header>
  )
}

export default withRouter(Header);