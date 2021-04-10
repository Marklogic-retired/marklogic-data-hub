import React, {useState, useEffect, useContext, CSSProperties} from "react";
import {Modal, Form, Input, Icon, Switch, Alert} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import {MLButton, MLTooltip, MLSelect, MLTable, MLTag} from "@marklogic/design-system";
import styles from "./ruleset-multiple-modal.module.scss";
import arrayIcon from "../../../../assets/icon_array.png";
import ConfirmYesNo from "../../../common/confirm-yes-no/confirm-yes-no";
import {CurationContext} from "../../../../util/curation-context";
import {Definition} from "../../../../types/modeling-types";
import {NewMatchTooltips} from "../../../../config/tooltips.config";
import ExpandCollapse from "../../../expand-collapse/expand-collapse";
import {MatchingStep, MatchRule, MatchRuleset} from "../../../../types/curation-types";
import {updateMatchingArtifact} from "../../../../api/matching";

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

const {MLOption} = MLSelect;

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

  const [saveClicked, setSaveClicked] = useState(false);

  useEffect(() => {
    if (props.isVisible && curationOptions.entityDefinitionsArray.length > 0 && curationOptions.activeStep.entityName !== "") {
      let nestedEntityProps = parseDefinitionsToTable(curationOptions.entityDefinitionsArray);
      setMultipleRulesetsData(nestedEntityProps);
    }

    if (Object.keys(props.editRuleset).length !== 0 && props.isVisible) {
      let editRuleset = props.editRuleset;
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
    switch (event.target.id) {
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
    if (Object.keys(props.editRuleset).length !== 0) {
      // edit match step
      updateStep.matchRulesets[props.editRuleset["index"]] = matchRuleset;
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
    let propertyErrorMessage = "";
    let matchErrorMessage = "";
    let thesaurusErrorMessage = "";
    let dictionaryUriErrorMessage = "";
    let distanceThresholdErrorMessage = "";
    let uriErrorMessage = "";
    let functionErrorMessage = "";

    if (rulesetName === "" || rulesetName === undefined) {
      setRulesetNameErrorMessage("A ruleset name is required");
    }

    let matchRules: any = [];
    if (!selectedRowKeys.length) {
      propertyErrorMessage = "A property to match is required.";
    } else {
      selectedRowKeys.forEach(key => {
        let propertyPath = key;
        if (!matchTypes[key]) {
          matchErrorMessage = "A match type is required";
        }
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
            thesaurusErrorMessage = "A thesaurus URI is required";
          }

          let synonymMatchRule: MatchRule = {
            entityPropertyPath: propertyPath,
            matchType: matchTypes[key],
            options: {
              thesaurusURI: thesaurusValues[key],
              filter: filterValues[key]
            }
          };

          if (thesaurusErrorMessage === "") {
            matchRules.push(synonymMatchRule);
          }
          setThesaurusErrorMessages({...thesaurusErrorMessages, [key]: thesaurusErrorMessage});
          break;
        }
        case "doubleMetaphone":
        {
          if (dictionaryValues[key] === "" || dictionaryValues[key] === undefined) {
            dictionaryUriErrorMessage = "A dictionary URI is required";
          }

          if (distanceThresholdValues[key] === "" || distanceThresholdValues[key] === undefined) {
            distanceThresholdErrorMessage = "A distance threshold is required";
          }

          let doubleMetaphoneMatchRule: MatchRule = {
            entityPropertyPath: propertyPath,
            matchType: matchTypes[key],
            options: {
              dictionaryURI: dictionaryValues[key],
              distanceThreshold: distanceThresholdValues[key]
            }
          };

          if (dictionaryUriErrorMessage === "" && distanceThresholdErrorMessage === "") {
            matchRules.push(doubleMetaphoneMatchRule);
          }
          setDictionaryErrorMessages({...dictionaryErrorMessages, [key]: dictionaryUriErrorMessage});
          setDistanceThresholdErrorMessages({...distanceThresholdErrorMessages, [key]: distanceThresholdErrorMessage});
          break;
        }
        case "custom":
        {
          if (uriValues[key] === "" || uriValues[key] === undefined) {
            uriErrorMessage = "A URI is required";
          }

          if (functionValues[key] === "" || functionValues[key] === undefined) {
            functionErrorMessage = "A function is required";
          }

          let customMatchRule: MatchRule = {
            entityPropertyPath: propertyPath,
            matchType: matchTypes[key],
            algorithmModulePath: uriValues[key],
            algorithmFunction: functionValues[key],
            algorithmModuleNamespace: namespaceValues[key],
            options: {}
          };

          if (uriErrorMessage === "" && functionErrorMessage === "") {
            matchRules.push(customMatchRule);
          }
          setUriErrorMessages({...uriErrorMessages, [key]: uriErrorMessage});
          setFunctionErrorMessages({...functionErrorMessages, [key]: functionErrorMessage});
          break;
        }

        default:
          break;
        }
        setMatchTypeErrorMessages({...matchTypeErrorMessages, [key]: matchErrorMessage});
      });
    }

    let matchRuleset: MatchRuleset = {
      name: rulesetName,
      weight: Object.keys(props.editRuleset).length !== 0 ? props.editRuleset["weight"] : 0,
      ...({reduce: reduceValue}),
      matchRules: matchRules,
      rulesetType: "multiple"
    };

    if (rulesetNameErrorMessage === "") {
      if (propertyErrorMessage  === "" && matchErrorMessage === "" && thesaurusErrorMessage === "" && dictionaryUriErrorMessage === ""
         && distanceThresholdErrorMessage === "" && uriErrorMessage === "" && functionErrorMessage === "") {
        updateStepArtifact(matchRuleset);
        props.toggleModal(false);
        resetModal();
      }
    }
  };

  const onMatchTypeSelect = (propertyPath: string, value: string) => {
    setMatchTypeErrorMessages({...matchTypeErrorMessages, [propertyPath]: ""});
    setIsMatchTypeTouched(true);
    setMatchTypes({...matchTypes, [propertyPath]: value});
    if (!selectedRowKeys.includes(propertyPath)) {
      let selectedKeys = [...selectedRowKeys, propertyPath];
      setSelectedRowKeys(selectedKeys);
      // let matchOnTagsArr = getMatchOnTags(selectedKeys);
      // setMatchOnTags(matchOnTagsArr)
    }
  };

  const hasFormChanged = () => {
    for (let key in matchTypes) {
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
    return <MLOption key={index} value={matchType.value} aria-label={`${matchType.value}-option`}>{matchType.name}</MLOption>;
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
        <MLTooltip title={title} placement={title === NewMatchTooltips.distanceThreshold ? "bottomLeft" : "top"}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </MLTooltip>
      </div>
    </span>
  );

  const renderSynonymOptions = (propertyKey, propertyPath) => {
    return <div className={styles.matchTypeDetailsContainer}>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id="thesaurus-uri-input"
            aria-label={`${propertyPath}-thesaurus-uri-input`}
            placeholder="Enter thesaurus URI"
            style={inputUriStyle(propertyPath, "thesaurus-uri-input")}
            value={thesaurusValues[propertyPath]}
            onChange={(e) => handleInputChange(e, propertyPath)}
            onBlur={(e) => handleInputChange(e, propertyPath)}
          />
          {helpIconWithAsterisk(NewMatchTooltips.thesaurusUri)}
        </span>
        {checkFieldInErrors(propertyPath, "thesaurus-uri-input") ? <div id="errorInThesaurusUri" data-testid={propertyPath + "-thesaurus-uri-err"} style={validationErrorStyle("thesaurus-uri-input")}>{!thesaurusValues[propertyPath] ? "A thesaurus URI is required" : ""}</div> : ""}
      </span>
      <span>
        <Input
          id="filter-input"
          aria-label={`${propertyPath}-filter-input`}
          placeholder="Enter a node in the thesaurus to use as a filter"
          className={styles.filterInput}
          value={filterValues[propertyPath]}
          onChange={(e) => handleInputChange(e, propertyPath)}
          onBlur={(e) => handleInputChange(e, propertyPath)}
        />
        <MLTooltip title={NewMatchTooltips.filter} placement="bottomLeft">
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </MLTooltip>
      </span>
    </div>;
  };

  const renderDoubleMetaphoneOptions = (propertyKey, propertyPath) => {
    return <div className={styles.matchTypeDetailsContainer}>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id="dictionary-uri-input"
            aria-label={`${propertyPath}-dictionary-uri-input`}
            placeholder="Enter dictionary URI"
            style={inputUriStyle(propertyPath, "dictionary-uri-input")}
            value={dictionaryValues[propertyPath]}
            onChange={(e) => handleInputChange(e, propertyPath)}
            onBlur={(e) => handleInputChange(e, propertyPath)}
          />
          {helpIconWithAsterisk(NewMatchTooltips.dictionaryUri)}
        </span>
        {checkFieldInErrors(propertyPath, "dictionary-uri-input") ? <div id="errorInDictionaryUri" data-testid={propertyPath + "-dictionary-uri-err"} style={validationErrorStyle("dictionary-uri-input")}>{!dictionaryValues[propertyPath] ? "A dictionary URI is required" : ""}</div> : ""}
      </span>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id="distance-threshold-input"
            aria-label={`${propertyPath}-distance-threshold-input`}
            placeholder="Enter distance threshold"
            style={inputUriStyle(propertyPath, "distance-threshold-input")}
            value={distanceThresholdValues[propertyPath]}
            onChange={(e) => handleInputChange(e, propertyPath)}
            onBlur={(e) => handleInputChange(e, propertyPath)}
          />
          {helpIconWithAsterisk(NewMatchTooltips.distanceThreshold)}
        </span>
        {checkFieldInErrors(propertyPath, "distance-threshold-input") ? <div id="errorInDistanceThreshold" data-testid={propertyPath + "-distance-threshold-err"} style={validationErrorStyle("distance-threshold-input")}>{!distanceThresholdValues[propertyPath] ? "A distance threshold is required" : ""}</div> : ""}
      </span>
    </div>;
  };

  const renderCustomOptions = (propertyKey, propertyPath) => {
    return <div className={styles.matchTypeDetailsContainer}>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id="uri-input"
            aria-label={`${propertyPath}-uri-input`}
            placeholder="Enter URI"
            style={inputUriStyle(propertyPath, "uri-input")}
            value={uriValues[propertyPath]}
            onChange={(e) => handleInputChange(e, propertyPath)}
            onBlur={(e) => handleInputChange(e, propertyPath)}
          />
          {helpIconWithAsterisk(NewMatchTooltips.uri)}
        </span>
        {checkFieldInErrors(propertyPath, "uri-input") ? <div id="errorInURI" data-testid={propertyPath + "-uri-err"} style={validationErrorStyle("uri-input")}>{!uriValues[propertyPath] ? "A URI is required" : ""}</div> : ""}
      </span>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id="function-input"
            aria-label={`${propertyPath}-function-input`}
            placeholder="Enter a function"
            style={inputUriStyle(propertyPath, "function-input")}
            value={functionValues[propertyPath]}
            onChange={(e) => handleInputChange(e, propertyPath)}
            onBlur={(e) => handleInputChange(e, propertyPath)}
          />
          {helpIconWithAsterisk(NewMatchTooltips.function)}
        </span>
        {checkFieldInErrors(propertyPath, "function-input") ? <div id="errorInFunction" data-testid={propertyPath + "-function-err"} style={validationErrorStyle("function-input")}>{!functionValues[propertyPath] ? "A function is required" : ""}</div> : ""}
      </span>
      <span>
        <Input
          id="namespace-input"
          aria-label={`${propertyPath}-namespace-input`}
          placeholder="Enter a namespace"
          className={styles.functionInput}
          value={namespaceValues[propertyPath]}
          onChange={(e) => handleInputChange(e, propertyPath)}
          onBlur={(e) => handleInputChange(e, propertyPath)}
        />
        <MLTooltip title={NewMatchTooltips.namespace}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </MLTooltip>
      </span>
    </div>;
  };

  const modalTitle = (
    <div className={styles.modalTitleContainer}>
      <div className={styles.modalTitle}>{Object.keys(props.editRuleset).length !== 0 ? "Edit Match Ruleset for Multiple Properties" : "Add Match Ruleset for Multiple Properties"}</div>
      <p className={styles.titleDescription} aria-label="titleDescription">Select all the properties to include in the ruleset, and specify a match type for each property.</p>
    </div>
  );

  const modalFooter = (
    <div className={styles.footer}>
      <MLButton
        aria-label={`cancel-multiple-ruleset`}
        onClick={closeModal}
      >Cancel</MLButton>
      <MLButton
        className={styles.saveButton}
        aria-label={`confirm-multiple-ruleset`}
        type="primary"
        onClick={(e) => onSubmit(e)}
      >Save</MLButton>
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
          <MLSelect
            aria-label={`${row.propertyPath}-match-type-dropdown`}
            className={styles.matchTypeSelect}
            size="default"
            placeholder="Select match type"
            onSelect={(e) => onMatchTypeSelect(row.propertyPath, e)}
            value={matchTypes[row.propertyPath]}
          >
            {renderMatchOptions}
          </MLSelect>
          {checkFieldInErrors(row.propertyPath, "match-type-input") ? <div id="errorInMatchType" data-testid={row.propertyPath + "-match-type-err"} style={validationErrorStyle("match-type-input")}>{!matchTypes[row.propertyPath] ? "A match type is required" : ""}</div> : ""}
        </div> : null;
      }
    },
    {
      title: <span data-testid="matchTypeDetailsTitle">Match Type Details</span>,
      width: "68%",
      render: (text, row) => {
        switch (matchTypes[row.propertyPath]) {
        case "synonym": return renderSynonymOptions(row.key, row.propertyPath);
        case "doubleMetaphone": return renderDoubleMetaphoneOptions(row.key, row.propertyPath);
        case "custom": return renderCustomOptions(row.key, row.propertyPath);
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

  const rowSelection = {
    onChange: (selected, selectedRows) => {
      let fkeys = selectedRows.map(row =>  row.propertyPath);
      setSelectedRowKeys([...fkeys]);
    },
    onSelect: (record, selected, selectedRows) => {
      if (!selected) {
        if (record.propertyPath in matchTypes) {
          let obj = matchTypes;
          let matchType = matchTypes[record.propertyPath];
          delete obj[record.propertyPath];
          setMatchTypes(obj);
          resetPropertyErrorsAndValues(record.propertyPath, matchType);
        } else {
          if (record.propertyPath in matchTypeErrorMessages) {
            let matchTypeErrorMessagesObj = matchTypeErrorMessages;
            delete matchTypeErrorMessagesObj[record.propertyPath];
            setMatchTypeErrorMessages(matchTypeErrorMessagesObj);
          }
        }
      }
    },
    selectedRowKeys: selectedRowKeys,
    getCheckboxProps: record => ({name: record.hasOwnProperty("structured") && record.structured !== "" && record.hasChildren ? "hidden" : record.propertyPath}),
  };

  const handleMatchOnTags = (tag) => {
    const filteredByValue = Object.fromEntries(Object.entries(matchOnTags).filter(([key, value]) => value !== tag));
    let rowkeys = Object.keys(filteredByValue);
    setSelectedRowKeys(rowkeys);
    let obj = matchTypes;
    Object.keys(matchTypes).forEach(el => {
      if (!rowkeys.includes(el)) {
        delete obj[el];
      }
    });
    setMatchTypes(obj);
  };

  const displayMatchOnTags = () => {
    return Object.values(matchOnTags).map((prop) => <MLTag className={styles.matchOnTags} closable onClose={() => handleMatchOnTags(prop)}>
      {prop}
    </MLTag>);
  };

  const toggleRowExpanded = (expanded, record) => {
    if (expanded) {
      setCheckTableUpdates(record.key);
    }
  };

  const handleExpandCollapse = () => {
    //Logic to be added during dedicated story for expand collapse icons
  };

  const onAlertClose = () => {
    setSaveClicked(false);
  };

  const noPropertyCheckedErrorMessage = <span id="noPropertyCheckedErrorMessage"><Alert
    type="error"
    message="You must select at least one property for the ruleset to be created"
    aria-label="noPropertyCheckedErrorMessage"
    className={styles.noPropertyCheckedErrorMessage} showIcon
    closable
    onClose={onAlertClose}
    icon={<Icon type="exclamation-circle" className={styles.exclamationCircle} theme="filled" />} /></span>;


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
          {/*tooltip content yet to be finalized*/}
          <MLTooltip>
            <Icon type="question-circle" className={styles.icon} theme="filled" />
          </MLTooltip>
        </Form.Item>

        <Form.Item>
          <span className={styles.matchOnText}>Match on:</span>
          <span className={styles.matchOnTagsContainer}>{displayMatchOnTags()}</span>
          {!selectedRowKeys.length && saveClicked ? noPropertyCheckedErrorMessage : null}
        </Form.Item>

        <div className={styles.modalTitleLegend} aria-label="modalTitleLegend">
          <div className={styles.legendText}><img className={styles.arrayImage} src={arrayIcon}/> Multiple</div>
          <div className={styles.legendText}><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> Structured Type</div>
          <div className={styles.expandCollapseIcon}><ExpandCollapse handleSelection={handleExpandCollapse} currentSelection={""} /></div>
        </div>

        <div id="multipleRulesetsTableContainer" data-testid="multipleRulesetsTableContainer">
          <MLTable
            pagination={false}
            className={styles.entityTable}
            onExpand={(expanded, record) => toggleRowExpanded(expanded, record)}
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
    </Modal>
  );
};

export default MatchRulesetMultipleModal;
