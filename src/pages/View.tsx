import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Layout, Statistic } from 'antd';
import { AuthContext } from '../util/auth-context';
import EntityTable from '../components/entity-table/entity-table';
import AsyncLoader from '../components/async-loader/async-loader';
import { entityFromJSON } from '../util/data-conversion';
import styles from './View.module.scss';

const { Content } = Layout;

const View: React.FC = () => {
  const { user, handleError } = useContext(AuthContext);
  const [entities, setEntites] = useState<any[]>([]);
  const [lastHarmonized, setLastHarmonized] = useState<any[]>([]);
  const [facetValues, setFacetValues] = useState<any[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const componentIsMounted = useRef(true);

  const getEntityModel = async () => {
    try {
      const response = await axios(`/datahub/v2/models`);
      // console.log('model response', response.data);
      if (componentIsMounted.current) {
        setEntites(entityFromJSON(response.data));
        let entityArray = [...entityFromJSON(response.data).map(entity => entity.info.title)];
        getSearchResults(entityArray);
        getEntityCollectionDetails();
      }
    } catch (error) {
      handleError(error);
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
      if (componentIsMounted.current) {
        setTotalDocs(response.data.total);
        setFacetValues(response.data.facets.Collection.facetValues);
        setIsLoading(false);
      }
    } catch (error) {
      handleError(error);
    }
  }


  const getEntityCollectionDetails = async () => {
    try {
      const response = await axios(`/datahub/v2/jobs/models`);
      if (componentIsMounted.current) {
        setLastHarmonized(response.data);
      }
      //console.log(response.data)
    } catch (error) {
      handleError(error);
    }
  }

  useEffect(() => {
    getEntityModel();

    return () => {
      componentIsMounted.current = false
    }
  }, []);

  return (
    <Layout className={styles.container}>
      <Content>
        {isLoading || user.error.type === 'ALERT'  ? 
          <AsyncLoader/> 
          :
          <>
            <div className={styles.statsContainer} data-cy="total-container">
              <Statistic className={styles.statistic} title="Total Entities" value={entities.length} />
              <Statistic className={styles.statistic} title="Total Documents" value={totalDocs} />
            </div>
            <EntityTable entities={entities} facetValues={facetValues} lastHarmonized={lastHarmonized} />

          </>}
      </Content>
    </Layout>
  );
}

export default View;