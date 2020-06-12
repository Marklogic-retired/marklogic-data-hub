import React, { useContext } from 'react';
import {MLTable} from '@marklogic/design-system';
import QueryExport from "../query-export/query-export";
import {AuthoritiesContext} from "../../util/authorities";
import styles from './results-tabular-view.module.scss';
import { tableParser } from '../../util/data-conversion';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import { faExternalLinkAlt, faCode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
    data: any;
    entityPropertyDefinitions: any[];
    selectedPropertyDefinitions: any[];
    entityDefArray: any[];
    columns: any;
    hasStructured: boolean;
}

const ResultsTabularView = (props) => {

    const authorityService = useContext(AuthoritiesContext);
    const canExportQuery = authorityService.canExportEntityInstances();
    let counter = 0;
    let parsedPayload = tableParser(props);

    let selectedTableColumns = props.selectedPropertyDefinitions;

    const tableHeaderRender = (selectedTableColumns) => {
        const columns = selectedTableColumns.map((item) => {
            if (!item.hasOwnProperty('properties')) {
                return {
                    dataIndex: item.propertyPath,
                    key: item.propertyPath,
                    title: item.propertyLabel,
                    type: item.datatype,
                }
            } else {
                return {
                    dataIndex: item.propertyPath,
                    key: item.propertyPath,
                    title: item.propertyLabel,
                    type: item.datatype,
                    columns: tableHeaderRender(item.properties)
                }
            }
        })
        return columns;
    }


    const updatedtableHeader = () => {
        let header = tableHeaderRender(selectedTableColumns);
        let detailView = {
            dataIndex: 'detailView',
            key: 'key',
            title: 'Detail View'
        }
        header.push(detailView);
        return header;
    }

    const tableHeaders = updatedtableHeader();


    const tableDataRender = (item) => {
        let dataObj = {};
        if (!Array.isArray(item) && item.hasOwnProperty('entityProperties')) {

            let itemEntityName: string[] = [];
            let itemEntityProperties: any[] = [];
            let entityDef: any = {};
            let primaryKeyValue: string = '';
            let primaryKeys: string[] = [];
            let entityTitle: string[] = [];
            if (item.extracted.hasOwnProperty('content') && item.extracted.content[1]) {
                itemEntityName = Object.keys(item.extracted.content[1]);
                itemEntityProperties = Object.values<any>(item.extracted.content[1]);
            };
            if (itemEntityName.length && props.entityDefArray?.length) {
                entityDef = props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
            }

            //Get primary key if exists or set it to undefined.
            if (entityDef.primaryKey?.length !== 0) {
                primaryKeyValue = encodeURIComponent(itemEntityProperties[0][entityDef.primaryKey]);
                primaryKeys.indexOf(entityDef.primaryKey) === -1 && primaryKeys.push(entityDef.primaryKey);
            } else {
                primaryKeyValue = 'uri';
            }

            if (entityTitle.length === 0) {
                primaryKeyValue === 'uri' ? entityTitle.push('Identifier') : entityTitle.push(entityDef.primaryKey);
            }
            let isUri = primaryKeyValue === 'uri';
            let uri = encodeURIComponent(item.uri);
            let path = { pathname: `/detail/${isUri ? '-' : primaryKeyValue}/${uri}` };
            let detailView =
                <div className={styles.redirectIcons}>
                    <Link to={{ pathname: `${path.pathname}`, state: { selectedValue: 'instance' } }} id={'instance'}
                        data-cy='instance'>
                        <Tooltip title={'Show detail on a separate page'}><FontAwesomeIcon icon={faExternalLinkAlt} size="sm" data-testid={`${primaryKeyValue}-detailOnSeparatePage`}/></Tooltip>
                    </Link>
                    <Link to={{ pathname: `${path.pathname}`, state: { selectedValue: 'source' } }} id={'source'}
                        data-cy='source'>
                        <Tooltip title={'Show source on a separate page'}><FontAwesomeIcon icon={faCode} size="sm" data-testid={`${primaryKeyValue}-sourceOnSeparatePage`}/></Tooltip>
                    </Link>
                </div>
            let options = {
                primaryKey: primaryKeyValue,
                uri: item.uri,
                primaryKeyPath: path,
                detailView: detailView
            }
            dataObj = { ...dataObj, ...options };
        }
        let tempItem = !Array.isArray(item) && item?.hasOwnProperty('entityProperties') ? item.entityProperties : item;

        for (let subItem of tempItem) {
            if (!Array.isArray(subItem)) {
                if (!Array.isArray(subItem.propertyValue) || typeof (subItem.propertyValue[0]) === 'string') {
                    dataObj[subItem.propertyPath] = subItem.propertyValue;
                } else {
                    let dataObjArr: any[] = [];
                    for (let el of subItem.propertyValue) {
                        dataObjArr.push(tableDataRender(el));
                    }
                    dataObj[subItem.propertyPath] = dataObjArr;
                }
            } else {
                return tableDataRender(subItem)
            }
        }

        return dataObj;
    }


    /* Temporary array to make it work with xml documents */
    const dataSourceWithoutXml = props.data.filter((item:any) => {
        if(item.hasOwnProperty('entityProperties') && item.format === 'json'){
            return item;
        }
    });

    const dataSource = dataSourceWithoutXml.map((item) => {
        //if(item.hasOwnProperty('entityProperties') && item.format === 'json'){
          return tableDataRender(item);
        //}
    });

    const expandedRowRender = (rowId) => {

        const nestedColumns = [
            { title: 'Property', dataIndex: 'property', width: '33%' },
            { title: 'Value', dataIndex: 'value', width: '34%' },
            { title: 'View', dataIndex: 'view', width: '33%' },
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

        return <MLTable
            rowKey="key"
            columns={nestedColumns}
            dataSource={nestedData}
            pagination={false}
            className={styles.nestedTable}
        />
    }

    return (
        <>
        <div className={styles.queryExport}>
            { canExportQuery && <QueryExport hasStructured={props.hasStructured} columns={props.columns}/> }
        </div>
            <div className={styles.tabular}>
        <MLTable bordered
           data-testid='result-table'
           dataSource={dataSource}
           columns={tableHeaders}
           expandedRowRender={expandedRowRender}
           pagination={false}
        />
            </div>
        </>
    )
}

export default ResultsTabularView
