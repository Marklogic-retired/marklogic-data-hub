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
import { tableParser, headerParser, deepCopy, reconstructHeader, toStringArray } from '../../util/data-conversion';
import ReactDragListView from 'react-drag-listview'


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
  const [columns, setColumns] = useState<any[]>([]);
  const [checkedColumns, setCheckedColumns] = useState<any[]>([]);
  const [treeColumns, setTreeColumns] = useState<any[]>([]);

  const allEntitiesColumns = [{ title: 'Entity', key: '0-1' }, { title: 'File Type', key: '0-2' }];
  let previousColumns = new Array();
  let parsedPayload = tableParser(props);
  let arrayOfTitles = parsedPayload.data[0] && parsedPayload.data[0].itemEntityProperties[0];
  let nestedColumns = new Set();

  const getData = (payload: Array<Object>, isNested: boolean) => {
    let rowCounter = 0;
    let nested = [];
    let nestedId = 0;

    const parseData = (payload) => {
      let data = new Array();
      payload.forEach((item) => {
        let isUri = item.primaryKey === 'uri';
        let uri = encodeURIComponent(item.uri);
        let path = { pathname: `/detail/${isUri ? '-' : item.primaryKey}/${uri}` };
        let document = item.uri.split('/')[item.uri.split('/').length - 1];
        let date = dateConverter(item.createdOn);
        let row: any = {};
        let detailView =
          <div className={styles.redirectIcons}>
            <Link to={{ pathname: `${path.pathname}`, state: { selectedValue: 'instance' } }} id={'instance'}
              data-cy='instance'>
              <Tooltip title={'Show detail on a separate page'}><FontAwesomeIcon icon={faExternalLinkAlt} size="sm" /></Tooltip>
            </Link>
            <Link to={{ pathname: `${path.pathname}`, state: { selectedValue: 'source' } }} id={'source'}
              data-cy='source'>
              <Tooltip title={'Show source on a separate page'}><FontAwesomeIcon icon={faCode} size="sm" /></Tooltip>
            </Link>
          </div>

        if (props.entity.length === 0) {
          row =
          {
            key: rowCounter++,
            identifier: <Tooltip title={isUri && item.uri}>{isUri ? '.../' + document : item.primaryKey}</Tooltip>,
            entity: item.itemEntityName,
            filetype: item.format,
            created: date,
            primaryKeyPath: path,
            detailview: detailView
          }
        } else {
          row =
          {
            key: rowCounter++,
            created: date,
            primaryKeyPath: path,
            detailview: detailView,
            primaryKey: item.primaryKey
          }

          for (let propt in item.itemEntityProperties[0]) {
            if (isUri) {
              row.identifier = <Tooltip title={isUri ? item.uri : item.primaryKey}>{'.../' + document}</Tooltip>
            }
            if (parsedPayload.primaryKeys.includes(propt)) {
              row[propt.toLowerCase()] = item.itemEntityProperties[0][propt].toString();
            } else {
              if (typeof item.itemEntityProperties[0][propt] === 'object') {
                nested = item.itemEntityProperties[0][propt]
              } else {
                row[propt.toLowerCase()] = item.itemEntityProperties[0][propt].toString();
              }
            }
          }
        }

        if (isNested) {
          //if row has array of nested objects
          if (nested && nested instanceof Array && nested.length > 0) {
            nested.forEach((items, index) => {
              let parentRow = { ...row };
              let keys = Object.keys(items);
              let values = new Array<String>();
              if (typeof items === 'object' && keys.length === 1) {
                values = Object.values(items);
              }
              if(values.length){
                for (let key of Object.keys(values[0])) {
                  parentRow[key.toLowerCase()] = values[0][key].toString();
                  nestedColumns.add(key);
                }
              }
              parentRow.key = rowCounter++;
              parentRow.nestedId = nestedId;
              parentRow.nestedColumns = nestedColumns;
              parentRow.nested = nested;
              if (index === 0) {
                parentRow.isNested = true;
              }
              data.push(parentRow)
            })
            nestedId++;
            //if row has a nested object
          } else if (nested && !(nested instanceof Array)) {
            let parentRow = { ...row };
            let keys = Object.keys(nested);
            let values = [new Array<String>()];
            if (typeof nested === 'object' && keys.length === 1) {
              values = Object.values(nested);
            }
            for (let key of Object.keys(values[0])) {
              parentRow[key.toLowerCase()] = values[0][key].toString();
            }
            parentRow.key = rowCounter++;
            data.push(parentRow)
            //if row doesn't have nested objects
          } else {
            data.push(row)
          }
        } else {
          data.push(row)
        }
      });
      return data;
    }
    return parseData(payload);
  }

  data = getData(parsedPayload.data, true);

  const tableHeader = (columns) => {
    let col = new Array();
    let set = new Set();
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
              onResize: handleResize(item.title),
            }),
            onCell: () => {
              return {
                style: {
                  whiteSpace: 'nowrap',
                  maxWidth: 150,
                }
              }
            },
            render: (value, row, index) => {
              const obj = {
                children: (
                  <Tooltip
                    title={value && value.length > 50 && value.substring(0, 301).concat('...\n\n(View document details to see all of this text.)')}>
                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{value}</div>
                  </Tooltip>
                ),
                props: {
                  rowSpan: 1,
                }
              };

              if (row.hasOwnProperty('nestedId') && !nestedColumns.has(item.title)) {
                row.hasOwnProperty('isNested') && set.add(index);
                set.has(index) ? obj.props.rowSpan = row.nested.length : obj.props.rowSpan = 0;
              }
              return obj;
            },
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

    props.entity.length === 0 ? listOfColumns = setPrimaryKeyColumn(allEntitiesColumns) : listOfColumns = setPrimaryKeyColumn(headerParser(arrayOfTitles));
    if (props.entity.length === 0 || (props.entity.length !== 0 && parsedPayload.primaryKeys.length === 0)) {
      listOfColumns.unshift({ title: 'Identifier', key: '0-i' });
    }
    if (listOfColumns && listOfColumns.length > 0) {
      listOfColumns.push({ title: 'Created', key: '0-c' })
      listOfColumns.push({ title: 'Detail view', key: '0-d' });
      previousColumns = [...tableHeader(listOfColumns)];
    }

    let header = tableHeader(listOfColumns);
    //set table data
    let defaultColumnData = header.slice(0, 5).concat(header[header.length - 1]);
    header.length <= 5 ? setColumns(header.slice(0, 5)) : setColumns(defaultColumnData);
    //set popover tree data
    setTreeColumns(previousColumns);
    //set popover tree selected checkboxes data
    setCheckedColumns(header.slice(0, 5).concat(header[header.length - 1]));
  }, [props.data]);

  const components = {
    header: {
      cell: ResizeableTitle,
    },
  };

  const mergeRows = (header: Array<Object>) => {
    let data: Array<Object>;
    let hasNested: boolean = header.some((item: Object) => item.hasOwnProperty('children'));
    data = hasNested ? getData(parsedPayload.data, true) : getData(parsedPayload.data, false);
    return data;
  }

  data = mergeRows(columns);
  console.log(data)

  const handleResize = title => (e, { size }) => {
    let index = 0;
    setColumns(columns => {
      console.log(columns)
      for (let i = 0; i < columns.length; i++) {
        if (title == columns[i].title)
          index = i;
      }
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return nextColumns
    })
  };

  const dragProps = {
    onDragEnd(fromIndex: number, toIndex: number) {
      if (fromIndex > 0 && toIndex > 0) {
        const header = deepCopy(columns);
        const tree = deepCopy(treeColumns);
        const colItem = header.splice(fromIndex - 1, 1)[0];
        const treeItem = tree.splice(fromIndex - 1, 1)[0];
        header.splice(toIndex - 1, 0, colItem);
        tree.splice(toIndex - 1, 0, treeItem);
        let updatedHeader = reconstructHeader(deepCopy(header), toStringArray(checkedColumns))
        setColumns(updatedHeader);
        setTreeColumns(tree)
      }
    },
    nodeSelector: "th",
    handleSelector: 'span.ant-table-column-title',
  };


  const expandedRowRender = (rowId) => {
    console.log(rowId)
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
    setCheckedColumns(deepCopy(col))
  }

  return (
    <>
      <div className={styles.columnSelector} >
        <ColumnSelector title={checkedColumns} tree={treeColumns} headerRender={headerRender} />
      </div>
      <ReactDragListView.DragColumn {...dragProps}>
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
      </ReactDragListView.DragColumn>
    </>
  );
}

export default ResultTable