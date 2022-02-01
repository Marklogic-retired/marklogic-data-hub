import React from "react";
import "./DateTime.scss";
import { getValByPath } from "../../util/util";
import { DateTime as dt } from "luxon";

type Props = {
  config?: any;
  data?: any;
  style?: any;
};

/**
 * Component for showing date and time information.
 *
 * @component
 * @example
 * TBD
 */
const DateTime: React.FC<Props> = (props) => {

    let val;
    if (props.children) {
        val = props.children;
    } else {
        val = getValByPath(props.data, props.config.path, true);
    }

    let formattedDateTime;
    formattedDateTime = dt.fromISO(val).toFormat(props.config.format);
    formattedDateTime = props.config.label ? props.config.label + " " + formattedDateTime : formattedDateTime;

    const dateTimeStyle: any = props.style ? props.style : {};

    return (
        <span className="DateTime" style={dateTimeStyle}>
            {formattedDateTime}
        </span>
    );
};

export default DateTime;
