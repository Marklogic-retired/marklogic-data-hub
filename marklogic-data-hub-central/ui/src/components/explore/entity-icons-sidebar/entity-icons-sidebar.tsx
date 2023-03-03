import React from "react";
import styles from "./entity-icons-sidebar.module.scss";
import {ChevronDoubleRight} from "react-bootstrap-icons";
import {HCTooltip, DynamicIcons} from "@components/common";
import {defaultIcon} from "@config/explore.config";
import tooltipsConfig from "@config/explorer-tooltips.config";

interface Props {
  currentBaseEntities: any[];
  currentRelatedEntities?: Map<string, any>;
  onClose: (status: boolean) => void;
  updateSelectedEntity;
  graphView: boolean;
}
const {exploreSidebar} = tooltipsConfig;

const EntityIconsSidebar: React.FC<Props> = (props) => {
  const {currentBaseEntities, onClose, currentRelatedEntities, updateSelectedEntity, graphView} = props;
  const currentRelatedEntitiesArray = currentRelatedEntities && currentRelatedEntities.size > 0 ? Array.from(currentRelatedEntities.values()) : [];

  const closeSpecificSidebar = (event) => {
    onClose(false);
  };

  const handleKeyDownMain = (event) => {
    if (event.key === "Enter") {
      closeSpecificSidebar(event);
    }
  };

  const handleBaseEntityClicked = (index) => {
    const entity = currentBaseEntities[index];
    updateSelectedEntity(entity);
  };

  const handleRelatedEntityClicked = (index) => {
    const entity = currentRelatedEntitiesArray[index];
    updateSelectedEntity(entity);
  };

  const handleKeyDownBaseEntities = (event, index) => {
    if (event.key === "Enter") {
      handleBaseEntityClicked(index);
    }
  };

  return (
    <>
      <div className={styles.closeEntityIconsSidebar}>
        <HCTooltip id="reference-tooltip" text="Return to the main side panel." placement="top">
          <ChevronDoubleRight aria-label="base-entity-icons-list-close" className={styles.chevronBack} onClick={closeSpecificSidebar} tabIndex={0} onKeyDown={(event) => handleKeyDownMain(event)} />
        </HCTooltip>
      </div>
      <div className={styles.iconsContainer}>
        <div className={styles.entityIconList} aria-label="base-entity-icons-list">
          {currentBaseEntities.map(({color, icon, name}, index) => name &&
          <div
            tabIndex={0}
            key={name}
            aria-label={`base-entity-icon-${name}`}
            data-icon={icon || defaultIcon}
            style={{backgroundColor: color}}
            className={styles.entityIconListItem}
            onClick={() => handleBaseEntityClicked(index)}
            onKeyDown={(event) => handleKeyDownBaseEntities(event, index)}
          >
            {icon ? <DynamicIcons name={icon} /> : <DynamicIcons name={defaultIcon} />}
          </div>
          )}
        </div>
        {currentRelatedEntitiesArray.length > 0 && <div className={styles.separator} />}
        {currentRelatedEntitiesArray.length > 0 &&
        <div className={!graphView ? styles.relatedEntityIconListDisabled : styles.relatedEntityIconList} aria-label="related-entity-icons-list">
          {currentRelatedEntitiesArray.map(({color, icon, name}, index) => name &&
          <HCTooltip key={index} text={!props.graphView ? exploreSidebar.disabledRelatedEntities : ""} aria-label="disabled-related-entity-tooltip" id="disabled-related-entity-tooltip" placement="bottom">
            <div key={name} aria-label={`related-entity-icon-${name}`} style={{backgroundColor: color}} className={!graphView ? styles.entityIconListItemDisabled : styles.entityIconListItem} onClick={(e) => !graphView ? e.preventDefault() : handleRelatedEntityClicked(index)}>
              {icon ? <DynamicIcons name={icon} /> : <DynamicIcons name={defaultIcon} />}
            </div>
          </HCTooltip>
          )}
        </div>
        }
      </div>
    </>
  );
};

export default EntityIconsSidebar;
