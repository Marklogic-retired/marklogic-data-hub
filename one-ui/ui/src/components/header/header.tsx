import React, { useContext } from 'react';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import axios from 'axios';
import { Layout, Icon, Avatar, Menu, Tooltip, Dropdown } from 'antd';
import { AuthContext } from '../../util/auth-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRoute } from '@fortawesome/free-solid-svg-icons'
import logo from './logo.png';
import styles from './header.module.scss';
import { MlButton } from 'marklogic-ui-library';

const { SubMenu } = Menu;

interface Props extends RouteComponentProps<any> {}

const Header:React.FC<Props> = ({ location }) => {
  const { user, userNotAuthenticated, handleError } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      console.log('logging out');
      let response = await axios(`/api/logout`);
      if (response.status === 200 ) {
        userNotAuthenticated();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleReset = async () => {
    try {
      console.log('resetting env and logging out');
      let response = await axios.post(`/api/environment/reset`, {});
      if (response.status === 200 ) {
        userNotAuthenticated();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleOpenChange = (keys) => {
    console.log('handleOpenChange', keys);
  };

  let userMenu = <div className={styles.userMenu}>
    <div className={styles.username}>{localStorage.getItem('dataHubUser')}</div>
    <div className={styles.logout}>
      <MlButton id="logOut" type="primary" size="default" onClick={handleLogout}>
        Log Out
      </MlButton>
    </div>
  </div>;

  let globalIcons;
  if (user.authenticated) {
    globalIcons = 
    <div className={styles.iconsContainerAuth}>
      <Menu 
        id="global-icons"
        className={styles.globalIcons}
        mode="horizontal"
        theme="dark"
        onOpenChange={handleOpenChange}
      >
        <Menu.Item>
          <Tooltip title="Tour"><i className="tour"><FontAwesomeIcon icon={faRoute} /></i></Tooltip>
        </Menu.Item>
        <div className={styles.vertical}></div> 
        <Menu.Item>
          <Tooltip title="Search"><Icon type="search"/></Tooltip>
        </Menu.Item>
        <Menu.Item>
          <Tooltip title="Help"><Icon type="question-circle"/></Tooltip>
        </Menu.Item>
        <Menu.Item>
          <Tooltip title="Settings"><Icon type="setting"/></Tooltip>
        </Menu.Item>
        <Dropdown overlay={userMenu}>
          <span className="userDropdown"><Icon type="user"/></span>
        </Dropdown>
      </Menu>
    </div>;
  } else {
    globalIcons = 
    <div className={styles.iconsContainer}>
      <Menu 
        id="global-icons"
        className={styles.globalIcons}
        mode="horizontal"
        theme="dark"
      >
        <Menu.Item>
          <Tooltip title="Help"><Icon type="question-circle"/></Tooltip>
        </Menu.Item>
      </Menu>
    </div>
  }

  return (
    <Layout.Header className={styles.container}>
      <div className={styles.logoContainer}>
        <Link to="/home">
          <Avatar size={48} className={styles.logo} src={logo} />
        </Link>
      </div>
      <div id="title" className={styles.title}>
        MarkLogic Data Hub
      </div>
      {globalIcons}
    </Layout.Header>

  )
}

export default withRouter(Header);