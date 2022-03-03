import React, {useContext} from 'react';
import "./SocialMedia.scss";
import * as IconDictionary from 'react-bootstrap-icons';
import {getValByConfig} from '../../util/util';
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
        "site": {
          "arrayPath": "result[0].extracted.person.socials.social",
          "path": "site"
        },
        "url": {
          "arrayPath": "result[0].extracted.person.socials.social",
          "path": "address"
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
  const {sites, site, url} = props.config;


  let socialsName = getValByConfig(props.data, site);
  socialsName = _.isNil(socialsName) ? null : (Array.isArray(socialsName) ? socialsName : [socialsName]);
  let urls = getValByConfig(props.data, url);
  urls = _.isNil(urls) ? null : (Array.isArray(urls) ? urls : [urls]);

  const getIcons = () => {
    if (Object.keys(sites).length === 0 || !socialsName || socialsName.length === 0) return [];

    const icons = socialsName.reduce((acc, social, index) => {
      if (!sites[social]) return acc;
      const {title, color, icon, size = 18} = sites[social];
      if (!icon || !IconDictionary[icon]) return acc;

      const Icon = IconDictionary[icon];
      const _icons = [...acc, (<a key={`${title}-${index}`} target="_blank" href={urls[index] ? urls[index] : "#"}><Icon color={color} size={size}/></a>)];
      return _icons
    }, []);
    return icons;
  }
  return socialsName && socialsName.length > 0 ? (<div className="SocialMedia">
    <div className="label">
      <span className="title">{props.config.title}</span>
    </div>
    <div data-testid="social-icons" className="social-icons">
      {
        getIcons()
      }
    </div>
  </div>) : null;
}

export default SocialMedia