import React, { useState, useEffect } from "react";
import { Form, Input, Icon, Select } from "antd";
import styles from './create-edit-load.module.scss';
import { srcOptions, tgtOptions, fieldSeparatorOptions } from '../../../config/formats.config';
import { NewLoadTooltips } from '../../../config/tooltips.config';
import ConfirmYesNo from '../../common/confirm-yes-no/confirm-yes-no';
import { MLButton, MLTooltip } from '@marklogic/design-system';

interface Props {
  tabKey: string;
  openStepSettings: boolean;
  setOpenStepSettings: any;
  isNewStep: boolean;
  canReadWrite: boolean;
  canReadOnly: boolean;
  createLoadArtifact
  stepData: any;
  currentTab: string;
  setIsValid?: any;
  resetTabs?: any;
  setHasChanged?: any;
}

const CreateEditLoad: React.FC<Props> = (props) => {
  const [stepName, setStepName] = useState('');
  const [description, setDescription] = useState(props.stepData && props.stepData != {} ? props.stepData.description : '');
  const [srcFormat, setSrcFormat] = useState(props.stepData && props.stepData != {} ? props.stepData.sourceFormat : 'json');
  const [tgtFormat, setTgtFormat] = useState(props.stepData && props.stepData != {} ? props.stepData.targetFormat : 'json');
  const [sourceName, setSourceName] = useState(props.stepData && props.stepData != {} ? props.stepData.sourceName : '');
  const [sourceType, setSourceType] = useState(props.stepData && props.stepData != {} ? props.stepData.sourceType : '');
  const [outputUriPrefix, setOutputUriPrefix] = useState(props.stepData && props.stepData != {} ? props.stepData.outputURIPrefix : '');
  const [fieldSeparator, setFieldSeparator] = useState(props.stepData && props.stepData != {} ? props.stepData.fieldSeparator : ',');
  const [otherSeparator, setOtherSeparator] = useState('');

  const [isStepNameTouched, setStepNameTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [discardChangesVisible, setDiscardChangesVisible] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);
  const [saveChangesVisible, setSaveChangesVisible] = useState(false);
  const [changed, setChanged] = useState(false);

  const initStep = () => {
    setStepName(props.stepData.name);
    setDescription(props.stepData.description);
    setSrcFormat(props.stepData.sourceFormat);
    if(props.stepData.separator){
      if([',','\\t','|',';'].includes(props.stepData.separator)){
        setFieldSeparator(props.stepData.separator);
      } else {
        setFieldSeparator('Other');
        setOtherSeparator(props.stepData.separator);
      }
    }
    setTgtFormat(props.stepData.targetFormat);
    setOutputUriPrefix(props.stepData.outputURIPrefix);
    setIsValid(true);
    setTobeDisabled(true);
  }

  useEffect(() => {
    // Edit step
    if (props.stepData && JSON.stringify(props.stepData) != JSON.stringify({}) && !props.isNewStep) {
      initStep();
    } 
    // New step
    else {
      setStepName('');
      setStepNameTouched(false);
      setDescription('');
      setSrcFormat('json');
      setFieldSeparator(',');
      setOtherSeparator('');
      setTgtFormat('json');
      setSourceName('');
      setSourceType('');
      setOutputUriPrefix('');
      setIsValid(false);
    }
    // Reset
    return (() => {
      setStepName('');
      setStepNameTouched(false);
      setDescription('');
      setSrcFormat('json');
      setFieldSeparator(',');
      setOtherSeparator('');
      setTgtFormat('json');
      setSourceName('');
      setSourceType('');
      setOutputUriPrefix('');
      setTobeDisabled(false);
    });

  }, [props.stepData, props.isNewStep]);

  const onCancel = () => {
    if (hasFormChanged()) {
      setDiscardChangesVisible(true);
    } else {
      props.setOpenStepSettings(false);
      props.resetTabs();
    }
  };

  useEffect(() => {
    if (props.currentTab !== props.tabKey && hasFormChanged()) {
      setSaveChangesVisible(true);
    }
  }, [props.currentTab])

  // On change of any form field, update the changed flag for parent
  useEffect(() => {
    props.setHasChanged(hasFormChanged());
    setChanged(false);
  }, [changed])

  const hasFormChanged = () => {
    const step = props.stepData;
    // Edit
    if (step && JSON.stringify(step) != JSON.stringify({}) && !props.isNewStep){
      // Any settings changed (excluding separator)?
      if (
        stepName === step.name && description === step.description && srcFormat === step.sourceFormat 
        && tgtFormat === step.targetFormat && sourceName === step.sourceName && sourceType === step.sourceType
        && outputUriPrefix === step.outputURIPrefix
      ) {
        // Separator?
        if((step.separator && fieldSeparator === 'Other' && otherSeparator === step.separator) ||
          (step.separator && fieldSeparator !== 'Other' && fieldSeparator === step.separator) ||
          (!step.separator && (fieldSeparator === ',' || !fieldSeparator) && otherSeparator === '')) {
          return false;
        }
        else return true;
      }
      else return true;
    }
    // New
    else {
      // Any settings changed (excluding separator)?
      if(stepName === '' && description === '' && srcFormat === 'json' && tgtFormat === 'json' 
        && sourceName === '' && sourceType === '' && outputUriPrefix === '') {
        // Separator?
        if(fieldSeparator === ',' && otherSeparator === '') {
          return false;
        }
        else return true;
      }
      else return true;
    }
  };

  const discardOk = () => {
    props.setOpenStepSettings(false);
    setDiscardChangesVisible(false)
  }

  const discardCancel = () => {
    setDiscardChangesVisible(false)
  }

  const discardChanges = <ConfirmYesNo
    visible={discardChangesVisible}
    type='discardChanges'
    onYes={discardOk}
    onNo={discardCancel}
  />;

  const saveOk = () => {
    props.createLoadArtifact(getPayload());
    setSaveChangesVisible(false)
  }

  const saveCancel = () => {
    setSaveChangesVisible(false);
    initStep();
  }

  const saveChanges = <ConfirmYesNo
    visible={saveChangesVisible}
    type='saveChanges'
    onYes={saveOk}
    onNo={saveCancel}
  />;

  const getPayload = () => {
    let result;
    if(srcFormat === 'csv'){
      result = {
        name: stepName,
        description: description,
        sourceFormat: srcFormat,
        separator: fieldSeparator === 'Other'? otherSeparator : fieldSeparator,
        targetFormat: tgtFormat,
        sourceName: sourceName,
        sourceType: sourceType,
        outputURIPrefix: outputUriPrefix,
      };
    } else {
      result = {
        name: stepName,
        description: description,
        sourceFormat: srcFormat,
        targetFormat: tgtFormat,
        sourceName: sourceName,
        sourceType: sourceType,
        outputURIPrefix: outputUriPrefix
      }
      if (props.stepData.separator) {
        result.separator = null;
      }
    }
    return result;
  }

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    if (!stepName) {
      // missing name
      setStepNameTouched(true);
      event.preventDefault();
      return;
    }
    // else: submit handle
    
    if (event) event.preventDefault();

    setIsValid(true);
    props.setIsValid(true);

    props.createLoadArtifact(getPayload());
    props.setOpenStepSettings(false);
    props.resetTabs();
  }

  const handleChange = (event) => {
    if (event.target.id === 'name') {
      if (event.target.value === ' ') {
        setStepNameTouched(false);
      }
      else {
        setStepNameTouched(true);
        setStepName(event.target.value);

        if (event.target.value.length == 0) {
          setIsValid(false);
          props.setIsValid(false);
        } else if (srcFormat && tgtFormat) {
          setIsValid(true);
          props.setIsValid(true);
        }
      }
    }
    if (event.target.id === 'description') {
      setDescription(event.target.value);
    }

    if (event.target.id === 'sourceName') {
      setSourceName(event.target.value);
    }

    if (event.target.id === 'sourceType') {
      setSourceType(event.target.value);
    }
    setChanged(true);
  };

  const handleOutputUriPrefix = (event) => {
    if (event.target.id === 'outputUriPrefix') {
      setOutputUriPrefix(event.target.value);
    }
    setChanged(true);
  };

  const handleSrcFormat = (value) => {
    if (value !== ' ') {
      setSrcFormat(value);
      if(value === 'csv'){
        setFieldSeparator(',');
      }
    }
    setChanged(true);
  };

  const handleFieldSeparator = (value) => {
    if (value !== ' ') {
      setFieldSeparator(value);
      if(value === 'Other'){
        setOtherSeparator('');
      }
    }
    setChanged(true);
  };

  const handleOtherSeparator = (event) => {
    if (event.target.id === 'otherSeparator') {
      setOtherSeparator(event.target.value);
    }
    setChanged(true);
  };

  const handleTgtFormat = (value) => {
    if (value !== ' ') {
      setTgtFormat(value);
      if(value !== 'json' && value !== 'xml') {
        setSourceName('');
        setSourceType('');
      }
    }
    setChanged(true);
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 28 },
      sm: { span: 15 },
    },
  };

  const soptions = Object.keys(srcOptions).map(d => <Select.Option key={srcOptions[d]}>{d}</Select.Option>);
  const fsoptions = Object.keys(fieldSeparatorOptions).map(d => <Select.Option key={fieldSeparatorOptions[d]}>{d}</Select.Option>);
  const toptions = Object.keys(tgtOptions).map(d => <Select.Option key={tgtOptions[d]}>{d}</Select.Option>);

  return (
    <div className={styles.newDataLoadForm}>
        <div className={styles.newLoadCardTitle} aria-label={'newLoadCardTitle'}>Configure the new Loading step. Then, add the new step to a flow and run it to load your data.</div>
      <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
        <Form.Item label={<span>
          Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;

          &nbsp;
            </span>} labelAlign="left"
          validateStatus={(stepName || !isStepNameTouched) ? '' : 'error'}
          help={(stepName || !isStepNameTouched) ? '' : 'Name is required'}
          >
          <Input
            id="name"
            placeholder="Enter name"
            value={stepName}
            onChange={handleChange}
            disabled={tobeDisabled}
            className={styles.input}
          />&nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.name} placement={'right'}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip>
        </Form.Item>
        <Form.Item label={<span>
          Description:&nbsp;
            </span>} labelAlign="left">
          <Input
            id="description"
            placeholder="Enter description"
            value={description}
            onChange={handleChange}
            disabled={props.canReadOnly && !props.canReadWrite}
            className={styles.input}
          />&nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.description} placement={'right'}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </MLTooltip>
        </Form.Item>
        <Form.Item label={<span>
          Source Format:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
            </span>} labelAlign="left">
          <Select
            id="sourceFormat"
            showSearch
            placeholder="Enter source format"
            optionFilterProp="children"
            value={srcFormat}
            onChange={handleSrcFormat}
            disabled={props.canReadOnly && !props.canReadWrite}
            style={{width: '95%'}}
          >
            {soptions}
          </Select>
          &nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.sourceFormat} placement={'right'}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip>
        </Form.Item>
         {srcFormat === 'csv' ? <Form.Item label={<span>
          Field Separator:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
            </span>} labelAlign="left">
          <span><Select
            id="fieldSeparator"
            showSearch
            placeholder="Choose Field Separator"
            optionFilterProp="children"
            value={fieldSeparator}
            onChange={handleFieldSeparator}
            style={{width: 120}}
            disabled={props.canReadOnly && !props.canReadWrite}
          >
            {fsoptions}
          </Select></span>
          &nbsp;&nbsp;
          <span>{fieldSeparator === 'Other' ? <span><Input
            id="otherSeparator"
            value={otherSeparator}
            onChange={handleOtherSeparator}
            style={{width: 75}}
            disabled={props.canReadOnly && !props.canReadWrite}
          />&nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.fieldSeparator}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </MLTooltip></span> : <span>&nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.fieldSeparator} placement={'right'}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </MLTooltip></span>}</span>
        </Form.Item> : ''}
        <Form.Item label={<span>
          Target Format:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
            </span>} labelAlign="left">
          <Select
            id="targetFormat"
            placeholder="Enter target format"
            value={tgtFormat}
            onChange={handleTgtFormat}
            disabled={props.canReadOnly && !props.canReadWrite}
            style={{width: '95%'}}>
            {toptions}
          </Select>&nbsp;&nbsp;
              <MLTooltip title={NewLoadTooltips.targetFormat} placement={'right'}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip>
        </Form.Item>
        {(tgtFormat === 'json' || tgtFormat === 'xml') && <Form.Item label={<span>
          Source Name:&nbsp;
            </span>} labelAlign="left">
          <Input
              id="sourceName"
              placeholder="Enter Source Name"
              value={sourceName}
              onChange={handleChange}
              disabled={props.canReadOnly && !props.canReadWrite}
              className={styles.input}
          />&nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.sourceName} placement={'right'}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </MLTooltip>
        </Form.Item>}
        {(tgtFormat === 'json' || tgtFormat === 'xml') && <Form.Item label={<span>
          Source Type:&nbsp;
            </span>} labelAlign="left">
          <Input
              id="sourceType"
              placeholder="Enter Source Type"
              value={sourceType}
              onChange={handleChange}
              disabled={props.canReadOnly && !props.canReadWrite}
              className={styles.input}
          />&nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.sourceType} placement={'right'}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </MLTooltip>
        </Form.Item>}
        <Form.Item label={<span>
          Target URI Prefix:&nbsp;
            </span>} labelAlign="left">
          <Input
            id="outputUriPrefix"
            placeholder="Enter URI Prefix"
            value={outputUriPrefix}
            onChange={handleOutputUriPrefix}
            disabled={props.canReadOnly && !props.canReadWrite}
            className={styles.input}
          />&nbsp;&nbsp;
          <MLTooltip title={NewLoadTooltips.outputURIPrefix} placement={'right'}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </MLTooltip>
        </Form.Item>

        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <MLButton aria-label="Cancel" onClick={() => onCancel()}>Cancel</MLButton>
            &nbsp;&nbsp;
            <MLButton 
              aria-label="Save" 
              type="primary" 
              htmlType="submit" 
              disabled={!props.canReadWrite} 
              onClick={handleSubmit}
            >Save</MLButton>
          </div>
        </Form.Item>
      </Form>
      {discardChanges}
      {saveChanges}
    </div>
  );
}

export default CreateEditLoad;
