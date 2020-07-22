import React, { useState, useEffect } from 'react';
import { Link, useLocation, useHistory } from "react-router-dom";
import styles from './load-list.module.scss';
import './load-list.scss';
import {Table, Icon, Button, Tooltip, Popover, Modal, Menu, Select, Dropdown} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import NewLoadDialog from './new-load-dialog/new-load-dialog';
import { MLButton } from '@marklogic/design-system';
import { convertDateFromISO } from '../../util/conversionFunctions';
import AdvancedSettingsDialog from "../advanced-settings/advanced-settings-dialog";
import {AdvLoadTooltips} from "../../config/tooltips.config";
import { MLTooltip } from '@marklogic/design-system';
import { OmitProps } from 'antd/lib/transfer/renderListBody';

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
  }

const LoadList: React.FC<Props> = (props) => {
    const activityType = 'ingestion';
    const location = useLocation<any>();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [newDataLoad, setNewDataLoad] = useState(false);
    const [title, setTitle] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [addDialogVisible, setAddDialogVisible] = useState(false);
    const [flowName, setFlowName] = useState('');
    const [loadArtifactName, setLoadArtifactName] = useState('');
    const [stepData,setStepData] = useState({});
    const [openLoadSettings, setOpenLoadSettings] = useState(false);

    const pageSizeOptions = props.data.length > 40 ? ['10', '20', '30', '40', props.data.length] : ['10', '20', '30', '40'];

    useEffect(() => {
      if (location.state && location.state.stepToView) {
        const stepIndex = props.data.findIndex((step) => step.stepId === location.state.stepToView);
        setPage(Math.floor(stepIndex / pageSize) + 1);
      }
    }, [location, props.data]);

    let history = useHistory();

    const OpenAddNewDialog = () => {
        setNewDataLoad(true);
        setTitle('New Loading Step');
    }

    const OpenEditStepDialog = (record) => {
        setTitle('Edit Loading Step');
        setStepData(prevState => ({ ...prevState, ...record}));
        setNewDataLoad(true);
    }

    const OpenLoadSettingsDialog = (record) => {
        setStepData(prevState => ({ ...prevState, ...record}));
        setOpenLoadSettings(true);
    }

    const showDeleteConfirm = (name) => {
        setDialogVisible(true);
        setLoadArtifactName(name);
    }

    const onOk = (name) => {
        props.deleteLoadArtifact(name)
        setDialogVisible(false);
    }

    const onCancel = () => {
        setDialogVisible(false);
        setAddDialogVisible(false);
    }


    function handleSelect(obj) {
        handleStepAdd(obj.loadName, obj.flowName);
    }


    const handleStepAdd = (loadName, flowName) => {
        setAddDialogVisible(true);
        setLoadArtifactName(loadName);
        setFlowName(flowName);
    }

    const onAddOk = async (lName, fName) => {
        await props.addStepToFlow(lName, fName)
        setAddDialogVisible(false);

        history.push({
            pathname: '/tiles/run/add',
            state: {
                flowName: fName,
                flowsDefaultKey: [props.flows.findIndex(el => el.name === fName)],
                existingFlow: true
            }
        })
    }

    const addConfirmation = (
        <Modal
            visible={addDialogVisible}
            okText={<div aria-label="Yes">Yes</div>}
            cancelText={<div aria-label="No">No</div>}
            onOk={() => onAddOk(loadArtifactName, flowName)}
            onCancel={() => onCancel()}
            width={350}
            maskClosable={false}
        >
            <div style={{fontSize: '16px', padding: '10px'}}>
                Are you sure you want to add "{loadArtifactName}" to flow "{flowName}"?
            </div>
        </Modal>
    );

    const menu = (name) => (
        <Menu style={{right: '80px'}}>
            <Menu.Item key="0">
                { <Link data-testid="link" id="tiles-run-add" to={
                                        {pathname: '/tiles/run/add',
                                        state: {
                                            stepToAdd : name,
                                            stepDefinitionType : 'ingestion',
                                            existingFlow : false
                                        }}}><div className={styles.stepLink} data-testid={`${name}-toNewFlow`}>Add step to a new flow</div></Link>}
            </Menu.Item>
            <Menu.Item key="1">
                <div className={styles.stepLinkExisting} data-testid={`${name}-toExistingFlow`}>Add step to an existing flow
                    <div className={styles.stepLinkSelect} onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
                        <Select
                            style={{ width: '100%' }}
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
        <span style={{ fontSize: '16px' }}>Are you sure you want to delete this?</span>
    </Modal>;

    const columns = [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (text: any,record: any) => (
              <span><span onClick={() => OpenEditStepDialog(record)} className={styles.editLoadConfig}>{text}</span> </span>
          ),
          sorter: (a:any, b:any) => a.name.length - b.name.length,
        },
        {
          title: 'Description',
          dataIndex: 'description',
          key: 'description',
          sorter: (a:any, b:any) => a.description.length - b.description.length,
        },
        {
            title: 'Source Format',
            dataIndex: 'sourceFormat',
            key: 'sourceFormat',
            render: (text, row) => (
                <div>
                    <div>{text === 'csv' ? 'Delimited Text' : text}</div>
                    {row.sourceFormat === 'csv' ? <div className={styles.sourceFormatFS}>Field Separator: ( {row.separator} )</div> : ''}
                </div>
            ),
            sorter: (a:any, b:any) => a.sourceFormat.length - b.sourceFormat.length,
        },
        {
            title: 'Target Format',
            dataIndex: 'targetFormat',
            key: 'targetFormat',
            sorter: (a:any, b:any) => a.targetFormat.length - b.targetFormat.length,
        },
        {
            title: 'Last Updated',
            dataIndex: 'lastUpdated',
            key: 'lastUpdated',
            render: (text) => (
                <div>{convertDateFromISO(text)}</div>
            ),
            sorter: (a:any, b:any) => a.lastUpdated.length - b.lastUpdated.length,
        },
        {
            title: 'Action',
            dataIndex: 'actions',
            key: 'actions',
            render: (text, row) => (
                <span>
                    <Dropdown data-testid={`${row.name}-dropdown`} overlay={menu(row.name)} trigger={['hover']} disabled = {!props.canWriteFlow}>
                        {props.canWriteFlow ? <span className={'AddToFlowIcon'} aria-label = {row.name+'-add-icon'}></span> : <MLTooltip title={'Add to Flow'} placement="bottom"><span aria-label = {row.name+'-disabled-add-icon'} className={'disabledAddToFlowIcon'}></span></MLTooltip>}
                    </Dropdown>
                    <MLTooltip title={'Settings'} placement="bottom"><Icon type="setting" data-testid={row.name+'-settings'} onClick={() => OpenLoadSettingsDialog(row)} className={styles.settingsIcon} /></MLTooltip>
                    &nbsp;&nbsp;
                    {props.canReadWrite ? <MLTooltip title={'Delete'} placement="bottom"><i aria-label="icon: delete"><FontAwesomeIcon icon={faTrashAlt} data-testid={row.name+'-delete'} onClick={() => {showDeleteConfirm(row.name)}} className={styles.deleteIcon} size="lg"/></i></MLTooltip> :
                    <MLTooltip title={'Delete'} placement="bottom"><i aria-label="icon: delete"><FontAwesomeIcon icon={faTrashAlt} data-testid={row.name+'-disabled-delete'} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i></MLTooltip> }
                </span>
            ),

        }
    ];

    // need special handlePagination for direct links to load steps that can be on another page
    const handlePagination = (page, pageSize) => {
      setPage(page);
      setPageSize(pageSize);
    };
    return (
    <div id="load-list" aria-label="load-list" className={styles.loadList}>
        <div className={styles.addNewContainer}>
            {props.canReadWrite ? <div>
                <MLButton aria-label="add-new-list" type="primary" size="default" className={styles.addNewButton} onClick={OpenAddNewDialog}>Add New</MLButton>
            </div> : ''}
        </div>
        <Table
            pagination={{showSizeChanger: true, pageSizeOptions:pageSizeOptions, onChange: handlePagination, defaultCurrent: page, current: page}}
            className={styles.loadTable}
            columns={columns}
            dataSource={props.data}
            rowKey="name"
        />
        <NewLoadDialog
            newLoad={newDataLoad}
            title={title} setNewLoad={setNewDataLoad}
            createLoadArtifact={props.createLoadArtifact}
            stepData={stepData}
            canReadWrite={props.canReadWrite}
            canReadOnly={props.canReadOnly}
        />
        {deleteConfirmation}
        <AdvancedSettingsDialog
            tooltipData={AdvLoadTooltips}
            activityType={activityType}
            openAdvancedSettings={openLoadSettings}
            setOpenAdvancedSettings={setOpenLoadSettings}
            stepData={stepData}
            canWrite={props.canReadWrite}
        />
        {addConfirmation}
    </div>
   );
}

export default LoadList;
