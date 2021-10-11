import React, {useContext, useEffect, useState, useRef, useCallback} from "react";
import styles from "./side-panel.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt, faPencilAlt} from "@fortawesome/free-solid-svg-icons";
import {ModelingTooltips, SecurityTooltips} from "../../../../config/tooltips.config";
// import {CloseOutlined} from "@ant-design/icons";
import {Input} from "antd";
import {Row, Col, Form, FormLabel} from "react-bootstrap";
import {ModelingContext} from "../../../../util/modeling-context";
import PropertiesTab from "../properties-tab/properties-tab";
import {primaryEntityTypes, updateModelInfo} from "../../../../api/modeling";
import {UserContext} from "../../../../util/user-context";
import {TwitterPicker} from "react-color";
import graphConfig from "../../../../config/graph-vis.config";
import {EntityModified} from "../../../../types/modeling-types";
import {defaultHubCentralConfig} from "../../../../config/modeling.config";
import HCTooltip from "../../../common/hc-tooltip/hc-tooltip";
import {QuestionCircleFill, XLg} from "react-bootstrap-icons";
import {Tab, Tabs} from "react-bootstrap";

type Props = {
  entityTypes: any;
  onCloseSidePanel: () => void;
  deleteEntityClicked: (selectedEntity) => void;
  canWriteEntityModel: any;
  canReadEntityModel: any;
  updateEntities: any;
  updateSavedEntity: (entity: EntityModified) => void;
  hubCentralConfig: any;
  updateHubCentralConfig: (hubCentralConfig: any) => void;
  getColor: any;
};

const DEFAULT_TAB = "properties";

