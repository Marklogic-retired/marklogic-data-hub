import React, { CSSProperties, useState } from 'react';
import styles from './matching-card.module.scss';
import {Card, Icon, Tooltip, Row, Col, Modal} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import sourceFormatOptions from '../../../config/formats.config';
import { convertDateFromISO } from '../../../util/conversionFunctions';
import CreateEditMatchingDialog from './create-edit-matching-dialog/create-edit-matching-dialog';

interface Props {
    data: any;
    entityName: any;
    deleteMatchingArtifact: any;
    createMatchingArtifact: any;
    canReadMatchMerge: any;
    canWriteMatchMerge: any;
  }

const MatchingCard: React.FC<Props> = (props) => {
    const [newMatching, setNewMatching] = useState(false);
    const [title, setTitle] = useState('');
    const [matchingData, setMatchingData] = useState({});
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loadArtifactName, setLoadArtifactName] = useState('');

    const OpenAddNewDialog = () => {
        setTitle('New Matching');
        setNewMatching(true);
    }

    const OpenEditStepDialog = (index) => {
        setTitle('Edit Matching');
        setMatchingData(prevState => ({ ...prevState, ...props.data[index]}));
        setNewMatching(true);
    }

    const OpenMatchingSettingsDialog = (index) => {
        console.log('Open settings')
    }

    //Custom CSS for source Format
    const sourceFormatStyle = (sourceFmt) => {
        let customStyles: CSSProperties = {
            float: 'right',
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

    const extractCollectionFromSrcQuery = (query) => {

        let srcCollection = query.substring(
            query.lastIndexOf("[") + 2, 
            query.lastIndexOf("]") - 1
        );
        return getInitialChars(srcCollection,30,'...');
    }

    const handleCardDelete = (name) => {
        setDialogVisible(true);
        setLoadArtifactName(name);
      }

      const onOk = (name) => {
        props.deleteMatchingArtifact(name)
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
                {props.canWriteMatchMerge ? <Col >
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
                            <span></span>,
                            <Tooltip title={'Settings'} placement="bottom"><Icon type="setting" key="setting" onClick={() => OpenMatchingSettingsDialog(index)}/></Tooltip>,
                            <Tooltip title={'Edit'} placement="bottom"><Icon type="edit" key="edit" onClick={() => OpenEditStepDialog(index)}/></Tooltip>,
                            props.canWriteMatchMerge ? <Tooltip title={'Delete'} placement="bottom"><i><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg" onClick={() => handleCardDelete(elem.name)}/></i></Tooltip> : <i><FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i>,
                        ]}
                        className={styles.cardStyle}
                        
                        size="small"
                    >
                        <div className={styles.formatFileContainer}>
                            <span className={styles.matchingNameStyle}>{getInitialChars(elem.name, 27, '...')}</span>
                            {/* <span style={sourceFormatStyle(elem.sourceFormat)}>{elem.sourceFormat.toUpperCase()}</span> */}
                            
                        </div><br />
                        {elem.selectedSource === 'collection' ? <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(elem.sourceQuery)}</div> : <div className={styles.sourceQuery}>Source Query: {getInitialChars(elem.sourceQuery,32,'...')}</div>}
                        <br /><br />
                        <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</p>
                    </Card></Col>
                )) : <span></span> }</Row>
                <CreateEditMatchingDialog
                newMatching={newMatching} 
                title={title} 
                setNewMatching={setNewMatching}
                targetEntity={props.entityName}
                createMatchingArtifact={props.createMatchingArtifact}
                deleteMatchingArtifact={props.deleteMatchingArtifact}
                matchingData={matchingData}
                canReadWrite={props.canWriteMatchMerge}
                canReadOnly={props.canReadMatchMerge}/>
                {deleteConfirmation}
                
        </div>
    );

}

export default MatchingCard;
