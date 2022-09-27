import React, {useEffect, useState} from "react";
import {Accordion, ButtonGroup, Card, Dropdown} from "react-bootstrap";
import styles from "../flows.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {PopoverRunSteps, RunToolTips, SecurityTooltips} from "@config/tooltips.config";
import {HCTooltip, HCButton, HCCheckbox} from "@components/common";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {ChevronDown, GearFill, PlayCircleFill} from "react-bootstrap-icons";
import {faInfoCircle, faStopCircle} from "@fortawesome/free-solid-svg-icons";
import {ReorderFlowOrderDirection} from "../types";
import StepCard from "./step-card";
import {Flow, Step} from "../../../types/run-types";

import {dynamicSortDates} from "@util/conversionFunctions";

import sourceFormatOptions from "@config/formats.config";

export interface Props {
  idx: number;
  flowRef: React.RefObject<any>;
  flow: Flow;
  flowRunning: Flow;
  flows: Flow[];
  steps: any;
  setAllSelectedSteps: React.Dispatch<any>;
  runningStep?: Step;
  isStepRunning: boolean;
  canWriteFlow: boolean;
  canUserStopFlow: boolean;
  hasOperatorRole: boolean;
  getFlowWithJobInfo: (flowNum) => Promise<void>;
  latestJobData: any;
  uploadError: string;
  showUploadError: any;
  reorderFlow: (id: number, flowName: string, direction: ReorderFlowOrderDirection) => void;
  handleRunSingleStep: (flowName: string, step: any) => Promise<void>;
  handleRunFlow: (index: number, name: string) => Promise<void>;
  handleFlowDelete: (name: string) => void;
  handleStepAdd: (stepName: string, flowName: string, stepType: string) => Promise<void>;
  handleStepDelete: (flowName: string, stepDetails: any) => void;
  stopRun: () => Promise<void>;
  openFilePicker: () => void;
  setJobId: React.Dispatch<React.SetStateAction<string>>;
  setRunningStep: React.Dispatch<any>;
  setRunningFlow: React.Dispatch<any>;
  getInputProps: any;
  getRootProps: any;
  setShowUploadError: React.Dispatch<React.SetStateAction<boolean>>;
  setSingleIngest: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenJobResponse: React.Dispatch<React.SetStateAction<boolean>>;
  setNewFlow: React.Dispatch<React.SetStateAction<boolean>>;
  setFlowData: React.Dispatch<React.SetStateAction<{}>>;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setOpenFlows: React.Dispatch<any>;
  openFlows: any;
}

