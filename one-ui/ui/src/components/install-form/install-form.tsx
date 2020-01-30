import React, { useContext, useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Form, Icon, Input, Button, Progress, Row, Col, Alert } from 'antd';
import axios from 'axios';
import { Message } from 'stompjs/lib/stomp.min';
import { StompContext } from '../../util/stomp';
import styles from './install-form.module.scss';
import {setEnvironment} from '../../util/environment';

import { MlButton } from 'marklogic-ui-library';

const InstallForm: React.FC = () => {

  const stompService = useContext(StompContext);
  const [directory, setDirectory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [installProgress, setInstallProgress] = useState({percentage: 0, message: ''});
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [isDirectoryTouched, setDirectoryTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState({show: false, message: '', description: ''});
  const [successMessage, setSuccessMessage] = useState({show: false, message: '', description: ''});
  const [welcomeMessage, setWelcomeMessage] = useState({show: true, message: 'Welcome, '});
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const dataHubRoles = ['data-hub-admin', 'data-hub-developer', 'data-hub-operator'];

  useEffect(() => {
    axios.get('/api/environment/project')
      .then(res => {       
          setDirectory(res.data.directory);
      })
      .catch(err => {
          console.log(err);
      })
  }, []);

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
        setEnvironment();
        setButtonDisabled(true);
        let description = 'The following roles are installed in Data Hub. To continue, log in as any of these roles: ';
        description += dataHubRoles.join(', ');
        setErrorMessage({show: false, message: '', description: ''});
        setSuccessMessage({show: true, message: 'Installation Success', description: description});
        setWelcomeMessage({show: false, message: ''});
        setIsLoading(false);
        //setRedirectToHome(true); // Auto-redirect after installation
      }
    } catch (error) {
      console.log('INSTALL ERROR', error.response);
      setIsLoading(false);
      setIsLoading(false);
      setErrorMessage({show: true, message: 'Installation Failure', description: error.response.data.message});
      setSuccessMessage({show: false, message: '', description: ''});
      setWelcomeMessage({show: false, message: ''});
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
        <div className={styles.welcomeMessage} style={welcomeMessage.show ? {display: 'block'} : {display: 'none'}}>
            <Icon type="check-circle" theme="filled" className={styles.welcomeIcon} />
            {welcomeMessage.message}{ username }
        </div>
        <div className={styles.successMessage} style={successMessage.show ? {display: 'block'} : {display: 'none'}}>
          <Alert message={successMessage.message} description={successMessage.description} type='success' showIcon />
        </div>
        <div className={styles.errorMessage} style={errorMessage.show ? {display: 'block'} : {display: 'none'}}>
          <Alert message={errorMessage.message} description={errorMessage.description} type='error' showIcon />
        </div>

        <div className={styles.installForm}>
          <Form onSubmit={handleSubmit} className={styles.installForm} data-cy='login'>
              <label className={styles.formLabel}>Project Directory:</label>
              <Form.Item 
                  className={styles.directory}
                  hasFeedback 
                  validateStatus={(directory || !isDirectoryTouched) ? '' : 'error'}
                  help={(directory || !isDirectoryTouched) ? '' : 'Project directory is required'}
              >
                  <Row gutter={8}>
                      <Col span={24}> 
                          <Input
                          id="directory"
                          placeholder="Enter project directory"
                          value={directory}
                          onChange={handleChange}
                          />
                      </Col>
                  </Row>
                  { isLoading && !errorMessage.show ? <Row gutter={8}>
                    <Col span={24}>
                      <Progress percent={installProgress.percentage} status={errorMessage.show ? 'exception' : 'active'}/>
                    </Col>
                  </Row>: null }
                  { isLoading && !errorMessage.show ? <Row gutter={8}>
                    <Col span={24}>{installProgress.message}</Col>
                  </Row>: null }
              </Form.Item>
              <Form.Item className={styles.installButton}>
                  <MlButton 
                    id="submit" 
                    type="primary" 
                    size="default" 
                    disabled={isLoading || buttonDisabled} 
                    htmlType="submit"
                  >
                      Install Data Hub
                  </MlButton>
              </Form.Item>
          </Form>
        </div>
    </>
  );
}

export default InstallForm;
