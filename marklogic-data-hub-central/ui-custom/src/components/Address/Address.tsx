import React from "react";
import "./Address.scss";
import { getValByPath } from "../../util/util";

type Props = {
  config?: any;
  data?: any;
  style?: any;
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

    const addressStyle: any = props.style ? props.style : {};

    // Get address-containing object (if array, use first element)
    const addressData = props.config.addressPath ? getValByPath(props.data, props.config.addressPath, true) : props.data;

    const street1: any = getValByPath(addressData, props.config.street1, true) || null;
    const street2: any = getValByPath(addressData, props.config.street2, true) || null;
    const city: any = getValByPath(addressData, props.config.city, true) || null;
    const state: any = getValByPath(addressData, props.config.state, true) || null;
    const postal1: any = getValByPath(addressData, props.config.postal1, true) || null;
    const postal2: any = getValByPath(addressData, props.config.postal2, true) || null;

    const addrFormatted: string = display(street1, "", (street2 || city) ? ", " : "") +
                          display(street2, "", city ? ", " : "") +
                          display(city, "", state ? ", " : "") +
                          display(state, "", " ") +
                          display(postal1, "", "") +
                          display(postal2, "-", "");

    return (
        <span className="Address" style={addressStyle} title={addrFormatted}>
            {addrFormatted}
        </span>
    );
};

export default Address;