const FlowPanel: React.FC<Props> = ({
  flow,
  flows,
  flowRef,
  steps,
  idx,
  latestJobData,
  setAllSelectedSteps,
  openFilePicker,
  setRunningStep,
  setRunningFlow,
  handleStepDelete,
  handleRunSingleStep,
  runningStep,
  hasOperatorRole,
  getInputProps,
  getRootProps,
  setShowUploadError,
  setSingleIngest,
  uploadError,
  showUploadError,
  handleStepAdd,
  handleRunFlow,
  handleFlowDelete,
  stopRun,
  isStepRunning,
  flowRunning,
  reorderFlow,
  canWriteFlow,
  canUserStopFlow,
  openFlows,
  setOpenFlows,
  setJobId,
  getFlowWithJobInfo,
  setOpenJobResponse,
  setNewFlow,
  setFlowData,
  setTitle
}) => {
  const [showLinks, setShowLinks] = useState("");
  const [allChecked, setAllChecked] = useState<boolean>(true);
  let loadTypeCountAux = 0;

  useEffect(() => {
    getFlowWithJobInfo(idx);
    setSelectedSteps(flow?.steps ? handleLoadByDefault(flow) : []);
  }, [flow]);

  const handleLoadByDefault = (flow) => {
    let stepsByDefault: any[] = [];
    let skipStep = true;

    for (let i = 0; i < flow?.steps?.length; i++) {
      let step = flow.steps[i];
      if (step?.stepDefinitionType?.toLowerCase() === "ingestion") {
        loadTypeCountAux++;
        skipStep = handleLoadStepInArray(stepsByDefault);
        if (!skipStep) {
          stepsByDefault.push(step);
        }
      } else {
        stepsByDefault.push(step);
      }
    }
    return stepsByDefault;
  };

  const handleLoadStepInArray = (arraySteps) => {
    return arraySteps?.find(stepAux => stepAux?.stepDefinitionType.toLowerCase() === "ingestion");
  };

  const [selectedSteps, setSelectedSteps] = useState<any>(flow?.steps ? handleLoadByDefault(flow) : []);

  useEffect(() => {
    setAllSelectedSteps(prevState => {
      return {
        ...prevState,
        [flow.name]: [...selectedSteps]
      };
    });
    if (flow.steps === undefined) return;
    const unselectedLoadSteps = loadTypeCountAux !== 0 ? loadTypeCountAux - 1 : 0;
    if (selectedSteps.length === flow.steps.length - unselectedLoadSteps) {
      setAllChecked(true);
    } else {
      setAllChecked(false);
    }
  }, [selectedSteps]);

  const handleCheckAll = (event) => {
    if (flow.steps === undefined) return;
    if (!allChecked) {
      // check all and 1 load type
      setSelectedSteps(handleLoadByDefault(flow));
    } else {
      // uncheck all
      setSelectedSteps([]);
    }
  };

  const handleCheck = (step: any) => {
    if (flow.steps === undefined) return;
    let newSelectedSteps = [...selectedSteps];

    if (isStepSelected(step.stepName)) {
      // if its selected, unselect
      newSelectedSteps = newSelectedSteps.filter((stepAux) => {
        return stepAux.stepName !== step.stepName;
      });
      setSelectedSteps(newSelectedSteps);
    } else {
      // if not selected, select
      const checkedStep = flow.steps.find((stepAux) => {
        return stepAux.stepName === step.stepName;
      });
      newSelectedSteps.push(checkedStep);
      setSelectedSteps(newSelectedSteps);
    }
  };

  const isStepSelected = (stepName: string): boolean => {
    let addStep;
    addStep = selectedSteps.find(stepAux => stepAux?.stepName === stepName) !== undefined;
    return addStep;
  };

  let titleTypeStep; let currentTitle = "";
  let mapTypeSteps = new Map([["mapping", "Mapping"], ["merging", "Merging"], ["custom", "Custom"], ["mastering", "Mastering"], ["ingestion", "Loading"]]);
  const handleTitleSteps = (stepType) => {
    if (currentTitle !== stepType) {
      titleTypeStep = mapTypeSteps.get(stepType) ? mapTypeSteps.get(stepType) : "";
    } else { titleTypeStep = ""; }

    currentTitle = stepType;
    return titleTypeStep;
  };

  const isFlowEmpty = () => {
    if (flow.steps === undefined) return true;
    return flow.steps?.length < 1;
  };

  const controlDisabled = (step) => {
    let disabledCheck = false;
    if (selectedSteps?.find(stepAux => stepAux?.stepDefinitionType.toLowerCase() === "ingestion")) {
      if (!(selectedSteps?.find(stepAux => stepAux?.stepName === step.stepName))) {
        disabledCheck = true;
      }
    }
    return disabledCheck;
  };

  const handlePanelInteraction = (key) => {
    const tmpActiveKeys = [...openFlows];
    const index = tmpActiveKeys.indexOf(key);
    index !== -1 ? tmpActiveKeys.splice(index, 1) : tmpActiveKeys.push(key);
    /* Request to get latest job info for the flow will be made when someone opens the pane for the first time
        or opens a new pane. Closing the pane shouldn't send any requests*/
    if (!openFlows || (tmpActiveKeys.length > openFlows.length && tmpActiveKeys.length > 0)) {
      getFlowWithJobInfo(tmpActiveKeys[tmpActiveKeys.length - 1]);
    }
    setOpenFlows([...tmpActiveKeys]);
  };

  const OpenFlowJobStatus = (e, index, name) => {
    e.stopPropagation();
    e.preventDefault();
    //parse for latest job to display
    let completedJobsWithDates = latestJobData[name].filter(step => step.hasOwnProperty("jobId")).map((step, i) => ({jobId: step.jobId, date: step.stepEndTime}));
    let sortedJobs = completedJobsWithDates.sort(dynamicSortDates("date"));
    setJobId(sortedJobs[0].jobId);
    setOpenJobResponse(true);
  };

  const OpenEditFlowDialog = (e, index) => {
    e.stopPropagation();
    setTitle("Edit Flow");
    setFlowData(prevState => ({...prevState, ...flows[index]}));
    setNewFlow(true);
  };

  const showStopButton = (flowName: string): boolean => {
    if (!flowRunning) return false;
    return (isStepRunning && flowRunning.name === flowName);
  };

  const addStepsMenu = (flowName, i) => (
    <Dropdown align="end" >
      <Dropdown.Toggle data-testid={`addStep-${flowName}`} aria-label={`addStep-${flowName}`} disabled={!canWriteFlow} variant="outline-light" className={canWriteFlow ? styles.stepMenu : styles.stepMenuDisabled}>
        {
          canWriteFlow ?
            <>Add Step<ChevronDown className="ms-2" /> </>
            :
            <HCTooltip text={SecurityTooltips.missingPermission} id="add-step-disabled-tooltip" placement="bottom">
              <span aria-label={"addStepDisabled-" + i}>Add Step<ChevronDown className="ms-2" /> </span>
            </HCTooltip>
        }
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Header className="py-0 px-2 fs-6">Loading</Dropdown.Header>
        {steps && steps["ingestionSteps"] && steps["ingestionSteps"].length > 0 ? steps["ingestionSteps"].map((elem, index) => (
          <Dropdown.Item key={index} aria-label={`${elem.name}-to-flow`}>
            <div
              onClick={() => { handleStepAdd(elem.name, flowName, "ingestion"); }}
            >{elem.name}</div>
          </Dropdown.Item>
        )) : null}

        <Dropdown.Header className="py-0 px-2 fs-6">Mapping</Dropdown.Header>
        {steps && steps["mappingSteps"] && steps["mappingSteps"].length > 0 ? steps["mappingSteps"].map((elem, index) => (
          <Dropdown.Item key={index} aria-label={`${elem.name}-to-flow`}>
            <div
              onClick={() => { handleStepAdd(elem.name, flowName, "mapping"); }}
            >{elem.name}</div>
          </Dropdown.Item>
        )) : null}

        <Dropdown.Header className="py-0 px-2 fs-6">Matching</Dropdown.Header>
        {steps && steps["matchingSteps"] && steps["matchingSteps"].length > 0 ? steps["matchingSteps"].map((elem, index) => (
          <Dropdown.Item key={index} aria-label={`${elem.name}-to-flow`}>
            <div
              onClick={() => { handleStepAdd(elem.name, flowName, "matching"); }}
            >{elem.name}</div>
          </Dropdown.Item>
        )) : null}

        <Dropdown.Header className="py-0 px-2 fs-6">Merging</Dropdown.Header>
        {steps && steps["mergingSteps"] && steps["mergingSteps"].length > 0 ? steps["mergingSteps"].map((elem, index) => (
          <Dropdown.Item key={index} aria-label={`${elem.name}-to-flow`}>
            <div
              onClick={() => { handleStepAdd(elem.name, flowName, "merging"); }}
            >{elem.name}</div>
          </Dropdown.Item>
        )) : null}

        <Dropdown.Header className="py-0 px-2 fs-6">Mastering</Dropdown.Header>
        {steps && steps["masteringSteps"] && steps["masteringSteps"].length > 0 ? steps["masteringSteps"].map((elem, index) => (
          <Dropdown.Item key={index} aria-label={`${elem.name}-to-flow`}>
            <div
              onClick={() => { handleStepAdd(elem.name, flowName, "mastering"); }}
            >{elem.name}</div>
          </Dropdown.Item>
        )) : null}

        <Dropdown.Header className="py-0 px-2 fs-6">Custom</Dropdown.Header>
        {steps && steps["customSteps"] && steps["customSteps"].length > 0 ? steps["customSteps"].map((elem, index) => (
          <Dropdown.Item key={index} aria-label={`${elem.name}-to-flow`}>
            <div
              onClick={() => { handleStepAdd(elem.name, flowName, "custom"); }}
            >{elem.name}</div>
          </Dropdown.Item>
        )) : null}
      </Dropdown.Menu>
    </Dropdown>
  );

  const panelActions = (name, i) => {
    const flow = flows.filter((flow) => flow.name === name)[0];
    if (flow === undefined) return;
    return (<div
      className={styles.panelActionsContainer}
      id="panelActions"
      onClick={event => {
        event.stopPropagation(); // Do not trigger collapse
        event.preventDefault();
      }}
    >
      {showStopButton(name) && (<HCTooltip text={canUserStopFlow ? RunToolTips.stopRun : RunToolTips.stopRunMissingPermission} id="stop-run" placement="top">
        <span>
          <HCButton
            variant="outline-light"
            className={styles.stopFlow}
            key={`stepsDropdownButton-${name}`}
            data-testid={`stopFlow-${name}`}
            id={`stopFlow-${name}`}
            size="sm"
            onClick={() => { stopRun(); }}
            disabled={!canUserStopFlow}
          >
            <FontAwesomeIcon icon={faStopCircle} size="1x" aria-label="icon: info-circle" className={canUserStopFlow ? styles.stopIcon : styles.stopIconDisabled} />
            Stop Flow
          </HCButton>
        </span>
      </HCTooltip>)}
      <span id="stepsDropdown" className={styles.hoverColor}>
        <Dropdown as={ButtonGroup}>
          <HCTooltip text={isFlowEmpty() ? RunToolTips.runEmptyFlow : selectedSteps.length < 1 ? RunToolTips.selectAStep : ""} placement="top" id={`run-flow-tooltip`}>
            <span id={`${name}`}>
              <HCButton
                variant="transparent"
                className={styles.runFlow}
                key={`stepsDropdownButton-${name}`}
                data-testid={`runFlow-${name}`}
                id={`runFlow-${name}`}
                size="sm"
                onClick={() => handleRunFlow(i, name)}
                disabled={selectedSteps.length < 1 || flow.steps === undefined || (flow.steps !== undefined && flow.steps.length < 1)}
              >
                <><PlayCircleFill className={styles.runIcon} /> Run Flow </>
              </HCButton>
            </span>
          </HCTooltip>
          <Dropdown.Toggle split variant="transparent" className={styles.runIconToggle} disabled={isFlowEmpty() ? true : false}>
            <GearFill className={styles.runIcon} role="step-settings button" aria-label={`stepSettings-${name}`} />
          </Dropdown.Toggle>
          <Dropdown.Menu className={styles.dropdownMenu}>
            <>
              <Dropdown.Header className="py-0 fs-6 mb-2 text-dark">{PopoverRunSteps.selectStepTitle}</Dropdown.Header>
              <hr />
              <div className={styles.divCheckAll}>
                <HCCheckbox
                  id={"checkAll"}
                  value={allChecked}
                  checked={allChecked}
                  dataTestId={"select-all-toggle"}
                  handleClick={handleCheckAll}
                  label={allChecked ? "Deselect All" : "Select All"}
                />
              </div>
              {/* This is working weird */}
              {flow.steps?.sort((a, b) => a.stepDefinitionType?.toLowerCase()?.localeCompare(b.stepDefinitionType?.toLowerCase())).map((step, index) => {

                return (
                  <div key={index}>
                    <div className={styles.titleTypeStep}>{handleTitleSteps(step?.stepDefinitionType?.toLowerCase())}</div>
                    <div key={index} className={styles.divItem}>
                      <HCTooltip text={step.stepDefinitionType.toLowerCase() === "ingestion" ? controlDisabled(step) ? RunToolTips.loadStepRunFlow : "" : ""} placement="left" id={`tooltip`}>
                        <div className="divCheckBoxStep">
                          <HCCheckbox
                            tooltip={step.stepName}
                            placementTooltip={"top"}
                            label={step.stepName}
                            id={step.stepName}
                            value={step.stepName}
                            handleClick={() => handleCheck(step)}
                            checked={isStepSelected(step.stepName)}
                            disabled={step.stepDefinitionType.toLowerCase() === "ingestion" ? controlDisabled(step) : false}
                            removeMargin={true}
                          >{step.stepName}
                          </HCCheckbox></div></HCTooltip>
                    </div>
                  </div>
                );
              })}
              <Dropdown.Header className="py-0 fs-6 mt-2 text-danger" style={{whiteSpace: "pre-line"}} id="errorMessageEmptySteps">{!(selectedSteps.length < 1) ? "" : PopoverRunSteps.selectOneStepError}</Dropdown.Header>
            </>
          </Dropdown.Menu>
        </Dropdown>
      </span>

      {addStepsMenu(name, i)}

      <span className={styles.deleteFlow}>
        {canWriteFlow ?
          <HCTooltip text="Delete Flow" id="disabled-trash-tooltip" placement="bottom">
            <i aria-label={`deleteFlow-${name}`} className={"d-flex align-items-center"}>
              <FontAwesomeIcon
                icon={faTrashAlt}
                onClick={() => { handleFlowDelete(name); }}
                data-testid={`deleteFlow-${name}`}
                className={styles.deleteIcon}
                size="lg" />
            </i>
          </HCTooltip>
          :
          <HCTooltip text={"Delete Flow: " + SecurityTooltips.missingPermission} id="trash-tooltip" placement="bottom">
            <i aria-label={`deleteFlowDisabled-${name}`} className={"d-flex align-items-center"}>
              <FontAwesomeIcon
                icon={faTrashAlt}
                data-testid={`deleteFlow-${name}`}
                className={styles.disabledDeleteIcon}
                size="lg" />
            </i>
          </HCTooltip>}
      </span>

    </div>);
  };

  return (
    <Accordion className={"w-100"} flush key={idx} id={flow.name} activeKey={openFlows.includes(idx) ? idx.toString() : ""} defaultActiveKey={openFlows.includes(idx) ? idx.toString() : ""}>
      <Accordion.Item eventKey={idx.toString()}>
        <Card>
          <Card.Header className={"p-0 pe-3 d-flex bg-white"}>
            <Accordion.Button data-testid={`accordion-${flow.name}`} onClick={() => handlePanelInteraction(idx)}>
              <span id={"flow-header-" + flow.name} className={styles.flowHeader}>
                <HCTooltip text={canWriteFlow ? RunToolTips.flowEdit : RunToolTips.flowDetails} id="open-edit-tooltip" placement="bottom">
                  <span className={styles.flowName} onClick={(e) => OpenEditFlowDialog(e, idx)}>
                    {flow.name}
                  </span>
                </HCTooltip>
                {latestJobData && latestJobData[flow.name] && latestJobData[flow.name].find(step => step.jobId) ?
                  <HCTooltip text={RunToolTips.flowName} placement="bottom" id="">
                    <span onClick={(e) => OpenFlowJobStatus(e, idx, flow.name)} className={styles.infoIcon} data-testid={`${flow.name}-flow-status`}>
                      <FontAwesomeIcon icon={faInfoCircle} size="1x" aria-label="icon: info-circle" className={styles.flowStatusIcon} />
                    </span>
                  </HCTooltip>
                  : ""
                }
              </span>
            </Accordion.Button>
            {panelActions(flow.name, idx)}
          </Card.Header>
          <Accordion.Body className={styles.panelContent} ref={flowRef}>
            {flow.steps !== undefined && flow.steps?.sort((a, b) => {
              if (parseInt(a.stepNumber) > parseInt(b.stepNumber)) {
                return 1;
              }
              if (parseInt(a.stepNumber) < parseInt(b.stepNumber)) {
                return -1;
              } else {
                return 0;
              }
            }).map((step, i) => {
              return <StepCard
                key={i}
                step={step}
                flow={flow}
                openFilePicker={openFilePicker}
                setRunningStep={setRunningStep}
                setRunningFlow={setRunningFlow}
                handleStepDelete={handleStepDelete}
                handleRunSingleStep={handleRunSingleStep}
                latestJobData={latestJobData}
                reorderFlow={reorderFlow}
                canWriteFlow={canWriteFlow}
                hasOperatorRole={hasOperatorRole}
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                setSingleIngest={setSingleIngest}
                showLinks={showLinks}
                setShowLinks={setShowLinks}
                setShowUploadError={setShowUploadError}
                sourceFormatOptions={sourceFormatOptions}
                runningStep={runningStep}
                flowRunning={flowRunning}
                showUploadError={showUploadError}
                uploadError={uploadError}
              />;
            })}
          </Accordion.Body>
        </Card>
      </Accordion.Item>
    </Accordion>
  );
};


export default FlowPanel;