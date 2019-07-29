import React, { useState } from 'react';
import { Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import styles from './header.module.scss';
// React Hooks with TypeScript
// our components props accept a number for the initial value
// defaults to 0 if no initial value
const Header:React.FC<{ }> = () => {
  // since we pass a number here, clicks is going to be a number.
  // setClicks is a function that accepts either a number or a function returning
  // a number
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