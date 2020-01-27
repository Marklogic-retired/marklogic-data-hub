import React from 'react';
import { Layout } from 'antd';
import { withRouter, Link } from 'react-router-dom';
import styles from './project-info-header.module.scss';

const ProjectInfoHeader: React.FC = () => {

return (
  <Layout.Header className={styles.projectInfoHeader}>
    <Link to='/project-info' className={styles.title}> {localStorage.getItem('projectName')}</Link>
  </Layout.Header>
);
}

export default withRouter(ProjectInfoHeader);
