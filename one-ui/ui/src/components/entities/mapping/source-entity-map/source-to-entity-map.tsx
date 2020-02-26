
import React, { useState, useEffect, CSSProperties } from "react";
import { Modal, Table, Icon, Popover, Input, Button, Alert, message } from "antd";
import styles from './source-to-entity-map.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faObjectUngroup, faList } from "@fortawesome/free-solid-svg-icons";
import { getInitialChars } from "../../../../util/conversionFunctions";

const SourceToEntityMap = (props) => {

    const [mapExp, setMapExp] = useState({});

    const [mapExpTouched, setMapExpTouched] = useState(false);
    const [mapExpression, setMapExpression] = useState({});
    const [editingURI, setEditingUri] = useState(false);

    const [mapSaved, setMapSaved] = useState(false);

    const sampleDocUri: CSSProperties = {

    }

    //Documentation links for using Xpath expressions
    const xPathDocLinks = <div className={styles.xpathDoc}><span id="doc">Documentation:</span>
        <div><ul>
            <li><a href="https://www.w3.org/TR/xpath/all/" target="_blank" className={styles.docLink}>XPath Expressions</a></li>
            <li><a href="https://docs.marklogic.com/guide/app-dev/TDE#id_99178" target="_blank" className={styles.docLink}>Extraction Functions</a></li>
            <li><a href="https://docs.marklogic.com/datahub/flows/dhf-mapping-functions.html" target="_blank" className={styles.docLink}>Mapping Functions</a></li>
        </ul></div>
    </div>;

    const { TextArea } = Input;

    const handleEditingURI = () => {

    }

    const srcDetails = <div className={styles.xpathDoc}><span id="doc">Collection: </span>
        <div>URI: </div>
        {/* <span onClick={handleEditingURI} style={sampleDocUri} >{{  }}</span>
        <span onClick={handleEditingURI}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> */}
    </div>;


    useEffect(() => {
        initializeMapExpressions();
    },[props.mapData]);


    //Set the mapping expressions, if already exists.
    const initializeMapExpressions = () => {
        if(props.mapData && props.mapData.properties) {
            let obj = {};
            Object.keys(props.mapData.properties).map(key => {
                obj[key] = props.mapData.properties[key]['sourcedFrom'];
            });
            setMapExp({...mapExp, ...obj});
        }
    }

    const onOk = () => {
        props.setMappingVisible(false)
        console.log('Map Saved!')
    }

    const onCancel = () => {
        props.setMappingVisible(false)
        console.log('Map cancelled!')
    }
    const handleExpSubmit = async () => {
        if(mapExpTouched){
        let obj = {};
        Object.keys(mapExp).map(key => {
            obj[key] = {"sourcedFrom" : mapExp[key]}
        })
        console.log('mapData',props.mapData);
        let dataPayload = {
                name: props.mapName,
                targetEntity: props.mapData.targetEntity,
                description: props.mapData.description,
                selectedSource: props.mapData.selectedSource,
                sourceQuery: props.mapData.sourceQuery,
                properties: obj
              }
        console.log('dataPayLoad',dataPayload);
            
        await props.updateMappingArtifact(dataPayload);
        }
        console.log('this is jsut a sample')
        setMapExpTouched(false);
        
    }

    const handleMapExp = (name,event) => {
        setMapExpTouched(true);
        setMapExp({...mapExp, [name]: event.target.value});
        
        // dataPayload = {
        //     name: mapName,
        //     targetEntity: props.targetEntity,
        //     description: description,
        //     selectedSource: selectedSource,
        //     sourceQuery: sQuery,
        //     collection: collections
        //     properties: {
        //       'id': {
        //         'sourcedFrom': faSortAlphaDownAlt,
        //       }
        //       'sdged': {
        //         'sourcedFrom': faSortAlphaDownAlt,
        //       }
        //     }
        //   }
        // }
        // let obj = {
        //     name: name,
        //     expr: mapExp[name],
        //     prop: prop
        //   }
        //mapExpressions[obj.name] = obj.expr;
        //mapExp[name]['sourcedFrom'] = obj.expr;
        //onHandleInput(obj);
        //props.saveMap(obj)
        //success();
    }

    const columns = [
        {
          title: 'Name',
          dataIndex: 'key',
          key: 'key',
          sorter: (a:any, b:any) => a.key.length - b.key.length,
          width: '60%'
        },
        {
          title: 'Value',
          dataIndex: 'val',
          key: 'val',
          sorter: (a:any, b:any) => a.val.length - b.val.length,
          width: '40%',
          render: (text) => getInitialChars(text,20,'...')
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
                onBlur={handleExpSubmit}
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
            return <a className={styles.expandIcon} onClick={e => {
                props.onExpand(props.record, e);
            }}><Icon type="down" /> </a>
        } else {
            return <a className={styles.expandIcon} onClick={e => {
                props.onExpand(props.record, e);
            }}><Icon type="right" /> </a>
        }
       } else {
           if(props.expanded) {
               return <a style={{ color: 'black'}} onClick={e => {
                props.onExpand(props.record, e);
            }}></a>
           }
       }
    }
    const success = () => {
        message.success('All changes are saved to disk on 02/24/2020 12:11:34', 3);
      };


return (<Modal
        visible={props.mappingVisible}
        onOk={() => onOk()}
        onCancel={() => onCancel()}
        width={1500}
        maskClosable={false}
        footer={null}
        wrapClassName={styles.mapContainer}
        >
            <div className={styles.header}>
                <span className={styles.headerTitle}>{props.mapName}</span>
            {mapSaved ? <span><Alert type="success" message="All changes are saved to disk on 02/24/2020 12:11:34" banner className={styles.saveMessage}/></span> : ''}
            </div>
            
        
        <div className={styles.parentContainer}>
        
        <div className={styles.sourceContainer}>
            <div className={styles.sourceDetails}>
                <p className={styles.sourceName}
                ><i><FontAwesomeIcon icon={faList} size="sm" className={styles.sourceDataIcon}
                /></i> Source Data <Popover
                content={srcDetails}
                trigger="click"
                placement="right" ><Icon type="question-circle" className={styles.questionCircle} theme="filled" /></Popover></p>
            </div>
        <Table
        pagination={false}
        defaultExpandAllRows={true}
        expandIcon={(props) => customExpandIcon(props)}
        className={styles.sourceTable}
        rowClassName={() => styles.srcTableRows}
        scroll={{ y: 600 }}
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
        dataSource={props.entityData}
        rowKey="name"
        />
        </div>
        </div>
        </Modal>

);

}

export default SourceToEntityMap;