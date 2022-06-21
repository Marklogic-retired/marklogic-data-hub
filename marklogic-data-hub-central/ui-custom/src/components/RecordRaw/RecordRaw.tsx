import React from 'react';
import ReactJson from 'react-json-view';
import {getValByConfig} from '../../util/util';
import "./RecordRaw.scss";

/**
 * Component for showing one or more values for a List of links.
 *
 * @component
 * @prop {string} component Name of component used for display.
 * @prop {object} config  RecordRaw configuration object.
 * @prop {string} config.title Widget label (optional).
 * @prop {string} config.name Property name at JSON root.
 * @prop {string} config.path Path to JSON object to be displayed.
 * @prop {string} config.maxHeight Maximum height of container. 
 * @prop {string} config.collapsedLevel Depth at which to collapse initially.
 * @prop {string} config.displayDataTypes When true, display data type labels.
 * @prop {string} config.displayObjectSize When true, display size of objects and arrays.
 * @prop {string} config.quotesOnKeys When false, remove quotes from keys (eg. "name": vs. name:).
 * @prop {string} config.indentWidth Indent width for nested objects.
 * @prop {string} config.groupArraysAfterLength Size by which to group arrays. User can click to expand/collapse.
 * @example
 * {
    {
      "component": "RecordRaw",
      "config": {
        "title":"Record Data",
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