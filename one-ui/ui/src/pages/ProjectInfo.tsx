import React, {CSSProperties, useContext, useEffect, useState} from 'react';
import styles from './ProjectInfo.module.scss';
import {Alert, Button, Card, Col, Progress, Row, Upload} from 'antd';
import axios from 'axios';
import {getEnvironment, setEnvironment} from '../util/environment';
import {StompContext} from '../util/stomp';

type EnvInterface = {
    dataHubVersion: string,
    marklogicVersion: string,
    projectName: string,
    projectDir: string
}

const ProjectInfo: React.FC = () => {
    let env: EnvInterface = getEnvironment();

    const cardCss: CSSProperties = {backgroundColor: '#F6F8FF', borderColor: '#44499C'};
    const divCss: CSSProperties = {padding: '1em 6em'};

    const stompService = useContext(StompContext);
    const [isLoading, setIsLoading] = useState(false);
    const [installProgress, setInstallProgress] = useState({percentage: 0, message: ''});
    const [errorMessage, setErrorMessage] = useState({show: false, message: '', description: <div/>});
    const [successMessage, setSuccessMessage] = useState({show: false, message: '', description: <div/>});
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [file, setFile] = useState('');

    useEffect(() => {
        setFile('');
    }, []);

    const hasManagePriviledge = localStorage.getItem('dhUserHasManagePrivileges') === 'true';

    const download = () => {
        axios({
            url: '/api/environment/project-download',
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
            });
    };

    const uploadProps = {
        showUploadList: false,
        beforeUpload: (file) => {
            if (file.type !== 'application/zip') {
                console.log("A project zip file is expected.");
                setFile('');
                return false;
            }
            setFile(file.name);
            return true;
        },
        file,
    }

    let unsubscribeId: string = '';
    const customRequest = async option => {
        const {onSuccess, onError, file, action, onProgress} = option;
        const formData = new FormData();
        formData.append('zipfile', file);

        try {
            setInstallProgress({percentage: 0, message: ''});
            stompService.onConnected().then(() => {
                stompService.messages.subscribe((message) => {
                    setInstallProgress(JSON.parse(message.body));
                });
                stompService.subscribe('/topic/install-status').then((msgId: string) => {
                    unsubscribeId = msgId;
                });
            });
            setIsLoading(true);

            let response = await axios.post('/api/environment/project-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data; boundary=${fd._boundary}'
                },
            });
            if (response.status === 200) {
                localStorage.setItem('dhIsInstalled', 'true');
                setEnvironment();
                setButtonDisabled(true);
                let description = <p></p>;
                setErrorMessage({show: false, message: '', description: description});
                setSuccessMessage({show: true, message: 'Installation Success', description: description});
                setIsLoading(false);
            }
        } catch (error) {
            console.log('INSTALL ERROR', error.response);
            let message = (error.response.status === 500) ? 'Internal Server Error' : error.response.data.message;
            setIsLoading(false);
            setErrorMessage({
                show: true,
                message: 'Installation Failure',
                description: <><p>{message}</p><p>{error.response.data.suggestion}</p></>
            });
            setSuccessMessage({show: false, message: '', description: <div/>});
        }
        if (unsubscribeId) {
            stompService.unsubscribe(unsubscribeId);
            unsubscribeId = '';
        }
    }

    return (
        <div style={divCss}>
            <Row gutter={[30, 20]}>
                <Card title={<span className={styles.projTitle}>Manage Project</span>} className={styles.pageTitle}
                      headStyle={cardCss}>
                    <Col span={12}>
                        <Card className={styles.bigCard} bordered={false}>
                            <br/>
                            <Row>
                                <Col span={6}>
                                    <p className={styles.alignleft}>Data Hub Version:</p>
                                </Col>
                                <Col span={12}>
                                    <p className={styles.alignleftresults}>{env.dataHubVersion}</p>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <p className={styles.alignleft}>MarkLogic Version:</p>
                                </Col>
                                <Col span={12}>
                                    <p className={styles.alignleftresults}>{env.marklogicVersion}</p>
                                </Col>
                            </Row>
                            <br/><br/>
                            <br/><br/>
                            <Row>
                                <Col span={6}>
                                    <p className={styles.alignleft}>Project name:</p>
                                </Col>
                                <Col span={12}>
                                    <p className={styles.alignleftresults}>{env.projectName}</p>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <p className={styles.alignleft}>Project directory:</p>
                                </Col>
                                <Col span={12}>
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
                                <Button type="primary" className={styles.addNewButton}
                                        onClick={download}>Download</Button>
                            </div>
                        </Card>
                        <br/>
                        <Card size="small" className={styles.smallCard} bordered={false}>
                                <p className={styles.aligncenter}>Upload project as .zip file</p>
                                <Upload {...uploadProps} multiple={false} customRequest={customRequest}>
                                    <Button type="primary" className={styles.uploadButton} disabled={!hasManagePriviledge || isLoading || buttonDisabled}>Upload</Button>
                                </Upload>
                            <br/>
                            <Row><Col>
                                <span>
                                    {isLoading && !errorMessage.show ?
                                        <Progress percent={installProgress.percentage}
                                                  status={errorMessage.show ? 'exception' : 'active'}/>
                                        : null}
                                    {isLoading && !errorMessage.show ?
                                        <>{installProgress.message}</>
                                        : null}
                                </span>
                            </Col></Row>
                            <Row><Col>
                                <span className={styles.successMessage}
                                            style={successMessage.show ? {display: 'block'} : {display: 'none'}}>
                                    <Alert message={successMessage.message} description={successMessage.description} type='success'
                                        showIcon/>
                               </span>
                            </Col></Row>
                            <Row><Col>
                                <span className={styles.errorMessage}
                                            style={errorMessage.show ? {display: 'block'} : {display: 'none'}}>
                                    <Alert message={errorMessage.message} description={errorMessage.description} type='error'
                              showIcon/>
                                </span>
                            </Col></Row>
                        </Card>
                    </Col>
                </Card>
            </Row>
        </div>
    )
}

export default ProjectInfo;
