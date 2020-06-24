import React, { useState, useEffect, useContext } from 'react';
import { MLButton, MLTable, MLTooltip } from '@marklogic/design-system';
import { faCircle, faCheck, faTrashAlt, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import scrollIntoView from 'scroll-into-view';
import styles from './property-table.module.scss';

import PropertyModal from '../property-modal/property-modal';

import { 
  Definition,
  EntityDefinitionPayload,
  StructuredTypeOptions,
  EditPropertyOptions,
  PropertyOptions,
  PropertyType
} from '../../../types/modeling-types';

import { ModelingContext } from '../../../util/modeling-context';
import { definitionsParser } from '../../../util/data-conversion';
import { ModelingTooltips } from '../../../config/tooltips.config';

type Props = {
  canReadEntityModel: boolean;
  canWriteEntityModel: boolean;
  entityName: string;
  definitions: any;
}

const DEFAULT_ENTITY_DEFINITION: Definition = {
  name: '',
  primaryKey: '',
  elementRangeIndex: [],
  pii: [],
  rangeIndex: [],
  required: [],
  wordLexicon: [],
  properties: []
};

const DEFAULT_STRUCTURED_TYPE_OPTIONS: StructuredTypeOptions = { 
  isStructured: false,
  name: '',
  propertyName: ''
}

const DEFAULT_SELECTED_PROPERTY_OPTIONS: PropertyOptions = {
  propertyType: PropertyType.Basic,
  type: '',
  identifier: '',
  multiple: '',
  pii: '',
  sort: false,
  facet: false,
  wildcard: false
}

const DEFAULT_EDIT_PROPERTY_OPTIONS: EditPropertyOptions = {
  name: '',
  isEdit: false,
  propertyOptions: DEFAULT_SELECTED_PROPERTY_OPTIONS
}

const PropertyTable: React.FC<Props> = (props) => {
  const { modelingOptions, toggleIsModified } = useContext(ModelingContext)
  const [showPropertyModal, toggleShowPropertyModal] = useState(false);

  const [editPropertyOptions, setEditPropertyOptions] = useState<EditPropertyOptions>(DEFAULT_EDIT_PROPERTY_OPTIONS);

  const [structuredTypeOptions, setStructuredTypeOptions] = useState<StructuredTypeOptions>(DEFAULT_STRUCTURED_TYPE_OPTIONS);
  const [definitions, setDefinitions] = useState<any>({});
  const [entityDefinitionsArray, setEntityDefinitionsArray] = useState<Definition[]>([]);

  const [headerColumns, setHeaderColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [newRowKey, setNewRowKey] = useState('');

  useEffect(() => {
    updateEntityDefinitionsAndRenderTable(props.definitions);
  }, []);

  useEffect(() => {
    if (newRowKey) {
      let element = document.querySelector(`.${newRowKey}`)
      if (element) {
        scrollIntoView(element);
      }
    }
  }, [newRowKey]);

  const columns = [
    {
      title: 'Property Name',
      dataIndex: 'propertyName',
      width: 200,
      render: (text, record) => {
        let renderText = text;

        if (props.canWriteEntityModel && props.canReadEntityModel) {

          renderText = <span 
            data-testid={text + '-span'} 
            className={styles.link}
            onClick={() => {
              editPropertyShowModal(text, record);
            }}>
          {text}</span>
        }

        return renderText
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 125
    },
    {
      title: (
        <MLTooltip title={ModelingTooltips.identifier}>
          <span>Identifier</span>
        </MLTooltip>
      ),
      dataIndex: 'identifier',
      width: 100,
      render: text => {
        return text && <FontAwesomeIcon className={styles.identifierIcon} icon={faCircle} data-testid={'identifier-'+ text}/>
      }
    },
    {
      title: (
        <MLTooltip title={ModelingTooltips.multiple}>
          <span>Multiple</span>
        </MLTooltip>
      ),
      dataIndex: 'multiple',
      width: 100,
      render: text => {
        return text && <FontAwesomeIcon className={styles.multipleIcon} icon={faCheck} data-testid={'multiple-'+ text}/>
      }
    },
    {
      title: (
        <MLTooltip title={ModelingTooltips.sort}>
          <span>Sort</span>
        </MLTooltip>
      ),
      dataIndex: 'sort',
      width: 75,
      render: text => {
        return text && <FontAwesomeIcon className={styles.icon} icon={faCheck} data-testid={'sort-'+ text}/>
      }
    },
    {
      title: (
        <MLTooltip title={ModelingTooltips.facet}>
          <span>Facet</span>
        </MLTooltip>
      ),
      dataIndex: 'facet',
      width: 100,
      render: text => {
        return text && <FontAwesomeIcon className={styles.icon} icon={faCheck} data-testid={'facet-'+ text}/>
      }
    },
    {
      title: (
        <MLTooltip title={ModelingTooltips.wildcard}>
          <span>Wildcard Search</span>
        </MLTooltip>
      ),
      dataIndex: 'wildcard',
      width: 150,
      render: (text) => {
        return text && <FontAwesomeIcon className={styles.wildcardIcon} icon={faCheck} data-testid={'wildcard-'+ text}/>
      }
    },
    {
      title: (
        <MLTooltip title={ModelingTooltips.pii}>
          <span>PII</span>
        </MLTooltip>
      ),
      dataIndex: 'pii',
      width: 75,
      render: text => {
        return text && <FontAwesomeIcon className={styles.icon} icon={faCheck} data-testid={'pii-'+ text}/>
      }
    },
    {
      title: 'Delete',
      dataIndex: 'delete',
      width: 75,
      render: text => {
        return <FontAwesomeIcon className={!props.canWriteEntityModel && props.canReadEntityModel ? styles.iconTrashReadOnly : styles.iconTrash} icon={faTrashAlt} size="2x"
        onClick={(event) => {
          if (!props.canWriteEntityModel && props.canReadEntityModel) {
            return event.preventDefault()
          } else {
            return '' //TODO - Functionality for Delete Icon can be added here
          }
        }}/>
      }
    },
    {
      title: 'Add',
      dataIndex: 'add',
      width: 75,
      render: text => {
        let textParse = text && text.split(',');
        let structuredTypeName = Array.isArray(textParse) ? textParse[textParse.length-1] : text
        return ( text && 
          <MLTooltip title={ModelingTooltips.addStructuredProperty}>
            <FontAwesomeIcon 
              data-testid={'add-struct-'+ structuredTypeName}
              className={!props.canWriteEntityModel && props.canReadEntityModel ? styles.addIconReadOnly : styles.addIcon} 
              icon={faPlusSquare} 
              onClick={(event) => {
                if (!props.canWriteEntityModel && props.canReadEntityModel) {
                  return event.preventDefault()
                } else {
                  setStructuredTypeOptions({
                    isStructured: true,
                    name: text,
                    propertyName: ''
                  });
                  setEditPropertyOptions({ ...editPropertyOptions, isEdit: false })
                  toggleShowPropertyModal(true);
                }
              }}
            />
          </MLTooltip>
        )
      }
    }
  ];

  const updateEntityDefinitionsAndRenderTable = (definitions: Definition) => {
    let entityDefinitionsArray = definitionsParser(definitions);
    let renderTableData = parseDefinitionsToTable(entityDefinitionsArray);

    if (entityDefinitionsArray.length === 1) {
      setHeaderColumns(columns.slice(0, 8));
    } else if (entityDefinitionsArray.length > 1) {
      setHeaderColumns(columns);
    }
    // Expand structured type
    if (structuredTypeOptions.isStructured) {
      let row = renderTableData.find(row => row.propertyName === structuredTypeOptions.propertyName)
      if (!row) {
        let structuredNames = structuredTypeOptions.name.split(',').slice(1);
        row = renderTableData.find(row => row.type === structuredNames[0])  
        if (row) {
          let childRow = row['children'].find( childRow => childRow.type === structuredNames[1] );
          if (childRow && childRow.hasOwnProperty('key')) {
            setExpandedRows([row.key, childRow.key])
          } else {
            setExpandedRows([row.key])
          }
        }
       
      } else {
        setExpandedRows([row.key]);
      }
    }

    setDefinitions(definitions);
    setEntityDefinitionsArray(entityDefinitionsArray);
    setTableData(renderTableData);
  }

  const addStructuredTypeToDefinition = (structuredTypeName: string) => {
    let newStructuredType: EntityDefinitionPayload = {
      [structuredTypeName] : {
        primaryKey: '',
        elementRangeIndex: [],
        pii: [],
        rangeIndex: [],
        required: [],
        wordLexicon: [],
        properties: {}
      }
    }
    let newDefinitions = {...definitions, ...newStructuredType }
    updateEntityDefinitionsAndRenderTable(newDefinitions);
  }

  const createPropertyDefinitionPayload = (propertyOptions: PropertyOptions) => {
    let parseType = propertyOptions.type.split(',');
    let multiple = propertyOptions.multiple === 'yes' ? true : false;

    if (propertyOptions.propertyType === PropertyType.Relationship && !multiple) {
      let externalEntity = modelingOptions.entityTypeNamesArray.find(entity => entity.name === parseType[1])
      return {
        $ref: externalEntity.entityTypeId,
      }

    } else if (propertyOptions.propertyType === PropertyType.Relationship && multiple) {
      let externalEntity = modelingOptions.entityTypeNamesArray.find(entity => entity.name === parseType[1])
      return {
        datatype: 'array',
        items: {
          $ref: externalEntity.entityTypeId,
        }
      }

    } else if (propertyOptions.propertyType === PropertyType.Structured && !multiple) {
      return {
        $ref: '#/definitions/'+ parseType[parseType.length-1],
      }

    } else if (propertyOptions.propertyType === PropertyType.Structured && multiple) {
      return {
        datatype: 'array',
        items: {
          $ref: '#/definitions/'+ parseType[parseType.length-1],
        }
      }

    } else if (propertyOptions.propertyType === PropertyType.Basic && multiple) {
      return {
        datatype: 'array',
        items: {
          datatype: parseType[parseType.length-1],
          collation: "http://marklogic.com/collation/codepoint",
        }
      }
    } else if (propertyOptions.propertyType === PropertyType.Basic && !multiple) {
      return {
        datatype: parseType[parseType.length-1],
        collation: "http://marklogic.com/collation/codepoint"
      }
    }
  }
  
  // Covers both Entity Type and Structured Type
  const addPropertyToDefinition = (definitionName: string, propertyName: string, propertyOptions: PropertyOptions) => {
    let parseName = definitionName.split(',');
    let parseDefinitionName = parseName[parseName.length-1]
    let updatedDefinitions = {...definitions};
    let entityTypeDefinition = updatedDefinitions[parseDefinitionName];
    let newProperty = createPropertyDefinitionPayload(propertyOptions);
    let newRowKey = props.entityName + '-' + propertyName;

    if (propertyOptions.identifier === 'yes') {
      entityTypeDefinition['primaryKey'] = propertyName
    }

    if (propertyOptions.pii === 'yes') {
      if (entityTypeDefinition.hasOwnProperty('pii')) {
        entityTypeDefinition['pii'].push(propertyName);
      } else {
        entityTypeDefinition['pii'] = [propertyName]
      }
    }

    if (propertyOptions.wildcard) {
      if (entityTypeDefinition.hasOwnProperty('wordLexicon')) {
        entityTypeDefinition['wordLexicon'].push(propertyName);
      } else {
        entityTypeDefinition['wordLexicon'] = [propertyName]
      }    
    }

    if (structuredTypeOptions.isStructured) {
      newRowKey = props.entityName + '-' + structuredTypeOptions.name.split(',').join('-');
    }

    entityTypeDefinition['properties'][propertyName] = newProperty;
    updatedDefinitions[parseDefinitionName] = entityTypeDefinition;
    updateEntityDefinitionsAndRenderTable(updatedDefinitions);
    setNewRowKey(newRowKey);
    toggleIsModified(true);
  }

  const editPropertyShowModal = (text: string, record: any) => {
    let parseKey = record.key.split(',');
    let propertyType = PropertyType.Basic;
    let newStructuredTypes: StructuredTypeOptions = DEFAULT_STRUCTURED_TYPE_OPTIONS;
    let relationshipType = modelingOptions.entityTypeNamesArray.find( entity => entity.name === record.type);

    if (record.hasOwnProperty('structured')) {
      if (record.hasOwnProperty('add')) {
        let parseAddRecord = record.add.split(',');
        parseAddRecord.shift();

        propertyType = PropertyType.Structured;
        newStructuredTypes.isStructured = true;
        newStructuredTypes.name = parseAddRecord[0];
        newStructuredTypes.propertyName = record.propertyName;

      } else if (record.type === record.structured) {
        propertyType = PropertyType.Structured;
        newStructuredTypes.isStructured = true;
        newStructuredTypes.name = record.structured;
        newStructuredTypes.propertyName = record.propertyName;
      } else {
        propertyType = PropertyType.Basic;
        newStructuredTypes.isStructured = true;
        newStructuredTypes.name = record.structured;
        newStructuredTypes.propertyName = parseKey[0];
      }

    } else if (relationshipType) {
      propertyType = PropertyType.Relationship
      newStructuredTypes.isStructured = false;
      newStructuredTypes.name = '';
      newStructuredTypes.propertyName = '';
    } else {
      newStructuredTypes.isStructured = false;
      newStructuredTypes.name = '';
      newStructuredTypes.propertyName = '';    
    }

    const propertyOptions: PropertyOptions = {
      propertyType: propertyType,
      type: record.type,
      identifier: record.identifier ? 'yes' : '',
      multiple: record.multiple ? 'yes' : '',
      pii: record.pii ? 'yes' : '',
      sort: record.sort ? true : false,
      facet: record.facet ? true : false,
      wildcard: record.wildcard ? true : false
    }

    const editPropertyOptions: EditPropertyOptions = {
      name: text,
      isEdit: true,
      propertyOptions
    }
    setStructuredTypeOptions(newStructuredTypes);
    setEditPropertyOptions(editPropertyOptions);
    toggleShowPropertyModal(true);
  }

  const editPropertyUpdateDefinition = (definitionName: string, propertyName: string, editPropertyOptions: EditPropertyOptions) => {
    let parseName = definitionName.split(',');
    let parseDefinitionName = parseName[parseName.length-1]
    let updatedDefinitions = {...definitions};
    let entityTypeDefinition = updatedDefinitions[parseDefinitionName];
    let newProperty = createPropertyDefinitionPayload(editPropertyOptions.propertyOptions);

    entityTypeDefinition['properties'][propertyName] = newProperty;

    if (editPropertyOptions.propertyOptions.identifier === 'yes') {
      entityTypeDefinition.primaryKey = editPropertyOptions.name;
    } else if (entityTypeDefinition.hasOwnProperty('primaryKey') && entityTypeDefinition.primaryKey === propertyName) {
      entityTypeDefinition.primaryKey = '';
    }

    if (editPropertyOptions.propertyOptions.pii === 'yes') {
      let index = entityTypeDefinition.pii?.indexOf(propertyName);
      if (index > -1) {
        entityTypeDefinition.pii[index] = editPropertyOptions.name;
      } else {
        if (entityTypeDefinition.hasOwnProperty('pii')) {
          entityTypeDefinition.pii.push(editPropertyOptions.name);
        } else {
          entityTypeDefinition.pii = [editPropertyOptions.name];
        }
      }
    } else {
      let index = entityTypeDefinition.pii?.indexOf(propertyName);
      if (index > -1) {
        entityTypeDefinition.pii.splice(index, 1);
      }
    }

    if (editPropertyOptions.propertyOptions.wildcard) {
      let index = entityTypeDefinition.wordLexicon?.indexOf(propertyName);
      if (index > -1) {
        entityTypeDefinition.wordLexicon[index] = editPropertyOptions.name;
      } else {
        if (entityTypeDefinition.hasOwnProperty('wordLexicon')) {
          entityTypeDefinition.wordLexicon.push(editPropertyOptions.name);
        } else {
          entityTypeDefinition.wordLexicon = [editPropertyOptions.name];
        }      }
    } else {
      let index = entityTypeDefinition.wordLexicon?.indexOf(propertyName);
      if (index > -1) {
        entityTypeDefinition.wordLexicon.splice(index, 1);
      }
    }

    if (propertyName !== editPropertyOptions.name) {
      let reMapDefinition = Object.keys(entityTypeDefinition['properties']).map((key) => {
        const newKey = key === propertyName ? editPropertyOptions.name : key;
        const value = key === propertyName ? newProperty : entityTypeDefinition['properties'][key]
        return { [newKey] : value };
      });
      entityTypeDefinition['properties'] = reMapDefinition.reduce((a, b) => Object.assign({}, a, b))
    }

    updatedDefinitions[parseDefinitionName] = entityTypeDefinition;
    updateEntityDefinitionsAndRenderTable(updatedDefinitions);
  }

  const parseDefinitionsToTable = (entityDefinitionsArray: Definition[]) => {
    let entityTypeDefinition: Definition = entityDefinitionsArray.find( definition => definition.name === props.entityName) || DEFAULT_ENTITY_DEFINITION;

    return entityTypeDefinition?.properties.map( (property, index) => {
      let propertyRow: any = {};
      let counter = 0;

      if (property.datatype === 'structured') {
        const parseStructuredProperty = (entityDefinitionsArray, property, parentDefinitionName) => {
          let parsedRef = property.ref.split('/');
          if (parsedRef.length > 0 && parsedRef[1] === 'definitions') {
            let structuredType = entityDefinitionsArray.find( entity => entity.name === parsedRef[2]);
            let structuredTypeProperties = structuredType?.properties.map((structProperty, structIndex) => {
              if (structProperty.datatype === 'structured') {
                // Recursion to handle nested structured types
                counter++;
                let parentDefinitionName = structuredType.name;
                return parseStructuredProperty(entityDefinitionsArray, structProperty, parentDefinitionName);
              } else {
                // TODO add functionality to sort, facet, delete
                return {
                  key: property.name + ',' + index + structIndex + counter,
                  structured: structuredType.name,
                  propertyName: structProperty.name,
                  type: structProperty.datatype === 'structured' ? structProperty.ref.split('/').pop() : structProperty.datatype,
                  identifier: entityTypeDefinition?.primaryKey === structProperty.name ? structProperty.name : '',
                  multiple: structProperty.multiple ? structProperty.name: '',
                  wildcard: structuredType?.wordLexicon.some(value => value ===  structProperty.name) ? structProperty.name : '',
                  pii: structuredType?.pii.some(value => value ===  structProperty.name) ? structProperty.name : ''
                }
              }
            });

            let piiValue = entityTypeDefinition?.pii.some(value => value ===  property.name) ? property.name : '';
            let addValue = property.name + ',' + structuredType.name;
          
            if (parentDefinitionName) {
              let parentTypeDefinition: Definition = entityDefinitionsArray.find( definition => definition.name === parentDefinitionName) || DEFAULT_ENTITY_DEFINITION;
              piiValue = parentTypeDefinition?.pii.some(value => value ===  property.name) ? property.name : '';
              addValue = property.name + ',' + parentDefinitionName + ',' + structuredType.name;
            }

            return {
              key: property.name + ',' + index + counter,
              structured: structuredType.name,
              propertyName: property.name,
              multiple: property.multiple ? property.name: '',
              type: property.ref.split('/').pop(),
              pii: piiValue,
              children: structuredTypeProperties,
              add: addValue
            }
          }
        }
        propertyRow = parseStructuredProperty(entityDefinitionsArray, property, '');
        counter++;
      } else {
        // TODO add functionality to sort, facet, delete
        propertyRow = {
          key: property.name + ',' + index,
          propertyName: property.name,
          type: property.datatype,
          identifier: entityTypeDefinition?.primaryKey === property.name ? property.name : '',
          multiple: property.multiple ? property.name : '',
          wildcard: entityTypeDefinition?.wordLexicon.some( value => value === property.name) ? property.name : '',
          pii: entityTypeDefinition?.pii.some(value => value === property.name) ? property.name : '',
          add: ''
        }
      }
      return propertyRow;
    });
  }

  const onExpand = (expanded, record) => {
    let newExpandedRows =  [...expandedRows]
    if (expanded) {
      if ( newExpandedRows.indexOf(record.key) === -1) {
        newExpandedRows.push(record.key);
      }
    } else {
      newExpandedRows = newExpandedRows.filter(row => row !== record.key);
    }
    setExpandedRows(newExpandedRows);
  }

  const addPropertyButton = <MLButton 
      type="primary"
      aria-label={props.entityName +'-add-property'}
      disabled={!props.canWriteEntityModel}
      className={!props.canWriteEntityModel && styles.disabledButton}
      onClick={()=> {
        toggleShowPropertyModal(true);
        setEditPropertyOptions({...editPropertyOptions, isEdit: false });
        setStructuredTypeOptions({ 
          ...structuredTypeOptions,
          isStructured: false
        });
      }}
    >Add Property</MLButton>

  return (
    <div>
      <div className={styles.addButtonContainer}>
        { props.canWriteEntityModel ? 
          Object.keys(props.definitions[props.entityName]['properties']).length === 0 ? (
            <MLTooltip title={ModelingTooltips.addProperty}>
              <span>{addPropertyButton}</span>
            </MLTooltip>
         ) :
          addPropertyButton
        :  
        (
          <MLTooltip title={'Add Property: ' + ModelingTooltips.noWriteAccess}>
            <span>{addPropertyButton}</span>
          </MLTooltip>
        )
      }

      </div>
      <PropertyModal
        entityName={props.entityName}
        entityDefinitionsArray={entityDefinitionsArray}
        isVisible={showPropertyModal}
        editPropertyOptions={editPropertyOptions}
        structuredTypeOptions={structuredTypeOptions}
        toggleModal={toggleShowPropertyModal}
        addPropertyToDefinition={addPropertyToDefinition}
        addStructuredTypeToDefinition={addStructuredTypeToDefinition}
        editPropertyUpdateDefinition={editPropertyUpdateDefinition}
      />
      <MLTable
        rowClassName={(record) => {
          let propertyName = record.hasOwnProperty('add') && record.add !== '' ? record.add.split(',').join('-') : record.propertyName;
          return props.entityName + '-' + propertyName
        }}
        locale={{ emptyText: ' ' }}
        columns={headerColumns}
        dataSource={tableData}
        onExpand={onExpand}
        expandedRowKeys={expandedRows}
        pagination={false}
      />
    </div>
  );
}

export default PropertyTable; 