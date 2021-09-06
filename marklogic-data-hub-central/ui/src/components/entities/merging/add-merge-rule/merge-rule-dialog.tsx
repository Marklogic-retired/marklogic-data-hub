import {
  Modal,
  Form,
  Radio, Input, Select
} from "antd";
import React, {useState, useContext, useEffect} from "react";
import styles from "./merge-rule-dialog.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import EntityPropertyTreeSelect from "../../../entity-property-tree-select/entity-property-tree-select";
import {Definition} from "../../../../types/modeling-types";
import {CurationContext} from "../../../../util/curation-context";
import arrayIcon from "../../../../assets/icon_array.png";
import {MergeRuleTooltips, multiSliderTooltips} from "../../../../config/tooltips.config";
import MultiSlider from "../../matching/multi-slider/multi-slider";
import {MergingStep, StepType, defaultPriorityOption} from "../../../../types/curation-types";
import {updateMergingArtifact, getMergingRulesWarnings} from "../../../../api/merging";
import {addSliderOptions, parsePriorityOrder, handleSliderOptions, handleDeleteSliderOptions} from "../../../../util/priority-order-conversion";
import ConfirmYesNo from "../../../common/confirm-yes-no/confirm-yes-no";
import HCAlert from "../../../common/hc-alert/hc-alert";
import HCTooltip from "../../../common/hc-tooltip/hc-tooltip";
import {QuestionCircleFill} from "react-bootstrap-icons";
import HCButton from "../../../common/hc-button/hc-button";

type Props = {
  sourceNames: string[];
  createEditMergeRuleDialog: boolean;
  setOpenMergeRuleDialog: (createEditMergeRuleDialog: boolean) => void;
  isEditRule: boolean;
  propertyName: string;
  toggleEditRule: (isEditRule: boolean) => void;
};

const DEFAULT_ENTITY_DEFINITION: Definition = {
  name: "",
  properties: []
};

const {Option} = Select;

