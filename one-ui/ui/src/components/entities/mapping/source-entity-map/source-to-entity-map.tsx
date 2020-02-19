
import React, { useState, useEffect } from "react";
import { Modal, Table, Divider, Icon } from "antd";
import styles from './source-to-entity-map.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faObjectUngroup, faList } from "@fortawesome/free-solid-svg-icons";

const SourceToEntityMap = (props) => {

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
          dataIndex: 'name',
          key: 'name',
          sorter: (a:any, b:any) => a.name.length - b.name.length,
        },
        {
          title: 'Value',
          dataIndex: 'value',
          key: 'value',
          sorter: (a:any, b:any) => a.value.length - b.value.length,
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
            title: 'XPath Expression',
            dataIndex: 'xPathExpression',
            key: 'xPathExpression',
            sorter: (a:any, b:any) => a.xPathExpression.length - b.xPathExpression.length,
          },
          {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            sorter: (a:any, b:any) => a.value.length - b.value.length,
          }

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
        className={styles.mapContainer}
        >
            <div className={styles.header}>
                <p className={styles.headerTitle}>{props.mapName}</p>
            </div>
        
        <div className={styles.parentContainer}>
        
        <div className={styles.sourceContainer}>
            <div className={styles.sourceDetails}>
                <p className={styles.sourceName}
                ><i><FontAwesomeIcon icon={faList} size="sm" className={styles.entityIcon}
                /></i> Source Data <Icon type="question-circle" className={styles.questionCircle} theme="filled" /></p>
            </div>
        <Table
        //pagination={{showSizeChanger: true, pageSizeOptions:pageSizeOptions}}
        className={styles.sourceTable}
        //size="small"
        columns={columns}
        dataSource={props.data}
        tableLayout="unset"
        rowKey="name"
        />
        </div>

        <div className={styles.entityContainer}>
        <div className={styles.entityDetails}>
                <p className={styles.entityName}><i><FontAwesomeIcon icon={faObjectUngroup } size="sm" className={styles.entityIcon}/></i> Entity: {props.entityName}</p>
            </div>
        <Table
        //pagination={{showSizeChanger: true, pageSizeOptions:pageSizeOptions}}
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