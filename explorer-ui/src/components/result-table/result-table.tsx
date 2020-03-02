import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Resizable } from 'react-resizable'
import { Table, Tooltip, Icon } from 'antd';
import { UserContext } from '../../util/user-context';
import { SearchContext } from '../../util/search-context';
import { dateConverter } from '../../util/date-conversion';
import { updateTablePreferences, getUserPreferences } from '../../services/user-preferences';
import { xmlParser } from '../../util/xml-parser';
import styles from './result-table.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import ColumnSelector from '../../components/column-selector/column-selector';
import { tableParser, headerParser, deepCopy, reconstructHeader, toStringArray, headerPropsParser } from '../../util/data-conversion';
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
};

const DEFAULT_ALL_ENTITIES_HEADER = [
  {
    title: 'Identifier',
    key: '0-i',
    visible: true,
    width: 150
  },
  {
    title: 'Entity',
    key: '0-1',
    visible: true,
    width: 150
  },
  {
    title: 'File Type',
    key: '0-2',
    visible: true,
    width: 150
  },
  {
    title: 'Created',
    key: '0-c',
    visible: true,
    width: 150
  },
  {
    title: 'Detail View',
    key: '0-d',
    visible: true,
    width: 150
  },
];

const DETAIL_HEADER_OBJ = {
  title: 'Detail View',
  key: '0-d',
  visible: true,
  width: 150
}

