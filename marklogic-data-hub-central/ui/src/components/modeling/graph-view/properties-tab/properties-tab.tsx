import React, {useState} from "react";
import PropertyTable from "../../property-table/property-table";
import styles from "./properties-tab.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup, faKey} from "@fortawesome/free-solid-svg-icons";
import arrayIcon from "../../../../assets/icon_array.png";

interface Props {
  entityTypeData: any;
  canWriteEntityModel: any;
  canReadEntityModel: any;
}


const PropertiesTab: React.FC<Props> = (props) => {
  const [showLegend, setShowLegend] = useState(false);

  const toggleLegend = () => {
    if (showLegend) {
      setShowLegend(false);
    } else {
      setShowLegend(true);
    }
  };

  const LegendShowHide =
    <div>
      {showLegend ?
        <div className={styles.legend}>
          <div data-testid="foreignKeyIconLegend" className={styles.foreignKeyLegendText}>
            <FontAwesomeIcon className={styles.foreignKeyIcon} icon={faKey}/> Foreign Key Relationship
          </div>
          <div data-testid="multipleIconLegend" className={styles.legendText}>
            <img className={styles.arrayImage} src={arrayIcon} alt={""}/> Multiple
          </div>
          <div data-testid="structuredIconLegend" className={styles.legendText}>
            <FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> Structured Type
          </div>
          <a data-testid="hideLegendLink" onClick={() => toggleLegend()}>Hide Legend &lt;&lt;</a>
        </div>
        :
        <a data-testid="showLegendLink" onClick={() => toggleLegend()}>Show Legend &gt;&gt;</a>
      }
    </div>;

  return (
    <div>
      {LegendShowHide}
      <PropertyTable
        entityName={props.entityTypeData?.entityName}
        definitions={props.entityTypeData?.model.definitions}
        canReadEntityModel={props.canReadEntityModel}
        canWriteEntityModel={props.canWriteEntityModel}
        sidePanelView={true}
      />
    </div>
  );
};

export default PropertiesTab;