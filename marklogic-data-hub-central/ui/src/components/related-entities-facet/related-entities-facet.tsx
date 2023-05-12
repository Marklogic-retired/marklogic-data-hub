import React, {useEffect, useState, useContext} from "react";
import styles from "./related-entities-facet.module.scss";
import {ChevronDoubleRight} from "react-bootstrap-icons";
import HCCheckbox from "../common/hc-checkbox/hc-checkbox";
import {entitiesSorting} from "@util/entities-sorting";
import {defaultIcon, exploreSidebar} from "@config/explore.config";
import {SearchContext} from "@util/search-context";
import {ExploreGraphViewToolTips} from "@config/tooltips.config";
import {HCTooltip, DynamicIcons, HCFacetIndicator} from "@components/common";
import {deepCopy} from "@util/data-conversion";
import {themeColors} from "@config/themes.config";
import {AddTooltipWhenTextOverflow} from "@util/AddTooltipWhenTextOverflow";

const SHOW_MINIMUM = values => (values.length >= MINIMUM_ENTITIES ? MINIMUM_ENTITIES : values.length);
const SHOW_FILTER = filter => (filter === 1 ? `(${filter} filter)  ` : `(${filter} filters)  `);
const {MINIMUM_ENTITIES} = exploreSidebar;
interface Props {
  currentRelatedEntities: Map<string, any>;
  onSettingCheckedList: (checkAll: any) => void;
  setCurrent: any;
  setEntitySpecificPanel: (entity: any) => void;
  setActiveRelatedEntities: (boolean) => void;
  entityIndicatorData: any;
}

