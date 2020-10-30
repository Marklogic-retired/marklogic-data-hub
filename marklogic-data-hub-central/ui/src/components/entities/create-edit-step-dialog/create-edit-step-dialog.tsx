import React, { useState, useEffect, useContext } from "react";
import { Modal, Form, Input, Icon, Radio, AutoComplete } from "antd";
import axios from "axios";
import styles from './create-edit-step-dialog.module.scss';

import ConfirmationModal from '../../confirmation-modal/confirmation-modal';

import { UserContext } from '../../../util/user-context';
import { NewMatchTooltips } from '../../../config/tooltips.config';
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
  const [isNameMissingOnSave, setNameMissingOnSave] = useState(false);
  const [isDescriptionTouched, setDescriptionTouched] = useState(false);
  const [isCollectionsTouched, setCollectionsTouched] = useState(false);
  const [isSrcQueryTouched, setSrcQueryTouched] = useState(false);
  const [isQueryMissingOnSave, setQueryMissingOnSave] = useState(false);
  const [isSelectedSourceTouched, setSelectedSourceTouched] = useState(false);

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
    setStepNameTouched(false);
    setDescription('');
    setDescriptionTouched(false);
    setSelectedSource('collection');
    setSelectedSourceTouched(false);
    setCollectionsTouched(false);
    setTobeDisabled(false);
    setCollections('');
    setSrcQuery('');
  }

  const onCancel = () => {
    setNameMissingOnSave(false)
    setQueryMissingOnSave(false)
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
    ) {
      return false;
    } else {
      return true;
    }
  };

  const confirmAction = () => {
    toggleConfirmModal(false);
    props.toggleModal(false);
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
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
        setNameMissingOnSave(false)
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
        setQueryMissingOnSave(false)
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
        setQueryMissingOnSave(false)
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
        if (stepName && JSON.stringify(collections) !== JSON.stringify([])) {
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
            validateStatus={(stepName || !isStepNameTouched && !isNameMissingOnSave) ? '' : 'error'}
            help={(stepName || !isStepNameTouched && !isNameMissingOnSave) ? '' : 'Name is required'}
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
            <MLTooltip title={NewMatchTooltips.description}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </MLTooltip>
          </Form.Item>

          <Form.Item label={<span>
            Source Query:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
              </span>} labelAlign="left"
              validateStatus={((collections && selectedSource === 'collection') || (srcQuery && selectedSource !== 'collection') || (!isSelectedSourceTouched && !isCollectionsTouched && !isSrcQueryTouched) && !isQueryMissingOnSave) ? '' : 'error'}
              help={((collections && selectedSource === 'collection') || (srcQuery && selectedSource !== 'collection') || (!isSelectedSourceTouched && !isCollectionsTouched && !isSrcQueryTouched) && !isQueryMissingOnSave) ? '' : 'Collection or Query is required'}
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

          <Form.Item className={styles.submitButtonsForm}>
            <div className={styles.submitButtons}>
              <MLButton onClick={() => onCancel()}>Cancel</MLButton>
              &nbsp;&nbsp;
              <MLButton
                type="primary"
                htmlType="submit"
                disabled={!props.canReadWrite} 
                onClick={(e) => {
                  setNameMissingOnSave(false)
                  setQueryMissingOnSave(false)
                  if (!stepName) {
                    setNameMissingOnSave(true)
                    e.preventDefault()
                    // alert("Name must be filled out")
                  }
                  if ((!collections && selectedSource === 'collection') || (!srcQuery && selectedSource !== 'collection')) {
                    setQueryMissingOnSave(true)
                    e.preventDefault()
                    // alert("Collection or query must be filled out")
                  }
  
                  // else: all entries are valid and form should be submitted
                }}
              >Save</MLButton>
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