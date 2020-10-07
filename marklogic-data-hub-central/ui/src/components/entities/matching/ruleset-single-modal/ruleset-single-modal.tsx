import React, { useState, useEffect, useContext } from 'react';
import { Modal, Form } from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { MLButton, MLTooltip, MLSelect } from '@marklogic/design-system';
import styles from './ruleset-single-modal.module.scss'
import arrayIcon from '../../../../assets/icon_array.png';

import EntityPropertyTreeSelect from '../../../entity-property-tree-select/entity-property-tree-select';

import { CurationContext } from '../../../../util/curation-context';
import { MatchingStep, MatchRule, MatchRuleset } from '../../../../types/curation-types';
import { Definition } from '../../../../types/modeling-types';

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
  { name: 'Reduce', value: 'reduce' },
  { name: 'Zip', value: 'zip' },
]

const { MLOption } = MLSelect;
 
const MatchRulesetModal: React.FC<Props> = (props) => {
  const { curationOptions, updateActiveStepDefinition } = useContext(CurationContext);

  const [entityTypeDefinition, setEntityTypeDefinition] = useState<Definition>(DEFAULT_ENTITY_DEFINITION)
  const [selectedProperty, setSelectedProperty] = useState<string | undefined>(undefined)
  const [propertyTypeErrorMessage, setPropertyTypeErrorMessage] = useState('');
  const [matchType, setMatchType] = useState('')
  const [matchTypeErrorMessage, setMatchTypeErrorMessage] = useState('');

  useEffect(() => {
    if (props.isVisible && curationOptions.entityDefinitionsArray.length > 0 && curationOptions.activeStep.entityName !== '') {
      let entityTypeDefinition: Definition = curationOptions.entityDefinitionsArray.find( entityDefinition => entityDefinition.name === curationOptions.activeStep.entityName) || DEFAULT_ENTITY_DEFINITION;
      setEntityTypeDefinition(entityTypeDefinition);
    }
  }, [props.isVisible]);

  const closeModal = () => {
    resetModal();
    props.toggleModal(false);
  }

  const resetModal = () => {
    setSelectedProperty(undefined);
    setMatchType('');
    setPropertyTypeErrorMessage('');
    setMatchTypeErrorMessage('');
  }

  const onSubmit = () => {
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
        let propertyName = selectedProperty || '';

        let matchRule: MatchRule = {
          entityPropertyPath: propertyName,
          matchType: matchType,
          options: {}
        }

        let matchRuleset: MatchRuleset = {
          name: propertyName,
          weight: 0,
          matchRules: [matchRule]
        }

        //check for duplicate
        let propertyRulesets = curationOptions.activeStep.stepDefinition['matchRulesets'].filter(matchRuleset => matchRuleset['name'] === propertyName)
        if (propertyRulesets.length > 0) {
          propertyRulesets.forEach( ruleset => {
            if (ruleset['matchRules'].length === 1 && ruleset['matchRules'][0].matchType === matchType) {
              propertyErrorMessage = 'A ruleset with these selections already exists';
            }
          });
        }

        if (propertyErrorMessage === '' && matchErrorMessage === '') {
          // TODO save step to backend
          let newStepDefinition: MatchingStep = curationOptions.activeStep.stepDefinition;
          newStepDefinition.matchRulesets.push(matchRuleset);
          updateActiveStepDefinition(newStepDefinition);
          props.toggleModal(false);
          resetModal();
        }
        break;

      default:
        break;
    }
    setMatchTypeErrorMessage(matchErrorMessage);
    setPropertyTypeErrorMessage(propertyErrorMessage);
  }

  const onPropertySelect = (value: string) => {
    setPropertyTypeErrorMessage('');
    setSelectedProperty(value);
  }

  const onMatchTypeSelect = (value: string) => {
    setMatchTypeErrorMessage('');
    setMatchType(value);  
  }

  const renderMatchOptions = MATCH_TYPE_OPTIONS.map((matchType, index) => {
    return <MLOption key={index} value={matchType.value}>{matchType.name}</MLOption>
  });

  const modalTitle = (
    <div>
      <div style={{ fontSize: '18px'}}>Add Match Ruleset for Single Property</div>
      <div className={styles.modalTitleLegend}>
        <div className={styles.legendText}><img className={styles.arrayImage} src={arrayIcon}/> Multiple</div>
        <div className={styles.legendText}><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> Structured Type</div>
      </div>
    </div>
  )

  const modalFooter = (
    <div>
      <MLButton
        aria-label={`confirm`}
        size="default"
        onClick={closeModal}
      >Cancel</MLButton>
      <MLButton
        aria-label={`confirm-`}
        type="primary"
        size="default"
        onClick={() => onSubmit()}
      >Save</MLButton>
    </div>
  )

  return (
    <Modal
      visible={props.isVisible}
      destroyOnClose={true}
      closable={true}
      maskClosable={false}
      title={modalTitle}
      footer={modalFooter}
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

      </Form>
    </Modal>
  )
}

export default MatchRulesetModal;