import React from 'react';
import {Table} from 'antd';
import {xmlParser} from "../../util/xml-parser";

interface Props {
  item: any;
};


const ExpandableView: React.FC<Props> = (props) => {

  let data = new Array();
  let counter = 0;

  const parseJson = (obj: Object) => {
    let parsedData = new Array();
    for (var i in obj) {
      if (obj[i] !== null && typeof (obj[i]) === "object") {
        parsedData.push({key: counter++, property: i, children: parseJson(obj[i])});
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
    });
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
      width: '80%',
    }
  ];

  return (
      <Table
          rowKey="key"
          dataSource={data}
          columns={columns}
          pagination={false}
          data-cy="document-table"
      />
  );
}

export default ExpandableView;