const GraphViewSidePanel: React.FC<Props> = (props) => {

  const [currentTab, setCurrentTab] = useState(DEFAULT_TAB);
  const {modelingOptions, setSelectedEntity} = useContext(ModelingContext);
  const {handleError} = useContext(UserContext);
  const [selectedEntityDescription, setSelectedEntityDescription] = useState("");
  const [selectedEntityNamespace, setSelectedEntityNamespace] = useState("");
  const [selectedEntityNamespacePrefix, setSelectedEntityNamespacePrefix] = useState("");
  const [descriptionTouched, setisDescriptionTouched] = useState(false);
  const [namespaceTouched, setisNamespaceTouched] = useState(false);
  const [prefixTouched, setisPrefixTouched] = useState(false);
  const [errorServer, setErrorServer] = useState("");
  const [colorSelected, setColorSelected] = useState("#EEEFF1");
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [eventValid, setEventValid] = useState(false);
  const node: any = useRef();

  const [selectedEntityInfo, setSelectedEntityInfo] = useState<any>({});

  const handleTabChange = (key) => {
    setCurrentTab(key);
  };

  const getEntityInfo = async () => {
    try {
      const response = await primaryEntityTypes();
      if (response) {
        if (response["data"].length > 0) {
          const entity=modelingOptions.selectedEntity;
          const selectedEntityDetails = await response.data.find(ent => ent.entityName === modelingOptions.selectedEntity);
          if (selectedEntityDetails) {
            setSelectedEntityInfo(selectedEntityDetails);
            if (entity !== undefined && selectedEntityDetails.model.definitions[entity]) {
              setSelectedEntityDescription(entity !== undefined && selectedEntityDetails.model.definitions[entity].description);
              setSelectedEntityNamespace(entity !== undefined && selectedEntityDetails.model.definitions[entity].namespace);
              setSelectedEntityNamespacePrefix(entity !== undefined && selectedEntityDetails.model.definitions[entity].namespacePrefix);
            }
            initializeEntityColor();
          } else {
            // Entity type not found, may have been deleted, unset
            setSelectedEntity(undefined);
          }
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const initializeEntityColor = () => {
    let entColor = props.getColor(modelingOptions.selectedEntity);
    if (entColor) {
      setColorSelected(entColor);
    } else {
      setColorSelected("#EEEFF1");
    }
  };

  const handleOuterClick = useCallback(
    e => {
      if (node.current && !node.current.contains(e.target)) {
      // Clicked outside the color picker menu
        setDisplayColorPicker(prev => false);
        setEventValid(prev => false);
      }
    }, []);

  useEffect(() => {
    if (eventValid) {
      document.addEventListener("click", handleOuterClick);
    }

    return () => {
      document.removeEventListener("click", handleOuterClick);
    };
  });

  const handlePropertyChange = async (event) => {
    let entity: any = modelingOptions.selectedEntity;
    if (event.target.id === "description") {
      if (event.target.value !== selectedEntityInfo.model.definitions[entity].description) {
        setisDescriptionTouched(true);
      } else {
        setisDescriptionTouched(false);
      }
      setSelectedEntityDescription(event.target.value);
    }
    if (event.target.id === "namespace") {
      if (event.target.value !== selectedEntityInfo.model.definitions[entity].namespace) {
        setisNamespaceTouched(true);
      } else {
        setisNamespaceTouched(false);
      }
      setSelectedEntityNamespace(event.target.value);
    }
    if (event.target.id === "prefix") {
      if (event.target.value !== selectedEntityInfo.model.definitions[entity].namespacePrefix) {
        setisPrefixTouched(true);
      } else {
        setisPrefixTouched(false);
      }
      setSelectedEntityNamespacePrefix(event.target.value);
    }
  };

  const entityPropertiesEdited = () => {
    return (descriptionTouched || namespaceTouched || prefixTouched);
  };

  const setEntityTypesFromServer = async (entityName) => {
    await props.updateEntities().then((resp => {
      let isDraft = true;
      setSelectedEntity(entityName, isDraft);
    }));
  };

  const onSubmit = (event) => {
    if (entityPropertiesEdited()) {
      handlePropertyUpdate();
    }
  };

  const handlePropertyUpdate = async () => {
    try {
      if (modelingOptions.selectedEntity !== undefined) {
        const response = await updateModelInfo(modelingOptions.selectedEntity, selectedEntityDescription, selectedEntityNamespace, selectedEntityNamespacePrefix);
        if (response["status"] === 200) {
          setErrorServer("");
          setEntityTypesFromServer(modelingOptions.selectedEntity);
        }
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorServer(error["response"]["data"]["message"]);
        }
      } else {
        handleError(error);
      }
    }
  };

  const isErrorOfType = (type: string) => {
    let result = false;
    if (errorServer) {
      if (errorServer.includes("type already exists")) {
        result = type === "name";
      } else if (errorServer.includes("valid absolute URI")) {
        result = type === "namespace";
      } else if (errorServer.includes("prefix without specifying")) {
        result = type === "namespace";
      } else if (errorServer.includes("reserved pattern")) {
        result = type === "namespacePrefix";
      } else if (errorServer.includes("must specify a prefix")) {
        result = type === "namespacePrefix";
      }
    }
    return result;
  };

  useEffect(() => {
    if (modelingOptions.selectedEntity) {
      setErrorServer("");
      getEntityInfo();
      initializeEntityColor();
    }
  }, [modelingOptions.selectedEntity]);

  const handleEditColorMenu = () => {
    setEventValid(prev => true);
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleColorChange = async (color, event) => {
    setColorSelected(color.hex);
    try {
      if (modelingOptions.selectedEntity !== undefined) {
        let colorPayload = defaultHubCentralConfig;
        colorPayload.modeling.entities[modelingOptions.selectedEntity] = {color: color.hex};
        props.updateHubCentralConfig(colorPayload);
        setErrorServer("");
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorServer(error["response"]["data"]["message"]);
        }
      } else {
        handleError(error);
      }
    }
  };

  const displayPanelContent = () => {
    return currentTab === "entityType" ? <div>
      <Form className={"container-fluid"}>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Name:"}</FormLabel>
          <Col className={"d-flex align-items-center"} data-testid={modelingOptions.selectedEntity}>
            {modelingOptions.selectedEntity}
          </Col>
        </Row>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Description:"}</FormLabel>
          <Col className={"d-flex"}>
            <Input
              id="description"
              data-testid="description"
              disabled={props.canReadEntityModel && !props.canWriteEntityModel}
              placeholder="Enter description"
              value={selectedEntityDescription}
              onChange={handlePropertyChange}
              onBlur={onSubmit}
            />
            <div className={"p-2 d-flex align-items-center"}>
              <HCTooltip text={ModelingTooltips.entityDescription} id="description-tooltip" placement="top-end">
                <QuestionCircleFill color="#7F86B5" size={13} className={styles.icon} data-testid="entityDescriptionTooltip" />
              </HCTooltip>
            </div>
          </Col>
        </Row>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Namespace URI:"}</FormLabel>
          <Col>
            <Row>
              <Col className={isErrorOfType("namespace") ? "d-flex has-error" : "d-flex"}>
                <Input
                  id="namespace"
                  data-testid="namespace"
                  placeholder="Example: http://example.org/es/gs"
                  disabled={props.canReadEntityModel && !props.canWriteEntityModel}
                  className={styles.input}
                  value={selectedEntityNamespace}
                  onChange={handlePropertyChange}
                  onBlur={onSubmit}
                />
              </Col>
              <Col className={"col-auto pe-4"}>
                <span className={styles.prefixLabel}>Prefix:</span>
              </Col>
              <Col className={isErrorOfType("namespacePrefix") ? "d-flex col-auto pe-2 has-error" : "d-flex col-auto pe-2"}>
                <Input
                  id="prefix"
                  data-testid="prefix"
                  placeholder="Example: esgs"
                  className={styles.prefixInput}
                  disabled={props.canReadEntityModel && !props.canWriteEntityModel}
                  value={selectedEntityNamespacePrefix}
                  onChange={handlePropertyChange}
                  onBlur={onSubmit}
                  style={{width: "108px", verticalAlign: "text-bottom"}}
                />
              </Col>
              <div className={"col-auto p-1 ps-0 pe-3 me-1 align-items-center"}>
                <HCTooltip text={ModelingTooltips.namespace} id="prefix-tooltip" placement="left">
                  <QuestionCircleFill color="#7F86B5" size={13} className={styles.icon} data-testid="entityPrefixTooltip" />
                </HCTooltip>
              </div>
              <Col xs={12} className={styles.validationError}>
                { errorServer ? <p className={styles.errorServer}>{errorServer}</p> : null }
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Color:"}</FormLabel>
          <Col className={"d-flex align-items-center"}>
            <div className={styles.colorContainer}>
              <div data-testid={`${modelingOptions.selectedEntity}-color`} style={{width: "26px", height: "26px", background: colorSelected}}></div>
              <div className={"d-flex align-items-center"}>
                <span className={styles.editIconContainer}><FontAwesomeIcon icon={faPencilAlt} size="sm" onClick={handleEditColorMenu} className={styles.editIcon} data-testid={"edit-color-icon"} /></span>
                <HCTooltip id="colo-selector" text={<span>Select a color to associate it with the <b>{modelingOptions.selectedEntity}</b> entity type throughout your project.</span>} placement="right">
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} className={styles.colorsIcon} />
                </HCTooltip>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
      :
      <PropertiesTab
        entityTypeData={props.entityTypes.find(e => e.entityName === modelingOptions.selectedEntity)}
        canWriteEntityModel={props.canWriteEntityModel}
        canReadEntityModel={props.canReadEntityModel}
        updateSavedEntity={props.updateSavedEntity}
      />;
  };

  return (
    <div id="sidePanel" className={styles.sidePanel}>
      <div>
        <span className={styles.selectedEntityHeading} aria-label={`${modelingOptions.selectedEntity}-selectedEntity`}>{modelingOptions.selectedEntity}</span>
        <span><HCTooltip text={!props.canWriteEntityModel && props.canReadEntityModel ? "Delete Entity: " + SecurityTooltips.missingPermission : ModelingTooltips.deleteIcon} id="delete-tooltip" placement="top">
          <i key="last" role="delete-entity button" data-testid={modelingOptions.selectedEntity + "-delete"} onClick={(event) => {
            if (!props.canWriteEntityModel && props.canReadEntityModel) {
              return event.preventDefault();
            } else {
              props.deleteEntityClicked(modelingOptions.selectedEntity);
            }
          }}>
            <FontAwesomeIcon icon={faTrashAlt} className={!props.canWriteEntityModel && props.canReadEntityModel ? styles.deleteIconDisabled : styles.deleteIcon} size="lg" />
          </i>
        </HCTooltip></span>
        <span><i className={styles.close} aria-label={"closeGraphViewSidePanel"}
          onClick={props.onCloseSidePanel}>
          <XLg />
        </i></span>
      </div>
      <div className={styles.tabs}>
        <Tabs defaultActiveKey={DEFAULT_TAB} activeKey={currentTab} onSelect={handleTabChange} className={styles.tabsContainer}>
          <Tab
            eventKey="properties"
            aria-label="propertiesTabInSidePanel"
            id="propertiesTabInSidePanel"
            title={<span className={styles.sidePanelTabLabel}>Properties</span>}
            tabClassName={`${styles.tab} ${currentTab === "properties" && styles.active}`}></Tab>
          <Tab
            eventKey="entityType"
            aria-label="entityTypeTabInSidePanel"
            id="entityTypeTabInSidePanel"
            title={<span className={styles.sidePanelTabLabel}>Entity Type</span>}
            tabClassName={`${styles.tab}
          ${currentTab === "entityType" && styles.active}`}></Tab>
        </Tabs>
      </div>
      {displayPanelContent()}
      {displayColorPicker ? <div ref={node} id={"color-picker-menu"} className={styles.colorPickerContainer}><TwitterPicker colors={graphConfig.colorOptionsArray} color={colorSelected} onChangeComplete={handleColorChange}/></div> : null}
    </div>
  );
};

export default GraphViewSidePanel;
