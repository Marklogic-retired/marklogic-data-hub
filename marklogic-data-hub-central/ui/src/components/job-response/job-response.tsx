import React, {useState, useEffect, useContext} from "react";
import {HCButton, HCTable, HCTooltip} from "@components/common";
import {Modal, Accordion} from "react-bootstrap";
import {RunToolTips} from "@config/tooltips.config";
//import {SearchContext} from "../../util/search-context";
import {dateConverter, renderDuration, durationFromDateTime} from "@util/date-conversion";
import styles from "./job-response.module.scss";
import axios from "axios";
import {UserContext} from "@util/user-context";
//import {getMappingArtifactByStepName} from "../../api/mapping";
//import {useHistory} from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSync} from "@fortawesome/free-solid-svg-icons";
import "./job-response.scss";
import {CheckCircleFill, ExclamationCircleFill} from "react-bootstrap-icons";

type Props = {
  openJobResponse: boolean;
  setOpenJobResponse: (boolean) => void;
  jobId: string;
}

const JobResponse: React.FC<Props> = (props) => {
  const [durationInterval, setDurationInterval] = useState<any>(null);
  const [jobResponse, setJobResponse] = useState<any>({});
  //const [lastSuccessfulStep, setLastSuccessfulStep] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const {handleError} = useContext(UserContext);
  //const {setLatestDatabase, setLatestJobFacet} = useContext(SearchContext);
  //const history: any = useHistory();

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
        /*  const successfulSteps = response.data.stepResponses ? Object.values(response.data.stepResponses).filter((stepResponse: any) => {
           return stepResponse.success;
         }) : []; */
        //const successfulStep = successfulSteps[successfulSteps.length - 1];
        //setLastSuccessfulStep(successfulStep);
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
        <span className={styles.errorLabel}>Message:</span> <span data-testid="error-message"> {errorObject.message}</span><br /><br />
        <span className={styles.errorLabel}>URI:</span> <span data-testid="error-uri">  {errorObject.uri} </span><br /><br />
        <span className={styles.errorLabel}>Details:</span>  <span data-testid="error-details" style={{whiteSpace: "pre-line"}}> {errorObject.stack}</span>
      </div>;
    } catch (ex) {
      return <div><span className={styles.errorLabel}>Message:</span>  <span data-testid="error-message" style={{whiteSpace: "pre-line"}}> {e}</span> </div>;
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
    return (<span data-testid={`${jobResp.stepName}-error-list`} id={`${jobResp.stepName}-error-list`}>Out of {jobResp["successfulBatches"] + jobResp["failedBatches"]} batches,
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

  const responseColumns = [
    {
      text: "Steps",
      key: "steps",
      dataField: "stepName",
      width: "25%",
      headerFormatter: (column) => <strong>Steps</strong>,
      formatter: (stepName, response) => {
        if (response.success) {
          return <div data-testid={`${stepName}-success`} id={`${stepName}-success`} className={styles.stepResponse}>
            <CheckCircleFill type="check-circle" className={styles.successfulRun} /> <strong className={styles.stepName}>{stepName}</strong>
          </div>;
        } else {
          return <div data-testid={`${stepName}-failure`} id={`${stepName}-failure`} className={styles.stepResponse}>
            <ExclamationCircleFill aria-label="icon: exclamation-circle" className={styles.unsuccessfulRun} /><strong className={styles.stepName}>{stepName}</strong>
          </div>;
        }

      }
    },
    {
      text: "Documents Written",
      key: "succesfulEvents",
      dataField: "successfulEvents",
      width: "25%",
      headerFormatter: (column) => <strong>Documents Written</strong>,
      formatter: (stepName, response) => {
        const stepIsFinished = response.stepEndTime && response.stepEndTime !== "N/A";
        if (stepIsFinished) {
          if (response.success) {
            return (<span className={styles.documentsWritten}>
              {response.successfulEvents}
            </span>);
          }
        } else {
          return (<div className={styles.stepResponse} key={"running-" + stepName}><strong className={styles.stepName}>{stepName || response.status}</strong> <span className={styles.running}>
            <Spinner className="spinner-border-sm" animation="border" data-testid="spinner" variant="primary" /> <span className={styles.runningLabel}>Running...</span>
          </span></div>);
        }
      }
    },
    {
      text: "Action",
      key: "action",
      dataField: "successfulEvents",
      width: "25%",
      headerFormatter: (column) => <span className={styles.actionHeader}><strong>Action</strong><HCTooltip text={RunToolTips.exploreStepData} id="explore-data" placement="top"><ExclamationCircleFill data-icon="exclamation-circle" aria-label="icon: exclamation-circle" className={styles.infoIcon} /></HCTooltip></span>,
      formatter: (stepName, response) => {
        const stepIsFinished = response.stepEndTime && response.stepEndTime !== "N/A";
        if (stepIsFinished) {
          if (response.successfulEvents > 0) {
            return (
              <HCButton data-testid="explorer-link" size="sm" onClick={() => { }} className={styles.exploreCuratedData}>
                <span className={styles.exploreActionIcon}></span>
                <span className={styles.exploreActionText}>Explore Data</span>
              </HCButton>
            );
          }
        }
      }
    }
  ];

  const expandedRowRender = (response) => {
    const errors = getErrors(response);
    return errors.length > 0 ? (<div><Accordion className={"w-100"} flush>
      <Accordion.Item eventKey={response.stepName + "-errors"}>
        <div className={"p-0 d-flex"}>
          <Accordion.Button>{getErrorsSummary(response)}</Accordion.Button>
        </div>
        <Accordion.Body>
          {errors.map((e, i) => {
            return <Accordion className={"w-100"} flush key={i}>
              <Accordion.Item eventKey={response.stepName + "-error-" + i}>
                <div className={"p-0 d-flex"} data-testid={`${response.stepName}-error-${i+1}`}>
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
    </Accordion></div>) : null;
  };

  const responses = (jobResponse) => {
    if (jobResponse && jobResponse.stepResponses) {
      const responsesArray = Object.values(jobResponse.stepResponses);
      return (<HCTable
        data-testid="job-response-table"
        rowKey={"key"}
        className={styles.responseTable}
        data={responsesArray}
        columns={responseColumns}
        expandedRowRender={(response) => expandedRowRender(response)}
        pagination={false}
      />);
    }
  };
  /*
    const goToExplorer = async (entityName, targetDatabase, jobId, stepType, stepName) => {
      if (stepType === "mapping") {
        let mapArtifacts = await getMappingArtifactByStepName(stepName);
        let entityView = mapArtifacts?.relatedEntityMappings?.length > 0 ? "All Entities" : entityName;
        setLatestJobFacet(jobId, entityView, targetDatabase);
      } else if (stepType === "merging") {
        setLatestJobFacet(jobId, entityName, targetDatabase, `sm-${entityName}-merged`);
      } else if (entityName) {
        setLatestJobFacet(jobId, entityName, targetDatabase);
      } else {
        setLatestDatabase(targetDatabase, jobId);
      }
      history.push({ pathname: "/tiles/explore" });
    };
   */
  return (<Modal
    show={props.openJobResponse}
    size={"lg"}
    data-testid="job-response-modal"
    id="job-response-modal"
  >
    <Modal.Header className={"bb-none"} aria-label="job-response-modal-header">
      {isRunning(jobResponse) ? <span className={`fs-5 ${styles.title}`} aria-label={`${jobResponse.flow}-running`}>The flow <strong>{jobResponse.flow}</strong> is running <a onClick={() => retrieveJobDoc()}><FontAwesomeIcon icon={faSync} data-testid={"job-response-refresh"} /></a></span> : <span className={`fs-5 ${styles.title}`} aria-label={`${jobResponse.flow}-completed`}>The flow <strong>{jobResponse.flow}</strong> completed</span>}
      <button type="button" className="btn-close" aria-label={`${jobResponse.flow}-close`} data-testid={`${jobResponse.flow}-close`} onClick={() => props.setOpenJobResponse(false)}></button>
    </Modal.Header>
    <Modal.Body>
      <div aria-label="jobResponse" id="jobResponse" style={isLoading ? {display: "none"} : {}} className={styles.jobResponseContainer} >
        <div>
          <div className={styles.descriptionContainer}>
            <div key={"jobId"}><span className={styles.descriptionLabel}>Job ID:</span><strong>{props.jobId}</strong></div>
            <div key={"startTime"}><span className={styles.descriptionLabel}>Start Time:</span><strong>{dateConverter(jobResponse.timeStarted)}</strong></div>
            <div key={"duration"}><span className={styles.descriptionLabel}>Duration:</span><strong>{renderDuration(jobResponse.duration)}</strong></div>
          </div>
          {jobResponse.flowOrStepsUpdatedSinceRun ? <div className={styles.flowOrStepsUpdatedSinceRun}>* The flow or steps are updated since the previous flow run.</div> : ""}
        </div>
        <div>
          {responses(jobResponse)}
        </div>

      </div>
    </Modal.Body>
  </Modal>);

};

export default JobResponse;