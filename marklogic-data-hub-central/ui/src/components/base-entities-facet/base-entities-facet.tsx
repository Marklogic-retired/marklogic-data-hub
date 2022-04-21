import React, {useContext, useEffect, useState} from "react";
import Select from "react-select";
import {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import {SearchContext} from "@util/search-context";
import styles from "./base-entities-facet.module.scss";
import {ChevronDoubleRight} from "react-bootstrap-icons";
import {baseEntitiesSorting, entitiesSorting} from "@util/entities-sorting";
import {HCDivider, HCTooltip, DynamicIcons} from "@components/common";
import {defaultPaginationOptions, defaultIcon, exploreSidebar} from "@config/explore.config";
import {ExploreGraphViewToolTips} from "@config/tooltips.config";
import {themeColors} from "@config/themes.config";

interface Props {
  currentBaseEntities: any;
  setCurrentBaseEntities: (entities: any[]) => void;
  allBaseEntities: any[];
  setActiveAccordionRelatedEntities: (entity: string) => void;
  activeKey: any[];
  setEntitySpecificPanel: (entity: any) => void;
}

const {MINIMUM_ENTITIES} = exploreSidebar;

const BaseEntitiesFacet: React.FC<Props> = (props) => {

  const {setCurrentBaseEntities, setEntitySpecificPanel, currentBaseEntities, allBaseEntities} = props;

  const {
    searchOptions,
    setSearchOptions,
  } = useContext(SearchContext);

  const [entityNames, setEntityNames] = useState<string[]>(searchOptions.entityTypeIds.length === 0 ? ["All Entities"] : entitiesSorting(searchOptions.entityTypeIds));
  const [displayList, setDisplayList] = useState<any[]>(baseEntitiesSorting(currentBaseEntities));
  const [showMore, setShowMore] = useState<boolean>(false);
  const [invalidEntities] = useState({});

  useEffect(() => {
    const isAllEntities = searchOptions.entityTypeIds.length === 0 || searchOptions.entityTypeIds.length === allBaseEntities.length;
    if (isAllEntities) {
      setEntityNames(["All Entities"]);
    }
    if (allBaseEntities.length !== 0 && searchOptions.entityTypeIds.length > 0 && searchOptions.entityTypeIds.length !== allBaseEntities.length) {
      const {entityTypeIds} = searchOptions;
      let entitiesFiltered = allBaseEntities.map(element => (
        {value: element.name, label: element.name, isDisabled: false}
      )).filter(obj => obj.value && entityTypeIds.includes(obj.value) && obj.label);
      if (entitiesFiltered.length > 0) handleChange(entitiesFiltered);
    }
  }, [allBaseEntities, searchOptions.entityTypeIds]);

  useEffect(() => {
    setDisplayList(baseEntitiesSorting(currentBaseEntities));
  }, [currentBaseEntities]);

  const childrenOptions = baseEntitiesSorting(allBaseEntities).map(element => {
    let isDefinitionInvalid = !!element.isDefinitionInvalid;
    if (isDefinitionInvalid) {
      invalidEntities[element.name] = element.name;
    }
    return {value: element.name, label: element.name, isDisabled: isDefinitionInvalid};
  }).filter(obj => obj.value && obj.label);
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
    if (selectedItems.length === 0 || selectedItems[selectedItems.length - 1] === "All Entities") {
      setEntityNames(["All Entities"]);
      setCurrentBaseEntities(baseEntitiesSorting(allBaseEntities));
      setSearchOptions({
        ...searchOptions,
        entityTypeIds: allBaseEntities.map(entities => entities.name),
        baseEntities: allBaseEntities,
        relatedEntityTypeIds: [],
        selectedTableProperties: [],
        ...defaultPaginationOptions
      });
      if (props.activeKey.indexOf("related-entities") !== -1) { props.setActiveAccordionRelatedEntities("related-entities"); }
    } else {
      const clearSelection = selectedItems.filter(entity => entity !== "All Entities").map((entity => entity));
      const filteredEntities = allBaseEntities.filter(entity => clearSelection.includes(entity.name));
      setEntityNames(clearSelection);
      setCurrentBaseEntities(baseEntitiesSorting(filteredEntities));
      if (props.activeKey.indexOf("related-entities") === -1) { props.setActiveAccordionRelatedEntities("related-entities"); }

      let updatedSearchOptions = {
        ...searchOptions,
        entityTypeIds: clearSelection,
        baseEntities: filteredEntities,
        selectedTableProperties: [],
        ...defaultPaginationOptions
      };
      if (filteredEntities.length === 1) {
        let queryColumnsToDisplay = filteredEntities[0].properties?.map(property => property.name);
        updatedSearchOptions["selectedTableProperties"] = queryColumnsToDisplay;
      }
      setSearchOptions(updatedSearchOptions);
    }
  };

  const showFilter = (filter) => filter === 1 ? `(${filter} filter)  ` : `(${filter} filters)  `;

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

  const MultiValueRemove = props => {
    return (
      <SelectComponents.MultiValueRemove {...props}>
        <span aria-label={`Remove ${props.data.value}`}>
          <svg height="14" width="14" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>
        </span>
      </SelectComponents.MultiValueRemove>
    );
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
        components={{MultiValueRemove}}
        isSearchable={false}
        aria-label="base-entities-dropdown-list"
        options={childrenOptions}
        formatOptionLabel={({value, label}) => {
          if (value === "-") {
            return <HCDivider className={"m-0"} />;
          }
          return (
            <HCTooltip text={invalidEntities[value] ? ExploreGraphViewToolTips.invalidDefinitionToolTip : ""} placement="top" id="baseEntityOptionsToolTip" key={value}>
              <span aria-label={`base-option-${value}`}>
                {label}
              </span>
            </HCTooltip>
          );
        }}
        styles={{
          ...reactSelectThemeConfig,
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
        {displayList.map(({name, color, filter, amount, icon, isDefinitionInvalid}) => {
          let finalIcon = icon ? icon : defaultIcon;
          let finalColor = color ? color : themeColors.defaults.entityColor;
          let entitySpecificPanelInfo = {
            name, color: finalColor,
            icon: finalIcon,
            isDefinitionInvalid: !!isDefinitionInvalid
          };
          if (name) {
            return (
              <HCTooltip text={ExploreGraphViewToolTips.entityToolTip} placement="top" id="baseEntityToolTip" key={name}>
                <div
                  key={name}
                  aria-label={`base-entities-${name}`}
                  style={{backgroundColor: finalColor, borderStyle: "solid", borderWidth: "1px", borderColor: "#d9d9d9", borderRadius: "4px"}}
                  className={styles.entityItem}
                  onClick={() => setEntitySpecificPanel(entitySpecificPanelInfo)}
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
        {(showMore) ? "<< less" : "more >>"}
      </div>
    </>
  );
};

export default BaseEntitiesFacet;
