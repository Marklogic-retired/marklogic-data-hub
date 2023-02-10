import React, {useContext, useEffect, useState} from "react";
import {Row, Col, Form, FormLabel, Tab, Tabs} from "react-bootstrap";
import {QuestionCircleFill, XLg} from "react-bootstrap-icons";
import {EntityTypeColorPicker, HCTooltip, HCInput, HCIconPicker, HCDivider, HCTable, DynamicIcons} from "@components/common";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./side-panel.module.scss";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {ModelingTooltips, SecurityTooltips} from "@config/tooltips.config";
import {ModelingContext} from "@util/modeling-context";
import PropertiesTab from "../properties-tab/properties-tab";
import {entityReferences, primaryEntityTypes, updateConceptClass, updateModelInfo} from "@api/modeling";
import {getViewSettings, setViewSettings, UserContext} from "@util/user-context";
import {EntityModified, Definition} from "../../../../types/modeling-types";
import {defaultHubCentralConfig} from "@config/modeling.config";
import {themeColors} from "@config/themes.config";
import {defaultIcon, defaultEntityDefinition} from "@config/explore.config";
import Select, {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import {SearchContext} from "@util/search-context";
import {entityFromJSON, entityParser, definitionsParser, trimText} from "@util/data-conversion";
import {convertArrayOfEntitiesToObject} from "@util/modeling-utils";
import EntityPropertyTreeSelect from "../../../entity-property-tree-select/entity-property-tree-select";
import {getEntities} from "@api/queries";
import AddEditRelationship from "../relationship-modal/add-edit-relationship";
import {getSystemInfo} from "@api/environment";
import {ConfirmationType} from "../../../../types/common-types";
import ConfirmationModal from "@components/confirmation-modal/confirmation-modal";
import {getMappingFunctions} from "@api/mapping";
import {NotificationContext} from "@util/notification-context";
import {getNotifications} from "@api/merging";

type Props = {
  dataModel: any;
  onCloseSidePanel: () => void;
  deleteEntityClicked: (selectedEntity) => void;
  canWriteEntityModel: any;
  canReadEntityModel: any;
  updateEntities: any;
  updateSavedEntity: (entity: EntityModified[]) => void;
  hubCentralConfig: any;
  updateHubCentralConfig: (hubCentralConfig: any) => void;
  toggleRelationshipModal: any;
  relationshipModalVisible: any;
  getColor: any;
  getIcon: any;
  setNodeNeedRedraw: any;
  deleteConceptClass: (conceptClassName) => void;
};

const DEFAULT_TAB = "properties";

const GraphViewSidePanel: React.FC<Props> = ({dataModel,
  onCloseSidePanel,
  deleteEntityClicked,
  canWriteEntityModel,
  canReadEntityModel,
  updateEntities,
  updateSavedEntity,
  hubCentralConfig,
  updateHubCentralConfig,
  toggleRelationshipModal,
  relationshipModalVisible,
  getColor,
  getIcon,
  setNodeNeedRedraw,
  deleteConceptClass}) => {

  const viewSettings = getViewSettings();
  const [currentTab, setCurrentTab] = useState(viewSettings.model?.currentTab || DEFAULT_TAB);
  const {modelingOptions, setSelectedEntity, updateEntityModified} = useContext(ModelingContext);
  const {entityDefinitionsArray, setEntityDefinitionsArray} = useContext(SearchContext);
  const {handleError} = useContext(UserContext);
  const [selectedEntityDescription, setSelectedEntityDescription] = useState("");
  const [selectedEntityNamespace, setSelectedEntityNamespace] = useState("");
  const [selectedEntityNamespacePrefix, setSelectedEntityNamespacePrefix] = useState("");
  const [selectedEntityVersion, setSelectedEntityVersion] = useState("");
  const [selectedEntityLabel, setSelectedEntityLabel] = useState<string>("");
  const [selectedEntityPropOnHover, setSelectedEntityPropOnHover] = useState<any>();
  const [versionTouched, setVersionTouched] = useState(false);
  const [descriptionTouched, setisDescriptionTouched] = useState(false);
  const [namespaceTouched, setisNamespaceTouched] = useState(false);
  const [prefixTouched, setisPrefixTouched] = useState(false);
  const [errorServer, setErrorServer] = useState("");
  const [colorSelected, setColorSelected] = useState(themeColors.defaults.entityColor);
  const [iconSelected, setIconSelected] = useState<any>("");
  const [entityModels, setEntityModels] = useState<any>({});
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [entityTypeDefinition, setEntityTypeDefinition] = useState<Definition>();

  const [selectedEntityInfo, setSelectedEntityInfo] = useState<any>({});
  const [isConceptNode, setIsConceptNode] = useState(false);

  //relationship modals
  const [openRelationshipModal, setOpenRelationshipModal] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<any>({});
  const [modifiedEntity, setModifiedEntity] = useState<EntityModified>({entityName: "", modelDefinition: ""});
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [confirmBoldTextArray, setConfirmBoldTextArray] = useState<string[]>([]);
  const [stepValuesArray, setStepValuesArray] = useState<string[]>([]);
  const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.Identifer);
  const [mapFunctions, setMapFunctions] = useState<any>([]);
  //-----------------------
  const {setNotificationsObj} = useContext(NotificationContext);


  const handleTabChange = (key) => {
    const currentTabSetting = {
      ...viewSettings,
      model: {
        ...viewSettings.model,
        currentTab: key,
      }
    };
    setViewSettings(currentTabSetting);
    setCurrentTab(key);
  };

  const getEntityInfo = async () => {
    try {
      const response = await primaryEntityTypes();
      if (response) {
        if (response["data"].length > 0) {
          const entity = modelingOptions.selectedEntity;
          let isConceptType = false;
          const selectedEntityDetails = await response.data.find(ent => {
            let isConcept = ent.hasOwnProperty("conceptName");
            let nodeName = !isConcept ? ent.entityName : ent.conceptName;
            return nodeName === modelingOptions.selectedEntity;
          });
          if (selectedEntityDetails && selectedEntityDetails.hasOwnProperty("conceptName")) {
            setIsConceptNode(true);
            isConceptType = true;
          }
          if (selectedEntityDetails) {
            setSelectedEntityInfo(selectedEntityDetails);
            if (!isConceptType) {
              setIsConceptNode(false);
              if (entity !== undefined && selectedEntityDetails.model?.definitions[entity]) {
                setSelectedEntityDescription(entity !== undefined && selectedEntityDetails.model.definitions[entity].description);
                setSelectedEntityNamespace(entity !== undefined && selectedEntityDetails.model.definitions[entity].namespace);
                setSelectedEntityNamespacePrefix(entity !== undefined && selectedEntityDetails.model.definitions[entity].namespacePrefix);
              }
              if (entity !== undefined && selectedEntityDetails.model?.info?.version) {
                setSelectedEntityVersion(selectedEntityDetails.model.info.version);
              }
              setEntityModels({...convertArrayOfEntitiesToObject(response.data)});
              initializeEntityColorIcon();
              initializeEntityDisplayProps();
            } else {
              setSelectedEntityDescription(entity !== undefined && selectedEntityDetails.model.info.description);
              initializeEntityColorIcon(isConceptType);
            }
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

  const fetchNotifications = async () => {
    await getNotifications()
      .then((resp: any) => {
        if (resp && resp.data) {
          setNotificationsObj(resp.data.notifications, resp.data.total, resp.data.pageLength, true);
        } else {
          setNotificationsObj([], 0, 0, false);
        }
      })
      .catch((err) => {
        if (err.response) {
          setNotificationsObj([], 0, 0, false);
        } else {
          setNotificationsObj([], 0, 0, false);
        }
      });
  };

  const initializeEntityColorIcon = (isConcept: boolean = false) => {
    let entColor = getColor(modelingOptions.selectedEntity, isConcept);
    let entIcon = getIcon(modelingOptions.selectedEntity, isConcept);
    if (entColor) {
      setColorSelected(entColor);
    } else {
      setColorSelected(themeColors.defaults.entityColor);
    }

    if (entIcon) {
      setIconSelected(entIcon);
    } else {
      setIconSelected(defaultIcon);
    }
  };

  const initializeEntityDisplayProps = () => {
    if (modelingOptions.selectedEntity && hubCentralConfig.modeling) {
      const entityData = hubCentralConfig.modeling?.entities[modelingOptions.selectedEntity];
      if (entityData) {
        setSelectedEntityLabel(entityData.label || "");
        setSelectedEntityPropOnHover(entityData.propertiesOnHover || []);
      }
    }
  };

  const handlePropertyChange = async (event) => {
    let entity: any = modelingOptions.selectedEntity;
    if (event.target.id === "description") {
      let descriptionFromServer = !isConceptNode ? selectedEntityInfo.model.definitions[entity].description : selectedEntityInfo.model.info.description;

      if (event.target.value !== descriptionFromServer) {
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
    if (event.target.id === "version") {
      if (event.target.value !== selectedEntityInfo.model.info.version) {
        setVersionTouched(true);
      } else {
        setVersionTouched(false);
      }
      setSelectedEntityVersion(event.target.value);
    }
  };

  const entityPropertiesEdited = () => {
    return (descriptionTouched || namespaceTouched || prefixTouched || versionTouched);
  };

  const setEntityTypesFromServer = async (entityName) => {
    await updateEntities().then((resp => {
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
        let response;
        if (!isConceptNode) {
          response = await updateModelInfo(modelingOptions.selectedEntity, selectedEntityDescription, selectedEntityNamespace, selectedEntityNamespacePrefix, selectedEntityVersion);
        } else {
          response = await updateConceptClass(modelingOptions.selectedEntity, selectedEntityDescription);
        }
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
    (async () => {
      let mappingFuncResponse = await getMappingFunctions(true);
      if (mappingFuncResponse) {
        setMapFunctions(mappingFuncResponse.data);
      }
    })();
  }, []);

  useEffect(() => {
    if (modelingOptions.selectedEntity) {
      setErrorServer("");
      getEntityInfo();
      //initializeEntityColorIcon();
    }
  }, [modelingOptions]);

  useEffect(() => {
    let loaded = true;
    (async () => {
      try {
        const modelsResponse = await getEntities();
        const parsedModelData = entityFromJSON(modelsResponse.data);
        const parsedEntityDef = entityParser(parsedModelData).filter(entity => entity.name && entity);
        if (loaded) {
          setEntityDefinitionsArray(parsedEntityDef);
        }
      } catch (error) {
        handleError(error);
      }
    })();
    //initializeEntityColorIcon(isConceptNode);
    return () => {
      loaded = false;
    };
  }, [hubCentralConfig]);

  useEffect(() => {
    if (modelingOptions.selectedEntity && !isConceptNode) {
      let tmpDefinitions: any[] = [];
      if (entityModels[modelingOptions.selectedEntity]?.model.definitions) {
        tmpDefinitions = definitionsParser(entityModels[modelingOptions.selectedEntity]?.model.definitions);
        setDefinitions(tmpDefinitions);
      }
      let entityTypeDefinition: Definition = tmpDefinitions.find(entityDefinition => entityDefinition.name === modelingOptions.selectedEntity) || defaultEntityDefinition;
      setEntityTypeDefinition(entityTypeDefinition);
    }
  }, [modelingOptions, entityModels]);

  const handleColorChange = color => {
    setColorSelected(color.hex);
    setNodeNeedRedraw(true);
    handleUpdateHubCentralConfig({color: color.hex});
  };

  const handleIconChange = iconSelected => {
    setIconSelected(iconSelected);
    setNodeNeedRedraw(true);
    handleUpdateHubCentralConfig({icon: iconSelected});
  };

  const handleLabelChange = (e) => {
    setSelectedEntityLabel(e.value || "");
    handleUpdateHubCentralConfig({label: e.value || ""});
    fetchNotifications();
  };

  const handlePropertiesOnHoverChange = (e) => {
    const propertiesOnHover = e.map(property => property.replaceAll(" > ", "."));
    setSelectedEntityPropOnHover(propertiesOnHover);
    handleUpdateHubCentralConfig({propertiesOnHover});
  };

  const handleUpdateHubCentralConfig = propToUpdate => {
    try {
      if (modelingOptions.selectedEntity !== undefined) {
        let hubCentralPayload = hubCentralConfig || defaultHubCentralConfig;
        let modelCategory = "entities";
        if (Object.keys(hubCentralPayload.modeling.concepts).length > 0 && hubCentralPayload.modeling.concepts.hasOwnProperty(modelingOptions.selectedEntity)) {
          modelCategory = "concepts";
        }
        if (propToUpdate.hasOwnProperty("color")) {
          hubCentralPayload.modeling[modelCategory][modelingOptions.selectedEntity]["color"] = propToUpdate.color;
        } else if (propToUpdate.hasOwnProperty("icon")) {
          hubCentralPayload.modeling[modelCategory][modelingOptions.selectedEntity]["icon"] = propToUpdate.icon;
        } else if (propToUpdate.hasOwnProperty("label")) {
          hubCentralPayload.modeling[modelCategory][modelingOptions.selectedEntity]["label"] = propToUpdate.label;
        } else if (propToUpdate.hasOwnProperty("propertiesOnHover")) {
          hubCentralPayload.modeling[modelCategory][modelingOptions.selectedEntity]["propertiesOnHover"] = propToUpdate.propertiesOnHover;
        }
        updateHubCentralConfig(hubCentralPayload);
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

  const MenuList = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const renderOptions = () => {
    let entityTypeDef: any = entityDefinitionsArray.find(entity => entity.name === modelingOptions.selectedEntity);
    const options: any = entityTypeDef?.properties?.filter(property => property.ref === "").map(item => ({value: item?.name, label: item?.name}));
    return options;
  };
  const handleRelatedConceptClassesClick = (row) => {
    const selectedRelation = {
      edgeId: `${entityTypeDefinition?.name}-${row?.predicate}-${row?.conceptClass}-via-${row?.context}`,
      sourceNodeName: entityTypeDefinition?.name,
      sourceNodeColor: getColor(modelingOptions.selectedEntity, false),
      targetNodeName: row?.conceptClass,
      targetNodeColor: getColor(row?.conceptClass, true),
      relationshipName: row?.predicate,
      joinPropertyName: row?.context,
      isConcept: true,
      conceptExpression: row?.conceptExpression
    };
    setSelectedRelationship(selectedRelation);
    setOpenRelationshipModal(true);
  };

  const handleRelationshipDeletion = async (row) => {
    const relationshipInfo = {
      edgeId: `${entityTypeDefinition?.name}-${row?.predicate}-${row?.conceptClass}-via-${row?.context}`,
      sourceNodeName: entityTypeDefinition?.name ? entityTypeDefinition.name : "",
      sourceNodeColor: getColor(modelingOptions.selectedEntity, false),
      targetNodeName: row?.conceptClass,
      targetNodeColor: getColor(row?.conceptClass, true),
      relationshipName: row?.predicate,
      joinPropertyName: row?.context,
      isConcept: true,
      conceptExpression: row?.conceptExpression
    };
    let entityName = relationshipInfo.sourceNodeName;
    let propertyName = relationshipInfo.relationshipName;
    const response = await entityReferences(entityName || "", propertyName);
    if (response !== undefined && response["status"] === 200) {
      let newConfirmType = ConfirmationType.DeletePropertyWarn;
      let boldText: string[] = [propertyName];
      if (response["data"]["entityNamesWithForeignKeyReferences"].length > 0) {
        boldText.push(entityName || "");
        newConfirmType = ConfirmationType.DeleteEntityPropertyWithForeignKeyReferences;
        setStepValuesArray(response["data"]["entityNamesWithForeignKeyReferences"]);
      } else if (response["data"]["stepNames"].length > 0) {
        boldText.push(entityName || "");
        newConfirmType = ConfirmationType.DeletePropertyStepWarn;
        setStepValuesArray(response["data"]["stepNames"]);
      }
      setConfirmBoldTextArray(boldText);
      setConfirmType(newConfirmType);
      toggleConfirmModal(true);
    }
    let sourceEntityName = relationshipInfo.sourceNodeName;
    let entityTypeDefinitionTemp;
    let updatedDefinitions;
    for (let i = 0; i < dataModel.length; i++) {
      if (dataModel[i].entityName === sourceEntityName) {
        updatedDefinitions = {...dataModel[i].model};
        entityTypeDefinitionTemp = dataModel[i].model.definitions[sourceEntityName];
      }
    }
    let itemIndex = entityTypeDefinitionTemp["relatedConcepts"].findIndex(obj => obj.predicate === propertyName && obj.conceptClass === relationshipInfo.targetNodeName);
    entityTypeDefinitionTemp["relatedConcepts"].splice(itemIndex, 1);

    updatedDefinitions[sourceEntityName] = entityTypeDefinitionTemp;
    let entityModifiedInfo: EntityModified = {
      entityName: sourceEntityName,
      modelDefinition: updatedDefinitions.definitions
    };
    setModifiedEntity(entityModifiedInfo);
  };
  const handleDataToRelatedConcept = (data) => {
    if (data.length !== 0) {
      return data.map((item) => {
        item.predicateUI = trimText(item.predicate);
        return item;
      });
    }
    return [];
  };

  const confirmAction = async () => {
    updateEntityModified(modifiedEntity);
    await updateSavedEntity([modifiedEntity]);
    await getSystemInfo();
    toggleConfirmModal(false);
  };
  const renderRelatedConceptClasses = () => {
    const columns = [
      {
        width: "60%",
        text: "Relationship Name",
        dataField: "relationshipName",
        key: "relationshipName",
        headerFormatter: () => <span aria-label="relationshipName-header">Relationship Name</span>,
        formatter: (_, row) => {
          if (row?.predicate.length>20) {
            let render = <div>
              <HCTooltip text={row?.predicate} id={`property-tooltip`} placement="top">
                <span data-testid={`relationship-name-${row?.predicate}`} onClick={() => handleRelatedConceptClassesClick(row)} className={styles.link}>{row?.predicateUI}</span>
              </HCTooltip>
            </div>;
            return render;
          }

          return <span data-testid={`relationship-name-${row?.predicate}`} onClick={() => handleRelatedConceptClassesClick(row)} className={styles.link}>{row?.predicateUI}</span>;
        }
      },
      {
        width: "30%",
        text: "Concept Class",
        dataField: "conceptClass",
        key: "conceptClass",
        headerFormatter: () => <span aria-label="conceptClass-header">Concept Class</span>,
        formatter: (_, row) => {
          const icon = hubCentralConfig?.modeling?.concepts[row?.conceptClass] ? hubCentralConfig.modeling.concepts[row?.conceptClass].icon : "FaShapes";
          return <span><DynamicIcons name={icon} />  {row?.conceptClass}</span>;
        }
      },
      {
        width: "10%",
        text: "Delete",
        dataField: "delete",
        headerFormatter: () => <span aria-label="delete-header">Delete</span>,
        key: "delete",
        formatter: (_, row) => {
          const id = `${row?.predicate}-${row?.conceptClass}-delete`;
          return <FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} onClick={() => handleRelationshipDeletion(row)} data-testid={id} />;
        }
      }
    ];
    return (
      <>
        <div className="p-3">
          <HCTable
            pagination={true}
            data={handleDataToRelatedConcept(entityTypeDefinition?.relatedConcepts || [])}
            columns={columns}
            data-testid="related-concept-table"
            rowKey="conceptClass"
          />
        </div>
        <AddEditRelationship
          openRelationshipModal={openRelationshipModal}
          setOpenRelationshipModal={setOpenRelationshipModal}
          isEditing={true}
          relationshipInfo={selectedRelationship}
          dataModel={dataModel}
          updateSavedEntity={updateSavedEntity}
          relationshipModalVisible={relationshipModalVisible}
          toggleRelationshipModal={toggleRelationshipModal}
          canReadEntityModel={canReadEntityModel}
          canWriteEntityModel={canWriteEntityModel}
          hubCentralConfig={hubCentralConfig}
          getColor={getColor}
          mapFunctions={mapFunctions}
        />
        <ConfirmationModal
          isVisible={showConfirmModal}
          type={confirmType}
          boldTextArray={confirmBoldTextArray}
          arrayValues={stepValuesArray}
          toggleModal={toggleConfirmModal}
          confirmAction={confirmAction}
        />
      </>
    );
  };

  const displayPanelContent = () => {
    if (currentTab === "relatedConceptClasses" && !isConceptNode) {
      return renderRelatedConceptClasses();
    } else if (currentTab === "entityType" || isConceptNode) {
      return (<div id="entityType-tab-content">
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
              <HCInput
                id="description"
                dataTestid="description"
                disabled={canReadEntityModel && !canWriteEntityModel}
                placeholder="Enter description"
                value={selectedEntityDescription ? selectedEntityDescription : " "}
                onChange={handlePropertyChange}
                onBlur={onSubmit}
                className={styles.input}
              />
              <div className={"p-2 d-flex align-items-center"}>
                <HCTooltip text={!isConceptNode ? ModelingTooltips.entityDescription : ModelingTooltips.conceptClassDescription} id="description-tooltip" placement="top-end">
                  <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} className={styles.icon} data-testid="entityDescriptionTooltip" />
                </HCTooltip>
              </div>
            </Col>
          </Row>
          {!isConceptNode && <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Namespace URI:"}</FormLabel>
            <Col>
              <Row>
                <Col className={isErrorOfType("namespace") ? "d-flex has-error" : "d-flex"}>
                  <HCInput
                    id="namespace"
                    dataTestid="namespace"
                    data-testid="namespace"
                    placeholder="Example: http://example.org/es/gs"
                    disabled={canReadEntityModel && !canWriteEntityModel}
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
                  <HCInput
                    id="prefix"
                    data-testid="prefix"
                    placeholder="Example: esgs"
                    className={styles.prefixInput}
                    disabled={canReadEntityModel && !canWriteEntityModel}
                    value={selectedEntityNamespacePrefix}
                    onChange={handlePropertyChange}
                    onBlur={onSubmit}
                    style={{width: "108px", verticalAlign: "text-bottom"}}
                  />
                </Col>
                <div className={"col-auto p-1 ps-0 pe-3 me-1 align-items-center"}>
                  <HCTooltip text={ModelingTooltips.namespace} id="prefix-tooltip" placement="left">
                    <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} className={styles.icon} data-testid="entityPrefixTooltip" />
                  </HCTooltip>
                </div>
                <Col xs={12} className={styles.validationError}>
                  {errorServer ? <p className={styles.errorServer}>{errorServer}</p> : null}
                </Col>
              </Row>
            </Col>
          </Row>}
          {!isConceptNode && <Row>
            <FormLabel column lg={3} style={{marginTop: "20px"}}>{"Version:"}</FormLabel>
            <Col className={"d-flex align-items-center"}>
              <div className={styles.versionContainer}>
                <HCInput
                  id="version"
                  data-testid="version"
                  placeholder="0.0.1"
                  disabled={canReadEntityModel && !canWriteEntityModel}
                  value={selectedEntityVersion}
                  onChange={handlePropertyChange}
                  onBlur={onSubmit}
                  className={styles.input}
                  style={{verticalAlign: "text-bottom"}}
                />
                <div className={"d-flex align-items-center"}>
                  <HCTooltip id="colo-selector" text={ModelingTooltips.versionField} placement="right">
                    <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.colorsIcon} />
                  </HCTooltip>
                </div>
              </div>
            </Col>
          </Row>}
          {/* Display settings section  */}
          <Row className={"mb-3 mt-4"}>
            <Col className={"d-flex align-items-center"}>
              <h3 className={styles.displaySettings}>{"Display Settings"}</h3>
            </Col>
          </Row>
          <Row className={"mb-3"}>
            <FormLabel column lg={3} style={{marginTop: "10px"}}>{"Color:"}</FormLabel>
            <Col className={"d-flex align-items-center"}>
              <div className={styles.colorContainer}>
                {modelingOptions.selectedEntity &&
                <EntityTypeColorPicker color={colorSelected} entityType={modelingOptions.selectedEntity} handleColorChange={handleColorChange} />
                }
                <div className={"d-flex align-items-center"}>
                  <HCTooltip id="colo-selector" text={ModelingTooltips.colorField(modelingOptions.selectedEntity, isConceptNode)} placement="right" aria-label="colorToolTip">
                    <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.colorsIcon} />
                  </HCTooltip>
                </div>
              </div>
            </Col>
          </Row>
          <Row className={"mb-3"}>
            <FormLabel column lg={3} style={{marginTop: "11px"}}>{"Icon:"}</FormLabel>
            <Col className={"d-flex align-items-center"}>
              <div className={styles.iconContainer}>
                <div data-testid={`${modelingOptions.selectedEntity}-icon-selector`} aria-label={`${modelingOptions.selectedEntity}-${iconSelected}-icon`}>
                  <HCIconPicker identifier={modelingOptions.selectedEntity} value={iconSelected} onChange={(value) => handleIconChange(value)} />
                </div>
                <div className={"d-flex align-items-center"}>
                  <HCTooltip id="icon-selector" text={ModelingTooltips.iconField(modelingOptions.selectedEntity, isConceptNode)} placement="right" >
                    <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.iconPickerTooltip} />
                  </HCTooltip>
                </div>
              </div>
            </Col>
          </Row>
          {!isConceptNode && <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Record Label:"}</FormLabel>
            <Col className={"d-flex"}>
              <Select
                id={`${modelingOptions.selectedEntity}-entityLabel-select-wrapper`}
                inputId={`${modelingOptions.selectedEntity}-entityLabel-select`}
                components={{MenuList: props => MenuList(`${modelingOptions.selectedEntity}-entityLabel`, props)}}
                defaultValue={selectedEntityLabel ? {label: selectedEntityLabel, value: selectedEntityLabel} : null}
                value={selectedEntityLabel ? {label: selectedEntityLabel, value: selectedEntityLabel} : null}
                options={renderOptions()}
                onChange={handleLabelChange}
                classNamePrefix="select"
                aria-label={`${modelingOptions.selectedEntity}-label-select-dropdown`}
                formatOptionLabel={({value, label}) => {
                  return (
                    <span data-testid={`${modelingOptions.selectedEntity}-labelOption-${value}`} aria-label={`${modelingOptions.selectedEntity}-labelOption-${value}`}>
                      {label}
                    </span>
                  );
                }}
                styles={reactSelectThemeConfig}
              />
              <div className={"p-2 d-flex align-items-center"}>
                <HCTooltip text={ModelingTooltips.labelField(modelingOptions.selectedEntity)} id="entityLabel-tooltip" placement="top-end">
                  <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} className={styles.icon} data-testid="entityLabelTooltip" />
                </HCTooltip>
              </div>
            </Col>
          </Row>}
          {!isConceptNode && entityTypeDefinition?.properties &&
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Properties on Hover:"}</FormLabel>
            <Col className={"d-flex"}>
              <div className="w-100">
                <EntityPropertyTreeSelect
                  isForMerge={true}
                  propertyDropdownOptions={entityTypeDefinition?.properties}
                  entityDefinitionsArray={definitions}
                  value={selectedEntityPropOnHover?.length ? selectedEntityPropOnHover.map(property => property.replaceAll(".", " > ")) : undefined}
                  onValueSelected={handlePropertiesOnHoverChange}
                  multiple={true}
                  identifier={modelingOptions.selectedEntity}
                />
              </div>
              <div className={"p-2"}>
                <HCTooltip text={ModelingTooltips.propertiesOnHoverField} id="propertiesOnHover-tooltip" placement="top-end">
                  <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} className={styles.icon} data-testid="propertiesOnHoverTooltip" />
                </HCTooltip>
              </div>
            </Col>
          </Row>
          }
        </Form>
      </div>);
    } else {
      return (<PropertiesTab
        entityTypeData={dataModel.find(e => e.entityName === modelingOptions.selectedEntity)}
        canWriteEntityModel={canWriteEntityModel}
        canReadEntityModel={canReadEntityModel}
        updateSavedEntity={updateSavedEntity}
        dataModel={dataModel}
      />);
    }
  };

  return (
    <div id="sidePanel" className={styles.sidePanel}>
      <div>
        <span className={styles.selectedEntityHeading} aria-label={`${modelingOptions.selectedEntity}-selectedEntity`}>{modelingOptions.selectedEntity} {isConceptNode && <span className={styles.conceptHeadingInfo} aria-label={`${modelingOptions.selectedEntity}-conceptHeadingInfo`}>(Concept Class)</span>}</span>
        <span><HCTooltip text={!canWriteEntityModel && canReadEntityModel ? "Delete Entity: " + SecurityTooltips.missingPermission : ModelingTooltips.deleteIcon(isConceptNode)} id="delete-tooltip" placement="top">
          <i key="last" role="delete-entity button" data-testid={modelingOptions.selectedEntity + "-delete"} onClick={(event) => {
            if (!canWriteEntityModel && canReadEntityModel) {
              return event.preventDefault();
            } else {
              if (!isConceptNode) {
                deleteEntityClicked(modelingOptions.selectedEntity);
              } else {
                deleteConceptClass(modelingOptions.selectedEntity);
              }
            }
          }}>
            <FontAwesomeIcon icon={faTrashAlt} className={!canWriteEntityModel && canReadEntityModel ? styles.deleteIconDisabled : styles.deleteIcon} size="lg" />
          </i>
        </HCTooltip></span>
        <span><i className={styles.close} aria-label={"closeGraphViewSidePanel"}
          onClick={onCloseSidePanel}>
          <XLg />
        </i></span>
      </div>
      {!isConceptNode && <div className={styles.tabs}>
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
          <Tab
            eventKey="relatedConceptClasses"
            aria-label="relatedConceptClassesTabInSidePanel"
            id="relatedConceptClassesTabInSidePanel"
            title={<span className={styles.sidePanelTabLabel}>Related Concept Classes</span>}
            tabClassName={`${styles.tab}
          ${currentTab === "relatedConceptClasses" && styles.active}`}></Tab>
        </Tabs>
      </div>}
      {isConceptNode && <HCDivider className={"mt-2 mb-2"} style={{backgroundColor: "#ccc"}} />}
      {displayPanelContent()}
    </div>
  );
};

export default GraphViewSidePanel;