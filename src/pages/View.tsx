import React, { useState, useEffect,useContext } from 'react';
import axios from 'axios';
import {Layout, Statistic, Spin, Alert} from 'antd';
import { AuthContext } from '../util/auth-context';
import EntityTable from '../components/entity-table/entity-table';
import { entityFromJSON } from '../util/data-conversion';
import styles from './View.module.scss';

const { Content } = Layout;

const View: React.FC = () => {
  const { userNotAuthenticated,setErrorMessage } = useContext(AuthContext);
  const [entities, setEntites] = useState<any[]>([]);
  const [lastHarmonized, setLastHarmonized] = useState<any[]>([]);
  const [facetValues, setFacetValues] = useState<any[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showBanner, toggleBanner]= useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorDescription, setErrorDescription]=useState('');

  const getEntityModel = async () => {
    try {
      const response = await axios(`/datahub/v2/models`);
      // console.log('model response', response.data);
      setEntites(entityFromJSON(response.data));
      let entityArray = [ ...entityFromJSON(response.data).map(entity => entity.info.title)];
      getSearchResults(entityArray);
    } catch (error) {
      switch (error.response.status) {
        case 401:
          userNotAuthenticated();
          break;
        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
        case 505:
        case 511:
          if(error.response.data.message){
            setErrorMessage({title: error.response.data.error, message: error.response.data.message});
          }
          else{
            setErrorMessage({title: '', message: 'Internal server error'});
          }
          break;
        case 400:
        case 403:
        case 405:
        case 408:
        case 414:
          toggleBanner(true);
          setErrorTitle(error.response.data.error);
          if(error.response.data.message){
            setErrorDescription(error.response.data.message);
          }
          else{
            setErrorDescription('Bad request');
          }
          break;
      }
    }
  }
  const getSearchResults = async (allEntities: string[]) => {
    try {
      const response = await axios({
        method: 'POST',
        url: `/datahub/v2/search`,
        data: {
          query: '',
          entityNames: allEntities,
          start: 1,
          pageLength: 10,
          facets: {}
        }
      });
      // console.log('search results', response.data);
      setTotalDocs(response.data.total);
      setFacetValues(response.data.facets.Collection.facetValues);
      setIsLoading(false);
    } catch (error) {
      switch (error.response.status) {
        case 401:
          userNotAuthenticated();
          break;
        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
        case 505:
        case 511:
          if(error.response.data.message){
            setErrorMessage({title: error.response.data.error, message: error.response.data.message});
          }
          else{
            setErrorMessage({title: '', message: 'Internal server error'});
          }
          break;
        case 400:
        case 403:
        case 405:
        case 408:
        case 414:
          toggleBanner(true);
          setErrorTitle(error.response.data.error);
          if(error.response.data.message){
            setErrorDescription(error.response.data.message);
          }
          else{
            setErrorDescription('Bad request');
          }
          break;
      }
    }
  }


  const getEntityCollectionDetails = async () => {
    try {
      const response = await axios(`/datahub/v2/jobs/models`);
      setLastHarmonized(response.data);
      //console.log(response.data)
    } catch (error) {
      switch (error.response.status) {
        case 401:
          userNotAuthenticated();
          break;
        case 500:
          setErrorMessage({title: error.response.data.error, message: error.response.data.message});
          break;
        case 400:
          toggleBanner(true);
          setErrorTitle(error.response.data.error);
          setErrorDescription(error.response.data.message);
          break;
      }
    }
  }

  const onClose = e => {
    console.log(e, 'I was closed.');
  };

  useEffect(() => {
    getEntityModel();
    getEntityCollectionDetails();
  }, []);

  return (
    <Layout className={styles.container}>
      <Content>
        {showBanner ? <Alert style={{textAlign:"center"}} message={setErrorTitle}  description={setErrorMessage} type="error" closable onClose={onClose}/> : null}
        {isLoading ? <Spin tip="Loading..." style={{ margin: '100px auto', width: '100%'}} /> :
          <>
            <div className={styles.statsContainer} data-cy="total-container">
              <Statistic className={styles.statistic} title="Total Entities" value={entities.length} />
              <Statistic className={styles.statistic} title="Total Documents" value={totalDocs} />
            </div>
            <EntityTable entities={entities} facetValues={facetValues} lastHarmonized={lastHarmonized}/>

          </>}
      </Content>
    </Layout>
  );
}

export default View;