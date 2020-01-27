import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Form, Icon, Input, Button, Typography, Progress, Row, Col } from 'antd';
import axios from 'axios';
import { Message } from 'stompjs/lib/stomp.min';
import { StompContext } from '../../util/stomp';
import styles from './install-form.module.scss';

const InstallForm: React.FC = () => {

  const stompService = useContext(StompContext);
  const [directory, setDirectory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorResponse, setErrorResponse] = useState('');
  const [installProgress, setInstallProgress] = useState({percentage: 0, message: ''});
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [isDirectoryTouched, setDirectoryTouched] = useState(false);

  let username = localStorage.getItem('dataHubUser');
  let unsubscribeId: string = '';
  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();
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
      let response = await axios.post('/api/environment/install', {
        directory
      });
      if (response.status === 200) {
        localStorage.setItem('dhIsInstalled', 'true');
        setErrorResponse('');
        setIsLoading(false);
        setRedirectToHome(true);
      }
    } catch (error) {
      let message = 'Internal Server Error';
      console.log('INSTALL ERROR', error.response);
      setIsLoading(false);
      setErrorResponse(message);
    }
    if (unsubscribeId) {
      stompService.unsubscribe(unsubscribeId);
      unsubscribeId = '';
    }
  }

  const handleChange = (event: { target: { id: string; value: React.SetStateAction<string>; }; }) => {
    // TODO Handle directory form field validation
    if (event.target.id === 'directory') {
      if (event.target.value === ' ') {
        //setDirectoryTouched(false);
      }
      else {
        //setDirectoryTouched(true);
        setDirectory(event.target.value);
      }
    }
  }
  if (redirectToHome) {
    return <Redirect to='/home' />
  }
  return (
    <>
        <div className={styles.welcome}>
            <Icon type="check-circle" theme="filled" className={styles.welcomeIcon} />
            Welcome, { username }
        </div>
        <Form onSubmit={handleSubmit} className={styles.installForm} data-cy='login'>
            <label className={styles.formLabel}>Project Directory:</label>
            <Form.Item 
                className={styles.directory}
                hasFeedback 
                validateStatus={(directory || !isDirectoryTouched) ? '' : 'error'}
                help={(directory || !isDirectoryTouched) ? '' : 'Project directory is required'}
            >
                <Row gutter={8}>
                    <Col span={17}> 
                        <Input
                        id="directory"
                        placeholder="Enter project directory"
                        value={directory}
                        onChange={handleChange}
                        />
                    </Col>
                    <Col span={7}>
                        <Button>Browse</Button>
                    </Col>
                </Row>
                { isLoading || errorResponse ? <Row gutter={8}>
                  <Col span={24}>
                    <Progress percent={installProgress.percentage} status={errorResponse ? 'exception' : 'active'}/>
                  </Col>
                </Row>: null }
                { isLoading || errorResponse ? <Row gutter={8}>
                   <Col span={24}>{installProgress.message}</Col>
                </Row>: null }
            </Form.Item>
            <Form.Item className={styles.installButton}>
                <Button id="submit" type="primary" disabled={isLoading} htmlType="submit">
                    Install Data Hub
                </Button>
            </Form.Item>
        </Form>
    </>
  );
}

export default InstallForm;
