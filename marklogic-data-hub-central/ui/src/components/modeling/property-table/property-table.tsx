import React, { useState, useEffect, useContext } from 'react';
import { Table, Tooltip } from 'antd';
import { MLButton, MLTable } from '@marklogic/design-system';
import { faCircle, faCheck, faTrashAlt, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './property-table.module.scss';

import PropertyModal from '../property-modal/property-modal';
import { Definition } from '../../../types/modeling-types';
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
  const [definitions, setDefinitions] = useState<any>({});
  const [entityDefinitions, setEntityDefinitions] = useState<Definition[]>([]);
  const [headerColumns, setHeaderColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);


  useEffect(() => {
    console.log(props)
    let entityDefinitionsArray = definitionsParser(props.definitions);
    let renderTableData = parseDefinitionsToTable(entityDefinitionsArray);

    setDefinitions(props.definitions);
    setEntityDefinitions(entityDefinitionsArray);
    setTableData(renderTableData);
    
    if (entityDefinitionsArray.length === 1) {
      setHeaderColumns(columns.slice(0, 8));
    } else if (entityDefinitionsArray.length > 1) {
      setHeaderColumns(columns);
    }

  }, []);

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
        <Tooltip title={ModelingTooltips.identifier}>
          <span>Identifier</span>
        </Tooltip>
      ),
      dataIndex: 'identifier',
      width: 100,
      render: text => {
        return text && <FontAwesomeIcon className={styles.identifierIcon} icon={faCircle} data-testid={'identifier-'+ text}/>
      }
    },
    {
      title: (
        <Tooltip title={ModelingTooltips.multiple}>
          <span>Multiple</span>
        </Tooltip>
      ),
      dataIndex: 'multiple',
      width: 100,
      render: text => {
        return text && <FontAwesomeIcon className={styles.multipleIcon} icon={faCheck} data-testid={'multiple-'+ text}/>
      }
    },
    {
      title: (
        <Tooltip title={ModelingTooltips.sort}>
          <span>Sort</span>
        </Tooltip>
      ),
      dataIndex: 'sort',
      width: 75,
      render: text => {
        return text && <FontAwesomeIcon className={styles.icon} icon={faCheck} data-testid={'sort-'+ text}/>
      }
    },
    {
      title: (
        <Tooltip title={ModelingTooltips.facet}>
          <span>Facet</span>
        </Tooltip>
      ),
      dataIndex: 'facet',
      width: 100,
      render: text => {
        return text && <FontAwesomeIcon className={styles.icon} icon={faCheck} data-testid={'facet-'+ text}/>
      }
    },
    {
      title: (
        <Tooltip title={ModelingTooltips.advancedSearch}>
          <span>Advanced Search</span>
        </Tooltip>
      ),
      dataIndex: 'advancedSearch',
      width: 150,
      render: (text) => {
        return text && <FontAwesomeIcon className={styles.advancedSearchIcon} icon={faCheck} data-testid={'adv-srch-'+ text}/>
      }
    },
    {
      title: (
        <Tooltip title={ModelingTooltips.pii}>
          <span>PII</span>
        </Tooltip>
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
        return ( text && 
          <Tooltip title={ModelingTooltips.addStructuredProperty}>
            <FontAwesomeIcon className={!props.canWriteEntityModel && props.canReadEntityModel ? styles.addIconReadOnly : styles.addIcon} icon={faPlusSquare} data-testid={'add-struct-'+ text}
            onClick={(event) => {
              if (!props.canWriteEntityModel && props.canReadEntityModel) {
                return event.preventDefault()
              } else {
                return '' //TODO - Functionality for Add Icon can be added here
              }
            }}/>
          </Tooltip>
        )
      }
    }
  ];

  const addPropertyToDefinition = (propertyName: string, propertyOptions: any) => {
    let updatedDefinitions = definitions;
    console.log('definitions', definitions)
    let entityTypeDefinition = updatedDefinitions[props.entityName];
    let newProperty = {};
    let parseType = propertyOptions.type.split(',');

    if (propertyOptions.identifier === 'yes') {
      entityTypeDefinition['primaryKey'] = propertyName
    }
    if (propertyOptions.pii === 'yes') {
      entityTypeDefinition['pii'] = entityTypeDefinition['pii'] ? [...entityTypeDefinition['pii'], propertyName] : [propertyName]
    }

    if (propertyOptions.advancedSearch) {
      entityTypeDefinition['wordLexicon'] = entityTypeDefinition['wordLexicon'] ? [...entityTypeDefinition['wordLexicon'], propertyName] : [propertyName]
    }

    if (parseType[0] === 'relationship' && propertyOptions.multiple === 'no') {
      let externalEntity = modelingOptions.entityTypeNamesArray.find(entity => entity.name === parseType[1])
      newProperty = {
        $ref: externalEntity.entityTypeId,
      }

    } else if (parseType[0] === 'relationship' && propertyOptions.multiple === 'yes') {
      let externalEntity = modelingOptions.entityTypeNamesArray.find(entity => entity.name === parseType[1])
      newProperty = {
        datatype: 'array',
        items: {
          $ref: externalEntity.entityTypeId,
        }
      }

    } else if (propertyOptions.multiple === 'yes') {
      newProperty = {
        datatype: 'array',
        items: {
          datatype: parseType[parseType.length-1],
          collation: "http://marklogic.com/collation/codepoint",
        }
      }
    } else {
      newProperty = {
        datatype: parseType[parseType.length-1],
        collation: "http://marklogic.com/collation/codepoint"
      }
    }

    entityTypeDefinition['properties'][propertyName] = newProperty;
    updatedDefinitions[props.entityName] = entityTypeDefinition;
    let entityDefinitionsArray = definitionsParser(updatedDefinitions);
    let renderTableData = parseDefinitionsToTable(entityDefinitionsArray);

    setDefinitions(updatedDefinitions);
    setEntityDefinitions(entityDefinitionsArray)
    setTableData(renderTableData);
    toggleIsModified(true);
  }

  const parseDefinitionsToTable = (entityDefinitionsArray: any[]) => {
    let entityTypeDefinition = entityDefinitionsArray.find( definition => definition.name === props.entityName);

    return entityTypeDefinition?.properties.map( (property, index) => {
      let propertyRow: any = {};
      if (property.datatype === 'structured') {

        const parseStructuredProperty = (entityDefinitionsArray, property) => {
          let parsedRef = property.ref.split('/');
          if (parsedRef.length > 0 && parsedRef[1] === 'definitions') {
            let structuredType = entityDefinitionsArray.find( entity => entity.name === parsedRef[2]);
            let structuredTypeProperties = structuredType?.properties.map((structProperty, structIndex) => {
              if (structProperty.datatype === 'structured') {
                // Recursion to handle nested structured types
                return parseStructuredProperty(entityDefinitionsArray, structProperty);
              } else {
                // TODO add functionality to sort, facet, delete, and add columns
                return {
                  key: property.name + index + structIndex,
                  propertyName: structProperty.name,
                  type: structProperty.datatype === 'structured' ? structProperty.ref.split('/').pop() : structProperty.datatype,
                  identifier: entityTypeDefinition?.primaryKey === structProperty.name ? structProperty.name : '',
                  multiple: structProperty.multiple ? structProperty.name: '',
                  advancedSearch: entityTypeDefinition?.wordLexicon.includes(structProperty.name) ? structProperty.name : '',
                  pii: entityTypeDefinition?.pii.includes(structProperty.name) ? structProperty.name : ''
                }
              }
            });
  
            return {
              key: property.name + index,
              propertyName: property.name,
              type: property.ref.split('/').pop(),
              children: structuredTypeProperties,
              add: structuredType.name
            }
          }
        }
        propertyRow = parseStructuredProperty(entityDefinitionsArray, property)
      } else {
        // TODO add functionality to sort, facet, delete, and add columns
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

  const addPropertyButton = <MLButton 
      type="primary"
      aria-label={props.entityName +'-add-property'}
      disabled={!props.canWriteEntityModel}
      className={!props.canWriteEntityModel && styles.disabledButton}
      onClick={()=> toggleShowPropertyModal(true)}
    >Add Property</MLButton>

  return (
    <div>
      <div className={styles.addButtonContainer}>
        { props.canWriteEntityModel ? 
          addPropertyButton
        :  
        (
          <Tooltip title={'Add Property: ' + ModelingTooltips.noWriteAccess}>
            <span>{addPropertyButton}</span>
          </Tooltip>
        )
      }

      </div>
      <PropertyModal
        entityName={props.entityName}
        entityDefinitionsArray={entityDefinitions}
        isVisible={showPropertyModal}
        toggleModal={toggleShowPropertyModal}
        addPropertyToDefinition={addPropertyToDefinition}
      />
      <Table
        locale={{ emptyText: ' ' }}
        columns={headerColumns}
        dataSource={tableData}
        pagination={false}
        size="middle"
      />
    </div>
  );
}

export default PropertyTable; 