import React, {useState, useEffect, useContext} from "react";
import Axios from "axios";
import {useHistory} from "react-router-dom";
import {MLButton} from "@marklogic/design-system";
import styles from "./merging-step-detail.module.scss";
import "./merging-step-detail.scss";
import NumberIcon from "../../../number-icon/number-icon";
import {MLTable, MLTooltip} from "@marklogic/design-system";
import {CurationContext} from "../../../../util/curation-context";
import {
  MergingStep, defaultPriorityOption
} from "../../../../types/curation-types";
import {MergeStrategyTooltips, MergingStepIntros, multiSliderTooltips} from "../../../../config/tooltips.config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt, faCheck} from "@fortawesome/free-solid-svg-icons";
import MergeStrategyDialog from "../merge-strategy-dialog/merge-strategy-dialog";
import MergeRuleDialog from "../add-merge-rule/merge-rule-dialog";
import {RightOutlined, DownOutlined} from "@ant-design/icons";
import {Icon, Modal, Table} from "antd";
import {updateMergingArtifact} from "../../../../api/merging";
import CustomPageHeader from "../../page-header/page-header";
import {clearSessionStorageOnRefresh, getViewSettings, setViewSettings} from "../../../../util/user-context";
import moment from "moment";
import TimelineVisDefault from "../../matching/matching-step-detail/timeline-vis-default/timeline-vis-default";

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
        time = date.format("SSS");
        return moment.duration(time).asMilliseconds();
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

  // Prevents an infinite loop issue with sessionStorage due to user refreshing in step detail page.
  clearSessionStorageOnRefresh();

  const history = useHistory<any>();
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
  const mergeStrategiesData : any = [];
  const mergeRulesData : any = [];
  let commonStrategyNames:any = [];

  useEffect(() => {
    if (Object.keys(curationOptions.activeStep.stepArtifact).length !== 0) {
      const mergingStepArtifact: MergingStep = curationOptions.activeStep.stepArtifact;
      setMergingStep(mergingStepArtifact);
      retrieveCalculatedMergingActivity(mergingStepArtifact);
    } else {
      history.push("/tiles/curate");
    }
  }, [JSON.stringify(curationOptions.activeStep.stepArtifact)]);

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

  const mergeStrategyColumns : any = [
    {
      title: "Strategy Name",
      dataIndex: "strategyName",
      key: "strategyName",
      sorter: (a, b) => a.strategyName.localeCompare(b.strategyName),
      width: 200,
      sortDirections: ["ascend", "descend", "ascend"],
      render: text => {
        return (
          <span className={styles.link}
            id={"strategy-name-link"}
            onClick={ () => editMergeStrategy(text)}>
            {text}</span>
        );
      }
    },
    {
      title: "Max Values",
      dataIndex: "maxValues",
      key: "maxValues",
      sorter: (a, b) => {
        a = a.maxValues || "";
        b = b.maxValues || "";
        return a.localeCompare(b);
      },
      sortDirections: ["ascend", "descend", "ascend"],
      width: 200,
    },
    {
      title: "Max Sources",
      dataIndex: "maxSources",
      key: "maxSources",
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a, b) => {
        a = a.maxSources || "";
        b = b.maxSources || "";
        return a.localeCompare(b);
      },
      width: 200,
    },
    {
      title: "Default",
      dataIndex: "default",
      key: "default",
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a, b) => {
        a = a.maxSources || "";
        b = b.maxSources || "";
        return a.localeCompare(b);
      },
      width: 200,
    },
    {
      title: "Delete",
      dataIndex: "delete",
      key: "delete",
      align: "center" as "center",
      render: text => <a data-testid={"delete"}>{text}</a>,
      width: 75
    }
  ];

  const mergeRuleColumns : any = [
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
      sorter: (a, b) => {
        a = a.property || "";
        b = b.property || "";
        return a.localeCompare(b);
      },
      width: 200,
      sortDirections: ["ascend", "descend", "ascend"],
      render: text => {
        let mergeRuleLabel = text?.split(" > ").join(".");
        return (
          <span className={styles.link}
            id={"property-name-link"}
            onClick={ () => editMergeRule(mergeRuleLabel)}>
            {text}</span>
        );
      }
    },
    {
      title: "Merge Type",
      dataIndex: "mergeType",
      key: "mergeType",
      sorter: (a, b) => {
        a = a.mergeType || "";
        b = b.mergeType || "";
        return a.localeCompare(b);
      },
      sortDirections: ["ascend", "descend", "ascend"],
      width: 200,
    },
    {
      title: "Strategy",
      dataIndex: "strategy",
      key: "strategy",
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a, b) => {
        a = a.strategy || "";
        b = b.strategy || "";
        return a.localeCompare(b);
      },
      width: 200,
    },
    {
      title: "Delete",
      dataIndex: "delete",
      key: "delete",
      align: "center" as "center",
      render: text => <a data-testid={"delete"} >{text}</a>,
      width: 75
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
        delete: <MLTooltip title={commonStrategyNames.indexOf(i["strategyName"]) !==-1 ? MergeStrategyTooltips.delete : ""}>
          <FontAwesomeIcon
            icon={faTrashAlt}
            size="lg"
            className={commonStrategyNames.indexOf(i["strategyName"]) !==-1 ? styles.disabledDeleteIcon : styles.enabledDeleteIcon}
            data-testid={`mergestrategy-${i.strategyName}`}
            onClick={() => onDelete(i)}/>
        </MLTooltip>
      }
    );
  });


  mergingStep && mergingStep.mergeRules.length > 0 && mergingStep.mergeRules.forEach((i) => {
    mergeRulesData.push(
      {
        property: i["entityPropertyPath"]?.split(".").join(" > "),
        mergeType: i["mergeType"],
        strategy: i["mergeStrategyName"],
        delete: <FontAwesomeIcon icon={faTrashAlt} color="#B32424" size="lg"  data-testid={`mergerule-${i.entityPropertyPath}`} onClick={() => onDelete(i)}/>
      }
    );
  });

  const expandedRowRender = (strategyObj) => {
    let priorityOrderStrategyOptions:any[] = [defaultPriorityOption];
    mergingStep.mergeStrategies.map((strategy) => {
      if (strategy.hasOwnProperty("priorityOrder") && strategy.strategyName === strategyObj.strategyName) {
        strategy.priorityOrder.sources.map((key) => {
          const priorityOrderSourceObject = {
            id: strategy.strategyName + ":" + key.sourceName,
            start: key.weight,
            value: "Source" +" - " +key.sourceName + ":" + key.weight.toString(),
          };
          priorityOrderStrategyOptions.push(priorityOrderSourceObject);
        });
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
      <div className={styles.priorityOrderContainer}><p className={styles.priorityText}>Priority Order<MLTooltip title={multiSliderTooltips.priorityOrder} placement="right">
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </MLTooltip></p>
      <div id="strategyText"><MLTooltip title={multiSliderTooltips.viewOnlyTooltip}><div style={{opacity: "60%"}}>
        <div data-testid={"default-priorityOrder-timeline"}><TimelineVisDefault items={priorityOrderStrategyOptions} options={strategyOptions} borderMargin="14px"/></div>
      </div></MLTooltip></div>
      </div>
    </>;
  };

  const deleteModal = (
    <Modal
      width={500}
      visible={deleteModalVisibility}
      destroyOnClose={true}
      closable={false}
      className={styles.confirmModal}
      maskClosable={false}
      footer={null}
    >
      {currentMergeObj.hasOwnProperty("entityPropertyPath") ? <p aria-label="delete-merge-rule-text" className={styles.deleteMessage}>Are you sure you want to delete <b>{currentMergeObj.entityPropertyPath} - {currentMergeObj.mergeType}</b> merge rule ?</p> :
        <p aria-label="delete-merge-strategy-text" className={styles.deleteMessage}>Are you sure you want to delete <b>{currentMergeObj.strategyName}</b> merge strategy ?</p>}
      <div className={styles.footer}>
        <MLButton
          aria-label={`delete-merge-modal-discard`}
          size="default"
          onClick={() => setDeleteModalVisibility(false)}
        >No</MLButton>
        <MLButton
          className={styles.saveButton}
          aria-label={`delete-merge-modal-confirm`}
          type="primary"
          size="default"
          onClick={() => deleteConfirm()}
        >Yes</MLButton>
      </div>
    </Modal>
  );

  const onDelete = (currentObj) => {
    setDeleteModalVisibility(true);
    setCurrentMergeObj(currentObj);
  };

  const deleteConfirm = async() => {
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
          setViewSettings({...storage, curate: {}});
        }}
      />
      <p className={styles.headerDescription}>{MergingStepIntros.main}</p>
      <div className={styles.mergingDetailContainer}>

        <div className={styles.stepNumberContainer}>
          <NumberIcon value={1} />
          <div className={styles.stepText}>Define merge strategies</div>
        </div>
        <div className={styles.greyContainer}>
          <div className={styles.textContainer}>
            <div><p>A <span className={styles.italic}>merge strategy</span><span> defines how to combine the property values of
                            candidate entities, but the merge strategy is not active until assigned to a merge rule.
                            A merge strategy can be assigned to multiple merge rules.</span>
            </p></div>
            <div className={styles.addStrategyButtonContainer}>
              <MLButton aria-label="add-merge-strategy" type="primary" size="default" className={styles.addMergeButton} onClick={() => {
                toggleCreateEditStrategyModal(true);
                toggleIsEditStrategy(false);
                setCurrentStrategyName("");
              }
              }>Add</MLButton>
            </div>
          </div>
          <div>
            <Table
              rowKey="strategyName"
              className={styles.table}
              columns={mergeStrategyColumns}
              dataSource={mergeStrategiesData}
              size="middle"
              expandedRowRender={expandedRowRender}
              expandIcon={(expandProps) => {
                if (expandProps.record.priorityOrder) {
                  return (expandProps.expanded ? (
                    <DownOutlined onClick={e => expandProps.onExpand(expandProps.record, e)} />
                  ) : (
                    <RightOutlined onClick={e => expandProps.onExpand(expandProps.record, e)} />
                  )
                  );
                } else { return (false); }
              }}
              pagination={{hideOnSinglePage: mergeStrategiesData.length <= 10}}
            />
          </div>
        </div>
        <div className={styles.stepNumberContainer}>
          <NumberIcon value={2} />
          <div className={styles.stepText}>Add merge rules</div>
        </div>
        <div className={styles.greyContainer}>
          <div className={styles.textContainer}>
            <div className={styles.mergeDefinition}><p>A <span className={styles.italic}>merge rule</span><span> defines how to combine the values of a specific property</span>
            </p></div>
            <div>
              <MLButton aria-label="add-merge-rule" type="primary" size="default" className={styles.addMergeButton} onClick={() => {
                toggleCreateEditRuleModal(true);
                toggleIsEditRule(false);
                setCurrentPropertyName("");
              }}>Add</MLButton>
            </div>
          </div>
          <MLTable
            rowKey="property"
            className={styles.table}
            columns={mergeRuleColumns}
            dataSource={mergeRulesData}
            size="middle"
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
