import React, { CSSProperties } from 'react';
import styles from './ProjectInfo.module.scss';
import {Card, Button} from 'antd';
import { Row, Col } from 'antd';
import axios from 'axios';

class ProjectInfo extends React.Component {
  state: any = {};
  cardCss:CSSProperties = {backgroundColor: '#F6F8FF', borderColor: '#44499C'};
  divCss:CSSProperties = { padding: '1em 6em'};
  componentDidMount() {
    axios.get('/api/environment/project-info')
      .then(res => {
        const resp =res.data;
        this.setState(resp);
      })
  }
  
  render(){
    return (
      <div style={this.divCss}>
        <Row gutter={[30,20]}>
          <Card title={<span className={styles.projTitle}>Manage Project</span>} className={styles.pageTitle}
          headStyle= {this.cardCss}>
            <Col span={12}>
              <Card  className={styles.bigCard} bordered={false}>
              <br/>
                <Row>
                  <Col span={6}>
                  <p className={styles.alignleft}>Data Hub Version:</p>
                  </Col>
                  <Col  span={12}>
                  <p className={styles.alignleftresults}>{this.state.dhfVersion}</p>
                  </Col>
                </Row>

                <Row>
                  <Col span={6}>
                  <p className={styles.alignleft}>MarkLogic Version:</p>
                  </Col>
                  <Col  span={12}>
                  <p className={styles.alignleftresults}>{this.state.mlVersion}</p>
                  </Col>
                </Row>
                <br/><br/>
                <br/><br/>
                <Row>
                  <Col span={6}>
                  <p className={styles.alignleft}>Project name:</p>
                  </Col>
                  <Col  span={12}>
                  <p className={styles.alignleftresults}>{this.state.projectName}</p>
                  </Col>
                </Row>
                <Row>
                  <Col  span={6}>
                  <p className={styles.alignleft}>Project directory:</p>
                  </Col>
                  <Col  span={12}>
                  <p className={styles.alignleftresults}>{this.state.projectDir}</p>
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
                  <Button type="primary" className={styles.addNewButton} >Download</Button>
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
}

export default ProjectInfo;
