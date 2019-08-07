import React from 'react';
import LoginForm from '../components/login-form/login-form';
import DatahubIcon from '../components/datahub-icon/datahub-icon';
import styles from './Home.module.scss';
import { Row, Col, Typography } from 'antd';

const { Title } = Typography;

const Home: React.FC = () => {
  return (
    <>
      <div className={styles.icon}>
        <DatahubIcon size={890} fill='lightgrey' view='0 0 55 55'/>
      </div>   
      <Row className={styles.grid}>
        <Col span={12} offset={3}>
          <Title level={2}>Sign In</Title>
          <LoginForm />
        </Col>
      </Row>
    </>
  );
}

export default Home;