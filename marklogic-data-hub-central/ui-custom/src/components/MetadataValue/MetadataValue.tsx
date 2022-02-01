import React from "react";
import Chiclet from "../Chiclet/Chiclet";
import DateTime from "../DateTime/DateTime";
import Value from "../Value/Value";
import Table from "react-bootstrap/Table";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import "./MetadataValue.scss";

type Props = {
  config?: any;
  data?: any;
  styles?: any;
};

// TODO using mock data temporarily
const data = [
    {
        name: "New York Times",
        timestamp: "2021-11-19T01:35:35.296391-08:00"
    },
    {
        name: "Los Angeles Times",
        timestamp: "2021-12-21T11:29:44.296391-08:00"
    },
    {
        name: "USA Today",
        timestamp: "2022-01-05T18:20:03.296391-08:00"
    }
];

/**
 * Component for showing metadata in the form of square icons.
 *
 * @component
 * @example
 * TBD
 */
const MetadataValue: React.FC<Props> = (props) => {

    const displayValue = (data, config) => {
        if (config.type === "datetime") {
            return <DateTime config={config} data={data} />;
        } else if (config.type === "chiclet") {
            return <Chiclet config={config} data={data} />;
        }
        return <Value data={data} config={config} />;
    };

    const getPopover = () => {
        if (props.config.popover) { return (
            <Popover id="popover-basic">
                <Popover.Header>{props.config.popover.title}</Popover.Header>
                <Popover.Body>
                    <Table size="sm"><tbody>{data.map((d, i) => {return (
                        <tr key={"row-" + i}>
                            {props.config.popover.cols.map((col, i2) => { return (
                                <td key={"col-" + i2} className={col.type}>{displayValue(d, col)}</td>
                            )})}
                        </tr>
                    )})}</tbody></Table>
                </Popover.Body>
            </Popover>
        )} else {
            return <div></div>;
        }
    };

    const getMetadata = () => { return (
        <div 
            className={props.config.popover ? "hasPopover" : ""} 
            style={{backgroundColor: props.config.color ? props.config.color : "lightgray"}}
        >
            {props.config.value}
        </div>
    )};

    const getOverlay = () => { return (
        <OverlayTrigger 
            trigger="click" 
            placement={props.config.placement ? props.config.placement : "right"} 
            overlay={getPopover()}
        >
            {getMetadata()}
        </OverlayTrigger>
    )};

    return (
        <span className="MetadataValue">
            { props.config.popover ? getOverlay() : getMetadata() }
        </span>
    );
};

export default MetadataValue;
