import React, {useState} from 'react';
import { Modal, Tabs } from 'antd';
import CreateEditLoad from '../load/create-edit-load/create-edit-load';
import CreateEditMapping from '../entities/mapping/create-edit-mapping/create-edit-mapping';
import CreateEditStep from '../entities/create-edit-step/create-edit-step';
import ViewCustom from '../entities/custom/view-custom/view-custom';
import AdvancedSettings from "../advanced-settings/advanced-settings";
import ConfirmYesNo from '../common/confirm-yes-no/confirm-yes-no';
import styles from './steps.module.scss';
import './steps.scss';
import { StepType } from '../../types/curation-types';
  
const { TabPane } = Tabs;

interface Props {
    isNewStep: boolean;
    createStep?: any;
    updateStep?: any;
    stepData: any;
    sourceDatabase?: any;
    canReadWrite: any;
    canReadOnly: any;
    tooltipsData: any;
    openStepSettings: any;
    setOpenStepSettings: any;
    activityType: string;
    canWrite?: any;
    targetEntityType?: any;
    toggleModal?: any;
}

const DEFAULT_TAB = '1';
  
const Steps: React.FC<Props> = (props) => {
    const [currentTab, setCurrentTab] = useState(DEFAULT_TAB);
    const [isValid, setIsValid] = useState(true);
    const [hasChanged, setHasChanged] = useState(false);
    const [discardChangesVisible, setDiscardChangesVisible] = useState(false);

    const onCancel = () => {
        if (hasChanged) {
            setDiscardChangesVisible(true);
        } else {
            props.setOpenStepSettings(false);
            resetTabs();
        }
    }

    const discardOk = () => {
        setDiscardChangesVisible(false);
        props.setOpenStepSettings(false);
        resetTabs();
        setIsValid(true);
    }
    
    const discardCancel = () => {
        setDiscardChangesVisible(false);
    }

    const discardChanges = <ConfirmYesNo
        visible={discardChangesVisible}
        type='discardChanges'
        onYes={discardOk}
        onNo={discardCancel}
    />;

    const resetTabs = () => {
        setCurrentTab(DEFAULT_TAB);
    }

    const handleTabChange = (key) => {
        setHasChanged(false);
        setCurrentTab(key);
    }

    const createEditDefaults = {
        tabKey: '1',
        openStepSettings: props.openStepSettings,
        setOpenStepSettings: props.setOpenStepSettings,
        canReadWrite: props.canReadWrite,
        canReadOnly: props.canReadOnly,
        currentTab: currentTab,
        setIsValid: setIsValid,
        resetTabs: resetTabs,
        setHasChanged: setHasChanged
    }

    const createEditLoad = (<CreateEditLoad
        {...createEditDefaults}
        isNewStep={props.isNewStep}
        createLoadArtifact={props.createStep}
        stepData={props.stepData}
    />);

    const createEditMapping = (<CreateEditMapping
        {...createEditDefaults}
        isNewStep={props.isNewStep}
        createMappingArtifact={props.createStep}
        stepData={props.stepData}
        targetEntityType={props.targetEntityType}
        sourceDatabase={props.sourceDatabase}
    />);

    const createEditMatching = (<CreateEditStep
        {...createEditDefaults}
        isEditing={!props.isNewStep}
        editStepArtifactObject={props.stepData}
        stepType={StepType.Matching}
        targetEntityType={props.targetEntityType}
        createStepArtifact={props.createStep}
    />);

    const createEditMerging = (<CreateEditStep
        {...createEditDefaults}
        isEditing={!props.isNewStep}
        editStepArtifactObject={props.stepData}
        stepType={StepType.Merging}
        targetEntityType={props.targetEntityType}
        createStepArtifact={props.createStep}
    />);

    const viewCustom = (<ViewCustom
        {...createEditDefaults}
        stepData={props.stepData}
    />);

    const getCreateEditStep = (activityType) => {
        if (activityType === 'ingestion') {
            return createEditLoad;
        } else if (activityType === StepType.Mapping) {
            return createEditMapping;
        } else if (activityType === StepType.Matching) {
            return createEditMatching;
        } else if (activityType === StepType.Merging) {
            return createEditMerging;
        } else {
            return viewCustom;
        }
    }

    const getTitle = () => {
        let activity;
        switch(props.activityType) {
            case 'ingestion': activity = 'Loading';
                break;
            case StepType.Mapping: activity = 'Mapping';
                break;
            case StepType.Matching: activity = 'Matching';
                break;
            case StepType.Merging: activity = 'Merging';
                break;
            default: activity = 'Custom';
        }
        return props.isNewStep ? 'New ' + activity + ' Step' : activity + ' Step Settings'; 
    }

    return <Modal
        visible={props.openStepSettings}
        title={null}
        width="700px"
        onCancel={() => onCancel()}
        className={styles.StepsModal}
        footer={null}
        maskClosable={false}
        destroyOnClose={true}
    >
        <div className={styles.stepsContainer}>
            <header>
                <div className={styles.title}>{getTitle()}</div>
            </header>
            { props.isNewStep ? <div className={styles.noTabs}>
                {getCreateEditStep(props.activityType)}
            </div> :
            <div className={styles.tabs}>
                <Tabs activeKey={currentTab} defaultActiveKey={DEFAULT_TAB} size={'large'} onTabClick={handleTabChange} animated={false} tabBarGutter={10}>
                    <TabPane tab="Basic" key="1" disabled={!isValid && currentTab !== '1'}>
                        {getCreateEditStep(props.activityType)}
                    </TabPane>
                    <TabPane tab="Advanced" key="2"  disabled={!isValid && currentTab !== '2'}>
                        <AdvancedSettings
                            tabKey='2'
                            tooltipsData={props.tooltipsData}
                            openStepSettings={props.openStepSettings}
                            setOpenStepSettings={props.setOpenStepSettings}
                            stepData={props.stepData}
                            updateLoadArtifact={props.updateStep}
                            activityType={props.activityType}
                            canWrite={props.canWrite}
                            currentTab={currentTab}
                            setIsValid={setIsValid}
                            resetTabs={resetTabs}
                            setHasChanged={setHasChanged}
                        />
                    </TabPane>
                </Tabs>
            </div> }
            {discardChanges}
        </div>
    </Modal>;
}

export default Steps;
  