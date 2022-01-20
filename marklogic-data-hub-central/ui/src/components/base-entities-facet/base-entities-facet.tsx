import React, {useContext, useEffect, useState}  from "react";
import Select from "react-select";
import reactSelectThemeConfig from "../../config/react-select-theme.config";
import {SearchContext} from "../../util/search-context";
import styles from "./base-entities-facet.module.scss";
import {ChevronDoubleRight} from "react-bootstrap-icons";
import {entitiesSorting} from "../../util/entities-sorting";
import {HCDivider} from "@components/common";
import {MINIMUM_ENTITIES} from "../../config/exploreSidebar";
import DynamicIcons from "@components/common/dynamic-icons/dynamic-icons";

interface Props {
  currentBaseEntities: any;
  setCurrentBaseEntities: (entities: any[]) => void;
  allBaseEntities: any[];
  setActiveAccordionRelatedEntities: (entity: string)=>void;
  activeKey:any[]
  setEntitySpecificPanel: (entity: any) => void;
    setIsAllEntitiesSelected: (isSelected: boolean) => void;
}

const BaseEntitiesFacet: React.FC<Props> = (props) => {

  const {setCurrentBaseEntities, setEntitySpecificPanel, currentBaseEntities, allBaseEntities, setIsAllEntitiesSelected} = props;

  const {
    searchOptions: {baseEntities},
    setBaseEntities,
  } = useContext(SearchContext);

  const [entityNames, setEntityNames] = useState<string[]>(baseEntities);
  const [displayList, setDisplayList] = useState<any[]>(entitiesSorting(currentBaseEntities));
  const [showMore, setShowMore] = useState<boolean>(false);


  useEffect(() => {
    setDisplayList(currentBaseEntities);
  }, [currentBaseEntities]);

  const childrenOptions = allBaseEntities.map(element => ({value: element.name, label: element.name, isDisabled: false}));
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
      setIsAllEntitiesSelected(true);
      setEntityNames(["All Entities"]);
      setCurrentBaseEntities(allBaseEntities);
      if (props.activeKey.indexOf("related-entities") !== -1) { props.setActiveAccordionRelatedEntities("related-entities"); }
    } else {
      const clearSelection = selectedItems.filter(entity => entity !== "All Entities").map((entity => entity));
      const filteredEntities = allBaseEntities.filter(entity => clearSelection.includes(entity.name));
      setIsAllEntitiesSelected(false);
      setEntityNames(clearSelection);
      setCurrentBaseEntities(filteredEntities);
      setBaseEntities(clearSelection);
      if (props.activeKey.indexOf("related-entities") === -1) { props.setActiveAccordionRelatedEntities("related-entities"); }
    }
  };

  const showFilter= (filter) => filter === 1 ? `(${filter} filter)  ` : `(${filter} filters)  `;

  const updateDisplayList = () => {
    if (!showMore) {
      const entitiesListSlice = currentBaseEntities.slice(0, MINIMUM_ENTITIES);
      setDisplayList(entitiesListSlice);
    } else {
      setDisplayList(currentBaseEntities);
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
        value={entityNames?.map(d => ({value: d, label: d}))}
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
          return (
            <div
              key={name}
              aria-label={`base-entities-${name}`}
              style={{backgroundColor: finalColor}}
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
            </div>
          );
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
