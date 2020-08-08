import React from 'react';
import styles from './Home.module.scss';
import { Link } from 'react-router-dom';
import { MLTooltip } from '@marklogic/design-system';
import { CubesSolid, ObjectUngroupSolid, ToolOutlined, CubeSolid, WindowsOutlined } from '@marklogic/design-system/es/MLIcon';

const Home: React.FC = () => {

  return (
    <div>
      <div className={styles.content}>
        <div style={{ color: '#666', fontSize: '20px'}}>Authenticated!</div>
        <MLTooltip title="Click to navigate to Load Data Screen" placement="left">
          <button aria-label="Load" className={styles.loadIcon}>
            <Link to="/load"><i><CubesSolid /></i></Link>
          </button>
        </MLTooltip>
        <MLTooltip title="Click to navigate to Entities Screen" placement="left">
          <button aria-label="Entity" className={styles.entityIcon}>
            <Link to="/entity-tiles"><i><ObjectUngroupSolid /></i></Link>
          </button>
        </MLTooltip>
        <MLTooltip title="Click to navigate to Run" placement="left">
            <Link to="/run" className={styles.run}><ToolOutlined /></Link>
        </MLTooltip>
        <Link to="/view" className={styles.text}>View Entities</Link>
        <Link to="/browse" className={styles.text}>Browse Entities</Link>
        <MLTooltip title="Click to navigate to Model Screen" placement="left">
          <button aria-label="Model" className={styles.modelIcon}>
            <Link to="/model"><i><CubeSolid /></i></Link>
          </button>
        </MLTooltip>
        <MLTooltip title="Tile UI" placement="left">
            <Link to="/tiles" className={styles.run}><WindowsOutlined /></Link>
        </MLTooltip>
      </div>
    </div>
  );
}

export default Home;
