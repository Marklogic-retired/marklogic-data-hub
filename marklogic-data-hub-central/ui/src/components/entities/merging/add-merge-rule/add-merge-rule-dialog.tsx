import {
    Modal,
    Form,
    Icon, Radio, Input,
} from 'antd';
import React, { useState, useContext, useEffect } from 'react';
import styles from './add-merge-rule-dialog.module.scss';
import { MLButton, MLTooltip, MLInput, MLSelect, MLDropdown } from '@marklogic/design-system';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import EntityPropertyTreeSelect from '../../../entity-property-tree-select/entity-property-tree-select';
import { Definition } from '../../../../types/modeling-types';
import { CurationContext } from '../../../../util/curation-context';
import arrayIcon from '../../../../assets/icon_array.png';
import { MergeRuleTooltips } from '../../../../config/tooltips.config';
import MultiSlider from "../../matching/multi-slider/multi-slider";
import axios from "axios";
import {UserContext} from "../../../../util/user-context";
import {MatchingStep, MergingStep} from "../../../../types/curation-types";
import {updateMergingArtifact} from "../../../../api/merging";

type Props = {
    data: any;
    openAddMergeRuleDialog: boolean;
    setOpenAddMergeRuleDialog: (openAddMergeRuleDialog: boolean) => void;
};

const DEFAULT_ENTITY_DEFINITION: Definition = {
    name: '',
    properties: []
};

const { MLOption } = MLSelect;

