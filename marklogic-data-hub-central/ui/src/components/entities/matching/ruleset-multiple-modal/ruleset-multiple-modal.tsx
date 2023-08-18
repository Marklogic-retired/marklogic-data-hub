import React, {useState, useEffect, useContext, CSSProperties} from "react";
import {Row, Col, Modal, Form, FormLabel, FormCheck} from "react-bootstrap";
import {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import "./ruleset-multiple-modal.scss";
import styles from "./ruleset-multiple-modal.module.scss";
import arrayIcon from "../../../../assets/icon_array.png";
import {CurationContext} from "@util/curation-context";
import {Definition} from "../../../../types/modeling-types";
import {MatchingStepTooltips} from "@config/tooltips.config";
import ExpandCollapse from "../../../expand-collapse/expand-collapse";
import {MatchingStep, MatchRule, MatchRuleset} from "../../../../types/curation-types";
import {updateMatchingArtifact, validateURI} from "@api/matching";
import DeleteModal from "../delete-modal/delete-modal";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {ConfirmYesNo, HCAlert, HCInput, HCButton, HCTag, HCTooltip, HCTable, HCModal} from "@components/common";
import {HCSelect} from "@components/common";
import {themeColors} from "@config/themes.config";

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

const MatchRulesetMultipleModal: React.FC<Props> = props => {
  const {curationOptions, updateActiveStepArtifact} = useContext(CurationContext);

  const [rulesetName, setRulesetName] = useState("");
  const [rulesetNameErrorMessage, setRulesetNameErrorMessage] = useState("");
  const [isRulesetNameTouched, setIsRulesetNameTouched] = useState(false);

  const [matchOnTags, setMatchOnTags] = useState({});

  const [isPropertyTypeTouched, setIsPropertyTypeTouched] = useState(false);

  const [matchTypes, setMatchTypes] = useState({});
  const [matchTypeErrorMessages, setMatchTypeErrorMessages] = useState({});
  const [isMatchTypeTouched, setIsMatchTypeTouched] = useState(false);

  const [thesaurusValues, setThesaurusValues] = useState({});
  const [thesaurusErrorMessages, setThesaurusErrorMessages] = useState({});
  const [isThesaurusTouched, setIsThesaurusTouched] = useState(false);

  const [filterValues, setFilterValues] = useState({});
  const [isFilterTouched, setIsFilterTouched] = useState(false);

  const [dictionaryValues, setDictionaryValues] = useState({});
  const [dictionaryErrorMessages, setDictionaryErrorMessages] = useState({});
  const [isDictionaryTouched, setIsDictionaryTouched] = useState(false);

  const [distanceThresholdValues, setDistanceThresholdValues] = useState({});
  const [distanceThresholdErrorMessages, setDistanceThresholdErrorMessages] = useState({});
  const [isDistanceTouched, setIsDistanceTouched] = useState(false);

  const [uriValues, setUriValues] = useState({});
  const [uriErrorMessages, setUriErrorMessages] = useState({});
  const [isUriTouched, setIsUriTouched] = useState(false);

  const [functionValues, setFunctionValues] = useState({});
  const [functionErrorMessages, setFunctionErrorMessages] = useState({});
  const [isFunctionTouched, setIsFunctionTouched] = useState(false);

  const [namespaceValues, setNamespaceValues] = useState({});
  const [isNamespaceTouched, setIsNamespaceTouched] = useState(false);

  const [discardChangesVisible, setDiscardChangesVisible] = useState(false);

  const [reduceValue, setReduceValue] = useState(false);
  const [fuzzyMatching, setFuzzyMatching] = useState(false);

  const [multipleRulesetsData, setMultipleRulesetsData] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [checkTableUpdates, setCheckTableUpdates] = useState("");
  const [showDeleteConfirmModal, toggleDeleteConfirmModal] = useState(false);

  const [saveClicked, setSaveClicked] = useState(false);
  const [changeSelect, setChangeSelect] = useState(false);

  //For expand-collapse
  const [expandedRowKeys, setExpandedRowKeys] = useState<any[]>([]);

  const sourceDatabase = props.sourceDatabase;
  let curationRuleset = props.editRuleset;
  if (props.editRuleset.hasOwnProperty("index")) {
    let index = props.editRuleset.index;
    curationRuleset = {...curationOptions.activeStep.stepArtifact.matchRulesets[props.editRuleset.index], index};
  }

  useEffect(() => {
    if (
      props.isVisible &&
      curationOptions.entityDefinitionsArray.length > 0 &&
      curationOptions.activeStep.entityName !== ""
    ) {
      let nestedEntityProps = parseDefinitionsToTable(curationOptions.entityDefinitionsArray);
      setMultipleRulesetsData(nestedEntityProps);
      let initialKeysToExpand: any = generateExpandRowKeys(nestedEntityProps);
      setExpandedRowKeys([...initialKeysToExpand]);
    }

    if (Object.keys(curationRuleset).length !== 0 && props.isVisible) {
      let editRuleset = curationRuleset;
      if (editRuleset.reduce) {
        setReduceValue(true);
      }
      if (editRuleset.fuzzyMatch) {
        setFuzzyMatching(true);
      }

      if (editRuleset.name) {
        setRulesetName(editRuleset.name);
      }
      let selectedKeys: any = [];
      let matchTypes = {};
      let uriValues = {};
      let functionValues = {};
      let namespaceValues = {};
      let dictionaryValues = {};
      let distanceThresholdValues = {};
      let thesaurusValues = {};
      let filterValues = {};

      if (editRuleset["matchRules"].length) {
        editRuleset["matchRules"].forEach(matchRule => {
          let propertyPath = matchRule["entityPropertyPath"];
          matchTypes[propertyPath] = matchRule.matchType;
          if (matchRule.matchType === "custom") {
            uriValues[propertyPath] = matchRule["algorithmModulePath"];
            functionValues[propertyPath] = matchRule["algorithmFunction"];
            namespaceValues[propertyPath] = matchRule["algorithmModuleNamespace"];
          } else if (matchRule.matchType === "doubleMetaphone") {
            dictionaryValues[propertyPath] = matchRule["options"]["dictionaryURI"];
            distanceThresholdValues[propertyPath] = matchRule["options"]["distanceThreshold"];
          } else if (matchRule.matchType === "synonym") {
            thesaurusValues[propertyPath] = matchRule["options"]["thesaurusURI"];
            filterValues[propertyPath] = matchRule["options"]["filter"];
          }

          selectedKeys.push(propertyPath);
        });
      }

      setSelectedRowKeys(selectedKeys);
      setMatchTypes(matchTypes);
      setUriValues(uriValues);
      setFunctionValues(functionValues);
      setNamespaceValues(namespaceValues);
      setDictionaryValues(dictionaryValues);
      setDistanceThresholdValues(distanceThresholdValues);
      setThesaurusValues(thesaurusValues);
      setFilterValues(filterValues);
    }
  }, [props.isVisible]);

  const parseDefinitionsToTable = (entityDefinitionsArray: Definition[]) => {
    let entityTypeDefinition: Definition =
      entityDefinitionsArray.find(definition => definition.name === curationOptions.activeStep.entityName) ||
      DEFAULT_ENTITY_DEFINITION;
    return entityTypeDefinition?.properties.map((property, index) => {
      let propertyRow: any = {};
      let counter = 0;
      if (property.datatype === "structured") {
        const parseStructuredProperty = (
          entityDefinitionsArray,
          property,
          parentDefinitionName,
          parentKey,
          parentKeys,
        ) => {
          let parsedRef = property.ref.split("/");
          if (parentKey) {
            parentKeys.push(parentKey);
          } else {
            parentKeys.push(property.name + "," + index + (counter + 1));
          }
          if (parsedRef.length > 0 && parsedRef[1] === "definitions") {
            let structuredType = entityDefinitionsArray.find(entity => entity.name === parsedRef[2]);
            let structuredTypeProperties = structuredType?.properties.map((structProperty, structIndex) => {
              if (structProperty.datatype === "structured") {
                // Recursion to handle nested structured types
                counter++;
                let parentDefinitionName = structuredType.name;
                let immediateParentKey =
                  (parentKey !== "" ? property.name : structProperty.name) + "," + index + counter;
                return parseStructuredProperty(
                  entityDefinitionsArray,
                  structProperty,
                  parentDefinitionName,
                  immediateParentKey,
                  parentKeys,
                );
              } else {
                let parentKeysArray = [...parentKeys];
                return {
                  key: property.name + "," + index + structIndex + counter,
                  structured: structuredType.name,
                  propertyName: structProperty.name,
                  propertyPath: getPropertyPath(parentKeysArray, structProperty.name),
                  type:
                    structProperty.datatype === "structured"
                      ? structProperty.ref.split("/").pop()
                      : structProperty.datatype,
                  multiple: structProperty.multiple ? structProperty.name : "",
                  hasChildren: false,
                  hasParent: true,
                  parentKeys: parentKeysArray,
                };
              }
            });

            let hasParent = parentKey !== "";
            let parentKeysArray = [...parentKeys];
            return {
              key: property.name + "," + index + counter,
              structured: structuredType.name,
              propertyName: property.name,
              propertyPath: hasParent ? getPropertyPath(parentKeysArray, property.name) : property.name,
              multiple: property.multiple ? property.name : "",
              type: property.ref.split("/").pop(),
              children: structuredTypeProperties,
              hasChildren: true,
              hasParent: hasParent,
              parentKeys: hasParent ? parentKeysArray : [],
            };
          }
        };
        propertyRow = parseStructuredProperty(entityDefinitionsArray, property, "", "", []);
        counter++;
      } else {
        propertyRow = {
          key: property.name + "," + index,
          propertyName: property.name,
          propertyPath: property.name,
          type: property.datatype,
          identifier: entityTypeDefinition?.primaryKey === property.name ? property.name : "",
          multiple: property.multiple ? property.name : "",
          hasChildren: false,
          parentKeys: [],
        };
      }
      return propertyRow;
    });
  };

  const getPropertyPath = (parentKeys: any, propertyName: string) => {
    let propertyPath = "";
    parentKeys.forEach(el =>
      !propertyPath.length ? (propertyPath = el.split(",")[0]) : (propertyPath = propertyPath + "." + el.split(",")[0]),
    );
    propertyPath = propertyPath + "." + propertyName;
    return propertyPath;
  };

  const handleInputChange = (event, propertyPath) => {
    let eventId =
      event.target.id === "rulesetName-input"
        ? event.target.id
        : event.target.id.slice(event.target.id.indexOf("-") + 1);
    switch (eventId) {
    case "rulesetName-input":
      if (event.target.value === "") {
        setIsRulesetNameTouched(false);
        setRulesetNameErrorMessage("A ruleset name is required");
      } else {
        setRulesetNameErrorMessage("");
      }
      setIsRulesetNameTouched(true);
      setRulesetName(event.target.value);
      break;
    case "thesaurus-uri-input":
      if (event.target.value === "") {
        setIsThesaurusTouched(false);
        setThesaurusErrorMessages({...thesaurusErrorMessages, [propertyPath]: "A thesaurus URI is required"});
      } else {
        setThesaurusErrorMessages({...thesaurusErrorMessages, [propertyPath]: ""});
      }
      setIsThesaurusTouched(true);
      setThesaurusValues({...thesaurusValues, [propertyPath]: event.target.value});
      break;

    case "filter-input":
      setIsFilterTouched(true);
      setFilterValues({...filterValues, [propertyPath]: event.target.value});
      break;

    case "dictionary-uri-input":
      if (event.target.value === "") {
        setIsDictionaryTouched(false);
        setDictionaryErrorMessages({...dictionaryErrorMessages, [propertyPath]: "A dictionary URI is required"});
      } else {
        setDictionaryErrorMessages({...dictionaryErrorMessages, [propertyPath]: ""});
      }
      setIsDictionaryTouched(true);
      setDictionaryValues({...dictionaryValues, [propertyPath]: event.target.value});
      break;

    case "distance-threshold-input":
      if (event.target.value === "") {
        setIsDistanceTouched(false);
        setDistanceThresholdErrorMessages({
          ...distanceThresholdErrorMessages,
          [propertyPath]: "A distance threshold is required",
        });
      } else {
        setDistanceThresholdErrorMessages({...distanceThresholdErrorMessages, [propertyPath]: ""});
      }
      setIsDistanceTouched(true);
      setDistanceThresholdValues({...distanceThresholdValues, [propertyPath]: event.target.value});
      break;

    case "uri-input":
      if (event.target.value === "") {
        setIsUriTouched(false);
        setUriErrorMessages({...uriErrorMessages, [propertyPath]: "A URI is required"});
      } else {
        setUriErrorMessages({...uriErrorMessages, [propertyPath]: ""});
      }
      setIsUriTouched(true);
      setUriValues({...uriValues, [propertyPath]: event.target.value});
      break;

    case "function-input":
      if (event.target.value === "") {
        setIsFunctionTouched(false);
        setFunctionErrorMessages({...functionErrorMessages, [propertyPath]: "A function is required"});
      } else {
        setFunctionErrorMessages({...functionErrorMessages, [propertyPath]: ""});
      }
      setIsFunctionTouched(true);
      setFunctionValues({...functionValues, [propertyPath]: event.target.value});
      break;

    case "namespace-input":
      setIsNamespaceTouched(true);
      setNamespaceValues({...namespaceValues, [propertyPath]: event.target.value});
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
    setRulesetName("");
    setRulesetNameErrorMessage("");
    setMatchTypes({});
    setMatchTypeErrorMessages({});
    setSelectedRowKeys([]);
    setReduceValue(false);
    setFuzzyMatching(false);
    setThesaurusValues({});
    setThesaurusErrorMessages({});
    setFilterValues({});
    setDictionaryValues({});
    setDictionaryErrorMessages({});
    setDistanceThresholdValues({});
    setDistanceThresholdErrorMessages({});
    setUriValues({});
    setUriErrorMessages({});
    setFunctionValues({});
    setFunctionErrorMessages({});
    setNamespaceValues({});
    resetTouched();
    setSaveClicked(false);
  };

  const resetTouched = () => {
    setDiscardChangesVisible(false);
    setIsRulesetNameTouched(false);
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

  const onSubmit = async event => {
    event.preventDefault();
    setSaveClicked(true);
    let rulesetNameErrorMsg = "";
    let propertyErrorMessage = "";
    let matchErrorMessageObj = {};
    let thesaurusErrorMessageObj = {};
    let dictionaryUriErrorMessageObj = {};
    let distanceThresholdErrorMessageObj = {};
    let uriErrorMessageObj = {};
    let functionErrorMessageObj = {};

    if (rulesetName === "" || rulesetName === undefined) {
      rulesetNameErrorMsg = "A ruleset name is required";
    }

    let matchRules: any = [];
    if (!selectedRowKeys.length) {
      propertyErrorMessage = "A property to match is required.";
    } else {
      let indentMainKeyPropertyRow;
      for (const key of selectedRowKeys) {
        let propertyPath = key;
        if (key?.includes(".")) {
          indentMainKeyPropertyRow = key.split(".")[0];
        }
        if (key && key !== indentMainKeyPropertyRow && !matchTypes[key]) {
          matchErrorMessageObj[key] = "A match type is required";
        } else {
          switch (matchTypes[key]) {
          case "exact":
          case "zip": {
            let matchRule: MatchRule = {
              entityPropertyPath: propertyPath,
              matchType: matchTypes[key],
              options: {},
            };
            matchRules.push(matchRule);
            break;
          }
          case "synonym": {
            if (thesaurusValues[key] === "" || thesaurusValues[key] === undefined) {
              thesaurusErrorMessageObj[key] = "A thesaurus URI is required";
            } else {
              const uriError = await validateURI(thesaurusValues[key], sourceDatabase);
              if (uriError) {
                thesaurusErrorMessageObj[key] = uriError;
              }
            }

            let synonymMatchRule: MatchRule = {
              entityPropertyPath: propertyPath,
              matchType: matchTypes[key],
              options: {
                thesaurusURI: thesaurusValues[key],
                filter: filterValues[key],
              },
            };

            if (!thesaurusErrorMessageObj[key]) {
              matchRules.push(synonymMatchRule);
            }
            break;
          }
          case "doubleMetaphone": {
            if (dictionaryValues[key] === "" || dictionaryValues[key] === undefined) {
              dictionaryUriErrorMessageObj[key] = "A dictionary URI is required";
            } else if (distanceThresholdValues[key] && distanceThresholdValues[key] !== "") {
              const uriError = await validateURI(dictionaryValues[key], sourceDatabase);
              if (uriError) {
                dictionaryUriErrorMessageObj[key] = uriError;
              }
            }

            if (distanceThresholdValues[key] === "" || distanceThresholdValues[key] === undefined) {
              distanceThresholdErrorMessageObj[key] = "A distance threshold is required";
            }

            let doubleMetaphoneMatchRule: MatchRule = {
              entityPropertyPath: propertyPath,
              matchType: matchTypes[key],
              options: {
                dictionaryURI: dictionaryValues[key],
                distanceThreshold: distanceThresholdValues[key],
              },
            };

            if (!dictionaryUriErrorMessageObj[key] && !distanceThresholdErrorMessageObj[key]) {
              matchRules.push(doubleMetaphoneMatchRule);
            }
            break;
          }
          case "custom": {
            if (uriValues[key] === "" || uriValues[key] === undefined) {
              uriErrorMessageObj[key] = "A URI is required";
            }

            if (functionValues[key] === "" || functionValues[key] === undefined) {
              functionErrorMessageObj[key] = "A function is required";
            }

            let customMatchRule: MatchRule = {
              entityPropertyPath: propertyPath,
              matchType: matchTypes[key],
              algorithmModulePath: uriValues[key],
              algorithmFunction: functionValues[key],
              algorithmModuleNamespace: namespaceValues[key],
              options: {},
            };

            if (!uriErrorMessageObj[key] && !functionErrorMessageObj[key]) {
              matchRules.push(customMatchRule);
            }
            break;
          }
          default:
            break;
          }
        }
      }
    }

    if (rulesetNameErrorMsg === "") {
      if (propertyErrorMessage === "") {
        let errorInMatchType = Object.keys(matchErrorMessageObj).length > 0;
        let errorInThesaurusUri = Object.keys(thesaurusErrorMessageObj).length > 0;
        let errorInDictionaryUri = Object.keys(dictionaryUriErrorMessageObj).length > 0;
        let errorInDistThreshold = Object.keys(distanceThresholdErrorMessageObj).length > 0;
        let errorInUri = Object.keys(uriErrorMessageObj).length > 0;
        let errorInFunction = Object.keys(functionErrorMessageObj).length > 0;
        if (errorInMatchType) {
          setMatchTypeErrorMessages({...matchErrorMessageObj});
        }
        if (errorInThesaurusUri) {
          setThesaurusErrorMessages({...thesaurusErrorMessageObj});
        }
        if (errorInDictionaryUri) {
          setDictionaryErrorMessages({...dictionaryUriErrorMessageObj});
        }
        if (errorInDistThreshold) {
          setDistanceThresholdErrorMessages({...distanceThresholdErrorMessageObj});
        }
        if (errorInUri) {
          setUriErrorMessages({...uriErrorMessageObj});
        }
        if (errorInFunction) {
          setFunctionErrorMessages({...functionErrorMessageObj});
        }
        if (
          !errorInMatchType &&
          !errorInThesaurusUri &&
          !errorInDictionaryUri &&
          !errorInDistThreshold &&
          !errorInUri &&
          !errorInFunction
        ) {
          let matchRuleset: MatchRuleset = {
            name: rulesetName,
            weight: Object.keys(curationRuleset).length !== 0 ? curationRuleset["weight"] : 0,
            ...{reduce: reduceValue},
            fuzzyMatch: fuzzyMatching,
            matchRules: matchRules,
            rulesetType: "multiple",
          };
          updateStepArtifact(matchRuleset);
          props.toggleModal(false);
          resetModal();
        }
      }
    } else {
      setRulesetNameErrorMessage(rulesetNameErrorMsg);
    }
  };

  const onMatchTypeSelect = (rowIndex: number, propertyPath: string, option: any) => {
    setMatchTypeErrorMessages({...matchTypeErrorMessages, [propertyPath]: ""});
    setIsMatchTypeTouched(true);
    setMatchTypes({...matchTypes, [propertyPath]: option.value});
    // touch row to force table to update
    multipleRulesetsData[rowIndex] = {...multipleRulesetsData[rowIndex], matchType: option.value};
    if (!selectedRowKeys.includes(propertyPath)) {
      let selectedKeys = [...selectedRowKeys, propertyPath];
      setSelectedRowKeys(selectedKeys);
    }
  };

  const hasFormChanged = () => {
    if (isRulesetNameTouched) {
      return true;
    } else {
      for (const key of selectedRowKeys) {
        if (!matchTypes[key]) {
          return true;
        } else {
          if (matchTypes[key] === "custom") {
            let checkCustomValues = hasCustomFormValuesChanged();
            if (!isRulesetNameTouched && !isPropertyTypeTouched && !isMatchTypeTouched && !checkCustomValues) {
              return false;
            } else {
              return true;
            }
          } else if (matchTypes[key] === "synonym") {
            let checkSynonymValues = hasSynonymFormValuesChanged();
            if (!isRulesetNameTouched && !isPropertyTypeTouched && !isMatchTypeTouched && !checkSynonymValues) {
              return false;
            } else {
              return true;
            }
          } else if (matchTypes[key] === "doubleMetaphone") {
            let checkDoubleMetaphoneValues = hasDoubleMetaphoneFormValuesChanged();
            if (!isRulesetNameTouched && !isPropertyTypeTouched && !isMatchTypeTouched && !checkDoubleMetaphoneValues) {
              return false;
            } else {
              return true;
            }
          } else {
            if (!isRulesetNameTouched && !isPropertyTypeTouched && !isMatchTypeTouched) {
              return false;
            } else {
              return true;
            }
          }
        }
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
    props.toggleModal(false);
    resetModal();
  };

  const discardCancel = () => {
    resetTouched();
  };

  const discardChanges = (
    <ConfirmYesNo visible={discardChangesVisible} type="discardChanges" onYes={discardOk} onNo={discardCancel} />
  );

  const checkFieldInErrors = (propertyPath: string, fieldType: string) => {
    let errorCheck = false;
    switch (fieldType) {
    case "match-type-input": {
      if (matchTypeErrorMessages[propertyPath]) {
        errorCheck = true;
      }
      break;
    }
    case "thesaurus-uri-input": {
      if (thesaurusErrorMessages[propertyPath]) {
        errorCheck = true;
      }
      break;
    }
    case "dictionary-uri-input": {
      if (dictionaryErrorMessages[propertyPath]) {
        errorCheck = true;
      }
      break;
    }
    case "distance-threshold-input": {
      if (distanceThresholdErrorMessages[propertyPath]) {
        errorCheck = true;
      }
      break;
    }
    case "uri-input": {
      if (uriErrorMessages[propertyPath]) {
        errorCheck = true;
      }
      break;
    }
    case "function-input": {
      if (functionErrorMessages[propertyPath]) {
        errorCheck = true;
      }
      break;
    }
    default:
      break;
    }
    return errorCheck;
  };

  const inputUriStyle = (propertyPath, fieldType, hasParent?) => {
    const inputFieldStyle: CSSProperties = {
      width: ["dictionary-uri-input", "thesaurus-uri-input"].includes(fieldType)
        ? "17vw"
        : fieldType === "distance-threshold-input"
          ? hasParent
            ? "19vw"
            : "25vw"
          : "13vw",
      marginRight: "5px",
      marginLeft: ["distance-threshold-input", "function-input"].includes(fieldType) ? "15px" : "0px",
      justifyContent: "top",
      borderColor: checkFieldInErrors(propertyPath, fieldType) ? "red" : "",
    };
    return inputFieldStyle;
  };

  const validationErrorStyle = fieldType => {
    const validationErrStyle: CSSProperties = {
      width: ["dictionary-uri-input", "thesaurus-uri-input"].includes(fieldType)
        ? "17vw"
        : fieldType === "distance-threshold-input"
          ? "18vw"
          : "13vw",
      lineHeight: "normal",
      paddingTop: "6px",
      paddingLeft: "2px",
      paddingBottom: "4px",
      color: "#B32424",
      wordBreak: "break-all",
      marginLeft: ["distance-threshold-input", "function-input"].includes(fieldType) ? "15px" : "0px",
    };
    return validationErrStyle;
  };

  const [isTooltipVisible, setIsTooltipVisible] = useState({
    asterisk: false,
    nodeThesaurus: false,
    namespace: false,
    reduce: false,
    fuzzy: false,
  });

  const helpIconWithAsterisk = title => (
    <span>
      <div className={styles.asterisk}>*</div>
      <div
        tabIndex={0}
        onFocus={() => setIsTooltipVisible({...isTooltipVisible, asterisk: true})}
        onBlur={() => setIsTooltipVisible({...isTooltipVisible, asterisk: false})}
      >
        <HCTooltip
          show={isTooltipVisible.asterisk ? isTooltipVisible.asterisk : undefined}
          text={title}
          id="asterisk-help-tooltip"
          placement={title === MatchingStepTooltips.distanceThreshold ? "bottom-end" : "top"}
        >
          <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} />
        </HCTooltip>
      </div>
    </span>
  );

  const renderErrorThesaurus = propertyPath => {
    if (!thesaurusValues[propertyPath]) {
      return "A thesaurus URI is required";
    }
    if (thesaurusErrorMessages[propertyPath]) {
      return thesaurusErrorMessages[propertyPath];
    }
    return "";
  };

  const renderErrorDictionary = propertyPath => {
    if (!dictionaryValues[propertyPath]) {
      return "A dictionary URI is required";
    }
    if (dictionaryErrorMessages[propertyPath]) {
      return dictionaryErrorMessages[propertyPath];
    }
    return "";
  };

  const renderSynonymOptions = (propertyPath, hasParent) => {
    return (
      <div className={styles.matchTypeDetailsContainer}>
        <span>
          <span className={styles.mandatoryFieldContainer}>
            <HCInput
              id={`${propertyPath}-thesaurus-uri-input`}
              ariaLabel={`${propertyPath}-thesaurus-uri-input`}
              placeholder="Enter thesaurus URI"
              style={inputUriStyle(propertyPath, "thesaurus-uri-input", hasParent)}
              value={thesaurusValues[propertyPath] || ""}
              onChange={e => handleInputChange(e, propertyPath)}
              onBlur={e => handleInputChange(e, propertyPath)}
            />
            {helpIconWithAsterisk(MatchingStepTooltips.thesaurusUri)}
          </span>
          {checkFieldInErrors(propertyPath, "thesaurus-uri-input") ? (
            <div
              id="errorInThesaurusUri"
              data-testid={propertyPath + "-thesaurus-uri-err"}
              style={validationErrorStyle("thesaurus-uri-input")}
            >
              {renderErrorThesaurus(propertyPath)}
            </div>
          ) : (
            ""
          )}
        </span>
        <span className={"d-flex"}>
          <HCInput
            id={`${propertyPath}-filter-input`}
            ariaLabel={`${propertyPath}-filter-input`}
            placeholder="Enter a node in the thesaurus to use as a filter"
            className={hasParent ? styles.filterInputChild : styles.filterInput}
            value={filterValues[propertyPath] || ""}
            onChange={e => handleInputChange(e, propertyPath)}
            onBlur={e => handleInputChange(e, propertyPath)}
          />
          <div
            tabIndex={0}
            onFocus={() => setIsTooltipVisible({...isTooltipVisible, nodeThesaurus: true})}
            onBlur={() => setIsTooltipVisible({...isTooltipVisible, nodeThesaurus: false})}
          >
            <HCTooltip
              show={isTooltipVisible.nodeThesaurus ? isTooltipVisible.nodeThesaurus : undefined}
              text={MatchingStepTooltips.filter}
              id="node-thesaurus-tooltip"
              placement="bottom"
            >
              <QuestionCircleFill
                color={themeColors.defaults.questionCircle}
                className={`${styles.questionCircle} mt-2`}
                size={13}
              />
            </HCTooltip>
          </div>
        </span>
      </div>
    );
  };

  const renderDoubleMetaphoneOptions = (propertyPath, hasParent) => {
    return (
      <div className={styles.matchTypeDetailsContainer}>
        <span>
          <span className={styles.mandatoryFieldContainer}>
            <HCInput
              id={`${propertyPath}-dictionary-uri-input`}
              ariaLabel={`${propertyPath}-dictionary-uri-input`}
              placeholder="Enter dictionary URI"
              style={inputUriStyle(propertyPath, "dictionary-uri-input", hasParent)}
              value={dictionaryValues[propertyPath] || ""}
              onChange={e => handleInputChange(e, propertyPath)}
              onBlur={e => handleInputChange(e, propertyPath)}
            />
            {helpIconWithAsterisk(MatchingStepTooltips.dictionaryUri)}
          </span>
          {checkFieldInErrors(propertyPath, "dictionary-uri-input") ? (
            <div
              id="errorInDictionaryUri"
              data-testid={propertyPath + "-dictionary-uri-err"}
              style={validationErrorStyle("dictionary-uri-input")}
            >
              {renderErrorDictionary(propertyPath)}
            </div>
          ) : (
            ""
          )}
        </span>
        <span>
          <span className={styles.mandatoryFieldContainer}>
            <HCInput
              id={`${propertyPath}-distance-threshold-input`}
              ariaLabel={`${propertyPath}-distance-threshold-input`}
              placeholder="Enter distance threshold"
              style={inputUriStyle(propertyPath, "distance-threshold-input", hasParent)}
              value={distanceThresholdValues[propertyPath] || ""}
              onChange={e => handleInputChange(e, propertyPath)}
              onBlur={e => handleInputChange(e, propertyPath)}
            />
            {helpIconWithAsterisk(MatchingStepTooltips.distanceThreshold)}
          </span>
          {checkFieldInErrors(propertyPath, "distance-threshold-input") ? (
            <div
              id="errorInDistanceThreshold"
              data-testid={propertyPath + "-distance-threshold-err"}
              style={validationErrorStyle("distance-threshold-input")}
            >
              {!distanceThresholdValues[propertyPath] ? "A distance threshold is required" : ""}
            </div>
          ) : (
            ""
          )}
        </span>
      </div>
    );
  };

  const renderCustomOptions = (propertyPath, hasParent) => {
    return (
      <div className={styles.matchTypeDetailsContainer}>
        <span>
          <span className={styles.mandatoryFieldContainer}>
            <HCInput
              id={`${propertyPath}-uri-input`}
              ariaLabel={`${propertyPath}-uri-input`}
              placeholder="Enter URI"
              style={inputUriStyle(propertyPath, "uri-input", hasParent)}
              value={uriValues[propertyPath] || ""}
              onChange={e => handleInputChange(e, propertyPath)}
              onBlur={e => handleInputChange(e, propertyPath)}
            />
            {helpIconWithAsterisk(MatchingStepTooltips.uri)}
          </span>
          {checkFieldInErrors(propertyPath, "uri-input") ? (
            <div id="errorInURI" data-testid={propertyPath + "-uri-err"} style={validationErrorStyle("uri-input")}>
              {!uriValues[propertyPath] ? "A URI is required" : ""}
            </div>
          ) : (
            ""
          )}
        </span>
        <span>
          <span className={styles.mandatoryFieldContainer}>
            <HCInput
              id={`${propertyPath}-function-input`}
              ariaLabel={`${propertyPath}-function-input`}
              placeholder="Enter a function"
              style={inputUriStyle(propertyPath, "function-input", hasParent)}
              value={functionValues[propertyPath] || ""}
              onChange={e => handleInputChange(e, propertyPath)}
              onBlur={e => handleInputChange(e, propertyPath)}
            />
            {helpIconWithAsterisk(MatchingStepTooltips.function)}
          </span>
          {checkFieldInErrors(propertyPath, "function-input") ? (
            <div
              id="errorInFunction"
              data-testid={propertyPath + "-function-err"}
              style={validationErrorStyle("function-input")}
            >
              {!functionValues[propertyPath] ? "A function is required" : ""}
            </div>
          ) : (
            ""
          )}
        </span>
        <span className={"d-flex"}>
          <HCInput
            id={`${propertyPath}-namespace-input`}
            ariaLabel={`${propertyPath}-namespace-input`}
            placeholder="Enter a namespace"
            className={hasParent ? styles.functionInputChild : styles.functionInput}
            value={namespaceValues[propertyPath] || ""}
            onChange={e => handleInputChange(e, propertyPath)}
            onBlur={e => handleInputChange(e, propertyPath)}
          />
          <div
            tabIndex={0}
            onFocus={() => setIsTooltipVisible({...isTooltipVisible, namespace: true})}
            onBlur={() => setIsTooltipVisible({...isTooltipVisible, namespace: false})}
          >
            <HCTooltip
              show={isTooltipVisible.namespace ? isTooltipVisible.namespace : undefined}
              text={MatchingStepTooltips.namespace}
              id="namespace-input-tooltip"
              placement="bottom"
            >
              <QuestionCircleFill
                color={themeColors.defaults.questionCircle}
                className={`${styles.questionCircle} mt-2`}
                size={13}
              />
            </HCTooltip>
          </div>
        </span>
      </div>
    );
  };

  const modalTitle = (
    <div className={styles.modalTitleContainer}>
      <div className={styles.modalTitle}>
        {Object.keys(curationRuleset).length !== 0
          ? "Edit Match Ruleset for Multiple Properties"
          : "Add Match Ruleset for Multiple Properties"}
      </div>
      <p className={styles.titleDescription} aria-label="titleDescription">
        Select all the properties to include in the ruleset, and specify a match type for each property.
      </p>
    </div>
  );

  const modalFooter = (
    <div className={styles.editFooter}>
      {Object.keys(curationRuleset).length !== 0 && (
        <HCButton
          aria-label="editMultipleRulesetDeleteIcon"
          size="sm"
          variant="link"
          onClick={() => {
            toggleDeleteConfirmModal(true);
          }}
        >
          <FontAwesomeIcon className={styles.trashIcon} icon={faTrashAlt} />
        </HCButton>
      )}
      <div className={Object.keys(curationRuleset).length === 0 ? styles.footerNewRuleset : styles.footer}>
        <HCButton size="sm" variant="outline-light" aria-label={`cancel-multiple-ruleset`} onClick={closeModal}>
          Cancel
        </HCButton>
        <HCButton
          className={styles.saveButton}
          size="sm"
          aria-label={`confirm-multiple-ruleset`}
          variant="primary"
          onClick={e => onSubmit(e)}
        >
          Save
        </HCButton>
      </div>
    </div>
  );

  const onFuzzyMatching = ({target}) => {
    const {checked} = target;
    if (checked) {
      setFuzzyMatching(true);
    } else {
      setFuzzyMatching(false);
    }
  };

  const onToggleReduce = ({target}) => {
    const {checked} = target;
    if (checked) {
      setReduceValue(true);
    } else {
      setReduceValue(false);
    }
  };

  const MenuList = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const renderMatchOptions = MATCH_TYPE_OPTIONS.map((matchType, index) => ({
    value: matchType.value,
    label: matchType.name,
  }));

  const multipleRulesetsTableColumns = [
    {
      text: "Name",
      dataField: "propertyName",
      key: "propertyPath",
      width: "17%",
      ellipsis: true,
      headerFormatter: () => <span data-testid="nameTitle">Name</span>,
      formatter: (text, row) => {
        return (
          <span className={row.hasOwnProperty("children") ? styles.nameColumnStyle : ""}>
            {text}{" "}
            {row.hasOwnProperty("children") ? (
              <FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup} />
            ) : (
              ""
            )}{" "}
            {row.multiple ? <img className={styles.arrayImage} src={arrayIcon} /> : ""}
          </span>
        );
      },
      attrs: (cell, row, rowIndex, colIndex) => {
        if (row.hasChildren) {
          return {
            colspan: 4,
            key: "name",
          };
        }
      },
    },
    {
      ellipsis: true,
      text: "Match Type",
      width: "15%",
      dataField: "matchType",
      isDummyField: true,
      headerFormatter: () => <span data-testid="matchTypeTitle">Match Type</span>,
      style: (cell, row) => {
        if (row.hasChildren) {
          return {display: "none"};
        }
        return "";
      },
      attrs: {
        key: "matchTypeTitle",
      },
      formatter: (text, row, rowIndex, extraData) => {
        return !row.hasOwnProperty("children") ? (
          <div className={styles.typeContainer}>
            <HCSelect
              id={`${row.propertyPath}-select-wrapper`}
              inputId={`${row.propertyPath}-select`}
              components={{MenuList: props => MenuList(`${row.propertyPath}`, props)}}
              onChange={e => onMatchTypeSelect(rowIndex, row.propertyPath, e)}
              options={renderMatchOptions}
              matchTypesProp={extraData.matchTypes}
              row={row}
              changeTagKey={changeSelect}
              formatOptionLabel={({value, label}) => {
                return <span aria-label={`${value}-option`}>{label}</span>;
              }}
              styles={{
                ...reactSelectThemeConfig,
                container: (provided, state) => ({
                  ...provided,
                  width: "180px",
                }),
                control: (provided, state) => ({
                  ...provided,
                  border: state.menuIsOpen
                    ? "1px solid #808cbd"
                    : checkFieldInErrors(row.propertyPath, "match-type-input")
                      ? "1px solid #b32424"
                      : "1px solid #d9d9d9",
                }),
              }}
            />

            {checkFieldInErrors(row.propertyPath, "match-type-input") ? (
              <div
                id="errorInMatchType"
                data-testid={row.propertyPath + "-match-type-err"}
                style={validationErrorStyle("match-type-input")}
              >
                {!matchTypes[row.propertyPath] ? "A match type is required" : ""}
              </div>
            ) : (
              ""
            )}
          </div>
        ) : null;
      },
      formatExtraData: {
        selectedRowKeys,
        matchTypes,
        matchTypeErrorMessages,
        thesaurusErrorMessages,
        dictionaryErrorMessages,
        distanceThresholdErrorMessages,
        uriErrorMessages,
        functionErrorMessages,
      },
    },
    {
      text: "Match Type Details",
      width: "58%",
      dataField: "matchTypeDetails",
      isDummyField: true,
      headerFormatter: () => <span data-testid="matchTypeDetailsTitle">Match Type Details</span>,
      attrs: {
        key: "matchTypeDetails",
      },
      formatter: (text, row, rowKey, extraData) => {
        if (selectedRowKeys.includes(row.propertyPath)) {
          switch (extraData.matchTypes[row.propertyPath]) {
          case "synonym":
            return renderSynonymOptions(row.propertyPath, row.hasParent);
          case "doubleMetaphone":
            return renderDoubleMetaphoneOptions(row.propertyPath, row.hasParent);
          case "custom":
            return renderCustomOptions(row.propertyPath, row.hasParent);
          default:
            return <span />;
          }
        }
      },
      style: (cell, row) => {
        if (row.hasChildren) {
          return {display: "none"};
        }
        return "";
      },
      formatExtraData: {
        selectedRowKeys,
        matchTypes,
        matchTypeErrorMessages,
        thesaurusErrorMessages,
        dictionaryErrorMessages,
        distanceThresholdErrorMessages,
        uriErrorMessages,
        functionErrorMessages,
      },
    },
  ];

  useEffect(() => {
    hideCheckboxes();
  }, [multipleRulesetsData, checkTableUpdates]);

  useEffect(() => {
    let matchOnTagsArr = getMatchOnTags(selectedRowKeys);
    setMatchOnTags({...matchOnTagsArr});
    if (saveClicked) {
      setSaveClicked(false);
    }
  }, [selectedRowKeys]);

  const hideCheckboxes = () => {
    const checkboxList = document.getElementsByName("hidden");
    checkboxList.forEach((item: any) => {
      item.parentNode.hidden = true;
    });
  };

  const getMatchOnTags = selectedRowKeys => {
    let matchTags = {};
    let indentMainPropertyRow;

    selectedRowKeys.forEach(key => {
      if (key) {
        if (key.includes(".")) {
          indentMainPropertyRow = key.split(".")[0];
        }

        if (key !== indentMainPropertyRow) {
          let tag = key.split(".").join(" > ");
          matchTags[`${key}`] = tag;
        }
      }
    });
    return matchTags;
  };

  const resetPropertyErrorsAndValues = (propertyPath, matchType) => {
    switch (matchType) {
    case "synonym": {
      if (propertyPath in thesaurusErrorMessages) {
        let thesaurusErrorMessagesObj = thesaurusErrorMessages;
        delete thesaurusErrorMessagesObj[propertyPath];
        setThesaurusErrorMessages(thesaurusErrorMessagesObj);
      }
      if (propertyPath in thesaurusValues) {
        let thesaurusValuesObj = thesaurusValues;
        delete thesaurusValuesObj[propertyPath];
        setThesaurusValues(thesaurusValuesObj);
      }
      if (propertyPath in filterValues) {
        let filterValuesObj = filterValues;
        delete filterValuesObj[propertyPath];
        setFilterValues(filterValuesObj);
      }
      break;
    }
    case "doubleMetaphone": {
      if (propertyPath in dictionaryErrorMessages) {
        let dictionaryErrorMessagesObj = dictionaryErrorMessages;
        delete dictionaryErrorMessagesObj[propertyPath];
        setDictionaryErrorMessages(dictionaryErrorMessagesObj);
      }
      if (propertyPath in distanceThresholdErrorMessages) {
        let distanceThresholdErrorMessagesObj = distanceThresholdErrorMessages;
        delete distanceThresholdErrorMessagesObj[propertyPath];
        setDistanceThresholdErrorMessages(distanceThresholdErrorMessagesObj);
      }
      if (propertyPath in dictionaryValues) {
        let dictionaryValuesObj = dictionaryValues;
        delete dictionaryValuesObj[propertyPath];
        setDictionaryValues(dictionaryValuesObj);
      }
      if (propertyPath in distanceThresholdValues) {
        let distanceThresholdValuesObj = distanceThresholdValues;
        delete distanceThresholdValuesObj[propertyPath];
        setDistanceThresholdValues(distanceThresholdValuesObj);
      }
      break;
    }
    case "custom": {
      if (propertyPath in uriErrorMessages) {
        let uriErrorMessagesObj = uriErrorMessages;
        delete uriErrorMessagesObj[propertyPath];
        setUriErrorMessages(uriErrorMessagesObj);
      }
      if (propertyPath in functionErrorMessages) {
        let functionErrorMessagesObj = functionErrorMessages;
        delete functionErrorMessagesObj[propertyPath];
        setFunctionErrorMessages(functionErrorMessagesObj);
      }
      if (propertyPath in uriValues) {
        let uriValuesObj = uriValues;
        delete uriValuesObj[propertyPath];
        setUriValues(uriValuesObj);
      }
      if (propertyPath in functionValues) {
        let functionValuesObj = functionValues;
        delete functionValuesObj[propertyPath];
        setFunctionValues(functionValuesObj);
      }
      if (propertyPath in namespaceValues) {
        let namespaceValuesObj = namespaceValues;
        delete namespaceValuesObj[propertyPath];
        setNamespaceValues(namespaceValuesObj);
      }
      break;
    }
    default:
      break;
    }
  };

  const handlePropertyDeselection = tagKey => {
    setChangeSelect(tagKey);
    if (tagKey in matchTypes) {
      let obj = matchTypes;
      let matchType = matchTypes[tagKey];
      delete obj[tagKey];
      setMatchTypes(obj);
      resetPropertyErrorsAndValues(tagKey, matchType);
    } else {
      if (tagKey in matchTypeErrorMessages) {
        let matchTypeErrorMessagesObj = matchTypeErrorMessages;
        delete matchTypeErrorMessagesObj[tagKey];
        setMatchTypeErrorMessages(matchTypeErrorMessagesObj);
      }
    }
  };

  const rowSelection = {
    onSelect: (record, selected) => {
      const rowMainParentKey = record?.hasParent ? record.parentKeys[0].split(",")[0] : "";
      if (selectedRowKeys.includes(record.propertyPath)) {
        let selectedRowsKeysAux = [...selectedRowKeys.filter(key => key !== record.propertyPath)];
        const existAux = selectedRowsKeysAux?.filter(key =>
          key ? key.includes(rowMainParentKey) && key.length !== rowMainParentKey.length : "",
        );

        if (existAux.length === 0) {
          selectedRowsKeysAux = [...selectedRowsKeysAux.filter(key => key !== rowMainParentKey)];
        }

        setSelectedRowKeys(selectedRowsKeysAux);
      } else {
        if (selectedRowKeys.includes(rowMainParentKey)) {
          setSelectedRowKeys([...selectedRowKeys, record.propertyPath]);
        } else {
          setSelectedRowKeys([...selectedRowKeys, record.propertyPath, rowMainParentKey]);
        }
      }

      if (!selected) {
        handlePropertyDeselection(record.propertyPath);
      }
    },
    onSelectAll: isSelect => {
      if (isSelect) {
        const recursiveSelectAllKeys = (dataArr, allKeys: Array<string> = []) => {
          dataArr.forEach((obj: {children?: any[]; propertyPath: string}) => {
            if (obj.hasOwnProperty("children")) {
              recursiveSelectAllKeys(obj["children"], allKeys);
            } else {
              allKeys.push(obj.propertyPath);
            }
          });
          return allKeys;
        };
        let keys = recursiveSelectAllKeys(multipleRulesetsData);
        setSelectedRowKeys([...keys]);
      } else {
        setSelectedRowKeys([]);
      }
    },
    selected: selectedRowKeys,
    nonSelectable: multipleRulesetsData
      .filter(record => record.hasOwnProperty("structured") && record.structured !== "" && record.hasChildren)
      .map(record => record.propertyPath),
  };

  const closeMatchOnTag = tagKey => {
    const filteredKeys = Object.keys(matchOnTags).filter(key => key !== tagKey);
    setSelectedRowKeys(filteredKeys);
    handlePropertyDeselection(tagKey);
  };

  const displayMatchOnTags = () => {
    return Object.keys(matchOnTags).map(prop => (
      <HCTag
        key={prop}
        label={matchOnTags[prop]}
        ariaLabel={`${prop}-matchOn-tag`}
        className={styles.matchOnTags}
        onClose={() => closeMatchOnTag(prop)}
      />
    ));
  };

  const toggleRowExpanded = (expanded, record) => {
    let newExpandedRows = [...expandedRowKeys];
    if (expanded) {
      setCheckTableUpdates(record.propertyPath);
      if (newExpandedRows.indexOf(record.propertyPath) === -1) {
        newExpandedRows.push(record.propertyPath);
      }
    } else {
      newExpandedRows = newExpandedRows.filter(row => row !== record.propertyPath);
    }
    setExpandedRowKeys(newExpandedRows);
  };

  const generateExpandRowKeys = (dataArr, allKeysToExpand: any = []) => {
    dataArr.forEach(obj => {
      if (obj.hasOwnProperty("children") && !obj.hasParent) {
        allKeysToExpand.push(obj["propertyName"]);
        generateExpandRowKeys(obj["children"], allKeysToExpand);
      } else if (obj.hasOwnProperty("children") && obj.hasParent) {
        allKeysToExpand.push(obj["key"]);
        generateExpandRowKeys(obj["children"], allKeysToExpand);
      }
    });
    return allKeysToExpand;
  };

  const handleExpandCollapse = option => {
    if (option === "collapse") {
      setExpandedRowKeys([]);
    } else {
      let keysToExpand: any = generateExpandRowKeys(multipleRulesetsData);
      setExpandedRowKeys([...keysToExpand]);
    }
  };

  const onAlertClose = () => {
    setSaveClicked(false);
  };

  const noPropertyCheckedErrorMessage = (
    <span id="noPropertyCheckedErrorMessage">
      <HCAlert
        variant="danger"
        aria-label="noPropertyCheckedErrorMessage"
        className={styles.noPropertyCheckedErrorMessage}
        showIcon
        dismissible
        onClose={onAlertClose}
      >
        {"You must select at least one property for the ruleset to be created"}
      </HCAlert>
    </span>
  );

  const paginationOptions = {
    defaultCurrent: 1,
    defaultPageSize: 20,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "40", "60"],
  };
  /*
  const customExpandIcon = (props) => {
    if (props.expandable) {
      if (props.expanded) {
        return <a className={styles.expandIcon} onClick={e => {
          props.onExpand(props.record, e);
        }}><ChevronDown /> </a>;
      } else {
        return <a className={styles.expandIcon} onClick={e => {
          props.onExpand(props.record, e);
        }}><ChevronRight data-testid="expandedIcon" /> </a>;
      }
    }
  }; */

  const confirmAction = () => {
    props.toggleModal(false);
    resetModal();
  };

  return (
    <HCModal
      show={props.isVisible}
      dialogClassName={styles.modal1400w}
      onEntered={hideCheckboxes}
      onHide={closeModal}
      scrollable={true}
    >
      <Modal.Header className={"bb-none align-items-start headerModal"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={closeModal} />
        {modalTitle}
        <Form id="matching-multiple-ruleset" onSubmit={onSubmit} className={"container-fluid"}>
          <Row className={"mb-3"}>
            <FormLabel column lg={"auto"}>
              {"Ruleset Name:"}
              <span className={styles.asterisk}>*</span>
            </FormLabel>
            <Col>
              <Row>
                <Col className={rulesetNameErrorMessage ? "d-flex has-error" : "d-flex"} sm={6}>
                  <HCInput
                    id="rulesetName-input"
                    ariaLabel="rulesetName-input"
                    placeholder="Enter ruleset name"
                    className={styles.rulesetName}
                    value={rulesetName}
                    onChange={e => handleInputChange(e, "")}
                    onBlur={e => handleInputChange(e, "")}
                  />
                </Col>
                <Col xs={12} className={styles.validationError}>
                  {rulesetNameErrorMessage}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={"mb-3"}>
            <FormLabel column lg={"auto"} className={styles.reduceWeightText}>
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
                className={"p-2 d-flex"}
                tabIndex={0}
                onFocus={() => setIsTooltipVisible({...isTooltipVisible, reduce: true})}
                onBlur={() => setIsTooltipVisible({...isTooltipVisible, reduce: false})}
              >
                <HCTooltip
                  show={isTooltipVisible.reduce ? isTooltipVisible.reduce : undefined}
                  text={<span aria-label="reduce-tooltip-text">{MatchingStepTooltips.reduceToggle}</span>}
                  id="reduce-weight-tooltip"
                  placement="right"
                >
                  <QuestionCircleFill
                    aria-label="icon: question-circle"
                    color={themeColors.defaults.questionCircle}
                    className={styles.icon}
                    size={13}
                  />
                </HCTooltip>
              </div>

              <FormLabel column lg={"auto"} className={styles.fuzzyText}>
                {"Fuzzy Matching"}
              </FormLabel>
              <FormCheck
                type="switch"
                data-testid="fuzzyMatchingMultiple"
                defaultChecked={props.editRuleset.fuzzyMatch}
                className={styles.switchFuzzy}
                onChange={onFuzzyMatching}
                onKeyDown={(event: any) => {
                  if (event.key === "Enter") {
                    event.target.checked = !event.target.checked;
                    onFuzzyMatching(event);
                  }
                }}
                aria-label="fuzzyMatchingMultiple"
              />
              <div
                className={"p-2 d-flex"}
                tabIndex={0}
                onFocus={() => setIsTooltipVisible({...isTooltipVisible, fuzzy: true})}
                onBlur={() => setIsTooltipVisible({...isTooltipVisible, fuzzy: false})}
              >
                <HCTooltip
                  show={isTooltipVisible.fuzzy ? isTooltipVisible.fuzzy : undefined}
                  text={<span aria-label="fuzzy-multiple-tooltip-text">{MatchingStepTooltips.fuzzyMatching}</span>}
                  id="fuzzy-multiple-matching-tooltip"
                  placement="right"
                >
                  <QuestionCircleFill
                    aria-label="icon: question-circle-fuzzy"
                    color={themeColors.defaults.questionCircle}
                    className={styles.icon}
                    size={13}
                  />
                </HCTooltip>
              </div>
            </Col>
          </Row>

          <Row className={"mb-3"}>
            <FormLabel column lg={"auto"}>
              {"Match on:"}
            </FormLabel>
            <Col className={"d-flex align-items-center"}>
              <span className={styles.matchOnTagsContainer}>{displayMatchOnTags()}</span>
              {!selectedRowKeys.length && saveClicked ? noPropertyCheckedErrorMessage : null}
            </Col>
          </Row>

          <div className={styles.modalTitleLegend} aria-label="modalTitleLegend">
            <div className={`d-flex align-items-center ${styles.legendText}`}>
              <img className={"me-1"} src={arrayIcon} /> Multiple
            </div>
            <div className={`d-flex align-items-center ${styles.legendText}`}>
              <FontAwesomeIcon className={`me-1 ${styles.structuredIcon}`} icon={faLayerGroup} /> Structured Type
            </div>
            <div className={styles.expandCollapseIcon}>
              <ExpandCollapse handleSelection={id => handleExpandCollapse(id)} currentSelection={""} />
            </div>
          </div>
        </Form>
      </Modal.Header>
      <Modal.Body>
        <div id="multipleRulesetsTableContainer" data-testid="multipleRulesetsTableContainer">
          <HCTable
            pagination={paginationOptions}
            className={styles.entityTable}
            onExpand={(record, expanded) => toggleRowExpanded(expanded, record)}
            expandedRowKeys={expandedRowKeys}
            rowClassName={() => styles.entityTableRows}
            rowSelection={{...rowSelection}}
            columns={multipleRulesetsTableColumns}
            data={multipleRulesetsData}
            rowKey="propertyPath"
            component="ruleset-multiple-modal"
            showExpandIndicator={true}
            childrenIndent={true}
            nestedParams={{headerColumns: multipleRulesetsTableColumns, state: [expandedRowKeys, setExpandedRowKeys]}}
            keyUtil="key"
            baseIndent={18}
            subTableHeader={true}
          />
        </div>

        {discardChanges}
        <DeleteModal
          isVisible={showDeleteConfirmModal}
          toggleModal={toggleDeleteConfirmModal}
          editRuleset={curationRuleset}
          confirmAction={confirmAction}
        />
      </Modal.Body>
      <Modal.Footer>{modalFooter}</Modal.Footer>
    </HCModal>
  );
};

export default MatchRulesetMultipleModal;
