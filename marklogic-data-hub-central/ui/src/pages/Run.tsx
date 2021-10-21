import React, {useState, useEffect, useContext} from "react";
import styles from "./Run.module.scss";
import Flows from "@components/flows/flows";
import {Accordion, Modal} from "react-bootstrap";
import axios from "axios";
import {AuthoritiesContext} from "../util/authorities";
import {UserContext} from "../util/user-context";
import {useHistory} from "react-router-dom";
import tiles from "../config/tiles.config";
import {getFromPath} from "../util/json-utils";
import {MissingPagePermission} from "../config/messages.config";
import {getMappingArtifactByStepName} from "../api/mapping";
import JobResponse from "@components/job-response/job-response";
import {HCButton} from "@components/common";
import {CheckCircleFill, ExclamationCircleFill} from "react-bootstrap-icons";
import {ErrorMessageContext} from "../util/error-message-context";

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

type commonModalType = {
  isVisible: boolean,
  stepName: string,
  stepType: string,
};

const defaultCommonModal = {
  isVisible: false,
  stepName: "",
  stepType: "",
};

type successModalType = commonModalType & {
  entityName: string,
  targetDatabase: string,
  jobId: string,
};

const defaultSuccessModal = {
  ...defaultCommonModal,
  entityName: "",
  targetDatabase: "",
  jobId: ""
};

type errorModalType = commonModalType & {
  errors: Array<any>,
  response: Object,
  entityName: string,
  targetDatabase: string,
  jobId: string,
};

const defaultErrorModal = {
  ...defaultCommonModal,
  errors: [],
  response: {},
  entityName: "",
  targetDatabase: "",
  jobId: "",
};

type failedModalType = commonModalType & {
  errors: Array<any>
};

const defaultFailedModal = {
  ...defaultCommonModal,
  errors: []
};

