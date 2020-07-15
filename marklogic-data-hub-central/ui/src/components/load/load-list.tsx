import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import styles from './load-list.module.scss';
import {Table, Icon, Button, Tooltip, Popover, Modal} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import NewLoadDialog from './new-load-dialog/new-load-dialog';
import { MLButton } from '@marklogic/design-system';
import { convertDateFromISO } from '../../util/conversionFunctions';
import AdvancedSettingsDialog from "../advanced-settings/advanced-settings-dialog";
import {AdvLoadTooltips} from "../../config/tooltips.config";
import { MLTooltip } from '@marklogic/design-system';


interface Props {
    data: any;
    deleteLoadArtifact: any;
    createLoadArtifact: any;
    canReadWrite: any;
    canReadOnly: any;
  }

const LoadList: React.FC<Props> = (props) => {
    const activityType = 'ingestion';
    const location = useLocation<any>();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [newDataLoad, setNewDataLoad] = useState(false);
    const [title, setTitle] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
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
    }

    const deleteConfirmation = <Modal
        visible={dialogVisible}
        okText='Yes'
        cancelText='No'
        onOk={() => onOk(loadArtifactName)}
        onCancel={() => onCancel()}
        width={350}
        maskClosable={false}
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
                    <MLTooltip title={'Settings'} placement="bottom"><Icon type="setting" data-testid={row.name+'-settings'} onClick={() => OpenLoadSettingsDialog(row)} className={styles.settingsIcon} /></MLTooltip>
                    &nbsp;&nbsp;
                    {props.canReadWrite ? <MLTooltip title={'Delete'} placement="bottom"><i aria-label="icon: delete"><FontAwesomeIcon icon={faTrashAlt} data-testid={row.name+'-delete'} onClick={() => {showDeleteConfirm(row.name)}} className={styles.deleteIcon} size="lg"/></i></MLTooltip> :
                    <MLTooltip title={'Delete'} placement="bottom"><i aria-label="icon: delete"><FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i></MLTooltip> }
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
    </div>
   );
}

export default LoadList;
