import React, {useState, useEffect} from "react";
import {Form, Row, Col, FormLabel, OverlayTrigger, Tooltip} from "react-bootstrap";
import Select from "react-select";
import "./create-edit-load.scss";
import reactSelectThemeConfig from "../../../config/react-select-theme.config";
import styles from "./create-edit-load.module.scss";
import {srcOptions, tgtOptions, fieldSeparatorOptions} from "../../../config/formats.config";
import StepsConfig from "../../../config/steps.config";
import {NewLoadTooltips, keyboardNavigationTooltips} from "../../../config/tooltips.config";
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
  let i=0;
  let j=0;

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

  //For keyboard navigationS
  const nameInputTooltipRef =  React.createRef<HTMLDivElement>();
  const [nameTooltipVisible, setNameTooltipVisible] = useState(false);

  const descInputRef = React.createRef<HTMLInputElement>();
  const descInputTooltipRef = React.createRef<HTMLDivElement>();
  const [descTooltipVisible, setDescToolTipVisible] = useState(false);

  const srcFormatSelectRef = React.createRef<HTMLSpanElement>();
  const srcFormatSelectTooltipRef = React.createRef<HTMLDivElement>();
  const [srcFormatTooltipVisible, setSrcFormatTooltipVisible] = useState(false);

  const fieldSelectRef = React.createRef<HTMLSpanElement>();
  const fieldSelectTooltipRef = React.createRef<HTMLDivElement>();
  const [fieldTooltipVisible, setFieldTooltipVisible] = useState(false);

  const fieldSepInputRef = React.createRef<HTMLInputElement>();
  const fieldSepInputTooltipRef = React.createRef<HTMLDivElement>();
  const fieldSepInputTooltipRef2 = React.createRef<HTMLDivElement>();
  const [fieldSepTooltipVisible, setFieldSepTooltipVisible] = useState(false);
  const [fieldSepTooltipVisible2, setFieldSepTooltipVisible2] = useState(false);

  const tgtFormatSelectRef = React.createRef<HTMLSpanElement>();
  const tgtFormatSelectTooltipRef = React.createRef<HTMLDivElement>();
  const [tgtFormatTooltipVisible, setTgtFormatTooltipVisible] = useState(false);

  const srcNameInputRef = React.createRef<HTMLInputElement>();
  const srcNameInputTooltipRef = React.createRef<HTMLDivElement>();
  const [srcNameTooltipVisible, setSrcNameToolTipVisible] = useState(false);

  const srcTypeInputRef = React.createRef<HTMLInputElement>();
  const srcTypeInputTooltipRef = React.createRef<HTMLDivElement>();
  const [srcTypeTooltipVisible, setSrcTypeToolTipVisible] = useState(false);

  const tgtPrefixInputRef = React.createRef<HTMLInputElement>();
  const tgtPrefixInputTooltipRef = React.createRef<HTMLDivElement>();
  const [tgtPrefixTooltipVisible, setTgtPrefixToolTipVisible] = useState(false);

  const cancelButtonRef = React.createRef<HTMLSpanElement>();
  const saveButtonRef = React.createRef<HTMLSpanElement>();

  const [selectTooltipVisible, setSelectTooltipVisible] = useState(false);
  const [tgtSelectTooltipVisible, setTgtSelectTooltipVisible] = useState(false);
  const [sourceFormat, setSourceFormat] = useState("");

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
    if (event) console.log("event is ", event);
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
    console.log("selectedItem ", selectedItem);
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
    console.log("selectedItem ", selectedItem);
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

  const closeAllTooltips = () => {
    setDescToolTipVisible(false);
    setSrcFormatTooltipVisible(false);
    setTgtFormatTooltipVisible(false);
    setSrcNameToolTipVisible(false);
    setSrcTypeToolTipVisible(false);
    setTgtPrefixToolTipVisible(false);
    setNameTooltipVisible(false);
  };

  const serviceNameKeyDownHandler = (event, component) => {
    console.log("OH wow event is ", event.keyCode);
    console.log("OH wow component is ", component);
    console.log("OH wow component is ", srcFormat);

    //Tooltip visible when user presses space or enter key
    if ((event.keyCode === 13) || (event.keyCode === 32)) {
      if (component === "descTooltip") setDescToolTipVisible(true);
      if (component === "srcFormatTooltip") setSrcFormatTooltipVisible(true);
      if (component === "tgtFormatTooltip") setTgtFormatTooltipVisible(true);
      if (component === "srcNameTooltip") setSrcNameToolTipVisible(true);
      if (component === "srcTypeTooltip") setSrcTypeToolTipVisible(true);
      if (component === "tgtPrefixTooltip") setTgtPrefixToolTipVisible(true);
      if (component === "nameTooltip") setNameTooltipVisible(true);
      if (component === "fieldSepTooltip") setFieldSepTooltipVisible2(true);
      if (component === "sourceFormatSelect" && event.keyCode === 13) setSelectTooltipVisible(false);
      if (component === "sourceFormatSelect" && event.keyCode === 13) setSelectTooltipVisible(false);
      if (component === "targetFormatSelect" && event.keyCode === 13) setTgtSelectTooltipVisible(false);
    }

    //Tooltip not visible if user presses escape key
    if ((event.keyCode === 27)) {
      if (component === "descTooltip") setDescToolTipVisible(false);
      if (component === "srcFormatTooltip") setSrcFormatTooltipVisible(false);
      if (component === "tgtFormatTooltip") setTgtFormatTooltipVisible(false);
      if (component === "srcNameTooltip") setSrcNameToolTipVisible(false);
      if (component === "srcTypeTooltip") setSrcTypeToolTipVisible(false);
      if (component === "tgtPrefixTooltip") setTgtPrefixToolTipVisible(false);
      if (component === "nameTooltip") setNameTooltipVisible(false);
      if (component === "fieldSepTooltip") setFieldSepTooltipVisible2(false);

    }

    // on Arrow down on source format select
    if (event.keyCode === 40 && component === "sourceFormatSelect") {
      console.log("Arrow down on source format select", event);
      // To do to highlight respective row on arrow down and up serviceNameKeyDownHandler(e, "sourceFormatSelectInner")
      // event.currentTarget.current!.focus()
    }

    //Moving focus to respective tooltip when user presses Right Arrow
    if (event.keyCode === 39) {
      console.log("ArrowRight ", event.key);
      if (component === "descInput") descInputTooltipRef.current!.focus();
      if (component === "sourceFormatSelect") {
        setSelectTooltipVisible(false);
        srcFormatSelectTooltipRef.current!.focus();
      }
      if (component === "targetFormatSelect") {
        setTgtSelectTooltipVisible(false);
        tgtFormatSelectTooltipRef.current!.focus();
      }
      if (component === "srcNameInput") srcNameInputTooltipRef.current!.focus();
      if (component === "srcTypeInput") srcTypeInputTooltipRef.current!.focus();
      if (component === "tgtPrefixInput") tgtPrefixInputTooltipRef.current!.focus();
      if (component === "fieldSepInput") fieldSepInputTooltipRef.current!.focus();
      if (component === "fieldSelect") {
        setFieldTooltipVisible(false);
        if(srcFormat !== "csv")
        fieldSepInputTooltipRef2.current!.focus();
        else{
            fieldSepInputRef.current!.focus();
            fieldSepInputRef.current!.click();
        }
      }
    }

    //description tooltip visible true if user presses space bar or enter key cancelButton
    if (event.keyCode === 13) {
      if (component === "cancelButton") onCancel();
      if (component === "saveButton") handleSubmit(event);
      event.preventDefault();
    }

    //If user presses tab and tab + shift keys
    if(event.keyCode === 9) {
        if (!event.shiftKey && component === "descTooltip") {
            setSelectTooltipVisible(true);
        }
        if (component === "sourceFormatSelect") {
            if (event.shiftKey) setSelectTooltipVisible(!selectTooltipVisible);
            else setSelectTooltipVisible(false);
        }
        if (component === "sourceFormatSelectInner") {
            if (event.shiftKey) setSelectTooltipVisible(true);
            else setSelectTooltipVisible(!selectTooltipVisible);
        }
        if (!event.shiftKey && component === "srcFormatTooltip") {
            setFieldTooltipVisible(true);
        }
        if (component === "fieldSelect") {
            if (event.shiftKey) setFieldTooltipVisible(!fieldTooltipVisible);
            else setFieldTooltipVisible(false);
        }
        if (component === "fieldSelectInner") {
            if (event.shiftKey) setFieldTooltipVisible(true);
            else setFieldTooltipVisible(!fieldTooltipVisible);
        }
        if (component === "targetFormatSelect") {
            if (event.shiftKey) setTgtSelectTooltipVisible(!tgtSelectTooltipVisible);
            else setTgtSelectTooltipVisible(false);
        }
        if (component === "targetFormatSelectInner") {
            if (event.shiftKey) setTgtSelectTooltipVisible(true);
            else setTgtSelectTooltipVisible(!tgtSelectTooltipVisible);
        }

        if(!event.shiftKey && component === "fieldSepTooltip")
        {
            setTgtSelectTooltipVisible(true);
        }
        //Close respective tooltip when user presses tab key sourceFormatSelect fieldSelect
        closeAllTooltips();
    }

    //Moving focus away from tooltip when user presses left arrow
    if (event.key === "ArrowLeft") {
      if (component === "descTooltip") {
        setDescToolTipVisible(false);
        descInputRef.current!.focus();
        descInputRef.current!.select();
      }
      if (component === "srcFormatTooltip") {
        setSrcFormatTooltipVisible(false);
        srcFormatSelectRef.current!.focus();
        setSelectTooltipVisible(true);
      }
      if (component === "fieldSepTooltip") {
        setFieldSepTooltipVisible(false);
          if(srcFormat !== "csv"){
              fieldSelectRef.current!.focus();
              setFieldTooltipVisible(true);
          }
          else {
              fieldSepInputRef.current!.focus();
          }
      }
      if(component === "fieldSepInput") {
        fieldSelectRef.current!.focus();
        setFieldTooltipVisible(true);
      }
      if (component === "tgtFormatTooltip") {
        setTgtFormatTooltipVisible(false);
        tgtFormatSelectRef.current!.focus();
        setTgtSelectTooltipVisible(true);
      }
      if (component === "srcNameTooltip") {
        setSrcNameToolTipVisible(false);
        srcNameInputRef.current!.focus();
        srcNameInputRef.current!.select();
      }
      if (component === "srcTypeTooltip") {
        setSrcTypeToolTipVisible(false);
        srcTypeInputRef.current!.focus();
        srcTypeInputRef.current!.select();
      }
      if (component === "tgtPrefixTooltip") {
        setTgtFormatTooltipVisible(false);
        tgtPrefixInputRef.current!.focus();
        tgtPrefixInputRef.current!.select();
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
                <span tabIndex={0} ref={nameInputTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "nameTooltip")} className={styles.tooltipRef}>
                  <div className={"p-2 d-flex"}>
                    <HCTooltip text={NewLoadTooltips.name} id="name-tooltip" placement="left" show={nameTooltipVisible ? nameTooltipVisible : undefined}>
                      <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                    </HCTooltip>
                  </div>
                </span>
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
            <Form.Control
              id="description"
              ref={descInputRef}
              tabIndex={0}
              placeholder="Enter description"
              value={description ? description: " "}
              onChange={handleChange}
              disabled={props.canReadOnly && !props.canReadWrite}
              onKeyDown={(e) => serviceNameKeyDownHandler(e, "descInput")}
              className={styles.input}
              onBlur={sendPayload}
            />
            <span tabIndex={0} ref={descInputTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "descTooltip")} className={styles.tooltipRef}>
              <div className={"p-2 d-flex"}>
                <HCTooltip text={NewLoadTooltips.description} id="description-tooltip" placement="left" show={descTooltipVisible ? descTooltipVisible : undefined}>
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div>
            </span>
          </Col>
        </Row>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Source Format:"}&nbsp;<span className={styles.asterisk}>*</span></FormLabel>
          <Col className={"d-flex"}>
            <OverlayTrigger overlay={<Tooltip id="button-tooltip12">{keyboardNavigationTooltips.dropdownUserInfo}</Tooltip>} placement="left" show={selectTooltipVisible}>
              <span className={styles.toot} tabIndex={0} ref={srcFormatSelectRef} style={{width: "100%"}} onKeyDown={(e) => serviceNameKeyDownHandler(e, "sourceFormatSelect")}>
                <Select
                  id="sourceFormat-select-wrapper"
                  inputId="sourceFormat"
                  tabIndex={0}
                  placeholder="Enter source format"
                  value={sourceFormatSelectOptions.find(oItem => oItem.value === srcFormat)}
                  onChange={handleSrcFormat}
                  isDisabled={props.canReadOnly && !props.canReadWrite}
                  aria-label="sourceFormat-select"
                  onBlur={sendPayload}
                  options={sourceFormatSelectOptions}
                  styles={reactSelectThemeConfig}
                  className={styles.toot}
                  onKeyDown={(e) => serviceNameKeyDownHandler(e, "sourceFormatSelectInner")}
                />
              </span>
            </OverlayTrigger>
            <span tabIndex={0} ref={srcFormatSelectTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "srcFormatTooltip")} className={styles.tooltipRef}>
              <div className={"p-2 d-flex"}>
                <HCTooltip text={NewLoadTooltips.sourceFormat} id="source-format-tooltip" placement="left"  show={srcFormatTooltipVisible === true ? true : undefined}>
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div>
            </span>
          </Col>
        </Row>
        {srcFormat === "csv" ?
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Field Separator:"}&nbsp;<span className={styles.asterisk}>*</span></FormLabel>
            <Col className={"d-flex"}>
            <OverlayTrigger overlay={<Tooltip id="button-tooltip31">{keyboardNavigationTooltips.dropdownUserInfo}</Tooltip>} placement="left" show={fieldTooltipVisible}>
              <span className={styles.toot} ref={fieldSelectRef} style={{width: "100%"}} tabIndex={0} onKeyDown={(e) => serviceNameKeyDownHandler(e, "fieldSelect")}>
                <Select
                id="fieldSeparator-select-wrapper"
                inputId="fieldSeparator"
                tabIndex={0}
                placeholder="Choose Field Separator"
                value={fieldSeparatorSelectOptions.find(oItem => oItem.value === fieldSeparator)}
                onChange={handleFieldSeparator}
                isDisabled={props.canReadOnly && !props.canReadWrite}
                aria-label="fieldSeparator-select"
                onBlur={sendPayload}
                options={fieldSeparatorSelectOptions}
                styles={reactSelectThemeConfig}
                onKeyDown={(e) => serviceNameKeyDownHandler(e, "fieldSelectInner")}
              />
              </span>
            </OverlayTrigger>
              {fieldSeparator === "Other" ?
                <>
                  <div className={"d-flex ms-2"}>
                    <Form.Control
                      id="otherSeparator"
                      ref={fieldSepInputRef}
                      tabIndex={0}
                      onKeyDown={(e) => serviceNameKeyDownHandler(e, "fieldSepInput")}
                      value={otherSeparator ? otherSeparator: " "}
                      onChange={handleOtherSeparator}
                      style={{width: 75}}
                      disabled={props.canReadOnly && !props.canReadWrite}
                      onBlur={sendPayload}
                    />
                  </div>
                  <span tabIndex={0} ref={fieldSepInputTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "fieldSepTooltip")} className={styles.tooltipRef}>
                  <div className={"p-2 d-flex"}>
                    <HCTooltip text={NewLoadTooltips.fieldSeparator} id="field-separator-tooltip" placement="top" show={fieldSepTooltipVisible ? fieldSepTooltipVisible : undefined}>
                      <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                    </HCTooltip>
                  </div>
                  </span>
                </>
                :
                  <span tabIndex={0} ref={fieldSepInputTooltipRef2} onKeyDown={(e) => serviceNameKeyDownHandler(e, "fieldSepTooltip")} className={styles.tooltipRef}>
                <div className={"p-2 d-flex"}>
                  <HCTooltip text={NewLoadTooltips.fieldSeparator} id="field-separator-tooltip" placement="right" show={fieldSepTooltipVisible2 ? fieldSepTooltipVisible2 : undefined}>
                    <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                  </HCTooltip>
                </div>
                  </span>
              }
            </Col>
          </Row> : ""
        }
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Target Format:"}&nbsp;<span className={styles.asterisk}>*</span></FormLabel>
          <Col className={"d-flex"}>
            <OverlayTrigger overlay={<Tooltip id="button-tooltip">{keyboardNavigationTooltips.dropdownUserInfo}</Tooltip>} placement="left" show={tgtSelectTooltipVisible}>
              <span className={styles.toot} ref={tgtFormatSelectRef} style={{width: "100%"}} tabIndex={0} onKeyDown={(e) => serviceNameKeyDownHandler(e, "targetFormatSelect")}>
                <Select
                  id="targetFormat-select-wrapper"
                  inputId="targetFormat"
                  placeholder="Enter target format"
                  value={targetFormatSelectOptions.find(oItem => oItem.value === tgtFormat)}
                  onChange={handleTgtFormat}
                  isDisabled={props.canReadOnly && !props.canReadWrite}
                  aria-label="targetFormat-select"
                  onBlur={sendPayload}
                  tabIndex={0}
                  className={styles.toot}
                  options={targetFormatSelectOptions}
                  styles={reactSelectThemeConfig}
                  onKeyDown={(e) => serviceNameKeyDownHandler(e, "targetFormatSelectInner")}
                /></span>
            </OverlayTrigger>
            <span tabIndex={0} ref={tgtFormatSelectTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "tgtFormatTooltip")} className={styles.tooltipRef}>
              <div className={"p-2 d-flex"}>
                <HCTooltip text={NewLoadTooltips.targetFormat} id="target-format-tooltip" placement="left" show={tgtFormatTooltipVisible === true ? true : undefined}>
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div></span>
          </Col>
        </Row>
        {(tgtFormat && (tgtFormat.toLowerCase() === "json" || tgtFormat.toLowerCase() === "xml")) &&
          <Row  className={"mb-3"}>
            <FormLabel column lg={3}>{"Source Name:"}</FormLabel>
            <Col className={"d-flex"}>
              <Form.Control
                id="sourceName"
                ref={srcNameInputRef}
                tabIndex={0}
                placeholder="Enter Source Name"
                value={sourceName ? sourceName : " "}
                onChange={handleChange}
                disabled={props.canReadOnly && !props.canReadWrite}
                className={styles.input}
                onKeyDown={(e) => serviceNameKeyDownHandler(e, "srcNameInput")}
                onBlur={sendPayload}
              />
              <span tabIndex={0} ref={srcNameInputTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "srcNameTooltip")} className={styles.tooltipRef}>
                <div className={"p-2 d-flex"}>
                  <HCTooltip text={NewLoadTooltips.sourceName} id="source-name-tooltip" placement="left" show={srcNameTooltipVisible === true ? true : undefined}>
                    <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                  </HCTooltip>
                </div>
              </span>
            </Col>
          </Row>
        }
        {(tgtFormat && (tgtFormat.toLowerCase() === "json" || tgtFormat.toLowerCase() === "xml")) &&
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Source Type:"}</FormLabel>
            <Col className={"d-flex"}>
              <Form.Control
                id="sourceType"
                ref={srcTypeInputRef}
                tabIndex={0}
                placeholder="Enter Source Type"
                value={sourceType ? sourceType: " "}
                onKeyDown={(e) => serviceNameKeyDownHandler(e, "srcTypeInput")}
                onChange={handleChange}
                disabled={props.canReadOnly && !props.canReadWrite}
                className={styles.input}
                onBlur={sendPayload}
              />
              <span tabIndex={0} ref={srcTypeInputTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "srcTypeTooltip")} className={styles.tooltipRef}>
                <div className={"p-2 d-flex"}>
                  <HCTooltip text={NewLoadTooltips.sourceType} id="source-type-tooltip" placement="left" show={srcTypeTooltipVisible === true ? true : undefined}>
                    <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                  </HCTooltip>
                </div>
              </span>
            </Col>
          </Row>
        }
        <Row className={"mb-4"}>
          <FormLabel column lg={3}>{"Target URI Prefix:"}</FormLabel>
          <Col className={"d-flex"}>
            <Form.Control
              id="outputUriPrefix"
              ref={tgtPrefixInputRef}
              tabIndex={0}
              placeholder="Enter URI Prefix"
              value={outputUriPrefix ? outputUriPrefix: " "}
              onKeyDown={(e) => serviceNameKeyDownHandler(e, "tgtPrefixInput")}
              onChange={handleOutputUriPrefix}
              disabled={props.canReadOnly && !props.canReadWrite}
              className={styles.input}
              onBlur={sendPayload}
            />
            <span tabIndex={0} ref={tgtPrefixInputTooltipRef} onKeyDown={(e) => serviceNameKeyDownHandler(e, "tgtPrefixTooltip")} className={styles.tooltipRef}>
              <div className={"p-2 d-flex"}>
                <HCTooltip text={NewLoadTooltips.outputURIPrefix} id="output-uri-refix-tooltip" placement="left"  show={tgtPrefixTooltipVisible === true ? true : undefined}>
                  <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} />
                </HCTooltip>
              </div>
            </span>
          </Col>
        </Row>
        <Row>
          <Col className={"d-flex justify-content-end"}>
            <span tabIndex={0} ref={cancelButtonRef} className={styles.toot} onKeyDown={(event) => serviceNameKeyDownHandler(event, "cancelButton")}>
              <HCButton tabIndex={-1} aria-label="Cancel" variant="outline-light" size="sm" onClick={() => onCancel()}>Cancel</HCButton>
            </span>
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
              <span tabIndex={0} ref={saveButtonRef} className={styles.toot} onKeyDown={(e) => serviceNameKeyDownHandler(e, "saveButton")}>
                <HCButton
                  aria-label="Save"
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={false}
                  onClick={handleSubmit}
                  onFocus={sendPayload}
                >Save</HCButton>
              </span>
            }
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateEditLoad;
