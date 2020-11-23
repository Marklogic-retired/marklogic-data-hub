import React, { useState, useEffect, useContext } from 'react';
import Axios from 'axios';
import { useHistory } from 'react-router-dom';
import { MLPageHeader, MLButton } from '@marklogic/design-system';
import styles from './merging-step-detail.module.scss';
import NumberIcon from '../../../number-icon/number-icon';
import { MLTable, MLTooltip } from '@marklogic/design-system';
import { CurationContext } from '../../../../util/curation-context';
import {
    MergingStep
} from '../../../../types/curation-types';
import {MergeStrategyTooltips, MergingStepDetailText} from '../../../../config/tooltips.config';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import MultiSlider from "../../matching/multi-slider/multi-slider";
import EditMergeStrategyDialog from "../merge-strategy-dialog/merge-strategy-dialog";
import AddMergeRuleDialog from "../add-merge-rule/add-merge-rule-dialog";
import { RightOutlined,DownOutlined } from "@ant-design/icons";
import {Icon, Modal, Table} from "antd";
import {updateMergingArtifact} from "../../../../api/merging";


const DEFAULT_MERGING_STEP: MergingStep = {
    name: '',
    description: '',
    additionalCollections: [],
    collections: [],
    lastUpdatedLocation: {
        namespaces: {},
        documentXPath: '',
    },
    permissions: '',
    provenanceGranularityLevel: '',
    selectedSource: '',
    sourceDatabase: '',
    sourceQuery: '',
    stepDefinitionName: '',
    stepDefinitionType: '',
    stepId: '',
    targetDatabase: '',
    targetEntityType: '',
    targetFormat: '',
    mergeStrategies: [],
    mergeRules: []
}

