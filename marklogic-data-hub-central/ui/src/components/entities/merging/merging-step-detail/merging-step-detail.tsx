import "./merging-step-detail.scss";

import {HCButton, HCModal, HCTable, HCTooltip} from "@components/common";
import {MergeStrategyTooltips, MergingStepIntros, multiSliderTooltips} from "@config/tooltips.config";
import {
  MergingStep,
  defaultPriorityOption
} from "../../../../types/curation-types";
import React, {useContext, useEffect, useState} from "react";
import {clearSessionStorageOnRefresh, getViewSettings, setViewSettings} from "@util/user-context";

import Axios from "axios";
import {CurationContext} from "@util/curation-context";
import CustomPageHeader from "../../page-header/page-header";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import MergeRuleDialog from "../add-merge-rule/merge-rule-dialog";
import MergeStrategyDialog from "../merge-strategy-dialog/merge-strategy-dialog";
import {Modal} from "react-bootstrap";
import NumberIcon from "../../../number-icon/number-icon";
import {QuestionCircleFill} from "react-bootstrap-icons";
import TimelineVisDefault from "../../matching/matching-step-detail/timeline-vis-default/timeline-vis-default";
import {UserContext} from "@util/user-context";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import styles from "./merging-step-detail.module.scss";
import {themeColors} from "@config/themes.config";
import {updateMergingArtifact} from "@api/merging";
import {useHistory} from "react-router-dom";

dayjs.extend(duration);

const DEFAULT_MERGING_STEP: MergingStep = {
  name: "",
  description: "",
  additionalCollections: [],
  collections: [],
  lastUpdatedLocation: {
    namespaces: {},
    documentXPath: "",
  },
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
  mergeStrategies: [],
  mergeRules: [],
  interceptors: {},
  customHook: {}
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
    item: false,
    range: false
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
      return "<div data-testid=\"strategy"+"-"+item.value.split(":")[0]+"\">" + item.value.split(":")[0] + "<div class=\"itemValue\">" + item.value.split(":")[1]+ "</div></div>";
    }
  },
  maxMinorChars: 4,
  order: timelineOrder
};

