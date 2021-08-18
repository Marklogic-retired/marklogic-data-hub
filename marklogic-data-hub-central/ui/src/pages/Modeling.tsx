import React, {useState, useEffect, useContext, CSSProperties} from "react";
import {faProjectDiagram, faTable} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Alert, Button, Radio, Tooltip} from "antd";
import "./Modeling.scss";

import ConfirmationModal from "../components/confirmation-modal/confirmation-modal";
import EntityTypeModal from "../components/modeling/entity-type-modal/entity-type-modal";
import EntityTypeTable from "../components/modeling/entity-type-table/entity-type-table";
import styles from "./Modeling.module.scss";

import {deleteEntity, entityReferences, primaryEntityTypes, publishDraftModels, updateEntityModels} from "../api/modeling";
import {UserContext} from "../util/user-context";
import {ModelingContext} from "../util/modeling-context";
import {ModelingMessages, ModelingTooltips} from "../config/tooltips.config";
import {AuthoritiesContext} from "../util/authorities";
import {ConfirmationType} from "../types/common-types";
import tiles from "../config/tiles.config";
import {MissingPagePermission} from "../config/messages.config";
import {faLayerGroup, faKey} from "@fortawesome/free-solid-svg-icons";
import arrayIcon from "../assets/icon_array.png";
import relatedEntityIcon from "../assets/icon_related_entities.png";
import GraphView from "../components/modeling/graph-view/graph-view";
import {defaultModelingView} from "../config/modeling.config";
import PublishToDatabaseIcon from "../assets/publish-to-database-icon";

