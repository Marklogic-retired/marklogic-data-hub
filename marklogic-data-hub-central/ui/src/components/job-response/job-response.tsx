import React, {useState, useEffect, useContext} from "react";
import {Modal, Button} from "antd";
import {Accordion} from "react-bootstrap";
import {dateConverter, renderDuration, durationFromDateTime} from "../../util/date-conversion";
import styles from "./job-response.module.scss";
import axios from "axios";
import {UserContext} from "../../util/user-context";
import {getMappingArtifactByStepName} from "../../api/mapping";
import {useHistory} from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";

/* uncomment when implementing explore data link */
// import {getMappingArtifactByStepName} from "../../api/mapping";
// import {useHistory} from "react-router-dom";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSync} from "@fortawesome/free-solid-svg-icons";
import "./job-response.scss";
import HCDivider from "../common/hc-divider/hc-divider";
import {ExclamationCircleFill} from "react-bootstrap-icons";
import {CheckCircle} from "react-bootstrap-icons";

type Props = {
  openJobResponse: boolean;
  setOpenJobResponse: (boolean) => void;
  jobId: string;
}

const JobResponse: React.FC<Props> = (props) => {
  const [durationInterval, setDurationInterval]  = useState<any>(null);
  const [jobResponse, setJobResponse]  = useState<any>({});
  const [lastSuccessfulStep, setLastSuccessfulStep]  = useState<any>(null);
  const [isLoading, setIsLoading]  = useState<boolean>(true);
  const {handleError} = useContext(UserContext);

  const history: any = useHistory();

  useEffect(() => {
    if (props.jobId) {
      retrieveJobDoc();
    }
    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
        setDurationInterval(null);
      }
    };
  }, [props.openJobResponse, props.jobId]);

  const retrieveJobDoc = async () => {
    try {
      setIsLoading(true);
      let response = await axios.get("/api/jobs/" + props.jobId);
      if (response.status === 200) {
        setJobResponse(response.data);
        const successfulSteps = response.data.stepResponses ? Object.values(response.data.stepResponses).filter((stepResponse: any) => {
          return stepResponse.success;
        }) : [];
        const successfulStep = successfulSteps[successfulSteps.length - 1];
        setLastSuccessfulStep(successfulStep);
        if (durationInterval) {
          clearInterval(durationInterval);
          setDurationInterval(null);
        }
        if (isRunning(response.data)) {
          setDurationInterval(setInterval(() => {
            const duration = durationFromDateTime(response.data.timeStarted);
            setJobResponse(Object.assign({}, response.data, {duration}));
          }, 1000));
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isRunning = (jobResponse) => {
    return !jobResponse.timeEnded || jobResponse === "N/A";
  };

  function getErrorDetails(e) {
    try {
      let errorObject = JSON.parse(e);
      return <div>
        <span className={styles.errorLabel}>Message:</span> <span> {errorObject.message}</span><br /><br />
        <span className={styles.errorLabel}>URI:</span> <span>  {errorObject.uri} </span><br /><br />
        <span className={styles.errorLabel}>Details:</span>  <span style={{whiteSpace: "pre-line"}}> {errorObject.stack}</span>
      </div>;
    } catch (ex) {
      return <div><span className={styles.errorLabel}>Message:</span>  <span style={{whiteSpace: "pre-line"}}> {e}</span> </div>;
    }
  }

  function getErrors(stepResponse) {
    let errors = [];
    if (stepResponse.stepOutput) {
      errors = stepResponse.stepOutput;
    }
    return errors;
  }

  function getErrorsSummary(jobResp) {
    let maxErrors = 10; // Returned from backend
    return (<span>Out of {jobResp["successfulBatches"] + jobResp["failedBatches"]} batches,
      <span className={styles.errorVal}> {jobResp["successfulBatches"]}</span> succeeded and
      <span className={styles.errorVal}> {jobResp["failedBatches"]}</span> failed.
      {(jobResp["failedBatches"] > maxErrors) ?
        <span> The first {maxErrors} error messages are listed below.</span> :
        <span> The error messages are listed below.</span>}
    </span>);
  }

  const getErrorsHeader = (index) => (
    <span className={styles.errorHeader}>
      Error {index + 1}
    </span>
  );
  const renderStepResponses = (jobResponse) => {
    if (jobResponse && jobResponse.stepResponses) {
      return Object.values(jobResponse.stepResponses).map((stepResponse: any, index: number) => {
        const stepIsFinished = stepResponse.stepEndTime && stepResponse.stepEndTime !== "N/A";
        if (stepIsFinished) {
          if (stepResponse.success) {
            return <div className={styles.stepResponse} key={"success-" + index}><CheckCircle className={styles.successfulRun}/><strong className={styles.stepName}>{stepResponse.stepName}</strong></div>;
          } else {
            const errors = getErrors(stepResponse);
            return <div className={styles.errorStepResponse} key={"failed-" + index}>
              <div><ExclamationCircleFill aria-label="icon: exclamation-circle" className={styles.unSuccessfulRun}/> <strong className={styles.stepName}>{stepResponse.stepName}</strong></div>
              <Accordion className={"w-100"} flush>
                <Accordion.Item eventKey={stepResponse.stepName + "-errors"}>
                  <div className={"p-0 d-flex"}>
                    <Accordion.Button>{getErrorsSummary(stepResponse)}</Accordion.Button>
                  </div>
                  <Accordion.Body>
                    {errors.map((e, i) => {
                      return <Accordion className={"w-100"} flush key={i}>
                        <Accordion.Item eventKey={stepResponse.stepName + "-error-" + i}>
                          <div className={"p-0 d-flex"}>
                            <Accordion.Button>{getErrorsHeader(i)}</Accordion.Button>
                          </div>
                          <Accordion.Body>
                            {getErrorDetails(e)}
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>;
                    })}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>;
          }
        } else {
          return <div className={styles.stepResponse} key={"running-" + index}>&nbsp;&nbsp;<strong className={styles.stepName}>{stepResponse.stepName || stepResponse.status}</strong> <span className={styles.running}>
            <Spinner animation="border" data-testid="spinner" variant="primary" /> <span className={styles.runningLabel}>Running...</span>
          </span></div>;
        }
      });
    }
  };

  const goToExplorer = async (entityName, targetDatabase, jobId, stepType, stepName) => {
    if (stepType === "mapping") {
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
    } else if (entityName) {
      history.push({
        pathname: "/tiles/explore",
        state: {targetDatabase: targetDatabase, entityName: entityName, jobId: jobId}
      });
    } else {
      history.push({
        pathname: "/tiles/explore",
        state: {targetDatabase: targetDatabase, jobId: jobId}
      });
    }
    Modal.destroyAll();
  };

  const renderExploreButton = (stepResponse) => {
    if (stepResponse) {
      const stepName = stepResponse.stepName;
      const stepType = stepResponse.stepDefinitionType;
      const targetDatabase = stepResponse.targetDatabase;
      let entityName;
      const targetEntityType = stepResponse.targetEntityType;
      if (targetEntityType) {
        let splitTargetEntity = targetEntityType.split("/");
        entityName = splitTargetEntity[splitTargetEntity.length - 1];
      }
      return ((stepType.toLowerCase() === "mapping" || stepType.toLowerCase() === "merging" || stepType.toLowerCase() === "custom") && entityName ?
        <div className={styles.exploreDataContainer}>
          <Button data-testid="explorer-link" size="large" type="primary"
            onClick={() => goToExplorer(entityName, targetDatabase, jobResponse.jobId, stepType, stepName)}
            className={styles.exploreCuratedData}>
            <span className={styles.exploreIcon}></span>
            <span className={styles.exploreText}>Explore Curated Data</span>
          </Button>
        </div> : (stepType.toLowerCase() === "ingestion" || stepType.toLowerCase() === "custom")?
          <div className={styles.exploreDataContainer}>
            <Button data-testid="explorer-link" size="large" type="primary"
              onClick={() => goToExplorer(entityName, targetDatabase, jobResponse.jobId, stepType, stepName)}
              className={styles.exploreLoadedData}>
              <span className={styles.exploreIcon}></span>
              <span className={styles.exploreText}>Explore Loaded Data</span>
            </Button>
          </div> : "");
    } else {
      return (<div className={styles.closeContainer}>
        <Button data-testid="close-link" size="large" type="primary"
          onClick={() => props.setOpenJobResponse(false)}
          className={styles.closeButton}><span>Close</span>
        </Button>
      </div>);
    }
  };

  return (<Modal
    visible={props.openJobResponse}
    title={null}
    width="700px"
    onCancel={() => props.setOpenJobResponse(false)}
    footer={null}
    maskClosable={false}
    destroyOnClose={true}
  >
    <div aria-label="jobResponse" id="jobResponse" style={ isLoading ? {display: "none"}: {}} className={styles.jobResponseContainer} >
      <header>
        { isRunning(jobResponse) ? <span className={styles.title}>The flow <strong>{jobResponse.flow}</strong> is running <a onClick={() => retrieveJobDoc()}><FontAwesomeIcon icon={faSync} data-testid={"job-response-refresh"} /></a></span> : <span className={styles.title}>The flow <strong>{jobResponse.flow}</strong> completed</span>}
      </header>
      <div>
        <div className={styles.descriptionContainer}>
          <div key={"jobId"}><span className={styles.descriptionLabel}>Job ID:</span><strong>{props.jobId}</strong></div>
          <div key={"startTime"}><span className={styles.descriptionLabel}>Start Time:</span><strong>{dateConverter(jobResponse.timeStarted)}</strong></div>
          <div key={"duration"}><span className={styles.descriptionLabel}>Duration:</span><strong>{renderDuration(jobResponse.duration)}</strong></div>
        </div>
        {jobResponse.flowOrStepsUpdatedSinceRun ? <div className={styles.flowOrStepsUpdatedSinceRun}>* The flow or steps are updated since the previous flow run.</div> : ""}
      </div>
      <HCDivider />
      <div>
        {renderStepResponses(jobResponse)}
      </div>
      {renderExploreButton(lastSuccessfulStep)}
    </div>
  </Modal>);

};

export default JobResponse;