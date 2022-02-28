import React from "react";
import "./Value.scss";
import { getValByPath, getValByConfig } from "../../util/util";

type Props = {
  config?: any;
  data?: any;
  className?: string;
  style?: any;
  title?: any;
  getFirst?: boolean;
};

/**
 * Component for showing normal value.
 *
 * @component
 * @example
 * TBD
 */
const Value: React.FC<Props> = (props) => {

    let val;
    if (props.children) {
        val = props.children;
    } else {
        val = getValByConfig(props.data, props.config, true);
    }

    if (val && props.config?.prefix) {
        val = props.config?.prefix.concat(val);
    }

    if (val && props.config?.suffix) {
        val = val.concat(props.config?.suffix);
    }

    let valueClassName: any = props.className ? props.className : props.config?.className ? props.config.className : "";
    let valueStyle: any = props.style ? props.style : props.config?.style ? props.config.style : {};
    let valueTitle: string = val;

    return (
        <span 
            id={props.config?.id ? getValByPath(props.data, props.config.id): null} 
            className={valueClassName} 
            style={valueStyle}
            title={valueTitle}
        >{val}</span>
    );
};

export default Value;
