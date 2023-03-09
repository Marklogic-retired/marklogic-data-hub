import React, {useContext, CSSProperties} from "react";
import {HCCard, HCTooltip} from "@components/common";
import {faArrowAltCircleLeft, faArrowAltCircleRight} from "@fortawesome/free-regular-svg-icons";
import {themeColors} from "@config/themes.config";
import {Link} from "react-router-dom";
import {StepDefinitionTypeTitles, ReorderFlowOrderDirection} from "../types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {RunToolTips} from "@config/tooltips.config";
import styles from "../flows.module.scss";
import {Flow, Step} from "../../../types/run-types";
import {AuthoritiesContext} from "@util/authorities";
import {ExclamationCircleFill, PlayCircleFill, XCircleFill, X} from "react-bootstrap-icons";
import {faBan, faCheckCircle, faClock} from "@fortawesome/free-solid-svg-icons";

export interface Props {
  step: Step;
  flow: Flow;
  openFilePicker: () => void;
  setRunningStep: React.Dispatch<any>;
  setRunningFlow: React.Dispatch<any>;
  handleStepDelete: (flowName: string, step: any) => void;
  handleRunSingleStep: (flowName: string, step: any) => Promise<void>;
  latestJobData: any;
  reorderFlow: (id: number, flowName: string, direction: ReorderFlowOrderDirection) => void;
  canWriteFlow: boolean;
  hasOperatorRole: boolean;
  getRootProps: any;
  getInputProps: any;
  setSingleIngest: React.Dispatch<React.SetStateAction<any>>;
  showLinks: string;
  setShowLinks: React.Dispatch<React.SetStateAction<any>>;
  setShowUploadError: React.Dispatch<React.SetStateAction<any>>;
  sourceFormatOptions: any;
  runningStep?: Step;
  flowRunning: Flow;
  showUploadError: any;
  uploadError: string;
}

