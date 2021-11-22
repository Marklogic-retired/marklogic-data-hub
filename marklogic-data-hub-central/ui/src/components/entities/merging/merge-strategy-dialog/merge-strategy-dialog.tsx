import {Radio, Select} from "antd";
import {Row, Col, Modal, Form, FormLabel} from "react-bootstrap";
import React, {useState, useEffect, useContext} from "react";
import styles from "./merge-strategy-dialog.module.scss";
import MultiSlider from "../../matching/multi-slider/multi-slider";
import {CurationContext} from "../../../../util/curation-context";
import {MergeRuleTooltips, multiSliderTooltips} from "../../../../config/tooltips.config";
import {addSliderOptions, parsePriorityOrder, handleSliderOptions, handleDeleteSliderOptions} from "../../../../util/priority-order-conversion";
import {MergingStep, StepType, defaultPriorityOption} from "../../../../types/curation-types";
import {updateMergingArtifact} from "../../../../api/merging";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {ConfirmYesNo, HCInput, HCButton, HCTooltip} from "@components/common";

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
  const [priorityOrderOptions, setPriorityOrderOptions] = useState<any>([defaultPriorityOption]);
  const [strategyNameErrorMessage, setStrategyNameErrorMessage] = useState("");
  const [defaultStrategyErrorMessage, setDefaultStrategyErrorMessage] = useState<any>();
  const [dropdownOption, setDropdownOption] = useState("Length");
  const [dropdownOptionTouched, setDropdownOptionTouched] = useState(false);
  const [discardChangesVisible, setDiscardChangesVisible] = useState(false);

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
          setRadioDefaultOptionClicked(event.target.value);
        }
      } else {
        setRadioDefaultOptionClicked(event.target.value);
      }
    }
    if (event.target.name === "maxSources") {
      setRadioSourcesOptionClicked(event.target.value);
      if (event.target.value === 1) {
        setMaxSources("");
      }
    }
    if (event.target.name === "maxValues") {
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
    setPriorityOrderOptions(addSliderOptions(priorityOrderOptions, dropdownOption));
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

  const handleSlider = (values, options) => {
    handleSliderOptions(values, options, priorityOrderOptions);
    setPriorityOrderOptions(priorityOrderOptions);
  };

  const handleDelete = (options) => {
    setPriorityOrderOptions(handleDeleteSliderOptions(options, priorityOrderOptions));
    setDropdownOption("Length");
  };

  const handleEdit = () => {

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
  }, [props.strategyName, curationOptions, props.isEditStrategy, props.sourceNames]);

  let priorityOrderStrategyOptions: any[] = [defaultPriorityOption];
  const parsedEditedFormDetails = (data) => {
    let mergeStrategiesData: any[] = data.mergeStrategies;
    for (let key of mergeStrategiesData) {
      if (props.strategyName === key.strategyName) {
        if (key.hasOwnProperty("priorityOrder")) {
          for (let key1 of key.priorityOrder.sources) {
            const priorityOrderSourceObject = {
              props: [{
                prop: "Source",
                type: key1.sourceName,
              }],
              value: key1.weight,
            };
            priorityOrderStrategyOptions.push(priorityOrderSourceObject);
          }
          if (key.priorityOrder.hasOwnProperty("lengthWeight")) {
            const priorityOrderLengthObject = {
              props: [{
                prop: "Length",
                type: "",
              }],
              value: key.priorityOrder.lengthWeight,
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
            <Col className={"d-flex"}>
              <Radio.Group className={styles.radioAnt} value={radioValuesOptionClicked} onChange={handleChange} name={"maxValues"}>
                <Radio className={styles.radioAnt} value={1} > All</Radio>
                <Radio className={styles.radioAnt} value={2} >
                  <div className={styles.radioAnt}>
                    <HCInput id="maxValuesStrategyInput" value={maxValues} placeholder={"Enter max values"} onChange={handleChange} />
                    <HCTooltip text={MergeRuleTooltips.maxValues} id="max-values-tooltip" placement="top">
                      <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                    </HCTooltip>
                  </div>
                </Radio>
              </Radio.Group>
            </Col>
          </Row>
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Max Sources:"}</FormLabel>
            <Col className={"d-flex"}>
              <Radio.Group className={styles.radioAnt} value={radioSourcesOptionClicked} onChange={handleChange} name={"maxSources"}>
                <Radio className={styles.radioAnt} value={1} > All</Radio>
                <Radio className={styles.radioAnt} value={2} >
                  <div className={styles.radioAnt}>
                    <HCInput id="maxSourcesStrategyInput" value={maxSources} onChange={handleChange} placeholder={"Enter max sources"}/>
                    <HCTooltip text={MergeRuleTooltips.maxSources} id="max-sources-tooltip" placement="top">
                      <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                    </HCTooltip>
                  </div>
                </Radio>
              </Radio.Group>
            </Col>
          </Row>
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Default Strategy?"}</FormLabel>
            <Col className={"d-flex align-items-center"}>
              <Row>
                <Col className={defaultStrategyErrorMessage ? "d-flex has-error" : "d-flex"}>
                  <Radio.Group value={radioDefaultOptionClicked} onChange={handleChange} name={"defaultYesNo"}>
                    <Radio value={1} >Yes</Radio>
                    <Radio value={2} >No</Radio>
                  </Radio.Group>
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
              <MultiSlider options={priorityOrderOptions} handleSlider={handleSlider} handleDelete={handleDelete} handleEdit={handleEdit} stepType={StepType.Merging} />
            </div>
          </div>}
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
