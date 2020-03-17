import { Modal, Form, Input, Button, Tooltip, Icon, Select, Radio } from "antd";
import React, { useState, useEffect } from "react";
import styles from './create-edit-matching-dialog.module.scss';
import { NewMatchingTooltips } from '../../../../config/tooltips.config';

const CreateEditMatchingDialog = (props) => {

  const [matchingName, setMatchingName] = useState('');
  const [description, setDescription] = useState(props.matchingData && props.matchingData != {} ? props.matchingData.description : '');
  //const [collections, setCollections] = useState<any[]>([]);
  const [collections, setCollections] = useState('');
  const [selectedSource, setSelectedSource] = useState(props.matchingData && props.matchingData != {} ? props.matchingData.selectedSource : 'collection')
  const [srcQuery, setSrcQuery] = useState(props.matchingData && props.matchingData != {} ? props.matchingData.sourceQuery : '');

  //To check submit validity
  const [isMatchingNameTouched, setMatchingNameTouched] = useState(false);
  const [isDescriptionTouched, setDescriptionTouched] = useState(false);
  const [isCollectionsTouched, setCollectionsTouched] = useState(false);
  const [isSrcQueryTouched, setSrcQueryTouched] = useState(false);
  const [isSelectedSourceTouched, setSelectedSourceTouched] = useState(false);

  const [isValid, setIsValid] = useState(false);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);

  useEffect(() => {
    if (props.matchingData && JSON.stringify(props.matchingData) != JSON.stringify({}) && props.title === 'Edit Matching') {
      setMatchingName(props.matchingData.name);
      setDescription(props.matchingData.description);
      setSrcQuery(props.matchingData.sourceQuery);
      setSelectedSource(props.matchingData.selectedSource);
      if(props.matchingData.selectedSource === 'collection'){
      let srcCollection = props.matchingData.sourceQuery.substring(
          props.matchingData.sourceQuery.lastIndexOf("[") + 2, 
          props.matchingData.sourceQuery.lastIndexOf("]") - 1
      );
      setCollections(srcCollection);
      }
      setIsValid(true);
      setTobeDisabled(true);
    } else {
      setMatchingName('');
      setMatchingNameTouched(false);
      //setCollections([]);
      setCollections('');
      setDescription('');
      setSrcQuery('')
    }

    return (() => {

      setMatchingName('');
      setMatchingNameTouched(false);
      setDescription('');
      setDescriptionTouched(false);
      setSelectedSource('collection');
      setSelectedSourceTouched(false);
      setCollectionsTouched(false);
      setTobeDisabled(false);
    })

  }, [props.matchingData, props.title, props.newMatching]);

  const onCancel = () => {

    if (checkDeleteOpenEligibility()) {
      console.log(isMatchingNameTouched
        , isDescriptionTouched
        , isSelectedSourceTouched
        , isCollectionsTouched
        , isSrcQueryTouched)
      setDeleteDialogVisible(true);
    } else {
      props.setNewMatching(false);

    }
  }

  const checkDeleteOpenEligibility = () => {
    if (!isMatchingNameTouched
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
    props.setNewMatching(false);
  }

  const onDelOk = () => {
    props.setNewMatching(false);
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
    let dataPayload;
    if(selectedSource === 'collection') {
      let sQuery = `cts.collectionQuery(['${collections}'])`;
      dataPayload = {
        name: matchingName,
        targetEntity: props.targetEntity,
        description: description,
        selectedSource: selectedSource,
        sourceQuery: sQuery
      }
    } else {
      dataPayload = {
        name: matchingName,
        targetEntity: props.targetEntity,
        description: description,
        selectedSource: selectedSource,
        sourceQuery: srcQuery
      }
    }
    

    setIsValid(true);

    props.createMatchingArtifact(dataPayload);

    props.setNewMatching(false);
  }

  const handleChange = (event) => {
    if (event.target.id === 'name') {
      if (event.target.value === ' ') {
        setMatchingNameTouched(false);
      }
      else {
        setMatchingNameTouched(true);
        setMatchingName(event.target.value);
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
        if (props.matchingData && props.matchingData.description) {
          if (event.target.value === props.matchingData.description) {
            setDescriptionTouched(false);
          }
        }
        if (props.title === 'New Matching') {
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
          if (matchingName) {
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
        console.log('event.target.value',event.target.value === props.matchingData.collection, props.matchingData && props.matchingData.collection)
        if (props.matchingData && props.matchingData.collection) {
          console.log('props.matchingData.collection',props.matchingData.collection,event.target.value)
          if (props.matchingData.collection === event.target.value) {
            
            setCollectionsTouched(false);
          }
        }
        if (event.target.value.length > 0) {
          if (matchingName) {
            setIsValid(true);
          }
        } else {
          setIsValid(false);
        }
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
      if (event.target.value === props.matchingData.selectedSource) {
        setSelectedSourceTouched(false);
      }
      if (event.target.value === 'collection') {
        if (matchingName && JSON.stringify(collections) !== JSON.stringify([])) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } else {
        if (matchingName && srcQuery) {
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
  const { TextArea } = Input;

  return (<Modal visible={props.newMatching}
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
    <div className={styles.newMatchingForm}>
      <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
        <Form.Item label={<span>
          Name:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>} labelAlign="left"
          validateStatus={(matchingName || !isMatchingNameTouched) ? '' : 'error'}
          help={(matchingName || !isMatchingNameTouched) ? '' : 'Name is required'}
        >
          <Input
            id="name"
            placeholder="Enter name"
            value={matchingName}
            onChange={handleChange}
            disabled={tobeDisabled}
            className={styles.input}
          />&nbsp;&nbsp;
          <Tooltip title={NewMatchingTooltips.name}>
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
          <Tooltip title={NewMatchingTooltips.description}>
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
          {selectedSource === 'collection' ? <div ><span className={styles.srcCollectionInput}><Input
            id="collList"
            //mode="tags"
            className={styles.input}
            placeholder="Please select"
            value={collections}
            disabled={!props.canReadWrite}
            onChange={handleChange}
          >
            {/* {collectionsList} */}
          </Input>&nbsp;&nbsp;<Tooltip title={NewMatchingTooltips.sourceQuery}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip></span></div> : <span><TextArea
            id="srcQuery"
            placeholder="Enter Source Query"
            value={srcQuery}
            onChange={handleChange}
            disabled={!props.canReadWrite}
            className={styles.input}
          ></TextArea>&nbsp;&nbsp;<Tooltip title={NewMatchingTooltips.sourceQuery}>
          <Icon type="question-circle" className={styles.questionCircleTextArea} theme="filled" />
        </Tooltip></span>}
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

export default CreateEditMatchingDialog;

