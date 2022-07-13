import React, {useState} from 'react';
import {ChevronDoubleRight, ChevronDoubleLeft, EyeFill} from "react-bootstrap-icons";
import {getValByPath, getValByConfig} from '../../util/util';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import * as FaDictionary  from '@fortawesome/free-solid-svg-icons'
import "./LinkList.scss";
import _ from "lodash";

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
 * @prop {object} config  LinkList configuration object.
 * @example
 * {
 *  "component": "LinkList",
      "config": {
        "id": "linkList",
        "title": "Record Actions",
        "arrayPath": "person.links.link",
        "link": {
          "icon": "icon",
          "label": "label",
          "url": "url"
        }
      }
 * }
 */

const LinkList: React.FC<Props> = (props) => {
  const [collapse, setCollapse] = useState(true);
  const {data, config} = props;
  const handleClick = () => {
    setCollapse(!collapse)
  }
  const getLinks = () => {
    let linksData = getValByConfig(data, config);
    linksData = _.isNil(linksData) ? null : (Array.isArray(linksData) ? linksData : [linksData]);
    const links = linksData?.map((link, index) => {
      const {link: {icon, label, url}} = config;
      let iconValue: any = getValByPath(link, icon);
      let labelValue: any = getValByPath(link, label);
      let urlValue: any = getValByPath(link, url);
      let iconElement = FaDictionary[iconValue];
      return (
        <a href={urlValue ? urlValue : "#"} target="_blank" className="LinkList-item" key={index}>
          <span><FontAwesomeIcon icon={iconElement} /></span>
          <span className="LinkList-item-label">{labelValue}</span>
        </a>
      )
    })
    return links;
  }
  return (
    <div className="LinkList" data-testid="link-List">
      <div className="LinkList-container">
        <div className={`LinkList-data ${collapse ? 'collapse' : ''}`} data-testid="link-List-data">
          {getLinks()}
        </div>
        <div className="LinkList-button" onClick={handleClick} data-testid="link-List-button">
          <span className="LinkList-button-label">
            {config?.title}
          </span>
          {
            collapse ?
              <ChevronDoubleRight /> : <ChevronDoubleLeft />
          }
        </div>
      </div>
    </div>
  )
}


export default LinkList