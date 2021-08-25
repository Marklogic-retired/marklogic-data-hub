import React, {useState, useEffect, useContext} from "react";
import {Modal, Form, Input, Switch, Button, Select} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import styles from "./ruleset-single-modal.module.scss";
import "./ruleset-single-modal.scss";
import arrayIcon from "../../../../assets/icon_array.png";

import EntityPropertyTreeSelect from "../../../entity-property-tree-select/entity-property-tree-select";
import ConfirmYesNo from "../../../common/confirm-yes-no/confirm-yes-no";

import {CurationContext} from "../../../../util/curation-context";
import {MatchingStep, MatchRule, MatchRuleset} from "../../../../types/curation-types";
import {Definition} from "../../../../types/modeling-types";
import {MatchingStepTooltips} from "../../../../config/tooltips.config";
import {updateMatchingArtifact} from "../../../../api/matching";
import DeleteModal from "../delete-modal/delete-modal";
import HCTooltip from "../../../common/hc-tooltip/hc-tooltip";
import {QuestionCircleFill} from "react-bootstrap-icons";

type Props = {
  editRuleset: any;
  isVisible: boolean;
  toggleModal: (isVisible: boolean) => void;

};



const DEFAULT_ENTITY_DEFINITION: Definition = {
  name: "",
  properties: []
};

const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
};

const MATCH_TYPE_OPTIONS = [
  {name: "Exact", value: "exact"},
  {name: "Synonym", value: "synonym"},
  {name: "Double Metaphone", value: "doubleMetaphone"},
  {name: "Zip", value: "zip"},
  {name: "Custom", value: "custom"},
];

const {Option} = Select;

