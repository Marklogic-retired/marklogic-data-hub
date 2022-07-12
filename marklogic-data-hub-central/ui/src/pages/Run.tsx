import React, {useState, useEffect, useContext} from "react";
import styles from "./Run.module.scss";
import Flows from "@components/flows/flows";
import axios from "axios";
import {AuthoritiesContext} from "@util/authorities";
import {UserContext} from "@util/user-context";
import tiles from "../config/tiles.config";
//import {getFromPath} from "../util/json-utils";
import {MissingPagePermission} from "@config/messages.config";
import JobResponse from "@components/job-response/job-response";
import {ErrorMessageContext} from "@util/error-message-context";
//import Spinner from "react-bootstrap/Spinner";
import {Flow, InitialFlow, Step} from "../types/run-types";

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
  const {setErrorMessageOptions} = useContext(ErrorMessageContext);
  const [isLoading, setIsLoading] = useState(false);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [steps, setSteps] = useState<any>({});
  const [runEnded, setRunEnded] = useState<any>({});
  const [flowRunning, setFlowRunning] = useState<Flow>(InitialFlow);
  const [isStepRunning, setIsStepRunning] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [openJobResponse, setOpenJobResponse] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string>("");
  const [userCanStopFlow, setUserCanStopFlow] = useState<boolean>(false);
  // For role-based privileges
  const authorityService = useContext(AuthoritiesContext);
  const canReadFlow = authorityService.canReadFlow();
  const canWriteFlow = authorityService.canWriteFlow();
  const hasOperatorRole = authorityService.canRunStep();
  const canAccessRun = authorityService.canAccessRun();

  //For handling flows expand and collapse within Run tile
  const [newFlowName, setNewFlowName] = useState("");
  const [flowsDefaultActiveKey, setFlowsDefaultActiveKey] = useState<any[]>([]);

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
      handleError(error);
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

  const updateFlow = async (name, description, steps?) => {
    try {
      setIsLoading(true);
      let updatedFlow = {
        name: name,
        steps: steps,
        description: description
      };
      let response = await axios.put(`/api/flows/` + name, updatedFlow);
      if (response.status === 200) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error updating flow", error);
      setIsLoading(false);
      handleError(error);
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
      handleError(error);
    }
  };

  const onReorderFlow = (flowIndex: number, newSteps: Array<any>) => {
    const newFlow = {...flows[flowIndex], steps: newSteps};
    const newFlows = [...flows];
    newFlows[flowIndex] = newFlow;
    setFlows(newFlows);
  };

  function showStepRunResponse(jobId) {
    setJobId(jobId);
    setOpenJobResponse(true);
  }

  // Poll status for running flow
  function poll(fn, interval) {
    let tries = 0;
    let checkStatus = (resolve, reject) => {
      let promise = fn();
      promise.then(function (response) {

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
      }).catch(function (error) {
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

  const getFlowRunning = (flowName:string, stepNumbers: string[]) => {
    const flow = flows.find(flow => flow.name === flowName);
    const _stepsRunning = flow?.steps?.filter(step => { return stepNumbers.includes(step.stepNumber); });
    (flow && _stepsRunning) ? setFlowRunning({...flow, steps: _stepsRunning}) : setFlowRunning(InitialFlow);
  };

  const runFlowSteps = async (flowName: string, steps: Step[], formData:any) => {
    setIsStepRunning(true);
    let stepNumbers: string[]= [];
    for (let step of steps) {
      stepNumbers.push(step.stepNumber);
    }
    getFlowRunning(flowName, stepNumbers);
    let response;
    try {
      setIsLoading(true);
      if (formData) {
        response = await axios.post("/api/flows/" + flowName + `/run?stepNumbers=${stepNumbers}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data; boundary=${formData._boundary}", crossorigin: true
          }
        });
      } else {
        response = await axios.post("/api/flows/" + flowName + `/run?stepNumbers=${stepNumbers}`);
      }
      if (response.status === 200) {
        let jobId = response.data.jobId;
        showStepRunResponse(jobId);
        await setTimeout(function () {
          poll(async function () {
            const res = await axios.get("/api/jobs/" + jobId);
            return res;
          }, pollConfig.interval)
            .then(function (response: any) {
              if (steps.length === 0) {
                for (let i = 1; i <= Object.keys(response.stepResponses).length; i++) {
                  steps.push(response.stepResponses[i]);
                }
              }
              for (let i = 0; i < steps.length; i++) {
                setRunEnded({flowId: flowName, stepId: steps[i].stepNumber});

              }
            }).catch(function(error) {
              console.error("Flow timeout", error);
              for (let i = 0; i < steps.length; i++) {
                setRunEnded({flowId: flowName, stepId: steps[i]});
              }
            });
        }, pollConfig.interval);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error running step", error);
      setRunEnded({flowId: flowName, stepId: steps});
      if (error.response && error.response.data && (error.response.data.message.includes("The total size of all files in a single upload must be 100MB or less.") || error.response.data.message.includes("Uploading files to server failed"))) {
        setUploadError(error.response.data.message);
      } else {
        handleError(error);
      }
    }
  };

  // POST /flows​/{flowId}​/steps​/{stepId}
  const runStep = async (flowName, stepDetails, formData) => {
    const stepNumber = stepDetails.stepNumber;
    getFlowRunning(flowName, [stepNumber]);
    setOpenJobResponse(true);
    setIsStepRunning(true);
    let response;
    try {
      setUploadError("");
      if (formData) {
        response = await axios.post("/api/flows/" + flowName + "/steps/" + stepNumber, formData, {
          headers: {
            "Content-Type": "multipart/form-data; boundary=${formData._boundary}", crossorigin: true
          }
        });
      } else {
        response = await axios.post("/api/flows/" + flowName + "/steps/" + stepNumber);
      }
      if (response.status === 200) {
        let jobId = response.data.jobId;
        showStepRunResponse(jobId);
        await setTimeout(function () {
          poll(function () {
            const res = axios.get("/api/jobs/" + jobId);
            return res;
          }, pollConfig.interval)
            .then(function (response: any) {
              setRunEnded({flowId: flowName, stepId: stepNumber});
              showStepRunResponse(jobId);
            }).catch(function (error) {
              console.error("Flow timeout", error);
              setRunEnded({flowId: flowName, stepId: stepNumber});
            });
        }, pollConfig.interval);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error running step", error);
      setRunEnded({flowId: flowName, stepId: stepNumber});
      setIsStepRunning(false);
      if (error.response && error.response.data && (error.response.data.message.includes("The total size of all files in a single upload must be 100MB or less.") || error.response.data.message.includes("Uploading files to server failed"))) {
        setUploadError(error.response.data.message);
      } else {
        handleError(error);
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
      handleError(error);
    }
  };

  const stopRun = async () => {
    try {
      let response = await axios.post("/api/flows/stopJob/" + jobId);
      if (response.status === 200) {
        setIsStepRunning(false);
      }
    } catch (error) {
      console.error("Error stopping step", error);
      handleError(error);
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
                {/* ---------------------------------------------------------------------------------------- */}
                {/* <div className={styles.running} style={{display: isStepRunning ? "block" : "none"}}>
                  <div><Spinner data-testid="spinner" animation="border" variant="primary" /></div>
                  <div className={styles.runningLabel}>Running...</div>
                </div> */}
                {/* ---------------------------------------------------------------------------------------- */}
              </div>,
              <Flows
                key={"run-flows-list"}
                flows={flows}
                steps={steps}
                deleteFlow={deleteFlow}
                createFlow={createFlow}
                updateFlow={updateFlow}
                runStep={runStep}
                stopRun={stopRun}
                runFlowSteps={runFlowSteps}
                deleteStep={deleteStep}
                canReadFlow={canReadFlow}
                canWriteFlow={canWriteFlow}
                hasOperatorRole={hasOperatorRole}
                flowRunning={flowRunning}
                uploadError={uploadError}
                newStepToFlowOptions={props.newStepToFlowOptions}
                addStepToFlow={addStepToFlow}
                flowsDefaultActiveKey={flowsDefaultActiveKey}
                runEnded={runEnded}
                onReorderFlow={onReorderFlow}
                setJobId={setJobId}
                setOpenJobResponse={setOpenJobResponse}
                isStepRunning={isStepRunning}
                canUserStopFlow={userCanStopFlow}
              />]
            :
            <p>{MissingPagePermission}</p>
        }
      </div>
      {openJobResponse && <JobResponse setUserCanStopFlow={setUserCanStopFlow}
        setIsStepRunning={setIsStepRunning} stopRun={stopRun} jobId={jobId} setOpenJobResponse={setOpenJobResponse} flow={flowRunning}/>}
    </div>
  );
};

export default Run;
