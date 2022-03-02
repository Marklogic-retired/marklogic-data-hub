import React from "react";
import Address from "../Address/Address";
import DateTime from "../DateTime/DateTime";
import Image from "../Image/Image";
import Value from "../Value/Value";
import "./List.scss";

type Props = {
    config?: any;
    data?: any;
};

const COMPONENTS = {
    Address: Address,
    DateTime: DateTime,
    Image: Image,
    Value: Value
}

/**
 * Component for displaying a list of values.
 *
 * @component
 * @prop {object} data  Raw data for list.
 * @prop {object[]} config  Array of configuration objects for each list item.
 * @prop {string} config.component Name of component used for display.
 * @prop {object} config.config Configuration object for list item.
 * @prop {string} config.config.arrayPath Path to array of objects in raw data.
 * @prop {string} config.config.path Path to value in raw data (from arrayPath root if arrayPath is set).
 * 
 * @example
 * Array of configuration objects:
 * [
 *  { 
 *      "component": "Value",
 *      "config": {
 *          "arrayPath": "person.email",
 *          "path": "value"
 *      }
 *  },
 *  { 
 *      "component": "DateTime",
 *      "config": {
 *          "arrayPath": "person.createdOn",
 *          "path": "yyyy-MM-dd"
 *      }
 *  }
 * ]
 */
const List: React.FC<Props> = (props) => {

    const getItems = () => {
        let items = props.config && props.config.map((item, index) => {
            if (item.component) {
                return (
                <div key={"item-" + index} className="item">
                    {React.createElement(
                    COMPONENTS[item.component], 
                    { config: item.config, data: props.data, style: item.style }, null
                    )}
                </div>
                );
            } else {
                return (
                <div key={"item-" + index} className="item">
                    <Value data={props.data} config={item} getFirst={true} />
                </div>
                )
            }
        })
        return items;
    }

    return (
        <div className="list">
            {getItems()}
        </div>
    );

};

export default List;