const MergeRuleDialog: React.FC<Props> = (props) => {

  const {curationOptions, updateActiveStepArtifact} = useContext(CurationContext);
  const [entityTypeDefinition, setEntityTypeDefinition] = useState<Definition>(DEFAULT_ENTITY_DEFINITION);
  const [mergeStrategyNames, setMergeStrategyNames] = useState<string[]>([]);
  const [property, setProperty] = useState<string | undefined>(undefined);
  const [propertyTouched, setPropertyTouched] = useState(false);
  const [propertyErrorMessage, setPropertyErrorMessage] = useState("");
  const [mergeType, setMergeType] = useState<string | undefined>(undefined);
  const [mergeTypeErrorMessage, setMergeTypeErrorMessage] = useState("");
  const [mergeTypeTouched, setMergeTypeTouched] = useState(false);
  const [dropdownOption, setDropdownOption] = useState("Length");
  const [dropdownOptionTouched, setDropdownOptionTouched] = useState(false);
  const [uri, setUri] = useState("");
  const [uriTouched, setUriTouched] = useState(false);
  const [functionValue, setFunctionValue] = useState("");
  const [functionValueTouched, setFunctionValueTouched] = useState(false);
  const [strategyValue, setStrategyValue] = useState<string | undefined>(undefined);
  const [strategyValueTouched, setStrategyValueTouched] = useState(false);
  const [strategyNameErrorMessage, setStrategyNameErrorMessage] = useState("");
  const [namespace, setNamespace] = useState("");
  const [namespaceTouched, setNamespaceTouched] = useState(false);
  const [maxValueRuleInput, setMaxValueRuleInput] = useState<any>("");
  const [maxValueRuleInputTouched, setMaxValueRuleInputTouched] = useState(false);
  const [maxSourcesRuleInput, setMaxSourcesRuleInput] = useState<any>("");
  const [maxSourcesRuleInputTouched, setMaxSourcesRuleInputTouched] = useState(false);
  const [priorityOrderOptions, setPriorityOrderOptions] = useState<any>([defaultPriorityOption]);
  const [discardChangesVisible, setDiscardChangesVisible] = useState(false);
  const [radioSourcesOptionClicked, setRadioSourcesOptionClicked] = useState(1);
  const [radioValuesOptionClicked, setRadioValuesOptionClicked] = useState(1);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [handleSave, setHandleSave] = useState(false);

  const titleLegend = <div className={styles.titleLegend}>
    <div data-testid="multipleIconLegend" className={styles.legendText}><img className={styles.arrayImage} src={arrayIcon} alt={""} /> Multiple</div>
    <div data-testid="structuredIconLegend" className={styles.legendText}><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup} /> Structured</div>
  </div>;

  const mergeTypes = ["Custom", "Strategy", "Property-specific"];
  const mergeTypeOptions = mergeTypes.map(elem => <Option data-testid={`mergeTypeOptions-${elem}`} value={elem} key={elem}>{elem}</Option>);
  const dropdownTypes = ["Length"].concat(props.sourceNames);
  const dropdownTypeOptions = dropdownTypes.map(elem => <Option data-testid={`dropdownTypeOptions-${elem}`} key={elem}>{elem}</Option>);

  useEffect(() => {
    if (!props.isEditRule && curationOptions.entityDefinitionsArray.length > 0 && curationOptions.activeStep.entityName !== "") {
      let entityTypeDefinition: Definition = curationOptions.entityDefinitionsArray.find(entityDefinition => entityDefinition.name === curationOptions.activeStep.entityName) || DEFAULT_ENTITY_DEFINITION;
      setEntityTypeDefinition(entityTypeDefinition);
      let mergeStepArtifact: MergingStep = curationOptions.activeStep.stepArtifact;
      let mergeStrategies: any[] = mergeStepArtifact.mergeStrategies || [];
      setMergeStrategyNames(mergeStrategies.map((mergeStrategy) => mergeStrategy.strategyName));
      resetModal();
    }
    if (props.isEditRule && props.propertyName.length) {
      setProperty(props.propertyName.split(" ")[0].split(".").join(" > "));
      setFormDetails(curationOptions.activeStep.stepArtifact);
    }
  }, [props.isEditRule, props.sourceNames, props.propertyName]);

  useEffect(() => {
    if (validationWarnings.length === 0 && handleSave && !discardChangesVisible) {
      props.setOpenMergeRuleDialog(false);
    }
  }, [validationWarnings]);


  const setFormDetails = (data) => {
    let mergeRulesData: any[] = data.mergeRules;
    for (let key of mergeRulesData) {
      if (props.propertyName === key.entityPropertyPath) {
        if (key.mergeType === "strategy") {
          setMergeType("Strategy");
          setStrategyValue(key.mergeStrategyName);
        } else if (key.mergeType === "custom") {
          setMergeType("Custom");
          setUri(key.mergeModulePath);
          setFunctionValue(key.mergeModuleFunction);
          setNamespace(key.mergeModuleNamespace);
        } else {
          let priorityOrderRuleOptions: any[] = [];
          setMergeType("Property-specific");
          if (key.hasOwnProperty("priorityOrder")) {
            for (let key1 of key.priorityOrder.sources) {
              const priorityOrderSourceObject = {
                props: [{
                  prop: "Source",
                  type: key1.sourceName,
                }],
                value: key1.weight,
              };
              priorityOrderRuleOptions.push(priorityOrderSourceObject);
            }
            if (key.priorityOrder.hasOwnProperty("lengthWeight")) {
              const priorityOrderLengthObject = {
                props: [{
                  prop: "Length",
                  type: "",
                }],
                value: key.priorityOrder.lengthWeight,
              };
              priorityOrderRuleOptions.push(priorityOrderLengthObject);
            }
            setPriorityOrderOptions(priorityOrderRuleOptions);
          }
          if (key.hasOwnProperty("maxValues")) {
            if (key.maxValues === "All") {
              setRadioValuesOptionClicked(1);
              setMaxValueRuleInput("");
            } else {
              setRadioValuesOptionClicked(2);
              setMaxValueRuleInput(key.maxValues);
            }
          }
          if (key.hasOwnProperty("maxSources")) {
            if (key.maxSources === "All") {
              setRadioSourcesOptionClicked(1);
              setMaxSourcesRuleInput("");
            } else {
              setRadioSourcesOptionClicked(2);
              setMaxSourcesRuleInput(key.maxSources);
            }
          }
        }
      }
    }
  };

  const resetModal = () => {
    props.toggleEditRule(false);
    setProperty("");
    setPropertyErrorMessage("");
    setMergeTypeErrorMessage("");
    setMergeType(undefined);
    setUri("");
    setProperty(undefined);
    setMergeType(undefined);
    setUriTouched(false);
    setRadioValuesOptionClicked(1);
    setRadioSourcesOptionClicked(1);
    setMaxSourcesRuleInput("");
    setMaxValueRuleInput("");
    setStrategyValue(undefined);
    setNamespace("");
    setFunctionValue("");
    setPriorityOrderOptions([defaultPriorityOption]);
    setDropdownOption("Length");
    resetTouched();
  };

  const resetTouched = () => {
    setDiscardChangesVisible(false);
    setPropertyTouched(false);
    setMergeTypeTouched(false);
    setDropdownOptionTouched(false);
    setFunctionValueTouched(false);
    setStrategyValueTouched(false);
    setNamespaceTouched(false);
    setMaxValueRuleInputTouched(false);
    setMaxSourcesRuleInputTouched(false);
  };

  const onCancel = () => {
    if (hasFormChanged() && validationWarnings.length === 0) {
      setDiscardChangesVisible(true);
    } else {
      props.toggleEditRule(false);
      resetModal();
      props.setOpenMergeRuleDialog(false);
    }
    setValidationWarnings([]);
  };

  const hasFormChanged = () => {
    if (mergeType === "Custom") {
      let checkCustomValues = hasCustomFormValuesChanged();
      if (!propertyTouched && !mergeTypeTouched && !checkCustomValues) {
        return false;
      } else {
        return true;
      }
    } else if (mergeType === "Strategy") {
      let checkStrategyValues = hasStratgyFormValuesChanged();
      if (!propertyTouched && !mergeTypeTouched && !checkStrategyValues) {
        return false;
      } else {
        return true;
      }
    } else if (mergeType === "Property-specific") {
      let checkPropertySpecificValues = hasPropertySpecificFormValuesChanged();
      if (!propertyTouched && !mergeTypeTouched && !checkPropertySpecificValues) {
        return false;
      } else {
        return true;
      }
    } else {
      if (!propertyTouched && !mergeTypeTouched) {
        return false;
      } else {
        return true;
      }
    }
  };

  const hasCustomFormValuesChanged = () => {
    if (!uriTouched
      && !functionValueTouched
      && !namespaceTouched
    ) {
      return false;
    } else {
      return true;
    }
  };

  const hasStratgyFormValuesChanged = () => {
    if (!strategyValueTouched) {
      return false;
    } else {
      return true;
    }
  };

  const hasPropertySpecificFormValuesChanged = () => {
    if (!dropdownOptionTouched
      && (!maxSourcesRuleInputTouched || maxSourcesRuleInput.length === 0)
      && !maxValueRuleInputTouched || maxValueRuleInput.length === 0
    ) {
      return false;
    } else {
      return true;
    }
  };

  const onOk = () => {
    props.setOpenMergeRuleDialog(false);
  };

  const formItemLayout = {
    labelCol: {
      xs: {span: 24},
      sm: {span: 7},
    },
    wrapperCol: {
      xs: {span: 24},
      sm: {span: 16},
    },
  };

  const handleProperty = (value) => {
    if (value === " ") {
      setPropertyTouched(false);
    } else {
      setPropertyTouched(true);
      setProperty(value);
    }
  };

  const handleMergeType = (value) => {
    if (value === " ") {
      setMergeTypeTouched(false);
    } else {
      setMergeTypeTouched(true);
      setMergeType(value);
    }
  };

  const handleDropDownOptions = (value) => {
    if (value === " ") {
      setDropdownOptionTouched(false);
    } else {
      setDropdownOptionTouched(true);
      setDropdownOption(value);
    }
  };

  const handleStrategyNameOptions = (value) => {
    if (!value || value === " ") {
      setStrategyValueTouched(false);
    } else {
      setStrategyValueTouched(true);
      setStrategyValue(value);
    }
  };

  const handleChange = (event) => {
    if (event.target.id === "uri") {
      if (event.target.value === " ") {
        setUriTouched(false);
      } else {
        setUriTouched(true);
        setUri(event.target.value);
      }
    } else if (event.target.id === "function") {
      if (event.target.value === " ") {
        setFunctionValueTouched(false);
      } else {
        setFunctionValueTouched(true);
        setFunctionValue(event.target.value);
      }
    } else if (event.target.id === "namespace") {
      if (event.target.value === " ") {
        setNamespaceTouched(false);
      } else {
        setNamespaceTouched(true);
        setNamespace(event.target.value);
      }
    } else if (event.target.id === "strategyName") {
      if (event.target.value === " ") {
        setStrategyValueTouched(false);
      } else {
        setStrategyValueTouched(true);
        setStrategyValue(event.target.value);
      }
    } else if (event.target.id === "maxValuesRuleInput") {
      if (event.target.value === " ") {
        setMaxValueRuleInputTouched(false);
      } else {
        setMaxValueRuleInputTouched(true);
        setMaxValueRuleInput(event.target.value);
        setRadioValuesOptionClicked(2);
      }
    } else if (event.target.id === "maxSourcesRuleInput") {
      if (event.target.value === " ") {
        setMaxSourcesRuleInputTouched(false);
      } else {
        setMaxSourcesRuleInputTouched(true);
        setMaxSourcesRuleInput(event.target.value);
        setRadioSourcesOptionClicked(2);
      }
    } else if (event.target.name === "maxValues") {
      setRadioValuesOptionClicked(event.target.value);
      if (event.target.value === 1) {
        setMaxValueRuleInput("");
      }
    } else if (event.target.name === "maxSources") {
      setRadioSourcesOptionClicked(event.target.value);
      if (event.target.value === 1) {
        setMaxSourcesRuleInput("");
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let propertyErrorMessage = "";
    let mergeTypeErrorMessage = "";
    let strategyNameErrorMessage = "";
    let selectedProperty = property ? property.split(" > ").join(".") : "";
    if (property === "" || property === undefined) {
      propertyErrorMessage = "Property is required";
    }
    if (mergeType === "" || mergeType === undefined) {
      mergeTypeErrorMessage = "Merge type is required";
    }
    if (mergeType === "Strategy" && strategyValue === undefined) {
      strategyNameErrorMessage = "Strategy Name is required";
    }
    if (!(propertyErrorMessage || mergeTypeErrorMessage)) {
      let newMergeRules = {};
      if (mergeType === "Custom") {
        if (uri && functionValue && property && mergeType) {
          setHandleSave(true);
          newMergeRules =
          {
            "entityPropertyPath": selectedProperty,
            "mergeType": "custom",
            "mergeModulePath": uri,
            "mergeModuleNamespace": namespace,
            "mergeModuleFunction": functionValue,
            "options": {}
          };
          onSave(newMergeRules);
        } else {
          setUriTouched(true);
          setFunctionValueTouched(true);
        }
      } else if (mergeType === "Strategy") {
        if (strategyValue && property && mergeType) {
          newMergeRules = {
            "entityPropertyPath": selectedProperty,
            "mergeType": "strategy",
            "mergeStrategyName": strategyValue
          };
          onSave(newMergeRules);
          setHandleSave(true);
        } else {
          setStrategyValueTouched(true);
        }
      } else {
        if ((radioSourcesOptionClicked || radioValuesOptionClicked) && property && mergeType) {
          newMergeRules = {
            "entityPropertyPath": selectedProperty,
            "mergeType": "property-specific",
            "maxSources": maxSourcesRuleInput ? maxSourcesRuleInput : "All",
            "maxValues": maxValueRuleInput ? maxValueRuleInput : "All",
            "priorityOrder": parsePriorityOrder(priorityOrderOptions)
          };
          onSave(newMergeRules);
          setHandleSave(true);
        } else {
          setMaxSourcesRuleInputTouched(true);
          setMaxValueRuleInputTouched(true);
        }
      }
    }
    setPropertyErrorMessage(propertyErrorMessage);
    setMergeTypeErrorMessage(mergeTypeErrorMessage);
    setStrategyNameErrorMessage(strategyNameErrorMessage);
  };

  const onAddOptions = () => {
    setPriorityOrderOptions(addSliderOptions(priorityOrderOptions, dropdownOption));
  };

  const onSave = async (newMergeRules) => {
    let newStepArtifact: MergingStep = curationOptions.activeStep.stepArtifact;
    let index = 0;
    while (index < (newStepArtifact.mergeRules.length)) {
      let key = newStepArtifact.mergeRules[index];
      if (key.entityPropertyPath === props.propertyName && props.isEditRule) {
        break;
      }
      index++;
    }
    // New Rule
    if (index === newStepArtifact.mergeRules.length) {
      newStepArtifact.mergeRules.push(newMergeRules);
      await updateMergingArtifact(newStepArtifact);
      updateActiveStepArtifact(newStepArtifact);
      props.setOpenMergeRuleDialog(false);
    } else {
      // Edit Rule
      newStepArtifact.mergeRules[index] = newMergeRules;
      await updateMergingArtifact(newStepArtifact);
      updateActiveStepArtifact(newStepArtifact);
      let warnings = await getMergingRulesWarnings(newStepArtifact, newMergeRules);
      if (warnings !== undefined) { setValidationWarnings(warnings.data); }
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

  const discardOk = () => {
    resetModal();
    props.setOpenMergeRuleDialog(false);
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

  return (
    <Modal
      visible={props.createEditMergeRuleDialog}
      title={props.isEditRule ? "Edit Merge Rule" : "Add Merge Rule"}
      width={700}
      onCancel={() => onCancel()}
      onOk={() => onOk()}
      okText="Save"
      className={styles.AddMergeRuleModal}
      footer={null}
      maskClosable={false}
      destroyOnClose={true}
    >
      {validationWarnings.length > 0 ? (
        validationWarnings.map((warning, index) => {
          let description = "Please set max values for property to 1 on merge to avoid an invalid entity instance.";
          return (
            <HCAlert
              className={styles.alert}
              variant="warning"
              showIcon
              key={warning["level"] + index}
              heading={warning["message"]}
            >
              {description}
            </HCAlert>
          );
        })
      ) : null}
      <p>Select the property and the merge type for this merge rule. When you select a structured type property, the merge rule is applied to all the properties within that structured type property as well.</p>
      {titleLegend}
      <br />
      <div className={styles.addMergeRuleForm}>
        <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
          <Form.Item
            label={<span aria-label="formItem-Property">Property:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
            labelAlign="left"
            id="propertyName"
            validateStatus={propertyErrorMessage ? "error" : ""}
            help={propertyErrorMessage}
          ><EntityPropertyTreeSelect
              propertyDropdownOptions={entityTypeDefinition.properties}
              entityDefinitionsArray={curationOptions.entityDefinitionsArray}
              value={property}
              onValueSelected={handleProperty}
            />&nbsp;&nbsp;
            <HCTooltip text={MergeRuleTooltips.disabledProperties} id="property-name-tooltip" placement="top">
              <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
            </HCTooltip>
          </Form.Item>
          <Form.Item
            label={<span aria-label="formItem-MergeType">Merge Type:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
            labelAlign="left"
            validateStatus={mergeTypeErrorMessage ? "error" : ""}
            help={mergeTypeErrorMessage}
          >
            <Select
              id="mergeType"
              placeholder="Select merge type"
              size="default"
              value={mergeType}
              onChange={handleMergeType}
              //disabled={!canWriteMatchMerge}
              className={styles.mergeTypeSelect}
              aria-label="mergeType-select"
            >
              {mergeTypeOptions}
            </Select>
          </Form.Item>
          {mergeType === "Custom" ?
            <>
              <Form.Item
                label={<span aria-label="formItem-URI">URI:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
                labelAlign="left"
                validateStatus={(uri || !uriTouched) ? "" : "error"}
                help={(uri || !uriTouched) ? "" : "URI is required"}
              >
                <div className={styles.inputWithHelperIcon}>
                  <Input
                    id="uri"
                    placeholder="Enter URI"
                    size="default"
                    value={uri}
                    onChange={handleChange}
                    //disabled={props.canReadMatchMerge && !props.canWriteMatchMerge}
                    className={styles.input}
                    aria-label="uri-input"
                  />&nbsp;&nbsp;
                  <HCTooltip text={MergeRuleTooltips.uri} id="uri-tooltip" placement="top">
                    <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                  </HCTooltip>
                </div>
              </Form.Item>
              <Form.Item
                label={<span aria-label="formItem-function">Function:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
                labelAlign="left"
                validateStatus={(functionValue || !functionValueTouched) ? "" : "error"}
                help={(functionValue || !functionValueTouched) ? "" : "Function is required"}
              >
                <Input
                  id="function"
                  placeholder="Enter function"
                  size="default"
                  value={functionValue}
                  onChange={handleChange}
                  //disabled={props.canReadMatchMerge && !props.canWriteMatchMerge}
                  className={styles.input}
                  aria-label="function-input"
                />&nbsp;&nbsp;
                <HCTooltip text={MergeRuleTooltips.function} id="function-tooltip" placement="top">
                  <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                </HCTooltip>
              </Form.Item>
              <Form.Item
                label={<span aria-label="formItem-namespace">Namespace:</span>}
                labelAlign="left"
              >
                <Input
                  id="namespace"
                  placeholder="Enter namespace"
                  size="default"
                  value={namespace}
                  onChange={handleChange}
                  //disabled={props.canReadMatchMerge && !props.canWriteMatchMerge}
                  className={styles.input}
                  aria-label="namespace-input"
                />&nbsp;&nbsp;
                <HCTooltip text={MergeRuleTooltips.namespace} id="namespace-tooltip" placement="top">
                  <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                </HCTooltip>
              </Form.Item>
            </> : ""
          }
          {mergeType === "Strategy" ?
            <Form.Item
              label={<span aria-label="formItem-strategyName">Strategy Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
              labelAlign="left"
              validateStatus={strategyNameErrorMessage ? "error" : ""}
              help={strategyNameErrorMessage ? strategyNameErrorMessage : ""}
            >
              <Select
                id="strategyName"
                placeholder="Select strategy name"
                size="default"
                value={strategyValue}
                onChange={handleStrategyNameOptions}
                className={styles.mergeTypeSelect}
                aria-label="strategy-name-select"
              >
                {mergeStrategyNames.map((strategyName) => <Option data-testid={`strategyNameOptions-${strategyName}`} key={strategyName}>{strategyName}</Option>)}
              </Select>
            </Form.Item>
            : ""
          }
          {mergeType === "Property-specific" ?
            <>
              <Form.Item
                colon={false}
                label="Max Values:"
                labelAlign="left"
              >
                <Radio.Group value={radioValuesOptionClicked} onChange={handleChange} name="maxValues">
                  <Radio value={1} > All</Radio>
                  <Radio value={2} ><Input id="maxValuesRuleInput" value={maxValueRuleInput} placeholder={"Enter max values"} onChange={handleChange} onClick={handleChange} className={styles.maxInput} ></Input></Radio>
                </Radio.Group>
                <HCTooltip text={MergeRuleTooltips.maxValues} id="max-values-tooltip" placement="top">
                  <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                </HCTooltip>
              </Form.Item>
              <Form.Item
                colon={false}
                label="Max Sources:"
                labelAlign="left"
              >
                <Radio.Group value={radioSourcesOptionClicked} onChange={handleChange} name="maxSources">
                  <Radio value={1} > All</Radio>
                  <Radio value={2} ><Input id="maxSourcesRuleInput" value={maxSourcesRuleInput} onChange={handleChange} placeholder={"Enter max sources"} onClick={handleChange} className={styles.maxInput}></Input></Radio>
                </Radio.Group>
                <HCTooltip text={MergeRuleTooltips.maxSources} id="max-sources-tooltip" placement="top">
                  <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                </HCTooltip>
              </Form.Item>
              <div className={styles.priorityOrderContainer} data-testid={"priorityOrderSlider"}>
                <div>
                  <p className={styles.priorityText}>Priority Order
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
              </div>
            </> : ""
          }
          <Form.Item className={styles.submitButtonsForm}>
            <div className={styles.submitButtons}>
              <HCButton aria-label={"cancel-merge-rule"} variant="outline-light" onClick={() => onCancel()}>Cancel</HCButton>&nbsp;&nbsp;
              <HCButton aria-label={"confirm-merge-rule"} id={"saveButton"} variant="primary" onClick={handleSubmit} >Save</HCButton>
            </div>
          </Form.Item>
        </Form>
        {discardChanges}
      </div>
    </Modal>
  );
};

export default MergeRuleDialog;