const StepCard: React.FC<Props> = ({
  step,
  flow,
  openFilePicker,
  setRunningStep,
  setRunningFlow,
  handleStepDelete,
  handleRunSingleStep,
  latestJobData,
  reorderFlow,
  canWriteFlow,
  hasOperatorRole,
  getRootProps,
  getInputProps,
  setSingleIngest,
  showLinks,
  setShowLinks,
  setShowUploadError,
  sourceFormatOptions,
  runningStep,
  flowRunning,
  showUploadError,
  uploadError,
}) => {
  const {stepNumber, sourceFormat} = step;

  let viewStepId = `${flow.name}-${stepNumber}`;
  let stepDefinitionType = step.stepDefinitionType ? step.stepDefinitionType.toLowerCase() : "";
  let stepDefinitionTypeTitle = StepDefinitionTypeTitles[stepDefinitionType];
  let stepWithJobDetail =
    latestJobData && latestJobData[flow.name] && latestJobData[flow.name]
      ? latestJobData[flow.name].find(el => el.stepId === step.stepId)
      : null;

  const reorderFlowKeyDownHandler = (event, index, flowName, direction) => {
    if (event.key === "Enter") {
      reorderFlow(index, flowName, direction);
      event.preventDefault();
    }
  };
  const runKeyDownHandler = (event, name) => {
    if (event.key === "Enter" || event.key === " ") {
      setShowUploadError(false);
      setSingleIngest(true);
      setRunningStep(step);
      setRunningFlow(name);
      openFilePicker();
    }
  };

  const handleMouseOver = (e, name) => {
    setShowLinks(name);
  };

  // For role-based privileges
  const authorityService = useContext(AuthoritiesContext);
  const authorityByStepType = {
    ingestion: authorityService.canReadLoad(),
    mapping: authorityService.canReadMapping(),
    matching: authorityService.canReadMatchMerge(),
    merging: authorityService.canReadMatchMerge(),
    custom: authorityService.canReadCustom(),
  };

  const isRunning = (flowId, stepId) => {
    let result = flowRunning.steps?.find(r => flowRunning.name === flowId && r.stepId === stepId);
    return result !== undefined;
  };

  const lastRunResponse = (step, flow) => {
    let stepEndTime;
    if (step.stepEndTime) {
      stepEndTime = new Date(step.stepEndTime).toLocaleString();
    }

    const flowLastRun = latestJobData[flow];

    let canceled = flowLastRun?.some(function (stepObj) {
      return stepObj.lastRunStatus?.includes("canceled");
    });

    if (!step.lastRunStatus && !canceled) {
      return null;
    }

    if (isRunning(flow.name, step.stepNumber)) {
      return (
        <HCTooltip text={RunToolTips.stepRunning} id="running-tooltip" placement="bottom">
          <span tabIndex={0}>
            <i>
              <FontAwesomeIcon
                aria-label="icon: clock-circle"
                icon={faClock}
                className={styles.runningIcon}
                size="lg"
                data-testid={`running-${step.stepName}`}
              />
            </i>
          </span>
        </HCTooltip>
      );
    } else if (step.lastRunStatus?.includes("canceled") || (!step.lastRunStatus && canceled)) {
      return (
        <span>
          <HCTooltip text={RunToolTips.stepCanceled(stepEndTime)} id="canceled-tooltip" placement="bottom">
            <span tabIndex={0}>
              <i>
                <FontAwesomeIcon icon={faBan} aria-label="icon: canceled-circle" className={styles.canceledRun} />
              </i>
            </span>
          </HCTooltip>
        </span>
      );
    } else if (step.lastRunStatus?.includes("completed step")) {
      return (
        <span>
          <HCTooltip text={RunToolTips.stepCompleted(stepEndTime)} id="success-tooltip" placement="bottom">
            <span tabIndex={0}>
              <i>
                <FontAwesomeIcon
                  aria-label="icon: check-circle"
                  icon={faCheckCircle}
                  className={styles.successfulRun}
                  size="lg"
                  data-testid={`check-circle-${step.stepName}`}
                />
              </i>
            </span>
          </HCTooltip>
        </span>
      );
    } else if (step.lastRunStatus?.includes("completed with errors step")) {
      return (
        <span>
          <HCTooltip
            text={RunToolTips.stepCompletedWithErrors(stepEndTime)}
            id="complete-with-errors-tooltip"
            placement="bottom"
          >
            <ExclamationCircleFill
              tabIndex={0}
              aria-label="icon: exclamation-circle"
              className={styles.unSuccessfulRun}
            />
          </HCTooltip>
        </span>
      );
    } else {
      return (
        <span>
          <HCTooltip text={RunToolTips.stepFailed(stepEndTime)} id="step-last-failed-tooltip" placement="bottom">
            <XCircleFill
              tabIndex={0}
              data-icon="failed-circle"
              aria-label="icon: failed-circle"
              className={styles.unSuccessfulRun}
            />
          </HCTooltip>
        </span>
      );
    }
  };

  //Custom CSS for source Format
  const sourceFormatStyle = sourceFmt => {
    let customStyles: CSSProperties;
    if (!sourceFmt) {
      customStyles = {
        float: "left",
        backgroundColor: "#fff",
        color: "#fff",
        padding: "5px",
      };
    } else {
      customStyles = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: "35px",
        width: "35px",
        lineHeight: "35px",
        backgroundColor: sourceFormatOptions[sourceFmt].color,
        fontSize: sourceFmt === "json" ? "12px" : "13px",
        borderRadius: "50%",
        textAlign: "center",
        color: "#ffffff",
        verticalAlign: "middle",
      };
    }
    return customStyles;
  };

  return (
    <div key={viewStepId} id={`${flow.name}-${step.stepName}-card`}>
      <HCCard
        className={styles.cardStyle}
        title={StepDefinitionTypeTitles[step.stepDefinitionType] || "Unknown"}
        actions={[
          <div className={styles.reorder}>
            {parseInt(stepNumber) !== 1 && canWriteFlow && (
              <div className={styles.reorderLeft}>
                <HCTooltip text={RunToolTips.moveLeft} id="move-left-tooltip" placement="bottom">
                  <i>
                    <FontAwesomeIcon
                      aria-label={`leftArrow-${step.stepName}`}
                      icon={faArrowAltCircleLeft}
                      className={styles.reorderFlowLeft}
                      role="button"
                      onClick={() => reorderFlow(parseInt(stepNumber), flow.name, ReorderFlowOrderDirection.LEFT)}
                      onKeyDown={e =>
                        reorderFlowKeyDownHandler(e, stepNumber, flow.name, ReorderFlowOrderDirection.LEFT)
                      }
                      tabIndex={0}
                    />
                  </i>
                </HCTooltip>
              </div>
            )}
            <div className={styles.reorderRight}>
              <div className={styles.stepResponse}>
                {stepWithJobDetail ? lastRunResponse(stepWithJobDetail, flow.name) : ""}
              </div>
              {flow.steps && parseInt(stepNumber) < flow.steps.length && canWriteFlow && (
                <HCTooltip aria-label="icon: right" text="Move right" id="move-right-tooltip" placement="bottom">
                  <i>
                    <FontAwesomeIcon
                      aria-label={`rightArrow-${step.stepName}`}
                      icon={faArrowAltCircleRight}
                      className={styles.reorderFlowRight}
                      role="button"
                      onClick={() => reorderFlow(parseInt(stepNumber), flow.name, ReorderFlowOrderDirection.RIGHT)}
                      onKeyDown={e =>
                        reorderFlowKeyDownHandler(e, stepNumber, flow.name, ReorderFlowOrderDirection.RIGHT)
                      }
                      tabIndex={0}
                    />
                  </i>
                </HCTooltip>
              )}
            </div>
          </div>,
        ]}
        titleExtra={
          <div className={styles.actions}>
            {hasOperatorRole ? (
              step.stepDefinitionType.toLowerCase() === "ingestion" ? (
                <div {...getRootProps()} style={{display: "inline-block"}}>
                  <input {...getInputProps()} id="fileUpload" />
                  <div
                    className={styles.run}
                    aria-label={`runStep-${step.stepName}`}
                    data-testid={`runStep-${step.stepName}`}
                    onClick={() => {
                      setShowUploadError(false);
                      setSingleIngest(true);
                      setRunningStep(step);
                      setRunningFlow(flow.name);
                      openFilePicker();
                    }}
                    tabIndex={0}
                    onKeyDown={e => {
                      runKeyDownHandler(e, flow.name);
                    }}
                  >
                    <HCTooltip text={RunToolTips.ingestionStep} id="run-ingestion-tooltip" placement="bottom">
                      <PlayCircleFill
                        aria-label="icon: play-circle"
                        color={themeColors.defaults.questionCircle}
                        size={20}
                      />
                    </HCTooltip>
                  </div>
                </div>
              ) : (
                <div
                  className={styles.run}
                  onClick={() => {
                    handleRunSingleStep(flow.name, step);
                  }}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleRunSingleStep(flow.name, step);
                    }
                  }}
                  aria-label={`runStep-${step.stepName}`}
                  data-testid={`runStep-${step.stepName}`}
                >
                  <HCTooltip text={RunToolTips.otherSteps} id="run-tooltip" placement="bottom">
                    <PlayCircleFill
                      aria-label="icon: play-circle"
                      color={themeColors.defaults.questionCircle}
                      size={20}
                    />
                  </HCTooltip>
                </div>
              )
            ) : (
              <div
                className={styles.disabledRun}
                onClick={event => {
                  event.stopPropagation();
                  event.preventDefault();
                }}
                aria-label={"runStepDisabled-" + step.stepName}
                data-testid={"runStepDisabled-" + stepNumber}
              >
                <PlayCircleFill size={20} />
              </div>
            )}
            {canWriteFlow ? (
              <HCTooltip text={RunToolTips.removeStep} id="delete-step-tooltip" placement="bottom">
                <div
                  className={styles.delete}
                  aria-label={`deleteStep-${step.stepName}`}
                  tabIndex={0}
                  onClick={() => handleStepDelete(flow.name, step)}
                  onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") handleStepDelete(flow.name, step);
                  }}
                >
                  <X aria-label="icon: close" color={themeColors.primary} size={27} />
                </div>
              </HCTooltip>
            ) : (
              <HCTooltip text={RunToolTips.removeStep} id="delete-step-tooltip" placement="bottom">
                <div
                  className={styles.disabledDelete}
                  aria-label={`deleteStepDisabled-${step.stepName}`}
                  tabIndex={0}
                  onClick={event => {
                    event.stopPropagation();
                    event.preventDefault();
                  }}
                  onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") event.stopPropagation();
                    event.preventDefault();
                  }}
                >
                  <X aria-label="icon: close" color={themeColors.primary} size={27} />
                </div>
              </HCTooltip>
            )}
          </div>
        }
        footerClassName={styles.cardFooter}
      >
        <div
          aria-label={viewStepId + "-content"}
          className={styles.cardContent}
          tabIndex={0}
          onFocus={e => {
            handleMouseOver(e, viewStepId);
          }}
          onMouseOver={e => handleMouseOver(e, viewStepId)}
          onMouseLeave={e => setShowLinks("")}
        >
          {sourceFormat ? (
            <div className={styles.format} style={sourceFormatStyle(sourceFormat)}>
              {sourceFormatOptions[sourceFormat].label}
            </div>
          ) : null}
          <div className={sourceFormat ? styles.loadStepName : styles.name}>{step.stepName}</div>
          <div
            className={styles.cardLinks}
            style={{
              display:
                showLinks === viewStepId && step.stepId && authorityByStepType[stepDefinitionType] ? "block" : "none",
            }}
            aria-label={viewStepId + "-cardlink"}
          >
            <Link
              id={"tiles-step-view-" + viewStepId}
              tabIndex={0}
              to={{
                pathname: `/tiles/${stepDefinitionType.toLowerCase() === "ingestion" ? "load" : "curate"}`,
                state: {
                  stepToView: step.stepId,
                  stepDefinitionType: stepDefinitionType,
                  targetEntityType: step.targetEntityType,
                },
              }}
              onKeyDown={e => {
                if (e.key === "Tab") {
                  setShowLinks("");
                }
              }}
            >
              <div className={styles.cardLink} data-testid={`${viewStepId}-viewStep`}>
                View {stepDefinitionTypeTitle} steps
              </div>
            </Link>
          </div>
        </div>
        <div className={styles.uploadError}>
          {showUploadError && flow.name === flowRunning.name && stepNumber === runningStep?.stepNumber
            ? uploadError
            : ""}
        </div>
      </HCCard>
    </div>
  );
};

export default StepCard;
