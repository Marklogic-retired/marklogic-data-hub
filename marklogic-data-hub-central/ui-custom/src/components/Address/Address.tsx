import React from "react";
import "./Address.scss";
import { getValByPath, getValByConfig } from "../../util/util";

type Props = {
  config?: any;
  data?: any;
  style?: any;
  className?: any;
};

/**
 * Component for showing address information for a location.
 *
 * @component
 * @example
 * TBD
 */
const Address: React.FC<Props> = (props) => {

    const display = (val, pre, post) => {
        return val ? "".concat(pre, val, post) : "";
    }

    const addressClassName: any = props.className ? props.className : props.config?.className ? props.config.className : "";
    const addressStyle: any = props.style ? props.style : (props.config.style ? props.config.style : {});

    // Get address-containing object (if array, use first element)
    let addressData = props.config.arrayPath ? getValByConfig(props.data, props.config, true) : props.data;

    const street1: any = getValByPath(addressData, props.config.street1, true) || null;
    const street2: any = getValByPath(addressData, props.config.street2, true) || null;
    const city: any = getValByPath(addressData, props.config.city, true) || null;
    const state: any = getValByPath(addressData, props.config.state, true) || null;
    const postal1: any = getValByPath(addressData, props.config.postal1, true) || null;
    const postal2: any = getValByPath(addressData, props.config.postal2, true) || null;
    const country: any = getValByPath(addressData, props.config.country, true) || null;

    const addrFormatted: string = display(street1, "", (street2 || city) ? ", " : "") +
                          display(street2, "", city ? ", " : "") +
                          display(city, "", state ? ", " : "") +
                          display(state, "", " ") +
                          display(postal1, "", postal2 ? "" : " ") +
                          display(postal2, "-", " ") +
                          display(country, "", "");

    return (
        <span className={addressClassName ? addressClassName : "Address"} style={addressStyle} title={addrFormatted}>
            {addrFormatted}
        </span>
    );
};

export default Address;
