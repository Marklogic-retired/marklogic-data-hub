import React, {useState, useEffect, useContext} from "react";
import {HCButton, HCTable, HCTooltip} from "@components/common";
import {Modal, Accordion} from "react-bootstrap";
import {RunToolTips} from "@config/tooltips.config";
import {SearchContext} from "../../util/search-context";
import {dateConverter, renderDuration, durationFromDateTime} from "@util/date-conversion";
import styles from "./job-response.module.scss";
import axios from "axios";
import {UserContext} from "@util/user-context";
import {getMappingArtifactByStepName} from "../../api/mapping";
import {useHistory} from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock, faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import "./job-response.scss";
import {CheckCircleFill, ExclamationCircleFill} from "react-bootstrap-icons";
import {Flow} from "../../types/run-types";

type Props = {
  openJobResponse: boolean;
  setOpenJobResponse: (boolean) => void;
  jobId: string;
  flow?: Flow;
}

const JobResponse: React.FC<Props> = ({jobId, setOpenJobResponse, openJobResponse, flow}) => {
  const [jobResponse, setJobResponse] = useState<any>({});
  //const [lastSuccessfulStep, setLastSuccessfulStep] = useState<any>(null);
  const [timeoutId, setTimeoutId] = useState<any>();
  const {handleError} = useContext(UserContext);
  const {setLatestDatabase, setLatestJobFacet} = useContext(SearchContext);
  const history: any = useHistory();

  useEffect(() => {
    if (jobId) {
      retrieveJobDoc();
    }
  }, [openJobResponse, jobId]);

  const retrieveJobDoc = async () => {
    try {
      clearTimeout(timeoutId);
      let response = await axios.get("/api/jobs/" + jobId);
      if (response.status === 200) {
        setJobResponse(response.data);
        /*  const successfulSteps = response.data.stepResponses ? Object.values(response.data.stepResponses).filter((stepResponse: any) => {
          return stepResponse.success;
         }) : []; */
        //const successfulStep = successfulSteps[successfulSteps.length - 1];
        //setLastSuccessfulStep(successfulStep);
        if (isRunning(response.data)) {
          const duration = durationFromDateTime(response.data.timeStarted);
          setJobResponse(Object.assign({}, response.data, {duration}));
          setTimeoutId(setTimeout(() => { retrieveJobDoc(); }, 3000));
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const isStepRunning = (step) => {
    return !step.stepEndTime && step.stepStartTime;
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
      headerFormatter: (column) => <strong>Step Name</strong>,
      formatter: (stepName, response) => {
        if (response.success) {
          return <div data-testid={`${stepName}-success`} id={`${stepName}-success`} className={styles.stepResponse}>
            <CheckCircleFill type="check-circle" className={styles.successfulRun} /> <strong className={styles.stepName}>{stepName}</strong>
          </div>;
        } else if (response.hasOwnProperty("success") && !response.success) {
          return (<div data-testid={`${stepName}-failure`} id={`${stepName}-failure`} className={styles.stepResponse}>
            <ExclamationCircleFill aria-label="icon: exclamation-circle" className={styles.unsuccessfulRun} /><strong className={styles.stepName}>{stepName}</strong>
          </div>);
        } else if (isStepRunning(response)) {
          return (<div data-testid={`step-running`} id={`step-running`} className={styles.stepRunningIcon}>
            <i><FontAwesomeIcon aria-label="icon: clock-circle" icon={faClock} className={styles.runningIcon} size="lg" data-testid={`${response.status}-icon`} /></i>
            <strong>{stepName}</strong>
          </div>);
        } else {
          return (<div data-testid={`${stepName}-step`} id={`${stepName}-step`} className={styles.stepResponse}>
            <strong className={styles.stepName}>{stepName}</strong>
          </div>);
        }
      }
    },
    {
      text: "Step Type",
      key: "stepType",
      dataField: "stepType",
      headerFormatter: (column) => <strong data-testid={`stepType-header`}>Step Type</strong>,
      formatter: (stepName, response) => {
        let stepType = response.stepDefinitionType === "ingestion" ? "loading" : response.stepDefinitionType;
        return (<div data-testid={`${response.stepName}-${stepType}-type`} id={`${response.stepName}-${stepType}-type`} className={styles.stepResponse}>
          {stepType[0].toUpperCase() + stepType.substring(1)}
        </div>);
      }
    },
    {
      text: "Documents Written",
      key: "succesfulEvents",
      dataField: "successfulEvents",
      headerFormatter: (column) => <strong>Documents Written</strong>,
      formatter: (successfulEvents, response) => {
        const {stepName, success} = response;
        const stepIsFinished = response.stepEndTime && response.stepEndTime !== "N/A";
        if (stepIsFinished) {
          if (success) {
            return (<span className={styles.documentsWritten}>
              {successfulEvents}
            </span>);
          }
        } else if (isStepRunning(response)) {
          return (
            <div className={styles.stepResponse} key={"running-" + stepName}>
              <strong className={styles.stepName}>running step</strong>
              <span className={styles.running}>
                <Spinner className="spinner-border-sm" animation="border" data-testid="spinner" variant="primary" />
              </span>
            </div>
          );
        }
      }
    },
    {
      text: "Action",
      key: "action",
      dataField: "successfulEvents",
      headerFormatter: (column) => <span className={styles.actionHeader}><strong>Action</strong><HCTooltip text={RunToolTips.exploreStepData} id="explore-data" placement="top"><FontAwesomeIcon icon={faInfoCircle} size="1x" aria-label="icon: info-circle" className={styles.infoIcon}/></HCTooltip></span>,
      formatter: (successfulEvents, response) => {
        const {targetEntityType, targetDatabase, stepDefinitionType, stepName, stepEndTime} = response;
        const stepIsFinished = stepEndTime && stepEndTime !== "N/A";
        const isButtonDisabled = stepDefinitionType === "matching" || stepDefinitionType === "custom" || successfulEvents === 0;
        if (stepIsFinished) {
          let entityName;
          if (targetEntityType) {
            let splitTargetEntity = targetEntityType.split("/");
            entityName = splitTargetEntity[splitTargetEntity.length - 1];
          }
          return (
            <HCTooltip placement="top" id={`${stepName}-explore-button`} text={isButtonDisabled ? "You can explore documents for each Loading, Mapping, and Merging step that wrote documents to the database." : "You will be redirected to the Explore screen in the same browser tab."}>
              <span>
                <HCButton data-testid={`${stepName}-explorer-link`} size="sm" disabled={isButtonDisabled} onClick={() => { goToExplorer(entityName, targetDatabase, jobId, stepDefinitionType, stepName); }} className={styles.exploreCuratedData}>
                  <span className={styles.exploreActionIcon}></span>
                  <span className={styles.exploreActionText}>Explore Data</span>
                </HCButton>
              </span>
            </HCTooltip>
          );
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
                <div className={"p-0 d-flex"} data-testid={`${response.stepName}-error-${i + 1}`}>
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

  const composeData = (responsesArray) => {
    let data: any[] = [];
    if (flow===undefined || !flow.steps || flow.steps.length === 0) return responsesArray;
    for (let step of flow.steps) {
      const result = responsesArray.find(response => (response.stepName === step.stepName || response.status.includes(`running step ${step.stepNumber}`)));
      if (result === undefined) {
        data.push(step);
      } else {
        data.push(result);
      }
    }
    return data;
  };

  const responses = (jobResponse) => {
    if (jobResponse && jobResponse.stepResponses) {
      const responsesArray = Object.values(jobResponse.stepResponses);
      const data = composeData(responsesArray);
      return (<HCTable
        data-testid="job-response-table"
        rowKey={"key"}
        className={styles.responseTable}
        data={data}
        columns={responseColumns}
        expandedRowRender={(response) => expandedRowRender(response)}
        pagination={false}
      />);
    }
  };

  const goToExplorer = async (entityName: string, targetDatabase: string, jobId: string, stepType: string, stepName: string) => {
    if (stepType === "mapping") {
      let mapArtifacts = await getMappingArtifactByStepName(stepName);
      let entityView = mapArtifacts?.relatedEntityMappings?.length > 0 ? "All Entities" : entityName;
      setLatestJobFacet(jobId, entityView, stepName, targetDatabase);
    } else if (stepType === "merging") {
      setLatestJobFacet(jobId, entityName, stepName, targetDatabase, `sm-${entityName}-merged`);
    } else if (entityName) {
      setLatestJobFacet(jobId, entityName, stepName, targetDatabase);
    } else {
      setLatestDatabase(targetDatabase, jobId);
    }
    history.push({pathname: "/tiles/explore"});
  };

  return (<Modal
    show={openJobResponse}
    size={"lg"}
    data-testid="job-response-modal"
    id="job-response-modal"
  >
    <Modal.Header className={"bb-none"} aria-label="job-response-modal-header">
      {isRunning(jobResponse) ?
        <span className={`fs-5 ${styles.title}`} aria-label={`${jobResponse.flow}-running`}>
          The flow <strong>{jobResponse.flow}</strong> is running
          {/* TO BE REPLACED WITH STOP RUNNING ICON <a onClick={() => retrieveJobDoc()}><FontAwesomeIcon icon={faSync} data-testid={"job-response-refresh"} /></a> */}
        </span>
        :
        <span className={`fs-5 ${styles.title}`} aria-label={`${jobResponse.flow}-completed`}>The flow <strong>{jobResponse.flow}</strong> completed</span>}
      <button type="button" className="btn-close" aria-label={`${jobResponse.flow}-close`} data-testid={`${jobResponse.flow}-close`} onClick={() => setOpenJobResponse(false)}></button>
    </Modal.Header>
    <Modal.Body>
      <div aria-label="jobResponse" id="jobResponse" className={styles.jobResponseContainer} >
        <div>
          <div className={styles.descriptionContainer}>
            <div key={"jobId"}><span className={styles.descriptionLabel}>Job ID:</span><strong>{jobId}</strong></div>
            <div key={"startTime"}><span className={styles.descriptionLabel}>Start Time:</span><strong>{dateConverter(jobResponse.timeStarted)}</strong></div>
            <div key={"duration"}><span className={styles.descriptionLabel}>Duration:</span><strong>{renderDuration(jobResponse.duration)}</strong></div>
          </div>
        </div>
        <div>
          {responses(jobResponse)}
        </div>

      </div>
    </Modal.Body>
  </Modal>);
};

export default JobResponse;