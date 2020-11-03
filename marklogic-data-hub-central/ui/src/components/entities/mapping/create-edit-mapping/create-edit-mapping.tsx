import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Icon, Radio, AutoComplete } from "antd";
import styles from './create-edit-mapping.module.scss';
import { NewMapTooltips } from '../../../../config/tooltips.config';
import { UserContext } from '../../../../util/user-context';
import { MLButton, MLTooltip } from '@marklogic/design-system';
import ConfirmYesNo from '../../../common/confirm-yes-no/confirm-yes-no';
import axios from "axios"; 

interface Props {
  tabKey: string;
  openStepSettings: boolean;
  setOpenStepSettings: any;
  isNewStep: boolean;
  canReadWrite: boolean;
  canReadOnly: boolean;
  createMappingArtifact: any;
  stepData: any;
  targetEntityType: any;
  sourceDatabase: any;
  currentTab: string;
  setIsValid?: any;
  resetTabs?: any;
  setHasChanged?: any;
}

const CreateEditMapping: React.FC<Props> = (props) => {

  const { handleError } = useContext(UserContext)
  const [mapName, setMapName] = useState('');
  const [description, setDescription] = useState(props.stepData && props.stepData != {} ? props.stepData.description : '');
  //const [collections, setCollections] = useState<any[]>([]);
  const [collections, setCollections] = useState('');
  const [collectionOptions, setCollectionOptions] = useState(['a','b']);
  const [selectedSource, setSelectedSource] = useState(props.stepData && props.stepData.selectedSource ? props.stepData.selectedSource : 'collection')
  const [srcQuery, setSrcQuery] = useState(props.stepData && props.stepData != {} ? props.stepData.sourceQuery : '');
  const [isQuerySelected, setIsQuerySelected] = useState(false);

  //To check submit validity
  const [isMapNameTouched, setMapNameTouched] = useState(false);
  const [isDescriptionTouched, setDescriptionTouched] = useState(false);
  const [isCollectionsTouched, setCollectionsTouched] = useState(false);
  const [isSrcQueryTouched, setSrcQueryTouched] = useState(false);
  const [isSelectedSourceTouched, setSelectedSourceTouched] = useState(false);

  const [isValid, setIsValid] = useState(false);
  const [isNameDuplicate,setIsNameDuplicate] = useState(false);
  const [errorMessage,setErrorMessage] = useState('');

  const [discardChangesVisible, setDiscardChangesVisible] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);
  const [saveChangesVisible, setSaveChangesVisible] = useState(false);
  const [changed, setChanged] = useState(false);

  const initStep = () => {
    setMapName(props.stepData.name);
    setDescription(props.stepData.description);
    setSrcQuery(props.stepData.sourceQuery);
    setSelectedSource(props.stepData.selectedSource);
    if(isQuerySelected == true) setCollections("");
    if(props.stepData.selectedSource === 'collection'){
    if(props.stepData.sourceQuery.includes('[') && props.stepData.sourceQuery.includes(']')) {
        let srcCollection = props.stepData.sourceQuery.substring(
            props.stepData.sourceQuery.lastIndexOf("[") + 2,
            props.stepData.sourceQuery.lastIndexOf("]") - 1
        );
        setCollections(srcCollection);
    }
    else if((props.stepData.sourceQuery.includes('(') && props.stepData.sourceQuery.includes(')'))){
        let srcCollection = props.stepData.sourceQuery.substring(
          props.stepData.sourceQuery.lastIndexOf("(") + 2,
          props.stepData.sourceQuery.lastIndexOf(")") - 1
        );
        setCollections(srcCollection);
    }
    else{
        setCollections(props.stepData.sourceQuery);
    }
    }
    setIsValid(true);
    setTobeDisabled(true);

    setDescriptionTouched(false);
    setCollectionsTouched(false);
    setSrcQueryTouched(false);
    setSelectedSourceTouched(false);
  }

  useEffect(() => {
    // Edit step
    if (props.stepData && JSON.stringify(props.stepData) != JSON.stringify({}) && !props.isNewStep) {
      initStep();
    } 
    // New step
    else {
      setMapName('');
      setMapNameTouched(false);
      setCollections('');
      setDescription('');
      setSrcQuery('');
      setIsNameDuplicate(false);
    }
    // Reset
    return (() => {
      setMapName('');
      setMapNameTouched(false);
      setDescription('');
      setDescriptionTouched(false);
      setSelectedSource('collection');
      setSelectedSourceTouched(false);
      setCollectionsTouched(false);
      setTobeDisabled(false);
      setIsNameDuplicate(false);
    });

  }, [props.stepData]);

  const onCancel = () => {
    if (hasFormChanged()) {
      setDiscardChangesVisible(true);
    } else {
      props.setOpenStepSettings(false);
      props.resetTabs();
    }
  };

  useEffect(() => {
    if (props.currentTab !== props.tabKey && hasFormChanged()) {
      setSaveChangesVisible(true);
    }
  }, [props.currentTab])

  // On change of any form field, update the changed flag for parent
  useEffect(() => {
    props.setHasChanged(hasFormChanged());
    setChanged(false);
  }, [changed])

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

  const discardOk = () => {
    props.setOpenStepSettings(false);
    setDiscardChangesVisible(false);
  };

  const discardCancel = () => {
    setMapNameTouched(false);
    setCollectionsTouched(false);
    setSrcQueryTouched(false);

    setDiscardChangesVisible(false);
  };

  const discardChanges = <ConfirmYesNo
    visible={discardChangesVisible}
    type='discardChanges'
    onYes={discardOk}
    onNo={discardCancel}
  />;

  const saveOk = () => {
    props.createMappingArtifact(getPayload());
    setSaveChangesVisible(false)
  }

  const saveCancel = () => {
    setSaveChangesVisible(false);
    initStep();
  }

  const saveChanges = <ConfirmYesNo
    visible={saveChangesVisible}
    type='saveChanges'
    onYes={saveOk}
    onNo={saveCancel}
  />;

  const getPayload = () => {
    let result;
    if(selectedSource === 'collection') {
      let sQuery = `cts.collectionQuery(['${collections}'])`;
      result = {
        name: mapName,
        targetEntityType: props.targetEntityType,
        description: description,
        selectedSource: selectedSource,
        sourceQuery: sQuery
      };
    } else {
        setIsQuerySelected(true); //to reset collection name
        result = {
        name: mapName,
        targetEntityType: props.targetEntityType,
        description: description,
        selectedSource: selectedSource,
        sourceQuery: srcQuery
      };
    }
    return result;
  }

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (!mapName) {
      // missing name
      setMapNameTouched(true);
    }
    if (!collections && selectedSource === 'collection') {
      // missing collections
      setCollectionsTouched(true);
    }
    if (!srcQuery && selectedSource !== 'collection') {
      // missing query
      setSrcQueryTouched(true);
    }
    if (!mapName || (!collections && selectedSource === 'collection') || (!srcQuery && selectedSource !== 'collection')) {
      // if missing flags are set, do not submit handle
      event.preventDefault();
      return;
    }
    // else: all required fields are set
    
    if (event) event.preventDefault();

    setIsValid(true);

    props.createMappingArtifact(getPayload());
    props.setOpenStepSettings(false);
    props.resetTabs();
  }

   const handleSearch = async (value: any) => {
    let databaseName = 'staging';
    if(props.sourceDatabase){
      databaseName = props.sourceDatabase.split('-')[2].toLowerCase();
    }
    if(value && value.length > 2){
      try {
        let data = {
            "referenceType": "collection",
            "entityTypeId": " ",
            "propertyPath": " ",
            "limit": 10,
            "dataType": "string",
            "pattern": value,
        }
        const response = await axios.post(`/api/entitySearch/facet-values?database=${databaseName}`, data)
        setCollectionOptions(response.data);
      } catch (error) {
        console.log(error)
        handleError(error);
    }

    }else{
      setCollectionOptions([]);
    }
  }

  const handleFocus = () => {
      setCollectionOptions([]);
  }

  const handleTypeaheadChange = (data: any) => {
    if (data === ' ') {
        setCollectionsTouched(false);
    }
    else {
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
        }
      } else {
        setIsValid(false);
      }
    }
  }

  const handleChange = (event) => {
    if (event.target.id === 'name') {
      if (event.target.value === ' ') {
        setMapNameTouched(false);
      }
      else {
        setMapNameTouched(true);
        setMapName(event.target.value);
        if (event.target.value.length > 0) {
          if (collections|| srcQuery) {
              setIsValid(true);
              setIsNameDuplicate(false);
          }
        } else {
          setIsValid(false);
        }
      }
    }

    if (event.target.id === 'description') {
      if (event.target.value === ' ') {
        setDescriptionTouched(false);
      }
      else {
        setDescriptionTouched(true);
        setDescription(event.target.value);
        if (props.stepData && props.stepData.description) {
          if (event.target.value === props.stepData.description) {
            setDescriptionTouched(false);
          }
        }
        if (props.isNewStep) {
          if (event.target.value === '') {
            setDescriptionTouched(false);
          }
        }
      }
    }

    if (event.target.id === 'srcQuery') {
      if (event.target.value === ' ') {
        setSrcQueryTouched(false);
      }
      else {
        setSrcQueryTouched(true);
        setSrcQuery(event.target.value);
        if (event.target.value.length > 0) {
          if (mapName) {
            setIsValid(true);
          }
        } else {
          setIsValid(false);
        }
      }
    }
    if (event.target.id === 'collList') {
      if (event.target.value === ' ') {
        setCollectionsTouched(false);
      }
      else {
        setCollectionsTouched(true);
        setCollections(event.target.value);
        if (props.stepData && props.stepData.collection) {
          if (props.stepData.collection === event.target.value) {

            setCollectionsTouched(false);
          }
        }
        if (event.target.value.length > 0) {
          if (mapName) {
            setIsValid(true);
          }
        } else {
          setIsValid(false);
        }
      }
    }
    setChanged(true);
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
    if (event.target.value === ' ') {
      setSelectedSourceTouched(false);
    }
    else {
      setSelectedSourceTouched(true);
      setSelectedSource(event.target.value);

      if (props.stepData && event.target.value === props.stepData.selectedSource) {
        setSelectedSourceTouched(false);
      }
      if (event.target.value === 'collection') {
        if (mapName && collections) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } else {
        if (mapName && srcQuery) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      }
    }
    setChanged(true);
  };

  const isSourceQueryValid = () => {
    if ((collections && selectedSource === 'collection') || 
    (srcQuery && selectedSource !== 'collection') || 
    (!isSelectedSourceTouched && !isCollectionsTouched && !isSrcQueryTouched)) {
      if (props.currentTab === props.tabKey) {
        props.setIsValid(true);
      }
      return true;
    } else {
      if (props.currentTab === props.tabKey) {
        props.setIsValid(false);
      }
      return false;
    }
  }

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

  const srcTypeOptions = [
    { label: 'Collection', value: 'collection' },
    { label: 'Query', value: 'query' }
  ];
  const { TextArea } = Input;

  return (
    <div className={styles.newMappingForm}>
      <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
        <Form.Item label={<span>
          Name:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>} labelAlign="left"
          validateStatus={(mapName || !isMapNameTouched) ? (!isNameDuplicate ? '' : 'error') : 'error'}
          help={(mapName || !isMapNameTouched) ? (isNameDuplicate ? errorMessage :'') : 'Name is required'}
        >
          <Input
            id="name"
            placeholder="Enter name"
            value={mapName}
            onChange={handleChange}
            disabled={tobeDisabled}
            className={styles.input}
          />&nbsp;&nbsp;
          <MLTooltip title={NewMapTooltips.name} placement={'right'}>
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
          />&nbsp;&nbsp;
          <MLTooltip title={NewMapTooltips.description} placement={'right'}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </MLTooltip>
        </Form.Item>

        <Form.Item label={<span>
          Source Query:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>} labelAlign="left"
            validateStatus={isSourceQueryValid() ? '' : 'error'}
            help={isSourceQueryValid() ? '' : 'Collection or Query is required'}
            >
          <Radio.Group
            id="srcType"
            options={srcTypeOptions}
            onChange={handleSelectedSource}
            value={selectedSource}
            disabled={!props.canReadWrite}
          >
          </Radio.Group>
          {selectedSource === 'collection' ? <div ><span className={styles.srcCollectionInput}><AutoComplete
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
          >
            {/* {collectionsList} */}
          </AutoComplete>&nbsp;&nbsp;{props.canReadWrite ? <Icon className={styles.searchIcon} type="search" theme="outlined"/> : ''}
          <MLTooltip title={NewMapTooltips.sourceQuery} placement={'right'}>
            <Icon type="question-circle" className={styles.questionCircleColl} theme="filled" />
          </MLTooltip></span></div> : <span><TextArea
            id="srcQuery"
            placeholder="Enter source query"
            value={srcQuery}
            onChange={handleChange}
            disabled={!props.canReadWrite}
            className={styles.input}
          ></TextArea>&nbsp;&nbsp;<MLTooltip title={NewMapTooltips.sourceQuery} placement={'right'}>
          <Icon type="question-circle" className={styles.questionCircleTextArea} theme="filled" />
        </MLTooltip></span>}
        </Form.Item>

        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <MLButton data-testid="mapping-dialog-cancel"  onClick={() => onCancel()}>Cancel</MLButton>
            &nbsp;&nbsp;
            <MLButton 
              type="primary" 
              htmlType="submit" 
              disabled={!props.canReadWrite} 
              data-testid="mapping-dialog-save" 
              onClick={handleSubmit}
            >Save</MLButton>
          </div>
        </Form.Item>
      </Form>
      {discardChanges}
      {saveChanges}
    </div>
  );
};

export default CreateEditMapping;
