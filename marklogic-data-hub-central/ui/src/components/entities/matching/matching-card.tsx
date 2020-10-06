import React, { useState } from 'react';
import styles from './matching-card.module.scss';
import {Card, Icon, Row, Col, Modal} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import {convertDateFromISO, getInitialChars, extractCollectionFromSrcQuery} from '../../../util/conversionFunctions';
import CreateEditMatchingDialog from './create-edit-matching-dialog/create-edit-matching-dialog';
import { MLTooltip } from '@marklogic/design-system';


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
    };

    const OpenEditStepDialog = (index) => {
        setTitle('Edit Matching');
        setMatchingData(prevState => ({ ...prevState, ...props.data[index]}));
        setNewMatching(true);
    };

    const OpenMatchingSettingsDialog = (index) => {
        console.log('Open settings');
    };



    const handleCardDelete = (name) => {
        setDialogVisible(true);
        setLoadArtifactName(name);
      };

      const onOk = (name) => {
        props.deleteMatchingArtifact(name);
        setDialogVisible(false);
      };

      const onCancel = () => {
        setDialogVisible(false);
      };

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
        <div className={styles.matchingContainer}>
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
                            <MLTooltip title={'Settings'} placement="bottom"><Icon type="setting" key="setting" onClick={() => OpenMatchingSettingsDialog(index)}/></MLTooltip>,
                            <MLTooltip title={'Edit'} placement="bottom"><Icon type="edit" key="edit" onClick={() => OpenEditStepDialog(index)}/></MLTooltip>,
                            props.canWriteMatchMerge ? <MLTooltip title={'Delete'} placement="bottom"><i><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg" onClick={() => handleCardDelete(elem.name)}/></i></MLTooltip> : <i><FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i>,
                        ]}
                        className={styles.cardStyle}

                        size="small"
                    >
                        <div className={styles.formatFileContainer}>
                            <span className={styles.matchingNameStyle}>{getInitialChars(elem.name, 27, '...')}</span>

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
                targetEntityType={props.entityName}
                createMatchingArtifact={props.createMatchingArtifact}
                deleteMatchingArtifact={props.deleteMatchingArtifact}
                matchingData={matchingData}
                canReadWrite={props.canWriteMatchMerge}
                canReadOnly={props.canReadMatchMerge}/>
                {deleteConfirmation}

        </div>
    );

};

export default MatchingCard;
