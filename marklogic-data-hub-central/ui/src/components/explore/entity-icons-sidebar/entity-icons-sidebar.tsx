import React from "react";
import styles from "./entity-icons-sidebar.module.scss";
import {ChevronDoubleRight} from "react-bootstrap-icons";
import {HCTooltip} from "@components/common";
import DynamicIcons from "@components/common/dynamic-icons/dynamic-icons";
import {defaultIcon} from "@config/explore.config";

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
    const entity = currentBaseEntities[index];
    updateSelectedEntity(entity);
  };

  const handleRelatedEntityClicked = (index) => {
    const entity = currentRelatedEntitiesArray[index];
    updateSelectedEntity(entity);
  };

  return (
    <>
      <div className={styles.entityIconList} aria-label="base-entity-icons-list">
        <HCTooltip id="reference-tooltip" text="Return to the main side panel." placement="top">
          <ChevronDoubleRight aria-label="base-entity-icons-list-close" className={styles.chevronBack} onClick={closeSpecificSidebar} />
        </HCTooltip>
        {currentBaseEntities.map(({color, icon, name}, index) => name &&
          <div key={name} aria-label={`base-entity-icon-${name}`} style={{backgroundColor: color}} className={styles.entityIconListItem} onClick={() => handleBaseEntityClicked(index)}>
            {icon ? <DynamicIcons name={icon} /> : <DynamicIcons name={defaultIcon} />}
          </div>
        )}
      </div>
      {currentRelatedEntitiesArray.length > 0 && <div className={styles.separator}></div>}
      {currentRelatedEntitiesArray.length > 0 &&
        <div className={styles.relatedEntityIconList} aria-label="related-entity-icons-list">
          {currentRelatedEntitiesArray.map(({color, icon, name}, index) => name &&
            <div key={name} aria-label={`related-entity-icon-${name}`} style={{backgroundColor: color}} className={styles.entityIconListItem} onClick={() => handleRelatedEntityClicked(index)}>
              {icon ? <DynamicIcons name={icon} /> : <DynamicIcons name={defaultIcon} />}
            </div>
          )}
        </div>
      }
    </>
  );
};

export default EntityIconsSidebar;
