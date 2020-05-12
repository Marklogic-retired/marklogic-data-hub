import React, { useState, useEffect, useContext } from 'react';
import {Modal} from 'antd';
import styles from './LoadData.module.scss';
import LoadDataList from '../components/load-data/load-data-list';
import SwitchView from '../components/load-data/switch-view';
import LoadDataCard from '../components/load-data/load-data-card';
import { UserContext } from '../util/user-context';
import axios from 'axios'
import { AuthoritiesContext } from "../util/authorities";

const LoadData: React.FC = () => {
  let [viewType, setViewType] = useState('table');
  const [isLoading, setIsLoading] = useState(false);
  const [loadDataArtifacts, setLoadDataArtifacts] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const { handleError, resetSessionTime } = useContext(UserContext);

  //For role based privileges
  const authorityService = useContext(AuthoritiesContext);
  const canReadOnly = authorityService.canReadLoadData();
  const canReadWrite = authorityService.canWriteLoadData();
  const canWriteFlow = authorityService.canWriteFlow();

  //Set context for switching views
  const handleViewTypeSelection = (vtype) => {
    setViewType(vtype);
  }

  useEffect(() => {
      getLoadDataArtifacts();
      getFlows();
  }, [isLoading]);

  //CREATE/POST load data Artifact
  const createLoadDataArtifact = async (ingestionStep) => {
    try {
      setIsLoading(true);

      let response = await axios.post(`/api/steps/ingestion/${ingestionStep.name}`, ingestionStep);
      if (response.status === 200) {
        setIsLoading(false);
      }
    } catch (error) {
      let message = error.response.data.message;
      console.error('Error While creating the Load Data artifact!', message)
      setIsLoading(false);
      handleError(error);
    } finally {
      resetSessionTime();
    }

  }

  //GET all the data load artifacts
  const getLoadDataArtifacts = async () => {
    try {
      let response = await axios.get('/api/steps/ingestion');

      if (response.status === 200) {
        setLoadDataArtifacts([...response.data]);
      }
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error while fetching load data artifacts', message);
        handleError(error);
    }
  }

  //DELETE Load Data Artifact
  const deleteLoadDataArtifact = async (loadDataName) => {
    try {
      setIsLoading(true);
      let response = await axios.delete(`/api/steps/ingestion/${loadDataName}`);

      if (response.status === 200) {
        setIsLoading(false);
      }
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error while deleting load data artifact.', message);
        setIsLoading(false);
        handleError(error);
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

  // POST load data step to new flow
  const addStepToNew = async () => {
    try {
      setIsLoading(true);

      //if (response.status === 200) {
        console.log('POST addStepToNew');
        setIsLoading(false);
      //}
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error while adding load data step to new flow.', message);
        setIsLoading(false);
        handleError(error);
    } finally {
      resetSessionTime();
    }
  }

  // POST load data step to existing flow
  const addStepToFlow = async (loadArtifactName, flowName) => {
    let stepToAdd = {
      "stepName": loadArtifactName,
      "stepDefinitionType": "ingestion"
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
        console.error('Error while adding load data step to flow.', message);
        setIsLoading(false);
        Modal.error({
          content: 'Error adding step "' + loadArtifactName + '" to flow "' + flowName + '."',
        });
        handleError(error);
    } finally {
      resetSessionTime();
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
        canWriteFlow={canWriteFlow}
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
