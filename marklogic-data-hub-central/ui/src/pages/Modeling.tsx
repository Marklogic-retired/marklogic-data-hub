import React, { useContext, useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MLButton } from '@marklogic/design-system';

import EntityTypeModal from '../components/modeling/entity-type-modal/entity-type-modal';
import EntityTypeTable from '../components/modeling/entity-type-table/entity-type-table';
import styles from './Modeling.module.scss';

import { primaryEntityTypes } from '../api/modeling';
import { UserContext } from '../util/user-context';
import { ModelingTooltips } from '../config/tooltips.config';
import { AuthoritiesContext } from '../util/authorities';

const Modeling: React.FC = () => {
  const { handleError, resetSessionTime } = useContext(UserContext);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [showEntityModal, toggleShowEntityModal] = useState(false);
  const [isEditModal, toggleIsEditModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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
      }
    } catch (error) {
      handleError(error)
    } finally {
      resetSessionTime();
    }
  }

  const updateEntityTypesAndHideModal = () => {
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

  return (
    <div className={styles.modelContainer}>
      <div className={styles.header}>
        <h1>Entity Types</h1>
        <div className={styles.buttonContainer}>
          {entityTypes.length == 0 ?
            <Tooltip title={ModelingTooltips.addNewEntity}>
              <MLButton
                type="primary"
                data-testid="add-btn"
                onClick={() => {
                  toggleIsEditModal(false);
                  toggleShowEntityModal(true);
                }}
                disabled={!canWriteEntityModel}
              >
                Add</MLButton>
            </Tooltip>
            :
            <MLButton
              type="primary"
              data-testid="add-btn"
              onClick={() => {
                toggleIsEditModal(false);
                toggleShowEntityModal(true);
              }}
              disabled={!canWriteEntityModel}
            >
              Add</MLButton>
          }
          <MLButton disabled>
            <span className={styles.publishIcon}></span>
            Save All
          </MLButton>
          <MLButton disabled>
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
      <EntityTypeTable data-test-id="entity-type-table" allEntityTypesData={entityTypes}
        canReadEntityModel={canReadEntityModel}
        canWriteEntityModel={canWriteEntityModel}
        editEntityTypeDescription={editEntityTypeDescription} />
    </div>
  );
}

export default Modeling;
