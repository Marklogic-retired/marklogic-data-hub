import React, { useState, CSSProperties, useEffect, useContext, createRef } from 'react';
import { Collapse, Icon, Card, Modal, Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { MLButton } from '@marklogic/design-system';
import NewFlowDialog from './new-flow-dialog/new-flow-dialog';
import sourceFormatOptions from '../../config/formats.config';
import {RunToolTips, SecurityTooltips} from '../../config/tooltips.config';
import styles from './flows.module.scss';
import { MLTooltip, MLSpin, MLUpload } from '@marklogic/design-system';
import { useDropzone } from 'react-dropzone';
import { AuthoritiesContext } from "../../util/authorities";
import {Link, useLocation} from "react-router-dom";
import axios from "axios";
import {UserContext} from "../../util/user-context";
import './flows.scss';

const { Panel } = Collapse;

interface Props {
    flows: any;
    steps: any;
    deleteFlow: any;
    createFlow: any;
    updateFlow: any;
    deleteStep: any;
    runStep: any;
    canReadFlow: boolean;
    canWriteFlow: boolean;
    hasOperatorRole: boolean;
    running: any;
    uploadError:string;
    newStepToFlowOptions: any;
    addStepToFlow: any;
    flowsDefaultActiveKey: any;
    showStepRunResponse: any;
    runEnded:any;
}

const StepDefinitionTypeTitles = {
    'INGESTION': 'Load',
    'ingestion': 'Load',
    'MAPPING': 'Map',
    'mapping': 'Map',
    'MASTERING': 'Master',
    'mastering': 'Master',
    'MATCHING': 'Match',
    'matching': 'Match',
    'MERGING': 'Merge',
    'merging': 'Merge',
    'CUSTOM': 'Custom',
    'custom': 'Custom'
};

const Flows: React.FC<Props> = (props) => {
    const { handleError } = useContext(UserContext);
    const [newFlow, setNewFlow] = useState(false);
    const [addedFlowName, setAddedFlowName] = useState('');
    const [title, setTitle] = useState('');
    const [flowData, setFlowData] = useState({});
    const [dialogVisible, setDialogVisible] = useState(false);
    const [stepDialogVisible, setStepDialogVisible] = useState(false);
    const [addStepDialogVisible, setAddStepDialogVisible] = useState(false);
    const [flowName, setFlowName] = useState('');
    const [stepName, setStepName] = useState('');
    const [stepType, setStepType] = useState('');
    const [stepNumber, setStepNumber] = useState('');
    const [runningStep, setRunningStep] = useState<any>({});
    const [runningFlow, setRunningFlow] = useState<any>('');
    const [fileList, setFileList] = useState<any[]>([]);
    const [showUploadError, setShowUploadError] = useState(false);
    const [openNewFlow, setOpenNewFlow] = useState(props.newStepToFlowOptions?.addingStepToFlow && !props.newStepToFlowOptions?.existingFlow);
    const [activeKeys, setActiveKeys] = useState(JSON.stringify(props.newStepToFlowOptions?.flowsDefaultKey) !== JSON.stringify(["-1"]) ? props.newStepToFlowOptions?.flowsDefaultKey : ['-1']);
    const [showLinks, setShowLinks] = useState('');
    const [startRun, setStartRun] = useState(false);
    const [latestJobData, setLatestJobData] = useState<any>({});
    const [createAdd, setCreateAdd] = useState(true);
    const [addFlowDirty, setAddFlowDirty] = useState({});
    const [addExternalFlowDirty, setExternalAddFlowDirty] = useState(true);
    const location = useLocation()
    
    // maintain a list of panel refs 
    const flowPanels : any = props.flows.reduce((p, n) => ({...p, ...{[n.name]: createRef()} }), {})
        
    // If a step was just added scroll the flow step panel fully to the right
    useEffect(() => {
        const scrollToEnd = f => {
            const panel = flowPanels[f]
            if (panel && panel.current) {
                const { scrollWidth } = panel.current
                panel.current.scrollTo(scrollWidth * 2, 0)
            }
        }
        if (!props.flows.length) return
        const currentFlow = props.flows.filter(({name}) => name === flowName).shift()
        if (currentFlow?.steps?.length > addFlowDirty[flowName]) {
            // Scrolling should happen on the last update after the number of steps in the flow has been updated
            scrollToEnd(flowName)
            setAddFlowDirty({...addFlowDirty, [flowName]: currentFlow?.steps?.length})
        } else {
            // if step is added from external view
            const { state = {} } = location
            const externalDirty = (state ? state['addFlowDirty'] : false) && addExternalFlowDirty
            const thisFlow = state ? state['flowName'] : null
            if (externalDirty) {
                scrollToEnd(thisFlow)
                const panel = flowPanels[thisFlow]
                setExternalAddFlowDirty(false)
            }
        }
    }, [props.flows])

    useEffect(() => {
        if (JSON.stringify(props.flowsDefaultActiveKey) !== JSON.stringify([]) && props.flowsDefaultActiveKey.length >= activeKeys.length) {
            setActiveKeys([...props.flowsDefaultActiveKey]);
        }
        // Get the latest job info when a step is added to an existing flow from Curate or Load Tile
        if (JSON.stringify(props.flows) !== JSON.stringify([])) {
            if (props.newStepToFlowOptions && props.newStepToFlowOptions.addingStepToFlow && props.newStepToFlowOptions.flowsDefaultKey && props.newStepToFlowOptions.flowsDefaultKey != -1) {
                getFlowWithJobInfo(props.newStepToFlowOptions.flowsDefaultKey);
                if (startRun && props.newStepToFlowOptions.existingFlow) {
                        //run step after step is added to an existing flow
                        if (props.newStepToFlowOptions.stepDefinitionType === 'ingestion') {
                            setShowUploadError(false);
                            setRunningStep(props.flows[props.newStepToFlowOptions.flowsDefaultKey].steps[props.flows[props.newStepToFlowOptions.flowsDefaultKey].steps.length - 1]);
                            setRunningFlow(props.newStepToFlowOptions?.flowName);
                            openFilePicker();
                            setStartRun(false);
                        } else {
                            props.runStep(props.newStepToFlowOptions?.flowName, props.flows[props.newStepToFlowOptions.flowsDefaultKey].steps[props.flows[props.newStepToFlowOptions.flowsDefaultKey].steps.length - 1]);
                            setStartRun(false);
                        }
                }
            }
            //run step after step is added to a new flow
            if (props.newStepToFlowOptions && !props.newStepToFlowOptions.existingFlow && startRun && addedFlowName) {
                let index = props.flows.findIndex(i => i.name === addedFlowName);
                if (props.flows[index].steps[0]) {
                    if (props.flows[index].steps[0].stepDefinitionType === 'ingestion') {
                        setShowUploadError(false);
                        setRunningStep(props.flows[index].steps[0]);
                        setRunningFlow(addedFlowName);
                        openFilePicker();
                        setAddedFlowName('');  
                        setStartRun(false);
                    } else {
                        props.runStep(addedFlowName, props.flows[index].steps[0]);
                        setAddedFlowName('');  
                        setStartRun(false);
                    }
                }
            }
        }
        if (activeKeys === undefined) {
            setActiveKeys([]);
        }
    }, [props.flows]);

    // Get the latest job info after a step (in a flow) run
    useEffect(()=>{
        let num = props.flows.findIndex((flow) => flow.name === props.runEnded.flowId);
        if (num >= 0) {
            getFlowWithJobInfo(num);
        }
    },[props.runEnded]);

    useEffect(() => {
        if (props.newStepToFlowOptions && props.newStepToFlowOptions.startRunStep) {
            setStartRun(true);
        }
    },[props.newStepToFlowOptions])

    // For role-based privileges
    const authorityService = useContext(AuthoritiesContext);
    const authorityByStepType = {
        ingestion: authorityService.canReadLoad(),
        mapping: authorityService.canReadMapping(),
        custom: authorityService.canReadCustom()
    };

    const OpenAddNewDialog = () => {
        setCreateAdd(false);
        setTitle('New Flow');
        setNewFlow(true);
    };

    //Custom CSS for source Format
    const sourceFormatStyle = (sourceFmt) => {
        let customStyles: CSSProperties;
        if (!sourceFmt) {
            customStyles = {
                float: 'left',
                backgroundColor: '#fff',
                color: '#fff',
                padding: '5px'
            };
        } else {
            customStyles = {
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
        }
        return customStyles;
    };

    const handleStepAdd = async (stepName, flowName, stepType) => {
        setAddStepDialogVisible(true);
        setFlowName(flowName);
        setStepName(stepName);
        setStepType(stepType);
    };

    const handleFlowDelete = (name) => {
        setDialogVisible(true);
        setFlowName(name);
    };

    const handleStepDelete = (flowName, stepDetails) => {
        setStepDialogVisible(true);
        setFlowName(flowName);
        setStepName(stepDetails.stepName);
        setStepType(stepDetails.stepDefinitionType);
        setStepNumber(stepDetails.stepNumber);
    };

    const onOk = (name) => {
        props.deleteFlow(name);
        setDialogVisible(false);
    };

    const onStepOk = (flowName, stepNumber) => {
        props.deleteStep(flowName, stepNumber);
        setStepDialogVisible(false);
    };

    const onAddStepOk = async (stepName, flowName, stepType) => {
        await props.addStepToFlow(stepName, flowName, stepType);
        // Open flow panel if not open
        const flowIndex = props.flows.findIndex(f => f.name === flowName);
        if (!activeKeys.includes(flowIndex)) {
            let newActiveKeys = [...activeKeys, flowIndex];
            setActiveKeys(newActiveKeys);
        }
        await setAddStepDialogVisible(false);
        await setAddFlowDirty({...addFlowDirty, [flowName]: props.flows[flowIndex].steps.length})
    }

    const onCancel = () => {
        setDialogVisible(false);
        setStepDialogVisible(false);
        setAddStepDialogVisible(false);
    };

    const isStepInFlow = (stepName, flowName) => {
        let result = false;
        let flow;
        if (props.flows) flow = props.flows.find(f => f.name === flowName);
        if (flow) result = flow['steps'].findIndex(s => s.stepName === stepName) > -1;
        return result;
    };
    
    // Setup for file upload
    const {getRootProps, getInputProps, open, acceptedFiles} = useDropzone({
        noClick: true,
        noKeyboard: true
    });

    const openFilePicker = () => {
        open();
    }

    useEffect(() => {
        acceptedFiles.map(file => {
            setFileList(prevState => [...prevState, file])
        });
    }, [acceptedFiles])

    useEffect(() => {
        customRequest();
    }, [fileList])


    const deleteConfirmation = (
        <Modal
            visible={dialogVisible}
            okText={<div aria-label="Yes">Yes</div>}
            okType='primary'
            cancelText={<div aria-label="No">No</div>}
            onOk={() => onOk(flowName)}
            onCancel={() => onCancel()}
            width={350}
            destroyOnClose={true}
        >
            <div className={styles.confirmationText}>Are you sure you want to delete the <strong>{flowName}</strong> flow?</div>
        </Modal>
    );

    const deleteStepConfirmation = (
        <Modal
            visible={stepDialogVisible} 
            okText={<div aria-label="Yes">Yes</div>}
            okType='primary'
            cancelText={<div aria-label="No">No</div>}
            onOk={() => onStepOk(flowName, stepNumber)}
            onCancel={() => onCancel()}
            width={350}
            destroyOnClose={true}
        >
            <div className={styles.confirmationText}>Are you sure you want to remove the <strong>{stepName}</strong> step from the <strong>{flowName}</strong> flow?</div>
        </Modal>
    );

    const addStepConfirmation = (
        <Modal
            visible={addStepDialogVisible}
            okText={<div aria-label="Yes">Yes</div>}
            okType='primary'
            cancelText={<div aria-label="No">No</div>}
            onOk={() => onAddStepOk(stepName, flowName, stepType)}
            onCancel={() => onCancel()}
            width={350}
        >
            <div className={styles.confirmationText}>
                {
                    isStepInFlow(stepName, flowName)
                    ?
                    <p>The step <b>{stepName}</b> is already in the flow <b>{flowName}</b>. Would you like to add another instance?</p>
                    :
                    <p>Are you sure you want to add step <b>{stepName}</b> to flow <b>{flowName}</b>?</p>
                }
            </div>
        </Modal>
    );

    const stepMenu = (flowName) => { return (
        <Menu>
            <Menu.ItemGroup title="Load">
            { props.steps && props.steps['ingestionSteps'] && props.steps['ingestionSteps'].length > 0 ? props.steps['ingestionSteps'].map((elem,index) => (
                <Menu.Item key={index}>
                    <div
                        onClick={() => { handleStepAdd(elem.name, flowName, 'ingestion'); }}
                    >{elem.name}</div>
                </Menu.Item>
            )) : null }
            </Menu.ItemGroup>
            <Menu.ItemGroup title="Map">
            { props.steps && props.steps['mappingSteps'] && props.steps['mappingSteps'].length > 0 ? props.steps['mappingSteps'].map((elem,index) => (
                <Menu.Item key={index}>
                    <div
                        onClick={() => { handleStepAdd(elem.name, flowName, 'mapping'); }}
                    >{elem.name}</div>
                </Menu.Item>
            )) : null }
            </Menu.ItemGroup>
        </Menu>
    );};

    const panelActions = (name, i) => (
        <div
            id="panelActions"
            onClick={event => {
                event.stopPropagation(); // Do not trigger collapse
                event.preventDefault();
            }}
        >
            <Dropdown
                overlay={stepMenu(name)}
                trigger={['click']}
                disabled={!props.canWriteFlow}
                overlayClassName='stepMenu'
            >
                {props.canWriteFlow ?
                  <MLButton
                    className={styles.addStep}
                    size="default"
                    aria-label={'addStep-'+i}
                    style={{}}
                    type="primary"
                  >Add Step <DownOutlined /></MLButton>
                  :
                  <MLTooltip title={SecurityTooltips.missingPermission} overlayStyle={{maxWidth: '175px'}} placement="bottom">
                      <span>
                          <MLButton
                            className={styles.addStep}
                            size="default"
                            aria-label={'addStepDisabled-'+i}
                            style={{ backgroundColor: '#f5f5f5', borderColor: '#f5f5f5'}}
                            type="primary"
                            disabled={!props.canWriteFlow}
                          >Add Step <DownOutlined /></MLButton>
                      </span>
                  </MLTooltip>
                 }
            </Dropdown>
            <span className={styles.deleteFlow}>
                {props.canWriteFlow ?
                    <MLTooltip title={'Delete Flow'} placement="bottom">
                        <i aria-label={`deleteFlow-${name}`}>
                            <FontAwesomeIcon
                                icon={faTrashAlt}
                                onClick={() => { handleFlowDelete(name); }}
                                data-testid={`deleteFlow-${name}`}
                                className={styles.deleteIcon}
                                size="lg"/>
                        </i>
                    </MLTooltip>
                  :
                    <MLTooltip title={'Delete Flow: ' + SecurityTooltips.missingPermission} overlayStyle={{maxWidth: '225px'}} placement="bottom">
                        <i aria-label={`deleteFlowDisabled-${name}`}>
                            <FontAwesomeIcon
                                icon={faTrashAlt}
                                data-testid={`deleteFlow-${name}`}
                                className={styles.disabledDeleteIcon}
                                size="lg"/>
                        </i>
                    </MLTooltip> }
            </span>
        </div>
    );

    const flowHeader = (name, index) => (
        <MLTooltip title={props.canWriteFlow ? 'Edit Flow' : 'Flow Details'} placement="right">
            <span className={styles.flowName} onClick={(e) => OpenEditFlowDialog(e, index)}>
                {name}
            </span>
        </MLTooltip>
    );

    const OpenEditFlowDialog = (e, index) => {
        e.stopPropagation();
        setTitle('Edit Flow');
        setFlowData(prevState => ({ ...prevState, ...props.flows[index]}));
        setNewFlow(true);
    };

    const StepDefToTitle = (stepDef) => {
        return (StepDefinitionTypeTitles[stepDef]) ? StepDefinitionTypeTitles[stepDef] : 'Unknown';
    };

    const customRequest = async () => {
        const filenames = fileList.map(({name}) => name);
        if (filenames.length) {
            let fl = fileList;
            const formData = new FormData();

            fl.forEach(file => {
                formData.append('files', file);
            });
            await props.runStep(runningFlow, runningStep, formData)
                .then(resp => {
                    setShowUploadError(true);
                    setFileList([]);
                });
        }
    };

    const isRunning = (flowId, stepId) => {
        let result = props.running.find(r => (r.flowId === flowId && r.stepId === stepId));
        return result !== undefined;
    };

    function handleMouseOver(e, name) {
        setShowLinks(name);
    }

    const showStepRunResponse = async (step) => {
        try {
            let response = await axios.get('/api/jobs/' + step.jobId);
            if (response.status === 200) {
                props.showStepRunResponse(step, step.jobId, response.data);
            }
        } catch (error) {
            handleError(error);
        }
    };

    const lastRunResponse = (step) => {
        let stepEndTime, tooltipText;
        if (step.stepEndTime) {
            stepEndTime = new Date(step.stepEndTime).toLocaleString();
        }
        if (!step.lastRunStatus) {
            return ;
        }
        else if (step.lastRunStatus === "completed step " + step.stepNumber) {
            tooltipText = "Step last ran successfully on "+ stepEndTime;
            return(
                <MLTooltip overlayStyle={{maxWidth: '200px'}} title= {tooltipText} placement="bottom" onClick={(e) => showStepRunResponse(step)}>
                    <Icon type="check-circle" theme="filled" className={styles.successfulRun} />
                </MLTooltip>
            );

        }
        else if (step.lastRunStatus === "completed with errors step " + step.stepNumber) {
            tooltipText = "Step last ran with errors on "+ stepEndTime;
            return(
                <MLTooltip overlayStyle={{maxWidth: '190px'}} title={tooltipText} placement="bottom"  onClick={(e) => showStepRunResponse(step)}>
                    <Icon type="exclamation-circle" theme="filled" className={styles.unSuccessfulRun} />
                </MLTooltip>
            );
        }
        else {
            tooltipText = "Step last failed on "+ stepEndTime;
            return(
                <MLTooltip overlayStyle={{maxWidth: '175px'}} title={tooltipText} placement="bottom"  onClick={(e) => showStepRunResponse(step)}>
                    <Icon type="exclamation-circle" theme="filled" className={styles.unSuccessfulRun} />
                </MLTooltip>
            );
        }
    };

    const getFlowWithJobInfo = async (flowNum) => {
        let currentFlow = props.flows[flowNum];
        if (currentFlow['steps'].length > 0) {
            try {
                let response = await axios.get('/api/flows/' + currentFlow.name + "/latestJobInfo");
                if (response.status === 200 && response.data) {
                    let currentFlowJobInfo = {};
                    currentFlowJobInfo[currentFlow["name"]] = response.data["steps"];
                    setLatestJobData({...latestJobData, ...currentFlowJobInfo});
                }
            } catch (error) {
                console.error('Error getting latest job info ', error);
            }
        }
    };

    let panels;
    
    if (props.flows) {
        panels = props.flows.map((flow, i) => {
            let flowName = flow.name;
            let cards = flow.steps.map((step, index) => {
                let sourceFormat = step.sourceFormat;
                let stepNumber = step.stepNumber;
                let viewStepId = `${flowName}-${stepNumber}`;
                let stepDefinitionType = step.stepDefinitionType ? step.stepDefinitionType.toLowerCase():'';
                let stepDefinitionTypeTitle = StepDefinitionTypeTitles[stepDefinitionType];
                return (
                  <div key={viewStepId}>
                    <Card
                        className={styles.cardStyle}
                        title={StepDefToTitle(step.stepDefinitionType)}
                        size="small"
                        actions={[
                            <span className={styles.stepResponse}>{
                                latestJobData && latestJobData[flowName] && latestJobData[flowName][index]
                                ? lastRunResponse(latestJobData[flowName][index])
                                : ''
                            }</span>
                        ]}
                        extra={
                            <div className={styles.actions}>
                                {props.hasOperatorRole ?
                                    step.stepDefinitionType.toLowerCase() === "ingestion" ?
                                        <div {...getRootProps()} style={{display: 'inline-block'}}>
                                            <input {...getInputProps()} id="fileUpload"/>
                                            <div
                                                className={styles.run}
                                                aria-label={`runStep-${step.stepName}`}
                                                data-testid={'runStep-' + stepNumber}
                                                onClick={()=>{
                                                    setShowUploadError(false);
                                                    setRunningStep(step);
                                                    setRunningFlow(flowName);
                                                    openFilePicker();
                                                }}
                                            >
                                                <MLTooltip title={RunToolTips.ingestionStep} placement="bottom">
                                                    <Icon type="play-circle" theme="filled" />
                                                </MLTooltip>
                                            </div>
                                        </div>
                                        :
                                        <div
                                            className={styles.run}
                                            onClick={() =>{
                                                setShowUploadError(false);
                                                props.runStep(flowName, step);
                                            }}
                                            aria-label={`runStep-${step.stepName}`}
                                            data-testid={'runStep-' + stepNumber}
                                        >
                                            <MLTooltip title={RunToolTips.otherSteps} placement="bottom">
                                                <Icon type="play-circle" theme="filled" />
                                            </MLTooltip>
                                        </div>
                                    :
                                    <div
                                        className={styles.disabledRun}
                                        onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}
                                        aria-label={'runStepDisabled-' + step.stepName}
                                        data-testid={'runStepDisabled-' + stepNumber}
                                    >
                                        <Icon type="play-circle" theme="filled" />
                                    </div>
                                }
                                {props.canWriteFlow ?
                                    <MLTooltip title={RunToolTips.removeStep} placement="bottom">
                                        <div className={styles.delete} aria-label={`deleteStep-${step.stepName}`} onClick={() => handleStepDelete(flowName, step)}><Icon type="close" /></div>
                                    </MLTooltip> :
                                    <MLTooltip title={RunToolTips.removeStep} placement="bottom">
                                        <div className={styles.disabledDelete} aria-label={`deleteStepDisabled-${step.stepName}`} onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}><Icon type="close" /></div>
                                    </MLTooltip>
                                }
                            </div>
                        }
                    >
                        <div  aria-label={viewStepId + '-content'} className={styles.cardContent}
                             onMouseOver={(e) => handleMouseOver(e, viewStepId)}
                             onMouseLeave={(e) => setShowLinks('')} >
                            { sourceFormat ?
                                <div className={styles.format} style={sourceFormatStyle(sourceFormat)} >{sourceFormatOptions[sourceFormat].label}</div>
                                : null }
                            <div className={styles.name}>{step.stepName}</div>
                            <div className={styles.cardLinks} style={{display: showLinks === viewStepId && step.stepId && authorityByStepType[stepDefinitionType]  ? 'block' : 'none'}}>
                                 <Link id={'tiles-step-view-'+viewStepId} to={
                                    {pathname: `/tiles/${stepDefinitionType === 'ingestion' ? 'load': 'curate'}`,
                                        state: {
                                            stepToView : step.stepId,
                                            stepDefinitionType : stepDefinitionType,
                                            targetEntityType: step.targetEntityType
                                        }}}><div className={styles.cardLink} data-testid={`${viewStepId}-viewStep`}>View {stepDefinitionTypeTitle} steps</div></Link>
                            </div>
                        </div>
                        <div className = {styles.uploadError}>
                            { showUploadError && flowName == runningFlow && stepNumber == runningStep.stepNumber ? props.uploadError : ''}
                        </div>
                        <div className={styles.running} style={{display: isRunning(flowName, stepNumber)  ? 'block' : 'none'}}>
                            <div><MLSpin data-testid="spinner"/></div>
                            <div className={styles.runningLabel}>Running...</div>
                        </div>
                    </Card>
                  </div>
                );
            });
            return (
                <Panel header={flowHeader(flowName, i)} key={i} extra={panelActions(flowName, i)}>
                    <div className={styles.panelContent} ref={flowPanels[flowName]}>
                        {cards}
                    </div>
                </Panel>
            );
        });
    }

    //Update activeKeys on Collapse Panel interactions
    const handlePanelInteraction = (key) => {
        /* Request to get latest job info for the flow will be made when someone opens the pane for the first time
        or opens a new pane. Closing the pane shouldn't send any requests*/
        if (!activeKeys || (key.length > activeKeys.length && key.length > 0)) {
            getFlowWithJobInfo(key[key.length - 1]);
        }
        setActiveKeys([...key]);
    };

   return (
    <div id="flows-container" className={styles.flowsContainer}>
        {props.canReadFlow || props.canWriteFlow ?
            <>
                <div className={styles.createContainer}>
                    {props.canWriteFlow ?
                      <MLButton
                        className={!props.canWriteFlow ? styles.createButtonDisabled : styles.createButton} size="default"
                        type="primary" onClick={OpenAddNewDialog}
                        disabled={!props.canWriteFlow}
                        aria-label={'create-flow' + (!props.canWriteFlow ? '-disabled' : '')}
                      >Create Flow</MLButton>
                      :
                      <MLTooltip title={SecurityTooltips.missingPermission} overlayStyle={{maxWidth: '175px'}}>
                          <span>
                              <MLButton
                                className={!props.canWriteFlow ? styles.createButtonDisabled : styles.createButton} size="default"
                                type="primary" onClick={OpenAddNewDialog}
                                disabled={!props.canWriteFlow}
                                aria-label={'create-flow' + (!props.canWriteFlow ? '-disabled' : '')}
                              >Create Flow</MLButton>
                          </span>
                      </MLTooltip>
                    }
                </div>
                <Collapse
                    className={styles.collapseFlows}
                    activeKey={activeKeys}
                    onChange={handlePanelInteraction}
                >
                    {panels}
                </Collapse>
                <NewFlowDialog
                    newFlow={newFlow || openNewFlow}
                    title={title}
                    setNewFlow={setNewFlow}
                    setAddedFlowName={setAddedFlowName}
                    createFlow={props.createFlow}
                    createAdd={createAdd}
                    updateFlow={props.updateFlow}
                    flowData={flowData}
                    canWriteFlow={props.canWriteFlow}
                    addStepToFlow={props.addStepToFlow}
                    newStepToFlowOptions={props.newStepToFlowOptions}
                    setOpenNewFlow={setOpenNewFlow}
                />
                {deleteConfirmation}
                {deleteStepConfirmation}
                {addStepConfirmation}
            </> :
            <div></div>
        }
    </div>
   );
};

export default Flows;
