import React from 'react';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import "./SocialMedia.scss";
import * as IconDictionary from 'react-bootstrap-icons';
import {getValByPath, getValByConfig} from '../../util/util';
import _ from "lodash";

type Props = {
  data?: any;
  config?: any;
};

/**
 * Component for showing one or more values for a property in a tabular view.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object} config  Social media configuration object.
 * @prop {object} config.site  Social media name configuration object.
 * @prop {object} config.site.arrayPath  Array path to find the social media name.
 * @prop {object} config.site.path  Path to find the social media name.
 * @prop {object} config.url  Social media url configuration object.
 * @prop {object} config.url.arrayPath  Array path to find the social media url.
 * @prop {object} config.url.path  Path to find the social media url.
 * @prop {object} config.sites  Dictionary of object with the configuration (icon,color ...) of each social media.
 * @example
 * {
      "component": "SocialMedia",
      "config": {
        "title": "Social Media",
        "social": {
            "arrayPath": "person.socials.social",
            "site": "site",
            "handle":"handle",
            "url": "address"
          },
        "sites": {
          "facebook": {
            "title": "facebook",
            "icon": "Facebook",
            "color": "#3B5998",
            "size" : 24
          },
          "twitter": {
            "title": "twitter",
            "icon": "Twitter",
            "color": "#00ACEE",
            "size" : 24
          },
          "linkedin": {
            "title": "linkedin",
            "icon": "Linkedin",
            "color": "#0E76A8",
            "size" : 24
          },
          "instagram": {
            "title": "instagram",
            "icon": "Instagram",
            "color": "#8134AF",
            "size" : 24
          },
          "youtube": {
            "title": "youtube",
            "icon": "Youtube",
            "color": "#c4302b",
            "size" : 24
          }
        }
      }
    }
 */
const SocialMedia: React.FC<Props> = (props) => {
  const {sites, social} = props.config;
  const {site, handle, url} = social;


  let socials = getValByConfig(props.data, social);
  socials = _.isNil(socials) ? null : (Array.isArray(socials) ? socials : [socials]);

  const getItems = () => {
    if (Object.keys(sites).length === 0 || !socials || socials.length === 0) return [];

    const icons = socials.reduce((acc, socialItem, index) => {
      let siteVal: any = getValByPath(socialItem, site, true);
      let handleVal: any = getValByPath(socialItem, handle, true);
      let urlVal: any = getValByPath(socialItem, url, true);

      if (!sites[siteVal]) return acc;
      const {title, color, icon, size = 18} = sites[siteVal];
      if (!icon || !IconDictionary[icon]) return acc;

      const Icon = IconDictionary[icon];
      const link = (
        <OverlayTrigger key={`${title}-${index}`} placement="bottom" overlay={props => (
          <Tooltip {...props}>{urlVal ? urlVal : ""}</Tooltip>
        )}>
          <a target="_blank" href={urlVal ? urlVal : "#"}>
            <Icon color={color} size={size} />
            <span className="handle">{handleVal}</span>
          </a>
        </OverlayTrigger>);
      const _icons = [...acc, link];
      return _icons
    }, []);
    return icons;
  }
  return socials && socials.length > 0 ? (<div className="SocialMedia">
    <div className="label">
      <span className="title">{props.config.title}</span>
    </div>
    <div data-testid="social-items" className="social-items">
      {
        getItems()
      }
    </div>
  </div>) : null;
}

export default SocialMedia