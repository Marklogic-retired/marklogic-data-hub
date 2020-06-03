import React, { useContext } from 'react';
import {MLTable} from '@marklogic/design-system';
import QueryExport from "../query-export/query-export";
import {AuthoritiesContext} from "../../util/authorities";
import styles from './results-tabular-view.module.scss';



interface Props {
    data: any;
    entityPropertyDefinitions: any[];
    selectedPropertyDefinitions: any[];
    columns: any;
    hasStructured: boolean;
}

const ResultsTabularView = (props) => {

    const authorityService = useContext(AuthoritiesContext);
    const canExportQuery = authorityService.canExportEntityInstances();

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

    const tableHeaders = tableHeaderRender(selectedTableColumns);

    const tableDataRender = (item) => {
        let dataObj = {};
        for (let subItem of item) {
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
          return tableDataRender(item.entityProperties);
        //}
    });

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
           pagination={false}
        />
            </div>
        </>
    )
}

export default ResultsTabularView
