import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Layout, Statistic, Tooltip } from 'antd';
import { AuthContext } from '../util/auth-context';
import EntityTable from '../components/entity-table/entity-table';
import AsyncLoader from '../components/async-loader/async-loader';
import { entityFromJSON } from '../util/data-conversion';
import tooltipsConfig from '../config/tooltips.config';
import styles from './View.module.scss';

const { Content } = Layout;
const tooltips = tooltipsConfig.viewEntities;

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
              <Tooltip title={tooltips.entities}>
                <div className={styles.statistic}>
                  <Statistic title="Total Entities" value={entities.length} />
                </div>
              </Tooltip>
              <Tooltip title={tooltips.documents}>
                <div className={styles.statistic}>
                  <Statistic title="Total Documents" value={totalDocs} />
                </div>
              </Tooltip>
            </div>
            <EntityTable entities={entities} facetValues={facetValues} lastHarmonized={lastHarmonized} />
          </>}
      </Content>
    </Layout>
  );
}

export default View;