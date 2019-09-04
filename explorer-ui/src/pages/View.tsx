import React from 'react';
import { Layout, Statistic } from 'antd';
import EntityTable from '../components/entity-table/entity-table';
import { entityFromJSON } from '../util/data-conversion';
import styles from './View.module.scss';
import modelResponse from '../assets/mock-data/model-response';

const { Content } = Layout;

const Browse: React.FC = () => {
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