
import React, { useState, useEffect } from "react";
import { Modal, Table, Icon, Popover } from "antd";
import styles from './source-to-entity-map.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faObjectUngroup, faList } from "@fortawesome/free-solid-svg-icons";
import {getResultsByQuery} from '../../../../util/search-service'

const SourceToEntityMap = (props) => {


    //Documentation links for using Xpath expressions
    const xPathDocLinks = <div className={styles.xpathDoc}><span id="doc">Documentation:</span>
        <div><ul>
            <li><a href="https://www.w3.org/TR/xpath/all/" target="_blank" className={styles.docLink}>XPath Expressions</a></li>
            <li><a href="https://docs.marklogic.com/guide/app-dev/TDE#id_99178" target="_blank" className={styles.docLink}>Extraction Functions</a></li>
            <li><a href="https://docs.marklogic.com/datahub/flows/dhf-mapping-functions.html" target="_blank" className={styles.docLink}>Mapping Functions</a></li>
        </ul></div>
    </div>;

    const onOk = () => {
        props.setMappingVisible(false)
        console.log('Map Saved!')
    }

    const onCancel = () => {
        props.setMappingVisible(false)
        console.log('Map cancelled!')
    }

    const columns = [
        {
          title: 'Name',
          dataIndex: 'key',
          key: 'key',
          sorter: (a:any, b:any) => a.key.length - b.key.length,
        },
        {
          title: 'Value',
          dataIndex: 'val',
          key: 'val',
          sorter: (a:any, b:any) => a.val.length - b.val.length,
        }
    ];

    const entityColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a:any, b:any) => a.name.length - b.name.length,
          },
          {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            sorter: (a:any, b:any) => a.type.length - b.type.length,
          },
          {
            title: <span>XPath Expression <Popover
            content={xPathDocLinks}
            trigger="click"
            placement="top" ><Icon type="question-circle" className={styles.questionCircle} theme="filled" /></Popover>
            </span>,
            dataIndex: 'xPathExpression',
            key: 'xPathExpression'
          },
          {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            sorter: (a:any, b:any) => a.value.length - b.value.length,
          }

    ]

    const sData = [{key: "id", val: 118},
    {key: "transactionDate", val: "08/29/2018"},
    {key: "firstName", val: "Anjanette"},
    {key: "lastName", val: "Reisenberg"},
    {key: "gender", val: "F"},
    {key: "phone", val: "(213)-405-4543"}
    ]

 



return (<Modal
        visible={props.mappingVisible}
        // okText='Yes'
        // cancelText='No'
        //title={props.mapName}
        onOk={() => onOk()}
        onCancel={() => onCancel()}
        width={1300}
        maskClosable={false}
        footer={null}
        wrapClassName={styles.mapContainer}
        >
            <div className={styles.header}>
                <p className={styles.headerTitle}>{props.mapName}</p>
            </div>
        
        <div className={styles.parentContainer}>
        
        <div className={styles.sourceContainer}>
            <div className={styles.sourceDetails}>
                <p className={styles.sourceName}
                ><i><FontAwesomeIcon icon={faList} size="sm" className={styles.sourceDataIcon}
                /></i> Source Data <Icon type="question-circle" className={styles.questionCircle} theme="filled" /></p>
            </div>
        <Table
        pagination={false}
        className={styles.sourceTable}
        //size="small"
        columns={columns}
        dataSource={sData}
        tableLayout="unset"
        rowKey="name"
        />
        </div>

        <div className={styles.entityContainer}>
        <div className={styles.entityDetails}>
                <p className={styles.entityName}><i><FontAwesomeIcon icon={faObjectUngroup } size="sm" className={styles.entityIcon}/></i> Entity: {props.entityName}</p>
            </div>
        <Table
        pagination={false}
        className={styles.entityTable}
        //size="small"
        tableLayout="unset"
        columns={entityColumns}
        dataSource={props.data}
        rowKey="name"
        />
        </div>
        </div>
        </Modal>

);

}

export default SourceToEntityMap;