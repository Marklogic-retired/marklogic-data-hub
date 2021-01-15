import React, {useState, useEffect, useContext} from "react";
import {faSave, faUndo} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {MLButton, MLTooltip, MLAlert} from "@marklogic/design-system";

import ConfirmationModal from "../components/confirmation-modal/confirmation-modal";
import EntityTypeModal from "../components/modeling/entity-type-modal/entity-type-modal";
import EntityTypeTable from "../components/modeling/entity-type-table/entity-type-table";
import styles from "./Modeling.module.scss";

import {primaryEntityTypes, updateEntityModels} from "../api/modeling";
import {UserContext} from "../util/user-context";
import {ModelingContext} from "../util/modeling-context";
import {ModelingTooltips} from "../config/tooltips.config";
import {AuthoritiesContext} from "../util/authorities";
import {EntityModified} from "../types/modeling-types";
import {ConfirmationType} from "../types/common-types";
import tiles from "../config/tiles.config";
import {MissingPagePermission} from "../config/messages.config";

const Modeling: React.FC = () => {
  const {handleError} = useContext(UserContext);
  const {modelingOptions, setEntityTypeNamesArray, clearEntityModified} = useContext(ModelingContext);

  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [showEntityModal, toggleShowEntityModal] = useState(false);
  const [isEditModal, toggleIsEditModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [autoExpand, setAutoExpand] = useState("");
  const [revertAllEntity, toggleRevertAllEntity] = useState(false);

  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.SaveAll);

  //Role based access
  const authorityService = useContext(AuthoritiesContext);
  const canReadEntityModel = authorityService.canReadEntityModel();
  const canWriteEntityModel = authorityService.canWriteEntityModel();
  const canAccessModel = authorityService.canAccessModel();

  useEffect(() => {
    if (canReadEntityModel) {
      setEntityTypesFromServer();
    }
  }, []);

  const setEntityTypesFromServer = async () => {
    try {
      const response = await primaryEntityTypes();

      if (response) {
        setEntityTypes(response["data"]);
        if (response["data"].length > 0) {
          setEntityTypeNamesArray(response["data"].map(entity => {
            return {name: entity.entityName, entityTypeId: entity.entityTypeId};
          }));
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const saveAllEntitiesToServer = async () => {
    try {
      const response = await updateEntityModels(modelingOptions.modifiedEntitiesArray);
      if (response["status"] === 200) {
        await setEntityTypesFromServer();
      }
    } catch (error) {
      handleError(error);
    } finally {
      clearEntityModified();
      toggleConfirmModal(false);
    }
  };

  const updateSavedEntity = (entity: EntityModified) => {
    let updatedEntityTypes = [...entityTypes];
    let updateEntityIndex = updatedEntityTypes.findIndex((entityType) => entityType.entityName === entity.entityName);

    updatedEntityTypes[updateEntityIndex]["model"]["definitions"] = entity.modelDefinition;
    setEntityTypes(updatedEntityTypes);
  };

  const updateEntityTypesAndHideModal = async (entityName: string, description: string) => {
    if (!isEditModal) {
      setAutoExpand(entityName + "," + description);
    }
    toggleShowEntityModal(false);
    await setEntityTypesFromServer();
  };

  const editEntityTypeDescription = (entityTypeName: string, entityTypeDescription: string) => {
    if (canWriteEntityModel) {
      toggleIsEditModal(true);
      toggleShowEntityModal(true);
      setName(entityTypeName);
      setDescription(entityTypeDescription);
    }
  };

  const confirmAction = () => {
    if (confirmType === ConfirmationType.SaveAll) {
      saveAllEntitiesToServer();
    } else if (confirmType === ConfirmationType.RevertAll) {
      resetAllEntityTypes();
    }
  };

  const resetAllEntityTypes = async () => {
    await setEntityTypesFromServer();
    clearEntityModified();
    toggleRevertAllEntity(true);
    toggleConfirmModal(false);
  };

  const addButton = <MLButton
    type="primary"
    aria-label="add-entity"
    onClick={() => {
      toggleIsEditModal(false);
      toggleShowEntityModal(true);
    }}
    disabled={!canWriteEntityModel}
    className={!canWriteEntityModel && styles.disabledPointerEvents}
  >Add</MLButton>;

  const saveAllButton = <MLButton
    className={!modelingOptions.isModified?styles.disabledPointerEvents:""}
    disabled={!modelingOptions.isModified}
    aria-label="save-all"
    onClick={() => {
      setConfirmType(ConfirmationType.SaveAll);
      toggleConfirmModal(true);
    }}
  >
    <FontAwesomeIcon
      icon={faSave}
      className={styles.publishIcon}
      size="sm"
    />
    Save All
  </MLButton>;

  const revertAllButton = <MLButton
    className={!modelingOptions.isModified?styles.disabledPointerEvents:""}
    disabled={!modelingOptions.isModified}
    aria-label="revert-all"
    onClick={() => {
      setConfirmType(ConfirmationType.RevertAll);
      toggleConfirmModal(true);
    }}
  >
    <FontAwesomeIcon
      className={styles.icon}
      icon={faUndo}
      size="sm"
    />
    Revert All
  </MLButton>;

  if (canAccessModel) {
    return (
      <div className={styles.modelContainer}>
        <div className={styles.intro}>
          <p>{tiles.model.intro}</p>
        </div>
        { modelingOptions.isModified && (
          <MLAlert type="info" aria-label="entity-modified-alert" showIcon message={ModelingTooltips.entityEditedAlert}/>
        )}
        <div className={styles.header}>
          <h1>Entity Types</h1>
          <div className={styles.buttonContainer}>
            {canWriteEntityModel ?
              <MLTooltip title={ModelingTooltips.addNewEntity}>
                {addButton}
              </MLTooltip>
              :
              <MLTooltip title={ModelingTooltips.addNewEntity + " " + ModelingTooltips.noWriteAccess} placement="top" overlayStyle={{maxWidth: "175px"}}>
                <span className={styles.disabledCursor}>{addButton}</span>
              </MLTooltip>
            }
            {canWriteEntityModel ?
              <MLTooltip title={ModelingTooltips.saveAll} overlayStyle={{maxWidth: "175px"}}>
                <span className={modelingOptions.isModified?styles.CursorButton:styles.disabledCursor}>{saveAllButton}</span>
              </MLTooltip>
              :
              <MLTooltip title={ModelingTooltips.saveAll + " " + ModelingTooltips.noWriteAccess} placement="top" overlayStyle={{maxWidth: "225px"}}>
                <span className={styles.disabledCursor}>{saveAllButton}</span>
              </MLTooltip>
            }
            {canWriteEntityModel ?
              <MLTooltip title={ModelingTooltips.revertAll} overlayStyle={{maxWidth: "175px"}}>
                <span className={modelingOptions.isModified?styles.CursorButton:styles.disabledCursor}>{revertAllButton}</span>
              </MLTooltip>
              :
              <MLTooltip title={ModelingTooltips.revertAll + " " + ModelingTooltips.noWriteAccess} placement="left" overlayStyle={{maxWidth: "250px"}}>
                <span className={styles.disabledCursor}>{revertAllButton}</span>
              </MLTooltip>
            }
          </div>
        </div>
        <ConfirmationModal
          isVisible={showConfirmModal}
          type={confirmType}
          boldTextArray={[]}
          arrayValues={[]}
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
        />
        <EntityTypeTable
          canReadEntityModel={canReadEntityModel}
          canWriteEntityModel={canWriteEntityModel}
          allEntityTypesData={entityTypes}
          editEntityTypeDescription={editEntityTypeDescription}
          updateEntities={setEntityTypesFromServer}
          updateSavedEntity={updateSavedEntity}
          autoExpand={autoExpand}
          revertAllEntity={revertAllEntity}
          toggleRevertAllEntity={toggleRevertAllEntity}
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
