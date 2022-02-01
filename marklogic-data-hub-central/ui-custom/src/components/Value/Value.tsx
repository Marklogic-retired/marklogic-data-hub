import React from "react";
import "./Value.scss";
import { getValByPath } from "../../util/util";

type Props = {
  config?: any;
  data?: any;
  style?: any;
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

    let valueStyle: any = props.config.style ? props.config.style : {};

    return (
        <span 
            id={getValByPath(props.data, props.config.id)} 
            className={props.config.className} 
            style={valueStyle}
            title={val}
        >{val}</span>
    );
};

export default Value;
