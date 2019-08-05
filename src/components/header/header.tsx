import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Icon } from 'antd';
import styles from './header.module.scss';
import DatahubIcon from '../datahub-icon/datahub-icon'

const { SubMenu } = Menu;

type Props={
  auth: boolean;
  user: string;
  logout: any;
}


const Header:React.FC<Props> = props => {
  //const [clicks, setClicks] = useState(initial);
  console.log('passed logout:', props.auth)

  const handleLogout = () => {
    props.logout();
  };

  const showMenu = props.auth && (
    <Menu 
      mode="horizontal"
      theme="dark"
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sub1']}
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
      <SubMenu className = {styles.user}  title={<span><Icon type="user" /><span>{props.user}</span></span>}>
        <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
      </SubMenu>
    </Menu>
  )
    return (
    <Layout.Header>
      <Link to="/">
        <div style={{height:'0px', width: '240px'}}>
          <div className={styles.icon}>
            <DatahubIcon size={65} fill='silver' view='0 0 100 100'/>
          </div>
        </div>
        <div className={styles.title}> Data Hub Explorer </div>
      </Link>
      {showMenu}
    </Layout.Header>
    )
}

export default Header;