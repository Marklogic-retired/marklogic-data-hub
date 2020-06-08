import React, { useState, useEffect, useContext } from 'react';
import { Modal, Form, Input, Tooltip, Icon, Radio, Checkbox, Cascader } from 'antd';
import styles from './property-modal.module.scss';

import StructuredTypeModal from '../structured-type-modal/structured-type-modal';
import ConfirmationModal from '../../confirmation-modal/confirmation-modal';
import { ConfirmationType, StructuredTypeOptions } from '../../../types/modeling-types';
import { ModelingContext } from '../../../util/modeling-context';
import { 
  COMMON_PROPERTY_TYPES,
  MORE_STRING_TYPES,
  MORE_NUMBER_TYPES,
  MORE_DATE_TYPES,
  DROPDOWN_PLACEHOLDER 
} from '../../../config/modeling.config';
import { ModelingTooltips } from '../../../config/tooltips.config';

type Props = {
  entityName: any;
  entityDefinitionsArray: any[];
  isVisible: boolean;
  structuredTypeOptions: StructuredTypeOptions;
  toggleModal: (isVisible: boolean) => void;
  addPropertyToDefinition: (definitionName: string, propertyName: string, propertyOptions: any) => void;
  addStructuredTypeToDefinition: (structuredTypeName: string) => void;
};

const ALL_RADIO_DISPLAY_VALUES = [
  {
    label: 'Identifier',
    value: 'identifier',
    tooltip: ModelingTooltips.identifier
  },
  {
    label: 'Allow Multiple Values',
    value: 'multiple',
    tooltip: ModelingTooltips.multiple
  },
  {
    label: 'PII',
    value: 'pii',
    tooltip: ModelingTooltips.pii
  }
];

const ALL_CHECKBOX_DISPLAY_VALUES = [
  {
    label: 'Sort',
    value: 'sort',
    tooltip: ModelingTooltips.sort
  },
  {
    label: 'Facet',
    value: 'facet',
    tooltip: ModelingTooltips.multiple
  },
  {
    label: 'Advanced Search',
    value: 'advancedSearch',
    tooltip: ModelingTooltips.advancedSearch
  }
];

const DEFAULT_STRUCTURED_DROPDOWN_OPTIONS = {
  label: 'Structured',
  value: 'structured',
  children: [
    {
      label: 'New Property Type',
      value: 'newPropertyType'
    }
  ]
}


const DEFAULT_DROPDOWN_OPTIONS = [
  ...COMMON_PROPERTY_TYPES,
  DROPDOWN_PLACEHOLDER('1'),
  DEFAULT_STRUCTURED_DROPDOWN_OPTIONS,
  DROPDOWN_PLACEHOLDER('2'),
  MORE_STRING_TYPES,
  MORE_NUMBER_TYPES,
  MORE_DATE_TYPES
];

const DEFAULT_SELECTED_PROPERTY_OPTIONS = {
  type: '',
  identifier: '',
  multiple: '',
  pii: '',
  sort: false,
  facet: false,
  advancedSearch: false
}

