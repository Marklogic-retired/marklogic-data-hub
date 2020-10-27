import React, { useState, useEffect, useContext } from 'react';
import { Modal, Form, Input, Icon } from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { MLButton, MLTooltip, MLSelect } from '@marklogic/design-system';
import styles from './ruleset-single-modal.module.scss';
import arrayIcon from '../../../../assets/icon_array.png';

import EntityPropertyTreeSelect from '../../../entity-property-tree-select/entity-property-tree-select';

import { CurationContext } from '../../../../util/curation-context';
import { MatchingStep, MatchRule, MatchRuleset } from '../../../../types/curation-types';
import { Definition } from '../../../../types/modeling-types';
import { NewMatchTooltips } from '../../../../config/tooltips.config';

type Props = {
  isVisible: boolean;
  toggleModal: (isVisible: boolean) => void;
};
const DEFAULT_ENTITY_DEFINITION: Definition = {
  name: '',
  properties: []
};

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const MATCH_TYPE_OPTIONS = [
  { name: 'Exact', value: 'exact' },
  { name: 'Synonym', value: 'synonym' },
  { name: 'Double Metaphone', value: 'doubleMetaphone' },
  { name: 'Reduce', value: 'reduce' },
  { name: 'Zip', value: 'zip' },
  { name: 'Custom', value: 'custom' },
];

const { MLOption } = MLSelect;
 
