import React, { useState, useContext } from "react";
import MetadataValue from "../MetadataValue/MetadataValue";
import Table from "react-bootstrap/Table";
import { DetailContext } from "../../store/DetailContext";
import "./DataTableMultiValue.scss";
import {ArrowBarDown, ArrowBarRight, GeoAltFill} from "react-bootstrap-icons";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { getValByPath, getValByPathAsArray } from "../../util/util";
import _ from "lodash";
import GeoMap from "../GeoMap/GeoMap"


type Props = {
  config?: any;
};

/**
 * Component for showing one or more values for a property in a tabular view.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object} config  Data table configuration object.
 * @prop {object} config.id - ID for table, added as element id attribute.
 * @prop {string} config.title - Table label.
 * @prop {string} config.width - Width of table (as CSS width value).
 * @prop {string} dataPath - Path to object values in payload.
 * @prop {object[]} config.cols - Configuration objects for columns.
 * @prop {string} config.cols.title - Column heading title.
 * @prop {string} config.cols.value - Path to value in data payload (relative to dataPath).
 * @prop {string} config.cols.width - Width of column (as CSS width value).
 * @prop {object[]} config.metadata - Configuration objects for value metadata.
 * @prop {string} config.metadata.type - Metadata type (e.g. "block").
 * @prop {string} config.metadata.color - Metadata color (HTML color code).
 * @prop {string} config.metadata.value - Metadata value.
 * @example
 * {
 *   id: "address",
 *   title: "Address",
 *   width: "600px",
 *   dataPath: "path.to.address",
 *   cols: [
 *      {
 *          title: "Street",
 *          value: "path.to.street",
 *          width: "320px"
 *      },
 *      {
 *          title: "City",
 *          value: "path.to.city",
 *          width: "160px"
 *      }
 *   ],
 *   metadata: [
 *     {
 *       type: "block",
 *       color: "#96bde4",
 *       value: "A"
 *     }
 *   ]
 * }
 */
const DataTableMultiValue: React.FC<Props> = (props) => {

    const detailContext = useContext(DetailContext);
    const [hide, setHide] = useState<boolean>(false);

    const handleHide = (e) => {
        setHide(!hide);
    };

    const data: any = (props.config && props.config.dataPath) ? getValByPathAsArray(detailContext.detail, props.config.dataPath) : null;

    let hideClass: string = hide ? "hide" : "";
    let tableStyle: any = {
        width: (props.config && props.config.width) ? props.config.width : "auto"
    };

    const popover = (
        <Popover id="mapPopover">
          <Popover.Body>
            <GeoMap />
          </Popover.Body>
        </Popover>
    );

    return (
        <div className="dataTableMultiValue">
            {data && data.length > 0 &&
            <div className="label">
                <span className="title">{props.config.title}</span>
                {data.length > 1 ?
                    <span className="hide" onClick={handleHide}>
                        {hide ? 
                        <ArrowBarRight 
                            data-testid="hideDown"
                            color="#5d6aaa" 
                            size={18} 
                        /> : 
                        <ArrowBarDown 
                            data-testid="hideUp"
                            color="#5d6aaa" 
                            size={18} 
                        />}
                    </span> : null}
            </div>}
            {data && data.length > 0 &&
            <Table id={props.config.id} size="sm" style={tableStyle} className={hideClass} data-testid={"table-"+ props.config.id}>
            <thead>
                <tr>
                    {_.isArray(props.config.cols) && props.config.cols.map((col, i) => {
                        return (
                            <th key={"head-" + i}>{col.title}</th>
                        );
                    })}
                    {_.isArray(props.config.metadata) && props.config.metadata.map((col, i2) => {
                        return (
                            <th key={"head-" + (i2 + props.config.cols.length)}></th>
                        );
                    })}
                    <th key={"head-map"}></th>
                </tr>
            </thead>
            <tbody>
                {data.map((d, i) => {
                return (
                    <tr key={"row-" + i} className={data.length === 1 ? "singular" : ""}>
                        {_.isArray(props.config.cols) && props.config.cols.map((col, i) => {
                            return (
                                <td key={"data-" + i} className="value" style={{width: col.width}}>
                                    <span>{getValByPath(d, col.value, true)}</span>
                                </td>
                            );
                        })}
                        {_.isArray(props.config.metadata) && props.config.metadata.map((meta, i2) => {
                            return (
                                <td key={"metadata-" + (i2 + props.config.cols.length)} className="metadata">
                                    <MetadataValue config={meta} />
                                </td>
                            );
                        })}
                        <td key={"map"}>
                            <div className="mapTrigger">
                                <OverlayTrigger trigger="click" placement="right" overlay={popover}>
                                    <GeoAltFill color="#5d6aaa" size={19} />
                                </OverlayTrigger>
                            </div>
                        </td>
                    </tr>
                );
                })}
            </tbody>
            </Table>}
        </div>
    );
};

export default DataTableMultiValue;
