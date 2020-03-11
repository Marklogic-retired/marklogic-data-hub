import React from 'react';
import styles from './Home.module.scss';
import { Tooltip, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCubes, faObjectUngroup } from '@fortawesome/free-solid-svg-icons';
const Home: React.FC = () => {

  return (
    <div>
      <div className={styles.content}>
        <div style={{ color: '#666', fontSize: '20px'}}>Authenticated!</div>
        <Tooltip title="Click to navigate to Load Data Screen" placement="left">
          <button className={styles.loadDataIcon}>
            <Link to="/load-data"><i><FontAwesomeIcon icon={faCubes} size="3x"/></i></Link>
          </button>
        </Tooltip>
        <Tooltip title="Click to navigate to Entities Screen" placement="left">
          <button className={styles.entityIcon}>
            <Link to="/entity-tiles"><i><FontAwesomeIcon icon={faObjectUngroup } size="2x"/></i></Link>
          </button>
        </Tooltip>
        <Tooltip title="Click to navigate to Tool Bench" placement="bottom">
            <Link to="/bench" className={styles.bench}><Icon type="tool" /></Link>
        </Tooltip>
        <Link to="/view" className={styles.text}>View Entities</Link>
        <Link to="/browse" className={styles.text}>Browse Entities</Link>
        <Tooltip title="Click to reset host name and log out" placement="bottom">
            <Link to="/reset" className={styles.reset}><Icon type="rollback" /></Link>
        </Tooltip>
      </div>
    </div>
  );
}

export default Home;