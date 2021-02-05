import React, {useState, useEffect, useContext} from "react";
import {Form, Input, Icon, Radio, AutoComplete} from "antd";
import styles from "./create-edit-mapping.module.scss";
import "./create-edit-mapping.scss";
import {NewMapTooltips, CommonStepTooltips} from "../../../../config/tooltips.config";
import {UserContext} from "../../../../util/user-context";
import {MLButton, MLTooltip} from "@marklogic/design-system";
import axios from "axios";

interface Props {
  tabKey: string;
  openStepSettings: boolean;
  setOpenStepSettings: any;
  isEditing: boolean;
  canReadWrite: boolean;
  canReadOnly: boolean;
  createMappingArtifact: any;
  updateMappingArtifact: any;
  stepData: any;
  targetEntityType: any;
  sourceDatabase: any;
  currentTab: string;
  setIsValid: any;
  resetTabs: any;
  setHasChanged: any;
  setPayload: any;
  onCancel: any;
}

const CreateEditMapping: React.FC<Props> = (props) => {
  // TODO use steps.config.ts for default values
  const {handleError} = useContext(UserContext);
  const [mapName, setMapName] = useState("");
  const [description, setDescription] = useState(props.stepData && props.stepData !== {} ? props.stepData.description : "");
  //const [collections, setCollections] = useState<any[]>([]);
  const [collections, setCollections] = useState("");
  const [collectionOptions, setCollectionOptions] = useState(["a", "b"]);
  const [selectedSource, setSelectedSource] = useState(props.stepData && props.stepData.selectedSource ? props.stepData.selectedSource : "collection");
  const [srcQuery, setSrcQuery] = useState(props.stepData && props.stepData !== {} ? props.stepData.sourceQuery : "");

  //To check submit validity
  const [isMapNameTouched, setMapNameTouched] = useState(false);
  const [isDescriptionTouched, setDescriptionTouched] = useState(false);
  const [isCollectionsTouched, setCollectionsTouched] = useState(false);
  const [isSrcQueryTouched, setSrcQueryTouched] = useState(false);
  const [isSelectedSourceTouched, setSelectedSourceTouched] = useState(false);

  const [isValid, setIsValid] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [invalidChars, setInvalidChars] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars

  const [tobeDisabled, setTobeDisabled] = useState(false);

  const initStep = () => {
    setMapName(props.stepData.name);
    setDescription(props.stepData.description);
    setSrcQuery(props.stepData.sourceQuery);
    setSelectedSource(props.stepData.selectedSource);
    if (props.stepData.selectedSource === "collection") {
      let srcCollection = props.stepData.sourceQuery.substring(
        props.stepData.sourceQuery.lastIndexOf("[") + 2,
        props.stepData.sourceQuery.lastIndexOf("]") - 1
      );
      setCollections(srcCollection);
    }
    resetTouchedValues();
    setIsValid(true);
    setTobeDisabled(true);

    props.setIsValid(true);
  };

  useEffect(() => {
    // Edit mapping
    if (props.isEditing) {
      initStep();
    } else { // New mapping
      reset();
      props.setIsValid(false);
    }
  }, [props.openStepSettings]);

  const reset = () => {
    setMapName("");
    setDescription("");
    setSelectedSource("collection");
    setTobeDisabled(false);
    setCollections("");
    setSrcQuery("");
    resetTouchedValues();
  };

  const resetTouchedValues = () => {
    setMapNameTouched(false);
    setDescriptionTouched(false);
    setSelectedSourceTouched(false);
    setCollectionsTouched(false);
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

  const sendPayloadSrcValidity = () => {
    props.setHasChanged(hasFormChanged());
    props.setPayload(getPayload());
    propagateSrcValidity();
  };

  const hasFormChanged = () => {
    if (!isMapNameTouched
      && !isDescriptionTouched
      && !isSelectedSourceTouched
      && !isCollectionsTouched
      && !isSrcQueryTouched
    ) {
      return false;
    } else {
      return true;
    }
  };

  const getPayload = () => {
    let result, sQuery;
    if (selectedSource === "collection") {
      sQuery = collections ? `cts.collectionQuery(['${collections}'])` : props.stepData.sourceQuery;
      result = {
        name: mapName,
        targetEntityType: props.targetEntityType,
        description: description,
        selectedSource: selectedSource,
        sourceQuery: sQuery
      };
    } else {
      sQuery = srcQuery? srcQuery : props.stepData.sourceQuery;
      result = {
        name: mapName,
        targetEntityType: props.targetEntityType,
        description: description,
        selectedSource: selectedSource,
        sourceQuery: sQuery
      };
    }
    return result;
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (!mapName) {
      // missing name
      setMapNameTouched(true);
    }
    if (!collections && selectedSource === "collection") {
      // missing collections
      setCollectionsTouched(true);
    }
    if (!srcQuery && selectedSource !== "collection") {
      // missing query
      setSrcQueryTouched(true);
    }
    if (!mapName || invalidChars || (!collections && selectedSource === "collection") || (!srcQuery && selectedSource !== "collection")) {
      // if missing flags are set, do not submit handle
      event.preventDefault();
      return;
    }
    // else: all required fields are set

    if (event) event.preventDefault();

    setIsValid(true);

    props.setOpenStepSettings(false);
    props.resetTabs();
    if (!props.isEditing) {
      await props.createMappingArtifact(getPayload());
    } else {
      await props.updateMappingArtifact(getPayload());
    }
  };

  const handleSearch = async (value: any) => {
    let databaseName = "staging";
    if (props.isEditing) {
      databaseName = props.stepData["sourceDatabase"] === "data-hub-FINAL" ? "final" : "staging";
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
        const response = await axios.post(`/api/entitySearch/facet-values?database=${databaseName}`, data);
        setCollectionOptions(response.data);
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
      if (props.stepData && props.stepData.collection) {
        if (props.stepData.collection === data) {
          setCollectionsTouched(false);
        }
      }
      if (data.length > 0) {
        if (mapName) {
          setIsValid(true);
          props.setIsValid(true);
        } else {
          setIsValid(false);
          props.setIsValid(false);
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
        setMapNameTouched(false);
      } else {
        setMapNameTouched(true);
        setMapName(event.target.value);

        //check value does not contain special chars and leads with a letter
        if (event.target.value !== "" && !(/^[a-zA-Z][a-zA-Z0-9\-_]*$/g.test(event.target.value))) {
          setInvalidChars(true);
          isSpecialChars = true;
        } else {
          setInvalidChars(false);
        }
        if (event.target.value.length > 0 && !isSpecialChars) {
          if (collections|| srcQuery) {
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

    if (event.target.id === "srcQuery") {
      if (event.target.value === " ") {
        setSrcQueryTouched(false);
      } else {
        setSrcQueryTouched(true);
        setSrcQuery(event.target.value);
        if (event.target.value.length > 0) {
          if (mapName) {
            setIsValid(true);
            props.setIsValid(true);
          }
        } else {
          setIsValid(false);
          props.setIsValid(false);
        }
      }
    }
  };
  /* // Handling multiple collections in a select tags list - Deprecated
  const handleCollList = (value) => {
    if (value === ' ') {
      setCollectionsTouched(false);
    }
    else {
      setCollectionsTouched(true);
      setCollections(value);
      if (props.mapData && props.mapData.collections) {
        if (value.length === props.mapData.collections.length && value.every((item, index) => props.mapData.collections[index] === item)) {
          setCollectionsTouched(false);
        }
      }
      if (value.length > 0) {
        if (mapName) {
          setIsValid(true);
        }
      } else {
        setIsValid(false);
      }
    }
  }
  */

  const handleSelectedSource = (event) => {
    sendPayloadSrcValidity();
    if (event.target.value === " ") {
      setSelectedSourceTouched(false);
    } else {
      setSelectedSourceTouched(true);
      setSelectedSource(event.target.value);

      if (props.stepData && event.target.value === props.stepData.selectedSource) {
        setSelectedSourceTouched(false);
      }
      if (event.target.value === "collection") {
        if (mapName && collections) {
          setIsValid(true);
          props.setIsValid(true);
        } else {
          setIsValid(false);
          props.setIsValid(false);
        }
      } else {
        if (mapName && srcQuery) {
          setIsValid(true);
          props.setIsValid(true);
        } else {
          setIsValid(false);
          props.setIsValid(false);
        }
      }
    }
  };

  const propagateSrcValidity = () => {
    if (mapName && ((collections && selectedSource === "collection") || (srcQuery && selectedSource !== "collection"))) {
      // Touched
      if (props.currentTab === props.tabKey) {
        props.setIsValid(true);
      }
    } else if ((!isSelectedSourceTouched && !isCollectionsTouched && !isSrcQueryTouched)) {
      // Untouched
      if (props.currentTab === props.tabKey) {
        props.setIsValid(false);
      }
    } else {
      if (props.currentTab === props.tabKey) {
        props.setIsValid(false);
      }
    }
  };

  const isSourceQueryValid = () => {
    if ((collections && selectedSource === "collection") || (srcQuery && selectedSource !== "collection")) {
      return true;
    } else if ((!isSelectedSourceTouched && !isCollectionsTouched && !isSrcQueryTouched)) {
      return true;
    } else {
      return false;
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

  const srcTypeOptions = [
    {label: "Collection", value: "collection"},
    {label: "Query", value: "query"}
  ];
  const {TextArea} = Input;

  return (
    <div className={styles.newMappingForm}>
      <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
        <Form.Item label={<span>
          Name:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
        </span>} labelAlign="left"
        validateStatus={(mapName || !isMapNameTouched) ? (invalidChars ? "error" : "") : "error"}
        help={invalidChars ? "Names must start with a letter and can contain letters, numbers, hyphens, and underscores only." : (mapName || !isMapNameTouched) ? "" : "Name is required"}
        >
          { tobeDisabled?<MLTooltip title={NewMapTooltips.nameField} placement={"bottom"}> <Input
            id="name"
            placeholder="Enter name"
            value={mapName}
            onChange={handleChange}
            disabled={tobeDisabled}
            className={styles.input}
            onBlur={sendPayload}
          /></MLTooltip>:<Input
            id="name"
            placeholder="Enter name"
            value={mapName}
            onChange={handleChange}
            disabled={tobeDisabled}
            className={styles.input}
            onBlur={sendPayload}
          />}&nbsp;&nbsp;
          <MLTooltip title={NewMapTooltips.name} placement={"right"}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip>
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
          <MLTooltip title={NewMapTooltips.description} placement={"right"}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip>
        </Form.Item>

        <Form.Item label={<span>
          Source Query:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
        </span>} labelAlign="left"
        validateStatus={isSourceQueryValid() ? "" : "error"}
        help={isSourceQueryValid() ? "" : "Collection or Query is required"}
        >

          <Radio.Group
            id="srcType"
            options={srcTypeOptions}
            onChange={handleSelectedSource}
            value={selectedSource}
            disabled={!props.canReadWrite}
          >
          </Radio.Group>

          <MLTooltip title={CommonStepTooltips.radioQuery} placement={"top"}>
            <Icon type="question-circle" className={styles.questionCircleQuery} theme="filled" data-testid="queryTooltip"/>
          </MLTooltip>

          <MLTooltip title={CommonStepTooltips.radioCollection} placement={"top"}>
            <Icon type="question-circle" className={styles.questionCircleCollection} theme="filled" data-testid="collectionTooltip"/>
          </MLTooltip>

          {selectedSource === "collection" ? <div ><span className={styles.srcCollectionInput}><AutoComplete
            id="collList"
            //mode="tags"
            className={styles.input}
            dataSource={collectionOptions}
            aria-label="collection-input"
            placeholder= {<span>Enter collection name</span>}
            value={collections}
            disabled={!props.canReadWrite}
            onSearch={handleSearch}
            onFocus= {handleFocus}
            onChange={handleTypeaheadChange}
            onBlur={sendPayloadSrcValidity}
          >
            {/* {collectionsList} */}
          </AutoComplete>&nbsp;&nbsp;{props.canReadWrite ? <Icon className={styles.searchIcon} type="search" theme="outlined"/> : ""}
          </span></div> : <span><TextArea
            id="srcQuery"
            placeholder="Enter source query"
            value={srcQuery}
            onChange={handleChange}
            disabled={!props.canReadWrite}
            className={styles.input}
            onBlur={sendPayloadSrcValidity}
          ></TextArea></span>}
        </Form.Item>

        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <MLButton data-testid="mapping-dialog-cancel"  onClick={() => onCancel()}>Cancel</MLButton>
            &nbsp;&nbsp;
            {!props.canReadWrite?<MLTooltip title={NewMapTooltips.missingPermission} placement={"bottomRight"}><span className={styles.disabledCursor}><MLButton
              className={styles.disabledSaveButton}
              type="primary"
              htmlType="submit"
              disabled={true}
              data-testid="mapping-dialog-save"
              onClick={handleSubmit}
            >Save</MLButton></span></MLTooltip>:<MLButton
              type="primary"
              htmlType="submit"
              disabled={false}
              data-testid="mapping-dialog-save"
              onClick={handleSubmit}
              onFocus={sendPayload}
            >Save</MLButton>}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateEditMapping;
