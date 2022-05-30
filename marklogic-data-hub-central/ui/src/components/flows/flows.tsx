import "./flows.scss";

import * as _ from "lodash";

import {Accordion, ButtonGroup, Card, Dropdown, Modal} from "react-bootstrap";
import {ChevronDown, ExclamationCircleFill, GearFill, PlayCircleFill, X, XCircleFill} from "react-bootstrap-icons";
import {HCButton, HCCard, HCCheckbox, HCTooltip} from "@components/common";
import {Link, useLocation} from "react-router-dom";
import {PopoverRunSteps, RunToolTips, SecurityTooltips} from "@config/tooltips.config";
import React, {CSSProperties, createRef, useContext, useEffect, useState} from "react";
import {getViewSettings, setViewSettings} from "@util/user-context";
import {faArrowAltCircleLeft, faArrowAltCircleRight, faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {faBan, faCheckCircle, faClock, faInfoCircle, faStopCircle} from "@fortawesome/free-solid-svg-icons";
import {getUserPreferences, updateUserPreferences} from "../../../src/services//user-preferences";

import {AuthoritiesContext} from "@util/authorities";
import {Flow} from "../../types/run-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NewFlowDialog from "./new-flow-dialog/new-flow-dialog";
import axios from "axios";
import {dynamicSortDates} from "@util/conversionFunctions";
import sourceFormatOptions from "@config/formats.config";
import styles from "./flows.module.scss";
import {themeColors} from "@config/themes.config";
import {useDropzone} from "react-dropzone";

enum ReorderFlowOrderDirection {
  LEFT = "left",
  RIGHT = "right"
}

export interface Props {
  flows: any;
  steps: any;
  deleteFlow: any;
  createFlow: any;
  updateFlow: (name: any, description: any, steps: any) => Promise<void>;
  deleteStep: any;
  runStep: any;
  stopRun: () => Promise<void>;
  runFlowSteps: any;
  canReadFlow: boolean;
  canWriteFlow: boolean;
  hasOperatorRole: boolean;
  flowRunning: Flow;
  uploadError: string;
  newStepToFlowOptions: any;
  addStepToFlow: any;
  flowsDefaultActiveKey: any;
  runEnded: any;
  onReorderFlow: (flowIndex: number, newSteps: Array<any>) => void
  setJobId: any;
  setOpenJobResponse: React.Dispatch<React.SetStateAction<boolean>>;
  isStepRunning: boolean;
  canUserStopFlow: boolean;
}

const StepDefinitionTypeTitles = {
  "INGESTION": "Loading",
  "ingestion": "Loading",
  "MAPPING": "Mapping",
  "mapping": "Mapping",
  "MASTERING": "Mastering",
  "mastering": "Mastering",
  "MATCHING": "Matching",
  "matching": "Matching",
  "MERGING": "Merging",
  "merging": "Merging",
  "CUSTOM": "Custom",
  "custom": "Custom"
};

const Flows: React.FC<Props> = ({
  flows,
  steps,
  deleteFlow,
  createFlow,
  updateFlow,
  deleteStep,
  stopRun,
  runStep,
  runFlowSteps,
  canReadFlow,
  canWriteFlow,
  hasOperatorRole,
  flowRunning,
  uploadError,
  newStepToFlowOptions,
  addStepToFlow,
  flowsDefaultActiveKey,
  runEnded,
  onReorderFlow,
  setJobId,
  setOpenJobResponse,
  isStepRunning,
  canUserStopFlow,
}) => {
  const storage = getViewSettings();
  const openFlows = storage?.run?.openFlows;
  const hasDefaultKey = JSON.stringify(newStepToFlowOptions?.flowsDefaultKey) !== JSON.stringify(["-1"]);

  const [newFlow, setNewFlow] = useState(false);
  const [addedFlowName, setAddedFlowName] = useState("");
  const [title, setTitle] = useState("");
  const [flowData, setFlowData] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [stepDialogVisible, setStepDialogVisible] = useState(false);
  const [addStepDialogVisible, setAddStepDialogVisible] = useState(false);
  const [addExistingStepDialogVisible, setAddExistingStepDialogVisible] = useState(false);
  const [flowName, setFlowName] = useState("");
  const [stepName, setStepName] = useState("");
  const [stepType, setStepType] = useState("");
  const [stepNumber, setStepNumber] = useState("");
  const [runningStep, setRunningStep] = useState<any>({});
  const [runningFlow, setRunningFlow] = useState<any>("");
  const [fileList, setFileList] = useState<any[]>([]);
  const [showUploadError, setShowUploadError] = useState(false);
  const [openNewFlow, setOpenNewFlow] = useState(newStepToFlowOptions?.addingStepToFlow && !newStepToFlowOptions?.existingFlow);
  const [activeKeys, setActiveKeys] = useState(
    hasDefaultKey && (newStepToFlowOptions?.flowsDefaultKey ?? []).length > 0 ?
      newStepToFlowOptions?.flowsDefaultKey :
      (openFlows ? openFlows : [])
  );
  const [showLinks, setShowLinks] = useState("");
  const [startRun, setStartRun] = useState(false);
  const [latestJobData, setLatestJobData] = useState<any>({});
  const [singleIngest, setSingleIngest] = useState(false);
  const [createAdd, setCreateAdd] = useState(true);
  const [addFlowDirty, setAddFlowDirty] = useState({});
  const [addExternalFlowDirty, setExternalAddFlowDirty] = useState(true);
  const [hasQueriedInitialJobData, setHasQueriedInitialJobData] = useState(false);
  const [selectedStepOptions, setSelectedStepOptions] = useState<any>({}); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [currentFlowName, setCurrentFlowName] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [arrayLoadChecksSteps, setArrayLoadChecksSteps] = useState<any>([{flowName: "", stepNumber: -1}]);
  const [selectedStepDetails, setSelectedStepDetails] = useState<any>([{stepName: "", stepNumber: -1, stepDefinitionType: "", isChecked: false}]);
  const [flowsDeepCopy, setFlowsDeepCopy] = useState<any>([]);
  //const [runFlowClicked, setRunFlowClicked] = useState(false);
  const [checkAll, setCheckAll] = useState(true);
  const [currentTooltip, setCurrentTooltip] = useState("");
  const location = useLocation();

  // maintain a list of panel refs
  const flowPanels: any = flows.reduce((p, n) => ({...p, ...{[n.name]: createRef()}}), {});

  // Persists active keys in session storage as a user interacts with them
  useEffect(() => {
    if (activeKeys === undefined) {
      return;
    }
    const newStorage = {...storage, run: {...storage.run, openFlows: activeKeys}};
    setViewSettings(newStorage);
  }, [activeKeys]);

  // If a step was just added scroll the flow step panel fully to the right
  useEffect(() => {
    const scrollToEnd = f => {
      const panel = flowPanels[f];
      if (panel && panel.current) {
        const {scrollWidth} = panel.current;
        panel.current.scrollTo(scrollWidth * 2, 0);
      }
    };
    if (!flows.length) return;
    const currentFlow = flows.filter(({name}) => name === flowName).shift();
    if (currentFlow?.steps?.length > addFlowDirty[flowName]) {
      // Scrolling should happen on the last update after the number of steps in the flow has been updated
      scrollToEnd(flowName);
      setAddFlowDirty({...addFlowDirty, [flowName]: currentFlow?.steps?.length});
    } else {
      // if step is added from external view
      let state: any = location.state || {};
      const externalDirty = (state ? state["addFlowDirty"] : false) && addExternalFlowDirty;
      const thisFlow = state ? state["flowName"] : null;
      if (externalDirty) {
        scrollToEnd(thisFlow);
        setExternalAddFlowDirty(false);
      }
    }

    if (flows !== undefined || flows !== null) {
      {
        setFlowsDeepCopy(_.cloneDeep(flows));
        flows.map((flow) => (
          flow?.steps && flow.steps.map((step) => {
            controlsCheckboxes(step, step.stepDefinitionType?.toLowerCase(), flow.name);
          })
        ));
      }

      //Getting local storage in the load of the page if it exists
      if (getUserPreferencesLS() && getUserPreferencesLS()?.loadSelectedStepsUser) {
        if (getUserPreferencesLS()?.selectedStepsDataUser && Object.keys(getUserPreferencesLS().selectedStepsDataUser?.selectedStepOptions).length !== 0) {
          getLocalStorageDataUser();
        }
      }
      saveLocalStoragePreferences(true);
    }
  }, [flows]);

  useEffect(() => {
    if (openFlows === undefined || flows.length === 0 || hasQueriedInitialJobData) {
      return;
    }

    flows.map((flow, i) => {
      getFlowWithJobInfo(i);
    });

    setHasQueriedInitialJobData(true);
  }, [flows]);

  useEffect(() => {
    if (JSON.stringify(flowsDefaultActiveKey) !== JSON.stringify([]) && flowsDefaultActiveKey.length >= activeKeys.length) {
      setActiveKeys([...flowsDefaultActiveKey]);
    }

    if (flows) {
      // Get the latest job info when a step is added to an existing flow from Curate or Load Tile
      if (JSON.stringify(flows) !== JSON.stringify([])) {
        let stepsInFlow = flows[newStepToFlowOptions?.flowsDefaultKey]?.steps;
        if (newStepToFlowOptions && newStepToFlowOptions.addingStepToFlow && newStepToFlowOptions.existingFlow && newStepToFlowOptions.flowsDefaultKey && newStepToFlowOptions.flowsDefaultKey !== -1) {
          getFlowWithJobInfo(newStepToFlowOptions.flowsDefaultKey);
          if (startRun) {
            //run step after step is added to an existing flow
            if (newStepToFlowOptions.stepDefinitionType.toLowerCase() === "ingestion") {
              setShowUploadError(false);
              setRunningStep(stepsInFlow[stepsInFlow.length - 1]);
              setRunningFlow(newStepToFlowOptions?.flowName);
              openFilePicker();
              setStartRun(false);
            } else {
              runStep(newStepToFlowOptions?.flowName, stepsInFlow[stepsInFlow.length - 1]);
              setStartRun(false);
            }
          }
          //run step that is already inside a flow
        } else if (newStepToFlowOptions && !newStepToFlowOptions.addingStepToFlow && newStepToFlowOptions.startRunStep && newStepToFlowOptions.flowsDefaultKey && newStepToFlowOptions.flowsDefaultKey !== -1) {
          let runStepNum = stepsInFlow.findIndex(s => s.stepName === newStepToFlowOptions?.newStepName);
          if (startRun) {
            if (newStepToFlowOptions.stepDefinitionType.toLowerCase() === "ingestion") {
              setShowUploadError(false);
              setRunningStep(stepsInFlow[runStepNum]);
              setRunningFlow(newStepToFlowOptions?.flowName);
              openFilePicker();
              setStartRun(false);
            } else {
              runStep(newStepToFlowOptions?.flowName, stepsInFlow[runStepNum]);
              setStartRun(false);
            }
          }
        }
      }
    }
    if (activeKeys === undefined) {
      setActiveKeys([]);
    }
  }, [flows]);

  useEffect(() => {
    //run step after step is added to a new flow
    if (newStepToFlowOptions && !newStepToFlowOptions.existingFlow && startRun && addedFlowName) {
      let indexFlow = flows?.findIndex(i => i.name === addedFlowName);
      if (flows[indexFlow]?.steps.length > 0) {
        let indexStep = flows[indexFlow].steps.findIndex(s => s.stepName === newStepToFlowOptions.newStepName);
        if (flows[indexFlow].steps[indexStep].stepDefinitionType.toLowerCase() === "ingestion") {
          setShowUploadError(false);
          setRunningStep(flows[indexFlow].steps[indexStep]);
          setRunningFlow(addedFlowName);
          openFilePicker();
        } else {
          runStep(addedFlowName, flows[indexFlow].steps[indexStep]);
          setAddedFlowName("");
          setStartRun(false);
        }
      }
    }
  }, [steps]);

  // Get the latest job info after a step (in a flow) run
  useEffect(() => {
    let num = flows.findIndex((flow) => flow.name === runEnded.flowId);
    if (num >= 0) {
      getFlowWithJobInfo(num);
    }
  }, [runEnded]);

  useEffect(() => {
    if (newStepToFlowOptions && newStepToFlowOptions.startRunStep) {
      setStartRun(true);
    }
  }, [newStepToFlowOptions]);

  // For role-based privileges
  const authorityService = useContext(AuthoritiesContext);
  const authorityByStepType = {
    ingestion: authorityService.canReadLoad(),
    mapping: authorityService.canReadMapping(),
    matching: authorityService.canReadMatchMerge(),
    merging: authorityService.canReadMatchMerge(),
    custom: authorityService.canReadCustom()
  };

  const OpenAddNewDialog = () => {
    setCreateAdd(false);
    setTitle("New Flow");
    setNewFlow(true);
  };

  //Custom CSS for source Format
  const sourceFormatStyle = (sourceFmt) => {
    let customStyles: CSSProperties;
    if (!sourceFmt) {
      customStyles = {
        float: "left",
        backgroundColor: "#fff",
        color: "#fff",
        padding: "5px"
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
        verticalAlign: "middle"
      };
    }
    return customStyles;
  };

  const handleStepAdd = async (stepName, flowName, stepType) => {
    if (isStepInFlow(stepName, flowName)) {
      setAddExistingStepDialogVisible(true);
    } else {
      setAddStepDialogVisible(true);
    }
    setFlowName(flowName);
    setStepName(stepName);
    setStepType(stepType);
  };

  const handleFlowDelete = (name) => {
    setDialogVisible(true);
    setFlowName(name);
  };

  const handleStepDelete = (flowName, stepDetails) => {
    setStepDialogVisible(true);
    setFlowName(flowName);
    setStepName(stepDetails.stepName);
    setStepType(stepDetails.stepDefinitionType);
    setStepNumber(stepDetails.stepNumber);
  };

  const onOk = (name) => {
    deleteFlow(name);
    setDialogVisible(false);
  };

  const onStepOk = (flowName, stepNumber) => {

    // let stepToDrop = selectedStepDetails?.find(function (obj) {
    //   if (
    //     obj.flowName === flowName
    //     && obj.stepNumber === stepNumber
    //   ) return obj;
    // });

    // //Drop step
    // let arrayObjectsStepDetails = selectedStepDetails;
    // for (let i = 0; i < arrayObjectsStepDetails?.length; i++) {
    //   if (arrayObjectsStepDetails[i]?.stepNumber === stepNumber && arrayObjectsStepDetails[i]?.flowName === flowName) { // checkedValues es step name
    //     arrayObjectsStepDetails.splice(i, 1);
    //   }
    // }

    // //Drop load check
    // let arrayObjectsLoadChecksSteps = arrayLoadChecksSteps;
    // if (stepToDrop && stepToDrop?.stepDefinitionType.toLowerCase() === "ingestion") {
    //   for (let i = 0; i < arrayObjectsLoadChecksSteps?.length; i++) {
    //     if (arrayObjectsLoadChecksSteps[i]?.stepNumber === stepNumber && arrayObjectsLoadChecksSteps[i]?.flowName === flowName) { // checkedValues es step name
    //       arrayObjectsLoadChecksSteps.splice(i, 1);
    //     }
    //   }
    // }

    // let arraySelectedStepOptions = selectedStepOptions;
    // delete arraySelectedStepOptions[flowName + "_" + stepToDrop?.stepName + "_" + stepToDrop?.stepDefinitionType?.toLowerCase()];
    // const {[flowName + "_" + stepToDrop?.stepName + "_" + stepToDrop?.stepDefinitionType?.toLowerCase()]: foo, ...newObject} = arraySelectedStepOptions;

    // setSelectedStepDetails(arrayObjectsStepDetails);
    // setArrayLoadChecksSteps(arrayObjectsLoadChecksSteps);
    // setSelectedStepOptions(newObject);

    resetSelectedFlow(flowName);
    deleteStep(flowName, stepNumber);
    setStepDialogVisible(false);
    saveLocalStoragePreferences(true, true);
  };

  const onConfirmOk = () => {
    setAddExistingStepDialogVisible(false);
  };

  const onAddStepOk = async (stepName, flowName, stepType) => {
    await addStepToFlow(stepName, flowName, stepType);
    // Open flow panel if not open
    const flowIndex = flows.findIndex(f => f.name === flowName);
    if (!activeKeys.includes(flowIndex)) {
      let newActiveKeys = [...activeKeys, flowIndex];
      setActiveKeys(newActiveKeys);
    }
    await setAddStepDialogVisible(false);
    await setAddFlowDirty({...addFlowDirty, [flowName]: flows[flowIndex].steps.length});
  };

  const onCancel = () => {
    setDialogVisible(false);
    setStepDialogVisible(false);
    setAddStepDialogVisible(false);
    setAddExistingStepDialogVisible(false);
  };

  const isStepInFlow = (stepName, flowName) => {
    let result = false;
    let flow;
    if (flows) flow = flows.find(f => f.name === flowName);
    if (flow) result = flow["steps"].findIndex(s => s.stepName === stepName) > -1;
    return result;
  };

  // Setup for file upload
  const {getRootProps, getInputProps, open, acceptedFiles} = useDropzone({
    noClick: true,
    noKeyboard: true
  });

  const openFilePicker = () => {
    open();
    setStartRun(false);
  };

  useEffect(() => {
    acceptedFiles.forEach(file => {
      setFileList(prevState => [...prevState, file]);
    });
    if (startRun) {
      setAddedFlowName("");
      setStartRun(false);
    }
  }, [acceptedFiles]);

  useEffect(() => {
    customRequest();
  }, [fileList]);

  const deleteConfirmation = (
    <Modal
      show={dialogVisible}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body className={"text-center pt-0 pb-4"}>
        <div className={`mb-4 ${styles.confirmationText}`}>Are you sure you want to delete the <strong>{flowName}</strong> flow?</div>
        <div>
          <HCButton variant="outline-light" aria-label={"No"} className={"me-2"} onClick={onCancel}>
            No
          </HCButton>
          <HCButton aria-label={"Yes"} variant="primary" type="submit" onClick={() => onOk(flowName)}>
            Yes
          </HCButton>
        </div>
      </Modal.Body>
    </Modal>
  );

  const deleteStepConfirmation = (
    <Modal
      show={stepDialogVisible}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body className={"text-center pt-0 pb-4"}>
        <div className={`mb-4 ${styles.confirmationText}`}>Are you sure you want to remove the <strong>{stepName}</strong> step from the <strong>{flowName}</strong> flow?</div>
        <div>
          <HCButton variant="outline-light" aria-label={"No"} className={"me-2"} onClick={onCancel}>
            No
          </HCButton>
          <HCButton aria-label={"Yes"} variant="primary" type="submit" onClick={() => onStepOk(flowName, stepNumber)}>
            Yes
          </HCButton>
        </div>
      </Modal.Body>
    </Modal>
  );

  const addStepConfirmation = (
    <Modal
      show={addStepDialogVisible}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body className={"text-center pt-0 pb-4"}>
        <div className={`mb-4 ${styles.confirmationText}`}>
          {
            isStepInFlow(stepName, flowName)
              ?
              <p>The step <b>{stepName}</b> is already in the flow <b>{flowName}</b>. Would you like to add another instance?</p>
              :
              <p>Are you sure you want to add step <b>{stepName}</b> to flow <b>{flowName}</b>?</p>
          }
        </div>
        <div>
          <HCButton variant="outline-light" aria-label={"No"} className={"me-2"} onClick={onCancel}>
            No
          </HCButton>
          <HCButton aria-label={"Yes"} variant="primary" type="submit" onClick={() => onAddStepOk(stepName, flowName, stepType)}>
            Yes
          </HCButton>
        </div>
      </Modal.Body>
    </Modal>
  );

  const addExistingStepConfirmation = (
    <Modal
      show={addExistingStepDialogVisible}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body className={"text-center pt-0 pb-4"}>
        <div className={`mb-4 ${styles.confirmationText}`}>
          {
            <p>The step <b>{stepName}</b> is already in the flow <b>{flowName}</b>.</p>
          }
        </div>
        <div>
          <HCButton variant="primary" aria-label={"Ok"} type="submit" className={"me-2"} onClick={onConfirmOk}>
            OK
          </HCButton>
        </div>
      </Modal.Body>
    </Modal>
  );

  const onCheckboxChange = (event, checkedValues?, stepNumber?, stepDefinitionType?, flowNames?, stepId?, sourceFormat?, fromCheckAll?) => {

    let checkAllAux;
    if (event !== "default" && fromCheckAll) {
      checkAllAux = checkAll ? false : true;
      setCheckAll(checkAllAux);
    }

    if (currentFlowName !== flowNames) {
      setCurrentFlowName(flowNames);
    }

    if (fromCheckAll) {
      if (checkAll) {

        let stepsSelectedFlow = selectedStepDetails.filter(function (obj) {
          return obj.flowName === flowNames;
        });

        stepsSelectedFlow.map((obj) => {
          let selectedStepOptionsAux = selectedStepOptions;
          selectedStepOptionsAux[flowNames + "_" + obj.stepName + "_" + obj?.stepDefinitionType?.toLowerCase()] = false;
          setSelectedStepOptions(selectedStepOptionsAux);
        });

        if (currentFlowName.length > 0) {
          let selectedStepDetailsAux = selectedStepDetails.filter(function (obj) {
            return obj.flowName !== flowNames && obj.stepName !== checkedValues;
          });
          setSelectedStepDetails(selectedStepDetailsAux);
          selectedStepDetails.shift();
        }

        let arrayLoadChecksStepsAux = arrayLoadChecksSteps;
        arrayLoadChecksStepsAux.map(function (obj) {
          if (obj.flowName === flowNames) obj.checked = false;
        });
        setArrayLoadChecksSteps(arrayLoadChecksStepsAux);

      } else {
        {
          flows.map((flow) => (
            flow["name"] === flowNames &&
            flow?.steps && flow.steps.map((step) => {
              controlsCheckboxes(step, step.stepDefinitionType, flow.name);
            })));
        }
      }
    } else {

      let originRender = event !== "default" ? true : false;



      let data = {stepName: "", stepNumber: -1, stepDefinitionType: "", isChecked: false, flowName: "", stepId: "", sourceFormat: ""};

      data.stepName = checkedValues;
      data.stepNumber = stepNumber;
      data.stepDefinitionType = stepDefinitionType;
      data.isChecked = originRender ? event.target.checked : true;
      data.flowName = flowNames;
      data.stepId = stepId;
      data.sourceFormat = sourceFormat;

      let obj = selectedStepDetails;
      if (data.isChecked) {
        let checkDuplicateObject = selectedStepDetails?.find(function (obj) {
          if (obj.stepId === data.stepId && obj.flowName === data.flowName
          ) { return true; }
        });

        if (!checkDuplicateObject) { obj.push(data); } else {
          selectedStepDetails.map((obj) => {
            if (obj.stepId === data.stepId && obj.flowName === data.flowName) {
              obj.stepNumber = stepNumber;
            }
          });
        }
      } else {
        for (let i = 0; i < obj.length; i++) {
          if (obj[i].stepName === checkedValues) {
            obj.splice(i, 1);
          }
        }
      }

      if (originRender && stepDefinitionType.toLowerCase() === "ingestion") {
        handleArrayLoadChecksSteps(flowNames, checkedValues, stepNumber, stepDefinitionType);
      } else if (!originRender && stepDefinitionType.toLowerCase() === "ingestion") {
        handleArrayLoadChecksSteps(flowNames, checkedValues, stepNumber, stepDefinitionType, "default");
      }
      setSelectedStepDetails(obj);
      selectedStepOptions[flowNames + "_" + checkedValues + "_" + stepDefinitionType?.toLowerCase()] = true;
      setSelectedStepOptions({...selectedStepOptions, [flowNames + "_" + checkedValues + "_" + stepDefinitionType?.toLowerCase()]: originRender ? event.target.checked : true});
      if (originRender) event.stopPropagation();
    }
  };

  const getLocalStorageDataUser = () => {

    if (getUserPreferencesLS()) {
      if (getUserPreferencesLS()?.selectedStepsDataUser?.selectedStepOptions) {
        setSelectedStepOptions(getUserPreferencesLS().selectedStepsDataUser.selectedStepOptions);
      }
      if (getUserPreferencesLS()?.selectedStepsDataUser?.arrayLoadChecksSteps) {
        setArrayLoadChecksSteps(getUserPreferencesLS().selectedStepsDataUser.arrayLoadChecksSteps);
      }
      if (getUserPreferencesLS()?.selectedStepsDataUser?.selectedStepDetails) {
        setSelectedStepDetails(getUserPreferencesLS().selectedStepsDataUser.selectedStepDetails);
      }
    }
  };

  const tryParseJson = (userPreferences) => {
    try {
      return JSON.parse(userPreferences);
    } catch (e) {
      return false;
    }
  };

  const getUserPreferencesLS = () => {
    let userPreferences, oldOptions;
    const sessionUser = localStorage.getItem("dataHubUser");

    if (sessionUser) {
      userPreferences = getUserPreferences(sessionUser);
      if (userPreferences) {
        oldOptions = tryParseJson(userPreferences);
      } else { return false; }
    }

    return oldOptions;
  };

  const saveLocalStoragePreferences = (value: boolean, saveSelectedStepsDataUser?: boolean) => {

    const sessionUser = localStorage.getItem("dataHubUser");
    if (getUserPreferencesLS()) {
      let oldOptions = getUserPreferencesLS();
      let newOptions = {
        ...oldOptions,
        loadSelectedStepsUser: value,
      };

      if (saveSelectedStepsDataUser) {
        let newSelectedStepsDataUser = {
          selectedStepOptions: selectedStepOptions,
          arrayLoadChecksSteps: arrayLoadChecksSteps,
          selectedStepDetails: selectedStepDetails
        };

        newOptions = {
          ...oldOptions,
          loadSelectedStepsUser: value,
          selectedStepsDataUser: newSelectedStepsDataUser,
        };
      }
      updateUserPreferences(sessionUser ?? "", newOptions);
    }
  };

  useEffect(() => {
    //When Refreshing or leaving the page, save the flag to get the local storage
    return () => {
      saveLocalStoragePreferences(true);
    };
  }, []);


  let flagOneLoadSelected = true, flowNameCheckAux = "";
  const handleArrayLoadChecksSteps = (flowNameCheck, stepName, stepNumber, stepDefinitionType, origin?) => {
    let loadCheckStep;
    stepDefinitionType = stepDefinitionType ? stepDefinitionType.toLowerCase() : "";

    let valueCheck = selectedStepOptions[flowNameCheck + "_" + stepName + "_" + stepDefinitionType] === true ? true : false;
    loadCheckStep = arrayLoadChecksSteps?.find(function (obj) {
      if (obj?.stepId === flowNameCheck + "_" + stepName + "_" + stepDefinitionType) return true;
    });

    if (loadCheckStep) { loadCheckStep.checked = origin === "default" ? valueCheck : !valueCheck; } else {
      if (stepDefinitionType) {
        loadCheckStep = {flowName: "", stepNumber: -1, checked: false};
        loadCheckStep.flowName = flowNameCheck;
        loadCheckStep.stepNumber = stepNumber;
        loadCheckStep.checked = origin === "default" ? true : valueCheck;
        loadCheckStep.stepId = flowNameCheck + "_" + stepName + "_" + stepDefinitionType;
        arrayLoadChecksSteps.push(loadCheckStep);
      }
    }
    setArrayLoadChecksSteps(arrayLoadChecksSteps);
  };

  const controlsCheckboxes = (step, stepDefinition, flowNameCheck) => {

    if (flowNameCheckAux !== flowNameCheck) { flowNameCheckAux = flowNameCheck; flagOneLoadSelected = true; }

    if (stepDefinition.toLowerCase() === "ingestion") {
      if (flagOneLoadSelected) {
        if (flowNameCheckAux === flowNameCheck) {
          flagOneLoadSelected = false;
          onCheckboxChange("default", step.stepName, step.stepNumber, step.stepDefinitionType?.toLowerCase(), flowNameCheck, step.stepId, step.sourceFormat);
        } else { flagOneLoadSelected = true; flowNameCheckAux = flowNameCheck; }
      }
      handleArrayLoadChecksSteps(flowNameCheck, step.stepName, step.stepNumber, step.stepDefinition?.toLowerCase(), "default");
    } else {
      onCheckboxChange("default", step.stepName, step.stepNumber, step.stepDefinitionType?.toLowerCase(), flowNameCheck, step.stepId, step.sourceFormat);
    }
  };

  const controlStepSelected = (flowName) => {
    let obj = selectedStepDetails.find(obj => obj.flowName === flowName);
    if (obj) { return true; } else { return false; }
  };

  const isFlowEmpty = (flowName) => {
    return flowsDeepCopy.filter((flow) => flow.name === flowName)[0]?.steps?.length < 1;
  };


  const controlDisabled = (step, flowName) => {
    let disabledCheck = false;
    const filteredaArray = arrayLoadChecksSteps && arrayLoadChecksSteps.filter(obj => {
      return obj.flowName === flowName;
    });

    if (Object.keys(filteredaArray).length > 1) {
      const filteredaArrayAux = filteredaArray.filter(obj => {
        return obj.checked === true && obj.stepNumber !== -1;
      });

      if (Object.keys(filteredaArrayAux).length >= 1) {
        filteredaArrayAux.forEach((element) => {

          if (element.stepId === flowName + "_" + step?.stepName + "_" + step?.stepDefinitionType.toLowerCase() &&/* step.checked === true&&*/  element.stepNumber !== -1) {
            disabledCheck = false;
            return false;
          } else {
            disabledCheck = true;
            return true;
          }
        });
      } else { disabledCheck = false; return false; }
    }
    return disabledCheck;
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

  const countLetters = (stepName) => {
    let letterCount = stepName?.replace(/\s+/g, "").length;
    return letterCount > 35;
  };

  const flowMenu = (flowName) => {
    return (
      <>
        <Dropdown.Header className="py-0 fs-6 mb-2 text-dark">{PopoverRunSteps.selectStepTitle}</Dropdown.Header>
        <hr />
        <div className={styles.divCheckAll}>
          <HCCheckbox
            id={"checkAll"}
            value={checkAll}
            checked={checkAll}
            handleClick={(event) => onCheckboxChange(event, "", "", "", flowName, "", "", true)}
            label={controlStepSelected(flowName) ? "Deselect All" : "Select All"}
          >
          </HCCheckbox>
        </div>
        {flowsDeepCopy.map((flow) => (
          flow.steps.sort((a, b) => a.stepDefinitionType?.toLowerCase()?.localeCompare(b.stepDefinitionType?.toLowerCase())),
          flow["name"] === flowName &&
          flow.steps.map((step, index) => (
            <>
              <div className={styles.titleTypeStep}>{handleTitleSteps(step?.stepDefinitionType?.toLowerCase())}</div>
              <div id={index} className={styles.divItem}>
                <HCTooltip text={step.stepDefinitionType.toLowerCase() === "ingestion" ? controlDisabled(step, flowName) ? RunToolTips.loadStepRunFlow : "" : ""} placement="left" id={`tooltip`}>
                  <div className="divCheckBoxStep">
                    <HCCheckbox
                      tooltip={step.stepName}
                      placementTooltip={"top"}
                      label={countLetters(step.stepName) ? step.stepName : undefined}
                      id={step.stepName}
                      value={step.stepName}
                      handleClick={(event) => onCheckboxChange(event, step.stepName, step.stepNumber, step.stepDefinitionType, flowName, step.stepId, step.sourceFormat)}
                      checked={selectedStepOptions[flowName + "_" + step.stepName + "_" + step.stepDefinitionType.toLowerCase()] ? true : false}
                      disabled={step.stepDefinitionType.toLowerCase() === "ingestion" ? controlDisabled(step, flowName) : false}
                      removeMargin={true}
                    >{step.stepName}
                    </HCCheckbox></div></HCTooltip>
              </div>
            </>
          ))))}
        <Dropdown.Header className="py-0 fs-6 mt-2 text-danger" style={{whiteSpace: "pre-line"}} id="errorMessageEmptySteps">{controlStepSelected(flowName) ? "" : PopoverRunSteps.selectOneStepError}</Dropdown.Header>
      </>
    );
  };

  const handleRunFlow = async (index, name) => {
    //setRunFlowClicked(true);
    const setKey = async () => {
      await setActiveKeys(`${index}`);
    };
    setRunningFlow(name);
    let flag = false;

    await selectedStepDetails.map(async step => {
      if (step.stepDefinitionType.toLowerCase() === "ingestion" && step.flowName === name && step.isChecked) {
        flag = true;
        setRunningStep(step);
        setSingleIngest(false);
        await setKey();
        await openFilePicker();
      }
    });
    if (Object.keys(selectedStepOptions).length === 0 && selectedStepOptions.constructor === Object) {
      flag = true;
      await setKey();
      await openFilePicker();
    }
    if (!flag) {
      let stepNumbers = [{}];
      stepNumbers = selectedStepDetails.filter(function (obj) {
        return obj.flowName === name && obj.isChecked === true;
      });
      await runFlowSteps(name, stepNumbers)
        .then(() => {
          // setSelectedStepOptions({});
          // setSelectedStepDetails([{stepName: "", stepNumber: -1, stepDefinitionType: "", isChecked: false}]);
          // setArrayLoadChecksSteps([{flowName: "", stepNumber: -1}]);
        });
    }
    saveLocalStoragePreferences(false, true);
  };

  const stepMenu = (flowName, i) => (
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

  const showStopButton = (flowName: string): boolean => {
    if (!flowRunning) return false;
    return (isStepRunning && flowRunning.name === flowName);
  };

  const panelActions = (name, i) => (
    <div
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
      <span id="stepsDropdown" className={styles.hoverColor} onMouseLeave={(e) => { setCurrentTooltip(""); }}>
        <Dropdown as={ButtonGroup}>
          <HCTooltip show={currentTooltip === name} text={isFlowEmpty(name) ? RunToolTips.runEmptyFlow : !controlStepSelected(name) ? RunToolTips.selectAStep : ""} placement="top" id={`run-flow-tooltip`}>
            <span onMouseEnter={(e) => { !controlStepSelected(name) || isFlowEmpty(name) ? setCurrentTooltip(name) : void 0; }} onMouseLeave={(e) => { !isFlowEmpty(name) ? setCurrentTooltip("") : void 0; }} id={`${name}`}>
              <HCButton
                variant="transparent"
                className={styles.runFlow}
                key={`stepsDropdownButton-${name}`}
                data-testid={`runFlow-${name}`}
                id={`runFlow-${name}`}
                size="sm"
                onClick={() => handleRunFlow(i, name)}
                disabled={!controlStepSelected(name) || flowsDeepCopy.filter((flow) => flow.name === name)[0]?.steps?.length < 1}
              >
                <><PlayCircleFill className={styles.runIcon} /> Run Flow </>
              </HCButton>
            </span>
          </HCTooltip>
          <Dropdown.Toggle split variant="transparent" className={styles.runIconToggle} disabled={isFlowEmpty(name) ? true : false}>
            <GearFill className={styles.runIcon} role="step-settings button" aria-label={`stepSettings-${name}`} />
          </Dropdown.Toggle>
          <Dropdown.Menu className={styles.dropdownMenu}>
            {flowMenu(name)}
          </Dropdown.Menu>
        </Dropdown>
      </span>
      {stepMenu(name, i)}
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
    </div>
  );

  const flowHeader = (name, index) => (
    <span id={"flow-header-" + name} className={styles.flowHeader}>
      <HCTooltip text={canWriteFlow ? RunToolTips.flowEdit : RunToolTips.flowDetails} id="open-edit-tooltip" placement="bottom">
        <span className={styles.flowName} onClick={(e) => OpenEditFlowDialog(e, index)}>
          {name}
        </span>
      </HCTooltip>
      {latestJobData && latestJobData[name] && latestJobData[name].find(step => step.jobId) ?
        <HCTooltip text={RunToolTips.flowName} placement="bottom" id="">
          <span onClick={(e) => OpenFlowJobStatus(e, index, name)} className={styles.infoIcon} data-testid={`${name}-flow-status`}>
            <FontAwesomeIcon icon={faInfoCircle} size="1x" aria-label="icon: info-circle" className={styles.flowStatusIcon} />
          </span>
        </HCTooltip>
        : ""
      }
    </span>
  );
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

  const StepDefToTitle = (stepDef) => {
    return (StepDefinitionTypeTitles[stepDef]) ? StepDefinitionTypeTitles[stepDef] : "Unknown";
  };

  const customRequest = async () => {
    const filenames = fileList.map(({name}) => name);
    if (filenames.length) {
      let fl = fileList;
      const formData = new FormData();

      fl.forEach(file => {
        formData.append("files", file);
      });

      if (singleIngest) {
        await runStep(runningFlow, runningStep, formData)
          .then(resp => {
            setShowUploadError(true);
            setFileList([]);
          });
      } else {
        let stepNumbers = [{}];

        stepNumbers = selectedStepDetails.filter(function (obj) {
          return obj.flowName === runningFlow && obj.isChecked === true;
        });

        await runFlowSteps(runningFlow, stepNumbers, formData)
          .then(resp => {
            setShowUploadError(true);
            setFileList([]);
            // setSelectedStepOptions({});
            // setSelectedStepDetails([{stepName: "", stepNumber: -1, stepDefinitionType: "", isChecked: false}]);
            // setArrayLoadChecksSteps([{flowName: "", stepNumber: -1}]);
            //setRunFlowClicked(false);
          });
      }
    }
  };

  const isRunning = (flowId, stepId) => {
    let result = flowRunning.steps?.find(r => (flowRunning.name === flowId && r.stepId === stepId));
    return result !== undefined;
  };

  const handleMouseOver = (e, name) => {
    setShowLinks(name);
  };
  const lastRunResponse = (step, flow) => {
    let stepEndTime;
    if (step.stepEndTime) {
      stepEndTime = new Date(step.stepEndTime).toLocaleString();
    }

    let canceled = latestJobData[flow]?.some(function (stepObj) {
      return stepObj.lastRunStatus?.includes("canceled");
    });

    if (!step.lastRunStatus && !canceled) {
      return null;
    }

    if (isRunning(flowName, stepNumber)) {
      return (
        <HCTooltip text={RunToolTips.stepRunning} id="running-tooltip" placement="bottom">
          <span>
            <i><FontAwesomeIcon aria-label="icon: clock-circle" icon={faClock} className={styles.runningIcon} size="lg" data-testid={`running-${step.stepName}`} /></i>
          </span>
        </HCTooltip>
      );
    } else if (step.lastRunStatus?.includes("canceled") || (!step.lastRunStatus && canceled)) {
      return (
        <span>
          <HCTooltip text={RunToolTips.stepCanceled(stepEndTime)} id="canceled-tooltip" placement="bottom">
            <span>
              <i><FontAwesomeIcon icon={faBan} aria-label="icon: canceled-circle" className={styles.canceledRun} /></i>
            </span>
          </HCTooltip>
        </span>
      );
    } else if (step.lastRunStatus === "completed step " + step.stepNumber) {
      return (
        <HCTooltip text={RunToolTips.stepCompleted(stepEndTime)} id="success-tooltip" placement="bottom">
          <span>
            <i><FontAwesomeIcon aria-label="icon: check-circle" icon={faCheckCircle} className={styles.successfulRun} size="lg" data-testid={`check-circle-${step.stepName}`} /></i>
          </span>
        </HCTooltip>
      );

    } else if (step.lastRunStatus === "completed with errors step " + step.stepNumber) {
      return (
        <span>
          <HCTooltip text={RunToolTips.stepCompletedWithErrors(stepEndTime)} id="complete-with-errors-tooltip" placement="bottom">
            <ExclamationCircleFill aria-label="icon: exclamation-circle" className={styles.unSuccessfulRun} />
          </HCTooltip>
        </span>
      );
    } else {
      return (
        <span>
          <HCTooltip text={RunToolTips.stepFailed(stepEndTime)} id="step-last-failed-tooltip" placement="bottom">
            <XCircleFill data-icon="failed-circle" aria-label="icon: failed-circle" className={styles.unSuccessfulRun} />
          </HCTooltip>
        </span>
      );
    }
  };

  const resetSelectedFlow = (flowName) => {
    let arrayObjectsStepDetails = selectedStepDetails;
    const arrayObjectsStepDetailsAux = arrayObjectsStepDetails.reduce((acc, el) => {
      if (el.flowName === flowName) {
        return acc;
      }
      acc.push(el);
      return acc;
    }, []);

    let arrayObjectsLoadChecksSteps = arrayLoadChecksSteps;
    for (let i = 0; i < arrayObjectsLoadChecksSteps?.length; i++) {
      if (arrayObjectsLoadChecksSteps[i]?.flowName === flowName?.trim()) {
        arrayObjectsLoadChecksSteps.splice(i, 1);
      }
    }

    let arraySelectedStepOptions = selectedStepOptions;
    for (let key in arraySelectedStepOptions) if (key.startsWith(flowName + "_")) delete arraySelectedStepOptions[key];

    setSelectedStepDetails(arrayObjectsStepDetailsAux);
    setArrayLoadChecksSteps(arrayObjectsLoadChecksSteps);
    setSelectedStepOptions(arraySelectedStepOptions);
  };

  const reorderFlow = (id, flowName, direction: ReorderFlowOrderDirection) => {
    let flowNum = flows.findIndex((flow) => flow.name === flowName);
    let flowDesc = flows[flowNum]["description"];
    const stepList = flows[flowNum]["steps"];
    let newSteps = stepList;

    if (direction === ReorderFlowOrderDirection.RIGHT) {
      if (id <= stepList.length - 2) {
        newSteps = [...stepList];
        const oldLeftStep = newSteps[id];
        const oldRightStep = newSteps[id + 1];
        newSteps[id] = oldRightStep;
        newSteps[id + 1] = oldLeftStep;
      }
    } else {
      if (id >= 1) {
        newSteps = [...stepList];
        const oldLeftStep = newSteps[id - 1];
        const oldRightStep = newSteps[id];
        newSteps[id - 1] = oldRightStep;
        newSteps[id] = oldLeftStep;
      }
    }

    let steps: string[] = [];
    for (let i = 0; i < newSteps.length; i++) {
      newSteps[i].stepNumber = String(i + 1);
      steps.push(newSteps[i].stepId);
    }

    resetSelectedFlow(flowName);
    saveLocalStoragePreferences(true, true);

    const reorderedList = [...newSteps];
    onReorderFlow(flowNum, reorderedList);
    updateFlow(flowName, flowDesc, steps);

  };


  const getFlowWithJobInfo = async (flowNum) => {
    let currentFlow = flows[flowNum];

    if (currentFlow === undefined) {
      return;
    }

    if (currentFlow["steps"].length > 0) {
      try {
        let response = await axios.get("/api/flows/" + currentFlow.name + "/latestJobInfo");
        if (response.status === 200 && response.data) {
          let currentFlowJobInfo = {};
          currentFlowJobInfo[currentFlow["name"]] = response.data["steps"];
          setLatestJobData(prevJobData => (
            {...prevJobData, ...currentFlowJobInfo}
          ));
        }
      } catch (error) {
        console.error("Error getting latest job info ", error);
      }
    }
  };

  let panels;

  if (flows) {
    panels = flows.map((flow, i) => {
      let flowName = flow.name;
      let cards = flow.steps.map((step, index) => {
        let sourceFormat = step.sourceFormat;
        let stepNumber = step.stepNumber;
        let viewStepId = `${flowName}-${stepNumber}`;
        let stepDefinitionType = step.stepDefinitionType ? step.stepDefinitionType.toLowerCase() : "";
        let stepDefinitionTypeTitle = StepDefinitionTypeTitles[stepDefinitionType];
        return (
          <div key={viewStepId} id="flowSettings">
            <HCCard
              className={styles.cardStyle}
              title={StepDefToTitle(step.stepDefinitionType)}
              actions={[
                <div className={styles.reorder}>
                  {index !== 0 && canWriteFlow &&
                    <div className={styles.reorderLeft}>
                      <HCTooltip text={RunToolTips.moveLeft} id="move-left-tooltip" placement="bottom">
                        <i>
                          <FontAwesomeIcon
                            aria-label={`leftArrow-${step.stepName}`}
                            icon={faArrowAltCircleLeft}
                            className={styles.reorderFlowLeft}
                            role="button"
                            onClick={() => reorderFlow(index, flowName, ReorderFlowOrderDirection.LEFT)}
                            onKeyDown={(e) => reorderFlowKeyDownHandler(e, index, flowName, ReorderFlowOrderDirection.LEFT)}
                            tabIndex={0} />
                        </i>
                      </HCTooltip>
                    </div>
                  }
                  <div className={styles.reorderRight}>
                    <div className={styles.stepResponse}>
                      {latestJobData && latestJobData[flowName] && latestJobData[flowName][index]
                        ? lastRunResponse(latestJobData[flowName][index], flowName)
                        : ""
                      }
                    </div>
                    {index < flow.steps.length - 1 && canWriteFlow &&
                      <HCTooltip aria-label="icon: right" text="Move right" id="move-right-tooltip" placement="bottom" >
                        <i>
                          <FontAwesomeIcon
                            aria-label={`rightArrow-${step.stepName}`}
                            icon={faArrowAltCircleRight}
                            className={styles.reorderFlowRight}
                            role="button"
                            onClick={() => reorderFlow(index, flowName, ReorderFlowOrderDirection.RIGHT)}
                            onKeyDown={(e) => reorderFlowKeyDownHandler(e, index, flowName, ReorderFlowOrderDirection.RIGHT)}
                            tabIndex={0} />
                        </i>
                      </HCTooltip>
                    }
                  </div>
                </div>
              ]}
              titleExtra={
                <div className={styles.actions}>
                  {hasOperatorRole ?
                    step.stepDefinitionType.toLowerCase() === "ingestion" ?
                      <div {...getRootProps()} style={{display: "inline-block"}}>
                        <input {...getInputProps()} id="fileUpload" />
                        <div
                          className={styles.run}
                          aria-label={`runStep-${step.stepName}`}
                          data-testid={"runStep-" + stepNumber}
                          onClick={() => {
                            setShowUploadError(false);
                            setSingleIngest(true);
                            setRunningStep(step);
                            setRunningFlow(flowName);
                            openFilePicker();
                          }}
                        >
                          <HCTooltip text={RunToolTips.ingestionStep} id="run-ingestion-tooltip" placement="bottom">
                            <PlayCircleFill aria-label="icon: play-circle" color={themeColors.defaults.questionCircle} size={20} />
                          </HCTooltip>
                        </div>
                      </div>
                      :
                      <div
                        className={styles.run}
                        onClick={() => {
                          setShowUploadError(false);
                          runStep(flowName, step);
                        }}
                        aria-label={`runStep-${step.stepName}`}
                        data-testid={"runStep-" + stepNumber}
                      >
                        <HCTooltip text={RunToolTips.otherSteps} id="run-tooltip" placement="bottom">
                          <PlayCircleFill aria-label="icon: play-circle" color={themeColors.defaults.questionCircle} size={20} />
                        </HCTooltip>
                      </div>
                    :
                    <div
                      className={styles.disabledRun}
                      onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}
                      aria-label={"runStepDisabled-" + step.stepName}
                      data-testid={"runStepDisabled-" + stepNumber}
                    >
                      <PlayCircleFill size={20} />
                    </div>
                  }
                  {canWriteFlow ?
                    <HCTooltip text={RunToolTips.removeStep} id="delete-step-tooltip" placement="bottom">
                      <div className={styles.delete} aria-label={`deleteStep-${step.stepName}`} onClick={() => handleStepDelete(flowName, step)}>
                        <X aria-label="icon: close" color={themeColors.primary} size={27} />
                      </div>
                    </HCTooltip> :
                    <HCTooltip text={RunToolTips.removeStep} id="delete-step-tooltip" placement="bottom">
                      <div className={styles.disabledDelete} aria-label={`deleteStepDisabled-${step.stepName}`} onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
                        <X aria-label="icon: close" color={themeColors.primary} size={27} />
                      </div>
                    </HCTooltip>
                  }
                </div>
              }
              footerClassName={styles.cardFooter}
            >
              <div aria-label={viewStepId + "-content"} className={styles.cardContent}
                onMouseOver={(e) => handleMouseOver(e, viewStepId)}
                onMouseLeave={(e) => setShowLinks("")} >
                {sourceFormat ?
                  <div className={styles.format} style={sourceFormatStyle(sourceFormat)} >{sourceFormatOptions[sourceFormat].label}</div>
                  : null}
                <div className={sourceFormat ? styles.loadStepName : styles.name}>{step.stepName}</div>
                <div className={styles.cardLinks}
                  style={{display: showLinks === viewStepId && step.stepId && authorityByStepType[stepDefinitionType] ? "block" : "none"}}
                  aria-label={viewStepId + "-cardlink"}
                >
                  <Link id={"tiles-step-view-" + viewStepId}
                    to={{
                      pathname: `/tiles/${stepDefinitionType.toLowerCase() === "ingestion" ? "load" : "curate"}`,
                      state: {
                        stepToView: step.stepId,
                        stepDefinitionType: stepDefinitionType,
                        targetEntityType: step.targetEntityType
                      }
                    }}
                  >
                    <div className={styles.cardLink} data-testid={`${viewStepId}-viewStep`}>View {stepDefinitionTypeTitle} steps</div>
                  </Link>
                </div>
              </div>
              <div className={styles.uploadError}>
                {showUploadError && flowName === runningFlow && stepNumber === runningStep.stepNumber ? uploadError : ""}
              </div>
            </HCCard>
          </div>
        );
      });
      return (
        <Accordion className={"w-100"} flush key={i} id={flowName} activeKey={activeKeys.includes(i) ? i : ""} defaultActiveKey={activeKeys.includes(i) ? i : ""}>
          <Accordion.Item eventKey={i}>
            <Card>
              <Card.Header className={"p-0 pe-3 d-flex bg-white"}>
                <Accordion.Button data-testid={`accordion-${flowName}`} onClick={() => handlePanelInteraction(i)}>{flowHeader(flowName, i)}</Accordion.Button>
                {panelActions(flowName, i)}
              </Card.Header>
              <Accordion.Body className={styles.panelContent} ref={flowPanels[flowName]}>
                {cards}
              </Accordion.Body>
            </Card>
          </Accordion.Item>
        </Accordion>
      );
    });
  }

  //Update activeKeys on Collapse Panel interactions
  const handlePanelInteraction = (key) => {
    const tmpActiveKeys = [...activeKeys];
    const index = tmpActiveKeys.indexOf(key);
    index !== -1 ? tmpActiveKeys.splice(index, 1) : tmpActiveKeys.push(key);
    /* Request to get latest job info for the flow will be made when someone opens the pane for the first time
        or opens a new pane. Closing the pane shouldn't send any requests*/
    if (!activeKeys || (tmpActiveKeys.length > activeKeys.length && tmpActiveKeys.length > 0)) {
      getFlowWithJobInfo(tmpActiveKeys[tmpActiveKeys.length - 1]);
    }
    setActiveKeys([...tmpActiveKeys]);
  };

  const createFlowKeyDownHandler = (event) => {
    if (event.key === "Enter") {
      OpenAddNewDialog();
      event.preventDefault();
    }
  };

  const reorderFlowKeyDownHandler = (event, index, flowName, direction) => {
    if (event.key === "Enter") {
      reorderFlow(index, flowName, direction);
      event.preventDefault();
    }
  };

  return (
    <div id="flows-container" className={styles.flowsContainer}>
      {canReadFlow || canWriteFlow ?
        <>
          <div className={styles.createContainer}>
            {
              canWriteFlow ?
                <span>
                  {/* //Bootstrap Button
                  <Button
                    variant="primary"
                    onClick={OpenAddNewDialog}
                    onKeyDown={createFlowKeyDownHandler}
                    aria-label={"create-flow"}
                    tabIndex={0}
                  >Create Flow</Button> */}
                  <HCButton
                    className={styles.createButton}
                    variant="primary" onClick={OpenAddNewDialog} onKeyDown={createFlowKeyDownHandler}
                    aria-label={"create-flow"}
                    tabIndex={0}
                  >Create Flow</HCButton>
                </span>
                :
                <HCTooltip id="missing-permission-tooltip" placement="top" text={SecurityTooltips.missingPermission} className={styles.tooltipOverlay}>
                  <span className={styles.disabledCursor}>
                    <HCButton
                      className={styles.createButtonDisabled}
                      variant="primary"
                      disabled={true}
                      aria-label={"create-flow-disabled"}
                      tabIndex={-1}
                    >Create Flow</HCButton>
                  </span>
                </HCTooltip>
            }
          </div>
          {panels}
          <NewFlowDialog
            newFlow={newFlow || openNewFlow}
            title={title}
            setNewFlow={setNewFlow}
            setAddedFlowName={setAddedFlowName}
            createFlow={createFlow}
            createAdd={createAdd}
            updateFlow={updateFlow}
            flowData={flowData}
            canWriteFlow={canWriteFlow}
            addStepToFlow={addStepToFlow}
            newStepToFlowOptions={newStepToFlowOptions}
            setOpenNewFlow={setOpenNewFlow}
          />
          {deleteConfirmation}
          {deleteStepConfirmation}
          {addStepConfirmation}
          {addExistingStepConfirmation}
        </> :
        <div></div>
      }
    </div>
  );
};

export default Flows;