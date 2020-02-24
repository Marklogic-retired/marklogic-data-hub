
import React, { useState, useEffect } from "react";
import { Modal, Table, Icon, Popover, Input, Button } from "antd";
import styles from './source-to-entity-map.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faObjectUngroup, faList } from "@fortawesome/free-solid-svg-icons";

const SourceToEntityMap = (props) => {

    const [mapExp, setMapExp] = useState({});

    const [mapExpTouched, setMapExpTouched] = useState(false);

    //Documentation links for using Xpath expressions
    const xPathDocLinks = <div className={styles.xpathDoc}><span id="doc">Documentation:</span>
        <div><ul>
            <li><a href="https://www.w3.org/TR/xpath/all/" target="_blank" className={styles.docLink}>XPath Expressions</a></li>
            <li><a href="https://docs.marklogic.com/guide/app-dev/TDE#id_99178" target="_blank" className={styles.docLink}>Extraction Functions</a></li>
            <li><a href="https://docs.marklogic.com/datahub/flows/dhf-mapping-functions.html" target="_blank" className={styles.docLink}>Mapping Functions</a></li>
        </ul></div>
    </div>;

    const { TextArea } = Input;

    const onOk = () => {
        props.setMappingVisible(false)
        console.log('Map Saved!')
    }

    const onCancel = () => {
        props.setMappingVisible(false)
        console.log('Map cancelled!')
    }

    const handleMapExp = (name,event) => {
        setMapExpTouched(true);
        setMapExp({...mapExp, [name]: event.target.value});
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
            key: 'xPathExpression',
            render: (text, row)=> (<div className={styles.mapExpContainer}>
                <TextArea 
                className={styles.mapExpression}
                value={mapExp[row.name]}
                onChange={(e) => handleMapExp(row.name,e)}
                autoSize={{ minRows: 1 }}></TextArea>&nbsp;&nbsp;
                <i><FontAwesomeIcon icon={faList} size="lg" className={styles.listIcon}
                /></i>&nbsp;&nbsp;
                <span ><Button className={styles.functionIcon} size="small">fx</Button></span></div>)
          },
          {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            sorter: (a:any, b:any) => a.value.length - b.value.length,
          }

    ]

    const entData = [
        {
            name: "id", 
            type: "string",
            xPathExpression: '',
            value: ''
        },
        {
            name: "add1", 
            type: "string",
            xPathExpression: '',
            value: ''
        }
    ]
   const customExpandIcon = (props) => {
       if(props.expandable) {
        if (props.expanded) {
            return <a style={{ color: 'black' }} onClick={e => {
                props.onExpand(props.record, e);
            }}><Icon type="down" /> </a>
        } else {
            return <a style={{ color: 'black' }} onClick={e => {
                props.onExpand(props.record, e);
            }}><Icon type="right" /> </a>
        }
       } else {
           if(props.expanded) {
               return <a style={{ color: 'black' }} onClick={e => {
                props.onExpand(props.record, e);
            }}></a>
           }
       }
    }


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
        defaultExpandAllRows={true}
        expandIcon={(props) => customExpandIcon(props)}
        className={styles.sourceTable}
        rowClassName={() => styles.srcTableRows}
        //size="small"
        columns={columns}
        dataSource={props.sourceData}
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
        dataSource={entData}
        rowKey="name"
        />
        </div>
        </div>
        </Modal>

);

}

export default SourceToEntityMap;