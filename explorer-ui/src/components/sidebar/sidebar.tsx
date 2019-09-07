import React from 'react';
import Facets from '../facets/facets';
import styles from './sidebar.module.scss';

const Sidebar = (props) => {

  // TODO sort entity vs. hub properties and pass accordingly

  return (
    <div className={styles.sidebarContainer}>
      <Facets 
        title="Entity Properties"
        data={props.facets}
      />
      <Facets 
        title="Hub Properties"
        data={props.facets}
      />
    </div>
  );
}

export default Sidebar;