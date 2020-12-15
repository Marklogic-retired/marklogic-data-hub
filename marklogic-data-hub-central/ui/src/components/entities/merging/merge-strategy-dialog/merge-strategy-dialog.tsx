import {
  Modal,
  Form,
  Icon, Input, Radio
} from "antd";
import React, {useState, useEffect, useContext} from "react";
import styles from "./merge-strategy-dialog.module.scss";
import {MLButton, MLTooltip, MLSelect} from "@marklogic/design-system";
import MultiSlider from "../../matching/multi-slider/multi-slider";
import {CurationContext} from "../../../../util/curation-context";
import {MergeRuleTooltips} from "../../../../config/tooltips.config";
import {addSliderOptions, parsePriorityOrder, handleSliderOptions, handleDeleteSliderOptions} from "../../../../util/priority-order-conversion";
import {MergingStep} from "../../../../types/curation-types";
import {updateMergingArtifact} from "../../../../api/merging";
import ConfirmYesNo from "../../../common/confirm-yes-no/confirm-yes-no";

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
  const [maxValues, setMaxValues] = useState<any>("");
  const [maxValuesTouched, setMaxValuesTouched] = useState(false);
  const [maxSources, setMaxSources] = useState<any>("");
  const [maxSourcesTouched, setMaxSourcesTouched] = useState(false);
  const [isCustomStrategy, setIsCustomStrategy] = useState(false);
  const [priorityOrderOptions, setPriorityOrderOptions] = useState<any>([]);
  const [strategyNameErrorMessage, setStrategyNameErrorMessage] = useState("");
  const [dropdownOption, setDropdownOption] = useState("Length");
  const [dropdownOptionTouched, setDropdownOptionTouched] = useState(false);
  const [discardChangesVisible, setDiscardChangesVisible] = useState(false);

  const dropdownTypes = ["Length"].concat(props.sourceNames);
  const dropdownTypeOptions = dropdownTypes.map(elem => <MLOption data-testid={`dropdownTypeOptions-${elem}`} key={elem}>{elem}</MLOption>);

  const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
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
      setMaxSourcesTouched(true);
    }
    if (event.target.id === "maxValuesStrategyInput") {
      setMaxValues(event.target.value);
      setMaxValuesTouched(true);
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
        "priorityOrder": parsePriorityOrder(priorityOrderOptions)
      };
      onSave(newMergeStrategies);
      props.setOpenEditMergeStrategyDialog(false);
    }
    setStrategyNameErrorMessage(strategyNameErrorMessage);
  };

  const onAddOptions =  () => {
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
        && !maxValuesTouched
        && !maxSourcesTouched
    ) {
      return false;
    } else {
      return true;
    }
  };

  // const onCancelEditModal = () => {
  //
  // };

  const onOk = () => {
    props.setOpenEditMergeStrategyDialog(false);
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
    setStrategyNameErrorMessage("");
    setPriorityOrderOptions([]);
    setDropdownOption("Length");
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
      setPriorityOrderOptions([]);
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

  let priorityOrderStrategyOptions:any[] = [];
  const parsedEditedFormDetails = (data) => {
    let mergeStrategiesData: any[]  = data.mergeStrategies;
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
          // let timeStampObject = {
          //   props: [{
          //     prop: "Timestamp",
          //     type: "",
          //   }],
          //   value: 0,
          // };
          //priorityOrderStrategyOptions.push(timeStampObject);
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
            <Radio value={1} > All</Radio>
            <Radio value={2} ><Input id="maxValuesStrategyInput" value={maxValues} placeholder={"Enter max values"} onChange={handleChange} ></Input></Radio>
          </Radio.Group>
          <MLTooltip title={MergeRuleTooltips.maxValues}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip>
        </Form.Item>
        <Form.Item
          colon={false}
          label="Max Sources:"
          labelAlign="left"
        >
          <Radio.Group  value={radioSourcesOptionClicked} onChange={handleChange}  name={"maxSources"}>
            <Radio value={1} > All</Radio>
            <Radio value={2} ><Input id="maxSourcesStrategyInput" value={maxSources} onChange={handleChange} placeholder={"Enter max sources"}></Input></Radio>
          </Radio.Group>
          <MLTooltip title={MergeRuleTooltips.maxSources}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip>
        </Form.Item>
        {!isCustomStrategy && <div className={styles.priorityOrderContainer} data-testid={"prioritySlider"}>
          <div><p className={styles.priorityText}>Priority Order<MLTooltip title={""}>
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
            <MultiSlider options={priorityOrderOptions} handleSlider={handleSlider} handleDelete={handleDelete} handleEdit={handleEdit}/>
          </div>
        </div>}
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
