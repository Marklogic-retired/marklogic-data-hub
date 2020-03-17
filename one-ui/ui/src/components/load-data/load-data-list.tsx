import React, { useState } from 'react';
import styles from './load-data-list.module.scss';
import {Table, Icon, Button, Tooltip, Popover, Modal} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import NewDataLoadDialog from './new-data-load-dialog/new-data-load-dialog';
import { MlButton } from 'marklogic-ui-library';
import { convertDateFromISO } from '../../util/conversionFunctions';
import ActivitySettingsDialog from "../activity-settings/activity-settings-dialog";

interface Props {
    data: any;
    deleteLoadDataArtifact: any;
    createLoadDataArtifact: any;
    canReadWrite: any;
    canReadOnly: any;
  }

const LoadDataList: React.FC<Props> = (props) => {
    const [newDataLoad, setNewDataLoad] = useState(false);
    const [title, setTitle] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loadArtifactName, setLoadArtifactName] = useState('');
    const [stepData,setStepData] = useState({});
    const [openLoadDataSettings, setOpenLoadDataSettings] = useState(false);

    const pageSizeOptions = props.data.length > 40 ? ['10', '20', '30', '40', props.data.length] : ['10', '20', '30', '40'];

    const OpenAddNewDialog = () => {
        setNewDataLoad(true);
        setTitle('New Data Load');
    }

    const OpenEditStepDialog = (record) => {
        setTitle('Edit Data Load');
        setStepData(prevState => ({ ...prevState, ...record}));
        setNewDataLoad(true);
    }

    const OpenLoadDataSettingsDialog = (record) => {
        setStepData(prevState => ({ ...prevState, ...record}));
        //openLoadDataSettings = true;
        setOpenLoadDataSettings(true);
        console.log('Open settings', openLoadDataSettings)
    }

    const showDeleteConfirm = (name) => {
        setDialogVisible(true);
        setLoadArtifactName(name);
    }

    const onOk = (name) => {
        props.deleteLoadDataArtifact(name)
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

    const openSettingsDialog = () => {
        return 'Settings Dialog will be placed here!'
    }

    const columns = [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (text: any,record: any) => (
              <span><span onClick={() => OpenEditStepDialog(record)} className={styles.editLoadConfig}>{text}</span> {record.filesNeedReuploaded ? (
                <Popover
                content={"Files must be reuploaded"}
                trigger="click"
              placement="bottom"
              ><i><FontAwesomeIcon icon={faExclamationCircle} className={styles.popover} size="lg"/></i></Popover>) : ''}</span>
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
                    <Tooltip title={'Settings'} placement="bottom"><Icon type="setting" onClick={() => OpenLoadDataSettingsDialog(row)} className={styles.settingsIcon} /></Tooltip>
                    &nbsp;&nbsp;
                    {props.canReadWrite ? <Tooltip title={'Delete'} placement="bottom"><i><FontAwesomeIcon icon={faTrashAlt} onClick={() => {showDeleteConfirm(row.name)}} className={styles.deleteIcon} size="lg"/></i></Tooltip> :
                    <Tooltip title={'Delete'} placement="bottom"><i><FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i></Tooltip> }
                </span>
            ),

        }
    ];

   return (
    <div className={styles.loaddataContainer}>
        {props.canReadWrite ? <div><MlButton type="primary" size="default" className={styles.addNewButton} onClick={OpenAddNewDialog}>Add New</MlButton></div> : ''}
        <br/><br/>
        <Table
        pagination={{showSizeChanger: true, pageSizeOptions:pageSizeOptions}}
        className={styles.loadTable}
        columns={columns}
        dataSource={props.data}
        rowKey="name"
        />
        <NewDataLoadDialog newLoad={newDataLoad}
        title={title} setNewLoad={setNewDataLoad}
        createLoadDataArtifact={props.createLoadDataArtifact}
        stepData={stepData}
        canReadWrite={props.canReadWrite}
        canReadOnly={props.canReadOnly}/>
        {deleteConfirmation}
        <ActivitySettingsDialog openLoadDataSettings={openLoadDataSettings} setOpenLoadDataSettings={setOpenLoadDataSettings} stepData={stepData} canWrite={props.canReadWrite}/>
    </div>
   );
}

export default LoadDataList;
