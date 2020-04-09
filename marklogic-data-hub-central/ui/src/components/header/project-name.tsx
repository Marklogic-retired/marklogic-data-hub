import React from 'react';
import { Layout } from 'antd';
import { withRouter, Link } from 'react-router-dom';
import styles from './project-name.module.scss';

interface Props {
  name: string | null;
}

const ProjectName: React.FC<Props> = (props) => {
  return (
    <Layout.Header className={styles.projectName}>
      <Link id="project-name" to='/project-info' className={styles.title}> {props.name}</Link>
    </Layout.Header>
  );
}

export default ProjectName;
