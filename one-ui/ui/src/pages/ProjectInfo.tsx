import React, { CSSProperties } from 'react';
import styles from './ProjectInfo.module.scss';
import {Card, Button} from 'antd';
import { Row, Col } from 'antd';
import axios from 'axios';
import {getEnvironment} from '../util/environment';

type EnvInterface = {
  dataHubVersion: string,
  marklogicVersion: string,
  projectName: string,
  projectDir: string
}

const ProjectInfo: React.FC = () => {
  let env:EnvInterface = getEnvironment();

  const cardCss:CSSProperties = {backgroundColor: '#F6F8FF', borderColor: '#44499C'};
  const divCss:CSSProperties = { padding: '1em 6em'};

  const download = () => {
    axios({
      url: '/api/environment/project-download',
      method: 'GET',
      responseType: 'blob'
    })
      .then(response => {
        var result = String(response.headers["content-disposition"]).split(';')[1].trim().split('=')[1];
        var filename =  result.replace(/"/g, '');
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
   });
  }

  return (
    <div style={divCss}>
      <Row gutter={[30,20]}>
        <Card title={<span className={styles.projTitle}>Manage Project</span>} className={styles.pageTitle}
        headStyle= {cardCss}>
          <Col span={12}>
            <Card  className={styles.bigCard} bordered={false}>
            <br/>
              <Row>
                <Col span={6}>
                <p className={styles.alignleft}>Data Hub Version:</p>
                </Col>
                <Col  span={12}>
                <p className={styles.alignleftresults}>{env.dataHubVersion}</p>
                </Col>
              </Row>

              <Row>
                <Col span={6}>
                <p className={styles.alignleft}>MarkLogic Version:</p>
                </Col>
                <Col  span={12}>
                <p className={styles.alignleftresults}>{env.marklogicVersion}</p>
                </Col>
              </Row>
              <br/><br/>
              <br/><br/>
              <Row>
                <Col span={6}>
                <p className={styles.alignleft}>Project name:</p>
                </Col>
                <Col  span={12}>
                <p className={styles.alignleftresults}>{env.projectName}</p>
                </Col>
              </Row>
              <Row>
                <Col  span={6}>
                <p className={styles.alignleft}>Project directory:</p>
                </Col>
                <Col  span={12}>
                <p className={styles.alignleftresults}>{env.projectDir}</p>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12}>

            <Card size="small" className={styles.smallCard} bordered={false}>
              <br/><br/>
              <div>
                <p className={styles.aligncenter}>Download project as .zip file</p>
                <br/>
                <Button type="primary" className={styles.addNewButton} onClick = {download}>Download</Button>
              </div>
            </Card>
            <br/>
            <Card size="small" className={styles.smallCard} bordered={false}>
              <br/><br/>
              <div> <p className={styles.aligncenter}>Upload project as .zip file</p>
              <br/>
              <Button type="primary" className={styles.addNewButton} >Upload</Button></div>
            </Card>
          </Col>
        </Card>
      </Row>
  </div>
  )
  
}

export default ProjectInfo;
