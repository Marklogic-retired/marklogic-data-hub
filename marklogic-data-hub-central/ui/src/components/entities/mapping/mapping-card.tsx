import React, {CSSProperties, useState, useEffect, useContext} from 'react';
import styles from './mapping-card.module.scss';
import {Card, Icon, Tooltip, Row, Col, Modal, Select} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import sourceFormatOptions from '../../../config/formats.config';
import { convertDateFromISO, getInitialChars } from '../../../util/conversionFunctions';
import CreateEditMappingDialog from './create-edit-mapping-dialog/create-edit-mapping-dialog';
import SourceToEntityMap from './source-entity-map/source-to-entity-map';
import {getResultsByQuery, getDoc} from '../../../util/search-service'
import AdvancedSettingsDialog from "../../advanced-settings/advanced-settings-dialog";
import { AdvMapTooltips } from '../../../config/tooltips.config';
import {AuthoritiesContext} from "../../../util/authorities";
import { getNestedEntities } from '../../../util/manageArtifacts-service';
import axios from 'axios';
import { xmlParserForMapping } from '../../../util/xml-parser';
import { Link, useHistory } from 'react-router-dom';

const { Option } = Select;

interface Props {
    data: any;
    flows: any;
    entityTypeTitle: any;
    getMappingArtifactByMapName: any;
    deleteMappingArtifact: any;
    createMappingArtifact: any;
    updateMappingArtifact: any;
    canReadOnly: any;
    canReadWrite: any;
    canWriteFlow: any;
    entityModel: any;
    addStepToFlow: any;
    addStepToNew: any;
  }

