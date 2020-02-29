import React, { useState, useEffect, useContext } from 'react';
import styles from './Bench.module.scss';
import Flows from '../components/flows/flows';
import { Modal } from 'antd';
import axios from 'axios'
import { RolesContext } from "../util/roles";

interface PollConfig {
    interval: number;
    retryLimit: number;
}

const Statuses = {
    'FINISHED': 'finished',
    'CANCELED': 'canceled',
    'FAILED': 'failed'
}

const Bench: React.FC = () => {
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
        }
    }

    function showSuccess(stepName, stepType) {
        Modal.success({
        title: <p>{stepType} "{stepName}" ran successfully</p>,
            okText: 'Close',
            mask: false
        });
    }

    function showErrors(stepName, stepType, errors) {
        Modal.error({
            title: <p>{stepType} "{stepName}" completed with errors</p>,
            content: (
                <div>
                    <ul>{errors.map(e => { return <li>{e}</li> })}</ul>
                </div>
            ),
            okText: 'Close',
            mask: false
        });
    }

    // Poll status for running flow
    function poll(fn, interval) {
        let tries = 0;
        let checkStatus = (resolve, reject) => { 
            let promise = fn();
            promise.then(function(response){
                let status = response.data.jobStatus;
                console.log('Flow status: ', status);
                if (status === Statuses.FINISHED || status === Statuses.CANCELED || status === Statuses.FAILED) {
                    // Non-running status, resolve promise
                    resolve(status);
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
                    .then(function(status) {
                        setRunEnded({flowId: flowId, stepId: stepId});
                        if (status === 'finished') {
                            console.log('Flow complete: ' + flowId);
                            showSuccess(stepName, stepType);
                        } else {
                            console.log('Flow ' + status + ': ' + flowId);
                            // TODO Handle errors DHFPROD-4025
                            showErrors(stepName, stepType, ['error1', 'error2', 'error3']);
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