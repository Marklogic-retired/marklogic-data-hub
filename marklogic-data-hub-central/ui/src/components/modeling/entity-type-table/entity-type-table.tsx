import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Tooltip } from 'antd';
import { faSave, faUndo, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './entity-type-table.module.scss';

import { dateConverter } from '../../../util/date-conversion';
import { numberConverter } from '../../../util/number-conversion';
import { ModelingTooltips } from '../../../config/tooltips.config';

type Props = {
  allEntityTypesData: any[];
}

const EntityTypeTable: React.FC<Props> = (props) => {

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200,
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
      width: 200,
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
              data-cy={parseText[0]+ '-instance-count'}
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
      width: 200,
      render: text => {
        let parseText = text.split(',');
        let displayDate = dateConverter(parseText[2]);

        if (parseText[1] === 'undefined') {
          return 'Never been run'
        } else {
          return (
            <Tooltip title={ModelingTooltips.lastProcessed}>
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
      width: 75,
      render: text => {
        // TODO add functionality to icons
        return (
          <div className={styles.iconContainer}>
            <FontAwesomeIcon className={styles.icon} icon={faSave} size="2x"/>
            <FontAwesomeIcon className={styles.icon} icon={faUndo} size="2x"/>
            <FontAwesomeIcon className={styles.icon} icon={faTrashAlt} size="2x"/>
          </div>
        )
      }
    }
  ];

  const renderTableData = props.allEntityTypesData.map(( entity, index) => {
    let parsedEntity = {
      name: entity.entityName,
      instances: entity.entityName + ',' + parseInt(entity.entityInstanceCount),
      lastProcessed: entity.entityName + ',' + entity.latestJobId + ',' + entity.latestJobDateTime,
      actions: entity.entityName
    }
    return parsedEntity;
  });

  return (
    <Table
      rowKey="name"
      className={styles.table}
      data-cy="entity-type-table"
      data-testid="entity-type-table"
      columns={columns}
      // expandedRowRender={expandedRowRender}
      dataSource={renderTableData}
      pagination={{defaultPageSize: 20, size: 'small'}}
    />
  );
}

export default EntityTypeTable; 