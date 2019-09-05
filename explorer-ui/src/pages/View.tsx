import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Statistic } from 'antd';
import EntityTable from '../components/entity-table/entity-table';
import { entityFromJSON } from '../util/data-conversion';
import styles from './View.module.scss';
import modelResponse from '../assets/mock-data/model-response';

const { Content } = Layout;

const Browse: React.FC = () => {
  // const [entities, setEntites] = useState<any[]>([]);

  useEffect(() => {
    getEntityModel();
  }, []);

  const getEntityModel = async () => {
    try {
      let response = await axios(
        `/datahub/v2/models`,
      );
      console.log('response', response);
      //setEntites(entityFromJSON(response.data));
    } catch (error) {
      console.log('error', error.response);
    }
  }

  const entities = entityFromJSON(modelResponse);
  
  return (
    <Layout className={styles.container}>
      <Content>
        <div className={styles.statsContainer}>
          <Statistic className={styles.statistic} title="Total Entities" value={13} />
          <Statistic className={styles.statistic} title="Total Documents" value={14563} />
        </div>
        <EntityTable entities={entities}/>
      </Content>
    </Layout>
  );
}

export default Browse;