const MergingStepDetail: React.FC = () => {
    const history = useHistory<any>();
    const { curationOptions, updateActiveStepArtifact } = useContext(CurationContext);
    const [mergingStep, setMergingStep] = useState<MergingStep>(DEFAULT_MERGING_STEP);
    const [showCreateEditStrategyModal, toggleCreateEditStrategyModal] = useState(false);
    const [isEditStrategy, toggleIsEditStrategy] = useState(false);
    const [openAddMergeRuleDialog, setOpenAddMergeRuleDialog] = useState(false);
    const [currentStrategyName, setCurrentStrategyName] = useState('');
    const [currentMergeObj, setCurrentMergeObj] = useState<any>({});
    const [deleteModalVisibility, setDeleteModalVisibility] = useState(false);
    const [sourceNames, setSourceNames] = useState<string[]>([]);
    const mergeStrategiesData = new Array();
    const mergeRulesData = new Array();
    let commonStrategyNames:any = [];

    useEffect(() => {
        if (Object.keys(curationOptions.activeStep.stepArtifact).length !== 0) {
            const mergingStepArtifact: MergingStep = curationOptions.activeStep.stepArtifact;
            setMergingStep(mergingStepArtifact);
            retrieveCalculatedMergingActivity(mergingStepArtifact);
        } else {
            history.push('/tiles/curate');
        }
    }, [JSON.stringify(curationOptions.activeStep.stepArtifact)]);

    const retrieveCalculatedMergingActivity = async (mergingStepArtifact: MergingStep) => {
        if (mergingStepArtifact && mergingStepArtifact.name) {
            try {
                const calculatedMergingActivityResp = await Axios.get(`/api/steps/merging/${mergingStepArtifact.name}/calculateMergingActivity`);
                if (calculatedMergingActivityResp.status === 200) {
                    setSourceNames(calculatedMergingActivityResp.data.sourceNames || []);
                }
            } catch (error) {
                let message = error.response && error.response.data && error.response.data.message;
                console.error('Error while retrieving information about merge step', message || error);
            }
        }
    };

    const editMergeStrategy = (strategyName) => {
     toggleCreateEditStrategyModal(true);
     setCurrentStrategyName(strategyName);
     toggleIsEditStrategy(true);
    }

    const mergeStrategyColumns : any = [
        {
            title: 'Strategy Name',
            dataIndex: 'strategyName',
            key: 'strategyName',
            sorter: (a, b) => a.strategyName.localeCompare(b.strategyName),
            width: 200,
            sortDirections: ["ascend", "descend", "ascend"],
            render: text => {
                return (
                    <span className={styles.link}
                          id={'strategy-name-link'}
                          onClick={ ()=> editMergeStrategy(text)}>
                            {text}</span>
                );
            }
        },
        {
            title: 'Max Values',
            dataIndex: 'maxValues',
            key: 'maxValues',
            sorter: (a, b) => {a = a.maxValues || '';
                               b = b.maxValues || '';
                               return a.localeCompare(b)},
            sortDirections: ["ascend", "descend", "ascend"],
            width: 200,
        },
        {
            title: 'Max Sources',
            dataIndex: 'maxSources',
            key: 'maxSources',
            sortDirections: ["ascend", "descend", "ascend"],
            sorter: (a, b) => {a = a.maxSources || '';
                b = b.maxSources || '';
                return a.localeCompare(b)},
            width: 200,
        },
        {
            title: 'Delete',
            dataIndex: 'delete',
            key: 'delete',
            align: 'center' as 'center',
            render: text => <a data-testid={'delete'}>{text}</a>,
            width: 75
        }
    ];

    const mergeRuleColumns : any = [
        {
            title: 'Property',
            dataIndex: 'property',
            key: 'property',
            sorter: (a, b) => {a = a.property || '';
                b = b.property || '';
                return a.localeCompare(b)},
            width: 200,
            sortDirections: ["ascend", "descend", "ascend"],
        },
        {
            title: 'Merge Type',
            dataIndex: 'mergeType',
            key: 'mergeType',
            sorter: (a, b) => {a = a.mergeType || '';
                b = b.mergeType || '';
                return a.localeCompare(b)},
            sortDirections: ["ascend", "descend", "ascend"],
            width: 200,
        },
        {
            title: 'Strategy',
            dataIndex: 'strategy',
            key: 'strategy',
            sortDirections: ["ascend", "descend", "ascend"],
            sorter: (a, b) => {a = a.strategy || '';
                b = b.strategy || '';
                return a.localeCompare(b)},
            width: 200,
        },
        {
            title: 'Delete',
            dataIndex: 'delete',
            key: 'delete',
            align: 'center' as 'center',
            render: text => <a data-testid={'delete'} >{text}</a>,
            width: 75
        }
    ];

    for(let key of mergingStep.mergeRules){
        for(let key1 of mergingStep.mergeStrategies){
            if(key.mergeStrategyName === key1.strategyName && commonStrategyNames.indexOf(key.mergeStrategyName)=== -1){
                commonStrategyNames.push(key.mergeStrategyName);
            }
        }
    }


    mergingStep && mergingStep.mergeStrategies.length > 0 && mergingStep.mergeStrategies.map((i) => {
        mergeStrategiesData.push(
            {
                strategyName: i['strategyName'],
                maxValues: i['maxValues'],
                maxSources: i['maxSources'],
                priorityOrder: i.hasOwnProperty('priorityOrder') ? true : false,
                delete: <MLTooltip title={commonStrategyNames.indexOf(i['strategyName']) !==-1 ? MergeStrategyTooltips.delete : ''}>
                    <FontAwesomeIcon
                        icon={faTrashAlt}
                        size='lg'
                        className={commonStrategyNames.indexOf(i['strategyName']) !==-1 ? styles.disabledDeleteIcon : styles.enabledDeleteIcon}
                        data-testid={`mergestrategy-${i.strategyName}`}
                        onClick={() => onDelete(i)}/>
                </MLTooltip>
            }
        );
    });


    mergingStep && mergingStep.mergeRules.length > 0 && mergingStep.mergeRules.map((i) => {
        mergeRulesData.push(
            {
                property: i['entityPropertyPath'],
                mergeType: i['mergeType'],
                strategy: i['mergeStrategyName'],
                delete: <FontAwesomeIcon icon={faTrashAlt} color='#B32424' size='lg'  data-testid={`mergerule-${i.entityPropertyPath}`} onClick={() => onDelete(i)}/>
            }
        );
    });


    const handleSlider = (values) => {
        return;
    };

    const handleDelete = (values) => {
        return;
    };

    const handleEdit = (values) => {
        return;
    };

    const expandedRowRender = (strategyObj) => {
        let priorityOrderStrategyOptions:any[] = [];
        for(let strategy of mergingStep.mergeStrategies){
            if(strategy.hasOwnProperty('priorityOrder') && strategy.strategyName === strategyObj.strategyName){
                for(let key of strategy.priorityOrder.sources){
                        const priorityOrderSourceObject = {
                            props: [{
                                prop: 'Source',
                                type: key.sourceName,
                            }],
                            value: key.weight,
                        };
                        priorityOrderStrategyOptions.push(priorityOrderSourceObject);
                }
                if(strategy.priorityOrder.hasOwnProperty('lengthWeight')){
                    const priorityOrderLengthObject = {
                        props: [{
                            prop: 'Length',
                            type: '',
                        }],
                        value: strategy.priorityOrder.lengthWeight,
                    };
                    priorityOrderStrategyOptions.push(priorityOrderLengthObject);
                }
                let timeStampObject = {
                    props: [{
                        prop: 'Timestamp',
                        type: '',
                    }],
                    value: 0,
                }
                //priorityOrderStrategyOptions.push(timeStampObject);
            }
        }
            return <>
                <div className={styles.priorityOrderContainer}><p className={styles.priorityText}>Priority Order<MLTooltip title={''}>
                    <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                </MLTooltip></p>
                    <MultiSlider options={priorityOrderStrategyOptions} handleSlider={handleSlider} handleEdit={handleEdit} handleDelete={handleDelete}/>
                </div>
            </>;
    };

    const deleteModal = (
        <Modal
            width={500}
            visible={deleteModalVisibility}
            destroyOnClose={true}
            closable={false}
            className={styles.confirmModal}
            maskClosable={false}
            footer={null}
        >
            {currentMergeObj.hasOwnProperty('entityPropertyPath') ? <p aria-label="delete-merge-rule-text" className={styles.deleteMessage}>Are you sure you want to delete <b>{currentMergeObj.entityPropertyPath} - {currentMergeObj.mergeType}</b> merge rule ?</p> :
                <p aria-label="delete-merge-strategy-text" className={styles.deleteMessage}>Are you sure you want to delete <b>{currentMergeObj.strategyName}</b> merge strategy ?</p>}
            <div className={styles.footer}>
                <MLButton
                    aria-label={`delete-merge-modal-discard`}
                    size="default"
                    onClick={() => setDeleteModalVisibility(false)}
                >No</MLButton>
                <MLButton
                    className={styles.saveButton}
                    aria-label={`delete-merge-modal-confirm`}
                    type="primary"
                    size="default"
                    onClick={() => deleteConfirm()}
                >Yes</MLButton>
            </div>
        </Modal>
    )

    const onDelete = (currentObj) => {
      setDeleteModalVisibility(true);
      setCurrentMergeObj(currentObj);
    }

    const deleteConfirm = async() =>{
        let stepArtifact = curationOptions.activeStep.stepArtifact;
        if(currentMergeObj.hasOwnProperty('entityPropertyPath')){
            let updateStepArtifactMergeRules = curationOptions.activeStep.stepArtifact.mergeRules;
            let index = updateStepArtifactMergeRules.findIndex( mergeRule => (mergeRule.entityPropertyPath === currentMergeObj.entityPropertyPath)
                && (mergeRule.mergeType === currentMergeObj.mergeType));
            updateStepArtifactMergeRules.splice(index, 1);
            stepArtifact.mergeRules = updateStepArtifactMergeRules;
        }
        else{
            let updateStepArtifactMergeStartegies = curationOptions.activeStep.stepArtifact.mergeStrategies;
            let index = updateStepArtifactMergeStartegies.findIndex( mergeStrategy => (mergeStrategy.strategyName === currentMergeObj.strategyName));
            updateStepArtifactMergeStartegies.splice(index, 1);
            stepArtifact.mergeStrategies = updateStepArtifactMergeStartegies;
        }
        await updateMergingArtifact(stepArtifact);
        updateActiveStepArtifact(stepArtifact);
        setDeleteModalVisibility(false);
    }

    return (
        <>
            <MLPageHeader
                className={styles.pageHeader}
                onBack={() => history.push('/tiles/curate')}
                title={mergingStep.name}
            />
            <p className={styles.headerDescription}>{MergingStepDetailText.description}</p>
            <div className={styles.mergingDetailContainer}>

                <div className={styles.stepNumberContainer}>
                    <NumberIcon value={1} />
                    <div className={styles.stepText}>Define merge strategies</div>
                </div>
                <div className={styles.greyContainer}>
                    <div className={styles.textContainer}>
                        <p>A <span className={styles.italic}>merge strategy</span><span> defines how to combine the property values of
                            candidate entities, but the merge strategy is not active until assigned to a merge rule.
                            A merge strategy can be assigned to multiple
                            merge rules.</span>
                        </p>
                    </div>
                    <div className={styles.addButtonContainer}>
                        <MLButton aria-label="add-merge-strategy" type="primary" size="default" className={styles.addMergeButton} onClick={() => {
                            toggleCreateEditStrategyModal(true);
                            toggleIsEditStrategy(false);
                            setCurrentStrategyName('')}
                        }>Add</MLButton>
                    </div>
                    <div>
                        <Table
                            rowKey="strategy"
                            className={styles.table}
                            columns={mergeStrategyColumns}
                            dataSource={mergeStrategiesData}
                            size="middle"
                            expandedRowRender={expandedRowRender}
                            expandIcon={(expandProps)=>{
                                if(expandProps.record.priorityOrder) {
                                    return (expandProps.expanded ? (
                                            <DownOutlined onClick={e => expandProps.onExpand(expandProps.record, e)} />
                                        ) : (
                                            <RightOutlined onClick={e => expandProps.onExpand(expandProps.record, e)} />
                                        )
                                    )
                                }
                                else
                                    return (false)
                            }}
                        />
                    </div>
                </div>
                <div className={styles.stepNumberContainer}>
                    <NumberIcon value={2} />
                    <div className={styles.stepText}>Add merge rules</div>
                </div>
                <div className={styles.greyContainer}>
                    <div className={styles.textContainer}>
                        <div><p>A <span className={styles.italic}>merge rule</span><span> defines how to combine the values of a specific property</span>
                        </p></div>
                        <div className={styles.addButtonContainer}>
                            <MLButton aria-label="add-merge-rule" type="primary" size="default" className={styles.addMergeButton} onClick={() => {setOpenAddMergeRuleDialog(true)}}>Add</MLButton>
                        </div>
                    </div>
                    <MLTable
                        rowKey="rule"
                        className={styles.table}
                        columns={mergeRuleColumns}
                        dataSource={mergeRulesData}
                        size="middle"
                    />
                </div>
                <EditMergeStrategyDialog
                    sourceNames={sourceNames}
                    strategyName={currentStrategyName}
                    createEditMergeStrategyDialog={showCreateEditStrategyModal}
                    setOpenEditMergeStrategyDialog={toggleCreateEditStrategyModal}
                    isEditStrategy={isEditStrategy}
                />
                <AddMergeRuleDialog
                    data={[]}
                    sourceNames={sourceNames}
                    openAddMergeRuleDialog={openAddMergeRuleDialog}
                    setOpenAddMergeRuleDialog={setOpenAddMergeRuleDialog}
                />
                {deleteModal}
            </div>
        </>
    )
}

export default MergingStepDetail;
