import React, { useContext, useState } from 'react';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import axios from 'axios';
import { Layout, Icon, Avatar, Menu, Tooltip, Dropdown } from 'antd';
import { UserContext } from '../../util/user-context';
import logo from './logo.jpg';
import styles from './header.module.scss';
import { Application } from '../../config/application.config';
import { MLButton } from '@marklogic/design-system';
import ProjectPage from '../project-page/project-page';

interface Props extends RouteComponentProps<any> {}

const Header:React.FC<Props> = ({ history, location }) => {
  const { user, userNotAuthenticated, handleError } = useContext(UserContext);
  const [projectPageVisible, setProjectPageVisible] = useState(false);

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

  const handleProjectPageDisplay = () => {
      setProjectPageVisible(true);
  }

  let userMenu = <div className={styles.userMenu}>
    <div className={styles.username}>{localStorage.getItem('dataHubUser')}</div>
    <div className={styles.logout}>
      <MLButton id="logOut" type="primary" size="default" onClick={handleLogout}>
        Log Out
      </MLButton>
    </div>
  </div>;

    const projectName = localStorage.getItem('projectName');

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
            <i id="project-name" className={styles.projectInfo} onClick={handleProjectPageDisplay}>{projectName}</i>
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

  const handleHomeClick = () => {
      history.push('/tiles');
  };

  return (
    <>
      <Layout.Header className={styles.container}>
        <div className={styles.logoContainer} onClick={handleHomeClick}>
          <Avatar className={styles.logo} src={logo} aria-label="header-avatar" />
            <div className={styles.vertical}></div>
        </div>
        <div id="title" className={styles.title} aria-label="header-title" onClick={handleHomeClick}>
          {Application.title}
        </div>
        {globalIcons}
      </Layout.Header>
       <ProjectPage
           projectPageVisible={projectPageVisible}
           setProjectPageVisible={setProjectPageVisible}
       />
    </>
  )
}

export default withRouter(Header);
