import React, {useState, useEffect, useContext, CSSProperties} from "react";
import {Modal, Form, Input, Icon, Switch} from "antd";
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
  const {curationOptions} = useContext(CurationContext);

  const [rulesetName, setRulesetName] = useState("");
  const [rulesetNameErrorMessage, setRulesetNameErrorMessage] = useState("");
  const [isRulesetNameTouched, setIsRulesetNameTouched] = useState(false);

  const [matchOnTags, setMatchOnTags] = useState({});

  const [isPropertyTypeTouched, setIsPropertyTypeTouched] = useState(false);

  const [matchType, setMatchType] = useState<string | undefined>(undefined);
  const [isMatchTypeTouched, setIsMatchTypeTouched] = useState(false);
  const [matchTypes, setMatchTypes] = useState({});

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

  useEffect(() => {
    if (props.isVisible && curationOptions.entityDefinitionsArray.length > 0 && curationOptions.activeStep.entityName !== "") {
      let nestedEntityProps = parseDefinitionsToTable(curationOptions.entityDefinitionsArray);
      setMultipleRulesetsData(nestedEntityProps);
    }

    if (Object.keys(props.editRuleset).length !== 0 && props.isVisible) {
      let editRuleset = props.editRuleset;
      let matchType = editRuleset["matchRules"][0]["matchType"];
      if (editRuleset.reduce) {
        setReduceValue(true);
      }
      setMatchType(matchType);
      if (matchType === "custom") {
        setUriValues(editRuleset["matchRules"][0]["algorithmModulePath"]);
        setFunctionValues(editRuleset["matchRules"][0]["algorithmModuleFunction"]);
        setNamespaceValues(editRuleset["matchRules"][0]["algorithmModuleNamespace"]);

      } else if (matchType === "doubleMetaphone") {
        setDictionaryValues(editRuleset["matchRules"][0]["options"]["dictionaryURI"]);
        setDistanceThresholdValues(editRuleset["matchRules"][0]["options"]["distanceThreshold"]);

      } else if (matchType === "synonym") {
        setThesaurusValues(editRuleset["matchRules"][0]["options"]["thesaurusURI"]);
        setFilterValues(editRuleset["matchRules"][0]["options"]["filter"]);

      }
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

  const handleInputChange = (event, propertyName) => {
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
        setThesaurusErrorMessages({...thesaurusErrorMessages, [propertyName]: "A thesaurus URI is required"});
      } else {
        setThesaurusErrorMessages({...thesaurusErrorMessages, [propertyName]: ""});
      }
      setIsThesaurusTouched(true);
      setThesaurusValues({...thesaurusValues, [propertyName]: event.target.value});
      break;

    case "filter-input":
      setIsFilterTouched(true);
      setFilterValues({...filterValues, [propertyName]: event.target.value});
      break;

    case "dictionary-uri-input":
      if (event.target.value === "") {
        setIsDictionaryTouched(false);
        setDictionaryErrorMessages({...dictionaryErrorMessages, [propertyName]: "A dictionary URI is required"});
      } else {
        setDictionaryErrorMessages({...dictionaryErrorMessages, [propertyName]: ""});
      }
      setIsDictionaryTouched(true);
      setDictionaryValues({...dictionaryValues, [propertyName]: event.target.value});
      break;

    case "distance-threshold-input":
      if (event.target.value === "") {
        setIsDistanceTouched(false);
        setDistanceThresholdErrorMessages({...distanceThresholdErrorMessages, [propertyName]: "A distance threshold is required"});
      } else {
        setDistanceThresholdErrorMessages({...distanceThresholdErrorMessages, [propertyName]: ""});
      }
      setIsDistanceTouched(true);
      setDistanceThresholdValues({...distanceThresholdValues, [propertyName]: event.target.value});
      break;

    case "uri-input":
      if (event.target.value === "") {
        setIsUriTouched(false);
        setUriErrorMessages({...uriErrorMessages, [propertyName]: "A URI is required"});
      } else {
        setUriErrorMessages({...uriErrorMessages, [propertyName]: ""});
      }
      setIsUriTouched(true);
      setUriValues({...uriValues, [propertyName]: event.target.value});
      break;

    case "function-input":
      if (event.target.value === "") {
        setIsFunctionTouched(false);
        setFunctionErrorMessages({...functionErrorMessages, [propertyName]: "A function is required"});
      } else {
        setFunctionErrorMessages({...functionErrorMessages, [propertyName]: ""});
      }
      setIsFunctionTouched(true);
      setFunctionValues({...functionValues, [propertyName]: event.target.value});
      break;

    case "namespace-input":
      setIsNamespaceTouched(true);
      setNamespaceValues({...namespaceValues, [propertyName]: event.target.value});
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
    setMatchType(undefined);
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

  const onSubmit = (event) => {
    //Logic to be added later in future stories
  };

  const onMatchTypeSelect = (key: string, value: string) => {
    setIsMatchTypeTouched(true);
    setMatchTypes({...matchTypes, [key]: value});
  };

  const hasFormChanged = () => {
    if (matchType ===  "custom") {
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
    } else if (matchType === "synonym") {
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
    } else if (matchType === "doubleMetaphone") {
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

  const checkFieldInErrors = (propertyName: string, fieldType: string) => {
    let errorCheck = false;
    switch (fieldType) {
    case "thesaurus-uri-input": { if (thesaurusErrorMessages[propertyName]) { errorCheck = true; } break; }
    case "dictionary-uri-input" : { if (dictionaryErrorMessages[propertyName]) { errorCheck = true; } break; }
    case "distance-threshold-input" : { if (distanceThresholdErrorMessages[propertyName]) { errorCheck = true; } break; }
    case "uri-input" : { if (uriErrorMessages[propertyName]) { errorCheck = true; } break; }
    case "function-input" : { if (functionErrorMessages[propertyName]) { errorCheck = true; } break; }
    default: break;
    }
    return errorCheck;
  };

  const renderMatchOptions = MATCH_TYPE_OPTIONS.map((matchType, index) => {
    return <MLOption key={index} value={matchType.value} aria-label={`${matchType.value}-option`}>{matchType.name}</MLOption>;
  });

  const inputUriStyle = (propName, fieldType) => {
    const inputFieldStyle: CSSProperties = {
      width: ["dictionary-uri-input", "thesaurus-uri-input"].includes(fieldType) ? "22vw" : (fieldType === "distance-threshold-input" ? "25vw" : "13vw"),
      marginRight: "5px",
      marginLeft: ["distance-threshold-input", "function-input"].includes(fieldType) ? "15px" : "0px",
      justifyContent: "top",
      borderColor: checkFieldInErrors(propName, fieldType) ? "red" : ""
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

  const renderSynonymOptions = (propertyName, propertyKey) => {
    return <div className={styles.matchTypeDetailsContainer}>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id="thesaurus-uri-input"
            aria-label={`${propertyKey}-thesaurus-uri-input`}
            placeholder="Enter thesaurus URI"
            style={inputUriStyle(propertyName, "thesaurus-uri-input")}
            value={thesaurusValues[propertyName]}
            onChange={(e) => handleInputChange(e, propertyName)}
            onBlur={(e) => handleInputChange(e, propertyName)}
          />
          {helpIconWithAsterisk(NewMatchTooltips.thesaurusUri)}
        </span>
        {checkFieldInErrors(propertyName, "thesaurus-uri-input") ? <div id="errorInThesaurusUri" data-testid={propertyName + "-thesaurus-uri-err"} style={validationErrorStyle("thesaurus-uri-input")}>{!thesaurusValues[propertyName] ? "A thesaurus URI is required" : ""}</div> : ""}
      </span>
      <span>
        <Input
          id="filter-input"
          aria-label={`${propertyKey}-filter-input`}
          placeholder="Enter a node in the thesaurus to use as a filter"
          className={styles.filterInput}
          value={filterValues[propertyName]}
          onChange={(e) => handleInputChange(e, propertyName)}
          onBlur={(e) => handleInputChange(e, propertyName)}
        />
        <MLTooltip title={NewMatchTooltips.filter} placement="bottomLeft">
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </MLTooltip>
      </span>
    </div>;
  };

  const renderDoubleMetaphoneOptions = (propertyName, propertyKey) => {
    return <div className={styles.matchTypeDetailsContainer}>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id="dictionary-uri-input"
            aria-label={`${propertyKey}-dictionary-uri-input`}
            placeholder="Enter dictionary URI"
            style={inputUriStyle(propertyName, "dictionary-uri-input")}
            value={dictionaryValues[propertyName]}
            onChange={(e) => handleInputChange(e, propertyName)}
            onBlur={(e) => handleInputChange(e, propertyName)}
          />
          {helpIconWithAsterisk(NewMatchTooltips.dictionaryUri)}
        </span>
        {checkFieldInErrors(propertyName, "dictionary-uri-input") ? <div id="errorInDictionaryUri" data-testid={propertyName + "-dictionary-uri-err"} style={validationErrorStyle("dictionary-uri-input")}>{!dictionaryValues[propertyName] ? "A dictionary URI is required" : ""}</div> : ""}
      </span>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id="distance-threshold-input"
            aria-label={`${propertyKey}-distance-threshold-input`}
            placeholder="Enter distance threshold"
            style={inputUriStyle(propertyName, "distance-threshold-input")}
            value={distanceThresholdValues[propertyName]}
            onChange={(e) => handleInputChange(e, propertyName)}
            onBlur={(e) => handleInputChange(e, propertyName)}
          />
          {helpIconWithAsterisk(NewMatchTooltips.distanceThreshold)}
        </span>
        {checkFieldInErrors(propertyName, "distance-threshold-input") ? <div id="errorInDistanceThreshold" data-testid={propertyName + "-distance-threshold-err"} style={validationErrorStyle("distance-threshold-input")}>{!distanceThresholdValues[propertyName] ? "A distance threshold is required" : ""}</div> : ""}
      </span>
    </div>;
  };

  const renderCustomOptions = (propertyName, propertyKey) => {
    return <div className={styles.matchTypeDetailsContainer}>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id="uri-input"
            aria-label={`${propertyKey}-uri-input`}
            placeholder="Enter URI"
            style={inputUriStyle(propertyName, "uri-input")}
            value={uriValues[propertyName]}
            onChange={(e) => handleInputChange(e, propertyName)}
            onBlur={(e) => handleInputChange(e, propertyName)}
          />
          {helpIconWithAsterisk(NewMatchTooltips.uri)}
        </span>
        {checkFieldInErrors(propertyName, "uri-input") ? <div id="errorInURI" data-testid={propertyName + "-uri-err"} style={validationErrorStyle("uri-input")}>{!uriValues[propertyName] ? "A URI is required" : ""}</div> : ""}
      </span>
      <span>
        <span className={styles.mandatoryFieldContainer}>
          <Input
            id="function-input"
            aria-label={`${propertyKey}-function-input`}
            placeholder="Enter a function"
            //className={styles.functionInput}
            style={inputUriStyle(propertyName, "function-input")}
            value={functionValues[propertyName]}
            onChange={(e) => handleInputChange(e, propertyName)}
            onBlur={(e) => handleInputChange(e, propertyName)}
          />
          {helpIconWithAsterisk(NewMatchTooltips.function)}
        </span>
        {checkFieldInErrors(propertyName, "function-input") ? <div id="errorInFunction" data-testid={propertyName + "-function-err"} style={validationErrorStyle("function-input")}>{!functionValues[propertyName] ? "A function is required" : ""}</div> : ""}
      </span>
      <span>
        <Input
          id="namespace-input"
          aria-label={`${propertyKey}-namespace-input`}
          placeholder="Enter a namespace"
          className={styles.functionInput}
          value={namespaceValues[propertyName]}
          onChange={(e) => handleInputChange(e, propertyName)}
          onBlur={(e) => handleInputChange(e, propertyName)}
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
    //Dummy code to be removed when submitting the form
    if (reduceValue) {
      //Remove this block once submit logic is in place.
    }
  };

  const multipleRulesetsTableColumns = [
    {
      title: <span data-testid="nameTitle">Name</span>,
      dataIndex: "propertyName",
      key: "key",
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
            aria-label={`${row.key}-match-type-dropdown`}
            className={styles.matchTypeSelect}
            size="default"
            placeholder="Select match type"
            onSelect={(e) => onMatchTypeSelect(row.key, e)}
            value={matchTypes[row.key]}
          >
            {renderMatchOptions}
          </MLSelect>
        </div> : null;
      }
    },
    {
      title: <span data-testid="matchTypeDetailsTitle">Match Type Details</span>,
      render: (text, row) => {
        switch (matchTypes[row.key]) {
        case "synonym": return renderSynonymOptions(row.propertyName, row.key);
        case "doubleMetaphone": return renderDoubleMetaphoneOptions(row.propertyName, row.key);
        case "custom": return renderCustomOptions(row.propertyName, row.key);
        default:
          break;
        }
      }
    }
  ];

  useEffect(() => {
    hideCheckboxes();
  }, [multipleRulesetsData, checkTableUpdates]);

  const hideCheckboxes = () => {
    const checkboxList = document.getElementsByName("hidden");
    checkboxList.forEach((item: any) => {
      item.parentNode.hidden = true;
    });
  };

  const rowSelection = {

    onChange: (selected, selectedRows) => {
      let fkeys = selectedRows.map(row =>  row.key);
      setSelectedRowKeys([...fkeys]);
    },
    onSelect: (record, selected, selectedRows) => {
      if (selected) {
        let obj = {...matchOnTags, [`${record.key}`]: record.propertyName};
        setMatchOnTags(obj);
      } else {
        let obj = matchOnTags;
        delete obj[record.key];
        setMatchOnTags(obj);
      }
    },
    selectedRowKeys: selectedRowKeys,
    getCheckboxProps: record => ({name: record.hasOwnProperty("structured") && record.structured !== "" && record.hasChildren ? "hidden" : record.key}),
    onSelectAll: (selected, selectedRows, changeRows) => {
      let matchTags = {};
      let fkeys = selectedRows.map(row =>  {
        matchTags = {...matchTags, [`${row.key}`]: row.propertyName};
        return row.key;
      }
      );
      setSelectedRowKeys([...fkeys]);
      setMatchOnTags(matchTags);
    }
  };

  const handleMatchOnTags = (propertyName) => {
    const filteredByValue = Object.fromEntries(Object.entries(matchOnTags).filter(([key, value]) => value !== propertyName));
    setMatchOnTags(filteredByValue);
    setSelectedRowKeys(Object.keys(filteredByValue));
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
            rowKey="key"
            getPopupContainer={() => document.getElementById("multipleRulesetsTableContainer") || document.body}
          /></div>
        {modalFooter}
      </Form>
      {discardChanges}
    </Modal>
  );
};

export default MatchRulesetMultipleModal;
