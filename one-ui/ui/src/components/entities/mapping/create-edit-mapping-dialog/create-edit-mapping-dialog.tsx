import { Modal, Form, Input, Button, Tooltip, Icon, Select, Radio } from "antd";
import React, { useState, useEffect } from "react";
import styles from './create-edit-mapping-dialog.module.scss';
import { NewMapTooltips } from '../../../../config/tooltips.config';
import Axios from "axios";

const CreateEditMappingDialog = (props) => {

  const [mapName, setMapName] = useState('');
  const [description, setDescription] = useState(props.mapData && props.mapData != {} ? props.mapData.description : '');
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState(props.mapData && props.mapData != {} ? props.mapData.selectedSource : 'collection')
  const [srcQuery, setSrcQuery] = useState(props.mapData && props.mapData != {} ? props.mapData.sourceQuery : '');

  //To check submit validity
  const [isMapNameTouched, setMapNameTouched] = useState(false);
  const [isDescriptionTouched, setDescriptionTouched] = useState(false);
  const [isCollectionsTouched, setCollectionsTouched] = useState(false);
  const [isSrcQueryTouched, setSrcQueryTouched] = useState(false);
  const [isSelectedSourceTouched, setSelectedSourceTouched] = useState(false);

  const [isValid, setIsValid] = useState(false);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);
  const colList = ['Provider', 'Claims', 'Students', 'Customer']; //To be removed once integrated with EndPoints.

  useEffect(() => {
    if (props.mapData && JSON.stringify(props.mapData) != JSON.stringify({}) && props.title === 'Edit Mapping') {
      setMapName(props.mapData.name);
      setDescription(props.mapData.description);
      setCollections([...props.mapData.collections]);
      setSrcQuery(props.mapData.sourceQuery);
      setSelectedSource(props.mapData.selectedSource);
      setIsValid(true);
      setTobeDisabled(true);
    } else {
      setMapName('');
      setMapNameTouched(false);
      setCollections([]);
      setDescription('');
      setSrcQuery('')
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
    })

  }, [props.mapData, props.title, props.newMap]);

  const onCancel = () => {

    if (checkDeleteOpenEligibility()) {
      console.log(isMapNameTouched
        , isDescriptionTouched
        , isSelectedSourceTouched
        , isCollectionsTouched
        , isSrcQueryTouched)
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
      <Button onClick={() => onDelCancel()}>No</Button>
      &nbsp;&nbsp;
            <Button type="primary" htmlType="submit" onClick={onDelOk}>Yes</Button>
    </div>
  </Modal>;

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();

    let dataPayload = {}
    // let dataPayload = {
    //        name: mapName,
    //        description: description,
    //        selectedSource: selectedSource,
    //        sourceQuery: srcQuery,
    //        collection: []
    //      }

    setIsValid(true);

    //Call create Mapping artifact API function

    props.createMappingArtifact(dataPayload);

    props.setNewMap(false);
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
          if (JSON.stringify(collections) !== JSON.stringify([]) || srcQuery) {
            setIsValid(true);
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
        if (props.title === 'New Mapping') {
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
  }

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

  const handleSelectedSource = (event) => {
    if (event.target.value === ' ') {
      setSelectedSourceTouched(false);
    }
    else {
      setSelectedSourceTouched(true);
      setSelectedSource(event.target.value);
      if (event.target.value === props.mapData.selectedSource) {
        setSelectedSourceTouched(false);
      }
      if (event.target.value === 'collection') {
        if (mapName && JSON.stringify(collections) !== JSON.stringify([])) {
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
          validateStatus={(mapName || !isMapNameTouched) ? '' : 'error'}
          help={(mapName || !isMapNameTouched) ? '' : 'Name is required'}
        >
          <Input
            id="name"
            placeholder="Enter name"
            value={mapName}
            onChange={handleChange}
            disabled={tobeDisabled}
            className={styles.input}
          />&nbsp;&nbsp;
          <Tooltip title={NewMapTooltips.name}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </Tooltip>
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
          <Tooltip title={NewMapTooltips.description}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </Tooltip>
        </Form.Item>

        <Form.Item label={<span>
          Source Query:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>} labelAlign="left">
          <Radio.Group
            id="srcType"
            options={srcTypeOptions}
            onChange={handleSelectedSource}
            value={selectedSource}
            disabled={!props.canReadWrite}
          >
          </Radio.Group>
              <Tooltip title={NewMapTooltips.sourceQuery}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          {selectedSource === 'collection' ? <Select
            id="collList"
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Please select"
            value={collections}
            disabled={!props.canReadWrite}
            onChange={handleCollList}
          >
            {collectionsList}
          </Select> : <TextArea
            id="srcQuery"
            placeholder="Enter Source Query"
            value={srcQuery}
            onChange={handleChange}
            disabled={!props.canReadWrite}
          ></TextArea>}
        </Form.Item>
        <br /><br /><br /><br />

        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <Button onClick={() => onCancel()}>Cancel</Button>
            &nbsp;&nbsp;
            <Button type="primary" htmlType="submit" disabled={!isValid || !props.canReadWrite} onClick={handleSubmit}>Save</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
    {deleteConfirmation}
  </Modal>)
}

export default CreateEditMappingDialog;

