import React, { CSSProperties, useState, useEffect, useContext } from 'react';
import styles from './matching-card.module.scss';
import {Card, Icon, Select, Row, Col, Modal} from 'antd';
import { MLTooltip } from '@marklogic/design-system';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import { Link, useHistory } from 'react-router-dom';

import AdvancedSettingsDialog from "../../advanced-settings/advanced-settings-dialog";
import ConfirmationModal from '../../confirmation-modal/confirmation-modal';
import CreateEditMatchingDialog from './create-edit-matching-dialog/create-edit-matching-dialog';

import sourceFormatOptions from '../../../config/formats.config';
import {convertDateFromISO, getInitialChars, extractCollectionFromSrcQuery} from '../../../util/conversionFunctions';
import {
  MatchingStep
} from '../../../types/curation-types';
import { ConfirmationType } from '../../../types/common-types';
import { CurationContext } from '../../../util/curation-context';

import MultiSlider from './multi-slider/multi-slider';

const { Option } = Select;

interface Props {
    matchingStepsArray: MatchingStep[];
    flows: any;
    entityName: any;
    deleteMatchingArtifact: any;
    createMatchingArtifact: any;
    canReadMatchMerge: any;
    canWriteMatchMerge: any;
    canWriteFlow: any;
    entityModel: any;
    addStepToFlow: any;
    addStepToNew: any;
}

