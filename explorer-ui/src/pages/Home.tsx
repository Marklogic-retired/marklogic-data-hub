import React from 'react';
import axios from 'axios';
import LoginForm from '../components/login-form/login-form';
import DatahubIcon from '../components/datahub-icon/datahub-icon';
import styles from './Home.module.scss';
import { Layout, Row, Col, Typography } from 'antd';

const { Title, Text } = Typography;
const { Content, Footer } = Layout;

const Home: React.FC = () => {
  
  return (
    <Layout className={styles.container}>
      <Content>
      <div className={styles.icon}>
        <DatahubIcon size={760} fill='lightgrey' view='0 0 55 55' />
      </div>
        <Row className={styles.grid}>
          <Col span={12} offset={3}>
            <Title level={2}>Sign In</Title>
            <LoginForm />
            <div className={styles.policy}>
              <Text type="secondary">
                We're committed to processing your personal data in{<br />}
                compliance with our <a href="https://www.marklogic.com/privacy/" target="_blank">Privacy Statement</a> while providing{<br />}
                you with transparent notice about our practices.</Text>
            </div>
          </Col>
        </Row>
      </Content>
      <Footer className={styles.footer}>
        <div className={styles.copyright}>
          <Text type="secondary">Copyright @ 2019 MarkLogic Corporation. All Rights Reserved | <a href="https://s3-us-west-2.amazonaws.com/marklogic-services-resources/legal/ServiceTerms.pdf" target="_blank">Terms and Conditions</a> | <a href="https://www.marklogic.com/privacy/" target="_blank">Policies</a></Text>
        </div>
      </Footer>
    </Layout>
  );
}

export default Home;