import React, { CSSProperties, useState } from 'react';
import styles from './load-data-card.module.scss';
import {Card, Icon, Tooltip, Popover, Row, Col, Modal} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import sourceFormatOptions from '../../config/formats.config';
import NewDataLoadDialog from './new-data-load-dialog/new-data-load-dialog';
import { convertDateFromISO } from '../../config/conversionFunctions.config';
import LoadDataSettingsDialog from './load-data-settings/load-data-settings-dialog';


interface Props {
    data: any;
    deleteLoadDataArtifact: any;
    createLoadDataArtifact: any;
    canReadOnly: any;
    canReadWrite: any;
  }

const LoadDataCard: React.FC<Props> = (props) => {
    const [newDataLoad, setNewDataLoad] = useState(false);
    const [title, setTitle] = useState('');
    const [stepData, setStepData] = useState({});
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loadArtifactName, setLoadArtifactName] = useState('');

    const [openLoadDataSettings, setOpenLoadDataSettings] = useState(false);


    const OpenAddNewDialog = () => {
        setTitle('New Data Load');
        setNewDataLoad(true);
    }

    const OpenEditStepDialog = (index) => {
        setTitle('Edit Data Load');
        setStepData(prevState => ({ ...prevState, ...props.data[index]}));
        setNewDataLoad(true);
    }

    const OpenLoadDataSettingsDialog = (index) => {
        setStepData(prevState => ({ ...prevState, ...props.data[index]}));
        //openLoadDataSettings = true;
        setOpenLoadDataSettings(true);
        console.log('Open settings', openLoadDataSettings)
    }

    //Custom CSS for source Format
    const sourceFormatStyle = (sourceFmt) => {
        let customStyles: CSSProperties = {
            float: 'left',
            backgroundColor: (sourceFmt.toUpperCase() === 'XML' ? sourceFormatOptions.xml.color : (sourceFmt.toUpperCase() === 'JSON' ? sourceFormatOptions.json.color : (sourceFmt.toUpperCase() === 'CSV' ? sourceFormatOptions.csv.color : sourceFormatOptions.default.color))),
            fontSize: '12px',
            borderRadius: '50%',
            textAlign: 'left',
            color: '#ffffff',
            padding: '5px'
        }
        return customStyles;
    }

    //Truncate a string (Step Name) to desired no. of characters
    const getInitialChars = (str, num, suffix) => {
        suffix = suffix ? suffix : '...';
        let result = str;
        if (typeof str === 'string' && str.length > num) {
            result = str.substr(0, num) + suffix;
        }
        return result;
    }

    const handleCardDelete = (name) => {
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
        <span style={{fontSize: '16px'}}>Are you sure you want to delete this?</span>
        </Modal>;

    return (
        <div className={styles.loaddataContainer}>
            <Row gutter={16} type="flex" >
                {props.canReadWrite ? <Col >
                    <Card
                        size="small"
                        className={styles.addNewCard}>
                        <div><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={OpenAddNewDialog}/></div>
                        <br />
                        <p className={styles.addNewContent}>Add New</p>
                    </Card>
                </Col> : ''}{props && props.data.length > 0 ? props.data.map((elem,index) => (
                    <Col key={index}><Card
                        actions={[
                            <span>{elem.filesNeedReuploaded ? (
                                <Popover
                                    content={"Files must be reuploaded"}
                                    trigger="click"
                                    placement="bottom"
                                ><i><FontAwesomeIcon icon={faExclamationCircle} className={styles.popover} size="lg" /></i></Popover>) : ''}</span>,
                            <Tooltip title={'Settings'} placement="bottom"><Icon type="setting" key="setting" onClick={() => OpenLoadDataSettingsDialog(index)}/></Tooltip>,
                            <Tooltip title={'Edit'} placement="bottom"><Icon type="edit" key="edit" onClick={() => OpenEditStepDialog(index)}/></Tooltip>,
                            props.canReadWrite ? <Tooltip title={'Delete'} placement="bottom"><i><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg" onClick={() => handleCardDelete(elem.name)}/></i></Tooltip> : <i><FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i>,
                        ]}
                        className={styles.cardStyle}
                        
                        size="small"
                    >
                        <div className={styles.formatFileContainer}>
                            <span style={sourceFormatStyle(elem.sourceFormat)}>{elem.sourceFormat.toUpperCase()}</span>
                            <span className={styles.files}>Files</span>
                        </div><br />
                        <div className={styles.fileCount}>{elem.fileCount}</div>
                        <span className={styles.stepNameStyle}>{getInitialChars(elem.name, 27, '...')}</span>
                        <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</p>
                    </Card></Col>
                )) : <span></span> }</Row>
                <NewDataLoadDialog 
                newLoad={newDataLoad} 
                title={title} 
                setNewLoad={setNewDataLoad} 
                createLoadDataArtifact={props.createLoadDataArtifact} 
                stepData={stepData}
                canReadWrite={props.canReadWrite}
                canReadOnly={props.canReadOnly}/>
                {deleteConfirmation}
                <LoadDataSettingsDialog openLoadDataSettings={openLoadDataSettings} setOpenLoadDataSettings={setOpenLoadDataSettings}/>
        </div>
    );

}

export default LoadDataCard;