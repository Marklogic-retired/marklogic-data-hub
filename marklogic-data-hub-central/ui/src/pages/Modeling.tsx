import React, { useState, useEffect, useContext } from 'react';
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MLButton, MLTooltip, MLAlert } from '@marklogic/design-system';

import ConfirmationModal from '../components/confirmation-modal/confirmation-modal';
import EntityTypeModal from '../components/modeling/entity-type-modal/entity-type-modal';
import EntityTypeTable from '../components/modeling/entity-type-table/entity-type-table';
import styles from './Modeling.module.scss';

import { primaryEntityTypes, updateEntityModels } from '../api/modeling';
import { UserContext } from '../util/user-context';
import { ModelingContext } from '../util/modeling-context';
import { ModelingTooltips } from '../config/tooltips.config';
import { AuthoritiesContext } from '../util/authorities';
import { ConfirmationType } from '../types/modeling-types';

const Modeling: React.FC = () => {
  const { handleError, resetSessionTime } = useContext(UserContext);
  const { modelingOptions, setEntityTypeNamesArray, clearEntityModified } = useContext(ModelingContext);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [modifiedEntityTypes, setModifiedEntityTypes] = useState<any[]>([]);
  const [showEntityModal, toggleShowEntityModal] = useState(false);
  const [isEditModal, toggleIsEditModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [autoExpand, setAutoExpand] = useState('');
  const [revertAllEntity, toggleRevertAllEntity] = useState(false);
  const [useModifiedEntityTypesData, toggleModifiedEntityTypesData] = useState(false);

  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.SaveAll);

  //Role based access
  const authorityService = useContext(AuthoritiesContext);
  const canReadEntityModel = authorityService.canReadEntityModel();
  const canWriteEntityModel = authorityService.canWriteEntityModel();

  useEffect(() => {
    setEntityTypesFromServer();
  }, []);

  const setEntityTypesFromServer = async () => {
    const response = await getPrimaryEntityTypes();
    if (response) {
      setEntityTypes(response);
      if (response.length > 0) {
        setEntityTypeNamesArray(response.map(entity => {
          return {name: entity.entityName, entityTypeId: entity.entityTypeId}
        }));
      }
    }
  }

  const getPrimaryEntityTypes = async () => {
    try {
      const response = await primaryEntityTypes();
      return response['data'];
    } catch (error) {
      handleError(error)
    } finally {
      resetSessionTime();
    }
  }

  const saveAllEntitiesToServer = async () => {
    try {
      const response = await updateEntityModels(modelingOptions.modifiedEntitiesArray);
      if (response['status'] === 200) {
        clearEntityModified();
      } 
    } catch (error) {
      handleError(error)
    } finally {
      resetSessionTime();
      toggleConfirmModal(false);
    }
  }

  const updateEntityTypesAndHideModal = async (entityName: string, description: string) => {
    if (!isEditModal) {
      setAutoExpand(entityName + ',' + description);
    }
    toggleShowEntityModal(false);

    const primaryEntityTypes = await getPrimaryEntityTypes();
    if (primaryEntityTypes && primaryEntityTypes.length > 0) {
      const entityNameFilter = (entity) => entity.entityName === entityName;
      const newEntity = primaryEntityTypes.find(entityNameFilter);


      let modifiedEntitiesMap = {};
      modelingOptions.modifiedEntitiesArray.forEach(entity => {modifiedEntitiesMap[entity.entityName]=entity.modelDefinition});

      let newEntityTypes = [...entityTypes];
      newEntityTypes.forEach(entity => {
        if (modifiedEntitiesMap.hasOwnProperty(entity.entityName)){
          entity.model.definitions = JSON.parse(JSON.stringify(modifiedEntitiesMap[entity.entityName]));
        }
      });

      if (newEntityTypes.some(entityNameFilter)) {
        // edit modal i.e. updated description
        let updatedModel = newEntityTypes.find(entityNameFilter);
        updatedModel.model.definitions[entityName].description = newEntity.model.definitions[entityName].description;
      }
      else {
        // add modal
        newEntityTypes.push(newEntity);
      }
      toggleModifiedEntityTypesData(true);
      await setEntityTypesFromServer();
      setModifiedEntityTypes(newEntityTypes);
    }
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
  }

  const resetAllEntityTypes = () => {
    setEntityTypesFromServer().then(() => {
      clearEntityModified();
      toggleRevertAllEntity(true);
      toggleConfirmModal(false);
    })
  };

  const addButton = <MLButton 
    type="primary"
    aria-label="add-entity"
    onClick={() => {
      toggleIsEditModal(false);
      toggleShowEntityModal(true);
    }}
    disabled={!canWriteEntityModel}
    className={!canWriteEntityModel && styles.disabledButton}
  >Add</MLButton>

  return (
    <div className={styles.modelContainer}>
      { modelingOptions.isModified && (
        <MLAlert type="info" showIcon message={ModelingTooltips.entityEditedAlert}/>
      )}
      <div className={styles.header}>
        <h1>Entity Types</h1>
        <div className={styles.buttonContainer}>
          {entityTypes.length == 0 ?
            <MLTooltip title={ModelingTooltips.addNewEntity}>
              {addButton}
            </MLTooltip>
            : 
            canWriteEntityModel ?
              addButton
              :
              <MLTooltip title={'Add Entity Type: ' + ModelingTooltips.noWriteAccess}>
                <span>{addButton}</span>
              </MLTooltip>
          }
          <MLButton 
            disabled={!modelingOptions.isModified} 
            aria-label="save-all"
            onClick={() => {
              setConfirmType(ConfirmationType.SaveAll);
              toggleConfirmModal(true);
            }}
          >
            <span className={styles.publishIcon}></span>
            Save All
          </MLButton>
          <MLButton aria-label="revert-all" onClick={() => {
            setConfirmType(ConfirmationType.RevertAll);
            toggleConfirmModal(true)
          }}
                    disabled={!modelingOptions.isModified}>
            <FontAwesomeIcon 
              className={styles.icon} 
              icon={faUndo} 
              size="sm"
            />
            Revert All
          </MLButton>
        </div>
      </div>
      <ConfirmationModal
        isVisible={showConfirmModal}
        type={confirmType}
        boldTextArray={[]} 
        stepValues={[]}
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
        autoExpand={autoExpand}
        revertAllEntity={revertAllEntity}
        toggleRevertAllEntity={toggleRevertAllEntity}
        modifiedEntityTypesData={modifiedEntityTypes}
        useModifiedEntityTypesData={useModifiedEntityTypesData}
        toggleModifiedEntityTypesData={toggleModifiedEntityTypesData}
      />
    </div>
  );
}

export default Modeling;
