import React, {useState, useEffect} from "react";
import {Form, Row, Col, FormLabel} from "react-bootstrap";
import Select from "react-select";
import reactSelectThemeConfig from "../../../config/react-select-theme.config";
import styles from "./create-edit-load.module.scss";
import {srcOptions, tgtOptions, fieldSeparatorOptions} from "../../../config/formats.config";
import StepsConfig from "../../../config/steps.config";
import {NewLoadTooltips} from "../../../config/tooltips.config";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {HCInput, HCButton, HCTooltip} from "@components/common";

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
        separator: fieldSeparator === "Other" ? otherSeparator : fieldSeparator,
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

  const handleSubmit = (event: {preventDefault: () => void;}) => {
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

  const handleSrcFormat = (selectedItem) => {
    if (selectedItem.value === " ") {
      setSrcFormatTouched(false);
    } else {
      setSrcFormatTouched(true);
      setSrcFormat(selectedItem.value);
      if (props.stepData && props.stepData.srcFormat) {
        if (selectedItem.value === props.stepData.srcFormat) {
          setSrcFormatTouched(false);
        }
      }
      if (!props.isEditing) {
        if (selectedItem.value === "") {
          setSrcFormatTouched(false);
        }
      }
      if (selectedItem.value === "csv") {
        setFieldSeparator(StepsConfig.defaultFieldSeparator);
      }
    }
  };

  const handleFieldSeparator = (selectedItem) => {
    if (selectedItem.value === " ") {
      setFieldSeparatorTouched(false);
    } else {
      setFieldSeparatorTouched(true);
      setFieldSeparator(selectedItem.value);
      if (selectedItem.value === "Other") {
        setOtherSeparator("");
      }
      if (props.stepData && props.stepData.fieldSeparator) {
        if (selectedItem.value === props.stepData.fieldSeparator) {
          setFieldSeparatorTouched(false);
        }
      }
      if (!props.isEditing) {
        if (selectedItem.value === StepsConfig.defaultFieldSeparator) {
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

  const handleTgtFormat = (selectedItem) => {
    if (selectedItem.value === " ") {
      setTgtFormatTouched(false);
    } else {
      setTgtFormatTouched(true);
      setTgtFormat(selectedItem.value);
      if (props.stepData && props.stepData.tgtFormat) {
        if (selectedItem.value === props.stepData.tgtFormat) {
          setTgtFormatTouched(false);
        }
      }
      if (!props.isEditing) {
        if (selectedItem.value === "") {
          setTgtFormatTouched(false);
        }
      }
      if (selectedItem.value !== "json" && selectedItem.value !== "xml") {
        setSourceName("");
        setSourceType("");
      }
    }
  };

  const sourceFormatSelectOptions = Object.keys(srcOptions).map(d => ({value: srcOptions[d], label: d}));
  const fieldSeparatorSelectOptions = Object.keys(fieldSeparatorOptions).map(d => ({value: fieldSeparatorOptions[d], label: d}));
  const targetFormatSelectOptions = Object.keys(tgtOptions).map(d => ({value: tgtOptions[d], label: d}));

  return (
    <div className={styles.newDataLoadForm}>
      <div className={styles.newLoadCardTitle} aria-label={"newLoadCardTitle"}>Configure the new Loading step. Then, add the new step to a flow and run it to load your data.</div>
      <Form onSubmit={handleSubmit} data-testid={"create-edit-load-form"} className={"container-fluid"}>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Name:"}<span className={styles.asterisk}>*</span></FormLabel>
          <Col>
            <Row>
              <Col className={(stepName || !isStepNameTouched) ? (invalidChars ? "d-flex has-error" : "d-flex") : "d-flex has-error"}>
                {tobeDisabled ?
                  <HCTooltip id="name-step-tooltip" text={NewLoadTooltips.nameField} placement={"bottom"}>
                    <span className={"w-100"}>
                      <HCInput
                        id="name"
                        placeholder="Enter name"
                        value={stepName ? stepName : " "}
                        onChange={handleChange}
                        disabled={tobeDisabled}
                        onBlur={sendPayload}
                      />
                    </span>
                  </HCTooltip> :
                  <HCInput
                    id="name"
                    placeholder="Enter name"
                    value={stepName ? stepName : " "}
                    onChange={handleChange}
                    disabled={tobeDisabled}
                    onBlur={sendPayload}
                  />
                }
                <div className={"p-2 d-flex"}>
                  <HCTooltip text={NewLoadTooltips.name} id="name-tooltip" placement="left">
                    <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                  </HCTooltip>
                </div>
              </Col>
              <Col xs={12} className={styles.validationError}>
                {invalidChars ? "Names must start with a letter and can contain letters, numbers, hyphens, and underscores only." : (stepName || !isStepNameTouched) ? "" : "Name is required"}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Description:"}</FormLabel>
          <Col className={"d-flex"}>
            <HCInput
              id="description"
              placeholder="Enter description"
              value={description ? description: " "}
              onChange={handleChange}
              disabled={props.canReadOnly && !props.canReadWrite}
              className={styles.input}
              onBlur={sendPayload}
            />
            <div className={"p-2 d-flex"}>
              <HCTooltip text={NewLoadTooltips.description} id="description-tooltip" placement="left">
                <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
              </HCTooltip>
            </div>
          </Col>
        </Row>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Source Format:"}&nbsp;<span className={styles.asterisk}>*</span></FormLabel>
          <Col className={"d-flex"}>
            <Select
              id="sourceFormat-select-wrapper"
              inputId="sourceFormat"
              placeholder="Enter source format"
              value={sourceFormatSelectOptions.find(oItem => oItem.value === srcFormat)}
              onChange={handleSrcFormat}
              isDisabled={props.canReadOnly && !props.canReadWrite}
              aria-label="sourceFormat-select"
              onBlur={sendPayload}
              options={sourceFormatSelectOptions}
              styles={reactSelectThemeConfig}
            />
            <div className={"p-2 d-flex"}>
              <HCTooltip text={NewLoadTooltips.sourceFormat} id="source-format-tooltip" placement="left">
                <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
              </HCTooltip>
            </div>
          </Col>
        </Row>
        {srcFormat === "csv" ?
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Field Separator:"}&nbsp;<span className={styles.asterisk}>*</span></FormLabel>
            <Col className={"d-flex"}>
              <Select
                id="fieldSeparator-select-wrapper"
                inputId="fieldSeparator"
                placeholder="Choose Field Separator"
                value={fieldSeparatorSelectOptions.find(oItem => oItem.value === fieldSeparator)}
                onChange={handleFieldSeparator}
                isDisabled={props.canReadOnly && !props.canReadWrite}
                aria-label="fieldSeparator-select"
                onBlur={sendPayload}
                options={fieldSeparatorSelectOptions}
                styles={reactSelectThemeConfig}
              />
              {fieldSeparator === "Other" ?
                <>
                  <div className={"d-flex ms-2"}>
                    <HCInput
                      id="otherSeparator"
                      value={otherSeparator ? otherSeparator: " "}
                      onChange={handleOtherSeparator}
                      style={{width: 75}}
                      disabled={props.canReadOnly && !props.canReadWrite}
                      onBlur={sendPayload}
                    />
                  </div>
                  <div className={"p-2 d-flex"}>
                    <HCTooltip text={NewLoadTooltips.fieldSeparator} id="field-separator-tooltip" placement="top">
                      <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                    </HCTooltip>
                  </div>
                </>
                :
                <div className={"p-2 d-flex"}>
                  <HCTooltip text={NewLoadTooltips.fieldSeparator} id="field-separator-tooltip" placement="right">
                    <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                  </HCTooltip>
                </div>
              }
            </Col>
          </Row> : ""
        }
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Target Format:"}&nbsp;<span className={styles.asterisk}>*</span></FormLabel>
          <Col className={"d-flex"}>
            <Select
              id="targetFormat-select-wrapper"
              inputId="targetFormat"
              placeholder="Enter target format"
              value={targetFormatSelectOptions.find(oItem => oItem.value === tgtFormat)}
              onChange={handleTgtFormat}
              isDisabled={props.canReadOnly && !props.canReadWrite}
              aria-label="targetFormat-select"
              onBlur={sendPayload}
              options={targetFormatSelectOptions}
              styles={reactSelectThemeConfig}
            />
            <div className={"p-2 d-flex"}>
              <HCTooltip text={NewLoadTooltips.targetFormat} id="target-format-tooltip" placement="left">
                <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
              </HCTooltip>
            </div>
          </Col>
        </Row>
        {(tgtFormat && (tgtFormat.toLowerCase() === "json" || tgtFormat.toLowerCase() === "xml")) &&
          <Row  className={"mb-3"}>
            <FormLabel column lg={3}>{"Source Name:"}</FormLabel>
            <Col className={"d-flex"}>
              <HCInput
                id="sourceName"
                placeholder="Enter Source Name"
                value={sourceName ? sourceName : " "}
                onChange={handleChange}
                disabled={props.canReadOnly && !props.canReadWrite}
                className={styles.input}
                onBlur={sendPayload}
              />
              <div className={"p-2 d-flex"}>
                <HCTooltip text={NewLoadTooltips.sourceName} id="source-name-tooltip" placement="left">
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div>
            </Col>
          </Row>
        }
        {(tgtFormat && (tgtFormat.toLowerCase() === "json" || tgtFormat.toLowerCase() === "xml")) &&
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Source Type:"}</FormLabel>
            <Col className={"d-flex"}>
              <HCInput
                id="sourceType"
                placeholder="Enter Source Type"
                value={sourceType ? sourceType: " "}
                onChange={handleChange}
                disabled={props.canReadOnly && !props.canReadWrite}
                className={styles.input}
                onBlur={sendPayload}
              />
              <div className={"p-2 d-flex"}>
                <HCTooltip text={NewLoadTooltips.sourceType} id="source-type-tooltip" placement="left">
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div>
            </Col>
          </Row>
        }
        <Row className={"mb-4"}>
          <FormLabel column lg={3}>{"Target URI Prefix:"}</FormLabel>
          <Col className={"d-flex"}>
            <HCInput
              id="outputUriPrefix"
              placeholder="Enter URI Prefix"
              value={outputUriPrefix ? outputUriPrefix: " "}
              onChange={handleOutputUriPrefix}
              disabled={props.canReadOnly && !props.canReadWrite}
              className={styles.input}
              onBlur={sendPayload}
            />
            <div className={"p-2 d-flex"}>
              <HCTooltip text={NewLoadTooltips.outputURIPrefix} id="output-uri-refix-tooltip" placement="left">
                <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
              </HCTooltip>
            </div>
          </Col>
        </Row>
        <Row>
          <Col className={"d-flex justify-content-end"}>
            <HCButton aria-label="Cancel" variant="outline-light" size="sm" onClick={() => onCancel()}>Cancel</HCButton>
            &nbsp;&nbsp;
            {!props.canReadWrite?<HCTooltip text={NewLoadTooltips.missingPermission} id="disabled-save-tooltip" placement={"bottom-end"}><span className={styles.disabledCursor}><HCButton
              className={styles.disabledSaveButton}
              aria-label="Save"
              size="sm"
              variant="primary"
              type="submit"
              disabled={true}
              onClick={handleSubmit}
            >Save</HCButton></span></HCTooltip> :
              <HCButton
                aria-label="Save"
                size="sm"
                variant="primary"
                type="submit"
                disabled={false}
                onClick={handleSubmit}
                onFocus={sendPayload}
              >Save</HCButton>}
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateEditLoad;
