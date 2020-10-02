import React, { useState, useEffect, useContext } from 'react';
import { Modal, Form } from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { MLButton, MLTooltip, MLSelect } from '@marklogic/design-system';
import styles from './ruleset-single-modal.module.scss'
import arrayIcon from '../../../../assets/icon_array.png';

import EntityPropertyTreeSelect from '../../../entity-property-tree-select/entity-property-tree-select';

import { CurationContext } from '../../../../util/curation-context';
import { MatchRule } from '../../../../types/curation-types';
import { Definition } from '../../../../types/modeling-types';

type Props = {
  isVisible: boolean;
  toggleModal: (isVisible: boolean) => void;
  saveMatchRuleset: (matchRule: MatchRule) => void;
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
  const { curationOptions } = useContext(CurationContext);
  const [entityTypeDefinition, setEntityTypeDefinition] = useState<Definition>(DEFAULT_ENTITY_DEFINITION)
  const [selectedProperty, setSelectedProperty] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (props.isVisible && curationOptions.entityDefinitionsArray.length > 0 && curationOptions.activeStep.entityName !== '') {
      let entityTypeDefinition: Definition = curationOptions.entityDefinitionsArray.find( entityDefinition => entityDefinition.name === curationOptions.activeStep.entityName) || DEFAULT_ENTITY_DEFINITION;
      setEntityTypeDefinition(entityTypeDefinition);
      setSelectedProperty(undefined)
    }
  }, [props.isVisible]);

  const closeModal = () => {
    props.toggleModal(false)
  }

  const onSubmit = () => {
    // TODO save ruleset
    // props.saveMatchRuleset(matchRule)
  }

  const onPropertySelect = (value: string) => {
    setSelectedProperty(value);
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
      width={600}
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
        >
          <MLSelect 
            className={styles.matchTypeSelect} 
            size="default" 
            placeholder="Select match type"
          >
            {renderMatchOptions}
          </MLSelect>
        </Form.Item>

      </Form>
    </Modal>
  )
}

export default MatchRulesetModal;