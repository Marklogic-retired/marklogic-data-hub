import React, {useState, useEffect, useContext} from "react";
import {Input, Radio, Table, Switch} from "antd";
import {useHistory} from "react-router-dom";
import {Row, Col, Accordion, Card} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusSquare} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import HCCard from "../../../common/hc-card/hc-card";
import CustomPageHeader from "../../page-header/page-header";
import RulesetSingleModal from "../ruleset-single-modal/ruleset-single-modal";
import RulesetMultipleModal from "../ruleset-multiple-modal/ruleset-multiple-modal";
import NumberIcon from "../../../number-icon/number-icon";
import ThresholdModal from "../threshold-modal/threshold-modal";
import {CurationContext} from "../../../../util/curation-context";
import {MatchingStep} from "../../../../types/curation-types";
import {MatchingStepDetailText, MatchingStepTooltips} from "../../../../config/tooltips.config";
import {updateMatchingArtifact, calculateMatchingActivity, previewMatchingActivity, getDocFromURI} from "../../../../api/matching";
import {ChevronDown} from "react-bootstrap-icons";
import {getViewSettings, setViewSettings, clearSessionStorageOnRefresh} from "../../../../util/user-context";
import ExpandCollapse from "../../../expand-collapse/expand-collapse";
import ExpandableTableView from "../expandable-table-view/expandable-table-view";
import CompareValuesModal from "../compare-values-modal/compare-values-modal";
import moment from "moment";
import TimelineVis from "./timeline-vis/timeline-vis";
import TimelineVisDefault from "./timeline-vis-default/timeline-vis-default";
import HCButton from "../../../common/hc-button/hc-button";

import HCTooltip from "../../../common/hc-tooltip/hc-tooltip";
import {QuestionCircleFill} from "react-bootstrap-icons";
import styles from "./matching-step-detail.module.scss";
import {DropdownButton, Dropdown} from "react-bootstrap";

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
  customHook: {}
};

