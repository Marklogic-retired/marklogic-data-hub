import React, { useState, useContext, useEffect } from 'react';
import { Modal } from 'antd';
import styles from './Curate.module.scss';
import { AuthoritiesContext } from '../util/authorities';
import { UserContext } from '../util/user-context';
import axios from 'axios';
import EntityTiles from '../components/entities/entity-tiles';
import tiles from '../config/tiles.config';

const Curate: React.FC = () => {

    useEffect(() => {
        getEntityModels();
        getFlows();
    },[]);

    const { handleError } = useContext(UserContext);
    // const [isLoading, setIsLoading] = useState(false);
    const [flows, setFlows] = useState<any[]>([]);
    const [entityModels, setEntityModels] = useState<any>({});

    //Role based access
    const authorityService = useContext(AuthoritiesContext);
    const canReadMapping = authorityService.canReadMapping();
    const canWriteMapping = authorityService.canWriteMapping();
    const canReadMatchMerge = authorityService.canReadMatchMerge();
    const canWriteMatchMerge = authorityService.canWriteMatchMerge();
    const canWriteFlow = authorityService.canWriteFlow();
    const canReadCustom = authorityService.canReadCustom();

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
            console.error('Error fetching entities', error);
            handleError(error);
        }

    };

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
        }
    };

  // POST mapping step to new flow
  const addStepToNew = async () => {
    try {
      // setIsLoading(true);

      //if (response.status === 200) {
      //   setIsLoading(false);
      //}
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error while adding mapping step to new flow.', message);
        // setIsLoading(false);
        handleError(error);
    }
  };

  // POST mapping step to existing flow
  const addStepToFlow = async (mappingArtifactName, flowName) => {
    let stepToAdd = {
      "stepName": mappingArtifactName,
      "stepDefinitionType": "mapping"
    };
    try {
      // setIsLoading(true);
      let url = '/api/flows/' + flowName + '/steps';
      let body = stepToAdd;
      let response = await axios.post(url, body);
      if (response.status === 200) {
        // setIsLoading(false);
      }
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error while adding mapping step to flow.', message);
        // setIsLoading(false);
        Modal.error({
          content: 'Error adding step "' + mappingArtifactName + '" to flow "' + flowName + '."',
        });
        handleError(error);
    }
  };


    return (
        <div className={styles.curateContainer}>
          <div className={styles.intro}>
            <p>{tiles.curate.intro}</p>
          </div>
          <EntityTiles
            flows={flows}
            canReadMatchMerge={canReadMatchMerge}
            canWriteMatchMerge={canWriteMatchMerge}
            canWriteMapping={canWriteMapping}
            canReadMapping={canReadMapping}
            canReadCustom={canReadCustom}
            canWriteCustom={false}
            entityModels={entityModels}
            getEntityModels={getEntityModels}
            canWriteFlow={canWriteFlow}
            addStepToFlow={addStepToFlow}
            addStepToNew={addStepToNew}
          />
        </div>
    );

};

export default Curate;
