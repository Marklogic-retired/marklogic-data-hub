import React, { useState, useEffect, useContext } from 'react';
import { Tooltip } from 'antd';
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MlButton } from 'marklogic-ui-library';

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

   const newEntityAdded = () => {
    toggleShowEntityModal(false);
    getPrimaryEntityTypes();
   }

  return (
    <div className={styles.modelContainer}>
      <div className={styles.header}>
        <h1>Entity Types</h1>
        <div className={styles.buttonContainer}>
          { entityTypes.length == 0 ? 
            <Tooltip title={ModelingTooltips.addNewEntity}>
              <MlButton 
                type="primary"
                data-testid="add-btn" 
                onClick={()=> toggleShowEntityModal(true)}
                disabled={!canWriteEntityModel}
              >
                Add</MlButton>
            </Tooltip>
            :     
            <MlButton 
              type="primary"
              data-testid="add-btn" 
              onClick={()=> toggleShowEntityModal(true)}
              disabled={!canWriteEntityModel}
            >
              Add</MlButton>
          }
          <MlButton disabled>
            <span className={styles.publishIcon}></span>
            Save All
          </MlButton>
          <MlButton disabled>
            <FontAwesomeIcon 
              className={styles.icon} 
              icon={faUndo} 
              size="sm"
            />
            Revert All
          </MlButton>
        </div>
      </div>
      <EntityTypeModal 
        isVisible={showEntityModal} 
        toggleModal={toggleShowEntityModal}
        newEntityAdded={newEntityAdded}
      />
      <EntityTypeTable data-test-id="entity-type-table" allEntityTypesData={entityTypes}
              canReadEntityModel={canReadEntityModel}
              canWriteEntityModel={canWriteEntityModel}/>
    </div>
  );
}

export default Modeling; 