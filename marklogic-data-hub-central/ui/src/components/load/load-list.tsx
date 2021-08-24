import React, {useState, useEffect, useContext} from "react";
import {Link, useLocation, useHistory} from "react-router-dom";
import styles from "./load-list.module.scss";
import "./load-list.scss";
import {Table, Icon, Modal, Menu, Select, Divider, Dropdown, Button, Tooltip} from "antd";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import moment from "moment";
import {convertDateFromISO} from "../../util/conversionFunctions";
import Steps from "../steps/steps";
import {AdvLoadTooltips, SecurityTooltips} from "../../config/tooltips.config";
import {LoadingContext} from "../../util/loading-context";
import {getViewSettings, setViewSettings} from "../../util/user-context";

const {Option} = Select;

interface Props {
  data: any;
  flows: any;
  canWriteFlow: any;
  deleteLoadArtifact: any;
  createLoadArtifact: any;
  updateLoadArtifact: any;
  canReadWrite: any;
  canReadOnly: any;
  addStepToFlow: any;
  addStepToNew: any;
  sortOrderInfo: any;
}

const LoadList: React.FC<Props> = (props) => {
  const storage = getViewSettings();
  const storedSortOrder = storage?.load?.sortOrder;

  const {
    loadingOptions,
    setPage,
    setPageSize
  } = useContext(LoadingContext);

  const activityType = "ingestion";
  const location = useLocation<any>();
  const [sortedInfo, setSortedInfo] = useState(storedSortOrder ? storedSortOrder : {});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [runNoFlowsDialogVisible, setRunNoFlowsDialogVisible] = useState(false);
  const [runOneFlowDialogVisible, setRunOneFlowDialogVisible] = useState(false);
  const [runMultFlowsDialogVisible, setRunMultFlowsDialogVisible] = useState(false);
  const [flowsWithStep, setFlowsWithStep] = useState<any[]>([]);
  const [flowName, setFlowName] = useState("");
  const [loadArtifactName, setLoadArtifactName] = useState("");
  const [stepData, setStepData] = useState({});
  const [openStepSettings, setOpenStepSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState({}); // track Add Step selections so we can reset on cancel

  const pageSizeOptions = props.data.length > 40 ? ["10", "20", "30", "40", props.data.length] : ["10", "20", "30", "40"];

  useEffect(() => {
    if (location.state && location.state.stepToView) {
      const stepIndex = props.data.findIndex((step) => step.stepId === location.state.stepToView);
      setPage(Math.floor(stepIndex / loadingOptions.pageSize) + 1);
    } else {
      setSortedInfo(storedSortOrder ? storedSortOrder : {});
    }
  }, [location, props.data]);

  useEffect(() => {
    if (sortedInfo === null) {
      return;
    }
    const sortStorage = getViewSettings();
    const newStorage = {...sortStorage, load: {...sortStorage.load, sortOrder: {...sortStorage.load?.sortOrder, columnKey: sortedInfo.columnKey, order: sortedInfo.order}}};
    setViewSettings(newStorage);
  }, [sortedInfo]);

  let history = useHistory();

  const OpenAddNew = () => {
    setIsEditing(false);
    setOpenStepSettings(true);
  };

  const OpenStepSettings = (record) => {
    setIsEditing(true);
    setStepData(prevState => ({...prevState, ...record}));
    setOpenStepSettings(true);
  };

  const createLoadArtifact = (payload) => {
    // Update local form state, then save to db
    setStepData(prevState => ({...prevState, ...payload}));
    props.createLoadArtifact(payload);
  };

  const updateLoadArtifact = (payload) => {
    // Update local form state
    setStepData(prevState => ({...prevState, ...payload}));
    props.updateLoadArtifact(payload);
  };

  const showDeleteConfirm = (name) => {
    setDialogVisible(true);
    setLoadArtifactName(name);
  };

  const onOk = (name) => {
    props.deleteLoadArtifact(name);
    setDialogVisible(false);
  };

  const onCancel = () => {
    setDialogVisible(false);
    setAddDialogVisible(false);
    setRunNoFlowsDialogVisible(false);
    setRunOneFlowDialogVisible(false);
    setRunMultFlowsDialogVisible(false);
    setSelected({}); // reset menus on cancel
  };

  function handleSelect(obj) {
    let selectedNew = {...selected};
    selectedNew[obj.loadName] = obj.flowName;
    setSelected(selectedNew);
    handleStepAdd(obj.loadName, obj.flowName);
  }

  const handleTableChange = (pagination, filter, sorter) => {
    setSortedInfo({columnKey: sorter.columnKey, order: sorter.order});
  };


  const isStepInFlow = (loadName, flowName) => {
    let result = false;
    let flow;
    if (props.flows) flow = props.flows.find(f => f.name === flowName);
    if (flow) result = flow["steps"].findIndex(s => s.stepName === loadName) > -1;
    return result;
  };

  const countStepInFlow = (loadName) => {
    let result: string[] = [];
    if (props.flows) props.flows.forEach(f => f["steps"].findIndex(s => s.stepName === loadName) > -1 ? result.push(f.name) : "");
    return result;
  };

  const handleStepAdd = (loadName, flowName) => {
    setLoadArtifactName(loadName);
    setFlowName(flowName);
    setAddDialogVisible(true);
  };

  const handleStepRun = (loadName) => {
    setLoadArtifactName(loadName);
    let stepInFlows = countStepInFlow(loadName);
    setFlowsWithStep(stepInFlows);
    if (stepInFlows.length > 1) {
      setRunMultFlowsDialogVisible(true);
    } else if (stepInFlows.length === 1) {
      setRunOneFlowDialogVisible(true);
    } else {
      setRunNoFlowsDialogVisible(true);
    }
  };

  const handleAddRun = async (flowName) => {
    await props.addStepToFlow(loadArtifactName, flowName, "ingestion");
    setRunNoFlowsDialogVisible(false);

    history.push({
      pathname: "/tiles/run/add-run",
      state: {
        flowName: flowName,
        flowsDefaultKey: [props.flows.findIndex(el => el.name === flowName)],
        existingFlow: true,
        addFlowDirty: true,
        stepToAdd: loadArtifactName,
        stepDefinitionType: "ingestion"
      }
    });
  };

  const onContinueRun = () => {
    history.push({
      pathname: "/tiles/run/run-step",
      state: {
        flowName: flowsWithStep[0],
        stepToAdd: loadArtifactName,
        stepDefinitionType: "ingestion",
        existingFlow: false,
        flowsDefaultKey: [props.flows.findIndex(el => el.name === flowsWithStep[0])],
      }
    });
  };

  const onAddOk = async (lName, fName) => {
    await props.addStepToFlow(lName, fName);
    setAddDialogVisible(false);
    history.push({
      pathname: "/tiles/run/add",
      state: {
        flowName: fName,
        addFlowDirty: true,
        flowsDefaultKey: [props.flows.findIndex(el => el.name === fName)],
        existingFlow: true
      }
    });
  };

  const addConfirmation = (
    <Modal
      visible={addDialogVisible}
      okText={<div aria-label="Yes" data-testid={`${loadArtifactName}-to-${flowName}-Confirm`}>Yes</div>}
      cancelText={<div aria-label="No">No</div>}
      onOk={() => onAddOk(loadArtifactName, flowName)}
      onCancel={() => onCancel()}
      width={400}
      maskClosable={false}
    >
      <div aria-label="add-step-confirmation" style={{fontSize: "16px", padding: "10px"}}>
        {isStepInFlow(loadArtifactName, flowName) ?
          <p aria-label="step-in-flow">The step <strong>{loadArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance?</p> :
          <p aria-label="step-not-in-flow">Are you sure you want to add the step <strong>{loadArtifactName}</strong> to the flow <strong>{flowName}</strong>?</p>
        }
      </div>
    </Modal>
  );

  const runNoFlowsConfirmation = (
    <Modal
      visible={runNoFlowsDialogVisible}
      cancelText="Cancel"
      okButtonProps={{style: {display: "none"}}}
      onCancel={() => onCancel()}
      cancelButtonProps={{"aria-label": "Cancel"}}
      width={650}
      maskClosable={false}
    >
      <div aria-label="step-in-no-flows-confirmation" style={{fontSize: "16px"}}> Choose the flow in which to add and run the step <strong>{loadArtifactName}</strong>.</div>
      <Row className={"pt-4"}>
        <Col>
          <div>{props.flows?.map((flow, i) => (
            <p className={styles.stepLink} data-testid={`${flow.name}-run-step`} key={i} onClick={() => handleAddRun(flow.name)}>{flow.name}</p>
          ))}</div>
        </Col>
        <Col xs={"auto"}>
          <Divider type="vertical" className={styles.verticalDiv}></Divider>
        </Col>
        <Col>
          <Link data-testid="link" id="tiles-add-run-new-flow" to={
            {
              pathname: "/tiles/run/add-run",
              state: {
                stepToAdd: loadArtifactName,
                stepDefinitionType: "ingestion",
                existingFlow: false
              }
            }}><div className={styles.stepLink} data-testid={`${loadArtifactName}-run-toNewFlow`}><Icon type="plus-circle" className={styles.plusIconNewFlow} theme="filled" />New flow</div></Link>
        </Col>
      </Row>
    </Modal>
  );

  const runOneFlowConfirmation = (
    <Modal
      visible={runOneFlowDialogVisible}
      okText={<div aria-label="continue-confirm">Continue</div>}
      onOk={() => onContinueRun()}
      cancelText="Cancel"
      onCancel={() => onCancel()}
      width={650}
      maskClosable={false}
    >
      <div aria-label="run-step-one-flow-confirmation" style={{fontSize: "16px", padding: "10px"}}>
        <div>
          <div aria-label="step-in-one-flow">Running the step <strong>{loadArtifactName}</strong> in the flow <strong>{flowsWithStep}</strong></div>
        </div>
      </div>
    </Modal>
  );

  const runMultFlowsConfirmation = (
    <Modal
      visible={runMultFlowsDialogVisible}
      cancelText="Cancel"
      okButtonProps={{style: {display: "none"}}}
      onCancel={() => onCancel()}
      width={650}
      maskClosable={false}
    >
      <div aria-label="run-step-mult-flows-confirmation" style={{fontSize: "16px", padding: "10px"}}>
        <div aria-label="step-in-mult-flows">Choose the flow in which to run the step <strong>{loadArtifactName}</strong>.</div>
        <div className={styles.flowSelectGrid}>{flowsWithStep.map((flowName, i) => (
          <Link data-testid="link" id="tiles-run-step" key={i} to={
            {
              pathname: "/tiles/run/run-step",
              state: {
                flowName: flowName,
                stepToAdd: loadArtifactName,
                stepDefinitionType: "ingestion",
                existingFlow: false,
                flowsDefaultKey: [props.flows.findIndex(el => el.name === flowName)],
              }
            }}><p className={styles.stepLink} data-testid={`${flowName}-run-step`}>{flowName}</p></Link>
        ))}
        </div>
      </div>
    </Modal>
  );

  const menu = (name) => (
    <Menu className={styles.dropdownMenu}>
      <Menu.Item key="0">
        {<Link data-testid="link" id="tiles-run-add" to={
          {
            pathname: "/tiles/run/add",
            state: {
              stepToAdd: name,
              stepDefinitionType: "ingestion",
              viewMode: "list",
              pageSize: loadingOptions.pageSize,
              page: loadingOptions.pageNumber,
              sortOrderInfo: sortedInfo,
              existingFlow: false
            }
          }}><div className={styles.stepLink} data-testid={`${name}-toNewFlow`}>Add step to a new flow</div></Link>}
      </Menu.Item>
      <Menu.Item key="1">
        <div className={styles.stepLinkExisting} data-testid={`${name}-toExistingFlow`}>Add step to an existing flow
          <div className={styles.stepLinkSelect} onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
            <Select
              className={styles.flowSelect}
              value={selected[name] ? selected[name] : undefined}
              onChange={(flowName) => handleSelect({flowName: flowName, loadName: name})}
              placeholder="Select Flow"
              defaultActiveFirstOption={false}
              disabled={!props.canWriteFlow}
              data-testid={`${name}-flowsList`}
            >
              {props.flows && props.flows.length > 0 ? props.flows.map((f, i) => (
                <Option aria-label={f.name} value={f.name} key={i}>{f.name}</Option>
              )) : null}
            </Select>
          </div>
        </div>
      </Menu.Item>
    </Menu>
  );


  const deleteConfirmation = <Modal
    visible={dialogVisible}
    okText={<div aria-label="Yes">Yes</div>}
    cancelText={<div aria-label="No">No</div>}
    onOk={() => onOk(loadArtifactName)}
    onCancel={() => onCancel()}
    width={350}
    maskClosable={false}
    destroyOnClose={true}
  >
    <span style={{fontSize: "16px"}}>Are you sure you want to delete the <strong>{loadArtifactName}</strong> step?</span>
  </Modal>;

  const columns: any = [
    {
      title: <span data-testid="loadTableName">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text: any, record: any) => (
        <span><span onClick={() => OpenStepSettings(record)} className={styles.editLoadConfig}>{text}</span> </span>
      ),
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      sortOrder: (sortedInfo && sortedInfo.columnKey === "name") ? sortedInfo.order : "",
    },
    {
      title: <span data-testid="loadTableDescription">Description</span>,
      dataIndex: "description",
      key: "description",
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a: any, b: any) => a.description?.localeCompare(b.description),
      sortOrder: (sortedInfo && sortedInfo.columnKey === "description") ? sortedInfo.order : "",
    },
    {
      title: <span data-testid="loadTableSourceFormat">Source Format</span>,
      dataIndex: "sourceFormat",
      key: "sourceFormat",
      render: (text, row) => (
        <div>
          <div>{text === "csv" ? "Delimited Text" : text}</div>
          {row.sourceFormat === "csv" ? <div className={styles.sourceFormatFS}>Field Separator: ( {row.separator} )</div> : ""}
        </div>
      ),
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a: any, b: any) => a.sourceFormat.localeCompare(b.sourceFormat),
      sortOrder: (sortedInfo && sortedInfo.columnKey === "sourceFormat") ? sortedInfo.order : "",
    },
    {
      title: <span data-testid="loadTableTargetFormat">Target Format</span>,
      dataIndex: "targetFormat",
      key: "targetFormat",
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a: any, b: any) => a.targetFormat.localeCompare(b.targetFormate),
      sortOrder: (sortedInfo && sortedInfo.columnKey === "targetFormat") ? sortedInfo.order : "",
    },
    {
      title: <span data-testid="loadTableDate">Last Updated</span>,
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      render: (text) => (
        <div>{convertDateFromISO(text)}</div>
      ),
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a: any, b: any) => moment(a.lastUpdated).unix() - moment(b.lastUpdated).unix(),
      defaultSortOrder: "descend",
      sortOrder: (sortedInfo && sortedInfo.columnKey === "lastUpdated") ? sortedInfo.order : "descend",
    },
    {
      title: "Action",
      dataIndex: "actions",
      key: "actions",
      render: (text, row) => (
        <span>
          {props.canReadWrite ? <Tooltip title={"Run"} placement="bottom"><i aria-label="icon: run"><Icon type="play-circle" theme="filled" className={styles.runIcon} data-testid={row.name + "-run"} onClick={() => handleStepRun(row.name)} /></i></Tooltip> : <Tooltip title={"Run: " + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: "200px"}}><i role="disabled-run-load-list button" data-testid={row.name + "-disabled-run"}><Icon type="play-circle" theme="filled" onClick={(event) => event.preventDefault()} className={styles.disabledRunIcon} /></i></Tooltip>}
          <Dropdown data-testid={`${row.name}-dropdown`} overlay={menu(row.name)} trigger={["click"]} disabled={!props.canWriteFlow} placement="bottomCenter">
            {props.canWriteFlow ? <Tooltip title={"Add to Flow"} placement="bottom"><span className={"AddToFlowIcon"} aria-label={row.name + "-add-icon"}></span></Tooltip> : <Tooltip title={"Add to Flow: " + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: "225px"}}><span aria-label={row.name + "-disabled-add-icon"} className={"disabledAddToFlowIcon"}></span></Tooltip>}
          </Dropdown>
          {/* <Tooltip title={'Settings'} placement="bottom"><Icon type="setting" data-testid={row.name+'-settings'} onClick={() => OpenLoadSettingsDialog(row)} className={styles.settingsIcon} /></Tooltip> */}
                    &nbsp;
          {props.canReadWrite ? <Tooltip title={"Delete"} placement="bottom"><i aria-label="icon: delete"><FontAwesomeIcon icon={faTrashAlt} data-testid={row.name + "-delete"} onClick={() => { showDeleteConfirm(row.name); }} className={styles.deleteIcon} size="lg" /></i></Tooltip> :
            <Tooltip title={"Delete: " + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: "200px"}}><i aria-label="icon: delete"><FontAwesomeIcon icon={faTrashAlt} data-testid={row.name + "-disabled-delete"} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg" /></i></Tooltip>}
        </span>
      ),

    }
  ];

  // need special handlePagination for direct links to load steps that can be on another page
  const handlePagination = (page) => {
    setPage(page);
  };

  const handlePageSizeChange = (current, pageSize) => {
    setPageSize(current, pageSize);
  };

  return (
    <div id="load-list" aria-label="load-list" className={styles.loadList}>
      <div className={styles.addNewContainer}>
        {props.canReadWrite ? <div>
          <Button aria-label="add-new-list" type="primary" size="default" className={styles.addNewButton} onClick={OpenAddNew}>Add New</Button>
        </div> : ""}
      </div>
      <Table
        pagination={{hideOnSinglePage: props.data.length <= 10, showSizeChanger: true, pageSizeOptions: pageSizeOptions, onChange: handlePagination, onShowSizeChange: handlePageSizeChange, defaultCurrent: loadingOptions.start, current: loadingOptions.pageNumber, pageSize: loadingOptions.pageSize}}
        className={styles.loadTable}
        columns={columns}
        dataSource={props.data}
        rowKey="name"
        onChange={handleTableChange}
      />
      {deleteConfirmation}
      {addConfirmation}
      {runNoFlowsConfirmation}
      {runOneFlowConfirmation}
      {runMultFlowsConfirmation}
      <Steps
        // Basic Settings
        isEditing={isEditing}
        createStep={createLoadArtifact}
        stepData={stepData}
        canReadOnly={props.canReadOnly}
        canReadWrite={props.canReadWrite}
        canWrite={props.canReadWrite}
        // Advanced Settings
        tooltipsData={AdvLoadTooltips}
        openStepSettings={openStepSettings}
        setOpenStepSettings={setOpenStepSettings}
        updateStep={updateLoadArtifact}
        activityType={activityType}
      />
    </div>
  );
};

export default LoadList;
