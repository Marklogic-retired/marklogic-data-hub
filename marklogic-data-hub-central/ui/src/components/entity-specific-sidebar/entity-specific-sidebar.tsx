import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import styles from "./entity-specific-sidebar.module.scss";

interface Props {
  entitySelected: any;
}

const EntitySpecificSidebar: React.FC<Props> = (props) => {
  const {entitySelected: {name, icon}} = props;
  const entityIcon = Icons[icon];

  return (
    <div aria-label={`specif-sidebar-${name}`} className={styles.entityHeader}>
      <FontAwesomeIcon aria-label={`specif-icon-${name}`} icon={entityIcon} className={styles.entityHeaderIcon}/>
      <span className={styles.entityHeaderName} aria-label={`specif-title-${name}`}>{name}</span>
    </div>
  );
};

export default EntitySpecificSidebar;
