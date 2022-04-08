import React from 'react';
import {GearFill, CodeSlash, ArrowRepeat} from "react-bootstrap-icons";
import {getValByConfig} from '../../util/util';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import * as FaDictionary from '@fortawesome/free-solid-svg-icons'
import _ from "lodash";
import "./ResultActions.scss"
type Props = {
  data?: any;
  config?: any;
  style?: React.CSSProperties
};

/**
 * Component for showing one or more values for a List of links.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object} config  ResultActions configuration object.
 * @example
 * {
 *  "component": "ResultActions",
    "config": {
      "id": "resultActions",
      "arrayPath": "person.actions.action",
      "action": {
        "icon": "icon",
        "color": "color",
        "url": "url"
      }
    }
 * }
 */

const ResultActions: React.FC<Props> = (props) => {
  const {config, data} = props;

  const getActions = () => {
    let actionsData = getValByConfig(data, config);
    actionsData = _.isNil(actionsData) ? null : (Array.isArray(actionsData) ? actionsData : [actionsData]);
    const links = actionsData?.map((action, index) => {
      const {action: {icon = null, color = null, url = null}} = config;
      if (!icon) return;
      let iconValue: any = _.get(action, icon, null);
      let colorValue: any = _.get(action, color, null);
      let urlValue: any = _.get(action, url, null);
      let iconElement = FaDictionary[iconValue];
      return (
        <a href={urlValue ? urlValue : "#"} target="_blank" className="ResultActions-item" key={index} data-testid={`action-item-${index}`}>
          <span style={{color: colorValue ? colorValue : '#5d6aaa'}}><FontAwesomeIcon icon={iconElement} /></span>
        </a>
      )
    })

    return links;
  }

  return (
    <>
      {getActions()}
    </>
  )
}

export default ResultActions;