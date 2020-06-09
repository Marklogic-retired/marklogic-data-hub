import React, {CSSProperties, useContext, useEffect} from 'react';
import styles from './project-page.module.scss';
import {Button, Card, Col, Progress, Row, Modal} from 'antd';
import axios from 'axios';
import {getEnvironment, setEnvironment} from '../../util/environment';
import { UserContext } from '../../util/user-context';
import { AuthoritiesContext } from "../../util/authorities";

type EnvInterface = {
    dataHubVersion: string,
    marklogicVersion: string,
    projectName: string
}

const ProjectPage = (props) => {
    let env: EnvInterface = getEnvironment();
    const authorityService = useContext(AuthoritiesContext);
    const cardCss: CSSProperties = {backgroundColor: '#F6F8FF', borderColor: '#44499C'};
    const divCss: CSSProperties = {
        padding: '0em 1em 1em 1em'
    };

    const {user, resetSessionTime } = useContext(UserContext);

    useEffect(() => {
        if (!user.authenticated && props.projectPageVisible) {
            props.setProjectPageVisible(false);
        }
    }, [user.authenticated]);

    const download = () => {
        axios({
            url: '/api/environment/downloadProjectFiles',
            method: 'GET',
            responseType: 'blob'
        })
            .then(response => {
                var result = String(response.headers["content-disposition"]).split(';')[1].trim().split('=')[1];
                var filename = result.replace(/"/g, '');
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
            })
            .finally(() => {
              resetSessionTime();
            });
    };

    const onCancel = () => {
        console.log('Clicked on Cancel')
        props.setProjectPageVisible(false);
    }


    return (
        <Modal
            visible={props.projectPageVisible}
            onCancel={() => onCancel()}
            width={'85vw'}
            maskClosable={false}
            footer={null}
            className={styles.projectPageContainer}
            bodyStyle={{paddingBottom:0, height: '48vw'}}
            destroyOnClose={true}
        >
        <div style={divCss}>
        <span className={styles.projTitle}>{env.projectName}</span>
        <br/><br/><br/>
        <p className={styles.alignleft}>Data Hub Version: <span className={styles.dataHubVersion}>{env.dataHubVersion}</span></p>
        <p className={styles.alignleft}>MarkLogic Version: <span className={styles.marklogicVersion}>{env.marklogicVersion}</span></p>

        <br/><br/><br/><br/>
        <div style={{marginLeft: '8vw', marginRight: '-3vw'}}>
        <Row gutter={16} type="flex" >
                      <Col >
                        <Card size="small" className={styles.downloadCard} >
                            <p className={styles.cardTitle}>Download Configuration Files</p>
                            <br/>
                            <div>
                                {<p className={styles.aligncenterDownload}>Download a zip file containing flow definitions, step definitions and other user artifacts created or modified by Hub Central.</p>}
                                <br/><br/><br/>
                                <Button type="primary" className={styles.addNewButton} disabled = {! authorityService.canDownloadProjectFiles()}
                                        onClick={download}>Download</Button>
                            </div>

                        </Card>

                        </Col >
                        <Col >
                        <Card size="small" className={styles.clearAllCard} >
                            <p className={styles.cardTitle}>Clear All User Data</p>
                            <br/>
                            <div>
                                {<p className={styles.aligncenterClearAll}>Delete all user data in STAGING,FINAL and JOBS databases.</p>}
                                <br/><br/><br/><br/>
                                <Button type="primary" className={styles.addNewButton}>Clear</Button>
                            </div>
                        </Card>
                </Col >
            </Row>
            </div>
            <br/><br/><br/><br/><br/><br/>
        </div>
        </Modal>
    )
}

export default ProjectPage;
