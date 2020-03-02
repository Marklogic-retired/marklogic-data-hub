
import React, { useState, useEffect, CSSProperties } from "react";
import { Modal, Table, Icon, Popover, Input, Button, Alert, message, Tooltip, Spin } from "antd";
import styles from './source-to-entity-map.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faObjectUngroup, faList, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { getInitialChars, convertDateFromISO, getLastChars } from "../../../../util/conversionFunctions";

const SourceToEntityMap = (props) => {

    const [mapExp, setMapExp] = useState({});

    const [mapExpTouched, setMapExpTouched] = useState(false);
    const [mapExpression, setMapExpression] = useState({});
    const [editingURI, setEditingUri] = useState(false);
    const [showEditURIOption, setShowEditURIOption] = useState(false);
    const [mapSaved, setMapSaved] = useState(false);
    const [errorInSaving,setErrorInSaving] = useState('');

    const [srcURI, setSrcURI] = useState(props.sourceURI);

    const [srcData, setSrcData] = useState<any[]>([]);


    const sampleDocUri: CSSProperties = {

    }

    //Documentation links for using Xpath expressions
    const xPathDocLinks = <div className={styles.xpathDoc}><span id="doc">Documentation:</span>
        <div><ul className={styles.docLinksUl}>
            <li><a href="https://www.w3.org/TR/xpath/all/" target="_blank" className={styles.docLink}>XPath Expressions</a></li>
            <li><a href="https://docs.marklogic.com/guide/app-dev/TDE#id_99178" target="_blank" className={styles.docLink}>Extraction Functions</a></li>
            <li><a href="https://docs.marklogic.com/datahub/flows/dhf-mapping-functions.html" target="_blank" className={styles.docLink}>Mapping Functions</a></li>
        </ul></div>
    </div>;

    const { TextArea } = Input;

    const handleEditIconClick = () => {
        setEditingUri(true);
    }

    const handleURIEditing = (e) => {
        setSrcURI(e.target.value);

    }

    const handleMouseOver = (e) => {
        setShowEditURIOption(true);
    }

    const handleCloseEditOption = (srcURI) => {
        setSrcURI(srcURI);
        setEditingUri(false);
    }

    const handleSubmitUri = (uri) =>{
        props.getMappingArtifactByMapName();
        props.fetchSrcDocFromUri(uri);
        setEditingUri(false);
    }


    const srcDetails = <div className={styles.xpathDoc}>
        {props.mapData.selectedSource === 'collection' ? <div className={styles.sourceQuery}>Collection: {props.extractCollectionFromSrcQuery(props.mapData.sourceQuery)}</div> : <div className={styles.sourceQuery}>Source Query: {getInitialChars(props.mapData.sourceQuery,32,'...')}</div>}
        {!editingURI ? <div 
            onMouseOver={(e) => handleMouseOver(e)}
            onMouseLeave={(e) => setShowEditURIOption(false)} className={styles.uri}>{!showEditURIOption ? <span className={styles.notShowingEditIcon}>URI: <span className={styles.URItext}>&nbsp;{getLastChars(srcURI,42,'...')}</span></span> :
        <span>URI: <span className={styles.showingEditIcon}>{getLastChars(srcURI,42,'...')}  <i><FontAwesomeIcon icon={faPencilAlt} size="lg" onClick={handleEditIconClick} className={styles.editIcon}
        /></i></span></span>}</div> : <div className={styles.inputURIContainer}>URI: <span><Input value={srcURI} onChange={handleURIEditing} className={styles.uriEditing}></Input>&nbsp;<Icon type="close" className={styles.closeIcon} onClick={() => handleCloseEditOption(srcURI)}/>&nbsp;<Icon type="check" className={styles.checkIcon} onClick={() => handleSubmitUri(srcURI)}/></span></div>}
    </div>;


    useEffect(() => {
        initializeMapExpressions();
        return(()=> {
            setMapExp({});
        })
    },[props.mappingVisible]);


    useEffect(() => {
        if(props.sourceURI){
            setSrcURI(props.sourceURI);
        }
        
    },[props.sourceURI]);

    useEffect(() => {
        setSrcData([...props.sourceData])
        
    },[props.sourceData]);
    

    //Set the mapping expressions, if already exists.
    const initializeMapExpressions = () => {
        if(props.mapData && props.mapData.properties) {
            let obj = {};
            Object.keys(props.mapData.properties).map(key => {
                obj[key] = props.mapData.properties[key]['sourcedFrom'];
            });
            setMapExp({...obj});
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
        //console.log('mapData',props.mapData);
        let dataPayload = {
                name: props.mapName,
                targetEntity: props.mapData.targetEntity,
                description: props.mapData.description,
                selectedSource: props.mapData.selectedSource,
                sourceQuery: props.mapData.sourceQuery,
                properties: obj
              }
        //console.log('dataPayLoad',dataPayload);
            
        let mapSavedResult = await props.updateMappingArtifact(dataPayload);
        if(mapSavedResult){
            setErrorInSaving('noError');
        } else {
            setErrorInSaving('error');
        }
        setMapSaved(mapSavedResult);
        }
        
        setMapExpTouched(false);
        
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
          width: '60%'
        },
        {
          title: 'Value',
          dataIndex: 'val',
          key: 'val',
          ellipsis: true,
          sorter: (a:any, b:any) => a.val.length - b.val.length,
          width: '40%',
        render: (text) => <span>{text ? text.substr(0,20): ''}{text && text.length > 20 ? <Tooltip title={text}><span>...</span></Tooltip> : ''}</span>
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
            render: (text, row)=> (<div className={styles.mapExpressionContainer}>
                <TextArea 
                className={styles.mapExpression}
                value={mapExp[row.name]}
                onChange={(e) => handleMapExp(row.name,e)}
                onBlur={handleExpSubmit}
                autoSize={{ minRows: 1 }}
                disabled={!props.canReadWrite}></TextArea>&nbsp;&nbsp;
                <i id="listIcon"><FontAwesomeIcon icon={faList} size="lg" className={styles.listIcon}
                /></i>&nbsp;&nbsp;
                <span ><Button id="functionIcon" className={styles.functionIcon} size="small">fx</Button></span></div>)
          },
          {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            sorter: (a:any, b:any) => a.value.length - b.value.length,
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
           return <span style={{ color: 'black'}} onClick={e => {
            props.onExpand(props.record, e);
        }}></span>
       }
    }

    // CSS properties for the alert message after saving the mapping
    const saveMessageCSS: CSSProperties = {
        border: errorInSaving === 'noError' ? '1px solid #008000' : '1px solid #ff0000',
        marginLeft: '30em'
    }

    const success = () => {
        let mesg = `All changes are saved on ${convertDateFromISO(new Date())}`
        let errorMesg = `An error occured while saving the changes.`
        
        let msg = <span id="successMessage"><Alert type="success" message={mesg} banner style={saveMessageCSS}/></span>
        let errorMsg = <span id="errorMessage"><Alert type="error" message={errorMesg} banner style={saveMessageCSS}/></span>
        setTimeout(() => {
            setErrorInSaving('');
        }, 3000);

        return errorInSaving === 'noError' ? msg : errorMsg;

      };


