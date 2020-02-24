import React, { CSSProperties, useState } from 'react';
import styles from './mapping-card.module.scss';
import {Card, Icon, Tooltip, Row, Col, Modal} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import sourceFormatOptions from '../../../config/formats.config';
import { convertDateFromISO } from '../../../util/conversionFunctions';
import CreateEditMappingDialog from './create-edit-mapping-dialog/create-edit-mapping-dialog';
import SourceToEntityMap from './source-entity-map/source-to-entity-map';
import {getResultsByQuery, getDoc} from '../../../util/search-service'

interface Props {
    data: any;
    entityName: any;
    deleteMappingArtifact: any;
    createMappingArtifact: any;
    canReadOnly: any;
    canReadWrite: any;
  }

const MappingCard: React.FC<Props> = (props) => {
    const [newMap, setNewMap] = useState(false);
    const [title, setTitle] = useState('');
    const [mapData, setMapData] = useState({});
    const [nestedSourceData, setNestedSourceData] = useState<any[]>([]);
    const [mapName, setMapName] = useState({});
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loadArtifactName, setLoadArtifactName] = useState('');
    const [mappingVisible, setMappingVisible] = useState(false);
    const [sourceData, setSourceData] = useState({});

    //const [openLoadDataSettings, setOpenLoadDataSettings] = useState(false);


    const OpenAddNewDialog = () => {
        setTitle('New Mapping');
        setNewMap(true);
    }

    const OpenEditStepDialog = (index) => {
        setTitle('Edit Mapping');
        setMapData(prevState => ({ ...prevState, ...props.data[index]}));
        setNewMap(true);
    }

    const OpenMappingSettingsDialog = (index) => {
        // setMapData(prevState => ({ ...prevState, ...props.data[index]}));
        // //openLoadDataSettings = true;
        // setOpenLoadDataSettings(true);
        console.log('Open settings')
    }

    //Custom CSS for source Format
    const sourceFormatStyle = (sourceFmt) => {
        let customStyles: CSSProperties = {
            float: 'right',
            backgroundColor: (sourceFmt.toUpperCase() === 'XML' ? sourceFormatOptions.xml.color : (sourceFmt.toUpperCase() === 'JSON' ? sourceFormatOptions.json.color : (sourceFmt.toUpperCase() === 'CSV' ? sourceFormatOptions.csv.color : sourceFormatOptions.default.color))),
            fontSize: '12px',
            borderRadius: '50%',
            textAlign: 'left',
            color: '#ffffff',
            padding: '5px'
        }
        return customStyles;
    }

    //Truncate a string (Step Name) to desired no. of characters
    const getInitialChars = (str, num, suffix) => {
        suffix = suffix ? suffix : '...';
        let result = str;
        if (typeof str === 'string' && str.length > num) {
            result = str.substr(0, num) + suffix;
        }
        return result;
    }

    const extractCollectionFromSrcQuery = (query) => {

        let srcCollection = query.substring(
            query.lastIndexOf("[") + 2, 
            query.lastIndexOf("]") - 1
        );
        return getInitialChars(srcCollection,30,'...');
    }

    const handleCardDelete = (name) => {
        setDialogVisible(true);
        setLoadArtifactName(name);
      }

      const onOk = (name) => {
        props.deleteMappingArtifact(name)
        setDialogVisible(false);
      }

      const onCancel = () => {
        setDialogVisible(false);
      }  

    const deleteConfirmation = <Modal
        visible={dialogVisible}
        okText='Yes'
        cancelText='No'
        onOk={() => onOk(loadArtifactName)}
        onCancel={() => onCancel()}
        width={350}
        maskClosable={false}
        >
        <span style={{fontSize: '16px'}}>Are you sure you want to delete this?</span>
        </Modal>;
    
    
    const getSourceDataFromUri = () => {
        let response = getResultsByQuery('data-hub-STAGING','cts.collection("http://marklogic.com/data-hub/load-data-artifact")',5, true);
        console.log('search-response',response);

        let sourceDoc = getDoc('data-hub-STAGING', '/loadData/Yeard.loadData.json')
        console.log('sourceDoc service API called',sourceDoc)
        // try {
        //     let response = await axios.get('/api/artifacts/mapping');
            
        //     if (response.status === 200) {
        //       setLoadDataArtifacts([...response.data]);
        //       console.log('GET Artifacts API Called successfully!');
        //     } 
        //   } catch (error) {
        //       let message = error.response.data.message;
        //       console.log('Error while fetching load data artifacts', message);
        //       handleError(error);
        //   }
        let resp = {
            "id": 118,
            "transactionDate": "08/29/2018",
            "firstName": "Anjanette",
            "lastName": "Reisenberg",
            "gender": "F",
            "phone": "(213)-405-4543"
        }
        return resp;
    }
    
    //Temp data - to be deleted
    const respData = {
        "id": 11145,
        "transactionDate": "10/2/2019",
        "product": {
            "Name": "MarkLogic",
            "Details": {
                "Sub-Category": "Software"
            },
            "Licensed": "Yes",
            "productInfo": [
                {
                    "name": "Voltsillam",
                    "ProdPrice": 7.0,
                    "ProdQuantity": 7
                },
                {
                    "name": "Latlux",
                    "ProdPrice": 9.17,
                    "ProdQuantity": 10
                }]
        },
        "customer": {
            "firstName": "Nikhil",
            "lastName": "Shrivastava",
            "gender": "M"
        },
        "items": [
            {
                "name": "Voltsillam",
                "price": 2.0,
                "quantity": 7
            },
            {
                "name": "Latlux",
                "price": 7.17,
                "quantity": 10
            },
            {
                "name": "Biodex",
                "price": 5.01,
                "quantity": 2
            },
            {
                "name": "Fixflex",
                "price": 8.77,
                "quantity": 6
            },
            {
                "name": "Keylex",
                "price": 5.57,
                "quantity": 3
            }
        ]
    }

    // construct infinitely nested source Data
    const generateNestedDataSource = (respData, nestedDoc: Array<any>) => {
        
        Object.keys(respData).map(key => {
            let val = respData[key];
            if (val != null && val!= "") {
                console.log('value found',key,val);
                if (val.constructor.name === "Object") {
                    console.log('Object found',key,val);
                    let propty = {
                        key: key,
                        'children': []
                    }

                    
                    console.log('parameter nestedDoc',propty.children);
                    generateNestedDataSource(val, propty.children);
                    nestedDoc.push(propty);

                } else if (val.constructor.name === "Array") {
                    //srcData.push({key : key, val: respData[key]})

                    console.log('Array found',key,val);
                    
                    val.forEach(obj => {
                        if(obj.constructor.name == "String"){
                          let propty = {
                            key: key,
                            val: obj
                          };
                          nestedDoc.push(propty);
                        } else {
                            let propty = {
                                key: key,
                                children: []
                              };
                              
                          generateNestedDataSource(obj, propty.children);
                          nestedDoc.push(propty);
                        }
                      });

                } else {
                    console.log('string found',key,val);
                    let propty = {
                        key: key,
                        val: String(val)
                      };
                    nestedDoc.push(propty);
                }

            } else {
                console.log('invalid found',key,val);
                let propty = {
                    key: key,
                    val: ""
                  };
                nestedDoc.push(propty);
            }
        });
        console.log('nested Doc return statement', nestedDoc);

        return nestedDoc;
        
        
        
    }
    let nestedDoc: any = [];
    const openSourceToEntityMapping = (name) => {
            setSourceData(prevState => ({ ...prevState, ...getSourceDataFromUri()}))
            let nestDoc= generateNestedDataSource(respData,nestedDoc);
            setNestedSourceData([...nestDoc]);
            //console.log('nestedDoc',generateNestedDataSource(srcData,nestedDoc));
            //console.log('sourceData',getSourceDataFromUri())
            //console.log('converted data', srcData)
            setMapName(name);
            setMappingVisible(true);
    }
    // const sData = [{key: "id", val: 118},
    // {key: "transactionDate", val: "08/29/2018"},
    // {key: "firstName", children: [{key: "Home", val: "554-223-4534",children: [{key: "Mobile", val: "009-223-4534"}]},
    //             {key: "Home2", val: "224-223-4534",children: [{key: "Mobile3", val: "009-223-4534"}]}]},
    // {key: "lastName", val: "Reisenberg"},
    // {key: "gender", val: "F"},
    // {key: "phone", val: "(213)-405-4543",children: [{key: "Mobile", val: "009-223-4534"}]}
    // ]

    const cardContainer: CSSProperties = {
        cursor: 'pointer',width: '330px',margin:'-12px -12px', padding: '5px 5px'
    }

    return (
        <div className={styles.loaddataContainer}>
            <Row gutter={16} type="flex" >
                {props.canReadWrite ? <Col >
                    <Card
                        size="small"
                        className={styles.addNewCard}>
                        <div><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={OpenAddNewDialog}/></div>
                        <br />
                        <p className={styles.addNewContent}>Add New</p>
                    </Card>
                </Col> : ''}{props && props.data.length > 0 ? props.data.map((elem,index) => (
                    <Col key={index}><Card
                        actions={[
                            <span></span>,
                            <Tooltip title={'Settings'} placement="bottom"><Icon type="setting" key="setting" onClick={() => OpenMappingSettingsDialog(index)}/></Tooltip>,
                            <Tooltip title={'Edit'} placement="bottom"><Icon type="edit" key="edit" onClick={() => OpenEditStepDialog(index)}/></Tooltip>,
                            props.canReadWrite ? <Tooltip title={'Delete'} placement="bottom"><i><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg" onClick={() => handleCardDelete(elem.name)}/></i></Tooltip> : <i><FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledDeleteIcon} size="lg"/></i>,
                        ]}
                        className={styles.cardStyle}
                        size="small"
                    >
                        <div style={cardContainer} onClick={() => openSourceToEntityMapping(elem.name)}>
                        <div className={styles.formatFileContainer}>
                            <span className={styles.mapNameStyle}>{getInitialChars(elem.name, 27, '...')}</span>
                            {/* <span style={sourceFormatStyle(elem.sourceFormat)}>{elem.sourceFormat.toUpperCase()}</span> */}
                            
                        </div><br />
                        {elem.selectedSource === 'collection' ? <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(elem.sourceQuery)}</div> : <div className={styles.sourceQuery}>Source Query: {getInitialChars(elem.sourceQuery,32,'...')}</div>}
                        <br /><br />
                        <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</p>
                        </div>
                    </Card></Col>
                )) : <span></span> }</Row>
                <CreateEditMappingDialog 
                newMap={newMap} 
                title={title} 
                setNewMap={setNewMap}
                targetEntity={props.entityName}
                createMappingArtifact={props.createMappingArtifact}
                deleteMappingArtifact={props.deleteMappingArtifact}  
                mapData={mapData}
                canReadWrite={props.canReadWrite}
                canReadOnly={props.canReadOnly}/>
                {deleteConfirmation}
                <SourceToEntityMap 
                sourceData={nestedSourceData}
                mappingVisible={mappingVisible}
                setMappingVisible={setMappingVisible}
                mapName={mapName}
                entityName={props.entityName}/>
                
        </div>
    );

}

export default MappingCard;