import React from 'react';
import { Table, Tooltip } from 'antd';
import { xmlParser } from "../../util/xml-parser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

interface Props {
  item: any;
  entityDefArray: any[];
};


const ExpandableTableView: React.FC<Props> = (props) => {

  let itemEntityName: string[] = [];
  let itemEntityProperties: any[] = [];
  let entityDef: any = {};
  let primaryKeyValue: any = '-';
  let uri: string = encodeURIComponent(props.item.uri);

  let data = new Array();
  let counter = 0;
  const parseJson = (obj: Object) => {
    let parsedData = new Array();
    for (var i in obj) {
      if (obj[i] !== null && typeof (obj[i]) === "object") {
        parsedData.push({
          key: counter++,
          property: i,
          children: parseJson(obj[i]),
          view: <Link to={{pathname: `/detail/${primaryKeyValue}/${uri}`,state: {id:obj[i]}}} data-cy='nested-instance'>
            <Tooltip title={'Show nested detail on a separate page'}><FontAwesomeIcon icon={faExternalLinkAlt}
                                                                               size="sm"/></Tooltip>
          </Link>
        });
      } else {
        parsedData.push({
          key: counter++,
          property: i,
          value: typeof obj[i] === 'boolean' ? obj[i].toString() : obj[i],
          view: null
        });
      }
    }
    return parsedData;
  }

  if (props.item.format === 'json' && props.item.hasOwnProperty('extracted')) {
    (props.item.extracted.content).forEach(contentObject => {
      itemEntityName = Object.keys(contentObject);
      itemEntityProperties = Object.values<any>(contentObject);
      if (itemEntityName.length && props.entityDefArray.length && !itemEntityName[0].includes('headers')) {
        entityDef = props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
        if (itemEntityProperties.length && entityDef.primaryKey) {
          primaryKeyValue = itemEntityProperties[0][entityDef.primaryKey];
        } else {
          primaryKeyValue = encodeURIComponent(props.item.uri);
        }
      }
      Object.values(props.item.extracted.content[1]).forEach((content: any) => {
        data = parseJson(content);
      });
    })
  } else if (props.item.format === 'xml' && props.item.hasOwnProperty('extracted')) {
    (props.item.extracted.content).forEach(contentObject => {
      let obj = xmlParser(contentObject);
      itemEntityName = Object.keys(obj);
      itemEntityProperties = Object.values<any>(obj);
      if (itemEntityName.length && props.entityDefArray.length && !itemEntityName[0].includes('headers')) {
        entityDef = props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
        if (itemEntityProperties.length && itemEntityProperties[0].hasOwnProperty(entityDef.primaryKey)) {
          primaryKeyValue = itemEntityProperties[0][entityDef.primaryKey];
        } else {
          primaryKeyValue = encodeURIComponent(props.item.uri);
        }
      }
      let mappedObj = xmlParser(Object.values(props.item.extracted.content)[1]);
      let propertyValues = Object.values<any>(mappedObj);
      propertyValues.forEach((item: Object) => {
        data = parseJson(item);
      })
    })
  }


  const columns = [
    {
      title: 'Property',
      dataIndex: 'property',
      width: '20%',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      width: '20%',
    },
    {
      title: 'View',
      dataIndex: 'view',
      width: '20%',
    }
  ];

  return (
      <Table
          rowKey="key"
          dataSource={data}
          columns={columns}
          pagination={false}
          data-cy="expandable-table-view"
      />
  );
}

export default ExpandableTableView;