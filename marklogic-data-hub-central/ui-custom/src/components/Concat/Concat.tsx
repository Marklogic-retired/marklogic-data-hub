import React from "react";
import { getValByConfig, getFormattedDateTime } from "../../util/util";
import "./Concat.scss";
import _ from "lodash";

type Props = {
    config?: any;
    data?: any;
    className?: string;
    style?: any;
};

/**
 * Component for displaying multiple concatenated values.
 *
 * @component
 * 
 * @example
 */
const Concat: React.FC<Props> = (props) => {

    const getVal = (config) => {
        let val;
        val = getValByConfig(props.data, config, true);

        if (config.type === "DateTime") {
            val = getFormattedDateTime(val, config.format, config.from);
        }
    
        // Handle prefix/suffix during display (different from prepend/append during extraction)
        if (val && config?.prefix) {
            val = config?.prefix.concat(val);
        }
        if (val && config?.suffix) {
            val = val.concat(config?.suffix);
        }

        return val;
    }

    let concatArray = props.config && props.config.items?.map(config => {
        // Handle string-only case
        if (_.isString(config)) {
            return config;
        } else {
            return getVal(config);
        }
    })
    const concatVals = concatArray.join("");

    let concatClassName: any = props.className ? props.className : props.config?.className ? props.config.className : "concat";
    let concatStyle: any = props.style ? props.style : props.config?.style ? props.config.style : {};
    let concatTitle: string = concatVals;

    return (
        <span 
            className={concatClassName} 
            style={concatStyle} 
            title={concatTitle} 
            data-testid="concatId"
        >
            {concatVals}
        </span>
    );

};

export default Concat;
