import React, {useContext, useEffect, useState}  from "react";
import {Select} from "antd";
import {SearchContext} from "../../util/search-context";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import styles from "./base-entities-facet.module.scss";
import {ChevronDoubleRight} from "react-bootstrap-icons";
import {entitiesSorting} from "../../util/entities-sorting";

const {Option} = Select;

const ADDRESS = {name: "Address", color: "#CEE0ED", amount: 10, filter: 2};
const BACK_ACCOUNT = {name: "Bank Account", color: "#FDC7D4", amount: 10, filter: 2};
const SPORTS = {name: "Sports", color: "#E3DEEB", amount: 599};
const WORK = {name: "Work", color: "#C9EBC4", amount: 9000};
const CUSTOMERS = {name: "Customers", color: "#D5D3DD", amount: 100, filter: 1};
const EMPLOYEE = {name: "Employee", color: "#F0F6D9", amount: 340};
const ITEM = {name: "Item", color: "#D9F5F0", amount: 40};
const ORDERS = {name: "Orders", color: "#EDD9C5", amount: 10, filter: 2};

const ENTITIES = [
  {...ADDRESS, relatedEntities: []},
  {...BACK_ACCOUNT, relatedEntities: []},
  {...SPORTS, relatedEntities: []},
  {...WORK, relatedEntities: []},
  {...CUSTOMERS, relatedEntities: [ADDRESS, BACK_ACCOUNT, SPORTS, WORK, EMPLOYEE, ITEM, ORDERS]},
  {...EMPLOYEE, relatedEntities: []},
  {...ITEM, relatedEntities: [ADDRESS, WORK, ORDERS]},
  {...ORDERS, relatedEntities: []}
];

const SHOW_MINIMUM = 5;

interface Props {
  setCurrentBaseEntities: (entities: any[]) => void;
}

const BaseEntitiesFacet: React.FC<Props> = (props) => {

  const {setCurrentBaseEntities} = props;

  const {
    searchOptions: {baseEntities},
  } = useContext(SearchContext);

  const [entities, setEntities] = useState<string[]>(baseEntities);
  const [entitiesList, setEntitiesList] = useState<any[]>(entitiesSorting(ENTITIES));
  const [displayList, setDisplayList] = useState<any[]>(ENTITIES);
  const [showMore, setShowMore] = useState<boolean>(false);

  const children = ENTITIES.map(element => <Option key={element.name} aria-label={`base-option-${element.name}`}>{element.name}</Option>);

  const handleChange = (selection) => {
    if (selection.length === 0) {
      setEntities(["All Entities"]);
      setEntitiesList(ENTITIES);
      setCurrentBaseEntities([]);
    } else {
      const clearSelection = selection.filter(entity => entity !== "All Entities").map((entity => entity));
      const filteredEntities = ENTITIES.filter(entity => clearSelection.includes(entity.name));
      setEntities(clearSelection);
      setEntitiesList(filteredEntities);
      setCurrentBaseEntities(filteredEntities);
    }
  };

  const onSelect = (selected) => {
    if (selected === "All Entities") {
      setEntities(["All Entities"]);
      setEntitiesList(ENTITIES);
    }
  };

  const showFilter= (filter) => filter === 1 ? `(${filter} filter)  ` : `(${filter} filters)  `;

  useEffect(() => {
    if (!showMore) {
      const entitiesListSlice = entitiesList.slice(0, SHOW_MINIMUM);
      setDisplayList(entitiesListSlice);
    } else {
      setDisplayList(entitiesList);
    }
  }, [showMore, entitiesList]);

  const onShowMore = () => {
    setShowMore(!showMore);
  };


  return (
    <>
      <Select
        mode="multiple"
        style={{width: "100%"}}
        value={entities}
        defaultValue={["All Entities"]}
        onChange={handleChange}
        onSelect={onSelect}
        aria-label="base-entities-dropdown-list"
      >
        <Option key="All Entities" aria-label={`base-option-all`}>All Entities</Option>
        {children}
      </Select>
      <div>
        {displayList.map(({name, color, filter, amount}) =>
          <div style={{backgroundColor: color}} className={styles.entityItem}>
            <FontAwesomeIcon icon={faUser} className={styles.entityIcon}/>
            <span className={styles.entityName}>{name}</span>
            <span className={styles.entityChevron}>
              <ChevronDoubleRight/>
            </span>
            <span className={styles.entityAmount}>
              {filter && showFilter(filter)}
              {amount}
            </span>
          </div>
        )}
      </div>
      <div className={styles.more} onClick={onShowMore} data-cy="show-more-base-entities">
        {(showMore) ? "<< less" : "more >>"}
      </div>
    </>
  );
};

export default BaseEntitiesFacet;