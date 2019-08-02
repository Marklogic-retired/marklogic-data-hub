import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import styles from './header.module.scss';
import DatahubIcon from '../datahub-icon/datahub-icon'


const Header:React.FC<{}> = () => {
  //const [clicks, setClicks] = useState(initial);
  return (
    <Layout.Header>
      <Link to="/"className={styles.logo}>
        <div style={{height:'0px',
      width: '240px'}}>
            <DatahubIcon size={70}/>
        </div>
        <div className={styles.title}> Data Hub Explorer </div>
      </Link>
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