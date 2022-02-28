import React from "react";
import "./DateTime.scss";
import { getValByConfig } from "../../util/util";
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
        val = getValByConfig(props.data, props.config, true)
    }

    let formattedDateTime;
    formattedDateTime = dt.fromISO(val).toFormat(props.config.format);

    if (formattedDateTime && props.config?.prefix) {
        formattedDateTime = props.config?.prefix.concat(formattedDateTime);
    }

    if (formattedDateTime && props.config?.suffix) {
        formattedDateTime = formattedDateTime.concat(props.config?.suffix);
    }

    const dateTimeStyle: any = props.style ? props.style : {};

    return (
        <span className="DateTime" style={dateTimeStyle}>
            {formattedDateTime}
        </span>
    );
};

export default DateTime;
