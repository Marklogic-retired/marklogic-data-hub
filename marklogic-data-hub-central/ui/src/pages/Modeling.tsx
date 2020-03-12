import React, { useState, useEffect, useContext } from 'react';
import { faSave, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MlButton } from 'marklogic-ui-library';

import EntityTypeModal from '../components/modeling/entity-type-modal/entity-type-modal';
import EntityTypeTable from '../components/modeling/entity-type-table/entity-type-table';
import styles from './Modeling.module.scss';

import { primaryEntityTypes } from '../api/modeling';
import { UserContext } from '../util/user-context';

// TODO Rename Modeling component to Model
const Modeling: React.FC = () => {
  const { handleError, resetSessionTime } = useContext(UserContext);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [showEntityModal, toggleShowEntityModal] = useState(false);

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
          <MlButton 
            type="primary"
            data-testid="add-btn" 
            onClick={()=> toggleShowEntityModal(true)}
          >
            Add</MlButton>
          <MlButton disabled>
            <FontAwesomeIcon 
              className={styles.icon} 
              icon={faSave} 
              size="sm"
            />
            Publish All
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
      <EntityTypeTable data-test-id="entity-type-table" allEntityTypesData={entityTypes}/>
    </div>
  );
}

export default Modeling; 