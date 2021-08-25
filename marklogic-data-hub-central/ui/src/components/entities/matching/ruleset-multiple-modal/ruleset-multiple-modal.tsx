import React, {useState, useEffect, useContext, CSSProperties} from "react";
import {Modal, Form, Input, Icon, Switch, Table, Tag, Button, Select} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import "./ruleset-multiple-modal.scss";
import styles from "./ruleset-multiple-modal.module.scss";
import arrayIcon from "../../../../assets/icon_array.png";
import ConfirmYesNo from "../../../common/confirm-yes-no/confirm-yes-no";
import {CurationContext} from "../../../../util/curation-context";
import {Definition} from "../../../../types/modeling-types";
import {MatchingStepTooltips} from "../../../../config/tooltips.config";
import ExpandCollapse from "../../../expand-collapse/expand-collapse";
import {MatchingStep, MatchRule, MatchRuleset} from "../../../../types/curation-types";
import {updateMatchingArtifact} from "../../../../api/matching";
import DeleteModal from "../delete-modal/delete-modal";
import HCAlert from "../../../common/hc-alert/hc-alert";
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
  labelCol: {span: 2},
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

const MatchRulesetMultipleModal: React.FC<Props> = (props) => {
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

  const [multipleRulesetsData, setMultipleRulesetsData] = useState<any []>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any []>([]);
  const [checkTableUpdates, setCheckTableUpdates] = useState("");
  const [showDeleteConfirmModal, toggleDeleteConfirmModal] = useState(false);

  const [saveClicked, setSaveClicked] = useState(false);

  //For expand-collapse
  const [expandedRowKeys, setExpandedRowKeys] = useState<any []>([]);

  let curationRuleset = props.editRuleset ;
  if (props.editRuleset.hasOwnProperty("index")) {
    let index = props.editRuleset.index;
    curationRuleset = ({...curationOptions.activeStep.stepArtifact.matchRulesets[props.editRuleset.index], index});
  }

  useEffect(() => {
    if (props.isVisible && curationOptions.entityDefinitionsArray.length > 0 && curationOptions.activeStep.entityName !== "") {
      let nestedEntityProps = parseDefinitionsToTable(curationOptions.entityDefinitionsArray);
      setMultipleRulesetsData(nestedEntityProps);
      let initialKeysToExpand:any = generateExpandRowKeys(nestedEntityProps);
      setExpandedRowKeys([...initialKeysToExpand]);
    }

    if (Object.keys(curationRuleset).length !== 0 && props.isVisible) {
      let editRuleset = curationRuleset;
      if (editRuleset.reduce) {
        setReduceValue(true);
      }

      if (editRuleset.name) {
        setRulesetName(editRuleset.name);
      }
      let selectedKeys:any = [];
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
    let entityTypeDefinition: Definition = entityDefinitionsArray.find(definition => definition.name === curationOptions.activeStep.entityName) || DEFAULT_ENTITY_DEFINITION;
    return entityTypeDefinition?.properties.map((property, index) => {
      let propertyRow: any = {};
      let counter = 0;
      if (property.datatype === "structured") {
        const parseStructuredProperty = (entityDefinitionsArray, property, parentDefinitionName, parentKey, parentKeys) => {
          let parsedRef = property.ref.split("/");
          if (parentKey) {
            parentKeys.push(parentKey);
          } else {
            parentKeys.push(property.name + "," + index + (counter+1));
          }
          if (parsedRef.length > 0 && parsedRef[1] === "definitions") {
            let structuredType = entityDefinitionsArray.find(entity => entity.name === parsedRef[2]);
            let structuredTypeProperties = structuredType?.properties.map((structProperty, structIndex) => {
              if (structProperty.datatype === "structured") {
                // Recursion to handle nested structured types
                counter++;
                let parentDefinitionName = structuredType.name;
                let immediateParentKey = (parentKey !== "" ? property.name : structProperty.name) + "," + index + counter;
                return parseStructuredProperty(entityDefinitionsArray, structProperty, parentDefinitionName, immediateParentKey, parentKeys);
              } else {
                let parentKeysArray = [...parentKeys];
                return {
                  key: property.name + "," + index + structIndex + counter,
                  structured: structuredType.name,
                  propertyName: structProperty.name,
                  propertyPath: getPropertyPath(parentKeysArray, structProperty.name),
                  type: structProperty.datatype === "structured" ? structProperty.ref.split("/").pop() : structProperty.datatype,
                  multiple: structProperty.multiple ? structProperty.name : "",
                  hasChildren: false,
                  hasParent: true,
                  parentKeys: parentKeysArray
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
              parentKeys: hasParent ? parentKeysArray : []
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
          parentKeys: []
        };
      }
      return propertyRow;
    });
  };

  const getPropertyPath = (parentKeys: any, propertyName: string) => {
    let propertyPath = "";
    parentKeys.forEach(el => !propertyPath.length ? propertyPath = el.split(",")[0] : propertyPath = propertyPath + "." + el.split(",")[0]);
    propertyPath = propertyPath + "." + propertyName;
    return propertyPath;
  };

  const handleInputChange = (event, propertyPath) => {
    let eventId = event.target.id === "rulesetName-input" ? event.target.id : event.target.id.slice(event.target.id.indexOf("-") + 1);
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
        setDistanceThresholdErrorMessages({...distanceThresholdErrorMessages, [propertyPath]: "A distance threshold is required"});
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

  const onSubmit = (event) => {
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
      selectedRowKeys.forEach(key => {
        let propertyPath = key;
        if (!matchTypes[key]) {
          matchErrorMessageObj[key] = "A match type is required";
        } else {
          switch (matchTypes[key]) {
          case "exact":
          case "zip":
          {
            let matchRule: MatchRule = {
              entityPropertyPath: propertyPath,
              matchType: matchTypes[key],
              options: {}
            };
            matchRules.push(matchRule);
            break;
          }
          case "synonym":
          {
            if (thesaurusValues[key] === "" || thesaurusValues[key] === undefined) {
              thesaurusErrorMessageObj[key] = "A thesaurus URI is required";
            }

            let synonymMatchRule: MatchRule = {
              entityPropertyPath: propertyPath,
              matchType: matchTypes[key],
              options: {
                thesaurusURI: thesaurusValues[key],
                filter: filterValues[key]
              }
            };

            if (!thesaurusErrorMessageObj[key]) {
              matchRules.push(synonymMatchRule);
            }
            break;
          }
          case "doubleMetaphone":
          {
            if (dictionaryValues[key] === "" || dictionaryValues[key] === undefined) {
              dictionaryUriErrorMessageObj[key] = "A dictionary URI is required";
            }

            if (distanceThresholdValues[key] === "" || distanceThresholdValues[key] === undefined) {
              distanceThresholdErrorMessageObj[key] = "A distance threshold is required";
            }

            let doubleMetaphoneMatchRule: MatchRule = {
              entityPropertyPath: propertyPath,
              matchType: matchTypes[key],
              options: {
                dictionaryURI: dictionaryValues[key],
                distanceThreshold: distanceThresholdValues[key]
              }
            };

            if (!dictionaryUriErrorMessageObj[key] && !distanceThresholdErrorMessageObj[key]) {
              matchRules.push(doubleMetaphoneMatchRule);
            }
            break;
          }
          case "custom":
          {
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
              options: {}
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
      });
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
        if (!errorInMatchType && !errorInThesaurusUri
          && !errorInDictionaryUri && !errorInDistThreshold
          && !errorInUri && !errorInFunction) {
          let matchRuleset: MatchRuleset = {
            name: rulesetName,
            weight: Object.keys(curationRuleset).length !== 0 ? curationRuleset["weight"] : 0,
            ...({reduce: reduceValue}),
            matchRules: matchRules,
            rulesetType: "multiple"
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

  const onMatchTypeSelect = (propertyPath: string, value: string) => {
    setMatchTypeErrorMessages({...matchTypeErrorMessages, [propertyPath]: ""});
    setIsMatchTypeTouched(true);
    setMatchTypes({...matchTypes, [propertyPath]: value});
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
          if (matchTypes[key] ===  "custom") {
            let checkCustomValues = hasCustomFormValuesChanged();
            if (!isRulesetNameTouched
            && !isPropertyTypeTouched
            && !isMatchTypeTouched
            && !checkCustomValues
            ) {
              return false;
            } else {
              return true;
            }
          } else if (matchTypes[key] === "synonym") {
            let checkSynonymValues = hasSynonymFormValuesChanged();
            if (!isRulesetNameTouched
            && !isPropertyTypeTouched
            && !isMatchTypeTouched
            && !checkSynonymValues
            ) {
              return false;
            } else {
              return true;
            }
          } else if (matchTypes[key] === "doubleMetaphone") {
            let checkDoubleMetaphoneValues = hasDoubleMetaphoneFormValuesChanged();
            if (!isRulesetNameTouched
            && !isPropertyTypeTouched
            && !isMatchTypeTouched
            && !checkDoubleMetaphoneValues
            ) {
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
    props.toggleModal(false);
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

  const checkFieldInErrors = (propertyPath: string, fieldType: string) => {
    let errorCheck = false;
    switch (fieldType) {
    case "match-type-input": { if (matchTypeErrorMessages[propertyPath]) { errorCheck = true; } break; }
    case "thesaurus-uri-input": { if (thesaurusErrorMessages[propertyPath]) { errorCheck = true; } break; }
    case "dictionary-uri-input": { if (dictionaryErrorMessages[propertyPath]) { errorCheck = true; } break; }
    case "distance-threshold-input": { if (distanceThresholdErrorMessages[propertyPath]) { errorCheck = true; } break; }
    case "uri-input": { if (uriErrorMessages[propertyPath]) { errorCheck = true; } break; }
    case "function-input": { if (functionErrorMessages[propertyPath]) { errorCheck = true; } break; }
    default: break;
    }
    return errorCheck;
  };

  const renderMatchOptions = MATCH_TYPE_OPTIONS.map((matchType, index) => {
    return <Option key={index} value={matchType.value} aria-label={`${matchType.value}-option`}>{matchType.name}</Option>;
  });

  const inputUriStyle = (propertyPath, fieldType) => {
    const inputFieldStyle: CSSProperties = {
      width: ["dictionary-uri-input", "thesaurus-uri-input"].includes(fieldType) ? "22vw" : (fieldType === "distance-threshold-input" ? "25vw" : "13vw"),
      marginRight: "5px",
      marginLeft: ["distance-threshold-input", "function-input"].includes(fieldType) ? "15px" : "0px",
      justifyContent: "top",
      borderColor: checkFieldInErrors(propertyPath, fieldType) ? "red" : ""
    };
    return inputFieldStyle;
  };

  const matchTypeCSS = (propertyPath) => {
    const matchTypeStyle: CSSProperties = {
      width: "160px",
      border: checkFieldInErrors(propertyPath, "match-type-input") ? "0.6px solid red" : "",
      borderRadius: "5px"
    };
    return matchTypeStyle;
  };

  const validationErrorStyle = (fieldType) => {
    const validationErrStyle: CSSProperties = {
      width: ["dictionary-uri-input", "thesaurus-uri-input"].includes(fieldType) ? "22vw" : (fieldType === "distance-threshold-input" ? "25vw" : "13vw"),
      lineHeight: "normal",
      paddingTop: "6px",
      paddingLeft: "2px",
      paddingBottom: "4px",
      color: "#DB4f59",
      wordBreak: "break-all",
      marginLeft: ["distance-threshold-input", "function-input"].includes(fieldType) ? "15px" : "0px",
    };
    return validationErrStyle;
  };

  const helpIconWithAsterisk = (title) => (
    <span>
      <div className={styles.asterisk}>*</div>
      <div>
        <HCTooltip text={title} id="asterisk-help-tooltip" placement={title === MatchingStepTooltips.distanceThreshold ? "bottom-end" : "top"}>
          <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} />
        </HCTooltip>
      </div>
    </span>
  );

  const renderSynonymOptions = (propertyPath) => {
    return <div className={styles.matchTypeDetailsContainer}>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id={`${propertyPath}-thesaurus-uri-input`}
            aria-label={`${propertyPath}-thesaurus-uri-input`}
            placeholder="Enter thesaurus URI"
            style={inputUriStyle(propertyPath, "thesaurus-uri-input")}
            value={thesaurusValues[propertyPath]}
            onChange={(e) => handleInputChange(e, propertyPath)}
            onBlur={(e) => handleInputChange(e, propertyPath)}
          />
          {helpIconWithAsterisk(MatchingStepTooltips.thesaurusUri)}
        </span>
        {checkFieldInErrors(propertyPath, "thesaurus-uri-input") ? <div id="errorInThesaurusUri" data-testid={propertyPath + "-thesaurus-uri-err"} style={validationErrorStyle("thesaurus-uri-input")}>{!thesaurusValues[propertyPath] ? "A thesaurus URI is required" : ""}</div> : ""}
      </span>
      <span>
        <Input
          id={`${propertyPath}-filter-input`}
          aria-label={`${propertyPath}-filter-input`}
          placeholder="Enter a node in the thesaurus to use as a filter"
          className={styles.filterInput}
          value={filterValues[propertyPath]}
          onChange={(e) => handleInputChange(e, propertyPath)}
          onBlur={(e) => handleInputChange(e, propertyPath)}
        />
        <HCTooltip text={MatchingStepTooltips.filter} id="node-thesaurus-tooltip" placement="bottom">
          <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} />
        </HCTooltip>
      </span>
    </div>;
  };

  const renderDoubleMetaphoneOptions = (propertyPath) => {
    return <div className={styles.matchTypeDetailsContainer}>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id={`${propertyPath}-dictionary-uri-input`}
            aria-label={`${propertyPath}-dictionary-uri-input`}
            placeholder="Enter dictionary URI"
            style={inputUriStyle(propertyPath, "dictionary-uri-input")}
            value={dictionaryValues[propertyPath]}
            onChange={(e) => handleInputChange(e, propertyPath)}
            onBlur={(e) => handleInputChange(e, propertyPath)}
          />
          {helpIconWithAsterisk(MatchingStepTooltips.dictionaryUri)}
        </span>
        {checkFieldInErrors(propertyPath, "dictionary-uri-input") ? <div id="errorInDictionaryUri" data-testid={propertyPath + "-dictionary-uri-err"} style={validationErrorStyle("dictionary-uri-input")}>{!dictionaryValues[propertyPath] ? "A dictionary URI is required" : ""}</div> : ""}
      </span>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id={`${propertyPath}-distance-threshold-input`}
            aria-label={`${propertyPath}-distance-threshold-input`}
            placeholder="Enter distance threshold"
            style={inputUriStyle(propertyPath, "distance-threshold-input")}
            value={distanceThresholdValues[propertyPath]}
            onChange={(e) => handleInputChange(e, propertyPath)}
            onBlur={(e) => handleInputChange(e, propertyPath)}
          />
          {helpIconWithAsterisk(MatchingStepTooltips.distanceThreshold)}
        </span>
        {checkFieldInErrors(propertyPath, "distance-threshold-input") ? <div id="errorInDistanceThreshold" data-testid={propertyPath + "-distance-threshold-err"} style={validationErrorStyle("distance-threshold-input")}>{!distanceThresholdValues[propertyPath] ? "A distance threshold is required" : ""}</div> : ""}
      </span>
    </div>;
  };

  const renderCustomOptions = (propertyPath) => {
    return <div className={styles.matchTypeDetailsContainer}>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id={`${propertyPath}-uri-input`}
            aria-label={`${propertyPath}-uri-input`}
            placeholder="Enter URI"
            style={inputUriStyle(propertyPath, "uri-input")}
            value={uriValues[propertyPath]}
            onChange={(e) => handleInputChange(e, propertyPath)}
            onBlur={(e) => handleInputChange(e, propertyPath)}
          />
          {helpIconWithAsterisk(MatchingStepTooltips.uri)}
        </span>
        {checkFieldInErrors(propertyPath, "uri-input") ? <div id="errorInURI" data-testid={propertyPath + "-uri-err"} style={validationErrorStyle("uri-input")}>{!uriValues[propertyPath] ? "A URI is required" : ""}</div> : ""}
      </span>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id={`${propertyPath}-function-input`}
            aria-label={`${propertyPath}-function-input`}
            placeholder="Enter a function"
            style={inputUriStyle(propertyPath, "function-input")}
            value={functionValues[propertyPath]}
            onChange={(e) => handleInputChange(e, propertyPath)}
            onBlur={(e) => handleInputChange(e, propertyPath)}
          />
          {helpIconWithAsterisk(MatchingStepTooltips.function)}
        </span>
        {checkFieldInErrors(propertyPath, "function-input") ? <div id="errorInFunction" data-testid={propertyPath + "-function-err"} style={validationErrorStyle("function-input")}>{!functionValues[propertyPath] ? "A function is required" : ""}</div> : ""}
      </span>
      <span>
        <Input
          id={`${propertyPath}-namespace-input`}
          aria-label={`${propertyPath}-namespace-input`}
          placeholder="Enter a namespace"
          className={styles.functionInput}
          value={namespaceValues[propertyPath]}
          onChange={(e) => handleInputChange(e, propertyPath)}
          onBlur={(e) => handleInputChange(e, propertyPath)}
        />
        <HCTooltip text={MatchingStepTooltips.namespace} id="namespace-input-tooltip" placement="bottom">
          <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} />
        </HCTooltip>
      </span>
    </div>;
  };

  const modalTitle = (
    <div className={styles.modalTitleContainer}>
      <div className={styles.modalTitle}>{Object.keys(curationRuleset).length !== 0 ? "Edit Match Ruleset for Multiple Properties" : "Add Match Ruleset for Multiple Properties"}</div>
      <p className={styles.titleDescription} aria-label="titleDescription">Select all the properties to include in the ruleset, and specify a match type for each property.</p>
    </div>
  );

  const modalFooter = (
    <div className={styles.editFooter}>
      <Button type="link" onClick={() => { toggleDeleteConfirmModal(true); }}>
        <FontAwesomeIcon  className={styles.trashIcon} icon={faTrashAlt} />
      </Button>
      <div className={styles.footer}>
        <Button
          aria-label={`cancel-multiple-ruleset`}
          onClick={closeModal}
        >Cancel</Button>
        <Button
          className={styles.saveButton}
          aria-label={`confirm-multiple-ruleset`}
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

  const multipleRulesetsTableColumns = [
    {
      title: <span data-testid="nameTitle">Name</span>,
      dataIndex: "propertyName",
      key: "propertyPath",
      width: "17%",
      ellipsis: true,
      render: (text, row) => {
        return <span className={row.hasOwnProperty("children") ? styles.nameColumnStyle : ""}>{text} {row.hasOwnProperty("children") ? <FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/>  : ""} {row.multiple ? <img className={styles.arrayImage} src={arrayIcon}/> : ""}</span>;
      }
    },
    {
      ellipsis: true,
      title: <span data-testid="matchTypeTitle">Match Type</span>,
      width: "15%",
      render: (text, row) => {
        return !row.hasOwnProperty("children") ? <div className={styles.typeContainer}>
          <Select
            aria-label={`${row.propertyPath}-match-type-dropdown`}
            style={matchTypeCSS(row.propertyPath)}
            size="default"
            placeholder="Select match type"
            onSelect={(e) => onMatchTypeSelect(row.propertyPath, e)}
            value={matchTypes[row.propertyPath]}
          >
            {renderMatchOptions}
          </Select>
          {checkFieldInErrors(row.propertyPath, "match-type-input") ? <div id="errorInMatchType" data-testid={row.propertyPath + "-match-type-err"} style={validationErrorStyle("match-type-input")}>{!matchTypes[row.propertyPath] ? "A match type is required" : ""}</div> : ""}
        </div> : null;
      }
    },
    {
      title: <span data-testid="matchTypeDetailsTitle">Match Type Details</span>,
      width: "68%",
      render: (text, row) => {
        switch (matchTypes[row.propertyPath]) {
        case "synonym": return renderSynonymOptions(row.propertyPath);
        case "doubleMetaphone": return renderDoubleMetaphoneOptions(row.propertyPath);
        case "custom": return renderCustomOptions(row.propertyPath);
        default:
          break;
        }
      }
    }
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

  const getMatchOnTags = (selectedRowKeys) => {
    let matchTags = {};
    selectedRowKeys.forEach(key => {
      let tag = key.split(".").join(" > ");
      matchTags[`${key}`] = tag;
    });
    return matchTags;
  };

  const resetPropertyErrorsAndValues = (propertyPath, matchType) => {
    switch (matchType) {
    case "synonym":
    {
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
    case "doubleMetaphone":
    {
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
    case "custom":
    {
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

  const handlePropertyDeselection = (tagKey) => {
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
    onChange: (selected, selectedRows) => {
      let fkeys = selectedRows.map(row =>  row.propertyPath);
      setSelectedRowKeys([...fkeys]);
    },
    onSelect: (record, selected, selectedRows) => {
      if (!selected) {
        handlePropertyDeselection(record.propertyPath);
      }
    },
    selectedRowKeys: selectedRowKeys,
    getCheckboxProps: record => ({name: record.hasOwnProperty("structured") && record.structured !== "" && record.hasChildren ? "hidden" : record.propertyPath}),
  };

  const closeMatchOnTag = (tagKey) => {
    const filteredKeys = Object.keys(matchOnTags).filter(key => key !== tagKey);
    setSelectedRowKeys(filteredKeys);
    handlePropertyDeselection(tagKey);
  };

  const displayMatchOnTags = () => {
    return Object.keys(matchOnTags).map((prop) => <Tag key={prop} aria-label={`${prop}-matchOn-tag`} className={styles.matchOnTags} closable onClose={() => closeMatchOnTag(prop)}>
      {matchOnTags[prop]}
    </Tag>);
  };

  const toggleRowExpanded = (expanded, record) => {
    let newExpandedRows =  [...expandedRowKeys];
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

  const generateExpandRowKeys = (dataArr, allKeysToExpand:any = []) => {
    dataArr.forEach(obj => {
      if (obj.hasOwnProperty("children")) {
        allKeysToExpand.push(obj["propertyPath"]);
        generateExpandRowKeys(obj["children"], allKeysToExpand);
      }
    });
    return allKeysToExpand;
  };

  const handleExpandCollapse = (option) => {
    if (option === "collapse") {
      setExpandedRowKeys([]);
    } else {
      let keysToExpand:any = generateExpandRowKeys(multipleRulesetsData);
      setExpandedRowKeys([...keysToExpand]);
    }
  };

  const onAlertClose = () => {
    setSaveClicked(false);
  };

  const noPropertyCheckedErrorMessage = <span id="noPropertyCheckedErrorMessage">
    <HCAlert
      variant="danger"
      aria-label="noPropertyCheckedErrorMessage"
      className={styles.noPropertyCheckedErrorMessage} showIcon
      dismissible
      onClose={onAlertClose}>
      {"You must select at least one property for the ruleset to be created"}
    </HCAlert>
  </span>;

  const paginationOptions = {
    defaultCurrent: 1,
    defaultPageSize: 20,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "40", "60"]
  };

  const customExpandIcon = (props) => {
    if (props.expandable) {
      if (props.expanded) {
        return <a className={styles.expandIcon} onClick={e => {
          props.onExpand(props.record, e);
        }}><Icon type="down" /> </a>;
      } else {
        return <a  className={styles.expandIcon} onClick={e => {
          props.onExpand(props.record, e);
        }}><Icon type="right" data-testid="expandedIcon"/> </a>;
      }
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
      title={null}
      footer={null}
      width={1400}
      onCancel={closeModal}
    >

      {modalTitle}

      <Form
        {...layout}
        id="matching-multiple-ruleset"
        onSubmit={onSubmit}
      >
        <Form.Item
          className={styles.formItem}
          label={<span>
          Ruleset Name:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
          </span>}
          colon={false}
          labelAlign="left"
          validateStatus={rulesetNameErrorMessage ? "error" : ""}
          help={rulesetNameErrorMessage}
        >
          <Input
            id="rulesetName-input"
            aria-label="rulesetName-input"
            placeholder="Enter ruleset name"
            className={styles.rulesetName}
            value={rulesetName}
            onChange={(e) => handleInputChange(e, "")}
            onBlur={(e) => handleInputChange(e, "")}
          />
        </Form.Item>
        <Form.Item>
          <span className={styles.reduceWeightText}>Reduce Weight</span>
          <Switch className={styles.reduceToggle} onChange={onToggleReduce} defaultChecked={props.editRuleset.reduce} aria-label="reduceToggle"></Switch>
          <HCTooltip text={<span aria-label="reduce-tooltip-text">{MatchingStepTooltips.reduceToggle}</span>} id="reduce-weight-tooltip" placement="right">
            <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" className={styles.icon} size={13} />
          </HCTooltip>
        </Form.Item>

        <Form.Item>
          <span className={styles.matchOnText}>Match on:</span>
          <span className={styles.matchOnTagsContainer}>{displayMatchOnTags()}</span>
          {!selectedRowKeys.length && saveClicked ? noPropertyCheckedErrorMessage : null}
        </Form.Item>

        <div className={styles.modalTitleLegend} aria-label="modalTitleLegend">
          <div className={styles.legendText}><img className={styles.arrayImage} src={arrayIcon}/> Multiple</div>
          <div className={styles.legendText}><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> Structured Type</div>
          <div className={styles.expandCollapseIcon}><ExpandCollapse handleSelection={(id) => handleExpandCollapse(id)} currentSelection={""} /></div>
        </div>

        <div id="multipleRulesetsTableContainer" data-testid="multipleRulesetsTableContainer">
          <Table
            pagination={paginationOptions}
            className={styles.entityTable}
            expandIcon={(props) => customExpandIcon(props)}
            onExpand={(expanded, record) => toggleRowExpanded(expanded, record)}
            expandedRowKeys={expandedRowKeys}
            rowClassName={() => styles.entityTableRows}
            rowSelection={{...rowSelection}}
            indentSize={18}
            columns={multipleRulesetsTableColumns}
            scroll={{y: "60vh", x: 1000}}
            dataSource={multipleRulesetsData}
            tableLayout="unset"
            rowKey="propertyPath"
            getPopupContainer={() => document.getElementById("multipleRulesetsTableContainer") || document.body}
          /></div>
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

export default MatchRulesetMultipleModal;
