import React, {useState, useEffect, useContext} from "react";
import {Modal, Row, Col, Card, Menu, Dropdown, Icon} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusSquare} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {useHistory} from "react-router-dom";
import {MLButton, MLTable, MLInput, MLRadio, MLTooltip} from "@marklogic/design-system";
import styles from "./matching-step-detail.module.scss";
import "./matching-step-detail.scss";
import CustomPageHeader from "../../page-header/page-header";

import RulesetSingleModal from "../ruleset-single-modal/ruleset-single-modal";
import RulesetMultipleModal from "../ruleset-multiple-modal/ruleset-multiple-modal";
import MultiSlider from "../multi-slider/multi-slider";
import NumberIcon from "../../../number-icon/number-icon";
import ThresholdModal from "../threshold-modal/threshold-modal";

import {CurationContext} from "../../../../util/curation-context";
import {MatchingStep} from "../../../../types/curation-types";
import {MatchingStepDetailText} from "../../../../config/tooltips.config";
import {updateMatchingArtifact, calculateMatchingActivity, previewMatchingActivity} from "../../../../api/matching";
import {DownOutlined} from "@ant-design/icons";
import {getViewSettings, setViewSettings, clearSessionStorageOnRefresh} from "../../../../util/user-context";

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
  const [deleteOptions, setDeleteOptions] = useState({});
  const [editThreshold, setEditThreshold] = useState({});
  const [editRuleset, setEditRuleset] = useState({});

  const [showThresholdModal, toggleShowThresholdModal] = useState(false);
  const [showRulesetSingleModal, toggleShowRulesetSingleModal] = useState(false);

  const [moreThresholdText, toggleMoreThresholdText] = useState(true);
  const [moreRulesetText, toggleMoreRulesetText] = useState(true);

  const [showDeleteModal, toggleShowDeleteModal] = useState(false);

  const [matchingActivity, setMatchingActivity] = useState<any>({scale: {}, thresholdActions: []});

  const [value, setValue] = React.useState(1);
  const [UriTableData, setUriTableData] = useState<any[]>([]);
  const [uriContent, setUriContent] = useState("");
  const [inputUriDisabled, setInputUriDisabled] = useState(false);
  const [testMatchTab, setTestMatchTab] = useState("matched");
  const [duplicateUriWarning, setDuplicateUriWarning] = useState(false);
  const [singleUriWarning, setSingleUriWarning] = useState(false);
  const [uriTestMatchClicked, setUriTestMatchClicked] = useState(false);
  const [allDataSelected, setAllDataSelected] = useState(false);
  const [testMatchedData, setTestMatchedData] = useState<any>({stepName: "", sampleSize: 10, uris: []});
  const [previewMatchedActivity, setPreviewMatchedActivity]   = useState<any>({sampleSize: 10, uris: [], actionPreview: []});
  const [showRulesetMultipleModal, toggleShowRulesetMultipleModal] = useState(false);

  const menu = (
    <Menu>
      <Menu.Item key="singlePropertyRuleset">
        <span onClick={() => addNewSingleRuleset()} aria-label={"singlePropertyRulesetOption"}>Add ruleset for a single property</span>
      </Menu.Item>
      <Menu.Item key="multiPropertyRuleset">
        <span onClick={() => addNewMultipleRuleset()} aria-label={"multiPropertyRulesetOption"}>Add ruleset for multiple properties</span>
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    if (Object.keys(curationOptions.activeStep.stepArtifact).length !== 0) {
      const matchingStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
      if (matchingStepArtifact.matchRulesets) {
        if (matchingStepArtifact.matchRulesets.length > 0) {
          toggleMoreRulesetText(false);
        } else {
          toggleMoreRulesetText(true);
        }

      }
      if (matchingStepArtifact.thresholds) {
        if (matchingStepArtifact.thresholds.length > 0) {
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
  }, [JSON.stringify(curationOptions.activeStep.stepArtifact)]);

  const handleMatchingActivity = async (matchStepName) => {
    let matchActivity = await calculateMatchingActivity(matchStepName);
    setMatchingActivity(matchActivity);
  };

  const handlePreviewMatchingActivity = async (testMatchData) => {
    let previewMatchActivity = await previewMatchingActivity(testMatchData);
    setPreviewMatchedActivity(previewMatchActivity);
  };

  const matchRuleSetOptions = matchingStep.matchRulesets && matchingStep.matchRulesets.map((i) => {
    const firstMatchRule = i.matchRules[0];
    const firstMatchRuleType = firstMatchRule ? firstMatchRule.matchType : "";
    const rulesetType = firstMatchRuleType;
    const matchRuleOptionsObject = {
      props: [{
        prop: i.name.split(" -")[0],
        type: rulesetType
      }],
      value: i.weight
    };
    return matchRuleOptionsObject;
  });

  const matchThresholdOptions = matchingStep.thresholds && matchingStep.thresholds.map((i) => {
    const matchThresholdOptionsObject = {
      props: [{
        prop: i.thresholdName,
        type: i.action,
      }],
      value: i.score,
    };
    return matchThresholdOptionsObject;
  });

  const handleSlider = async (values, options) => {
    if (options["sliderType"] === "threshold") {

      let stepArtifact = curationOptions.activeStep.stepArtifact;
      let stepArtifactThresholds = curationOptions.activeStep.stepArtifact.thresholds;
      let index = stepArtifactThresholds.findIndex(threshold => threshold.thresholdName === options["prop"]);
      let updateThreshold = stepArtifactThresholds.find(threshold => threshold.thresholdName === options["prop"]);
      let changedSlider = values.find(item => item["props"]["prop"] === options["prop"]);

      updateThreshold["score"] = parseInt(changedSlider["value"]);
      stepArtifactThresholds[index] = updateThreshold;
      stepArtifact["thresholds"] = stepArtifactThresholds;

      await updateMatchingArtifact(stepArtifact);
      updateActiveStepArtifact(stepArtifact);
    } else if (options["sliderType"] === "ruleSet") {
      let stepArtifact = curationOptions.activeStep.stepArtifact;
      let stepArtifactRulesets = curationOptions.activeStep.stepArtifact.matchRulesets;
      let index = parseInt(options["index"]);

      stepArtifactRulesets[index]["weight"] = parseInt(values[index]["value"]);
      stepArtifact["matchRulesets"] = stepArtifactRulesets;

      await updateMatchingArtifact(stepArtifact);
      updateActiveStepArtifact(stepArtifact);
    }
  };

  const handleSliderEdit = (options) => {
    if (options["sliderType"] === "threshold") {
      let updateStepArtifactThresholds = curationOptions.activeStep.stepArtifact.thresholds;
      let index = updateStepArtifactThresholds.findIndex(threshold => threshold.thresholdName === options["prop"]);
      let editThreshold = updateStepArtifactThresholds[index];
      setEditThreshold({...editThreshold, index});
      toggleShowThresholdModal(true);
    } else if (options["sliderType"] === "ruleSet") {
      let updateStepArtifactRulesets = curationOptions.activeStep.stepArtifact.matchRulesets;
      let index = parseInt(options["index"]);
      let editMatchRuleset = updateStepArtifactRulesets[index];

      setEditRuleset({...editMatchRuleset, index});
      toggleShowRulesetSingleModal(true);
    }
  };

  const handleSliderDelete = (options) => {
    setDeleteOptions(options);
    toggleShowDeleteModal(true);
  };

  const deleteConfirm = async () => {
    if (deleteOptions["sliderType"] === "threshold") {
      let stepArtifact = curationOptions.activeStep.stepArtifact;
      let updateStepArtifactThresholds = curationOptions.activeStep.stepArtifact.thresholds;
      let index = updateStepArtifactThresholds.findIndex(threshold => threshold.thresholdName === deleteOptions["prop"]);
      updateStepArtifactThresholds.splice(index, 1);
      stepArtifact.thresholds = updateStepArtifactThresholds;
      await updateMatchingArtifact(stepArtifact);
      updateActiveStepArtifact(stepArtifact);
      toggleShowDeleteModal(false);
    } else if (deleteOptions["sliderType"] === "ruleSet") {
      let stepArtifact = curationOptions.activeStep.stepArtifact;
      let stepArtifactRulesets = curationOptions.activeStep.stepArtifact.matchRulesets;
      let index = parseInt(deleteOptions["index"]);

      stepArtifactRulesets.splice(index, 1);
      stepArtifact.matchRulesets = stepArtifactRulesets;

      await updateMatchingArtifact(stepArtifact);
      updateActiveStepArtifact(stepArtifact);
      toggleShowDeleteModal(false);
    }
  };

  const addNewSingleRuleset = () => {
    setEditRuleset({});
    toggleShowRulesetSingleModal(true);
  };

  const addNewMultipleRuleset = () => {
    setEditRuleset({});
    toggleShowRulesetMultipleModal(true);
  };

  const deleteModal = (
    <Modal
      width={500}
      visible={showDeleteModal}
      destroyOnClose={true}
      closable={false}
      className={styles.confirmModal}
      maskClosable={false}
      footer={null}
    >
      <p aria-label="delete-slider-text" className={styles.deleteMessage}>Are you sure you want to delete a {deleteOptions["sliderType"] === "threshold" ? "threshold" : "ruleset"} <b>{deleteOptions["prop"]} - {deleteOptions["type"]}</b>?</p>
      <div className={styles.footer}>
        <MLButton
          aria-label={`delete-slider-no`}
          size="default"
          onClick={() => toggleShowDeleteModal(false)}
        >No</MLButton>
        <MLButton
          className={styles.saveButton}
          aria-label={`delete-slider-yes`}
          type="primary"
          size="default"
          onClick={() => deleteConfirm()}
        >Yes</MLButton>
      </div>
    </Modal>
  );

  const getRulesetName = (rulesetComb) => {
    let matchRules = rulesetComb.matchRules;
    let rulesetName = rulesetComb.rulesetName;
    if (!rulesetComb.rulesetName && Array.isArray(matchRules) && matchRules.length) {
      rulesetName = matchRules[0].entityPropertyPath + " - " + matchRules[0].matchAlgorithm;
    }

    return rulesetName;
  };

  const onTestMatchRadioChange = event => {
    setValue(event.target.value);
  };

  const handleUriInputChange = (event) => {
    setUriContent(event.target.value);
  };

  const handleClickAddUri = (event) => {
    let flag=false;
    let setDuplicateWarning = () => { setDuplicateUriWarning(true); setSingleUriWarning(false); };
    if (UriTableData.length > 0) {
      for (let i=0; i<UriTableData.length;i++) {
        if (UriTableData[i].uriContent === uriContent) {
          flag=true;
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

  const renderUriTableData = UriTableData.map((uriData) => {
    return {
      key: uriData.uriContent,
      uriValue: uriData.uriContent,
    };
  });

  const renderTestMatchUriData = previewMatchedActivity.actionPreview.map((testMatchedUriData, index) => {
    return {
      key: index,
      uriTestMatchValue: testMatchedUriData,
    };
  });

  const UriColumns = [{
    key: "uriValue",
    title: "uriValues",
    dataIndex: "uriValue",
    render: (text, key) => (
      <span className={styles.tableRow}>{text}<i className={styles.positionDeleteIcon} aria-label="deleteIcon">
        <FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} onClick={() => handleDeleteUri(key)} size="lg"/></i>
      </span>
    ),
  }];

  const testMatchedUriColumns = [{
    key: "key",
    title: "Matched URI",
    dataIndex: "uriTestMatchValue",
    render: (text) => (
      <div>
        <MLTooltip placement="topLeft" title={text.uris[0]}><span className={styles.testMatchedTableRow}><Icon className={styles.expandableIcon} type="right" />
          {text.entityNames[0]}</span></MLTooltip><br /><br />
        <MLTooltip placement="top" title={text.uris[1]}><span className={styles.matchedUriRow}>{text.entityNames[1]}</span></MLTooltip>
      </div>
    )
  }];

  const handleDeleteUri = (event) => {
    let uriValue = event.uriValue;
    let data = [...UriTableData];
    for (let i =0; i < data.length; i++) {
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

  const handleAllDataRadioClick = (event) => {
    setAllDataSelected(true);
    setUriTableData([]);
    setUriContent("");
    setInputUriDisabled(true);
    setDuplicateUriWarning(false);
    setSingleUriWarning(false);
    setUriTestMatchClicked(false);
  };

  const handleTestButtonClick = () => {
    if (UriTableData.length < 2 && !allDataSelected) {
      setDuplicateUriWarning(false);
      setSingleUriWarning(true);
    }
    if (UriTableData.length >= 2 || allDataSelected) {
      if (!duplicateUriWarning && !singleUriWarning) {
        setUriTestMatchClicked(true);
        for (let i=0;i<UriTableData.length;i++) {
          testMatchedData.uris.push(UriTableData[i].uriContent);
        }
        testMatchedData.stepName=matchingStep.name;
        setTestMatchedData(testMatchedData);
        handlePreviewMatchingActivity(testMatchedData);
      }
    }
  };

  const handleTestMatchTab = (event) => {
    setTestMatchTab(event.key);
  };

  const handleUriInputSelected = (event) => {
    setInputUriDisabled(false);
    setAllDataSelected(false);
    setUriTestMatchClicked(false);
  };

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

        <div className={styles.matchCombinationsContainer}>
          <div aria-label="matchCombinationsHeading" className={styles.matchCombinationsHeading}>Possible Combinations of Matched Rulesets</div>

          {matchingActivity?.thresholdActions && matchingActivity?.thresholdActions.length ?
            <Row gutter={[24, 24]} type="flex">
              {matchingActivity?.thresholdActions?.map((combinationsObject, i, combArr) => {
                return <Col span={8} key={`${combinationsObject["name"]}-${i}`}>
                  <div className={styles.matchCombinationsColsContainer}>
                    <Card bordered={false} className={styles.matchCombinationsCardStyle}>
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
                    </Card>
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
                then move the threshold higher on the scale. If some of the values in the entities must match, then move the threshold lower.
              <span aria-label="threshold-less" className={styles.link} onClick={() => toggleMoreThresholdText(!moreThresholdText)}>less</span>
              </p>
              {!moreThresholdText && <span aria-label="threshold-more" className={styles.link} onClick={() => toggleMoreThresholdText(!moreThresholdText)}>more</span> }
            </div>
            <div className={styles.addButtonContainer}>
              <MLButton
                aria-label="add-threshold"
                type="primary"
                size="default"
                className={styles.addThresholdButton}
                onClick={() => {
                  setEditThreshold({});
                  toggleShowThresholdModal(true);
                }}
              >Add</MLButton>
            </div>
          </div>
          <MultiSlider options={matchingStep.thresholds && matchingStep.thresholds.length ? matchThresholdOptions : []} handleSlider={handleSlider} handleDelete={handleSliderDelete} handleEdit={handleSliderEdit} type={"threshold"}/>
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
                Click the <span className={styles.bold}>Add</span> button to create a ruleset. If you want the ruleset to have a major influence over whether entities qualify as a "match",
                move it higher on the scale. If you want it to only have some influence, then move the ruleset lower.
              <span aria-label="ruleset-less" className={styles.link} onClick={() => toggleMoreRulesetText(!moreRulesetText)}>less</span>
              </p>
              {!moreRulesetText && <span aria-label="ruleset-more" className={styles.link} onClick={() => toggleMoreRulesetText(!moreRulesetText)}>more</span> }
            </div>
            <div
              id="panelActionsMatch"
              onClick={event => {
                event.stopPropagation(); // Do not trigger collapse
                event.preventDefault();
              }}
            >
              <Dropdown
                overlay={menu}
                trigger={["click"]}
                overlayClassName="stepMenu"
              >
                <div className={styles.addButtonContainer}>
                  <MLButton aria-label="add-ruleset" size="default" type="primary">
                Add{" "}
                    <DownOutlined /></MLButton>
                </div></Dropdown></div>
          </div>
          <MultiSlider options={matchingStep.matchRulesets && matchingStep.matchRulesets.length ? matchRuleSetOptions : []} handleSlider={handleSlider} handleDelete={handleSliderDelete} handleEdit={handleSliderEdit} type={"ruleSet"}/>
        </div>

        <div className={styles.stepNumberContainer}>
          <NumberIcon value={3} />
          <div className={styles.stepText}>Test and review matched entities</div>
        </div>

        <div className={styles.testMatch} aria-label="testMatch">
          <MLRadio.MLGroup onChange={onTestMatchRadioChange} value={value}  id="addDataRadio">
            <MLRadio value={1} aria-label="inputUriRadio" onClick={handleUriInputSelected} validateStatus={duplicateUriWarning || singleUriWarning ? "error" : ""}>
              <MLInput
                placeholder="Enter URI or Paste URIs"
                className={duplicateUriWarning ? styles.duplicateUriInput : styles.uriInput}
                value={uriContent}
                onChange={handleUriInputChange}
                aria-label="UriInput"
                disabled={inputUriDisabled}
              />
              <FontAwesomeIcon icon={faPlusSquare} className={inputUriDisabled ? styles.disabledAddIcon : styles.addIcon} onClick={handleClickAddUri} aria-label="addUriIcon"/>
              {duplicateUriWarning ? <div className={styles.duplicateUriWarning}>This URI has already been added.</div> : ""}
              {singleUriWarning ? <div className={styles.duplicateUriWarning}>The minimum of two URIs are required.</div> : ""}
              <div className={styles.UriTable}>
                {UriTableData.length > 0 ? <MLTable
                  columns={UriColumns}
                  className={styles.tableContent}
                  dataSource={renderUriTableData}
                  rowKey="key"
                  id="uriData"
                  pagination={false}
                />:""}
              </div>
              <div className={UriTableData.length > 0 ? styles.testButton:""}>
                <MLButton type="primary" htmlType="submit" size="default" onClick={handleTestButtonClick} aria-label="testMatchUriButton">Test</MLButton>
              </div>
            </MLRadio>
            <MLRadio value={2} className={styles.allDataRadio} onClick={handleAllDataRadioClick} aria-label="allDataRadio">
              <span>All Data</span>
              <div aria-label="allDataContent"><br />
                  Info about All Data goes here... what it is, how to use it, limitations..info about All Data goes here... what it is, how to use it, limitations..
              </div>
            </MLRadio>
          </MLRadio.MLGroup>
        </div>
        <div className={styles.matchedTab}>
          <Menu onClick={handleTestMatchTab} selectedKeys={[testMatchTab]} mode="horizontal" aria-label="testMatchTab">
            <Menu.Item key="matched">Matched</Menu.Item>
            <Menu.Item key="notMatched">Not Matched</Menu.Item>
          </Menu>
        </div>
        {previewMatchedActivity.actionPreview.length > 0 && testMatchTab === "matched" && uriTestMatchClicked ? <div className={styles.UriMatchedDataTable}>
          <MLTable
            columns={testMatchedUriColumns}
            className={styles.tableContent}
            dataSource={renderTestMatchUriData}
            rowKey="key"
            id="uriData"
            pagination={false}
          />
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
      <ThresholdModal
        isVisible={showThresholdModal}
        editThreshold={editThreshold}
        toggleModal={toggleShowThresholdModal}
      />
      {deleteModal}
    </>
  );
};

export default MatchingStepDetail;
