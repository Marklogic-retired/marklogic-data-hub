import React, { useState, useEffect, useContext} from 'react';
import styles from './mapping-card.module.scss';
import {Card, Icon, Tooltip, Dropdown, Row, Col, Modal, Select, Menu} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';
import { convertDateFromISO, getInitialChars, extractCollectionFromSrcQuery, sortStepsByUpdated} from '../../../util/conversionFunctions';
import SourceToEntityMap from './source-entity-map/source-to-entity-map';
import {getUris, getDoc} from '../../../util/search-service';
import { AdvMapTooltips, SecurityTooltips } from '../../../config/tooltips.config';
import {AuthoritiesContext} from "../../../util/authorities";
import { getNestedEntities } from '../../../util/manageArtifacts-service';
import axios from 'axios';
import { xmlParserForMapping } from '../../../util/xml-parser';
import { Link, useHistory } from 'react-router-dom';
import { MLTooltip } from '@marklogic/design-system';
import {faSlidersH, faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import Steps from "../../steps/steps";

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
    const [sourceFormat,setSourceFormat] = useState('');
    const [sourceDatabaseName, setSourceDatabaseName] = useState('data-hub-STAGING');
    const [docNotFound, setDocNotFound] = useState(false);
    const [flowName, setFlowName] = useState('');
    const [showLinks, setShowLinks] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sortedMapping, setSortedMappings] = useState(props.data);
    const [selected, setSelected] = useState({}); // track Add Step selections so we can reset on cancel
    const [selectVisible, setSelectVisible] = useState(false);
    const [addRun, setAddRun] = useState(false);
    const [openStepSettings, setOpenStepSettings] = useState(false);
    const [isNewStep, setIsNewStep] = useState(false);

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
    const [mapFunctions,setMapFunctions] = useState([]);

    //For storing namespaces
    const [namespaces, setNamespaces] = useState({});
    let nmspaces: any = {};
    let mapIndexLocal: number = -1;
    const [mapIndex, setMapIndex] = useState(-1);
    let namespaceString = '';

    //To navigate to bench view with parameters
    let history = useHistory();

    useEffect(() => {
        let sortedArray = props.data.length > 1 ? sortStepsByUpdated(props.data) : props.data;
        setSortedMappings(sortedArray);
        setSourceData([]);
    },[props.data]);

    const OpenAddNew = () => {
        setIsNewStep(true);
        setOpenStepSettings(true);
    }

    const OpenStepSettings = (index) => {
        setIsNewStep(false);
        //setStepData(prevState => ({ ...prevState, ...props.data[index]}));
        setMapData(prevState => ({ ...prevState, ...props.data[index]}));
        setOpenStepSettings(true);
    }

    const OpenEditStepDialog = async (name, index) => {
        setTitle('Edit Mapping Step');
        let settingsData = await axios.get(`/api/steps/mapping/${name}`);
        setMapData(prevState => ({ ...prevState, ...props.data[index]}));
        setSourceDatabaseName(settingsData.data.sourceDatabase);
        setNewMap(true);
    };

    const OpenMappingSettingsDialog = (index) => {
        setMapData(prevState => ({ ...prevState, ...props.data[index]}));
        setOpenMappingSettings(true);
    };

    const createMappingArtifact = async (payload) => {
        // Update local form state, then save to db
        setMapData(prevState => ({ ...prevState, ...payload}));
        props.createMappingArtifact(payload);
    }

    const updateMappingArtifact = (payload) => {
        // Update local form state
        setMapData(prevState => ({ ...prevState, ...payload}));
    }

    const handleCardDelete = (name) => {
        setDialogVisible(true);
        setMappingArtifactName(name);
      };

      const onOk = (name) => {
        props.deleteMappingArtifact(name);
        setDialogVisible(false);
      };

      const onCancel = () => {
        setDialogVisible(false);
        setAddDialogVisible(false);
        setSelected({}); // reset menus on cancel
      };

      function handleMouseOver(e, name) {
        // Handle all possible events from mouseover of card body
          setSelectVisible(true);
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
      function handleMouseLeave() {
        setShowLinks('');
        setSelectVisible(false);
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
        <span style={{fontSize: '16px'}}>Are you sure you want to delete the <strong>{mappingArtifactName}</strong> step?</span>
        </Modal>;


    const getSourceData = async (index) => {
        let stepName = props.data[index].name;
        try{
            setIsLoading(true);
            let response = await getUris(stepName,20);
              if (response.status === 200) {
               if (response.data.length > 0) {
                   setDisableURINavRight(response.data.length > 1 ? false : true);
                   setDocUris(response.data);
                   setSourceURI(response.data[0]);
                   fetchSrcDocFromUri(stepName ,response.data[0]);
              }
               else {
                   setIsLoading(false);
               }
            }
        }
        catch(error)  {
            let message = error;
            console.error('Error While loading the source data!', message);
            setIsLoading(false);
            setDocNotFound(true);
        }


    };

    const fetchSrcDocFromUri = async (stepName, uri, index = mapIndexLocal) => {
        try{
            let srcDocResp = await getDoc(stepName, uri);
            if (srcDocResp.status === 200) {
                let parsedDoc: any;
                if (typeof(srcDocResp.data) === 'string') {
                    parsedDoc = getParsedXMLDoc(srcDocResp);
                    setSourceFormat('xml');
                } else {
                    parsedDoc = srcDocResp.data;
                    setSourceFormat('json');
                }
                if (parsedDoc['envelope']) {
                    if (parsedDoc['envelope'].hasOwnProperty('@xmlns')) {

                        let nmspcURI = parsedDoc['envelope']['@xmlns'];
                        let indCheck = nmspcURI.lastIndexOf('/');
                        let ind = indCheck !== -1 ? indCheck + 1 : 0;
                        let nmspcString = nmspcURI.slice(ind);
                        namespaceString = nmspcString;
                        nmspaces = { ...nmspaces, [namespaceString]: nmspcURI};
                        setNamespaces({ ...namespaces, [namespaceString]: nmspcURI});
                    }
                }
                let nestedDoc: any = [];
                let docRoot = parsedDoc['envelope'] ? parsedDoc['envelope']['instance'] : parsedDoc;
                let sDta = generateNestedDataSource(docRoot,nestedDoc);
                setSourceData([]);
                setSourceData([...sDta]);
                if (typeof(srcDocResp.data) === 'string') {
                    let mData = await props.getMappingArtifactByMapName(props.entityModel.entityTypeId,props.data[index].name);
                    updateMappingWithNamespaces(mData);
                }
            }
            setIsLoading(false);
        } catch(error)  {
            let message = error;//.response.data.message;
            setIsLoading(false);
            console.error('Error While loading the Doc from URI!', message);
            setDocNotFound(true);
        }
    };

    const getParsedXMLDoc = (xmlDoc) => {
        let parsedDoc = xmlParserForMapping(xmlDoc.data);
        return parsedDoc;
    };

    const updateMappingWithNamespaces = async (mapDataLocal) => {
        let {lastUpdated, ...dataPayload} = mapDataLocal;
        dataPayload['namespaces'] = nmspaces;
        setMapData({...dataPayload});
    };

    const getNamespaceKey = (namespace) => {
        let indCheck = namespace.lastIndexOf('/');
        let ind = indCheck !== -1 ? indCheck + 1 : 0;
        return namespace.slice(ind);
    };
    //Generate namespaces for source properties
    const getNamespace = (key, val, parentNamespacePrefix, defaultNamespace = '') => {
        let objWithNmspace = '';
        let keyParts = key.split(':');
        let currentPrefix = keyParts.length > 1 ? keyParts[0] : '';
        // set context namespaces first
        if (val && val.constructor && val.constructor.name === 'Object') {
            let valObject = Object.keys(val).filter((el) => /^@xmlns/.test(el));
            defaultNamespace = valObject.filter((ns) => val === '@xmlns')[0] || defaultNamespace;
            let count = valObject.length;
            if (count === 1) {
                valObject.map(el => {
                    let nsObj = getNamespaceObject(val, el);
                    if (el === '@xmlns' || el === `@xmlns:${currentPrefix}`) {
                        if (objWithNmspace === '') {
                            if (keyParts.length > 1) {
                                let keyArr = key.split(':');
                                objWithNmspace = nsObj.nmspace ? nsObj.nmspace + ':' + keyArr[1] : keyArr[1];
                            } else {
                                objWithNmspace = nsObj.nmspace ? nsObj.nmspace + ':' + key : key;
                            }
                        }
                    }
                    nmspaces = {...nmspaces, ...nsObj.obj};
                    setNamespaces({...nmspaces, ...nsObj.obj});
                });
            } else if (count > 1) {
                valObject.map(el => {
                    let nsObj = getNamespaceObject(val,el);
                    nmspaces = { ...nmspaces, ...nsObj.obj };
                    setNamespaces({ ...nmspaces, ...nsObj.obj });
                });
            }
        }
        if (keyParts.length > 1) {
            if (nmspaces.hasOwnProperty(keyParts[0]) && nmspaces[keyParts[0]] !== keyParts[0]) {
                objWithNmspace = getNamespaceKey(nmspaces[keyParts[0]]) + ':' + keyParts[1];
            }
        }
        currentPrefix = defaultNamespace !== '' && objWithNmspace === '' ? getNamespaceKey(defaultNamespace) : parentNamespacePrefix;
        return objWithNmspace === '' ? (currentPrefix !== '' ? currentPrefix +':'+ key : key) : objWithNmspace;
    };

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
    };

    //Generate property object to push into deeply nested source data
    const getPropertyObject = (key, obj) => {
        let propty: any;
        if (obj.hasOwnProperty('#text')) {
            if (Object.keys(obj).filter((el) => /^@xmlns/.test(el) || el === '#text').length === Object.keys(obj).length) {
                sourceTableKeyIndex = sourceTableKeyIndex + 1;
                propty = {
                    rowKey: sourceTableKeyIndex,
                    key: key,
                    val: String(obj['#text']),
                    datatype: getValDatatype(obj['#text'])
                };
            } else {
                sourceTableKeyIndex = sourceTableKeyIndex + 1;
                propty = {
                    rowKey: sourceTableKeyIndex,
                    key: key,
                    val: String(obj['#text']),
                    'children': [],
                    datatype: getValDatatype(obj['#text'])
                };
            }
        } else {
            sourceTableKeyIndex = sourceTableKeyIndex + 1;
            propty = {
                rowKey: sourceTableKeyIndex,
                key: key,
                'children': []
            };
        }
        return propty;
    };

    const getValDatatype = (val) => {
        let result: any = typeof val;
        result = val === null ? 'null' : result; // null returns typeof 'object', handle that
        return result;
    };

    // construct infinitely nested source Data
    const generateNestedDataSource = (respData, nestedDoc: Array<any>, parentNamespace = namespaceString, defaultNamespace = '') => {
        Object.keys(respData).map(key => {
            let val = respData[key];
            let currentDefaultNamespace = defaultNamespace;
            if (val !== null && val !== "") {

                if (val && val.constructor && val.constructor.name === "Object") {
                    let tempNS = parentNamespace;
                    if (val.hasOwnProperty('@xmlns')) {
                        parentNamespace = updateParentNamespace(val);
                        currentDefaultNamespace = val['@xmlns'];
                    }

                    let finalKey = getNamespace(key, val, parentNamespace, currentDefaultNamespace);
                    let propty = getPropertyObject(finalKey, val);

                    generateNestedDataSource(val, propty.children, parentNamespace, currentDefaultNamespace);
                    nestedDoc.push(propty);

                    if (parentNamespace !== tempNS) {
                        parentNamespace = tempNS;
                    }
                } else if (val && Array.isArray(val)) {
                    if (val.length === 0) {
                        sourceTableKeyIndex = sourceTableKeyIndex + 1;
                        let finalKey = !/^@/.test(key) ? getNamespace(key, val, parentNamespace, currentDefaultNamespace) : key;
                        let propty = {
                            rowKey: sourceTableKeyIndex,
                            key: finalKey,
                            val: '[ ]',
                            array: true,
                            datatype: getValDatatype(val)
                        };
                        nestedDoc.push(propty);
                    }
                    else if (val[0].constructor.name !== "Object") {
                            let joinValues = val.join(', ');
                            sourceTableKeyIndex = sourceTableKeyIndex + 1;
                            let finalKey = !/^@/.test(key) ? getNamespace(key, val, parentNamespace, currentDefaultNamespace) : key;
                            let propty = {
                                rowKey: sourceTableKeyIndex,
                                key: finalKey,
                                val: joinValues,
                                array: true,
                                datatype: val[0].constructor.name.toLowerCase()
                            };
                            nestedDoc.push(propty);
                    } else {
                        val.forEach(obj => {
                            let tempNS = parentNamespace;
                            let childDefaultNamespace = currentDefaultNamespace;
                            if (obj.constructor.name === "Object" && obj.hasOwnProperty('@xmlns')) {
                                parentNamespace = updateParentNamespace(obj);
                                childDefaultNamespace = obj['@xmlns'];
                            }
                            let finalKey = getNamespace(key, obj, parentNamespace, childDefaultNamespace);
                            let propty = getPropertyObject(finalKey, obj);

                            generateNestedDataSource(obj, propty.children, parentNamespace, childDefaultNamespace);
                            nestedDoc.push(propty);
                            if (parentNamespace !== tempNS) {
                                parentNamespace = tempNS;
                            }
                        });
                    }

                } else {

                    if (key !== '#text' && !/^@xmlns/.test(key)) {
                        let finalKey = !/^@/.test(key) ? getNamespace(key, val, parentNamespace, currentDefaultNamespace) : key;
                        let propty: any;
                        sourceTableKeyIndex = sourceTableKeyIndex + 1;
                        propty = {
                            rowKey: sourceTableKeyIndex,
                            key: finalKey,
                            val: String(val),
                            datatype: getValDatatype(val)
                        };
                        nestedDoc.push(propty);
                    }
                }

            }
            // val is null or ""
            else {
                if (!/^@xmlns/.test(key)) {
                    let finalKey = getNamespace(key, val, parentNamespace, currentDefaultNamespace);

                    sourceTableKeyIndex = sourceTableKeyIndex + 1;
                    let propty = {
                        rowKey: sourceTableKeyIndex,
                        key: finalKey,
                        val: String(val),
                        datatype: getValDatatype(val)
                    };
                    nestedDoc.push(propty);
                }
            }
        });
        return nestedDoc;
    };

    const updateParentNamespace = (val) => {
        let nmspcURI = val['@xmlns'];
        let indCheck = nmspcURI.lastIndexOf('/');
        let ind = indCheck !== -1 ? indCheck + 1 : 0;
        let nmspcString = nmspcURI.slice(ind);
        return nmspcString;
    };

    const getMappingFunctions = async () => {
        try {
            let response = await axios.get(`/api/artifacts/mapping/functions`);

            if (response.status === 200) {
                setMapFunctions(response.data);
            }
          } catch (error) {
              let message = error;
              console.error('Error while fetching the functions!', message);
          }
    };

    const extractEntityInfoForTable = async () => {
        let resp = await getNestedEntities(props.entityTypeTitle);
        if (resp.status === 200) {
            let entProps = resp.data && resp.data.definitions ? resp.data.definitions[props.entityTypeTitle].properties : {};
            let entEntityTempData: any = [];
            let nestedEntityProps = extractNestedEntityData(entProps, entEntityTempData);
            setEntityTypeProperties([...nestedEntityProps]);
            setTgtEntityReferences({...tgtRefs });
        }
    };


    const extractNestedEntityData = (entProps, nestedEntityData: Array<any>,parentKey = '') => {

        Object.keys(entProps).map(key => {
            let val = entProps[key];

            if (val.hasOwnProperty('subProperties')) {
                let dataTp = getDatatype(val);
                parentKey = parentKey ? parentKey + '/' + key : key;
                EntitYTableKeyIndex = EntitYTableKeyIndex + 1;
                if (val.$ref || val.items.$ref) {
                    let ref = val.$ref ? val.$ref : val.items.$ref;
                    tgtRefs[parentKey] = ref;
                }

                let propty = {
                    key: EntitYTableKeyIndex,
                    name: parentKey,
                    type: dataTp,
                    children: []
                };
                nestedEntityData.push(propty);
                extractNestedEntityData(val.subProperties, propty.children, parentKey);
                parentKey = (parentKey.indexOf("/")!=-1)?parentKey.substring(0,parentKey.lastIndexOf('/')):'';

            } else {
                let dataTp = getDatatype(val);
                EntitYTableKeyIndex = EntitYTableKeyIndex + 1;
                let propty = {
                    key: EntitYTableKeyIndex,
                    name: parentKey ? parentKey + '/' + key : key,
                    type: dataTp
                };
                nestedEntityData.push(propty);
            }
        });

        return nestedEntityData;
    };

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
    };

    const openSourceToEntityMapping = async (name,index) => {
            mapIndexLocal = index;
            setMapIndex(index);
            let mData = await props.getMappingArtifactByMapName(props.entityModel.entityTypeId,name);
            setSourceURI('');
            setDocUris([]);
            setSourceData([]);
            setMapData({...mData});
            await getSourceData(index);
            extractEntityInfoForTable();
            setMapName(name);
            setSourceDatabaseName(mData.sourceDatabase);
            getMappingFunctions();
            setMappingVisible(true);
      };


    function handleSelect(obj) {
        let selectedNew = {...selected};
        selectedNew[obj.loadName] = obj.flowName;
        setSelected(selectedNew);
        setAddRun(false);
        handleStepAdd(obj.mappingName, obj.flowName);
    }

    function handleSelectAddRun(obj) {
        let selectedNew = {...selected};
        selectedNew[obj.loadName] = obj.flowName;
        setSelected(selectedNew);
        setAddRun(true);
        handleStepAdd(obj.mappingName, obj.flowName);
    }

    const isStepInFlow = (mappingName, flowName) => {
        let result = false, flow;
        if (props.flows) flow = props.flows.find(f => f.name === flowName);
        if (flow) result = flow['steps'].findIndex(s => s.stepName === mappingName) > -1;
        return result;
    };

    const handleStepAdd = (mappingName, flowName) => {
        setMappingArtifactName(mappingName);
        setFlowName(flowName);
        setAddDialogVisible(true);
    };

    const onAddOk = async (lName, fName) => {
        await props.addStepToFlow(lName, fName, 'mapping');
        setAddDialogVisible(false);
        
        if (addRun) {
            history.push({
                pathname: '/tiles/run/add-run',
                state: {
                    flowName: fName,
                    flowsDefaultKey: [props.flows.findIndex(el => el.name === fName)],
                    existingFlow: true,
                    addFlowDirty: true,
                    stepToAdd : mappingArtifactName,
                    stepDefinitionType : 'mapping'
                }
            })
        } else {
            history.push({
                pathname: '/tiles/run/add',
                state: {
                    flowName: fName,
                    addFlowDirty: true,
                    flowsDefaultKey: [props.flows.findIndex(el => el.name === fName)],
                    existingFlow: true
                }
            })
        }
    }

    const menu = (name) => (
        <Menu style={{right: '80px'}}>
            <Menu.Item key="0">
                { <Link data-testid="link" id="tiles-add-run" to={
                                        {pathname: '/tiles/run/add-run',
                                        state: {
                                            stepToAdd : name,
                                            stepDefinitionType : 'mapping',
                                            targetEntityType: props.entityModel.entityTypeId,
                                            existingFlow : false
                                        }}}><div className={styles.stepLink} data-testid={`${name}-run-toNewFlow`}>Run step in a new flow</div></Link>}
            </Menu.Item>
            <Menu.Item key="1">
                <div className={styles.stepLinkExisting} data-testid={`${name}-run-toExistingFlow`}>Run step in an existing flow
                    <div className={styles.stepLinkSelect} onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
                        <Select
                            style={{ width: '100%' }}
                            value={selected[name] ? selected[name] : undefined}
                            onChange={(flowName) => handleSelectAddRun({flowName: flowName, mappingName: name})}
                            placeholder="Select Flow"
                            defaultActiveFirstOption={false}
                            disabled={!props.canWriteFlow}
                            data-testid={`${name}-run-flowsList`}
                        >
                            { props.flows && props.flows.length > 0 ? props.flows.map((f,i) => (
                                <Option aria-label={`${f.name}-run-option`} value={f.name} key={i}>{f.name}</Option>
                            )) : null}
                        </Select>
                    </div>
                </div>
            </Menu.Item>
        </Menu>
    );

    const addConfirmation = (
        <Modal
            visible={addDialogVisible}
            okText={<div data-testid={`${mappingArtifactName}-to-${flowName}-Confirm`}>Yes</div>}
            cancelText='No'
            onOk={() => onAddOk(mappingArtifactName, flowName)}
            onCancel={() => onCancel()}
            width={400}
            maskClosable={false}
        >
            <div aria-label="add-step-confirmation" style={{fontSize: '16px', padding: '10px'}}>
                { isStepInFlow(mappingArtifactName, flowName) ?
                    !addRun ? <p aria-label="step-in-flow">The step <strong>{mappingArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance?</p> : <p aria-label="step-in-flow-run">The step <strong>{mappingArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance and run it?</p>
                    : !addRun ? <p aria-label="step-not-in-flow">Are you sure you want to add the step <strong>{mappingArtifactName}</strong> to the flow <strong>{flowName}</strong>?</p> : <p aria-label="step-not-in-flow-run">Are you sure you want to add the step <strong>{mappingArtifactName}</strong> to the flow <strong>{flowName}</strong> and run it?</p> 
                }
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
                        <div><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={OpenAddNew}/></div>
                        <br />
                        <p className={styles.addNewContent}>Add New</p>
                    </Card>
                </Col> : ''}{sortedMapping && sortedMapping.length > 0 ? sortedMapping.map((elem,index) => (
                    <Col key={index}>
                        <div
                            data-testid={`${props.entityTypeTitle}-${elem.name}-step`}
                            onMouseOver={(e) => handleMouseOver(e, elem.name)}
                            onMouseLeave={(e) => handleMouseLeave()}
                        >
                            <Card
                                actions={[
                                    <MLTooltip title={'Edit'} placement="bottom"><i className={styles.editIcon} role="edit-mapping button" key ="last"><FontAwesomeIcon icon={faPencilAlt} data-testid={elem.name+'-edit'} onClick={() => OpenStepSettings(index)}/></i></MLTooltip>,
                                    <MLTooltip title={'Step Details'} placement="bottom"><i style={{ fontSize: '16px', marginLeft: '-5px', marginRight: '5px'}}><FontAwesomeIcon icon={faSlidersH} onClick={() => openSourceToEntityMapping(elem.name,index)} data-testid={`${elem.name}-stepDetails`}/></i></MLTooltip>,
                                    <Dropdown data-testid={`${elem.name}-dropdown`} overlay={menu(elem.name)} trigger={['click']} disabled = {!props.canWriteFlow}>    
                                    {props.canReadWrite ?<MLTooltip title={'Run'} placement="bottom"><i aria-label="icon: run"><Icon type="play-circle" theme="filled" className={styles.runIcon} data-testid={elem.name+'-run'}/></i></MLTooltip> : <MLTooltip title={'Run: ' + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: '200px'}}><i role="disabled-run-mapping button" data-testid={elem.name+'-disabled-run'}><Icon type="play-circle" theme="filled" onClick={(event) => event.preventDefault()} className={styles.disabledIcon}/></i></MLTooltip>}
                                    </Dropdown>,
                                    props.canReadWrite ? <MLTooltip title={'Delete'} placement="bottom"><i key ="last" role="delete-mapping button" data-testid={elem.name+'-delete'} onClick={() => handleCardDelete(elem.name)}><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg"/></i></MLTooltip> : <MLTooltip title={'Delete: ' + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: '200px'}}><i role="disabled-delete-mapping button" data-testid={elem.name+'-disabled-delete'} onClick={(event) => event.preventDefault()}><FontAwesomeIcon icon={faTrashAlt} className={styles.disabledIcon} size="lg"/></i></MLTooltip>,
                                ]}
                                className={styles.cardStyle}
                                size="small"
                            >
                                <div className={styles.formatFileContainer}>
                                    <span aria-label={`${elem.name}-step-label`} className={styles.mapNameStyle}>{getInitialChars(elem.name, 27, '...')}</span>

                                </div><br />
                                {elem.selectedSource === 'collection' ? <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(elem.sourceQuery)}</div> : <div className={styles.sourceQuery}>Source Query: {getInitialChars(elem.sourceQuery,32,'...')}</div>}
                                <br /><br />
                                <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</p>
                                <div className={styles.cardLinks} style={{display: showLinks === elem.name ? 'block' : 'none'}}>
                                    { props.canWriteFlow ? <Link id="tiles-run-add" to={
                                    {pathname: '/tiles/run/add',
                                    state: {
                                        stepToAdd : elem.name,
                                        targetEntityType: props.entityModel.entityTypeId,
                                        stepDefinitionType : 'mapping'
                                    }}}><div className={styles.cardLink} data-testid={`${elem.name}-toNewFlow`}> Add step to a new flow</div></Link> : <div className={styles.cardDisabledLink} data-testid={`${elem.name}-disabledToNewFlow`}> Add step to a new flow</div> }
                                    <div className={styles.cardNonLink} data-testid={`${elem.name}-toExistingFlow`}>
                                        Add step to an existing flow
                                        {selectVisible ? <div className={styles.cardLinkSelect}>
                                            <Select
                                                style={{ width: '100%' }}
                                                value={selected[elem.name] ? selected[elem.name] : undefined}
                                                onChange={(flowName) => handleSelect({flowName: flowName, mappingName: elem.name})}
                                                placeholder="Select Flow"
                                                defaultActiveFirstOption={false}
                                                disabled={!props.canWriteFlow}
                                                data-testid={`${elem.name}-flowsList`}
                                                getPopupContainer={() => document.getElementById('entityTilesContainer') || document.body}
                                            >
                                                { props.flows && props.flows.length > 0 ? props.flows.map((f,i) => (
                                                    <Option aria-label={`${f.name}-option`} value={f.name} key={i}>{f.name}</Option>
                                                )) : null}
                                            </Select>
                                        </div> : null}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>
                )) : <span></span> }</Row>
                {deleteConfirmation}
                <SourceToEntityMap
                sourceData={sourceData}
                sourceURI={sourceURI}
                sourceFormat={sourceFormat}
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
                tgtEntityReferences={tgtEntityReferences}
                isLoading={isLoading}/>
            {addConfirmation}
            <Steps
                // Basic Settings
                isNewStep={isNewStep}
                createStep={createMappingArtifact}
                stepData={mapData}
                sourceDatabase={sourceDatabaseName}
                canReadOnly={props.canReadOnly}
                canReadWrite={props.canReadWrite}
                canWrite={props.canReadWrite}
                // Advanced Settings
                tooltipsData={AdvMapTooltips}
                openStepSettings={openStepSettings}
                setOpenStepSettings={setOpenStepSettings}
                updateStep={updateMappingArtifact}
                activityType={activityType}
                targetEntityType={props.entityModel.entityTypeId}
            />
        </div>
    );

};

export default MappingCard;