const MatchRulesetModal: React.FC<Props> = (props) => {
  const {curationOptions, updateActiveStepArtifact} = useContext(CurationContext);

  const [entityTypeDefinition, setEntityTypeDefinition] = useState<Definition>(DEFAULT_ENTITY_DEFINITION);

  const [selectedProperty, setSelectedProperty] = useState<string | undefined>(undefined);
  const [propertyTypeErrorMessage, setPropertyTypeErrorMessage] = useState("");
  const [isPropertyTypeTouched, setIsPropertyTypeTouched] = useState(false);

  const [matchType, setMatchType] = useState<string | undefined>(undefined);
  const [matchTypeErrorMessage, setMatchTypeErrorMessage] = useState("");
  const [isMatchTypeTouched, setIsMatchTypeTouched] = useState(false);

  const [thesaurusValue, setThesaurusValue] = useState("");
  const [thesaurusErrorMessage, setThesaurusErrorMessage] = useState("");
  const [isThesaurusTouched, setIsThesaurusTouched] = useState(false);

  const [filterValue, setFilterValue] = useState("");
  const [isFilterTouched, setIsFilterTouched] = useState(false);

  const [dictionaryValue, setDictionaryValue] = useState("");
  const [dictionaryErrorMessage, setDictionaryErrorMessage] = useState("");
  const [isDictionaryTouched, setIsDictionaryTouched] = useState(false);

  const [distanceThresholdValue, setDistanceThresholdValue] = useState("");
  const [distanceThresholdErrorMessage, setDistanceThresholdErrorMessage] = useState("");
  const [isDistanceTouched, setIsDistanceTouched] = useState(false);

  const [uriValue, setUriValue] = useState("");
  const [uriErrorMessage, setUriErrorMessage] = useState("");
  const [isUriTouched, setIsUriTouched] = useState(false);

  const [functionValue, setFunctionValue] = useState("");
  const [functionErrorMessage, setFunctionErrorMessage] = useState("");
  const [isFunctionTouched, setIsFunctionTouched] = useState(false);
  const [showDeleteConfirmModal, toggleDeleteConfirmModal] = useState(false);
  const [namespaceValue, setNamespaceValue] = useState("");
  const [isNamespaceTouched, setIsNamespaceTouched] = useState(false);
  const [discardChangesVisible, setDiscardChangesVisible] = useState(false);
  const [reduceValue, setReduceValue] = useState(false);

  let curationRuleset = props.editRuleset ;
  if (props.editRuleset.hasOwnProperty("index")) {
    let index = props.editRuleset.index;
    curationRuleset = ({...curationOptions.activeStep.stepArtifact.matchRulesets[props.editRuleset.index], index});
  }

  useEffect(() => {
    if (props.isVisible && curationOptions.entityDefinitionsArray.length > 0 && curationOptions.activeStep.entityName !== "") {
      let entityTypeDefinition: Definition = curationOptions.entityDefinitionsArray.find(entityDefinition => entityDefinition.name === curationOptions.activeStep.entityName) || DEFAULT_ENTITY_DEFINITION;
      setEntityTypeDefinition(entityTypeDefinition);
    }

    if (Object.keys(curationRuleset).length !== 0 && props.isVisible) {
      let editRuleset = curationRuleset;
      setSelectedProperty(editRuleset.name.split(" ")[0].split(".").join(" > "));
      let matchType = editRuleset["matchRules"][0]["matchType"];
      if (editRuleset.reduce) {
        setReduceValue(true);
      }
      setMatchType(matchType);
      if (matchType === "custom") {
        setUriValue(editRuleset["matchRules"][0]["algorithmModulePath"]);
        setFunctionValue(editRuleset["matchRules"][0]["algorithmFunction"]);
        setNamespaceValue(editRuleset["matchRules"][0]["algorithmModuleNamespace"]);

      } else if (matchType === "doubleMetaphone") {
        setDictionaryValue(editRuleset["matchRules"][0]["options"]["dictionaryURI"]);
        setDistanceThresholdValue(editRuleset["matchRules"][0]["options"]["distanceThreshold"]);

      } else if (matchType === "synonym") {
        setThesaurusValue(editRuleset["matchRules"][0]["options"]["thesaurusURI"]);
        setFilterValue(editRuleset["matchRules"][0]["options"]["filter"]);

      }
    }
  }, [props.isVisible]);

  const handleInputChange = (event) => {
    switch (event.target.id) {
    case "thesaurus-uri-input":
      if (event.target.value === "") {
        setIsThesaurusTouched(false);
        setThesaurusErrorMessage("A thesaurus URI is required");
      } else {
        setThesaurusErrorMessage("");
      }
      setIsThesaurusTouched(true);
      setThesaurusValue(event.target.value);
      break;

    case "filter-input":
      setIsFilterTouched(true);
      setFilterValue(event.target.value);
      break;

    case "dictionary-uri-input":
      if (event.target.value === "") {
        setIsDictionaryTouched(false);
        setDictionaryErrorMessage("A dictionary URI is required");
      } else {
        setDictionaryErrorMessage("");
      }
      setIsDictionaryTouched(true);
      setDictionaryValue(event.target.value);
      break;

    case "distance-threshold-input":
      if (event.target.value === "") {
        setIsDistanceTouched(false);
        setDistanceThresholdErrorMessage("A distance threshold is required");
      } else {
        setDistanceThresholdErrorMessage("");
      }
      setIsDistanceTouched(true);
      setDistanceThresholdValue(event.target.value);
      break;

    case "uri-input":
      if (event.target.value === "") {
        setIsUriTouched(false);
        setUriErrorMessage("A URI is required");
      } else {
        setUriErrorMessage("");
      }
      setIsUriTouched(true);
      setUriValue(event.target.value);
      break;

    case "function-input":
      if (event.target.value === "") {
        setIsFunctionTouched(false);
        setFunctionErrorMessage("A function is required");
      } else {
        setFunctionErrorMessage("");
      }
      setIsFunctionTouched(true);
      setFunctionValue(event.target.value);
      break;

    case "namespace-input":
      setIsNamespaceTouched(true);
      setNamespaceValue(event.target.value);
      break;

    default:
      break;
    }
  };

  const closeModal = () => {
    if (hasFormChanged()) {
      setDiscardChangesVisible(true);
    } else {
      resetModal();
      props.toggleModal(false);
    }
  };

  const resetModal = () => {
    setSelectedProperty(undefined);
    setMatchType(undefined);
    setReduceValue(false);
    setPropertyTypeErrorMessage("");
    setMatchTypeErrorMessage("");
    setThesaurusValue("");
    setThesaurusErrorMessage("");
    setFilterValue("");
    setDictionaryValue("");
    setDictionaryErrorMessage("");
    setDistanceThresholdValue("");
    setDistanceThresholdErrorMessage("");
    setUriValue("");
    setUriErrorMessage("");
    setFunctionValue("");
    setFunctionErrorMessage("");
    setNamespaceValue("");
    resetTouched();
  };

  const resetTouched = () => {
    setDiscardChangesVisible(false);
    setIsPropertyTypeTouched(false);
    setIsMatchTypeTouched(false);
    setIsThesaurusTouched(false);
    setIsFilterTouched(false);
    setIsDictionaryTouched(false);
    setIsDistanceTouched(false);
    setIsUriTouched(false);
    setIsFunctionTouched(false);
    setIsNamespaceTouched(false);
    setReduceValue(false);
  };

  const getSelectedPropertyValue = (selectedProperty) => {
    return selectedProperty ? selectedProperty.split(" > ").join(".") : "";
  };

  const onSubmit = (event) => {
    event.preventDefault();
    let propertyErrorMessage = "";
    let matchErrorMessage = "";
    let rulesetName = "";
    let propertyName = getSelectedPropertyValue(selectedProperty) || "";

    if (selectedProperty === "" || selectedProperty === undefined) {
      propertyErrorMessage = "A property to match is required";
    }
    if (matchType === "" || matchType === undefined) {
      matchErrorMessage = "A match type is required";
    } else {
      rulesetName = `${propertyName} - ${matchType.charAt(0).toUpperCase() + matchType.slice(1)}`;
    }

    switch (matchType) {
    case "exact":
    case "zip":
    {
      let matchRule: MatchRule = {
        entityPropertyPath: propertyName,
        matchType: matchType,
        options: {}
      };

      let matchRuleset: MatchRuleset = {
        name: rulesetName,
        weight: Object.keys(curationRuleset).length !== 0 ? curationRuleset["weight"] : 0,
        ...({reduce: reduceValue}),
        matchRules: [matchRule]
      };

      if (propertyErrorMessage === "" && matchErrorMessage === "") {
        updateStepArtifact(matchRuleset);
        props.toggleModal(false);
        resetModal();
      }
      break;
    }

    case "synonym":
    {
      let thesaurusErrorMessage = "";
      if (thesaurusValue === "") {
        thesaurusErrorMessage = "A thesaurus URI is required";
      }

      let synonymMatchRule: MatchRule = {
        entityPropertyPath: propertyName,
        matchType: matchType,
        options: {
          thesaurusURI: thesaurusValue,
          filter: filterValue
        }
      };

      let matchRuleset: MatchRuleset = {
        name: rulesetName,
        weight: Object.keys(curationRuleset).length !== 0 ? curationRuleset["weight"] : 0,
        ...({reduce: reduceValue}),
        matchRules: [synonymMatchRule]
      };

      if (thesaurusErrorMessage === "" && propertyErrorMessage === "") {
        updateStepArtifact(matchRuleset);
        props.toggleModal(false);
        resetModal();
      }
      setThesaurusErrorMessage(thesaurusErrorMessage);
      break;
    }

    case "doubleMetaphone":
    {
      let dictionaryUriErrorMessage = "";
      if (dictionaryValue === "") {
        dictionaryUriErrorMessage = "A dictionary URI is required";
      }

      let distanceThresholdErrorMessage = "";
      if (distanceThresholdValue === "") {
        distanceThresholdErrorMessage = "A distance threshold is required";
      }

      rulesetName = `${propertyName} - Double Metaphone`;

      let doubleMetaphoneMatchRule: MatchRule = {
        entityPropertyPath: propertyName,
        matchType: matchType,
        options: {
          dictionaryURI: dictionaryValue,
          distanceThreshold: distanceThresholdValue
        }
      };

      let matchRuleset: MatchRuleset = {
        name: rulesetName,
        weight: Object.keys(curationRuleset).length !== 0 ? curationRuleset["weight"] : 0,
        ...({reduce: reduceValue}),
        matchRules: [doubleMetaphoneMatchRule]
      };

      if (propertyErrorMessage === "" && dictionaryUriErrorMessage === "" && distanceThresholdErrorMessage === "") {
        updateStepArtifact(matchRuleset);
        props.toggleModal(false);
        resetModal();
      }
      setDictionaryErrorMessage(dictionaryUriErrorMessage);
      setDistanceThresholdErrorMessage(distanceThresholdErrorMessage);
      break;
    }

    case "custom":
    {
      let uriErrorMessage = "";
      if (uriValue === "") {
        uriErrorMessage = "A URI is required";
      }

      let functionErrorMessage = "";
      if (functionValue === "") {
        functionErrorMessage = "A function is required";
      }

      let customMatchRule: MatchRule = {
        entityPropertyPath: propertyName,
        matchType: matchType,
        algorithmModulePath: uriValue,
        algorithmFunction: functionValue,
        algorithmModuleNamespace: namespaceValue,
        options: {}
      };

      let matchRuleset: MatchRuleset = {
        name: rulesetName,
        weight: Object.keys(curationRuleset).length !== 0 ? curationRuleset["weight"] : 0,
        ...({reduce: reduceValue}),
        matchRules: [customMatchRule]
      };

      if (propertyErrorMessage === "" && uriErrorMessage === "" && functionErrorMessage === "") {
        updateStepArtifact(matchRuleset);
        props.toggleModal(false);
        resetModal();
      }
      setUriErrorMessage(uriErrorMessage);
      setFunctionErrorMessage(functionErrorMessage);
      break;
    }

    default:
      break;
    }
    setMatchTypeErrorMessage(matchErrorMessage);
    setPropertyTypeErrorMessage(propertyErrorMessage);
  };

  const onPropertySelect = (value: string | undefined) => {
    setPropertyTypeErrorMessage("");
    setIsPropertyTypeTouched(true);
    setSelectedProperty(value);
  };

  const onMatchTypeSelect = (value: string) => {
    setMatchTypeErrorMessage("");
    setIsMatchTypeTouched(true);
    setMatchType(value);
  };

  const updateStepArtifact = async (matchRuleset: MatchRuleset) => {
    // avoid triggering update of active step prior to persisting the database
    let updateStep: MatchingStep = {...curationOptions.activeStep.stepArtifact};
    updateStep.matchRulesets = [...updateStep.matchRulesets];
    if (Object.keys(curationRuleset).length !== 0) {
      // edit match step
      updateStep.matchRulesets[curationRuleset["index"]] = matchRuleset;
    } else {
      // add match step
      if (updateStep.matchRulesets) { updateStep.matchRulesets.push(matchRuleset); }
    }
    let success = await updateMatchingArtifact(updateStep);
    if (success) {
      updateActiveStepArtifact(updateStep);
    }
  };

  const hasFormChanged = () => {
    if (matchType ===  "custom") {
      let checkCustomValues = hasCustomFormValuesChanged();
      if (!isPropertyTypeTouched
        && !isMatchTypeTouched
        && !checkCustomValues
      ) {
        return false;
      } else {
        return true;
      }
    } else if (matchType === "synonym") {
      let checkSynonymValues = hasSynonymFormValuesChanged();
      if (!isPropertyTypeTouched
        && !isMatchTypeTouched
        && !checkSynonymValues
      ) {
        return false;
      } else {
        return true;
      }
    } else if (matchType === "doubleMetaphone") {
      let checkDoubleMetaphoneValues = hasDoubleMetaphoneFormValuesChanged();
      if (!isPropertyTypeTouched
        && !isMatchTypeTouched
        && !checkDoubleMetaphoneValues
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      if (!isPropertyTypeTouched && !isMatchTypeTouched) {
        return false;
      } else {
        return true;
      }
    }
  };

  const hasCustomFormValuesChanged = () => {
    if (!isUriTouched
      && !isFunctionTouched
      && !isNamespaceTouched
    ) {
      return false;
    } else {
      return true;
    }
  };

  const hasSynonymFormValuesChanged = () => {
    if (!isThesaurusTouched
      && !isFilterTouched
    ) {
      return false;
    } else {
      return true;
    }
  };

  const hasDoubleMetaphoneFormValuesChanged = () => {
    if (!isDictionaryTouched
      && !isDistanceTouched
    ) {
      return false;
    } else {
      return true;
    }
  };

  const discardOk = () => {
    resetModal();
    props.toggleModal(false);
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

  const renderMatchOptions = MATCH_TYPE_OPTIONS.map((matchType, index) => {
    return <Option key={index} value={matchType.value} aria-label={`${matchType.value}-option`}>{matchType.name}</Option>;
  });

  const renderSynonymOptions = (
    <>
      <Form.Item
        className={styles.formItem}
        label={<span>
          Thesaurus URI:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
        </span>}
        colon={false}
        labelAlign="left"
        validateStatus={thesaurusErrorMessage ? "error" : ""}
        help={thesaurusErrorMessage}
      >
        <Input
          id="thesaurus-uri-input"
          aria-label="thesaurus-uri-input"
          placeholder="Enter thesaurus URI"
          className={styles.input}
          value={thesaurusValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <HCTooltip text={MatchingStepTooltips.thesaurusUri} id="thesaurus-uri-tooltip" placement="top">
          <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} aria-label="icon: question-circle"/>
        </HCTooltip>
      </Form.Item>
      <Form.Item
        className={styles.formItem}
        label={<span>Filter:</span>}
        colon={false}
        labelAlign="left"
      >
        <Input
          id="filter-input"
          aria-label="filter-input"
          placeholder="Enter a node in the thesaurus to use as a filter"
          className={styles.input}
          value={filterValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <HCTooltip text={MatchingStepTooltips.filter} id="filter-tooltip" placement="top">
          <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} aria-label="icon: question-circle"/>
        </HCTooltip>
      </Form.Item>
    </>
  );

  const renderDoubleMetaphoneOptions = (
    <>
      <Form.Item
        className={styles.formItem}
        label={<span>
          Dictionary URI:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
        </span>}
        colon={false}
        labelAlign="left"
        validateStatus={dictionaryErrorMessage ? "error" : ""}
        help={dictionaryErrorMessage}
      >
        <Input
          id="dictionary-uri-input"
          aria-label="dictionary-uri-input"
          placeholder="Enter dictionary URI"
          className={styles.input}
          value={dictionaryValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <HCTooltip text={MatchingStepTooltips.dictionaryUri} id="dictionary-uri-tooltip" placement="top">
          <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} aria-label="icon: question-circle"/>
        </HCTooltip>
      </Form.Item>
      <Form.Item
        className={styles.formItem}
        label={<span>
          Distance Threshold:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
        </span>}
        colon={false}
        labelAlign="left"
        validateStatus={distanceThresholdErrorMessage ? "error" : ""}
        help={distanceThresholdErrorMessage}
      >
        <Input
          id="distance-threshold-input"
          aria-label="distance-threshold-input"
          placeholder="Enter distance threshold"
          className={styles.input}
          value={distanceThresholdValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <HCTooltip text={MatchingStepTooltips.distanceThreshold} id="distance-threshold-tooltip" placement="top">
          <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} aria-label="icon: question-circle"/>
        </HCTooltip>
      </Form.Item>
    </>
  );

  const renderCustomOptions = (
    <>
      <Form.Item
        className={styles.formItem}
        label={<span>
          URI:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
        </span>}
        colon={false}
        labelAlign="left"
        validateStatus={uriErrorMessage ? "error" : ""}
        help={uriErrorMessage}
      >
        <Input
          id="uri-input"
          aria-label="uri-input"
          placeholder="Enter URI"
          className={styles.input}
          value={uriValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <HCTooltip text={MatchingStepTooltips.uri} id="uri-tooltip" placement="top">
          <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} aria-label="icon: question-circle"/>
        </HCTooltip>
      </Form.Item>
      <Form.Item
        className={styles.formItem}
        label={<span>
          Function:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
        </span>}
        colon={false}
        labelAlign="left"
        validateStatus={functionErrorMessage ? "error" : ""}
        help={functionErrorMessage}
      >
        <Input
          id="function-input"
          aria-label="function-input"
          placeholder="Enter a function"
          className={styles.input}
          value={functionValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <HCTooltip text={MatchingStepTooltips.function} id="function-tooltip" placement="top">
          <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} aria-label="icon: question-circle"/>
        </HCTooltip>
      </Form.Item>
      <Form.Item
        className={styles.formItem}
        label={<span>Namespace:</span>}
        colon={false}
        labelAlign="left"
      >
        <Input
          id="namespace-input"
          aria-label="namespace-input"
          placeholder="Enter a namespace"
          className={styles.input}
          value={namespaceValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <HCTooltip text={MatchingStepTooltips.namespace} id="namespace-tooltip" placement="top">
          <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} aria-label="icon: question-circle"/>
        </HCTooltip>
      </Form.Item>
    </>
  );

  const modalTitle = (
    <div>
      <div style={{fontSize: "18px"}}>{Object.keys(curationRuleset).length !== 0 ? "Edit Match Ruleset for Single Property" : "Add Match Ruleset for Single Property"}</div>
      <div className={styles.modalTitleLegend}>
        <div className={styles.legendText}><img className={styles.arrayImage} src={arrayIcon}/> Multiple</div>
        <div className={styles.legendText}><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> Structured Type</div>
      </div>
    </div>
  );

  const modalFooter = (
    <div className={styles.editFooter}>
      <Button type="link" onClick={() => { toggleDeleteConfirmModal(true); }}>
        <FontAwesomeIcon  className={styles.trashIcon} icon={faTrashAlt} />
      </Button>
      <div className={styles.footer}>
        <Button
          aria-label={`cancel-single-ruleset`}
          onClick={closeModal}
        >Cancel</Button>
        <Button
          className={styles.saveButton}
          aria-label={`confirm-single-ruleset`}
          type="primary"
          onClick={(e) => onSubmit(e)}
        >Save</Button>
      </div>
    </div>
  );

  const onToggleReduce = (checked) => {
    if (checked) {
      setReduceValue(true);
    } else {
      setReduceValue(false);
    }
  };

  const confirmAction = () => {
    props.toggleModal(false);
    resetModal();
  };


  return (
    <Modal
      visible={props.isVisible}
      destroyOnClose={true}
      closable={true}
      maskClosable={false}
      title={modalTitle}
      footer={null}
      width={700}
      onCancel={closeModal}
    >
      <Form
        {...layout}
        id="matching-single-ruleset"
        onSubmit={onSubmit}
      >
        <Form.Item>
          <span className={styles.reduceWeightText}>Reduce Weight</span>
          <Switch className={styles.reduceToggle} onChange={onToggleReduce} defaultChecked={props.editRuleset.reduce} aria-label="reduceToggle"></Switch>
          <HCTooltip text={<span aria-label="reduce-tooltip-text">{MatchingStepTooltips.reduceToggle}</span>} id="reduce-tooltip" placement="top">
            <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} aria-label="icon: question-circle"/>
          </HCTooltip>
        </Form.Item>
        <Form.Item
          className={styles.formItem}
          label={<span>
            Property to Match:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
          </span>}
          colon={false}
          labelAlign="left"
          validateStatus={propertyTypeErrorMessage ? "error" : ""}
          help={propertyTypeErrorMessage}
        >
          <EntityPropertyTreeSelect
            propertyDropdownOptions={entityTypeDefinition.properties}
            entityDefinitionsArray={curationOptions.entityDefinitionsArray}
            value={selectedProperty}
            onValueSelected={onPropertySelect}
          />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label={<span>
            Match Type:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
          </span>}
          colon={false}
          labelAlign="left"
          validateStatus={matchTypeErrorMessage ? "error" : ""}
          help={matchTypeErrorMessage}
        >
          <Select
            aria-label="match-type-dropdown"
            className={styles.matchTypeSelect}
            size="default"
            placeholder="Select match type"
            onSelect={onMatchTypeSelect}
            value={matchType}
          >
            {renderMatchOptions}
          </Select>
        </Form.Item>

        {matchType === "synonym" && renderSynonymOptions}
        {matchType === "doubleMetaphone" && renderDoubleMetaphoneOptions}
        {matchType === "custom" && renderCustomOptions}
        {modalFooter}
      </Form>
      {discardChanges}
      <DeleteModal
        isVisible={showDeleteConfirmModal}
        toggleModal={toggleDeleteConfirmModal}
        editRuleset={curationRuleset}
        confirmAction={confirmAction}
      />
    </Modal>
  );
};

export default MatchRulesetModal;