const RelatedEntitiesFacet: React.FC<Props> = props => {
  const {searchOptions, setRelatedEntityTypeIds} = useContext(SearchContext);
  const {
    currentRelatedEntities,
    onSettingCheckedList,
    setCurrent,
    setEntitySpecificPanel,
    entityIndicatorData,
  } = props;
  const [entitiesList, setEntitiesList] = useState<any[]>([]);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [options, setOptions] = useState<any[]>([]);
  const [checkedList, setCheckedList] = useState<any[]>([]);
  const [relatedEntitiesDisabled, setRelatedEntitiesDisabled] = useState<any[]>([]);

  useEffect(() => {
    const entityNames = Array.from(currentRelatedEntities.keys());
    setEntitiesList(entitiesSorting(entityNames));
  }, [currentRelatedEntities, checkedList]);

  useEffect(() => {
    let updateDisabledEntities = deepCopy(relatedEntitiesDisabled);
    Array.from(currentRelatedEntities.keys()).forEach(entity => {
      if (selectedInBase(entity) && !relatedEntitiesDisabled.includes(entity)) {
        updateDisabledEntities.push(entity);
      } else if (!selectedInBase(entity) && relatedEntitiesDisabled.includes(entity)) {
        updateDisabledEntities.splice(updateDisabledEntities.indexOf(entity), 1);
      }
    });
    setRelatedEntitiesDisabled(updateDisabledEntities);
  }, [searchOptions.entityTypeIds]);

  useEffect(() => {
    if (relatedEntitiesDisabled.length === currentRelatedEntities.size) {
      //if all related entities possible have been disabled, tell sidebar to disable the entire panel
      props.setActiveRelatedEntities(false);
    } else {
      props.setActiveRelatedEntities(true);
    }
  }, [relatedEntitiesDisabled]);

  useEffect(() => {
    if (!showMore) {
      const entitiesListSlice = entitiesList.slice(0, SHOW_MINIMUM(entitiesList));
      setOptions(entitiesSorting(entitiesListSlice));
    } else {
      setOptions(entitiesSorting(entitiesList));
    }
  }, [showMore, entitiesList]);

  const onShowMore = () => {
    setShowMore(!showMore);
  };

  const handleColOptionsChecked = event => {
    if (event.key && event.key === "Enter") {
      event.target.checked = !event.target.checked;
    }
    const {value, checked} = event.target;
    const entity = currentRelatedEntities.get(value);
    const entitiesUpdated = currentRelatedEntities.set(value, {...entity, checked});
    setCurrent((prevState) => ({...prevState, relatedEntities: entitiesUpdated}));
    const values = Array.from(entitiesUpdated.values());
    const checkedValues = values.filter(({checked}) => checked);
    onSettingCheckedList(checkedValues);
    setCheckedList(checkedValues);
    let relatedEntityIds = checkedValues.map(function (i) {
      return i.name;
    });
    setRelatedEntityTypeIds(relatedEntityIds);
  };

  const selectedInBase = relatedEntity => {
    if (searchOptions?.entityTypeIds && relatedEntity && searchOptions.entityTypeIds.includes(relatedEntity)) {
      //if the related entity is already selected as a base entity
      return true;
    } else {
      return false;
    }
  };

  const isNotEmptyIndicatorData = entityIndicatorData.entities && Object.keys(entityIndicatorData.entities).length > 0;
  return (
    <>
      <div aria-label="related-entities-list">
        {options?.map(option => {
          if (currentRelatedEntities?.get(option)) {
            const {color, name, filter, checked, icon} = currentRelatedEntities.get(option);
            let finalIcon = icon ? icon : defaultIcon;
            let finalColor = color ? color : themeColors.defaults.entityColor;
            return (
              <HCTooltip
                text={
                  relatedEntitiesDisabled.includes(option)
                    ? ExploreGraphViewToolTips.entityToolTipDisabled(option)
                    : ExploreGraphViewToolTips.entityToolTip
                }
                placement="top"
                id="relatedEntityToolTip"
                aria-label="relatedEntityToolTip"
                key={name}
              >
                <div
                  style={{
                    backgroundColor: finalColor,
                    borderStyle: "solid",
                    borderWidth: "1px",
                    borderColor: "#d9d9d9",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                  className={relatedEntitiesDisabled.includes(option) ? styles.entityItemDisabled : styles.entityItem}
                  key={name}
                  onClick={() =>
                    relatedEntitiesDisabled.includes(option)
                      ? ""
                      : setEntitySpecificPanel({name, color: finalColor, icon: finalIcon})
                  }
                >
                  <div className={styles.checkAndIcon}>
                    <HCCheckbox
                      id={name}
                      checked={checked}
                      cursorDisabled={relatedEntitiesDisabled.includes(option)}
                      handleKeyDown={
                        relatedEntitiesDisabled.includes(option)
                          ? () => {
                            return;
                          }
                          : handleColOptionsChecked
                      }
                      handleClick={
                        relatedEntitiesDisabled.includes(option)
                          ? () => {
                            return;
                          }
                          : handleColOptionsChecked
                      }
                      value={name}
                      ariaLabel={`related-entity-check-${name}`}
                    >
                      <DynamicIcons name={finalIcon} />
                    </HCCheckbox>
                  </div>

                  <span className={styles.entityName} aria-label={`related-entity-${name}`}>
                    <AddTooltipWhenTextOverflow text={name} placement="right" />
                  </span>
                  <span className={styles.entityChevron}>
                    <ChevronDoubleRight />
                  </span>
                  <span className={styles.entityAmount} aria-label={`related-entity-${name}-filter`}>
                    {filter && SHOW_FILTER(filter)}
                    {isNotEmptyIndicatorData && entityIndicatorData.entities[name]?.amount}
                  </span>

                  {isNotEmptyIndicatorData && (
                    <span className={styles.indicatorContainer} aria-label={`related-entity-${name}-amountbar`}>
                      <HCFacetIndicator
                        percentage={
                          isNaN(entityIndicatorData.max)
                            ? 0
                            : (entityIndicatorData.entities[name]?.amount * 100) / entityIndicatorData.max
                        }
                        isActive={checked}
                      />
                    </span>
                  )}
                </div>
              </HCTooltip>
            );
          }
        })}
      </div>
      {currentRelatedEntities.size > MINIMUM_ENTITIES && (
        <div className={styles.more} onClick={onShowMore} data-cy="show-more-related-entities">
          {showMore ? "<< less" : "more >>"}
        </div>
      )}
    </>
  );
};

export default RelatedEntitiesFacet;
