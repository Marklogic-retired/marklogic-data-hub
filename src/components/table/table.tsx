import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Tooltip } from 'antd';
import { dateConverter } from '../../util/date-conversion';
import { xmlParser } from '../../util/xml-parser';


interface Props {
  data: any;
  entityDefArray: any[];
  entity: any;
};

const TableRow: React.FC<Props> = (props) => {
  let title: string[] = [];
  let entityTitle: string[] = [];
  let data = new Array();
  let consdata = new Array();
  let columns = new Array();
  let itemEntityName: string[] = [];
  let itemEntityProperties: any[] = [];
  let entityDef: any = {};
  let primaryKeys: string[] = [];
  let primaryKeyValue: string = '';
  let counter = 0;
  let createdOn = '';


  //Iterate over each element in the payload and construct an array.
  props.data && props.data.forEach(item => {
    if (item.format === 'json' && item.hasOwnProperty('extracted')) {
      createdOn = item.extracted.content[0].headers.createdOn;
      if (item.extracted.hasOwnProperty('content') && item.extracted.content[1]) {
        itemEntityName = Object.keys(item.extracted.content[1]);
        itemEntityProperties = Object.values<any>(item.extracted.content[1]);
      };
    };

    if (item.format === 'xml' && item.hasOwnProperty('extracted')) {
      let header = xmlParser(item.extracted.content[0]);
      let entity = xmlParser(item.extracted.content[1]);
      createdOn = header.headers.createdOn;

      if (header && entity) {
        itemEntityName = Object.keys(entity);
        itemEntityProperties = Object.values<any>(entity);
      };
    }

    // Parameters for both JSON and XML.
    //Get entity definition.
    if (itemEntityName.length && props.entityDefArray.length) {
      entityDef = props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
    }

    //Get primary key if exists or set it to undefined.
    if (entityDef.primaryKey.length !== 0) {
      primaryKeyValue = encodeURIComponent(itemEntityProperties[0][entityDef.primaryKey]);
      primaryKeys.indexOf(entityDef.primaryKey) === -1 && primaryKeys.push(entityDef.primaryKey);
    } else {
      primaryKeyValue = 'uri';
    }

    if (entityTitle.length === 0) {
      primaryKeyValue === 'uri' ? entityTitle.push('Identifier') : entityTitle.push(entityDef.primaryKey);
      Object.keys(itemEntityProperties[0]).forEach((key, i) => {
        i < 5 && entityTitle.indexOf(key) === -1 && entityTitle.push(key);
      })
    }

    consdata.push({
      primaryKey: primaryKeyValue, itemEntityName: itemEntityName[0], itemEntityProperties: itemEntityProperties,
      uri: item.uri, format: item.format, createdOn: createdOn
    })
  });

  //Construct title array for "All Entities" or an Entity.
  props.entity.length === 0 ? title = [...['Identifier', 'Entity', 'File Type', 'Created']] : title = [...entityTitle, 'Created'];

  //Construct table title.
  title.forEach(item => {
    columns.push(
      {
        title: item,
        dataIndex: item.replace(/ /g, '').toLowerCase(),
      }
    )
  });

  //Construct table data
  consdata.forEach((item) => {
    let isUri = item.primaryKey === 'uri';
    let uri = encodeURIComponent(item.uri);
    let path = { pathname: `/detail/${isUri ? '-' : item.primaryKey}/${uri}` };
    let document = item.uri.split('/')[item.uri.split('/').length - 1];
    let date = dateConverter(item.createdOn);
    let row: any = {};
    if (props.entity.length === 0) {
      row =
        {
          key: counter++,
          identifier: <Link to={path}><Tooltip title={isUri && item.uri}>{isUri ? '.../' + document : item.primaryKey}</Tooltip></Link>,
          entity: item.itemEntityName,
          filetype: item.format,
          created: date
        }
    } else {
      row =
        {
          key: counter++,
          created: date
        }

      for (var propt in item.itemEntityProperties[0]) {
        if (isUri) {
          row.identifier =
            <Link to={path}>
              <Tooltip title={isUri ? item.uri : item.primaryKey}>{'.../' + document}</Tooltip>
            </Link>
        }
        if (primaryKeys.includes(propt)) {
          row[propt.toLowerCase()] = <Link to={path}>{item.itemEntityProperties[0][propt]}</Link>
        } else {
          row[propt.toLowerCase()] = item.itemEntityProperties[0][propt];
        }
      }
    }
    data.push(row)
  });

  return (
    <Table
      className="search-tablular"
      rowKey="key"
      dataSource={data}
      columns={columns}
      pagination={false}
      data-cy="search-tablular"
    />
  );
}

export default TableRow;