import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import styles from "./entity-icons-sidebar.module.scss";
import {ChevronDoubleRight} from "react-bootstrap-icons";

interface Props {
  currentBaseEntities: any[];
  currentRelatedEntities?: Map<string, any>;
  onClose: (status: boolean) => void;
  updateSelectedEntity
}

const EntityIconsSidebar: React.FC<Props> = (props) => {
  const {currentBaseEntities, onClose, currentRelatedEntities, updateSelectedEntity} = props;
  const currentRelatedEntitiesArray = currentRelatedEntities && currentRelatedEntities.size > 0 ? Array.from(currentRelatedEntities.values()) : [];

  const closeSpecificSidebar = (event) => {
    onClose(false);
  };

  const handleBaseEntityClicked = (index) => {
    updateSelectedEntity(currentBaseEntities[index]);
  };

  const handleRelatedEntityClicked = (index) => {
    updateSelectedEntity(currentRelatedEntitiesArray[index]);
  };

  return (
    <>
      <div className={styles.entityIconList} aria-label="base-entity-icons-list">
        <ChevronDoubleRight className={styles.chevronBack} onClick={closeSpecificSidebar} aria-label="base-entity-icons-list-close"/>
        {currentBaseEntities.map(({color, icon, name}, index) =>
          <div key={name} aria-label={`base-entity-icon-${name}`} style={{backgroundColor: color}} className={styles.entityIconListItem} onClick={() => handleBaseEntityClicked(index)}>
            <FontAwesomeIcon icon={Icons[icon]}/>
          </div>
        )}
      </div>
      <div className={styles.separator}></div>
      {currentRelatedEntitiesArray.length > 0 &&
        <div className={styles.relatedEntityIconList} aria-label="related-entity-icons-list">
          {currentRelatedEntitiesArray.map(({color, icon, name}, index) =>
            <div key={name} aria-label={`related-entity-icon-${name}`}  style={{backgroundColor: color}} className={styles.entityIconListItem} onClick={() => handleRelatedEntityClicked(index)}>
              <FontAwesomeIcon icon={Icons[icon]}/>
            </div>
          )}
        </div>
      }
    </>
  );
};

export default EntityIconsSidebar;
