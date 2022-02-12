import React, {useContext, useEffect, useState}  from "react";
import Select from "react-select";
import reactSelectThemeConfig from "../../config/react-select-theme.config";
import {SearchContext} from "../../util/search-context";
import styles from "./base-entities-facet.module.scss";
import {ChevronDoubleRight} from "react-bootstrap-icons";
import {baseEntitiesSorting, entitiesSorting} from "../../util/entities-sorting";
import {HCDivider, HCTooltip} from "@components/common";
import {exploreSidebar} from "../../config/explore.config";
import DynamicIcons from "@components/common/dynamic-icons/dynamic-icons";
import {ExploreGraphViewToolTips} from "../../config/tooltips.config";

interface Props {
  currentBaseEntities: any;
  setCurrentBaseEntities: (entities: any[]) => void;
  allBaseEntities: any[];
  setActiveAccordionRelatedEntities: (entity: string)=>void;
  activeKey:any[];
  setEntitySpecificPanel: (entity: any) => void;
  setIsAllEntitiesSelected: (isSelected: boolean) => void;
}

const {MINIMUM_ENTITIES} = exploreSidebar;

const BaseEntitiesFacet: React.FC<Props> = (props) => {

  const {setCurrentBaseEntities, setEntitySpecificPanel, currentBaseEntities, allBaseEntities, setIsAllEntitiesSelected} = props;

  const {
    searchOptions: {baseEntities},
    setBaseEntitiesWithProperties,
    setBaseEntities,
    setRelatedEntityTypeIds
  } = useContext(SearchContext);

  const [entityNames, setEntityNames] = useState<string[]>(entitiesSorting(baseEntities));
  const [displayList, setDisplayList] = useState<any[]>(baseEntitiesSorting(currentBaseEntities));
  const [showMore, setShowMore] = useState<boolean>(false);

  useEffect(() => {
    setDisplayList(currentBaseEntities);
  }, [currentBaseEntities]);

  useEffect(() => {
    if (baseEntities === [] || baseEntities === ["All Entities"]) {
      setCurrentBaseEntities(baseEntitiesSorting(allBaseEntities));
    }
  }, [baseEntities]);

  const childrenOptions = allBaseEntities.map(element => ({value: element.name, label: element.name, isDisabled: false})).filter(obj => obj.value && obj.label);
  childrenOptions.unshift({
    value: "-",
    label: "-",
    isDisabled: true
  });
  childrenOptions.unshift({
    value: "All Entities",
    label: "All Entities",
    isDisabled: false
  });

  const handleChange = (selection) => {
    setShowMore(false);
    const selectedItems = selection.map(element => element.value);
    if (selectedItems.length === 0 || selectedItems[selectedItems.length -1] === "All Entities") {
      setRelatedEntityTypeIds([]);
      setIsAllEntitiesSelected(true);
      setEntityNames(["All Entities"]);
      setCurrentBaseEntities(allBaseEntities);
      setBaseEntities([]);
      if (props.activeKey.indexOf("related-entities") !== -1) { props.setActiveAccordionRelatedEntities("related-entities"); }
    } else {
      const clearSelection = selectedItems.filter(entity => entity !== "All Entities").map((entity => entity));
      const filteredEntities = allBaseEntities.filter(entity => clearSelection.includes(entity.name));
      setIsAllEntitiesSelected(false);
      setEntityNames(clearSelection);
      setCurrentBaseEntities(baseEntitiesSorting(filteredEntities));
      if (props.activeKey.indexOf("related-entities") === -1) { props.setActiveAccordionRelatedEntities("related-entities"); }

      if (filteredEntities.length === 1) {
        let queryColumnsToDisplay = filteredEntities[0].properties?.map(property => { return property.name; });
        setBaseEntitiesWithProperties(clearSelection, queryColumnsToDisplay);
      } else {
        setBaseEntities(clearSelection);
      }
    }
  };

  const showFilter= (filter) => filter === 1 ? `(${filter} filter)  ` : `(${filter} filters)  `;

  const updateDisplayList = () => {
    if (!showMore) {
      const entitiesListSlice = currentBaseEntities.slice(0, MINIMUM_ENTITIES);
      setDisplayList(baseEntitiesSorting(entitiesListSlice));
    } else {
      setDisplayList(baseEntitiesSorting(currentBaseEntities));
    }
  };

  useEffect(() => {
    updateDisplayList();
  }, [showMore, currentBaseEntities]);

  const onShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <>
      <Select
        id="entitiesSidebar-select-wrapper"
        inputId="entitiesSidebar-select"
        isMulti
        isClearable={false}
        value={entityNames ? entityNames.map(d => ({value: d, label: d})) : [{value: "All Entities", label: "All Entities"}]}
        onChange={handleChange}
        isSearchable={false}
        aria-label="base-entities-dropdown-list"
        options={childrenOptions}
        formatOptionLabel={({value, label}) => {
          if (value === "-") {
            return <HCDivider className={"m-0"} />;
          }
          return (
            <span aria-label={`base-option-${value}`}>
              {label}
            </span>
          );
        }}
        styles={{...reactSelectThemeConfig,
          container: (provided, state) => ({
            ...provided,
            height: "auto",
          }),
          menu: (provided, state) => ({
            ...provided,
            height: "250px",
          }),
          menuList: (provided, state) => ({
            ...provided,
            height: "250px",
          }),
        }}
      />
      <div aria-label="base-entities-selection">
        {displayList.map(({name, color, filter, amount, icon}) => {
          let finalIcon = icon ? icon : "FaShapes";
          let finalColor = color ? color : "#EEEFF1";
          if (name) {
            return (
              <HCTooltip text={ExploreGraphViewToolTips.entityToolTip} placement="top" id="baseEntityToolTip">
                <div
                  key={name}
                  aria-label={`base-entities-${name}`}
                  style={{backgroundColor: finalColor, borderStyle: "solid", borderWidth: "1px", borderColor: "#d9d9d9", borderRadius: "4px"}}
                  className={styles.entityItem}
                  onClick={() => setEntitySpecificPanel({name, color: finalColor, icon: finalIcon})}
                >
                  <span className={styles.entityIcon}>
                    <DynamicIcons name={finalIcon}/>
                  </span>
                  <span className={styles.entityName}>{name}</span>
                  <span className={styles.entityChevron}>
                    <ChevronDoubleRight/>
                  </span>
                  <span className={styles.entityAmount}>
                    {filter && showFilter(filter)}
                    {amount}
                  </span>
                </div></HCTooltip>
            );
          }
        }
        )}
      </div>

      <div className={styles.more} onClick={onShowMore} data-cy="show-more-base-entities" style={{display: (currentBaseEntities.length > MINIMUM_ENTITIES) ? "block" : "none"}}>
        {(showMore) ?  "<< less" : "more >>"}
      </div>
    </>
  );
};

export default BaseEntitiesFacet;
