import React, {useState, useEffect} from "react";
import {Modal, Tabs, Tooltip} from "antd";
import CreateEditLoad from "../load/create-edit-load/create-edit-load";
import CreateEditStep from "../entities/create-edit-step/create-edit-step";
import AdvancedSettings from "../advanced-settings/advanced-settings";
import ConfirmYesNo from "../common/confirm-yes-no/confirm-yes-no";
import styles from "./steps.module.scss";
import "./steps.scss";
import {StepType} from "../../types/curation-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt} from "@fortawesome/free-solid-svg-icons";
import {ErrorTooltips} from "../../config/tooltips.config";

const {TabPane} = Tabs;

interface Props {
    isEditing: boolean;
    createStep?: any;
    updateStep?: any;
    stepData: any;
    sourceDatabase?: any;
    canReadWrite: any;
    canReadOnly: any;
    tooltipsData: any;
    openStepSettings: any;
    setOpenStepSettings: any;
    activityType: string;
    canWrite?: any;
    targetEntityType?: any;
    targetEntityName?: any;
    toggleModal?: any;
    openStepDetails?: any;
}

const DEFAULT_TAB = "1";

const Steps: React.FC<Props> = (props) => {
  const [currentTab, setCurrentTab] = useState(DEFAULT_TAB);
  const [isValid, setIsValid] = useState(true);
  const [hasBasicChanged, setHasBasicChanged] = useState(false);
  const [hasAdvancedChanged, setHasAdvancedChanged] = useState(false);
  const [discardChangesVisible, setDiscardChangesVisible] = useState(false);

  const [basicPayload, setBasicPayload] = useState({});
  const [advancedPayload, setAdvancedPayload] = useState({});
  const [defaultCollections, setDefaultCollections] = useState<any[]>([]);

  // Adavnced settings needs step name (and target entity name for mapping) for default collections
  useEffect(() => {
    if (basicPayload["name"]) {
      if (props.activityType === StepType.Mapping && props.targetEntityName) {
        setDefaultCollections([basicPayload["name"], props.targetEntityName]);
      } else {
        setDefaultCollections([basicPayload["name"]]);
      }
    }
  }, [basicPayload]);

  const onCancel = () => {
    if (hasBasicChanged || hasAdvancedChanged) {
      setDiscardChangesVisible(true);
    } else {
      props.setOpenStepSettings(false);
      resetTabs();
    }
  };

  const discardOk = () => {
    setDiscardChangesVisible(false);
    props.setOpenStepSettings(false);
    resetTabs();
    setIsValid(true);
    setHasBasicChanged(false);
    setHasAdvancedChanged(false);
  };

  const discardCancel = () => {
    setDiscardChangesVisible(false);
  };

  const discardChanges = <ConfirmYesNo
    visible={discardChangesVisible}
    type="discardChanges"
    onYes={discardOk}
    onNo={discardCancel}
  />;

  const resetTabs = () => {
    setCurrentTab(DEFAULT_TAB);
  };

  const handleTabChange = (key) => {
    setCurrentTab(key);
  };

  const getStepPayload = (payload, newStepFlag?: boolean) => {
    // Combine current payload from saved payloads from both tabs, ensure name prop exists
    let name = basicPayload["name"] ? basicPayload["name"] : props.stepData.name;
    let targetFormat = props.activityType === "ingestion" ? basicPayload["targetFormat"] : advancedPayload["targetFormat"];
    if (props.activityType === "matching" || props.activityType === "merging") return Object.assign(newStepFlag ? {} : props.stepData, basicPayload, advancedPayload, payload, {name: name}, {targetFormat: targetFormat}, {targetEntityType: props.targetEntityName});
    else return Object.assign(newStepFlag ? {} : props.stepData, basicPayload, advancedPayload, payload, {name: name}, {targetFormat: targetFormat});
  };

  const createStep = async (payload) => {
    await props.createStep(getStepPayload(payload, true));
    setHasBasicChanged(false);
    setHasAdvancedChanged(false);
  };

  const updateStep = async (payload) => {
    await props.updateStep(getStepPayload(payload));
    setHasBasicChanged(false);
    setHasAdvancedChanged(false);
  };

  const createEditDefaults = {
    tabKey: "1",
    openStepSettings: props.openStepSettings,
    setOpenStepSettings: props.setOpenStepSettings,
    canReadWrite: props.canReadWrite,
    canReadOnly: props.canReadOnly,
    currentTab: currentTab,
    setIsValid: setIsValid,
    resetTabs: resetTabs,
    setHasChanged: setHasBasicChanged,
    setPayload: setBasicPayload,
    onCancel: onCancel
  };

  const createEditLoad = (<CreateEditLoad
    {...createEditDefaults}
    isEditing={props.isEditing}
    createLoadArtifact={createStep}
    updateLoadArtifact={updateStep}
    stepData={props.stepData}
  />);

  const createEditMapping = (<CreateEditStep
    {...createEditDefaults}
    isEditing={props.isEditing}
    editStepArtifactObject={props.stepData}
    stepType={StepType.Mapping}
    targetEntityType={props.targetEntityType}
    createStepArtifact={createStep}
    updateStepArtifact={updateStep}
  />);

  const createEditMatching = (<CreateEditStep
    {...createEditDefaults}
    isEditing={props.isEditing}
    editStepArtifactObject={props.stepData}
    stepType={StepType.Matching}
    targetEntityType={props.targetEntityType}
    createStepArtifact={createStep}
    updateStepArtifact={updateStep}
  />);

  const createEditMerging = (<CreateEditStep
    {...createEditDefaults}
    isEditing={props.isEditing}
    editStepArtifactObject={props.stepData}
    stepType={StepType.Merging}
    targetEntityType={props.targetEntityType}
    createStepArtifact={createStep}
    updateStepArtifact={updateStep}
  />);

  const viewCustom = (<CreateEditStep
    {...createEditDefaults}
    isEditing={props.isEditing}
    editStepArtifactObject={props.stepData}
    stepType={StepType.Custom}
    targetEntityType={props.targetEntityType}
    createStepArtifact={() => {} /** custom steps cannot be created through hub central */}
    updateStepArtifact={updateStep}
  />);

  const getCreateEditStep = (activityType) => {
    if (activityType === "ingestion") {
      return createEditLoad;
    } else if (activityType === StepType.Mapping) {
      return createEditMapping;
    } else if (activityType === StepType.Matching) {
      return createEditMatching;
    } else if (activityType === StepType.Merging) {
      return createEditMerging;
    } else {
      return viewCustom;
    }
  };

  const getTitle = () => {
    let activity;
    switch (props.activityType) {
    case "ingestion":
      if (props.stepData.stepDefinitionName && props.stepData.stepDefinitionName !== "default-ingestion") {
        activity = "Custom";
      } else {
        activity = "Loading";
      }
      break;
    case StepType.Mapping: activity = "Mapping";
      break;
    case StepType.Matching: activity = "Matching";
      break;
    case StepType.Merging: activity = "Merging";
      break;
    default: activity = "Custom";
    }
    return !props.isEditing ? "New " + activity + " Step" : activity + " Step Settings";
  };

  const handleStepDetails = (name) => {
    onCancel();
    props.openStepDetails(name);
  };

  return <Modal
    visible={props.openStepSettings}
    title={null}
    width="700px"
    onCancel={() => onCancel()}
    className={styles.StepsModal}
    footer={null}
    maskClosable={false}
    destroyOnClose={true}
  >
    <div aria-label="steps" id="stepSettings" className={styles.stepsContainer}>
      <header>
        <div className={styles.title}>{getTitle()}</div>
      </header>
      <div className={styles.tabs}>
        <Tabs activeKey={currentTab} defaultActiveKey={DEFAULT_TAB} size={"large"} onTabClick={handleTabChange} animated={false} tabBarGutter={10}>

          <TabPane tab={(
            <Tooltip getPopupContainer={() => document.getElementById("stepSettings") || document.body}
              className={"basicTooltip"} style={ {wordBreak: "break-all"} }
              title={(!isValid && currentTab !== "1") ? ErrorTooltips.disabledTab : null} placement={"bottom"}>Basic</Tooltip>
          )} key="1" disabled={!isValid && currentTab !== "1"}>
            {getCreateEditStep(props.activityType)}
          </TabPane>
          <TabPane tab={(
            <Tooltip getPopupContainer={() => document.getElementById("stepSettings") || document.body}
              className={"advTooltip"} style={ {wordBreak: "break-all"} }
              title={(!isValid && currentTab !== "2") ? ErrorTooltips.disabledTab : null} placement={"bottom"}>Advanced</Tooltip>
          )} key="2" disabled={!isValid && currentTab !== "2"} forceRender={true}>
            <AdvancedSettings
              tabKey="2"
              tooltipsData={props.tooltipsData}
              isEditing={props.isEditing}
              openStepSettings={props.openStepSettings}
              setOpenStepSettings={props.setOpenStepSettings}
              stepData={props.stepData}
              updateStep={updateStep}
              activityType={props.activityType}
              canWrite={props.canWrite}
              currentTab={currentTab}
              setIsValid={setIsValid}
              resetTabs={resetTabs}
              setHasChanged={setHasAdvancedChanged}
              setPayload={setAdvancedPayload}
              createStep={createStep}
              onCancel={onCancel}
              defaultCollections={defaultCollections}
            />
          </TabPane>
        </Tabs>
      </div>
      {/* Step Details link for Mapping steps */}
      { (props.isEditing && props.activityType === StepType.Mapping) ?
        <div className={styles.stepDetailsLink} onClick={() => handleStepDetails(props.stepData.name)}>
          <FontAwesomeIcon icon={faPencilAlt} aria-label={"stepDetails"}/>
          <span className={styles.stepDetailsLabel}>Step Details</span>
        </div> : null }
      {discardChanges}
    </div>
  </Modal>;
};

export default Steps;
