import { Modal, Form, Input, Button, Tooltip, Icon, Select, Radio } from "antd";
import React, { useState, useEffect } from "react";
import styles from './create-edit-mapping-dialog.module.scss';
import { NewMapTooltips } from '../../../../config/tooltips.config';
import Axios from "axios";
import { MLButton, MLTooltip } from '@marklogic/design-system';


const CreateEditMappingDialog = (props) => {

  const [mapName, setMapName] = useState('');
  const [description, setDescription] = useState(props.mapData && props.mapData != {} ? props.mapData.description : '');
  //const [collections, setCollections] = useState<any[]>([]);
  const [collections, setCollections] = useState('');
  const [selectedSource, setSelectedSource] = useState(props.mapData && props.mapData != {} ? props.mapData.selectedSource : 'collection')
  const [srcQuery, setSrcQuery] = useState(props.mapData && props.mapData != {} ? props.mapData.sourceQuery : '');
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

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);
  const colList = ['Provider', 'Claims', 'Students', 'Customer']; //To be removed once integrated with EndPoints.

  useEffect(() => {
    if (props.mapData && JSON.stringify(props.mapData) != JSON.stringify({}) && props.title === 'Edit Mapping Step') {
      setMapName(props.mapData.name);
      setDescription(props.mapData.description);
      setSrcQuery(props.mapData.sourceQuery);
      setSelectedSource(props.mapData.selectedSource);
      if(isQuerySelected == true) setCollections("");
      if(props.mapData.selectedSource === 'collection'){
      if(props.mapData.sourceQuery.includes('[') && props.mapData.sourceQuery.includes(']')) {
          let srcCollection = props.mapData.sourceQuery.substring(
              props.mapData.sourceQuery.lastIndexOf("[") + 2,
              props.mapData.sourceQuery.lastIndexOf("]") - 1
          );
          setCollections(srcCollection);
      }
      else if((props.mapData.sourceQuery.includes('(') && props.mapData.sourceQuery.includes(')'))){
          let srcCollection = props.mapData.sourceQuery.substring(
            props.mapData.sourceQuery.lastIndexOf("(") + 2,
            props.mapData.sourceQuery.lastIndexOf(")") - 1
          );
          setCollections(srcCollection);
      }
      else{
          setCollections(props.mapData.sourceQuery);
      }
      }
      setIsValid(true);
      setTobeDisabled(true);
    } else {
      setMapName('');
      setMapNameTouched(false);
      setCollections('');
      setDescription('');
      setSrcQuery('')
      setIsNameDuplicate(false);
    }

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
    })

  }, [props.mapData, props.title, props.newMap]);

  const onCancel = () => {

    if (checkDeleteOpenEligibility()) {
      setDeleteDialogVisible(true);
    } else {
      props.setNewMap(false);

    }
  }

  const checkDeleteOpenEligibility = () => {
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
  }

  const onOk = () => {
    props.setNewMap(false);
  }

  const onDelOk = () => {
    props.setNewMap(false);
    setDeleteDialogVisible(false)
  }

  const onDelCancel = () => {
    setDeleteDialogVisible(false)
  }

  const deleteConfirmation = <Modal
    visible={deleteDialogVisible}
    bodyStyle={{ textAlign: 'center' }}
    width={250}
    maskClosable={false}
    closable={false}
    footer={null}
  >
    <span className={styles.ConfirmationMessage}>Discard changes?</span>
    <br /><br />
    <div >
      <MLButton onClick={() => onDelCancel()}>No</MLButton>
      &nbsp;&nbsp;
            <MLButton type="primary" htmlType="submit" onClick={onDelOk}>Yes</MLButton>
    </div>
  </Modal>;

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();
    let dataPayload;
    if(selectedSource === 'collection') {
      let sQuery = `cts.collectionQuery(['${collections}'])`;
      dataPayload = {
        name: mapName,
        targetEntityType: props.targetEntityType,
        description: description,
        selectedSource: selectedSource,
        sourceQuery: sQuery
      }
    } else {
        setIsQuerySelected(true); //to reset collection name
        dataPayload = {
        name: mapName,
        targetEntityType: props.targetEntityType,
        description: description,
        selectedSource: selectedSource,
        sourceQuery: srcQuery
      }
    }


    setIsValid(true);

    //Call create Mapping artifact API function

    let status = await props.createMappingArtifact(dataPayload);

    if (status.code === 200) {
      props.setNewMap(false);
    } else if (status.code === 400) {

      setErrorMessage(status.message)
      setIsNameDuplicate(true);
      setIsValid(false);
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
        if (props.mapData && props.mapData.description) {
          if (event.target.value === props.mapData.description) {
            setDescriptionTouched(false);
          }
        }
        if (props.title === 'New Mapping Step') {
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
        if (props.mapData && props.mapData.collection) {
          if (props.mapData.collection === event.target.value) {

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
  }
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

      if (props.mapData && event.target.value === props.mapData.selectedSource) {
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
  const collectionsList = colList.map(d => <Select.Option key={d}>{d}</Select.Option>);
  const { TextArea } = Input;

  return (<Modal visible={props.newMap}
    title={null}
    width="700px"
    onCancel={() => onCancel()}
    onOk={() => onOk()}
    okText="Save"
    className={styles.modal}
    footer={null}
    maskClosable={false}>

    <p className={styles.title}>{props.title}</p>
    <br />
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
          <MLTooltip title={NewMapTooltips.name}>
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
          <MLTooltip title={NewMapTooltips.description}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </MLTooltip>
        </Form.Item>

        <Form.Item label={<span>
          Source Query:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>} labelAlign="left"
            validateStatus={(collections || srcQuery || (!isSelectedSourceTouched && !isCollectionsTouched && !isSrcQueryTouched)) ? '' : 'error'}
            help={(collections || srcQuery || (!isSelectedSourceTouched && !isCollectionsTouched && !isSrcQueryTouched)) ? '' : 'Collection or Query is required'}
            >
          <Radio.Group
            id="srcType"
            options={srcTypeOptions}
            onChange={handleSelectedSource}
            value={selectedSource}
            disabled={!props.canReadWrite}
          >
          </Radio.Group>
          {selectedSource === 'collection' ? <div ><span className={styles.srcCollectionInput}><Input
            id="collList"
            //mode="tags"
            className={styles.input}
            placeholder="Enter collection name"
            value={collections}
            disabled={!props.canReadWrite}
            onChange={handleChange}
          >
            {/* {collectionsList} */}
          </Input>&nbsp;&nbsp;<MLTooltip title={NewMapTooltips.sourceQuery}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip></span></div> : <span><TextArea
            id="srcQuery"
            placeholder="Enter source query"
            value={srcQuery}
            onChange={handleChange}
            disabled={!props.canReadWrite}
            className={styles.input}
          ></TextArea>&nbsp;&nbsp;<MLTooltip title={NewMapTooltips.sourceQuery}>
          <Icon type="question-circle" className={styles.questionCircleTextArea} theme="filled" />
        </MLTooltip></span>}
        </Form.Item>
        <br /><br /><br /><br />

        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <MLButton data-testid="mapping-dialog-cancel"  onClick={() => onCancel()}>Cancel</MLButton>
            &nbsp;&nbsp;
            <MLButton type="primary" htmlType="submit" disabled={!isValid || !props.canReadWrite} data-testid="mapping-dialog-save" onClick={handleSubmit}>Save</MLButton>
          </div>
        </Form.Item>
      </Form>
    </div>
    {deleteConfirmation}
  </Modal>)
}

export default CreateEditMappingDialog;

