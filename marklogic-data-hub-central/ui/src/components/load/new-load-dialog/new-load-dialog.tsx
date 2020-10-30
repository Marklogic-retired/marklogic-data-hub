import { Modal, Form, Input, Icon, Select } from "antd";
import React, { useState, useEffect } from "react";
import styles from './new-load-dialog.module.scss';
import { srcOptions, tgtOptions, fieldSeparatorOptions } from '../../../config/formats.config';
import {NewLoadTooltips} from '../../../config/tooltips.config';
import { MLButton, MLTooltip } from '@marklogic/design-system';


const NewLoadDialog = (props) => {
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
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);

  useEffect(() => {
    if (props.stepData && JSON.stringify(props.stepData) != JSON.stringify({}) && props.title === 'Edit Loading Step') {
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
      setSourceName(props.stepData.sourceName);
      setSourceType(props.stepData.sourceType);
      setOutputUriPrefix(props.stepData.outputURIPrefix);
      setIsValid(true);
      setTobeDisabled(true);
    } else {
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

  }, [props.stepData, props.title, props.newLoad]);

  const onCancel = () => {
    if(checkDeleteOpenEligibility()) {
      setDeleteDialogVisible(true);
    } else {
      props.setNewLoad(false);
    }
  };

  const checkDeleteOpenEligibility = () => {
    if (props.stepData && JSON.stringify(props.stepData) != JSON.stringify({}) && props.title === 'Edit Loading Step'){
      if(stepName === props.stepData.name && description === props.stepData.description
      && srcFormat === props.stepData.sourceFormat && tgtFormat === props.stepData.targetFormat
      && outputUriPrefix === props.stepData.outputURIPrefix) {
        if((props.stepData.separator && fieldSeparator === 'Other' && otherSeparator === props.stepData.separator) ||
         (props.stepData.separator && fieldSeparator !== 'Other' && fieldSeparator === props.stepData.separator) ||
         (!props.stepData.separator && fieldSeparator === ',' && otherSeparator === '')) {
          return false;
        }
        else {
          return true;
        }
      }
      else {
          return true;
      }
    }
    else {
      if(stepName === '' && description === '' && srcFormat === 'json' && tgtFormat === 'json' && outputUriPrefix === '') {
        if(fieldSeparator === ',' && otherSeparator === '') {
            return false;
        }
        else {
          return true;
        }
      }
      else {
        return true;
      }
    }
  };

  const onOk = () => {
    props.setNewLoad(false);
  };

  const onDelOk = () => {
    props.setNewLoad(false);
    setDeleteDialogVisible(false);
  };

  const onDelCancel = () => {
    setDeleteDialogVisible(false);
  };

  const deleteConfirmation = <Modal
        visible={deleteDialogVisible}
        bodyStyle={{textAlign: 'center'}}
        width={250}
        maskClosable={false}
        closable={false}
        footer={null}
        destroyOnClose={true}
    >
        <span className={styles.ConfirmationMessage}>Discard changes?</span>
        <br/><br/>
        <div >
            <MLButton aria-label="No" onClick={() => onDelCancel()}>No</MLButton>
            &nbsp;&nbsp;
            <MLButton aria-label="Yes" type="primary" htmlType="submit" onClick={onDelOk}>Yes</MLButton>
          </div>
    </Modal>;
  
  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (!stepName) {
      // missing name
      setStepNameTouched(true);
      event.preventDefault();
      return;
    }
    // else: submit handle

    if (event) event.preventDefault();

    let dataPayload;
    if(srcFormat === 'csv'){
       dataPayload = {
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
       dataPayload = {
        name: stepName,
        description: description,
        sourceFormat: srcFormat,
        targetFormat: tgtFormat,
        sourceName: sourceName,
        sourceType: sourceType,
        outputURIPrefix: outputUriPrefix
      };
      if(props.stepData.separator){
        dataPayload.separator = null;
      }
    }
    setIsValid(true);

    //Call create data load artifact API function
    props.createLoadArtifact(dataPayload);
    props.setNewLoad(false);
  };

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
        } else if (srcFormat && tgtFormat) {
          setIsValid(true);
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
  };

  const handleOutputUriPrefix = (event) => {
    if (event.target.id === 'outputUriPrefix') {
      setOutputUriPrefix(event.target.value);
    }
  };

  const handleSrcFormat = (value) => {
    if (value !== ' ') {
      setSrcFormat(value);
      if(value === 'csv'){
        setFieldSeparator(',');
      }
    }
  };

  const handleFieldSeparator = (value) => {
    if (value !== ' ') {
      setFieldSeparator(value);
      if(value === 'Other'){
        setOtherSeparator('');
      }
    }
  };

  const handleOtherSeparator = (event) => {
    if (event.target.id === 'otherSeparator') {
      setOtherSeparator(event.target.value);
    }
  };

  const handleTgtFormat = (value) => {
    if (value !== ' ') {
      setTgtFormat(value);
      if(value !== 'json' && value !== 'xml') {
        setSourceName('');
        setSourceType('');
      }
    }
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


  return (<Modal visible={props.newLoad}
    title={null}
    width="55em"
    onCancel={() => onCancel()}
    onOk={() => onOk()}
    okText="Save"
    className={styles.modal}
    footer={null}
    maskClosable={false}
    destroyOnClose={true}>

    <p className={styles.title}>{props.title}</p>
    <br/>
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
          />&nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.name}>
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
          />&nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.description}>
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
          &nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.sourceFormat}>
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
        </MLTooltip></span> : <span>&nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.fieldSeparator}>
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
              <MLTooltip title={NewLoadTooltips.targetFormat}>
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
          />&nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.sourceName}>
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
          />&nbsp;&nbsp;<MLTooltip title={NewLoadTooltips.sourceType}>
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
          <MLTooltip title={NewLoadTooltips.outputURIPrefix}>
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
    </div>
    {deleteConfirmation}
  </Modal>);
};

export default NewLoadDialog;