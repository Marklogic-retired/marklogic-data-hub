import React, {CSSProperties, useState, useEffect, useContext} from 'react';
import styles from './mapping-card.module.scss';
import {Card, Icon, Tooltip, Row, Col, Modal} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import sourceFormatOptions from '../../../config/formats.config';
import { convertDateFromISO, getInitialChars } from '../../../util/conversionFunctions';
import CreateEditMappingDialog from './create-edit-mapping-dialog/create-edit-mapping-dialog';
import SourceToEntityMap from './source-entity-map/source-to-entity-map';
import {getResultsByQuery, getDoc} from '../../../util/search-service'
import ActivitySettingsDialog from "../../activity-settings/activity-settings-dialog";
import { AdvMapTooltips } from '../../../config/tooltips.config';
import {RolesContext} from "../../../util/roles";
import { getSettingsArtifact } from '../../../util/manageArtifacts-service';
import axios from 'axios';

interface Props {
    data: any;
    entityTypeTitle: any;
    getMappingArtifactByMapName: any;
    deleteMappingArtifact: any;
    createMappingArtifact: any;
    updateMappingArtifact: any;
    canReadOnly: any;
    canReadWrite: any;
    entityModel: any;
  }

const MappingCard: React.FC<Props> = (props) => {
    const activityType = 'mapping';
    const roleService = useContext(RolesContext);
    const [newMap, setNewMap] = useState(false);
    const [title, setTitle] = useState('');
    const [mapData, setMapData] = useState({});
    const [mapName, setMapName] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loadArtifactName, setLoadArtifactName] = useState('');
    const [mappingVisible, setMappingVisible] = useState(false);
    const [sourceData, setSourceData] = useState<any[]>([]);
    const [sourceURI,setSourceURI] = useState('');
    const [sourceDatabaseName, setSourceDatabaseName] = useState('data-hub-STAGING')
    const [docNotFound, setDocNotFound] = useState(false);

    //For Entity table
    const [entityTypeProperties, setEntityTypeProperties] = useState<any[]>([]);

    //For storing docURIs
    const [docUris, setDocUris] = useState<any[]>([]);

    //For handling docUris navigation
    const [disableURINavLeft, setDisableURINavLeft] = useState(true);
    const [disableURINavRight, setDisableURINavRight] = useState(false);


    const [openMappingSettings, setOpenMappingSettings] = useState(false);

    //For storing  mapping functions
    const [mapFunctions,setMapFunctions] = useState({});

    useEffect(() => {
        setSourceData([]);
    },[props.data]);


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
        setMapData(prevState => ({ ...prevState, ...props.data[index]}));
        setOpenMappingSettings(true);
        console.log('Open settings')
    }

    const getDatabaseFromSettingsArtifact = async (mapName) => {
        try{
        let response = await getSettingsArtifact(activityType,mapName)
        if (response.status === 200) {
            console.log('settings are',response.data)
            await setSourceDatabaseName(response.data.sourceDatabase)
        }
      } catch(error) {
        let message = error;
        console.log('Error While fetching the mapping setting!', message);
        setDocNotFound(true);
    }
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


    const getSourceData = async (index) => {

        let database = props.data[index].sourceDatabase || 'data-hub-STAGING';
        let sQuery = props.data[index].sourceQuery;

        try{
        let response = await getResultsByQuery(database,sQuery,20, true);
          if (response.status === 200) {
           if(response.data.length > 0){
            setDisableURINavRight(response.data.length > 1 ? false : true);
            let uris: any = [];
            response.data.forEach(doc => {
                uris.push(doc.uri);
              })
           setDocUris([...uris]);
           setSourceURI(response.data[0].uri);

           fetchSrcDocFromUri(response.data[0].uri);

          }
        }
        }
        catch(error)  {
            let message = error;
            console.log('Error While loading the source data!', message);
            setDocNotFound(true);
        }


    }

    const fetchSrcDocFromUri = async (uri) => {
        try{
            let srcDocResp = await getDoc('STAGING', uri);
            if (srcDocResp.status === 200) {
                let nestedDoc: any = [];
                let docRoot = srcDocResp.data['envelope'] ? srcDocResp.data['envelope']['instance'] : srcDocResp.data;
                let sDta = generateNestedDataSource(docRoot,nestedDoc);
                setSourceData([...sDta]);
            }
            } catch(error)  {
                let message = error.response.data.message;
                console.log('Error While loading the Doc from URI!', message)
                setDocNotFound(true);
            }
    }


    // construct infinitely nested source Data
    const generateNestedDataSource = (respData, nestedDoc: Array<any>) => {

        Object.keys(respData).map(key => {
            let val = respData[key];
            if (val != null && val!= "") {

                if (val.constructor.name === "Object") {

                    let propty = {
                        key: key,
                        'children': []
                    }

                    generateNestedDataSource(val, propty.children);
                    nestedDoc.push(propty);

                } else if (val.constructor.name === "Array") {

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

                    let propty = {
                        key: key,
                        val: String(val)
                      };
                    nestedDoc.push(propty);
                }

            } else {

                let propty = {
                    key: key,
                    val: ""
                  };
                nestedDoc.push(propty);
            }
        });

        return nestedDoc;



    }

    const getMappingFunctions = async () => {
        try {
            let response = await axios.get(`/api/artifacts/mapping/functions`);

            if (response.status === 200) {
                console.log('functions',response.data);
                setMapFunctions({...response.data});
              console.log('GET Mapping functions API Called successfully!',response);
            }
          } catch (error) {
              let message = error;
              console.log('Error while fetching the functions!', message);
          }
    }


    const extractEntityInfoForTable = () => {
        console.log('entityinfo',props.entityModel)
        let entProps = props.entityModel && props.entityModel.definitions ? props.entityModel.definitions[props.entityTypeTitle].properties : {};
        let entTableTempData: any = [];
        Object.keys(entProps).map(key => {
            let propty = {
                name : key,
                type : entProps[key].datatype
            }
            entTableTempData.push(propty)
        })
        setEntityTypeProperties([...entTableTempData]);

    }

    const openSourceToEntityMapping = async (name,index) => {
            let mData = await props.getMappingArtifactByMapName(props.entityTypeTitle,name);
            setSourceURI('');
            setMapData({...mData})
            getSourceData(index);
            extractEntityInfoForTable();
            setMapName(name);
            getDatabaseFromSettingsArtifact(name);
            getMappingFunctions();
            setMappingVisible(true);
      }


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
                        <div style={cardContainer} onClick={() => openSourceToEntityMapping(elem.name,index)}>
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
                targetEntityType={props.entityTypeTitle}
                createMappingArtifact={props.createMappingArtifact}
                deleteMappingArtifact={props.deleteMappingArtifact}
                mapData={mapData}
                canReadWrite={props.canReadWrite}
                canReadOnly={props.canReadOnly}/>
                {deleteConfirmation}
                <SourceToEntityMap
                sourceData={sourceData}
                sourceURI={sourceURI}
                mapData={mapData}
                entityTypeProperties={entityTypeProperties}
                mappingVisible={mappingVisible}
                setMappingVisible={setMappingVisible}
                mapName={mapName}
                entityTypeTitle={props.entityTypeTitle}
                getMappingArtifactByMapName={props.getMappingArtifactByMapName}
                updateMappingArtifact={props.updateMappingArtifact}
                canReadWrite={props.canReadWrite}
                canReadOnly={props.canReadOnly}
                docNotFound={docNotFound}
                extractCollectionFromSrcQuery={extractCollectionFromSrcQuery}
                fetchSrcDocFromUri={fetchSrcDocFromUri}
                docUris={docUris}
                disableURINavLeft={disableURINavLeft}
                disableURINavRight={disableURINavRight}
                setDisableURINavLeft={setDisableURINavLeft}
                setDisableURINavRight={setDisableURINavRight}
                sourceDatabaseName={sourceDatabaseName}/>
                mapFunctions={mapFunctions}/>
            <ActivitySettingsDialog
                tooltipsData={AdvMapTooltips}
                openActivitySettings={openMappingSettings}
                setOpenActivitySettings={setOpenMappingSettings}
                stepData={mapData}
                activityType={activityType}
                canWrite={roleService.canWriteMappings()}
            />
        </div>
    );

}

export default MappingCard;
