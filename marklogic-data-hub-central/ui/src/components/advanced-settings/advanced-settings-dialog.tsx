import {
  Modal,
  Form,
  Input,
  Icon,
  Select,
} from 'antd';
import React, { useState, useEffect } from 'react';
import styles from './advanced-settings-dialog.module.scss';
import { AdvancedSettings } from '../../config/tooltips.config';
import { AdvancedSettingsMessages } from '../../config/messages.config';
import Axios from 'axios';
import { MLButton, MLTooltip } from '@marklogic/design-system';


const { TextArea } = Input;
const { Option } = Select;

const AdvancedSettingsDialog = (props) => {
  const tooltips = Object.assign({}, AdvancedSettings, props.tooltipsData);
  const stepType = props.activityType;
  const invalidJSONMessage = 'Invalid JSON';

  const usesSourceDatabase = stepType !== 'ingestion';
  const defaultSourceDatabase = usesSourceDatabase ? 'data-hub-STAGING' : 'data-hub-FINAL';

  const [isCustomIngestion, setIsCustomIngestion] = useState(false);
  const [stepDefinitionName, setStepDefinitionName] = useState('');

  const [sourceDatabase, setSourceDatabase] = useState(defaultSourceDatabase);
  const [sourceDatabaseTouched, setSourceDatabaseTouched] = useState(false);

  const defaultTargetDatabase = !usesSourceDatabase ? 'data-hub-STAGING' : 'data-hub-FINAL';
  const databaseOptions = ['data-hub-STAGING','data-hub-FINAL'];
  const [targetDatabase, setTargetDatabase] = useState(defaultTargetDatabase);
  const [targetDatabaseTouched, setTargetDatabaseTouched] = useState(false);

  const [defaultCollections, setDefaultCollections] = useState<any[]>([]);
  const [additionalCollections, setAdditionalCollections ] = useState<any[]>([]);
  const [addCollTouched, setAddCollTouched] = useState(false);

  const [targetPermissions, setTargetPermissions] = useState('');
  const validCapabilities = ['read', 'update', 'insert', 'execute'];
  const [targetPermissionsTouched, setTargetPermissionsTouched] = useState(false);
  const [permissionValidationError, setPermissionValidationError] = useState('');

  const usesTargetFormat = stepType === 'mapping';
  const defaultTargetFormat = 'JSON';
  const targetFormatOptions = ['JSON', 'XML'].map(d => <Option data-testid='targetFormatOptions' key={d}>{d}</Option>);
  const [targetFormat, setTargetFormat] = useState('JSON');
  const [targetFormatTouched, setTargetFormatTouched] = useState(false);

  const defaultprovGranularity = 'coarse';
  const provGranularityOptions = { 'Coarse-grained': 'coarse', 'Off': 'off' };
  const [provGranularity, setProvGranularity] = useState('coarse');
  const [provGranularityTouched, setProvGranularityTouched] = useState(false);

  const defaultValidateEntity = 'doNotValidate';
  const validateEntityOptions = { 'Do not validate': 'doNotValidate', 'Store validation errors in entity headers': 'accept','Skip documents with validation  errors': 'reject'};
  const [validateEntity, setValidateEntity] = useState('doNotValidate');
  const [validateEntityTouched, setValidateEntityTouched] = useState(false);

  const defaultBatchSize = 100;
  const [batchSize, setBatchSize] = useState(defaultBatchSize);
  const [batchSizeTouched, setBatchSizeTouched] = useState(false);

  const usesHeaders = stepType === 'ingestion' || stepType === 'mapping';
  const [headers, setHeaders] = useState('');
  const [headersTouched, setHeadersTouched] = useState(false);
  const [headersValid, setHeadersValid] = useState(true);

  const [processors, setProcessors] = useState('');
  const [processorsTouched, setProcessorsTouched] = useState(false);
  const [processorsExpanded, setProcessorsExpanded] = useState(false);
  const [processorsValid, setProcessorsValid] = useState(true);

  const [customHook, setCustomHook] = useState('');
  const [customHookTouched, setCustomHookTouched] = useState(false);
  const [customHookExpanded, setCustomHookExpanded] = useState(false);
  const [customHookValid, setCustomHookValid] = useState(true);
  const [additionalSettings, setAdditionalSettings] = useState('');

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [loading,setLoading] = useState(false);

  const canReadWrite = props.canWrite;

  useEffect(() => {
    getSettingsArtifact();

    return () => {
      setSourceDatabaseTouched(false);
      setTargetDatabaseTouched(false);
      setAddCollTouched(false);
      setTargetPermissionsTouched(false);
      setTargetFormatTouched(false);
      setProvGranularityTouched(false);
      setValidateEntityTouched(false);
      setBatchSizeTouched(false);
      setHeadersTouched(false);
      setProcessorsTouched(false);
      setCustomHookTouched(false);

      setStepDefinitionName('');
      setIsCustomIngestion(false);

      setSourceDatabase(defaultSourceDatabase);
      setTargetDatabase(defaultTargetDatabase);
      setAdditionalCollections([]);
      setTargetPermissions('');
      setPermissionValidationError('');
      setTargetFormat(defaultTargetFormat);
      setProvGranularity(defaultprovGranularity);
      setValidateEntity(defaultValidateEntity);
      setBatchSize(defaultBatchSize);
      setHeaders('{}');
      setProcessors('[]');
      setCustomHook('{}');
      setAdditionalSettings('');

      setProcessorsExpanded(false);
      setCustomHookExpanded(false);

      setHeadersValid(true);
      setProcessorsValid(true);
      setCustomHookValid(true);
    };
  },[props.openAdvancedSettings  ,loading]);

  const isFormValid = () => {
    return headersValid && processorsValid && customHookValid;
  };

  // Convert JSON from JavaScript object to formatted string
  const formatJSON = (json) => {
    try {
      const result = JSON.stringify(json, null, 2);
      return (result.trim() == '""') ? null : result;
    } catch (error) {
      console.error(error);
      return json;
    }
  };

  // Convert JSON from string to JavaScript object
  const parseJSON = (json) => {
    try {
      const result = JSON.parse(json);
      return result;
    } catch (error) {
      console.error(error);
      return json;
    }
  };

  // CREATE/POST settings Artifact
  const createSettingsArtifact = async (settingsObj) => {
    if (props.stepData.name) {
      try {
        setLoading(true);
        let response = await Axios.post(`/api/steps/${stepType}/${props.stepData.name}`, settingsObj);
        if (response.status === 200) {
          setLoading(false);
        }
      } catch (error) {
        let message = error.response.data.message;
        console.error('Error while creating the activity settings artifact', message);
        setLoading(false);
      }
    }
  };

  // GET the settings artifact
  const getSettingsArtifact = async () => {
    if (props.stepData.name) {
      try {
        let response = await Axios.get(`/api/steps/${stepType}/${props.stepData.name}`);
        if (response.status === 200) {
          if(stepType === 'ingestion' && response.data.stepDefinitionName !== 'default-ingestion'){
              setIsCustomIngestion(true);
              setStepDefinitionName(response.data.stepDefinitionName);
          }
          if (response.data.sourceDatabase) {
            setSourceDatabase(response.data.sourceDatabase);
          }
          if (response.data.collections) {
            setDefaultCollections(response.data.collections);
          }
          setTargetDatabase(response.data.targetDatabase);
          if (response.data.additionalCollections) {
            setAdditionalCollections([...response.data.additionalCollections]);
          }
          setTargetPermissions(response.data.permissions);
          setTargetFormat(response.data.targetFormat);
          setProvGranularity(response.data.provenanceGranularityLevel);
          setValidateEntity(response.data.validateEntity) ;
          setBatchSize(response.data.batchSize);
          if(response.data.headers){
              setHeaders(formatJSON(response.data.headers));
          }
          if(response.data.processors){
              setProcessors(formatJSON(response.data.processors));
          }
          if(response.data.customHook){
              setCustomHook(formatJSON(response.data.customHook));
          }
          if(response.data.additionalSettings){
              setAdditionalSettings(formatJSON(response.data.additionalSettings));
          }
        }
      } catch (error) {
        let message = error.response;
        console.error('Error while fetching load settings artifacts', message || error);
        setSourceDatabase(defaultSourceDatabase);
        setTargetDatabase(defaultTargetDatabase);
        setAdditionalCollections([]);
        setTargetPermissions('');
        setTargetFormat(defaultTargetFormat);
        setProvGranularity(defaultprovGranularity);
        setValidateEntity(defaultValidateEntity);
        setBatchSize(defaultBatchSize);
        setHeaders('{}');
        setProcessors('[]');
        setCustomHook('{}');
        setStepDefinitionName('');
        setIsCustomIngestion(false);
        setAdditionalSettings('');
      }
    }
  };

  const onCancel = () => {
    if(checkDeleteOpenEligibility()){
      setDeleteDialogVisible(true);
    } else {
      props.setOpenAdvancedSettings(false);
    }
  };

  const onOk = () => {
    props.setOpenAdvancedSettings(false);
  };

  //Check if Delete Confirmation dialog should be opened or not.
  const checkDeleteOpenEligibility = () => {
      if ( !sourceDatabaseTouched
        && !targetDatabaseTouched
        && !addCollTouched
        && !targetPermissionsTouched
        && !headersTouched
        && !targetFormatTouched
        && !provGranularityTouched
        && !validateEntityTouched
        && !batchSizeTouched
        && !processorsTouched
        && !customHookTouched
      ) {
        return false;
      } else {
        return true;
      }
  };

  const onDelOk = () => {
    props.setOpenAdvancedSettings(false);
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
      destroyOnClose={true}
      closable={false}
      footer={null}
  >
      <span className={styles.ConfirmationMessage}>Discard changes?</span><br/><br/>
      <div >
          <MLButton aria-label="No" onClick={() => onDelCancel()}>No</MLButton>&nbsp;&nbsp;
          <MLButton aria-label="Yes" type="primary" htmlType="submit" onClick={onDelOk}>Yes</MLButton>
        </div>
  </Modal>;

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();

    let dataPayload = {
        collections: defaultCollections,
        additionalCollections: additionalCollections,
        sourceDatabase: usesSourceDatabase ? sourceDatabase: null,
        targetDatabase: targetDatabase,
        targetFormat: targetFormat,
        permissions: targetPermissions,
        headers: isEmptyString(headers) ? {} : parseJSON(headers),
        processors: isEmptyString(processors) ? [] : parseJSON(processors),
        provenanceGranularityLevel: provGranularity,
        validateEntity: validateEntity,
        batchSize: batchSize,
        customHook: isEmptyString(customHook) ? {} : parseJSON(customHook),
      };
    if (isPermissionsValid()) {
        createSettingsArtifact(dataPayload);
        props.setOpenAdvancedSettings(false);
    }
  };

  const isPermissionsValid = () => {
    if (targetPermissions && targetPermissions.trim().length === 0) {
        setPermissionValidationError(AdvancedSettingsMessages.targetPermissions.incorrectFormat);
        return false;
    }

    if (targetPermissions && targetPermissions.trim().length > 0) {
        let permissionArray = targetPermissions.split(",");
        for (var i = 0; i < permissionArray.length; i += 2) {
            let role = permissionArray[i];
            if (i + 1 >= permissionArray.length || (!role ||!role.trim())) {
                setPermissionValidationError(AdvancedSettingsMessages.targetPermissions.incorrectFormat);
                return false;
            }
            let capability = permissionArray[i + 1];
            if(!validCapabilities.includes(capability)){
                setPermissionValidationError(AdvancedSettingsMessages.targetPermissions.invalidCapabilities);
                return false;
            }
        }
    }
    return true;
  };

  const isValidJSON = (json) => {
    try {
      JSON.parse(json);
      return true;
    } catch (error) {
      return json.trim() === '';
    }
  };

  const isEmptyString = (json) => {
      if(json !== undefined && json.trim().length === 0 ){
          return true;
      }
      return false;
  };

  const handleChange = (event) => {
    if (event.target.id === 'targetPermissions') {
      setTargetPermissions(event.target.value);
      setTargetPermissionsTouched(true);
    }

    if (event.target.id === 'headers') {
      setHeaders(event.target.value);
      setHeadersTouched(true);
      if (!headersValid && isValidJSON(event.target.value)) {
        setHeadersValid(true);
      }
    }

    if (event.target.id === 'processors') {
      setProcessors(event.target.value);
      setProcessorsTouched(true);
      if (!processorsValid && isValidJSON(event.target.value)) {
        setProcessorsValid(true);
      }
    }

    if (event.target.id === 'customHook') {
      setCustomHook(event.target.value);
      setCustomHookTouched(true);
      if (!customHookValid && isValidJSON(event.target.value)) {
        setCustomHookValid(true);
      }
    }

    if (event.target.id === 'batchSize'){
      setBatchSize(event.target.value);
      setBatchSizeTouched(true);
    }
  };

  const handleBlur = (event) => {
    if (event.target.id === 'headers') {
      setHeadersValid(isValidJSON(event.target.value));
    }

    if (event.target.id === 'processors') {
      setProcessorsValid(isValidJSON(event.target.value));
    }

    if (event.target.id === 'customHook') {
      setCustomHookValid(isValidJSON(event.target.value));
    }

    if (event.target.id === 'batchSize'){
      setBatchSize(event.target.value);
      setBatchSizeTouched(true);
    }
  };

  const handleSourceDatabase = (value) => {
    if (value === ' ') {
        setSourceDatabaseTouched(false);
    }
    else {
        setSourceDatabaseTouched(true);
        setSourceDatabase(value);
    }
  };

  const handleTargetDatabase = (value) => {
    if (value === ' ') {
      setTargetDatabaseTouched(false);
    }
    else {
      setTargetDatabaseTouched(true);
      setTargetDatabase(value);
    }
  };

  const handleAddColl = (value) => {
    if (value === ' ') {
      setAddCollTouched(false);
    }
    else {
      setAddCollTouched(true);
      // default collections will come from default settings retrieved. Don't want them to be added to additionalCollections property
      setAdditionalCollections(value.filter((col) => !defaultCollections.includes(col)));
    }
  };

  const handleTargetFormat = (value) => {
    if (value === ' ' || value === targetFormat) {
      setTargetFormatTouched(false);
    }
    else {
      setTargetFormat(value);
      setTargetFormatTouched(true);
    }
  };

  const handleProvGranularity = (value) => {
    if (value === ' ') {
      setProvGranularityTouched(false);
    }
    else {
      setProvGranularityTouched(true);
      setProvGranularity(value);
    }
  };

  const handleValidateEntity = (value) => {
     if (value === ' ') {
        setValidateEntityTouched(false);
      }
      else {
        setValidateEntityTouched(true);
        setValidateEntity(value);
      }
  };
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 15 },
    },
  };

  const sourceDbOptions = databaseOptions.map(d => <Option data-testid={`sourceDbOptions-${d}`} key={d}>{d}</Option>);
  const targetDbOptions = databaseOptions.map(d => <Option data-testid={`targetDbOptions-${d}`} key={d}>{d}</Option>);

  const provGranOpts = Object.keys(provGranularityOptions).map(d => <Option data-testid={`provOptions-${d}`} key={provGranularityOptions[d]}>{d}</Option>);
  const valEntityOpts = Object.keys(validateEntityOptions).map( (d, index) => <Option data-testid={`entityValOpts-${index}`} key={validateEntityOptions[d]}>{d}</Option>);
  return <Modal
    visible={props.openAdvancedSettings}
    title={null}
    width="700px"
    onCancel={() => onCancel()}
    onOk={() => onOk()}
    okText="Save"
    className={styles.SettingsModal}
    footer={null}
    maskClosable={false}
    destroyOnClose={true}
  >
    <p className={styles.title}>Advanced Step Settings</p>
    <p className={styles.stepName}>{props.stepData.name}</p><br/>
    <div className={styles.newDataForm}>
      <Form {...formItemLayout} onSubmit={handleSubmit} colon={true}>
        {isCustomIngestion ? <Form.Item
            label={<span>Step Definition Name</span>}
            labelAlign="left"
            className={styles.formItem}>
            <div >{stepDefinitionName}</div>
        </Form.Item> : null }
        { usesSourceDatabase ? <Form.Item
          label={<span>Source Database</span>}
          labelAlign="left"
          className={styles.formItem}
        >
          <Select
            id="sourceDatabase"
            placeholder="Please select source database"
            value={sourceDatabase}
            onChange={handleSourceDatabase}
            disabled={!canReadWrite}
            className={styles.inputWithTooltip}
            aria-label="sourceDatabase-select"
          >
            {sourceDbOptions}
          </Select>
          <div className={styles.selectTooltip}>
            <MLTooltip title={tooltips.sourceDatabase}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
        </Form.Item> : null
        }<Form.Item
          label={<span>Target Database</span>}
          labelAlign="left"
          className={styles.formItem}
        >
          <Select
            id="targetDatabase"
            placeholder="Please select target database"
            value={targetDatabase}
            onChange={handleTargetDatabase}
            disabled={!canReadWrite}
            className={styles.inputWithTooltip}
            aria-label="targetDatabase-select"
          >
            {targetDbOptions}
          </Select>
          <div className={styles.selectTooltip}>
            <MLTooltip title={tooltips.targetDatabase}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
        </Form.Item>
        <Form.Item
          label={<span>Target Collections</span>}
          labelAlign="left"
          className={styles.formItemTargetCollections}
        >
          <Select
            id="additionalColl"
            mode="tags"
            style={{width: '100%'}}
            placeholder="Please add target collections"
            value={additionalCollections}
            disabled={!canReadWrite}
            onChange={handleAddColl}
            className={styles.inputWithTooltip}
            aria-label="additionalColl-select"
          >
            {additionalCollections.map((col) => {
              return <Option value={col} key={col} label={col}>{col}</Option>;
            })}
          </Select>
          <div className={styles.inputTooltip}>
            <MLTooltip title={tooltips.additionalCollections}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
        </Form.Item>
        <Form.Item
          label={<span className={styles.defaultCollectionsLabel}>Default Collections</span>}
          labelAlign="left"
          className={styles.formItem}
        >
        <div className={styles.defaultCollections}>{defaultCollections.map((collection, i) => {return <div data-testid={`defaultCollections-${collection}`} key={i}>{collection}</div>;})}</div>
        </Form.Item>
        <Form.Item
          label={<span>Target Permissions</span>}
          labelAlign="left"
          className={styles.formItem}
        >
          <Input
            id="targetPermissions"
            placeholder="Please enter target permissions"
            value={targetPermissions}
            onChange={handleChange}
            disabled={!canReadWrite}
            className={styles.inputWithTooltip}
          />
          <div className={styles.inputTooltip}>
            <MLTooltip title={tooltips.targetPermissions}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
          <div className={styles.validationError}>
              {permissionValidationError}
          </div>
        </Form.Item>
        { usesTargetFormat ? <Form.Item
          label={<span>Target Format</span>}
          labelAlign="left"
          className={styles.formItem}
        >
          <Select
            id="targetFormat"
            placeholder="Please select target format"
            value={targetFormat}
            onChange={handleTargetFormat}
            disabled={!canReadWrite}
            className={styles.inputWithTooltip}
            aria-label="targetFormat-select"
          >
            {targetFormatOptions}
          </Select>
          <div className={styles.inputTooltip}>
            <MLTooltip title={tooltips.targetFormat} placement={'right'}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
        </Form.Item> : null }
        <Form.Item
          label={<span>Provenance Granularity</span>}
          labelAlign="left"
          className={styles.formItem}
        >
          <Select
            id="provGranularity"
            placeholder="Please select provenance granularity"
            value={provGranularity}
            onChange={handleProvGranularity}
            disabled={!canReadWrite}
            className={styles.inputWithTooltip}
            aria-label="provGranularity-select"
          >
            {provGranOpts}
          </Select>
          <div className={styles.selectTooltip}>
            <MLTooltip title={tooltips.provGranularity} placement={'right'}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
        </Form.Item>
          {   stepType === 'mapping' ? <Form.Item
              label={<span>Entity Validation</span>}
              labelAlign="left"
              className={styles.formItem}
          >
          <Select
              id="validateEntity"
              placeholder="Please select Entity Validation"
              value={validateEntity}
              onChange={handleValidateEntity}
              disabled={!canReadWrite}
              className={styles.inputWithTooltip}
              aria-label="validateEntity-select"
              >
              {valEntityOpts}
          </Select>
              <div className={styles.selectTooltip}>
                  <MLTooltip title={tooltips.validateEntity} placement={'right'}>
                      <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
                  </MLTooltip>
              </div>
          </Form.Item> : ''}
        <Form.Item
          label={<span>Batch Size</span>}
          labelAlign="left"
          className={styles.formItem}
        >
          <Input
              id="batchSize"
              placeholder="Please enter batch size"
              value={batchSize}
              onChange={handleChange}
              disabled={!canReadWrite}
              className={styles.inputBatchSize}
          />
          <div className={styles.inputTooltip}>
            <MLTooltip title={tooltips.batchSize} placement={'right'}>
                <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
        </Form.Item>
        { usesHeaders ? <>
        <div className={styles.textareaTooltip}>
          <MLTooltip title={tooltips.headers}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
          </MLTooltip>
        </div>
        <Form.Item
          label={<span>Header Content</span>}
          labelAlign="left"
          className={styles.formItem}
        >
          <TextArea
            id="headers"
            placeholder="Please enter header content"
            value={headers}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={!canReadWrite}
            className={styles.textarea}
            rows={6}
            aria-label="headers-textarea"
            style={!headersValid ? {border: 'solid 1px #C00'} : {}}
          />
          { !headersValid ? <div className={styles.invalid}>{invalidJSONMessage}</div> : null }
        </Form.Item></> : null }
        <Form.Item
          label={<span>
            <Icon
              type="right"
              className={styles.rightArrow}
              onClick={() => setProcessorsExpanded(!processorsExpanded)}
              rotate={processorsExpanded ? 90 : 0}
            />
            <span className={styles.expandLabel} onClick={() => setProcessorsExpanded(!processorsExpanded)}>Processors</span>
          </span>}
          labelAlign="left"
          className={styles.formItem}
          colon={false}
        />
        { processorsExpanded ? <div className={styles.expandContainer}>
          <div className={styles.textareaExpandTooltip}>
            <MLTooltip title={tooltips.processors}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
          <TextArea
            id="processors"
            placeholder="Please enter processor content"
            value={processors}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={!canReadWrite}
            className={styles.textareaExpand}
            rows={6}
            aria-label="processors-textarea"
            style={!processorsValid ? {border: 'solid 1px #C00'} : {}}
          />
          { !processorsValid ? <div className={styles.invalidExpand}>{invalidJSONMessage}</div> : null }
        </div> : ''}
        <Form.Item
          label={<span>
            <Icon
              type="right"
              className={styles.rightArrow}
              onClick={() => setCustomHookExpanded(!customHookExpanded)}
              rotate={customHookExpanded ? 90 : 0}
            />
            <span className={styles.expandLabel} onClick={() => setCustomHookExpanded(!customHookExpanded)}>Custom Hook</span>
          </span>}
          labelAlign="left"
          className={styles.formItem}
          colon={false}
        />
        { customHookExpanded ? <div className={styles.expandContainer}>
          <div className={styles.textareaExpandTooltip}>
            <MLTooltip title={tooltips.customHook}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
          <TextArea
            id="customHook"
            placeholder="Please enter custom hook content"
            value={customHook}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={!canReadWrite}
            className={styles.textareaExpand}
            rows={6}
            aria-label="customHook-textarea"
            style={!customHookValid ? {border: 'solid 1px #C00'} : {}}
          />
          { !customHookValid ? <div className={styles.invalidExpand}>{invalidJSONMessage}</div> : null }
        </div> : ''}
        { stepType ==='custom' ? <Form.Item
            label={<span>Additional Settings</span>}
            labelAlign="left"
            className={styles.formItem}
        >
            <TextArea
                id="additionalSettings"
                placeholder="Please enter additional settings"
                value={additionalSettings}
                disabled={!canReadWrite}
                className={styles.textarea}
                rows={6}
                aria-label="options-textarea"
            />
            <div className={styles.selectTooltip}>
                <MLTooltip title={props.tooltipsData.additionalSettings} placement={'right'}>
                    <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
                </MLTooltip>
            </div>
        </Form.Item> : null
        }
        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <MLButton data-testid={`${props.stepData.name}-cancel-settings`} onClick={() => onCancel()}>Cancel</MLButton>&nbsp;&nbsp;
            <MLButton id={'saveButton'} data-testid={`${props.stepData.name}-save-settings`} type="primary" htmlType="submit" onClick={handleSubmit} disabled={!canReadWrite || !isFormValid()}>Save</MLButton>
          </div>
        </Form.Item>
      </Form>
    </div>
    {deleteConfirmation}
  </Modal>;
};

export default AdvancedSettingsDialog;
