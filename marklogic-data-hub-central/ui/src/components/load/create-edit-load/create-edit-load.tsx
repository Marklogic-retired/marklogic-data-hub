import React, {useState, useEffect} from "react";
import {Form, Input, Select, Button, Tooltip} from "antd";
import styles from "./create-edit-load.module.scss";
import {srcOptions, tgtOptions, fieldSeparatorOptions} from "../../../config/formats.config";
import StepsConfig from "../../../config/steps.config";
import {NewLoadTooltips} from "../../../config/tooltips.config";
import {QuestionCircleFill} from "react-bootstrap-icons";
import HCTooltip from "../../common/hc-tooltip/hc-tooltip";

interface Props {
  tabKey: string;
  openStepSettings: boolean;
  setOpenStepSettings: any;
  isEditing: boolean;
  canReadWrite: boolean;
  canReadOnly: boolean;
  createLoadArtifact: any;
  updateLoadArtifact: any;
  stepData: any;
  currentTab: string;
  setIsValid: any;
  resetTabs: any;
  setHasChanged: any;
  setPayload: any;
  onCancel: any;
}

const CreateEditLoad: React.FC<Props> = (props) => {
  const [stepName, setStepName] = useState(props.stepData && props.stepData !== {} ? props.stepData.name : "");
  const [description, setDescription] = useState(props.stepData && props.stepData !== {} ? props.stepData.description : "");
  const [srcFormat, setSrcFormat] = useState(props.stepData && props.stepData !== {} ? props.stepData.sourceFormat : StepsConfig.defaultSourceFormat);
  const [tgtFormat, setTgtFormat] = useState(props.stepData && props.stepData !== {} ? props.stepData.targetFormat : StepsConfig.defaultTargetFormat);
  const [sourceName, setSourceName] = useState(props.stepData && props.stepData !== {} ? props.stepData.sourceName : "");
  const [sourceType, setSourceType] = useState(props.stepData && props.stepData !== {} ? props.stepData.sourceType : "");
  const [outputUriPrefix, setOutputUriPrefix] = useState(props.stepData && props.stepData !== {} ? props.stepData.outputURIPrefix : "");
  const [fieldSeparator, setFieldSeparator] = useState(props.stepData && props.stepData !== {} ? props.stepData.fieldSeparator : StepsConfig.defaultFieldSeparator);
  const [otherSeparator, setOtherSeparator] = useState("");

  //To check submit validity
  const [isStepNameTouched, setStepNameTouched] = useState(false);
  const [isDescriptionTouched, setDescriptionTouched] = useState(false);
  const [isSrcFormatTouched, setSrcFormatTouched] = useState(false);
  const [isTgtFormatTouched, setTgtFormatTouched] = useState(false);
  const [isSourceNameTouched, setSourceNameTouched] = useState(false);
  const [isSourceTypeTouched, setSourceTypeTouched] = useState(false);
  const [isOutputUriPrefixTouched, setOutputUriPrefixTouched] = useState(false);
  const [isFieldSeparatorTouched, setFieldSeparatorTouched] = useState(false);
  const [isOtherSeparatorTouched, setOtherSeparatorTouched] = useState(false);

  const [isValid, setIsValid] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [invalidChars, setInvalidChars] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);

  const initStep = () => {
    setStepName(props.stepData.name);
    setDescription(props.stepData.description);
    setSrcFormat(props.stepData.sourceFormat);
    if (props.stepData.separator) {
      if ([",", "\\t", "|", ";"].includes(props.stepData.separator)) {
        setFieldSeparator(props.stepData.separator);
      } else {
        setFieldSeparator("Other");
        setOtherSeparator(props.stepData.separator);
      }
    }
    setTgtFormat(props.stepData.targetFormat);
    setOutputUriPrefix(props.stepData.outputURIPrefix);
    setIsValid(true);
    props.setIsValid(true);
    setTobeDisabled(true);

    setDescriptionTouched(false);
    setSrcFormatTouched(false);
    setTgtFormatTouched(false);
    setSourceNameTouched(false);
    setSourceTypeTouched(false);
    setOutputUriPrefixTouched(false);
  };

  useEffect(() => {
    // Edit step
    if (props.stepData && JSON.stringify(props.stepData) !== JSON.stringify({}) && props.isEditing) {
      initStep();
    } else {    // New step
      setStepName("");
      setStepNameTouched(false);
      setDescription("");
      setDescriptionTouched(false);
      setSrcFormat(StepsConfig.defaultSourceFormat);
      setSrcFormatTouched(false);
      setFieldSeparator(StepsConfig.defaultFieldSeparator);
      setFieldSeparatorTouched(false);
      setOtherSeparator("");
      setOtherSeparatorTouched(false);
      setTgtFormat(StepsConfig.defaultTargetFormat);
      setTgtFormatTouched(false);
      setSourceName("");
      setSourceNameTouched(false);
      setSourceType("");
      setSourceTypeTouched(false);
      setOutputUriPrefix("");
      setOutputUriPrefixTouched(false);
      setIsValid(false);
      props.setIsValid(false);
    }
    // Reset
    return (() => {
      setStepName("");
      setStepNameTouched(false);
      setDescription("");
      setDescriptionTouched(false);
      setSrcFormat(StepsConfig.defaultSourceFormat);
      setSrcFormatTouched(false);
      setFieldSeparator(StepsConfig.defaultFieldSeparator);
      setFieldSeparatorTouched(false);
      setOtherSeparator("");
      setOtherSeparatorTouched(false);
      setTgtFormat(StepsConfig.defaultTargetFormat);
      setTgtFormatTouched(false);
      setSourceName("");
      setSourceNameTouched(false);
      setSourceType("");
      setSourceTypeTouched(false);
      setOutputUriPrefix("");
      setOutputUriPrefixTouched(false);
      setTobeDisabled(false);
    });

  }, [props.stepData, props.isEditing]);

  const onCancel = () => {
    // Parent checks changes across tabs
    props.onCancel();
  };

  /* sends payload to steps.tsx */
  const sendPayload = () => {
    props.setHasChanged(hasFormChanged());
    props.setPayload(getPayload());
  };

  const hasFormChanged = () => {
    if (!isStepNameTouched
      && !isDescriptionTouched
      && !isSrcFormatTouched
      && !isTgtFormatTouched
      && !isSourceNameTouched
      && !isSourceTypeTouched
      && !isOutputUriPrefixTouched
      && !isFieldSeparatorTouched
      && !isOtherSeparatorTouched
    ) {
      return false;
    } else {
      return true;
    }
  };

  const getPayload = () => {
    let result;
    if (srcFormat === "csv") {
      result = {
        name: stepName,
        description: description,
        sourceFormat: srcFormat,
        separator: fieldSeparator === "Other"? otherSeparator : fieldSeparator,
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
      };
      if (props.stepData.separator) {
        result.separator = null;
      }
    }
    return result;
  };

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    if (!stepName || invalidChars) {
      // missing name
      setStepNameTouched(true);
      event.preventDefault();
      return;
    }
    // else: submit handle

    if (event) event.preventDefault();

    setIsValid(true);
    props.setIsValid(true);

    if (!props.isEditing) {
      props.createLoadArtifact(getPayload());
    } else {
      props.updateLoadArtifact(getPayload());
    }
    props.setOpenStepSettings(false);
    props.resetTabs();
  };

  const handleChange = (event) => {
    if (event.target.id === "name") {
      let isSpecialChars = false;
      if (event.target.value === " ") {
        setStepNameTouched(false);
      } else {
        setStepNameTouched(true);
        setStepName(event.target.value);

        //check value does not contain special chars and leads with a letter
        if (event.target.value !== "" && !(/^[a-zA-Z][a-zA-Z0-9\-_]*$/g.test(event.target.value))) {
          setInvalidChars(true);
          isSpecialChars = true;
        } else {
          setInvalidChars(false);
        }
        if (event.target.value.length === 0 || isSpecialChars) {
          setIsValid(false);
          props.setIsValid(false);
        } else if (srcFormat && tgtFormat) {
          setIsValid(true);
          props.setIsValid(true);
        }
      }
    }

    if (event.target.id === "description") {
      if (event.target.value === " ") {
        setDescriptionTouched(false);
      } else {
        setDescriptionTouched(true);
        setDescription(event.target.value);
        if (props.stepData && props.stepData.description) {
          if (event.target.value === props.stepData.description) {
            setDescriptionTouched(false);
          }
        }
        if (!props.isEditing) {
          if (event.target.value === "") {
            setDescriptionTouched(false);
          }
        }
      }
    }

    if (event.target.id === "sourceName") {
      if (event.target.value === " ") {
        setSourceNameTouched(false);
      } else {
        setSourceNameTouched(true);
        setSourceName(event.target.value);
        if (props.stepData && props.stepData.sourceName) {
          if (event.target.value === props.stepData.sourceName) {
            setSourceNameTouched(false);
          }
        }
        if (!props.isEditing) {
          if (event.target.value === "") {
            setSourceNameTouched(false);
          }
        }
      }
    }

    if (event.target.id === "sourceType") {
      if (event.target.value === " ") {
        setSourceTypeTouched(false);
      } else {
        setSourceTypeTouched(true);
        setSourceType(event.target.value);
        if (props.stepData && props.stepData.sourceType) {
          if (event.target.value === props.stepData.sourceType) {
            setSourceTypeTouched(false);
          }
        }
        if (!props.isEditing) {
          if (event.target.value === "") {
            setSourceTypeTouched(false);
          }
        }
      }
    }
  };

  const handleOutputUriPrefix = (event) => {
    if (event.target.id === "outputUriPrefix") {
      if (event.target.value === " ") {
        setOutputUriPrefixTouched(false);
      } else {
        setOutputUriPrefixTouched(true);
        setOutputUriPrefix(event.target.value);
        if (props.stepData && props.stepData.outputURIPrefix) {
          if (event.target.value === props.stepData.outputURIPrefix) {
            setOutputUriPrefixTouched(false);
          }
        }
        if (!props.isEditing) {
          if (event.target.value === "") {
            setOutputUriPrefixTouched(false);
          }
        }
      }
    }
  };

  const handleSrcFormat = (value) => {
    if (value === " ") {
      setSrcFormatTouched(false);
    } else {
      setSrcFormatTouched(true);
      setSrcFormat(value);
      if (props.stepData && props.stepData.srcFormat) {
        if (value === props.stepData.srcFormat) {
          setSrcFormatTouched(false);
        }
      }
      if (!props.isEditing) {
        if (value === "") {
          setSrcFormatTouched(false);
        }
      }
      if (value === "csv") {
        setFieldSeparator(StepsConfig.defaultFieldSeparator);
      }
    }
  };

  const handleFieldSeparator = (value) => {
    if (value === " ") {
      setFieldSeparatorTouched(false);
    } else {
      setFieldSeparatorTouched(true);
      setFieldSeparator(value);
      if (value === "Other") {
        setOtherSeparator("");
      }
      if (props.stepData && props.stepData.fieldSeparator) {
        if (value === props.stepData.fieldSeparator) {
          setFieldSeparatorTouched(false);
        }
      }
      if (!props.isEditing) {
        if (value === StepsConfig.defaultFieldSeparator) {
          setFieldSeparatorTouched(false);
        }
      }
    }
  };

  const handleOtherSeparator = (event) => {
    if (event.target.value === " ") {
      setOtherSeparatorTouched(false);
    } else {
      setOtherSeparatorTouched(true);
      setOtherSeparator(event.target.value);
      if (props.stepData && props.stepData.fieldSeparator) {
        if (event.target.value === props.stepData.fieldSeparator) {
          setOtherSeparatorTouched(false);
        }
      }
      if (!props.isEditing) {
        if (event.target.value === "") {
          setOtherSeparatorTouched(false);
        }
      }
    }
  };

  const handleTgtFormat = (value) => {
    if (value === " ") {
      setTgtFormatTouched(false);
    } else {
      setTgtFormatTouched(true);
      setTgtFormat(value);
      if (props.stepData && props.stepData.tgtFormat) {
        if (value === props.stepData.tgtFormat) {
          setTgtFormatTouched(false);
        }
      }
      if (!props.isEditing) {
        if (value === "") {
          setTgtFormatTouched(false);
        }
      }
      if (value !== "json" && value !== "xml") {
        setSourceName("");
        setSourceType("");
      }
    }
  };

  const formItemLayout = {
    labelCol: {
      xs: {span: 24},
      sm: {span: 7},
    },
    wrapperCol: {
      xs: {span: 28},
      sm: {span: 15},
    },
  };

  const soptions = Object.keys(srcOptions).map(d => <Select.Option key={srcOptions[d]}>{d}</Select.Option>);
  const fsoptions = Object.keys(fieldSeparatorOptions).map(d => <Select.Option key={fieldSeparatorOptions[d]}>{d}</Select.Option>);
  const toptions = Object.keys(tgtOptions).map(d => <Select.Option key={tgtOptions[d]}>{d}</Select.Option>);

  return (
    <div className={styles.newDataLoadForm}>
      <div className={styles.newLoadCardTitle} aria-label={"newLoadCardTitle"}>Configure the new Loading step. Then, add the new step to a flow and run it to load your data.</div>
      <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
        <Form.Item label={<span>
          Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;

          &nbsp;
        </span>} labelAlign="left"
        validateStatus={(stepName || !isStepNameTouched) ? (invalidChars ? "error" : "") : "error"}
        help={invalidChars ? "Names must start with a letter and can contain letters, numbers, hyphens, and underscores only." : (stepName || !isStepNameTouched) ? "" : "Name is required"}
        >
          { tobeDisabled?<Tooltip title={NewLoadTooltips.nameField} placement={"bottom"}> <Input
            id="name"
            placeholder="Enter name"
            value={stepName}
            onChange={handleChange}
            disabled={tobeDisabled}
            className={styles.input}
            onBlur={sendPayload}
          /></Tooltip>:<Input
            id="name"
            placeholder="Enter name"
            value={stepName}
            onChange={handleChange}
            disabled={tobeDisabled}
            className={styles.input}
            onBlur={sendPayload}
          />}
          <span className={styles.questionMarkIcon}>
            <HCTooltip text={NewLoadTooltips.name} id="name-tooltip" placement="left">
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </span>
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
            onBlur={sendPayload}
          /><span className={styles.questionMarkIcon}><HCTooltip text={NewLoadTooltips.description} id="description-tooltip" placement="left">
            <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
          </HCTooltip></span>
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
            style={{width: "95%"}}
            onBlur={sendPayload}
          >
            {soptions}
          </Select>
          <span className={styles.questionMarkIcon}>
            <HCTooltip text={NewLoadTooltips.sourceFormat} id="source-format-tooltip" placement="left">
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </span>
        </Form.Item>
        {srcFormat === "csv" ? <Form.Item label={<span>
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
            onBlur={sendPayload}
          >
            {fsoptions}
          </Select></span>
          &nbsp;&nbsp;
          <span>{fieldSeparator === "Other" ? <span><Input
            id="otherSeparator"
            value={otherSeparator}
            onChange={handleOtherSeparator}
            style={{width: 75}}
            disabled={props.canReadOnly && !props.canReadWrite}
            onBlur={sendPayload}
          />&nbsp;&nbsp;<HCTooltip text={NewLoadTooltips.fieldSeparator} id="field-separator-tooltip" placement="top">
            <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
          </HCTooltip></span> : <span>&nbsp;&nbsp;<HCTooltip text={NewLoadTooltips.fieldSeparator} id="field-separator-tooltip" placement="right">
            <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
          </HCTooltip></span>}</span>
        </Form.Item> : ""}
        <Form.Item label={<span>
          Target Format:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
        </span>} labelAlign="left">
          <Select
            id="targetFormat"
            placeholder="Enter target format"
            value={tgtFormat}
            onChange={handleTgtFormat}
            disabled={props.canReadOnly && !props.canReadWrite}
            style={{width: "95%"}}
            onBlur={sendPayload}>
            {toptions}
          </Select>
          <span className={styles.questionMarkIcon}>
            <HCTooltip text={NewLoadTooltips.targetFormat} id="target-format-tooltip" placement="left">
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </span>
        </Form.Item>
        {(tgtFormat && (tgtFormat.toLowerCase() === "json" || tgtFormat.toLowerCase() === "xml")) && <Form.Item label={<span>
          Source Name:&nbsp;
        </span>} labelAlign="left">
          <Input
            id="sourceName"
            placeholder="Enter Source Name"
            value={sourceName}
            onChange={handleChange}
            disabled={props.canReadOnly && !props.canReadWrite}
            className={styles.input}
            onBlur={sendPayload}
          />
          <span className={styles.questionMarkIcon}>
            <HCTooltip text={NewLoadTooltips.sourceName} id="source-name-tooltip" placement="left">
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </span>
        </Form.Item>}
        {(tgtFormat && (tgtFormat.toLowerCase() === "json" || tgtFormat.toLowerCase() === "xml")) && <Form.Item label={<span>
          Source Type:&nbsp;
        </span>} labelAlign="left">
          <Input
            id="sourceType"
            placeholder="Enter Source Type"
            value={sourceType}
            onChange={handleChange}
            disabled={props.canReadOnly && !props.canReadWrite}
            className={styles.input}
            onBlur={sendPayload}
          />
          <span className={styles.questionMarkIcon}>
            <HCTooltip text={NewLoadTooltips.sourceType} id="source-type-tooltip" placement="left">
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </span>
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
            onBlur={sendPayload}
          />
          <span className={styles.questionMarkIcon}>
            <HCTooltip text={NewLoadTooltips.outputURIPrefix} id="output-uri-refix-tooltip" placement="left">
              <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
            </HCTooltip>
          </span>
        </Form.Item>

        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <Button aria-label="Cancel" onClick={() => onCancel()}>Cancel</Button>
            &nbsp;&nbsp;
            {!props.canReadWrite?<HCTooltip text={NewLoadTooltips.missingPermission} id="disabled-save-tooltip" placement={"bottom-end"}><span className={styles.disabledCursor}><Button
              className={styles.disabledSaveButton}
              aria-label="Save"
              type="primary"
              htmlType="submit"
              disabled={true}
              onClick={handleSubmit}
            >Save</Button></span></HCTooltip>:
              <Button
                aria-label="Save"
                type="primary"
                htmlType="submit"
                disabled={false}
                onClick={handleSubmit}
                onFocus={sendPayload}
              >Save</Button>}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateEditLoad;
