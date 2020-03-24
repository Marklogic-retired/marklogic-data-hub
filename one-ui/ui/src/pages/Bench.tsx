import React, { useState, useEffect, useContext } from 'react';
import styles from './Bench.module.scss';
import Flows from '../components/flows/flows';
import { Modal, Collapse } from 'antd';
import axios from 'axios'
import { RolesContext } from "../util/roles";
import { UserContext } from '../util/user-context';

const { Panel } = Collapse;

interface PollConfig {
    interval: number;
    retryLimit: number;
}

const Statuses = {
    'FINISHED': 'finished',
    'CANCELED': 'canceled',
    'FAILED': 'failed',
    'FINISHED_WITH_ERRORS': 'finished_with_errors'
}

const Bench: React.FC = () => {
   const { resetSessionTime } = useContext(UserContext)

    const [isLoading, setIsLoading] = useState(false);
    const [flows, setFlows] = useState<any[]>([]);
    const [loads, setLoads] = useState<any[]>([]);
    const [runStarted, setRunStarted] = useState<any>({});
    const [runEnded, setRunEnded] = useState<any>({});
    const [running, setRunning] = useState<any[]>([]);

    // For role-based privileges
    const roleService = useContext(RolesContext);
    const canReadFlows = roleService.canReadFlows();
    const canWriteFlows = roleService.canWriteFlows();
    const hasOperatorRole = roleService.hasOperatorRole();

    const pollConfig: PollConfig = {
        interval: 1000, // In millseconds
        retryLimit: 10  // Timeout after retries
    }

    useEffect(() => {
        getFlows();
        getLoads();
        return (() => {
            setFlows([]);
            setLoads([]);
        })
    }, [isLoading]);

    useEffect(() => {
        setRunning([...running, runStarted]);
    }, [runStarted]);

    useEffect(() => {
        setRunning([...running].filter(
            r => (r.flowId !== runEnded.flowId || r.stepId !== runEnded.stepId)
        ));
    }, [runEnded]);

    const getFlows = async () => {
        try {
            let response = await axios.get('/api/flows');
            if (response.status === 200) {
                setFlows(response.data);
                console.log('GET flows successful', response);
            } 
        } catch (error) {
            console.log('********* ERROR', error);
            let message = error.response.data.message;
            console.log('Error getting flows', message);
        } finally {
          resetSessionTime();
        }
    }

    const createFlow = async (payload) => {
        try {
            setIsLoading(true);
            let newFlow = {
                name: payload.name,
                description: payload.description,
                batchSize: 100,
                threadCount: 4,
                stopOnError: false,
                options: {},
                version: 0,
                steps: {}
            }
            let response = await axios.post(`/api/flows`, newFlow);
            if (response.status === 200) {
                console.log('POST flow success', response);
                setIsLoading(false);
            }
        }
        catch (error) {
            //let message = error.response.data.message;
            console.log('Error posting flow', error)
            setIsLoading(false);
        }
    }

    const updateFlow = async (payload, flowId) => {
        try {
            setIsLoading(true);
            let updatedFlow = {
                name: payload.name,
                description: payload.description,
            }
            let response = await axios.put(`/api/flows/` + flowId, updatedFlow);
            if (response.status === 200) {
                console.log('PUT flow success', response);
                setIsLoading(false);
            }
        }
        catch (error) {
            //let message = error.response.data.message;
            console.log('Error updating flow', error)
            setIsLoading(false);
        } finally {
          resetSessionTime();
        }
    }

    const deleteFlow = async (name) => {
        try {
            setIsLoading(true);
            let response = await axios.delete(`/api/flows/${name}`);
            if (response.status === 200) {
                console.log('DELETE flow success', name);
                setIsLoading(false);
            } 
        } catch (error) {
            console.log('Error deleting flow', error);
            setIsLoading(false);
        }
    }

    const getLoads = async () => {
        try {
            let response = await axios.get('/api/artifacts/loadData');
            if (response.status === 200) {
                setLoads(response.data);
                console.log('GET loads successful', response);
            } 
        } catch (error) {
            let message = error.response.data.message;
            console.log('Error getting loads', message);
        } finally {
          resetSessionTime();
        }
    }

    function showSuccess(stepName, stepType) {
        Modal.success({
        title: <p>{stepType} "{stepName}" ran successfully</p>,
            okText: 'Close',
            mask: false
        });
    }

    function getErrors(response) {
        let errors = [];
        if (response['stepResponses']) {
            let stepProp = Object.keys(response['stepResponses'])[0];
            errors = response['stepResponses'][stepProp]['stepOutput'];
        }
        return errors;
    }

    function getErrorsSummary(response) {
        let maxErrors = 10; // Returned from backend
        let stepProp = Object.keys(response['stepResponses'])[0];
        let jobResp = response['stepResponses'][stepProp];
        return (<span>Out of {jobResp['successfulBatches']+jobResp['failedBatches']} batches, 
            <span className={styles.errorVal}> {jobResp['successfulBatches']}</span> succeeded and 
            <span className={styles.errorVal}> {jobResp['failedBatches']}</span> failed. 
            {(jobResp['failedBatches'] > maxErrors) ? 
                <span> Error messages for the first {maxErrors} failures are displayed below.</span> : 
                <span> Error messages are displayed below.</span>}
            </span>);
    }

    const getErrorsHeader = (index) => (
        <span className={styles.errorHeader}>
            Error {index+1}
        </span>
    );

    function showErrors(stepName, stepType, errors, response) {
        Modal.error({
            title: <p>{stepType} "{stepName}" completed with errors</p>,
            content: (
                <div id="error-list">
                    <p className={styles.errorSummary}>{getErrorsSummary(response)}</p>
                    <Collapse defaultActiveKey={['0']} bordered={false}>
                        {errors.map((e, i) => { 
                            return <Panel header={getErrorsHeader(i)} key={i}>
                                <span className={styles.errorLabel}>Message:</span> {e}
                            </Panel>
                        })}
                    </Collapse>
                </div>
            ),
            okText: 'Close',
            mask: false,
            width: 800
        });
    }

    function showFailed(stepName, stepType, errors) {
        Modal.error({
            title: <p>{stepType} "{stepName}" failed</p>,
            content: (
                <div id="error-list">
                    {errors.map((e, i) => { 
                        return <p><span className={styles.errorLabel}>Error message:</span> {e}</p>
                    })}
                </div>
            ),
            okText: 'Close',
            mask: false,
            width: 800
        });
    }

    // Poll status for running flow
    function poll(fn, interval) {
        let tries = 0;
        let checkStatus = (resolve, reject) => { 
            let promise = fn();
            promise.then(function(response){
                let status = response.data.jobStatus;
                console.log('Flow status: ', status, response.data);
                if (status === Statuses.FINISHED || status === Statuses.CANCELED || 
                    status === Statuses.FAILED || status === Statuses.FINISHED_WITH_ERRORS) {
                    // Non-running status, resolve promise
                    resolve(response.data);
                } else {
                    // Still running, poll again
                    setTimeout(checkStatus, interval, resolve, reject);
                }
            }).catch(function(error) {
                if (tries++ > pollConfig.retryLimit) {
                    // Retry limit reached, reject promise
                    reject(new Error('Over limit, error for ' + fn + ': ' + arguments));
                } else {
                    // Poll again
                    setTimeout(checkStatus, interval, resolve, reject);
                }
            });;
        };
        return new Promise(checkStatus);
    }

    // POST /api/flows/{flowId}/run
    const runStep = async (flowId, stepId, stepName, stepType) => {
        setRunStarted({flowId: flowId, stepId: stepId});
        try {
            setIsLoading(true);
            let response = await axios.post('/api/flows/' + flowId + '/run', [stepId]);
            if (response.status === 200) {
                console.log('Flow started: ' + flowId);
                let jobId = response.data.jobId;
                await setTimeout( function(){ 
                    poll(function() {
                        return axios.get('/api/jobs/' + jobId);
                    }, pollConfig.interval)
                    .then(function(response: any) {
                        setRunEnded({flowId: flowId, stepId: stepId});
                        if (response['jobStatus'] === Statuses.FINISHED) {
                            console.log('Flow complete: ' + flowId);
                            showSuccess(stepName, stepType);
                        } else if (response['jobStatus'] === Statuses.FINISHED_WITH_ERRORS) {
                            console.log('Flow finished with errors: ' + flowId);
                            let errors = getErrors(response);
                            showErrors(stepName, stepType, errors, response);
                        } else if (response['jobStatus'] === Statuses.FAILED) {
                            console.log('Flow failed: ' + flowId);
                            let errors = getErrors(response);
                            showFailed(stepName, stepType, errors.slice(0,1));
                        }
                        setIsLoading(false);
                    }).catch(function(error) {
                        console.log('Flow timeout', error);
                        setRunEnded({flowId: flowId, stepId: stepId});
                        setIsLoading(false);
                    });
                }, pollConfig.interval);
            } 
        } catch (error) {
            console.log('Error running step', error);
            setRunEnded({flowId: flowId, stepId: stepId});
            setIsLoading(false);
        }
    }
    
    // DELETE /flows​/{flowId}​/steps​/{stepId}
    const deleteStep = async (flowId, stepId) => {
        let url = '/api/flows/' + flowId + '/steps/' + stepId + '-' + 'INGESTION';
        try {
            setIsLoading(true);
            let response = await axios.delete(url);
            if (response.status === 200) {
                console.log('DELETE step success', stepId);
                setIsLoading(false);
            } 
        } catch (error) {
            console.log('Error deleting step', error);
            setIsLoading(false);
        }
    }

  return (
    <div>
        <div className={styles.content}>
            <Flows 
                flows={flows} 
                loads={loads}
                deleteFlow={deleteFlow} 
                createFlow={createFlow}
                updateFlow={updateFlow}
                runStep={runStep}
                deleteStep={deleteStep}
                canReadFlows={canReadFlows}
                canWriteFlows={canWriteFlows}
                hasOperatorRole={hasOperatorRole}
                running={running}
            />
        </div>
    </div>
  );
}

export default Bench;