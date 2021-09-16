import React, {useContext, useEffect, useState, useRef, useCallback} from "react";
import styles from "./side-panel.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt, faPencilAlt} from "@fortawesome/free-solid-svg-icons";
import {ModelingTooltips, SecurityTooltips} from "../../../../config/tooltips.config";
import {CloseOutlined} from "@ant-design/icons";
import {Menu, Form, Input, Tooltip, Icon} from "antd";
import {ModelingContext} from "../../../../util/modeling-context";
import PropertiesTab from "../properties-tab/properties-tab";
import {primaryEntityTypes, updateModelInfo} from "../../../../api/modeling";
import {UserContext} from "../../../../util/user-context";
import {TwitterPicker} from "react-color";
import graphConfig from "../../../../config/graph-vis.config";
import {EntityModified} from "../../../../types/modeling-types";
import {defaultHubCentralConfig} from "../../../../config/modeling.config";
import HCTooltip from "../../../common/hc-tooltip/hc-tooltip";
import {QuestionCircleFill} from "react-bootstrap-icons";

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
  const [errorServer, setErrorServer] = useState("");
  const [colorSelected, setColorSelected] = useState("#EEEFF1");
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [eventValid, setEventValid] = useState(false);
  const node: any = useRef();

  const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 18},
  };

  const formItemLayout = {
    labelCol: {span: 5},
    wrapperCol: {span: 18}
  };

  const handleTabChange = (item) => {
    setCurrentTab(item.key);
  };

  const getEntityInfo = async () => {
    try {
      const response = await primaryEntityTypes();
      if (response) {
        if (response["data"].length > 0) {
          const entity=modelingOptions.selectedEntity;
          const selectedEntityDetails = await response.data.find(ent => ent.entityName === modelingOptions.selectedEntity);
          if (selectedEntityDetails) {
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
    if (event.target.id === "description") {
      setSelectedEntityDescription(event.target.value);
    }
    if (event.target.id === "namespace") {
      setSelectedEntityNamespace(event.target.value);
    }
    if (event.target.id === "prefix") {
      setSelectedEntityNamespacePrefix(event.target.value);
    }
  };

  const handlePropertyUpdate = async (event) => {
    try {
      if (modelingOptions.selectedEntity !== undefined) {
        const response = await updateModelInfo(modelingOptions.selectedEntity, selectedEntityDescription, selectedEntityNamespace, selectedEntityNamespacePrefix);
        if (response["status"] === 200) {
          setErrorServer("");
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
      <Form
        {...layout}
      >
        <Form.Item
          className={styles.formItem}
          {...formItemLayout}
          label={<span>
          Name
          </span>} labelAlign="left">
          <span className={styles.entityName} data-testid={modelingOptions.selectedEntity}>{modelingOptions.selectedEntity}</span>
        </Form.Item>
      </Form>
      <Form.Item
        label={<span>Description:</span>}
        {...formItemLayout}
        labelAlign="left"
        className={styles.formItem}
        colon={false}
      >
        <Input
          id="description"
          data-testid="description"
          placeholder="Enter description"
          className={styles.descriptionInput}
          value={selectedEntityDescription}
          onChange={handlePropertyChange}
          onBlur={handlePropertyUpdate}
        />
        <HCTooltip text={ModelingTooltips.entityDescription} id="description-tooltip" placement="top-end">
          <QuestionCircleFill color="#7F86B5" size={13} className={styles.icon} data-testid="entityDescriptionTooltip" />
        </HCTooltip>
      </Form.Item>
      <Form.Item
        label="Namespace URI:"
        labelAlign="left"
        style={{marginLeft: 7, marginBottom: 0}}
        {...formItemLayout}
      >
        <Form.Item
          style={{display: "inline-block"}}
          validateStatus={isErrorOfType("namespace") ? "error" : ""}
        >
          <Input
            id="namespace"
            data-testid="namespace"
            placeholder="Example: http://example.org/es/gs"
            className={styles.input}
            value={selectedEntityNamespace}
            onChange={handlePropertyChange}
            onBlur={handlePropertyUpdate}
            style={{width: "8.9vw", marginLeft: "1.5vw"}}
          />
        </Form.Item>
        <span className={styles.prefixLabel}><span style={{marginRight: "1vw"}}>Prefix:</span>
          <Form.Item
            className={styles.formItem}
            colon={false}
            style={{display: "inline-block"}}
            validateStatus={isErrorOfType("namespacePrefix") ? "error" : ""}
          >
            <Input
              id="prefix"
              data-testid="prefix"
              placeholder="Example: esgs"
              className={styles.prefixInput}
              value={selectedEntityNamespacePrefix}
              onChange={handlePropertyChange}
              onBlur={handlePropertyUpdate}
              style={{width: "96px", verticalAlign: "text-bottom"}}
            />
            <HCTooltip text={ModelingTooltips.namespace} id="prefix-tooltip" placement="left">
              <QuestionCircleFill color="#7F86B5" size={13} className={styles.prefixTooltipIcon} data-testid="entityPrefixTooltip" />
            </HCTooltip>
          </Form.Item></span>
        { errorServer ? <p className={styles.errorServer}>{errorServer}</p> : null }
      </Form.Item>
      <Form.Item
        label="Color:"
        labelAlign="left"
        style={{marginLeft: 7, marginBottom: 0}}
        {...formItemLayout}
      >
        <div className={styles.colorContainer}>
          <div data-testid={`${modelingOptions.selectedEntity}-color`} style={{width: "26px", height: "26px", background: colorSelected, marginTop: "4px"}}></div>
          {!props.canWriteEntityModel && props.canReadEntityModel ?
            <div>
              <span className={styles.editIconContainer}><Tooltip title={SecurityTooltips.missingPermission} placement={"top"}><FontAwesomeIcon icon={faPencilAlt} size="sm" className={styles.editIconReadOnly} data-testid={"edit-color-icon-disabled"}/></Tooltip></span>
              <Tooltip title={<span>Select a color to associate it with the <b>{modelingOptions.selectedEntity}</b> entity type throughout your project.</span>} placement={"right"}>
                <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
              </Tooltip>
            </div>
            :
            <div>
              <span className={styles.editIconContainer}><FontAwesomeIcon icon={faPencilAlt} size="sm" onClick={handleEditColorMenu} className={styles.editIcon} data-testid={"edit-color-icon"}/></span>
              <Tooltip title={<span>Select a color to associate it with the <b>{modelingOptions.selectedEntity}</b> entity type throughout your project.</span>} placement={"right"}>
                <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
              </Tooltip>
            </div>
          }
        </div>
      </Form.Item>
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
      {displayColorPicker ? <div ref={node} id={"color-picker-menu"} className={styles.colorPickerContainer}><TwitterPicker colors={graphConfig.colorOptionsArray} color={colorSelected} onChangeComplete={handleColorChange}/></div> : null}
    </div>
  );
};

export default GraphViewSidePanel;
