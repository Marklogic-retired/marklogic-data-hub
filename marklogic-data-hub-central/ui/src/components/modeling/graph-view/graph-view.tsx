import React, {CSSProperties, useContext, useState, useEffect} from "react";
import styles from "./graph-view.module.scss";
import {ModelingTooltips} from "@config/tooltips.config";
import PublishToDatabaseIcon from "../../../assets/publish-to-database-icon";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport, faUndoAlt} from "@fortawesome/free-solid-svg-icons";
import SplitPane from "react-split-pane";
import GraphViewSidePanel from "./side-panel/side-panel";
import {ModelingContext} from "@util/modeling-context";
import GraphVis from "./graph-vis/graph-vis";
import {ConfirmationType} from "../../../types/common-types";
import {ChevronDown, Search} from "react-bootstrap-icons";
import {Dropdown, DropdownButton} from "react-bootstrap";
import {HCAlert, HCButton, HCTooltip} from "@components/common";
import {Typeahead} from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import {themeColors} from "@config/themes.config";
import {defaultConceptIcon, defaultIcon} from "@config/explore.config";
import {getViewSettings, setViewSettings} from "@util/user-context";
import {colorExistsForNode, iconExistsForNode, getCategoryWithinModel} from "@util/modeling-utils";

type Props = {
  entityTypes: any;
  canReadEntityModel: any;
  canWriteEntityModel: any;
  deleteEntityType: (entityName: string) => void;
  updateSavedEntity: any;
  updateEntities: any;
  relationshipModalVisible: any;
  toggleRelationshipModal: any;
  toggleShowEntityModal: any;
  toggleIsEditModal: any;
  setEntityTypesFromServer: any;
  toggleConfirmModal: any;
  toggleRevertConfirmModal: any;
  setConfirmType: any;
  hubCentralConfig: any;
  updateHubCentralConfig: (hubCentralConfig: any) => void;
  revertUnpublishedChanges: boolean;
  setRevertUnpublishedChanges: (flag: boolean) => void;
  toggleShowConceptClassModal: any;
  toggleIsEditConceptClassModal: any;
  addConceptClass: any;
  updateConceptClassAndHideModal: (conceptClassName: string, description: string) => void;
  deleteConceptClass: (conceptClassName: string) => void;
};

