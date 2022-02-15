import React from "react";
import "./Value.scss";
import { getValByPath } from "../../util/util";

type Props = {
  config?: any;
  data?: any;
  style?: any;
  title?: any;
  getFirst?: boolean;
};

/**
 * Component for showing value in colored container.
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
        val = getValByPath(props.data, props.config.path, props.getFirst! );
    }

    if (val && props.config?.prefix) {
        val = props.config?.prefix.concat(val);
    }

    if (val && props.config?.suffix) {
        val = val.concat(props.config?.suffix);
    }

    let valueClassName: any = props.style ? props.style : props.config?.style ? props.config.style : "";
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
