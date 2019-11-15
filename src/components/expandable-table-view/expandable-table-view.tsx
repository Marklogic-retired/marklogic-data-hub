import React from 'react';
import { Table } from 'antd';
import { xmlParser } from "../../util/xml-parser";
import { parseJson } from "../../util/parse-json";

interface Props {
  item: any;
};


const ExpandableTableView: React.FC<Props> = (props) => {

  let data = new Array();

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

export default ExpandableTableView;