const ResultTable: React.FC<Props> = (props) => {
  const { searchOptions } = useContext(SearchContext);
  const { user, setAlertMessage } = useContext(UserContext);
  const [defaultColumns, setDefaultColumns] = useState<any[]>([]);
  const [renderColumns, setRenderColumns] = useState<any[]>([]);
  const [renderTableData, setRenderTableData] = useState<any[]>([]);
  const [checkedColumns, setCheckedColumns] = useState<any[]>([]);
  const [treeColumns, setTreeColumns] = useState<any[]>([]);
  let counter = 0;
  let parsedPayload = tableParser(props);

  useEffect(() => {
    if (parsedPayload === null) {
      setAlertMessage('Error', 'No instance information in payload');
    }
    if (props.data) {
      if (searchOptions.entityNames.length === 0) {
        // All Entities
        let newTableData = formatTableData(parsedPayload.data, true);
        let tableColumns = getUserPref('all');
        let renderHeader = tableHeader(tableColumns ? tableColumns['columns'] : DEFAULT_ALL_ENTITIES_HEADER, '');
        let newDefaultColumns = delimitHeader(renderHeader);

        if (!tableColumns) {
          updateTablePreferences(user.name, 'all', newDefaultColumns)
        }

        setRenderColumns(renderHeader)
        setRenderTableData(newTableData);
        setTreeColumns(renderHeader);
        setCheckedColumns(renderHeader);
        setDefaultColumns(newDefaultColumns);
      } else {
        // An Entity is selected
        let tableColumns = getUserPref(searchOptions.entityNames[0]);
        let newRenderColumns: any[] = [];

        if (parsedPayload.data.length !== 0) {
          //pass entityDefArray of entities and current selected entity
          let newColumns = setPrimaryKeyColumn(headerPropsParser(props.entityDefArray, searchOptions.entityNames))
          newColumns.push(DETAIL_HEADER_OBJ);
          if (newColumns.length > 5) {
            newRenderColumns = newColumns.slice(0, 4);
            newRenderColumns.push(DETAIL_HEADER_OBJ);
          } else {
            newRenderColumns = newColumns;
          }

          if (!tableColumns) {
            updateTablePreferences(user.name, searchOptions.entityNames[0], newRenderColumns)
          }

          let renderHeader = tableHeader(tableColumns ? tableColumns['columns'] : newRenderColumns, '');

          setRenderColumns(renderHeader);
          setRenderTableData(mergeRows(renderHeader));
          setTreeColumns(tableHeader(newColumns, ''));
          setCheckedColumns(renderHeader);
          setDefaultColumns(newColumns);
        } else {
          setRenderColumns([]);
          setRenderTableData([]);
          setTreeColumns([]);
          setCheckedColumns([]);
          setDefaultColumns([]);
        }
      }
    }
  }, [props.data]);

  const formatTableData = (payload: Array<Object>, isNested: boolean) => {
    let rowCounter = 0;
    let nested: any[] = [];
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

        if (searchOptions.entityNames.length === 0) {
          row =
          {
            key: rowCounter,
            identifier: <Tooltip title={isUri && item.uri}>{isUri ? '.../' + document : item.primaryKey}</Tooltip>,
            entity: item.itemEntityName,
            filetype: item.format,
            created: date,
            primaryKeyPath: path,
            detailview: detailView,
            primaryKey: item.primaryKey
          }
        } else {
          row =
          {
            key: rowCounter,
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
              if (Array.isArray(item.itemEntityProperties[0][propt])) {
                if (item.itemEntityProperties[0][propt].length > 0) {
                  let objectKeys = Object.keys(item.itemEntityProperties[0][propt][0]);
                  let objKeyMap = {}

                  objectKeys.forEach(item => {
                    objKeyMap[item] = propt + '_' + item;
                  });
                  nested = item.itemEntityProperties[0][propt].map(item => {
                    return renameKeys(objKeyMap, item);
                  });
                }

              } else if (typeof item.itemEntityProperties[0][propt] === 'object') {
                let objectKeys = Object.keys(item.itemEntityProperties[0][propt]);
                let objKeyMap = {}
                objectKeys.forEach(item => {
                  objKeyMap[item] = propt + '_' + item;
                });
                let reMappedObject = renameKeys(objKeyMap, item.itemEntityProperties[0][propt]);
                row = { ...row, ...reMappedObject }
              } else {
                row[propt.toLowerCase()] = item.itemEntityProperties[0][propt].toString();
              }
            }
          }
        }

        if (isNested) {
          //if row has array of nested objects
          if (nested && nested.length > 0) {
            nested.forEach((items, index) => {
              let duplicateRow = { ...row };
              let keys = Object.keys(items);
              let values = new Array<String>();
              if (Array.isArray(items)) {

              }

              if (values.length) {
                for (let key of Object.keys(values[0])) {
                  duplicateRow[key.toLowerCase()] = values[0][key].toString();
                }
              }
              duplicateRow.key = rowCounter;
              duplicateRow.nestedId = index;
              duplicateRow.lastNestedIndex = nested.length - 1
              if (index === 0) {
                duplicateRow.isNested = true;
              }
              data.push({ ...duplicateRow, ...nested[index] })
              rowCounter++;
            })
            //nestedId++;
            //if row has a nested object
          }
          else {
            rowCounter++;
            data.push(row)
          }
        } else {
          rowCounter++;
          data.push(row)
        }
      });
      return data;
    }
    return parseData(payload);
  }

  const renameKeys = (keysMap, obj) => {
    return Object
      .keys(obj)
      .reduce((acc, key) => ({
        ...acc,
        ...{ [keysMap[key] || key]: obj[key] }
      }), {});
  }

  const tableHeader = (columns, parent) => {
    let col = new Array();
    let set = new Set();

    columns.forEach((item, index) => {
      if (item.hasOwnProperty('children')) {
        col.push({
          title: item.title,
          key: item.key,
          visible: true,
          children: tableHeader(item.children, item.title),
        })
      } else {
        col.push(
          {
            title: item.title,
            dataIndex: parent ? parent + '_' + item.title.replace(/ /g, '').toLowerCase() : item.title.replace(/ /g, '').toLowerCase(),
            key: item.key,
            visible: item.hasOwnProperty('visible') ? item.visible : true,
            width: item.hasOwnProperty('width') ? item.width : 150,
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


              if (row.hasOwnProperty('nestedId')) {
                // Works, but need to differentiate row cells that have
                // nested array of objects
                // if (row.nestedId === 0) {
                //   obj.props.rowSpan = row.lastNestedIndex;
                // } else {
                //   obj.props.rowSpan = 0;
                // }
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

  const components = {
    header: {
      cell: ResizeableTitle,
    },
  };

  const mergeRows = (header: Array<Object>) => {
    let data: Array<Object>;
    let hasNested: boolean = header.some((item: Object) => item.hasOwnProperty('children'));
    data = hasNested ? formatTableData(parsedPayload.data, true) : formatTableData(parsedPayload.data, false);
    return data;
  }

  const handleResize = title => (e, { size }) => {
    let index = 0;
    setRenderColumns(columns => {
      for (let i = 0; i < columns.length; i++) {
        if (title == columns[i].title)
          index = i;
      }

      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      updateUserPref(nextColumns);
      return nextColumns
    })
  };

  const dragProps = {
    onDragEnd(fromIndex: number, toIndex: number) {
      if (fromIndex > 0 && toIndex > 0) {
        const header = deepCopy(renderColumns);
        const tree = deepCopy(treeColumns);
        const colItem = header.splice(fromIndex - 1, 1)[0];
        const treeItem = tree.splice(fromIndex - 1, 1)[0];
        header.splice(toIndex - 1, 0, colItem);
        tree.splice(toIndex - 1, 0, treeItem);
        updateUserPref(header);
        setRenderColumns(header);
        setTreeColumns(tree)
        //setDefaultColumns(delimitedHeader);
      }
    },
    nodeSelector: "th",
    handleSelector: 'span.ant-table-column-title',
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

    let index: string = '';
    for (let i in parsedPayload.data) {
      if (parsedPayload.data[i].primaryKey == rowId.primaryKey) {
        index = i;
      }
    }

    nestedData = parseJson(parsedPayload.data[index].itemEntityProperties[0]);

    return <Table
      rowKey="key"
      columns={nestedColumns}
      dataSource={nestedData}
      pagination={false}
      className={styles.nestedTable}
    />;
  }


  const headerRender = (col) => {
    updateUserPref(col);
    setRenderColumns(col);
    setCheckedColumns(deepCopy(col));
    setRenderTableData(mergeRows(col));
  }

  const updateTreeColumns = (columns) => {
    setTreeColumns(columns);
  }

  const delimitHeader = (header: any[]) => {
    return header.map((column, index) => {
      let newCol = { ...column }
      delete newCol['onHeaderCell']
      delete newCol['onCell']
      delete newCol['render']
      return newCol
    });
  };

  const getUserPref = (entity: string) => {
    let userPref = getUserPreferences(user.name);
    if (userPref) {
      let values = JSON.parse(userPref);
      if (values && values.hasOwnProperty('resultTableColumns')) {
        return values.resultTableColumns.find(item => item.name === entity);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  const updateUserPref = (header: any[]) => {
    let delimitedHeader = delimitHeader(header);
    let entity = 'all';

    if (searchOptions.entityNames.length > 0) {
      entity = searchOptions.entityNames[0]
    }

    updateTablePreferences(user.name, entity, delimitedHeader);
  }

  let icons: any = [];
  let expIcons: any = [];
  function expandIcon({ expanded, expandable, record, onExpand }) {
    if (expanded && record.nestedColumns) {
      expIcons.push(record.primaryKey);
    }
    if (record.nestedColumns && icons.indexOf(record.primaryKey) != -1 && expIcons.indexOf(record.primaryKey) == -1) {
      return null;
    }
    icons.push(record.primaryKey);
    return (
      <a style={{ color: 'black' }} onClick={e => onExpand(record, e)}>
        {expanded ? <Icon type="down" /> : <Icon type="right" />}
      </a>
    );
  }

  return (
    <>
      <div className={styles.columnSelector} data-cy="column-selector">
        <ColumnSelector title={checkedColumns} tree={treeColumns} headerRender={headerRender} updateTreeColumns={updateTreeColumns} />
      </div>
      <ReactDragListView.DragColumn {...dragProps}>
        <div className={styles.tabular}>
          <Table bordered components={components}
            className="search-tabular"
            rowKey="key"
            dataSource={renderTableData}
            columns={renderColumns}
            pagination={false}
            expandedRowRender={expandedRowRender}
            expandIcon={expandIcon}
            //scroll={{y:3/4*(window.innerHeight)}}
            data-cy="search-tabular"
          />
        </div>
      </ReactDragListView.DragColumn>
    </>
  );
}

export default ResultTable