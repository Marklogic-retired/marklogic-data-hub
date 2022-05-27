import React from "react";
import styles from "./facet.module.scss";
import {numberConverter} from "@util/number-conversion";
import {stringConverter} from "@util/string-conversion";
import {HCCheckbox, HCFacetIndicator} from "@components/common";

export const FacetName = (props) => {
  const id = `${stringConverter(props.name)}-${props.facet.value}-checkbox`;
  const percentage = isNaN(props.facet.max) ? 0 : props.facet.count*100/props.facet.max;
  const isActive = props.checked.includes(props.facet.value);
  return (
    <div className={styles.checkContainer} key={props.index} data-testid={props.facet.value} data-cy={stringConverter(props.name) + "-facet-item"}>
      <HCCheckbox
        id={id}
        handleClick={props.handleClick}
        value={props.facet.value}
        label={props.facet.value}
        checked={isActive}
        dataTestId={id}
        tooltip={props.facet.value}
      />
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