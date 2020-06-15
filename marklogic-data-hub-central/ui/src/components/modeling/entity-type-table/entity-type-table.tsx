import React, { useState, useEffect, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { MLTable, MLTooltip } from '@marklogic/design-system';
import { faUndo, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './entity-type-table.module.scss';

import PropertyTable from '../property-table/property-table';
import { queryDateConverter, relativeTimeConverter } from '../../../util/date-conversion';
import { numberConverter } from '../../../util/number-conversion';
import { ModelingTooltips } from '../../../config/tooltips.config';

type Props = {
  allEntityTypesData: any[];
  canReadEntityModel: boolean;
  canWriteEntityModel: boolean;
  autoExpand: string;
  editEntityTypeDescription: (entityTypeName: string, entityTypeDescription: string) => void;
}

const EntityTypeTable: React.FC<Props> = (props) => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  // Disabling all action icons for now
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (props.autoExpand){
      setExpandedRows([props.autoExpand])
    }
  }, [props.autoExpand]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 400,
      render: text => {
        let parseText = text.split(',');
        let entityName = parseText[0];
        let entityDescription = parseText[1];

        return (
          <MLTooltip title={ModelingTooltips.entityTypeName}>
            <span data-testid={parseText[0] + '-span'} className={styles.link}
              onClick={() => {
                props.editEntityTypeDescription(entityName, entityDescription);
              }}>
              {entityName}</span>
          </MLTooltip>
        )
      },
      sorter: (a, b) => {
        return a.name.localeCompare(b.name)
      }
    },
    {
      title: 'Instances',
      dataIndex: 'instances',
      className: styles.rightHeader,
      width: 100,
      render: text => {
        let parseText = text.split(',');
        let instanceCount = numberConverter(parseInt(parseText[1]));

        return (
          <MLTooltip title={ModelingTooltips.instanceNumber}>
            <Link
              to={{
                pathname: "/browse",
                state: { entity: parseText[0] }
              }}
              data-testid={parseText[0] + '-instance-count'}
            >
              {instanceCount}
            </Link>
          </MLTooltip>
        )
      },
      sorter: (a, b) => {
        let splitA = a['instances'].split(',');
        let aCount = parseInt(splitA[1]);
        let splitB = b['instances'].split(',');
        let bCount = parseInt(splitB[1]);

        return aCount - bCount;
      }
    },
    {
      title: 'Last Processed',
      dataIndex: 'lastProcessed',
      width: 100,
      render: text => {
        let parseText = text.split(',');
        if (parseText[1] === 'undefined') {
          return 'n/a'
        } else {
          let displayDate = relativeTimeConverter(parseText[2]);
          return (
            <MLTooltip title={queryDateConverter(parseText[2]) + "\n" + ModelingTooltips.lastProcessed}>
              <Link
                to={{
                  pathname: "/browse",
                  state: { entityName: parseText[0], jobId: parseText[1] }
                }}
                data-testid={parseText[0]+ '-last-processed'}
              >
                {displayDate}
              </Link>
            </MLTooltip>

          )
        }
      },
      sorter: (a, b) => {
        let splitA = a['lastProcessed'].split(',');
        let splitB = b['lastProcessed'].split(',');
        return splitA[2].localeCompare(splitB[2])
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      className: styles.actions,
      width: 100,
      render: text => {
        // TODO add functionality to icons
        return (
          <div className={styles.iconContainer}>
          <MLTooltip title={ModelingTooltips.saveIcon}>
            <span
              data-testid={text + '-save-icon'} 
              className={!props.canWriteEntityModel && props.canReadEntityModel || disabled ? styles.iconSaveReadOnly : styles.iconSave}
            ></span>
          </MLTooltip>
          <MLTooltip title={ModelingTooltips.revertIcon}>
            <FontAwesomeIcon 
              data-testid={text + '-revert-icon'} 
              className={!props.canWriteEntityModel && props.canReadEntityModel || disabled ? styles.iconRevertReadOnly : styles.iconRevert} 
              icon={faUndo}
              onClick={(event) => {
                if (!props.canWriteEntityModel && props.canReadEntityModel) {
                  return event.preventDefault()
                } else {
                  return '' //TODO - Add functionality for Revert Icon here
                }
              }}
              size="2x"
            />
          </MLTooltip>
            <FontAwesomeIcon 
              data-testid={text + '-trash-icon'}
              className={!props.canWriteEntityModel && props.canReadEntityModel || disabled ? styles.iconTrashReadOnly : styles.iconTrash} 
              icon={faTrashAlt}
              onClick={(event) => {
                if (!props.canWriteEntityModel && props.canReadEntityModel) {
                  return event.preventDefault()
                } else {
                  return '' //TODO - Add functionality for delete Icon here
                }
              }}
              size="2x" 
            />
          </div>
        )
      }
    }
  ];

  const getEntityTypeDescription = (entity: any) => {
    return (entity.hasOwnProperty("model") &&
      entity.model.hasOwnProperty("definitions") &&
      entity.model.definitions.hasOwnProperty(entity.entityName) &&
      entity.model.definitions[entity.entityName].hasOwnProperty("description")) ? entity.model.definitions[entity.entityName].description : '';
  };

  const expandedRowRender = (entity) => {
    return <PropertyTable 
              entityName={entity.name.split(',')[0]} 
              definitions={entity.definitions}
              canReadEntityModel={props.canReadEntityModel} 
              canWriteEntityModel={props.canWriteEntityModel}
            />
  };

  const onExpand = (expanded, record) => {
    let newExpandedRows =  [...expandedRows]
    if (expanded) {
      if ( newExpandedRows.indexOf(record.name) === -1) {
        newExpandedRows.push(record.name);
      }
    } else {
      newExpandedRows = newExpandedRows.filter(row => row !== record.name);
    }
    setExpandedRows(newExpandedRows);
  }

  const renderTableData = props.allEntityTypesData.map((entity) => {
    return {
      name: entity.entityName + ',' + getEntityTypeDescription(entity),
      instances: entity.entityName + ',' + parseInt(entity.entityInstanceCount),
      lastProcessed: entity.entityName + ',' + entity.latestJobId + ',' + entity.latestJobDateTime,
      actions: entity.entityName,
      definitions: entity.model.definitions
    };
  });

  return (
    <MLTable
      rowKey="name"
      locale={{ emptyText: ' ' }}
      className={styles.table}
      columns={columns}
      expandedRowRender={expandedRowRender}
      onExpand={onExpand}
      expandedRowKeys={expandedRows}
      dataSource={renderTableData}
      pagination={{ defaultPageSize: 20, size: 'small' }}
      size="middle"
    />
  );
}

export default EntityTypeTable;
