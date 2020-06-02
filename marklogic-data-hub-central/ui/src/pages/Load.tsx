import React, { useState, useEffect, useContext } from 'react';
import {Modal} from 'antd';
import styles from './Load.module.scss';
import SwitchView from '../components/load/switch-view';
import LoadList from '../components/load/load-list';
import LoadCard from '../components/load/load-card';
import { UserContext } from '../util/user-context';
import axios from 'axios'
import { AuthoritiesContext } from "../util/authorities";

export type ViewType =  'card' | 'list';

const INITIAL_VIEW: ViewType = 'list';

const Load: React.FC = () => {
  let [view, setView] = useState(INITIAL_VIEW);
  const [isLoading, setIsLoading] = useState(false);
  const [loadArtifacts, setLoadArtifacts] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const { handleError, resetSessionTime } = useContext(UserContext);

  //For role based privileges
  const authorityService = useContext(AuthoritiesContext);
  const canReadOnly = authorityService.canReadLoad();
  const canReadWrite = authorityService.canWriteLoad();
  const canWriteFlow = authorityService.canWriteStep();

  //Set context for switching views
  const handleViewSelection = (view) => {
    setView(view);
  }

  useEffect(() => {
      getLoadArtifacts();
      getFlows();
      return (() => {
        setLoadArtifacts([]);
        setFlows([]);
      })
  }, [isLoading]);

  //CREATE/POST load data Artifact
  const createLoadArtifact = async (ingestionStep) => {
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
  const getLoadArtifacts = async () => {
    try {
      let response = await axios.get('/api/steps/ingestion');

      if (response.status === 200) {
        setLoadArtifacts([...response.data]);
      }
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error while fetching load data artifacts', message);
        handleError(error);
    }
  }

  //DELETE Load Data Artifact
  const deleteLoadArtifact = async (loadName) => {
    try {
      setIsLoading(true);
      let response = await axios.delete(`/api/steps/ingestion/${loadName}`);

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

  if (view === 'list') {
    output = <LoadList
      data={loadArtifacts}
      deleteLoadArtifact={deleteLoadArtifact}
      createLoadArtifact={createLoadArtifact}
      canReadWrite={canReadWrite}
      canReadOnly={canReadOnly}
    />
  }
  else {
    output = <div className={styles.cardView}>
      <LoadCard
        data={loadArtifacts}
        flows={flows}
        deleteLoadArtifact={deleteLoadArtifact}
        createLoadArtifact={createLoadArtifact}
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
      <div className={styles.loadContainer}>
        <div className={styles.switchViewContainer}>
          <SwitchView handleSelection={handleViewSelection} defaultView={view}/>
        </div>
        {output}
      </div> : ''
    }
    </div>
  );
}

export default Load;
