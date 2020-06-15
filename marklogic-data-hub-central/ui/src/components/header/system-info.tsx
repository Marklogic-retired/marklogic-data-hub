import React, { useContext, useEffect} from 'react';
import styles from './system-info.module.scss';
import {Button, Card, Col, Row, Modal} from 'antd';
import axios from 'axios';
import { UserContext } from '../../util/user-context';
import { AuthoritiesContext } from "../../util/authorities";

const SystemInfo = (props) => {
    const authorityService = useContext(AuthoritiesContext);
    const serviceName = props.serviceName || '';
    const dataHubVersion = props.dataHubVersion || '';
    const marklogicVersion = props.marklogicVersion || '';

    const { user, resetSessionTime } = useContext(UserContext);

    useEffect(() => {
        if (!user.authenticated && props.systemInfoVisible) {
            props.setSystemInfoVisible(false);
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
        props.setSystemInfoVisible(false);
    }


    return (
        <Modal
            visible={props.systemInfoVisible}
            onCancel={() => onCancel()}
            width={'85vw'}
            maskClosable={false}
            footer={null}
            className={styles.systemModal}
            destroyOnClose={true}
        >
        <div className={styles.systemContainer}>
            <div className={styles.serviceName}>{serviceName}</div>
            <div className={styles.version}>
                <div className={styles.label}>Data Hub version:</div>
                <div className={styles.value}>{dataHubVersion}</div>
            </div>
            <div className={styles.version}>
                <div className={styles.label}>MarkLogic version:</div>
                <div className={styles.value}>{marklogicVersion}</div>
            </div>
            <div className={styles.cardsContainer}>
                <div className={styles.cards}>
                    <Row gutter={16} type="flex" >

                        <Col>
                            <Card size="small" className={styles.download} >
                                <div className={styles.title}>Download Configuration Files</div>
                                <p>Download a zip file containing flow definitions, step definitions and other user artifacts created or modified by Hub Central.</p>
                                <div className={styles.buttonContainer}>
                                    <Button 
                                        type="primary" 
                                        disabled = {! authorityService.canDownloadProjectFiles()}
                                        onClick={download}
                                    >Download</Button>
                                </div>
                            </Card>
                        </Col>

                        <Col>
                            <Card size="small" className={styles.clearAll} >
                                <div className={styles.title}>Clear All User Data</div>
                                <p>Delete all user data in STAGING, FINAL, and JOBS databases.</p>
                                <div className={styles.buttonContainer}>
                                    <Button type="primary">Clear</Button>
                                </div>
                            </Card>
                        </Col>

                    </Row>
                </div>
            </div>      
        </div>
        </Modal>
    )
}

export default SystemInfo;