const Run = (props) => {
  const {handleError} = useContext(UserContext);
  const {setErrorMessageOptions} = useContext(ErrorMessageContext);

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

  const [successModal, setSuccessModal] = useState<successModalType>({...defaultSuccessModal});
  const [errorModal, setErrorModal] = useState<errorModalType>({...defaultErrorModal});
  const [failedModal, setFailedModal] = useState<failedModalType>({...defaultFailedModal});

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
        setErrorMessageOptions({
          isVisible: true,
          message: error.response.data.message
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
      message.indexOf(newFlow.name) > -1 ? setErrorMessageOptions({
        isVisible: true,
        message: <p>Unable to create a flow. Flow with the name <b>{newFlow.name}</b> already exists.</p>
      }) : setErrorMessageOptions({
        isVisible: true,
        message
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
      setErrorMessageOptions({
        isVisible: true,
        message: `Error adding step "${artifactName}" to flow "${flowName}".`
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
      setSuccessModal({
        isVisible: true,
        stepName,
        stepType,
        entityName,
        targetDatabase,
        jobId
      });
    } else if (response["jobStatus"] === Statuses.FINISHED_WITH_ERRORS) {
      let errors = getErrors(response, stepNumber);
      setErrorModal({
        isVisible: true,
        stepName,
        stepType,
        errors,
        response,
        entityName,
        targetDatabase,
        jobId
      });
    } else if (response["jobStatus"] === Statuses.FAILED) {
      let errors = getErrors(response, stepNumber);
      setFailedModal({
        isVisible: true,
        stepName,
        stepType,
        errors: errors.slice(0, 1)
      });
    }
  }

  const handleCloseJobResponse = () => {
    setOpenJobResponse(false);
  };

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
              />,
              // Success Message
              <Modal
                show={successModal.isVisible}
                size={"lg"}
                animation={false}
                dialogClassName={styles.modal650w}
              >
                <Modal.Body className={"pt-5 pb-4 ps-5 pe-4"}>
                  <div className={"d-flex align-items-center mb-4"}>
                    <CheckCircleFill className={styles.successfulRun} aria-label="icon: check-circle"/>
                    <span style={{fontWeight: 400}}>The {successModal.stepType.toLowerCase()} step <strong>{successModal.stepName}</strong> completed successfully</span>
                  </div>
                  {
                    (successModal.stepType.toLowerCase() === "mapping" || successModal.stepType.toLowerCase() === "merging") && successModal.entityName ?
                      <div className={`d-flex justify-content-center ${styles.exploreDataContainer}`}>
                        <HCButton data-testid="explorer-link"  variant="primary" onClick={() => goToExplorer(successModal.entityName, successModal.targetDatabase, successModal.jobId, successModal.stepType, successModal.stepName)} className={styles.exploreCuratedData}>
                          <span className={styles.exploreIcon}></span>
                          <span className={styles.exploreText}>Explore Curated Data</span>
                        </HCButton>
                      </div> : successModal.stepType.toLowerCase() === "ingestion" ?
                        <div className={`d-flex justify-content-center ${styles.exploreDataContainer}`}>
                          <HCButton data-testid="explorer-link" variant="primary" onClick={() => goToExplorer(successModal.entityName, successModal.targetDatabase, successModal.jobId, successModal.stepType, successModal.stepName)} className={styles.exploreLoadedData}>
                            <span className={styles.exploreIcon}></span>
                            <span className={styles.exploreText}>Explore Loaded Data</span>
                          </HCButton>
                        </div> : ""
                  }
                  <div className={"d-flex justify-content-end pt-4 pb-2"}>
                    <HCButton aria-label={"Close"} variant={(successModal.stepType.toLowerCase() === "mapping" || successModal.stepType.toLowerCase() === "merging") && successModal.entityName ? "outline-primary" : successModal.stepType.toLowerCase() === "ingestion" ? "outline-primary" : "primary"} type="submit" onClick={() => setSuccessModal({...defaultSuccessModal})}>
                      Close
                    </HCButton>
                  </div>
                </Modal.Body>
              </Modal>,
              // Error Message
              <Modal
                show={errorModal.isVisible}
                size={"lg"}
                animation={false}
              >
                <Modal.Body className={"pt-5 pb-4"}>
                  <div className={"d-flex align-items-center mb-3"}>
                    <ExclamationCircleFill aria-label="icon: exclamation-circle" className={`me-3 ${styles.unSuccessfulRun}`}/>
                    <span style={{fontWeight: 400}}>The {errorModal.stepType.toLowerCase()} step <strong>{errorModal.stepName}</strong> completed with errors</span>
                  </div>
                  <div id="error-list">
                    {((errorModal.stepType.toLowerCase() === "mapping" || errorModal.stepType.toLowerCase() === "merging") && errorModal.entityName) ?
                      <div className={`d-flex justify-content-center ${styles.exploreDataContainer}`}>
                        <HCButton variant="primary" onClick={() => goToExplorer(errorModal.entityName, errorModal.targetDatabase, errorModal.jobId, errorModal.stepType, errorModal.stepName)} className={styles.exploreCuratedData}>
                          <span className={styles.exploreIcon}></span>
                          <span className={styles.exploreText}>Explore Curated Data</span>
                        </HCButton></div> : errorModal.stepType.toLowerCase() === "ingestion" ?
                        <div className={`d-flex justify-content-center ${styles.exploreDataContainer}`}>
                          <HCButton variant="primary" onClick={() => goToExplorer(errorModal.entityName, errorModal.targetDatabase, errorModal.jobId, errorModal.stepType, errorModal.stepName)} className={styles.exploreLoadedData}>
                            <span className={styles.exploreIcon}></span>
                            <span className={styles.exploreText}>Explore Loaded Data</span>
                          </HCButton></div> : ""}
                    <p className={styles.errorSummary}>{errorModal.isVisible && getErrorsSummary(errorModal.response)}</p>
                    {errorModal.errors.map((e, i) => {
                      return <Accordion className={"w-100"} flush key={i}>
                        <Accordion.Item eventKey={`${i}`}>
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
                  <div className={"d-flex justify-content-end pt-4 pb-2"}>
                    <HCButton aria-label={"Close"} variant={(errorModal.stepType.toLowerCase() === "mapping" || errorModal.stepType.toLowerCase() === "merging") && errorModal.entityName ? "outline-primary" : errorModal.stepType.toLowerCase() === "ingestion" ? "outline-primary" : "primary"} type="submit" onClick={() => setErrorModal({...defaultErrorModal})}>
                      Close
                    </HCButton>
                  </div>
                </Modal.Body>
              </Modal>,
              // Failed Message
              <Modal
                show={failedModal.isVisible}
                size={"lg"}
                animation={false}
              >
                <Modal.Body className={"pt-5 pb-4"}>
                  <div className={"d-flex align-items-center mb-3"}>
                    <ExclamationCircleFill data-icon="exclamation-circle" aria-label="icon: exclamation-circle" className={`me-3 ${styles.unSuccessfulRun}`}/>
                    <div id="error-title"><span style={{fontWeight: 400}}>The {failedModal.stepType.toLowerCase()} step <strong>{failedModal.stepName}</strong> failed</span></div>
                  </div>
                  <div id="error-list">
                    {failedModal.errors.map((e, i) => {
                      return getErrorDetails(e);
                    })}
                  </div>
                  <div className={"d-flex justify-content-end pt-4 pb-2"}>
                    <HCButton aria-label={"Close"} variant="primary" type="submit" onClick={() => setFailedModal({...defaultFailedModal})}>
                      Close
                    </HCButton>
                  </div>
                </Modal.Body>
              </Modal>
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
