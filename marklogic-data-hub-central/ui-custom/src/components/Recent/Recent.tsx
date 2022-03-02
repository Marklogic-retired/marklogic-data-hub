import React, { useContext } from "react";
import { DetailContext } from "../../store/DetailContext";
import Chiclet from "../Chiclet/Chiclet";
import Image from "../Image/Image";
import Value from "../Value/Value";
import List from "../List/List";
import "./Recent.scss";
import { getValByConfig } from "../../util/util";
import { ExclamationTriangleFill } from "react-bootstrap-icons";

type Props = {
  data: any;
  config: any
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
const Recent: React.FC<Props> = (props) => {

  const detailContext = useContext(DetailContext);

  const handleNameClick = (e) => {
    detailContext.handleGetDetail(e.target.id);
  };

  const getRecent = () => {
    let res = props.data.map((recent, index) => {
      return (
        <div key={"recent-" + index} className="result">
          {/* TODO icon for alerting
          <div className="alert">
            {recent.alert ? <ExclamationTriangleFill color="#d48b32" size={16} /> : null}
          </div> */}
          <div className="thumbnail"> 
            {props.config.thumbnail ? 
              <Image data={recent} config={props.config.thumbnail.config} />
            : null}
          </div>
          <div className="text">
            <div className="title" onClick={handleNameClick}>
              <Value data={recent} config={props.config.title} getFirst={true} />
            </div>
            <div className="subtitle">
              {props.config.items ? 
                <List data={recent} config={props.config.items} />
              : null}
            </div>
            {props.config.categories ? 
            <div className="categories">
              {getValByConfig(recent, props.config.categories)!.map((s, index2) => {
                return (
                  <Chiclet 
                    key={"category-" + index2} 
                    config={props.config.categories}
                  >{s}</Chiclet>
                )
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
        <div className="recent">{getRecent()}</div>
      ) : 
      <div>No recently visited records</div>
      }
    </div>
  );
};

export default Recent;
