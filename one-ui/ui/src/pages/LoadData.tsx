import React, { useState, useEffect, useContext } from 'react';
import styles from './LoadData.module.scss';
import LoadDataList from '../components/load-data/load-data-list';
import SwitchView from '../components/load-data/switch-view';
import LoadDataCard from '../components/load-data/load-data-card';
import axios from 'axios'
import { RolesContext } from "../util/roles";

const LoadData: React.FC = () => {
  let [viewType, setViewType] = useState('table');
  const [isLoading, setIsLoading] = useState(false);
  const [loadDataArtifacts, setLoadDataArtifacts] = useState<any[]>([]);

  //For role based privileges
  const roleService = useContext(RolesContext);
  const canReadOnly = roleService.canReadLoadData();
  const canReadWrite = roleService.canWriteLoadData();

  //Set context for switching views
  const handleViewTypeSelection = (vtype) => {
    setViewType(vtype);
  }

  useEffect(() => {
      getLoadDataArtifacts();
      
  }, [isLoading]);

  //CREATE/POST load data Artifact
  const createLoadDataArtifact = async (loadDataObj) => {

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
      <LoadDataCard data={loadDataArtifacts} 
      deleteLoadDataArtifact={deleteLoadDataArtifact} 
      createLoadDataArtifact={createLoadDataArtifact} 
      canReadWrite={canReadWrite}
      canReadOnly={canReadOnly}/>
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