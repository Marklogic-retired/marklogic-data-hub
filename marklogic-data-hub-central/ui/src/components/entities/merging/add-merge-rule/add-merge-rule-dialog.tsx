import {
    Modal,
    Form,
    Icon, Radio, Input, Menu,
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
import { DownOutlined } from '@ant-design/icons';

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

    const { curationOptions } = useContext(CurationContext);
    const [entityTypeDefinition, setEntityTypeDefinition] = useState<Definition>(DEFAULT_ENTITY_DEFINITION);
    const [property, setProperty] = useState<string | undefined>(undefined);
    const [propertyTouched, setPropertyTouched] = useState(false);
    const [mergeType, setMergeType] = useState(undefined);
    const [mergeTypeTouched, setMergeTypeTouched] = useState(false);
    const [uri, setUri] = useState();
    const [uriTouched, setUriTouched] = useState(false);
    const [functionValue, setFunctionValue] = useState();
    const [functionValueTouched, setFunctionValueTouched] = useState(false);
    const [namespace, setNamespace] = useState();
    const [namespaceTouched, setNamespaceTouched] = useState(false);

    const titleLegend = <div className={styles.titleLegend}>
        <div data-testid='multipleIconLegend' className={styles.legendText}><img className={styles.arrayImage} src={arrayIcon}/> Multiple</div>
        <div data-testid='structuredIconLegend' className={styles.legendText}><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> Structured</div>
    </div>;

    const mergeTypes = ['Custom', 'Strategy', 'Property-specific'];
    const mergeTypeOptions = mergeTypes.map(elem => <MLOption data-testid={`mergeTypeOptions-${elem}`} key={elem}>{elem}</MLOption>);


    useEffect(() => {
        if (props.openAddMergeRuleDialog && curationOptions.entityDefinitionsArray.length > 0 && curationOptions.activeStep.entityName !== '') {
            let entityTypeDefinition: Definition = curationOptions.entityDefinitionsArray.find(entityDefinition => entityDefinition.name === curationOptions.activeStep.entityName) || DEFAULT_ENTITY_DEFINITION;
            setEntityTypeDefinition(entityTypeDefinition);
            setProperty(undefined);
            setMergeType(undefined);
            setUriTouched(false);
            setFunctionValueTouched(false);
        }
    }, [props.openAddMergeRuleDialog]);

    const onCancel = () => {
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
    };

    const handleSubmit = () => {
        if(mergeType === 'Custom') {
            if(uri && functionValue) {
                props.setOpenAddMergeRuleDialog(false);
            } else {
                setUriTouched(true);
                setFunctionValueTouched(true);
            }
        } else {
                props.setOpenAddMergeRuleDialog(false);
        }

    };

    const menu = (
        <Menu>
            <Menu.Item key="1">
                1
            </Menu.Item>
        </Menu>
    );

    let priorityOrderOptions:any[] = [];

    const handleSlider = () => {

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
                        label={<span aria-label='formItem-Property'>Property:</span>}
                        labelAlign="left"
                    >
                        <EntityPropertyTreeSelect
                            propertyDropdownOptions={entityTypeDefinition.properties}
                            entityDefinitionsArray={curationOptions.entityDefinitionsArray}
                            value={property}
                            onValueSelected={handleProperty}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span aria-label='formItem-MergeType'>Merge Type:</span>}
                        labelAlign="left"
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
                    {mergeType === 'Property-specific' ?
                        <>
                            <Form.Item
                                colon={false}
                                label='Max Values:'
                                labelAlign="left"
                            >
                                <Radio.Group  defaultValue={1} onChange={handleChange} id="max-values">
                                    <Radio value={1} > All</Radio>
                                    <Radio value={2} ><Input id="max-values-rule-input" placeholder={'Enter max values'} onChange={handleChange} ></Input></Radio>
                                </Radio.Group>
                                <MLTooltip title={''}>
                                    <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                                </MLTooltip>
                            </Form.Item>
                            <Form.Item
                                colon={false}
                                label='Max Sources:'
                                labelAlign="left"
                            >
                                <Radio.Group  defaultValue={1} onChange={handleChange} id="max-sources">
                                    <Radio value={1} > All</Radio>
                                    <Radio value={2} ><Input id="max-sources-rule-input" onChange={handleChange} placeholder={'Enter max sources'}></Input></Radio>
                                </Radio.Group>
                                <MLTooltip title={''}>
                                    <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                                </MLTooltip>
                            </Form.Item>
                            <div className={styles.priorityOrderContainer} data-testid={'priorityOrderSlider'}>
                                <div><p className={styles.priorityText}>Priority Order<MLTooltip title={''}>
                                    <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                                </MLTooltip></p></div>
                                <div className={styles.addButtonContainer}>
                                    <MLDropdown
                                        overlay={menu}
                                        trigger={[
                                            'click'
                                        ]}
                                    >
                                        <MLButton aria-label="add-length" size="default" >
                                            Length{' '}
                                            <DownOutlined />
                                        </MLButton>
                                    </MLDropdown>
                                    <MLButton aria-label="add-slider-button" type="primary" size="default" className={styles.addSliderButton}>Add</MLButton>
                                </div>
                                <div>
                                    <MultiSlider options={priorityOrderOptions} handleSlider={handleSlider}/>
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
