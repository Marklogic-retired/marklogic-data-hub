import React, { useState, useEffect, useContext } from 'react';
import styles from './Run.module.scss';
import Flows from '../components/flows/flows';
import { Modal, Collapse } from 'antd';
import axios from 'axios'
import { AuthoritiesContext } from "../util/authorities";
import { UserContext } from '../util/user-context';
import {SearchContext} from "../util/search-context";
import Browse from './Browse';

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

const Run = (props) => {
   const { handleError, resetSessionTime } = useContext(UserContext);

    const {
        setViewWithEntity,
        setNextEntity,
    } = useContext(SearchContext);

    const [isLoading, setIsLoading] = useState(false);
    const [flows, setFlows] = useState<any[]>([]);
    const [runStarted, setRunStarted] = useState<any>({});
    const [runEnded, setRunEnded] = useState<any>({});
    const [running, setRunning] = useState<any[]>([]);
    const [uploadError, setUploadError] = useState('');

    // For role-based privileges
    const authorityService = useContext(AuthoritiesContext);
    const canReadFlow = authorityService.canReadFlow();
    const canWriteFlow = authorityService.canWriteFlow();
    const hasOperatorRole = authorityService.canRunStep();

    //For handling flows expand and collapse within Run tile
    const [newFlowName, setNewFlowName] = useState('');
    const [flowsDefaultActiveKey, setFlowsDefaultActiveKey] = useState<any []>([]);

    const pollConfig: PollConfig = {
        interval: 1000, // In millseconds
        retryLimit: 10  // Timeout after retries
    }

    useEffect(() => {
        getFlows();
        return (() => {
            setFlows([]);
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
                if(newFlowName){
                    let key = [response.data.findIndex(el => el.name === newFlowName)]
                    setFlowsDefaultActiveKey(key);
                }
                setFlows(response.data);

                //console.log('GET flows successful', response);
            }
        } catch (error) {
            console.error('********* ERROR', error);
            let message = error.response.data.message;
            console.error('Error getting flows', message);
        } finally {
          resetSessionTime();
        }
    }

    const createFlow = async (payload) => {
        try {
            setIsLoading(true);
            let newFlow = {
                name: payload.name,
                description: payload.description
            }
            let response = await axios.post(`/api/flows`, newFlow);
            if (response.status === 201) {
                //console.log('POST flow success', response);
                setIsLoading(false);
                setNewFlowName(payload.name);
            }
        }
        catch (error) {
            //let message = error.response.data.message;
            console.error('Error posting flow', error)
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
                //console.log('PUT flow success', response);
                setIsLoading(false);
            }
        }
        catch (error) {
            //let message = error.response.data.message;
            console.error('Error updating flow', error)
            setIsLoading(false);
        } finally {
          resetSessionTime();
        }
    }

    // POST a step to existing flow
    const addStepToFlow = async (artifactName, flowName, stepDefinitionType) => {
        let step = {
            "stepName": artifactName,
            "stepDefinitionType": stepDefinitionType
        };
        try {
            setIsLoading(true);
            let url = '/api/flows/' + flowName + '/steps';
            let body = step;
            let response = await axios.post(url, body);
            if (response.status === 200) {
                setIsLoading(false);
                return 1;
            }
        } catch (error) {
            let message = error.response.data.message;
            console.error('Error while adding load data step to flow.', message);
            setIsLoading(false);
            Modal.error({
                content: 'Error adding step "' + artifactName + '" to flow "' + flowName + '."',
            });
            handleError(error);
        } finally {
            resetSessionTime();
        }
    }

    const deleteFlow = async (name) => {
        try {
            setIsLoading(true);
            let response = await axios.delete(`/api/flows/${name}`);
            if (response.status === 200) {
                //console.log('DELETE flow success', name);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error deleting flow', error);
            setIsLoading(false);
        }
    }

    function formatStepType(stepType){
        stepType = stepType.toLowerCase();
        return stepType[0].toUpperCase() + stepType.substr(1);
    }

    const goToExplorer = (entityName) => {
        setViewWithEntity(<Browse/>, false, entityName)
    }

    function showSuccess(stepName, stepType, entityName) {
          Modal.success({
              title:<div><p style={{fontWeight: 400}}>{formatStepType(stepType)} step <strong>{stepName}</strong> ran successfully</p></div>,
               okText: 'Close',
               mask: false,
               width:650,
               content: stepType === 'mapping' ? <div onClick={()=> goToExplorer(entityName)} className={styles.exploreCuratedData}>
                   <span className={styles.exploreIcon}></span>
                   <span className={styles.exploreText}>Explore Curated Data</span>
               </div> : ''
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

    function showErrors(stepName, stepType, errors, response, entityName) {
        Modal.error({
            title: <p style={{fontWeight: 400}}>{formatStepType(stepType)} step <strong>{stepName}</strong> completed with errors</p>,
            content: (
                <div id="error-list">
                    {stepType === 'mapping' ? <div onClick={() => goToExplorer(entityName)} className={styles.exploreCuratedData}>
                        <span className={styles.exploreIcon}></span>
                        <span className={styles.exploreText}>Explore Curated Data</span>
                    </div> : ''}
                    <p className={styles.errorSummary}>{getErrorsSummary(response)}</p>
                    <Collapse defaultActiveKey={['0']} bordered={false}>
                        {errors.map((e, i) => {
                            return <Panel header={getErrorsHeader(i)} key={i}>
                                 {getErrorDetails(e)}
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
            title: <div id="error-title"><p style={{fontWeight: 400}}>{formatStepType(stepType)} step <strong>{stepName}</strong> failed</p></div>,
            content: (
                <div id="error-list">
                    {errors.map((e, i) => {
                        return getErrorDetails(e)
                    })}
                </div>
            ),
            okText: 'Close',
            mask: false,
            width: 800
        });
    }

    function getErrorDetails(e) {

        try {
            let errorObject = JSON.parse(e);
           return <div>
               <span className={styles.errorLabel}>Message:</span> <span> {errorObject.message}</span><br/><br/>
               <span className={styles.errorLabel}>URI:</span> <span>  {errorObject.uri} </span><br/><br/>
               <span className={styles.errorLabel}>Details:</span>  <span style={{whiteSpace:'pre-line'}}> {errorObject.stack}</span>
            </div>;
        }
        catch(ex) {
            //console.log(JSON.stringify(ex))
            return  <div><span className={styles.errorLabel}>Message:</span>  <span style={{whiteSpace:'pre-line'}}> {e}</span> </div>;
        }
    }


    // Poll status for running flow
    function poll(fn, interval) {
        let tries = 0;
        let checkStatus = (resolve, reject) => {
            let promise = fn();
            promise.then(function(response){
                let status = response.data.jobStatus;
                //console.log('Flow status: ', status, response.data);
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
            });
        };
        return new Promise(checkStatus);
    }

    // POST /flows​/{flowId}​/steps​/{stepId}
    const runStep = async (flowId, stepDetails, formData) => {
        const stepNumber = stepDetails.stepNumber;
        const stepName = stepDetails.stepName;
        const stepType = stepDetails.stepDefinitionType;
        setRunStarted({flowId: flowId, stepId: stepNumber});
        let response;
        try {
            setUploadError('');
            setIsLoading(true);
            if (formData){
                response = await axios.post('/api/flows/' + flowId + '/steps/' + stepNumber, formData, {headers: {
                    'Content-Type': 'multipart/form-data; boundary=${formData._boundary}', crossorigin: true
                }} )
            }
            else {
                response = await axios.post('/api/flows/' + flowId + '/steps/' + stepNumber);
            }
            if (response.status === 200) {
                //console.log('Flow started: ' + flowId);
                let jobId = response.data.jobId;
                await setTimeout( function(){
                    poll(function() {
                        return axios.get('/api/jobs/' + jobId);
                    }, pollConfig.interval)
                    .then(function(response: any) {
                        let entityName;
                        if(response.hasOwnProperty('targetEntityType')){
                            let splitTargetEntity = response.targetEntityType.split("/");
                             entityName = splitTargetEntity[splitTargetEntity.length-1];
                        }
                        setRunEnded({flowId: flowId, stepId: stepNumber});
                        if (response['jobStatus'] === Statuses.FINISHED) {
                            //console.log('Flow complete: ' + flowId);
                            showSuccess(stepName, stepType, entityName);
                        } else if (response['jobStatus'] === Statuses.FINISHED_WITH_ERRORS) {
                            //console.log('Flow finished with errors: ' + flowId);
                            let errors = getErrors(response);
                            showErrors(stepName, stepType, errors, response, entityName);
                        } else if (response['jobStatus'] === Statuses.FAILED) {
                            //console.log('Flow failed: ' + flowId);
                            let errors = getErrors(response);
                            showFailed(stepName, stepType, errors.slice(0,1));
                        }
                        console.log(response)
                        setIsLoading(false);
                    }).catch(function(error) {
                        console.error('Flow timeout', error);
                        setRunEnded({flowId: flowId, stepId: stepNumber});
                        setIsLoading(false);
                    });
                }, pollConfig.interval);
            }
        } catch (error) {
            console.error('Error running step', error);
            setRunEnded({flowId: flowId, stepId: stepNumber});
            setIsLoading(false);
            if (error.response && error.response.data && ( error.response.data.message.includes('The total size of all files in a single upload must be 100MB or less.') ||  error.response.data.message.includes('Uploading files to server failed') )) {
                setUploadError(error.response.data.message)
                console.log(error.response.data.message);
            }
        }
    }

    // DELETE /flows​/{flowId}​/steps​/{stepId}
    const deleteStep = async (flowId, stepNumber) => {
        let url = '/api/flows/' + flowId + '/steps/' + stepNumber;
        try {
            setIsLoading(true);
            let response = await axios.delete(url);
            if (response.status === 200) {
                //console.log('DELETE step success', stepId);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error deleting step', error);
            setIsLoading(false);
        }
    }

  return (
    <div>
        <div className={styles.runContainer}>
            <Flows
                flows={flows}
                deleteFlow={deleteFlow}
                createFlow={createFlow}
                updateFlow={updateFlow}
                runStep={runStep}
                deleteStep={deleteStep}
                canReadFlow={canReadFlow}
                canWriteFlow={canWriteFlow}
                hasOperatorRole={hasOperatorRole}
                running={running}
                uploadError={uploadError}
                newStepToFlowOptions={props.newStepToFlowOptions}
                addStepToFlow={addStepToFlow}
                flowsDefaultActiveKey={flowsDefaultActiveKey}
            />
        </div>
    </div>
  );
}

export default Run;
