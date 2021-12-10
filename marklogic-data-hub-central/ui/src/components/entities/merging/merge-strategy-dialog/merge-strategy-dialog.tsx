import {
  Modal,
  Form,
  Icon, Input, Radio, Switch
} from "antd";
import React, {useState, useEffect, useContext} from "react";
import styles from "./merge-strategy-dialog.module.scss";
import {MLButton, MLTooltip, MLSelect} from "@marklogic/design-system";
import {CurationContext} from "../../../../util/curation-context";
import {MergeRuleTooltips, multiSliderTooltips, MergingStepTooltips} from "../../../../config/tooltips.config";
import {addSliderOptions, parsePriorityOrder, handleDeleteSliderOptions} from "../../../../util/priority-order-conversion";
import {MergingStep, defaultPriorityOption} from "../../../../types/curation-types";
import {updateMergingArtifact} from "../../../../api/merging";
import ConfirmYesNo from "../../../common/confirm-yes-no/confirm-yes-no";
import moment from "moment";
import TimelineVis from "../../matching/matching-step-detail/timeline-vis/timeline-vis";
import TimelineVisDefault from "../../matching/matching-step-detail/timeline-vis-default/timeline-vis-default";
import MergeDeleteModal from "../merge-delete-modal/merge-delete-modal";


type Props = {
    sourceNames: string[];
    strategyName: string;
    createEditMergeStrategyDialog: boolean;
    setOpenEditMergeStrategyDialog: (createEditMergeStrategyDialog: boolean) => void;
    isEditStrategy: boolean;
    toggleIsEditStrategy: (isEditStrategy:boolean) => void;
};

const {MLOption} = MLSelect;

