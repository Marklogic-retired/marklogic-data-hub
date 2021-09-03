import React, {useState, useEffect, useContext} from "react";
import styles from "./Run.module.scss";
import Flows from "../components/flows/flows";
import {Modal, Icon} from "antd";
import {Accordion} from "react-bootstrap";
import axios from "axios";
import {AuthoritiesContext} from "../util/authorities";
import {UserContext} from "../util/user-context";
import {useHistory} from "react-router-dom";
import tiles from "../config/tiles.config";
import {getFromPath} from "../util/json-utils";
import {MissingPagePermission} from "../config/messages.config";
import {getMappingArtifactByStepName} from "../api/mapping";
import JobResponse from "../../src/components/job-response/job-response";
import HCButton from "../components/common/hc-button/hc-button";
import {ExclamationCircleFill} from "react-bootstrap-icons";

interface PollConfig {
    interval: number;
    retryLimit: number;
}

const Statuses = {
  "FINISHED": "finished",
  "CANCELED": "canceled",
  "FAILED": "failed",
  "FINISHED_WITH_ERRORS": "finished_with_errors"
};

const Run = (props) => {
  const {handleError} = useContext(UserContext);

  const history: any = useHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [flows, setFlows] = useState<any[]>([]);
  const [steps, setSteps] = useState<any>({});
  const [runStarted, setRunStarted] = useState<any>({});
  const [runEnded, setRunEnded] = useState<any>({});
  const [running, setRunning] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [openJobResponse, setOpenJobResponse] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string>("");

  // For role-based privileges
  const authorityService = useContext(AuthoritiesContext);
  const canReadFlow = authorityService.canReadFlow();
  const canWriteFlow = authorityService.canWriteFlow();
  const hasOperatorRole = authorityService.canRunStep();
  const canAccessRun = authorityService.canAccessRun();

  //For handling flows expand and collapse within Run tile
  const [newFlowName, setNewFlowName] = useState("");
  const [flowsDefaultActiveKey, setFlowsDefaultActiveKey] = useState<any []>([]);

  const pollConfig: PollConfig = {
    interval: 1000, // In millseconds
    retryLimit: 10  // Timeout after retries
  };

  useEffect(() => {
    return () =>  Modal.destroyAll();
  }, []);

  useEffect(() => {
    getFlows();
    getSteps();
    return (() => {
      setFlows([]);
      setSteps([]);
    });
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
      let response = await axios.get("/api/flows");
      if (response.status === 200) {
        if (newFlowName) {
          let key = [response.data.findIndex(el => el.name === newFlowName)];
          setFlowsDefaultActiveKey(key);
        }
        setFlows(response.data);
      }
    } catch (error) {
      console.error("Error getting flows", error.response);
      if (error.response && error.response.data && error.response.data.message) {
        Modal.error({
          content: error.response.data.message
        });
      }
    }
  };

  const getSteps = async () => {
    try {
      let response = await axios.get("/api/steps");
      if (response.status === 200) {
        setSteps(response.data);
      }
    } catch (error) {
      console.error("Error getting steps", error);
    }
  };

  const createFlow = async (payload) => {
    let newFlow;
    try {
      setIsLoading(true);
      newFlow = {
        name: payload.name,
        description: payload.description
      };
      let response = await axios.post(`/api/flows`, newFlow);
      if (response.status === 201) {
        setIsLoading(false);
        setNewFlowName(payload.name);
      }
    } catch (error) {
      console.error("Error posting flow", error);
      setIsLoading(false);
      let message = error.response.data.message;
      message.indexOf(newFlow.name) > -1 ? Modal.error({
        content: <p>Unable to create a flow. Flow with the name <b>{newFlow.name}</b> already exists.</p>
      }) : Modal.error({
        content: message
      });
    }
  };

  const updateFlow = async (payload, flowId) => {
    try {
      setIsLoading(true);
      let updatedFlow = {
        name: payload.name,
        steps: payload.steps,
        description: payload.description
      };
      let response = await axios.put(`/api/flows/` + flowId, updatedFlow);
      if (response.status === 200) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error updating flow", error);
      setIsLoading(false);
    }
  };

  // POST a step to existing flow
  const addStepToFlow = async (artifactName, flowName, stepDefinitionType) => {
    let step = {
      "stepName": artifactName,
      "stepDefinitionType": stepDefinitionType
    };
    try {
      setIsLoading(true);
      let url = "/api/flows/" + flowName + "/steps";
      let body = step;
      let response = await axios.post(url, body);
      if (response.status === 200) {
        setIsLoading(false);
        return 1;
      }
    } catch (error) {
      let message = error.response.data.message;
      console.error("Error while adding load data step to flow.", message);
      setIsLoading(false);
      Modal.error({
        content: "Error adding step \"" + artifactName + "\" to flow \"" + flowName + ".\"",
      });
      handleError(error);
    }
  };

  const deleteFlow = async (name) => {
    try {
      setIsLoading(true);
      let response = await axios.delete(`/api/flows/${name}`);
      if (response.status === 200) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error deleting flow", error);
      setIsLoading(false);
    }
  };

  const onReorderFlow = (flowIndex: number, newSteps: Array<any>) => {
    const newFlow = {...flows[flowIndex], steps: newSteps};
    const newFlows = [...flows];
    newFlows[flowIndex] = newFlow;
    setFlows(newFlows);
  };

  const goToExplorer = async (entityName, targetDatabase, jobId, stepType, stepName) => {
    if (stepType === "ingestion") {
      history.push({
        pathname: "/tiles/explore",
        state: {targetDatabase: targetDatabase, jobId: jobId}
      });
    } else if (stepType === "mapping") {
      let mapArtifacts = await getMappingArtifactByStepName(stepName);
      history.push(
        {pathname: "/tiles/explore",
          state: {entityName: mapArtifacts?.relatedEntityMappings?.length > 0 ? "All Entities" : entityName, targetDatabase: targetDatabase, jobId: jobId}
        });
    } else if (stepType === "merging") {
      history.push({
        pathname: "/tiles/explore",
        state: {entityName: entityName, targetDatabase: targetDatabase, jobId: jobId, Collection: "sm-"+entityName+"-merged"}
      });
    }
    Modal.destroyAll();
  };

  function showStepRunResponse(step, jobId, response) {
    const stepName = step.stepName;
    const stepType = step.stepDefinitionType;
    const stepNumber = step.stepNumber;
    const stepStatus = step.lastRunStatus;
    const targetDatabase = getFromPath(["stepResponses", stepNumber, "targetDatabase"], response);
    let entityName;

    const targetEntityType = getFromPath(["stepResponses", stepNumber, "targetEntityType"], response);
    if (targetEntityType) {
      let splitTargetEntity = targetEntityType.split("/");
      entityName = splitTargetEntity[splitTargetEntity.length - 1];
    }
    if (response["jobStatus"] === Statuses.FINISHED || (stepStatus !== undefined && stepStatus.indexOf("completed step") !== -1)) {
      showSuccess(stepName, stepType, entityName, targetDatabase, jobId, stepNumber);
    } else if (response["jobStatus"] === Statuses.FINISHED_WITH_ERRORS) {
      let errors = getErrors(response, stepNumber);
      showErrors(stepName, stepType, errors, response, entityName, targetDatabase, jobId, stepNumber);
    } else if (response["jobStatus"] === Statuses.FAILED) {
      let errors = getErrors(response, stepNumber);
      showFailed(stepName, stepType, errors.slice(0, 1));
    }
  }

  const handleCloseJobResponse = () => {
    setOpenJobResponse(false);
  };

  function showSuccess(stepName, stepType, entityName, targetDatabase, jobId, stepNumber) {
    Modal.success({
      title: <div><p style={{fontWeight: 400}}>The {stepType.toLowerCase()} step <strong>{stepName}</strong> completed successfully</p></div>,
      icon: <Icon type="check-circle" theme="filled"/>,
      okText: "Close",
      okType: (stepType.toLowerCase() === "mapping" || stepType.toLowerCase() === "merging") && entityName ? "default" : stepType.toLowerCase() === "ingestion" ? "default" : "primary",
      mask: false,
      width: 650,
      content: (stepType.toLowerCase() === "mapping" || stepType.toLowerCase() === "merging") && entityName ?
        <div className={styles.exploreDataContainer}>
          <HCButton data-testid="explorer-link"  variant="primary" onClick={() => goToExplorer(entityName, targetDatabase, jobId, stepType, stepName)} className={styles.exploreCuratedData}>
            <span className={styles.exploreIcon}></span>
            <span className={styles.exploreText}>Explore Curated Data</span>
          </HCButton>
        </div> : stepType.toLowerCase() === "ingestion" ?
          <div className={styles.exploreDataContainer}>
            <HCButton data-testid="explorer-link" variant="primary" onClick={() => goToExplorer(entityName, targetDatabase, jobId, stepType, stepName)} className={styles.exploreLoadedData}>
              <span className={styles.exploreIcon}></span>
              <span className={styles.exploreText}>Explore Loaded Data</span>
            </HCButton>
          </div> : ""
    });
  }

  function getErrors(response, stepNumber) {
    let errors = [];
    if (response["stepResponses"]) {
      errors = response["stepResponses"][stepNumber]["stepOutput"];
    }
    return errors;
  }

  function getErrorsSummary(response) {
    let maxErrors = 10; // Returned from backend
    let stepProp = Object.keys(response["stepResponses"])[0];
    let jobResp = response["stepResponses"][stepProp];
    return (<span>Out of {jobResp["successfulBatches"]+jobResp["failedBatches"]} batches,
      <span className={styles.errorVal}> {jobResp["successfulBatches"]}</span> succeeded and
      <span className={styles.errorVal}> {jobResp["failedBatches"]}</span> failed.
      {(jobResp["failedBatches"] > maxErrors) ?
        <span> The first {maxErrors} error messages are listed below.</span> :
        <span> The error messages are listed below.</span>}
    </span>);
  }

  const getErrorsHeader = (index) => (
    <span className={styles.errorHeader}>
            Error {index+1}
    </span>
  );

  function showErrors(stepName, stepType, errors, response, entityName, targetDatabase, jobId, stepNumber) {
    Modal.error({
      title: <p style={{fontWeight: 400}}>The {stepType.toLowerCase()} step <strong>{stepName}</strong> completed with errors</p>,
      icon: <ExclamationCircleFill aria-label="icon: exclamation-circle" className={styles.unSuccessfulRun}/>,
      content: (
        <div id="error-list">
          {((stepType.toLowerCase() === "mapping" || stepType.toLowerCase() === "merging") && entityName) ?
            <div className={styles.exploreDataContainer}>
              <HCButton variant="primary" onClick={() => goToExplorer(entityName, targetDatabase, jobId, stepType, stepName)} className={styles.exploreCuratedData}>
                <span className={styles.exploreIcon}></span>
                <span className={styles.exploreText}>Explore Curated Data</span>
              </HCButton></div> : stepType.toLowerCase() === "ingestion" ?
              <div className={styles.exploreDataContainer}>
                <HCButton variant="primary" onClick={() => goToExplorer(entityName, targetDatabase, jobId, stepType, stepName)} className={styles.exploreLoadedData}>
                  <span className={styles.exploreIcon}></span>
                  <span className={styles.exploreText}>Explore Loaded Data</span>
                </HCButton></div> : ""}
          <p className={styles.errorSummary}>{getErrorsSummary(response)}</p>
          {errors.map((e, i) => {
            return <Accordion className={"w-100"} flush key={i}>
              <Accordion.Item eventKey={i}>
                <div className={"p-0 d-flex"}>
                  <Accordion.Button>{getErrorsHeader(i)}</Accordion.Button>
                </div>
                <Accordion.Body>
                  {getErrorDetails(e)}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>;
          })}
        </div>
      ),
      okText: "Close",
      okType: (stepType.toLowerCase() === "mapping" || stepType.toLowerCase() === "merging") && entityName ? "default" : stepType.toLowerCase() === "ingestion" ? "default" : "primary",
      mask: false,
      width: 800
    });
  }

  function showFailed(stepName, stepType, errors) {
    Modal.error({
      title: <div id="error-title"><p style={{fontWeight: 400}}>The {stepType.toLowerCase()} step <strong>{stepName}</strong> failed</p></div>,
      icon: <ExclamationCircleFill data-icon="exclamation-circle" aria-label="icon: exclamation-circle" className={styles.unSuccessfulRun}/>,
      content: (
        <div id="error-list">
          {errors.map((e, i) => {
            return getErrorDetails(e);
          })}
        </div>
      ),
      okText: "Close",
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
        <span className={styles.errorLabel}>Details:</span>  <span style={{whiteSpace: "pre-line"}}> {errorObject.stack}</span>
      </div>;
    } catch (ex) {
      return  <div key={e}><span className={styles.errorLabel} >Message:</span>  <span style={{whiteSpace: "pre-line"}}> {e}</span> </div>;
    }
  }


  // Poll status for running flow
  function poll(fn, interval) {
    let tries = 0;
    let checkStatus = (resolve, reject) => {
      let promise = fn();
      promise.then(function(response) {
        if (!response.data) {
          throw new Error("Empty response body received");
        }
        let status = response.data.jobStatus;
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
          reject(new Error("Over limit, error for " + fn + ": " + arguments));
        } else {
          // Poll again
          setTimeout(checkStatus, interval, resolve, reject);
        }
      });
    };
    return new Promise(checkStatus);
  }
  const runFlowSteps = async (flowName, stepNumbers, formData) => {
    let stepNumber=[{}];
    for (let i=0; i<stepNumbers.length;i++) {
      stepNumber.push(stepNumbers[i].stepNumber);
    }
    stepNumber.shift();
    let response;
    try {
      setIsLoading(true);
      if (formData) {
        response = await axios.post("/api/flows/" + flowName + `/run?stepNumbers=${stepNumber}`, formData, {headers: {
          "Content-Type": "multipart/form-data; boundary=${formData._boundary}", crossorigin: true
        }});
      } else {
        response = await axios.post("/api/flows/" + flowName + `/run?stepNumbers=${stepNumber}`);
      }
      if (response.status === 200) {
        let jobId = response.data.jobId;
        await setTimeout(function() {
          poll(async    function () {
            const res = await axios.get("/api/jobs/" + jobId);
            return res;
          }, pollConfig.interval)
            .then(function(response: any) {
              if (stepNumbers.length === 0) {
                for (let i=1;i<=Object.keys(response.stepResponses).length;i++) {
                  stepNumbers.push(response.stepResponses[i]);
                }
              }
              for (let i=0; i<stepNumbers.length;i++) {
                setRunEnded({flowId: flowName, stepId: stepNumbers[i].stepNumber});
                // showStepRunResponse(stepNumbers[i], jobId, response);
              }
            }).catch(function(error) {
              console.error("Flow timeout", error);
              for (let i=0; i<stepNumbers.length;i++) {
                setRunEnded({flowId: flowName, stepId: stepNumbers[i]});
              }
            });
        }, pollConfig.interval);
        setOpenJobResponse(true);
        setIsLoading(false);
        setJobId(jobId);
      }
    } catch (error) {
      console.error("Error running step", error);
      setRunEnded({flowId: flowName, stepId: stepNumbers});
      if (error.response && error.response.data && (error.response.data.message.includes("The total size of all files in a single upload must be 100MB or less.") || error.response.data.message.includes("Uploading files to server failed"))) {
        setUploadError(error.response.data.message);
      }
    }
  };

  // POST /flows​/{flowId}​/steps​/{stepId}
  const runStep = async (flowId, stepDetails, formData) => {
    const stepNumber = stepDetails.stepNumber;
    setRunStarted({flowId: flowId, stepId: stepNumber});
    let response;
    try {
      setUploadError("");
      if (formData) {
        response = await axios.post("/api/flows/" + flowId + "/steps/" + stepNumber, formData, {headers: {
          "Content-Type": "multipart/form-data; boundary=${formData._boundary}", crossorigin: true
        }});
      } else {
        response = await axios.post("/api/flows/" + flowId + "/steps/" + stepNumber);
      }
      if (response.status === 200) {
        let jobId = response.data.jobId;
        await setTimeout(function() {
          poll(function() {
            return axios.get("/api/jobs/" + jobId);
          }, pollConfig.interval)
            .then(function(response: any) {
              setRunEnded({flowId: flowId, stepId: stepNumber});
              showStepRunResponse(stepDetails, jobId, response);
            }).catch(function(error) {
              console.error("Flow timeout", error);
              setRunEnded({flowId: flowId, stepId: stepNumber});
            });
        }, pollConfig.interval);
      }
    } catch (error) {
      console.error("Error running step", error);
      setRunEnded({flowId: flowId, stepId: stepNumber});
      if (error.response && error.response.data && (error.response.data.message.includes("The total size of all files in a single upload must be 100MB or less.") ||  error.response.data.message.includes("Uploading files to server failed"))) {
        setUploadError(error.response.data.message);
      }
    }
  };

  // DELETE /flows​/{flowId}​/steps​/{stepId}
  const deleteStep = async (flowId, stepNumber) => {
    let url = "/api/flows/" + flowId + "/steps/" + stepNumber;
    try {
      setIsLoading(true);
      let response = await axios.delete(url);
      if (response.status === 200) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error deleting step", error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.runContainer}>
        {
          canAccessRun ?
            [
              <div className={styles.intro} key={"run-intro"}>
                <p>{tiles.run.intro}</p>
              </div>,
              <Flows
                key={"run-flows-list"}
                flows={flows}
                steps={steps}
                deleteFlow={deleteFlow}
                createFlow={createFlow}
                updateFlow={updateFlow}
                runStep={runStep}
                runFlowSteps={runFlowSteps}
                deleteStep={deleteStep}
                canReadFlow={canReadFlow}
                canWriteFlow={canWriteFlow}
                hasOperatorRole={hasOperatorRole}
                running={running}
                uploadError={uploadError}
                newStepToFlowOptions={props.newStepToFlowOptions}
                addStepToFlow={addStepToFlow}
                flowsDefaultActiveKey={flowsDefaultActiveKey}
                showStepRunResponse={showStepRunResponse}
                runEnded={runEnded}
                onReorderFlow={onReorderFlow}
                setJobId={setJobId}
                setOpenJobResponse={setOpenJobResponse}
              />
            ]
            :
            <p>{MissingPagePermission}</p>
        }
      </div>
      <JobResponse jobId={jobId} openJobResponse={openJobResponse} setOpenJobResponse={handleCloseJobResponse}/>
    </div>
  );
};

export default Run;
