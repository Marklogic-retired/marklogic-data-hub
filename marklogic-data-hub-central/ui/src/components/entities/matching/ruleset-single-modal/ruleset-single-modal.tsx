import React, {useState, useEffect, useContext} from "react";
import {Row, Col, Modal, Form, FormLabel, FormCheck} from "react-bootstrap";
import Select, {components as SelectComponents, components /*OptionProps*/} from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import styles from "./ruleset-single-modal.module.scss";
import "./ruleset-single-modal.scss";
import arrayIcon from "../../../../assets/icon_array.png";
import EntityPropertyTreeSelect from "../../../entity-property-tree-select/entity-property-tree-select";
import {CurationContext} from "@util/curation-context";
import {MatchingStep, MatchRule, MatchRuleset} from "../../../../types/curation-types";
import {Definition} from "../../../../types/modeling-types";
import {MatchingStepTooltips} from "@config/tooltips.config";
import {
  deleteExcludeValuesList,
  getAllExcludeValuesList,
  updateMatchingArtifact,
  getReferencesExcludeValuesList,
  validateURI
} from "@api/matching";
import DeleteModal from "../delete-modal/delete-modal";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {ConfirmYesNo, HCInput, HCButton, HCTooltip, HCModal} from "@components/common";
import {themeColors} from "@config/themes.config";
import {faCopy, faPencilAlt} from "@fortawesome/free-solid-svg-icons";
import ListModal from "../list-modal/list-modal";
import {deleteConfirmationModal} from "../../../flows/confirmation-modals";
import ConfirmationModal from "@components/confirmation-modal/confirmation-modal";
import {ConfirmationType} from "../../../../types/common-types";

type Props = {
  editRuleset: any;
  isVisible: boolean;
  sourceDatabase: string;
  toggleModal: (isVisible: boolean) => void;
};

const DEFAULT_ENTITY_DEFINITION: Definition = {
  name: "",
  properties: [],
};

const MATCH_TYPE_OPTIONS = [
  {name: "Exact", value: "exact"},
  {name: "Synonym", value: "synonym"},
  {name: "Double Metaphone", value: "doubleMetaphone"},
  {name: "Zip", value: "zip"},
  {name: "Custom", value: "custom"},
];

const presetListMock = [{name: "Preset List 0", value: []}];

