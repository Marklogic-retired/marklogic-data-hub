import React, {useEffect, useState}  from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./related-entities-facet.module.scss";
import {ChevronDoubleRight} from "react-bootstrap-icons";
import HCCheckbox from "../common/hc-checkbox/hc-checkbox";
import {entitiesSorting} from "../../util/entities-sorting";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {MINIMUM_ENTITIES} from "../../config/exploreSidebar";

const SHOW_MINIMUM = (values) => values.length >= MINIMUM_ENTITIES ? MINIMUM_ENTITIES: values.length;
const SHOW_FILTER = (filter) => filter === 1 ? `(${filter} filter)  ` : `(${filter} filters)  `;
interface Props {
  currentRelatedEntities: Map<string, any>;
  onSettingCheckedList: (checkAll: any) => void;
  setCurrentRelatedEntities: (relatedEntities: Map<string, any>) => void;
  setEntitySpecificPanel: (entity: any) => void;
}

const RelatedEntitiesFacet: React.FC<Props> = (props) => {

  const {currentRelatedEntities, onSettingCheckedList, setCurrentRelatedEntities, setEntitySpecificPanel} = props;
  const [entitiesList, setEntitiesList] = useState<any[]>([]);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [options, setOptions] = useState<any[]>([]);
  const [checkedList, setCheckedList] = useState<any[]>([]);

  useEffect(() => {
    const entityNames = Array.from(currentRelatedEntities.keys());
    setEntitiesList(entitiesSorting(entityNames));
  }, [currentRelatedEntities, checkedList]);

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

  const handleColOptionsChecked = ({target}) => {
    const {value, checked} = target;
    const entity = currentRelatedEntities.get(value);
    const entitiesUpdated = currentRelatedEntities.set(value, {...entity, checked});
    setCurrentRelatedEntities(entitiesUpdated);
    const values = Array.from(entitiesUpdated.values());
    const checkedValues = values.filter(({checked}) => checked);
    onSettingCheckedList(checkedValues);
    setCheckedList(checkedValues);
  };

  return (
    <>
      <div aria-label="related-entities-list">
        {options.map((option) => {
          const {color, name, filter, amount, checked, icon} = currentRelatedEntities.get(option);
          return (<div style={{backgroundColor: color}} className={styles.entityItem} key={name} onClick={() => setEntitySpecificPanel({name, color, icon})}>
            <HCCheckbox id={name} checked={checked} handleClick={handleColOptionsChecked} value={name} ariaLabel={`related-entity-check-${name}`}>
              <FontAwesomeIcon icon={Icons[icon]} className={styles.entityIcon}/>
              <span className={styles.entityName}>{name}</span>
              <span className={styles.entityChevron}>
                <ChevronDoubleRight/>
              </span>
              <span className={styles.entityAmount}>
                {filter && SHOW_FILTER(filter)}
                {amount}
              </span>
            </HCCheckbox>
          </div>);
        })}
      </div>
      {currentRelatedEntities.size > MINIMUM_ENTITIES &&
        <div className={styles.more} onClick={onShowMore} data-cy="show-more-related-entities">
          {(showMore) ? "<< less" : "more >>"}
        </div>
      }
    </>
  );
};

export default RelatedEntitiesFacet;
