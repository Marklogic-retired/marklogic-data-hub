import React, { useState, useContext, useEffect } from 'react';
import { Modal } from 'antd';
import styles from './EntityTypes.module.scss';
import { AuthoritiesContext } from '../util/authorities';
import { UserContext } from '../util/user-context';
import axios from 'axios'
import EntityTiles from '../components/entities/entity-tiles';

// TODO Rename EntityTypes component to Curate
const EntityTypes: React.FC = () => {

    useEffect(() => {
        getEntityModels();
        getFlows();
    },[]);

    const { handleError, resetSessionTime } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const [flows, setFlows] = useState<any[]>([]);
    const [entityModels, setEntityModels] = useState<any>({});

    //Role based access
    const authorityService = useContext(AuthoritiesContext);
    const canReadMapping = authorityService.canReadMapping();
    const canWriteMapping = authorityService.canWriteMapping();
    const canReadMatchMerge = authorityService.canReadMatchMerge();
    const canWriteMatchMerge = authorityService.canWriteMatchMerge();
    const canWriteFlow = authorityService.canWriteFlow();

    const getEntityModels = async () => {
        try {
          let response = await axios.get(`/api/models/primaryEntityTypes`);
          if (response.status === 200) {
              let models:any = {};
              response.data.map(model => {
                  // model has an entityTypeId property, perhaps that should be used instead of entityName?
                  models[model.entityName] = model;
              });
              setEntityModels({...models});
          }
        } catch (error) {
            let message = error;
            console.error('Error while fetching entities Info', message);
        } finally {
          resetSessionTime();
        }

    }

  //GET all the flow artifacts
  const getFlows = async () => {
        try {
            let response = await axios.get('/api/flows');
            if (response.status === 200) {
                setFlows(response.data);
            }
        } catch (error) {
            let message = error.response.data.message;
            console.error('Error getting flows', message);
        } finally {
        resetSessionTime();
        }
    }

  // POST mapping step to new flow
  const addStepToNew = async () => {
    try {
      setIsLoading(true);
      //let response = await axios.post(`/api/artifacts/????/${flowName}`);

      //if (response.status === 200) {
        setIsLoading(false);
      //}
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error while adding mapping step to new flow.', message);
        setIsLoading(false);
        handleError(error);
    } finally {
      resetSessionTime();
    }
  }

  // POST mapping step to existing flow
  const addStepToFlow = async (mappingArtifactName, flowName) => {
    let stepToAdd = {
      "name": mappingArtifactName,
      "stepDefinitionName": "entity-services-mapping",
      "stepDefinitionType": "MAPPING",
      options: {
        "mapping": {
          "name": mappingArtifactName
        }
      }
    };
    try {
      setIsLoading(true);
      let url = '/api/flows/' + flowName + '/steps';
      let body = stepToAdd;
      let response = await axios.post(url, body);
      if (response.status === 200) {
        setIsLoading(false);
      }
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error while adding mapping step to flow.', message);
        setIsLoading(false);
        Modal.error({
          content: 'Error adding step "' + mappingArtifactName + '" to flow "' + flowName + '."',
        });
        handleError(error);
    } finally {
      resetSessionTime();
    }
  }


    return (
        <div className={styles.curateContainer}>
          <EntityTiles
            flows={flows}
            canReadMatchMerge={canReadMatchMerge}
            canWriteMatchMerge={canWriteMatchMerge}
            canWriteMapping={canWriteMapping}
            canReadMapping={canReadMapping}
            entityModels={entityModels}
            getEntityModels={getEntityModels}
            canWriteFlow={canWriteFlow}
            addStepToFlow={addStepToFlow}
            addStepToNew={addStepToNew}
          />
        </div>
    );

}

export default EntityTypes;
