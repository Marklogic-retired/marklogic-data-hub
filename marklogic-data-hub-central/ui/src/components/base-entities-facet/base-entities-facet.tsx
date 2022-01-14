import React, {useContext, useEffect, useState}  from "react";
import Select from "react-select";
import reactSelectThemeConfig from "../../config/react-select-theme.config";
import {SearchContext} from "../../util/search-context";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./base-entities-facet.module.scss";
import {ChevronDoubleRight} from "react-bootstrap-icons";
import {entitiesSorting} from "../../util/entities-sorting";
import {HCDivider} from "@components/common";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {MINIMUM_ENTITIES} from "../../config/exploreSidebar";

const PERSON = {name: "Person", color: "#CEE0ED", amount: 10, filter: 2, icon: "faUser"};
const BABY_REGISTRY = {name: "Baby Registry", color: "#FDC7D4", amount: 10, filter: 2, icon: "faPiggyBank"};
const PRODUCT_DETAIL = {name: "Product Detail", color: "#E3DEEB", amount: 599, icon: "faVolleyballBall"};
const CLIENT = {name: "Client", color: "#C9EBC4", amount: 9000, icon: "faPrint"};
const CUSTOMERS = {name: "Customer", color: "#BEDDDF", amount: 100, filter: 1, icon: "faShoppingCart"};
const BUYER = {name: "Buyer", color: "#F0F6D9", amount: 340, icon: "faBell"};
const ITEM = {name: "Item", color: "#D9F5F0", amount: 40, icon: "faBox"};
const ORDERS = {name: "Order", color: "#EDD9C5", amount: 10, filter: 2, icon: "faPaperclip"};

const ENTITIES = [
  {...PERSON, relatedEntities: []},
  {...BABY_REGISTRY, relatedEntities: []},
  {...PRODUCT_DETAIL, relatedEntities: []},
  {...CLIENT, relatedEntities: []},
  {...CUSTOMERS, relatedEntities: [PERSON, BABY_REGISTRY, PRODUCT_DETAIL, CLIENT, BUYER, ITEM, ORDERS]},
  {...BUYER, relatedEntities: []},
  {...ORDERS, relatedEntities: [PERSON, CUSTOMERS, ORDERS]}
];

interface Props {
  currentBaseEntities: any;
  setCurrentBaseEntities: (entities: any[]) => void;
  setActiveAccordionRelatedEntities: (entity: string)=>void;
  activeKey:any[]
  setEntitySpecificPanel: (entity: any) => void;
}

const BaseEntitiesFacet: React.FC<Props> = (props) => {

  const {setCurrentBaseEntities, setEntitySpecificPanel, currentBaseEntities} = props;

  const {
    searchOptions: {baseEntities},
    setBaseEntities,
  } = useContext(SearchContext);

  const [entities, setEntities] = useState<string[]>(baseEntities);
  const [entitiesList, setEntitiesList] = useState<any[]>(entitiesSorting(ENTITIES));
  const [displayList, setDisplayList] = useState<any[]>(ENTITIES);
  const [showMore, setShowMore] = useState<boolean>(false);

  const childrenOptions = ENTITIES.map(element => ({value: element.name, label: element.name, isDisabled: false}));
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
    const selectedItems = selection.map(element => element.value);
    if (selectedItems.length === 0) {
      setEntities(["All Entities"]);
      setEntitiesList(ENTITIES);
      setCurrentBaseEntities([]);
      if (props.activeKey.indexOf("related-entities") !== -1) { props.setActiveAccordionRelatedEntities("related-entities"); }
    } else {
      const clearSelection = selectedItems.filter(entity => entity !== "All Entities").map((entity => entity));
      const filteredEntities = ENTITIES.filter(entity => clearSelection.includes(entity.name));
      setEntities(clearSelection);
      setEntitiesList(filteredEntities);
      setCurrentBaseEntities(filteredEntities);
      setBaseEntities(clearSelection);
      if (props.activeKey.indexOf("related-entities") === -1) { props.setActiveAccordionRelatedEntities("related-entities"); }
    }
  };

  const showFilter= (filter) => filter === 1 ? `(${filter} filter)  ` : `(${filter} filters)  `;

  useEffect(() => {
    if (!showMore) {
      const entitiesListSlice = entitiesList.slice(0, MINIMUM_ENTITIES);
      setDisplayList(entitiesListSlice);
    } else {
      setDisplayList(entitiesList);
    }
  }, [showMore, entitiesList]);

  useEffect(() => {
    if (currentBaseEntities.length > 0) {
      setDisplayList(currentBaseEntities);
    }
  }, []);

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
        value={entities?.map(d => ({value: d, label: d}))}
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
          const entityIcon = Icons[icon];
          return (
            <div
              key={name}
              aria-label={`base-entities-${name}`}
              style={{backgroundColor: color}}
              className={styles.entityItem}
              onClick={() => setEntitySpecificPanel({name, color, icon})}
            >
              <FontAwesomeIcon icon={entityIcon} className={styles.entityIcon}/>
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

      <div className={styles.more} onClick={onShowMore} data-cy="show-more-base-entities" style={{display: (entitiesList.length > MINIMUM_ENTITIES) ? "block" : "none"}}>
        {(showMore) ? "<< less" : "more >>"}
      </div>
    </>
  );
};

export default BaseEntitiesFacet;
