import React from 'react';
import EntityMenu from '../entity-menu/entity-menu';
import Facets from '../facets/facets';
import EntityProperties from '../../assets/mock-data/entity-properties';
import HubProperties from '../../assets/mock-data/hub-properties';
import styles from './sidebar.module.scss';

const Sidebar = (props) => {

  return (
    <div className={styles.sidebarContainer}>
      <Facets 
        title="Entity Properties"
        data={EntityProperties}
      />
      <Facets 
        title="Hub Properties"
        data={HubProperties}
      />
    </div>
  );
}

export default Sidebar;