const MappingCard: React.FC<Props> = (props) => {
    const activityType = 'mapping';
    const authorityService = useContext(AuthoritiesContext);
    const [newMap, setNewMap] = useState(false);
    const [title, setTitle] = useState('');
    const [mapData, setMapData] = useState({});
    const [mapName, setMapName] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [addDialogVisible, setAddDialogVisible] = useState(false);
    const [mappingArtifactName, setMappingArtifactName] = useState('');
    const [mappingVisible, setMappingVisible] = useState(false);
    const [sourceData, setSourceData] = useState<any[]>([]);
    const [sourceURI,setSourceURI] = useState('');
    const [sourceDatabaseName, setSourceDatabaseName] = useState('data-hub-STAGING')
    const [docNotFound, setDocNotFound] = useState(false);
    const [flowName, setFlowName] = useState('');
    const [showLinks, setShowLinks] = useState('');

    //For Entity table
    const [entityTypeProperties, setEntityTypeProperties] = useState<any[]>([]);
    const [tgtEntityReferences,setTgtEntityReferences] = useState({});
    let EntitYTableKeyIndex = 0;
    let sourceTableKeyIndex = 0;
    let tgtRefs:any = {};

    //For storing docURIs
    const [docUris, setDocUris] = useState<any[]>([]);

    //For handling docUris navigation
    const [disableURINavLeft, setDisableURINavLeft] = useState(true);
    const [disableURINavRight, setDisableURINavRight] = useState(false);


    const [openMappingSettings, setOpenMappingSettings] = useState(false);

    //For storing  mapping functions
    const [mapFunctions,setMapFunctions] = useState({});

    //For storing namespaces
    const [namespaces, setNamespaces] = useState({});
    let nmspaces: any = {};
    let mapIndexLocal: number = -1;
    const [mapIndex, setMapIndex] = useState(-1);
    let namespaceString = '';

        //To navigate to bench view with parameters
    let history = useHistory();

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
        setMappingArtifactName(name);
      }

      const onOk = (name) => {
        props.deleteMappingArtifact(name)
        setDialogVisible(false);
      }

      const onCancel = () => {
        setDialogVisible(false);
        setAddDialogVisible(false);
      }

      function handleMouseOver(e, name) {
        // Handle all possible events from mouseover of card body
        if (typeof e.target.className === 'string' &&
            (e.target.className === 'ant-card-body' ||
             e.target.className.startsWith('mapping-card_cardContainer') ||
             e.target.className.startsWith('mapping-card_formatFileContainer') ||
             e.target.className.startsWith('mapping-card_sourceQuery') ||
             e.target.className.startsWith('mapping-card_lastUpdatedStyle'))
        ) {
            setShowLinks(name);
        }
    }

    const deleteConfirmation = <Modal
        visible={dialogVisible}
        okText='Yes'
        cancelText='No'
        onOk={() => onOk(mappingArtifactName)}
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

    const fetchSrcDocFromUri = async (uri, index = mapIndexLocal) => {
        try{
            let srcDocResp = await getDoc('STAGING', uri);
            if (srcDocResp.status === 200) {
                let parsedDoc: any;
                if(typeof(srcDocResp.data) === 'string'){
                    parsedDoc = getParsedXMLDoc(srcDocResp);
                } else {
                    parsedDoc = srcDocResp.data;
                }
                if(parsedDoc['envelope']){
                    if(parsedDoc['envelope'].hasOwnProperty('@xmlns')){

                        let nmspcURI = parsedDoc['envelope']['@xmlns']
                        let indCheck = nmspcURI.lastIndexOf('/');
                        let ind = indCheck !== -1 ? indCheck + 1 : 0;
                        let nmspcString = nmspcURI.slice(ind);
                        namespaceString = nmspcString;
                        nmspaces = { ...nmspaces, [namespaceString]: nmspcURI};
                        setNamespaces({ ...namespaces, [namespaceString]: nmspcURI})
                    }
                }
                let nestedDoc: any = [];
                let docRoot = parsedDoc['envelope'] ? parsedDoc['envelope']['instance'] : parsedDoc;
                let sDta = generateNestedDataSource(docRoot,nestedDoc);
                setSourceData([]);
                setSourceData([...sDta]);
                if(typeof(srcDocResp.data) === 'string'){
                    let mData = await props.getMappingArtifactByMapName(props.entityModel.entityTypeId,props.data[index].name);
                    updateMappingWithNamespaces(mData);
                }
            }
            } catch(error)  {
                let message = error//.response.data.message;
                console.log('Error While loading the Doc from URI!', message)
                setDocNotFound(true);
            }
    }

    const getParsedXMLDoc = (xmlDoc) => {
        let parsedDoc = xmlParserForMapping(xmlDoc.data);
        return parsedDoc;
    }

    const updateMappingWithNamespaces = async (mapDataLocal) => {
        let {lastUpdated, ...dataPayload} = mapDataLocal;
        dataPayload['namespaces'] = nmspaces;
        await props.updateMappingArtifact(dataPayload);

        let mapArt = await props.getMappingArtifactByMapName(dataPayload.targetEntityType,dataPayload.name);

        if(mapArt) {
            await setMapData({...mapArt});
        }
    }

    //Generate namespaces for source properties
    const getNamespace = (key, val, parentNamespace) => {
        let objWithNmspace = '';
        if (key.split(':').length > 1) {
            let arr = key.split(':');
            if (nmspaces.hasOwnProperty(arr[0]) && nmspaces[arr[0]] !== arr[0]) {
                let indCheck = nmspaces[arr[0]].lastIndexOf('/');
                let ind = indCheck !== -1 ? indCheck + 1 : 0;
                objWithNmspace = nmspaces[arr[0]].slice(ind) + ':' + arr[1];
            }
        }

        if (val.constructor.name === 'Object') {
            let valObject = Object.keys(val).filter((el) => /^@xmlns/.test(el));
            let count = valObject.length;
            if (count === 1) {
                valObject.map(el => {
                    let nsObj = getNamespaceObject(val,el);

                    if (objWithNmspace === '') {
                        if (key.split(':').length > 1) {
                            let keyArr = key.split(':');
                            objWithNmspace = nsObj.nmspace ? nsObj.nmspace + ':' + keyArr[1] : keyArr[1];
                        } else {
                            objWithNmspace = nsObj.nmspace ? nsObj.nmspace + ':' + key : key;
                        }
                    }

                    nmspaces = { ...nmspaces, ...nsObj.obj };
                    setNamespaces({ ...nmspaces, ...nsObj.obj })
                })
            } else if (count > 1) {
                valObject.map(el => {
                    let nsObj = getNamespaceObject(val,el);
                    nmspaces = { ...nmspaces, ...nsObj.obj };
                    setNamespaces({ ...nmspaces, ...nsObj.obj })
                })
            }
        }
        return objWithNmspace === '' ? (parentNamespace !== '' ? parentNamespace +':'+ key : key) : objWithNmspace;
    }

    const getNamespaceObject = (val, el) => {
        let indCheck = val[el].lastIndexOf('/');
        let ind = indCheck !== -1 ? indCheck + 1 : 0;
        let obj: any = {};
        let nmspace = val[el].slice(ind);
        if (nmspace && !nmspaces.hasOwnProperty(nmspace)) {
            obj[nmspace] = val[el];
        }
        let colonIndex = el.indexOf(':');
        if (colonIndex !== -1) {
            if (!obj.hasOwnProperty(el.slice(colonIndex + 1)) && !nmspaces.hasOwnProperty(el.slice(colonIndex + 1))) {
                if (el.slice(colonIndex + 1) !== nmspace) {
                    obj[el.slice(colonIndex + 1)] = nmspace;
                }
            }
        }
        return {
            nmspace: nmspace,
            obj: obj
        };
    }

    //Generate property object to push into deeply nested source data
    const getPropertyObject = (key, obj) => {
        let propty: any;
        if (obj.hasOwnProperty('#text')) {
            if (Object.keys(obj).filter((el) => /^@xmlns/.test(el) || el === '#text').length === Object.keys(obj).length) {
                sourceTableKeyIndex = sourceTableKeyIndex + 1;
                propty = {
                    rowKey: sourceTableKeyIndex,
                    key: key,
                    val: obj['#text']
                }
            } else {
                sourceTableKeyIndex = sourceTableKeyIndex + 1;
                propty = {
                    rowKey: sourceTableKeyIndex,
                    key: key,
                    val: obj['#text'],
                    'children': []
                }
            }
        } else {
            sourceTableKeyIndex = sourceTableKeyIndex + 1;
            propty = {
                rowKey: sourceTableKeyIndex,
                key: key,
                'children': []
            }
        }
        return propty;
    }

    // construct infinitely nested source Data
    const generateNestedDataSource = (respData, nestedDoc: Array<any>, parentNamespace = namespaceString) => {
        Object.keys(respData).map(key => {
            let val = respData[key];
            if (val !== null && val !== "") {

                if (val.constructor.name === "Object") {
                    let tempNS = parentNamespace;

                    if(val.hasOwnProperty('@xmlns')){
                        parentNamespace = updateParentNamespace(val);

                    }

                    let finalKey = getNamespace(key, val, parentNamespace);
                    let propty = getPropertyObject(finalKey, val);

                    generateNestedDataSource(val, propty.children, parentNamespace);
                    nestedDoc.push(propty);

                    if(parentNamespace !== tempNS){
                        parentNamespace = tempNS;
                    }
                } else if (val.constructor.name === "Array") {

                    val.forEach(obj => {
                        if (obj.constructor.name == "String") {
                            sourceTableKeyIndex = sourceTableKeyIndex + 1;
                            let propty = {
                                rowKey: sourceTableKeyIndex,
                                key: key,
                                val: obj
                            };
                            nestedDoc.push(propty);
                        } else {
                            let tempNS = parentNamespace;
                            if(obj.constructor.name === "Object" && obj.hasOwnProperty('@xmlns')){
                                parentNamespace = updateParentNamespace(obj);
                            }
                            let finalKey = getNamespace(key, obj, parentNamespace);
                            let propty = getPropertyObject(finalKey, obj);

                            generateNestedDataSource(obj, propty.children, parentNamespace);
                            nestedDoc.push(propty);
                            if(parentNamespace !== tempNS){
                                parentNamespace = tempNS;
                            }
                        }
                    });

                } else {

                    if (key !== '#text' && !/^@xmlns/.test(key)) {
                        let finalKey = !/^@/.test(key) ? getNamespace(key, val, parentNamespace) : key;
                        let propty: any;
                        sourceTableKeyIndex = sourceTableKeyIndex + 1;
                        propty = {
                            rowKey: sourceTableKeyIndex,
                            key: finalKey,
                            val: String(val)
                        };

                        nestedDoc.push(propty);
                    }
                }

            } else {
                if (!/^@xmlns/.test(key)) {
                    let finalKey = getNamespace(key, val, parentNamespace);

                    sourceTableKeyIndex = sourceTableKeyIndex + 1;
                    let propty = {
                        rowKey: sourceTableKeyIndex,
                        key: finalKey,
                        val: ""
                    };

                    nestedDoc.push(propty);
                }
            }
        });
        return nestedDoc;
    }

    const updateParentNamespace = (val) => {
        let nmspcURI = val['@xmlns'];
        let indCheck = nmspcURI.lastIndexOf('/');
        let ind = indCheck !== -1 ? indCheck + 1 : 0;
        let nmspcString = nmspcURI.slice(ind);
        return nmspcString;
    }

    const getMappingFunctions = async () => {
        try {
            let response = await axios.get(`/api/artifacts/mapping/functions`);

            if (response.status === 200) {
                setMapFunctions({...response.data});
              console.log('GET Mapping functions API Called successfully!');
            }
          } catch (error) {
              let message = error;
              console.log('Error while fetching the functions!', message);
          }
    }

    const extractEntityInfoForTable = async () => {
        let resp = await getNestedEntities(props.entityTypeTitle);
        if (resp.status === 200) {
            let entProps = resp.data && resp.data.definitions ? resp.data.definitions[props.entityTypeTitle].properties : {};
            let entEntityTempData: any = [];
            let nestedEntityProps = extractNestedEntityData(entProps, entEntityTempData);
            setEntityTypeProperties([...nestedEntityProps]);
            setTgtEntityReferences({...tgtRefs });
        }
    }


    const extractNestedEntityData = (entProps, nestedEntityData: Array<any>,parentKey = '') => {

        Object.keys(entProps).map(key => {
            let val = entProps[key];

            if (val.hasOwnProperty('subProperties')) {
                let dataTp = getDatatype(val);
                parentKey = parentKey ? parentKey + '/' + key : key;
                EntitYTableKeyIndex = EntitYTableKeyIndex + 1;
                if(val.$ref || val.items.$ref) {
                    let ref = val.$ref ? val.$ref : val.items.$ref;
                    tgtRefs[parentKey] = ref;
                }

                let propty = {
                    key: EntitYTableKeyIndex,
                    name: parentKey,
                    type: dataTp,
                    children: []
                }
                nestedEntityData.push(propty);
                extractNestedEntityData(val.subProperties, propty.children, parentKey);
                parentKey = (parentKey.indexOf("/")!=-1)?parentKey.substring(0,parentKey.lastIndexOf('/')):''

            } else {
                let dataTp = getDatatype(val);
                EntitYTableKeyIndex = EntitYTableKeyIndex + 1;
                let tempKey = parentKey;
                let propty = {
                    key: EntitYTableKeyIndex,
                    name: parentKey ? parentKey + '/' + key : key,
                    type: dataTp
                }
                nestedEntityData.push(propty);
            }
        });

        return nestedEntityData;
    }

    const getDatatype = (prop) => {
        if (prop.datatype === 'array') {
            if (prop.items && prop.items.$ref) {
                let s = prop.items.$ref.split('/');
                return 'parent-' + s.slice(-1).pop() + ' [ ]';
            } else if (prop.items && prop.items.datatype) {
                return 'parent-' + prop.items.datatype + ' [ ]';
            }
        } else if (prop.hasOwnProperty('$ref') && prop.$ref !== null) {
            let s = prop.$ref.split('/');
            return 'parent-' + s.slice(-1).pop();
        } else {
            return prop.datatype;
        }
        return null;
    }

    const openSourceToEntityMapping = async (name,index) => {
            mapIndexLocal = index;
            setMapIndex(index);
            let mData = await props.getMappingArtifactByMapName(props.entityModel.entityTypeId,name);
            setSourceURI('');
            setDocUris([]);
            setSourceData([]);
            setMapData({...mData})
            await getSourceData(index);
            extractEntityInfoForTable();
            setMapName(name);
            setSourceDatabaseName(mData.sourceDatabase);
            getMappingFunctions();
            setMappingVisible(true);
      }


    const cardContainer: CSSProperties = {
        cursor: 'pointer',width: '330px',margin:'-12px -12px', padding: '5px 5px'
    }

    function handleSelect(obj) {
        handleStepAdd(obj.mappingName, obj.flowName);
    }

    const handleStepAdd = (mappingName, flowName) => {
        setAddDialogVisible(true);
        setMappingArtifactName(mappingName);
        setFlowName(flowName);
    }

    const onAddOk = async (lName, fName) => {
        await props.addStepToFlow(lName, fName, 'mapping')
        setAddDialogVisible(false);

        history.push({
            pathname: '/tiles-run',
            state: {
                flowName: fName,
                flowsDefaultKey: [props.flows.findIndex(el => el.name === fName)],
                existingFlow: true
            }
        })
    }

    const addConfirmation = (
        <Modal
            visible={addDialogVisible}
            okText={<div data-testid={`${mappingArtifactName}-to-${flowName}-Confirm`}>Yes</div>}
            cancelText='No'
            onOk={() => onAddOk(mappingArtifactName, flowName)}
            onCancel={() => onCancel()}
            width={350}
            maskClosable={false}
        >
            <div style={{fontSize: '16px', padding: '10px'}}>
                Are you sure you want to add "{mappingArtifactName}" to flow "{flowName}"?
            </div>
        </Modal>
    );

    return (
        <div className={styles.loadContainer}>
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
                    <Col key={index}>
                        <div
                            onMouseOver={(e) => handleMouseOver(e, elem.name)}
                            onMouseLeave={(e) => setShowLinks('')}
                        >
                            <Card
                                actions={[
                                    <span></span>,
                                    <Tooltip title={'Settings'} placement="bottom"><Icon type="setting" key="setting" role="settings-mapping button" data-testid={elem.name+'-settings'} onClick={() => OpenMappingSettingsDialog(index)}/></Tooltip>,
                                    <Tooltip title={'Edit'} placement="bottom"><Icon type="edit" key="edit" role="edit-mapping button" data-testid={elem.name+'-edit'} onClick={() => OpenEditStepDialog(index)}/></Tooltip>,
                                    props.canReadWrite ? <Tooltip title={'Delete'} placement="bottom"><i role="delete-mapping button" data-testid={elem.name+'-delete'} onClick={() => handleCardDelete(elem.name)}><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg"/></i></Tooltip> : <i role="disabled-delete-mapping button" onClick={(event) => event.preventDefault()}><FontAwesomeIcon icon={faTrashAlt} className={styles.disabledDeleteIcon} size="lg"/></i>,
                                ]}
                                className={styles.cardStyle}
                                size="small"
                            >
                                <div className={styles.formatFileContainer}>
                                    <span className={styles.mapNameStyle}>{getInitialChars(elem.name, 27, '...')}</span>
                                    {/* <span style={sourceFormatStyle(elem.sourceFormat)}>{elem.sourceFormat.toUpperCase()}</span> */}

                                </div><br />
                                {elem.selectedSource === 'collection' ? <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(elem.sourceQuery)}</div> : <div className={styles.sourceQuery}>Source Query: {getInitialChars(elem.sourceQuery,32,'...')}</div>}
                                <br /><br />
                                <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</p>
                                <div className={styles.cardLinks} style={{display: showLinks === elem.name ? 'block' : 'none'}}>
                                    <div className={styles.cardLink} onClick={() => openSourceToEntityMapping(elem.name,index)}>Open step details</div>
                                    { props.canWriteFlow ? <Link id="tiles-run" to={
                                    {pathname: '/tiles-run',
                                    state: {
                                        stepToAdd : elem.name,
                                        stepDefinitionType : 'mapping'
                                    }}}><div className={styles.cardLink} data-testid={`${elem.name}-toNewFlow`}> Add step to a new flow</div></Link> : <div className={styles.cardDisabledLink} data-testid={`${elem.name}-disabledToNewFlow`}> Add step to a new flow</div> }
                                    <div className={styles.cardNonLink} data-testid={`${elem.name}-toExistingFlow`}>
                                        Add step to an existing flow
                                        <div className={styles.cardLinkSelect}>
                                            <Select
                                                style={{ width: '100%' }}
                                                onChange={(flowName) => handleSelect({flowName: flowName, mappingName: elem.name})}
                                                placeholder="Select Flow"
                                                defaultActiveFirstOption={false}
                                                disabled={!props.canWriteFlow}
                                                data-testid={`${elem.name}-flowsList`}
                                            >
                                                { props.flows && props.flows.length > 0 ? props.flows.map((f,i) => (
                                                    <Option value={f.name} key={i}>{f.name}</Option>
                                                )) : null}
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>
                )) : <span></span> }</Row>
                <CreateEditMappingDialog
                newMap={newMap}
                title={title}
                setNewMap={setNewMap}
                targetEntityType={props.entityModel.entityTypeId}
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
                sourceDatabaseName={sourceDatabaseName}
                mapFunctions={mapFunctions}
                namespaces={namespaces}
                mapIndex={mapIndex}
                tgtEntityReferences={tgtEntityReferences}/>
            <AdvancedSettingsDialog
                tooltipsData={AdvMapTooltips}
                openAdvancedSettings={openMappingSettings}
                setOpenAdvancedSettings={setOpenMappingSettings}
                stepData={mapData}
                activityType={activityType}
                canWrite={authorityService.canWriteMapping()}
            />
            {addConfirmation}
        </div>
    );

}

export default MappingCard;
