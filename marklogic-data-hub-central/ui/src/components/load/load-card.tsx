import React, {CSSProperties, useContext, useState, useEffect} from 'react';
import styles from './load-card.module.scss';
import { useHistory } from 'react-router-dom';
import {Card, Icon, Tooltip, Popover, Row, Col, Modal, Select, Dropdown, Menu} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import sourceFormatOptions from '../../config/formats.config';
import { convertDateFromISO, sortStepsByUpdated } from '../../util/conversionFunctions';
import Steps from "../steps/steps";
import { AdvLoadTooltips, SecurityTooltips } from '../../config/tooltips.config';
import { Link } from 'react-router-dom';
import { MLTooltip } from '@marklogic/design-system';


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
    const [stepData, setStepData] = useState({});
    const [dialogVisible, setDialogVisible] = useState(false);
    const [addDialogVisible, setAddDialogVisible] = useState(false);
    const [loadArtifactName, setLoadArtifactName] = useState('');
    const [sortedLoads, setSortedLoads] = useState(props.data);
    const [flowName, setFlowName] = useState('');
    const [showLinks, setShowLinks] = useState('');
    const [selected, setSelected] = useState({}); // track Add Step selections so we can reset on cancel
    const [selectVisible, setSelectVisible] = useState(false);
    const [openLoadSettings, setOpenLoadSettings] = useState(false);
    const [addRun, setAddRun] = useState(false);
    const [openStepSettings, setOpenStepSettings] = useState(false);
    const [isNewStep, setIsNewStep] = useState(false);

    useEffect(() => {
        let sortedArray = props.data.length > 1 ? sortStepsByUpdated(props.data) : props.data;
        setSortedLoads(sortedArray);
    }, [props.data])

    //To navigate to bench view with parameters
    let history = useHistory();

    const OpenAddNew = () => {
        setIsNewStep(true);
        setOpenStepSettings(true);
    }

    const OpenStepSettings = (index) => {
        setIsNewStep(false);
        setStepData(prevState => ({ ...prevState, ...props.data[index]}));
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
        };
        return customStyles;
    };

    // Truncate a string (Step Name) to desired no. of characters
    const getInitialChars = (str, num, suffix) => {
        suffix = suffix ? suffix : '...';
        let result = str;
        if (typeof str === 'string' && str.length > num) {
            result = str.substr(0, num) + suffix;
        }
        return result;
    };

    const handleCardDelete = (name) => {
        setDialogVisible(true);
        setLoadArtifactName(name);
    };

    const onDeleteOk = (name) => {
        props.deleteLoadArtifact(name);
        setDialogVisible(false);
    };

    function handleMouseOver(e, name) {
        // Handle all possible events from mouseover of card body
        setSelectVisible(true);
        if (typeof e.target.className === 'string' &&
            (e.target.className === 'ant-card-body' ||
             e.target.className.startsWith('load-card_formatFileContainer') ||
             e.target.className.startsWith('load-card_stepNameStyle'))
        ) {
            setShowLinks(name);
        }
    }
    function handleMouseLeave() {
        // Handle all possible events from mouseleave of card body
        setShowLinks('');
        setSelectVisible(false);
    }

    function handleSelect(obj) {
        let selectedNew = {...selected};
        selectedNew[obj.loadName] = obj.flowName;
        setSelected(selectedNew);
        setAddRun(false);
        handleStepAdd(obj.loadName, obj.flowName);
    }

    function handleSelectAddRun(obj) {
        let selectedNew = {...selected};
        selectedNew[obj.loadName] = obj.flowName;
        setSelected(selectedNew);
        setAddRun(true);
        handleStepAdd(obj.loadName, obj.flowName);
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
                    flowsDefaultKey: [props.flows.findIndex(el => el.name === fName)],
                    existingFlow: true,
                    addFlowDirty: true,
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

    const onCancel = () => {
        setDialogVisible(false);
        setAddDialogVisible(false);
        setSelected({}); // reset menus on cancel
    };

    const menu = (name) => (
        <Menu style={{right: '80px'}}>
            <Menu.Item key="0">
                { <Link data-testid="link" id="tiles-run-add" to={
                                        {pathname: '/tiles/run/add-run',
                                        state: {
                                            stepToAdd : name,
                                            stepDefinitionType : 'ingestion',
                                            viewMode: 'card',
                                            existingFlow : false
                                        }}}><div className={styles.stepLink} data-testid={`${name}-run-toNewFlow`}>Run step in a new flow</div></Link>}
            </Menu.Item>
            <Menu.Item key="1">
                <div className={styles.stepLinkExisting} data-testid={`${name}-run-toExistingFlow`}>Run step in an existing flow
                    <div className={styles.stepLinkSelect} onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
                        <Select
                            style={{ width: '100%' }}
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

    const deleteConfirmation = (
        <Modal
            visible={dialogVisible}
            okText={<div aria-label="Yes">Yes</div>}
            cancelText={<div aria-label="No">No</div>}
            onOk={() => onDeleteOk(loadArtifactName)}
            onCancel={() => onCancel()}
            width={350}
            maskClosable={false}
            destroyOnClose={true}
        >
            <div style={{fontSize: '16px', padding: '10px'}}>
                Are you sure you want to delete the <strong>{loadArtifactName}</strong> step?
            </div>
        </Modal>
    );

    const addConfirmation = (
        <Modal
            visible={addDialogVisible}
            okText={<div aria-label="Yes" data-testid={`${loadArtifactName}-to-${flowName}-Confirm`}>Yes</div>}
            cancelText={<div aria-label="No">No</div>}
            onOk={() => onAddOk(loadArtifactName, flowName)}
            onCancel={() => onCancel()}
            width={400}
            maskClosable={false}
            destroyOnClose={true}
        >
            <div aria-label="add-step-confirmation" style={{fontSize: '16px', padding: '10px'}}>
                { isStepInFlow(loadArtifactName, flowName) ?
                    !addRun ? <p aria-label="step-in-flow">The step <strong>{loadArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance?</p> : <p aria-label="step-in-flow-run">The step <strong>{loadArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance and run it?</p>
                    : !addRun ? <p aria-label="step-not-in-flow">Are you sure you want to add the step <strong>{loadArtifactName}</strong> to the flow <strong>{flowName}</strong>?</p> : <p aria-label="step-not-in-flow-run">Are you sure you want to add the step <strong>{loadArtifactName}</strong> to the flow <strong>{flowName}</strong> and run it?</p> 
                }
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
                        <div aria-label="add-new-card"><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={OpenAddNew}/></div>
                        <br />
                        <p className={styles.addNewContent}>Add New</p>
                    </Card>
                </Col> : ''}{ sortedLoads && sortedLoads.length > 0 ? sortedLoads.map((elem,index) => (
                <Col key={index}>
                    <div
                        onMouseOver={(e) => handleMouseOver(e, elem.name)}
                        onMouseLeave={(e) => handleMouseLeave()}
                    >
                        <Card
                            actions={[
                            <MLTooltip title={'Edit'} placement="bottom"><i key="edit"></i><FontAwesomeIcon icon={faPencilAlt} data-testid={elem.name+'-edit'} onClick={() => OpenStepSettings(index)}/></MLTooltip>,
                            <Dropdown data-testid={`${elem.name}-dropdown`} overlay={menu(elem.name)} trigger={['click']} disabled = {!props.canWriteFlow}>    
                            {props.canReadWrite ? <MLTooltip title={'Run'} placement="bottom"><i aria-label="icon: run"><Icon type="play-circle" theme="filled" className={styles.runIcon} data-testid={elem.name+'-run'}/></i></MLTooltip> : <MLTooltip title={'Run: ' + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: '200px'}}><i role="disabled-run-load button" data-testid={elem.name+'-disabled-run'}><Icon type="play-circle" theme="filled" onClick={(event) => event.preventDefault()} className={styles.disabledIcon}/></i></MLTooltip>}
                            </Dropdown>,
                            props.canReadWrite ? <MLTooltip title={'Delete'} placement="bottom"><i aria-label="icon: delete"><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg"  data-testid={elem.name+'-delete'} onClick={() => handleCardDelete(elem.name)}/></i></MLTooltip> : <MLTooltip title={'Delete: ' + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: '200px'}}><i data-testid={elem.name+'-disabled-delete'}><FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledIcon} size="lg"/></i></MLTooltip>,
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
                                        viewMode: 'card',
                                        existingFlow: false
                                    }}}><div className={styles.cardLink} data-testid={`${elem.name}-toNewFlow`}>Add step to a new flow</div></Link>: <div className={styles.cardDisabledLink} data-testid={`${elem.name}-toNewFlow`}> Add step to a new flow</div>}
                                <div className={styles.cardNonLink} data-testid={`${elem.name}-toExistingFlow`}>
                                    Add step to an existing flow
                                    {selectVisible ? <div className={styles.cardLinkSelect}>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={selected[elem.name] ? selected[elem.name] : undefined}
                                            onChange={(flowName) => handleSelect({flowName: flowName, loadName: elem.name})}
                                            placeholder="Select Flow"
                                            defaultActiveFirstOption={false}
                                            data-testid={`${elem.name}-flowsList`}
                                            disabled={!props.canWriteFlow}
                                        >
                                            { props.flows && props.flows.length > 0 ? props.flows.map((f,i) => (
                                                <Option aria-label={`${f.name}-option`} value={f.name} key={i}>{f.name}</Option>
                                            )) : null}
                                        </Select>
                                    </div> : null}
                                </div>
                            </div>
                        </Card>
                    </div>
                </Col>)) : <span></span> }
            </Row>
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

export default LoadCard;
