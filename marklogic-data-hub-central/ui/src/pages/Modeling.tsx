import React, {useState, useEffect, useContext, CSSProperties} from "react";
import {faUndoAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./Modeling.scss";

import ConfirmationModal from "@components/confirmation-modal/confirmation-modal";
import EntityTypeModal from "@components/modeling/entity-type-modal/entity-type-modal";
import EntityTypeTable from "@components/modeling/entity-type-table/entity-type-table";
import ViewSwitch from "@components/common/switch-view/view-switch";
import styles from "./Modeling.module.scss";

import {deleteEntity, entityReferences, updateHubCentralConfig, primaryEntityTypes, publishDraftModels, clearDraftModels, updateEntityModels, getHubCentralConfig} from "@api/modeling";
import {UserContext} from "@util/user-context";
import {ModelingContext} from "@util/modeling-context";
import {ModelingTooltips} from "@config/tooltips.config";
import {AuthoritiesContext} from "@util/authorities";
import {ConfirmationType} from "../types/common-types";
import {hubCentralConfig, ViewType} from "../types/modeling-types";
import tiles from "@config/tiles.config";
import {MissingPagePermission} from "@config/messages.config";
import GraphView from "@components/modeling/graph-view/graph-view";
import ModelingLegend from "@components/modeling/modeling-legend/modeling-legend";
import {defaultModelingView} from "@config/modeling.config";
import PublishToDatabaseIcon from "../assets/publish-to-database-icon";
import {HCAlert, HCButton, HCTooltip} from "@components/common";
import {updateUserPreferences} from "../services/user-preferences";
import {entitiesConfigExist} from "@util/modeling-utils";

const Modeling: React.FC = () => {
  const {user, handleError} = useContext(UserContext);
  const {modelingOptions, setEntityTypeNamesArray, clearEntityModified, setView, setSelectedEntity} = useContext(ModelingContext);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [showEntityModal, toggleShowEntityModal] = useState(false);
  const [isEditModal, toggleIsEditModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [namespace, setNamespace] = useState("");
  const [version, setVersion] = useState("");
  const [prefix, setPrefix] = useState("");
  const [color, setColor] = useState("");
  const [icon, setIcon] = useState("");

  const [autoExpand, setAutoExpand] = useState("");
  //const [revertAllEntity, toggleRevertAllEntity] = useState(false);
  const [width, setWidth] = React.useState(window.innerWidth);

  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [showRevertConfirmModal, toggleRevertConfirmModal] = useState(false);
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

  //hubCentral Config
  const [hubCentralConfig, sethubCentralConfig] = useState({});
  const [revertUnpublishedChanges, setRevertUnpublishedChanges] = useState(false);


  useEffect(() => {
    if (canReadEntityModel && modelingOptions.view === ViewType.table) {
      setEntityTypesFromServer();
    }
  }, [modelingOptions.view]);

  useEffect(() => {
    if (canReadEntityModel) {
      setEntityTypesFromServer();
      setHubCentralConfigFromServer();
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

  const setHubCentralConfigFromServer = async () => {
    try {
      const response = await getHubCentralConfig();
      if (response["status"] === 200) {
        sethubCentralConfig(response.data);
        if (!entitiesConfigExist(response.data)) {
          let preferencesObject = {
            modelingGraphOptions: {physicsEnabled: true}
          };
          updateUserPreferences(user.name, preferencesObject);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const saveAllEntitiesToServer = async (entitiesArray, errorHandler: Function|undefined) => {
    let isSuccess = true;
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
      isSuccess = false;
      if (errorHandler) {
        await errorHandler(error);
      } else {
        handleError(error);
      }
    } finally {
      toggleRelationshipModal(false);
      toggleConfirmModal(false);
    }
    return isSuccess;
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

  const clearDraftModel = async () => {
    try {
      let response = await clearDraftModels();
      if (response["status"] === 200) {
        await setEntityTypesFromServer();
      }
    } catch (error) {
      handleError(error);
    } finally {
      clearEntityModified();
      toggleRevertConfirmModal(false);
      setRevertUnpublishedChanges(true);
    }
  };

  const publishHubCentralConfig = async (hubCentralConfig: hubCentralConfig) => {
    try {
      let response = await updateHubCentralConfig(hubCentralConfig);
      if (response["status"] === 200) {
        await setHubCentralConfigFromServer();
      }
    } catch (error) {
      handleError(error);
    } finally {
      toggleRelationshipModal(false);
      toggleConfirmModal(false);
    }
  };

  const updateEntityTypesAndHideModal = async (entityName: string, description: string) => {
    if (!isEditModal) {
      setAutoExpand(entityName);
    }
    toggleShowEntityModal(false);
    await setEntityTypesFromServer().then((resp => {
      if (!isEditModal && modelingOptions.view === ViewType.graph) {
        let isDraft = true;
        setSelectedEntity(entityName, isDraft);
      }
    }));
  };

  const editEntityTypeDescription = (entityTypeName: string, entityTypeDescription: string, entityTypeNamespace: string, entityTypePrefix: string, entityTypeVersion: string, entityTypeColor: string, entityTypeIcon: string) => {
    if (canWriteEntityModel) {
      toggleIsEditModal(true);
      toggleShowEntityModal(true);
      setName(entityTypeName);
      setDescription(entityTypeDescription);
      setNamespace(entityTypeNamespace);
      setPrefix(entityTypePrefix);
      setVersion(entityTypeVersion);
      setColor(entityTypeColor);
      setIcon(entityTypeIcon);
    }
  };

  const confirmAction = () => {
    if (confirmType === ConfirmationType.PublishAll) {
      publishDraftModelToServer();
    } else if (confirmType === ConfirmationType.DeleteEntityRelationshipOutstandingEditWarn || confirmType === ConfirmationType.DeleteEntityNoRelationshipOutstandingEditWarn || confirmType === ConfirmationType.DeleteEntity) {
      deleteEntityFromServer();
    } else if (confirmType === ConfirmationType.RevertChanges) {
      clearDraftModel();
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


  const addButton = <HCButton
    variant="primary"
    size="sm"
    aria-label="add-entity"
    onClick={() => {
      toggleIsEditModal(false);
      toggleShowEntityModal(true);
    }}
    disabled={!canWriteEntityModel}
    className={!canWriteEntityModel ? styles.disabledPointerEvents : undefined}
  >Add</HCButton>;

  const publishIconStyle: CSSProperties = {
    width: "15px",
    height: "15px",
    fill: "currentColor"
  };

  const publishButton = <span className={styles.publishButtonParent}><HCButton
    className={canWriteEntityModel ? (!modelingOptions.isModified ? styles.disabledPointerEvents : "") : styles.disabledPointerEvents}
    disabled={canWriteEntityModel ? !modelingOptions.isModified : true}
    aria-label="publish-to-database"
    variant="outline-light"
    onClick={() => {
      setConfirmType(ConfirmationType.PublishAll);
      toggleConfirmModal(true);
    }}
    size="sm"
  >
    <span className={styles.publishButtonContainer}>
      <PublishToDatabaseIcon style={publishIconStyle} />
      <span className={styles.publishButtonText}>Publish</span>
    </span>
  </HCButton>
  </span>;

  const revertButton = <span className={styles.publishButtonParent}><HCButton
    className={canWriteEntityModel ? (!modelingOptions.isModified ? styles.disabledPointerEvents : "") : styles.disabledPointerEvents}
    disabled={canWriteEntityModel ? !modelingOptions.isModified : true}
    aria-label="revert-changes-table-view"
    variant="outline-light"
    onClick={() => {
      toggleRevertConfirmModal(true);
      setConfirmType(ConfirmationType.RevertChanges);
    }}
    size="sm"
  >
    <span className={styles.publishButtonContainer}>
      <FontAwesomeIcon icon={faUndoAlt} className={styles.revertButton}/>
      <span className={styles.publishButtonText}>Revert</span>
    </span>
  </HCButton>
  </span>;

  const handleViewChange = (view) => {
    if (view === "table") {
      setView(ViewType.table);
    } else {
      setView(defaultModelingView);
    }
  };

  if (canAccessModel) {
    return (
      <div className={styles.modelContainer}>
        {modelingOptions.view === ViewType.table ?
          <div className={styles.stickyHeader} style={{width: width - 138, maxWidth: width - 138}}>
            <div className={styles.intro}>
              <p>{tiles.model.intro}</p>
              {<ViewSwitch handleViewChange={handleViewChange} selectedView={modelingOptions.view}/>}
            </div>
            {modelingOptions.isModified && (
              <div className={modelingOptions.isModified ? styles.alertContainer : ""}>
                <HCAlert
                  variant="info"
                  aria-label="entity-modified-alert"
                  showIcon
                >{ModelingTooltips.entityEditedAlert}</HCAlert>
              </div>
            )}
            <div>
              <div className={styles.header}>
                <h1>Entity Types</h1>
                <div className={styles.buttonContainer}>
                  <ModelingLegend/>
                  <div style={{float: "right"}}>
                    {canWriteEntityModel ?
                      <HCTooltip id="add-entity-tooltip" placement="top" text={ModelingTooltips.addNewEntity}>
                        <span>{addButton}</span>
                      </HCTooltip>
                      :
                      <HCTooltip
                        id="add-entity-disabled-tooltip"
                        text={ModelingTooltips.addNewEntity + " " + ModelingTooltips.noWriteAccess}
                        placement="top" className={styles.tooltipOverlay}>
                        <span className={styles.disabledCursor}>{addButton}</span>
                      </HCTooltip>
                    }
                    {canWriteEntityModel ?
                      <HCTooltip id="publish-tooltip" text={ModelingTooltips.revertChanges} className={styles.tooltipOverlay} placement="top">
                        <span className={modelingOptions.isModified ? styles.CursorButton : styles.disabledCursor}>
                          {revertButton}
                        </span>
                      </HCTooltip>
                      :
                      <HCTooltip id="publish-disabled-tooltip" text={ModelingTooltips.revertChanges + " " + ModelingTooltips.noWriteAccess} placement="top" className={styles.tooltipOverlay}>
                        <span className={styles.revertDisabledCursor}>{revertButton}</span>
                      </HCTooltip>
                    }
                    {canWriteEntityModel ?
                      <HCTooltip id="publish-tooltip" text={ModelingTooltips.publish} className={styles.tooltipOverlay} placement="top">
                        <span className={modelingOptions.isModified ? styles.CursorButton : styles.disabledCursor}>
                          {publishButton}
                        </span>
                      </HCTooltip>
                      :
                      <HCTooltip id="publish-disabled-tooltip" text={ModelingTooltips.publish + " " + ModelingTooltips.noWriteAccess} placement="top" className={styles.tooltipOverlay}>
                        <span className={styles.disabledCursor}>{publishButton}</span>
                      </HCTooltip>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div> : <>
            <div className={styles.intro}>
              <p>{tiles.model.intro}</p>
              {<ViewSwitch handleViewChange={handleViewChange} selectedView={modelingOptions.view}/>}
            </div>
            {modelingOptions.isModified && (
              <div className={modelingOptions.isModified ? styles.alertContainer : ""}>
                <HCAlert
                  variant="info"
                  aria-label="entity-modified-alert"
                  showIcon
                >{ModelingTooltips.entityEditedAlert}</HCAlert>
              </div>
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
              toggleRevertConfirmModal = {toggleRevertConfirmModal}
              setConfirmType={setConfirmType}
              hubCentralConfig={hubCentralConfig}
              updateHubCentralConfig={publishHubCentralConfig}
              revertUnpublishedChanges={revertUnpublishedChanges}
              setRevertUnpublishedChanges={setRevertUnpublishedChanges}
            />
          </>
        }
        {modelingOptions.view === ViewType.table ? <div
          className={modelingOptions.isModified ? styles.entityTableContainer : styles.entityTableContainerWithoutAlert}>
          <EntityTypeTable
            canReadEntityModel={canReadEntityModel}
            canWriteEntityModel={canWriteEntityModel}
            allEntityTypesData={entityTypes}
            editEntityTypeDescription={editEntityTypeDescription}
            updateEntities={setEntityTypesFromServer}
            updateSavedEntity={saveAllEntitiesToServer}
            autoExpand={autoExpand}
            hubCentralConfig={hubCentralConfig}
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
        <ConfirmationModal
          isVisible={showRevertConfirmModal}
          type={ConfirmationType.RevertChanges}
          arrayValues={![ConfirmationType.RevertChanges].includes(confirmType) ? arrayValues : []}
          boldTextArray={![ConfirmationType.RevertChanges].includes(confirmType) ? confirmBoldTextArray : []}
          toggleModal={toggleRevertConfirmModal}
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
          version={version}
          prefix={prefix}
          color={color}
          icon={icon}
          updateHubCentralConfig={publishHubCentralConfig}
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
