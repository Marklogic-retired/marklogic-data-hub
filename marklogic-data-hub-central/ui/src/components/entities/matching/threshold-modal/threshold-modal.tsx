import React, { useState, useEffect, useContext } from 'react';
import { Modal, Form, Input, Icon } from 'antd';
import { MLButton, MLTooltip, MLSelect } from '@marklogic/design-system';
import styles from './threshold-modal.module.scss';

import { CurationContext } from '../../../../util/curation-context';
import { MatchingStep, Threshold } from '../../../../types/curation-types';
import { Definition } from '../../../../types/modeling-types';
import { NewMatchTooltips } from '../../../../config/tooltips.config';
import { updateMatchingArtifact } from '../../../../api/matching';

type Props = {
  isVisible: boolean;
  editThreshold: any;
  toggleModal: (isVisible: boolean) => void;
};

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const THRESHOLD_TYPE_OPTIONS = [
  { name: 'Merge', value: 'merge' },
  { name: 'Notify', value: 'notify' },
  { name: 'Custom', value: 'custom' },
];

const { MLOption } = MLSelect;
 
const ThresholdModal: React.FC<Props> = (props) => {
  const { curationOptions, updateActiveStepArtifact } = useContext(CurationContext);

  const [nameValue, setNameValue] = useState('');
  const [nameErrorMessage, setNameErrorMessage] = useState('');

  const [actionType, setActionType] = useState<string | undefined>(undefined);
  const [actionTypeErrorMessage, setActionTypeErrorMessage] = useState('');

  const [uriValue, setUriValue] = useState('');
  const [uriErrorMessage, setUriErrorMessage] = useState('');
  const [functionValue, setFunctionValue] = useState('');
  const [functionErrorMessage, setFunctionErrorMessage] = useState('');
  const [namespaceValue, setNamespaceValue] = useState('');

  useEffect(() => {
    if (Object.keys(props.editThreshold).length !== 0 && props.isVisible) {
      let editThreshold = props.editThreshold;
      setNameValue(editThreshold['thresholdName']);
      setActionType(editThreshold['action']);
      if (editThreshold['action'] === 'custom') {
        setUriValue(editThreshold['actionModulePath'])
        if (editThreshold.hasOwnProperty('actionModuleNamespace')) {
          setNamespaceValue(editThreshold['actionModuleNamespace'])
        }
        if (editThreshold.hasOwnProperty('actionModuleFunction')) {
          setFunctionValue(editThreshold['actionModuleFunction'])
        }
      }
    }
  }, [JSON.stringify(props.editThreshold)]);

  const handleInputChange = (event) => {
    switch(event.target.id) {
      case 'name-input':
        if (event.target.value === '') {
          setNameErrorMessage('A threshold name is required');
        } else {
          setNameErrorMessage('');
        }
        setNameValue(event.target.value);
        break;

      case 'uri-input':
        if (event.target.value === '') {
          setUriErrorMessage('A URI is required');
        } else {
          setUriErrorMessage('');
        }
        setUriValue(event.target.value);
        break;

      case 'function-input':
        if (event.target.value === '') {
          setFunctionErrorMessage('A function is required');
        } else {
          setFunctionErrorMessage('');
        }
        setFunctionValue(event.target.value);
        break;

      case 'namespace-input':
        setNamespaceValue(event.target.value);
        break;

      default:
        break;
    }
  };

  const closeModal = () => {
    resetModal();
    props.toggleModal(false);
  };

  const resetModal = () => {
    setNameValue('');
    setNameErrorMessage('');
    setActionType(undefined);
    setActionTypeErrorMessage('');
    setUriValue('');
    setUriErrorMessage('');
    setFunctionValue('');
    setFunctionErrorMessage('');
    setNamespaceValue('');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    let nameErrorMessage = '';
    let actionErrorMessage = '';
    let thresholdName = nameValue || '';
    if (thresholdName === '') {
      nameErrorMessage = 'A threshold name is required';
    }

    if (actionType === '' || actionType === undefined) {
      actionErrorMessage = 'An action is required';
    }
    switch(actionType) {
      case 'merge':
      case 'notify':
        {

          if (actionErrorMessage === '' && nameErrorMessage === '' && Object.keys(props.editThreshold).length === 0) {
            let newThreshold: Threshold = {
              thresholdName,
              action: actionType,
              score: 0
            };

            let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
            let duplicateNames = newStepArtifact.thresholds.filter( threshold => threshold.thresholdName === thresholdName);
            if (duplicateNames.length > 0) {
              nameErrorMessage = 'A duplicate threshold name exists';
            } else {
              newStepArtifact.thresholds.push(newThreshold);
              await updateMatchingArtifact(newStepArtifact);
              updateActiveStepArtifact(newStepArtifact);
              props.toggleModal(false);
              resetModal();
            }

          }

          if (actionErrorMessage === '' && nameErrorMessage === '' && Object.keys(props.editThreshold).length !== 0) {
            let editedThreshold: Threshold = {
              thresholdName,
              action: actionType,
              score: props.editThreshold['score']
            };

            let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
            let duplicateNames = newStepArtifact.thresholds.filter( threshold => threshold.thresholdName === thresholdName);
            if (duplicateNames.length > 0) {
              nameErrorMessage = 'A duplicate threshold name exists';
            } else {
              updateThreshold(editedThreshold)
            }
          }
          break;
        }

        case 'custom':
          {
            let uriErrorMessage = '';
            if (uriValue === '') {
              uriErrorMessage = 'A URI is required';
            }
  
            let functionErrorMessage = '';
            if (functionValue === '') {
              functionErrorMessage = 'A function is required';
            }
    
            let thresholdName = nameValue || '';
    
            let customThreshold: Threshold = {
              thresholdName,
              action: actionType,
              score: 0,
              actionModulePath: uriValue,
              actionModuleFunction: functionValue,
              actionModuleNamespace: namespaceValue
            };
  
            if (uriErrorMessage === '' && functionErrorMessage === '' && nameErrorMessage === '' && actionErrorMessage === '' && Object.keys(props.editThreshold).length === 0) {
              let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
              let duplicateNames = newStepArtifact.thresholds.filter( threshold => threshold.thresholdName === thresholdName);
              if (duplicateNames.length > 0) {
                nameErrorMessage = 'A duplicate threshold name exists';
              } else {
                newStepArtifact.thresholds.push(customThreshold);
                await updateMatchingArtifact(newStepArtifact);
                updateActiveStepArtifact(newStepArtifact);
                props.toggleModal(false);
                resetModal();
              }
            }

            if (uriErrorMessage === '' && functionErrorMessage === '' && actionErrorMessage === '' && nameErrorMessage === '' && Object.keys(props.editThreshold).length !== 0) {
              let customEditedThreshold: Threshold = {
                thresholdName,
                action: actionType,
                score: props.editThreshold['score'],
                actionModulePath: uriValue,
                actionModuleFunction: functionValue,
                actionModuleNamespace: namespaceValue
              };
              
              let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
              let duplicateNames = newStepArtifact.thresholds.filter( threshold => threshold.thresholdName === thresholdName);
              if (duplicateNames.length > 0) {
                nameErrorMessage = 'A duplicate threshold name exists';
              } else {
                updateThreshold(customEditedThreshold)
              }
            }

            setUriErrorMessage(uriErrorMessage);
            setFunctionErrorMessage(functionErrorMessage);
            break;
          }
      default:
        break;
    }
    setNameErrorMessage(nameErrorMessage);
    setActionTypeErrorMessage(actionErrorMessage);
  };

  const updateThreshold = async (threshold) => {
    let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;

    newStepArtifact.thresholds[props.editThreshold['index']] = threshold;
    await updateMatchingArtifact(newStepArtifact);
    updateActiveStepArtifact(newStepArtifact);
    props.toggleModal(false);
    resetModal();
  }

  const onMatchTypeSelect = (value: string) => {
    setActionTypeErrorMessage('');
    setActionType(value);  
  };

  const renderThresholdOptions = THRESHOLD_TYPE_OPTIONS.map((matchType, index) => {
    return <MLOption key={index} value={matchType.value}>{matchType.name}</MLOption>;
  });

  const renderCustomOptions = (
    <>
      <Form.Item
        className={styles.formItem}
        label={<span>
          URI:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>}
        colon={false}
        labelAlign="left"
        validateStatus={uriErrorMessage ? 'error' : ''}
        help={uriErrorMessage}
      >
        <Input
          id="uri-input"
          aria-label="uri-input"
          placeholder="Enter URI"
          className={styles.input}
          value={uriValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <MLTooltip title={NewMatchTooltips.uri}>
          <Icon type="question-circle" className={styles.icon} theme="filled" />
        </MLTooltip>
      </Form.Item>
      <Form.Item
        className={styles.formItem}
        label={<span>
          Function:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>}
        colon={false}
        labelAlign="left"
        validateStatus={functionErrorMessage ? 'error' : ''}
        help={functionErrorMessage}
      >
        <Input
          id="function-input"
          aria-label="function-input"
          placeholder="Enter a function"
          className={styles.input}
          value={functionValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <MLTooltip title={NewMatchTooltips.function}>
          <Icon type="question-circle" className={styles.icon} theme="filled" />
        </MLTooltip>
      </Form.Item>
      <Form.Item
          className={styles.formItem}
          label={<span>Namespace:</span>}
          colon={false}
          labelAlign="left"
        >
          <Input
            id="namespace-input"
            aria-label="namespace-input"
            placeholder="Enter a namespace"
            className={styles.input}
            value={namespaceValue}
            onChange={handleInputChange}
            onBlur={handleInputChange}
          />
          <MLTooltip title={NewMatchTooltips.namespace}>
            <Icon type="question-circle" className={styles.icon} theme="filled" />
          </MLTooltip>
      </Form.Item>
    </>
  );

  const modalFooter = (
    <div className={styles.footer}>
      <MLButton
        aria-label={`cancel-single-ruleset`}
        onClick={closeModal}
      >Cancel</MLButton>
      <MLButton
        className={styles.saveButton}
        aria-label={`confirm-single-ruleset`}
        type="primary"
        onClick={(e) => onSubmit(e)}
      >Save</MLButton>
    </div>
  );

  return (
    <Modal
      visible={props.isVisible}
      destroyOnClose={true}
      closable={true}
      maskClosable={false}
      title={Object.keys(props.editThreshold).length === 0 ? 'Add Match Threshold' : 'Edit Match Threshold'}
      footer={null}
      width={700}
      onCancel={closeModal}
    >
      <Form
        {...layout}
        id="match-threshold"
        onSubmit={onSubmit}
      >

        <Form.Item
          className={styles.formItem}
          label={<span>
            Name:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
              </span>}
          colon={false}
          labelAlign="left"
          validateStatus={nameErrorMessage ? 'error' : ''}
          help={nameErrorMessage}
        >
          <Input
            id="name-input"
            aria-label="name-input"
            placeholder="Enter threshold name"
            className={styles.input}
            value={nameValue}
            onChange={handleInputChange}
            onBlur={handleInputChange}
          />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label={<span>
            Action:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
              </span>}
          colon={false}
          labelAlign="left"
          validateStatus={actionTypeErrorMessage ? 'error' : ''}
          help={actionTypeErrorMessage}
        >
          <MLSelect 
            aria-label={"threshold-select"}
            className={styles.matchTypeSelect} 
            size="default" 
            placeholder="Select action"
            defaultValue="''"
            onSelect={onMatchTypeSelect}
            value={actionType}
          >
            {renderThresholdOptions}
          </MLSelect>
        </Form.Item>

        {actionType === 'custom' && renderCustomOptions}
        {modalFooter}
      </Form>
    </Modal>
  );
};

export default ThresholdModal;