const MergeStrategyDialog: React.FC<Props> = (props) => {

  const {curationOptions, updateActiveStepArtifact} = useContext(CurationContext);
  const [strategyName, setStrategyName] = useState("");
  const [strategyNameTouched, setStrategyNameTouched] = useState(false);
  const [radioSourcesOptionClicked, setRadioSourcesOptionClicked] = useState(1);
  const [radioValuesOptionClicked, setRadioValuesOptionClicked] = useState(1);
  const [radioDefaultOptionClicked, setRadioDefaultOptionClicked] = useState(1);
  const [maxValues, setMaxValues] = useState<any>("");
  const [maxValuesTouched, setMaxValuesTouched] = useState(false);
  const [maxSources, setMaxSources] = useState<any>("");
  const [maxSourcesTouched, setMaxSourcesTouched] = useState(false);
  const [defaultStrategyTouched, setDefaultStrategyTouched] = useState(false);
  const [priorityOrderTouched, setPriorityOrderTouched] = useState(false);
  const [isCustomStrategy, setIsCustomStrategy] = useState(false);
  const [deleteModalVisibility, toggleDeleteModalVisibility] = useState(false);
  const [priorityOrderOptions, setPriorityOrderOptions] = useState<any>([defaultPriorityOption]);
  const [strategyNameErrorMessage, setStrategyNameErrorMessage] = useState("");
  const [defaultStrategyErrorMessage, setDefaultStrategyErrorMessage] = useState<any>();
  const [dropdownOption, setDropdownOption] = useState("Length");
  const [dropdownOptionTouched, setDropdownOptionTouched] = useState(false);
  const [discardChangesVisible, setDiscardChangesVisible] = useState(false);
  const [displayPriorityOrderTimeline, toggleDisplayPriorityOrderTimeline] = useState(false);
  const [priorityOptions, setPriorityOptions] = useState<any>();
  const [deletePriorityName, setDeletePriorityName] = useState("");

  const dropdownTypes = ["Length"].concat(props.sourceNames);
  const dropdownTypeOptions = dropdownTypes.map(elem => <MLOption data-testid={`dropdownTypeOptions-${elem}`} key={elem}>{elem}</MLOption>);

  const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 20},
  };

  const handleChange = (event) => {
    if (event.target.id === "strategy-name") {
      if (event.target.value === " ") {
        setStrategyNameTouched(false);
      } else {
        setStrategyNameTouched(true);
        setStrategyName(event.target.value);
      }
    }
    if (event.target.id === "maxSourcesStrategyInput") {
      setMaxSources(event.target.value);
      setRadioSourcesOptionClicked(2);
    }
    if (event.target.id === "maxValuesStrategyInput") {
      setMaxValues(event.target.value);
      setRadioValuesOptionClicked(2);
    }
    if (event.target.name === "defaultYesNo") {
      setDefaultStrategyTouched(true);
      if (radioDefaultOptionClicked === 2) {
        let defaultStrategy = checkExistingDefaultStrategy();
        if (defaultStrategy) {
          displayErrorMessage(defaultStrategy);
        } else {
          setRadioDefaultOptionClicked(event.target.value);
        }
      } else {
        setRadioDefaultOptionClicked(event.target.value);
      }
    }
    if (event.target.name === "maxSources") {
      setMaxSourcesTouched(true);
      setRadioSourcesOptionClicked(event.target.value);
      if (event.target.value === 1) {
        setMaxSources("");
      }
    }
    if (event.target.name === "maxValues") {
      setMaxValuesTouched(true);
      setRadioValuesOptionClicked(event.target.value);
      if (event.target.value === 1) {
        setMaxValues("");
      }
    }
  };

  const displayErrorMessage = (strategy) => {
    const defaultStrategyErrorMsg = <span aria-label="default-strategy-error">The default strategy is already set to <strong>{strategy}</strong>. You must first go to that strategy and unselect it as a default.</span>;
    setDefaultStrategyErrorMessage(defaultStrategyErrorMsg);
  };

  const checkExistingDefaultStrategy = () => {
    let strategies = curationOptions.activeStep.stepArtifact.mergeStrategies;
    let existingDefault;
    if (strategies) {
      strategies.map((obj) => {
        if (obj.hasOwnProperty("default") && obj.default === true && !(props.isEditStrategy && obj.strategyName === strategyName)) {
          existingDefault = obj.strategyName;
        }
      });
      return existingDefault;
    } else {
      return;
    }
  };

  const handleDropDownOptions = (value) => {
    setDropdownOption(value);
    setDropdownOptionTouched(true);
  };

  const updateMergeRuleItems = async(id, newValue, priorityOrderOptions:any[]) => {
    let editPriorityName = id.split(":")[0];
    for (let priority of priorityOrderOptions) {
      let id2=priority.id;
      let priorityName  = id2.split(":")[0];
      if (priorityName === editPriorityName) {
        let name="";
        if (editPriorityName !== "Length" && editPriorityName !== "Timestamp") { name = priorityName + ":"+ parseInt(newValue); } else if (editPriorityName === "Length") { name =  "Length:" + parseInt(newValue); } else if (editPriorityName === "Timestamp") { name =  "Timestamp:0"; }
        priority.start=parseInt(newValue);
        priority.value= name;
      }
    }
    return priorityOrderOptions;
  };

  const renderPriorityOrderTimeline = () => {
    return <div data-testid={"active-priorityOrder-timeline"}><TimelineVis items={priorityOrderOptions} options={strategyOptions} clickHandler={onPriorityOrderTimelineItemClicked} borderMargin="14px"/></div>;
  };

  const renderDefaultPriorityOrderTimeline = () => {
    return <div data-testid={"default-priorityOrder-timeline"}><TimelineVisDefault items={priorityOrderOptions} options={strategyOptions} borderMargin="14px"/></div>;
  };

  const timelineOrder = (a, b) => {
    let aParts = a.value.split(":");
    let bParts = b.value.split(":");
    // If weights not equal
    if (bParts[bParts.length-1] !== aParts[aParts.length-1]) {
      // By weight
      return parseInt(bParts[bParts.length-1]) - parseInt(aParts[aParts.length-1]);
    } else {
      // Else alphabetically
      let aUpper = a.value.toUpperCase();
      let bUpper = b.value.toUpperCase();
      return (aUpper < bUpper) ? 1 : (aUpper > bUpper) ? -1 : 0;
    }
  };

  const strategyOptions:any = {
    max: 120,
    min: -20,
    start: -20,
    end: 120,
    width: "100%",
    itemsAlwaysDraggable: {
      item: displayPriorityOrderTimeline,
      range: displayPriorityOrderTimeline
    },
    selectable: false,
    editable: {
      remove: true,
      updateTime: true
    },
    moveable: false,
    timeAxis: {
      scale: "millisecond",
      step: 5
    },
    onMove: function(item, callback) {
      if (item.value.split(":")[0] !== "Timestamp") {
        setPriorityOrderTouched(true);
        if (item.start >= 0 && item.start <= 100) {
          item.value= getStrategyName(item);
          callback(item);
          updateMergeRuleItems(item.id, item.start.getMilliseconds().toString(), priorityOrderOptions);
        } else {
          if (item.start < 1) {
            item.start = 1;
            item.value = getStrategyName(item);
          } else {
            item.start = 100;
            item.value = getStrategyName(item);
          }
          callback(item);
          updateMergeRuleItems(item.id, item.start, priorityOrderOptions);
        }
        setPriorityOrderOptions(priorityOrderOptions);
      } else {
        item.start = 0;
        callback(item);
        updateMergeRuleItems("Timestamp:0", 0, priorityOrderOptions);
        setPriorityOrderOptions(priorityOrderOptions);
      }
    },
    format: {
      minorLabels: function (date, scale, step) {
        let time;
        if (date >= 0 && date <= 100) {
          time = date.format("SSS");
          return moment.duration(time).asMilliseconds();
        } else {
          return "";
        }
      },
    },
    template: function(item) {
      if (item && item.hasOwnProperty("value")) {
        return "<div data-testid=\"strategy"+" "+item.value.split(":")[0]+"\">" + item.value.split(":")[0] + "<div class=\"itemValue\">" + item.value.split(":")[1]+ "</div></div>";
      }
    },
    maxMinorChars: 4,
    order: timelineOrder
  };

  const confirmAction = () => {
    setPriorityOrderTouched(true);
    setPriorityOrderOptions(handleDeleteSliderOptions(priorityOptions, priorityOrderOptions));
    toggleDeleteModalVisibility(false);
  };

  const deletePriorityModal = (
    <MergeDeleteModal
      isVisible={deleteModalVisibility}
      toggleModal={toggleDeleteModalVisibility}
      confirmAction={confirmAction}
      deletePriorityName={deletePriorityName}
    />
  );

  const onPriorityOrderTimelineItemClicked = (event) => {
    if (event.item && event.item.split(":")[0] !== "Timestamp") {
      toggleDeleteModalVisibility(true);
      if (event.item.split(":")[0] === "Length") setDeletePriorityName("Length");
      else setDeletePriorityName(event.item.split(":")[0].split(" - ")[1]);
      setPriorityOptions(event);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let strategyNameErrorMessage = "";
    if (strategyName === "" || strategyName === undefined) {
      strategyNameErrorMessage = "Strategy name is required";
    }
    let newMergeStrategies = {};
    if (strategyName) {
      newMergeStrategies = {
        "strategyName": strategyName,
        "maxSources": maxSources ? maxSources : "All",
        "maxValues": maxValues ? maxValues : "All",
        "priorityOrder": parsePriorityOrder(priorityOrderOptions),
        "default": radioDefaultOptionClicked === 1 ? true : false
      };
      onSave(newMergeStrategies);
      props.setOpenEditMergeStrategyDialog(false);
    }
    setStrategyNameErrorMessage(strategyNameErrorMessage);
  };

  const onAddOptions =  () => {
    const data = (addSliderOptions(priorityOrderOptions, dropdownOption));
    priorityOrderOptions.map((option) => {
      if (option.id.split(":")[0] === "Length" && dropdownOption === "Length") {
        setPriorityOrderTouched(false);
      } else setPriorityOrderTouched(true);
    });
    setPriorityOrderOptions(data);
  };

  const getStrategyName = (item) => {
    let strategyName=item.value.split(":")[0];
    let startTime;
    if (item.start === 100 || item.start === 1) {
      startTime = item.start;
    } else {
      startTime = item.start.getMilliseconds().toString();
    }
    if ((strategyName !== "Length" && strategyName !== "Timestamp") && item.value.indexOf("Source - ") === -1) {
      item.value = "Source - " + strategyName + ":"+ startTime;
    } else {
      item.value = item.value.split(":")[0] + ":"+ startTime;
    }
    return item.value;
  };

  const onSave = async (newMergeStrategies) => {
    let newStepArtifact: MergingStep = curationOptions.activeStep.stepArtifact;
    let index = 0;
    while (index < (newStepArtifact.mergeStrategies.length)) {
      let key = newStepArtifact.mergeStrategies[index];
      if (key.strategyName === props.strategyName && props.isEditStrategy) {
        break;
      }
      index++;
    }
    // New Strategy
    if (index === newStepArtifact.mergeStrategies.length) {
      newStepArtifact.mergeStrategies.push(newMergeStrategies);
      await updateMergingArtifact(newStepArtifact);
      updateActiveStepArtifact(newStepArtifact);
      //resetModal();
    } else {
      // Edit strategy
      newStepArtifact.mergeStrategies[index] = newMergeStrategies;
      await updateMergingArtifact(newStepArtifact);
      updateActiveStepArtifact(newStepArtifact);
    }
    setDefaultStrategyErrorMessage("");
  };

  const onCancel = () => {
    if (hasFormChanged()) {
      setDiscardChangesVisible(true);
    } else {
      props.toggleIsEditStrategy(false);
      props.setOpenEditMergeStrategyDialog(false);
      resetModal();
    }
  };

  const hasFormChanged = () => {
    if (!dropdownOptionTouched
        && !strategyNameTouched
        && !defaultStrategyTouched
        && !priorityOrderTouched
        && !maxValuesTouched
        && !maxSourcesTouched
    ) {
      return false;
    } else {
      return true;
    }
  };

  const onOk = () => {
    props.setOpenEditMergeStrategyDialog(false);
  };

  const resetModal = () => {
    setDefaultStrategyErrorMessage("");
    setStrategyNameErrorMessage("");
    setPriorityOrderOptions([defaultPriorityOption]);
    setDropdownOption("Length");
    setRadioDefaultOptionClicked(2);
    setRadioValuesOptionClicked(1);
    setRadioSourcesOptionClicked(1);
    setMaxValues("");
    setMaxSources("");
    resetTouched();
  };

  const resetTouched = () => {
    setDiscardChangesVisible(false);
    setStrategyNameTouched(false);
    setMaxValuesTouched(false);
    setMaxSourcesTouched(false);
    setDropdownOptionTouched(false);
    setDefaultStrategyTouched(false);
    setPriorityOrderTouched(false);
  };

  const discardOk = () => {
    props.setOpenEditMergeStrategyDialog(false);
    resetModal();
    parsedEditedFormDetails(curationOptions.activeStep.stepArtifact);
  };

  const discardCancel = () => {
    resetTouched();
  };

  const discardChanges = <ConfirmYesNo
    visible={discardChangesVisible}
    type="discardChanges"
    onYes={discardOk}
    onNo={discardCancel}
    labelNo="DiscardChangesNoButton"
    labelYes="DiscardChangesYesButton"
  />;

  useEffect(() => {
    if (props.strategyName.length === 0) {
      setPriorityOrderOptions([defaultPriorityOption]);
      setStrategyName("");
    }
    if (props.isEditStrategy && props.strategyName.length) {
      setStrategyName(props.strategyName);
      parsedEditedFormDetails(curationOptions.activeStep.stepArtifact);
    }
    if (!props.isEditStrategy) {
      resetModal();
    }
    toggleDisplayPriorityOrderTimeline(false);
  }, [props.strategyName, curationOptions, props.isEditStrategy, props.sourceNames]);

  let priorityOrderStrategyOptions:any[] = [defaultPriorityOption];
  const parsedEditedFormDetails = (data) => {
    let mergeStrategiesData: any[]  = data.mergeStrategies;
    for (let key of mergeStrategiesData) {
      if (props.strategyName === key.strategyName) {
        if (key.hasOwnProperty("priorityOrder")) {
          for (let key1 of key.priorityOrder.sources) {
            const priorityOrderSourceObject = {
              id: "Source - " + key1.sourceName + ":" + key1.weight.toString(),
              start: key1.weight,
              value: "Source - "  +key1.sourceName + ":" + key1.weight.toString(),
            };
            priorityOrderStrategyOptions.push(priorityOrderSourceObject);
          }
          if (key.priorityOrder.hasOwnProperty("lengthWeight")) {
            const priorityOrderLengthObject = {
              id: "Length:" + key.priorityOrder.lengthWeight.toString(),
              value: "Length:"+  key.priorityOrder.lengthWeight.toString(),
              start: key.priorityOrder.lengthWeight,
            };
            priorityOrderStrategyOptions.push(priorityOrderLengthObject);
          }
          setPriorityOrderOptions(priorityOrderStrategyOptions);
          setIsCustomStrategy(false);
        } else {
          setIsCustomStrategy(true);
        }
        if (key.hasOwnProperty("maxValues")) {
          if (key.maxValues === "All") {
            setRadioValuesOptionClicked(1);
            setMaxValues("");
          } else {
            setRadioValuesOptionClicked(2);
            setMaxValues(key.maxValues);
          }
        }
        if (key.hasOwnProperty("maxSources")) {
          if (key.maxSources === "All") {
            setRadioSourcesOptionClicked(1);
            setMaxSources("");
          } else {
            setRadioSourcesOptionClicked(2);
            setMaxSources(key.maxSources);
          }
        }
        if (key.hasOwnProperty("default")) {
          if (key.default === true) {
            setRadioDefaultOptionClicked(1);
          } else {
            setRadioDefaultOptionClicked(2);
          }
        }
      }
    }
  };

  return (
    <Modal
      visible={props.createEditMergeStrategyDialog}
      title={props.isEditStrategy ? "Edit Strategy" : "Add Strategy"}
      width={1000}
      onCancel={() => onCancel()}
      onOk={() => onOk()}
      okText="Save"
      footer={null}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Form
        name="basic"
        {...layout}
      >
        <Form.Item
          colon={false}
          label={<span className={styles.text}>
                        Strategy Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
          </span>}
          labelAlign="left"
          validateStatus={strategyNameErrorMessage? "error" : ""}
          help={strategyNameErrorMessage}
        >
          <Input
            id="strategy-name"
            value={strategyName}
            placeholder={"Enter strategy name"}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item
          colon={false}
          label="Max Values:"
          labelAlign="left"
        >
          <Radio.Group  value={radioValuesOptionClicked} onChange={handleChange}  name={"maxValues"}>
            <Radio value={1} aria-label="maxValuesAllRadio"> All</Radio>
            <Radio value={2} aria-label="maxValuesOtherRadio"><Input id="maxValuesStrategyInput" value={maxValues} placeholder={"Enter max values"} onChange={handleChange} onClick={handleChange}></Input>
              <MLTooltip title={MergeRuleTooltips.maxValues}>
                <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
              </MLTooltip>
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          colon={false}
          label="Max Sources:"
          labelAlign="left"
        >
          <Radio.Group  value={radioSourcesOptionClicked} onChange={handleChange}  name={"maxSources"}>
            <Radio value={1} aria-label="maxSourcesAllRadio"> All</Radio>
            <Radio value={2} aria-label="maxSourcesOtherRadio"><Input id="maxSourcesStrategyInput" value={maxSources} onChange={handleChange} onClick={handleChange} placeholder={"Enter max sources"}></Input>
              <MLTooltip title={MergeRuleTooltips.maxSources}>
                <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
              </MLTooltip>
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          colon={false}
          label="Default Strategy?"
          validateStatus={defaultStrategyErrorMessage ? "error" : ""}
          help={defaultStrategyErrorMessage}
          labelAlign="left"
        >
          <Radio.Group  value={radioDefaultOptionClicked} onChange={handleChange}  name={"defaultYesNo"}>
            <Radio value={1} aria-label="defaultStrategyYes">Yes</Radio>
            <Radio value={2} aria-label="defaultStrategyNo">No</Radio>
          </Radio.Group>
        </Form.Item>
        {!isCustomStrategy && <div className={styles.priorityOrderContainer} data-testid={"prioritySlider"}>
          <div><p className={styles.priorityText}>Priority Order<MLTooltip title={multiSliderTooltips.priorityOrder} placement="right">
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip></p></div>
          <div className={styles.addButtonContainer}>
            <MLSelect
              id="dropdownOptions"
              placeholder=""
              size="default"
              value={dropdownOption}
              onChange={handleDropDownOptions}
              //disabled={!canWriteMatchMerge}
              className={styles.dropdownOptionsSelect}
              aria-label="dropdownOptions-select"
            >
              {dropdownTypeOptions}
            </MLSelect>
            <MLButton aria-label="add-slider-button" type="primary" size="default" className={styles.addSliderButton} onClick={onAddOptions}>Add</MLButton>
          </div>
          <div>
            <div><span className={styles.enableStrategySwitch}><b>Enable Priority Order Scale </b></span><Switch aria-label="mergeStrategy-scale-switch" defaultChecked={false} onChange={(e) => toggleDisplayPriorityOrderTimeline(e)}></Switch>
              <span>
                <MLTooltip title={MergingStepTooltips.strategyScale} id="priority-order-tooltip" placement="right">
                  <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                </MLTooltip>
              </span></div>
            {displayPriorityOrderTimeline ? renderPriorityOrderTimeline() : renderDefaultPriorityOrderTimeline()}
          </div>
        </div>}
        {deletePriorityModal}
        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <MLButton aria-label={"cancel-merge-strategy"} onClick={() => onCancel()}>Cancel</MLButton>&nbsp;&nbsp;
            <MLButton aria-label={"confirm-merge-strategy"} id={"saveButton"} type="primary" onClick={handleSubmit} >Save</MLButton>
          </div>
        </Form.Item>
      </Form>
      {discardChanges}
    </Modal>
  );
};

export default MergeStrategyDialog;
