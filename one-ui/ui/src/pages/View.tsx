import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Layout, Statistic, Tooltip } from 'antd';
import { UserContext } from '../util/user-context';
import EntityTable from '../components/entity-table/entity-table';
import AsyncLoader from '../components/async-loader/async-loader';
import { entityFromJSON } from '../util/data-conversion';
import tooltipsConfig from '../config/explorer-tooltips.config';
import styles from './View.module.scss';
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useInterval } from '../hooks/use-interval';

const { Content } = Layout;
const tooltips = tooltipsConfig.viewEntities;

const View: React.FC = () => {
  const { user, handleError, userNotAuthenticated } = useContext(UserContext);
  const [entities, setEntities] = useState<any[]>([]);
  const [lastHarmonized, setLastHarmonized] = useState<any[]>([]);
  const [facetValues, setFacetValues] = useState<any[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  let sessionCount = 0;

  const componentIsMounted = useRef(true);

  const getEntityModel = async () => {
    try {
      const response = await axios(`/api/models`);
      if (componentIsMounted.current) {
        setEntities(entityFromJSON(response.data));
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
        url: `/api/search`,
        data: {
          query: {
            searchStr: '',
            entityNames: allEntities,
            facets: {}
          },
          start: 1,
          pageLength: 1,
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
      const response = await axios(`/api/models/job-info`);
      if (componentIsMounted.current) {
        setLastHarmonized(response.data);
        sessionCount = 0;
      }
    } catch (error) {
      handleError(error);
    }
  }

  useEffect(() => {
    if (!user.error.type) {
      getEntityModel();
    }

    return () => {
      componentIsMounted.current = false
    }
  }, []);

  useInterval(() => {
    if (sessionCount === user.maxSessionTime) {
      userNotAuthenticated();
    } else {
      sessionCount += 1;
    }
  }, 1000);

  return (
    <Layout className={styles.container}>
      <Content>
        {isLoading || user.error.type === 'ALERT' ?
          <div style={{ marginTop: '40px' }}>
            <AsyncLoader />
          </div>
          :
          <>
            <div className={styles.statsContainer} data-cy="total-container">
              <div className={styles.statistic}>
                <Statistic title="Total Entities" value={entities.length} />
              </div>
              <div style={{ marginLeft: '-50px' }}>
                <Tooltip title={tooltips.entities}>
                  <FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" /></Tooltip>
              </div>
              <div className={styles.statistic} data-cy="total-documents">
                <Statistic title="Total Documents" value={totalDocs} style={{ marginLeft: '56px' }} />
              </div>
              <div style={{ marginLeft: '-50px' }}>
                <Tooltip title={tooltips.documents}>
                  <FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" /></Tooltip>
              </div>
            </div>
            <EntityTable entities={entities} facetValues={facetValues} lastHarmonized={lastHarmonized} />
          </>}
      </Content>
    </Layout>
  );
}

export default View;