const MatchRulesetModal: React.FC<Props> = (props) => {
  const { curationOptions, updateActiveStepArtifact } = useContext(CurationContext);

  const [entityTypeDefinition, setEntityTypeDefinition] = useState<Definition>(DEFAULT_ENTITY_DEFINITION);

  const [selectedProperty, setSelectedProperty] = useState<string | undefined>(undefined);
  const [propertyTypeErrorMessage, setPropertyTypeErrorMessage] = useState('');
  const [matchType, setMatchType] = useState('');
  const [matchTypeErrorMessage, setMatchTypeErrorMessage] = useState('');

  const [thesaurusValue, setThesaurusValue] = useState('');
  const [thesaurusErrorMessage, setThesaurusErrorMessage] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const [dictionaryValue, setDictionaryValue] = useState('');
  const [dictionaryErrorMessage, setDictionaryErrorMessage] = useState('');
  const [distanceThresholdValue, setDistanceThresholdValue] = useState('');
  const [distanceThresholdErrorMessage, setDistanceThresholdErrorMessage] = useState('');
  const [collationValue, setCollationValue] = useState('');

  const [uriValue, setUriValue] = useState('');
  const [uriErrorMessage, setUriErrorMessage] = useState('');
  const [functionValue, setFunctionValue] = useState('');
  const [functionErrorMessage, setFunctionErrorMessage] = useState('');
  const [namespaceValue, setNamespaceValue] = useState('');

  useEffect(() => {
    if (props.isVisible && curationOptions.entityDefinitionsArray.length > 0 && curationOptions.activeStep.entityName !== '') {
      let entityTypeDefinition: Definition = curationOptions.entityDefinitionsArray.find( entityDefinition => entityDefinition.name === curationOptions.activeStep.entityName) || DEFAULT_ENTITY_DEFINITION;
      setEntityTypeDefinition(entityTypeDefinition);
    }
  }, [props.isVisible]);

  const handleInputChange = (event) => {
    switch(event.target.id) {
      case 'thesaurus-uri-input':
        if (event.target.value === '') {
          setThesaurusErrorMessage('A thesaurus URI is required');
        } else {
          setThesaurusErrorMessage('');
        }
        setThesaurusValue(event.target.value);
        break;

      case 'filter-input':
        setFilterValue(event.target.value);
        break;

      case 'dictionary-uri-input':
        if (event.target.value === '') {
          setDictionaryErrorMessage('A dictionary URI is required');
        } else {
          setDictionaryErrorMessage('');
        }
        setDictionaryValue(event.target.value);
        break;

      case 'distance-threshold-input':
        if (event.target.value === '') {
          setDistanceThresholdErrorMessage('A distance threshold is required');
        } else {
          setDistanceThresholdErrorMessage('');
        }
        setDistanceThresholdValue(event.target.value);
        break;

      case 'collation-input':
        setCollationValue(event.target.value);
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
    setSelectedProperty(undefined);
    setMatchType('');
    setPropertyTypeErrorMessage('');
    setMatchTypeErrorMessage('');
    setThesaurusValue('');
    setThesaurusErrorMessage('');
    setFilterValue('');
    setDictionaryValue('');
    setDictionaryErrorMessage('');
    setDistanceThresholdValue('');
    setDistanceThresholdErrorMessage('');
    setCollationValue('');
    setUriValue('');
    setUriErrorMessage('');
    setFunctionValue('');
    setFunctionErrorMessage('');
    setNamespaceValue('');
  };

  const onSubmit = (event) => {
    event.preventDefault();
    let propertyErrorMessage = '';
    let matchErrorMessage = '';

    if (selectedProperty === '' || selectedProperty === undefined) {
      propertyErrorMessage = 'A property to match is required';
    } 
    if (matchType === '') {
      matchErrorMessage = 'A match type is required';
    }
    switch(matchType) {
      case 'exact':
      case 'reduce':
      case 'zip':
        {
          let propertyName = selectedProperty || '';

          let matchRule: MatchRule = {
            entityPropertyPath: propertyName,
            matchType: matchType,
            options: {}
          };
  
          let matchRuleset: MatchRuleset = {
            name: propertyName,
            weight: 0,
            matchRules: [matchRule]
          };
  
          if (propertyErrorMessage === '' && matchErrorMessage === '') {
            // TODO save step to backend
            let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
            newStepArtifact.matchRulesets.push(matchRuleset);
            updateActiveStepArtifact(newStepArtifact);
            props.toggleModal(false);
            resetModal();
          }
          break;
        }

      case 'synonym':
        {
          let thesaurusErrorMessage = '';
          if (thesaurusValue === '') {
            thesaurusErrorMessage = 'A thesaurus URI is required';
          }
  
          let propertyName = selectedProperty || '';
  
          let synonymMatchRule: MatchRule = {
            entityPropertyPath: propertyName,
            matchType: matchType,
            options: {
              thesaurusUri: thesaurusValue,
              filter: filterValue
            }
          };
  
          let matchRuleset: MatchRuleset = {
            name: propertyName,
            weight: 0,
            matchRules: [synonymMatchRule]
          };
  
          if (thesaurusErrorMessage === '' && propertyErrorMessage === '') {
            // TODO save step to backend
            let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
            newStepArtifact.matchRulesets.push(matchRuleset);
            updateActiveStepArtifact(newStepArtifact);
            props.toggleModal(false);
            resetModal();
          }
          setThesaurusErrorMessage(thesaurusErrorMessage);
          break;
        }

      case 'doubleMetaphone':
        {
          let dictionaryUriErrorMessage = '';
          if (dictionaryValue === '') {
            dictionaryUriErrorMessage = 'A dictionary URI is required';
          }

          let distanceThresholdErrorMessage = '';
          if (distanceThresholdValue === '') {
            distanceThresholdErrorMessage = 'A distance threshold is required';
          }
  
          let propertyName = selectedProperty || '';
  
          let doubleMetaphoneMatchRule: MatchRule = {
            entityPropertyPath: propertyName,
            matchType: matchType,
            options: {
              dictionaryUri: dictionaryValue,
              distanceThreshold: distanceThresholdValue
            }
          };

          let matchRuleset: MatchRuleset = {
            name: propertyName,
            weight: 0,
            matchRules: [doubleMetaphoneMatchRule]
          };
  
          if (dictionaryUriErrorMessage === '' && distanceThresholdErrorMessage === '') {
            // TODO save step to backend
            let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
            newStepArtifact.matchRulesets.push(matchRuleset);
            updateActiveStepArtifact(newStepArtifact);
            props.toggleModal(false);
            resetModal();
          }
          setDictionaryErrorMessage(dictionaryUriErrorMessage);
          setDistanceThresholdErrorMessage(distanceThresholdErrorMessage);
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
    
            let propertyName = selectedProperty || '';
    
            let customMatchRule: MatchRule = {
              entityPropertyPath: propertyName,
              matchType: matchType,
              algorithmModulePath: uriValue,
              algorithmModuleFunction: functionValue,
              algorithmModuleNamespace: namespaceValue,
              options: {}
            };
  
            let matchRuleset: MatchRuleset = {
              name: propertyName,
              weight: 0,
              matchRules: [customMatchRule]
            };
    
            if (uriErrorMessage === '' && functionErrorMessage === '') {
              // TODO save step to backend
              let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
              newStepArtifact.matchRulesets.push(matchRuleset);
              updateActiveStepArtifact(newStepArtifact);
              props.toggleModal(false);
              resetModal();
            }
            setUriErrorMessage(uriErrorMessage);
            setFunctionErrorMessage(functionErrorMessage);
            break;
          }

      default:
        break;
    }
    setMatchTypeErrorMessage(matchErrorMessage);
    setPropertyTypeErrorMessage(propertyErrorMessage);
  };

  const onPropertySelect = (value: string) => {
    setPropertyTypeErrorMessage('');
    setSelectedProperty(value);
  };

  const onMatchTypeSelect = (value: string) => {
    setMatchTypeErrorMessage('');
    setMatchType(value);  
  };

  const renderMatchOptions = MATCH_TYPE_OPTIONS.map((matchType, index) => {
    return <MLOption key={index} value={matchType.value}>{matchType.name}</MLOption>;
  });

  const renderSynonymOptions = (
    <>
      <Form.Item
        className={styles.formItem}
        label={<span>
          Thesaurus URI:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>}
        colon={false}
        labelAlign="left"
        validateStatus={thesaurusErrorMessage ? 'error' : ''}
        help={thesaurusErrorMessage}
      >
        <Input
          id="thesaurus-uri-input"
          aria-label="thesaurus-uri-input"
          placeholder="Enter thesaurus URI"
          className={styles.input}
          value={thesaurusValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <MLTooltip title={NewMatchTooltips.thesaurusUri}>
          <Icon type="question-circle" className={styles.icon} theme="filled" />
        </MLTooltip>
      </Form.Item>
      <Form.Item
          className={styles.formItem}
          label={<span>Filter:</span>}
          colon={false}
          labelAlign="left"
        >
          <Input
            id="filter-input"
            aria-label="filter-input"
            placeholder="Enter a node in the thesaurus to use as a filter"
            className={styles.input}
            value={filterValue}
            onChange={handleInputChange}
            onBlur={handleInputChange}
          />
          <MLTooltip title={NewMatchTooltips.filter}>
            <Icon type="question-circle" className={styles.icon} theme="filled" />
          </MLTooltip>
      </Form.Item>
    </>
  );

  const renderDoubleMetaphoneOptions = (
    <>
      <Form.Item
        className={styles.formItem}
        label={<span>
          Dictionary URI:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>}
        colon={false}
        labelAlign="left"
        validateStatus={dictionaryErrorMessage ? 'error' : ''}
        help={dictionaryErrorMessage}
      >
        <Input
          id="dictionary-uri-input"
          aria-label="dictionary-uri-input"
          placeholder="Enter dictionary URI"
          className={styles.input}
          value={dictionaryValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <MLTooltip title={NewMatchTooltips.dictionaryUri}>
          <Icon type="question-circle" className={styles.icon} theme="filled" />
        </MLTooltip>
      </Form.Item>
      <Form.Item
        className={styles.formItem}
        label={<span>
          Distance Threshold:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>}
        colon={false}
        labelAlign="left"
        validateStatus={distanceThresholdErrorMessage ? 'error' : ''}
        help={distanceThresholdErrorMessage}
      >
        <Input
          id="distance-threshold-input"
          aria-label="distance-threshold-input"
          placeholder="Enter distance threshold"
          className={styles.input}
          value={distanceThresholdValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <MLTooltip title={NewMatchTooltips.distanceThreshold}>
          <Icon type="question-circle" className={styles.icon} theme="filled" />
        </MLTooltip>
      </Form.Item>
      <Form.Item
          className={styles.formItem}
          label={<span>Collation:</span>}
          colon={false}
          labelAlign="left"
        >
          <Input
            id="collation-input"
            aria-label="collation-input"
            placeholder="Enter URI for a collation"
            className={styles.input}
            value={collationValue}
            onChange={handleInputChange}
            onBlur={handleInputChange}
          />
          <MLTooltip title={NewMatchTooltips.collation}>
            <Icon type="question-circle" className={styles.icon} theme="filled" />
          </MLTooltip>
      </Form.Item>
    </>
  );

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

  const modalTitle = (
    <div>
      <div style={{ fontSize: '18px'}}>Add Match Ruleset for Single Property</div>
      <div className={styles.modalTitleLegend}>
        <div className={styles.legendText}><img className={styles.arrayImage} src={arrayIcon}/> Multiple</div>
        <div className={styles.legendText}><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> Structured Type</div>
      </div>
    </div>
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
      title={modalTitle}
      footer={null}
      width={700}
      onCancel={closeModal}
    >
      <Form
        {...layout}
        id="matching-single-ruleset"
        onSubmit={onSubmit}
      >
        <Form.Item
          className={styles.formItem}
          label={<span>
            Property to Match:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
              </span>}
          colon={false}
          labelAlign="left"
          validateStatus={propertyTypeErrorMessage ? 'error' : ''}
          help={propertyTypeErrorMessage}
        >
          <EntityPropertyTreeSelect
            propertyDropdownOptions={entityTypeDefinition.properties}
            entityDefinitionsArray={curationOptions.entityDefinitionsArray}
            value={selectedProperty}
            onValueSelected={onPropertySelect}
          />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label={<span>
            Match Type:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
              </span>}
          colon={false}
          labelAlign="left"
          validateStatus={matchTypeErrorMessage ? 'error' : ''}
          help={matchTypeErrorMessage}
        >
          <MLSelect 
            className={styles.matchTypeSelect} 
            size="default" 
            placeholder="Select match type"
            onSelect={onMatchTypeSelect}
          >
            {renderMatchOptions}
          </MLSelect>
        </Form.Item>

        {matchType === 'synonym' && renderSynonymOptions}
        {matchType === 'doubleMetaphone' && renderDoubleMetaphoneOptions}
        {matchType === 'custom' && renderCustomOptions}
        {modalFooter}
      </Form>
    </Modal>
  );
};

export default MatchRulesetModal;