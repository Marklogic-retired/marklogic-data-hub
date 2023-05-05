import React, {useState, useEffect, useContext, useRef} from "react";
import {useHistory} from "react-router-dom";
import {Row, Col, Accordion, Card, FormCheck, Tabs, Tab} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusSquare} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import CustomPageHeader from "../../page-header/page-header";
import RulesetSingleModal from "../ruleset-single-modal/ruleset-single-modal";
import RulesetMultipleModal from "../ruleset-multiple-modal/ruleset-multiple-modal";
import NumberIcon from "../../../number-icon/number-icon";
import ThresholdModal from "../threshold-modal/threshold-modal";
import {CurationContext} from "@util/curation-context";
import {MatchingStep} from "../../../../types/curation-types";
import {MatchingStepDetailText, MatchingStepTooltips} from "@config/tooltips.config";
import {
  updateMatchingArtifact,
  calculateMatchingActivity,
  previewMatchingActivity,
  getDocFromURI,
  getPreviewFromURIs,
} from "@api/matching";
import {ChevronDown} from "react-bootstrap-icons";
import {getViewSettings, setViewSettings, clearSessionStorageOnRefresh} from "@util/user-context";
import ExpandCollapse from "../../../expand-collapse/expand-collapse";
import ExpandableTableView from "../expandable-table-view/expandable-table-view";
import CompareValuesModal from "../compare-values-modal/compare-values-modal";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import TimelineVis from "./timeline-vis/timeline-vis";
import TimelineVisDefault from "./timeline-vis-default/timeline-vis-default";
import {QuestionCircleFill} from "react-bootstrap-icons";
import styles from "./matching-step-detail.module.scss";
import {DropdownButton, Dropdown} from "react-bootstrap";
import {HCButton, HCCard, HCInput, HCTooltip, HCTable} from "@components/common";
import "./matching-step-detail.scss";
import {themeColors} from "@config/themes.config";

dayjs.extend(duration);

const DEFAULT_MATCHING_STEP: MatchingStep = {
  name: "",
  description: "",
  additionalCollections: [],
  collections: [],
  lastUpdated: "",
  permissions: "",
  provenanceGranularityLevel: "",
  selectedSource: "",
  sourceDatabase: "",
  sourceQuery: "",
  stepDefinitionName: "",
  stepDefinitionType: "",
  stepId: "",
  targetDatabase: "",
  targetEntityType: "",
  targetFormat: "",
  matchRulesets: [],
  thresholds: [],
  interceptors: {},
  customHook: {},
};