const AddMergeRuleDialog: React.FC<Props> = (props) => {

    const { curationOptions, updateActiveStepArtifact } = useContext(CurationContext);
    const {
        handleError
    } = useContext(UserContext);
    const [entityTypeDefinition, setEntityTypeDefinition] = useState<Definition>(DEFAULT_ENTITY_DEFINITION);
    const [property, setProperty] = useState<string | undefined>(undefined);
    const [propertyTouched, setPropertyTouched] = useState(false);
    const [propertyErrorMessage, setPropertyErrorMessage] = useState('');
    const [mergeType, setMergeType] = useState(undefined);
    const [mergeTypeErrorMessage, setMergeTypeErrorMessage] = useState('');
    const [mergeTypeTouched, setMergeTypeTouched] = useState(false);
    const [dropdownOption, setDropdownOption] = useState('Length');
    const [dropdownOptionTouched, setDropdownOptionTouched] = useState(false);
    const [uri, setUri] = useState('');
    const [uriTouched, setUriTouched] = useState(false);
    const [functionValue, setFunctionValue] = useState('');
    const [functionValueTouched, setFunctionValueTouched] = useState(false);
    const [strategyValue, setStrategyValue] = useState('');
    const [strategyValueTouched, setStrategyValueTouched] = useState(false);
    const [namespace, setNamespace] = useState('');
    const [namespaceTouched, setNamespaceTouched] = useState(false);
    const [maxValueRuleInput, setMaxValueRuleInput] = useState();
    const [maxValueRuleInputTouched, setMaxValueRuleInputTouched] = useState(false);
    const [maxSourcesRuleInput, setMaxSourcesRuleInput] = useState();
    const [maxSourcesRuleInputTouched, setMaxSourcesRuleInputTouched] = useState(false);
    const [radioOptionClicked, setRadioOptionClicked] = useState(1);
    const [priorityOrderOptions, setPriorityOrderOptions] = useState<any>([]);

    const titleLegend = <div className={styles.titleLegend}>
        <div data-testid='multipleIconLegend' className={styles.legendText}><img className={styles.arrayImage} src={arrayIcon}/> Multiple</div>
        <div data-testid='structuredIconLegend' className={styles.legendText}><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> Structured</div>
    </div>;

    const mergeTypes = ['Custom', 'Strategy', 'Property-specific'];
    const mergeTypeOptions = mergeTypes.map(elem => <MLOption data-testid={`mergeTypeOptions-${elem}`} key={elem}>{elem}</MLOption>);
    const dropdownTypes = ['Length', 'less favourite', 'more favourite'];
    const dropdownTypeOptions = dropdownTypes.map(elem => <MLOption data-testid={`dropdownTypeOptions-${elem}`} key={elem}>{elem}</MLOption>);

    useEffect(() => {
        if (props.openAddMergeRuleDialog && curationOptions.entityDefinitionsArray.length > 0 && curationOptions.activeStep.entityName !== '') {
            let entityTypeDefinition: Definition = curationOptions.entityDefinitionsArray.find(entityDefinition => entityDefinition.name === curationOptions.activeStep.entityName) || DEFAULT_ENTITY_DEFINITION;
            setEntityTypeDefinition(entityTypeDefinition);
            setProperty(undefined);
            setMergeType(undefined);
            setUriTouched(false);
            setFunctionValueTouched(false);
            setStrategyValueTouched(false);
        }
    }, [props.openAddMergeRuleDialog]);

    const resetModal = () => {
        setProperty('');
        setPropertyErrorMessage('');
        setMergeTypeErrorMessage('');
        setMergeType(undefined);
        setUri('');
        setStrategyValue('');
        setNamespace('');
        setFunctionValue('');
        setPriorityOrderOptions([]);
        setDropdownOption('Length');
    };

    const onCancel = () => {
        resetModal();
        props.setOpenAddMergeRuleDialog(false);
    };

    const onOk = () => {
        props.setOpenAddMergeRuleDialog(false);
    };

    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 7 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
        },
    };

    const handleProperty = (value) => {
        if (value === ' ') {
            setPropertyTouched(false);
        }
        else {
            setPropertyTouched(true);
            setProperty(value);
        }
    };

    const handleMergeType = (value) => {
        if (value === ' ') {
            setMergeTypeTouched(false);
        }
        else {
            setMergeTypeTouched(true);
            setMergeType(value);
        }
    };

    const handleDropDownOptions = (value) => {
        if (value === ' ') {
            setDropdownOptionTouched(false);
        }
        else {
            setDropdownOptionTouched(true);
            setDropdownOption(value);
        }
    }

    const handleChange = (event) => {
        if (event.target.id === 'uri') {
            if (event.target.value === ' ') {
                setUriTouched(false);
            }
            else {
                setUriTouched(true);
                setUri(event.target.value);
            }
        } else if (event.target.id === 'function') {
            if (event.target.value === ' ') {
                setFunctionValueTouched(false);
            }
            else {
                setFunctionValueTouched(true);
                setFunctionValue(event.target.value);
            }
        } else if (event.target.id === 'namespace') {
            if (event.target.value === ' ') {
                setNamespaceTouched(false);
            }
            else {
                setNamespaceTouched(true);
                setNamespace(event.target.value);
            }
        }
        else if (event.target.id === 'strategyName') {
            if (event.target.value === ' ') {
                setStrategyValueTouched(false);
            }
            else {
                setStrategyValueTouched(true);
                setStrategyValue(event.target.value);
            }
        }
        else if (event.target.id === 'maxValuesRuleInput') {
            if (event.target.value === ' ') {
                setMaxValueRuleInputTouched(false);
            }
            else {
                setMaxValueRuleInputTouched(true);
                setMaxValueRuleInput(event.target.value);
            }
        }
        else if (event.target.id === 'maxSourcesRuleInput') {
            if (event.target.value === ' ') {
                setMaxSourcesRuleInputTouched(false);
            }
            else {
                setMaxSourcesRuleInputTouched(true);
                setMaxSourcesRuleInput(event.target.value);
            }
        }
        else if(event.target.id === 'maxValues'){
            setRadioOptionClicked(event.target.value)
        }
        else if(event.target.id === 'maxSources'){
            setRadioOptionClicked(event.target.value)
        }
    };

    const parseAddSave = (priorityOptions) => {
        let priorityOrder:any = {};
        priorityOrder.sources = [];
        for(let key of priorityOptions){
            if(key.hasOwnProperty('props')) {
                if(key.props[0].prop == 'Length'){
                    priorityOrder.lengthWeight = key.value;
                } else {
                    priorityOrder.sources.push(
                        {
                        "sourceName":key.props[0].type,
                        "weight" : key.value
                        }
                    )
                }
            }
        }
        return priorityOrder;
    }


    const handleSubmit =  (event) => {
        event.preventDefault();
        let propertyErrorMessage = '';
        let mergeTypeErrorMessage = '';
        if (property === '' || property === undefined) {
            propertyErrorMessage = 'Property is required';
        }
        if (mergeType === '' || mergeType === undefined) {
            mergeTypeErrorMessage = 'Merge type is required';
        }
        let newMergeRules = {};
        if(mergeType === 'Custom') {
            if(uri && functionValue && property && mergeType) {
                props.setOpenAddMergeRuleDialog(false);
                newMergeRules =
                    {
                        "entityPropertyPath":property,
                        "mergeType": "custom",
                        "mergeModulePath": uri,
                        "mergeModuleNamespace": namespace,
                        "mergeModuleFunction": functionValue,
                        "options":{}
                    }
                onSave(newMergeRules);
            } else {
                setUriTouched(true);
                setFunctionValueTouched(true);
            }
        } else if(mergeType === 'Strategy'){
            if(strategyValue && property && mergeType) {
                newMergeRules = {
                    "entityPropertyPath": property,
                    "mergeType": "strategy",
                    "mergeStrategyName": strategyValue
                }
                onSave(newMergeRules);
                props.setOpenAddMergeRuleDialog(false);
            } else {
                setStrategyValueTouched(true);
            }
        }
        else{
            if(radioOptionClicked && property && mergeType) {
                newMergeRules = {
                    "entityPropertyPath": property,
                    "mergeType": "property-specific",
                    "maxSources": maxSourcesRuleInput ? maxSourcesRuleInput : 'All',
                    "maxValues": maxValueRuleInput ? maxValueRuleInput : 'All',
                    "priorityOrder": parseAddSave(priorityOrderOptions)
                }
                onSave(newMergeRules);
                props.setOpenAddMergeRuleDialog(false);
            } else {
                setMaxSourcesRuleInputTouched(true);
                setMaxValueRuleInputTouched(true);
            }
        }
        setPropertyErrorMessage(propertyErrorMessage);
        setMergeTypeErrorMessage(mergeTypeErrorMessage);
    };

    const onAddOptions =  () => {
     let priorityOrderDropdownOptions = [...priorityOrderOptions];
        for(let key of priorityOrderDropdownOptions){
            if(key.hasOwnProperty('props') && (key.props[0].type == dropdownOption || key.props[0].prop == dropdownOption)) {
                return;
            }
        }
        priorityOrderDropdownOptions.push(
            {
                props: [{
                    prop: (dropdownOption == 'Length')? 'Length': 'Source',
                    type: (dropdownOption == 'Length')? '': dropdownOption,
                }],
                value: 0

            }
        )
        setPriorityOrderOptions(priorityOrderDropdownOptions)
    }

    const onSave = async (newMergeRules) => {
        let newStepArtifact: MergingStep = curationOptions.activeStep.stepArtifact;
        newStepArtifact.mergeRules.push(newMergeRules);
        await updateMergingArtifact(newStepArtifact);
        updateActiveStepArtifact(newStepArtifact);
        resetModal();
    }

    const handleSlider = (values, options) => {
        for(let key of priorityOrderOptions){
            if(key.hasOwnProperty('props')) {
                if (key.props[0].prop == options.prop && options.type == key.props[0].type) {
                    for (let val of values) {
                        if(val.hasOwnProperty("props")){
                            if(val.props.prop == key.props[0].prop && val.props.type == key.props[0].type){
                                key.value = val.value;
                            }
                        }
                    }
                }
            }
        }
    }

    const handleDelete = (options) => {
        let priorityOrderDropdownOptions = [...priorityOrderOptions];
        for(let index in priorityOrderDropdownOptions) {
            let key = priorityOrderDropdownOptions[index]
            if (key.hasOwnProperty('props')) {
                if (key.props[0].prop == options.prop && options.type == key.props[0].type) {
                    priorityOrderDropdownOptions.splice(parseInt(index), 1)
                    break;
                }
            }
        }
        setPriorityOrderOptions(priorityOrderDropdownOptions);
        setDropdownOption('Length');
    }


    const handleEdit = () => {

    }
    return (
        <Modal
            visible={props.openAddMergeRuleDialog}
            title={null}
            width={700}
            onCancel={() => onCancel()}
            onOk={() => onOk()}
            okText="Save"
            className={styles.AddMergeRuleModal}
            footer={null}
            maskClosable={false}
            destroyOnClose={true}
        >
            <p className={styles.title}>Add Merge Rule</p>
            <p>Select the property and the merge type for this merge rule. When you select a structured type property, the merge rule is applied to all the properties within that structured type property as well.</p>
            {titleLegend}
            <br />
            <div className={styles.addMergeRuleForm}>
                <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
                    <Form.Item
                        label={<span aria-label='formItem-Property'>Property:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
                        labelAlign="left"
                        id="propertyName"
                        validateStatus={propertyErrorMessage ? 'error' : ''}
                        help={propertyErrorMessage}
                    >
                        <EntityPropertyTreeSelect
                            propertyDropdownOptions={entityTypeDefinition.properties}
                            entityDefinitionsArray={curationOptions.entityDefinitionsArray}
                            value={property}
                            onValueSelected={handleProperty}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span aria-label='formItem-MergeType'>Merge Type:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
                        labelAlign="left"
                        validateStatus={mergeTypeErrorMessage ? 'error' : ''}
                        help={mergeTypeErrorMessage}
                    >
                        <MLSelect
                            id="mergeType"
                            placeholder="Select merge type"
                            size="default"
                            value={mergeType}
                            onChange={handleMergeType}
                            //disabled={!canWriteMatchMerge}
                            className={styles.mergeTypeSelect}
                            aria-label="mergeType-select"
                        >
                            {mergeTypeOptions}
                        </MLSelect>
                    </Form.Item>
                    {mergeType === 'Custom' ?
                        <>
                            <Form.Item
                                label={<span aria-label='formItem-URI'>URI:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
                                labelAlign="left"
                                validateStatus={(uri || !uriTouched) ? '' : 'error'}
                                help={(uri || !uriTouched) ? '' : 'URI is required'}
                            >
                                <div className={styles.inputWithHelperIcon}>
                                <MLInput
                                    id="uri"
                                    placeholder="Enter URI"
                                    size="default"
                                    value={uri}
                                    onChange={handleChange}
                                    //disabled={props.canReadMatchMerge && !props.canWriteMatchMerge}
                                    className={styles.input}
                                    aria-label="uri-input"
                                />&nbsp;&nbsp;
                                <MLTooltip title={MergeRuleTooltips.uri}>
                                    <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                                </MLTooltip>
                                </div>
                            </Form.Item>
                            <Form.Item
                                label={<span aria-label='formItem-function'>Function:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
                                labelAlign="left"
                                validateStatus={(functionValue || !functionValueTouched) ? '' : 'error'}
                                help={(functionValue || !functionValueTouched) ? '' : 'Function is required'}
                            >
                                <MLInput
                                    id="function"
                                    placeholder="Enter function"
                                    size="default"
                                    value={functionValue}
                                    onChange={handleChange}
                                    //disabled={props.canReadMatchMerge && !props.canWriteMatchMerge}
                                    className={styles.input}
                                    aria-label="function-input"
                                />&nbsp;&nbsp;
                                <MLTooltip title={MergeRuleTooltips.function}>
                                    <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                                </MLTooltip>
                            </Form.Item>
                            <Form.Item
                                label={<span aria-label='formItem-namespace'>Namespace:</span>}
                                labelAlign="left"
                            >
                                <MLInput
                                    id="namespace"
                                    placeholder="Enter namespace"
                                    size="default"
                                    value={namespace}
                                    onChange={handleChange}
                                    //disabled={props.canReadMatchMerge && !props.canWriteMatchMerge}
                                    className={styles.input}
                                    aria-label="namespace-input"
                                />&nbsp;&nbsp;
                                <MLTooltip title={MergeRuleTooltips.namespace}>
                                    <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                                </MLTooltip>
                            </Form.Item>
                        </> : ''
                    }
                    {mergeType === 'Strategy' ?
                        <Form.Item
                                label={<span aria-label='formItem-strategyName'>Strategy Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;</span>}
                                labelAlign="left"
                                validateStatus={(strategyValue || !strategyValueTouched) ? '' : 'error'}
                                help={(strategyValue || !strategyValueTouched) ? '' : 'Strategy Name is required'}
                            >
                                <MLInput
                                    id="strategyName"
                                    placeholder="Enter strategy name"
                                    size="default"
                                    value={strategyValue}
                                    onChange={handleChange}
                                    //disabled={props.canReadMatchMerge && !props.canWriteMatchMerge}
                                    className={styles.input}
                                    aria-label="strategy-name-input"
                                />
                            </Form.Item>
                        : ''
                    }
                    {mergeType === 'Property-specific' ?
                        <>
                            <Form.Item
                                colon={false}
                                label='Max Values:'
                                labelAlign="left"
                            >
                                <Radio.Group  defaultValue={radioOptionClicked} onChange={handleChange} id="maxValues">
                                    <Radio value={1} > All</Radio>
                                    <Radio value={2} ><Input id="maxValuesRuleInput" value={maxValueRuleInput} placeholder={'Enter max values'} onChange={handleChange} className={styles.maxInput} ></Input></Radio>
                                </Radio.Group>
                                <MLTooltip title={MergeRuleTooltips.maxValues}>
                                    <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                                </MLTooltip>
                            </Form.Item>
                            <Form.Item
                                colon={false}
                                label='Max Sources:'
                                labelAlign="left"
                            >
                                <Radio.Group  defaultValue={radioOptionClicked} onChange={handleChange} id="maxSources">
                                    <Radio value={1} > All</Radio>
                                    <Radio value={2} ><Input id="maxSourcesRuleInput"  value={maxSourcesRuleInput} onChange={handleChange} placeholder={'Enter max sources'} className={styles.maxInput}></Input></Radio>
                                </Radio.Group>
                                <MLTooltip title={MergeRuleTooltips.maxSources}>
                                    <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                                </MLTooltip>
                            </Form.Item>
                            <div className={styles.priorityOrderContainer} data-testid={'priorityOrderSlider'}>
                                <div><p className={styles.priorityText}>Priority Order<MLTooltip title={MergeRuleTooltips.priorityOrder}>
                                    <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                                </MLTooltip></p></div>
                                <div className={styles.addButtonContainer}>
                                    <MLSelect
                                        id="dropdownOptions"
                                        placeholder=""
                                        size="default"
                                        value={dropdownOption}
                                        onChange={handleDropDownOptions}
                                        //disabled={!canWriteMatchMerge}
                                        className={styles.dropdownOptionsSelect}
                                        aria-label="dropdownOptions-select"
                                    >
                                        {dropdownTypeOptions}
                                    </MLSelect>
                                    <MLButton aria-label="add-slider-button" type="primary" size="default" className={styles.addSliderButton} onClick={onAddOptions}>Add</MLButton>
                                </div>
                                <div>
                                    <MultiSlider options={priorityOrderOptions} handleSlider={handleSlider} handleDelete={handleDelete} handleEdit={handleEdit}/>
                                </div>
                            </div>
                        </> : ''
                    }
                    <Form.Item className={styles.submitButtonsForm}>
                        <div className={styles.submitButtons}>
                            <MLButton onClick={() => onCancel()}>Cancel</MLButton>&nbsp;&nbsp;
                            <MLButton id={'saveButton'} type="primary" onClick={handleSubmit} >Save</MLButton>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default AddMergeRuleDialog;