const Modeling: React.FC = () => {
  const {handleError} = useContext(UserContext);
  const {modelingOptions, setEntityTypeNamesArray, clearEntityModified, setView, setSelectedEntity} = useContext(ModelingContext);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [showEntityModal, toggleShowEntityModal] = useState(false);
  const [isEditModal, toggleIsEditModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [namespace, setNamespace] = useState("");
  const [prefix, setPrefix] = useState("");
  const [color, setColor] = useState("");
  const [autoExpand, setAutoExpand] = useState("");
  //const [revertAllEntity, toggleRevertAllEntity] = useState(false);
  const [width, setWidth] = React.useState(window.innerWidth);

  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [showRelationshipModal, toggleRelationshipModal] = useState(true);

  const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.PublishAll);

  //Role based access
  const authorityService = useContext(AuthoritiesContext);
  const canReadEntityModel = authorityService.canReadEntityModel();
  const canWriteEntityModel = authorityService.canWriteEntityModel();
  const canAccessModel = authorityService.canAccessModel();

  //Delete Entity
  const [confirmBoldTextArray, setConfirmBoldTextArray] = useState<string[]>([]);
  const [arrayValues, setArrayValues] = useState<string[]>([]);


  useEffect(() => {
    if (canReadEntityModel && modelingOptions.view === "table") {
      setEntityTypesFromServer();
    }
  }, [modelingOptions.view]);

  useEffect(() => {
    if (canReadEntityModel) {
      setEntityTypesFromServer();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateWidthAndHeight);
    return () => window.removeEventListener("resize", updateWidthAndHeight);
  });

  const updateWidthAndHeight = () => {
    setWidth(window.innerWidth);
  };

  const setEntityTypesFromServer = async () => {
    try {
      const response = await primaryEntityTypes();
      if (response) {
        let model: any = [];
        let entityTypesArray:any = [];
        let isDraft = false;
        await response["data"].forEach(entity => {
          if (!entity.model.info.draftDeleted) {
            model.push(entity);
            entityTypesArray.push({name: entity.entityName, entityTypeId: entity.entityTypeId});
          }
          if (entity.model.info.draft && !isDraft) {
            isDraft = true;
          }
        });
        setEntityTypes(model);
        if (response["data"].length > 0) {
          setEntityTypeNamesArray(entityTypesArray, isDraft);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const saveAllEntitiesToServer = async (entitiesArray) => {
    try {
      let response;
      if (entitiesArray.length > 0) {
        response = await updateEntityModels(entitiesArray);
      } else {
        response = await updateEntityModels(modelingOptions.modifiedEntitiesArray);
      }
      if (response["status"] === 200) {
        await setEntityTypesFromServer();
      }
    } catch (error) {
      handleError(error);
    } finally {
      toggleRelationshipModal(false);
      toggleConfirmModal(false);
    }
  };

  const publishDraftModelToServer = async () => {
    try {
      let response = await publishDraftModels();
      if (response["status"] === 200) {
        await setEntityTypesFromServer();
      }
    } catch (error) {
      handleError(error);
    } finally {
      clearEntityModified();
      toggleRelationshipModal(false);
      toggleConfirmModal(false);
    }
  };

  const updateEntityTypesAndHideModal = async (entityName: string, description: string) => {
    if (!isEditModal) {
      setAutoExpand(entityName);
    }
    toggleShowEntityModal(false);
    await setEntityTypesFromServer();
    if (!isEditModal && modelingOptions.view === "graph") {
      setSelectedEntity(entityName);
    }
  };

  const editEntityTypeDescription = (entityTypeName: string, entityTypeDescription: string, entityTypeNamespace: string, entityTypePrefix: string, entityTypeColor: string) => {
    if (canWriteEntityModel) {
      toggleIsEditModal(true);
      toggleShowEntityModal(true);
      setName(entityTypeName);
      setDescription(entityTypeDescription);
      setNamespace(entityTypeNamespace);
      setPrefix(entityTypePrefix);
      setColor(entityTypeColor);
    }
  };

  const confirmAction = () => {
    if (confirmType === ConfirmationType.PublishAll) {
      publishDraftModelToServer();
    } else if (confirmType === ConfirmationType.DeleteEntityRelationshipOutstandingEditWarn || confirmType === ConfirmationType.DeleteEntityNoRelationshipOutstandingEditWarn || confirmType === ConfirmationType.DeleteEntity) {
      deleteEntityFromServer();
    }
  };

  /* Deleting an entity type */
  const getEntityReferences = async (entityName: string) => {
    try {
      const response = await entityReferences(entityName);
      if (response["status"] === 200) {
        let newConfirmType = ConfirmationType.DeleteEntity;

        if (modelingOptions.isModified) {
          //newConfirmType = ConfirmationType.DeleteEntityNoRelationshipOutstandingEditWarn;
          setArrayValues(modelingOptions.modifiedEntitiesArray.map(entity => entity.entityName));
        }

        if (response["data"]["stepNames"].length > 0) {
          newConfirmType = ConfirmationType.DeleteEntityStepWarn;
          setArrayValues(response["data"]["stepNames"]);
        } else if (response["data"]["entityNamesWithForeignKeyReferences"].length > 0) {
          newConfirmType = ConfirmationType.DeleteEntityWithForeignKeyReferences;
          setArrayValues(response["data"]["entityNamesWithForeignKeyReferences"]);
        } else if (response["data"]["entityNames"].length > 0) {
          if (modelingOptions.isModified) {
            newConfirmType = ConfirmationType.DeleteEntityRelationshipOutstandingEditWarn;
            setArrayValues(modelingOptions.modifiedEntitiesArray.map(entity => entity.entityName));
          } else {
            newConfirmType = ConfirmationType.DeleteEntityRelationshipWarn;
          }
        }

        setConfirmBoldTextArray([entityName]);
        setConfirmType(newConfirmType);
        toggleConfirmModal(true);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const deleteEntityFromServer = async () => {
    let entityName = confirmBoldTextArray.length ? confirmBoldTextArray[0] : "";
    try {
      const response = await deleteEntity(entityName);
      if (response["status"] === 200) {
        setEntityTypesFromServer();
      }
    } catch (error) {
      handleError(error);
    } finally {
      toggleConfirmModal(false);
      if (modelingOptions.selectedEntity && modelingOptions.selectedEntity === entityName) {
        setSelectedEntity(undefined);
      }
    }
  };

  // const saveAllEntitiesThenDeleteFromServer = async () => {
  //   try {
  //     const response = await updateEntityModels(modelingOptions.modifiedEntitiesArray);
  //     if (response["status"] === 200) {
  //       let entityName = confirmBoldTextArray.length ? confirmBoldTextArray[0] : "";
  //       try {
  //         await deleteEntity(entityName);
  //       } catch (error) {
  //         handleError(error);
  //       } finally {
  //         await setEntityTypesFromServer();
  //         toggleConfirmModal(false);
  //         if (modelingOptions.selectedEntity && modelingOptions.selectedEntity === entityName) {
  //           setSelectedEntity(undefined);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     handleError(error);
  //   }
  // };


  const addButton = <Button
    type="primary"
    aria-label="add-entity"
    onClick={() => {
      toggleIsEditModal(false);
      toggleShowEntityModal(true);
    }}
    disabled={!canWriteEntityModel}
    className={!canWriteEntityModel ? styles.disabledPointerEvents : undefined}
  >Add</Button>;

  const publishIconStyle: CSSProperties = {
    width: "18px",
    height: "18px",
    fill: "currentColor"
  };

  const publishButton = <span className={styles.publishButtonParent}><Button
    className={!modelingOptions.isModified ? styles.disabledPointerEvents : ""}
    disabled={!modelingOptions.isModified}
    aria-label="publish-to-database"
    onClick={() => {
      setConfirmType(ConfirmationType.PublishAll);
      toggleConfirmModal(true);
    }}
    size="small"
  >
    <span className={styles.publishButtonContainer}>
      <PublishToDatabaseIcon style={publishIconStyle} />
      <span className={styles.publishButtonText}>Publish</span>
    </span>
  </Button>
  </span>;

  const handleViewChange = (view) => {
    if (view === "table") {
      setView("table");
    } else {
      setView(defaultModelingView);
    }
  };

  const mlRadioStyle: CSSProperties = {
    color: "#999"
  };

  const viewSwitch = <div id="switch-view" aria-label="switch-view">
    <Radio.Group
      buttonStyle="outline"
      className={"radioGroupView"}
      defaultValue={modelingOptions.view}
      name="radiogroup"
      onChange={e => handleViewChange(e.target.value)}
      size="large"
      style={mlRadioStyle}
      // tabIndex={0} // TODO confirm we can make React Bootstrap element tab-able
    >
      <Radio.Button aria-label="switch-view-graph" value={"graph"} checked={modelingOptions.view === "graph"}>
        <i>{<FontAwesomeIcon icon={faProjectDiagram}/>}</i>
      </Radio.Button>
      <Radio.Button aria-label="switch-view-table" value={"table"} checked={modelingOptions.view === "table"}>
        <i>{<FontAwesomeIcon icon={faTable}/>}</i>
      </Radio.Button>
    </Radio.Group>
  </div>;

  if (canAccessModel) {
    return (
      <div className={styles.modelContainer}>
        {modelingOptions.view === "table" ?
          <div className={styles.stickyHeader} style={{width: width - 138, maxWidth: width - 138}}>
            <div className={styles.intro}>
              <p>{tiles.model.intro}</p>
              {viewSwitch}
            </div>
            {modelingOptions.isModified && (
              <div className={modelingOptions.isModified ? styles.alertContainer : ""}><Alert
                type="info" aria-label="entity-modified-alert" showIcon
                message={ModelingMessages.entityEditedAlert}/></div>
            )}
            <div>
              <div className={styles.header}>
                <h1>Entity Types</h1>
                <div className={styles.buttonContainer}>
                  <div className={styles.legend}>
                    <div data-testid="foreignKeyIconLegend" className={styles.legendText}>
                      <FontAwesomeIcon className={styles.foreignKeyIcon} icon={faKey}/> Foreign
                                            Key Relationship
                    </div>
                    <div data-testid="relatedEntityIconLegend" className={styles.legendText}><img
                      className={styles.relatedIcon} src={relatedEntityIcon} alt={""}/> Related
                                            Entity
                    </div>
                    <div data-testid="multipleIconLegend" className={styles.legendText}><img
                      className={styles.arrayImage} src={arrayIcon} alt={""}/> Multiple
                    </div>
                    <div data-testid="structuredIconLegend" className={styles.legendText}>
                      <FontAwesomeIcon className={styles.structuredIcon}
                        icon={faLayerGroup}/> Structured Type
                    </div>
                  </div>
                  <div style={{float: "right"}}>
                    {canWriteEntityModel ?
                      <Tooltip title={ModelingTooltips.addNewEntity}>
                        {addButton}
                      </Tooltip>
                      :
                      <Tooltip
                        title={ModelingTooltips.addNewEntity + " " + ModelingTooltips.noWriteAccess}
                        placement="top" overlayStyle={{maxWidth: "175px"}}>
                        <span className={styles.disabledCursor}>{addButton}</span>
                      </Tooltip>
                    }
                    {canWriteEntityModel ?
                      <Tooltip title={ModelingTooltips.publish}
                        overlayStyle={{maxWidth: "175px"}}>
                        <span
                          className={modelingOptions.isModified ? styles.CursorButton : styles.disabledCursor}>{publishButton}</span>
                      </Tooltip>
                      :
                      <Tooltip
                        title={ModelingTooltips.publish + " " + ModelingTooltips.noWriteAccess}
                        placement="top" overlayStyle={{maxWidth: "225px"}}>
                        <span className={styles.disabledCursor}>{publishButton}</span>
                      </Tooltip>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div> : <>
            <div className={styles.intro}>
              <p>{tiles.model.intro}</p>
              {viewSwitch}
            </div>
            {modelingOptions.isModified && (
              <div className={modelingOptions.isModified ? styles.alertContainer : ""}><Alert
                type="info" aria-label="entity-modified-alert" showIcon
                message={ModelingMessages.entityEditedAlert}/></div>
            )}
            <h1>Entity Types</h1>
            <div className={styles.borderBelowHeader}></div>
            <GraphView
              canReadEntityModel={canReadEntityModel}
              canWriteEntityModel={canWriteEntityModel}
              entityTypes={entityTypes}
              deleteEntityType={getEntityReferences}
              updateSavedEntity={saveAllEntitiesToServer}
              updateEntities={setEntityTypesFromServer}
              relationshipModalVisible={showRelationshipModal}
              toggleRelationshipModal={toggleRelationshipModal}
              toggleShowEntityModal={toggleShowEntityModal}
              toggleIsEditModal={toggleIsEditModal}
              setEntityTypesFromServer={setEntityTypesFromServer}
              toggleConfirmModal={toggleConfirmModal}
              setConfirmType={setConfirmType}
            />
          </>
        }
        {modelingOptions.view === "table" ? <div
          className={modelingOptions.isModified ? styles.entityTableContainer : styles.entityTableContainerWithoutAlert}>
          <EntityTypeTable
            canReadEntityModel={canReadEntityModel}
            canWriteEntityModel={canWriteEntityModel}
            allEntityTypesData={entityTypes}
            editEntityTypeDescription={editEntityTypeDescription}
            updateEntities={setEntityTypesFromServer}
            updateSavedEntity={saveAllEntitiesToServer}
            autoExpand={autoExpand}
          />
        </div> : ""}
        <ConfirmationModal
          isVisible={showConfirmModal}
          type={confirmType}
          boldTextArray={![ConfirmationType.PublishAll].includes(confirmType) ? confirmBoldTextArray : []}
          arrayValues={![ConfirmationType.PublishAll].includes(confirmType) ? arrayValues : []}
          toggleModal={toggleConfirmModal}
          confirmAction={confirmAction}
        />
        <EntityTypeModal
          isVisible={showEntityModal}
          toggleModal={toggleShowEntityModal}
          updateEntityTypesAndHideModal={updateEntityTypesAndHideModal}
          isEditModal={isEditModal}
          name={name}
          description={description}
          namespace={namespace}
          prefix={prefix}
          color={color}
        />
      </div>
    );
  } else {
    return (
      <div className={styles.modelContainer}>
        <p>{MissingPagePermission}</p>
      </div>
    );
  }
};

export default Modeling;
