import React, { useState, useContext, useEffect } from 'react';
import { Modal } from 'antd';
import styles from './EntityTypes.module.scss';
import { RolesContext } from '../util/roles';
import { UserContext } from '../util/user-context';
import axios from 'axios'
import EntityTiles from '../components/entities/entity-tiles';

const EntityTypes: React.FC = () => {

    useEffect(() => {
        getEntityModels();
        getFlows();
    },[]);

    const { handleError, resetSessionTime } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const [flows, setFlows] = useState<any[]>([]);
    const [entityModels, setEntityModels] = useState<any[]>([]);
    
    //Role based access
    const roleService = useContext(RolesContext);
    const canReadOnly = roleService.canReadMappings();
    const canReadWrite = roleService.canWriteMappings();
    const canReadMatchMerge = roleService.canReadMatchMerge();
    const canWriteMatchMerge = roleService.canWriteMatchMerge();
    const canWriteFlows = roleService.canWriteFlows();

    const getEntityModels = async () => {
        try {
        let response = await axios.get(`/api/entities`);
        if(response.status === 200) {
            let entModels:any = {};
            response.data.map(ent => {
                entModels[ent.info.title] = ent
            });
            setEntityModels({...entModels});
        }
            
              console.log('GET Entities Info API Called successfully!');
             
          } catch (error) {
              let message = error;
              console.log('Error while fetching entities Info', message);
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
                console.log('GET flows successful', response);
            } 
        } catch (error) {
            let message = error.response.data.message;
            console.log('Error getting flows', message);
        } finally {
        resetSessionTime();
        }
    }

  // POST load data step to new flow
  const addStepToNew = async () => {
    try {
      setIsLoading(true);
      //let response = await axios.post(`/api/artifacts/????/${flowName}`);
      
      //if (response.status === 200) {
        console.log('POST addStepToNew');
        setIsLoading(false);
      //} 
    } catch (error) {
        let message = error.response.data.message;
        console.log('Error while adding load data step to new flow.', message);
        setIsLoading(false);
        handleError(error);
    } finally {
      resetSessionTime();
    }
  }

  // POST load data step to existing flow
  const addStepToFlow = async (loadArtifactName, flowName) => {
    let stepToAdd = {
      "name": loadArtifactName,
      "stepDefinitionName": "default-ingestion",
      "stepDefinitionType": "INGESTION",
      options: {
        "loadData": { 
          "name": loadArtifactName
        }
      }
    };
    try {
      setIsLoading(true);
      let url = '/api/flows/' + flowName + '/steps';
      let body = stepToAdd;
      let response = await axios.post(url, body);
      if (response.status === 200) {
        console.log('POST addStepToFlow', response.data);
        setIsLoading(false);
      } 
    } catch (error) {
        let message = error.response.data.message;
        console.log('Error while adding load data step to flow.', message);
        setIsLoading(false);
        Modal.error({
          content: 'Error adding step "' + loadArtifactName + '" to flow "' + flowName + '."',
        });
        handleError(error);
    } finally {
      resetSessionTime();
    }
  }
    

    return (
        <div className={styles.entityContainer}>
        
        <EntityTiles
        flows={flows}
        canReadMatchMerge={canReadMatchMerge}
        canWriteMatchMerge={canWriteMatchMerge}
        canReadWrite={canReadWrite}
        canReadOnly={canReadOnly}
        entityModels={entityModels}
        getEntityModels={getEntityModels}
        canWriteFlows={canWriteFlows}
        addStepToFlow={addStepToFlow}
        addStepToNew={addStepToNew}/>
        </div>
    );

}

export default EntityTypes;
