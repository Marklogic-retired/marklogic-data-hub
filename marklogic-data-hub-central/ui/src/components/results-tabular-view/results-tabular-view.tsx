import React, { useContext, useState, useEffect } from 'react';
import { MLTable } from '@marklogic/design-system';
import QueryExport from "../query-export/query-export";
import { AuthoritiesContext } from "../../util/authorities";
import styles from './results-tabular-view.module.scss';
import ColumnSelector from '../../components/column-selector/column-selector';
import { Tooltip } from 'antd';
import { SearchContext } from '../../util/search-context';

interface Props {
    data: any;
    entityPropertyDefinitions: any[];
    selectedPropertyDefinitions: any[];
    columns: any;
    hasStructured: boolean;
}

const ResultsTabularView = (props) => {
    const [popoverVisibility, setPopoverVisibility] = useState<boolean>(false);

    const {
        searchOptions,
        setSelectedTableProperties,
      } = useContext(SearchContext);

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
                    onCell: () => {
                        return {
                            style: {
                                whiteSpace: 'nowrap',
                                maxWidth: 150,
                            }
                        }
                    },
                    render: (value) => {
                        if (Array.isArray(value) && value.length > 1) {
                            let values = new Array();
                            value.forEach(item => {
                                let title = item.toString();
                                if (item && title && title.length > 0) {
                                    values.push(
                                        <Tooltip
                                            title={title}>
                                            <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{item}</div>
                                        </Tooltip>
                                    )
                                }
                            })
                            return {
                                children: values
                            }
                        } else {
                            return {
                                children: (
                                    <Tooltip
                                        title={value}>
                                        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{value}</div>
                                    </Tooltip>
                                )
                            }
                        }
                    },
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
    const dataSourceWithoutXml = props.data.filter((item: any) => {
        if (item.hasOwnProperty('entityProperties') && item.format === 'json') {
            return item;
        }
    });

    const dataSource = dataSourceWithoutXml.map((item) => {
        //if(item.hasOwnProperty('entityProperties') && item.format === 'json'){
        return tableDataRender(item.entityProperties);
        //}
    });

    useEffect(() => {
        if (props.columns && props.columns.length > 0 && searchOptions.selectedTableProperties.length === 0) {
            setSelectedTableProperties(props.columns)
        }
    }, [props.columns])

    return (
        <>
            <div className={styles.icon}>
                <div className={styles.queryExport}>
                    {canExportQuery && <QueryExport hasStructured={props.hasStructured} columns={props.columns} />}
                </div>
                <div className={styles.columnSelector} data-cy="column-selector">
                    <ColumnSelector popoverVisibility={popoverVisibility} setPopoverVisibility={setPopoverVisibility} entityPropertyDefinitions={props.entityPropertyDefinitions} selectedPropertyDefinitions={props.selectedPropertyDefinitions} setColumnSelectorTouched={props.setColumnSelectorTouched} columns={props.columns} />
                </div>
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