import {
    Modal,
    Form,
    Icon, Input, Radio, Menu
} from 'antd';
import React, { useState, useEffect } from 'react';
import styles from './edit-merge-strategy-dialog.module.scss';
import { MLButton, MLTooltip, MLDropdown } from '@marklogic/design-system';
import MultiSlider from "../../matching/multi-slider/multi-slider";
import { DownOutlined } from '@ant-design/icons';

type Props = {
    data: any;
    strategyName: string;
    editMergeStrategyDialog: boolean;
    setOpenEditMergeStrategyDialog: (editMergeStrategyDialog: boolean) => void;
};


const EditMergeStrategyDialog: React.FC<Props> = (props) => {

    const [strategyName, setStrategyName] = useState('');
    const [strategyNameTouched, setStrategyNameTouched] = useState(false);
    const [radioOptionClicked, setRadioOptionClicked] = useState(0);
    const [maxValues, setMaxValues] = useState(0);
    const [maxSources, setMaxSources] = useState(0);
    const [isCustomStrategy, setIsCustomStrategy] = useState(false);
    const [priorityOrderOptions, setPriorityOrderOptions] = useState<any>([])

    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 8 },
    };

    const handleSubmit = () => {
        props.setOpenEditMergeStrategyDialog(false);
    };

    const onCancel = () => {
        props.setOpenEditMergeStrategyDialog(false);
    };

    const onOk = () => {
        props.setOpenEditMergeStrategyDialog(false);
    };

    const handleSlider = () => {

    }

    const menu = (
        <Menu>
            <Menu.Item key="1">
                1
            </Menu.Item>
        </Menu>
    );

    const handleChange = (event) => {
        if (event.target.id === 'strategy-name') {
            if (event.target.value === ' ') {
                setStrategyNameTouched(false);
            }
            else {
                setStrategyNameTouched(true);
                setStrategyName(event.target.value);
            }
        }
        if(event.target.id === 'max-sources-input'){
            setMaxSources(event.target.value);
        }
        if(event.target.id === 'max-values-input'){
            setMaxValues(event.target.value);
        }
        if(event.target.id === 'max-values' || 'max-sources'){
            setRadioOptionClicked(event.target.value)
        }
    }

    useEffect(() => {
        if(props.strategyName){
            setStrategyName(props.strategyName)
        }
        if(props.data){
            parsedEditedFormDetails(props.data)
        }
    }, [props.strategyName, props.data]);

    let priorityOrderStrategyOptions:any[] = [];

    const parsedEditedFormDetails = (data) => {
        for(let key of data){
            if(props.strategyName === key.strategyName){
                if(key.hasOwnProperty('priorityOrder')){
                    for(let key1 of key.priorityOrder.sources){
                        const priorityOrderSourceObject = {
                            props: [{
                                prop: 'Source',
                                type: key1.sourceName,
                            }],
                            value: key1.weight,
                        };
                        priorityOrderStrategyOptions.push(priorityOrderSourceObject);
                    }
                    if(key.priorityOrder.hasOwnProperty('lengthWeight')){
                        const priorityOrderLengthObject = {
                            props: [{
                                prop: 'Length',
                                type: '',
                            }],
                            value: key.priorityOrder.lengthWeight,
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
                    priorityOrderStrategyOptions.push(timeStampObject);
                    setPriorityOrderOptions(priorityOrderStrategyOptions)
                    setIsCustomStrategy(false);
                }
                else{
                    setIsCustomStrategy(true)
                }
                setMaxValues(key.hasOwnProperty('maxValues') ? key.maxValues : 0);
                setMaxSources(key.hasOwnProperty('maxSources') ? key.maxSources : 0);
            }
        }
    }

    return (
        <Modal
            visible={props.editMergeStrategyDialog}
            title={'Edit Strategy'}
            width={1000}
            onCancel={() => onCancel()}
            onOk={() => onOk()}
            okText="Save"
            footer={null}
            maskClosable={false}
            destroyOnClose={true}
        >
            <Form
                name="basic"
                {...layout}
            >
                <Form.Item
                    colon={false}
                    label={<span className={styles.text}>
                        Strategy Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
                        </span>}
                    labelAlign="left"
                    validateStatus={(strategyName || !strategyNameTouched) ? '' : 'error'}
                    help={(strategyName || !strategyNameTouched) ? '' : 'Strategy name is required'}
                >
                    <Input
                        id="strategy-name"
                        value={strategyName}
                        placeholder={'Enter strategy name'}
                        onChange={handleChange}
                    />
                </Form.Item>
                <Form.Item
                    colon={false}
                    label='Max Values:'
                    labelAlign="left"
                >
                    <Radio.Group  defaultValue={1} onChange={handleChange} id="max-values">
                        <Radio value={1} > All</Radio>
                        <Radio value={2} ><Input id="max-values-input" value={maxValues} placeholder={'Enter max values'} onChange={handleChange} ></Input></Radio>
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
                        <Radio value={2} ><Input id="max-sources-input" value={maxSources} onChange={handleChange} placeholder={'Enter max sources'}></Input></Radio>
                    </Radio.Group>
                    <MLTooltip title={''}>
                        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                    </MLTooltip>
                </Form.Item>
                {!isCustomStrategy && <div className={styles.priorityOrderContainer} data-testid={'prioritySlider'}>
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
                </div>}
                <Form.Item className={styles.submitButtonsForm}>
                    <div className={styles.submitButtons}>
                        <MLButton onClick={() => onCancel()}>Cancel</MLButton>&nbsp;&nbsp;
                        <MLButton id={'saveButton'} type="primary" onClick={handleSubmit} >Save</MLButton>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditMergeStrategyDialog;
