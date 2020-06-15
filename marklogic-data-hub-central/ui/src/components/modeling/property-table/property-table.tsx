import React, { useState, useEffect, useContext } from 'react';
import { MLButton, MLTable, MLTooltip } from '@marklogic/design-system';
import { faCircle, faCheck, faTrashAlt, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import scrollIntoView from 'scroll-into-view';
import styles from './property-table.module.scss';

import PropertyModal from '../property-modal/property-modal';
import { Definition, EntityDefinitionPayload, StructuredTypeOptions } from '../../../types/modeling-types';
import { ModelingContext } from '../../../util/modeling-context';
import { definitionsParser } from '../../../util/data-conversion';
import { ModelingTooltips } from '../../../config/tooltips.config';

type Props = {
  canReadEntityModel: boolean;
  canWriteEntityModel: boolean;
  entityName: string;
  definitions: any;
}

const PropertyTable: React.FC<Props> = (props) => {
  const { modelingOptions, toggleIsModified } = useContext(ModelingContext)
  const [showPropertyModal, toggleShowPropertyModal] = useState(false);
  const [structuredTypeOptions, setStructuredTypeOptions] = useState<StructuredTypeOptions>({ isStructured: false, name: '' });
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
      width: 200
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
        <MLTooltip title={ModelingTooltips.advancedSearch}>
          <span>Advanced Search</span>
        </MLTooltip>
      ),
      dataIndex: 'advancedSearch',
      width: 150,
      render: (text) => {
        return text && <FontAwesomeIcon className={styles.advancedSearchIcon} icon={faCheck} data-testid={'adv-srch-'+ text}/>
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
                  setStructuredTypeOptions({ isStructured: true, name: text })
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
      let propertyName = structuredTypeOptions.name.split(',')[0];
      let row = renderTableData.find(row => row.propertyName === propertyName)
      if (!row) {
        let structuredNames = structuredTypeOptions.name.split(',').slice(1);
        row = renderTableData.find(row => row.type === structuredNames[0])  
  
        if (row) {
          let childRow = row['children'].find( childRow => childRow.type === structuredNames[1] );
          setExpandedRows([row.key, childRow.key])
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
  
  // Covers both Entity Type and Structured Type
  const addPropertyToDefinition = (definitionName: string, propertyName: string, propertyOptions: any) => {
    
    let parseName = definitionName.split(',');
    let parseDefinitionName = parseName[parseName.length-1]
    let updatedDefinitions = {...definitions};
    let entityTypeDefinition = updatedDefinitions[parseDefinitionName];
    let newProperty = {};
    let parseType = propertyOptions.type.split(',');
    let multiple = propertyOptions.multiple === 'yes' ? true : false;

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

    if (propertyOptions.advancedSearch) {
      if (entityTypeDefinition.hasOwnProperty('wordLexicon')) {
        entityTypeDefinition['wordLexicon'].push(propertyName);
      } else {
        entityTypeDefinition['wordLexicon'] = [propertyName]
      }    
    }

    if (parseType[0] === 'relationship' && !multiple) {
      let externalEntity = modelingOptions.entityTypeNamesArray.find(entity => entity.name === parseType[1])
      newProperty = {
        $ref: externalEntity.entityTypeId,
      }

    } else if (parseType[0] === 'relationship' && multiple) {
      let externalEntity = modelingOptions.entityTypeNamesArray.find(entity => entity.name === parseType[1])
      newProperty = {
        datatype: 'array',
        items: {
          $ref: externalEntity.entityTypeId,
        }
      }

    } else if (parseType[0] === 'structured' && !multiple) {
      newProperty = {
        $ref: '#/definitions/'+ parseType[parseType.length-1],
      }

    } else if (parseType[0] === 'structured' && multiple) {
      newProperty = {
        datatype: 'array',
        items: {
          $ref: '#/definitions/'+ parseType[parseType.length-1],
        }
      }

    } else if (multiple) {
      newProperty = {
        datatype: 'array',
        items: {
          datatype: parseType[parseType.length-1],
          collation: "http://marklogic.com/collation/codepoint",
        }
      }
    }  else {
      newProperty = {
        datatype: parseType[parseType.length-1],
        collation: "http://marklogic.com/collation/codepoint"
      }
    }

    entityTypeDefinition['properties'][propertyName] = newProperty;
    updatedDefinitions[parseDefinitionName] = entityTypeDefinition;
    updateEntityDefinitionsAndRenderTable(updatedDefinitions);
    setNewRowKey(props.entityName + propertyName);
    toggleIsModified(true);
  }

  const parseDefinitionsToTable = (entityDefinitionsArray: any[]) => {
    let entityTypeDefinition = entityDefinitionsArray.find( definition => definition.name === props.entityName);

    return entityTypeDefinition?.properties.map( (property, index) => {
      let propertyRow: any = {};

      if (property.datatype === 'structured') {

        const parseStructuredProperty = (entityDefinitionsArray, property, parentDefinitionName) => {
          let parsedRef = property.ref.split('/');
          if (parsedRef.length > 0 && parsedRef[1] === 'definitions') {
            let structuredType = entityDefinitionsArray.find( entity => entity.name === parsedRef[2]);
            let structuredTypeProperties = structuredType?.properties.map((structProperty, structIndex) => {
              if (structProperty.datatype === 'structured') {
                // Recursion to handle nested structured types
                let parentDefinitionName = structuredType.name;
                return parseStructuredProperty(entityDefinitionsArray, structProperty, parentDefinitionName);
              } else {
                // TODO add functionality to sort, facet, delete
                return {
                  key: property.name + index + structIndex,
                  propertyName: structProperty.name,
                  type: structProperty.datatype === 'structured' ? structProperty.ref.split('/').pop() : structProperty.datatype,
                  identifier: entityTypeDefinition?.primaryKey === structProperty.name ? structProperty.name : '',
                  multiple: structProperty.multiple ? structProperty.name: '',
                  advancedSearch: structuredType?.wordLexicon.includes(structProperty.name) ? structProperty.name : '',
                  pii: structuredType?.pii.includes(structProperty.name) ? structProperty.name : ''
                }
              }
            });
  
            return {
              key: property.name + index,
              propertyName: property.name,
              multiple: property.multiple ? property.name: '',
              type: property.ref.split('/').pop(),
              pii: entityTypeDefinition?.pii.includes(property.name) ? property.name : '',
              children: structuredTypeProperties,
              add: parentDefinitionName ? property.name + ',' + parentDefinitionName + ',' + structuredType.name : property.name + ',' + structuredType.name
            }
          }
        }
        propertyRow = parseStructuredProperty(entityDefinitionsArray, property, '');

      } else {
        // TODO add functionality to sort, facet, delete
        propertyRow = {
          key: property.name + index,
          propertyName: property.name,
          type: property.datatype,
          identifier: entityTypeDefinition?.primaryKey === property.name ? property.name : '',
          multiple: property.multiple ? property.name : '',
          advancedSearch: entityTypeDefinition?.wordLexicon.includes(property.name) ? property.name : '',
          pii: entityTypeDefinition?.pii.includes(property.name) ? property.name : '',
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
        setStructuredTypeOptions({ isStructured: false, name: '' })
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
        structuredTypeOptions={structuredTypeOptions}
        toggleModal={toggleShowPropertyModal}
        addPropertyToDefinition={addPropertyToDefinition}
        addStructuredTypeToDefinition={addStructuredTypeToDefinition}
      />
      <MLTable
        rowClassName={(record) => props.entityName + record.propertyName}
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