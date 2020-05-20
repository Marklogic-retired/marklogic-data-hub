import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Table, Tooltip } from 'antd';
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
}

const EntityTypeTable: React.FC<Props> = (props) => {

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 400,
      // TODO - Edit Entity DHFPROD-4452
      render: text => {
        return (
          <Tooltip title={ModelingTooltips.entityTypeName}>
            <span data-testid={text + '-span'}>{text}</span>
          </Tooltip>
        )
      },
      sorter: (a, b) => { return a.name.localeCompare(b.name) }
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
          <Tooltip title={ModelingTooltips.instanceNumber}>
            <Link 
              to={{
                pathname: "/browse",
                state: { entity: parseText[0] }
              }}
              data-testid={parseText[0]+ '-instance-count'}
            > 
              {instanceCount}
            </Link>
          </Tooltip>
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
        let displayDate = relativeTimeConverter(parseText[2]);

        if (parseText[1] === 'undefined') {
          return 'n/a'
        } else {
          return (
            <Tooltip title={queryDateConverter(parseText[2])+ "\n" + ModelingTooltips.lastProcessed}>
              <Link 
                to={{
                  pathname: "/browse",
                  state: { entityName: parseText[0], jobId: parseText[1] }
                }}
                data-cy={parseText[0]+ '-last-processed'}
                data-testid={parseText[0]+ '-last-processed'}
              >
                {displayDate}
              </Link>
            </Tooltip>

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
          <Tooltip title={ModelingTooltips.saveIcon}>
            <span className={!props.canWriteEntityModel && props.canReadEntityModel ? styles.iconSaveReadOnly : styles.iconSave}></span>
          </Tooltip>
          <Tooltip title={ModelingTooltips.revertIcon}>
            <FontAwesomeIcon className={!props.canWriteEntityModel && props.canReadEntityModel ? styles.iconRevertReadOnly : styles.iconRevert} icon={faUndo} 
            onClick={(event) => {
              if (!props.canWriteEntityModel && props.canReadEntityModel) {
                return event.preventDefault()
              } else {
                return '' //TODO - Add functionality for Revert Icon here
              }
            }}
            size="2x"/>
          </Tooltip>
            <FontAwesomeIcon className={!props.canWriteEntityModel && props.canReadEntityModel ? styles.iconTrashReadOnly : styles.iconTrash} icon={faTrashAlt}
              onClick={(event) => {
                if (!props.canWriteEntityModel && props.canReadEntityModel) {
                  return event.preventDefault()
                } else {
                  return '' //TODO - Add functionality for delete Icon here
                }
              }}
              size="2x" />
          </div>
        )
      }
    }
  ];

  const renderTableData = props.allEntityTypesData.map(( entity, index) => {
    return {
      name: entity.entityName,
      instances: entity.entityName + ',' + parseInt(entity.entityInstanceCount),
      lastProcessed: entity.entityName + ',' + entity.latestJobId + ',' + entity.latestJobDateTime,
      actions: entity.entityName,
      definitions: entity.model.definitions
    };
  });

  const expandedRowRender = (entity) => {
    return <PropertyTable entityName={entity.name} definitions={entity.definitions}
              canReadEntityModel={props.canReadEntityModel} canWriteEntityModel={props.canWriteEntityModel}/>
  };

  return (
    <Table
      rowKey="name"
      locale={{ emptyText: ' ' }}
      className={styles.table}
      data-cy="entity-type-table"
      data-testid="entity-type-table"
      columns={columns}
      expandedRowRender={expandedRowRender}
      dataSource={renderTableData}
      pagination={{ defaultPageSize: 20, size: 'small' }}
    />
  );
}

export default EntityTypeTable; 