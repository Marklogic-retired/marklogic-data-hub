import React, { useState, useEffect, useContext } from "react";
import { Modal, Form, Input, Icon, Radio, AutoComplete } from "antd";
import axios from "axios";
import styles from './create-edit-step-dialog.module.scss';

import ConfirmationModal from '../../confirmation-modal/confirmation-modal';

import { UserContext } from '../../../util/user-context';
import { NewMatchTooltips, NewMergeTooltips } from '../../../config/tooltips.config';
import { MLButton, MLTooltip } from '@marklogic/design-system'; 
import { ConfirmationType } from '../../../types/common-types';
import { StepType } from '../../../types/curation-types';

type Props = {
  isVisible: boolean;
  isEditing: boolean;
  stepType: StepType;
  editStepArtifactObject: any;
  targetEntityType: string;
  canReadWrite: boolean;
  canReadOnly: boolean;
  toggleModal: (isVisible: boolean) => void;
  createStepArtifact: (stepArtifact: any) => void;
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

const CreateEditStepDialog: React.FC<Props>  = (props) => {

  const { handleError } = useContext(UserContext)
  const [modalTitle, setModalTitle] = useState('');
  const [stepName, setStepName] = useState('');
  const [description, setDescription] = useState('');

  const [collections, setCollections] = useState('');
  const [collectionOptions, setCollectionOptions] = useState(['a','b']);
  const [selectedSource, setSelectedSource] = useState('collection')
  const [srcQuery, setSrcQuery] = useState('');

  //To check submit validity
  const [isStepNameTouched, setStepNameTouched] = useState(false);
  const [isDescriptionTouched, setDescriptionTouched] = useState(false);
  const [isCollectionsTouched, setCollectionsTouched] = useState(false);
  const [isSrcQueryTouched, setSrcQueryTouched] = useState(false);
  const [isSelectedSourceTouched, setSelectedSourceTouched] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [isTimestampTouched, setTimestampTouched] = useState(false);

  const [isValid, setIsValid] = useState(false);

  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);

  useEffect(() => {
    if (props.isVisible) {
      let modalTitle = '';

      if (props.isEditing) {
        if (props.stepType === StepType.Matching) {
          modalTitle = 'Edit Matching Step';
        } else if (props.stepType === StepType.Merging) {
          modalTitle = 'Edit Merging Step';
        }

        setStepName(props.editStepArtifactObject.name);
        setDescription(props.editStepArtifactObject.description);
        setSrcQuery(props.editStepArtifactObject.sourceQuery);
        setSelectedSource(props.editStepArtifactObject.selectedSource);

        if (props.editStepArtifactObject.selectedSource === 'collection') {
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

      } else {
        // New Step Artifact
        if (props.stepType === StepType.Matching) {
          modalTitle = 'New Matching Step';
        } else if (props.stepType === StepType.Merging) {
          modalTitle = 'New Merging Step';
        }
        resetModal();
      }
      setModalTitle(modalTitle);
    }
  }, [props.isVisible]);

  const resetModal = () => {
    setStepName('');
    setDescription('');
    setSelectedSource('collection');
    setTobeDisabled(false);
    setCollections('');
    setSrcQuery('');
    if (props.stepType === StepType.Merging) {
      setTimestamp('');
    }
    resetTouchedValues();
  }

  const resetTouchedValues = () => {
    setSelectedSourceTouched(false);
    setCollectionsTouched(false);
    setSrcQueryTouched(false);
    setStepNameTouched(false);
    setDescriptionTouched(false);
    if (props.stepType === StepType.Merging) {
      setTimestampTouched(false);
    }
  }

  const onCancel = () => {
    if (checkDeleteOpenEligibility()) {
      toggleConfirmModal(true);
    } else {
      resetModal();
      props.toggleModal(false)
    }
  };

  const checkDeleteOpenEligibility = () => {
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

  const confirmAction = () => {
    toggleConfirmModal(false);
    props.toggleModal(false);

    resetTouchedValues()
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (!stepName) {
      // missing name
      setStepNameTouched(true);
    }
    if (!collections && selectedSource === 'collection') {
      // missing collection (if collection is selected)
      setCollectionsTouched(true);
    }
    if (!srcQuery && selectedSource !== 'collection') {
      // missing query (if query is selected)
      setSrcQueryTouched(true);
    }
    if (!stepName || (!collections && selectedSource === 'collection') || (!srcQuery && selectedSource !== 'collection')) {
      // if missing flags are set, do not submit handle
      event.preventDefault();
      return;
    }
    // else: all required fields are set

    if (event) event.preventDefault();
    let dataPayload;
    if(selectedSource === 'collection') {
      let sQuery = `cts.collectionQuery(['${collections}'])`;
      dataPayload = {
        name: stepName,
        targetEntityType: props.targetEntityType,
        description: description,
        selectedSource: selectedSource,
        sourceQuery: sQuery
      };
    } else {
      dataPayload = {
        name: stepName,
        targetEntityType: props.targetEntityType,
        description: description,
        selectedSource: selectedSource,
        sourceQuery: srcQuery
      };
    }
    if(props.stepType === StepType.Merging) {
      dataPayload['timestamp'] = timestamp;
    }

    setIsValid(true);
    props.createStepArtifact(dataPayload);
    props.toggleModal(false);
  };

  const handleSearch = async (value: any) => {
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
        const response = await axios.post(`/api/entitySearch/facet-values?database=staging`, data)
        if(response?.status === 200) {
          setCollectionOptions(response.data);
        }
      } catch (error) {
        console.error(error)
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
      if (props.isEditing && props.editStepArtifactObject.collection) {
        if (props.editStepArtifactObject.collection === data) {
          setCollectionsTouched(false);
        }
      }
      if (data.length > 0) {
        if (stepName) {
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
        setStepNameTouched(false);
      }
      else {
        setStepNameTouched(true);
        setStepName(event.target.value);
        if (event.target.value.length > 0) {
          if (collections || srcQuery) {
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
        if (props.isEditing && props.editStepArtifactObject.description) {
          if (event.target.value === props.editStepArtifactObject.description) {
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
          if (stepName) {
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
        if (props.isEditing && props.editStepArtifactObject.collection) {
          if (props.editStepArtifactObject.collection === event.target.value) {
            setCollectionsTouched(false);
          }
        }
        if (event.target.value.length > 0) {
          if (stepName) {
            setIsValid(true);
          }
        } else {
          setIsValid(false);
        }
      }
    }

    if (event.target.id === 'timestamp') {
      if (event.target.value === ' ') {
        setTimestampTouched(false);
      }
      else {
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
    if (event.target.value === ' ') {
      setSelectedSourceTouched(false);
    }
    else {
      setSelectedSourceTouched(true);
      setSelectedSource(event.target.value);
      if (props.isEditing && event.target.value === props.editStepArtifactObject.selectedSource) {
        setSelectedSourceTouched(false);
      }
      if (event.target.value === 'collection') {
        if (stepName && collections) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } else {
        if (stepName && srcQuery) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      }
    }
  };


  return (
    <Modal 
      visible={props.isVisible}
      title={null}
      width="700px"
      onCancel={onCancel}
      closable={true}
      className={styles.modal}
      footer={null}
      maskClosable={false}
      destroyOnClose={true}
    >
      <p className={styles.title}>{modalTitle}</p>
      <br />
      <div className={styles.newMatchingForm}>
        <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
          <Form.Item label={<span>
            Name:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
              </span>} labelAlign="left"
            validateStatus={(stepName || !isStepNameTouched) ? '' : 'error'}
            help={(stepName || !isStepNameTouched) ? '' : 'Name is required'}
          >
            <Input
              id="name"
              placeholder="Enter name"
              value={stepName}
              onChange={handleChange}
              disabled={tobeDisabled}
              className={styles.input}
            />&nbsp;&nbsp;
            <MLTooltip title={NewMatchTooltips.name}>
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
            <MLTooltip title={NewMergeTooltips.description}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </MLTooltip>
          </Form.Item>

          <Form.Item label={<span>
            Source Query:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
              </span>} labelAlign="left"
              validateStatus={((collections && selectedSource === 'collection') || (srcQuery && selectedSource !== 'collection') || (!isSelectedSourceTouched && !isCollectionsTouched && !isSrcQueryTouched)) ? '' : 'error'}
              help={((collections && selectedSource === 'collection') || (srcQuery && selectedSource !== 'collection') || (!isSelectedSourceTouched && !isCollectionsTouched && !isSrcQueryTouched)) ? '' : 'Collection or Query is required'}
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
              placeholder= {<span>Enter collection name<Icon className={styles.searchIcon} type="search" theme="outlined"/></span>}
              value={collections}
              disabled={!props.canReadWrite}
              onSearch={handleSearch}
              onFocus= {handleFocus}
              onChange={handleTypeaheadChange}
            >
              {/* {collectionsList} */}
            </AutoComplete>&nbsp;&nbsp;{props.canReadWrite ? <Icon className={styles.searchIcon} type="search" theme="outlined"/> : ''}<MLTooltip title={NewMatchTooltips.sourceQuery}>
              <Icon type="question-circle" className={styles.questionCircleColl} theme="filled" />
            </MLTooltip></span></div> : <span><TextArea
              id="srcQuery"
              placeholder="Enter source query"
              value={srcQuery}
              onChange={handleChange}
              disabled={!props.canReadWrite}
              className={styles.input}
            ></TextArea>&nbsp;&nbsp;<MLTooltip title={NewMatchTooltips.sourceQuery}>
            <Icon type="question-circle" className={styles.questionCircleTextArea} theme="filled" />
          </MLTooltip></span>}
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
                />&nbsp;&nbsp;
              <MLTooltip title={NewMergeTooltips.timestampPath}>
                  <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
                </MLTooltip>
              </Form.Item> : ''}

          <Form.Item className={styles.submitButtonsForm}>
            <div className={styles.submitButtons}>
              <MLButton data-testid={`${props.stepType}-dialog-cancel`} onClick={() => onCancel()}>Cancel</MLButton>
              &nbsp;&nbsp;
              <MLButton type="primary" htmlType="submit" disabled={!props.canReadWrite} data-testid={`${props.stepType}-dialog-save`} onClick={handleSubmit}>Save</MLButton>
            </div>
          </Form.Item>
        </Form>
      </div>
      <ConfirmationModal
        isVisible={showConfirmModal}
        type={ConfirmationType.DiscardChanges}
        boldTextArray={[]}
        toggleModal={toggleConfirmModal}
        confirmAction={confirmAction}
      />
    </Modal>
  );
};

export default CreateEditStepDialog;