const MatchRulesetModal: React.FC<Props> = props => {
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
  const [fuzzyMatching, setFuzzyMatching] = useState(false);

  const [showListModal, setShowListModal] = useState(false);
  const [actionListModal, setActionListModal] = useState("C");
  const [listName, setListName] = useState("");
  const [listValues, setListValues] = useState<string[]>([]);
  const [excludeList, setExcludeList] = useState(presetListMock);
  const [selectedExcludeList, setSelectedExcludeList] = useState<any[]>([]);
  const [selectedExcludeListToInput, setSelectedExcludeListToInput] = useState<any[]>([]);
  const [deleteConformationVisible, setDeleteConformationVisible] = useState<boolean>(false);
  const [listToDelete, setListToDelete] = useState<string>("");
  const [deleteWarning, setDeleteWarning] = useState<boolean>(false);
  const [referencesListValuesToIgnore, setReferencesListValuesToIgnore] = useState<string[]>([]);

  const sourceDatabase = props.sourceDatabase;
  let curationRuleset = props.editRuleset;
  if (props.editRuleset.hasOwnProperty("index")) {
    let index = props.editRuleset.index;
    curationRuleset = {...curationOptions.activeStep.stepArtifact.matchRulesets[props.editRuleset.index], index};
  }

  useEffect(() => {
    fetchExcludeValueList();
    if (
      props.isVisible &&
      curationOptions.entityDefinitionsArray.length > 0 &&
      curationOptions.activeStep.entityName !== ""
    ) {
      let entityTypeDefinition: Definition =
        curationOptions.entityDefinitionsArray.find(
          entityDefinition => entityDefinition.name === curationOptions.activeStep.entityName,
        ) || DEFAULT_ENTITY_DEFINITION;
      setEntityTypeDefinition(entityTypeDefinition);
    }
    if (Object.keys(curationRuleset).length !== 0 && props.isVisible) {
      let editRuleset = curationRuleset;
      setSelectedProperty(editRuleset.name.split(" ")[0].split(".").join(" > "));
      let matchType = editRuleset["matchRules"][0]["matchType"];
      if (editRuleset.reduce) {
        setReduceValue(true);
      }
      if (editRuleset.fuzzyMatch) {
        setFuzzyMatching(true);
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

  useEffect(() => {
    if (props.isVisible) {
      if (props.editRuleset.matchRules?.length > 0 && props.editRuleset.matchRules[0].exclusionLists) {
        const listToIgnore: any[] = [];
        props.editRuleset.matchRules[0].exclusionLists.forEach(item => {
          const listValue = checkIfListExists(item);
          if (listValue) {
            listToIgnore.push(listValue);
          }
        });
        setSelectedExcludeListToInput(listToIgnore);
        setSelectedExcludeList(listToIgnore.map(item => item.name));
      } else {
        setSelectedExcludeListToInput([]);
      }
    }
    return () => {
      setSelectedExcludeListToInput([]);
      setSelectedExcludeList([]);
    };
  }, [excludeList]);

  const fetchExcludeValueList = async () => {
    const excludeValuesList = await getAllExcludeValuesList();

    const fixData = excludeValuesList.data.map(item => {
      return {
        name: item.name,
        value: item.name,
        valuesIgnore: item.values,
      };
    });
    setExcludeList([presetListMock[0], ...fixData]);
  };

  const checkIfListExists = name => {
    return excludeList.find(item => item.name === name);
  };

  const isEditing = () => {
    return Object.keys(curationRuleset).length !== 0;
  };

  const checkExcludeListReference = (references: Array<string>, listNameToDelete: string) => {
    let someReferenceInTheSameStep = false;
    const containInternalReference = references.some(
      ruleSet => ruleSet === curationOptions.activeStep.stepArtifact.name,
    );
    if (containInternalReference) {
      let matchRulesets = [...curationOptions.activeStep.stepArtifact.matchRulesets];
      matchRulesets.splice(curationRuleset["index"], 1);
      matchRulesets.forEach(ruleSet => {
        if (Array.isArray(ruleSet.matchRules)) {
          ruleSet.matchRules.forEach(rule => {
            if (Array.isArray(rule.exclusionLists)) {
              someReferenceInTheSameStep = rule.exclusionLists.some(list => list === listNameToDelete);
              if (someReferenceInTheSameStep) return someReferenceInTheSameStep;
            }
          });
        }
      });
    } else {
      someReferenceInTheSameStep = true;
    }
    return someReferenceInTheSameStep;
  };

  const fetchReferencesExcludeValuesList = async (listName: string) => {
    await getReferencesExcludeValuesList(listName).then(res => {
      let references = res.data.stepNames;
      setReferencesListValuesToIgnore(res.data.stepNames);
      const checkReferences = isEditing() ? checkExcludeListReference(references, listName) : true;
      if (references?.length > 0 && checkReferences) {
        setDeleteWarning(true);
      } else {
        setListToDelete(listName);
        setDeleteConformationVisible(true);
        resetModalValuesIgnore();
      }
    });
  };

  const handleInputChange = event => {
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

  const resetModalValuesIgnore = () => {
    setListName("");
    setListValues([]);
  };

  const resetModal = () => {
    setSelectedProperty(undefined);
    setMatchType(undefined);
    setReduceValue(false);
    setFuzzyMatching(false);
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
    setFuzzyMatching(false);
  };

  const getSelectedPropertyValue = selectedProperty => {
    return selectedProperty ? selectedProperty.split(" > ").join(".") : "";
  };

  const onSubmit = async(event) => {
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
    case "zip": {
      let matchRule: MatchRule = {
        entityPropertyPath: propertyName,
        matchType: matchType,
        options: {},
        exclusionLists: selectedExcludeList,
      };

      let matchRuleset: MatchRuleset = {
        name: rulesetName,
        weight: Object.keys(curationRuleset).length !== 0 ? curationRuleset["weight"] : 0,
        ...{reduce: reduceValue},
        fuzzyMatch: fuzzyMatching,
        matchRules: [matchRule],
      };

      if (propertyErrorMessage === "" && matchErrorMessage === "") {
        updateStepArtifact(matchRuleset);
        props.toggleModal(false);
        resetModal();
      }
      break;
    }

    case "synonym": {
      let thesaurusErrorMessage = "";
      if (thesaurusValue === "") {
        thesaurusErrorMessage = "A thesaurus URI is required";
      } else {
        const uriError = await validateURI(thesaurusValue, sourceDatabase);
        if (uriError) {
          thesaurusErrorMessage = uriError;
        }
      }

      let synonymMatchRule: MatchRule = {
        entityPropertyPath: propertyName,
        matchType: matchType,
        options: {
          thesaurusURI: thesaurusValue,
          filter: filterValue,
        },
        exclusionLists: selectedExcludeList,
      };

      let matchRuleset: MatchRuleset = {
        name: rulesetName,
        weight: Object.keys(curationRuleset).length !== 0 ? curationRuleset["weight"] : 0,
        ...{reduce: reduceValue},
        fuzzyMatch: fuzzyMatching,
        matchRules: [synonymMatchRule],
      };

      if (thesaurusErrorMessage === "" && propertyErrorMessage === "") {
        updateStepArtifact(matchRuleset);
        props.toggleModal(false);
        resetModal();
      }
      setThesaurusErrorMessage(thesaurusErrorMessage);
      break;
    }

    case "doubleMetaphone": {
      let dictionaryUriErrorMessage = "";
      if (dictionaryValue === "") {
        dictionaryUriErrorMessage = "A dictionary URI is required";
      }

      let distanceThresholdErrorMessage = "";
      if (distanceThresholdValue === "") {
        distanceThresholdErrorMessage = "A distance threshold is required";
      } else  if (dictionaryValue !== "") {
        const uriError = await validateURI(dictionaryValue, sourceDatabase);
        if (uriError) {
          dictionaryUriErrorMessage = uriError;
        }

      }

      rulesetName = `${propertyName} - Double Metaphone`;

      let doubleMetaphoneMatchRule: MatchRule = {
        entityPropertyPath: propertyName,
        matchType: matchType,
        options: {
          dictionaryURI: dictionaryValue,
          distanceThreshold: distanceThresholdValue,
        },
        exclusionLists: selectedExcludeList,
      };

      let matchRuleset: MatchRuleset = {
        name: rulesetName,
        weight: Object.keys(curationRuleset).length !== 0 ? curationRuleset["weight"] : 0,
        ...{reduce: reduceValue},
        fuzzyMatch: fuzzyMatching,
        matchRules: [doubleMetaphoneMatchRule],
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

    case "custom": {
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
        options: {},
        exclusionLists: selectedExcludeList,
      };

      let matchRuleset: MatchRuleset = {
        name: rulesetName,
        weight: Object.keys(curationRuleset).length !== 0 ? curationRuleset["weight"] : 0,
        ...{reduce: reduceValue},
        fuzzyMatch: fuzzyMatching,
        matchRules: [customMatchRule],
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

  const onMatchTypeSelect = (selectedItem: any) => {
    setMatchTypeErrorMessage("");
    setIsMatchTypeTouched(true);
    setMatchType(selectedItem.value);
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
      if (updateStep.matchRulesets) {
        updateStep.matchRulesets.push(matchRuleset);
      }
    }
    let success = await updateMatchingArtifact(updateStep);
    if (success) {
      updateActiveStepArtifact(updateStep);
    }
  };

  const hasFormChanged = () => {
    if (matchType === "custom") {
      let checkCustomValues = hasCustomFormValuesChanged();
      if (!isPropertyTypeTouched && !isMatchTypeTouched && !checkCustomValues) {
        return false;
      } else {
        return true;
      }
    } else if (matchType === "synonym") {
      let checkSynonymValues = hasSynonymFormValuesChanged();
      if (!isPropertyTypeTouched && !isMatchTypeTouched && !checkSynonymValues) {
        return false;
      } else {
        return true;
      }
    } else if (matchType === "doubleMetaphone") {
      let checkDoubleMetaphoneValues = hasDoubleMetaphoneFormValuesChanged();
      if (!isPropertyTypeTouched && !isMatchTypeTouched && !checkDoubleMetaphoneValues) {
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
    if (!isUriTouched && !isFunctionTouched && !isNamespaceTouched) {
      return false;
    } else {
      return true;
    }
  };

  const hasSynonymFormValuesChanged = () => {
    if (!isThesaurusTouched && !isFilterTouched) {
      return false;
    } else {
      return true;
    }
  };

  const hasDoubleMetaphoneFormValuesChanged = () => {
    if (!isDictionaryTouched && !isDistanceTouched) {
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

  const discardChanges = (
    <ConfirmYesNo visible={discardChangesVisible} type="discardChanges" onYes={discardOk} onNo={discardCancel} />
  );

  const [isTooltipVisible, setIsTooltipVisible] = useState({
    thesaurusURI: false,
    filter: false,
    dictionaryURI: false,
    distanceThreshold: false,
    uri: false,
    function: false,
    namespace: false,
    reduce: false,
    fuzzy: false,
    valuesIgnore: false,
  });

  const renderMatchOptions = MATCH_TYPE_OPTIONS.map((matchType, index) => ({
    value: matchType.value,
    label: matchType.name,
  }));

  const renderSynonymOptions = (
    <>
      <Row className={"mb-3"}>
        <FormLabel column lg={3}>
          {"Thesaurus URI:"}
          <span className={styles.asterisk}>*</span>
        </FormLabel>
        <Col>
          <Row>
            <Col className={thesaurusErrorMessage ? "d-flex has-error" : "d-flex"}>
              <HCInput
                id="thesaurus-uri-input"
                ariaLabel="thesaurus-uri-input"
                placeholder="Enter thesaurus URI"
                className={styles.inputAux}
                value={thesaurusValue}
                onChange={handleInputChange}
                onBlur={handleInputChange}
              />
              <div
                className={"p-2 d-flex align-items-center"}
                tabIndex={0}
                onFocus={() => setIsTooltipVisible({...isTooltipVisible, thesaurusURI: true})}
                onBlur={() => setIsTooltipVisible({...isTooltipVisible, thesaurusURI: false})}
              >
                <HCTooltip
                  text={MatchingStepTooltips.thesaurusUri}
                  id="thesaurus-uri-tooltip"
                  placement="top"
                  show={isTooltipVisible.thesaurusURI ? isTooltipVisible.thesaurusURI : undefined}
                >
                  <QuestionCircleFill
                    color={themeColors.defaults.questionCircle}
                    className={styles.icon}
                    size={13}
                    aria-label="icon: question-circle"
                  />
                </HCTooltip>
              </div>
            </Col>
            <Col xs={12} className={styles.validationError}>
              <span
                data-testid={"thesaurus-uri-err"}>
                {thesaurusErrorMessage}
              </span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className={"mb-3"}>
        <FormLabel column lg={3}>
          {"Filter:"}
        </FormLabel>
        <Col className={"d-flex"}>
          <HCInput
            id="filter-input"
            ariaLabel="filter-input"
            placeholder="Enter a node in the thesaurus to use as a filter"
            className={styles.inputAux}
            value={filterValue}
            onChange={handleInputChange}
            onBlur={handleInputChange}
          />
          <div
            className={"p-2 d-flex align-items-center"}
            tabIndex={0}
            onFocus={() => setIsTooltipVisible({...isTooltipVisible, filter: true})}
            onBlur={() => setIsTooltipVisible({...isTooltipVisible, filter: false})}
          >
            <HCTooltip
              text={MatchingStepTooltips.filter}
              id="filter-tooltip"
              placement="top"
              show={isTooltipVisible.filter ? isTooltipVisible.filter : undefined}
            >
              <QuestionCircleFill
                color={themeColors.defaults.questionCircle}
                className={styles.icon}
                size={13}
                aria-label="icon: question-circle"
              />
            </HCTooltip>
          </div>
        </Col>
      </Row>
    </>
  );

  const renderDoubleMetaphoneOptions = (
    <>
      <Row className={"mb-3"}>
        <FormLabel column lg={3}>
          {"Dictionary URI:"}
          <span className={styles.asterisk}>*</span>
        </FormLabel>
        <Col>
          <Row>
            <Col className={dictionaryErrorMessage ? "d-flex has-error" : "d-flex"}>
              <HCInput
                id="dictionary-uri-input"
                ariaLabel="dictionary-uri-input"
                placeholder="Enter dictionary URI"
                className={styles.inputDictionaryUriAndDistance}
                value={dictionaryValue}
                onChange={handleInputChange}
                onBlur={handleInputChange}
              />
              <div
                className={"p-2 d-flex align-items-center"}
                tabIndex={0}
                onFocus={() => setIsTooltipVisible({...isTooltipVisible, dictionaryURI: true})}
                onBlur={() => setIsTooltipVisible({...isTooltipVisible, dictionaryURI: false})}
              >
                <HCTooltip
                  text={MatchingStepTooltips.dictionaryUri}
                  id="dictionary-uri-tooltip"
                  placement="top"
                  show={isTooltipVisible.dictionaryURI ? isTooltipVisible.dictionaryURI : undefined}
                >
                  <QuestionCircleFill
                    color={themeColors.defaults.questionCircle}
                    className={styles.icon}
                    size={13}
                    aria-label="icon: question-circle"
                  />
                </HCTooltip>
              </div>
            </Col>
            <Col xs={12} className={styles.validationError}>
              <span
                data-testid={"dictionary-uri-err"}>
                {dictionaryErrorMessage}
              </span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className={"mb-3"}>
        <FormLabel column lg={3}>
          {"Distance Threshold:"}
          <span className={styles.asterisk}>*</span>
        </FormLabel>
        <Col>
          <Row>
            <Col className={distanceThresholdErrorMessage ? "d-flex has-error" : "d-flex"}>
              <HCInput
                id="distance-threshold-input"
                ariaLabel="distance-threshold-input"
                placeholder="Enter distance threshold"
                className={styles.inputDictionaryUriAndDistance}
                value={distanceThresholdValue}
                onChange={handleInputChange}
                onBlur={handleInputChange}
              />
              <div
                className={"p-2 d-flex align-items-center"}
                tabIndex={0}
                onFocus={() => setIsTooltipVisible({...isTooltipVisible, distanceThreshold: true})}
                onBlur={() => setIsTooltipVisible({...isTooltipVisible, distanceThreshold: false})}
              >
                <HCTooltip
                  text={MatchingStepTooltips.distanceThreshold}
                  id="distance-threshold-tooltip"
                  placement="top"
                  show={isTooltipVisible.distanceThreshold ? isTooltipVisible.distanceThreshold : undefined}
                >
                  <QuestionCircleFill
                    color={themeColors.defaults.questionCircle}
                    className={styles.icon}
                    size={13}
                    aria-label="icon: question-circle"
                  />
                </HCTooltip>
              </div>
            </Col>
            <Col xs={12} className={styles.validationError}>
              {distanceThresholdErrorMessage}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );

  const renderCustomOptions = (
    <>
      <Row className={"mb-3"}>
        <FormLabel column lg={3}>
          {"URI:"}
          <span className={styles.asterisk}>*</span>
        </FormLabel>
        <Col>
          <Row>
            <Col className={uriErrorMessage ? "d-flex has-error" : "d-flex"}>
              <HCInput
                id="uri-input"
                ariaLabel="uri-input"
                placeholder="Enter URI"
                className={styles.input}
                value={uriValue}
                onChange={handleInputChange}
                onBlur={handleInputChange}
              />
              <div
                className={"p-2 d-flex align-items-center"}
                tabIndex={0}
                onFocus={() => setIsTooltipVisible({...isTooltipVisible, uri: true})}
                onBlur={() => setIsTooltipVisible({...isTooltipVisible, uri: false})}
              >
                <HCTooltip
                  text={MatchingStepTooltips.uri}
                  id="uri-tooltip"
                  placement="top"
                  show={isTooltipVisible.uri ? isTooltipVisible.uri : undefined}
                >
                  <QuestionCircleFill
                    color={themeColors.defaults.questionCircle}
                    className={styles.icon}
                    size={13}
                    aria-label="icon: question-circle"
                  />
                </HCTooltip>
              </div>
            </Col>
            <Col xs={12} className={styles.validationError}>
              {uriErrorMessage}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className={"mb-3"}>
        <FormLabel column lg={3}>
          {"Function:"}
          <span className={styles.asterisk}>*</span>
        </FormLabel>
        <Col>
          <Row>
            <Col className={functionErrorMessage ? "d-flex has-error" : "d-flex"}>
              <HCInput
                id="function-input"
                ariaLabel="function-input"
                placeholder="Enter a function"
                className={styles.input}
                value={functionValue}
                onChange={handleInputChange}
                onBlur={handleInputChange}
              />
              <div
                className={"p-2 d-flex align-items-center"}
                tabIndex={0}
                onFocus={() => setIsTooltipVisible({...isTooltipVisible, function: true})}
                onBlur={() => setIsTooltipVisible({...isTooltipVisible, function: false})}
              >
                <HCTooltip
                  text={MatchingStepTooltips.function}
                  id="function-tooltip"
                  placement="top"
                  show={isTooltipVisible.function ? isTooltipVisible.function : undefined}
                >
                  <QuestionCircleFill
                    color={themeColors.defaults.questionCircle}
                    className={styles.icon}
                    size={13}
                    aria-label="icon: question-circle"
                  />
                </HCTooltip>
              </div>
            </Col>
            <Col xs={12} className={styles.validationError}>
              {functionErrorMessage}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className={"mb-3"}>
        <FormLabel column lg={3}>
          {"Namespace:"}
        </FormLabel>
        <Col className={"d-flex"}>
          <HCInput
            id="namespace-input"
            ariaLabel="namespace-input"
            placeholder="Enter a namespace"
            className={styles.input}
            value={namespaceValue}
            onChange={handleInputChange}
            onBlur={handleInputChange}
          />
          <div
            className={"p-2 d-flex align-items-center"}
            tabIndex={0}
            onFocus={() => setIsTooltipVisible({...isTooltipVisible, namespace: true})}
            onBlur={() => setIsTooltipVisible({...isTooltipVisible, namespace: false})}
          >
            <HCTooltip
              text={MatchingStepTooltips.namespace}
              id="namespace-tooltip"
              placement="top"
              show={isTooltipVisible.namespace ? isTooltipVisible.namespace : undefined}
            >
              <QuestionCircleFill
                color={themeColors.defaults.questionCircle}
                className={styles.icon}
                size={13}
                aria-label="icon: question-circle"
              />
            </HCTooltip>
          </div>
        </Col>
      </Row>
    </>
  );

  const modalFooter = (
    <div className={styles.editFooter}>
      {Object.keys(curationRuleset).length !== 0 && (
        <HCButton
          size="sm"
          aria-label="editSingleRulesetDeleteIcon"
          variant="link"
          onClick={() => {
            toggleDeleteConfirmModal(true);
          }}
        >
          <FontAwesomeIcon className={styles.trashIcon} icon={faTrashAlt} />
        </HCButton>
      )}
      <div className={Object.keys(curationRuleset).length === 0 ? styles.footerNewRuleset : styles.footer}>
        <HCButton size="sm" variant="outline-light" aria-label={`cancel-single-ruleset`} onClick={closeModal}>
          Cancel
        </HCButton>
        <HCButton
          className={styles.saveButton}
          aria-label={`confirm-single-ruleset`}
          variant="primary"
          size="sm"
          onClick={e => onSubmit(e)}
        >
          Save
        </HCButton>
      </div>
    </div>
  );

  const onToggleReduce = ({target}) => {
    const {checked} = target;
    if (checked) {
      setReduceValue(true);
    } else {
      setReduceValue(false);
    }
  };

  const onFuzzyMatching = ({target}) => {
    const {checked} = target;
    if (checked) {
      setFuzzyMatching(true);
    } else {
      setFuzzyMatching(false);
    }
  };

  const removeList = async () => {
    const response = await deleteExcludeValuesList(listToDelete);
    if (response) {
      fetchExcludeValueList();
      setDeleteConformationVisible(false);
    }
  };

  const confirmAction = () => {
    props.toggleModal(false);
    resetModal();
  };

  const MenuList = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const handleClick = (event, btn, itemInfo) => {
    if (btn === "A") {
      setShowListModal(true);
      setActionListModal("A");
      resetModalValuesIgnore();
      return;
    } else if (btn === "C") {
      setListValues(itemInfo.valuesIgnore);
      setShowListModal(true);
      setActionListModal("C");
      setListValues(itemInfo.valuesIgnore);
    } else if (btn === "E") {
      setShowListModal(true);
      setListName(itemInfo.name);
      setListValues(itemInfo.valuesIgnore);
      setActionListModal("E");
    } else if (btn === "D") {
      setActionListModal("D");
      fetchReferencesExcludeValuesList(itemInfo?.name);
    }
    event.stopPropagation();
  };

  const formatTextTooltip = arrText => {
    if (Array.isArray(arrText)) {
      const itemsToShow = 5;
      if (arrText.length <= itemsToShow) {
        return arrText.join(", ");
      }
      return (
        <div data-testid="tooltipListPreset">
          {arrText.slice(0, itemsToShow).join(", ")}
          <span style={{color: "#808080"}}>{" + " + (arrText.length - itemsToShow) + " more"}</span>
        </div>
      );
    }
  };

  const Option = renderMatchOptions => {
    return (
      <div>
        {renderMatchOptions.data.name === "Preset List 0" && (
          <components.Option {...renderMatchOptions}>
            <div
              className={styles.createNewListOption}
              id="createNewListOption"
              data-test-id="createNewListOption"
              onClick={event => {
                handleClick(event, "A", renderMatchOptions.data);
              }}
              tabIndex={0}
              onKeyDown={event => {
                if (event.key === "Enter") handleClick(event, "A", renderMatchOptions.data);
              }}
            >
              Create new list
            </div>
          </components.Option>
        )}
        {renderMatchOptions.data.name !== "Preset List 0" && (
          <components.Option {...renderMatchOptions}>
            <div
              tabIndex={0}
              onFocus={() => setIsTooltipVisible({...isTooltipVisible, reduce: true})}
              onBlur={() => setIsTooltipVisible({...isTooltipVisible, reduce: false})}
            >
              <HCTooltip
                show={isTooltipVisible.reduce ? isTooltipVisible.reduce : undefined}
                text={
                  <span aria-label="reduce-tooltip-text">
                    {formatTextTooltip(renderMatchOptions.data.valuesIgnore)}
                  </span>
                }
                id="reduce-tooltip"
                placement="top"
              >
                <div>{renderMatchOptions.data.name} </div>
              </HCTooltip>
            </div>

            <div className={styles.optionsList}>
              <i>
                <FontAwesomeIcon
                  className={styles.iconHover}
                  id={`edit-${renderMatchOptions.data.name}`}
                  icon={faPencilAlt}
                  color={themeColors.info}
                  size="sm"
                  onClick={event => {
                    handleClick(event, "E", renderMatchOptions.data);
                  }}
                />
              </i>
              <i>
                <FontAwesomeIcon
                  className={styles.iconHover}
                  id={`copy-${renderMatchOptions.data.name}`}
                  icon={faCopy}
                  color={themeColors.info}
                  size="sm"
                  onClick={event => {
                    handleClick(event, "C", renderMatchOptions.data);
                  }}
                  tabIndex={0}
                />
              </i>
              <i>
                <FontAwesomeIcon
                  className={styles.iconHover}
                  id={`delete-${renderMatchOptions.data.name}`}
                  icon={faTrashAlt}
                  color={themeColors.info}
                  size="sm"
                  onClick={event => {
                    handleClick(event, "D", renderMatchOptions.data);
                  }}
                  tabIndex={0}
                />
              </i>
            </div>
          </components.Option>
        )}
      </div>
    );
  };

  const checkIfExistInList = name => {
    return excludeList.some(item => item.name === name);
  };

  const handleChangeValuesToIgnore = (selected, e) => {
    if (selected.length === 0) {
      setSelectedExcludeListToInput([]);
      setSelectedExcludeList([]);
      return;
    }
    if (selected.length > 0 && selected[selected.length - 1].name !== presetListMock[0].name) {
      setSelectedExcludeList(selected.map(item => item.name));
      setSelectedExcludeListToInput(selected);
    } else {
      handleClick(e, "A", {});
    }
  };

  return (
    <>
      <HCModal show={props.isVisible} size={"lg"} onHide={closeModal}>
        <Modal.Header className={"pb-0"}>
          <div>
            <div className={"fs-5"}>
              {Object.keys(curationRuleset).length !== 0
                ? "Edit Match Ruleset for Single Property"
                : "Add Match Ruleset for Single Property"}
            </div>
          </div>
          <div className={`flex-column ${styles.modalTitleLegend}`}>
            <button type="button" className="btn-close" aria-label="Close" onClick={closeModal} />
            <div className={"d-flex mt-3"}>
              <div className={styles.legendText}>
                <img className={styles.arrayImage} src={arrayIcon} />
                Multiple
              </div>
              <div className={styles.legendText}>
                <FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup} /> Structured Type
              </div>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Form id="matching-single-ruleset" onSubmit={onSubmit} className={"container-fluid"}>
            <Row className={"mb-3"}>
              <FormLabel column lg={3} className={styles.reduceWeightText}>
                {"Reduce Weight"}
              </FormLabel>
              <Col className={"d-flex align-items-center"}>
                <FormCheck
                  type="switch"
                  data-testid="reduceToggle"
                  defaultChecked={props.editRuleset.reduce}
                  className={styles.switchReduceToggle}
                  onChange={onToggleReduce}
                  onKeyDown={(event: any) => {
                    if (event.key === "Enter") {
                      event.target.checked = !event.target.checked;
                      onToggleReduce(event);
                    }
                  }}
                  aria-label="reduceToggle"
                />
                <div
                  className={"p-2 d-flex align-items-center"}
                  tabIndex={0}
                  onFocus={() => setIsTooltipVisible({...isTooltipVisible, reduce: true})}
                  onBlur={() => setIsTooltipVisible({...isTooltipVisible, reduce: false})}
                >
                  <HCTooltip
                    show={isTooltipVisible.reduce ? isTooltipVisible.reduce : undefined}
                    text={<span aria-label="reduce-tooltip-text">{MatchingStepTooltips.reduceToggle}</span>}
                    id="reduce-tooltip"
                    placement="right"
                  >
                    <QuestionCircleFill
                      color={themeColors.defaults.questionCircle}
                      className={styles.icon}
                      size={13}
                      aria-label="icon: question-circle-reduce"
                    />
                  </HCTooltip>
                </div>
              </Col>
            </Row>
            <Row className={"mb-3"}>
              <FormLabel column lg={3} className={styles.reduceWeightText}>
                {"Fuzzy Matching"}
              </FormLabel>
              <Col className={"d-flex align-items-center"}>
                <FormCheck
                  type="switch"
                  data-testid="fuzzyMatching"
                  defaultChecked={props.editRuleset.fuzzyMatch}
                  className={styles.switchReduceToggle}
                  onChange={onFuzzyMatching}
                  aria-label="fuzzyMatching"
                  onKeyDown={(event: any) => {
                    if (event.key === "Enter") {
                      event.target.checked = !event.target.checked;
                      onFuzzyMatching(event);
                    }
                  }}
                />
                <div
                  className={"p-2 d-flex align-items-center"}
                  tabIndex={0}
                  onFocus={() => setIsTooltipVisible({...isTooltipVisible, fuzzy: true})}
                  onBlur={() => setIsTooltipVisible({...isTooltipVisible, fuzzy: false})}
                >
                  <HCTooltip
                    show={isTooltipVisible.fuzzy ? isTooltipVisible.fuzzy : undefined}
                    text={<span aria-label="fuzzy-tooltip-text">{MatchingStepTooltips.fuzzyMatching}</span>}
                    id="fuzzy-tooltip"
                    placement="top"
                  >
                    <QuestionCircleFill
                      color={themeColors.defaults.questionCircle}
                      className={styles.icon}
                      size={13}
                      aria-label="icon: question-circle"
                    />
                  </HCTooltip>
                </div>
              </Col>
            </Row>

            <Row className={"mb-3"}>
              <FormLabel column lg={3}>
                {"Property to Match:"}
                <span className={styles.asterisk}>*</span>
              </FormLabel>
              <Col>
                <Row>
                  <Col className={propertyTypeErrorMessage ? "d-flex has-error" : "d-flex"}>
                    <EntityPropertyTreeSelect
                      isForMerge={false}
                      propertyDropdownOptions={entityTypeDefinition.properties}
                      entityDefinitionsArray={curationOptions.entityDefinitionsArray}
                      value={selectedProperty}
                      onValueSelected={onPropertySelect}
                    />
                  </Col>
                  <Col xs={12} className={styles.validationError}>
                    {propertyTypeErrorMessage}
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row className={"mb-3"}>
              <FormLabel column lg={3}>
                {"Match Type:"}
                <span className={styles.asterisk}>*</span>
              </FormLabel>
              <Col>
                <Row>
                  <Col className={matchTypeErrorMessage ? "d-flex has-error" : "d-flex"}>
                    <div className={styles.inputMatchType}>
                      <Select
                        id="match-type-select-wrapper"
                        inputId="match-type"
                        components={{MenuList: props => MenuList("match-type", props)}}
                        placeholder="Select match type"
                        value={renderMatchOptions.find(oItem => oItem.value === matchType)}
                        onChange={onMatchTypeSelect}
                        aria-label="match-type-dropdown"
                        options={renderMatchOptions}
                        styles={reactSelectThemeConfig}
                        tabSelectsValue={false}
                        openMenuOnFocus={true}
                        formatOptionLabel={({value, label}) => {
                          return <span aria-label={`${value}-option`}>{label}</span>;
                        }}
                      />
                    </div>
                  </Col>
                  <Col xs={12} className={styles.validationError}>
                    {matchTypeErrorMessage}
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className={"mb-3"}>
              <FormLabel column lg={3}>
                {"Values to Ignore:"}
              </FormLabel>
              <Col>
                <Row>
                  <Col className={matchTypeErrorMessage ? "d-flex has-error" : "d-flex"}>
                    <div className={styles.selectIgnore}>
                      <Select
                        inputId="valuesToIgnore"
                        data-testid="valuesToIgnore"
                        isMulti
                        closeMenuOnSelect={false}
                        isClearable={true}
                        isSearchable={true}
                        components={{Option}}
                        tabSelectsValue={false}
                        openMenuOnFocus={true}
                        placeholder="Search previous lists"
                        value={selectedExcludeListToInput}
                        onChange={handleChangeValuesToIgnore}
                        options={excludeList}
                        styles={reactSelectThemeConfig}
                        formatOptionLabel={({value, name}) => {
                          return (
                            <span aria-label={`${value}-option`} style={{backgroundColor: "silver", width: "100%"}}>
                              <div>{name}</div>
                            </span>
                          );
                        }}
                      />
                    </div>
                    <div
                      className={"p-2 d-flex align-items-center"}
                      tabIndex={0}
                      onFocus={() => setIsTooltipVisible({...isTooltipVisible, valuesIgnore: true})}
                      onBlur={() => setIsTooltipVisible({...isTooltipVisible, valuesIgnore: false})}
                    >
                      <HCTooltip
                        show={isTooltipVisible.valuesIgnore ? isTooltipVisible.valuesIgnore : undefined}
                        text={
                          <span aria-label="values-ignore-tooltip-text">{MatchingStepTooltips.valuesToIgnore}</span>
                        }
                        id="reduce-tooltip"
                        placement="top"
                      >
                        <QuestionCircleFill
                          color={themeColors.defaults.questionCircle}
                          className={styles.icon}
                          size={13}
                          aria-label="icon: question-circle-values-ignore"
                        />
                      </HCTooltip>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>

            {matchType === "synonym" && renderSynonymOptions}
            {matchType === "doubleMetaphone" && renderDoubleMetaphoneOptions}
            {matchType === "custom" && renderCustomOptions}
            {modalFooter}
          </Form>
          {discardChanges}
          <ListModal
            isVisible={showListModal}
            toggleModal={setShowListModal}
            action={actionListModal}
            listName={listName}
            listValues={listValues}
            confirmAction={confirmAction}
            updateListValues={fetchExcludeValueList}
            checkIfExistInList={checkIfExistInList}
          />
          <DeleteModal
            isVisible={showDeleteConfirmModal}
            toggleModal={toggleDeleteConfirmModal}
            editRuleset={curationRuleset}
            confirmAction={confirmAction}
          />
        </Modal.Body>
        {deleteConfirmationModal(
          deleteConformationVisible,
          listToDelete,
          removeList,
          () => {
            setDeleteConformationVisible(false);
          },
          "list?",
        )}
      </HCModal>

      <ConfirmationModal
        isVisible={deleteWarning}
        type={ConfirmationType.DeleteListValueToIgnore}
        boldTextArray={referencesListValuesToIgnore ? referencesListValuesToIgnore : []}
        arrayValues={referencesListValuesToIgnore ? referencesListValuesToIgnore : []}
        toggleModal={() => setDeleteWarning(false)}
        confirmAction={() => setDeleteWarning(false)}
      />
    </>
  );
};

export default MatchRulesetModal;
