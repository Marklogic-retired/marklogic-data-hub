import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Statistic, Spin } from 'antd';
import EntityTable from '../components/entity-table/entity-table';
import { entityFromJSON } from '../util/data-conversion';
import styles from './View.module.scss';

const { Content } = Layout;

const View: React.FC = () => {
  const [entities, setEntites] = useState<any[]>([]);
  const [facetValues, setFacetValues] = useState<any[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const getEntityModel = async () => {
    try {
      const response = await axios(`/datahub/v2/models`);
      // console.log('model response', response.data);
      setEntites(entityFromJSON(response.data));
      setIsLoading(false);
    } catch (error) {
      // console.log('error', error.response);
    }
  }
  const getSearchResults = async () => {
    try {
      setIsLoading(true);
      const response = await axios({
        method: 'POST',
        url: `/datahub/v2/search?format=json&database=data-hub-FINAL`,
        data: {
          query: '',
          entityNames: [],
          start: 1,
          pageLength: 10,
          facets: {}
        }
      });
      // console.log('search results', response.data);
      setTotalDocs(response.data.total);
      setFacetValues(response.data.facets.Collection.facetValues);
    } catch (error) {
      // console.log('error', error.response);
    }
  }

  useEffect(() => {
    getEntityModel();
    getSearchResults();
  }, []);

  return (
    <Layout className={styles.container}>
      <Content>
        {isLoading ? <Spin tip="Loading..." style={{ margin: '100px auto', width: '100%'}} /> :
          <>
            <div className={styles.statsContainer}>
              <Statistic className={styles.statistic} title="Total Entities" value={entities.length} />
              <Statistic className={styles.statistic} title="Total Documents" value={totalDocs} />
            </div>
            <EntityTable entities={entities} facetValues={facetValues}/>
          </>}
      </Content>
    </Layout>
  );
}

export default View;