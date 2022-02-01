import React from "react";
import "./Chiclet.scss";
import {colors} from "../../config/colors";
import { getValByPath } from "../../util/util";

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
        val = getValByPath(props.data, props.config.path, true);
    }

    const chicletColors = props.config.colors ? 
    colors[props.config.colors] ? colors[props.config.colors] : {} : {};

    let chicletStyle: any = props.config.style ? props.config.style : {};
    chicletStyle = Object.assign({backgroundColor: chicletColors[val]}, chicletStyle);

    return (
        <span className="Chiclet" style={Object.assign({backgroundColor: chicletColors[val]}, chicletStyle)}>
            {val}
        </span>
    );
};

export default Chiclet;
