import React, { useContext } from "react";
import { DetailContext } from "../../store/DetailContext";
import styles from "./Recent.module.scss";
import { getValByPath, getValByPathAsArray } from "../../util/util";
import {ExclamationTriangleFill} from "react-bootstrap-icons";
import {colors} from "../../config/colors";

type Props = {
  data: any;
  config: any
};

/**
 * Component for showing recently viewed records.
 *
 * @component
 * @prop {object} data Data payload.
 * @prop {object} config  Configuration object.
 * @prop {string} config.id  Path to ID.
 * @prop {object} config.thumbnail  Thumbnail configuration object.
 * @prop {string} config.thumbnail.src  Thumbnail source URL.
 * @prop {string} config.thumbnail.width  Thumbnail width (in pixels).
 * @prop {string} config.thumbnail.height  Thumbnail height (in pixels).
 * @prop {string} config.title  Path to title.
 * @prop {object} config.address  Address configuration object.
 * @prop {string} config.address.street  Path to street.
 * @prop {string} config.address.city  Path to city.
 * @prop {string} config.address.state  Path to state.
 * @prop {string[]} config.address.zip  Array of paths to 5-digit and 4-digit codes.
 * @prop {string[]} config.items  Array of paths to properties to display.
 * @prop {string} config.categories  Path to array of sources.
 * @example
 * {
 *   id: "personId",
 *   thumbnail: {
 *     src: "imageUrl",
 *     width: "100px",
 *     height: "100px"
 *   },
 *   title: "name",
 *   address: {
 *     street: "address.street",
 *     city: "address.city",
 *     state: "address.state",
 *     zip: ["address.zip.fiveDigit", "address.zip.plusFour"]
 *   },
 *   items: ["phone", "email"],
 *   categories: "sources"
 * }
 */
const Recent: React.FC<Props> = (props) => {

  const detailContext = useContext(DetailContext);

  const handleNameClick = (e) => {
    console.log("handleNameClick", e);
    detailContext.handleDetail(e.target.id);
  };

  const getRecent = () => {
    let res = props.data.map((recent, index) => {
      let items = props.config.items.map((it, index) => {
        return (
          <div key={"item-" + index} className={styles.item}>
            {getValByPath(recent, it)}
          </div>
        );
      });
      return (
        <div key={"recent-" + index} className={styles.result}>
          <div className={styles.alert}>
            {recent.alert ? <ExclamationTriangleFill color="#d48b32" size={16} /> : null}
          </div>
          <div className={styles.thumbnail}>
            <img
              src={getValByPath(recent, props.config.thumbnail.src)}
              alt={getValByPath(recent, props.config.title)}
              style={{width: props.config.thumbnail.width, height: props.config.thumbnail.height}}
            ></img>
          </div>
          <div className={styles.text}>
            <div className={styles.title} id={getValByPath(recent, props.config.id)} onClick={handleNameClick}>
              {getValByPath(recent, props.config.title)}
            </div>
            <div className={styles.address}>
              {getValByPath(recent, props.config.address.street)},&nbsp;
              {getValByPath(recent, props.config.address.city)},&nbsp;
              {getValByPath(recent, props.config.address.state)}&nbsp;
              {getValByPath(recent, props.config.address.zip[0])}-
              {getValByPath(recent, props.config.address.zip[1])}
            </div>
            <div className={styles.items}>
              {items}
            </div>
            <div className={styles.categories}>
              {getValByPathAsArray(recent, props.config.categories).map((s, i) => {
                return (
                  <div key={"category-" + i} style={{backgroundColor: colors["sourcesColors"][s]}}>{s}</div>
                )
              })}
            </div>
          </div>
        </div>
      );
    });
    return res;
  };

  return (
    <div>
      {(props.data && props.data.length > 0) ? (
        <div className={styles.recent}>{getRecent()}</div>
      ) : null
      }
    </div>
  );
};

export default Recent;
