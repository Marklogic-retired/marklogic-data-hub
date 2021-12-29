import React, {useState, useEffect, useContext} from "react";
import Axios from "axios";
import Select, {components as SelectComponents} from "react-select";
import CreatableSelect from "react-select/creatable";
import reactSelectThemeConfig from "../../config/react-select-theme.config";
import {Form, Row, Col, FormCheck, FormLabel, FormControl, OverlayTrigger, Tooltip} from "react-bootstrap";
import styles from "./advanced-settings.module.scss";
import {AdvancedSettingsTooltips, keyboardNavigationTooltips} from "../../config/tooltips.config";
import {AdvancedSettingsMessages} from "../../config/messages.config";
import StepsConfig from "../../config/steps.config";
import "./advanced-settings.scss";
import AdvancedTargetCollections from "./advanced-target-collections";
import {CurationContext} from "../../util/curation-context";
import {ChevronDown, ChevronRight, QuestionCircleFill} from "react-bootstrap-icons";
import {HCInput, HCAlert, HCButton, HCTooltip} from "@components/common";

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
  const {curationOptions, validateCalled, setValidateMatchCalled, setValidateMergeCalled, validateMerge, loadModalClicked, setLoadModalClickedCalled} = useContext(CurationContext);
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
  const targetFormatOptions = ["JSON", "XML"].map(d => ({value: d, label: d}));
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

  //for Keyboard navigation
  const tgtDatabaseTooltipRef = React.createRef<HTMLDivElement>();
  const [tgtDatabaseTooltipVisible, setTgtDatabaseTooltipVisible] = useState(false);
  const tgtDatabaseTooltipRef2 = React.createRef<HTMLDivElement>();
  const [tgtDatabaseTooltipVisible2, setTgtDatabaseTooltipVisible2] = useState(false);

  const tgtCollectionTooltipRef = React.createRef<HTMLSpanElement>();
  const [tgtCollectionTooltipVisible, setTgtCollectionTooltipVisible] = useState(false);
  const tgtCollectionTooltipRef2 = React.createRef<HTMLDivElement>();
  const [tgtCollectionTooltipVisible2, setTgtCollectionTooltipVisible2] = useState(false);

  const tgtPermissionRef = React.useRef<HTMLInputElement>(null);
  const tgtPermissionTooltipRef = React.createRef<HTMLSpanElement>();
  const [tgtPermissionTooltipVisible, setTgtPermissionToolTipVisible] = useState(false);

  const provGranTooltipRef = React.createRef<HTMLDivElement>();
  const [provGranTooltipVisible, setProvGranTooltipVisible] = useState(false);
  const provGranTooltipRef2 = React.createRef<HTMLDivElement>();
  const [provGranTooltipVisible2, setProvGranTooltipVisible2] = useState(false);

  const batchSizeRef = React.useRef<HTMLInputElement>(null);
  const batchSizeTooltipRef = React.createRef<HTMLDivElement>();
  const [batchSizeTooltipVisible, setBatchSizeToolTipVisible] = useState(false);

  const headerContentRef = React.createRef<HTMLTextAreaElement>();
  const headerContentTooltipRef = React.createRef<HTMLDivElement>();
  const [headerContentTooltipVisible, setHeaderContentTooltipVisible] = useState(false);

  const interceptorRef = React.createRef<HTMLTextAreaElement>();
  const interceptorTooltipRef = React.createRef<HTMLDivElement>();
  const [interceptorTooltipVisible, setInterceptorTooltipVisible] = useState(false);

  const customHookRef = React.createRef<HTMLTextAreaElement>();
  const customHookTooltipRef = React.createRef<HTMLDivElement>();
  const [customHookTooltipVisible, setCustomHookTooltipVisible] = useState(false);

  const cancelButtonRef = React.createRef<HTMLSpanElement>();
  const saveButtonRef = React.createRef<HTMLSpanElement>();

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

  //To handle closing tooltip when user clicks out anywhere in form
  useEffect(() => {
    if (loadModalClicked) {
      closeAllTooltips();
      closeSelectWrapperTooltips();
    }
    if (setLoadModalClickedCalled !== undefined) setLoadModalClickedCalled(false);
  }, [loadModalClicked]);

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

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
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

    if (event.target.id.match("targetPermissions") !== null) {
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
      setAttachSourceDocument(1 === parseInt(event.target.value) ? true : false);
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

  const handleSourceDatabase = (selectedItem) => {
    if (selectedItem.value === " ") {
      setSourceDatabaseTouched(false);
    } else {
      setSourceDatabaseTouched(true);
      setSourceDatabase(selectedItem.value);
    }
  };

  const handleTargetDatabase = (selectedItem) => {
    if (selectedItem.value === " ") {
      setTargetDatabaseTouched(false);
    } else {
      setTargetDatabaseTouched(true);
      setTargetDatabase(selectedItem.value);
    }
  };

  const handleAddColl = (value) => {
    if (value === []) {
      setAddCollTouched(false);
    } else {
      setAddCollTouched(true);
      // default collections will come from default settings retrieved. Don't want them to be added to additionalCollections property
      setAdditionalCollections(value.filter(col => !defaultCollections.includes(col.value)).map(option => option.value));
    }
  };

  const handleCreateAdditionalColl = (value) => {
    setAddCollTouched(true);
    if (typeof value === "string") {
      setAdditionalCollections([...additionalCollections, value]);
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

  const handleTargetFormat = (selectedItem) => {
    if (selectedItem.value === " " || selectedItem.value === targetFormat) {
      setTargetFormatTouched(false);
    } else {
      setTargetFormat(selectedItem.value);
      setTargetFormatTouched(true);
    }
  };

  const handleProvGranularity = (selectedItem) => {
    if (selectedItem.value === " ") {
      setProvGranularityTouched(false);
    } else {
      setProvGranularityTouched(true);
      setProvGranularity(selectedItem.value);
    }
  };

  const handleValidateEntity = (selectedItem) => {
    if (selectedItem.value === " ") {
      setValidateEntityTouched(false);
    } else {
      setValidateEntityTouched(true);
      setValidateEntity(selectedItem.value);
    }
  };
  const handleSourceRecordScope = (selectedItem) => {
    if (props.isEditing) {
      if (props.stepData.sourceRecordScope !== selectedItem.value) {
        setSourceRecordScopeToggled(true);
      } else {
        setSourceRecordScopeToggled(false);
      }
    }

    if (selectedItem.value === " ") {
      setSourceRecordScopeTouched(false);
    } else {
      setSourceRecordScopeTouched(true);
      setSourceRecordScope(selectedItem.value);
    }
  };

  const MenuList  = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const sourceDbOptions = databaseOptions.map(d => ({value: d, label: d}));
  const targetDbOptions = databaseOptions.map(d => ({value: d, label: d}));
  const additionalCollectionsOptions = additionalCollections.map(d => ({value: d, label: d}));

  const provGranOpts = Object.keys(provGranularityOptions).map(d => ({value: provGranularityOptions[d], label: d}));
  const valEntityOpts = Object.keys(validateEntityOptions).map((d, index) => ({value: validateEntityOptions[d], label: d}));
  const sourceRecordScopeValue = Object.keys(sourceRecordScopeOptions).map((d, index) => ({value: sourceRecordScopeOptions[d], label: d}));

  //Closing All Tooltips
  const closeAllTooltips = () => {
    setTgtDatabaseTooltipVisible2(false);
    setTgtCollectionTooltipVisible2(false);
    setTgtPermissionToolTipVisible(false);
    setProvGranTooltipVisible2(false);
    setBatchSizeToolTipVisible(false);
    setHeaderContentTooltipVisible(false);
    setInterceptorTooltipVisible(false);
    setCustomHookTooltipVisible(false);
  };

  //Closing All overlayTrigger wrapper around dropdown elements
  const closeSelectWrapperTooltips = () => {
    setTgtDatabaseTooltipVisible(false);
    setTgtCollectionTooltipVisible(false);
    setProvGranTooltipVisible(false);
  };

  const serviceNameKeyDownHandler = async (event, component) => {
    //Tooltip visible when user presses space or enter key
    if ((event.keyCode === 13) || (event.keyCode === 32)) {
      if (component === "tgtDatabaseTooltip") setTgtDatabaseTooltipVisible2(true);
      if (component === "tgtCollectionTooltip") setTgtCollectionTooltipVisible2(true);
      if (component === "tgtPermissionTooltip") setTgtPermissionToolTipVisible(true);
      if (component === "provGranularityTooltip") setProvGranTooltipVisible2(true);
      if (component === "batchSizeTooltip") setBatchSizeToolTipVisible(true);
      if (component === "headerContentTooltip") setHeaderContentTooltipVisible(true);
      if (component === "interceptorTooltip") setInterceptorTooltipVisible(true);
      if (component === "customHookTooltip") setCustomHookTooltipVisible(true);
    }

    //Tooltip not visible if user presses escape key
    if ((event.keyCode === 27)) {
      closeAllTooltips();
    }

    //Moving focus to respective tooltip when user presses Right Arrow
    if (event.keyCode === 39) {
      if (component === "tgtDatabaseInner" || component === "tgtDatabase") {
           tgtDatabaseTooltipRef2.current!.focus();
           setTgtDatabaseTooltipVisible(false);
      }
      if (component === "tgtCollectionInner" || component === "tgtCollection") {
          tgtCollectionTooltipRef2.current!.focus();
          setTgtCollectionTooltipVisible(false);
      }
      if (component === "tgtPermission") {
          tgtPermissionTooltipRef.current!.focus();
      }
      if (component === "provGranularity" || component === "provGranularityInner") {
          provGranTooltipRef2.current!.focus();
          setProvGranTooltipVisible(false);
      }
      if (component === "batchSize") {
          batchSizeTooltipRef.current!.focus();
      }
      if (component === "headerContent") {
          headerContentTooltipRef.current!.focus();
      }
      if (component === "interceptors") {
          interceptorTooltipRef.current!.focus();
      }
      if (component === "customHook") {
          customHookTooltipRef.current!.focus();
      }
    }

    //Enter key cancel Button and save Button
    if (event.keyCode === 13) {
      if (component === "cancelButton") onCancel();
      if (component === "saveButton") handleSubmit(event);
      event.preventDefault();
    }

    //Moving focus away from tooltip when user presses left arrow
    if (event.key === "ArrowLeft") {
      if (component === "tgtDatabaseTooltip") {
          tgtDatabaseTooltipRef.current!.focus();
          setTgtDatabaseTooltipVisible(true);
      }
      if (component === "tgtCollectionTooltip") {
          tgtCollectionTooltipRef.current!.focus();
          setTgtCollectionTooltipVisible(true);
      }
      if (component === "tgtPermissionTooltip") {
          tgtPermissionRef.current!.focus();
          setTgtPermissionToolTipVisible(false);
      }
      if (component === "provGranularityTooltip") {
          provGranTooltipRef.current!.focus();
          setProvGranTooltipVisible(true);
      }
      if (component === "batchSizeTooltip") {
          batchSizeRef.current!.focus();
          setBatchSizeToolTipVisible(false);
      }
      if (component === "headerContentTooltip") {
          headerContentRef.current!.focus();
          setHeaderContentTooltipVisible(false);
      }
      if (component === "interceptorTooltip") {
          interceptorRef.current!.focus();
          setInterceptorTooltipVisible(false);
      }
      if (component === "customHookTooltip") {
          customHookRef.current!.focus();
          setCustomHookTooltipVisible(false);
      }
      closeAllTooltips();
    }

    //When user presses tab key
    if (event.keyCode === 9) {
      if (component === "tgtDatabase") {
        if (!event.shiftKey) setTgtDatabaseTooltipVisible(false);
        else setTgtDatabaseTooltipVisible(!tgtDatabaseTooltipVisible);
      }
      if (component === "tgtDatabaseTooltip") {
        if (!event.shiftKey) setTgtCollectionTooltipVisible(true);
        else setTgtCollectionTooltipVisible(false);
      }
      if (component === "tgtDatabaseInner") {
        if (event.shiftKey) setTgtDatabaseTooltipVisible(true);
        else setTgtDatabaseTooltipVisible(!tgtDatabaseTooltipVisible);
      }
      if (component === "tgtCollection") {
        if (!event.shiftKey) setTgtCollectionTooltipVisible(false);
        else setTgtCollectionTooltipVisible(!tgtCollectionTooltipVisible);
      }
      if (component === "tgtCollectionInner") {
        if (event.shiftKey) setTgtCollectionTooltipVisible(true);
        else setTgtCollectionTooltipVisible(!tgtCollectionTooltipVisible);
      }
      if (component === "tgtPermissionTooltip") {
        if (!event.shiftKey) setProvGranTooltipVisible(true);
        else setProvGranTooltipVisible(false);
      }
      if (component === "provGranularity") {
        if (!event.shiftKey) setProvGranTooltipVisible(false);
        else setProvGranTooltipVisible(!provGranTooltipVisible);
      }
      if (component === "provGranularityInner") {
        if (event.shiftKey) setProvGranTooltipVisible(true);
        else setProvGranTooltipVisible(!provGranTooltipVisible);
      }
      //Closing All Tooltips when user presses Tab Key
      closeAllTooltips();
    }
  };

  return (
    <div>
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
      <Form onSubmit={handleSubmit} className={"container-fluid"}>
        {isCustomIngestion ?
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Step Definition Name:"}</FormLabel>
            <Col className={"d-flex align-items-center"}>
              {stepDefinitionName}
            </Col>
          </Row> : null
        }
        {usesSourceDatabase ?
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Source Database:"}</FormLabel>
            <Col className={"d-flex"}>
              <Select
                id="sourceDatabase-select-wrapper"
                inputId="sourceDatabase"
                components={{MenuList: props => MenuList("sourceDatabase", props)}}
                placeholder="Please select source database"
                value={sourceDbOptions.find(oItem => oItem.value === sourceDatabase)}
                onChange={handleSourceDatabase}
                isSearchable={false}
                isDisabled={!canReadWrite}
                aria-label="sourceDatabase-select"
                onBlur={sendPayload}
                options={sourceDbOptions}
                styles={reactSelectThemeConfig}
                formatOptionLabel={({value, label}) => {
                  return (
                    <span data-testid={`sourceDbOptions-${value}`}>
                      {label}
                    </span>
                  );
                }}
              />
              <div className={"p-2 d-flex"}>
                <HCTooltip
                  text={tooltips.sourceDatabase}
                  id="source-database-tooltip"
                  placement="left"
                >
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div>
            </Col>
          </Row>: null
        }
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Target Database:"}</FormLabel>
          <Col className={"d-flex"}>
            <OverlayTrigger overlay={<Tooltip id="button-tooltip-TgtDatabase">{keyboardNavigationTooltips.dropdownUserInfo}</Tooltip>} placement="left" show={tgtDatabaseTooltipVisible}>
              <span className={styles.tooltipRef} tabIndex={0} ref={tgtDatabaseTooltipRef} style={{width: "100%", marginLeft: "-1px"}} onKeyDown={(e) => serviceNameKeyDownHandler(e, "tgtDatabase")}>
                <Select
                  id="targetDatabase-select-wrapper"
                  inputId="targetDatabase"
                  tabIndex={0}
                  onKeyDown={(e) => serviceNameKeyDownHandler(e, "tgtDatabaseInner")}
                  components={{MenuList: props => MenuList("targetDatabase", props)}}
                  placeholder="Please select target database"
                  value={targetDbOptions.find(oItem => oItem.value === targetDatabase)}
                  onChange={handleTargetDatabase}
                  isSearchable={false}
                  isDisabled={!canReadWrite}
                  aria-label="targetDatabase-select"
                  onBlur={sendPayload}
                  options={targetDbOptions}
                  styles={reactSelectThemeConfig}
                  formatOptionLabel={({value, label}) => {
                    return (
                      <span data-testid={`targetDbOptions-${value}`}>
                        {label}
                      </span>
                    );
                  }}
                /></span></OverlayTrigger>
            <span tabIndex={0} ref={tgtDatabaseTooltipRef2} onKeyDown={(e) => serviceNameKeyDownHandler(e, "tgtDatabaseTooltip")} className={styles.tooltipRef}>
              <div className={"p-2 d-flex"}>
                <HCTooltip
                  text={tooltips.targetDatabase}
                  id="target-database-tooltip"
                  placement="left"
                  show={tgtDatabaseTooltipVisible2 ? tgtDatabaseTooltipVisible2 : undefined}
                >
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div>
            </span>
          </Col>
        </Row>
        {usesAdvancedTargetCollections ?
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Target Collections:"}</FormLabel>
            <Col className={"d-flex"} data-testid={"target-collections"}>
              <AdvancedTargetCollections
                defaultTargetCollections={defaultTargetCollections}
                targetCollections={targetCollections}
                setTargetCollections={handleAdvancedTargetCollections}
                canWrite={canReadWrite} />
            </Col>
          </Row> :
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Target Collections:"}</FormLabel>
            <Col className={"d-flex"} data-testid={"target-collections"}>
              <span className={styles.tooltipRef} tabIndex={0} ref={tgtCollectionTooltipRef} style={{width: "100%", marginLeft: "-1px"}} onKeyDown={(e) => serviceNameKeyDownHandler(e, "tgtCollection")}>
                <OverlayTrigger overlay={<Tooltip id="button-tooltip-addCol">{keyboardNavigationTooltips.dropdownUserInfo}</Tooltip>} placement="left" show={tgtCollectionTooltipVisible}>
                  <CreatableSelect
                    id="additionalColl-select-wrapper"
                    inputId="additionalColl"
                    isMulti
                    tabIndex={0}
                    onKeyDown={(e) => serviceNameKeyDownHandler(e, "tgtCollectionInner")}
                    isClearable={false}
                    placeholder="Please add target collections"
                    value={additionalCollections.map(d => ({value: d, label: d}))}
                    isDisabled={!canReadWrite}
                    onChange={handleAddColl}
                    onCreateOption={handleCreateAdditionalColl}
                    aria-label="additionalColl-select"
                    onBlur={sendPayload}
                    options={additionalCollectionsOptions}
                    styles={reactSelectThemeConfig}
                  /></OverlayTrigger> </span>
              <span tabIndex={0} ref={tgtCollectionTooltipRef2} onKeyDown={(e) => serviceNameKeyDownHandler(e, "tgtCollectionTooltip")} className={styles.tooltipRef}>
                <div className={"p-2 d-flex"}>
                  <HCTooltip
                    text={tooltips.additionalCollections}
                    id="additional-coll-tooltip"
                    placement="left"
                    show={tgtCollectionTooltipVisible2 ? tgtCollectionTooltipVisible2 :undefined}
                  >
                    <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                  </HCTooltip>
                </div></span>
            </Col>
          </Row>
        }
        {usesAdvancedTargetCollections ? null :
          <Row className={"mb-3"}>
            <FormLabel column lg={3} className={"text-left"}>{"Default Collections:"}</FormLabel>
            <Col className={"d-flex"}>
              <div className={"p-2 d-flex"}>
                <div className={styles.defaultCollections}>{defaultCollections.map((collection, i) => { return <div data-testid={`defaultCollections-${collection}`} key={i}>{collection}</div>; })}</div>
              </div>
            </Col>
          </Row>
        }
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Target Permissions:"}</FormLabel>
          <Col>
            <Row>
              <Col xs={12} className={"d-flex"}>
                <HCInput
                  id="targetPermissions"
                  ref={tgtPermissionRef}
                  tabIndex={0}
                  onKeyDown={(e) => serviceNameKeyDownHandler(e, "tgtPermission")}
                  placeholder="Please enter target permissions"
                  value={targetPermissions}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!canReadWrite}
                  className={styles.inputWithTooltip}
                />
                <span tabIndex={0} ref={tgtPermissionTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "tgtPermissionTooltip")} className={styles.tooltipRef}>
                  <div className={"p-2 d-flex"}>
                    <HCTooltip
                      text={tooltips.targetPermissions}
                      id="target-permissions-tooltip"
                      placement="left"
                      show={tgtPermissionTooltipVisible ? tgtPermissionTooltipVisible : undefined}
                    >
                      <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                    </HCTooltip>
                  </div>
                </span>
              </Col>
              <Col xs={12} className={styles.validationError} data-testid="validationError">
                {permissionValidationError}
              </Col>
            </Row>
          </Col>
        </Row>
        {usesTargetFormat ?
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Target Format:"}</FormLabel>
            <Col className={"d-flex"}>
              <Select
                id="targetFormat-select-wrapper"
                inputId="targetFormat"
                components={{MenuList: props => MenuList("targetFormat", props)}}
                placeholder="Please select target format"
                value={targetFormatOptions.find(oItem => oItem.value === targetFormat)}
                onChange={handleTargetFormat}
                isSearchable={false}
                isDisabled={!canReadWrite}
                aria-label="targetFormat-select"
                onBlur={sendPayload}
                options={targetFormatOptions}
                styles={reactSelectThemeConfig}
                formatOptionLabel={({value, label}) => {
                  return (
                    <span data-testid={`targetFormatOptions-${value}`}>
                      {label}
                    </span>
                  );
                }}
              />
              <div className={"p-2 d-flex"}>
                <HCTooltip
                  text={tooltips.targetFormat}
                  id="target-format-tooltip"
                  placement="left"
                >
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div>
            </Col>
          </Row> : null
        }
        <Row className={"mb-3"}>
          <FormLabel column lg={3} className={"pe-0"}>{"Provenance Granularity:"}</FormLabel>
          <Col className={"d-flex"}>
            <OverlayTrigger overlay={<Tooltip id="button-tooltip-provGran">{keyboardNavigationTooltips.dropdownUserInfo}</Tooltip>} placement="left" show={provGranTooltipVisible}>
              <div className={styles.tooltipRef}  ref={provGranTooltipRef} style={{width: "100%", marginLeft: "-2px"}} tabIndex={0} onKeyDown={(e) => serviceNameKeyDownHandler(e, "provGranularity")}>
                <Select
                  id="provGranularity-select-wrapper"
                  inputId="provGranularity"
                  components={{MenuList: props => MenuList("provGranularity", props)}}
                  placeholder="Please select provenance granularity"
                  value={provGranOpts.find(oItem => oItem.value === provGranularity)}
                  onChange={handleProvGranularity}
                  isSearchable={false}
                  isDisabled={!canReadWrite}
                  tabIndex={0}
                  onKeyDown={(e) => serviceNameKeyDownHandler(e, "provGranularityInner")}
                  aria-label="provGranularity-select"
                  onBlur={sendPayload}
                  options={provGranOpts}
                  styles={reactSelectThemeConfig}
                  formatOptionLabel={({value, label}) => {
                    return (
                      <span data-testid={`provOptions-${label}`}>
                        {label}
                      </span>
                    );
                  }}
                /></div></OverlayTrigger>
            <span tabIndex={0} ref={provGranTooltipRef2} onKeyDown={(e) => serviceNameKeyDownHandler(e, "provGranularityTooltip")} className={styles.tooltipRef}>
              <div className={"p-2 d-flex"}>
                <HCTooltip
                  text={tooltips.provGranularity}
                  id="prov-granularity-tooltip"
                  placement="left"
                  show={provGranTooltipVisible2 ? provGranTooltipVisible2 : undefined}
                >
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div></span>
          </Col>
        </Row>
        {stepType === "mapping" ?
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Entity Validation:"}</FormLabel>
            <Col className={"d-flex"}>
              <Select
                id="validateEntity-select-wrapper"
                inputId="validateEntity"
                components={{MenuList: props => MenuList("validateEntity", props)}}
                placeholder="Please select Entity Validation"
                value={valEntityOpts.find(oItem => oItem.value === validateEntity)}
                onChange={handleValidateEntity}
                isSearchable={false}
                isDisabled={!canReadWrite}
                aria-label="validateEntity-select"
                onBlur={sendPayload}
                options={valEntityOpts}
                styles={reactSelectThemeConfig}
                formatOptionLabel={({value, label}) => {
                  return (
                    <span data-testid={`entityValOpts-${value}`}>
                      {label}
                    </span>
                  );
                }}
              />
              <div className={"p-2 d-flex"}>
                <HCTooltip
                  text={tooltips.validateEntity}
                  id="validate-entity-tooltip"
                  placement="left"
                >
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div>
            </Col>
          </Row> : ""
        }
        {stepType === "mapping" ?
          <Row className={"mb-3"}>
            <FormLabel column lg={3} className={"pe-0"}>{"Source Record Scope:"}</FormLabel>
            <Col>
              <Row>
                <Col xs={12} className={"d-flex"}>
                  <Select
                    id="sourceRecordScope-select-wrapper"
                    inputId="sourceRecordScope"
                    components={{MenuList: props => MenuList("sourceRecordScope", props)}}
                    placeholder="Please select Source Record Scope"
                    value={sourceRecordScopeValue.find(oItem => oItem.value === sourceRecordScope)}
                    onChange={handleSourceRecordScope}
                    isSearchable={false}
                    isDisabled={!canReadWrite}
                    aria-label="sourceRecordScope-select"
                    options={sourceRecordScopeValue}
                    styles={reactSelectThemeConfig}
                    formatOptionLabel={({value, label}) => {
                      return (
                        <span data-testid={`sourceRecordScopeOptions-${value}`}>
                          {label}
                        </span>
                      );
                    }}
                  />
                  <div className={"p-2 d-flex"}>
                    <HCTooltip text={tooltips.sourceRecordScope} id="source-record-scope-tooltip" placement="left">
                      <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                    </HCTooltip>
                  </div>
                </Col>
                {sourceRecordScopeToggled ?
                  <Col xs={12}>
                    <div className={styles.toggleSourceScopeMsg}>{toggleSourceRecordScopeMessage}</div>
                  </Col> : null
                }
              </Row>
            </Col>
          </Row> : ""
        }
        {stepType === "mapping" ?
          <Row className={"mb-3"}>
            <FormLabel column lg={3} className={"pe-0"}>{"Attach Source Document:"}</FormLabel>
            <Col className={"d-flex align-items-center"}>
              <FormCheck
                inline
                id={"attachmentTrue"}
                data-testid="attachmentTrue"
                name={"attachSourceDocument"}
                type={"radio"}
                checked={attachSourceDocument}
                onChange={handleChange}
                label={"Yes"}
                value={1}
                className={"mb-0"}
              />
              <FormCheck
                inline
                id={"attachmentFalse"}
                data-testid="attachmentFalse"
                name={"attachSourceDocument"}
                type={"radio"}
                checked={!attachSourceDocument}
                onChange={handleChange}
                label={"No"}
                value={0}
                className={"mb-0"}
              />
              <div className={"p-2 d-flex align-items-center"}>
                <HCTooltip
                  text={tooltips.attachSourceDocument}
                  id="attach-source-document-tooltip"
                  placement="left"
                >
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div>
            </Col>
          </Row> : ""
        }
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Batch Size:"}</FormLabel>
          <Col className={"d-flex"}>
            <HCInput
              id="batchSize"
              ref={batchSizeRef}
              tabIndex={0}
              onKeyDown={(e) => serviceNameKeyDownHandler(e, "batchSize")}
              placeholder="Please enter batch size"
              value={batchSize}
              onChange={handleChange}
              disabled={!canReadWrite}
              className={styles.inputBatchSize}
              onBlur={sendPayload}
            />
            <div tabIndex={0} ref={batchSizeTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "batchSizeTooltip")} className={styles.tooltipRef}>
              <div className={"p-2 d-flex"}>
                <HCTooltip
                  text={tooltips.batchSize}
                  id="batch-size-tooltip"
                  placement="right"
                  show={batchSizeTooltipVisible ? batchSizeTooltipVisible : undefined}
                >
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div>
            </div>
          </Col>
        </Row>
        {usesHeaders ?
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Header Content:"}</FormLabel>
            <Col>
              <Row>
                <Col className={"d-flex"}>
                  <FormControl as="textarea"
                    id="headers"
                    placeholder="Please enter header content"
                    value={headers}
                    tabIndex={0}
                    ref={headerContentRef}
                    onKeyDown={(e) => serviceNameKeyDownHandler(e, "headerContent")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!canReadWrite}
                    className={styles.textarea}
                    rows={6}
                    aria-label="headers-textarea"
                    style={!headersValid ? {border: "solid 1px #C00"} : {}}
                  />
                  <span tabIndex={0} ref={headerContentTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "headerContentTooltip")} className={styles.tooltipRef}>
                    <div className={"p-2 d-flex align-items-center"}>
                      <HCTooltip
                        text={tooltips.headers}
                        id="headers-tooltip"
                        placement="left"
                        show={headerContentTooltipVisible ? headerContentTooltipVisible : undefined}
                      >
                        <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                      </HCTooltip>
                    </div>
                  </span>
                </Col>
                {!headersValid ?
                  <Col xs={12}>
                    <div className={styles.invalid}>{invalidJSONMessage}</div>
                  </Col> : null
                }
              </Row>
            </Col>
          </Row> : null
        }
        <Row className={"mb-3"}>
          <Col className={"d-flex"}>
            <span>
              {interceptorsExpanded ?
                <ChevronDown className={styles.rightArrow} onClick={() => setInterceptorsExpanded(!interceptorsExpanded)} /> :
                <ChevronRight className={styles.rightArrow} onClick={() => setInterceptorsExpanded(!interceptorsExpanded)} />}
              <span aria-label="interceptors-expand" className={styles.expandLabel} onClick={() => setInterceptorsExpanded(!interceptorsExpanded)}>Interceptors</span>
            </span>
          </Col>
        </Row>
        {interceptorsExpanded ?
          <Row className={"mb-3"}>
            <Col>
              <Row>
                <Col className={"d-flex"}>
                  <FormControl as="textarea"
                    id="interceptors"
                    placeholder="Please enter interceptor content"
                    value={interceptors}
                    tabIndex={0}
                    ref={interceptorRef}
                    onKeyDown={(e) => serviceNameKeyDownHandler(e, "interceptors")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!canReadWrite}
                    className={styles.textareaExpand}
                    rows={6}
                    aria-label="interceptors-textarea"
                    style={!interceptorsValid ? {border: "solid 1px #C00"} : {}}
                  />
                  <span tabIndex={0} ref={interceptorTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "interceptorTooltip")} className={styles.tooltipRef}>
                    <div className={"p-2 d-flex align-items-center"}>
                      <HCTooltip
                        text={tooltips.interceptors}
                        id="interceptors-tooltip"
                        placement="left"
                        show={interceptorTooltipVisible ? interceptorTooltipVisible : undefined}
                      >
                        <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                      </HCTooltip>
                    </div>
                  </span>
                </Col>
                {!interceptorsValid ?
                  <Col xs={12}>
                    <div className={styles.invalidExpand}>{invalidJSONMessage}</div>
                  </Col> : null
                }
              </Row>
            </Col>
          </Row> : ""
        }
        <Row className={"mb-3"}>
          <Col className={"d-flex"}>
            <span>
              {customHookExpanded ?
                <ChevronDown className={styles.rightArrow} onClick={() => setCustomHookExpanded(!customHookExpanded)} /> :
                <ChevronRight className={styles.rightArrow} onClick={() => setCustomHookExpanded(!customHookExpanded)} />}
              <span aria-label="custom-hook-expand" className={styles.expandLabel} onClick={() => setCustomHookExpanded(!customHookExpanded)}>Custom Hook</span>
              <HCTooltip
                text={tooltips.customHookDeprecated}
                id="custom-hook-deprecated-tooltip"
                placement="left"
              >
                <span className={styles.deprecatedLabel}>DEPRECATED</span>
              </HCTooltip>
            </span>
          </Col>
        </Row>
        {customHookExpanded ?
          <Row className={"mb-3"}>
            <Col>
              <Row>
                <Col className={"d-flex"}>
                  <FormControl as="textarea"
                    id="customHook"
                    placeholder="Please enter custom hook content"
                    value={customHook}
                    onChange={handleChange}
                    tabIndex={0}
                    ref={customHookRef}
                    onKeyDown={(e) => serviceNameKeyDownHandler(e, "customHook")}
                    onBlur={handleBlur}
                    disabled={!canReadWrite}
                    className={styles.textareaExpand}
                    rows={6}
                    aria-label="customHook-textarea"
                    style={!customHookValid ? {border: "solid 1px #C00"} : {}}
                  />
                  <span tabIndex={0} ref={customHookTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "customHookTooltip")} className={styles.tooltipRef}>
                    <div className={"p-2 d-flex align-items-center"}>
                      <HCTooltip
                        text={tooltips.customHook}
                        id="custom-hook-tooltip"
                        placement="left"
                        show={customHookTooltipVisible ? customHookTooltipVisible : undefined}
                      >
                        <QuestionCircleFill color="#7F86B5" size={13} />
                      </HCTooltip>
                    </div>
                  </span>
                </Col>
                <Col xs={12}>
                  {!customHookValid ? <div className={styles.invalidExpand}>{invalidJSONMessage}</div> : null}
                </Col>
              </Row>
            </Col>
          </Row> : ""
        }
        {stepType === "custom" || isCustomIngestion ?
          <Row>
            <FormLabel column lg={3}>{"Additional Settings:"}</FormLabel>
            <Col>
              <Row>
                <Col className={"d-flex"}>
                  <FormControl as="textarea"
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
                  <div className={"p-2 d-flex"}>
                    <HCTooltip
                      text={props.tooltipsData.additionalSettings}
                      id="additional-settings-tooltip"
                      placement="left"
                    >
                      <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                    </HCTooltip>
                  </div>
                </Col>
                {!additionalSettingsValid ?
                  <Col xs={12}>
                    <div className={styles.invalid}>{invalidJSONMessage}</div>
                  </Col> : null
                }
              </Row>
            </Col>
          </Row> : null
        }
        <Row className={"mt-4"}>
          <Col className={"d-flex justify-content-end"}>
            <span tabIndex={0} ref={cancelButtonRef} className={styles.buttonFocusHighlight} onKeyDown={(event) => serviceNameKeyDownHandler(event, "cancelButton")}>
              <HCButton tabIndex={-1} aria-label="Cancel" variant="outline-light" size="sm" data-testid={`${props.stepData.name}-cancel-settings`} onClick={() => onCancel()}>Cancel</HCButton></span>&nbsp;&nbsp;
            {!canReadWrite || !isFormValid() ? <HCTooltip id="missing-permission-tooltip" text={tooltips.missingPermission} placement={"top-end"}>
              <span className={styles.disabledCursor}>
                <span tabIndex={0} ref={saveButtonRef} className={styles.buttonFocusHighlight} onKeyDown={(event) => serviceNameKeyDownHandler(event, "saveButton")}>
                  <HCButton tabIndex={-1} size="sm" id={"saveButton"} className={styles.saveButton} data-testid={`${props.stepData.name}-save-settings`} variant="primary" type="submit" onClick={handleSubmit} disabled={true}>Save</HCButton></span>
              </span>
            </HCTooltip> :
              <span tabIndex={0} ref={saveButtonRef} className={styles.buttonFocusHighlight} onKeyDown={(event) => serviceNameKeyDownHandler(event, "saveButton")}>
                <HCButton tabIndex={-1} size="sm" id={"saveButton"} data-testid={`${props.stepData.name}-save-settings`} variant="primary" type="submit" onClick={handleSubmit} disabled={false} onFocus={sendPayload}>Save</HCButton></span>}
          </Col>
        </Row>
      </Form>
    </div>
  );

};

export default AdvancedSettings;
