import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Resizable } from 'react-resizable'
import { Table, Tooltip } from 'antd';
import { dateConverter } from '../../util/date-conversion';
import { xmlParser } from '../../util/xml-parser';
import styles from './result-table.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import ColumnSelector from '../../components/column-selector/column-selector';
import { type } from 'os';
import { tableParser, headerParser, getParentKey } from '../../util/data-conversion';
import { arrayExpression } from '@babel/types';


const ResizeableTitle = props => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

interface Props {
  data: any;
  entityDefArray: any[];
  entity: any;
};

const ResultTable: React.FC<Props> = (props) => {
  let listOfColumns = new Array();
  let data = new Array();
  let counter = 0;
  let rowCounter = 0;
  const [columns, setColumns] = useState<any[]>([]);
  const [checkedColumns, setCheckedColumns] = useState<any[]>([]);
  const [treeColumns, setTreeColumns] = useState<any[]>([]);
  const allEntitiesColumns = [{ title: 'Identifier', key: '0-0' }, { title: 'Entity', key: '0-1' }, { title: 'File Type', key: '0-2' }];
  let previousColumns = new Array();
  let parsedPayload = tableParser(props);
  let arrayOfTitles = parsedPayload.data[0] && parsedPayload.data[0].itemEntityProperties[0];

  const tableHeader = (columns) => {
    let col = new Array();
    columns.forEach((item, index) => {
      if (item.hasOwnProperty('children')) {
        col.push({
          title: item.title,
          key: item.key,
          children: tableHeader(item.children),
        })
      } else {
        col.push(
          {
            title: item.title,
            dataIndex: item.title.replace(/ /g, '').toLowerCase(),
            key: item.key,
            width: 150,
            onHeaderCell: column => ({
              width: column.width,
              onResize: handleResize(index),
            }),
            onCell: () => {
              return {
                style: {
                  whiteSpace: 'nowrap',
                  maxWidth: 150,
                }
              }
            },
            render: (text) => (
              <Tooltip
                title={text && text.length > 50 && text.substring(0, 301).concat('...\n\n(View document details to see all of this text.)')}>
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{text}</div>
              </Tooltip>
            )
          }
        )
      }
    });
    return col;
  }

  //set pk column to be first
  const setPrimaryKeyColumn = (obj) => {
    let a = [...obj];
    let pk;
    for (let i = 0; i < a.length; i++) {
      if (a[i].title === parsedPayload.entityTitle[0]) {
        pk = a.splice(i, 1);
        i--;
        break;
      }
    }
    pk && a.unshift(pk[0]);
    return a;
  }

  useEffect(() => {
    let lastKey: string;
    if (parsedPayload.data.length !== 0) {
      props.entity.length === 0 ? listOfColumns = setPrimaryKeyColumn(allEntitiesColumns) : listOfColumns = setPrimaryKeyColumn(headerParser(arrayOfTitles));
      if (listOfColumns && listOfColumns.length > 0) {
        lastKey = '0-' + String(Number(listOfColumns[listOfColumns.length - 1].key.split('-')[listOfColumns[listOfColumns.length - 1].key.split('-').length - 1]) + 1);
        listOfColumns.push({ title: 'Created', key: lastKey })
        previousColumns = [...tableHeader(listOfColumns)];
      }
    }
  })

  useEffect(() => {
    let header = tableHeader(listOfColumns);
    //set table data
    setColumns(header.slice(0, 5))
    //set popover tree data
    setTreeColumns(previousColumns)
    //set popover tree selected checkboxes data
    setCheckedColumns(header.slice(0, 5));
  }, [props.data]);

  const components = {
    header: {
      cell: ResizeableTitle,
    },
  };

  parsedPayload.data.forEach((item) => {
    let isUri = item.primaryKey === 'uri';
    let uri = encodeURIComponent(item.uri);
    let path = { pathname: `/detail/${isUri ? '-' : item.primaryKey}/${uri}` };
    let document = item.uri.split('/')[item.uri.split('/').length - 1];
    let date = dateConverter(item.createdOn);
    let row: any = {};
    if (props.entity.length === 0) {
      row =
      {
        key: rowCounter++,
        identifier: <Tooltip
          title={isUri && item.uri}>{isUri ? '.../' + document : item.primaryKey}</Tooltip>,
        entity: item.itemEntityName,
        filetype: item.format,
        created: date,
        primaryKeyPath: path,
        detailview: <div className={styles.redirectIcons}>
          <Link to={{ pathname: `${path.pathname}`, state: { selectedValue: 'instance' } }} id={'instance'} data-cy='instance'>
            <Tooltip title={'Show detail on a separate page'}><FontAwesomeIcon icon={faExternalLinkAlt} size="sm" /></Tooltip>
          </Link>
          <Link to={{ pathname: `${path.pathname}`, state: { selectedValue: 'source' } }} id={'source'} data-cy='source'>
            <Tooltip title={'Show source on a separate page'}><FontAwesomeIcon icon={faCode} size="sm" /></Tooltip>
          </Link>
        </div>
      }
    } else {
      row =
      {
        key: rowCounter++,
        created: date,
        primaryKeyPath: path,
        detailview: <div className={styles.redirectIcons}>
          <Link to={{ pathname: `${path.pathname}`, state: { selectedValue: 'instance' } }} id={'instance'} data-cy='instance'>
            <Tooltip title={'Show detail on a separate page'}><FontAwesomeIcon icon={faExternalLinkAlt} size="sm" /></Tooltip>
          </Link>
          <Link to={{ pathname: `${path.pathname}`, state: { selectedValue: 'source' } }} id={'source'} data-cy='source'>
            <Tooltip title={'Show source on a separate page'}><FontAwesomeIcon icon={faCode} size="sm" /></Tooltip>
          </Link>
        </div>
      }

      // for (var propt in item.itemEntityProperties[0]) {
      //   if (isUri) {
      //     row.identifier =
      //       <Tooltip title={isUri ? item.uri : item.primaryKey}>{'.../' + document}</Tooltip>
      //   }
      //   if (parsedPayload.primaryKeys.includes(propt)) {
      //     row[propt.toLowerCase()] = item.itemEntityProperties[0][propt].toString();
      //   } else {
      //     row[propt.toLowerCase()] = item.itemEntityProperties[0][propt].toString();
      //   }
      // }

      for (let propt in item.itemEntityProperties[0]) {
        if (typeof item.itemEntityProperties[0][propt] !== 'object') {
          if (isUri) {
            row.identifier =
              <Link to={path}>
                <Tooltip title={isUri ? item.uri : item.primaryKey}>{'.../' + document}</Tooltip>
              </Link>
          }
          if (parsedPayload.primaryKeys.includes(propt)) {
            row[propt.toLowerCase()] = <Link to={path}>{item.itemEntityProperties[0][propt].toString()}</Link>
          } else {
            row[propt.toLowerCase()] = item.itemEntityProperties[0][propt].toString();
          }
        } else if (typeof item.itemEntityProperties[0][propt] === 'object') {
          //handle nested objects in the table, most likely using antd rowSpan and colSpan options. TODO


          // console.log('propt',propt)
          // console.log('item.itemEntityProperties[0][propt] ', item.itemEntityProperties[0][propt] )
          //  console.log(' row[propt.toLowerCase()] = item.itemEntityProperties[0][propt][0].toString();',  row[propt.toLowerCase()] = item.itemEntityProperties[0][propt][0].toString())
        }
      }
    }
    data.push(row)
  });

  const handleResize = index => (e, { size }) => {
    setColumns(columns => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return nextColumns
    })
  };

  const expandedRowRender = (rowId) => {
    const nestedColumns = [
      { title: 'Property', dataIndex: 'property', width: '30%' },
      { title: 'Value', dataIndex: 'value', width: '30%' },
      { title: 'View', dataIndex: 'view', width: '30%' },
    ];

    let nestedData: any[] = [];
    const parseJson = (obj: Object) => {
      let parsedData = new Array();
      for (var i in obj) {
        if (obj[i] !== null && typeof (obj[i]) === "object") {
          parsedData.push({
            key: counter++,
            property: i,
            children: parseJson(obj[i]),
            view: <Link to={{ pathname: `${rowId.primaryKeyPath.pathname}`, state: { id: obj[i] } }}
              data-cy='nested-instance'>
              <Tooltip title={'Show nested detail on a separate page'}><FontAwesomeIcon icon={faExternalLinkAlt}
                size="sm" /></Tooltip>
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

    if (props.data[rowId.key].format === 'json' && props.data[rowId.key].hasOwnProperty('extracted')) {
      Object.values(props.data[rowId.key].extracted.content[1]).forEach((content: any) => {
        nestedData = parseJson(content);

      });
    } else if (props.data[rowId.key].format === 'xml' && props.data[rowId.key].hasOwnProperty('extracted')) {
      let mappedObj = xmlParser(Object.values(props.data[rowId.key].extracted.content)[1]);
      let propertyValues = Object.values<any>(mappedObj);
      propertyValues.forEach((item: Object) => {
        nestedData = parseJson(item);
      })
    }

    return <Table
      rowKey="key"
      columns={nestedColumns}
      dataSource={nestedData}
      pagination={false}
      className={styles.nestedTable}
    />;
  }

  const headerRender = (col) => {
    setColumns(col)
  }

  return (
    <>
      <div className={styles.columnSelector} >
        <ColumnSelector title={checkedColumns} tree={treeColumns} headerRender={headerRender} />
      </div>
      <div className={styles.tabular}>
        <Table bordered components={components}
          className="search-tabular"
          rowKey="key"
          dataSource={data}
          columns={columns}
          pagination={false}
          expandedRowRender={expandedRowRender}
          data-cy="search-tabular"
        />
      </div>
    </>
  );
}

export default ResultTable