import React from "react";
import styles from "./facet.module.scss";
import {numberConverter} from "../../util/number-conversion";
import {stringConverter} from "../../util/string-conversion";
import HCCheckbox from "../common/hc-checkbox/hc-checkbox";

export const FacetName = (props) => {
  const id = `${stringConverter(props.name)}-${props.facet.value}-checkbox`;
  return (
    <div className={styles.checkContainer} key={props.index} data-testid={props.facet.value} data-cy={stringConverter(props.name) + "-facet-item"}>
      <HCCheckbox
        id={id}
        handleClick={props.handleClick}
        value={props.facet.value}
        label={props.facet.value}
        checked={props.checked.includes(props.facet.value)}
        dataTestId={id}
        tooltip={props.facet.value}
      />
      <div className={styles.count}
        data-cy={`${stringConverter(props.name)}-${props.facet.value}-count`}>{numberConverter(props.facet.count)}</div>
    </div>
  );
};