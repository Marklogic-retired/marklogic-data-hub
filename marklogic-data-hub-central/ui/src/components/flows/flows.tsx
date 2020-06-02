import React, { useState, CSSProperties } from 'react';
import { Collapse, Spin, Icon, Card, Tooltip, Modal, Upload, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { MLButton } from '@marklogic/design-system';
import NewFlowDialog from './new-flow-dialog/new-flow-dialog';
import sourceFormatOptions from '../../config/formats.config';
import {RunToolTips} from '../../config/tooltips.config';
import styles from './flows.module.scss';

const { Panel } = Collapse;

interface Props {
    flows: any;
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
}

const Flows: React.FC<Props> = (props) => {
    const [newFlow, setNewFlow] = useState(false);
    const [title, setTitle] = useState('');
    const [flowData, setFlowData] = useState({});
    const [dialogVisible, setDialogVisible] = useState(false);
    const [stepDialogVisible, setStepDialogVisible] = useState(false);
    const [flowName, setFlowName] = useState('');
    const [stepName, setStepName] = useState('');
    const [stepType, setStepType] = useState('');
    const [stepNumber, setStepNumber] = useState('');
    const [runningStep, setRunningStep] = useState<any>({});
    const [runningFlow, setRunningFlow] = useState<any>('');
    const [fileList, setFileList] = useState<any[]>([]);
    const [showUploadError, setShowUploadError] = useState(false);

    const OpenAddNewDialog = () => {
        setTitle('New Flow');
        setNewFlow(true);
    }

    //Custom CSS for source Format
    const sourceFormatStyle = (sourceFmt) => {
        let customStyles: CSSProperties;
        if (!sourceFmt) {
            customStyles = {
                float: 'left',
                backgroundColor: '#fff',
                color: '#fff',
                padding: '5px'
            }
        } else {
            customStyles = {
                float: 'left',
                backgroundColor: (sourceFmt.toUpperCase() === 'XML' ? sourceFormatOptions.xml.color : (sourceFmt.toUpperCase() === 'JSON' ? sourceFormatOptions.json.color : (sourceFmt.toUpperCase() === 'CSV' ? sourceFormatOptions.csv.color : sourceFormatOptions.default.color))),
                fontSize: '12px',
                borderRadius: '50%',
                textAlign: 'left',
                color: '#ffffff',
                padding: '5px'
            }
        }
        return customStyles;
    }

    const handleFlowDelete = (name) => {
        setDialogVisible(true);
        setFlowName(name);
    }

    const handleStepDelete = (flowName, stepDetails) => {
        setStepDialogVisible(true);
        setFlowName(flowName);
        setStepName(stepDetails.stepName);
        setStepType(stepDetails.stepDefinitionType);
        setStepNumber(stepDetails.stepNumber);
    }

    const onOk = (name) => {
        props.deleteFlow(name)
        setDialogVisible(false);
    }

    const onStepOk = (flowName, stepNumber) => {
        props.deleteStep(flowName, stepNumber)
        setStepDialogVisible(false);
    }

    const onCancel = () => {
        setDialogVisible(false);
        setStepDialogVisible(false);
    }

    const deleteConfirmation = (
        <Modal
            visible={dialogVisible}
            okText='Yes'
            okType='primary'
            cancelText='No'
            onOk={() => onOk(flowName)}
            onCancel={() => onCancel()}
            width={350}
        >
            <div style={{fontSize: '16px', padding: '10px'}}>Are you sure you want to delete flow "{flowName}"?</div>
        </Modal>
    );

    const deleteStepConfirmation = (
        <Modal
            visible={stepDialogVisible}
            okText='Yes'
            okType='primary'
            cancelText='No'
            onOk={() => onStepOk(flowName, stepNumber)}
            onCancel={() => onCancel()}
            width={350}
        >
            <div style={{fontSize: '16px', padding: '10px'}}>Are you sure you want to delete step "{stepName}" from flow "{flowName}"?</div>
        </Modal>
    );

    const deleteIcon = (name, i) => (
        <span className={styles.deleteFlow}>
            {props.canWriteFlow ?
                <Tooltip title={'Delete Flow'} placement="bottom">
                    <i aria-label={'deleteFlow-' + i}>
                        <FontAwesomeIcon
                            icon={faTrashAlt}
                            onClick={event => {
                                event.stopPropagation(); // Do not trigger collapse
                                handleFlowDelete(name);
                            }}
                            className={styles.deleteIcon}
                            size="lg"/>
                    </i>
                </Tooltip> :
                <Tooltip title={'Delete'} placement="bottom">
                    <i aria-label={'deleteStep-' + i}>
                        <FontAwesomeIcon
                            icon={faTrashAlt}
                            onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                            }}
                            className={styles.disabledDeleteIcon}
                            size="lg"/>
                    </i>
                </Tooltip> }
        </span>
    );

    const flowHeader = (name, index) => (
        <Tooltip title={props.canWriteFlow ? 'Edit Flow' : 'Flow Details'} placement="right">
            <span className={styles.flowName} onClick={(e) => OpenEditFlowDialog(e, index)}>
                {name}
            </span>
        </Tooltip>
    );

    const OpenEditFlowDialog = (e, index) => {
        e.stopPropagation();
        setTitle('Edit Flow');
        setFlowData(prevState => ({ ...prevState, ...props.flows[index]}));
        setNewFlow(true);
    }

    const StepDefToTitle = (stepDef) => {
        return (StepDefinitionTypeTitles[stepDef]) ? StepDefinitionTypeTitles[stepDef] : 'Unknown';
    }

    const uploadProps = {
        onRemove: file => {
            setFileList(prevState => {
                const index = prevState.indexOf(file);
                const newFileList = prevState.slice();
                newFileList.splice(index, 1);
                return newFileList;
            });
        },
        beforeUpload: (file: any) => {
            setFileList(prevState => ([...prevState , file]));
            return true;
        },
        showUploadList:false,
        fileList,
    }

    const customRequest = async option => {
        const {file} = option;
        const filenames = fileList.map(({name}) => name);
        if (filenames.indexOf(file.name) === (filenames.length - 1)) {
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
    }

    let panels;
    if (props.flows) {
        panels = props.flows.map((flow, i) => {
            let flowName = flow.name;
            let cards = flow.steps.map(step => {
                let sourceFormat = step.sourceFormat;
                let stepNumber = step.stepNumber;
                return (
                    <Card
                        style={{ width: 300, marginRight: 20 }}
                        title={StepDefToTitle(step.stepDefinitionType)}
                        key={stepNumber}
                        size="small"
                        extra={
                            <div className={styles.actions}>
                                {props.hasOperatorRole ?
                                    step.stepDefinitionType.toLowerCase() === "ingestion" ?
                                        <Upload id="fileUpload"
                                                multiple={true}
                                                className={styles.upload}
                                                customRequest={customRequest}
                                                showUploadList = {false}
                                                {...uploadProps}
                                        >
                                        <Tooltip title={RunToolTips.ingestionStep} placement="bottom">
                                        <div
                                            className={styles.run}
                                            aria-label={'runStep-' + stepNumber}
                                            onClick={()=>{
                                                setShowUploadError(false);
                                                setRunningStep(step)
                                                setRunningFlow(flowName)
                                            }}
                                        >
                                            <Icon type="play-circle" theme="filled" />
                                        </div>
                                        </Tooltip>

                                        </Upload>
                                        :
                                        <Tooltip title={RunToolTips.otherSteps} placement="bottom">
                                        <div
                                            className={styles.run}
                                            onClick={() =>{
                                                setShowUploadError(false);
                                                props.runStep(flowName, step)
                                            }}
                                            aria-label={'runStep-' + stepNumber}
                                        >
                                            <Icon type="play-circle" theme="filled" />
                                        </div>
                                        </Tooltip>
                                    :
                                    <div
                                        className={styles.disabledRun}
                                        onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}
                                        aria-label={'runStepDisabled-' + stepNumber}
                                    >
                                        <Icon type="play-circle" theme="filled" />
                                    </div>
                                }
                                {props.canWriteFlow ?
                                    <Tooltip title={'Delete Step'} placement="bottom">
                                        <div className={styles.delete} aria-label={'deleteStep-' + stepNumber} onClick={() => handleStepDelete(flowName, step)}><Icon type="close" /></div>
                                    </Tooltip> :
                                    <Tooltip title={'Delete Step'} placement="bottom">
                                        <div className={styles.disabledDelete} aria-label={'deleteStepDisabled-' + stepNumber} onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}><Icon type="close" /></div>
                                    </Tooltip>
                                }
                            </div>
                        }
                    >
                        <div className={styles.cardContent}>
                            { sourceFormat ?
                                <div className={styles.format} style={sourceFormatStyle(sourceFormat)}>{sourceFormat.toUpperCase()}</div>
                                : null }
                            <div className={styles.name}>{step.stepName}</div>
                        </div>

                        <div className = {styles.uploadError}>
                            { showUploadError && flowName == runningFlow && stepNumber == runningStep.stepNumber ? props.uploadError : ''}
                        </div>
                        <div className={styles.running} style={{display: isRunning(flowName, stepNumber)  ? 'block' : 'none'}}>
                            <div><Spin /></div>
                            <div className={styles.runningLabel}>Running...</div>
                        </div>
                    </Card>
                )
            });
            return (
                <Panel header={flowHeader(flowName, i)} key={i} extra={deleteIcon(flowName, i)}>
                    <div className={styles.panelContent}>
                        {cards}
                    </div>
                </Panel>
            )
        })
    }

   return (
    <div id="flows-container" className={styles.flowsContainer}>
        {props.canReadFlow || props.canWriteFlow ?
            <>
                <div className={styles.createContainer}>
                    <MLButton
                        className={styles.createButton} size="default"
                        type="primary" onClick={OpenAddNewDialog}
                        disabled={!props.canWriteFlow}
                    >Create Flow</MLButton>
                </div>
                <Collapse
                    className={styles.collapseFlows}
                >
                    {panels}
                </Collapse>
                <NewFlowDialog
                    newFlow={newFlow}
                    title={title}
                    setNewFlow={setNewFlow}
                    createFlow={props.createFlow}
                    updateFlow={props.updateFlow}
                    flowData={flowData}
                    canWriteFlow={props.canWriteFlow}
                />
                {deleteConfirmation}
                {deleteStepConfirmation}
            </> :
            <div></div>
        }
    </div>
   );
}

export default Flows;
