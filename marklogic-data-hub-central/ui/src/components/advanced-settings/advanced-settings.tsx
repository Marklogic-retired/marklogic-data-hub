import React, {useState, useEffect} from "react";
import Axios from "axios";
import {Form, Input, Icon, Select} from "antd";
import styles from "./advanced-settings.module.scss";
import {AdvancedSettingsTooltips} from "../../config/tooltips.config";
import {AdvancedSettingsMessages} from "../../config/messages.config";
import StepsConfig from "../../config/steps.config";
import {MLButton, MLTooltip} from "@marklogic/design-system";
import "./advanced-settings.scss";
import AdvancedTargetCollections from "./advanced-target-collections";

const {TextArea} = Input;
const {Option} = Select;

type Props = {
  tabKey: string;
  tooltipsData: any;
  isEditing: boolean;
  openStepSettings: boolean;
  setOpenStepSettings: any;
  stepData: any;
  updateStep: any;
  activityType: any;
  canWrite: boolean;
  currentTab: string;
  setIsValid: any;
  resetTabs: any;
  setHasChanged: any;
  setPayload: any;
  createStep: any;
  onCancel: any;
  defaultCollections?: any;
}

const AdvancedSettings: React.FC<Props> = (props) => {
  const tooltips = Object.assign({}, AdvancedSettingsTooltips, props.tooltipsData);
  const stepType = props.activityType;
  const invalidJSONMessage = StepsConfig.invalidJSONMessage;

  const [isCustomIngestion, setIsCustomIngestion] = useState(false);
  const [stepDefinitionName, setStepDefinitionName] = useState("");

  const usesSourceDatabase = stepType !== "ingestion";
  const defaultSourceDatabase = usesSourceDatabase && stepType === "mapping" ? StepsConfig.stagingDb : StepsConfig.finalDb;
  const [sourceDatabase, setSourceDatabase] = useState(defaultSourceDatabase);
  const [sourceDatabaseTouched, setSourceDatabaseTouched] = useState(false);

  const defaultTargetDatabase = !usesSourceDatabase ? StepsConfig.stagingDb : StepsConfig.finalDb;
  const databaseOptions = [StepsConfig.stagingDb, StepsConfig.finalDb];
  const [targetDatabase, setTargetDatabase] = useState(defaultTargetDatabase);
  const [targetDatabaseTouched, setTargetDatabaseTouched] = useState(false);

  const [defaultCollections, setDefaultCollections] = useState<any[]>([]);
  const [additionalCollections, setAdditionalCollections] = useState<any[]>([]);
  const [addCollTouched, setAddCollTouched] = useState(false);
  const usesAdvancedTargetCollections = stepType === "merging";
  const [advancedTargetCollectionsTouched, setAdvancedTargetCollectionsTouched] = useState(false);
  const [defaultTargetCollections, setDefaultTargetCollections] = useState<any>({});
  const [targetCollections, setTargetCollections] = useState<any>(null);

  const defaultTargetPermissions = StepsConfig.defaultTargetPerms;
  const [targetPermissions, setTargetPermissions] = useState(defaultTargetPermissions);
  const validCapabilities = StepsConfig.validCapabilities;
  const [targetPermissionsTouched, setTargetPermissionsTouched] = useState(false);
  const [permissionValidationError, setPermissionValidationError] = useState<any>(null);
  const [targetPermissionsValid, setTargetPermissionsValid] = useState(true);

  const usesTargetFormat = stepType === "mapping";
  const defaultTargetFormat = StepsConfig.defaultTargetFormat;
  const targetFormatOptions = ["JSON", "XML"].map(d => <Option data-testid="targetFormatOptions" key={d}>{d}</Option>);
  const [targetFormat, setTargetFormat] = useState(defaultTargetFormat);
  const [targetFormatTouched, setTargetFormatTouched] = useState(false);

  const defaultprovGranularity = StepsConfig.defaultProvGran;
  const fineGrainProvAvailable = stepType === "matching" || stepType === "merging";
  const provGranularityOptions = fineGrainProvAvailable ? {"Coarse-grained": "coarse", "Fine-grained": "fine", "Off": "off"} : {"Coarse-grained": "coarse", "Off": "off"};
  const [provGranularity, setProvGranularity] = useState(defaultprovGranularity);
  const [provGranularityTouched, setProvGranularityTouched] = useState(false);

  const defaultValidateEntity = StepsConfig.defaultValidateEntity;
  const validateEntityOptions = {"Do not validate": "doNotValidate", "Store validation errors in entity headers": "accept", "Skip documents with validation  errors": "reject"};
  const [validateEntity, setValidateEntity] = useState(defaultValidateEntity);
  const [validateEntityTouched, setValidateEntityTouched] = useState(false);

  const defaultBatchSize = StepsConfig.defaultBatchSize;
  const [batchSize, setBatchSize] = useState(defaultBatchSize);
  const [batchSizeTouched, setBatchSizeTouched] = useState(false);

  const usesHeaders = stepType === "ingestion" || stepType === "mapping";
  const [headers, setHeaders] = useState("");
  const [headersTouched, setHeadersTouched] = useState(false);
  const [headersValid, setHeadersValid] = useState(true);

  const [processors, setProcessors] = useState("");
  const [processorsTouched, setProcessorsTouched] = useState(false);
  const [processorsExpanded, setProcessorsExpanded] = useState(false);
  const [processorsValid, setProcessorsValid] = useState(true);

  const [customHook, setCustomHook] = useState("");
  const [customHookTouched, setCustomHookTouched] = useState(false);
  const [customHookExpanded, setCustomHookExpanded] = useState(false);
  const [customHookValid, setCustomHookValid] = useState(true);
  const [additionalSettings, setAdditionalSettings] = useState("");

  const canReadWrite = props.canWrite;

  useEffect(() => {
    getSettings();

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
    setTargetPermissionsTouched(false);

  }, [props.openStepSettings]);

  const isFormValid = () => {
    return headersValid && processorsValid && customHookValid && targetPermissionsValid;
  };

  // Convert JSON from JavaScript object to formatted string
  const formatJSON = (json) => {
    try {
      const result = JSON.stringify(json, null, 2);
      return (result.trim() === "\"\"") ? null : result;
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

  const getSettings = async () => {
    if (props.isEditing) {
      if (stepType === "ingestion" && props.stepData.stepDefinitionName !== "default-ingestion") {
        setIsCustomIngestion(true);
        setStepDefinitionName(props.stepData.stepDefinitionName);
      }
      if (props.stepData.sourceDatabase) {
        setSourceDatabase(props.stepData.sourceDatabase);
      }
      if (props.stepData.collections) {
        setDefaultCollections(props.stepData.collections);
      }
      if (props.stepData.sourceDatabase) {
        setTargetDatabase(props.stepData.targetDatabase);
      }
      if (props.stepData.additionalCollections) {
        setAdditionalCollections([...props.stepData.additionalCollections]);
      }
      if (props.stepData.permissions) {
        setTargetPermissions(props.stepData.permissions);
      }
      if (props.stepData.targetFormat) {
        setTargetFormat(props.stepData.targetFormat);
      }
      if (props.stepData.provenanceGranularityLevel) {
        setProvGranularity(props.stepData.provenanceGranularityLevel);
      }
      if (props.stepData.validateEntity) {
        setValidateEntity(props.stepData.validateEntity);
      }
      if (props.stepData.batchSize) {
        setBatchSize(props.stepData.batchSize);
      }
      if (props.stepData.headers) {
        setHeaders(formatJSON(props.stepData.headers));
      }
      if (props.stepData.processors) {
        setProcessors(formatJSON(props.stepData.processors));
      }
      if (props.stepData.customHook) {
        setCustomHook(formatJSON(props.stepData.customHook));
      }
      if (props.stepData.additionalSettings) {
        setAdditionalSettings(formatJSON(props.stepData.additionalSettings));
      }
      if (usesAdvancedTargetCollections) {
        const targetEntityType = String(props.stepData.targetEntityType || props.stepData.targetEntity);
        const targetEntityTitle = targetEntityType.substring(targetEntityType.lastIndexOf("/") + 1);
        const defaultCollectionsURL = `/api/steps/${stepType}/defaultCollections/${encodeURIComponent(targetEntityTitle)}`;
        const defaultCollectionsResp = await Axios.get(defaultCollectionsURL);
        if (defaultCollectionsResp.status === 200) {
          setDefaultTargetCollections(defaultCollectionsResp.data);
        }
        setTargetCollections(props.stepData.targetCollections || {});
      }
    }
  };

  const onCancel = () => {
    // Parent handles checking changes across tabs
    props.onCancel();
  };

  // On change of any form field (or on init), update the changed flag for parent
  useEffect(() => {
    props.setHasChanged(hasFormChanged());
    props.setPayload(getPayload());
  }, [batchSize, sourceDatabase, targetCollections, advancedTargetCollectionsTouched, defaultTargetCollections, targetPermissions, targetDatabase, validateEntity, provGranularity, headers, processors, customHook, additionalSettings, targetCollections, targetFormat, targetPermissions, isCustomIngestion, stepDefinitionName, defaultCollections]);

  // On change of default collections in parent, update default collections if not empty
  useEffect(() => {
    if (props.defaultCollections.length > 0) {
      setDefaultCollections(props.defaultCollections);
    }
  }, [props.defaultCollections]);

  //Check if Delete Confirmation dialog should be opened or not.
  const hasFormChanged = () => {
    if (!sourceDatabaseTouched
        && !targetDatabaseTouched
        && !addCollTouched
        && !advancedTargetCollectionsTouched
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

  const getPayload = () => {
    return {
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
      targetCollections: usesAdvancedTargetCollections ? targetCollections : undefined,
    };
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();

    // Parent handles saving of all tabs
    if (!props.isEditing) {
      props.createStep(getPayload());
    } else {
      props.updateStep(getPayload());
    }

    props.setOpenStepSettings(false);
    props.resetTabs();
  };

  const isPermissionsValid = () => {
    if (targetPermissions && targetPermissions.trim().length === 0) {
      setPermissionValidationError(AdvancedSettingsMessages.targetPermissions.incorrectFormat);
      props.setIsValid(false);
      return false;
    }

    if (targetPermissions && targetPermissions.trim().length > 0) {
      let permissionArray = targetPermissions.split(",");
      for (let i = 0; i < permissionArray.length; i += 2) {
        let role = permissionArray[i];
        if (i + 1 >= permissionArray.length || (!role ||!role.trim())) {
          setPermissionValidationError(AdvancedSettingsMessages.targetPermissions.incorrectFormat);
          props.setIsValid(false);
          return false;
        }
        let capability = permissionArray[i + 1];
        if (!validCapabilities.includes(capability)) {
          setPermissionValidationError(AdvancedSettingsMessages.targetPermissions.invalidCapabilities);
          props.setIsValid(false);
          return false;
        }
      }
    }
    setPermissionValidationError("");
    props.setIsValid(true);
    return true;
  };

  const isValidJSON = (json) => {
    try {
      JSON.parse(json);
      return true;
    } catch (error) {
      return json.trim() === "";
    }
  };

  const isEmptyString = (json) => {
    if (json !== undefined && json.trim().length === 0) {
      return true;
    }
    return false;
  };

  const handleChange = (event) => {

    if (event.target.id === "targetPermissions") {
      setTargetPermissions(event.target.value);
      setTargetPermissionsTouched(true);
      if (!targetPermissionsValid && isPermissionsValid()) {
        setTargetPermissionsValid(true);
      }
    }

    if (event.target.id === "headers") {
      setHeaders(event.target.value);
      setHeadersTouched(true);
      if (!headersValid && isValidJSON(event.target.value)) {
        setHeadersValid(true);
      }
    }

    if (event.target.id === "processors") {
      setProcessors(event.target.value);
      setProcessorsTouched(true);
      if (!processorsValid && isValidJSON(event.target.value)) {
        setProcessorsValid(true);
      }
    }

    if (event.target.id === "customHook") {
      setCustomHook(event.target.value);
      setCustomHookTouched(true);
      if (!customHookValid && isValidJSON(event.target.value)) {
        setCustomHookValid(true);
      }
    }

    if (event.target.id === "batchSize") {
      setBatchSize(event.target.value);
      setBatchSizeTouched(true);
    }
  };

  const handleBlur = (event) => {
    if (event.target.id === "headers") {
      setHeadersValid(isValidJSON(event.target.value));
      props.setIsValid(isValidJSON(event.target.value));
    }

    if (event.target.id === "processors") {
      setProcessorsValid(isValidJSON(event.target.value));
      props.setIsValid(isValidJSON(event.target.value));
    }

    if (event.target.id === "customHook") {
      setCustomHookValid(isValidJSON(event.target.value));
      props.setIsValid(isValidJSON(event.target.value));
    }

    if (event.target.id === "batchSize") {
      setBatchSize(event.target.value);
      setBatchSizeTouched(true);
    }

    if (event.target.id === "targetPermissions") {
      setTargetPermissionsValid(isPermissionsValid());
    }
  };

  const handleSourceDatabase = (value) => {
    if (value === " ") {
      setSourceDatabaseTouched(false);
    } else {
      setSourceDatabaseTouched(true);
      setSourceDatabase(value);
    }
  };

  const handleTargetDatabase = (value) => {
    if (value === " ") {
      setTargetDatabaseTouched(false);
    } else {
      setTargetDatabaseTouched(true);
      setTargetDatabase(value);
    }
  };

  const handleAddColl = (value) => {
    if (value === " ") {
      setAddCollTouched(false);
    } else {
      setAddCollTouched(true);
      // default collections will come from default settings retrieved. Don't want them to be added to additionalCollections property
      setAdditionalCollections(value.filter((col) => !defaultCollections.includes(col)));
    }
  };

  const handleAdvancedTargetCollections = (value) => {
    if (!value) {
      setAdvancedTargetCollectionsTouched(false);
    } else {
      setAdvancedTargetCollectionsTouched(true);
      setTargetCollections(value);
    }
  };

  const handleTargetFormat = (value) => {
    if (value === " " || value === targetFormat) {
      setTargetFormatTouched(false);
    } else {
      setTargetFormat(value);
      setTargetFormatTouched(true);
    }
  };

  const handleProvGranularity = (value) => {
    if (value === " ") {
      setProvGranularityTouched(false);
    } else {
      setProvGranularityTouched(true);
      setProvGranularity(value);
    }
  };

  const handleValidateEntity = (value) => {
    if (value === " ") {
      setValidateEntityTouched(false);
    } else {
      setValidateEntityTouched(true);
      setValidateEntity(value);
    }
  };
  const formItemLayout = {
    labelCol: {
      xs: {span: 24},
      sm: {span: 7},
    },
    wrapperCol: {
      xs: {span: 24},
      sm: {span: 15},
    },
  };

  const sourceDbOptions = databaseOptions.map(d => <Option data-testid={`sourceDbOptions-${d}`} key={d}>{d}</Option>);
  const targetDbOptions = databaseOptions.map(d => <Option data-testid={`targetDbOptions-${d}`} key={d}>{d}</Option>);

  const provGranOpts = Object.keys(provGranularityOptions).map(d => <Option data-testid={`provOptions-${d}`} key={provGranularityOptions[d]}>{d}</Option>);
  const valEntityOpts = Object.keys(validateEntityOptions).map((d, index) => <Option data-testid={`entityValOpts-${index}`} key={validateEntityOptions[d]}>{d}</Option>);
  return (
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
            <MLTooltip title={tooltips.sourceDatabase} placement={"right"}>
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
            <MLTooltip title={tooltips.targetDatabase} placement={"right"}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
        </Form.Item>
        {usesAdvancedTargetCollections ? <Form.Item
          label={<span>Target Collections:</span>}
          labelAlign="left"
          labelCol={
            {span: 24}
          }
          wrapperCol={
            {offset: 1, span: 22}
          }
        >
          <AdvancedTargetCollections
            defaultTargetCollections={defaultTargetCollections}
            targetCollections={targetCollections}
            setTargetCollections={handleAdvancedTargetCollections}
            canWrite={canReadWrite}/>
        </Form.Item> :
          <Form.Item
            label={<span>Target Collections</span>}
            labelAlign="left"
            className={styles.formItemTargetCollections}
          >
            <Select
              id="additionalColl"
              mode="tags"
              style={{width: "100%"}}
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
              <MLTooltip title={tooltips.additionalCollections} placement={"right"}>
                <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
              </MLTooltip>
            </div>
          </Form.Item>}
        {usesAdvancedTargetCollections ? null : <Form.Item
          label={<span className={styles.defaultCollectionsLabel}>Default Collections</span>}
          labelAlign="left"
          className={styles.formItem}
        >
          <div className={styles.defaultCollections}>{defaultCollections.map((collection, i) => { return <div data-testid={`defaultCollections-${collection}`} key={i}>{collection}</div>; })}</div>
        </Form.Item>}
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
            onBlur={handleBlur}
            disabled={!canReadWrite}
            className={styles.inputWithTooltip}
          />
          <div className={styles.inputTooltip}>
            <MLTooltip title={tooltips.targetPermissions} placement={"right"}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
          <div className={styles.validationError} data-testid="validationError">
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
            <MLTooltip title={tooltips.targetFormat} placement={"right"}>
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
            <MLTooltip title={tooltips.provGranularity} placement={"right"}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
        </Form.Item>
        {   stepType === "mapping" ? <Form.Item
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
            <MLTooltip title={tooltips.validateEntity} placement={"right"}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
        </Form.Item> : ""}
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
            <MLTooltip title={tooltips.batchSize} placement={"right"}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
        </Form.Item>
        { usesHeaders ?
          <>
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
                style={!headersValid ? {border: "solid 1px #C00"} : {}}
              />
              { !headersValid ? <div className={styles.invalid}>{invalidJSONMessage}</div> : null }
              <div className={styles.textareaTooltip}>
                <MLTooltip title={tooltips.headers} placement={"right"}>
                  <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
                </MLTooltip>
              </div>
            </Form.Item>
          </>
          : null
        }
        <Form.Item
          label={<span>
            <Icon
              type="right"
              className={styles.rightArrow}
              onClick={() => setProcessorsExpanded(!processorsExpanded)}
              rotate={processorsExpanded ? 90 : 0}
            />
            <span aria-label="processors-expand" className={styles.expandLabel} onClick={() => setProcessorsExpanded(!processorsExpanded)}>Processors</span>
          </span>}
          labelAlign="left"
          className={styles.formItem}
          colon={false}
        />
        { processorsExpanded ? <div className={styles.expandContainer}>
          <div className={styles.textareaExpandTooltip}>
            <MLTooltip title={tooltips.processors} placement={"right"}>
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
            style={!processorsValid ? {border: "solid 1px #C00"} : {}}
          />
          { !processorsValid ? <div className={styles.invalidExpand}>{invalidJSONMessage}</div> : null }
        </div> : ""}
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
            <MLTooltip title={tooltips.customHook} placement={"right"}>
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
            style={!customHookValid ? {border: "solid 1px #C00"} : {}}
          />
          { !customHookValid ? <div className={styles.invalidExpand}>{invalidJSONMessage}</div> : null }
        </div> : ""}
        { stepType ==="custom" ? <Form.Item
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
            <MLTooltip title={props.tooltipsData.additionalSettings} placement={"right"}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </MLTooltip>
          </div>
        </Form.Item> : null
        }
        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <MLButton data-testid={`${props.stepData.name}-cancel-settings`} onClick={() => onCancel()}>Cancel</MLButton>&nbsp;&nbsp;
            {!canReadWrite || !isFormValid()? <MLTooltip title={tooltips.missingPermission} placement={"bottomRight"}>
              <span className={styles.disabledCursor}>
                <MLButton id={"saveButton"} className={styles.saveButton} data-testid={`${props.stepData.name}-save-settings`} type="primary" htmlType="submit" onClick={handleSubmit} disabled={true}>Save</MLButton>
              </span>
            </MLTooltip>:<MLButton id={"saveButton"} data-testid={`${props.stepData.name}-save-settings`} type="primary" htmlType="submit" onClick={handleSubmit} disabled={false}>Save</MLButton>}
          </div>
        </Form.Item>
      </Form>
    </div>
  );

};

export default AdvancedSettings;
