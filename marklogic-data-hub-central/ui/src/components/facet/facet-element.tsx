import React from "react";
import styles from "./facet.module.scss";
import {numberConverter} from "@util/number-conversion";
import {stringConverter} from "@util/string-conversion";
import {DynamicIcons, HCCheckbox, HCFacetIndicator} from "@components/common";
//import * as FontIcon from "react-icons/fa";
import {defaultConceptIcon} from "@config/explore.config";

export const FacetName = (props) => {
  const facetValue = props.category && props.category === "concept" ? props.facet.value.split("/").pop() : props.facet.value;
  const id = `${stringConverter(props.name)}-${facetValue}-checkbox`;
  const percentage = isNaN(props.facet.max) ? 0 : props.facet.count*100/props.facet.max;
  const isActive = props.checked.includes(props.facet.value);
  const facetLabel = props.category && props.category === "concept" ? <span><DynamicIcons name={defaultConceptIcon}/> {props.facet.name}</span> : props.facet.value;
  return (
    <div className={styles.checkContainer} key={props.index} data-testid={props.facet.value} data-cy={stringConverter(props.name) + "-facet-item"}>
      <span className={styles.checkbox}>
        <HCCheckbox
          id={id}
          handleClick={props.handleClick}
          value={props.facet.value}
          label={facetLabel}
          checked={isActive}
          dataTestId={id}
          tooltip={facetValue}
        />
      </span>
      <div
        className={styles.count}
        data-cy={`${stringConverter(props.name)}-${props.facet.value}-count`}
      >
        <HCFacetIndicator percentage={percentage} isActive={isActive} identifier={id} />
        <span className={`${styles.facetCount} d-inline-block text-end`}>
          {numberConverter(props.facet.count)}
        </span>
      </div>
    </div>
  );
};