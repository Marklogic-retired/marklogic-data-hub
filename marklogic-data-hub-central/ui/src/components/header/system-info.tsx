import React, {useContext, useEffect, useState} from 'react';
import styles from './system-info.module.scss';
import {Button, Card, Col, Row, Modal, Alert, Spin} from 'antd';
import axios from 'axios';
import { UserContext } from '../../util/user-context';
import { AuthoritiesContext } from "../../util/authorities";
import Axios from "axios";

const SystemInfo = (props) => {
    const authorityService = useContext(AuthoritiesContext);
    const serviceName = props.serviceName || '';
    const dataHubVersion = props.dataHubVersion || '';
    const marklogicVersion = props.marklogicVersion || '';

    const { user, resetSessionTime } = useContext(UserContext);

    const [message, setMessage] = useState({show: false});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user.authenticated && props.systemInfoVisible) {
            props.setSystemInfoVisible(false);
        }
    }, [user.authenticated]);

    const download = () => {
        setMessage({show: false});
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

    const clear =async () => {
        try {
            setMessage({show: false});
            setIsLoading(true);
            let response =await Axios.post('/api/environment/clearUserData');
            if (response.status === 200) {
                setIsLoading(false);
                setMessage({show: true});
            }
        }
        catch (error) {
            let message = error.response;
            setIsLoading(false);
            console.error('Error while clearing user data, message || error', message);
        }finally {
            resetSessionTime();
        }
    }
    const onCancel = () => {
        setMessage({show: false});
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
                <div data-testid="alertTrue" className={styles.alertPosition} style={message.show ? {display: 'block'} : {display: 'none'}}>
                    <Alert message={<span><b>Clear All User Data </b>completed successfully</span>} type='success' showIcon />
                </div>
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
                                <Card size="small" className={styles.clearAll}>
                                    {isLoading === true ? <div className={styles.spinRunning}>
                                         <Spin size={"large"} />
                                    </div>: ''}
                                    <div className={styles.title} data-testid="clearData">Clear All User Data</div>
                                    <p>Delete all user data in STAGING, FINAL, and JOBS databases.</p>
                                    <div className={styles.buttonContainer}>
                                        <Button
                                            type="primary"
                                            disabled = {! authorityService.canClearUserData()}
                                            onClick={clear}
                                        >Clear</Button>
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
