import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import styles from './header.module.scss';

const Header:React.FC<{}> = () => {
  //const [clicks, setClicks] = useState(initial);
  return (
    <Layout.Header>
      <Link to="/"className={styles.logo}>Logo</Link>
      <Menu 
        mode="horizontal"
        theme="dark"
        defaultSelectedKeys={['1']}
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
      </Menu>
    </Layout.Header>
  )
}

export default Header;