const MatchingCard: React.FC<Props> = (props) => {
    const history = useHistory<any>();
    const { setActiveStep } = useContext(CurationContext)

    const [newMatching, setNewMatching] = useState(false);
    const [title, setTitle] = useState('');
    const [matchingData, setMatchingData] = useState({});
    const [showLinks, setShowLinks] = useState('');
    const [showAdvancedSettings, toggleAdvancedSettings] = useState(false);

    const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.AddStepToFlow);
    const [showConfirmModal, toggleConfirmModal] = useState(false);
    const [confirmBoldTextArray, setConfirmBoldTextArray] = useState<string[]>([]);

    const openAddNewDialog = () => {
        setTitle('New Matching');
        setNewMatching(true);
    }

    const openEditStepDialog = (index) => {
        setTitle('Edit Matching');
        setMatchingData(prevState => ({ ...prevState, ...props.matchingStepsArray[index]}));
        setNewMatching(true);
    }

    const openMatchingSettingsDialog = (index) => {
        //TODO add advanced settings functionality
        console.log('Open settings')
        //toggleAdvancedSettings(true);
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

    const handleMouseOver = (e, name) => {
      // Handle all possible events from mouseover of card body
      if (typeof e.target.className === 'string' &&
          (e.target.className === 'ant-card-body' ||
           e.target.className.startsWith('matching-card_cardContainer') ||
           e.target.className.startsWith('matching-card_formatFileContainer') ||
           e.target.className.startsWith('matching-card_sourceQuery') ||
           e.target.className.startsWith('matching-card_lastUpdatedStyle'))
      ) {
          setShowLinks(name);
      }
    }

    const openStepDetails = (matchingStep: MatchingStep) => {
        setActiveStep(matchingStep, props.entityModel['model']['definitions'], props.entityName);
        history.push({ pathname: '/tiles/curate/match'});
    }

    const handleCardDelete = (stepName) => {
        setConfirmBoldTextArray([stepName]);
        setConfirmType(ConfirmationType.DeleteStep)
        toggleConfirmModal(true);
    }

    const handleSelect = (obj) => {
        handleStepAdd(obj.mappingName, obj.flowName);
    }

    const handleStepAdd = (mappingName, flowName) => {
      // TODO create new step
      // setAddDialogVisible(true);
      // setMappingArtifactName(mappingName);
      // setFlowName(flowName);
    }

    const confirmAction = () => {
        if (confirmType === ConfirmationType.AddStepToFlow) {
          // TODO add step to new flow
        } else if (confirmType === ConfirmationType.DeleteStep) {
            props.deleteMatchingArtifact(confirmBoldTextArray[0]);
            toggleConfirmModal(false);
        }
    }

    return (
        <div className={styles.matchingContainer}>
            <Row gutter={16} type="flex" >
                {props.canWriteMatchMerge ? (
                    <Col >
                        <Card
                            size="small"
                            className={styles.addNewCard}>
                            <div><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={openAddNewDialog}/></div>
                            <br />
                            <p className={styles.addNewContent}>Add New</p>
                        </Card>
                    </Col>
                ) : ''}

                {props && props.matchingStepsArray.length > 0 ? props.matchingStepsArray.map((elem,index) => (
                    <Col key={index}>
                        <div
                            data-testid={`${props.entityName}-${elem.name}-step`}
                            onMouseOver={(e) => handleMouseOver(e, elem.name)}
                            onMouseLeave={(e) => setShowLinks('')}
                        >
                            <Card
                                actions={[
                                    <span></span>,
                                    <MLTooltip title={'Settings'} placement="bottom"><Icon type="setting" key="setting" onClick={() => openMatchingSettingsDialog(index)}/></MLTooltip>,
                                    <MLTooltip title={'Edit'} placement="bottom"><Icon type="edit" key="edit" onClick={() => openEditStepDialog(index)}/></MLTooltip>,
                                    props.canWriteMatchMerge ? (
                                        <MLTooltip
                                            title={'Delete'}
                                            placement="bottom"
                                        >
                                            <i><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg" onClick={() => handleCardDelete(elem.name)} /></i>
                                        </MLTooltip>
                                    ) : (
                                        <i><FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i>
                                    )
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

                                {/* Hover Over Menu */}
                                <div className={styles.cardLinks} style={{display: showLinks === elem.name ? 'block' : 'none'}}>
                                    <div
                                        data-testid={`${elem.name}-stepDetails`}
                                        className={styles.cardLink}
                                        onClick={() => openStepDetails(elem)}
                                    >Open step details</div>
                                    {props.canWriteMatchMerge ? (
                                        <Link id="tiles-run-add" to={
                                            {pathname: '/tiles/run/add',
                                            state: {
                                                stepToAdd : elem.name,
                                                stepDefinitionType : 'matching'
                                            }}}
                                        ><div className={styles.cardLink} data-testid={`${elem.name}-toNewFlow`}> Add step to a new flow</div>
                                        </Link>
                                    ) : <div className={styles.cardDisabledLink} data-testid={`${elem.name}-disabledToNewFlow`}> Add step to a new flow</div> }
                                    <div className={styles.cardNonLink} data-testid={`${elem.name}-toExistingFlow`}>
                                        Add step to an existing flow
                                        <div className={styles.cardLinkSelect}>
                                            <Select
                                                style={{ width: '100%' }}
                                                onChange={(flowName) => handleSelect({flowName: flowName, mappingName: elem.name})}
                                                placeholder="Select Flow"
                                                defaultActiveFirstOption={false}
                                                disabled={!props.canWriteFlow}
                                                data-testid={`${elem.name}-flowsList`}
                                            >
                                                { props.flows && props.flows.length > 0 && props.flows.map((flow, index) => (
                                                    <Option aria-label={`${flow.name}-option`} value={flow.name} key={index}>{flow.name}</Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>
                )) : <span></span> }
                <CreateEditMatchingDialog
                    newMatching={newMatching}
                    title={title}
                    setNewMatching={setNewMatching}
                    targetEntityType={props.entityName}
                    createMatchingArtifact={props.createMatchingArtifact}
                    deleteMatchingArtifact={props.deleteMatchingArtifact}
                    matchingData={matchingData}
                    canReadWrite={props.canWriteMatchMerge}
                    canReadOnly={props.canReadMatchMerge}
                />
            </Row>
            <ConfirmationModal
                isVisible={showConfirmModal}
                type={confirmType}
                boldTextArray={confirmBoldTextArray}
                toggleModal={toggleConfirmModal}
                confirmAction={confirmAction}
            />
        </div>
    );

}

export default MatchingCard;
