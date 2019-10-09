import React, { useState } from 'react';
import { Table } from 'antd';

interface Props {
  document: any;
  contentType: string;
};

const TableView: React.FC<Props> = (props) => {
  const [expanded, setExpanded] = useState(false);

  let data = new Array();

  if (props.contentType === 'json') {
    Object.keys(props.document.envelope.instance).forEach( instance => {
      if (instance !== 'info'){
        // TODO handle nested instance types (objects and arrays)
        Object.keys(props.document.envelope.instance[instance]).forEach(function (key) {
          data.push({ property: key, value: props.document.envelope.instance[instance][key] });
        });
      }
    });
  } else if (props.contentType === 'xml') {
    Object.keys(props.document.content.envelope.instance).forEach( instance => {
      if (instance !== 'info'){
        // TODO handle nested instance types (objects and arrays)
        Object.keys(props.document.content.envelope.instance[instance]).forEach(function (key) {
          data.push({ property: key, value: props.document.content.envelope.instance[instance][key] });
        });
      }
    });
  }

  const handleClick = () => {
    expanded === false ? setExpanded(true) : setExpanded(false)
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
      render: (value: string) => {
        const pStyle = {
          whiteSpace: !expanded ? "nowrap" : "normal",
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          maxWidth: '150ex',
          cursor: 'pointer',
          padding: '0',
          margin: '0'
        } as React.CSSProperties
        return <p onClick={() => handleClick()} style={pStyle}>{value}</p>
      },
      width: '80%',
    }
  ];

  return (
    <Table
      className="document-table-demo"
      rowKey="property"
      dataSource={data}
      columns={columns}
      pagination={false}
      data-cy="document-table"
    />
  );
}

export default TableView;