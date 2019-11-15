import React, { useState } from 'react';
import { Table } from 'antd';
import {parseJson} from "../../util/parse-json";

interface Props {
  document: any;
  contentType: string;
};

const TableView: React.FC<Props> = (props) => {
  const [expanded, setExpanded] = useState(false);

  let data = new Array();

  if (props.document.envelope || props.document.content.envelope) {
    if (props.contentType === 'json') {
      Object.keys(props.document.envelope.instance).forEach(instance => {
        if (instance !== 'info') {
          data = parseJson(props.document.envelope.instance[instance]);
        }
      });
    } else if (props.contentType === 'xml') {
      Object.keys(props.document.content.envelope.instance).forEach(instance => {
        if (instance !== 'info') {
          data = parseJson(props.document.content.envelope.instance[instance]);
        }
      });
    }
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
      rowKey="key"
      dataSource={data}
      columns={columns}
      pagination={false}
      data-cy="document-table"
    />
  );
}

export default TableView;