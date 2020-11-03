import React, { useState, useEffect } from 'react';
import { Link, useLocation, useHistory } from "react-router-dom";
import styles from './load-list.module.scss';
import './load-list.scss';
import {Table, Icon, Modal, Menu, Select, Dropdown} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import { MLButton } from '@marklogic/design-system';
import  moment  from 'moment';
import { convertDateFromISO } from '../../util/conversionFunctions';
import Steps from "../steps/steps";
import {AdvLoadTooltips, SecurityTooltips} from "../../config/tooltips.config";
import { MLTooltip } from '@marklogic/design-system';

const {Option} = Select;

interface Props {
    data: any;
    flows: any;
    canWriteFlow: any;
    deleteLoadArtifact: any;
    createLoadArtifact: any;
    canReadWrite: any;
    canReadOnly: any;
    addStepToFlow: any;
    addStepToNew: any;
    page: any;
    pageSize: any;
    sortOrderInfo: any;
  }

const LoadList: React.FC<Props> = (props) => {
    const activityType = 'ingestion';
    const location = useLocation<any>();
    const [page, setPage] = useState(props.page);
    const [pageSize, setPageSize] = useState(props.pageSize);
    const [sortedInfo, setSortedInfo] = useState(props.sortOrderInfo);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [addDialogVisible, setAddDialogVisible] = useState(false);
    const [flowName, setFlowName] = useState('');
    const [loadArtifactName, setLoadArtifactName] = useState('');
    const [stepData,setStepData] = useState({});
    const [openStepSettings, setOpenStepSettings] = useState(false);
    const [isNewStep, setIsNewStep] = useState(false);
    const [selected, setSelected] = useState({}); // track Add Step selections so we can reset on cancel
    const [addRun, setAddRun] = useState(false);

    const pageSizeOptions = props.data.length > 40 ? ['10', '20', '30', '40', props.data.length] : ['10', '20', '30', '40'];

    useEffect(() => {
      if (location.state && location.state.stepToView) {
        const stepIndex = props.data.findIndex((step) => step.stepId === location.state.stepToView);
        setPage(Math.floor(stepIndex / pageSize) + 1);
      }else{
        setSortedInfo(props.sortOrderInfo);
        setPage(props.page);
        setPageSize(props.pageSize);
      }
    }, [location, props.data]);

    let history = useHistory();

    const OpenAddNew = () => {
        setIsNewStep(true);
        setOpenStepSettings(true);
    }

    const OpenStepSettings = (record) => {
        setIsNewStep(false);
        setStepData(prevState => ({ ...prevState, ...record}));
        setOpenStepSettings(true);
    }

    const createLoadArtifact = (payload) => {
        // Update local form state, then save to db
        setStepData(prevState => ({ ...prevState, ...payload}));
        props.createLoadArtifact(payload);
    }

    const updateLoadArtifact = (payload) => {
        // Update local form state
        setStepData(prevState => ({ ...prevState, ...payload}));
    }

    const showDeleteConfirm = (name) => {
        setDialogVisible(true);
        setLoadArtifactName(name);
    }

    const onOk = (name) => {
        props.deleteLoadArtifact(name);
        setDialogVisible(false);
    }

    const onCancel = () => {
        setDialogVisible(false);
        setAddDialogVisible(false);
        setSelected({}); // reset menus on cancel
    }

    function handleSelect(obj) {
        let selectedNew = {...selected};
        selectedNew[obj.loadName] = obj.flowName;
        setSelected(selectedNew);
        handleStepAdd(obj.loadName, obj.flowName);
    }

    function handleSelectAddRun(obj) {
        let selectedNew = {...selected};
        selectedNew[obj.loadName] = obj.flowName;
        setSelected(selectedNew);
        setAddRun(true);
        handleStepAdd(obj.loadName, obj.flowName);
    }

    const handleTableChange = (pagination, filter, sorter) => {
        setSortedInfo({columnKey: sorter.columnKey, order: sorter.order});
    }


    const isStepInFlow = (loadName, flowName) => {
        let result = false;
        let flow;
        if (props.flows) flow = props.flows.find(f => f.name === flowName);
        if (flow) result = flow['steps'].findIndex(s => s.stepName === loadName) > -1;
        return result;
    };

    const handleStepAdd = (loadName, flowName) => {
        setLoadArtifactName(loadName);
        setFlowName(flowName);
        setAddDialogVisible(true);
    };

    const onAddOk = async (lName, fName) => {
        await props.addStepToFlow(lName, fName);
        setAddDialogVisible(false);
        if(addRun) {
            history.push({
                pathname: '/tiles/run/add-run',
                state: {
                    flowName: fName,
                    addFlowDirty: true,
                    flowsDefaultKey: [props.flows.findIndex(el => el.name === fName)],
                    existingFlow: true,
                    stepToAdd : loadArtifactName,
                    stepDefinitionType : 'ingestion'
                }
            })
        }else {
            history.push({
                pathname: '/tiles/run/add',
                state: {
                    flowName: fName,
                    addFlowDirty: true,
                    flowsDefaultKey: [props.flows.findIndex(el => el.name === fName)],
                    existingFlow: true
                }
            })
        }
    }

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
            <div aria-label="add-step-confirmation" style={{fontSize: '16px', padding: '10px'}}>
                { isStepInFlow(loadArtifactName, flowName) ?
                    !addRun ? <p aria-label="step-in-flow">The step <strong>{loadArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance?</p> : <p aria-label="step-in-flow-run">The step <strong>{loadArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance and run it?</p>
                    : !addRun ? <p aria-label="step-not-in-flow">Are you sure you want to add the step <strong>{loadArtifactName}</strong> to the flow <strong>{flowName}</strong>?</p> : <p aria-label="step-not-in-flow-run">Are you sure you want to add the step <strong>{loadArtifactName}</strong> to the flow <strong>{flowName}</strong> and run it?</p> 
                }
            </div>
        </Modal>
    );

    const runMenu = (name) => (
        <Menu className={styles.dropdownMenu}>
            <Menu.Item key="0">
                { <Link data-testid="link" id="tiles-run-add" to={
                                        {pathname: '/tiles/run/add-run',
                                        state: {
                                            stepToAdd : name,
                                            stepDefinitionType : 'ingestion',
                                            viewMode: 'list',
                                            pageSize: pageSize,
                                            page: page,
                                            sortOrderInfo: sortedInfo,
                                            existingFlow : false
                                        }}}><div className={styles.stepLink} data-testid={`${name}-run-toNewFlow`}>Run step in a new flow</div></Link>}
            </Menu.Item>
            <Menu.Item key="1">
                <div className={styles.stepLinkExisting} data-testid={`${name}-run-toExistingFlow`}>Run step in an existing flow
                    <div className={styles.stepLinkSelect} onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
                        <Select
                            className={styles.flowSelect}
                            value={selected[name] ? selected[name] : undefined}
                            onChange={(flowName) => handleSelectAddRun({flowName: flowName, loadName: name})}
                            placeholder="Select Flow"
                            defaultActiveFirstOption={false}
                            disabled={!props.canWriteFlow}
                            data-testid={`${name}-run-flowsList`}
                        >
                            { props.flows && props.flows.length > 0 ? props.flows.map((f,i) => (
                                <Option aria-label={`${f.name}-run-option`} value={f.name} key={i}>{f.name}</Option>
                            )) : null}
                        </Select>
                    </div>
                </div>
            </Menu.Item>
        </Menu>
    );

    const menu = (name) => (
        <Menu className={styles.dropdownMenu}>
            <Menu.Item key="0">
                { <Link data-testid="link" id="tiles-run-add" to={
                                        {pathname: '/tiles/run/add',
                                        state: {
                                            stepToAdd : name,
                                            stepDefinitionType : 'ingestion',
                                            viewMode: 'list',
                                            pageSize: pageSize,
                                            page: page,
                                            sortOrderInfo: sortedInfo,
                                            existingFlow : false
                                        }}}><div className={styles.stepLink} data-testid={`${name}-toNewFlow`}>Add step to a new flow</div></Link>}
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
                            { props.flows && props.flows.length > 0 ? props.flows.map((f,i) => (
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
        <span style={{ fontSize: '16px' }}>Are you sure you want to delete the <strong>{loadArtifactName}</strong> step?</span>
    </Modal>;

    const columns: any = [
        {
          title: <span data-testid="loadTableName">Name</span>,
          dataIndex: 'name',
          key: 'name',
          render: (text: any,record: any) => (
              <span><span onClick={() => OpenStepSettings(record)} className={styles.editLoadConfig}>{text}</span> </span>
          ),
          sortDirections: ["ascend", "descend", "ascend"],
          sorter: (a:any, b:any) => a.name.localeCompare(b.name),
          sortOrder: (sortedInfo && sortedInfo.columnKey === 'name') ? sortedInfo.order : '',
        },
        {
          title: <span data-testid="loadTableDescription">Description</span>,
          dataIndex: 'description',
          key: 'description',
          sortDirections: ["ascend", "descend", "ascend"],
          sorter: (a:any, b:any) => a.description?.localeCompare(b.description),
          sortOrder: (sortedInfo && sortedInfo.columnKey === 'description') ? sortedInfo.order : '',
        },
        {
            title: <span data-testid="loadTableSourceFormat">Source Format</span>,
            dataIndex: 'sourceFormat',
            key: 'sourceFormat',
            render: (text, row) => (
                <div>
                    <div>{text === 'csv' ? 'Delimited Text' : text}</div>
                    {row.sourceFormat === 'csv' ? <div className={styles.sourceFormatFS}>Field Separator: ( {row.separator} )</div> : ''}
                </div>
            ),
            sortDirections: ["ascend", "descend", "ascend"],
            sorter: (a:any, b:any) => a.sourceFormat.localeCompare(b.sourceFormat),
            sortOrder: (sortedInfo && sortedInfo.columnKey === 'sourceFormat') ? sortedInfo.order : '',
        },
        {
            title: <span data-testid="loadTableTargetFormat">Target Format</span>,
            dataIndex: 'targetFormat',
            key: 'targetFormat',
            sortDirections: ["ascend", "descend", "ascend"],
            sorter: (a:any, b:any) => a.targetFormat.localeCompare(b.targetFormate),
            sortOrder: (sortedInfo && sortedInfo.columnKey === 'targetFormat') ? sortedInfo.order : '',
        },
        {
            title: <span data-testid="loadTableDate">Last Updated</span>,
            dataIndex: 'lastUpdated',
            key: 'lastUpdated',
            render: (text) => (
                <div>{convertDateFromISO(text)}</div>
            ),
            sortDirections: ["ascend", "descend", "ascend"],
            sorter: (a:any, b:any) => moment(a.lastUpdated).unix() - moment(b.lastUpdated).unix(),
            defaultSortOrder: "descend",
            sortOrder: (sortedInfo && sortedInfo.columnKey === 'lastUpdated') ? sortedInfo.order : 'descend',
        },
        {
            title: 'Action',
            dataIndex: 'actions',
            key: 'actions',
            render: (text, row) => (
                <span>
                    <Dropdown data-testid={`${row.name}-run-dropdown`} overlay={runMenu(row.name)} trigger={['click']} disabled = {!props.canWriteFlow} placement="bottomCenter">    
                        {props.canReadWrite ?<MLTooltip title={'Run'} placement="bottom"><i aria-label="icon: run"><Icon type="play-circle" theme="filled" className={styles.runIcon} data-testid={row.name+'-run'}/></i></MLTooltip> : <MLTooltip title={'Run: ' + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: '200px'}}><i role="disabled-run-load button" data-testid={row.name+'-disabled-run'}><Icon type="play-circle" theme="filled" onClick={(event) => event.preventDefault()} className={styles.disabledRunIcon}/></i></MLTooltip>}
                    </Dropdown>
                    <Dropdown data-testid={`${row.name}-dropdown`} overlay={menu(row.name)} trigger={['click']} disabled = {!props.canWriteFlow} placement="bottomCenter">
                        {props.canWriteFlow ? <MLTooltip title={'Add to Flow'} placement="bottom"><span className={'AddToFlowIcon'} aria-label = {row.name+'-add-icon'}></span></MLTooltip> : <MLTooltip title={'Add to Flow: ' + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: '225px'}}><span aria-label = {row.name+'-disabled-add-icon'} className={'disabledAddToFlowIcon'}></span></MLTooltip>}
                    </Dropdown>
                    {/* <MLTooltip title={'Settings'} placement="bottom"><Icon type="setting" data-testid={row.name+'-settings'} onClick={() => OpenLoadSettingsDialog(row)} className={styles.settingsIcon} /></MLTooltip> */}
                    &nbsp;
                    {props.canReadWrite ? <MLTooltip title={'Delete'} placement="bottom"><i aria-label="icon: delete"><FontAwesomeIcon icon={faTrashAlt} data-testid={row.name+'-delete'} onClick={() => {showDeleteConfirm(row.name)}} className={styles.deleteIcon} size="lg"/></i></MLTooltip> :
                    <MLTooltip title={'Delete: ' + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: '200px'}}><i aria-label="icon: delete"><FontAwesomeIcon icon={faTrashAlt} data-testid={row.name+'-disabled-delete'} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i></MLTooltip> }
                </span>
            ),

        }
    ];

    // need special handlePagination for direct links to load steps that can be on another page
    const handlePagination = (page) => {
        setPage(page);
    };

    const handlePageSizeChange = (pageSize) => {
        setPageSize(pageSize);
    }

    return (
    <div id="load-list" aria-label="load-list" className={styles.loadList}>
        <div className={styles.addNewContainer}>
            {props.canReadWrite ? <div>
                <MLButton aria-label="add-new-list" type="primary" size="default" className={styles.addNewButton} onClick={OpenAddNew}>Add New</MLButton>
            </div> : ''}
        </div>
        <Table
            pagination={{showSizeChanger: true, pageSizeOptions:pageSizeOptions, onChange: handlePagination, onShowSizeChange: handlePageSizeChange, defaultCurrent: page, current: page, pageSize: pageSize}}
            className={styles.loadTable}
            columns={columns}
            dataSource={props.data}
            rowKey="name"
            onChange={handleTableChange}
        />
        {deleteConfirmation}
        {addConfirmation}
        <Steps
            // Basic Settings
            isNewStep={isNewStep}
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
