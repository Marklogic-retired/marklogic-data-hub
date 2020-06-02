import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Tooltip, Alert } from 'antd';
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MLButton } from '@marklogic/design-system';

import EntityTypeModal from '../components/modeling/entity-type-modal/entity-type-modal';
import EntityTypeTable from '../components/modeling/entity-type-table/entity-type-table';
import styles from './Modeling.module.scss';

import { primaryEntityTypes } from '../api/modeling';
import { UserContext } from '../util/user-context';
import { ModelingContext } from '../util/modeling-context';
import { ModelingTooltips } from '../config/tooltips.config';
import { AuthoritiesContext } from '../util/authorities';

const Modeling: React.FC = () => {
  const { handleError, resetSessionTime } = useContext(UserContext);
  const { modelingOptions, setEntityTypeNamesArray } = useContext(ModelingContext);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [showEntityModal, toggleShowEntityModal] = useState(false);
  const [isEditModal, toggleIsEditModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [autoExpand, setAutoExpand] = useState('');

  //Role based access
  const authorityService = useContext(AuthoritiesContext);
  const canReadEntityModel = authorityService.canReadEntityModel();
  const canWriteEntityModel = authorityService.canWriteEntityModel();

  useEffect(() => {
    getPrimaryEntityTypes();
  }, []);

  const getPrimaryEntityTypes = async () => {
    try {
      const response = await primaryEntityTypes();
      if (response['data']) {
        setEntityTypes(response['data']);
        if (response['data'].length > 0 ) {
          setEntityTypeNamesArray(response['data'].map(entity => { return { name: entity.entityName, entityTypeId: entity.entityTypeId} }));
        }
      }
    } catch (error) {
      handleError(error)
    } finally {
      resetSessionTime();
    }
  }

  const updateEntityTypesAndHideModal = (entityName: string, description: string) => {
    if (!isEditModal) {
      setAutoExpand(entityName + ',' + description);
    }
    toggleShowEntityModal(false);
    getPrimaryEntityTypes();
  }

  const editEntityTypeDescription = (entityTypeName: string, entityTypeDescription: string) => {
    if (canWriteEntityModel) {
      toggleIsEditModal(true);
      toggleShowEntityModal(true);
      setName(entityTypeName);
      setDescription(entityTypeDescription);
    }
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
        <Alert type="info" showIcon message={ModelingTooltips.entityEditedAlert}/>
      )}
      <div className={styles.header}>
        <h1>Entity Types</h1>
        <div className={styles.buttonContainer}>
          {entityTypes.length == 0 ?
            <Tooltip title={ModelingTooltips.addNewEntity}>
              {addButton}
            </Tooltip>
            : 
            canWriteEntityModel ?
              addButton
              :
              <Tooltip title={'Add Entity Type: ' + ModelingTooltips.noWriteAccess}>
                <span>{addButton}</span>
              </Tooltip>
          }
          <MLButton disabled aria-label="save-all">
            <span className={styles.publishIcon}></span>
            Save All
          </MLButton>
          <MLButton disabled aria-label="revert-all">
            <FontAwesomeIcon 
              className={styles.icon} 
              icon={faUndo} 
              size="sm"
            />
            Revert All
          </MLButton>
        </div>
      </div>
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
        autoExpand={autoExpand}
      />
    </div>
  );
}

export default Modeling;