const GraphView: React.FC<Props> = (props) => {
  const settings = getViewSettings();

  const {modelingOptions, setSelectedEntity} = useContext(ModelingContext);
  const [filterMenuSuggestions, setFilterMenuSuggestions] = useState(["a"]);
  const [entityFiltered, setEntityFiltered] = useState<string>(settings.model?.filter || "");
  const [isEntityFiltered, setIsEntityFiltered] = useState(false);
  const [graphEditMode, setGraphEditMode] = useState(false);
  const [coordsChanged, setCoordsChanged] = useState(false);
  const [exportPngButtonClicked, setExportPngButtonClicked] = useState(false);
  const [nodeNeedRedraw, setNodeNeedRedraw] = useState(false);

  useEffect(() => {
    if (coordsChanged) {
      //props.setEntityTypesFromServer();
      setCoordsChanged(false);
    }
  }, [coordsChanged]);

  useEffect(() => {
    if (props.entityTypes) {
      props.entityTypes.map((element) => {
        element.label = element.entityName;
      });
    }
    setFilterMenuSuggestions(props.entityTypes);
  }, [props.entityTypes]);

  useEffect(() => {
    if (props.revertUnpublishedChanges) {
      onCloseSidePanel();
      props.setRevertUnpublishedChanges(false);
    }
  }, [props.revertUnpublishedChanges]);

  const publishIconStyle: CSSProperties = {
    width: "1rem",
    fill: "currentColor"
  };

  const handleTypeaheadChange = (values: any) => {
    setEntityFiltered("");
    setIsEntityFiltered(false);
    let value = values ? values[0]?.label ? values[0].label : "" : "";
    const newFilter = {
      ...settings,
      model: {
        ...settings.model,
        filter: value,
      }
    };
    setViewSettings(newFilter);
    setEntityFiltered(value);
    handleFilterSelect(value);
  };

  const handleFilterSelect = (value: any) => {
    setIsEntityFiltered(true);
    setSelectedEntity(value);
  };

  const filter = <Typeahead
    className={styles.filterInput}
    id="toggle-example"
    options={filterMenuSuggestions}
    placeholder={"Filter"}
    onChange={handleTypeaheadChange}
    minLength={3}
    defaultInputValue={entityFiltered}
  >
    <div className="rbt-aux">
      <Search />
    </div>
  </Typeahead>;

  const handleAddMenu = (key) => {
    if (key === "addNewEntityType") {
      props.toggleShowEntityModal(true);
      props.toggleIsEditModal(false);
    } else if (key === "addNewConceptClass") {
      props.toggleShowConceptClassModal(true);
      props.toggleIsEditConceptClassModal(false);
    }
  };

  const addButton = (
    <DropdownButton
      aria-label="add-entity-type-relationship"
      align="end"
      size="sm"
      className="me-2"
      title={<span>Add<ChevronDown className="ms-2" /></span>}
      onSelect={handleAddMenu}
      disabled={!props.canWriteEntityModel}>
      <Dropdown.Item eventKey="addNewEntityType">
        <span aria-label={"add-entity-type"}>Add new entity type</span>
      </Dropdown.Item>
      <Dropdown.Item eventKey="addNewRelationship" onClick={() => setGraphEditMode(true)}>
        <span aria-label={"add-relationship"}>Add new relationship</span>
      </Dropdown.Item>
      <Dropdown.Item eventKey="addNewConceptClass">
        <span aria-label={"add-concept-class"}>Add new concept class</span>
      </Dropdown.Item>
    </DropdownButton>
  );

  const publishButton = <HCButton
    className={props.canWriteEntityModel ? (!modelingOptions.isModified ? styles.disabledPointerEvents : "") : styles.disabledPointerEvents}
    disabled={props.canWriteEntityModel ? !modelingOptions.isModified : true}
    aria-label="publish-to-database"
    size="sm"
    variant="outline-light"
    onClick={() => {
      props.setConfirmType(ConfirmationType.PublishAll);
      props.toggleConfirmModal(true);
    }}>
    <span className={styles.publishButtonContainer}>
      <PublishToDatabaseIcon style={publishIconStyle} />
      <span className={styles.publishButtonText}>Publish</span>
    </span>
  </HCButton>;

  const revertButton = <HCButton
    className={props.canWriteEntityModel ? (!modelingOptions.isModified ? styles.disabledPointerEvents : "") : styles.disabledPointerEvents}
    disabled={props.canWriteEntityModel ? !modelingOptions.isModified : true}
    aria-label="revert-changes-graph-view"
    size="sm"
    variant="outline-light"
    onClick={() => {
      props.toggleRevertConfirmModal(true);
      props.setConfirmType(ConfirmationType.RevertChanges);
    }}>
    <span className={styles.publishButtonContainer}>
      <FontAwesomeIcon icon={faUndoAlt} className={styles.revertButton}/>
      <span className={styles.publishButtonText}>Revert</span>
    </span>
  </HCButton>;

  const headerButtons = <span className={styles.buttons}>
    {graphEditMode ?
      <div className={styles.editModeInfoContainer}>
        <HCAlert
          variant="info" aria-label="graph-edit-mode-info" showIcon
        >{ModelingTooltips.editModeInfo}</HCAlert>
      </div> : ""
    }
    <span>
      {props.canWriteEntityModel ?
        <span>
          {addButton}
        </span>
        :
        <HCTooltip text={ModelingTooltips.addNewEntityGraph + " " + ModelingTooltips.noWriteAccess} id="add-button-tooltip" placement="top">
          <span className={styles.disabledCursor}>{addButton}</span>
        </HCTooltip>
      }
    </span>

    <HCTooltip id="revert-tooltip" text={ModelingTooltips.revertChanges} placement="top">
      <span className={styles.revertDisabledCursor}>{revertButton}</span>
    </HCTooltip>

    <HCTooltip id="publish-tooltip" text={ModelingTooltips.publish} placement="top">
      <span className={styles.disabledCursor}>{publishButton}</span>
    </HCTooltip>
    <HCTooltip text={ModelingTooltips.exportGraph} id="export-graph-tooltip" placement="top-end">
      <i><FontAwesomeIcon className={styles.graphExportIcon} icon={faFileExport} aria-label="graph-export" onClick={() => { setExportPngButtonClicked(true); }}/></i>
    </HCTooltip>
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
    setEntityFiltered("");
    setIsEntityFiltered(false);
  };

  const onCloseSidePanel = async () => {
    //closeSidePanelInGraphView();
    setSelectedEntity(undefined);
  };

  const deleteEntityClicked = (selectedEntity) => {
    props.deleteEntityType(selectedEntity);
  };

  const getColor = (nodeName, isConcept: boolean = false) => {
    let color = themeColors.defaults.entityColor;
    let modelCategory = getCategoryWithinModel(isConcept);
    let colorExistsOnServer = colorExistsForNode(nodeName, isConcept, props.hubCentralConfig);
    if (colorExistsOnServer && filterMenuSuggestions.length > 0 && !filterMenuSuggestions.includes("a")) {
      let entityDisplayed = filterMenuSuggestions.filter(function (obj) { return obj[!isConcept ? "entityName" : "conceptName"] === nodeName; }).length > 0;
      if (filterMenuSuggestions && entityDisplayed) {
        color = props.hubCentralConfig.modeling[modelCategory][nodeName]["color"];
      } else {
        color = "#F5F5F5";
      }
    } else if (colorExistsOnServer) {
      color = props.hubCentralConfig.modeling[modelCategory][nodeName]["color"];
    } else {
      color = !isConcept ? themeColors.defaults.entityColor: themeColors.defaults.conceptColor;
    }
    return color;
  };

  const getIcon = (nodeName, isConcept: boolean = false) => {
    let defaultNodeIcon = isConcept ? defaultConceptIcon : defaultIcon;
    let icon = defaultNodeIcon;
    let modelCategory = getCategoryWithinModel(isConcept);
    let iconExistsOnServer = iconExistsForNode(nodeName, isConcept, props.hubCentralConfig);
    if (iconExistsOnServer && filterMenuSuggestions.length > 0 && !filterMenuSuggestions.includes("a")) {
      let entityDisplayed = filterMenuSuggestions.filter(function (obj) { return obj[!isConcept ? "entityName" : "conceptName"] === nodeName; }).length > 0;
      if (filterMenuSuggestions && entityDisplayed) {
        icon = props.hubCentralConfig.modeling[modelCategory][nodeName]["icon"];
      } else {
        icon = defaultNodeIcon;
      }
    } else if (iconExistsOnServer) {
      icon = props.hubCentralConfig.modeling[modelCategory][nodeName]["icon"];
    } else {
      icon = defaultNodeIcon;
    }
    return icon;
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
          updateSavedEntity={props.updateSavedEntity}
          toggleRelationshipModal={props.toggleRelationshipModal}
          relationshipModalVisible={props.relationshipModalVisible}
          canReadEntityModel={props.canReadEntityModel}
          canWriteEntityModel={props.canWriteEntityModel}
          graphEditMode={graphEditMode}
          setGraphEditMode={setGraphEditMode}
          setCoordsChanged={setCoordsChanged}
          hubCentralConfig={props.hubCentralConfig}
          updateHubCentralConfig={props.updateHubCentralConfig}
          getColor={getColor}
          exportPngButtonClicked = {exportPngButtonClicked}
          setExportPngButtonClicked = {setExportPngButtonClicked}
          nodeNeedRedraw={nodeNeedRedraw}
          setNodeNeedRedraw={setNodeNeedRedraw}
        />
      </div>
    </div>;

  return (
    !modelingOptions.selectedEntity ? graphViewMainPanel :
      <SplitPane
        style={splitStyle}
        paneStyle={splitPaneStyles.pane}
        allowResize={true}
        resizerClassName={styles.resizerStyle}
        pane1Style={splitPaneStyles.pane1}
        pane2Style={splitPaneStyles.pane2}
        split="vertical"
        primary="first"
        defaultSize="66%"
      >
        {graphViewMainPanel}
        <div>
          <GraphViewSidePanel
            entityTypes={props.entityTypes}
            onCloseSidePanel={onCloseSidePanel}
            deleteEntityClicked={deleteEntityClicked}
            canReadEntityModel={props.canReadEntityModel}
            canWriteEntityModel={props.canWriteEntityModel}
            updateEntities={props.updateEntities}
            updateSavedEntity={props.updateSavedEntity}
            hubCentralConfig={props.hubCentralConfig}
            updateHubCentralConfig={props.updateHubCentralConfig}
            getColor={getColor}
            getIcon={getIcon}
            setNodeNeedRedraw={setNodeNeedRedraw}
            deleteConceptClass={props.deleteConceptClass}
          />
        </div>
      </SplitPane>
  );
};

export default GraphView;
