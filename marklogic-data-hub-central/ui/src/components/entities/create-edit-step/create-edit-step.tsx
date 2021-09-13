import React, {useState, useEffect, useContext} from "react";
import {Form, Input, Icon, Radio, AutoComplete, Tooltip, Popover} from "antd";
import axios from "axios";
import styles from "./create-edit-step.module.scss";
import "./create-edit-step.scss";
import {UserContext} from "../../../util/user-context";
import {NewMapTooltips, NewMatchTooltips, NewMergeTooltips, CommonStepTooltips} from "../../../config/tooltips.config";
import {StepType} from "../../../types/curation-types";
import {CurationContext} from "../../../util/curation-context";
import HCAlert from "../../common/hc-alert/hc-alert";
import HCTooltip from "../../common/hc-tooltip/hc-tooltip";
import {QuestionCircleFill} from "react-bootstrap-icons";
import HCButton from "../../common/hc-button/hc-button";

type Props = {
  tabKey: string;
  openStepSettings: boolean;
  setOpenStepSettings: any;
  isEditing: boolean;
  stepType: StepType;
  editStepArtifactObject: any;
  targetEntityType: string;
  canReadWrite: boolean;
  canReadOnly: boolean;
  createStepArtifact: (stepArtifact: any) => void;
  updateStepArtifact: (stepArtifact: any) => void;
  currentTab: string;
  setIsValid: any;
  resetTabs: any;
  setHasChanged: any;
  setPayload: any;
  onCancel: any;
}

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

const srcTypeOptions = [
  {label: "Collection", value: "collection"},
  {label: "Query", value: "query"}
];

const {TextArea} = Input;

