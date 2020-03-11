import React, { useContext, useState } from 'react';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import axios from 'axios';
import { Layout, Icon, Avatar, Menu, Tooltip, Dropdown } from 'antd';
import ProjectName from './project-name';
import { UserContext } from '../../util/user-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRoute } from '@fortawesome/free-solid-svg-icons'
import logo from './logo.png';
import styles from './header.module.scss';
import Application from '../../config/application.config';
import { MlButton } from 'marklogic-ui-library';

const { SubMenu } = Menu;

interface Props extends RouteComponentProps<any> {}

const Header:React.FC<Props> = ({ history, location }) => {
  const { user, userNotAuthenticated, handleError } = useContext(UserContext);

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
          <span className="userDropdown">
            <Tooltip title="User"><Icon type="user"/></Tooltip>
          </span>
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

  const showProjectName = (
    user.authenticated && 
    localStorage.getItem('dhIsInstalled')==='true' && 
    localStorage.getItem('projectName') != ''
  );
  const projectName = localStorage.getItem('projectName');

  const handleHomeClick = () => {
    if (localStorage.getItem('dhIsInstalled') === 'false' && 
    localStorage.getItem('dhUserHasManagePrivileges') === 'true') {
      history.push('/install');
    } else {
      history.push('/home');
    }
  };

  return (
    <>
      <Layout.Header className={styles.container}>
        <div className={styles.logoContainer} onClick={handleHomeClick}>
          <Avatar size={48} className={styles.logo} src={logo} />
        </div>
        <div id="title" className={styles.title} onClick={handleHomeClick}>
          {Application.title}
        </div>
        {globalIcons}
      </Layout.Header>
      {showProjectName &&(<ProjectName name={projectName}/>)}
    </>
  )
}

export default withRouter(Header);
