import React from 'react';
import ReactJson from 'react-json-view';
import {getValByConfig} from '../../util/util';
import "./RecordRaw.scss";

/**
 * Component for showing one or more values for a List of links.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object} config  RecordRaw configuration object.
 * @prop {string} config.title Title of component used for display.
 * @prop {string} config.component Name of component used for display.
 * @prop {string} config.path Object path that will be displayed.
 * @prop {string} config.maxHeight Maximum container height. 
 * @prop {string} config.collapsedLevel Integer value to collapse at a particular depth
 * @prop {string} config.displayDataTypes When set to true, data type labels prefix values
 * @prop {string} config.displayObjectSize When set to true, objects and arrays are labeled with size
 * @prop {string} config.quotesOnKeys set to false to remove quotes from keys (eg. "name": vs. name:)
 * @prop {string} config.indentWidth Set the indent-width for nested objects
 * @prop {string} config.groupArraysAfterLength When an integer value is assigned, arrays will be displayed in groups by count of the value. Groups are displayed with bracket notation and can be expanded and collapsed by clicking on the brackets.
 * @example
 * {
    {
      "component": "RecordRaw",
      "config": {
        "title":"Row data",
        "id": "raw", 
        "path": "person",
        "maxHeight": "400px",
        "collapsedLevel": 2,
        "enableClipboard": false,
        "displayDataTypes": false,
        "quotesOnKeys": false,
        "indentWidth": 2,
        "groupArraysAfterLength": 3,
      }
    },
 */

type Props = {
  data?: any;
  config?: any;
}
const RecordRaw: React.ComponentType<Props> = (props) => {
  const {config, data} = props;
  let actionsData = getValByConfig(data, config);
  let src = actionsData ? actionsData : {};
  let title = config?.title ? config?.title : "";
  let name = config?.name ? config?.name : null;
  let maxHeight = config?.maxHeight ? config?.maxHeight : "500px";
  let displayDataTypes = config?.displayDataTypes ? config?.displayDataTypes : false;
  let quotesOnKeys = config?.quotesOnKeys ? config?.quotesOnKeys : false;
  let displayObjectSize = config?.displayObjectSize ? config?.displayObjectSize : false;
  let indentWidth = config?.indentWidth ? config?.indentWidth : 2;
  let collapsed = config?.collapsedLevel ? config?.collapsedLevel : 2;
  let groupArraysAfterLength = config?.groupArraysAfterLength ? config?.groupArraysAfterLength : 2;
  return (
    <div className="RecordRawContainer" data-testid="record-raw-component">
      {title && <div className="RecordRawlabel">{title}</div>}
      <div className="RecordRawData" style={{maxHeight}}>
        <ReactJson
          src={src}
          name={name}
          enableClipboard={false}
          displayDataTypes={displayDataTypes}
          quotesOnKeys={quotesOnKeys}
          displayObjectSize={displayObjectSize}
          indentWidth={indentWidth}
          iconStyle="triangle"
          collapsed={collapsed}
          groupArraysAfterLength={groupArraysAfterLength} />
      </div>
    </div>
  );
}

export default RecordRaw;