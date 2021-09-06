import React, {useState, useEffect, useContext} from "react";
import Axios from "axios";
import {Form, Input, Icon, Select, Radio, Tooltip} from "antd";
import styles from "./advanced-settings.module.scss";
import {AdvancedSettingsTooltips} from "../../config/tooltips.config";
import {AdvancedSettingsMessages} from "../../config/messages.config";
import StepsConfig from "../../config/steps.config";
import "./advanced-settings.scss";
import AdvancedTargetCollections from "./advanced-target-collections";
import {CurationContext} from "../../util/curation-context";
import HCAlert from "../common/hc-alert/hc-alert";
import {QuestionCircleFill} from "react-bootstrap-icons";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";
import HCButton from "../common/hc-button/hc-button";

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
  const {curationOptions, validateCalled, setValidateMatchCalled, setValidateMergeCalled, validateMerge} = useContext(CurationContext);
  const tooltips = Object.assign({}, AdvancedSettingsTooltips, props.tooltipsData);
  const stepType = props.activityType;
  const invalidJSONMessage = StepsConfig.invalidJSONMessage;
  const toggleSourceRecordScopeMessage = StepsConfig.toggleSourceRecordScopeMessage;

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
  const provGranularityOptions = fineGrainProvAvailable ? {"Off": "off", "Coarse-grained": "coarse", "Fine-grained": "fine"} : {"Off": "off", "Coarse-grained": "coarse"};
  const [provGranularity, setProvGranularity] = useState(defaultprovGranularity);
  const [provGranularityTouched, setProvGranularityTouched] = useState(false);

  const defaultValidateEntity = StepsConfig.defaultValidateEntity;
  const validateEntityOptions = {"Do not validate": "doNotValidate", "Store validation errors in entity headers": "accept", "Skip documents with validation  errors": "reject"};
  const [validateEntity, setValidateEntity] = useState(defaultValidateEntity);
  const [validateEntityTouched, setValidateEntityTouched] = useState(false);

  const [attachSourceDocument, setAttachSourceDocument] = useState(false);
  const [attachSourceDocumentTouched, setAttachSourceDocumentTouched] = useState(false);

  const defaultSourceRecordScope = StepsConfig.defaultSourceRecordScope;
  const sourceRecordScopeOptions = {"Instance only": "instanceOnly", "Entire record": "entireRecord"};
  const [sourceRecordScope, setSourceRecordScope] = useState(defaultSourceRecordScope);
  const [sourceRecordScopeTouched, setSourceRecordScopeTouched] = useState(false);
  const [sourceRecordScopeToggled, setSourceRecordScopeToggled] = useState(false);

  const defaultBatchSize = StepsConfig.defaultBatchSize;
  const [batchSize, setBatchSize] = useState(defaultBatchSize);
  const [batchSizeTouched, setBatchSizeTouched] = useState(false);

  const usesHeaders = stepType === "ingestion" || stepType === "mapping";
  const [headers, setHeaders] = useState("");
  const [headersTouched, setHeadersTouched] = useState(false);
  const [headersValid, setHeadersValid] = useState(true);

  const [interceptors, setInterceptors] = useState("");
  const [interceptorsTouched, setInterceptorsTouched] = useState(false);
  const [interceptorsExpanded, setInterceptorsExpanded] = useState(false);
  const [interceptorsValid, setInterceptorsValid] = useState(true);

  const [customHook, setCustomHook] = useState("");
  const [customHookTouched, setCustomHookTouched] = useState(false);
  const [customHookExpanded, setCustomHookExpanded] = useState(false);
  const [customHookValid, setCustomHookValid] = useState(true);

  const [additionalSettings, setAdditionalSettings] = useState("");
  const [additionalSettingsTouched, setAdditionalSettingsTouched] = useState(false);
  const [additionalSettingsValid, setAdditionalSettingsValid] = useState(true);

  const [isSubmit, setIsSubmit] = useState(false);

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
    setAttachSourceDocumentTouched(false);
    setSourceRecordScopeTouched(false);
    setSourceRecordScopeToggled(false);
    setBatchSizeTouched(false);
    setHeadersTouched(false);
    setInterceptorsTouched(false);
    setCustomHookTouched(false);
    setTargetPermissionsTouched(false);
    setAdditionalSettingsTouched(false);

  }, [props.openStepSettings]);

  useEffect(() => {
    if (isSubmit && curationOptions.activeStep.hasWarnings.length === 0 && stepType === ("matching") && validateCalled) {
      setValidateMatchCalled(false);
      props.setOpenStepSettings(false);
      props.resetTabs();
    }
    if (isSubmit && curationOptions.activeStep.hasWarnings.length === 0 && stepType === ("merging") && validateMerge) {
      setValidateMergeCalled(false);
      props.setOpenStepSettings(false);
      props.resetTabs();
    }
  }, [curationOptions.activeStep.hasWarnings.length, validateCalled, validateMerge]);



  const isFormValid = () => {
    return headersValid && interceptorsValid && customHookValid && targetPermissionsValid && additionalSettingsValid;
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
      if (props.stepData.targetDatabase) {
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
      if (props.stepData.attachSourceDocument) {
        setAttachSourceDocument(props.stepData.attachSourceDocument);
      }
      if (props.stepData.sourceRecordScope) {
        setSourceRecordScope(props.stepData.sourceRecordScope);
      }
      if (props.stepData.batchSize) {
        setBatchSize(props.stepData.batchSize);
      }
      if (props.stepData.headers) {
        setHeaders(formatJSON(props.stepData.headers));
      }
      if (props.stepData.interceptors) {
        setInterceptors(formatJSON(props.stepData.interceptors));
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

  /* sends payload to steps.tsx */
  const sendPayload = () => {
    props.setHasChanged(hasFormChanged());
    props.setPayload(getPayload());
  };

  useEffect(() => {
    // Advanced Target Collections saves independently so don't check here on change (DHFPROD-6660)
    if (!usesAdvancedTargetCollections) {
      props.setHasChanged(hasFormChanged());
    }
    props.setPayload(getPayload());
  }, [targetCollections, advancedTargetCollectionsTouched, defaultTargetCollections, defaultCollections, attachSourceDocumentTouched, sourceRecordScopeTouched]);

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
        && !attachSourceDocumentTouched
        && !sourceRecordScopeTouched
        && !batchSizeTouched
        && !interceptorsTouched
        && !customHookTouched
        && !additionalSettingsTouched
    ) {
      return false;
    } else {
      return true;
    }
  };

  const getPayload = () => {
    let payload =
    {
      collections: defaultCollections,
      additionalCollections: additionalCollections,
      targetDatabase: targetDatabase,
      targetFormat: targetFormat,
      permissions: targetPermissions,
      headers: isEmptyString(headers) ? {} : parseJSON(headers),
      interceptors: isEmptyString(interceptors) ? [] : parseJSON(interceptors),
      provenanceGranularityLevel: provGranularity,
      batchSize: batchSize,
      customHook: isEmptyString(customHook) ? {} : parseJSON(customHook),
    };

    if (usesSourceDatabase) {
      payload["sourceDatabase"] = sourceDatabase;
    }
    if (stepType === "custom" || isCustomIngestion) {
      payload["additionalSettings"] = parseJSON(additionalSettings);
    }
    if (stepType === "mapping") {
      payload["validateEntity"] = validateEntity;
      payload["attachSourceDocument"] = attachSourceDocument;
      payload["sourceRecordScope"] = sourceRecordScope;
    }
    if (usesAdvancedTargetCollections) {
      payload["targetCollections"] = targetCollections;
    }

    return payload;
  };

  const handleSubmit = async (event: {preventDefault: () => void;}) => {
    if (event) event.preventDefault();

    // Parent handles saving of all tabs
    if (!props.isEditing) {
      props.createStep(getPayload());
    } else {
      props.updateStep(getPayload());
    }
    (stepType === "matching" || stepType === "merging") ? setIsSubmit(true) : setIsSubmit(false);
    if (stepType !== "matching" && stepType !== "merging") {
      props.setOpenStepSettings(false);
      props.resetTabs();
    }
  };

  const isPermissionsValid = () => {
    if (targetPermissions.trim().length === 0) {
      setPermissionValidationError(AdvancedSettingsMessages.targetPermissions.incorrectFormat);
      props.setIsValid(false);
      return false;
    }

    if (targetPermissions && targetPermissions.trim().length > 0) {
      let permissionArray = targetPermissions.split(",");
      for (let i = 0; i < permissionArray.length; i += 2) {
        let role = permissionArray[i];
        if (i + 1 >= permissionArray.length || (!role || !role.trim())) {
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

    if (event.target.id === "interceptors") {
      setInterceptors(event.target.value);
      setInterceptorsTouched(true);
      if (!interceptorsValid && isValidJSON(event.target.value)) {
        setInterceptorsValid(true);
      }
    }

    if (event.target.id === "customHook") {
      setCustomHook(event.target.value);
      setCustomHookTouched(true);
      if (!customHookValid && isValidJSON(event.target.value)) {
        setCustomHookValid(true);
      }
    }

    if (event.target.id === "additionalSettings") {
      setAdditionalSettings(event.target.value);
      setAdditionalSettingsTouched(true);
      if (!additionalSettingsValid && isValidJSON(event.target.value)) {
        setAdditionalSettingsValid(true);
      }
    }

    if (event.target.name === "attachSourceDocument") {
      setAttachSourceDocumentTouched(true);
      setAttachSourceDocument(event.target.value);
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

    if (event.target.id === "interceptors") {
      setInterceptorsValid(isValidJSON(event.target.value));
      props.setIsValid(isValidJSON(event.target.value));
    }

    if (event.target.id === "customHook") {
      setCustomHookValid(isValidJSON(event.target.value));
      props.setIsValid(isValidJSON(event.target.value));
    }

    if (event.target.id === "additionalSettings") {
      setAdditionalSettingsValid(isValidJSON(event.target.value));
      props.setIsValid(isValidJSON(event.target.value));
    }

    if (event.target.id === "batchSize") {
      setBatchSize(event.target.value);
      setBatchSizeTouched(true);
    }

    if (event.target.id === "targetPermissions") {
      setTargetPermissionsValid(isPermissionsValid());
    }
    sendPayload();
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
  const handleSourceRecordScope = (value) => {
    if (props.isEditing) {
      if (props.stepData.sourceRecordScope !== value) {
        setSourceRecordScopeToggled(true);
      } else {
        setSourceRecordScopeToggled(false);
      }
    }

    if (value === " ") {
      setSourceRecordScopeTouched(false);
    } else {
      setSourceRecordScopeTouched(true);
      setSourceRecordScope(value);
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
  const sourceRecordScopeValue = Object.keys(sourceRecordScopeOptions).map((d, index) => <Option data-testid={`sourceRecordScopeOptions-${index}`} key={sourceRecordScopeOptions[d]}>{d}</Option>);
  return (
    <div className={styles.newDataForm}>
      {(stepType === "matching" || stepType === "merging") ? curationOptions.activeStep.hasWarnings.length > 0 ? (
        curationOptions.activeStep.hasWarnings.map((warning, index) => {
          let description;
          if (warning["message"].includes("target entity type")) {
            description = "Please remove target entity type from target collections";
          } else if (warning["message"].includes("source collection")) {
            description = "Please remove source collection from target collections";
          } else if (warning["message"].includes("temporal collection")) {
            description = "Please remove temporal collection from target collections";
          } else {
            description = "";
          }
          return (
            <HCAlert
              className={styles.alert}
              variant="warning"
              showIcon
              key={warning["level"] + index}
              heading={warning["message"]}
            >
              {description}
            </HCAlert>
          );
        })
      ) : null : null}
      <Form {...formItemLayout} onSubmit={handleSubmit} colon={true}>
        {isCustomIngestion ? <Form.Item
          label={<span>Step Definition Name</span>}
          labelAlign="left"
          className={styles.formItem}>
          <div >{stepDefinitionName}</div>
        </Form.Item> : null}
        {usesSourceDatabase ? <Form.Item
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
            onBlur={sendPayload}
          >
            {sourceDbOptions}
          </Select>
          <div className={styles.selectHCTooltip}>
            <HCTooltip
              text={tooltips.sourceDatabase}
              id="source-database-tooltip"
              placement="left"
            >
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
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
            onBlur={sendPayload}
          >
            {targetDbOptions}
          </Select>
          <div className={styles.selectHCTooltip}>
            <HCTooltip
              text={tooltips.targetDatabase}
              id="target-database-tooltip"
              placement="left"
            >
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
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
            canWrite={canReadWrite} />
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
              onBlur={sendPayload}
            >
              {additionalCollections.map((col) => {
                return <Option value={col} key={col} label={col}>{col}</Option>;
              })}
            </Select>
            <div className={styles.inputHCTooltip}>
              <HCTooltip
                text={tooltips.additionalCollections}
                id="additional-coll-tooltip"
                placement="left"
              >
                <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
              </HCTooltip>
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
          <div className={styles.inputHCTooltip}>
            <HCTooltip
              text={tooltips.targetPermissions}
              id="target-permissions-tooltip"
              placement="left"
            >
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </div>
          <div className={styles.validationError} data-testid="validationError">
            {permissionValidationError}
          </div>
        </Form.Item>
        {usesTargetFormat ? <Form.Item
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
            onBlur={sendPayload}
          >
            {targetFormatOptions}
          </Select>
          <div className={styles.inputHCTooltip}>
            <HCTooltip
              text={tooltips.targetFormat}
              id="target-format-tooltip"
              placement="left"
            >
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </div>
        </Form.Item> : null}
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
            onBlur={sendPayload}
          >
            {provGranOpts}
          </Select>
          <div className={styles.selectHCTooltip}>
            <HCTooltip
              text={tooltips.provGranularity}
              id="prov-granularity-tooltip"
              placement="left"
            >
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </div>
        </Form.Item>
        {stepType === "mapping" ? <Form.Item
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
            onBlur={sendPayload}
          >
            {valEntityOpts}
          </Select>
          <div className={styles.selectHCTooltip}>
            <HCTooltip
              text={tooltips.validateEntity}
              id="validate-entity-tooltip"
              placement="left"
            >
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </div>
        </Form.Item> : ""}
        {   stepType === "mapping" ? <Form.Item
          label={<span>Source Record Scope</span>}
          labelAlign="left"
          className={styles.formItem}
        >
          <Select
            id="sourceRecordScope"
            placeholder="Please select Source Record Scope"
            value={sourceRecordScope}
            onChange={handleSourceRecordScope}
            disabled={!canReadWrite}
            className={styles.inputWithTooltip}
            aria-label="sourceRecordScope-select"
          >
            {sourceRecordScopeValue}
          </Select>
          <div className={styles.selectTooltip}>
            <Tooltip title={tooltips.sourceRecordScope} placement={"right"}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled"/>
            </Tooltip>
          </div>
          { sourceRecordScopeToggled ? <div className={styles.toggleSourceScopeMsg}>{toggleSourceRecordScopeMessage}</div> : null }
        </Form.Item> : ""}
        {   stepType === "mapping" ? <Form.Item
          label={<span>Attach Source Document</span>}
          labelAlign="left"
          className={styles.formItem}
        >
          <Radio.Group onChange={handleChange} name="attachSourceDocument" value={attachSourceDocument}>
            <Radio value={true} data-testid="attachmentTrue">Yes</Radio>
            <Radio value={false} data-testid="attachmentFalse">No</Radio>
          </Radio.Group>
          <HCTooltip
            text={tooltips.attachSourceDocument}
            id="attach-source-document-tooltip"
            placement="left"
          >
            <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
          </HCTooltip>
        </Form.Item>: ""}
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
            onBlur={sendPayload}
          />
          <div className={styles.inputHCTooltip}>
            <HCTooltip
              text={tooltips.batchSize}
              id="batch-size-tooltip"
              placement="right"
            >
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </div>
        </Form.Item>
        {usesHeaders ?
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
              <div className={styles.textareaHCTooltip}>
                <HCTooltip
                  text={tooltips.headers}
                  id="headers-tooltip"
                  placement="left"
                >
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
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
              onClick={() => setInterceptorsExpanded(!interceptorsExpanded)}
              rotate={interceptorsExpanded ? 90 : 0}
            />
            <span aria-label="interceptors-expand" className={styles.expandLabel} onClick={() => setInterceptorsExpanded(!interceptorsExpanded)}>Interceptors</span>
          </span>}
          labelAlign="left"
          className={styles.formItem}
          colon={false}
        />
        {interceptorsExpanded ? <div className={styles.expandContainer}>
          <div className={styles.textareaExpandTooltip}>
            <HCTooltip
              text={tooltips.interceptors}
              id="interceptors-tooltip"
              placement="left"
            >
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </div>
          <TextArea
            id="interceptors"
            placeholder="Please enter interceptor content"
            value={interceptors}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={!canReadWrite}
            className={styles.textareaExpand}
            rows={6}
            aria-label="interceptors-textarea"
            style={!interceptorsValid ? {border: "solid 1px #C00"} : {}}
          />
          {!interceptorsValid ? <div className={styles.invalidExpand}>{invalidJSONMessage}</div> : null}
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
            <HCTooltip
              text={tooltips.customHookDeprecated}
              id="custom-hook-deprecated-tooltip"
              placement="left"
            >
              <span className={styles.deprecatedLabel}>DEPRECATED</span>
            </HCTooltip>
          </span>}
          labelAlign="left"
          className={styles.formItem}
          colon={false}
        />
        {customHookExpanded ? <div className={styles.expandContainer}>
          <div className={styles.textareaExpandTooltip}>
            <HCTooltip
              text={tooltips.customHook}
              id="custom-hook-tooltip"
              placement="left"
            >
              <QuestionCircleFill color="#7F86B5" size={13} />
            </HCTooltip>
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
          {!customHookValid ? <div className={styles.invalidExpand}>{invalidJSONMessage}</div> : null}
        </div> : ""}
        {stepType === "custom" || isCustomIngestion ?
          <Form.Item
            label={<span>Additional Settings</span>}
            labelAlign="left"
            className={styles.formItem}
          >
            <TextArea
              id="additionalSettings"
              placeholder="Please enter additional settings"
              value={additionalSettings}
              onChange={handleChange}
              disabled={!canReadWrite}
              className={styles.textarea}
              rows={6}
              aria-label="options-textarea"
              onBlur={handleBlur}
            />
            { !additionalSettingsValid ? <div className={styles.invalid}>{invalidJSONMessage}</div> : null }
            <div className={styles.selectHCTooltip}>
              <HCTooltip
                text={props.tooltipsData.additionalSettings}
                id="additional-settings-tooltip"
                placement="left"
              >
                <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
              </HCTooltip>
            </div>
          </Form.Item> : null
        }
        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <HCButton size="sm" data-testid={`${props.stepData.name}-cancel-settings`} onClick={() => onCancel()}>Cancel</HCButton>&nbsp;&nbsp;
            {!canReadWrite || !isFormValid() ? <Tooltip title={tooltips.missingPermission} placement={"bottomRight"}>
              <span className={styles.disabledCursor}>
                <HCButton size="sm" id={"saveButton"} className={styles.saveButton} data-testid={`${props.stepData.name}-save-settings`} variant="primary" type="submit" onClick={handleSubmit} disabled={true}>Save</HCButton>
              </span>
            </Tooltip> : <HCButton size="sm" id={"saveButton"} data-testid={`${props.stepData.name}-save-settings`} variant="primary" type="submit" onClick={handleSubmit} disabled={false} onFocus={sendPayload}>Save</HCButton>}
          </div>
        </Form.Item>
      </Form>
    </div>
  );

};

export default AdvancedSettings;
