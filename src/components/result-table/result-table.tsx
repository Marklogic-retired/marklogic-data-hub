import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Resizable } from 'react-resizable'
import { Table, Tooltip } from 'antd';
import { dateConverter } from '../../util/date-conversion';
import { xmlParser } from '../../util/xml-parser';
import styles from './result-table.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";


const ResizeableTitle = props => {
  const {onResize, width, ...restProps} = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
      <Resizable
          width={width}
          height={0}
          onResize={onResize}
          draggableOpts={{enableUserSelectHack: false}}
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

  let title = new Array();
  let entityTitle: string[] = [];
  let data = new Array();
  let consdata = new Array();
  let col = new Array();
  let itemEntityName: string[] = [];
  let itemEntityProperties: any[] = [];
  let entityDef: any = {};
  let primaryKeys: string[] = [];
  let primaryKeyValue: string = '';
  let counter = 0;
  let rowCounter = 0;
  let createdOn = '';
  const [columns, setColumns] = useState<any[]>([]);


  //Iterate over each element in the payload and construct an array.
  props.data && props.data.forEach(item => {
    if (item.hasOwnProperty('extracted')) {
      if (item.format === 'json' && item.hasOwnProperty('extracted')) {
        createdOn = item.extracted.content[0].headers.createdOn;
        if (item.extracted.hasOwnProperty('content') && item.extracted.content[1]) {
          itemEntityName = Object.keys(item.extracted.content[1]);
          itemEntityProperties = Object.values<any>(item.extracted.content[1]);
        }
        ;
      }
      ;

      if (item.format === 'xml' && item.hasOwnProperty('extracted')) {
        let header = xmlParser(item.extracted.content[0]);
        let entity = xmlParser(item.extracted.content[1]);
        if (header && header.hasOwnProperty('headers')) {
          createdOn = header.headers.createdOn;
        }

        if (header && entity) {
          itemEntityName = Object.keys(entity);
          itemEntityProperties = Object.values<any>(entity);
        }
        ;
      }

      // Parameters for both JSON and XML.
      //Get entity definition.
      if (itemEntityName.length && props.entityDefArray.length) {
        entityDef = props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
      }

      //Get primary key if exists or set it to undefined.
      if (entityDef.primaryKey.length !== 0) {
        primaryKeyValue = encodeURIComponent(itemEntityProperties[0][entityDef.primaryKey]);
        primaryKeys.indexOf(entityDef.primaryKey) === -1 && primaryKeys.push(entityDef.primaryKey);
      } else {
        primaryKeyValue = 'uri';
      }

      if (entityTitle.length === 0) {
        primaryKeyValue === 'uri' ? entityTitle.push('Identifier') : entityTitle.push(entityDef.primaryKey);
        Object.keys(itemEntityProperties[0]).forEach((key, i) => {
          i < 5 && entityTitle.indexOf(key) === -1 && entityTitle.push(key);
        })
      }

      consdata.push({
        primaryKey: primaryKeyValue, itemEntityName: itemEntityName[0], itemEntityProperties: itemEntityProperties,
        uri: item.uri, format: item.format, createdOn: createdOn
      })
    }

  });

  useEffect(() => {
    //Construct title array for "All Entities" or an Entity.
    props.entity.length === 0 ? title = [...['Identifier', 'Entity', 'File Type', 'Created', 'Detail view']] : entityTitle.length === 0 ? title = [] : title = [...entityTitle, 'Created', 'Detail view'];

    //Construct table title.
    title.forEach((item, index) => {
      col.push(
          {
            title: item,
            dataIndex: item.replace(/ /g, '').toLowerCase(),
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
                  <div style={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{text}</div>
                </Tooltip>
            )
          }
      )
    });
    setColumns(col);
  }, [props.data]);

  const components = {
    header: {
      cell: ResizeableTitle,
    },
  };

  //Construct table data
  consdata.forEach((item) => {
    let isUri = item.primaryKey === 'uri';
    let uri = encodeURIComponent(item.uri);
    let path = {pathname: `/detail/${isUri ? '-' : item.primaryKey}/${uri}`};
    let document = item.uri.split('/')[item.uri.split('/').length - 1];
    let date = dateConverter(item.createdOn);
    let row: any = {};
    if (props.entity.length === 0) {
      row =
          {
            key: rowCounter++,
            identifier: <Link to={path}><Tooltip
                title={isUri && item.uri}>{isUri ? '.../' + document : item.primaryKey}</Tooltip></Link>,
            entity: item.itemEntityName,
            filetype: item.format,
            created: date,
            primaryKeyPath: path,
            detailview: <div className={styles.redirectIcons}>
              <Link to={{pathname: `${path.pathname}`, state: {selectedValue: 'instance'}}} data-cy='instance'>
                <Tooltip title={'Show detail on a separate page'}><FontAwesomeIcon icon={faExternalLinkAlt} size="sm"/></Tooltip>
              </Link>
              <Link to={{pathname: `${path.pathname}`, state: {selectedValue: 'source'}}} data-cy='source'>
                <Tooltip title={'Show source on a separate page'}><FontAwesomeIcon icon={faCode} size="sm"/></Tooltip>
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
              <Link to={{pathname: `${path.pathname}`, state: {selectedValue: 'instance'}}} data-cy='instance'>
                <Tooltip title={'Show detail on a separate page'}><FontAwesomeIcon icon={faExternalLinkAlt} size="sm"/></Tooltip>
              </Link>
              <Link to={{pathname: `${path.pathname}`, state: {selectedValue: 'source'}}} data-cy='source'>
                <Tooltip title={'Show source on a separate page'}><FontAwesomeIcon icon={faCode} size="sm"/></Tooltip>
              </Link>
            </div>
          }

      for (var propt in item.itemEntityProperties[0]) {
        if (isUri) {
          row.identifier =
              <Link to={path}>
                <Tooltip title={isUri ? item.uri : item.primaryKey}>{'.../' + document}</Tooltip>
              </Link>
        }
        if (primaryKeys.includes(propt)) {
          row[propt.toLowerCase()] = <Link to={path}>{item.itemEntityProperties[0][propt]}</Link>
        } else {
          row[propt.toLowerCase()] = item.itemEntityProperties[0][propt];
        }
      }
    }
    data.push(row);
  });

  const handleResize = index => (e, {size}) => {
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
      {title: 'Property', dataIndex: 'property', width: '30%'},
      {title: 'Value', dataIndex: 'value', width: '30%'},
      {title: 'View', dataIndex: 'view', width: '30%'},
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
            view: <Link to={{pathname: `${rowId.primaryKeyPath.pathname}`, state: {id: obj[i]}}}
                        data-cy='nested-instance'>
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


  return (
      <Table bordered components={components}
             className="search-tabular"
             rowKey="key"
             dataSource={data}
             columns={columns}
             pagination={false}
             expandedRowRender={expandedRowRender}
             data-cy="search-tabular"
      />
  );
}

export default ResultTable