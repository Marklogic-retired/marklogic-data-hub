import React, { useContext, useState, useEffect } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import axios from 'axios';
import { Layout, Menu, Icon } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRoute } from '@fortawesome/free-solid-svg-icons'
import Tour from 'reactour';
import styles from './header.module.scss';
import DatahubIcon from '../datahub-icon/datahub-icon';
import { AuthContext } from '../../util/auth-context';
import { viewSteps, browseSteps, detailSteps, loginSteps } from '../../config/guided-tour-steps';


interface Props extends RouteComponentProps<any> {}

const { SubMenu } = Menu;

const Header:React.FC<Props> = ({ location }) => {
  const { user, userNotAuthenticated, handleError } = useContext(AuthContext);
  const [selectedMenu, setSelectedMenu] = useState<string[]>([]);
  const [tourSteps, setTourSteps] = useState<any[]>([]);
  const [isTourOpen, setIsTourOpen] = useState(false);


  const closeTour = () => {
    setIsTourOpen(false);
  }

  const showTour = () => {
    setIsTourOpen(true);
  }

  const handleLogout = async () => {
    try {
      let response = await axios(`/datahub/v2/logout`);
      if (response.status === 200 ) {
        userNotAuthenticated();
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    let path = location.pathname.split('/');
    switch(path[1]) {
      case 'view':
        setSelectedMenu([location.pathname]);
        setTourSteps(viewSteps);
        break;
      case 'browse':
        setSelectedMenu([location.pathname]);
        setTourSteps(browseSteps);
        break;
      case 'detail':
        setSelectedMenu(['/browse']);
        setTourSteps(detailSteps);
        break;
      case '':
        setTourSteps(loginSteps);
        break;
      default:
        break;
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
    <Layout.Header className={styles.navBar}>
      <div className={styles.iconContain}>
        <div id="logo" className={styles.icon}>
          <DatahubIcon size={65} fill='silver' view='0 0 100 100'/>
        </div>
      </div>
      <div id="title" className={styles.title}>Data Hub Explorer</div>{showMenu}
      <div>
      <a  id="help-icon" onClick={showTour} className={styles.route}>
        <FontAwesomeIcon className={styles.help} icon={faRoute} size="lg" />
      </a>
      <Tour
          steps={tourSteps}
          startAt={0}
          isOpen={isTourOpen}
          onRequestClose={closeTour}
      />
      </div>
      <div>
      <a id="help-icon" className={styles.helpContain} href={'https://docs.marklogic.com/datahub/'} target={"_blank"}>
      <Icon className={styles.help} type="question-circle"/>
      </a>
      </div>
    </Layout.Header>

  )
}

export default withRouter(Header);