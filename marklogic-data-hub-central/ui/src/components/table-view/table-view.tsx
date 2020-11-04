import React, { useState } from 'react';
import { Table } from 'antd';
import styles from './table-view.module.scss';

interface Props {
  document: any;
  contentType: string;
  location: {};
  isEntityInstance: boolean;
}

const TableView: React.FC<Props> = (props) => {
  const [expanded, setExpanded] = useState(false);

  let data = new Array();
  let counter = 0;
  let expandRow: number[] = [];
  let currRow: number[] = [];


  const parseJson = (obj: Object) => {
    let parsedData = new Array();
    for (var i in obj) {
      if (props.location && JSON.stringify(props.location) === JSON.stringify(obj[i])) {
        expandRow = currRow.concat(expandRow);
        expandRow.push(counter);
      }
      if (obj[i] !== null && typeof (obj[i]) === "object") {
        currRow.push(counter);
        parsedData.push({key: counter++, property: i, children: parseJson(obj[i])});
        currRow.pop();
      } else {
        parsedData.push({key: counter++, property: i, value: typeof obj[i] === 'boolean' ? obj[i].toString() : obj[i]});
      }
    }
    return parsedData;
  };

  if (props.document) {
      data = parseJson(props.document);
  }

  const handleClick = () => {
    expanded === false ? setExpanded(true) : setExpanded(false);
  };


  const columns = [
    {
      title: 'Property',
      dataIndex: 'property',
      width: props.isEntityInstance ? '20%' : '40%',
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
        } as React.CSSProperties;
        return <p onClick={() => handleClick()} style={pStyle}>{value}</p>;
      },
      width: props.isEntityInstance ? '80%' : '60%',
    }
  ];


  return (
      <Table
          className={props.isEntityInstance ? "document-table-demo": styles.tableViewNonEntity}
          rowKey="key"
          dataSource={data}
          columns={columns}
          pagination={false}
          data-cy="document-table"
          defaultExpandedRowKeys={expandRow}
      />
  );
};

export default TableView;