return (<Modal
        visible={props.mappingVisible}
        onOk={() => onOk()}
        onCancel={() => onCancel()}
        width={1600}
        maskClosable={false}
        footer={null}
        className={styles.mapContainer}
        >
            <div className={styles.header}>
                <span className={styles.headerTitle}>{props.mapName}</span>
            {errorInSaving ? success() : <span className={styles.noMessage}></span>}
            </div>
            
        
        <div className={styles.parentContainer}>
        
        <div 
        id="srcContainer"
        className={styles.sourceContainer}>
            <div id="srcDetails" className={styles.sourceDetails}>
                <p className={styles.sourceName}
                ><i><FontAwesomeIcon icon={faList} size="sm" className={styles.sourceDataIcon}
                /></i> Source Data <Popover
                content={srcDetails}
                trigger="click"
                placement="right" 
                ><Icon type="question-circle" className={styles.questionCircle} theme="filled" /></Popover></p>
            </div>
            <Spin spinning={JSON.stringify(props.sourceData) === JSON.stringify([]) && !props.docNotFound}> 
        <Table
        pagination={false}
        defaultExpandAllRows={true}
        expandIcon={(props) => customExpandIcon(props)}
        className={styles.sourceTable}
        rowClassName={() => styles.sourceTableRows}
        scroll={{ y: 800 }}
        indentSize={14}
        //size="small"
        columns={columns}
        dataSource={srcData}
        tableLayout="unset"
        rowKey="name"
        />
        </Spin>
        </div>

        <div 
        id="entityContainer"
        className={styles.entityContainer}>
        <div className={styles.entityDetails}>
                <p className={styles.entityTypeTitle}><i><FontAwesomeIcon icon={faObjectUngroup } size="sm" className={styles.entityIcon}/></i> Entity: {props.entityTypeTitle}</p>
            </div>
        <Table
        pagination={false}
        className={styles.entityTable}
        //size="small"
        //scroll={{ y: 800 }}
        tableLayout="unset"
        columns={entityColumns}
        dataSource={props.entityTypeProperties}
        rowKey="name"
        />
        </div>
        </div>
        </Modal>

);

}

export default SourceToEntityMap;