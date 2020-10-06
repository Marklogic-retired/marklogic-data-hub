import React, { useContext, useState } from 'react';
import { RouteComponentProps, withRouter, useHistory } from 'react-router-dom';
import axios from 'axios';
import { Layout, Icon, Avatar, Menu, Dropdown } from 'antd';
import { UserContext } from '../../util/user-context';
import { ModelingContext} from '../../util/modeling-context';
import logo from './logo.svg';
import styles from './header.module.scss';
import { Application } from '../../config/application.config';
import { MLButton, MLTooltip } from '@marklogic/design-system';
import SystemInfo from './system-info';
import ConfirmationModal from '../confirmation-modal/confirmation-modal';
import { ConfirmationType } from '../../types/common-types';

interface Props extends RouteComponentProps<any> {
  environment: any
}

const Header:React.FC<Props> = (props) => {
  const { user, userNotAuthenticated, handleError } = useContext(UserContext);
  const { modelingOptions, clearEntityModified } = useContext(ModelingContext);

  const [systemInfoVisible, setSystemInfoVisible] = useState(false);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const history = useHistory();

  const handleLogout = () => {
    if (modelingOptions.isModified) {
      toggleConfirmModal(true);
    } else {
      confirmLogout();
    }
  };

  const confirmLogout = async () => {
    try {
      let response = await axios(`/api/logout`);
      if (response.status === 200 ) {
        userNotAuthenticated();
      }
    } catch (error) {
      handleError(error);
    }
    clearEntityModified();
    toggleConfirmModal(false);
  };

  const handleSystemInfoDisplay = () => {
    axios.get('/api/environment/systemInfo')
        .then(res => {
          setSystemInfoVisible(true);
        })
        // Timeouts throw 401s and are caught here
        .catch(err => {
            if (err.response) {
              handleError(err);
            } else {
              history.push('/noresponse');
            }
        });
  };

  const getVersionLink = () => {
    let versionNum = parseVersion(props.environment.dataHubVersion);
    return 'https://docs.marklogic.com/datahub/' + versionNum;
  };

  const parseVersion = (value) => {
    if(value == ''){
      return '';
    }else{
      let version = '';
      let flag = false;
      for(let c in value){
        if(value[c] != '.' && value[c] != '-'){
          version += value[c];
        }else if(value[c] == '.' && flag == false){
          flag = true;
          version += value[c];
        }else{
          break;
        }
      }
      return version;
    }
  };

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
          <MLTooltip title="Help"><a id="help-link" href= {getVersionLink()} target="_blank"><Icon type="question-circle"/></a></MLTooltip>
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
          <MLTooltip title="Help"><a id="help-link" href='https://docs.marklogic.com/datahub/' target="_blank"><Icon type="question-circle"/></a></MLTooltip>
        </Menu.Item>
      </Menu>
    </div>;
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
      <ConfirmationModal
          isVisible={showConfirmModal}
          type={ConfirmationType.NavigationWarn}
          boldTextArray={[]}
          toggleModal={toggleConfirmModal}
          confirmAction={confirmLogout}
      />
    </>
  );
};

export default withRouter(Header);
