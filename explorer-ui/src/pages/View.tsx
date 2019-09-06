import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Statistic, Spin } from 'antd';
import EntityTable from '../components/entity-table/entity-table';
import { entityFromJSON } from '../util/data-conversion';
import styles from './View.module.scss';

const { Content } = Layout;

const View: React.FC = () => {
  const [entities, setEntites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const getEntityModel = async () => {
    try {
      const response = await axios(
        `/datahub/v2/models`,
      );
      setEntites(entityFromJSON(response.data));
      setIsLoading(false);
    } catch (error) {
      // console.log('error', error.response);
    }
  }

  useEffect(() => {
    getEntityModel();
  }, []);

  return (
    <Layout className={styles.container}>
      <Content>
        {isLoading ? <Spin tip="Loading..." style={{ margin: '100px auto', width: '100%'}} /> :
          <>
            <div className={styles.statsContainer}>
              <Statistic className={styles.statistic} title="Total Entities" value={13} />
              <Statistic className={styles.statistic} title="Total Documents" value={14563} />
            </div>
            <EntityTable entities={entities}/>
          </>}
      </Content>
    </Layout>
  );
}

export default View;