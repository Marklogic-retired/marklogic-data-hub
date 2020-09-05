import React, { CSSProperties, useState } from 'react';
import styles from './matching-card.module.scss';
import {Card, Icon, Tooltip, Row, Col, Modal} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import sourceFormatOptions from '../../../config/formats.config';
import {convertDateFromISO, getInitialChars, extractCollectionFromSrcQuery} from '../../../util/conversionFunctions';
import CreateEditMatchingDialog from './create-edit-matching-dialog/create-edit-matching-dialog';
import { MLTooltip } from '@marklogic/design-system';

import MultiSlider from './multi-slider/multi-slider';


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

    // TODO get match options from backend
    const matchOptions = [
        {
            props: [{
                prop: 'First',
                type: 'Exact'
            }],
            value: 0
        },
        {
            props: [{
                prop: 'DOB',
                type: 'Exact'
            }],
            value: 0
        },
        {
            props: [{
                prop: 'Foo',
                type: 'Bar'
            }],
            value: 0
        },
    ];

    const handleSlider = (values) => {
        // TODO put match options to backend
        console.log('handleSlider', values);
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
                            {/* <span style={sourceFormatStyle(elem.sourceFormat)}>{elem.sourceFormat.toUpperCase()}</span> */}

                        </div><br />
                        {elem.selectedSource === 'collection' ? <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(elem.sourceQuery)}</div> : <div className={styles.sourceQuery}>Source Query: {getInitialChars(elem.sourceQuery,32,'...')}</div>}
                        <br /><br />
                        <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</p>
                    </Card></Col>
                )) : <span></span> }</Row>

                <MultiSlider options={matchOptions} handleSlider={handleSlider} />

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

}

export default MatchingCard;