const NAME_REGEX = new RegExp('^[A-Za-z][A-Za-z0-9_-]*$');

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const PropertyModal: React.FC<Props> = (props) => {
  const { modelingOptions } = useContext(ModelingContext);

  const [name, setName] = useState('');
  const [isNameDisabled, toggleIsNameDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [showStructuredTypeModal, toggleStructuredTypeModal] = useState(false);

  const [showIdentifierModal, toggleIdentifierModal] = useState(false);
  const [identifierModalBoldTextArray, setIdentifierModalBoldTextArray] = useState<string[]>([]);

  const [typeDisplayValue, setTypeDisplayValue] = useState<string[]>([]);
  const [typeErrorMessage, setTypeErrorMessage] = useState('');
  
  const [dropdownOptions, setDropdownOptions] = useState<any[]>(DEFAULT_DROPDOWN_OPTIONS);
  const [radioValues, setRadioValues] = useState<any[]>([]);
  const [showConfigurationOptions, toggleShowConfigurationOptions] = useState(false);

  const [selectedPropertyOptions, setSelectedPropertyOptions] = useState(DEFAULT_SELECTED_PROPERTY_OPTIONS);
  const [entityPropertyNamesArray, setEntityPropertyNamesArray] = useState<string[]>([]);

  useEffect(() => {
    if (props.isVisible){
      updateTypeDropdown();
      setName('');
      setErrorMessage('');
      setTypeDisplayValue([]);
      setRadioValues([]);
      toggleShowConfigurationOptions(false);
      setSelectedPropertyOptions(DEFAULT_SELECTED_PROPERTY_OPTIONS);
    }
  }, [props.isVisible]);

  const handleInputChange = (event) => {
    if (event.target.id === 'property-name') {
      if (event.target.value === '') {
        toggleIsNameDisabled(true);
      } else {
        toggleIsNameDisabled(false);
        setErrorMessage('');
      }
      setName(event.target.value);
    }
  }

  const onPropertyTypeChange = (value, selectedOptions) => {
    if (value.length) {
      switch(value[0]) {
        case 'relationship':
          setRadioValues([ALL_RADIO_DISPLAY_VALUES[1]]);
          toggleShowConfigurationOptions(false);
          break;
        case 'structured':
          if (value[1] === 'newPropertyType') {
            toggleStructuredTypeModal(true);
          } else {
            setRadioValues(ALL_RADIO_DISPLAY_VALUES.slice(1,3));
            toggleShowConfigurationOptions(false);
          }
          break;
        default:
          if (props.structuredTypeOptions.isStructured){
            setRadioValues(ALL_RADIO_DISPLAY_VALUES.slice(1,3));
          } else {
            setRadioValues(ALL_RADIO_DISPLAY_VALUES);
          }
          toggleShowConfigurationOptions(true);
          break;
      }
      
      setTypeDisplayValue(value);
      setSelectedPropertyOptions({ ...selectedPropertyOptions, type: value.join(',') });

    } else {
      setTypeDisplayValue([]);
      setRadioValues([]);
      toggleShowConfigurationOptions(false);
      setSelectedPropertyOptions({ ...selectedPropertyOptions, type: '' });
    }
  }

  const onOk = (event) => {
    event.preventDefault();
    if (!NAME_REGEX.test(name)) {
      setErrorMessage(ModelingTooltips.nameRegex)
    } else {
      if (entityPropertyNamesArray.includes(name)){
        setErrorMessage(`A property already exists with a name of ${name}`)
      } else if (selectedPropertyOptions.type === '') {
        setTypeErrorMessage('Type is required');
      } else {
        let definitionName = props.structuredTypeOptions.isStructured ? props.structuredTypeOptions.name : props.entityName;
        setErrorMessage('');
        setTypeErrorMessage('');
        props.addPropertyToDefinition(definitionName, name, selectedPropertyOptions);
        props.toggleModal(false)
      }
    }
  };

  const onCancel = () => {
    setRadioValues([]);
    toggleShowConfigurationOptions(false);
    setSelectedPropertyOptions(DEFAULT_SELECTED_PROPERTY_OPTIONS);
    props.toggleModal(false)
  };

  const updateIdentifier = () => {
    setSelectedPropertyOptions({ ...selectedPropertyOptions, identifier: 'yes' });
    setIdentifierModalBoldTextArray([]);
    toggleIdentifierModal(false);
  }

  const addStructuredType = (name: string) => {
    let newStructuredDefinitionObject = {
      name: name,
      primaryKey: '',
      elementRangeIndex: [],
      pii: [],
      rangeIndex: [],
      required: [],
      wordLexicon: [],
      properties: []
    }

    let structuredDefinitions = props.entityDefinitionsArray.filter( entity => entity.name !== props.entityName);
    structuredDefinitions.push(newStructuredDefinitionObject);
    let structuredDropdown = createStructuredDropdown(structuredDefinitions);

    if (modelingOptions.entityTypeNamesArray.length > 1 && structuredDefinitions.length > 0) {
      let relationshipDropdown = createRelationshipDropdown();

      setDropdownOptions([
        ...COMMON_PROPERTY_TYPES,
        DROPDOWN_PLACEHOLDER('1'),
        structuredDropdown,
        relationshipDropdown,
        DROPDOWN_PLACEHOLDER('2'),
        MORE_STRING_TYPES,
        MORE_NUMBER_TYPES,
        MORE_DATE_TYPES
      ]);

    } else if (modelingOptions.entityTypeNamesArray.length <= 1 && structuredDefinitions.length > 0) {
      setDropdownOptions([
        ...COMMON_PROPERTY_TYPES,
        DROPDOWN_PLACEHOLDER('1'),
        structuredDropdown,
        DROPDOWN_PLACEHOLDER('2'),
        MORE_STRING_TYPES,
        MORE_NUMBER_TYPES,
        MORE_DATE_TYPES
      ]);
    }

    props.addStructuredTypeToDefinition(name);
    setTypeDisplayValue(['structured', name]);
    setSelectedPropertyOptions({ ...selectedPropertyOptions, type: 'structured,'+ name });
    setRadioValues(ALL_RADIO_DISPLAY_VALUES.slice(1,3));
    toggleShowConfigurationOptions(false);
  }

  const updateTypeDropdown = () => {
    let entityDefinition = props.entityDefinitionsArray.find( entity => entity.name === props.entityName);
    let structuredDefinitions = props.entityDefinitionsArray.filter( entity => entity.name !== props.entityName);
    let propertyNamesArray = entityDefinition['properties'].map( property => property.name);

    if (modelingOptions.entityTypeNamesArray.length <= 1 && structuredDefinitions.length === 0) {
      setDropdownOptions(DEFAULT_DROPDOWN_OPTIONS);

    } else if ( modelingOptions.entityTypeNamesArray.length > 1 && structuredDefinitions.length === 0 ) {
      let relationshipDropdown = createRelationshipDropdown();

      setDropdownOptions([
        ...COMMON_PROPERTY_TYPES,
        DROPDOWN_PLACEHOLDER('1'),
        DEFAULT_STRUCTURED_DROPDOWN_OPTIONS,
        relationshipDropdown,
        DROPDOWN_PLACEHOLDER('2'),
        MORE_STRING_TYPES,
        MORE_NUMBER_TYPES,
        MORE_DATE_TYPES
      ]);

    } else if (modelingOptions.entityTypeNamesArray.length > 1 && structuredDefinitions.length > 0) {
      let structuredDropdown = createStructuredDropdown(structuredDefinitions);
      let relationshipDropdown = createRelationshipDropdown();

      setDropdownOptions([
        ...COMMON_PROPERTY_TYPES,
        DROPDOWN_PLACEHOLDER('1'),
        structuredDropdown,
        relationshipDropdown,
        DROPDOWN_PLACEHOLDER('2'),
        MORE_STRING_TYPES,
        MORE_NUMBER_TYPES,
        MORE_DATE_TYPES
      ]);

    } else if (modelingOptions.entityTypeNamesArray.length <= 1 && structuredDefinitions.length > 0) {
      let structuredDropdown = createStructuredDropdown(structuredDefinitions);

      setDropdownOptions([
        ...COMMON_PROPERTY_TYPES,
        DROPDOWN_PLACEHOLDER('1'),
        structuredDropdown,
        DROPDOWN_PLACEHOLDER('2'),
        MORE_STRING_TYPES,
        MORE_NUMBER_TYPES,
        MORE_DATE_TYPES
      ]);
    }
    setEntityPropertyNamesArray(propertyNamesArray);
  }

  const createRelationshipDropdown = () => {
    let entityTypes = modelingOptions.entityTypeNamesArray
      .sort((a, b) => a.name.localeCompare(b.name))
      .map( entity => { return { label: entity.name, value: entity.name } });

    return {
      label: 'Relationship',
      value: 'relationship',
      children: entityTypes
    }
  }

  const createStructuredDropdown = (structuredDefinitions) => {
    let structuredTypes = structuredDefinitions
      .sort((a, b) => a.name.localeCompare(b.name))
      .map( definition => { return { label: definition.name, value: definition.name }});

    return { 
      ...DEFAULT_STRUCTURED_DROPDOWN_OPTIONS,
      children: [...DEFAULT_STRUCTURED_DROPDOWN_OPTIONS['children'], ...structuredTypes]
    }
  }

  const onRadioChange = (event, radioName) => {
    if (radioName === 'identifier' && event.target.value === 'yes') {
      let entityDefinition = props.entityDefinitionsArray.find( entity => entity.name === props.entityName);
      let primaryKey = entityDefinition['primaryKey'];

      if (primaryKey) {
        setIdentifierModalBoldTextArray([primaryKey, name]);
        toggleIdentifierModal(true);
      } else {
        setSelectedPropertyOptions({ ...selectedPropertyOptions, [radioName]: event.target.value})
      }

    } else {
      setSelectedPropertyOptions({ ...selectedPropertyOptions, [radioName]: event.target.value})
    }
  }

  const onCheckboxChange = (event, checkboxName) => {
    setSelectedPropertyOptions({ ...selectedPropertyOptions, [checkboxName]: event.target.checked})
  }

  const renderRadios = radioValues.length > 0 && radioValues.map((radio, index) => {
    return (
      <Form.Item
        key={index}
        label={radio.label}
        labelAlign="left"
        className={styles.formItem} 
      >
        <Radio.Group
          onChange={(event) => onRadioChange(event, radio.value)} 
          value={selectedPropertyOptions[radio.value]}
        >
          <Radio aria-label={radio.value + '-yes'} value={'yes'}>Yes</Radio>
          <Radio aria-label={radio.value + '-no'} value={'no'}>No</Radio>
        </Radio.Group>
        <Tooltip title={radio.tooltip}>
          <Icon type="question-circle" className={styles.radioQuestionIcon} theme="filled" />
        </Tooltip>
      </Form.Item>
    )
  });

  const renderCheckboxes = ALL_CHECKBOX_DISPLAY_VALUES.map((checkbox, index) => {
    return (
      <Form.Item 
        key={index}
        className={styles.formItemCheckbox}
        label={" "}
        labelAlign="left"
        colon={false}
      >
        <Checkbox
          id={checkbox.value}
          disabled={checkbox.value === 'advancedSearch' ? false : true}
          checked={selectedPropertyOptions[checkbox.value]}
          onChange={(event) => onCheckboxChange(event, checkbox.value)}
        >{checkbox.label}</Checkbox>
        <Tooltip title={checkbox.tooltip}>
          <Icon type="question-circle" className={styles.checkboxQuestionIcon} theme="filled" />
        </Tooltip>
      </Form.Item>
    )
  });

  return (
    <Modal
      className={styles.modal}
      visible={props.isVisible} 
      closable={true}
      title={props.structuredTypeOptions.isStructured ? "Add Structured Type Property" : "Add Property"} 
      cancelText="Cancel"
      onCancel={() => onCancel()} 
      cancelButtonProps={{ id: 'property-modal-cancel'}}
      okText="Add"
      onOk={onOk}
      okButtonProps={{ id: 'property-modal-add', form:'property-form', htmlType: 'submit' }}
      maskClosable={false}
      width="600px"
      style={{ top: 30 }}
    >
      <Form
        {...layout}
        id='property-form'
        onSubmit={onOk}
      >
        <Form.Item
          className={styles.formItemEntityType}
          label={<span>Entity Type:</span>}
          colon={false}
          labelAlign="left"
        >
          <span>{props.entityName}</span>
        </Form.Item>

        { props.structuredTypeOptions.isStructured && (
          <Form.Item
            className={styles.formItemEntityType}
            label={<span>Structured Type:</span>}
            colon={false}
            labelAlign="left"
          >
            <span id="structured-label">{props.structuredTypeOptions.name.split(',').join('.')}</span>
          </Form.Item>
        )}

        <Form.Item
          className={styles.formItem}
          label={<span>
            Name:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
              </span>}
          colon={false}
          labelAlign="left"
          validateStatus={errorMessage ? 'error' : ''}
          help={errorMessage}
        >
          <Input
            id="property-name"
            aria-label="input-name"
            placeholder="Enter the property name"
            className={styles.input}
            value={name}
            onChange={handleInputChange}
            onBlur={handleInputChange}
          />
          <Tooltip title={ModelingTooltips.nameRegex}>
            <Icon type="question-circle" className={styles.icon} theme="filled" />
          </Tooltip> 
        </Form.Item>

        <Form.Item 
          className={styles.formItem}
          label={<span>
            Type:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
              </span>}
          colon={false}
          labelAlign="left"
          wrapperCol={{ span: 14 }}
          validateStatus={typeErrorMessage ? 'error' : ''}
          help={typeErrorMessage}
        >
          <Cascader
            aria-label="type-dropdown"
            placeholder="Select the property type"
            options={dropdownOptions}
            displayRender={ label => { return label[label.length-1] } }
            onChange={onPropertyTypeChange}
            value={typeDisplayValue}
          />
        </Form.Item>

        {renderRadios}

        { showConfigurationOptions && (
            <>
              <h4>Configuration Options</h4>
              {renderCheckboxes}
            </>
          )
        }
      </Form>
      <StructuredTypeModal
        isVisible={showStructuredTypeModal}
        toggleModal={toggleStructuredTypeModal}
        entityDefinitionsArray={props.entityDefinitionsArray}
        updateStructuredTypesAndHideModal={addStructuredType}
      />
      <ConfirmationModal
        isVisible={showIdentifierModal}
        type={ConfirmationType.identifer}
        boldTextArray={identifierModalBoldTextArray}  
        toggleModal={toggleIdentifierModal}
        confirmAction={updateIdentifier}
      />
    </Modal>
  )
}

export default PropertyModal;