import React, {useEffect, useState, useContext}  from "react";
import styles from "./related-concepts-facet.module.scss";
import HCCheckbox from "../common/hc-checkbox/hc-checkbox";
import {entitiesSorting} from "@util/entities-sorting";
import {defaultIcon, exploreSidebar} from "@config/explore.config";
import {SearchContext} from "@util/search-context";
import {HubCentralConfigContext} from "@util/hubCentralConfig-context";
import * as _ from "lodash";

import {DynamicIcons, HCFacetIndicator} from "@components/common";
import {themeColors} from "@config/themes.config";

const SHOW_MINIMUM = (values) => values.length >= MINIMUM_ENTITIES ? MINIMUM_ENTITIES : values.length;
// const SHOW_FILTER = (filter) => filter === 1 ? `(${filter} filter)  ` : `(${filter} filters)  `;
const {MINIMUM_ENTITIES} = exploreSidebar;
interface Props {
  currentRelatedConcepts: Map<string, any>;
  onSettingCheckedList: (checkAll: any) => void;
  setCurrentRelatedConcepts: (relatedConcepts: Map<string, any>) => void;
  setActiveRelatedConcepts: (boolean) => void;
  entityIndicatorData: any;
}

const RelatedConceptsFacets: React.FC<Props> = (props) => {

  const {
    setConceptFilterTypeIds
  } = useContext(SearchContext);
  const {currentRelatedConcepts, onSettingCheckedList, setCurrentRelatedConcepts, entityIndicatorData} = props;
  const [conceptsList, setConceptsList] = useState<any[]>([]);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [options, setOptions] = useState<any[]>([]);
  const [checkedList, setCheckedList] = useState<any[]>([]);
  const {hubCentralConfig} = useContext(HubCentralConfigContext);
  const [conceptsConfig, setConceptsConfig] = useState<any>({});

  useEffect(() => {
    if (hubCentralConfig?.modeling?.concepts) {
      let tmpConceptData = _.clone(hubCentralConfig?.modeling?.concepts);
      let conceptsData = {};
      if (tmpConceptData) {
        for (let key in tmpConceptData) {
          if (tmpConceptData[key].hasOwnProperty("semanticConcepts")) {
            for (let conceptKey in tmpConceptData[key]["semanticConcepts"]) {
              conceptsData = {...conceptsData, [conceptKey]: tmpConceptData[key]["semanticConcepts"][conceptKey]};
            }
          }
        }
      }
      setConceptsConfig(conceptsData);
    }
  }, []);

  useEffect(() => {
    const conceptNames = Array.from(currentRelatedConcepts.keys());
    setConceptsList(entitiesSorting(conceptNames));
  }, [currentRelatedConcepts, checkedList]);

  useEffect(() => {
    if (!showMore) {
      const conceptsListSlice = conceptsList.slice(0, SHOW_MINIMUM(conceptsList));
      setOptions(entitiesSorting(conceptsListSlice));
    } else {
      setOptions(entitiesSorting(conceptsList));
    }
  }, [showMore, conceptsList]);

  const onShowMore = () => {
    setShowMore(!showMore);
  };

  const handleColOptionsChecked = (event) => {
    if (event.key && event.key === "Enter") {
      event.target.checked = !event.target.checked;
    }
    const {value, checked} = event.target;
    const concept = currentRelatedConcepts.get(value);
    const conceptsUpdated = currentRelatedConcepts.set(value, {...concept, checked});
    setCurrentRelatedConcepts(conceptsUpdated);
    const values = Array.from(conceptsUpdated.values());
    const checkedValues = values.filter(({checked}) => checked);
    onSettingCheckedList(checkedValues);
    setCheckedList(checkedValues);
    let relatedConceptIds = checkedValues.map(function(i) { return i.value; });
    setConceptFilterTypeIds(relatedConceptIds);
  };

  return (
    <>
      <div aria-label="related-concepts-list">
        {options?.map((option) => {
          if (currentRelatedConcepts?.get(option)) {
            const {name, count, checked} = currentRelatedConcepts.get(option);
            let finalIcon = conceptsConfig.hasOwnProperty(name) ? conceptsConfig[name]["icon"] : defaultIcon;
            let finalColor = conceptsConfig.hasOwnProperty(name) ? conceptsConfig[name]["color"] : themeColors.defaults.entityColor;
            return (
              <div
                style={{backgroundColor: finalColor, borderStyle: "solid", borderWidth: "1px", borderColor: "#d9d9d9", borderRadius: "4px"}}
                className={styles.conceptItem}
                key={name}
              >
                <HCCheckbox
                  id={name}
                  checked={checked}
                  handleClick={handleColOptionsChecked}
                  handleKeyDown={handleColOptionsChecked}
                  value={name}
                  ariaLabel={`related-concept-check-${name}`}>
                  <DynamicIcons name={finalIcon}/>
                  <span className={styles.conceptName} aria-label={`related-concept-${name}`}>{name}</span>
                  <span className={styles.conceptAmount} aria-label={`related-concept-${name}-filter`}>
                    {/* {filter && SHOW_FILTER(filter)} */}
                    {count > 0 && count}
                  </span>
                </HCCheckbox>
                {count > 0 &&
                    <span className={styles.indicatorContainer} aria-label={`related-concept-${name}-amountbar`}>
                      <HCFacetIndicator percentage={isNaN(count) || count < 1 ? 0 : count * 100 / entityIndicatorData.max} isActive={checked} />
                    </span>
                }
              </div>
            );
          }
        })}
      </div>
      {currentRelatedConcepts.size > MINIMUM_ENTITIES &&
        <div className={styles.more} onClick={onShowMore} data-cy="show-more-related-concepts">
          {(showMore) ? "<< less" : "more >>"}
        </div>
      }
    </>
  );
};

export default RelatedConceptsFacets;
