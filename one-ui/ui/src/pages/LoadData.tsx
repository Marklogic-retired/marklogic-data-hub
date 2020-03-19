import React, { useState, useEffect, useContext } from 'react';
import {Modal} from 'antd';
import styles from './LoadData.module.scss';
import LoadDataList from '../components/load-data/load-data-list';
import SwitchView from '../components/load-data/switch-view';
import LoadDataCard from '../components/load-data/load-data-card';
import { UserContext } from '../util/user-context';
import axios from 'axios'
import { RolesContext } from "../util/roles";

const LoadData: React.FC = () => {
  let [viewType, setViewType] = useState('table');
  const [isLoading, setIsLoading] = useState(false);
  const [loadDataArtifacts, setLoadDataArtifacts] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const { handleError } = useContext(UserContext);

  //For role based privileges
  const roleService = useContext(RolesContext);
  const canReadOnly = roleService.canReadLoadData();
  const canReadWrite = roleService.canWriteLoadData();
  const canWriteFlows = roleService.canWriteFlows();

  //Set context for switching views
  const handleViewTypeSelection = (vtype) => {
    setViewType(vtype);
  }

  useEffect(() => {
      getLoadDataArtifacts();
      getFlows();
  }, [isLoading]);

  //CREATE/POST load data Artifact
  const createLoadDataArtifact = async (loadDataObj) => {
    console.log('loadDataObj', loadDataObj);
    try {
      setIsLoading(true);

      let response = await axios.post(`/api/artifacts/loadData/${loadDataObj.name}`, loadDataObj);
      if (response.status === 200) {
        console.log('Create/Update LoadDataArtifact API Called successfully!')
        setIsLoading(false);
      }
    }
    catch (error) {
      let message = error.response.data.message;
      console.log('Error While creating the Load Data artifact!', message)
      setIsLoading(false);
      handleError(error);
    }

  }

  //GET all the data load artifacts
  const getLoadDataArtifacts = async () => {
    try {
      let response = await axios.get('/api/artifacts/loadData');
      
      if (response.status === 200) {
        setLoadDataArtifacts([...response.data]);
        console.log('GET Artifacts API Called successfully!');
      } 
    } catch (error) {
        let message = error.response.data.message;
        console.log('Error while fetching load data artifacts', message);
        handleError(error);
    }
  }

  //DELETE Load Data Artifact
  const deleteLoadDataArtifact = async (loadDataName) => {
    try {
      setIsLoading(true);
      let response = await axios.delete(`/api/artifacts/loadData/${loadDataName}`);
      
      if (response.status === 200) {
        console.log('DELETE API Called successfully!');
        setIsLoading(false);
      } 
    } catch (error) {
        let message = error.response.data.message;
        console.log('Error while deleting load data artifact.', message);
        setIsLoading(false);
        handleError(error);
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
    }
  }

  //Setting the value of switch view output
  let output; 

  if (viewType === 'table') {
    output = <LoadDataList
      data={loadDataArtifacts}
      deleteLoadDataArtifact={deleteLoadDataArtifact}
      createLoadDataArtifact={createLoadDataArtifact}
      canReadWrite={canReadWrite}
      canReadOnly={canReadOnly}
    />
  }
  else {
    output = <div className={styles.cardView}>
      <LoadDataCard 
        data={loadDataArtifacts} 
        flows={flows}
        deleteLoadDataArtifact={deleteLoadDataArtifact} 
        createLoadDataArtifact={createLoadDataArtifact} 
        canReadWrite={canReadWrite}
        canReadOnly={canReadOnly}
        canWriteFlows={canWriteFlows}
        addStepToFlow={addStepToFlow}
        addStepToNew={addStepToNew}
      />
    </div>
  }


  return (
    <div>
      {canReadWrite || canReadOnly ?
      <div className={styles.content}>
        <div className={styles.LoadDataStyles}>
          <div className={styles.switchview}><SwitchView handleSelection={handleViewTypeSelection}/></div>
          {output}
        </div>
      </div> : ''
    }
    </div>
  );
}

export default LoadData;