import React, {useContext, useState} from "react";
import styles from "./side-panel.module.scss";
import {MLTooltip} from "@marklogic/design-system";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {ModelingTooltips} from "../../../../config/tooltips.config";
import {CloseOutlined} from "@ant-design/icons";
import {Menu} from "antd";
import {ModelingContext} from "../../../../util/modeling-context";

type Props = {
  entityTypes: any;
  onCloseSidePanel: () => void;
  deleteEntityClicked: (selectedEntity) => void;
};

const DEFAULT_TAB = "properties";

const GraphViewSidePanel: React.FC<Props> = (props) => {

  const [currentTab, setCurrentTab] = useState(DEFAULT_TAB);
  const {modelingOptions} = useContext(ModelingContext);

  const handleTabChange = (item) => {
    setCurrentTab(item.key);
  };

  const displayPanelContent = () => {
    return currentTab === "entityType" ? <div>Dummy content for Entity Type tab.</div> : <div>Dummy content for Properties tab.</div>;
  };

  return (
    <div id="sidePanel" className={styles.sidePanel}>
      <div>
        <span className={styles.selectedEntityHeading} aria-label={`${modelingOptions.selectedEntity}-selectedEntity`}>{modelingOptions.selectedEntity}</span>
        <span><MLTooltip title={ModelingTooltips.deleteIcon} placement="top">
          <i key="last" role="delete-entity button" data-testid={modelingOptions.selectedEntity + "-delete"} onClick={() => props.deleteEntityClicked(modelingOptions.selectedEntity)}>
            <FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg" />
          </i>
        </MLTooltip></span>
        <span><i className={styles.close} aria-label={"closeGraphViewSidePanel"}
          onClick={props.onCloseSidePanel}>
          <CloseOutlined />
        </i></span>
      </div>
      <div className={styles.tabs}>
        <Menu mode="horizontal" defaultSelectedKeys={[DEFAULT_TAB]} selectedKeys={[currentTab]} onClick={handleTabChange}>
          <Menu.Item key="properties" aria-label="propertiesTabInSidePanel">
            {<span className={styles.sidePanelTabLabel}>Properties</span>}
          </Menu.Item>
          <Menu.Item key="entityType" aria-label="entityTypeTabInSidePanel">
            {<span className={styles.sidePanelTabLabel}>Entity Type</span>}
          </Menu.Item>
        </Menu>
      </div>
      {displayPanelContent()}
    </div>
  );
};

export default GraphViewSidePanel;