import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup, faKey} from "@fortawesome/free-solid-svg-icons";
import arrayIcon from "../../../assets/icon_array.png";
import styles from "./modeling-legend.module.scss";

const ModelingLegend: React.FC = () => {

  return (
    <div className={styles.legend}>
      <span className={styles.modeledRelationshipIcon}/>
      <div data-testid="relationshipIconLegend" className={styles.relationshipLegendText}>Modeled Relationship</div>
      <div data-testid="foreignKeyIconLegend" className={styles.foreignKeyLegendText}>
        <FontAwesomeIcon className={styles.foreignKeyIcon} icon={faKey}/> Foreign Key
      </div>
      <div data-testid="multipleIconLegend" className={styles.multipleLegendText}>
        <img className={styles.arrayImage} src={arrayIcon} alt={""}/> Multiple Values
      </div>
      <div data-testid="structuredIconLegend" className={styles.structuredLegendText}>
        <FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> Structured Type
      </div>
    </div>
  );
};

export default ModelingLegend;