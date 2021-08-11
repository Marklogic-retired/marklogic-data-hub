import React, {CSSProperties, useContext, useState} from "react";
import {AutoComplete, Dropdown, Icon, Menu} from "antd";
import styles from "./graph-view.module.scss";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {MLTooltip, MLInput, MLButton} from "@marklogic/design-system";
import {DownOutlined} from "@ant-design/icons";
import PublishToDatabaseIcon from "../../../assets/publish-to-database-icon";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import SplitPane from "react-split-pane";
import GraphViewSidePanel from "./side-panel/side-panel";
import {ModelingContext} from "../../../util/modeling-context";
import GraphVis from "./graph-vis/graph-vis";

type Props = {
  entityTypes: any;
  canReadEntityModel: any;
  canWriteEntityModel: any;
  deleteEntityType: (entityName: string) => void;
};

const GraphView: React.FC<Props> = (props) => {

  const {modelingOptions, setSelectedEntity, closeSidePanelInGraphView} = useContext(ModelingContext);
  const [filterMenuSuggestions, setFilterMenuSuggestions] = useState(["a"]);
  const [entityFiltered, setEntityFiltered] = useState("");
  const [isEntityFiltered, setIsEntityFiltered] = useState(false);

  const publishIconStyle: CSSProperties = {
    width: "20px",
    height: "20px",
    fill: "currentColor",
  };

  const handleFocus = () => {
    setFilterMenuSuggestions([]);
  };

  const handleTypeaheadChange = (value: any) => {
    setEntityFiltered(value);
    setIsEntityFiltered(false);
    if (value.length > 2) {
      Object.keys(props.entityTypes).map((key) => {
        let obj=filterMenuSuggestions;
        if (value && !filterMenuSuggestions.includes(props.entityTypes[key]["entityName"]) && props.entityTypes[key]["entityName"].toLowerCase().indexOf(value.toLowerCase()) >= 0) {
          obj.push(props.entityTypes[key]["entityName"]);
        }
        setFilterMenuSuggestions(obj);
      });
    } else {
      setFilterMenuSuggestions([]);
    }
  };

  const handleFilterSelect = (value : any) => {
    setFilterMenuSuggestions([]);
    setIsEntityFiltered(true);
    setSelectedEntity(value);
  };


  const filter = <AutoComplete
    className={styles.filterInput}
    dataSource={filterMenuSuggestions}
    value={entityFiltered}
    onFocus= {handleFocus}
    onChange={handleTypeaheadChange}
    onSelect={handleFilterSelect}
    aria-label="graph-view-filter-autoComplete"
    placeholder={"Filter"}
  >
    <MLInput aria-label="graph-view-filter-input" suffix={<Icon className={styles.searchIcon} type="search" theme="outlined" />} size="small"></MLInput>
  </AutoComplete>;

  const menu = (
    <Menu>
      <Menu.Item key="addNewEntityType">
        <span aria-label={"addNewEntityTypeOption"}>Add new entity type</span>
      </Menu.Item>
      <Menu.Item key="addNewRelationship">
        <span aria-label={"addNewRelationshipOption"}>Add new relationship</span>
      </Menu.Item>
    </Menu>
  );

  const headerButtons = <span className={styles.buttons}>
    <span>
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        overlayClassName={styles.stepMenu}
        placement="bottomRight"
      >
        <div className={styles.addButtonContainer}>
          <MLButton aria-label="add-entity-type-relationship" size="default" type="primary">
            <span className={styles.addButtonText}>Add</span>
            <DownOutlined className={styles.downArrowIcon} />
          </MLButton>
        </div>
      </Dropdown>
    </span>
    <MLTooltip title={ModelingTooltips.publish}>
      <MLButton aria-label="publish-to-database" size="default" type="secondary">
        <span className={styles.publishButtonContainer}>
          <PublishToDatabaseIcon style={publishIconStyle} />
          <span className={styles.publishButtonText}>Publish</span>
        </span>
      </MLButton>
    </MLTooltip>
    <MLTooltip title={ModelingTooltips.exportGraph} placement="topLeft">
      <FontAwesomeIcon className={styles.graphExportIcon} icon={faFileExport} size="2x" aria-label="graph-export" />
    </MLTooltip>
  </span>;

  const splitPaneStyles = {
    pane1: {minWidth: "150px"},
    pane2: {minWidth: "140px", maxWidth: "90%"},
    pane: {overflow: "auto"},
  };

  const splitStyle: CSSProperties = {
    position: "relative",
    height: "none",
  };

  const handleEntitySelection = (entityName) => {
    setSelectedEntity(entityName);
  };

  const onCloseSidePanel = async () => {
    closeSidePanelInGraphView();
  };

  const deleteEntityClicked = (selectedEntity) => {
    props.deleteEntityType(selectedEntity);
  };

  const graphViewMainPanel =
    <div className={styles.graphViewContainer}>
      <div className={styles.graphHeader}>
        {filter}
        {headerButtons}
      </div>
      <div>
        <GraphVis
          entityTypes={props.entityTypes}
          handleEntitySelection={handleEntitySelection}
          filteredEntityTypes={filterMenuSuggestions}
          entitySelected={entityFiltered}
          isEntitySelected={isEntityFiltered}
        />
      </div>
    </div>;

  const entityTypeExistsInDatabase = (entityName, entityTypesArray) => {
    let entityValidation = entityTypesArray.find((obj) => obj.name === entityName);
    return !entityValidation ? false : true;
  };

  const isSelectedEntityTypeValid = () => {
    return modelingOptions.selectedEntity && entityTypeExistsInDatabase(modelingOptions.selectedEntity, modelingOptions.entityTypeNamesArray);
  };

  return (
    !modelingOptions.openSidePanelInGraphView ? graphViewMainPanel :
      (isSelectedEntityTypeValid() ?
        <SplitPane
          style={splitStyle}
          paneStyle={splitPaneStyles.pane}
          allowResize={true}
          resizerClassName={styles.resizerStyle}
          pane1Style={splitPaneStyles.pane1}
          pane2Style={splitPaneStyles.pane2}
          split="vertical"
          primary="first"
          defaultSize="70%"
        >
          {graphViewMainPanel}
          <GraphViewSidePanel
            entityTypes={props.entityTypes}
            onCloseSidePanel={onCloseSidePanel}
            deleteEntityClicked={deleteEntityClicked}
            canReadEntityModel={props.canReadEntityModel}
            canWriteEntityModel={props.canWriteEntityModel}
          />
        </SplitPane> : graphViewMainPanel)
  );
};

export default GraphView;