const CreateEditStep: React.FC<Props> = (props) => {
  // TODO use steps.config.ts for default values
  const {handleError} = useContext(UserContext);
  const {curationOptions, setActiveStepWarning, validateCalled, setValidateMatchCalled, setValidateMergeCalled, validateMerge} = useContext(CurationContext);
  const [stepName, setStepName] = useState("");
  const [description, setDescription] = useState("");

  const [collections, setCollections] = useState("");
  const [collectionOptions, setCollectionOptions] = useState(["a", "b"]);
  const [selectedSource, setSelectedSource] = useState(props.editStepArtifactObject.selectedSource ? props.editStepArtifactObject.selectedSource : "collection");
  const [srcQuery, setSrcQuery] = useState("");
  const [timestamp, setTimestamp] = useState("");

  //To check submit validity
  const [isStepNameTouched, setStepNameTouched] = useState(false);
  const [isDescriptionTouched, setDescriptionTouched] = useState(false);
  const [isCollectionsTouched, setCollectionsTouched] = useState(false);
  const [isSrcQueryTouched, setSrcQueryTouched] = useState(false);
  const [isSelectedSourceTouched, setSelectedSourceTouched] = useState(false);
  const [isTimestampTouched, setTimestampTouched] = useState(false);

  const [invalidChars, setInvalidChars] = useState(false);
  const [isValid, setIsValid] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars

  const [isSubmit, setIsSubmit] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);

  const initStep = () => {
    setStepName(props.editStepArtifactObject.name);
    setDescription(props.editStepArtifactObject.description);
    setSrcQuery(props.editStepArtifactObject.sourceQuery);
    setSelectedSource(props.editStepArtifactObject.selectedSource);
    if (props.editStepArtifactObject.selectedSource === "collection") {
      let srcCollection = props.editStepArtifactObject.sourceQuery.substring(
        props.editStepArtifactObject.sourceQuery.lastIndexOf("[") + 2,
        props.editStepArtifactObject.sourceQuery.lastIndexOf("]") - 1
      );
      setCollections(srcCollection);
    }
    if (props.stepType === StepType.Merging) {
      setTimestamp(props.editStepArtifactObject.timestamp);
    }
    resetTouchedValues();
    setIsValid(true);
    setTobeDisabled(true);
    setActiveStepWarning([]);
    setValidateMatchCalled(false);
    setValidateMergeCalled(false);
    props.setIsValid(true);
  };

  useEffect(() => {
    // Edit Step Artifact
    if (props.isEditing) {
      initStep();
    } else { // New Step Artifact
      reset();
      props.setIsValid(false);
    }
  }, [props.openStepSettings]);

  useEffect(() => {
    if (isSubmit && curationOptions.activeStep.hasWarnings.length === 0 && props.stepType === StepType.Matching && validateCalled) {
      props.setOpenStepSettings(false);
      props.resetTabs();
    }
    if (isSubmit && curationOptions.activeStep.hasWarnings.length === 0 && (props.stepType === StepType.Merging) && validateMerge) {
      props.setOpenStepSettings(false);
      props.resetTabs();
    }
  }, [curationOptions.activeStep.hasWarnings.length, validateCalled, validateMerge]);

  const reset = () => {
    setStepName("");
    setDescription("");
    setSelectedSource("collection");
    setTobeDisabled(false);
    setCollections("");
    setSrcQuery("");
    if (props.stepType === StepType.Merging) {
      setTimestamp("");
    }
    resetTouchedValues();
    setValidateMatchCalled(false);
    setValidateMergeCalled(false);
    setActiveStepWarning([]);
    setIsSubmit(false);
  };

  const resetTouchedValues = () => {
    setSelectedSourceTouched(false);
    setCollectionsTouched(false);
    setSrcQueryTouched(false);
    setStepNameTouched(false);
    setDescriptionTouched(false);
    if (props.stepType === StepType.Merging) {
      setTimestampTouched(false);
    }
  };

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
      && !isSelectedSourceTouched
      && !isCollectionsTouched
      && !isSrcQueryTouched
      && !isTimestampTouched
    ) {
      return false;
    } else {
      return true;
    }
  };

  const getPayload = () => {
    let result, sQuery;
    if (selectedSource === "collection") {
      sQuery = collections ? `cts.collectionQuery(['${collections}'])` : props.editStepArtifactObject.sourceQuery;
      result = {
        name: stepName,
        targetEntityType: props.targetEntityType,
        description: description,
        collection: collections,
        selectedSource: selectedSource,
        sourceQuery: sQuery
      };
    } else {
      sQuery = srcQuery ? srcQuery : props.editStepArtifactObject.sourceQuery;
      result = {
        name: stepName,
        targetEntityType: props.targetEntityType,
        description: description,
        selectedSource: selectedSource,
        sourceQuery: sQuery
      };
    }
    if (props.stepType === StepType.Merging) {
      result["timestamp"] = timestamp;
    }
    return result;
  };

  const collectionQueryInfo = <div className={styles.collectionQueryInfo}>{CommonStepTooltips.radioCollection}</div>;

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (!stepName) {
      // missing name
      setStepNameTouched(true);
    }
    if (!collections && selectedSource === "collection") {
      // missing collection (if collection is selected)
      setCollectionsTouched(true);
    }
    if (!srcQuery && selectedSource !== "collection") {
      // missing query (if query is selected)
      setSrcQueryTouched(true);
    }
    if (!stepName || invalidChars || (!collections && selectedSource === "collection") || (!srcQuery && selectedSource !== "collection")) {
      // if missing flags are set, do not submit handle
      event.preventDefault();
      return;
    }
    // else: all required fields are set

    if (event) event.preventDefault();

    setIsValid(true);
    if (!props.isEditing) {
      props.createStepArtifact(getPayload());
    } else {
      props.updateStepArtifact(getPayload());
    }
    ((props.stepType === StepType.Matching) || (props.stepType === StepType.Merging)) ? setIsSubmit(true) : setIsSubmit(false);
    if (props.stepType !== StepType.Matching && props.stepType !== StepType.Merging) {
      props.setOpenStepSettings(false);
      props.resetTabs();
    }
  };

  const handleSearch = async (value: any) => {
    let database: string = "";
    if (!props.isEditing && props.stepType === StepType.Matching || props.stepType === StepType.Merging) {
      database = "final";
    } else if (!props.isEditing && props.stepType === StepType.Mapping) {
      database = "staging";
    } else if (props.isEditing) {
      database = props.editStepArtifactObject["sourceDatabase"] === "data-hub-FINAL" ? "final" : "staging";
    }

    if (value && value.length > 2) {
      try {
        let data = {
          "referenceType": "collection",
          "entityTypeId": " ",
          "propertyPath": " ",
          "limit": 10,
          "dataType": "string",
          "pattern": value,
        };
        const response = await axios.post(`/api/entitySearch/facet-values?database=${database}`, data);
        if (response.status === 200) {
          setCollectionOptions(response.data);
        }
      } catch (error) {
        console.error(error);
        handleError(error);
      }

    } else {
      setCollectionOptions([]);
    }
  };

  const handleFocus = () => {
    setCollectionOptions([]);
  };

  const handleTypeaheadChange = (data: any) => {
    if (data === " ") {
      setCollectionsTouched(false);
    } else {
      setCollectionsTouched(true);
      setCollections(data);
      if (props.isEditing && props.editStepArtifactObject.collection) {
        if (props.editStepArtifactObject.collection === data) {
          setCollectionsTouched(false);
        }
      }
      if (data.length > 0) {
        if (stepName) {
          setIsValid(true);
          props.setIsValid(true);
        }
      } else {
        setIsValid(false);
        props.setIsValid(false);
      }
    }
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

        if (event.target.value.length > 0 && !isSpecialChars) {
          if (collections || srcQuery) {
            setIsValid(true);
            props.setIsValid(true);
          }
        } else {
          setIsValid(false);
          props.setIsValid(false);
        }
      }
    }

    if (event.target.id === "description") {
      if (event.target.value === " ") {
        setDescriptionTouched(false);
      } else {
        setDescriptionTouched(true);
        setDescription(event.target.value);
        if (props.isEditing && props.editStepArtifactObject.description) {
          if (event.target.value === props.editStepArtifactObject.description) {
            setDescriptionTouched(false);
          }
        }
      }
    }

    if (event.target.id === "srcQuery") {
      if (event.target.value === " ") {
        setSrcQueryTouched(false);
      } else {
        setSrcQueryTouched(true);
        setSrcQuery(event.target.value);
        if (event.target.value.length > 0) {
          if (stepName) {
            setIsValid(true);
            props.setIsValid(true);
          }
        } else {
          setIsValid(false);
          props.setIsValid(false);
        }
      }
    }
    if (event.target.id === "collList") {
      if (event.target.value === " ") {
        setCollectionsTouched(false);
      } else {
        setCollectionsTouched(true);
        setCollections(event.target.value);
        if (props.isEditing && props.editStepArtifactObject.collection) {
          if (props.editStepArtifactObject.collection === event.target.value) {
            setCollectionsTouched(false);
          }
        }
        if (event.target.value.length > 0) {
          if (stepName) {
            setIsValid(true);
            props.setIsValid(true);
          }
        } else {
          setIsValid(false);
          props.setIsValid(false);
        }
      }
    }

    if (event.target.id === "timestamp") {
      if (event.target.value === " ") {
        setTimestampTouched(false);
      } else {
        setTimestampTouched(true);
        setTimestamp(event.target.value);
        if (props.isEditing && props.editStepArtifactObject.timestamp) {
          if (event.target.value === props.editStepArtifactObject.timestamp) {
            setTimestampTouched(false);
          }
        }
      }
    }
  };

  const handleSelectedSource = (event) => {
    if (event.target.value === " ") {
      setSelectedSourceTouched(false);
    } else {
      setSelectedSourceTouched(true);
      setSelectedSource(event.target.value);
      if (props.isEditing && event.target.value === props.editStepArtifactObject.selectedSource) {
        setSelectedSourceTouched(false);
      }
      if (event.target.value === "collection") {
        if (stepName && collections) {
          setIsValid(true);
          props.setIsValid(true);
        } else {
          setIsValid(false);
          props.setIsValid(false);
        }
      } else {
        if (stepName && srcQuery) {
          setIsValid(true);
          props.setIsValid(true);
        } else {
          setIsValid(false);
          props.setIsValid(false);
        }
      }
    }
  };

  return (
    <div className={styles.createEditStep}>
      {(props.stepType === StepType.Matching || props.stepType === StepType.Merging) ? curationOptions.activeStep.hasWarnings.length > 0 ? (
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
      <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
        <Form.Item label={<span>
          Name:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
        </span>} labelAlign="left"
        validateStatus={(stepName || !isStepNameTouched) ? (invalidChars ? "error" : "") : "error"}
        help={invalidChars ? "Names must start with a letter and can contain letters, numbers, hyphens, and underscores only." : (stepName || !isStepNameTouched) ? "" : "Name is required"}
        >
          {tobeDisabled ? <Tooltip title={NewMatchTooltips.nameField} placement={"bottom"}> <Input
            id="name"
            placeholder="Enter name"
            value={stepName}
            onChange={handleChange}
            disabled={tobeDisabled}
            className={styles.input}
            onBlur={sendPayload}
          /></Tooltip> : <Input
            id="name"
            placeholder="Enter name"
            value={stepName}
            onChange={handleChange}
            disabled={tobeDisabled}
            className={styles.input}
            onBlur={sendPayload}
          />}&nbsp;&nbsp;
          <div className={styles.inputHCTooltip}>
            { props.stepType === StepType.Mapping ?
              <HCTooltip text={NewMapTooltips.name} id="map-step-name-tooltip" placement={"left"}>
                <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircle}/>
              </HCTooltip>:
              props.stepType === StepType.Matching ?
                <HCTooltip text={NewMatchTooltips.name} id="match-step-name-tooltip" placement={"left"}>
                  <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircle}/>
                </HCTooltip>:
                <HCTooltip text={NewMergeTooltips.name} id="merge-step-name-tooltip" placement={"left"}>
                  <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircle}/>
                </HCTooltip>
            }
          </div>
        </Form.Item>
        <Form.Item label={<span>
          Description:
          &nbsp;
        </span>} labelAlign="left">
          <Input
            id="description"
            placeholder="Enter description"
            value={description}
            onChange={handleChange}
            disabled={props.canReadOnly && !props.canReadWrite}
            className={styles.input}
            onBlur={sendPayload}
          />&nbsp;&nbsp;
          <div className={styles.inputHCTooltip}>
            { props.stepType === StepType.Mapping ?
              <HCTooltip text={NewMapTooltips.description} id="map-step-description-tooltip" placement={"left"}>
                <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircle}/>
              </HCTooltip>:
              props.stepType === StepType.Matching ?
                <HCTooltip text={NewMatchTooltips.description} id="match-step-description-tooltip" placement={"left"}>
                  <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircle}/>
                </HCTooltip>:
                <HCTooltip text={NewMergeTooltips.description} id="merge-step-description-tooltip" placement={"left"}>
                  <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircle}/>
                </HCTooltip>
            }
          </div>
        </Form.Item>

        <Form.Item label={<span>
          Source Query:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
        </span>} labelAlign="left"
        validateStatus={((collections && selectedSource === "collection") || (srcQuery && selectedSource !== "collection") || (!isSelectedSourceTouched && !isCollectionsTouched && !isSrcQueryTouched)) ? "" : "error"}
        help={((collections && selectedSource === "collection") || (srcQuery && selectedSource !== "collection") || (!isSelectedSourceTouched && !isCollectionsTouched && !isSrcQueryTouched)) ? "" : "Collection or Query is required"}
        >

          <Radio.Group
            id="srcType"
            options={srcTypeOptions}
            onChange={handleSelectedSource}
            value={selectedSource}
            disabled={!props.canReadWrite}
          >
          </Radio.Group>

          <span id={props.stepType !== StepType.Merging ? "radioCollectionPopover" : "radioCollectionMergePopover" }>
            <Popover
              content={collectionQueryInfo}
              trigger="hover"
              placement="left"
            >
              <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircleCollection} data-testid="collectionTooltip"/>
            </Popover></span>

          <HCTooltip text={CommonStepTooltips.radioQuery} id="radio-query-tooltip" placement={"top"}>
            <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircleQuery} data-testid="queryTooltip"/>
          </HCTooltip>

          {selectedSource === "collection" ? <div ><span className={styles.srcCollectionInput}><AutoComplete
            id="collList"
            //mode="tags"
            className={styles.input}
            dataSource={collectionOptions}
            aria-label="collection-input"
            placeholder={<span>Enter collection name<Icon className={styles.searchIcon} type="search" theme="outlined" /></span>}
            value={collections}
            disabled={!props.canReadWrite}
            onSearch={handleSearch}
            onFocus={handleFocus}
            onChange={handleTypeaheadChange}
            onBlur={sendPayload}
          >
            {/* {collectionsList} */}
          </AutoComplete>&nbsp;&nbsp;{props.canReadWrite ? <Icon className={styles.searchIcon} type="search" theme="outlined" /> : ""}</span></div> : <span><TextArea
            id="srcQuery"
            placeholder="Enter source query"
            value={srcQuery}
            onChange={handleChange}
            disabled={!props.canReadWrite}
            className={styles.input}
            onBlur={sendPayload}
          ></TextArea></span>}
        </Form.Item>
        {props.stepType === StepType.Merging ?
          <Form.Item label={<span>
            Timestamp Path:
            &nbsp;
          </span>} labelAlign="left"
          className={styles.timestamp}>
            <Input
              id="timestamp"
              placeholder="Enter path to the timestamp"
              value={timestamp}
              onChange={handleChange}
              disabled={props.canReadOnly && !props.canReadWrite}
              className={styles.input}
              onBlur={sendPayload}
            />&nbsp;&nbsp;
            <div className={styles.inputHCTooltip}>
              <HCTooltip text={NewMergeTooltips.timestampPath} id="timestamp-path-tooltip" placement="left">
                <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} className={styles.questionCircle} />
              </HCTooltip>
            </div>
          </Form.Item> : ""}

        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <HCButton data-testid={`${props.stepType}-dialog-cancel`} variant="outline-light" size="sm" onClick={() => onCancel()}>Cancel</HCButton>
            &nbsp;&nbsp;
            {!props.canReadWrite ? <Tooltip title={NewMergeTooltips.missingPermission} placement={"bottomRight"}><span className={styles.disabledCursor}>
              <HCButton size="sm" className={styles.disabledSaveButton} variant="primary" type="submit" disabled={true} data-testid={`${props.stepType}-dialog-save`} onClick={handleSubmit}>Save</HCButton></span></Tooltip>
              : <HCButton variant="primary" size="sm" type="submit" disabled={false} data-testid={`${props.stepType}-dialog-save`} onClick={handleSubmit} onFocus={sendPayload}>Save</HCButton>}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateEditStep;