const MatchingStepDetail: React.FC = () => {
  const storage = getViewSettings();
  const expandedRulesetStorage = storage.match?.rulesetExpanded ? storage.match.rulesetExpanded : false;
  const rulesetToggleStorage = storage.match?.editRulesetTimeline ? storage.match.editRulesetTimeline : false;
  const thresholdToggleStorage = storage.match?.editThresholdTimeline ? storage.match.editThresholdTimeline : false;
  const rulesetTextStorage = storage.match?.rulesetTextExpanded ? storage.match.rulesetTextExpanded : false;
  const thresholdTextStorage = storage.match?.thresholdTextExpanded ? storage.match.thresholdTextExpanded : false;
  const testRadioStorage = storage.match?.testRadioSelection ? storage.match.testRadioSelection : 1;
  const rulesetDataStorage = storage.match?.rulesetData
    ? storage.match.rulesetData
    : [{rulesetName: "", actionPreviewData: [{name: "", action: "", uris: ["", ""]}], score: 0}];
  const previewDataStorage = storage.match?.previewMatchedDataActivity
    ? storage.match.previewMatchedDataActivity
    : {sampleSize: 100, uris: [], actionPreview: []};
  const previewDataValueStorage =
    storage.match?.previewMatchedDataValue == 0 ? storage.match.previewMatchedDataValue : -1; // eslint-disable-line
  const previewNonMatchDataStorage = storage.match?.previewNonMatchedDataActivity
    ? storage.match.previewNonMatchedDataActivity
    : {sampleSize: 100, uris: [], actionPreview: []};
  const previewNonMatchDataValueStorage =
    storage.match?.previewNonMatchedDataValue == 0 ? storage.match.previewNonMatchedDataValue : -1; // eslint-disable-line
  const uriTestStorage = storage.match?.uriTestClicked ? storage.match.uriTestClicked : false;
  const uriData1Storage = storage.match?.uriTableData1 ? storage.match.uriTableData1 : [];
  const uriData2Storage = storage.match?.uriTableData2 ? storage.match.uriTableData2 : [];
  const inputUriDisabledStorage = storage.match?.hasOwnProperty("inputUriState") ? storage.match?.inputUriState : false;
  const inputUriDisabled2Storage = storage.match?.hasOwnProperty("inputUri2State")
    ? storage.match?.inputUri2State
    : true;

  // Prevents an infinite loop issue with sessionStorage due to user refreshing in step detail page.
  clearSessionStorageOnRefresh();

  const history = useHistory<any>();
  const {curationOptions, updateActiveStepArtifact} = useContext(CurationContext);
  const [matchingStep, setMatchingStep] = useState<MatchingStep>(DEFAULT_MATCHING_STEP);
  const [editThreshold, setEditThreshold] = useState({});
  const [editRuleset, setEditRuleset] = useState({});
  const [showThresholdModal, toggleShowThresholdModal] = useState(false);
  const [showRulesetSingleModal, toggleShowRulesetSingleModal] = useState(false);
  const [moreThresholdText, toggleMoreThresholdText] = useState(thresholdTextStorage);
  const [moreRulesetText, toggleMoreRulesetText] = useState(rulesetTextStorage);
  const [matchingActivity, setMatchingActivity] = useState<any>({scale: {}, thresholdActions: []});
  const [value, setValue] = React.useState(testRadioStorage);
  const [UriTableData, setUriTableData] = useState(uriData1Storage);
  const [UriTableData2, setUriTableData2] = useState(uriData2Storage);
  const [uriContent, setUriContent] = useState("");
  const [uriContent2, setUriContent2] = useState("");
  const [inputUriDisabled, setInputUriDisabled] = useState(inputUriDisabledStorage);
  const [inputUriDisabled2, setInputUriDisabled2] = useState(inputUriDisabled2Storage);
  const [testMatchTab, setTestMatchTab] = useState("matched");
  const [duplicateUriWarning, setDuplicateUriWarning] = useState(false);
  const [duplicateUriWarning2, setDuplicateUriWarning2] = useState(false);
  const [singleUriWarning, setSingleUriWarning] = useState(false);
  const [singleUriWarning2, setSingleUriWarning2] = useState(false);
  const [uriTestMatchClicked, setUriTestMatchClicked] = useState(uriTestStorage);
  const [loading, setToggleLoading] = useState(false);
  const [compareBtnLoading, setCompareBtnLoading] = useState<any>([]);
  const [allDataSelected, setAllDataSelected] = useState(false);
  const [testUrisOnlySelected, setTestUrisOnlySelected] = useState(true);
  const [testUrisAllDataSelected, setTestUrisAllDataSelected] = useState(false);
  const [testMatchedData, setTestMatchedData] = useState<any>({stepName: "", sampleSize: 100, uris: []});
  const [previewMatchedActivity, setPreviewMatchedActivity] = useState<any>(previewDataStorage);
  const [previewNonMatchedActivity, setPreviewNonMatchedActivity] = useState<any>(previewNonMatchDataStorage);
  const [showRulesetMultipleModal, toggleShowRulesetMultipleModal] = useState(false);

  const [rulesetDataList, setRulesetDataList] = useState<any>(rulesetDataStorage);
  const [rulesetNonMatchedDataList, setRulesetNonMatchedDataList] = useState<any>(rulesetDataStorage);
  const [activeMatchedRuleset, setActiveMatchedRuleset] = useState<string[]>([]);
  const [activeMatchedUri, setActiveMatchedUri] = useState<string[]>([]);
  const [allRulesetNames] = useState<string[]>([]);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [uriInfo, setUriInfo] = useState<any>();
  const [entityProperties, setEntityProperties] = useState<any>();
  const [urisCompared, setUrisCompared] = useState<string[]>([]);
  const [uris, setUris] = useState<string[]>([]);
  const [previewMatchedData, setPreviewMatchedData] = useState(previewDataValueStorage);
  const [previewNonMatchedData, setPreviewNonMatchedData] = useState(previewNonMatchDataValueStorage);
  const [expandRuleset, setExpandRuleset] = useState(expandedRulesetStorage);
  const [colourElementAdded, setColourElementAdded] = useState(false);
  const [colourElementAdded2, setColourElementAdded2] = useState(false);
  const notMatchedThreshold = [{thresholdName: "Not Matched", action: "none", score: 0}];

  //To handle timeline display
  const [rulesetItems, setRulesetItems] = useState<any[]>([]);
  const [thresholdItems, setThresholdItems] = useState<any[]>([]);
  const [displayRulesetTimeline, toggleDisplayRulesetTimeline] = useState(rulesetToggleStorage);
  const [displayThresholdTimeline, toggleDisplayThresholdTimeline] = useState(thresholdToggleStorage);
  const refMatchingRuleset = useRef<any[]>();

  useEffect(() => {
    if (Object.keys(curationOptions.activeStep.stepArtifact).length !== 0) {
      const matchingStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
      if (matchingStepArtifact.matchRulesets) {
        let rulesetItems = matchingStepArtifact.matchRulesets.map((item, id) => ({
          id: id,
          start: item.weight,
          reduce: item.reduce ? item.reduce : false,
          value: item.name + ":" + item.weight.toString(),
        }));
        setRulesetItems(rulesetItems);
        if (matchingStepArtifact.matchRulesets.length === 0) {
          toggleMoreRulesetText(true);
        }
      }
      if (matchingStepArtifact.thresholds) {
        let thresholdItems = matchingStepArtifact.thresholds.map((item, id) => ({
          id: id,
          start: item.score,
          value: item.thresholdName + " - " + item.action + ":" + item.score.toString(),
        }));
        setThresholdItems(thresholdItems);
        if (matchingStepArtifact.thresholds.length === 0) {
          toggleMoreThresholdText(true);
        }
      }
      setMatchingStep(matchingStepArtifact);
      handleMatchingActivity(matchingStepArtifact.name);
    } else {
      setTimeout(() => {
        history.push("/tiles/curate");
        setViewSettings({...storage, curate: {}, match: {}});
      }, 300);
    }
    /*return () => {
      toggleDisplayRulesetTimeline(false);
    }*/
  }, [JSON.stringify(curationOptions.activeStep.stepArtifact)]);

  useEffect(() => {
    refMatchingRuleset.current! = matchingStep.matchRulesets;
  }, [matchingStep]);

  useEffect(() => {
    setColourElementAdded(false);
  }, [uriContent]);
  useEffect(() => {
    setColourElementAdded2(false);
  }, [uriContent2]);

  useEffect(() => {
    setViewSettings({
      ...storage,
      match: {
        ...storage.match,
        rulesetExpanded: expandRuleset,
        editRulesetTimeline: displayRulesetTimeline,
        editThresholdTimeline: displayThresholdTimeline,
        rulesetTextExpanded: moreRulesetText,
        thresholdTextExpanded: moreThresholdText,
        testRadioSelection: value,
        previewMatchedDataValue: previewMatchedData,
        previewMatchedDataActivity: previewMatchedActivity,
        previewNonMatchedDataValue: previewNonMatchedData,
        previewNonMatchedDataActivity: previewNonMatchedActivity,
        uriTestClicked: uriTestMatchClicked,
        rulesetData: rulesetDataList,
        rulesetNonMatchedData: rulesetNonMatchedDataList,
        inputUriState: inputUriDisabled,
        inputUri2State: inputUriDisabled2,
        uriTableData1: UriTableData,
        uriTableData2: UriTableData2,
      },
    });
  }, [
    expandRuleset,
    displayRulesetTimeline,
    displayThresholdTimeline,
    moreRulesetText,
    moreThresholdText,
    value,
    previewMatchedActivity,
    previewNonMatchedActivity,
    uriTestMatchClicked,
    rulesetDataList,
    inputUriDisabled,
    inputUriDisabled2,
    previewMatchedData,
    UriTableData,
    UriTableData2,
  ]);

  useEffect(() => {
    if (value === 1) {
      setTestUrisOnlySelected(true);
      setTestUrisAllDataSelected(false);
      setAllDataSelected(false);
    }
    if (value === 2) {
      setTestUrisAllDataSelected(true);
      setTestUrisOnlySelected(false);
      setAllDataSelected(false);
    }
    if (value === 3) {
      setAllDataSelected(true);
      setTestUrisOnlySelected(false);
      setTestUrisAllDataSelected(false);
    }
  }, [value]);

  const handleMatchingActivity = async matchStepName => {
    let matchActivity = await calculateMatchingActivity(matchStepName);
    setMatchingActivity(matchActivity);
  };

  const handlePreviewMatchingActivity = async (
    testMatchData,
    previewActivity = previewMatchedActivity,
    thresholds = curationOptions.activeStep.stepArtifact.thresholds,
    setDataFunction = setPreviewMatchedData,
    setActivityFunction = setPreviewMatchedActivity,
    setDataList = setRulesetDataList,
  ) => {
    const test = () => {
      let localRulesetDataList: any = [];
      for (let i = 0; i < thresholds.length; i++) {
        let ruleset = thresholds[i].thresholdName.concat(" - ") + thresholds[i].action;
        let score = thresholds[i].score;
        let actionPreviewList = [{}];
        if (previewActivity === undefined) previewActivity = {actionPreview: []};
        for (let j = 0; j < previewActivity.actionPreview.length; j++) {
          if (
            thresholds[i].thresholdName === previewActivity.actionPreview[j].name &&
            thresholds[i].action === previewActivity.actionPreview[j].action
          ) {
            actionPreviewList.push(previewActivity.actionPreview[j]);
          }
        }
        actionPreviewList.shift();
        let localData = {rulesetName: "", actionPreviewData: [{}], score: 0};
        localData.rulesetName = ruleset;
        localData.score = score;
        localData.actionPreviewData = actionPreviewList;
        allRulesetNames.push(ruleset);
        if (localData.actionPreviewData.length > 0) {
          localRulesetDataList.push(localData);
        }
      }
      return localRulesetDataList;
    };
    previewActivity = await previewMatchingActivity(testMatchData);
    if (previewActivity) {
      setToggleLoading(false);
      let updatedRulesetList = await test();
      setDataFunction(previewActivity.actionPreview.length);
      setActivityFunction(previewActivity);
      setDataList(updatedRulesetList);
    }
  };

  const handlePreviewNonMatchingActivity = async testMatchData => {
    await handlePreviewMatchingActivity(
      Object.assign({nonMatches: true}, testMatchedData),
      previewNonMatchedActivity,
      notMatchedThreshold,
      setPreviewNonMatchedData,
      setPreviewNonMatchedActivity,
      setRulesetNonMatchedDataList,
    );
  };

  const getKeysToExpandFromTable = async () => {
    let allKeys = [""];
    rulesetDataList.forEach(ruleset => {
      for (let i in ruleset.actionPreviewData) {
        let key = ruleset.rulesetName.concat("/") + i;
        allKeys.push(key);
      }
    });
    return allKeys;
  };

  const addNewSingleRuleset = () => {
    setEditRuleset({});
    toggleShowRulesetSingleModal(true);
  };

  const addNewMultipleRuleset = () => {
    setEditRuleset({});
    toggleShowRulesetMultipleModal(true);
  };

  const getRulesetName = rulesetComb => {
    let matchRules = rulesetComb.matchRules;
    let rulesetName = rulesetComb.rulesetName.split(".").join(" > ");
    if (!rulesetComb.rulesetName && Array.isArray(matchRules) && matchRules.length) {
      rulesetName = matchRules[0].entityPropertyPath.split(".").join(" > ") + " - " + matchRules[0].matchAlgorithm;
    }
    return rulesetName;
  };

  const onTestMatchRadioChange = event => {
    setValue(parseInt(event.target.value));
    setPreviewMatchedData(-1);
  };

  const handleUriInputChange = event => {
    setUriContent(event.target.value);
  };

  const handleUriInputChange2 = event => {
    setUriContent2(event.target.value);
  };

  const handleClickAddUri = event => {
    let flag = false;
    let setDuplicateWarning = () => {
      setDuplicateUriWarning(true);
      setSingleUriWarning(false);
    };
    if (UriTableData.length > 0) {
      for (let i = 0; i < UriTableData.length; i++) {
        if (UriTableData[i].uriContent === uriContent) {
          flag = true;
          setDuplicateWarning();
          break;
        }
      }
    }
    if (uriContent.length > 0 && !flag) {
      let data = [...UriTableData];
      data.push({uriContent});
      setUriTableData(data);
      setDuplicateUriWarning(false);
      setSingleUriWarning(false);
      setColourElementAdded(true);
    }
  };

  const handleClickAddUri2 = event => {
    let flag = false;
    let setDuplicateWarning = () => {
      setDuplicateUriWarning2(true);
      setSingleUriWarning2(false);
    };
    if (UriTableData2.length > 0) {
      for (let i = 0; i < UriTableData2.length; i++) {
        if (UriTableData2[i].uriContent2 === uriContent2) {
          flag = true;
          setDuplicateWarning();
          break;
        }
      }
    }
    if (uriContent2.length > 0 && !flag) {
      let data = [...UriTableData2];
      data.push({uriContent2});
      setUriTableData2(data);
      setDuplicateUriWarning2(false);
      setSingleUriWarning2(false);
      setColourElementAdded2(true);
    }
  };

  const renderUriTableData = UriTableData.map(uriData => {
    return {
      key: uriData.uriContent,
      uriValue: uriData.uriContent,
    };
  });

  const renderUriTableData2 = UriTableData2.map(uriData => {
    return {
      key: uriData.uriContent2,
      uriValue: uriData.uriContent2,
    };
  });

  const UriColumns = [
    {
      key: "uriValue",
      text: "uriValues",
      dataField: "uriValue",
      formatter: (text, key) => (
        <span className={styles.tableRow}>
          {text}
          <i className={styles.positionDeleteIcon} aria-label="deleteIcon">
            <FontAwesomeIcon
              data-testid={`${text}-delete`}
              icon={faTrashAlt}
              className={styles.deleteIcon}
              onClick={() => handleDeleteUri(key)}
              size="lg"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  handleDeleteUri(key);
                }
              }}
            />
          </i>
        </span>
      ),
      formatExtraData: {UriTableData},
    },
  ];

  const UriColumns2 = [
    {
      key: "uriValue",
      text: "uriValues",
      dataField: "uriValue",
      formatter: (text, key) => (
        <span className={styles.tableRow}>
          {text}
          <i className={styles.positionDeleteIcon} aria-label="deleteIcon">
            <FontAwesomeIcon
              data-testid={`${text}-delete`}
              icon={faTrashAlt}
              className={styles.deleteIcon}
              onClick={() => handleDeleteUri2(key)}
              size="lg"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  handleDeleteUri2(key);
                }
              }}
            />
          </i>
        </span>
      ),
      formatExtraData: {UriTableData2},
    },
  ];

  const handleDeleteUri = event => {
    let uriValue = event.uriValue;
    let data = [...UriTableData];
    for (let i = 0; i < data.length; i++) {
      if (data[i].uriContent === uriValue) {
        data.splice(i, 1);
        break;
      }
    }
    setUriTableData(data);
    setDuplicateUriWarning(false);
    setSingleUriWarning(false);
    setUriTestMatchClicked(false);
  };

  const handleDeleteUri2 = event => {
    let uriValue = event.uriValue;
    let data = [...UriTableData2];
    for (let i = 0; i < data.length; i++) {
      if (data[i].uriContent2 === uriValue) {
        data.splice(i, 1);
        break;
      }
    }

    setUriTableData2(data);
    setDuplicateUriWarning2(false);
    setSingleUriWarning2(false);
    setUriTestMatchClicked(false);
  };


  const handleAllDataRadioClick = () => {
    testMatchedData.uris = [];
    setAllDataSelected(true);
    setUriTableData([]);
    setUriTableData2([]);
    setUriContent("");
    setUriContent2("");
    setInputUriDisabled(true);
    setInputUriDisabled2(true);
    setDuplicateUriWarning(false);
    setDuplicateUriWarning2(false);
    setSingleUriWarning(false);
    setSingleUriWarning2(false);
    setUriTestMatchClicked(false);
    setRulesetDataList([
      {rulesetName: "", actionPreviewData: [{name: "", action: "", uris: ["", ""], matchRulesets: [""]}], score: 0},
    ]);
    setRulesetNonMatchedDataList([
      {rulesetName: "", actionPreviewData: [{name: "", action: "", uris: ["", ""], matchRulesets: [""]}], score: 0},
    ]);
  };

  const handleTestButtonClick = async () => {
    testMatchedData.uris = [];
    setRulesetDataList([
      {rulesetName: "", actionPreviewData: [{name: "", action: "", uris: ["", ""], matchRulesets: [""]}], score: 0},
    ]);
    setRulesetNonMatchedDataList([
      {rulesetName: "", actionPreviewData: [{name: "", action: "", uris: ["", ""], matchRulesets: [""]}], score: 0},
    ]);
    setActiveMatchedUri([]);
    setActiveMatchedRuleset([]);
    if (UriTableData.length < 2 && !allDataSelected && !testUrisAllDataSelected) {
      setDuplicateUriWarning(false);
      setSingleUriWarning(true);
    }
    if (UriTableData2.length === 0 && !allDataSelected && !testUrisOnlySelected) {
      setDuplicateUriWarning2(false);
      setSingleUriWarning2(true);
    }
    if (UriTableData.length >= 2 || allDataSelected) {
      if (!duplicateUriWarning && !singleUriWarning) {
        setToggleLoading(true);
        setUriTestMatchClicked(true);
        for (let i = 0; i < UriTableData.length; i++) {
          testMatchedData.uris.push(UriTableData[i].uriContent);
        }
        testMatchedData.stepName = matchingStep.name;
        if (!allDataSelected) testMatchedData.restrictToUris = true;
        else testMatchedData.restrictToUris = false;
        setTestMatchedData(testMatchedData);
        await handlePreviewMatchingActivity(testMatchedData);
        await handlePreviewNonMatchingActivity(testMatchedData);
      }
    }

    if (UriTableData2.length >= 1) {
      if (!duplicateUriWarning2 && !singleUriWarning2) {
        setUriTestMatchClicked(true);
        for (let i = 0; i < UriTableData2.length; i++) {
          testMatchedData.uris.push(UriTableData2[i].uriContent2);
        }
        testMatchedData.stepName = matchingStep.name;
        testMatchedData.restrictToUris = false;
        setTestMatchedData(testMatchedData);
        await handlePreviewMatchingActivity(testMatchedData);
        await handlePreviewNonMatchingActivity(testMatchedData);
      }
    }
  };

  // const handleTestMatchTab = (event) => {
  //   setTestMatchTab(event.key);
  // };

  const handleUriInputSelected = () => {
    setInputUriDisabled(false);
    setTestUrisOnlySelected(true);
    setTestUrisAllDataSelected(false);
    setInputUriDisabled2(true);
    setAllDataSelected(false);
    setUriTableData2([]);
    setUriContent2("");
    setUriTestMatchClicked(false);
    setSingleUriWarning2(false);
    setDuplicateUriWarning2(false);
    setRulesetDataList([{rulesetName: "", actionPreviewData: [{name: "", action: "", uris: ["", ""]}], score: 0}]);
  };

  const handleUriInputSelected2 = () => {
    setInputUriDisabled2(false);
    setInputUriDisabled(true);
    setTestUrisOnlySelected(false);
    setTestUrisAllDataSelected(true);
    setDuplicateUriWarning(false);
    setSingleUriWarning(false);
    setUriTableData([]);
    setUriContent("");
    setAllDataSelected(false);
    setUriTestMatchClicked(false);
    setRulesetDataList([{rulesetName: "", actionPreviewData: [{name: "", action: "", uris: ["", ""]}], score: 0}]);
  };

  const handleExpandCollapse = async option => {
    if (option === "collapse") {
      setActiveMatchedRuleset([]);
      setActiveMatchedUri([]);
    } else {
      setActiveMatchedRuleset(allRulesetNames);
      let allKey = await getKeysToExpandFromTable();
      setActiveMatchedUri(allKey);
    }
  };

  const handleExpandCollapseRulesIcon = async option => {
    if (option === "collapse") {
      setExpandRuleset(false);
    } else {
      setExpandRuleset(true);
    }
  };

  const handleRulesetAccordionChange = async key => {
    const tmpActiveMatchedRuleset = [...activeMatchedRuleset];
    const index = tmpActiveMatchedRuleset.indexOf(key);
    index !== -1 ? tmpActiveMatchedRuleset.splice(index, 1) : tmpActiveMatchedRuleset.push(key);
    setActiveMatchedRuleset(tmpActiveMatchedRuleset);
    let arr = activeMatchedUri;
    for (let i = 0; i < activeMatchedUri.length; i++) {
      let rulesetName = activeMatchedUri[i].split("/")[0];
      if (!activeMatchedRuleset.includes(rulesetName)) {
        arr = arr.filter(e => e !== activeMatchedUri[i]);
      }
    }
    setActiveMatchedUri(arr);
  };

  const handleUrisAccordionChange = key => {
    const tmpActiveMatchedUri = [...activeMatchedUri];
    const index = tmpActiveMatchedUri.indexOf(key);
    index !== -1 ? tmpActiveMatchedUri.splice(index, 1) : tmpActiveMatchedUri.push(key);
    setActiveMatchedUri(tmpActiveMatchedUri);
  };

  const handleCompareButton = async (e, rulesetName, arr) => {
    setCompareBtnLoading([e.target.id, rulesetName]);
    setEntityProperties(curationOptions.entityDefinitionsArray[0].properties);
    const result1 = await getDocFromURI(arr[0]);
    const result2 = await getDocFromURI(arr[1]);
    const uris = [arr[0], arr[1]];
    setUris(uris);

    const flowName = result1.data.recordMetadata.datahubCreatedInFlow;
    const preview = flowName ? await getPreviewFromURIs(flowName, arr) : null;

    if (result1.status === 200 && result2.status === 200 && preview?.status === 200) {
      let result1Instance = result1.data.data.envelope.instance;
      let result2Instance = result2.data.data.envelope.instance;
      let previewInstance = preview.data.value.envelope.instance;
      await setUriInfo([{result1Instance}, {result2Instance}, {previewInstance}]);
    }
    setCompareBtnLoading(["#", "#"]);
    setCompareModalVisible(true);
    setUrisCompared(uris);
  };

  const updateRulesetItems = async (id, newvalue) => {
    let stepArtifact = curationOptions.activeStep.stepArtifact;
    let stepArtifactRulesets = curationOptions.activeStep.stepArtifact.matchRulesets;
    let updateRuleset = stepArtifactRulesets[id];
    updateRuleset["weight"] = parseInt(newvalue);
    stepArtifactRulesets[id] = updateRuleset;
    stepArtifact["matchRulesets"] = stepArtifactRulesets;
    updateActiveStepArtifact(stepArtifact);
    await updateMatchingArtifact(stepArtifact);
  };

  const timelineOrder = (a, b) => {
    let aParts = a.value.split(":");
    let bParts = b.value.split(":");
    // If weights not equal
    if (bParts[bParts.length - 1] !== aParts[aParts.length - 1]) {
      // By weight
      return parseInt(bParts[bParts.length - 1]) - parseInt(aParts[aParts.length - 1]);
    } else {
      // Else alphabetically
      let aUpper = a.value.toUpperCase();
      let bUpper = b.value.toUpperCase();
      return aUpper < bUpper ? 1 : aUpper > bUpper ? -1 : 0;
    }
  };

  const rulesetOptions: any = {
    max: 120,
    min: -20,
    start: -20,
    end: 120,
    width: "100%",
    itemsAlwaysDraggable: {
      item: displayRulesetTimeline,
      range: displayRulesetTimeline,
    },
    selectable: false,
    editable: {
      remove: true,
      updateTime: true,
    },
    moveable: false,
    timeAxis: {
      scale: "millisecond",
      step: 5,
    },
    onMove: function (item, callback) {
      if (item.start >= 0 && item.start <= 100) {
        item.value = item.start.getMilliseconds().toString();
        callback(item);
        updateRulesetItems(item.id, item.start.getMilliseconds().toString());
      } else {
        if (item.start < 1) {
          item.start = 1;
          item.value = "1";
        } else {
          item.start = 100;
          item.value = "100";
        }
        callback(item);
        updateRulesetItems(item.id, item.value);
      }
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
    template: function (item) {
      if (item && item.hasOwnProperty("value")) {
        if (item.reduce === false) {
          return (
            "<div data-testid=\"ruleset" +
            " " +
            item.value.split(":")[0] +
            "\">" +
            item.value.split(":")[0] +
            "<div class=\"itemValue\">" +
            item.value.split(":")[1] +
            "</div></div>"
          );
        } else {
          return (
            "<div data-testid=\"ruleset-reduce" +
            " " +
            item.value.split(":")[0] +
            "\">" +
            item.value.split(":")[0] +
            "<div class=\"itemReduceValue\">" +
            -item.value.split(":")[1] +
            "</div></div>"
          );
        }
      }
    },
    maxMinorChars: 4,
    order: timelineOrder,
  };

  const thresholdOptions: any = {
    max: 120,
    min: -20,
    start: -20,
    end: 120,
    width: "100%",
    itemsAlwaysDraggable: {
      item: displayThresholdTimeline,
      range: displayThresholdTimeline,
    },
    selectable: false,
    editable: {
      remove: true,
      updateTime: true,
    },
    moveable: false,
    timeAxis: {
      scale: "millisecond",
      step: 5,
    },
    onMove: function (item, callback) {
      if (item.start >= 0 && item.start <= 100) {
        item.value = item.start.getMilliseconds().toString();
        callback(item);
        updateThresholdItems(item.id, item.start.getMilliseconds().toString());
      } else {
        if (item.start < 1) {
          item.start = 1;
          item.value = "1";
        } else {
          item.start = 100;
          item.value = "100";
        }
        callback(item);
        updateThresholdItems(item.id, item.value);
      }
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
    template: function (item) {
      if (item && item.hasOwnProperty("value")) {
        return (
          "<div data-testid=\"threshold" +
          " " +
          item.value.split(":")[0] +
          "\">" +
          item.value.split(":")[0] +
          "<div class=\"itemValue\">" +
          item.value.split(":")[1] +
          "</div></div>"
        );
      }
    },
    maxMinorChars: 4,
    order: timelineOrder,
  };

  const renderRulesetTimeline = () => {
    return (
      <div data-testid={"active-ruleset-timeline"}>
        <TimelineVis
          items={rulesetItems}
          options={rulesetOptions}
          clickHandler={onRuleSetTimelineItemClicked}
          borderMargin="0px"
        />
      </div>
    );
  };

  const renderDefaultRulesetTimeline = () => {
    return (
      <div data-testid={"default-ruleset-timeline"}>
        <TimelineVisDefault items={rulesetItems} options={rulesetOptions} borderMargin="0px" />
      </div>
    );
  };

  const renderDefaultThresholdTimeline = () => {
    return (
      <div data-testid={"default-threshold-timeline"}>
        <TimelineVisDefault items={thresholdItems} options={thresholdOptions} borderMargin="0px" />
      </div>
    );
  };

  const renderThresholdTimeline = () => {
    return (
      <div data-testid={"active-threshold-timeline"}>
        <TimelineVis
          items={thresholdItems}
          options={thresholdOptions}
          clickHandler={onThresholdTimelineItemClicked}
          borderMargin="0px"
        />
      </div>
    );
  };

  const updateThresholdItems = async (id, newvalue) => {
    let stepArtifact = curationOptions.activeStep.stepArtifact;
    let stepArtifactThresholds = curationOptions.activeStep.stepArtifact.thresholds;
    let updateThreshold = stepArtifactThresholds[id];
    updateThreshold["score"] = parseInt(newvalue);
    stepArtifactThresholds[id] = updateThreshold;
    stepArtifact["thresholds"] = stepArtifactThresholds;
    updateActiveStepArtifact(stepArtifact);
    await updateMatchingArtifact(stepArtifact);
  };

  const onRuleSetTimelineItemClicked = event => {
    let index = event.item;
    let currentRuleset = refMatchingRuleset.current!;
    let editMatchRuleset = currentRuleset[index];
    setEditRuleset({...editMatchRuleset, index});
    if (editMatchRuleset) {
      if (editMatchRuleset.hasOwnProperty("rulesetType") && editMatchRuleset["rulesetType"] === "multiple") {
        toggleShowRulesetMultipleModal(true);
      } else {
        toggleShowRulesetSingleModal(true);
      }
    }
  };

  const onThresholdTimelineItemClicked = event => {
    let updateStepArtifactThresholds = curationOptions.activeStep.stepArtifact.thresholds;
    let index = event.item;
    let editThreshold = updateStepArtifactThresholds[index];
    setEditThreshold({...editThreshold, index});
    if (editThreshold) {
      toggleShowThresholdModal(true);
    }
  };

  const handleAddMenu = key => {
    if (key === "singlePropertyRuleset") {
      addNewSingleRuleset();
      setEditRuleset({});
    }
    if (key === "multiPropertyRuleset") {
      addNewMultipleRuleset();
    }
  };

  const addButton = (
    <DropdownButton
      aria-label="add-ruleset"
      id="add-ruleset"
      align="end"
      title={
        <>
          Add
          <ChevronDown className="ms-2" />
        </>
      }
      onSelect={handleAddMenu}
    >
      <Dropdown.Item
        eventKey="singlePropertyRuleset"
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            handleAddMenu("singlePropertyRuleset");
          }
        }}
      >
        <span aria-label={"singlePropertyRulesetOption"}>Add ruleset for a single property</span>
      </Dropdown.Item>
      <Dropdown.Item
        eventKey="multiPropertyRuleset"
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            handleAddMenu("multiPropertyRuleset");
          }
        }}
      >
        <span aria-label={"multiPropertyRulesetOption"}>Add ruleset for multiple properties</span>
      </Dropdown.Item>
    </DropdownButton>
  );

  const testButton = (
    <div className={styles.testButton}>
      <HCButton
        variant="primary"
        type="submit"
        onClick={handleTestButtonClick}
        aria-label="testMatchUriButton"
        loading={loading}
        disabled={thresholdItems.length === 0}
      >
        Test
      </HCButton>
    </div>
  );
  return Object.keys(curationOptions.activeStep.stepArtifact).length !== 0 ? (
    <>
      <CustomPageHeader
        title={matchingStep.name}
        handleOnBack={() => {
          history.push("/tiles/curate");
          setViewSettings({...storage, curate: {}, match: {}});
        }}
      />
      <p className={styles.headerDescription}>{MatchingStepDetailText.description}</p>
      <div className={styles.matchingDetailContainer}>
        <div
          className={
            expandRuleset ? styles.matchCombinationsExpandedContainer : styles.matchCombinationsCollapsedContainer
          }
        >
          <div aria-label="matchCombinationsHeading" className={styles.matchCombinationsHeading}>
            Possible Combinations of Matched Rulesets
          </div>
          <span className={styles.expandCollapseRulesIcon}>
            <ExpandCollapse
              handleSelection={id => handleExpandCollapseRulesIcon(id)}
              currentSelection={expandRuleset ? "expand" : "collapse"}
              aria-label="expandCollapseRulesetIcon"
            />
          </span>
          {matchingActivity?.thresholdActions && matchingActivity?.thresholdActions.length ? (
            <Row>
              {matchingActivity?.thresholdActions?.map((combinationsObject, i, combArr) => {
                return (
                  <Col xs={4} key={`${combinationsObject["name"]}-${i}`}>
                    <div className={styles.matchCombinationsColsContainer}>
                      <HCCard className={styles.matchCombinationsCardStyle}>
                        <div className={combArr.length > 1 ? styles.colsWithoutDivider : styles.colsWithSingleMatch}>
                          <div
                            className={styles.combinationlabel}
                            aria-label={`combinationLabel-${combinationsObject.name}`}
                          >
                            Minimum combinations for <strong>{combinationsObject.name}</strong> threshold:
                          </div>

                          {combinationsObject.minimumMatchContributions?.map((minMatchArray, index) => {
                            return (
                              <div key={`${minMatchArray[0]["rulsetName"]}-${index}`}>
                                {minMatchArray.map((obj, index, arr) => {
                                  if (arr.length - 1 === index) {
                                    return (
                                      <span
                                        key={`${combinationsObject.name}-${index}`}
                                        aria-label={`rulesetName-${combinationsObject.name}-${obj.rulesetName}`}
                                      >
                                        {getRulesetName(obj)}
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span
                                        key={`${combinationsObject.name}-${index}`}
                                        aria-label={`rulesetName-${combinationsObject.name}-${obj.rulesetName}`}
                                      >
                                        {getRulesetName(obj)} <span className={styles.period} />{" "}
                                      </span>
                                    );
                                  }
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </HCCard>
                    </div>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <p aria-label="noMatchedCombinations">
              Add thresholds and rulesets to the following sliders to determine which combinations of qualifying
              rulesets would meet each threshold.
            </p>
          )}
        </div>

        <div className={styles.stepNumberContainer}>
          <NumberIcon value={1} />
          <div className={styles.stepText}>Configure your thresholds</div>
        </div>

        <div className={styles.greyContainer}>
          <div className={styles.topHeader}>
            <div className={styles.textContainer}>
              <p aria-label="threshold-text" className={`${moreThresholdText ? styles.showText : styles.hideText}`}>
                A <span className={styles.italic}>threshold</span> specifies how closely entities have to match before a
                certain action is triggered. The action could be the merging of those entities, the creation of a match
                notification, or a custom action that is defined programmatically. Click the{" "}
                <span className={styles.bold}>Add</span> button to create a threshold. If most of the values in the
                entities should match to trigger the action associated with your threshold, then move the threshold
                higher on the scale. If only some of the values in the entities must match, then move the threshold
                lower.
                {moreThresholdText && (
                  <span
                    aria-label="threshold-less"
                    className={styles.link}
                    onClick={() => toggleMoreThresholdText(!moreThresholdText)}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        toggleMoreThresholdText(!moreThresholdText);
                      }
                    }}
                  >
                    less
                  </span>
                )}
              </p>
              {!moreThresholdText && (
                <span
                  aria-label="threshold-more"
                  className={styles.link}
                  onClick={() => toggleMoreThresholdText(!moreThresholdText)}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleMoreThresholdText(!moreThresholdText);
                    }
                  }}
                >
                  more
                </span>
              )}
            </div>
            <div className={styles.addButtonContainer}>
              <HCButton
                aria-label="add-threshold"
                variant="primary"
                className={styles.addThresholdButton}
                onClick={() => {
                  setEditThreshold({});
                  toggleShowThresholdModal(true);
                }}
              >
                Add
              </HCButton>
            </div>
          </div>
          <div className={styles.switchToggleContainer}>
            <span className={styles.editingLabel}>
              <b>Edit Thresholds</b>
            </span>
            <FormCheck
              type="switch"
              aria-label="threshold-scale-switch"
              onChange={({target}) => toggleDisplayThresholdTimeline(target.checked)}
              defaultChecked={displayThresholdTimeline}
              className={styles.switchToggle}
              onKeyDown={(e: any) => {
                const {target, key, type} = e;
                if (target) {
                  if (type === "keydown") {
                    if (key === "Enter" || key === " ") {
                      target.checked = !target.checked;
                      toggleDisplayThresholdTimeline(target.checked);
                    }
                  }
                }
              }}
            />
            <span>
              <HCTooltip
                text={MatchingStepTooltips.thresholdScale}
                id="threshold-scale-tooltip"
                placement="right"
                aria-label="threshold-scale-tooltip"
              >
                <QuestionCircleFill
                  aria-label="icon: question-circle"
                  color={themeColors.defaults.questionCircle}
                  size={13}
                  className={styles.scaleTooltip}
                  data-testid={"info-tooltip-threshold"}
                  tabIndex={0}
                />
              </HCTooltip>
              <br />
            </span>
          </div>
          {displayThresholdTimeline ? renderThresholdTimeline() : renderDefaultThresholdTimeline()}
        </div>

        <div className={styles.stepNumberContainer}>
          <NumberIcon value={2} />
          <div className={styles.stepText}>Place rulesets on a match scale</div>
        </div>

        <div className={styles.greyContainer}>
          <div className={styles.topHeader}>
            <div className={styles.textContainer}>
              <p aria-label="ruleset-text" className={`${moreRulesetText ? styles.showText : styles.hideText}`}>
                A <span className={styles.italic}>ruleset</span> specifies the criteria for determining whether the
                values of your entities match. The way you define your rulesets, and where you place them on the scale,
                influences whether the entities are considered a match. Click the{" "}
                <span className={styles.bold}>Add</span> button to create a ruleset. If you want the ruleset to have a
                major influence over whether entities are qualified as a "match", move it higher on the scale. If you
                want it to have only some influence, then move the ruleset lower.
                {moreRulesetText && (
                  <span
                    aria-label="ruleset-less"
                    className={styles.link}
                    onClick={() => toggleMoreRulesetText(!moreRulesetText)}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        toggleMoreRulesetText(!moreRulesetText);
                      }
                    }}
                  >
                    less
                  </span>
                )}
              </p>
              {!moreRulesetText && (
                <span
                  aria-label="ruleset-more"
                  className={styles.link}
                  onClick={() => toggleMoreRulesetText(!moreRulesetText)}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleMoreRulesetText(!moreRulesetText);
                    }
                  }}
                >
                  more
                </span>
              )}
            </div>
            <div
              id="panelActionsMatch"
              className={styles.panelActionsMatch}
              onClick={event => {
                event.stopPropagation(); // Do not trigger collapse
                event.preventDefault();
              }}
            >
              {addButton}
            </div>
          </div>
          <div className={styles.switchToggleContainer}>
            <span className={styles.editingLabel}>
              <b>Edit Rulesets</b>
            </span>
            <FormCheck
              type="switch"
              aria-label="ruleset-scale-switch"
              onChange={({target}) => toggleDisplayRulesetTimeline(target.checked)}
              defaultChecked={displayRulesetTimeline}
              tabIndex={0}
              onKeyDown={(e: any) => {
                const {target, key, type} = e;
                if (target) {
                  if (type === "keydown") {
                    if (key === "Enter" || key === " ") {
                      target.checked = !target.checked;
                      toggleDisplayRulesetTimeline(target.checked);
                    }
                  }
                }
              }}
              className={styles.switchToggle}
            />
            <span>
              <HCTooltip
                text={MatchingStepTooltips.rulesetScale}
                id="ruleset-scale-tooltip"
                placement="right"
                aria-label="ruleset-scale-tooltip"
              >
                <QuestionCircleFill
                  aria-label="icon: question-circle"
                  color={themeColors.defaults.questionCircle}
                  size={13}
                  className={`${styles.scaleTooltip} ps-0`}
                  data-testid={`info-tooltip-ruleset`}
                  tabIndex={0}
                />
              </HCTooltip>
              <br />
            </span>
          </div>
          {displayRulesetTimeline ? renderRulesetTimeline() : renderDefaultRulesetTimeline()}
        </div>

        <div className={styles.stepNumberContainer}>
          <NumberIcon value={3} />
          <div className={styles.stepText}>Test and review matched entities</div>
        </div>
        <div className={`w-100 ${styles.testMatch}`} aria-label="testMatch">
          <span className={styles.borders}>
            <label className={styles.urisData} htmlFor={"test-uris"}>
              <FormCheck
                inline
                id={"test-uris"}
                name={"test-review-matched-entities"}
                type={"radio"}
                defaultChecked={value === 1 ? true : false}
                onChange={e => {
                  handleUriInputSelected();
                  onTestMatchRadioChange(e);
                }}
                label={"Test URIs"}
                value={1}
                aria-label="inputUriOnlyRadio"
                className={"mb-0"}
              />
              <span className={styles.selectTooltip} aria-label="testUriOnlyTooltip">
                <HCTooltip
                  text={MatchingStepTooltips.testUris}
                  id="test-all-uris-tooltip"
                  placement="right"
                  aria-label="test-all-uris-tooltip"
                >
                  <QuestionCircleFill
                    tabIndex={0}
                    color={themeColors.defaults.questionCircle}
                    size={13}
                    className={styles.questionCircle}
                  />
                </HCTooltip>
                <br />
              </span>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 12}}>
                <HCInput
                  placeholder="Enter URI or Paste URIs"
                  className={styles.uriInput}
                  value={uriContent}
                  onChange={handleUriInputChange}
                  ariaLabel="UriOnlyInput"
                  disabled={inputUriDisabled}
                  classNameFull={colourElementAdded ? styles.uriInputColor : ""}
                />
                <FontAwesomeIcon
                  icon={faPlusSquare}
                  className={inputUriDisabled ? styles.disabledAddIcon : styles.addIcon}
                  onClick={handleClickAddUri}
                  aria-label="addUriOnlyIcon"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleClickAddUri(e);
                    }
                  }}
                />
              </div>
              {duplicateUriWarning ? (
                <div className={styles.duplicateUriWarning}>This URI has already been added.</div>
              ) : (
                ""
              )}
              {singleUriWarning ? (
                <div className={styles.duplicateUriWarning}>At least Two URIs are required.</div>
              ) : (
                ""
              )}
              <div className={styles.UriTable}>
                {UriTableData.length > 0 ? (
                  <HCTable
                    columns={UriColumns}
                    className={styles.tableContent}
                    subTableHeader={true}
                    data={renderUriTableData}
                    keyUtil="key"
                    baseIndent={0}
                    rowKey="key"
                    pagination={false}
                    showHeader={false}
                  />
                ) : (
                  ""
                )}
              </div>
            </label>
          </span>
          <label className={styles.allDataUris} htmlFor={"test-uris-all-data"}>
            <FormCheck
              inline
              id={"test-uris-all-data"}
              name={"test-review-matched-entities"}
              type={"radio"}
              defaultChecked={value === 2 ? true : false}
              onChange={e => {
                handleUriInputSelected2();
                onTestMatchRadioChange(e);
              }}
              label={"Test URIs with All Data"}
              value={2}
              aria-label={"inputUriRadio"}
              className={"mb-0"}
              tabIndex={0}
            />
            <span aria-label="testUriTooltip">
              <HCTooltip
                text={MatchingStepTooltips.testUrisAllData}
                id="test-uris-all-data-tooltip"
                placement="right"
                aria-label="test-uris-all-data-tooltip"
              >
                <QuestionCircleFill
                  tabIndex={0}
                  color={themeColors.defaults.questionCircle}
                  size={13}
                  className={styles.questionCircle}
                />
              </HCTooltip>
            </span>
            <br />
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 12}}>
              <HCInput
                placeholder="Enter URI or Paste URIs"
                className={styles.uriInput}
                value={uriContent2}
                onChange={handleUriInputChange2}
                ariaLabel="UriInput"
                disabled={inputUriDisabled2}
                classNameFull={colourElementAdded2 ? styles.uriInputColor : ""}
              />
              <FontAwesomeIcon
                icon={faPlusSquare}
                className={inputUriDisabled2 ? styles.disabledAddIcon : styles.addIcon}
                onClick={handleClickAddUri2}
                aria-label="addUriIcon"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClickAddUri2(e);
                  }
                }}
              />
            </div>
            {duplicateUriWarning2 ? (
              <div className={styles.duplicateUriWarning}>This URI has already been added.</div>
            ) : (
              ""
            )}
            {singleUriWarning2 ? <div className={styles.duplicateUriWarning}>At least one URI is required.</div> : ""}
            <div className={styles.UriTable}>
              {UriTableData2.length > 0 ? (
                <HCTable
                  columns={UriColumns2}
                  subTableHeader={true}
                  className={styles.tableContent}
                  data={renderUriTableData2}
                  keyUtil="key"
                  baseIndent={0}
                  rowKey="key"
                  pagination={false}
                  showHeader={false}
                />
              ) : (
                ""
              )}
            </div>
          </label>
          <label className={styles.allDataRadio} htmlFor={"all-data"}>
            <FormCheck
              inline
              id={"all-data"}
              name={"test-review-matched-entities"}
              type={"radio"}
              defaultChecked={value === 3 ? true : false}
              onChange={e => {
                handleAllDataRadioClick();
                onTestMatchRadioChange(e);
              }}
              label={"Test All Data"}
              value={3}
              aria-label={"allDataRadio"}
              className={"mb-0"}
              tabIndex={0}
            />
            <span aria-label={"allDataTooltip"}>
              <HCTooltip
                text={MatchingStepTooltips.testAllData}
                id="test-all-data-tooltip"
                placement="right"
                aria-label="test-all-data-tooltip"
              >
                <QuestionCircleFill
                  tabIndex={0}
                  color={themeColors.defaults.questionCircle}
                  size={13}
                  className={styles.questionCircle}
                />
              </HCTooltip>
            </span>
            <div aria-label="allDataContent" className={styles.allDataContent}>
              Select All Data in your source query in order to preview matching activity against all URIs up to 100
              displayed pair matches. It is best practice to test with a smaller-sized source query.
            </div>
          </label>
          {thresholdItems.length === 0 ? (
            <HCTooltip text={MatchingStepTooltips.testDisabled} id="threshold-scale-tooltip" placement="right">
              {testButton}
            </HCTooltip>
          ) : (
            testButton
          )}
        </div>
        <div className={styles.matchedTab}>
          {uriTestMatchClicked ? (
            <Tabs
              defaultActiveKey={testMatchTab}
              onSelect={eventKey => setTestMatchTab(eventKey ? eventKey : "matched")}
              className={styles.previewTabs}
            >
              <Tab title="Matched Entities" eventKey="matched">
                {previewMatchedData === 0 && (
                  <div className={styles.noMatchedDataView} aria-label="noMatchedDataView">
                    <span>No matches found. You can try: </span>
                    <br />
                    <div className={styles.noMatchedDataContent}>
                      <span> Selecting a different test case</span>
                      <br />
                      <span> Changing or adding more URIs</span>
                      <br />
                      <span> Changing your match configuration. Preview matches in the Possible Combinations box</span>
                    </div>
                  </div>
                )}
                {previewMatchedActivity?.actionPreview && testMatchTab === "matched" ? (
                  <div className={styles.UriMatchedDataTable}>
                    <div className={styles.modalTitleLegend} aria-label="modalTitleLegend">
                      <div className={styles.expandCollapseIcon}>
                        <ExpandCollapse
                          handleSelection={id => handleExpandCollapse(id)}
                          currentSelection={"collapse"}
                          aria-label="expandCollapseIcon"
                        />
                      </div>
                    </div>
                    {rulesetDataList.length > 0 &&
                      rulesetDataList.map((rulesetDataList, index) => (
                        <Accordion
                          id="testMatchedPanel"
                          className={"w-100"}
                          flush
                          key={index}
                          activeKey={
                            activeMatchedRuleset.includes(rulesetDataList.rulesetName)
                              ? rulesetDataList.rulesetName
                              : ""
                          }
                          defaultActiveKey={
                            activeMatchedRuleset.includes(rulesetDataList.rulesetName)
                              ? rulesetDataList.rulesetName
                              : ""
                          }
                        >
                          <Accordion.Item
                            eventKey={rulesetDataList.rulesetName}
                            style={{paddingBottom: index === Object.keys(rulesetDataList).length - 1 ? 20 : 0}}
                          >
                            <Card>
                              <div className={"p-0 d-flex"}>
                                <Accordion.Button
                                  onClick={() => handleRulesetAccordionChange(rulesetDataList.rulesetName)}
                                >
                                  <span>
                                    <span className={"text-info fw-bold"}>{rulesetDataList.rulesetName}</span>
                                    <span className={"text-dark fw-bold"}> (Threshold: {rulesetDataList.score})</span>
                                    <span className={"d-block"}>
                                      {rulesetDataList.actionPreviewData.length} pair matches
                                    </span>
                                  </span>
                                </Accordion.Button>
                              </div>
                              <Accordion.Body className={"pt-1"}>
                                {rulesetDataList?.actionPreviewData?.map((actionPreviewData, idx) => {
                                  const itemKey =
                                    actionPreviewData.name.concat(" - ") + actionPreviewData.action.concat("/") + idx;
                                  return (
                                    <Accordion
                                      id="testMatchedUriDataPanel"
                                      className={"w-100"}
                                      flush
                                      key={idx}
                                      activeKey={activeMatchedUri.includes(itemKey) ? itemKey : ""}
                                      defaultActiveKey={activeMatchedUri.includes(itemKey) ? itemKey : ""}
                                    >
                                      <Accordion.Item eventKey={itemKey}>
                                        <div className={"d-flex"}>
                                          <Accordion.Button onClick={() => handleUrisAccordionChange(itemKey)}>
                                            <span onClick={e => e.stopPropagation()} className={"text-info"}>
                                              <span className={"d-block"}>
                                                {actionPreviewData.uris[0]}
                                                <span className={"text-dark"}> (Score: {actionPreviewData.score})</span>
                                              </span>
                                              <span className={"d-block"}>{actionPreviewData.uris[1]}</span>
                                            </span>
                                          </Accordion.Button>
                                          <div className={"p-2"}>
                                            <HCButton
                                              size="sm"
                                              variant="primary"
                                              id={idx}
                                              className={styles.compareTestButton}
                                              onClick={e => {
                                                handleCompareButton(e, rulesetDataList.rulesetName, [
                                                  actionPreviewData.uris[0],
                                                  actionPreviewData.uris[1],
                                                ]);
                                              }}
                                              loading={
                                                compareBtnLoading[0]?.toString() === idx.toString() &&
                                                compareBtnLoading[1] === rulesetDataList.rulesetName
                                                  ? true
                                                  : false
                                              }
                                              aria-label={actionPreviewData.uris[0].substr(0, 41) + " compareButton"}
                                            >
                                              Compare
                                            </HCButton>
                                          </div>
                                        </div>
                                        {curationOptions.activeStep?.stepArtifact?.matchRulesets && (
                                          <Accordion.Body>
                                            <span aria-label="expandedTableView">
                                              <ExpandableTableView
                                                rowData={actionPreviewData}
                                                allRuleset={curationOptions.activeStep?.stepArtifact?.matchRulesets}
                                                entityData={curationOptions.activeStep}
                                              />
                                            </span>
                                          </Accordion.Body>
                                        )}
                                      </Accordion.Item>
                                    </Accordion>
                                  );
                                })}
                              </Accordion.Body>
                            </Card>
                          </Accordion.Item>
                        </Accordion>
                      ))}
                  </div>
                ) : (
                  ""
                )}
              </Tab>
              <Tab title="Not Matched" eventKey="notMatched">
                {previewNonMatchedData === 0 && (
                  <div className={styles.noNotMatchedDataView} aria-label="noNotMatchedDataView">
                    <span>No non-matches found. You can try: </span>
                    <br />
                    <div className={styles.noMatchedDataContent}>
                      <span> Selecting a different test case</span>
                      <br />
                      <span> Changing or adding more URIs</span>
                      <br />
                      <span> Changing your match configuration. Preview matches in the Possible Combinations box</span>
                    </div>
                  </div>
                )}
                {previewNonMatchedActivity.actionPreview.length > 0 && testMatchTab === "notMatched" ? (
                  <div className={styles.UriMatchedDataTable}>
                    <div className={styles.modalTitleLegend} aria-label="modalTitleLegend">
                      <div className={styles.expandCollapseIcon}>
                        <ExpandCollapse
                          handleSelection={id => handleExpandCollapse(id)}
                          currentSelection={"collapse"}
                          aria-label="expandCollapseIcon"
                        />
                      </div>
                    </div>
                    {rulesetNonMatchedDataList?.map((rulesetDataList, index) => (
                      <Accordion
                        id="testNotMatchedPanel"
                        className={"w-100"}
                        flush
                        key={index}
                        activeKey={
                          activeMatchedRuleset.includes(rulesetDataList.rulesetName) ? rulesetDataList.rulesetName : ""
                        }
                        defaultActiveKey={
                          activeMatchedRuleset.includes(rulesetDataList.rulesetName) ? rulesetDataList.rulesetName : ""
                        }
                      >
                        <Accordion.Item
                          eventKey={rulesetDataList.rulesetName}
                          style={{paddingBottom: index === Object.keys(rulesetDataList).length - 1 ? 20 : 0}}
                        >
                          <Card>
                            <div className={"p-0 d-flex"}>
                              <Accordion.Button
                                onClick={() => handleRulesetAccordionChange(rulesetDataList.rulesetName)}
                              >
                                <span>
                                  <span className={"text-info fw-bold"}>{rulesetDataList.rulesetName}</span>
                                  <span className={"d-block"}>
                                    {rulesetDataList.actionPreviewData.length} pair matches
                                  </span>
                                </span>
                              </Accordion.Button>
                            </div>
                            <Accordion.Body className={"pt-1"}>
                              {rulesetDataList?.actionPreviewData?.map((actionPreviewData, idx) => {
                                const itemKey =
                                  actionPreviewData.name.concat(" - ") + actionPreviewData.action.concat("/") + idx;
                                return (
                                  <Accordion
                                    id="testMatchedUriDataPanel"
                                    className={"w-100"}
                                    flush
                                    key={idx}
                                    activeKey={activeMatchedUri.includes(itemKey) ? itemKey : ""}
                                    defaultActiveKey={activeMatchedUri.includes(itemKey) ? itemKey : ""}
                                  >
                                    <Accordion.Item eventKey={itemKey}>
                                      <div className={"d-flex"}>
                                        <Accordion.Button onClick={() => handleUrisAccordionChange(itemKey)}>
                                          <span onClick={e => e.stopPropagation()} className={"text-info"}>
                                            <span className={"d-block"}>
                                              {actionPreviewData.uris[0]}
                                              <span className={"text-dark"}> (Score: {actionPreviewData.score})</span>
                                            </span>
                                            <span className={"d-block"}>{actionPreviewData.uris[1]}</span>
                                          </span>
                                        </Accordion.Button>
                                        <div className={"p-2"}>
                                          <HCButton
                                            size="sm"
                                            className={styles.compareTestButton}
                                            id={idx}
                                            variant="primary"
                                            onClick={e => {
                                              handleCompareButton(e, rulesetDataList.rulesetName, [
                                                actionPreviewData.uris[0],
                                                actionPreviewData.uris[1],
                                              ]);
                                            }}
                                            loading={
                                              compareBtnLoading[0]?.toString() === idx.toString() &&
                                              compareBtnLoading[1] === rulesetDataList.rulesetName
                                                ? true
                                                : false
                                            }
                                            aria-label={actionPreviewData.uris[0].substr(0, 41) + " compareButton"}
                                          >
                                            Compare
                                          </HCButton>
                                        </div>
                                      </div>
                                      {curationOptions.activeStep?.stepArtifact?.matchRulesets && (
                                        <Accordion.Body>
                                          <span aria-label="expandedTableView">
                                            <ExpandableTableView
                                              rowData={actionPreviewData}
                                              allRuleset={curationOptions.activeStep?.stepArtifact?.matchRulesets}
                                              entityData={curationOptions.activeStep}
                                            />
                                          </span>
                                        </Accordion.Body>
                                      )}
                                    </Accordion.Item>
                                  </Accordion>
                                );
                              })}
                            </Accordion.Body>
                          </Card>
                        </Accordion.Item>
                      </Accordion>
                    ))}
                  </div>
                ) : (
                  ""
                )}
              </Tab>
            </Tabs>
          ) : (
            ""
          )}
        </div>
      </div>
      <RulesetSingleModal
        isVisible={showRulesetSingleModal}
        editRuleset={editRuleset}
        toggleModal={toggleShowRulesetSingleModal}
      />
      <RulesetMultipleModal
        isVisible={showRulesetMultipleModal}
        editRuleset={editRuleset}
        toggleModal={toggleShowRulesetMultipleModal}
      />
      <CompareValuesModal
        isVisible={compareModalVisible}
        fetchNotifications={() => void 0}
        toggleModal={setCompareModalVisible}
        uriInfo={uriInfo}
        activeStepDetails={curationOptions.activeStep}
        entityProperties={entityProperties}
        uriCompared={urisCompared}
        previewMatchActivity={previewMatchedActivity}
        entityDefinitionsArray={curationOptions.entityDefinitionsArray}
        uris={uris}
        isPreview={true}
        isMerge={false}
        mergeUris={() => void 0}
        unmergeUri={() => void 0}
        originalUri={""}
        flowName={""}
      />
      <ThresholdModal
        isVisible={showThresholdModal}
        editThreshold={editThreshold}
        toggleModal={toggleShowThresholdModal}
      />
    </>
  ) : (
    <></>
  );
};

export default MatchingStepDetail;
