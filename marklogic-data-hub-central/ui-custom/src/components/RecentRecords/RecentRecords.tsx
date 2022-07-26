import React, {useContext} from "react";
import {DetailContext} from "../../store/DetailContext";
import Chiclet from "../Chiclet/Chiclet";
import Concat from "../Concat/Concat";
import Image from "../Image/Image";
import Value from "../Value/Value";
import List from "../List/List";
import "./RecentRecords.scss";
import {getValByConfig} from "../../util/util";
import _ from "lodash";
import {ExclamationTriangleFill} from "react-bootstrap-icons";

type Props = {
  data: any;
  config: any
};

const COMPONENTS = {
    Concat: Concat,
    Value: Value
};

/**
 * Component for showing recently visited records.
 *
 * @component
 * @prop {object} data  Raw data.
 * @prop {object} config  Configuration object.
 * @prop {string} config.id  Path to ID.
 * @prop {object} config.thumbnail  Thumbnail configuration object.
 * @prop {string} config.thumbnail.path  Path to source URL.
 * @prop {string} config.thumbnail.alt  Alternative image text.
 * @prop {string} config.thumbnail.style  Optional array of CSS styles.
 * @prop {string} config.title  Path to title.
 * @prop {string} config.title.id  Path to ID for hyperlink.
 * @prop {string} config.title.path  Path to title in raw data.
 * @prop {object} config.items  Array of list configuration objects.
 * @prop {string} config.categories  Categories configuration object.
 * @prop {string} config.categories.colors  Dictionary of category names and HTML colors.
 *
 * @example
 * Configuration object
 * {
 *  "thumbnail": {
 *      "component": "Image",
 *      "config": {
 *          "path": "person.image",
 *          "alt": "recent thumbnail",
 *          "style": {
 *              "width": "70px",
 *              "height": "70px"
 *          }
 *      }
 *  },
 *  "title": {
 *      "id": "uri",
 *      "path": "person.id"
 *  },
 *  "items": [
 *      {
 *          "component": "Value",
 *          "config": {
 *              "arrayPath": "person.email",
 *              "path": "value"
 *          }
 *      }
 *  ],
 *  "categories": {
 *      "arrayPath": "person.sources",
 *      "path": "source",
 *      "colors": {
 *          "source1": "#d5e1de",
 *          "source2": "#ebe1fa"
 *      }
 *   }
 * }
 */
const RecentRecords: React.FC<Props> = (props) => {

  const detailContext = useContext(DetailContext);

  const handleTitleClick = (id) => {
    detailContext.handleGetDetail(id);
  };

  // Handle both singular and array cases for categories
  const getCategories = (results, config) => {
    let res = getValByConfig(results, config);
    return _.isArray(res) ? res : [res];
  };

  const getRecent = () => {
    let res = props.data.map((recent, index) => {
      const configEntityType = recent.entityType && props.config.entities[recent.entityType];
      // Don't show if no configuration for entity type
      if (!props.config.entities[recent.entityType]) return;
      let titleValue: any, idValue: any;
      if (configEntityType.title?.component && configEntityType.title?.config) {
        titleValue = (<span>
            {React.createElement(
                COMPONENTS[configEntityType.title.component], 
                { config: configEntityType.title.config, data: recent }, null
            )}
            </span>);   
        if (configEntityType.title?.id) {
            idValue = getValByConfig(recent, configEntityType.title.id);
        }
      } else {
        if (recent?.uri) {
            titleValue = recent?.uri;
            idValue = recent?.uri;
        }
      }
      return (
        <div key={"recent-" + index} className="result">
          {/* TODO icon for alerting
          <div className="alert">
            {recent.alert ? <ExclamationTriangleFill color="#d48b32" size={16} /> : null}
          </div> */}
          <div className="thumbnail">
            {configEntityType.thumbnail ?
              <Image data={recent} config={configEntityType.thumbnail.config} />
              : null}
          </div>
          <div className="text">
            <div className="title" onClick={e => handleTitleClick(idValue)}>
                {titleValue}
            </div>
            <div className="subtitle">
              {configEntityType.items ?
                <List data={recent} config={configEntityType.items} />
                : null}
            </div>
            {configEntityType.categories ?
              <div className="categories">
                {getCategories(recent, configEntityType.categories)!.map((s, index2) => {
                  return (
                    <Chiclet
                      key={"category-" + index2}
                      config={configEntityType.categories}
                    >{s}</Chiclet>
                  );
                })}
              </div> : null}
          </div>
        </div>
      );
    });
    return res;
  };

  return (
    <div>
      {(props.data && props.data.length > 0) ? (
        <div className="recentRecords">{getRecent()}</div>
      ) :
        <div className="none-found">No recently visited records found.</div>
      }
    </div>
  );
};

export default RecentRecords;