const MatchingStepDetail: React.FC = () => {
  const storage = getViewSettings();

  // Prevents an infinite loop issue with sessionStorage due to user refreshing in step detail page.
  clearSessionStorageOnRefresh();

  const history = useHistory<any>();
  const {curationOptions, updateActiveStepArtifact} = useContext(CurationContext);
  const [matchingStep, setMatchingStep] = useState<MatchingStep>(DEFAULT_MATCHING_STEP);
  const [editThreshold, setEditThreshold] = useState({});
  const [editRuleset, setEditRuleset] = useState({});
  const [showThresholdModal, toggleShowThresholdModal] = useState(false);
  const [showRulesetSingleModal, toggleShowRulesetSingleModal] = useState(false);
  const [moreThresholdText, toggleMoreThresholdText] = useState(true);
  const [moreRulesetText, toggleMoreRulesetText] = useState(true);
  const [matchingActivity, setMatchingActivity] = useState<any>({scale: {}, thresholdActions: []});
  const [value, setValue] = React.useState(1);
  const [UriTableData, setUriTableData] = useState<any[]>([]);
  const [UriTableData2, setUriTableData2] = useState<any[]>([]);
  const [uriContent, setUriContent] = useState("");
  const [uriContent2, setUriContent2] = useState("");
  const [inputUriDisabled, setInputUriDisabled] = useState(false);
  const [inputUriDisabled2, setInputUriDisabled2] = useState(true);
  const [testMatchTab] = useState("matched");
  const [duplicateUriWarning, setDuplicateUriWarning] = useState(false);
  const [duplicateUriWarning2, setDuplicateUriWarning2] = useState(false);
  const [singleUriWarning, setSingleUriWarning] = useState(false);
  const [singleUriWarning2, setSingleUriWarning2] = useState(false);
  const [uriTestMatchClicked, setUriTestMatchClicked] = useState(false);
  const [allDataSelected, setAllDataSelected] = useState(false);
  const [testUrisOnlySelected, setTestUrisOnlySelected] = useState(true);
  const [testUrisAllDataSelected, setTestUrisAllDataSelected] = useState(false);
  const [testMatchedData, setTestMatchedData] = useState<any>({stepName: "", sampleSize: 100, uris: []});
  const [previewMatchedActivity, setPreviewMatchedActivity] = useState<any>({sampleSize: 100, uris: [], actionPreview: []});
  const [showRulesetMultipleModal, toggleShowRulesetMultipleModal] = useState(false);

  const [rulesetDataList, setRulesetDataList] = useState<any>([{rulesetName: "", actionPreviewData: [{name: "", action: "", uris: ["", ""]}], score: 0}]);
  const [activeMatchedRuleset, setActiveMatchedRuleset] = useState<string[]>([]);
  const [activeMatchedUri, setActiveMatchedUri] = useState<string[]>([]);
  const [allRulesetNames] = useState<string[]>([]);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [uriInfo, setUriInfo] = useState<any>();
  const [entityProperties, setEntityProperties] = useState<any>();
  const [urisCompared, setUrisCompared] = useState<string[]>([]);
  const [uris, setUris] = useState<string[]>([]);
  const [previewMatchedData, setPreviewMatchedData] = useState(-1);
  const [expandRuleset, setExpandRuleset] = useState(false);


  //To handle timeline display
  const [rulesetItems, setRulesetItems] = useState<any[]>([]);
  const [thresholdItems, setThresholdItems] = useState<any[]>([]);
  const [displayRulesetTimeline, toggleDisplayRulesetTimeline] = useState(false);
  const [displayThresholdTimeline, toggleDisplayThresholdTimeline] = useState(false);

  useEffect(() => {
    if (Object.keys(curationOptions.activeStep.stepArtifact).length !== 0) {
      const matchingStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
      if (matchingStepArtifact.matchRulesets) {
        if (matchingStepArtifact.matchRulesets.length > 0) {
          let rulesetItems = matchingStepArtifact.matchRulesets.map((item, id) => ({
            id: id,
            start: item.weight,
            reduce: item.reduce ? item.reduce : false,
            value: item.name + ":" + item.weight.toString()
          }));
          setRulesetItems(rulesetItems);
          toggleMoreRulesetText(false);
        } else {
          toggleMoreRulesetText(true);
        }
      }
      if (matchingStepArtifact.thresholds) {
        if (matchingStepArtifact.thresholds.length > 0) {
          let thresholdItems = matchingStepArtifact.thresholds.map((item, id) => ({
            id: id,
            start: item.score,
            value: item.thresholdName + " - " + item.action + ":" + item.score.toString(),
          }));

          setThresholdItems(thresholdItems);
          toggleMoreThresholdText(false);
        } else {
          toggleMoreThresholdText(true);
        }
      }
      setMatchingStep(matchingStepArtifact);
      handleMatchingActivity(matchingStepArtifact.name);

    } else {
      history.push("/tiles/curate");
    }
    /*return () => {
      toggleDisplayRulesetTimeline(false);
    }*/
  }, [JSON.stringify(curationOptions.activeStep.stepArtifact)]);

  const handleMatchingActivity = async (matchStepName) => {
    let matchActivity = await calculateMatchingActivity(matchStepName);
    setMatchingActivity(matchActivity);
  };

  const handlePreviewMatchingActivity = async (testMatchData) => {
    const test = () => {
      for (let i = 0; i < curationOptions.activeStep.stepArtifact.thresholds.length; i++) {
        let ruleset = curationOptions.activeStep.stepArtifact.thresholds[i].thresholdName.concat(" - ") + curationOptions.activeStep.stepArtifact.thresholds[i].action;
        let score = curationOptions.activeStep.stepArtifact.thresholds[i].score;
        let actionPreviewList = [{}];
        if (previewMatchActivity === undefined) previewMatchActivity = {actionPreview: []};
        for (let j = 0; j < previewMatchActivity.actionPreview.length; j++) {
          if (curationOptions.activeStep.stepArtifact.thresholds[i].thresholdName === previewMatchActivity.actionPreview[j].name && curationOptions.activeStep.stepArtifact.thresholds[i].action === previewMatchActivity.actionPreview[j].action) {
            actionPreviewList.push(previewMatchActivity.actionPreview[j]);
          }
        }
        actionPreviewList.shift();
        let localData = {rulesetName: "", actionPreviewData: [{}], score: 0};
        localData.rulesetName = ruleset;
        localData.score = score;
        localData.actionPreviewData = actionPreviewList;
        allRulesetNames.push(ruleset);
        if (localData.actionPreviewData.length > 0) {
          rulesetDataList.push(localData);
        }
      }
      rulesetDataList.shift();
    };
    let previewMatchActivity = await previewMatchingActivity(testMatchData);
    setPreviewMatchedData(previewMatchActivity.actionPreview.length);
    if (previewMatchActivity) {
      await test();
      setPreviewMatchedActivity(previewMatchActivity);
      setRulesetDataList(rulesetDataList);
    }

  };

  const getKeysToExpandFromTable = async () => {
    let allKeys = [""];
    rulesetDataList.forEach((ruleset) => {
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

  const getRulesetName = (rulesetComb) => {
    let matchRules = rulesetComb.matchRules;
    let rulesetName = rulesetComb.rulesetName.split(".").join(" > ");
    if (!rulesetComb.rulesetName && Array.isArray(matchRules) && matchRules.length) {
      rulesetName = matchRules[0].entityPropertyPath.split(".").join(" > ") + " - " + matchRules[0].matchAlgorithm;
    }
    return rulesetName;
  };

  const onTestMatchRadioChange = event => {
    setValue(event.target.value);
    setPreviewMatchedData(-1);
  };

  const handleUriInputChange = (event) => {
    setUriContent(event.target.value);
  };

  const handleUriInputChange2 = (event) => {
    setUriContent2(event.target.value);
  };

  const handleClickAddUri = (event) => {
    let flag = false;
    let setDuplicateWarning = () => { setDuplicateUriWarning(true); setSingleUriWarning(false); };
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
      setUriContent("");
      setDuplicateUriWarning(false);
      setSingleUriWarning(false);
    }
  };

  const handleClickAddUri2 = (event) => {
    let flag = false;
    let setDuplicateWarning = () => { setDuplicateUriWarning2(true); setSingleUriWarning2(false); };
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
      setUriContent2("");
      setDuplicateUriWarning2(false);
      setSingleUriWarning2(false);
    }
  };

  const renderUriTableData = UriTableData.map((uriData) => {
    return {
      key: uriData.uriContent,
      uriValue: uriData.uriContent,
    };
  });

  const renderUriTableData2 = UriTableData2.map((uriData) => {
    return {
      key: uriData.uriContent2,
      uriValue: uriData.uriContent2,
    };
  });

  const UriColumns = [{
    key: "uriValue",
    title: "uriValues",
    dataIndex: "uriValue",
    render: (text, key) => (
      <span className={styles.tableRow}>{text}<i className={styles.positionDeleteIcon} aria-label="deleteIcon">
        <FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} onClick={() => handleDeleteUri(key)} size="lg" /></i>
      </span>
    ),
  }];

  const UriColumns2 = [{
    key: "uriValue",
    title: "uriValues",
    dataIndex: "uriValue",
    render: (text, key) => (
      <span className={styles.tableRow}>{text}<i className={styles.positionDeleteIcon} aria-label="deleteIcon">
        <FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} onClick={() => handleDeleteUri2(key)} size="lg" /></i>
      </span>
    ),
  }];

  const handleDeleteUri = (event) => {
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

  const handleDeleteUri2 = (event) => {
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

  const handleAllDataRadioClick = (event) => {
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
    setRulesetDataList([{rulesetName: "", actionPreviewData: [{name: "", action: "", uris: ["", ""], matchRulesets: [""]}], score: 0}]);
  };

  const handleTestButtonClick = async () => {
    testMatchedData.uris = [];
    setRulesetDataList([{rulesetName: "", actionPreviewData: [{name: "", action: "", uris: ["", ""], matchRulesets: [""]}], score: 0}]);
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
        setUriTestMatchClicked(true);
        for (let i = 0; i < UriTableData.length; i++) {
          testMatchedData.uris.push(UriTableData[i].uriContent);
        }
        testMatchedData.stepName = matchingStep.name;
        if (!allDataSelected) testMatchedData.restrictToUris = true;
        else testMatchedData.restrictToUris = false;
        setTestMatchedData(testMatchedData);
        await handlePreviewMatchingActivity(testMatchedData);
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
      }
    }
  };

  // const handleTestMatchTab = (event) => {
  //   setTestMatchTab(event.key);
  // };

  const handleUriInputSelected = (event) => {
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

  const handleUriInputSelected2 = (event) => {
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

  const handleExpandCollapse = async (option) => {
    if (option === "collapse") {
      setActiveMatchedRuleset([]);
      setActiveMatchedUri([]);
    } else {
      setActiveMatchedRuleset(allRulesetNames);
      let allKey = await getKeysToExpandFromTable();
      setActiveMatchedUri(allKey);
    }
  };

  const handleExpandCollapseRulesIcon = async (option) => {
    if (option === "collapse") {
      setExpandRuleset(false);
    } else {
      setExpandRuleset(true);
    }
  };

  const handleRulesetAccordionChange = async (key) => {
    const tmpActiveMatchedRuleset = [...activeMatchedRuleset];
    const index = tmpActiveMatchedRuleset.indexOf(key);
    index !== -1 ? tmpActiveMatchedRuleset.splice(index, 1) : tmpActiveMatchedRuleset.push(key);
    setActiveMatchedRuleset(tmpActiveMatchedRuleset);
    let arr=activeMatchedUri;
    for (let i=0;i<activeMatchedUri.length;i++) {
      let rulesetName = activeMatchedUri[i].split("/")[0];
      if (!activeMatchedRuleset.includes(rulesetName)) {
        arr = arr.filter(e => e !== activeMatchedUri[i]);
      }
    }
    setActiveMatchedUri(arr);
  };

  const handleUrisAccordionChange = (key) => {
    const tmpActiveMatchedUri = [...activeMatchedUri];
    const index = tmpActiveMatchedUri.indexOf(key);
    index !== -1 ? tmpActiveMatchedUri.splice(index, 1) : tmpActiveMatchedUri.push(key);
    setActiveMatchedUri(tmpActiveMatchedUri);
  };

  const handleCompareButton = async (arr) => {
    setEntityProperties(curationOptions.entityDefinitionsArray[0].properties);
    const result1 = await getDocFromURI(arr[0]);
    const result2 = await getDocFromURI(arr[1]);
    const uris = [arr[0], arr[1]];
    setUris(uris);
    if (result1.status === 200 && result2.status === 200) {
      let result1Instance = result1.data.data.envelope.instance;
      let result2Instance = result2.data.data.envelope.instance;
      await setUriInfo([{result1Instance}, {result2Instance}]);
    }
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

  const rulesetOptions: any = {
    max: 120,
    min: -20,
    start: -20,
    end: 120,
    width: "100%",
    itemsAlwaysDraggable: {
      item: displayRulesetTimeline,
      range: displayRulesetTimeline
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
          time = date.format("SSS");
          return moment.duration(time).asMilliseconds();
        } else {
          return "";
        }
      },
    },
    template: function (item) {
      if (item && item.hasOwnProperty("value")) {
        if (item.reduce === false) {
          return "<div data-testid=\"ruleset" + " " + item.value.split(":")[0] + "\">" + item.value.split(":")[0] + "<div class=\"itemValue\">" + item.value.split(":")[1] + "</div></div>";
        } else {
          return "<div data-testid=\"ruleset-reduce" + " " + item.value.split(":")[0] + "\">" + item.value.split(":")[0] + "<div class=\"itemReduceValue\">" + - item.value.split(":")[1] + "</div></div>";
        }
      }
    },
    maxMinorChars: 4
  };

  const thresholdOptions: any = {
    max: 120,
    min: -20,
    start: -20,
    end: 120,
    width: "100%",
    itemsAlwaysDraggable: {
      item: displayThresholdTimeline,
      range: displayThresholdTimeline
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
          time = date.format("SSS");
          return moment.duration(time).asMilliseconds();
        } else {
          return "";
        }
      },
    },
    template: function (item) {
      if (item && item.hasOwnProperty("value")) {
        return "<div data-testid=\"threshold" + " " + item.value.split(":")[0] + "\">" + item.value.split(":")[0] + "<div class=\"itemValue\">" + item.value.split(":")[1] + "</div></div>";
      }
    },
    maxMinorChars: 4
  };

  const renderRulesetTimeline = () => {
    return <div data-testid={"active-ruleset-timeline"}><TimelineVis items={rulesetItems} options={rulesetOptions} clickHandler={onRuleSetTimelineItemClicked} /></div>;
  };

  const renderDefaultRulesetTimeline = () => {
    return <div data-testid={"default-ruleset-timeline"}><TimelineVisDefault items={rulesetItems} options={rulesetOptions} /></div>;
  };

  const renderDefaultThresholdTimeline = () => {
    return <div data-testid={"default-threshold-timeline"}><TimelineVisDefault items={thresholdItems} options={thresholdOptions} /></div>;
  };

  const renderThresholdTimeline = () => {
    return <div data-testid={"active-threshold-timeline"}><TimelineVis items={thresholdItems} options={thresholdOptions} clickHandler={onThresholdTimelineItemClicked} /></div>;
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

  const onRuleSetTimelineItemClicked = (event) => {
    let updateStepArtifactRulesets = curationOptions.activeStep.stepArtifact.matchRulesets;
    let index = event.item;
    let editMatchRuleset = updateStepArtifactRulesets[index];
    setEditRuleset({...editMatchRuleset, index});
    if (editMatchRuleset) {
      if (editMatchRuleset.hasOwnProperty("rulesetType") && editMatchRuleset["rulesetType"] === "multiple") {
        toggleShowRulesetMultipleModal(true);
      } else {
        toggleShowRulesetSingleModal(true);
      }
    }
  };

  const onThresholdTimelineItemClicked = (event) => {
    let updateStepArtifactThresholds = curationOptions.activeStep.stepArtifact.thresholds;
    let index = event.item;
    let editThreshold = updateStepArtifactThresholds[index];
    setEditThreshold({...editThreshold, index});
    if (editThreshold) {
      toggleShowThresholdModal(true);
    }
  };

  const handleAddMenu = (key) => {
    if (key === "singlePropertyRuleset") {
      addNewSingleRuleset();
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
      title={<>Add<ChevronDown className="ms-2" /></>}
      onSelect={handleAddMenu}>
      <Dropdown.Item eventKey="singlePropertyRuleset">
        <span aria-label={"singlePropertyRulesetOption"}>Add ruleset for a single property</span>
      </Dropdown.Item>
      <Dropdown.Item eventKey="multiPropertyRuleset">
        <span aria-label={"multiPropertyRulesetOption"}>Add ruleset for multiple properties</span>
      </Dropdown.Item>
    </DropdownButton>
  );


  return (
    <>
      <CustomPageHeader
        title={matchingStep.name}
        handleOnBack={() => {
          history.push("/tiles/curate");
          setViewSettings({...storage, curate: {}});
        }}
      />
      <p className={styles.headerDescription}>{MatchingStepDetailText.description}</p>

      <div className={styles.matchingDetailContainer}>

        <div className={expandRuleset ? styles.matchCombinationsExpandedContainer : styles.matchCombinationsCollapsedContainer}>
          <div aria-label="matchCombinationsHeading" className={styles.matchCombinationsHeading}>Possible Combinations of Matched Rulesets</div>
          <span className={styles.expandCollapseRulesIcon}><ExpandCollapse handleSelection={(id) => handleExpandCollapseRulesIcon(id)} currentSelection={"collapse"} aria-label="expandCollapseRulesetIcon" /></span>
          {matchingActivity?.thresholdActions && matchingActivity?.thresholdActions.length ?
            <Row>
              {matchingActivity?.thresholdActions?.map((combinationsObject, i, combArr) => {
                return <Col xs={4} key={`${combinationsObject["name"]}-${i}`}>
                  <div className={styles.matchCombinationsColsContainer}>
                    <HCCard className={styles.matchCombinationsCardStyle}>
                      <div className={combArr.length > 1 ? styles.colsWithoutDivider : styles.colsWithSingleMatch}>
                        <div className={styles.combinationlabel} aria-label={`combinationLabel-${combinationsObject.name}`}>Minimum combinations for <strong>{combinationsObject.name}</strong> threshold:</div>

                        {combinationsObject.minimumMatchContributions?.map((minMatchArray, index) => {
                          return <div key={`${minMatchArray[0]["rulsetName"]}-${index}`}>{minMatchArray.map((obj, index, arr) => {
                            if (arr.length - 1 === index) {
                              return <span key={`${combinationsObject.name}-${index}`} aria-label={`rulesetName-${combinationsObject.name}-${obj.rulesetName}`}>{getRulesetName(obj)}</span>;
                            } else {
                              return <span key={`${combinationsObject.name}-${index}`} aria-label={`rulesetName-${combinationsObject.name}-${obj.rulesetName}`}>{getRulesetName(obj)} <span className={styles.period}></span> </span>;
                            }
                          })}</div>;

                        })}
                      </div>
                    </HCCard>
                  </div>
                </Col>;
              })
              }
            </Row> : <p aria-label="noMatchedCombinations">Add thresholds and rulesets to the following sliders to determine which combinations of qualifying rulesets would meet each threshold.</p>
          }
        </div>

        <div className={styles.stepNumberContainer}>
          <NumberIcon value={1} />
          <div className={styles.stepText}>Configure your thresholds</div>
        </div>

        <div className={styles.greyContainer}>
          <div className={styles.topHeader}>
            <div className={styles.textContainer}>
              <p aria-label="threshold-text" className={`${moreThresholdText ? styles.showText : styles.hideText}`}>A <span className={styles.italic}>threshold</span> specifies how closely entities have to match before a certain action is triggered.
                The action could be the merging of those entities, the creation of a match notification, or a custom action that is defined programmatically.
                Click the <span className={styles.bold}>Add</span> button to create a threshold. If most of the values in the entities should match to trigger the action associated with your threshold,
                then move the threshold higher on the scale. If only some of the values in the entities must match, then move the threshold lower.
              <span aria-label="threshold-less" className={styles.link} onClick={() => toggleMoreThresholdText(!moreThresholdText)}>less</span>
              </p>
              {!moreThresholdText && <span aria-label="threshold-more" className={styles.link} onClick={() => toggleMoreThresholdText(!moreThresholdText)}>more</span>}
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
              >Add</HCButton>
            </div>
          </div>
          <div><span><b>Enable Threshold Scale </b></span><Switch aria-label="threshold-scale-switch" onChange={(e) => toggleDisplayThresholdTimeline(e)} defaultChecked={false} ></Switch>
            <span>
              <HCTooltip text={MatchingStepTooltips.thresholdScale} id="threshold-scale-tooltip" placement="right">
                <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} className={styles.scaleTooltip} data-testid={"info-tooltip-threshold"}/>
              </HCTooltip>
              <br />
            </span></div>
          {displayThresholdTimeline ? renderThresholdTimeline() : renderDefaultThresholdTimeline()}
        </div>

        <div className={styles.stepNumberContainer}>
          <NumberIcon value={2} />
          <div className={styles.stepText}>Place rulesets on a match scale</div>
        </div>

        <div className={styles.greyContainer}>
          <div className={styles.topHeader}>
            <div className={styles.textContainer}>
              <p aria-label="ruleset-text" className={`${moreRulesetText ? styles.showText : styles.hideText}`}>A <span className={styles.italic}>ruleset</span> specifies the criteria for determining whether the values of your entities match.
                The way you define your rulesets, and where you place them on the scale, influences whether the entities are considered a match.
                Click the <span className={styles.bold}>Add</span> button to create a ruleset. If you want the ruleset to have a major influence over whether entities are qualified as a "match",
                move it higher on the scale. If you want it to have only some influence, then move the ruleset lower.
              <span aria-label="ruleset-less" className={styles.link} onClick={() => toggleMoreRulesetText(!moreRulesetText)}>less</span>
              </p>
              {!moreRulesetText && <span aria-label="ruleset-more" className={styles.link} onClick={() => toggleMoreRulesetText(!moreRulesetText)}>more</span>}
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
          <div><span><b>Enable Ruleset Scale </b></span><Switch aria-label="ruleset-scale-switch" onChange={(e) => toggleDisplayRulesetTimeline(e)} defaultChecked={false} ></Switch>
            <span>
              <HCTooltip text={MatchingStepTooltips.rulesetScale} id="ruleset-scale-tooltip" placement="right">
                <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} className={styles.scaleTooltip} data-testid={`info-tooltip-ruleset`}/>
              </HCTooltip>
              <br />
            </span></div>
          {displayRulesetTimeline ? renderRulesetTimeline() : renderDefaultRulesetTimeline()}
        </div>

        <div className={styles.stepNumberContainer}>
          <NumberIcon value={3} />
          <div className={styles.stepText}>Test and review matched entities</div>
        </div>
        <div className={styles.testMatch} aria-label="testMatch">
          <Radio.Group onChange={onTestMatchRadioChange} value={value} id="addDataRadio" className={styles.testMatchedRadioGroup}>
            <span className={styles.borders}>
              <Radio
                className={styles.urisData}
                value={1}
                aria-label="inputUriOnlyRadio"
                onClick={handleUriInputSelected}
              // validateStatus={duplicateUriWarning || singleUriWarning ? "error" : ""}
              >
                <span className={styles.radioTitle}>Test URIs</span>
                <span className={styles.selectTooltip} aria-label="testUriOnlyTooltip">
                  <HCTooltip text={MatchingStepTooltips.testUris} id="test-all-uris-tooltip" placement="right">
                    <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircle}/>
                  </HCTooltip><br />
                </span>
                <Input
                  placeholder="Enter URI or Paste URIs"
                  className={styles.uriInput}
                  value={uriContent}
                  onChange={handleUriInputChange}
                  aria-label="UriOnlyInput"
                  disabled={inputUriDisabled}
                />
                <FontAwesomeIcon icon={faPlusSquare} className={inputUriDisabled ? styles.disabledAddIcon : styles.addIcon} onClick={handleClickAddUri} aria-label="addUriOnlyIcon" />
                {duplicateUriWarning ? <div className={styles.duplicateUriWarning}>This URI has already been added.</div> : ""}
                {singleUriWarning ? <div className={styles.duplicateUriWarning}>At least Two URIs are required.</div> : ""}
                <div className={styles.UriTable}>
                  {UriTableData.length > 0 ? <Table
                    columns={UriColumns}
                    className={styles.tableContent}
                    dataSource={renderUriTableData}
                    rowKey="key"
                    // id="uriData"
                    pagination={false}
                  /> : ""}
                </div>
              </Radio></span>
            <Radio
              value={2}
              className={styles.allDataUris}
              aria-label="inputUriRadio"
              onClick={handleUriInputSelected2}
            // validateStatus={duplicateUriWarning || singleUriWarning ? "error" : ""} // TODO handle vvalidation in React Bootstrap components
            >
              <span className={styles.radioTitle}>Test URIs with All Data</span>
              <span aria-label="testUriTooltip">
                <HCTooltip text={MatchingStepTooltips.testUrisAllData} id="test-uris-all-data-tooltip" placement="right">
                  <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircle}/>
                </HCTooltip>
              </span><br />
              <Input
                placeholder="Enter URI or Paste URIs"
                className={styles.uriInput}
                value={uriContent2}
                onChange={handleUriInputChange2}
                aria-label="UriInput"
                disabled={inputUriDisabled2}
              />
              <FontAwesomeIcon icon={faPlusSquare} className={inputUriDisabled2 ? styles.disabledAddIcon : styles.addIcon} onClick={handleClickAddUri2} aria-label="addUriIcon" />
              {duplicateUriWarning2 ? <div className={styles.duplicateUriWarning}>This URI has already been added.</div> : ""}
              {singleUriWarning2 ? <div className={styles.duplicateUriWarning}>At least one URI is required.</div> : ""}
              <div className={styles.UriTable}>
                {UriTableData2.length > 0 ? <Table
                  columns={UriColumns2}
                  className={styles.tableContent}
                  dataSource={renderUriTableData2}
                  rowKey="key"
                  // id="uriData"
                  pagination={false}
                /> : ""}
              </div>
            </Radio>
            <Radio value={3} className={styles.allDataRadio} onClick={handleAllDataRadioClick} aria-label="allDataRadio">
              <span>Test All Data</span>
              <span aria-label={"allDataTooltip"}>
                <HCTooltip text={MatchingStepTooltips.testAllData} id="test-all-data-tooltip" placement="right">
                  <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircle}/>
                </HCTooltip>
              </span>
              <span aria-label="allDataContent"><br />
                Select All Data in your source query in order to preview matching activity against all URIs up to 100 displayed pair matches. It is best practice to test with a smaller-sized source query.
              </span>
            </Radio>
          </Radio.Group>
          <div className={styles.testButton}>
            <HCButton variant="primary" type="submit" onClick={handleTestButtonClick} aria-label="testMatchUriButton">Test</HCButton>
          </div>
        </div>
        {/*<div className={styles.matchedTab}>*/}
        {/*  <Menu onClick={handleTestMatchTab} selectedKeys={[testMatchTab]} mode="horizontal" aria-label="testMatchTab">*/}
        {/*    <Menu.Item key="matched">Matched Entities</Menu.Item>*/}
        {/*    <Menu.Item key="notMatched">Not Matched</Menu.Item>*/}
        {/*  </Menu>*/}
        {/*</div>*/}
        {previewMatchedData === 0 && <div className={styles.noMatchedDataView} aria-label="noMatchedDataView"><span>No matches found. You can try: </span><br />
          <div className={styles.noMatchedDataContent}>
            <span> Selecting a different test case</span><br />
            <span> Changing or adding more URIs</span><br />
            <span> Changing your match configuration. Preview matches in the Possible Combinations box</span>
          </div>
        </div>}
        {previewMatchedActivity.actionPreview.length > 0 && testMatchTab === "matched" && uriTestMatchClicked ?
          <div className={styles.UriMatchedDataTable}>
            <div className={styles.modalTitleLegend} aria-label="modalTitleLegend">
              <div className={styles.expandCollapseIcon}><ExpandCollapse handleSelection={(id) => handleExpandCollapse(id)} currentSelection={"collapse"} aria-label="expandCollapseIcon" /></div>
            </div>
            {rulesetDataList.map((rulesetDataList, index) => (
              <Accordion id="testMatchedPanel" className={"w-100"} flush key={index} activeKey={activeMatchedRuleset.includes(rulesetDataList.rulesetName) ? rulesetDataList.rulesetName : ""} defaultActiveKey={activeMatchedRuleset.includes(rulesetDataList.rulesetName) ? rulesetDataList.rulesetName : ""}>
                <Accordion.Item eventKey={rulesetDataList.rulesetName}>
                  <Card>
                    <div className={"p-0 d-flex"}>
                      <Accordion.Button onClick={() => handleRulesetAccordionChange(rulesetDataList.rulesetName)}>
                        <span>
                          <span className={"text-info fw-bold"}>{rulesetDataList.rulesetName}</span>
                          <span className={"text-dark fw-bold"}> (Threshold: {rulesetDataList.score})</span>
                          <span className={"d-block"}>{rulesetDataList.actionPreviewData.length} pair matches</span>
                        </span>
                      </Accordion.Button>
                    </div>
                    <Accordion.Body className={"pt-1"}>
                      {rulesetDataList.actionPreviewData.map((actionPreviewData, idx) => {
                        const itemKey = actionPreviewData.name.concat(" - ") + actionPreviewData.action.concat("/") + idx;
                        return (
                          <Accordion id="testMatchedUriDataPanel" className={"w-100"} flush key={idx} activeKey={activeMatchedUri.includes(itemKey) ? itemKey : ""} defaultActiveKey={activeMatchedUri.includes(itemKey) ? itemKey : ""}>
                            <Accordion.Item eventKey={itemKey}>
                              <div className={"d-flex"}>
                                <Accordion.Button onClick={() => handleUrisAccordionChange(itemKey)}>
                                  <span onClick={e => e.stopPropagation()} className={"text-info"}>
                                    <span className={"d-block"}>{actionPreviewData.uris[0]}<span className={"text-dark"}>  (Score: {actionPreviewData.score})</span></span>
                                    <span className={"d-block"}>{actionPreviewData.uris[1]}</span>
                                  </span>
                                </Accordion.Button>
                                <div className={"p-2"}>
                                  <HCButton size="sm" variant="primary" onClick={() => { handleCompareButton([actionPreviewData.uris[0], actionPreviewData.uris[1]]); }} aria-label={actionPreviewData.uris[0].substr(0, 41) + " compareButton"}>Compare</HCButton>
                                </div>
                              </div>
                              <Accordion.Body>
                                <span aria-label="expandedTableView"><ExpandableTableView rowData={actionPreviewData} allRuleset={curationOptions.activeStep.stepArtifact.matchRulesets} entityData={curationOptions.activeStep}/></span>
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>);
                      })}
                    </Accordion.Body>
                  </Card>
                </Accordion.Item>
              </Accordion>
            ))}
          </div> : ""}
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
        toggleModal={setCompareModalVisible}
        uriInfo={uriInfo}
        activeStepDetails={curationOptions.activeStep}
        entityProperties={entityProperties}
        uriCompared={urisCompared}
        previewMatchActivity={previewMatchedActivity}
        entityDefinitionsArray={curationOptions.entityDefinitionsArray}
        uris={uris}
      />
      <ThresholdModal
        isVisible={showThresholdModal}
        editThreshold={editThreshold}
        toggleModal={toggleShowThresholdModal}
      />
    </>
  );
};

export default MatchingStepDetail;
