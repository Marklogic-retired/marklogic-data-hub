import React, {CSSProperties, useContext, useState} from 'react';
import styles from './load-card.module.scss';
import { useHistory } from 'react-router-dom';
import {Card, Icon, Tooltip, Popover, Row, Col, Modal, Select} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import sourceFormatOptions from '../../config/formats.config';
import NewLoadDialog from './new-load-dialog/new-load-dialog';
import { convertDateFromISO } from '../../util/conversionFunctions';
import AdvancedSettingsDialog from "../advanced-settings/advanced-settings-dialog";
import { AdvLoadTooltips } from '../../config/tooltips.config';

import { AuthoritiesContext } from "../../util/authorities";
import { Link } from 'react-router-dom';

const { Option } = Select;

interface Props {
    data: any;
    flows: any;
    deleteLoadArtifact: any;
    createLoadArtifact: any;
    canReadOnly: any;
    canReadWrite: any;
    canWriteFlow: any;
    addStepToFlow: any;
    addStepToNew: any;
}

const LoadCard: React.FC<Props> = (props) => {
    const activityType = 'ingestion';
    const authorityService = useContext(AuthoritiesContext);
    const [newDataLoad, setNewDataLoad] = useState(false);
    const [title, setTitle] = useState('');
    const [stepData, setStepData] = useState({});
    const [dialogVisible, setDialogVisible] = useState(false);
    const [addDialogVisible, setAddDialogVisible] = useState(false);
    const [loadArtifactName, setLoadArtifactName] = useState('');
    const [flowName, setFlowName] = useState('');
    const [showLinks, setShowLinks] = useState('');

    const [openLoadSettings, setOpenLoadSettings] = useState(false);

    //To navigate to bench view with parameters
    let history = useHistory();

    const OpenAddNewDialog = () => {
        setTitle('New Loading Step');
        setNewDataLoad(true);
    }

    const OpenEditStepDialog = (index) => {
        setTitle('Edit Loading Step');
        setStepData(prevState => ({ ...prevState, ...props.data[index]}));
        setNewDataLoad(true);
    }

    const OpenLoadSettingsDialog = (index) => {
        setStepData(prevState => ({ ...prevState, ...props.data[index]}));
        setOpenLoadSettings(true);
    }

    // Custom CSS for source Format
    const sourceFormatStyle = (sourceFmt) => {
        let customStyles: CSSProperties = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '35px',
            width: '35px',
            lineHeight: '35px',
            backgroundColor: sourceFormatOptions[sourceFmt].color,
            fontSize: sourceFmt === 'json' ? '12px' : '13px',
            borderRadius: '50%',
            textAlign: 'center',
            color: '#ffffff',
            verticalAlign: 'middle'
        }
        return customStyles;
    }

    // Truncate a string (Step Name) to desired no. of characters
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

    const onDeleteOk = (name) => {
        props.deleteLoadArtifact(name)
        setDialogVisible(false);
    }

    function handleMouseOver(e, name) {
        // Handle all possible events from mouseover of card body
        if (typeof e.target.className === 'string' &&
            (e.target.className === 'ant-card-body' ||
             e.target.className.startsWith('load-card_formatFileContainer') ||
             e.target.className.startsWith('load-card_stepNameStyle'))
        ) {
            setShowLinks(name);
        }
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

    const onCancel = () => {
        setDialogVisible(false);
        setAddDialogVisible(false);
    }

    const deleteConfirmation = (
        <Modal
            visible={dialogVisible}
            okText='Yes'
            cancelText='No'
            onOk={() => onDeleteOk(loadArtifactName)}
            onCancel={() => onCancel()}
            width={350}
            maskClosable={false}
        >
            <div style={{fontSize: '16px', padding: '10px'}}>
                Are you sure you want to delete "{loadArtifactName}"?
            </div>
        </Modal>
    );

    const addConfirmation = (
        <Modal
            visible={addDialogVisible}
            okText={<div data-testid={`${loadArtifactName}-to-${flowName}-Confirm`}>Yes</div>}
            cancelText='No'
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

    return (
        <div id="load-card" aria-label="load-card" className={styles.loadCard}>
            <Row gutter={16} type="flex" >
                {props.canReadWrite ? <Col >
                    <Card
                        size="small"
                        className={styles.addNewCard}>
                        <div aria-label="add-new-card"><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={OpenAddNewDialog}/></div>
                        <br />
                        <p className={styles.addNewContent}>Add New</p>
                    </Card>
                </Col> : ''}{ props && props.data.length > 0 ? props.data.map((elem,index) => (
                <Col key={index}>
                    <div
                        onMouseOver={(e) => handleMouseOver(e, elem.name)}
                        onMouseLeave={(e) => setShowLinks('')}
                    >
                        <Card
                            actions={[
                                <Tooltip title={'Settings'} placement="bottom"><Icon type="setting" key="setting" data-testid={elem.name+'-settings'} onClick={() => OpenLoadSettingsDialog(index)}/></Tooltip>,
                                <Tooltip title={'Edit'} placement="bottom"><Icon type="edit" key="edit" data-testid={elem.name+'-edit'} onClick={() => OpenEditStepDialog(index)}/></Tooltip>,
                                props.canReadWrite ? <Tooltip title={'Delete'} placement="bottom"><i aria-label="icon: delete"><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg"  data-testid={elem.name+'-delete'} onClick={() => handleCardDelete(elem.name)}/></i></Tooltip> : <i><FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i>,
                            ]}
                            className={styles.cardStyle}
                            size="small"
                        >
                            <div className={styles.formatContainer}>
                                <div className={styles.sourceFormat} style={sourceFormatStyle(elem.sourceFormat)} aria-label={`${elem.name}-sourceFormat`}>{sourceFormatOptions[elem.sourceFormat].label}</div>
                            </div>
                            <div className={styles.stepNameStyle}>{getInitialChars(elem.name, 25, '...')}</div>
                            <div className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</div>
                            <div className={styles.cardLinks} style={{display: showLinks === elem.name ? 'block' : 'none'}}>
                                {props.canWriteFlow ? <Link id="tiles-run-add" to={
                                    {pathname: '/tiles/run/add',
                                    state: {
                                        stepToAdd : elem.name,
                                        stepDefinitionType : 'ingestion',
                                        existingFlow: false
                                    }}}><div className={styles.cardLink} data-testid={`${elem.name}-toNewFlow`}>Add step to a new flow</div></Link>: <div className={styles.cardDisabledLink} data-testid={`${elem.name}-disabledToNewFlow`}> Add step to a new flow</div>}
                                <div className={styles.cardNonLink} data-testid={`${elem.name}-toExistingFlow`}>
                                    Add step to an existing flow
                                    <div className={styles.cardLinkSelect}>
                                        <Select
                                            style={{ width: '100%' }}
                                            onChange={(flowName) => handleSelect({flowName: flowName, loadName: elem.name})}
                                            placeholder="Select Flow"
                                            defaultActiveFirstOption={false}
                                            data-testid={`${elem.name}-flowsList`}
                                            disabled={!props.canWriteFlow}
                                        >
                                            { props.flows && props.flows.length > 0 ? props.flows.map((f,i) => (
                                                <Option value={f.name} key={i}>{f.name}</Option>
                                            )) : null}
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Col>)) : <span></span> }
            </Row>
            <NewLoadDialog
                newLoad={newDataLoad}
                title={title}
                setNewLoad={setNewDataLoad}
                createLoadArtifact={props.createLoadArtifact}
                stepData={stepData}
                canReadWrite={props.canReadWrite}
                canReadOnly={props.canReadOnly}
            />
            {deleteConfirmation}
            {addConfirmation}
            <AdvancedSettingsDialog
                tooltipData={AdvLoadTooltips}
                openAdvancedSettings={openLoadSettings}
                setOpenAdvancedSettings={setOpenLoadSettings}
                stepData={stepData}
                activityType={activityType}
                canWrite={authorityService.canWriteLoad()}
            />
        </div>
    );

}

export default LoadCard;
