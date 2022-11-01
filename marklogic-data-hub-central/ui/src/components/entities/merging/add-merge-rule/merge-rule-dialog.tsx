import {Row, Col, Modal, Form, FormLabel, FormCheck} from "react-bootstrap";
import Select, {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import React, {useState, useContext, useEffect} from "react";
import styles from "./merge-rule-dialog.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import EntityPropertyTreeSelect from "../../../entity-property-tree-select/entity-property-tree-select";
import {Definition} from "../../../../types/modeling-types";
import {CurationContext} from "@util/curation-context";
import arrayIcon from "../../../../assets/icon_array.png";
import {MergeRuleTooltips, multiSliderTooltips} from "@config/tooltips.config";
import {MergingStep, defaultPriorityOption} from "../../../../types/curation-types";
import {updateMergingArtifact, getMergingRulesWarnings} from "@api/merging";
import {addSliderOptions, parsePriorityOrder, handleDeleteSliderOptions} from "@util/priority-order-conversion";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {ConfirmYesNo, HCInput, HCAlert, HCButton, HCTooltip, HCModal} from "@components/common";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import TimelineVis from "../../matching/matching-step-detail/timeline-vis/timeline-vis";
import TimelineVisDefault from "../../matching/matching-step-detail/timeline-vis-default/timeline-vis-default";
import MergeDeleteModal from "../merge-delete-modal/merge-delete-modal";
import {themeColors} from "@config/themes.config";

dayjs.extend(duration);

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
  const [priorityOrderTouched, setPriorityOrderTouched] = useState(false);

  const titleLegend = <div className={styles.titleLegend}>
    <div data-testid="multipleIconLegend" className={styles.legendText}><img className={styles.arrayImage} src={arrayIcon} alt={""} /> Multiple</div>
    <div data-testid="structuredIconLegend" className={styles.legendText}><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup} /> Structured</div>
  </div>;

  const mergeTypes = ["Custom", "Strategy", "Property-specific"];
  const mergeTypeOptions = mergeTypes.map(elem => ({value: elem, label: elem}));
  const dropdownTypes = ["Length"].concat(props.sourceNames);
  const dropdownTypeOptions = dropdownTypes.map(elem => ({value: elem, label: elem}));


  useEffect(() => {
    if (props.createEditMergeRuleDialog) {
      let mergeStrategies = curationOptions.activeStep.stepArtifact.mergeStrategies;
      let defaultStrategy = mergeStrategies.filter(strategy => strategy.default);
      if (defaultStrategy.length > 0) {
        setStrategyValue(defaultStrategy[0].strategyName);
      }
    }
  }, [props.createEditMergeRuleDialog]);


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
            if (mergeRule.priorityOrder.hasOwnProperty("timeWeight")) {
              const priorityOrderTimeObject = {
                id: mergeRule.entityPropertyPath + ":Timestamp:",
                start: mergeRule.priorityOrder.timeWeight,
                value: "Timestamp:" + mergeRule.priorityOrder.timeWeight.toString(),
              };
              priorityOrderRuleOptions[0] = priorityOrderTimeObject;
            }
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
    let editPriorityName = id.split(":")[1];
    for (let priorityOption of priorityOrderOptions) {
      let value = priorityOption.value;
      let priorityName;
      if (value.split(":")[0] === "Length") priorityName = "Length";
      else priorityName = value.split(":")[0];
      if (priorityName === editPriorityName) {
        let name = priorityName + ":" + parseInt(newValue);
        priorityOption.start = parseInt(newValue);
        priorityOption.value = name;
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
      if (item.start >= 0 && item.start <= 100) {
        setPriorityOrderTouched(true);
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
    },
    format: {
      minorLabels: function (date, scale, step) {
        let time;
        if (date >= 0 && date <= 100) {
          time = parseInt(date.format("SSS"));
          return dayjs.duration(time).asMilliseconds();
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
    setPriorityOrderTouched(false);
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
      if (!propertyTouched && !mergeTypeTouched && !checkPropertySpecificValues && !priorityOrderTouched) {
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
      && !maxSourcesRuleInputTouched
      && !maxValueRuleInputTouched
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

  const handleMergeType = (selectedItem) => {
    if (selectedItem.value === " ") {
      setMergeTypeTouched(false);
    } else {
      setMergeTypeTouched(true);
      setMergeType(selectedItem.value);
    }
  };

  const handleDropDownOptions = (selectedItem) => {
    if (selectedItem.value === " ") {
      setDropdownOptionTouched(false);
    } else {
      setDropdownOptionTouched(true);
      setDropdownOption(selectedItem.value);
    }
  };

  const handleStrategyNameOptions = (selectedItem) => {
    if (!selectedItem.value || selectedItem.value === " ") {
      setStrategyValueTouched(false);
    } else {
      setStrategyValueTouched(true);
      setStrategyValue(selectedItem.value);
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
        setMaxSourcesRuleInput(event.target.value);
        setRadioSourcesOptionClicked(2);
      }
    } else if (event.target.name === "maxValues") {
      setMaxValueRuleInputTouched(true);
      setRadioValuesOptionClicked(parseInt(event.target.value));
      if (event.target.value === 1) {
        setMaxValueRuleInput("");
      }
    } else if (event.target.name === "maxSources") {
      setMaxSourcesRuleInputTouched(true);
      setRadioSourcesOptionClicked(parseInt(event.target.value));
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
    priorityOrderOptions.map((option) => {
      if (option.id.split(":")[0] === "Length" && dropdownOption === "Length") {
        setPriorityOrderTouched(false);
      } else setPriorityOrderTouched(true);
    });
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
    labelNo="DiscardChangesNoButton"
    labelYes="DiscardChangesYesButton"
  />;

  const MenuList  = (props) => (
    <div id="mergeType-select-MenuList">
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const mergeStrategyOptions = mergeStrategyNames.map(strategyName => ({value: strategyName, label: strategyName}));

  return (
    <HCModal
      show={props.createEditMergeRuleDialog}
      size={"xl"}
      onHide={onCancel}
    >
      <Modal.Header>
        <span className={"fs-5"}>
          {props.isEditRule ? "Edit Merge Rule" : "Add Merge Rule"}
        </span>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body>
        {validationWarnings && validationWarnings.length > 0 ? (
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
                      isForMerge={true}
                      propertyDropdownOptions={entityTypeDefinition.properties}
                      entityDefinitionsArray={curationOptions.entityDefinitionsArray}
                      value={property}
                      onValueSelected={handleProperty}
                    />
                    <div className={"p-2 d-flex align-items-center"}>
                      <HCTooltip text={MergeRuleTooltips.disabledProperties} id="property-name-tooltip" placement="top">
                        <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
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
                    <div className={styles.input}>
                      <Select
                        id="mergeType-select-wrapper"
                        inputId="mergeType"
                        components={{MenuList}}
                        placeholder="Select merge type"
                        value={mergeTypeOptions.find(oItem => oItem.value === mergeType)}
                        onChange={handleMergeType}
                        aria-label="mergeType-select"
                        options={mergeTypeOptions}
                        styles={reactSelectThemeConfig}
                        formatOptionLabel={({value, label}) => {
                          return (
                            <span data-testid={`mergeTypeOptions-${value}`}>
                              {label}
                            </span>
                          );
                        }}
                      />
                    </div>
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
                            <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
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
                            <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
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
                        <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
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
                      <div className={styles.input}>
                        <Select
                          id="strategyName-select-wrapper"
                          inputId="strategyName"
                          placeholder="Select strategy name"
                          value={mergeStrategyOptions.find(oItem => oItem.value === strategyValue)}
                          onChange={handleStrategyNameOptions}
                          aria-label="strategy-name-select"
                          options={mergeStrategyOptions}
                          styles={reactSelectThemeConfig}
                          formatOptionLabel={({value, label}) => {
                            return (
                              <span data-testid={`strategyNameOptions-${value}`}>
                                {label}
                              </span>
                            );
                          }}
                        />
                      </div>
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
                  <Col className={"d-flex align-items-center"}>
                    <Form.Check
                      inline
                      id={"maxValues_all"}
                      name={"maxValues"}
                      type={"radio"}
                      onChange={handleChange}
                      checked={radioValuesOptionClicked === 1}
                      label={"All"}
                      value={1}
                      aria-label="maxValuesAllRadio"
                      className={"mb-0 flex-shrink-0"}
                    />
                    <Form.Check type={"radio"} id={"maxValues_val"} className={"d-flex align-items-center me-3"}>
                      <Form.Check.Input type={"radio"} name={"maxValues"} onChange={handleChange} value={2} checked={radioValuesOptionClicked === 2} className={"me-2 flex-shrink-0"} aria-label="maxValuesOtherRadio"/>
                      <HCInput id="maxValuesRuleInput" value={maxValueRuleInput} placeholder={"Enter max values"} onChange={handleChange} className={styles.maxInput}/>
                    </Form.Check>
                    <div className={"d-flex align-items-center"}>
                      <HCTooltip text={MergeRuleTooltips.maxValues} id="max-values-tooltip" placement="top">
                        <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                      </HCTooltip>
                    </div>
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
                      checked={radioSourcesOptionClicked === 1}
                      label={"All"}
                      value={1}
                      aria-label="maxSourcesAllRadio"
                      className={"mb-0 flex-shrink-0"}
                    />
                    <Form.Check type={"radio"} id={"maxSources_val"} className={"d-flex align-items-center me-3"}>
                      <Form.Check.Input type={"radio"} name={"maxSources"} onChange={handleChange} value={2} checked={radioSourcesOptionClicked === 2} className={"me-2 flex-shrink-0"}  aria-label="maxSourcesOtherRadio"/>
                      <HCInput id="maxSourcesRuleInput" value={maxSourcesRuleInput} onChange={handleChange} placeholder={"Enter max sources"} className={styles.maxInput}/>
                    </Form.Check>
                    <div className={"d-flex align-items-center"}>
                      <HCTooltip text={MergeRuleTooltips.maxSources} id="max-sources-tooltip" placement="top">
                        <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                      </HCTooltip>
                    </div>
                  </Col>
                </Row>
                <div className={styles.priorityOrderContainer} data-testid={"priorityOrderSlider"}>
                  <div>
                    <p className={styles.priorityText}>Priority Order
                      <HCTooltip text={multiSliderTooltips.priorityOrder} id="priority-order-tooltip" placement="right">
                        <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
                      </HCTooltip>
                    </p>
                  </div>
                  <div className={styles.addButtonContainer}>
                    <div style={{width: "150px"}}>
                      <Select
                        id="dropdownOptions-select-wrapper"
                        inputId="dropdownOptions"
                        placeholder=""
                        value={dropdownTypeOptions.find(oItem => oItem.value === dropdownOption)}
                        onChange={handleDropDownOptions}
                        // isDisabled={!canWriteMatchMerge} //this was commented in previous version changed property but keep commented
                        aria-label="dropdownOptions-select"
                        options={dropdownTypeOptions}
                        styles={reactSelectThemeConfig}
                        formatOptionLabel={({value, label}) => {
                          return (
                            <span data-testid={`dropdownTypeOptions-${value}`}>
                              {label}
                            </span>
                          );
                        }}
                      />
                    </div>
                    <HCButton aria-label="add-slider-button" variant="primary" className={styles.addSliderButton} onClick={onAddOptions}>Add</HCButton>
                  </div>
                  <div>
                    <div className="d-flex pe-2 align-items-center"><span className={styles.enableStrategySwitch}><b>Enable Priority Order Scale </b></span><FormCheck type="switch" aria-label="mergeStrategy-scale-switch" defaultChecked={false} onChange={({target}) => toggleDisplayPriorityOrderTimeline(target.checked)} className={styles.switchToggleMergeStrategy}></FormCheck>
                      <span>
                        <HCTooltip text={MergeRuleTooltips.strategyScale} id="priority-order-tooltip" placement="right">
                          <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} aria-label="icon: question-circle"/>
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
    </HCModal>
  );
};

export default MergeRuleDialog;
