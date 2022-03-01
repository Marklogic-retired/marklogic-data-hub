import React from "react";
import "./Chiclet.scss";
import { getValByConfig } from "../../util/util";

type Props = {
  config?: any;
  data?: any;
  style?: any;
};

/**
 * Component for showing value in colored container.
 *
 * @component
 * @example
 * TBD
 */
const Chiclet: React.FC<Props> = (props) => {

    let val;
    if (props.children) {
        val = props.children;
    } else {
        val = getValByConfig(props.data, props.config, true)
    }

    const chicletColors = props.config.colors || {};
    const defaultColor = "#dfdfdf";
    
    let chicletStyle: any = props.config.style ? props.config.style : {};
    chicletStyle = Object.assign({
        backgroundColor: chicletColors[val] ? chicletColors[val] : defaultColor
    }, chicletStyle);

    return (
        <span className="Chiclet" style={chicletStyle}>
            {val}
        </span>
    );
};

export default Chiclet;
