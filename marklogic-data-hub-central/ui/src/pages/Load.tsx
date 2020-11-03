import React, { useState, useEffect, useContext } from 'react';
import {Modal} from 'antd';
import styles from './Load.module.scss';
import { useLocation } from "react-router-dom";
import SwitchView from '../components/load/switch-view';
import LoadList from '../components/load/load-list';
import LoadCard from '../components/load/load-card';
import { UserContext } from '../util/user-context';
import axios from 'axios';
import { createStep, getSteps, deleteStep } from '../api/steps';
import { AuthoritiesContext } from "../util/authorities";
import tiles from '../config/tiles.config';

export type ViewType =  'card' | 'list';

const INITIAL_VIEW: ViewType = 'card';

const Load: React.FC = () => {
  const location = useLocation<any>();
  let [view, setView] = useState(location.state?.viewMode ? location.state.viewMode : INITIAL_VIEW);
  const [loading, setLoading] = useState(false);
  const [loadArtifacts, setLoadArtifacts] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortedInfo, setSortedInfo] = useState({columnKey: '', order: ''});
  const { handleError } = useContext(UserContext);

  //For role based privileges
  const authorityService = useContext(AuthoritiesContext);
  const canReadOnly = authorityService.canReadLoad();
  const canReadWrite = authorityService.canWriteLoad();
  const canWriteFlow = authorityService.canWriteFlow();

  // Set context for switching views
  const handleViewSelection = (view) => {
    setView(view);
  };

  useEffect(() => {
    setPage(location.state?.page);
    setPageSize(location.state?.pageSize);
    setView(location.state?.viewMode ? location.state?.viewMode : view);
    setSortedInfo(location.state?.sortOrderInfo);
  }, [location]);

  useEffect(() => {
      getLoadArtifacts();
      getFlows();
      return (() => {
        setLoadArtifacts([]);
        setFlows([]);
      })
  }, [loading]);

  // CREATE/POST load step
  const createLoadArtifact = async (ingestionStep) => {
    try {
      setLoading(true);
      let response = await createStep(ingestionStep.name, 'ingestion', ingestionStep);
      if (response.status === 200) {
        setLoading(false);
      }
    } catch (error) {
      let message = error.response.data.message;
      console.error('Error creating load step', message)
      setLoading(false);
      handleError(error);
    }

  };

  // GET all load steps
  const getLoadArtifacts = async () => {
    try {
      let response = await getSteps('ingestion');
      if (response.status === 200) {
        setLoadArtifacts([...response.data]);
      }
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error getting load steps', message);
        handleError(error);
    }
  };

  // DELETE load step
  const deleteLoadArtifact = async (loadName) => {
    try {
      setLoading(true);
      let response = await deleteStep(loadName, 'ingestion');
      if (response.status === 200) {
        setLoading(false);
      }
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error deleting load step', message);
        setLoading(false);
        handleError(error);
    }
  };

  // GET all the flow artifacts
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

  // POST load data step to new flow
  const addStepToNew = async () => {
    try {
      setLoading(true);

      //if (response.status === 200) {
        console.log('POST addStepToNew');
        setLoading(false);
      //}
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error while adding load data step to new flow.', message);
        setLoading(false);
        handleError(error);
    }
  };

  // POST load data step to existing flow
  const addStepToFlow = async (loadArtifactName, flowName) => {
    let stepToAdd = {
      "stepName": loadArtifactName,
      "stepDefinitionType": "ingestion"
    };
    try {
      setLoading(true);
      let url = '/api/flows/' + flowName + '/steps';
      let body = stepToAdd;
      let response = await axios.post(url, body);
      if (response.status === 200) {
        setLoading(false);
      }
    } catch (error) {
        let message = error.response.data.message;
        console.error('Error while adding load data step to flow.', message);
        setLoading(false);
        Modal.error({
          content: 'Error adding step "' + loadArtifactName + '" to flow "' + flowName + '."',
        });
        handleError(error);
    }
  };

  //Setting the value of switch view output
  let output;

  if (view === 'card') {
    output = <LoadCard
      data={loadArtifacts}
      flows={flows}
      deleteLoadArtifact={deleteLoadArtifact}
      createLoadArtifact={createLoadArtifact}
      canReadWrite={canReadWrite}
      canReadOnly={canReadOnly}
      canWriteFlow={canWriteFlow}
      addStepToFlow={addStepToFlow}
      addStepToNew={addStepToNew}
    />;
  }
  else {
    output = <div className={styles.cardView}>
      <LoadList
        data={loadArtifacts}
        flows={flows}
        deleteLoadArtifact={deleteLoadArtifact}
        createLoadArtifact={createLoadArtifact}
        canReadWrite={canReadWrite}
        canReadOnly={canReadOnly}
        canWriteFlow={canWriteFlow}
        addStepToFlow={addStepToFlow}
        addStepToNew={addStepToNew}
        page={page}
        pageSize={pageSize}
        sortOrderInfo={sortedInfo}
      />
    </div>;
  }


  return (
    <div>
      {canReadWrite || canReadOnly ?
      <div className={styles.loadContainer}>
        <div className={styles.intro}>
          <p>{tiles.load.intro}</p>
          <div className={styles.switchViewContainer}>
            <SwitchView handleSelection={handleViewSelection} defaultView={view}/>
          </div>
        </div>
        {output}
      </div> : ''
    }
    </div>
  );
};

export default Load;
