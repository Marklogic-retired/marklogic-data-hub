import React from 'react';
import { Table, Icon } from 'antd';
import { xmlParser } from "../../util/xml-parser";

interface Props {
  item: any;
};


const ExpandableTableView: React.FC<Props> = (props) => {

  let data = new Array();
  let counter = 0;
  const parseJson = (obj: Object) => {
    let parsedData = new Array();
    for (var i in obj) {
      if (obj[i] !== null && typeof (obj[i]) === "object") {
        parsedData.push({key: counter++, property: i, children: obj[i]});
      } else {
        parsedData.push({key: counter++, property: i, value: typeof obj[i] === 'boolean' ? obj[i].toString() : obj[i]});
      }
    }
    return parsedData;
  }

  if (props.item.format === 'json' && props.item.hasOwnProperty('extracted')) {
    Object.values(props.item.extracted.content[1]).forEach((content: any) => {
      data = parseJson(content);
    });
  } else if (props.item.format === 'xml' && props.item.hasOwnProperty('extracted')) {
    Object.values(props.item.extracted.content).forEach(contentObject => {
      let obj = xmlParser(contentObject);
      if (!obj.hasOwnProperty('headers')) {
        const propertyValues = Object.values<any>(obj);
        propertyValues.forEach((item: Object) => {
          data = parseJson(item);
        })
      }
    })
  }

  function expandIcon({expanded, expandable, record, onExpand}) {
    if (!expandable || record.hasOwnProperty('children') === false) return null;

    return (
        <a style={{color:'black'}} onClick={e => onExpand(record, e)}>
          {expanded ? <Icon type="down"/> : <Icon type="right"/>}
        </a>
    );
  }

  const expandedRowRender = (propertyValues) => {
    let data: any[] = [];
    const columns = [
      {title: 'Property', dataIndex: 'property', width: '20%'},
      {title: 'Value', dataIndex: 'value', width: '40%'},
      {title: 'View', dataIndex: 'view', width: '40%'}
    ];

    for (let obj in propertyValues.children) {
      for (let i in propertyValues.children[obj]) {
        let property = {
          property: i,
          value: propertyValues.children[obj][i],
          view: null
        }
        data.push(property)
      }
    }

    return <Table
        rowKey="property"
        columns={columns}
        dataSource={data}
        pagination={false}
    />;
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
      width: '40%',
    },
    {
      title: 'View',
      dataIndex: 'view',
      width: '40%',
    }

  ];

  return (
      <Table
          rowKey="key"
          dataSource={data}
          expandIcon={expandIcon}
          columns={columns}
          expandedRowRender={expandedRowRender}
          pagination={false}
          data-cy="expandable-table-view"
      />
  );
}

export default ExpandableTableView;