const MergingStepDetail: React.FC = () => {
  const storage = getViewSettings();
  const expandedRowStorage = storage?.merge?.strategyExpandedRows;


  // Prevents an infinite loop issue with sessionStorage due to user refreshing in step detail page.
  clearSessionStorageOnRefresh();

  const history = useHistory<any>();
  const {handleError} = useContext(UserContext);
  const {curationOptions, updateActiveStepArtifact} = useContext(CurationContext);
  const [mergingStep, setMergingStep] = useState<MergingStep>(DEFAULT_MERGING_STEP);
  const [showCreateEditStrategyModal, toggleCreateEditStrategyModal] = useState(false);
  const [isEditStrategy, toggleIsEditStrategy] = useState(false);
  const [isEditRule, toggleIsEditRule] = useState(false);
  const [showCreateEditRuleModal, toggleCreateEditRuleModal] = useState(false);
  const [currentStrategyName, setCurrentStrategyName] = useState("");
  const [currentPropertyName, setCurrentPropertyName] = useState("");
  const [currentMergeObj, setCurrentMergeObj] = useState<any>({});
  const [deleteModalVisibility, setDeleteModalVisibility] = useState(false);
  const [sourceNames, setSourceNames] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>(expandedRowStorage ? expandedRowStorage : []);
  const mergeStrategiesData: any = [];
  const mergeRulesData: any = [];
  const [sortedRuleCol, setSortedRuleCol] = useState<{ columnKey?: string, order?: string }>();
  const [sortedStrategyCol, setSortedStrategyCol] = useState<{ columnKey?: string, order?: string }>();
  let commonStrategyNames: any = [];

  useEffect(() => {
    if (storage.merge?.ruleSortOrder) {
      setSortedRuleCol(storage.merge?.ruleSortOrder);
    }
    if (storage.merge?.strategySortOrder) {
      setSortedStrategyCol(storage.merge?.strategySortOrder);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(curationOptions.activeStep.stepArtifact).length !== 0) {
      const mergingStepArtifact: MergingStep = curationOptions.activeStep.stepArtifact;
      setMergingStep(mergingStepArtifact);
      retrieveCalculatedMergingActivity(mergingStepArtifact);
    } else {
      history.push("/tiles/curate");
    }
  }, [JSON.stringify(curationOptions.activeStep.stepArtifact)]);

  useEffect(() => {
    let newViewSettings = getViewSettings();
    setViewSettings({...newViewSettings, merge: {...newViewSettings.merge, strategyExpandedRows: expandedRows}});
  }, [expandedRows]);

  const retrieveCalculatedMergingActivity = async (mergingStepArtifact: MergingStep) => {
    if (mergingStepArtifact && mergingStepArtifact.name) {
      try {
        const calculatedMergingActivityResp = await Axios.get(`/api/steps/merging/${mergingStepArtifact.name}/calculateMergingActivity`);
        if (calculatedMergingActivityResp.status === 200) {
          setSourceNames(calculatedMergingActivityResp.data.sourceNames || []);
        }
      } catch (error) {
        let message = error.response && error.response.data && error.response.data.message;
        console.error("Error while retrieving information about merge step", message || error);
        handleError(error);
      }
    }
  };

  const editMergeStrategy = (strategyName) => {
    toggleCreateEditStrategyModal(true);
    setCurrentStrategyName(strategyName);
    toggleIsEditStrategy(true);
  };

  const editMergeRule = (propertyName) => {
    toggleCreateEditRuleModal(true);
    setCurrentPropertyName(propertyName);
    toggleIsEditRule(true);
  };

  const columnSorter = (a: any, b: any, order: string) => order === "asc" ? a.toString().localeCompare(b) : b.toString().localeCompare(a);

  const onExpand = (record, expanded, rowIndex) => {
    let newExpandedRows = [...expandedRows];

    if (expanded) {
      if (newExpandedRows.indexOf(record.strategyName) === -1) {
        newExpandedRows.push(record.strategyName);
      }
    } else {
      newExpandedRows = newExpandedRows.filter(row => row !== record.strategyName);
    }
    setExpandedRows(newExpandedRows);
  };


  const isRuleSorted = (dataField) => {
    return sortedRuleCol?.columnKey === dataField;
  };

  const isStrategySorted = (dataField) => {
    return sortedStrategyCol?.columnKey === dataField;
  };

  const onSortStrategy = (type, {columnKey, order}) => {
    let newViewSettings = getViewSettings();
    if (type === "sort") {
      setViewSettings({...newViewSettings, merge: {...newViewSettings.merge, strategySortOrder: {columnKey: columnKey, order: order}}});
    }
  };

  const onSortRules = (type, {columnKey, order}) => {
    let newViewSettings = getViewSettings();
    if (type === "sort") {
      setViewSettings({...newViewSettings, merge: {...newViewSettings.merge, ruleSortOrder: {columnKey: columnKey, order: order}}});
    }
  };

  const mergeStrategyColumns: any = [
    {
      text: "Strategy Name",
      dataField: "strategyName",
      key: "strategyName",
      sort: true,
      width: 200,
      defaultSortOrder: isStrategySorted("strategyName") ? sortedStrategyCol?.order : undefined,
      className: styles.strategyNameColumn,
      sortFunc: columnSorter,
      formatter: text => {
        return (
          <span className={styles.link}
            id={"strategy-name-link"}
            onClick={() => editMergeStrategy(text)}>
            {text}</span>
        );
      }
    },
    {
      text: "Max Values",
      dataField: "maxValues",
      key: "maxValues",
      sort: true,
      width: 200,
      defaultSortOrder: isStrategySorted("maxValues") ? sortedStrategyCol?.order : undefined,
      sortFunc: columnSorter,
    },
    {
      text: "Max Sources",
      dataField: "maxSources",
      key: "maxSources",
      sort: true,
      width: 200,
      defaultSortOrder: isStrategySorted("maxSources") ? sortedStrategyCol?.order : undefined,
      sortFunc: columnSorter,
    },
    {
      text: "Default",
      dataField: "default",
      key: "default",
      sort: true,
      width: 200,
      defaultSortOrder: isStrategySorted("default") ? sortedStrategyCol?.order : undefined,
      sortFunc: columnSorter,
    },
    {
      text: "Delete",
      dataField: "delete",
      key: "delete",
      align: "center" as "center",
      headerAlign: "center",
      width: 75,
      formatter: text => <a data-testid={"delete"}>{text}</a>,
    }
  ];

  const mergeRuleColumns: any = [
    {
      text: "Property",
      dataField: "property",
      key: "property",
      sort: true,
      width: 200,
      defaultSortOrder: isRuleSorted("property") ? sortedRuleCol?.order : undefined,
      sortFunc: columnSorter,
      formatter: text => {
        let mergeRuleLabel = text?.split(" > ").join(".");
        return (
          <span className={styles.link}
            id={"property-name-link"}
            onClick={() => editMergeRule(mergeRuleLabel)}>
            {text}</span>
        );
      }
    },
    {
      text: "Merge Type",
      dataField: "mergeType",
      key: "mergeType",
      defaultSortOrder: isRuleSorted("mergeType") ? sortedRuleCol?.order : undefined,
      sort: true,
      width: 200,
      sortFunc: columnSorter,
    },
    {
      text: "Strategy",
      dataField: "strategy",
      key: "strategy",
      sort: true,
      width: 200,
      defaultSortOrder: isRuleSorted("strategy") ? sortedRuleCol?.order : undefined,
      sortFunc: columnSorter,
    },
    {
      text: "Delete",
      dataField: "delete",
      key: "delete",
      align: "center" as "center",
      headerAlign: "center",
      width: 75,
      formatter: text => <a data-testid={"delete"} >{text}</a>,
    }
  ];

  for (let key of mergingStep.mergeRules) {
    if (mergingStep.mergeStrategies) {
      for (let key1 of mergingStep.mergeStrategies) {
        if (key.mergeStrategyName === key1.strategyName && commonStrategyNames.indexOf(key.mergeStrategyName) === -1) {
          commonStrategyNames.push(key.mergeStrategyName);
        }
      }
    }
  }


  mergingStep && mergingStep.mergeStrategies && mergingStep.mergeStrategies.length > 0 && mergingStep.mergeStrategies.forEach((i) => {
    mergeStrategiesData.push(
      {
        strategyName: i["strategyName"],
        maxValues: i["maxValues"],
        maxSources: i["maxSources"],
        default: i["default"] === true ? <FontAwesomeIcon className={styles.defaultIcon} icon={faCheck} data-testid={"default-" + i["strategyName"] + "-icon"} /> : null,
        priorityOrder: i.hasOwnProperty("priorityOrder") ? true : false,
        delete: <HCTooltip text={commonStrategyNames.indexOf(i["strategyName"]) !==-1 ? MergeStrategyTooltips.delete : ""} id="delete-strategy-tooltip" placement="top">
          <i><FontAwesomeIcon
            icon={faTrashAlt}
            size="lg"
            className={commonStrategyNames.indexOf(i["strategyName"]) !== -1 ? styles.disabledDeleteIcon : styles.enabledDeleteIcon}
            data-testid={`mergestrategy-${i.strategyName}`}
            onClick={() => onDelete(i)}/></i>
        </HCTooltip>
      }
    );
  });


  mergingStep && mergingStep.mergeRules.length > 0 && mergingStep.mergeRules.forEach((i) => {
    mergeRulesData.push(
      {
        property: i["entityPropertyPath"]?.split(".").join(" > "),
        mergeType: i["mergeType"],
        strategy: i["mergeStrategyName"],
        delete: <i><FontAwesomeIcon icon={faTrashAlt} className={styles.enabledDeleteIcon} color={themeColors.info} size="lg" data-testid={`mergerule-${i.entityPropertyPath}`} onClick={() => onDelete(i)}/></i>
      }
    );
  });

  const expandedRowRender = (strategyObj) => {
    let priorityOrderStrategyOptions: any[] = [defaultPriorityOption];
    mergingStep.mergeStrategies.map((strategy) => {
      if (strategy.hasOwnProperty("priorityOrder") && strategy.strategyName === strategyObj.strategyName) {
        if (strategy.priorityOrder.hasOwnProperty("timeWeight")) {
          const priorityOrderTimeObject = {
            id: "Timestamp:" + strategy.priorityOrder.timeWeight.toString(),
            value: "Timestamp:"+  strategy.priorityOrder.timeWeight.toString(),
            start: strategy.priorityOrder.timeWeight,
          };
          priorityOrderStrategyOptions[0] = priorityOrderTimeObject;
        }
        if (strategy.priorityOrder.hasOwnProperty("sources")) {
          strategy.priorityOrder.sources.map((key) => {
            const priorityOrderSourceObject = {
              id: strategy.strategyName + ":" + key.sourceName,
              start: key.weight,
              value: "Source" +" - " +key.sourceName + ":" + key.weight.toString(),
            };
            priorityOrderStrategyOptions.push(priorityOrderSourceObject);
          });
        }
        if (strategy.priorityOrder.hasOwnProperty("lengthWeight")) {
          const priorityOrderLengthObject = {
            id: strategy.strategyName + ":Length:",
            start: strategy.priorityOrder.lengthWeight,
            value: "Length:" + strategy.priorityOrder.lengthWeight.toString(),
          };
          priorityOrderStrategyOptions.push(priorityOrderLengthObject);
        }
      }
    });
    return <>
      <div className={styles.priorityOrderContainer}>
        <p className={styles.priorityText}>
          Priority Order
          <HCTooltip text={multiSliderTooltips.priorityOrder} id="priority-order-tooltip" placement="right">
            <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} />
          </HCTooltip>
        </p>
        <div id="strategyText">
          <HCTooltip text={multiSliderTooltips.viewOnlyTooltip} id="view-only-tooltip" placement="top">
            <div style={{opacity: "60%"}}>
              <div data-testid={"default-priorityOrder-timeline"}><TimelineVisDefault items={priorityOrderStrategyOptions} options={strategyOptions}  borderMargin="14px"/></div>
            </div>
          </HCTooltip>
        </div>
      </div>
    </>;
  };

  const deleteModal = (
    <HCModal
      show={deleteModalVisibility}
      onHide={() => setDeleteModalVisibility(false)}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={() => setDeleteModalVisibility(false)}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0 pb-4 px-4"}>
        {currentMergeObj.hasOwnProperty("entityPropertyPath") ? <p aria-label="delete-merge-rule-text">Are you sure you want to delete <b>{currentMergeObj.entityPropertyPath} - {currentMergeObj.mergeType}</b> merge rule ?</p> :
          <p aria-label="delete-merge-strategy-text">Are you sure you want to delete <b>{currentMergeObj.strategyName}</b> merge strategy ?</p>}
        <div className={"d-flex justify-content-center pt-4 pb-2"}>
          <HCButton
            aria-label={`delete-merge-modal-discard`}
            variant="outline-light"
            onClick={() => setDeleteModalVisibility(false)}
            className={"me-2"}
          >No</HCButton>
          <HCButton
            className={styles.saveButton}
            aria-label={`delete-merge-modal-confirm`}
            variant="primary"
            onClick={() => deleteConfirm()}
          >Yes</HCButton>
        </div>
      </Modal.Body>
    </HCModal>
  );

  const onDelete = (currentObj) => {
    setDeleteModalVisibility(true);
    setCurrentMergeObj(currentObj);
  };

  const deleteConfirm = async () => {
    let stepArtifact = curationOptions.activeStep.stepArtifact;
    if (currentMergeObj.hasOwnProperty("entityPropertyPath")) {
      let updateStepArtifactMergeRules = curationOptions.activeStep.stepArtifact.mergeRules;
      let index = updateStepArtifactMergeRules.findIndex(mergeRule => (mergeRule.entityPropertyPath === currentMergeObj.entityPropertyPath)
        && (mergeRule.mergeType === currentMergeObj.mergeType));
      updateStepArtifactMergeRules.splice(index, 1);
      stepArtifact.mergeRules = updateStepArtifactMergeRules;
    } else {
      let updateStepArtifactMergeStartegies = curationOptions.activeStep.stepArtifact.mergeStrategies;
      let index = updateStepArtifactMergeStartegies.findIndex(mergeStrategy => (mergeStrategy.strategyName === currentMergeObj.strategyName));
      updateStepArtifactMergeStartegies.splice(index, 1);
      stepArtifact.mergeStrategies = updateStepArtifactMergeStartegies;
    }
    await updateMergingArtifact(stepArtifact);
    updateActiveStepArtifact(stepArtifact);
    setDeleteModalVisibility(false);
  };

  return (
    <>
      <CustomPageHeader
        title={mergingStep.name}
        handleOnBack={() => {
          history.push("/tiles/curate");
          setViewSettings({...storage, curate: {}, merge: {}});
        }}
      />
      <p className={styles.headerDescription}>{MergingStepIntros.main}</p>
      <div className={styles.mergingDetailContainer}>

        <div className={styles.stepNumberContainer}>
          <NumberIcon value={1} />
          <div className={styles.stepText}>Define merge strategies</div>
        </div>
        <div className={styles.greyContainer}>
          <div className={"d-flex mb-2 justify-content-between"}>
            <p>A <span className={styles.italic}>merge strategy</span><span> defines how to combine the property values of
              candidate entities, but the merge strategy is not active until assigned to a merge rule.
              A merge strategy can be assigned to multiple
              merge rules.</span>
            </p>
            <div>
              <HCButton aria-label="add-merge-strategy" variant="primary"  className={styles.addMergeButton} onClick={() => {
                toggleCreateEditStrategyModal(true);
                toggleIsEditStrategy(false);
                setCurrentStrategyName("");
              }
              }>Add</HCButton>
            </div>
          </div>
          <div>
            <HCTable
              rowKey="strategyName"
              className={styles.table}
              columns={mergeStrategyColumns}
              data={mergeStrategiesData}
              expandedRowRender={expandedRowRender}
              expandedRowKeys={expandedRows}
              onExpand={onExpand}
              onTableChange={onSortStrategy}
              pagination={{hideOnSinglePage: mergeStrategiesData.length <= 10}}
              showExpandIndicator={true}
              expandedContainerClassName="mergeStrategySliders"
              keyUtil="key"
              dynamicSortColumns
            />
          </div>
        </div>
        <div className={styles.stepNumberContainer}>
          <NumberIcon value={2} />
          <div className={styles.stepText}>Add merge rules</div>
        </div>
        <div className={styles.greyContainer}>
          <div className={"d-flex mb-2 justify-content-between"}>
            <p>A <span className={styles.italic}>merge rule</span><span> defines how to combine the values of a specific property</span>
            </p>
            <div>
              <HCButton aria-label="add-merge-rule" variant="primary"  className={styles.addMergeButton} onClick={() => {
                toggleCreateEditRuleModal(true);
                toggleIsEditRule(false);
                setCurrentPropertyName("");
              }}>Add</HCButton>
            </div>
          </div>
          <HCTable
            rowKey="property"
            className={styles.table}
            columns={mergeRuleColumns}
            data={mergeRulesData}
            subTableHeader={true}
            keyUtil="key"
            baseIndent={0}
            onTableChange={onSortRules}
            dynamicSortColumns
          />
        </div>
        <MergeStrategyDialog
          sourceNames={sourceNames}
          strategyName={currentStrategyName}
          createEditMergeStrategyDialog={showCreateEditStrategyModal}
          setOpenEditMergeStrategyDialog={toggleCreateEditStrategyModal}
          isEditStrategy={isEditStrategy}
          toggleIsEditStrategy={toggleIsEditStrategy}
        />
        <MergeRuleDialog
          sourceNames={sourceNames}
          createEditMergeRuleDialog={showCreateEditRuleModal}
          setOpenMergeRuleDialog={toggleCreateEditRuleModal}
          isEditRule={isEditRule}
          toggleEditRule={toggleIsEditRule}
          propertyName={currentPropertyName}
        />
        {deleteModal}
      </div>
    </>
  );
};

export default MergingStepDetail;
