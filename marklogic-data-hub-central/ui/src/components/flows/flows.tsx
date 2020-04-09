import React, { useState, CSSProperties } from 'react';
import { Collapse, Spin, Icon, Card, Tooltip, Modal } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { MlButton } from 'marklogic-ui-library';
import NewFlowDialog from './new-flow-dialog/new-flow-dialog';
import sourceFormatOptions from '../../config/formats.config';
import styles from './flows.module.scss';

const { Panel } = Collapse;

interface Props {
    flows: any;
    loads: any;
    deleteFlow: any;
    createFlow: any;
    updateFlow: any;
    deleteStep: any;
    runStep: any;
    canReadFlows: boolean;
    canWriteFlows: boolean;
    hasOperatorRole: boolean;
    running: any;
}

const StepDefinitionTypeTitles = {
    'INGESTION': 'Load',
    'MAPPING': 'Map',
    'MASTERING': 'Master',
    'MATCHING': 'Match',
    'MERGING': 'Merge',
    'CUSTOM': 'Custom'
}

const Flows: React.FC<Props> = (props) => {
    const [newFlow, setNewFlow] = useState(false);
    const [title, setTitle] = useState('');
    const [flowData, setFlowData] = useState({});
    const [dialogVisible, setDialogVisible] = useState(false);
    const [stepDialogVisible, setStepDialogVisible] = useState(false);
    const [flowName, setFlowName] = useState('');
    const [stepName, setStepName] = useState('');

    const OpenAddNewDialog = () => {
        setTitle('New Flow');
        setNewFlow(true);
    }

    const getLoadSourceFormat = (loadId) => {
        let found = props.loads.find(load => {
            return load.name === loadId;
        });
        return found ? found.sourceFormat : 'json';
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

    const handleStepDelete = (fName, sName) => {
        setStepDialogVisible(true);
        setFlowName(fName);
        setStepName(sName);
    }

    const onOk = (name) => {
        props.deleteFlow(name)
        setDialogVisible(false);
    }

    const onStepOk = (fName, sName) => {
        props.deleteStep(fName, sName)
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
            onOk={() => onStepOk(flowName, stepName)}
            onCancel={() => onCancel()}
            width={350}
        >
            <div style={{fontSize: '16px', padding: '10px'}}>Are you sure you want to delete step "{stepName}" from flow "{flowName}"?</div>
        </Modal>
    );

    const deleteIcon = (name) => (
        <span className={styles.deleteFlow}>
            {props.canWriteFlows ?
                <Tooltip title={'Delete Flow'} placement="bottom">
                    <i>
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
                    <i>
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
        <Tooltip title={props.canWriteFlows ? 'Edit Flow' : 'Flow Details'} placement="right">
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

    const isRunning = (flowId, stepId) => {
        let result = props.running.find(r => (r.flowId === flowId && r.stepId === stepId));
        return result !== undefined;
    }

    let panels;
    if (props.flows) {
        panels = props.flows.map((flow, i) => {
            let name = flow.name;
            let indexes = Object.keys(flow.steps);
            let cards = indexes.map((i) => {
                let step = flow.steps[i];
                // TODO Handle steps that don't have input formats
                let stepFormat = (step.fileLocations) ?  getLoadSourceFormat(step.name) : 'json';
                return (
                    <Card 
                        style={{ width: 300, marginRight: 20 }} 
                        title={StepDefToTitle(step.stepDefinitionType)} 
                        size="small"
                        extra={
                            <div className={styles.actions}>
                                {props.hasOperatorRole ?
                                    <div 
                                        className={styles.run} 
                                        onClick={() => props.runStep(name, step.name + '-' + step.stepDefinitionType, step.name, StepDefToTitle(step.stepDefinitionType))}
                                    >
                                        <Icon type="play-circle" theme="filled" />
                                    </div> :
                                    <div 
                                        className={styles.disabledRun} 
                                        onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}
                                    >
                                        <Icon type="play-circle" theme="filled" />
                                    </div>
                                }
                                {props.canWriteFlows ?
                                    <Tooltip title={'Delete Step'} placement="bottom">
                                        <div className={styles.delete} onClick={() => handleStepDelete(flow.name, step.name)}><Icon type="close" /></div>
                                    </Tooltip> :
                                    <Tooltip title={'Delete Step'} placement="bottom">
                                        <div className={styles.disabledDelete} onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}><Icon type="close" /></div>
                                    </Tooltip> 
                                }
                            </div>
                        }
                    >
                        <div className={styles.cardContent}>
                            <div className={styles.format} style={sourceFormatStyle(stepFormat)}>{stepFormat.toUpperCase()}</div>
                            <div className={styles.name}>{step.name}</div>
                        </div>
                        <div className={styles.running} style={{display: isRunning(name, step.name + '-' + step.stepDefinitionType)  ? 'block' : 'none'}}>
                            <div><Spin /></div>
                            <div className={styles.runningLabel}>Running...</div>
                        </div>
                    </Card>
                )
            });
            return (
                <Panel header={flowHeader(flow.name, i)} key={i} extra={deleteIcon(name)}>
                    <div className={styles.panelContent}>
                        {cards}
                    </div>
                </Panel>
            )
        })
    }

   return (
    <div id="flows-container" className={styles.flowsContainer}>
        {props.canReadFlows || props.canWriteFlows ?
            <>
                <div className={styles.createContainer}>
                    <MlButton 
                        className={styles.createButton} size="default"
                        type="primary" onClick={OpenAddNewDialog} 
                        disabled={!props.canWriteFlows}
                    >Create Flow</MlButton>
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
                    canWriteFlows={props.canWriteFlows}
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
