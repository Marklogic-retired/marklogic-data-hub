import React, { CSSProperties } from 'react';
import { Table, Tooltip } from 'antd';
import { MlButton } from 'marklogic-ui-library'
import { faCircle, faCheck, faTrashAlt, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './property-table.module.scss';

import { definitionsParser } from '../../../util/data-conversion';
import { ModelingTooltips } from '../../../config/tooltips.config';

type Props = {
  entityName: string;
  definitions: any;
  canReadEntityModel: boolean;
  canWriteEntityModel: boolean;
}

const PropertyTable: React.FC<Props> = (props) => {
  let renderTableData;
  let entityDefinitionsArray = definitionsParser(props.definitions);

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
        return text && <FontAwesomeIcon className={styles.icon} icon={faCheck} data-testid={'multiple-'+ text}/>
        
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
        return text && <FontAwesomeIcon className={styles.icon} icon={faCheck} data-testid={'adv-srch-'+ text}/>
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


  const parseData = (entityDefinitionsArray) => {
    let entityTypeDefinition = entityDefinitionsArray.find( definition => definition.name === props.entityName);
    renderTableData = entityTypeDefinition?.properties.map( (property, index) => {
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
  if (entityDefinitionsArray.length === 1) {
    columns.pop();
  }
  parseData(entityDefinitionsArray);

  return (
    <div>
      <div className={styles.addButtonContainer}>
        <MlButton type="primary" disabled={!props.canWriteEntityModel}>Add Property</MlButton>
      </div>
      <Table
        locale={{ emptyText: ' ' }}
        data-testid="property-table"
        columns={columns}
        dataSource={renderTableData}
        pagination={false}
      />
    </div>
  );
}

export default PropertyTable; 