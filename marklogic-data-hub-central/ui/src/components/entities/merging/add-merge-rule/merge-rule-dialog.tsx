import {Radio, Select, Switch} from "antd";
import {Row, Col, Modal, Form, FormLabel} from "react-bootstrap";
import React, {useState, useContext, useEffect} from "react";
import styles from "./merge-rule-dialog.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import EntityPropertyTreeSelect from "../../../entity-property-tree-select/entity-property-tree-select";
import {Definition} from "../../../../types/modeling-types";
import {CurationContext} from "../../../../util/curation-context";
import arrayIcon from "../../../../assets/icon_array.png";
import {MergeRuleTooltips, multiSliderTooltips} from "../../../../config/tooltips.config";
import {MergingStep, defaultPriorityOption} from "../../../../types/curation-types";
import {updateMergingArtifact, getMergingRulesWarnings} from "../../../../api/merging";
import {addSliderOptions, parsePriorityOrder, handleDeleteSliderOptions} from "../../../../util/priority-order-conversion";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {ConfirmYesNo, HCInput, HCAlert, HCButton, HCTooltip} from "@components/common";
import moment from "moment";
import TimelineVis from "../../matching/matching-step-detail/timeline-vis/timeline-vis";
import TimelineVisDefault from "../../matching/matching-step-detail/timeline-vis-default/timeline-vis-default";
import MergeDeleteModal from "../merge-delete-modal/merge-delete-modal";

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
  const [displayPriorityOrderTimeline, toggleDisplayPriorityOrderTimeline] = useState(false);
  const [priorityOptions, setPriorityOptions] = useState<any>();
  const [deletePriorityName, setDeletePriorityName] = useState("");
  const [deleteModalVisibility, toggleDeleteModalVisibility] = useState(false);

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
    for (let mergeRule of mergeRulesData) {
      if (props.propertyName === mergeRule.entityPropertyPath) {
        if (mergeRule.mergeType === "strategy") {
          setMergeType("Strategy");
          setStrategyValue(mergeRule.mergeStrategyName);
        } else if (mergeRule.mergeType === "custom") {
          setMergeType("Custom");
          setUri(mergeRule.mergeModulePath);
          setFunctionValue(mergeRule.mergeModuleFunction);
          setNamespace(mergeRule.mergeModuleNamespace);
        } else {
          let priorityOrderRuleOptions: any[] = [defaultPriorityOption];
          setMergeType("Property-specific");
          if (mergeRule.hasOwnProperty("priorityOrder")) {
            for (let source of mergeRule.priorityOrder.sources) {
              const priorityOrderSourceObject = {
                id: mergeRule.entityPropertyPath + ":Source - " + source.sourceName,
                start: source.weight,
                value: "Source - " + source.sourceName + ":" + source.weight,
              };
              priorityOrderRuleOptions.push(priorityOrderSourceObject);
            }
            if (mergeRule.priorityOrder.hasOwnProperty("lengthWeight")) {
              const priorityOrderLengthObject = {
                id: mergeRule.entityPropertyPath + ":Length:",
                start: mergeRule.priorityOrder.lengthWeight,
                value: "Length:" + mergeRule.priorityOrder.lengthWeight.toString(),
              };
              priorityOrderRuleOptions.push(priorityOrderLengthObject);
            }
            setPriorityOrderOptions(priorityOrderRuleOptions);
          }
          if (mergeRule.hasOwnProperty("maxValues")) {
            if (mergeRule.maxValues === "All") {
              setRadioValuesOptionClicked(1);
              setMaxValueRuleInput("");
            } else {
              setRadioValuesOptionClicked(2);
              setMaxValueRuleInput(mergeRule.maxValues);
            }
          }
          if (mergeRule.hasOwnProperty("maxSources")) {
            if (mergeRule.maxSources === "All") {
              setRadioSourcesOptionClicked(1);
              setMaxSourcesRuleInput("");
            } else {
              setRadioSourcesOptionClicked(2);
              setMaxSourcesRuleInput(mergeRule.maxSources);
            }
          }
        }
      }
    }
  };

  const updateMergeRuleItems = async(id, newValue, priorityOrderOptions:any[]) => {
    if (id.split(":")[0] !== "Timestamp") {
      let editPriorityName;
      if (id.split(":")[1] === "Length") {
        editPriorityName = "Length";
      } else {
        editPriorityName = id.split(":")[0];
      }
      for (let priorityOption of priorityOrderOptions) {
        let value = priorityOption.value;
        let priorityName;
        if (value.split(":")[0] === "Length") priorityName = "Length";
        else priorityName = value.split(":")[0];
        if (priorityName === editPriorityName) {
          let name = "";
          if (editPriorityName !== "Length" && editPriorityName !== "Timestamp") { name = priorityName + ":" + parseInt(newValue); } else if (editPriorityName === "Length") { name = "Length:" + parseInt(newValue); } else if (editPriorityName === "Timestamp") { name = "Timestamp:0"; }
          priorityOption.start = parseInt(newValue);
          priorityOption.value = name;
        }
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
      if (item.value && item.value.split(":")[0] !== "Timestamp") {
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

  const onPriorityOrderTimelineItemClicked = (event) => {
    if (event.item && event.item.split(":")[0] !== "Timestamp") {
      toggleDeleteModalVisibility(true);
      if (event.item.split(":")[0] === "Length" || event.item.split(":")[1] === "Length") setDeletePriorityName("Length");
      else {
        if (event.item.split(" - ")[0] === "Source") setDeletePriorityName(event.item.split(" - ")[1].split(":")[0]);
        else setDeletePriorityName(event.item.split(":")[1].split(" - ")[1]);
      }
      setPriorityOptions(event);
    }
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
    toggleDisplayPriorityOrderTimeline(false);
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
      show={props.createEditMergeRuleDialog}
      size={"lg"}
    >
      <Modal.Header>
        <span className={"fs-5"}>
          {props.isEditRule ? "Edit Merge Rule" : "Add Merge Rule"}
        </span>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body>
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
          <Form onSubmit={handleSubmit} className={"container-fluid"}>
            <Row className={"mb-3"}>
              <FormLabel column lg={3} htmlFor={"propertyName"}>
                {<span aria-label="formItem-Property">Property:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
              </FormLabel>
              <Col>
                <Row>
                  <Col className={propertyErrorMessage ? "d-flex has-error" : "d-flex"}>
                    <EntityPropertyTreeSelect
                      propertyDropdownOptions={entityTypeDefinition.properties}
                      entityDefinitionsArray={curationOptions.entityDefinitionsArray}
                      value={property}
                      onValueSelected={handleProperty}
                    />
                    <div className={"p-2 d-flex align-items-center"}>
                      <HCTooltip text={MergeRuleTooltips.disabledProperties} id="property-name-tooltip" placement="top">
                        <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                      </HCTooltip>
                    </div>
                  </Col>
                  <Col xs={12} className={styles.validationError}>
                    {propertyErrorMessage}
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className={"mb-3"}>
              <FormLabel column lg={3}>
                {<span aria-label="formItem-MergeType">Merge Type:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
              </FormLabel>
              <Col>
                <Row>
                  <Col className={mergeTypeErrorMessage ? "d-flex has-error" : "d-flex"}>
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
                  </Col>
                  <Col xs={12} className={styles.validationError}>
                    {mergeTypeErrorMessage}
                  </Col>
                </Row>
              </Col>
            </Row>
            {mergeType === "Custom" ?
              <>
                <Row className={"mb-3"}>
                  <FormLabel column lg={3}>
                    {<span aria-label="formItem-URI">URI:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
                  </FormLabel>
                  <Col>
                    <Row>
                      <Col className={(uri || !uriTouched) ? "d-flex" : "d-flex has-error"}>
                        <HCInput
                          id="uri"
                          placeholder="Enter URI"
                          size="sm"
                          value={uri}
                          onChange={handleChange}
                          //disabled={props.canReadMatchMerge && !props.canWriteMatchMerge}
                          className={styles.input}
                          ariaLabel="uri-input"
                        />
                        <div className={"p-2 d-flex align-items-center"}>
                          <HCTooltip text={MergeRuleTooltips.uri} id="uri-tooltip" placement="top">
                            <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                          </HCTooltip>
                        </div>
                      </Col>
                      <Col xs={12} className={styles.validationError}>
                        {(uri || !uriTouched) ? "" : "URI is required"}
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className={"mb-3"}>
                  <FormLabel column lg={3}>
                    {<span aria-label="formItem-function">Function:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
                  </FormLabel>
                  <Col>
                    <Row>
                      <Col className={(functionValue || !functionValueTouched) ? "d-flex" : "d-flex has-error"}>
                        <HCInput
                          id="function"
                          placeholder="Enter function"
                          size="sm"
                          value={functionValue}
                          onChange={handleChange}
                          //disabled={props.canReadMatchMerge && !props.canWriteMatchMerge}
                          className={styles.input}
                          ariaLabel="function-input"
                        />
                        <div className={"p-2 d-flex align-items-center"}>
                          <HCTooltip text={MergeRuleTooltips.function} id="function-tooltip" placement="top">
                            <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                          </HCTooltip>
                        </div>
                      </Col>
                      <Col xs={12} className={styles.validationError}>
                        {(functionValue || !functionValueTouched) ? "" : "Function is required"}
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className={"mb-3"}>
                  <FormLabel column lg={3}>
                    {<span aria-label="formItem-namespace">Namespace:</span>}
                  </FormLabel>
                  <Col className={"d-flex"}>
                    <HCInput
                      id="namespace"
                      placeholder="Enter namespace"
                      size="sm"
                      value={namespace}
                      onChange={handleChange}
                      //disabled={props.canReadMatchMerge && !props.canWriteMatchMerge}
                      className={styles.input}
                      ariaLabel="namespace-input"
                    />
                    <div className={"p-2 d-flex align-items-center"}>
                      <HCTooltip text={MergeRuleTooltips.namespace} id="namespace-tooltip" placement="top">
                        <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                      </HCTooltip>
                    </div>
                  </Col>
                </Row>
              </> : ""
            }
            {mergeType === "Strategy" ?
              <Row className={"mb-3"}>
                <FormLabel column lg={3}>
                  {<span aria-label="formItem-strategyName">Strategy Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
                </FormLabel>
                <Col>
                  <Row>
                    <Col className={strategyNameErrorMessage ? "d-flex has-error" : "d-flex"}>
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
                    </Col>
                    <Col xs={12} className={styles.validationError}>
                      {strategyNameErrorMessage ? strategyNameErrorMessage : ""}
                    </Col>
                  </Row>
                </Col>
              </Row>
              : ""
            }
            {mergeType === "Property-specific" ?
              <>
                <Row className={"mb-3"}>
                  <FormLabel column lg={3}>{"Max Values:"}</FormLabel>
                  <Col className={"d-flex"}>
                    <Radio.Group className={styles.radioAnt} value={radioValuesOptionClicked} onChange={handleChange} name="maxValues">
                      <Radio className={styles.radioAnt} value={1}> All</Radio>
                      <Radio className={styles.radioAnt} value={2}>
                        <HCInput id="maxValuesRuleInput" value={maxValueRuleInput} placeholder={"Enter max values"} onChange={handleChange} className={styles.maxInput}/>
                      </Radio>
                    </Radio.Group>
                    <div className={"d-flex align-items-center"}>
                      <HCTooltip text={MergeRuleTooltips.maxValues} id="max-values-tooltip" placement="top">
                        <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                      </HCTooltip>
                    </div>
                  </Col>
                </Row>
                <Row className={"mb-3"}>
                  <FormLabel column lg={3}>{"Max Sources:"}</FormLabel>
                  <Col className={"d-flex"}>
                    <Radio.Group className={styles.radioAnt} value={radioSourcesOptionClicked} onChange={handleChange} name="maxSources">
                      <Radio className={styles.radioAnt} value={1} > All</Radio>
                      <Radio className={styles.radioAnt} value={2} >
                        <HCInput id="maxSourcesRuleInput" value={maxSourcesRuleInput} onChange={handleChange} placeholder={"Enter max sources"} className={styles.maxInput}/>
                      </Radio>
                    </Radio.Group>
                    <div className={"d-flex align-items-center"}>
                      <HCTooltip text={MergeRuleTooltips.maxSources} id="max-sources-tooltip" placement="top">
                        <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                      </HCTooltip>
                    </div>
                  </Col>
                </Row>
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
                    <div><span className={styles.enableStrategySwitch}><b>Enable Merge Strategy Scale </b></span><Switch aria-label="mergeStrategy-scale-switch" defaultChecked={false} onChange={(e) => toggleDisplayPriorityOrderTimeline(e)}></Switch>
                      <span>
                        <HCTooltip text={MergeRuleTooltips.strategyScale} id="priority-order-tooltip" placement="right">
                          <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                        </HCTooltip>
                      </span></div>
                    {displayPriorityOrderTimeline ? renderPriorityOrderTimeline() : renderDefaultPriorityOrderTimeline()}
                  </div>
                </div>
                {deletePriorityModal}
              </> : ""
            }
            <Row className={`my-3 ${styles.submitButtonsForm}`}>
              <Col className={"d-flex"}>
                <div className={styles.submitButtons}>
                  <HCButton aria-label={"cancel-merge-rule"} variant="outline-light" onClick={() => onCancel()}>Cancel</HCButton>&nbsp;&nbsp;
                  <HCButton aria-label={"confirm-merge-rule"} id={"saveButton"} variant="primary" onClick={handleSubmit} >Save</HCButton>
                </div>
              </Col>
            </Row>
          </Form>
          {discardChanges}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default MergeRuleDialog;
