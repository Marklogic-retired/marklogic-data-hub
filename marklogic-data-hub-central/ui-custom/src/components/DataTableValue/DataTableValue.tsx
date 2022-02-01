import React, { useState, useContext } from "react";
import MetadataValue from "../MetadataValue/MetadataValue";
import Table from "react-bootstrap/Table";
import { DetailContext } from "../../store/DetailContext";
import "./DataTableValue.scss";
import {ArrowBarDown, ArrowBarRight, EnvelopeFill, TelephoneFill} from "react-bootstrap-icons";
import { getValByPathAsArray } from "../../util/util";
import _ from "lodash";

type Props = {
  config?: any
};

/**
 * Component for showing one or more values for a single property value in a tabular view.
 *
 * @component
 * @prop {object} config - Data table configuration object.
 * @prop {object} config.id - ID for table, added as element id attribute.
 * @prop {string} config.title - Table label.
 * @prop {string} config.dataPath - Path to value in payload.
 * @prop {string} config.width - Width of table (as CSS width value).
 * @prop {object[]} config.metadata - Configuration objects for value metadata.
 * @prop {string} config.metadata.type - Metadata type (e.g. "block").
 * @prop {string} config.metadata.color - Metadata color (HTML color code).
 * @prop {string} config.metadata.value - Metadata value.
 * @example
 * {
 *   title: "Name",
 *   dataPath: "path.to.name",
 *   width: "300px",
 *   metadata: [
 *     {
 *       type: "block",
 *       color: "#96bde4",
 *       value: "A"
 *     }
 *   ]
 * }
 */
const DataTableValue: React.FC<Props> = (props) => {

    const detailContext = useContext(DetailContext);
    const [hide, setHide] = useState<boolean>(false);

    const handleHide = (e) => {
        setHide(!hide);
    };

    const data = (props.config && props.config.dataPath) ? getValByPathAsArray(detailContext.detail, props.config.dataPath) : null;

    let hideClass: string = hide ? "hide" : "";
    let tableStyle: any = {
        width: (props.config && props.config.width) ? props.config.width : "auto"
    };
    
    // TODO make icon configurable from any available in library
    const getIcon = (type) => {
        if (type === "phone") {
            return (<div>
                <TelephoneFill color="#5fc9aa" size={14} data-testid={"icon-"+ type} />
            </div>);
        } else if (type === "email") {
            return (<div>
                <EnvelopeFill color="#5fc9aa" size={14} data-testid={"icon-"+ type} />
            </div>);
        }
    };

    return (
        <div className="dataTableValue">
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
                <tbody>
                    {data.map((d, i) => {
                        return (
                            <tr key={"row-" + i} className={data.length === 1 ? "singular" : ""}>
                                {props.config.icon &&
                                <td key={"icon-" + i} className="icon">
                                    {i === 0 ? getIcon(props.config.icon) : null}
                                </td>}
                                <td key={"data-" + i} className="value">
                                    <div>{d}</div>
                                </td>
                                {_.isArray(props.config.metadata) && props.config.metadata.map((meta, i2) => {
                                return (
                                    <td key={"metadata-" + i2} className="metadata">
                                        <MetadataValue config={meta} />
                                    </td>
                                );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </Table>}
        </div>
    );
};

export default DataTableValue;
