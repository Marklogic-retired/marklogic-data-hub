import React, {useState} from "react";
import styles from "./facet.module.scss";
import {numberConverter} from "../../util/number-conversion";
import {stringConverter} from "../../util/string-conversion";
import {Checkbox} from "antd";
import {OverflowDetector} from "react-overflow";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";


export const FacetName = (props) => {
  const [isOverflowed, setisOverflowed] = useState(false);
  const handleOverflowChange = (isOverflowed) => setisOverflowed(isOverflowed);

  return (
    <div className={styles.checkContainer} key={props.index} data-testid={props.facet.value} data-cy={stringConverter(props.name) + "-facet-item"}>
      <OverflowDetector onOverflowChange={handleOverflowChange} style={{width: "180px"}}>
        <div id={props.facet.value + "-tooltipContainer"}>
          <Checkbox
            value={props.facet.value}
            onChange={(e) => props.handleClick(e)}
            checked={props.checked.includes(props.facet.value)}
            className={styles.value}
            data-testid={`${stringConverter(props.name)}-${props.facet.value}-checkbox`}
          >
            <HCTooltip
              text={isOverflowed ? props.facet.value : ""}
              id={"-tooltip"}
              placement="top"
              // id={props.facet.value + "-tooltip"} // DHFPROD-7711 MLTooltip -> Tooltip
            ><span>{props.facet.value}</span></HCTooltip>
          </Checkbox>
        </div>
      </OverflowDetector>
      <div className={styles.count}
        data-cy={`${stringConverter(props.name)}-${props.facet.value}-count`}>{numberConverter(props.facet.count)}</div>
    </div>
  );
};