import React, { useContext, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import axios from 'axios';
import { Layout, Icon, Avatar, Menu, Tooltip, Dropdown } from 'antd';
import { UserContext } from '../../util/user-context';
import logo from './logo.jpg';
import styles from './header.module.scss';
import { Application } from '../../config/application.config';
import { MLButton, MLTooltip } from '@marklogic/design-system';
import SystemInfo from './system-info';

interface Props extends RouteComponentProps<any> {
  environment: any
}

const Header:React.FC<Props> = (props) => {
  const { user, userNotAuthenticated, handleError } = useContext(UserContext);
  const [systemInfoVisible, setSystemInfoVisible] = useState(false);

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

  const handleSystemInfoDisplay = () => {
    setSystemInfoVisible(true);
  }

  let userMenu = <div className={styles.userMenu}>
    <div className={styles.username}>{localStorage.getItem('dataHubUser')}</div>
    <div className={styles.logout}>
      <MLButton id="logOut" type="primary" size="default" onClick={handleLogout}>
        Log Out
      </MLButton>
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
            <i id="service-name" className={styles.serviceName} onClick={handleSystemInfoDisplay}>{props.environment.serviceName}</i>
        </Menu.Item>
        <div className={styles.vertical}></div>
        {/* <Menu.Item>
          <MLTooltip title="Search"><Icon type="search"/></MLTooltip>
        </Menu.Item> */}
        <Menu.Item>
          <MLTooltip title="Help"><Icon type="question-circle"/></MLTooltip>
        </Menu.Item>
        {/* <Menu.Item>
          <MLTooltip title="Settings"><Icon type="setting"/></MLTooltip>
        </Menu.Item> */}
        <Dropdown overlay={userMenu}>
          <span className="userDropdown">
            <MLTooltip title="User"><Icon type="user"/></MLTooltip>
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
          <MLTooltip title="Help"><Icon type="question-circle"/></MLTooltip>
        </Menu.Item>
      </Menu>
    </div>
  }

  const handleHomeClick = () => {
      props.history.push('/tiles');
  };

  return (
    <>
      <Layout.Header className={styles.container}>
        <div className={styles.logoContainer} aria-label="header-logo" onClick={handleHomeClick}>
          <Avatar className={styles.logo} src={logo} />
          <div className={styles.vertical}></div>
        </div>
        <div id="title" className={styles.title} aria-label="header-title" onClick={handleHomeClick}>
          {Application.title}
        </div>
        {globalIcons}
      </Layout.Header>
       <SystemInfo
          serviceName={props.environment.serviceName}
          dataHubVersion={props.environment.dataHubVersion}
          marklogicVersion={props.environment.marklogicVersion}
          systemInfoVisible={systemInfoVisible}
          setSystemInfoVisible={setSystemInfoVisible}
       />
    </>
  )
}

export default withRouter(Header);
