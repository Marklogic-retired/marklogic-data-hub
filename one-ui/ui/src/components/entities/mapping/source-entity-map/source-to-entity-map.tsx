
import React, { useState, useEffect, CSSProperties } from "react";
import { Card, Modal, Table, Icon, Popover, Input, Button, Alert, message, Tooltip, Spin, Divider } from "antd";
import styles from './source-to-entity-map.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faObjectUngroup, faList, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { getInitialChars, convertDateFromISO, getLastChars } from "../../../../util/conversionFunctions";

const SourceToEntityMap = (props) => {

    const [mapExp, setMapExp] = useState({});

    const [mapExpTouched, setMapExpTouched] = useState(false);
    const [editingURI, setEditingUri] = useState(false);
    const [showEditURIOption, setShowEditURIOption] = useState(false);
    const [mapSaved, setMapSaved] = useState(false);
    const [errorInSaving,setErrorInSaving] = useState('');

    const [srcURI, setSrcURI] = useState(props.sourceURI);

    const [srcData, setSrcData] = useState<any[]>([]);

    //For TEST and Clear buttons
    const [mapResp, setMapResp] = useState({});
    const [isTestClicked, setIsTestClicked] = useState(false);

    //Navigate URI buttons
    const [uriIndex,setUriIndex] = useState(0);

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

    //To handle navigation buttons
    const onNavigateURIList = (index) => {
        const end = props.docUris.length - 1;
        // Not at beginning or end of range
        if (index > 0 && index < end) {
          props.setDisableURINavLeft(false);
          props.setDisableURINavRight(false);
          setUriIndex(index);
          setSrcURI(props.docUris[index]);
          onUpdateURINavButtons(props.docUris[index]);
    
        } // At beginning of range 
        else if (index === 0) {
            props.setDisableURINavLeft(true);
          if (end > 0) {
            props.setDisableURINavRight(false);
          }
          setUriIndex(index);
          setSrcURI(props.docUris[index]);
          onUpdateURINavButtons(props.docUris[index]);
        } // At end of range
        else if (index === end) {
          if (end > 0) {
            props.setDisableURINavLeft(false);
          }
          props.setDisableURINavRight(true);
          setUriIndex(index);
          setSrcURI(props.docUris[index]);
          onUpdateURINavButtons(props.docUris[index]);
        } else {
          // Before beginning of range
          if (index < 0) {
            props.setDisableURINavLeft(true);
          } 
          // After end of range
          else {
            props.setDisableURINavRight(true);
          }
        }
      }
    const onUpdateURINavButtons = (uri) => {
        props.fetchSrcDocFromUri(uri);
    }

    const navigationButtons = <span className={styles.navigate_source_uris}>
    <Button className={styles.navigate_uris_left} onClick={() => onNavigateURIList(uriIndex-1)} disabled={props.disableURINavLeft}>
      <Icon type="left" className={styles.navigateIcon}/>
    </Button>
    &nbsp;
    <div className={styles.URI_Index}><p>{uriIndex+1}</p></div>
    &nbsp;
    <Button className={styles.navigate_uris_right} onClick={() => onNavigateURIList(uriIndex+1)} disabled={props.disableURINavRight}>
      <Icon type="right" className={styles.navigateIcon}/>
    </Button>
    </span>
    
    //Code for navigation buttons ends here

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
            width:'20%',
            sorter: (a:any, b:any) => a.name.length - b.name.length,
          },
          {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width:'10%',
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
            width:'50%',
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
            width:'20%',
            sorter: (a:any, b:any) => a.value.length - b.value.length,
            render: (text,row) => (<div>New</div>)
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
    const emptyData = (JSON.stringify(props.sourceData) === JSON.stringify([]) && !props.docNotFound);

    
    //Logic for Test and Clear buttons
    const  getMapValidationResp = () => {

    }

    const onClear = () => {
        setMapResp({});
        setIsTestClicked(false);
    }


return (<Modal
        visible={props.mappingVisible}
        onOk={() => onOk()}
        onCancel={() => onCancel()}
        width={'96vw'}
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
            {emptyData ? 
            <div id="noData">
                <br/><br/>
                <Card className={styles.emptyCard} size="small"> 
                    <div className={styles.emptyText}>
                         <p>Unable to find source documents using the specified collection or query.</p>
                         <p>Load some data that mapping can use as reference and/or edit the step
                         settings to use a source collection or query that will return some results.</p>
                     </div>
                </Card>
            </div>
            : 
            <div id="dataPresent">   
                <div className={styles.navigationCollapseButtons}>{navigationButtons}</div> 
                <Spin spinning={JSON.stringify(props.sourceData) === JSON.stringify([]) && !props.docNotFound}>           
                <Table
                pagination={false}
                defaultExpandAllRows={true}
                expandIcon={(props) => customExpandIcon(props)}
                className={styles.sourceTable}
                rowClassName={() => styles.sourceTableRows}
                scroll={{ y: '70vh' }}
                indentSize={14}
                //size="small"
                columns={columns}
                dataSource={srcData}
                tableLayout="unset"
                rowKey="name"
                />
                </Spin>           
            </div> }
          </div>
        <div 
        id="entityContainer"
        className={styles.entityContainer}>
            <div className={styles.entityDetails}>
                <span className={styles.entityTypeTitle}><p ><i><FontAwesomeIcon icon={faObjectUngroup} size="sm" className={styles.entityIcon} /></i> Entity: {props.entityTypeTitle}</p></span>
                <span className={styles.btn_icons}>
                    <Button id="Clear-btn" mat-raised-button color="primary" disabled={emptyData} onClick={() => getMapValidationResp()}>
                        Clear
                    </Button>
                    &nbsp;&nbsp;
                    <Button id="Test-btn" mat-raised-button type="primary" disabled={emptyData} onClick={() => onClear()}>
                        Test
                    </Button>
                </span>
            </div>
            <Divider style={{marginBottom: '8px'}}></Divider>
            <div className={styles.lineSpacing}></div>
        <Table
        pagination={false}
        className={styles.entityTable}
        //size="small"
        scroll={{ y: '70vh' }}
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
