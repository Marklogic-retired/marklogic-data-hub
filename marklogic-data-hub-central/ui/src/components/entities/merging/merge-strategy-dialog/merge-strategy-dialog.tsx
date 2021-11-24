import {Select, Switch} from "antd";
import {Row, Col, Modal, Form, FormLabel} from "react-bootstrap";
import React, {useState, useEffect, useContext} from "react";
import styles from "./merge-strategy-dialog.module.scss";
import {CurationContext} from "../../../../util/curation-context";
import {MergeRuleTooltips, multiSliderTooltips, MergingStepTooltips} from "../../../../config/tooltips.config";
import {addSliderOptions, parsePriorityOrder, handleDeleteSliderOptions} from "../../../../util/priority-order-conversion";
import {MergingStep, defaultPriorityOption} from "../../../../types/curation-types";
import {updateMergingArtifact} from "../../../../api/merging";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {ConfirmYesNo, HCInput, HCButton, HCTooltip} from "@components/common";
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
  toggleIsEditStrategy: (isEditStrategy: boolean) => void;
};

const {Option} = Select;

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
  const dropdownTypeOptions = dropdownTypes.map(elem => <Option data-testid={`dropdownTypeOptions-${elem}`} key={elem}>{elem}</Option>);

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
      setMaxSourcesTouched(true);
      setRadioSourcesOptionClicked(2);
    }
    if (event.target.id === "maxValuesStrategyInput") {
      setMaxValues(event.target.value);
      setMaxValuesTouched(true);
      setRadioValuesOptionClicked(2);
    }
    if (event.target.name === "defaultYesNo") {
      if (radioDefaultOptionClicked === 2) {
        let defaultStrategy = checkExistingDefaultStrategy();
        if (defaultStrategy) {
          displayErrorMessage(defaultStrategy);
        } else {
          setRadioDefaultOptionClicked(parseInt(event.target.value));
        }
      } else {
        setRadioDefaultOptionClicked(parseInt(event.target.value));
      }
    }
    if (event.target.name === "maxSources") {
      setRadioSourcesOptionClicked(parseInt(event.target.value));
      if (event.target.value === 1) {
        setMaxSources("");
      }
    }
    if (event.target.name === "maxValues") {
      setRadioValuesOptionClicked(parseInt(event.target.value));
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
    return <div data-testid={"active-priorityOrder-timeline"}><TimelineVis items={priorityOrderOptions} options={strategyOptions} clickHandler={onPriorityOrderTimelineItemClicked} /></div>;
  };

  const renderDefaultPriorityOrderTimeline = () => {
    return <div data-testid={"default-priorityOrder-timeline"}><TimelineVisDefault items={priorityOrderOptions} options={strategyOptions} /></div>;
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

  const onAddOptions = () => {
    const data = (addSliderOptions(priorityOrderOptions, dropdownOption));
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
      && (!maxValuesTouched || maxValues.length === 0)
      && (!maxSourcesTouched || maxSources.length === 0)
    ) {
      return false;
    } else {
      return true;
    }
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

  let priorityOrderStrategyOptions: any[] = [defaultPriorityOption];
  const parsedEditedFormDetails = (data) => {
    let mergeStrategiesData: any[] = data.mergeStrategies;
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
      show={props.createEditMergeStrategyDialog}
      size={"lg"}
    >
      <Modal.Header>
        <span className={"fs-5"}>
          {props.isEditStrategy ? "Edit Strategy" : "Add Strategy"}
        </span>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Form
          name="basic"
          className={"container-fluid"}
        >
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Strategy Name:"}<span className={styles.asterisk}>*</span></FormLabel>
            <Col>
              <Row>
                <Col className={strategyNameErrorMessage ? "d-flex has-error" : "d-flex"}>
                  <HCInput
                    id="strategy-name"
                    value={strategyName}
                    placeholder="Enter strategy name"
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={12} className={styles.validationError}>
                  {strategyNameErrorMessage}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={"mb-3 justify-content-center"}>
            <FormLabel column lg={3}>{"Max Values:"}</FormLabel>
            <Col className={"d-flex align-items-center"}>
              <Form.Check
                inline
                id={"maxValues_all"}
                name={"maxValues"}
                type={"radio"}
                onChange={handleChange}
                defaultChecked={radioValuesOptionClicked === 1}
                checked={radioValuesOptionClicked === 1}
                label={"All"}
                value={1}
                aria-label={"All"}
                className={"mb-0 flex-shrink-0"}
              />
              <Form.Check type={"radio"} id={"maxValues_val"} className={"d-flex align-items-center me-3"} >
                <Form.Check.Input type={"radio"} name={"maxValues"} onChange={handleChange} value={2} defaultChecked={radioValuesOptionClicked === 2} checked={radioValuesOptionClicked === 2} className={"me-2 flex-shrink-0"} />
                <HCInput id="maxValuesStrategyInput" value={maxValues} placeholder={"Enter max values"} onChange={handleChange} />
                <HCTooltip text={MergeRuleTooltips.maxValues} id="max-values-tooltip" placement="top">
                  <QuestionCircleFill color="#7F86B5" className={`flex-shrink-0 ${styles.questionCircle}`} size={13} aria-label="icon: question-circle"/>
                </HCTooltip>
              </Form.Check>
            </Col>
          </Row>
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Max Sources:"}</FormLabel>
            <Col className={"d-flex align-items-center"}>
              <Form.Check
                inline
                id={"maxSources_all"}
                name={"maxSources"}
                type={"radio"}
                onChange={handleChange}
                defaultChecked={radioSourcesOptionClicked === 1}
                checked={radioSourcesOptionClicked === 1}
                label={"All"}
                value={1}
                aria-label={"All"}
                className={"mb-0 flex-shrink-0"}
              />
              <Form.Check type={"radio"} id={"maxSources_val"} className={"d-flex align-items-center me-3"} >
                <Form.Check.Input type={"radio"} name={"maxSources"} onChange={handleChange} value={2} defaultChecked={radioSourcesOptionClicked === 2} checked={radioSourcesOptionClicked === 2} className={"me-2 flex-shrink-0"} />
                <HCInput id="maxSourcesStrategyInput" value={maxSources} onChange={handleChange} placeholder={"Enter max sources"}/>
                <HCTooltip text={MergeRuleTooltips.maxSources} id="max-sources-tooltip" placement="top">
                  <QuestionCircleFill color="#7F86B5" className={`flex-shrink-0 ${styles.questionCircle}`} size={13} aria-label="icon: question-circle"/>
                </HCTooltip>
              </Form.Check>
            </Col>
          </Row>
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Default Strategy?"}</FormLabel>
            <Col className={"d-flex align-items-center"}>
              <Row>
                <Col className={defaultStrategyErrorMessage ? "d-flex has-error" : "d-flex"}>
                  <Form.Check
                    inline
                    id={"defaultYesNo_yes"}
                    name={"defaultYesNo"}
                    type={"radio"}
                    onChange={handleChange}
                    defaultChecked={radioDefaultOptionClicked === 1}
                    checked={radioDefaultOptionClicked === 1}
                    label={"Yes"}
                    value={1}
                    aria-label={"Yes"}
                    className={"mb-0 flex-shrink-0"}
                  />
                  <Form.Check
                    inline
                    id={"defaultYesNo_no"}
                    name={"defaultYesNo"}
                    type={"radio"}
                    onChange={handleChange}
                    defaultChecked={radioDefaultOptionClicked === 2}
                    checked={radioDefaultOptionClicked === 2}
                    label={"No"}
                    value={2}
                    aria-label={"No"}
                    className={"mb-0 flex-shrink-0"}
                  />
                </Col>
                <Col xs={12} className={styles.validationError}>
                  {defaultStrategyErrorMessage}
                </Col>
              </Row>
            </Col>
          </Row>
          {!isCustomStrategy && <div className={styles.priorityOrderContainer} data-testid={"prioritySlider"}>
            <div>
              <p className={`d-flex align-items-center ${styles.priorityText}`}>
                Priority Order
                <HCTooltip text={multiSliderTooltips.priorityOrder} id="priority-order-tooltip" placement="right">
                  <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                </HCTooltip>
              </p>
            </div>
            <div className={styles.addButtonContainer}>
              <Select
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
              </Select>
              <HCButton aria-label="add-slider-button" variant="primary" className={styles.addSliderButton} onClick={onAddOptions}>Add</HCButton>
            </div>
            <div>
              <div><span className={styles.enableStrategySwitch}><b>Enable Merge Strategy Scale </b></span><Switch aria-label="mergeStrategy-scale-switch" defaultChecked={false} onChange={(e) => toggleDisplayPriorityOrderTimeline(e)}></Switch>
                <span>
                  <HCTooltip text={MergingStepTooltips.strategyScale} id="priority-order-tooltip" placement="right">
                    <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                  </HCTooltip>
                </span></div>
              {displayPriorityOrderTimeline ? renderPriorityOrderTimeline() : renderDefaultPriorityOrderTimeline()}
            </div>
          </div>}
          {deletePriorityModal}
          <Row className={`my-3 ${styles.submitButtonsForm}`}>
            <Col className={"d-flex"}>
              <div className={styles.submitButtons}>
                <HCButton aria-label={"cancel-merge-strategy"} variant="outline-light" onClick={() => onCancel()}>Cancel</HCButton>&nbsp;&nbsp;
                <HCButton aria-label={"confirm-merge-strategy"} id={"saveButton"} variant="primary" onClick={handleSubmit} >Save</HCButton>
              </div>
            </Col>
          </Row>
        </Form>
        {discardChanges}
      </Modal.Body>
    </Modal>
  );
};

export default MergeStrategyDialog;
