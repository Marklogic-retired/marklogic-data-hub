
import React, {useState, useEffect, CSSProperties, useRef, useContext} from "react";
import {Card, Table, Icon, Input, Alert, Dropdown, Menu} from "antd";
import styles from "./mapping-step-detail.module.scss";
import "./mapping-step-detail.scss";
import EntityMapTable from "../entity-map-table/entity-map-table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faSearch, faCog, faLayerGroup, faKey} from "@fortawesome/free-solid-svg-icons";
import {getInitialChars, convertDateFromISO, getLastChars, extractCollectionFromSrcQuery} from "../../../../util/conversionFunctions";
import {getMappingValidationResp, getNestedEntities} from "../../../../util/manageArtifacts-service";
import SplitPane from "react-split-pane";
import Highlighter from "react-highlight-words";
import {MLButton, MLTooltip, MLCheckbox, MLSpin} from "@marklogic/design-system";
import SourceNavigation from "../source-navigation/source-navigation";
import ExpandCollapse from "../../../expand-collapse/expand-collapse";
import {useHistory} from "react-router-dom";
import {getUris, getDoc} from "../../../../util/search-service";
import {xmlParserForMapping} from "../../../../util/record-parser";
import {CurationContext} from "../../../../util/curation-context";
import {AuthoritiesContext} from "../../../../util/authorities";
import {MappingStep, StepType} from "../../../../types/curation-types";
import {getMappingArtifactByMapName, updateMappingArtifact} from "../../../../api/mapping";
import Steps from "../../../steps/steps";
import {AdvMapTooltips} from "../../../../config/tooltips.config";
import arrayIcon from "../../../../assets/icon_array.png";
import relatedEntityIcon from "../../../../assets/icon_related_entities.png";
import CustomPageHeader from "../../page-header/page-header";

const DEFAULT_MAPPING_STEP: MappingStep = {
  name: "",
  description: "",
  additionalCollections: [],
  collections: [],
  lastUpdated: "",
  permissions: "",
  properties: {},
  provenanceGranularityLevel: "",
  selectedSource: "",
  sourceDatabase: "",
  sourceQuery: "",
  stepDefinitionName: "",
  stepDefinitionType: "",
  stepId: "",
  targetDatabase: "",
  targetEntityType: "",
  targetFormat: "",
  validateEntity: "",
  batchSize: 100,
  interceptors: [],
  customHook: {}
};

const MappingStepDetail: React.FC = () => {

  const history = useHistory<any>();
  const {curationOptions,
    mappingOptions,
    updateActiveStepArtifact,
    setOpenStepSettings,
    setStepOpenOptions} = useContext(CurationContext);


  //Role based access
  const authorityService = useContext(AuthoritiesContext);
  const canReadOnly = authorityService.canReadMapping();
  const canReadWrite = authorityService.canWriteMapping();
  const [mapExp, setMapExp] = useState({});
  const [sourceContext, setSourceContext] = useState({});
  let tempSourceContext: any = {};
  let trackUniqueKeys: any = [];
  /*-------------------*/

  //Dummy ref node to simulate a click event
  const dummyNode: any = useRef();

  /*-------------------*/

  const [entityTypeProperties, setEntityTypeProperties] = useState<any[]>([]);

  const [mapExpTouched, setMapExpTouched] = useState(false);
  const [editingURI, setEditingUri] = useState(false);
  const [showEditURIOption, setShowEditURIOption] = useState(false);
  const [mapSaved, setMapSaved] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [errorInSaving, setErrorInSaving] = useState("");

  //For source dropdown search menu
  const [flatArray, setFlatArray]   = useState<any[]>([]);

  //For TEST and Clear buttons
  const [mapResp, setMapResp] = useState({});
  const [isTestClicked, setIsTestClicked] = useState(false);
  const [savedMappingArt, setSavedMappingArt] = useState(DEFAULT_MAPPING_STEP);

  //Navigate URI buttons
  const [uriIndex, setUriIndex] = useState(0);

  //For Collapse all-Expand All buttons
  const [entityExpandedKeys, setEntityExpandedKeys] = useState<any[]>([]);
  const [sourceExpandedKeys, setSourceExpandedKeys] = useState<any[]>([]);
  const [expandedEntityFlag, setExpandedEntityFlag] = useState(false);
  const [expandedSourceFlag, setExpandedSourceFlag] = useState(false);
  const [initialSourceKeys, setInitialSourceKeys] = useState<any []>([]);
  const [initialEntityKeys, setInitialEntityKeys] = useState<any []>([]);
  const [allSourceKeys, setAllSourceKeys] = useState<any []>([]);
  const [allEntityKeys, setAllEntityKeys] = useState<any []>([]);

  //For Entity table
  const [tgtEntityReferences, setTgtEntityReferences] = useState({});
  let EntityTableKeyIndex = 100;
  let sourceTableKeyIndex = 0;
  let firstRowTableKeyIndex = 0;
  let firstRowKeys = new Array(100).fill(0).map((_, i) => i);
  let tgtRefs:any = {};
  const [relatedEntityTypeProperties, setRelatedEntityTypeProperties] = useState<any[]>([]);
  const [relatedEntitiesSelected, setRelatedEntitiesSelected] = useState<any[]>([]);
  const [targetRelatedMappings, setTargetRelatedMappings] = useState<any[]>([]);
  const [removedEntities, setRemovedEntities] = useState<any[]>([]);

  //For storing docURIs
  const [docUris, setDocUris] = useState<any[]>([]);

  //For storing namespaces
  const [namespaces, setNamespaces] = useState({});
  let nmspaces: any = {};
  let namespaceString = "";
  const [isLoading, setIsLoading] = useState(false);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [sourceURI, setSourceURI] = useState("");
  const [sourceURIPrev, setSourceURIPrev] = useState("");
  const [sourceFormat, setSourceFormat] = useState("");
  const [docNotFound, setDocNotFound] = useState(false);
  const [mapData, setMapData] = useState<any>(DEFAULT_MAPPING_STEP);

  const tableColors = ["#e4f1f4", "#f0f9f5", "#fae9d3", "#f6e2e9", "#edecf5", "#f0e8ed", "#e0e1ea", "#e6eff6", "#f0f6d9", "#fff5d7", "#ecfaf7", "#ecfae2", "#dcebf3", "#f3dbd8", "#f1eef5", "#dee2ed", "#effadd", "#fae3df", "#f6f7f8"];

  //For Column Option dropdown checkboxes
  const [checkedEntityColumns, setCheckedEntityColumns] = useState({
    "name": true,
    "type": true,
    "key": true,
    "value": true
  });

  const [colOptMenuVisible, setColOptMenuVisible] = useState(false);

  const columnOptionsLabel = {
    name: "Name",
    type: "Type",
    key: "XPath Expression",
    value: "Value"
  };

  const handleEditIconClick = () => {
    setEditingUri(true);
  };

  const handleURIEditing = (e) => {
    setSourceURI(e.target.value);

  };

  const handleMouseOver = (e) => {
    setShowEditURIOption(true);
  };

  const handleCloseEditOption = () => {
    setSourceURI(sourceURIPrev);
    setEditingUri(false);
  };

  const getSourceData = async (stepName) => {
    try {
      setIsLoading(true);
      let response = await getUris(stepName, 20);
      if (response && response.status === 200) {
        if (response.data.length > 0) {
          setDocUris(response.data);
          setSourceURI(response.data[0]);
          setSourceURIPrev(response.data[0]);
          fetchSrcDocFromUri(stepName, response.data[0]);
        } else {
          setIsLoading(false);
        }
      }
    } catch (error)  {
      let message = error;
      console.error("Error While loading the source data!", message);
      setIsLoading(false);
      setDocNotFound(true);
    }
  };

  const fetchSrcDocFromUri = async (stepName, uri) => {
    try {
      let srcDocResp = await getDoc(stepName, uri);
      if (srcDocResp && srcDocResp.status === 200) {
        let parsedDoc: any;
        if (typeof(srcDocResp.data) === "string") {
          parsedDoc = getParsedXMLDoc(srcDocResp);
          setSourceFormat("xml");
        } else {
          parsedDoc = srcDocResp.data;
          setSourceFormat("json");
        }
        if (parsedDoc["envelope"]) {
          if (parsedDoc["envelope"].hasOwnProperty("@xmlns")) {

            let nmspcURI = parsedDoc["envelope"]["@xmlns"];
            let indCheck = nmspcURI.lastIndexOf("/");
            let ind = indCheck !== -1 ? indCheck + 1 : 0;
            let nmspcString = nmspcURI.slice(ind);
            namespaceString = nmspcString;
            nmspaces = {...nmspaces, [namespaceString]: nmspcURI};
            setNamespaces({...namespaces, [namespaceString]: nmspcURI});
          }
        }
        let nestedDoc: any = [];
        let docRoot = parsedDoc["envelope"] ? parsedDoc["envelope"]["instance"] : parsedDoc;
        let sDta = generateNestedDataSource(docRoot, nestedDoc);
        setSourceData([]);
        setSourceData([...sDta]);
        if (typeof(srcDocResp.data) === "string") {
          let mData = await getMappingArtifactByMapName(curationOptions.activeStep.stepArtifact.targetEntityType, stepName);
          updateMappingWithNamespaces(mData);
        }
      }
      setIsLoading(false);
    } catch (error)  {
      let message = error;//.response.data.message;
      setIsLoading(false);
      console.error("Error While loading the Doc from URI!", message);
      setDocNotFound(true);
    }
  };

  const getParsedXMLDoc = (xmlDoc) => {
    let parsedDoc = xmlParserForMapping(xmlDoc.data);
    return parsedDoc;
  };

  const updateMappingWithNamespaces = async (mapDataLocal) => {
    let {lastUpdated, ...dataPayload} = mapDataLocal;
    dataPayload["namespaces"] = nmspaces;
    setMapData({...dataPayload});
  };

  const getNamespaceKey = (namespace) => {
    let indCheck = namespace.lastIndexOf("/");
    let ind = indCheck !== -1 ? indCheck + 1 : 0;
    return namespace.slice(ind);
  };

  //Generate namespaces for source properties
  const getNamespace = (key, val, parentNamespacePrefix, defaultNamespace = "") => {
    let objWithNmspace = "";
    let keyParts = key.split(":");
    let currentPrefix = keyParts.length > 1 ? keyParts[0] : "";
    // set context namespaces first
    if (val && val.constructor && val.constructor.name === "Object") {
      let valObject = Object.keys(val).filter((el) => /^@xmlns/.test(el));
      defaultNamespace = valObject.filter((ns) => val === "@xmlns")[0] || defaultNamespace;
      let count = valObject.length;
      if (count === 1) {
        valObject.forEach(el => {
          let nsObj = getNamespaceObject(val, el);
          if (el === "@xmlns" || el === `@xmlns:${currentPrefix}`) {
            if (objWithNmspace === "") {
              if (keyParts.length > 1) {
                let keyArr = key.split(":");
                objWithNmspace = nsObj.nmspace ? nsObj.nmspace + ":" + keyArr[1] : keyArr[1];
              } else {
                objWithNmspace = nsObj.nmspace ? nsObj.nmspace + ":" + key : key;
              }
            }
          }
          nmspaces = {...nmspaces, ...nsObj.obj};
          setNamespaces({...nmspaces, ...nsObj.obj});
        });
      } else if (count > 1) {
        valObject.forEach(el => {
          let nsObj = getNamespaceObject(val, el);
          nmspaces = {...nmspaces, ...nsObj.obj};
          setNamespaces({...nmspaces, ...nsObj.obj});
        });
      }
    }
    if (keyParts.length > 1) {
      if (nmspaces.hasOwnProperty(keyParts[0]) && nmspaces[keyParts[0]] !== keyParts[0]) {
        objWithNmspace = getNamespaceKey(nmspaces[keyParts[0]]) + ":" + keyParts[1];
      }
    }
    currentPrefix = defaultNamespace !== "" && objWithNmspace === "" ? getNamespaceKey(defaultNamespace) : parentNamespacePrefix;
    return objWithNmspace === "" ? (currentPrefix !== "" ? currentPrefix +":"+ key : key) : objWithNmspace;
  };

  const getNamespaceObject = (val, el) => {
    let indCheck = val[el].lastIndexOf("/");
    let ind = indCheck !== -1 ? indCheck + 1 : 0;
    let obj: any = {};
    let nmspace = val[el].slice(ind);
    if (nmspace && !nmspaces.hasOwnProperty(nmspace)) {
      obj[nmspace] = val[el];
    }
    let colonIndex = el.indexOf(":");
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
    if (obj.hasOwnProperty("#text")) {
      if (Object.keys(obj).filter((el) => /^@xmlns/.test(el) || el === "#text").length === Object.keys(obj).length) {
        sourceTableKeyIndex = sourceTableKeyIndex + 1;
        propty = {
          rowKey: sourceTableKeyIndex,
          key: key,
          val: String(obj["#text"]),
          datatype: getValDatatype(obj["#text"])
        };
      } else {
        sourceTableKeyIndex = sourceTableKeyIndex + 1;
        propty = {
          rowKey: sourceTableKeyIndex,
          key: key,
          val: String(obj["#text"]),
          "children": [],
          datatype: getValDatatype(obj["#text"])
        };
      }
    } else {
      sourceTableKeyIndex = sourceTableKeyIndex + 1;
      propty = {
        rowKey: sourceTableKeyIndex,
        key: key,
        "children": []
      };
    }
    return propty;
  };

  const getValDatatype = (val) => {
    let result: any = typeof val;
    result = val === null ? "null" : result; // null returns typeof 'object', handle that
    return result;
  };

  // construct infinitely nested source Data
  const generateNestedDataSource = (respData, nestedDoc: Array<any>, parentNamespace = namespaceString, defaultNamespace = "") => {
    Object.keys(respData).forEach(key => {
      let val = respData[key];
      let currentDefaultNamespace = defaultNamespace;
      if (val !== null && val !== "") {

        if (val && val.constructor && val.constructor.name === "Object") {
          let tempNS = parentNamespace;
          if (val.hasOwnProperty("@xmlns")) {
            parentNamespace = updateParentNamespace(val);
            currentDefaultNamespace = val["@xmlns"];
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
              val: "[ ]",
              array: true,
              datatype: getValDatatype(val)
            };
            nestedDoc.push(propty);
          } else if (val[0].constructor.name !== "Object") {
            let joinValues = val.join(", ");
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
              if (obj.constructor.name === "Object" && obj.hasOwnProperty("@xmlns")) {
                parentNamespace = updateParentNamespace(obj);
                childDefaultNamespace = obj["@xmlns"];
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

          if (key !== "#text" && !/^@xmlns/.test(key)) {
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
      } else {      // val is null or ""
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
    let nmspcURI = val["@xmlns"];
    let indCheck = nmspcURI.lastIndexOf("/");
    let ind = indCheck !== -1 ? indCheck + 1 : 0;
    let nmspcString = nmspcURI.slice(ind);
    return nmspcString;
  };

  const extractEntityInfoForTable = async () => {
    let resp = await getNestedEntities(curationOptions.activeStep.entityName);
    if (resp && resp.status === 200) {
      let rootEntityName = curationOptions.activeStep.entityName;
      let entProps = resp.data && resp.data[0]["entityModel"].definitions ? resp.data[0]["entityModel"].definitions[rootEntityName].properties : {};
      let entEntityTempData: any = [];
      let nestedEntityProps = extractNestedEntityData(entProps, entEntityTempData);
      setEntityTypeProperties([...nestedEntityProps]);
      setTgtEntityReferences({...tgtRefs});
      setTargetRelatedMappings(resp.data[0]["relatedEntityMappings"]);
      if (resp.data[0]["relatedEntityMappings"] && resp.data[0]["relatedEntityMappings"].length > 0) {
        resp.data.forEach(entityObject => {
          let relatedEntityName = entityObject["entityType"];
          if (relatedEntityName !== curationOptions.activeStep.entityName && entityObject["entityModel"].definitions && entityObject.mappingTitle && entityObject["entityMappingId"]) {
            let relatedEntProps = entityObject["entityModel"].definitions[relatedEntityName].properties;
            let relatedEntityTempData: any =[];
            let relatedEntityProps = extractNestedEntityData(relatedEntProps, relatedEntityTempData);
            setRelatedEntityTypeProperties(prevState => ([...prevState, {entityType: entityObject.entityType, entityLabel: entityObject.mappingTitle, entityMappingId: entityObject.entityMappingId, relatedEntityMappings: entityObject.relatedEntityMappings, entityProps: relatedEntityProps}]));
          }
        });
      }
    }
  };


  const extractNestedEntityData = (entProps, nestedEntityData: Array<any>, parentKey = "") => {

    Object.keys(entProps).forEach(key => {
      let val = entProps[key];
      let propty;
      if (val.hasOwnProperty("subProperties")) {
        let dataTp = getDatatype(val);
        parentKey = parentKey ? parentKey + "/" + key : key;
        EntityTableKeyIndex = EntityTableKeyIndex + 1;
        if (val.$ref || val.items.$ref) {
          let ref = val.$ref ? val.$ref : val.items.$ref;
          tgtRefs[parentKey] = ref;
        }

        propty = {
          key: EntityTableKeyIndex,
          name: parentKey,
          type: dataTp,
          children: []
        };
        nestedEntityData.push(propty);
        extractNestedEntityData(val.subProperties, propty.children, parentKey);
        parentKey = (parentKey.indexOf("/")!==-1)?parentKey.substring(0, parentKey.lastIndexOf("/")):"";

      } else {
        let dataTp = getDatatype(val);
        if (val.hasOwnProperty("relatedEntityType") && val.hasOwnProperty("joinPropertyName")) {
          let relatedEntType = val["relatedEntityType"];
          let joinPropName = val["joinPropertyName"];
          EntityTableKeyIndex = EntityTableKeyIndex + 1;
          propty = {
            key: EntityTableKeyIndex,
            name: parentKey ? parentKey + "/" + key : key,
            type: dataTp,
            relatedEntityType: relatedEntType,
            joinPropertyName: joinPropName
          };
        } else {
          EntityTableKeyIndex = EntityTableKeyIndex + 1;
          propty = {
            key: EntityTableKeyIndex,
            name: parentKey ? parentKey + "/" + key : key,
            type: dataTp,
          };
        }
        nestedEntityData.push(propty);
      }
    });

    return nestedEntityData;
  };

  const getDatatype = (prop) => {
    if (prop.datatype === "array") {
      if (prop.items && prop.items.$ref) {
        let s = prop.items.$ref.split("/");
        return "parent-" + s.slice(-1).pop() + " [ ]";
      } else if (prop.items && prop.items.datatype) {
        return "parent-" + prop.items.datatype + " [ ]";
      }
    } else if (prop.hasOwnProperty("$ref") && prop.$ref !== null) {
      let s = prop.$ref.split("/");
      return "parent-" + s.slice(-1).pop();
    } else {
      return prop.datatype;
    }
    return null;
  };

  const setMappingStepDetailPageData = async (mappingStepArtifact) => {
    await getSourceData(mappingStepArtifact.name);
    extractEntityInfoForTable();
  };

  const handleSubmitUri = async (uri) => {
    setSourceURIPrev(sourceURI);
    await fetchSrcDocFromUri(curationOptions.activeStep.stepArtifact.name, uri);
    if (isTestClicked) {
      getMapValidationResp(uri);
    }
    setEditingUri(false);
  };

  const srcDetails = mapData && mapData["sourceQuery"] && mapData["selectedSource"] ? <div className={styles.xpathDoc}>
    {mapData["selectedSource"] === "collection" ? <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(mapData["sourceQuery"])}</div> : <div className={styles.sourceQuery}>Source Query: {getInitialChars(mapData["sourceQuery"], 32, "...")}</div>}
    {!editingURI ? <div onMouseOver={(e) => handleMouseOver(e)} onMouseLeave={(e) => setShowEditURIOption(false)}
      className={styles.uri}>{!showEditURIOption ? <span data-testid={"uri-edit"} className={styles.notShowingEditIcon}>URI: <span className={styles.URItext}>&nbsp;{getLastChars(sourceURI, 32, "...")}</span></span> :
        <span className={styles.showingEditContainer}>URI: <span data-testid={"uri-edit"} className={styles.showingEditIcon}>{getLastChars(sourceURI, 32, "...")} <i><FontAwesomeIcon icon={faPencilAlt} size="lg" onClick={handleEditIconClick} className={styles.editIcon} data-testid={"pencil-icon"}
        /></i></span></span>}</div> : <div className={styles.inputURIContainer}>URI: <span><Input data-testid={"uri-input"} value={sourceURI} ref={ref => ref && ref.focus()} onChange={handleURIEditing} className={styles.uriEditing} onFocus={(e) => e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)}></Input>&nbsp;
      <Icon type="close" className={styles.closeIcon} onClick={() => handleCloseEditOption()}/>&nbsp;<Icon type="check" className={styles.checkIcon} onClick={() => handleSubmitUri(sourceURI)}/></span></div>}
  </div> : "";

  useEffect(() => {
    if (Object.keys(curationOptions.activeStep.stepArtifact).length !== 0) {
      const mappingStepArtifact: MappingStep = curationOptions.activeStep.stepArtifact;
      setMapData(mappingStepArtifact);
      setSavedMappingArt(mappingStepArtifact);
      setMappingStepDetailPageData(mappingStepArtifact);
    } else {
      history.push("/tiles/curate");
    }
    return (() => {
      setSourceExpandedKeys([]);
      setEntityExpandedKeys([]);
      setExpandedSourceFlag(false);
      setExpandedEntityFlag(false);
      setSourceURI("");
      setSourceURIPrev("");
      setDocUris([]);
      setUriIndex(0);
      setSourceData([]);
      setEntityTypeProperties([]);
    });
  }, [JSON.stringify(curationOptions.activeStep.stepArtifact)]);

  useEffect(() => {
    onClear();
    initializeEntityExpandKeys();
    return (() => {
      setMapExp({});
      setSearchSourceText("");
      setSearchedSourceColumn("");
      // setSearchEntityText("");
      // setSearchedEntityColumn("");
    });
  }, [entityTypeProperties, mapData]);

  useEffect(() => {
    initializeSourceExpandKeys();
    setFlatArray(flattenSourceDoc([...sourceData], [], ""));
    return (() => {
      setSearchSourceText("");
      setSearchedSourceColumn("");
    });
  }, [sourceData]);

  useEffect(() => {
    let allEntitiesToRemove : any = [];
    removedEntities.forEach(entityRemoved => {
      let entitiesToRemove: any = checkRemoveEntityDependencies(entityRemoved, []);
      allEntitiesToRemove = allEntitiesToRemove.concat(entitiesToRemove);
    });
    let updateSelectedEntities : any = relatedEntitiesSelected.filter(entity => !allEntitiesToRemove.includes(entity));
    setRelatedEntitiesSelected(updateSelectedEntities);
  }, [removedEntities]);

  const checkRemoveEntityDependencies = (removedEntity, arrayOfRemoved) => {
    if (arrayOfRemoved.length < 1) {
      arrayOfRemoved.push(removedEntity);
    }
    if (!removedEntity.relatedEntityMappings) {
      return arrayOfRemoved;
    } else {
      removedEntity.relatedEntityMappings.forEach(relatedMapping => {
        let index = relatedEntityTypeProperties.findIndex(object => object["entityMappingId"] === relatedMapping["entityMappingId"]);
        arrayOfRemoved.push(relatedEntityTypeProperties[index]);
        return checkRemoveEntityDependencies(arrayOfRemoved[arrayOfRemoved.length - 1], arrayOfRemoved);
      });
    }
    return arrayOfRemoved;
  };

  //Set the collapse/Expand options for Source table, when mapping opens up.
  const initializeSourceExpandKeys = () => {
    let initialKeysToExpand:any = [];
    sourceData.forEach(obj => {
      if (obj.hasOwnProperty("children")) {
        initialKeysToExpand.push(obj.rowKey);
      }
    });
    setSourceExpandedKeys([...initialKeysToExpand]);
    setInitialSourceKeys([...initialKeysToExpand]);
    setAllSourceKeys([...getKeysToExpandFromTable(sourceData, "rowKey")]);
  };

  //Set the collapse/Expand options for Entity table, when mapping opens up.
  const initializeEntityExpandKeys = () => {
    let initialKeysToExpand:any = [];
    initialKeysToExpand.push(...firstRowKeys);
    entityTypeProperties.forEach(obj => {
      if (obj.hasOwnProperty("children")) {
        initialKeysToExpand.push(obj.key);
      }
    });
    setEntityExpandedKeys([...initialKeysToExpand]);
    setInitialEntityKeys([...initialKeysToExpand]);
    setAllEntityKeys([...getKeysToExpandFromTable(entityTypeProperties, "key")]);
  };

  //To handle navigation buttons
  const onNavigateURIList = (index) => {
    onUpdateURINavButtons(docUris[index]).then(() => {
      setUriIndex(index);
      setSourceURI(docUris[index]);
      setSourceURIPrev(docUris[index]);
    });
  };
  const onUpdateURINavButtons = async (uri) => {
    await fetchSrcDocFromUri(curationOptions.activeStep.stepArtifact.name, uri);
    if (isTestClicked) {
      getMapValidationResp(uri);
    }
  };

  const navigationButtons = <SourceNavigation currentIndex={uriIndex} startIndex={0} endIndex={docUris && docUris.length - 1} handleSelection={onNavigateURIList} />;


  /*  The source context is updated when mapping is saved/loaded, this function does a level order traversal of entity
     json and updates the sourceContext for every entity property */

  const updateSourceContext = (mapExp, entityTable) => {
    let queue:any[] = [];
    entityTable.forEach(element => {
      element["parentVal"] = "";
      queue.push(element);
    });

    while (queue.length > 0) {
      let element = queue.shift();
      let name = element.name;
      let parentVal = element["parentVal"];
      if (element.hasOwnProperty("children")) {
        if (!parentVal) {
          tempSourceContext[name] = "";
        } else {
          tempSourceContext[name] = parentVal;
        }
        if (mapExp[name]) {
          if (parentVal) {
            parentVal = parentVal + "/" + mapExp[name];
          } else {
            parentVal = mapExp[name];
          }
        } else {
          parentVal = "";
        }
        element.children.forEach(ele => {
          ele.parentVal = parentVal;
          queue.push(ele);
        });
      } else {
        if (parentVal) {
          tempSourceContext[name] = parentVal;
        } else {
          tempSourceContext[name] = "";
        }
      }
    }
  };


  const onBack = () => {
    history.push("/tiles/curate");
    setExpandedSourceFlag(false);
    setExpandedEntityFlag(false);
    setUriIndex(0);
  };

  const convertMapExpToMapArt = (obj, path, val) => {
    const propPath = path.replace(/\//g, "/properties/");
    const keys = propPath.split("/");
    const lastKey = keys.pop();
    const lastObj = keys.reduce((obj, key) =>
      obj[key] = key !== "properties" ? (obj[key] || {"sourcedFrom": ""}) : obj[key] || {},
    obj);
    lastObj[lastKey] = val;

    return obj;
  };

  const getTgtEntityTypesInMap = (mapExp, parentKey = "") => {
    Object.keys(mapExp).forEach(key => {
      let val = mapExp[key];
      if (val.constructor.name === "Object") {
        if (val.hasOwnProperty("properties")) {
          let tempKey = parentKey ? parentKey + "/" + key : key;
          val["targetEntityType"] = tgtEntityReferences[tempKey];
          getTgtEntityTypesInMap(val.properties, tempKey);
        }
      }
    });
  };

  const handleExpSubmit = async () => {
    if (mapExpTouched) {
      await saveMapping(mapExp);
    }
    setMapExpTouched(false);
  };

  const getDataForValueField = (name) => {
    return !checkFieldInErrors(name) ? displayResp(name) : "";
  };

  const getTextForTooltip = (name) => {
    if (!checkFieldInErrors(name)) {
      let item = displayResp(name);
      if (Array.isArray(item)) {
        return item.join(", ");
      } else {
        return item;
      }
    }
  };

  //For filter search in source table
  let searchInput: any;
  //For Source Table
  const [searchSourceText, setSearchSourceText] = useState("");
  const [searchedSourceColumn, setSearchedSourceColumn] = useState("");

  const handleColSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    if (dataIndex === "key") {
      setSearchSourceText(selectedKeys[0]);
      setSearchedSourceColumn(dataIndex);

      if (sourceData.length === 1 && sourceData[0].hasOwnProperty("children")) {
        setSourceExpandedKeys([1, ...getKeysToExpandForFilter(sourceData, "rowKey", selectedKeys[0])]);
      } else {
        setSourceExpandedKeys([...getKeysToExpandForFilter(sourceData, "rowKey", selectedKeys[0])]);
      }

    }
  };

  const handleSourceSearchReset = (clearFilters, dataIndex) => {
    clearFilters();
    if (dataIndex === "key") {
      if (searchSourceText) {
        setSourceExpandedKeys([...initialSourceKeys]);
      }
      setSearchSourceText("");
      setSearchedSourceColumn("");
    }
  };

  const getColumnFilterProps = dataIndex => ({
    filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
      <div className={styles.filterContainer}>
        <Input
          ref={node => {
            searchInput = node;
          }}
          data-testid={`searchInput-${dataIndex}`}
          placeholder={`Search name`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleColSearch(selectedKeys, confirm, dataIndex)}
          className={styles.searchInput}
        />
        <MLButton data-testid={`ResetSearch-${dataIndex}`} onClick={() => handleSourceSearchReset(clearFilters, dataIndex)} size="small" className={styles.resetButton}>
                    Reset
        </MLButton>
        <MLButton
          data-testid={`submitSearch-${dataIndex}`}
          type="primary"
          onClick={() => handleColSearch(selectedKeys, confirm, dataIndex)}
          size="small"
          className={styles.searchSubmitButton}
        >
          <Icon type="search" theme="outlined" /> Search
        </MLButton>
      </div>
    ),
    filterIcon: filtered => <i><FontAwesomeIcon data-testid={`filterIcon-${dataIndex}`} icon={faSearch} size="lg" className={ filtered ? "active" : "inactive" }  /></i>,
    onFilter: (value, record) => {
      let recordString = getPropValueFromDataIndex(record, dataIndex);
      return recordString.toString().toLowerCase().includes(value.toLowerCase());
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput?.select());
      }
    }
  });

  const getPropValueFromDataIndex = (record, index) => {
    let res;
    if (record.hasOwnProperty("children")) {
      res = "-"+record[index];
      record["children"].forEach(obj => {
        res = res + getPropValueFromDataIndex(obj, index);
      });
      return res;
    } else {
      return "-"+record[index];
    }
  };

  const getRenderOutput = (textToSearchInto, valueToDisplay, columnName, searchedCol, searchTxt, rowNum) => {
    if (searchedCol === columnName && rowNum !== 0) {
      return <Highlighter
        highlightClassName={styles.highlightStyle}
        searchWords={[searchTxt]}
        autoEscape
        textToHighlight={textToSearchInto}
      />;
    } else {
      return valueToDisplay;
    }
  };

  //Get the expandKeys for the tables based on the applied filter
  const getKeysToExpandForFilter = (dataArr, rowKey, searchText, allKeysToExpand:any = [], parentRowKey = 0) => {
    dataArr.forEach(obj => {
      if (obj.hasOwnProperty("children")) {
        if (((rowKey === "rowKey" ? obj.key : obj.name) + JSON.stringify(obj["children"])).toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
          if (!allKeysToExpand.includes(obj[rowKey])) {
            allKeysToExpand.push(obj[rowKey]);
          }
        }
        parentRowKey = obj[rowKey];
        getKeysToExpandForFilter(obj["children"], rowKey, searchText, allKeysToExpand, parentRowKey);

      } else {
        if ((rowKey === "rowKey" ? obj.key : obj.name).toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
          if (!allKeysToExpand.includes(parentRowKey)) {
            allKeysToExpand.push(parentRowKey);
          }
        }
      }
    });
    return allKeysToExpand;
  };

  const columns = [
    {
      title: <span data-testid="sourceTableKey">Name</span>,
      dataIndex: "key",
      key: "rowKey",
      ...getColumnFilterProps("key"),
      sorter: (a: any, b: any) => a.key?.localeCompare(b.key),
      width: "60%",
      defaultFilteredValue: searchSourceText ? [searchSourceText] : [],
      render: (text, row) => {
        let textToSearchInto = text?.split(":").length > 1 ? text?.split(":")[0]+": "+text?.split(":")[1] : text;
        let valueToDisplay = <span className={styles.sourceName}>{text?.split(":").length > 1 ? <span><MLTooltip title={text?.split(":")[0]+" = \""+namespaces[text?.split(":")[0]]+"\""}><span className={styles.namespace}>{text?.split(":")[0]+": "}</span></MLTooltip><span>{text?.split(":")[1]}</span></span> : text}</span>;
        return getRenderOutput(textToSearchInto, valueToDisplay, "key", searchedSourceColumn, searchSourceText, row.key);
      }
    },
    {
      title: <span data-testid="sourceTableValue">Value</span>,
      dataIndex: "val",
      key: "val",
      ellipsis: true,
      sorter: (a: any, b: any) => a.val?.localeCompare(b.val),
      width: "40%",
      render: (text, row) => (<div data-testid = {row.key +"-srcValue"} className = {styles.sourceValue}>{(text || text === "") ?  getTextforSourceValue(text, row) : ""}</div>)
    }
  ];

  const getClassNames = (format, datatype) => {
    let classNames : string[] = [];
    if (format) classNames.push("format-".concat(format));
    if (datatype) classNames.push("datatype-".concat(datatype));
    return classNames.join(" ");
  };

  const getTextforSourceValue = (text, row) => {
    let arr = typeof(text) === "string" ? text.split(", ") : text;
    let stringLenWithoutEllipsis = 14;
    let requiresToolTip = false;
    let response;
    if (Array.isArray(arr)) {
      requiresToolTip = (arr[0] ? arr[0].length > stringLenWithoutEllipsis : false) || (arr[1] ? arr[1].length > stringLenWithoutEllipsis : false);
      if (arr.length >= 2) {
        let xMore = <span className="moreVal">{"(" + (arr.length - 2) + " more)"}</span>;
        let itemOne = <span className={getClassNames(sourceFormat, row.datatype)}>{getInitialChars(arr[0], stringLenWithoutEllipsis, "...")}</span>;
        let itemTwo = <span className={getClassNames(sourceFormat, row.datatype)}>{getInitialChars(arr[1], stringLenWithoutEllipsis, "...")}</span>;
        let fullItem = <span>{itemOne}{"\n"}{itemTwo}</span>;
        if (arr.length === 2) {
          response =  <p>{fullItem}</p>;
        } else {
          //If there are more than 2 elements in array, tooltip is required.
          requiresToolTip = true;
          response =  <p>{fullItem}{"\n"}{xMore}</p>;
        }
      } else {
        response = <span className={getClassNames(sourceFormat, row.datatype)}>{getInitialChars(arr[0], stringLenWithoutEllipsis, "...")}</span>;
      }

    } else {
      requiresToolTip = text.length > stringLenWithoutEllipsis;
      response = <span className={getClassNames(sourceFormat, row.datatype)}>{getInitialChars(text, stringLenWithoutEllipsis, "...")}</span>;
    }
    return requiresToolTip ?  <MLTooltip placement="bottom" title={text}>{response}</MLTooltip> : response;
  };

  //Response from server already is an array for multiple values, string for single value
  //truncation in case array values
  const getTextForValueField = (row) => {
    let respFromServer = getDataForValueField(row.name);
    //if array of values and more than 2 values
    if (respFromServer && Array.isArray(respFromServer) && respFromServer.length >= 2) {
      let xMore = <span className="moreVal">{"(" + (respFromServer.length - 2) + " more)"}</span>;
      let itemOne = respFromServer[0].length > 23 ? getInitialChars(respFromServer[0], 23, "...\n") : respFromServer[0] + "\n";
      let itemTwo = respFromServer[1].length > 23 ? getInitialChars(respFromServer[1], 23, "...\n") : respFromServer[1] + "\n";
      let fullItem = itemOne.concat(itemTwo);
      if (respFromServer.length === 2) {
        return <p>{fullItem}</p>;
      } else {
        return <p>{fullItem}{xMore}</p>;
      }
    } else {
      return getInitialChars(respFromServer, 23, "...");
    }
  };


  const customExpandIcon = (props) => {
    if (props.expandable) {
      if (props.expanded) {
        return <a className={styles.expandIcon} onClick={e => {
          props.onExpand(props.record, e);
        }}><Icon type="down" /> </a>;
      } else {
        return <a  className={styles.expandIcon} onClick={e => {
          props.onExpand(props.record, e);
        }}><Icon type="right" data-testid="expandedIcon"/> </a>;
      }
    } else {
      return <span style={{color: "black"}} onClick={e => {
        props.onExpand(props.record, e);
      }}></span>;
    }
  };

  // CSS properties for the alert message after saving the mapping
  const saveMessageCSS: CSSProperties = {
    border: errorInSaving === "noError" ? "1px solid #008000" : "1px solid #ff0000",
    marginLeft: "38vw",
    top: "3vh"
  };

  const success = () => {
    let mesg = `All changes are saved on ${convertDateFromISO(new Date())}`;
    let errorMesg = `An error occured while saving the changes.`;

    let msg = <span data-testid="successMessage" id="successMessage"><Alert type="success" message={mesg} banner style={saveMessageCSS} /></span>;
    let errorMsg = <span  id="errorMessage"><Alert type="error" message={errorMesg} banner style={saveMessageCSS} /></span>;
    setTimeout(() => {
      setErrorInSaving("");
    }, 2000);
    return errorInSaving === "noError" ? msg : errorMsg;

  };

  const emptyData = (JSON.stringify(sourceData) === JSON.stringify([]) && !docNotFound);

  const getValue = (object, keys) => keys.split(".").reduce((o, k) => (o || {})[k], object);

  const displayResp = (propName) => {
    const finalProp = propName.replace(/\//g, ".properties.");
    if (mapResp && mapResp["properties"]) {
      let field = mapResp["properties"];
      let prop = getValue(field, finalProp);
      if (prop && prop["errorMessage"]) {
        return prop["errorMessage"];
      } else if (prop && prop["output"]) {
        return prop["output"];
      }
    }
  };

  const checkFieldInErrors = (field) => {
    const finalProp = field.replace(/\//g, ".properties.");
    let record = mapResp["properties"];
    let prop = getValue(record, finalProp);
    if (mapResp && mapResp["properties"]) {
      if (prop && prop["errorMessage"]) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  //Logic for Test and Clear buttons
  const getMapValidationResp = async (uri) => {
    setIsTestClicked(true);
    try {
      let resp = await getMappingValidationResp(curationOptions.activeStep.stepArtifact.name, savedMappingArt, uri, curationOptions.activeStep.stepArtifact.sourceDatabase);
      if (resp && resp.status === 200) {
        setMapResp({...resp.data});
      }
    } catch (err) {
      console.error("Error while applying validation on current URI!", err);
    }
  };

  const onClear = () => {
    setMapResp({});
    setIsTestClicked(false);
  };

  /* Insert source field in map expressions */

  const flattenSourceDoc = (sourceData, flatArray, flatArrayKey) => {
    sourceData.forEach(element => {
      let flatArrayVal = element.key;
      if (!element.children && (element.val || element.val === "")) {
        if (!flatArrayKey&& flatArrayKey.indexOf("/") === -1) {
          trackUniqueKeys.push(element.key);
          flatArray.push({"value": flatArrayVal, "key": element.key, "struct": element.array ? true : false});
        } else {
          let fullKey = flatArrayKey + "/" + element.key;
          if (!trackUniqueKeys.includes(fullKey)) {
            trackUniqueKeys.push(fullKey);
            flatArray.push({"value": flatArrayVal, "key": fullKey, "struct": element.array ? true : false});
          }
        }
      } else {
        if (!flatArrayKey) {
          flatArrayKey =element.key;
        } else {
          flatArrayKey = flatArrayKey +"/"+ element.key;
        }
        if (!trackUniqueKeys.includes(flatArrayKey)) {
          trackUniqueKeys.push(flatArrayKey);
          flatArray.push({"value": flatArrayVal, "key": flatArrayKey, "struct": true});
        }
      }
      if (element.children) {
        flattenSourceDoc(element.children, flatArray, flatArrayKey);
        flatArrayKey = (flatArrayKey.indexOf("/")===-1)?"":flatArrayKey.substring(0, flatArrayKey.lastIndexOf("/"));
      }
    });
    return flatArray;
  };


  const saveMapping =  async (mapObject) => {
    let obj = {};
    Object.keys(mapObject).forEach(key => {
      convertMapExpToMapArt(obj, key, {"sourcedFrom": mapObject[key]});
    });
    await getTgtEntityTypesInMap(obj);
    let {lastUpdated, properties, ...dataPayload} = mapData;

    dataPayload = {...dataPayload, properties: obj};

    let mapSavedResult = await updateMappingArtifact(dataPayload);
    tempSourceContext = {};
    updateSourceContext(mapObject, entityTypeProperties);
    setSourceContext({...tempSourceContext});
    if (mapSavedResult) {
      setErrorInSaving("noError");
    } else {
      setErrorInSaving("error");
    }
    let mapArt = await getMappingArtifactByMapName(dataPayload.targetEntityType, curationOptions.activeStep.stepArtifact.name);
    if (mapArt) {
      await setSavedMappingArt({...mapArt});
    }
    setMapSaved(mapSavedResult);
  };


  const splitPaneStyles= {
    pane1: {minWidth: "150px"},
    pane2: {minWidth: "140px", maxWidth: "90%"},
    pane: {overflow: "hidden"},
  };

  const splitStyle:CSSProperties= {
    position: "relative",
    height: "none",
  };
  const resizerStyle:CSSProperties = {
    border: "1px solid rgba(1, 22, 39, 0.21)",
    cursor: "col-resize",
    height: "auto",
  };

  //Code for handling column selector in Entity table

  const handleColOptMenuClick = e => {
    if (e.key === "FuzzyMatch") {
      setColOptMenuVisible(false);
    }
  };

  const handleColOptMenuVisibleChange = flag => {
    setColOptMenuVisible(flag);
  };


  const handleColOptionsChecked = async (e) => {
    let obj = checkedEntityColumns;
    obj[e.target.value] = e.target.checked;
    await setCheckedEntityColumns({...obj});
  };

  const columnOptionsDropdown = (
    <div className={styles.menuParentDiv}>
      <Menu onClick={handleColOptMenuClick}>
        {Object.keys(checkedEntityColumns).map(entLabel => (
          <Menu.Item key={entLabel}
            className={styles.DropdownMenuItem}><MLCheckbox
              data-testid={`columnOptionsCheckBox-${entLabel}`}
              key={entLabel}
              value={entLabel}
              onChange={handleColOptionsChecked}
              defaultChecked={true}
              className={styles.checkBoxItem}
            >{columnOptionsLabel[entLabel]}</MLCheckbox></Menu.Item>
        ))}
      </Menu>
    </div>
  );

  const columnOptionsSelector =
        <Dropdown overlay={columnOptionsDropdown}
          className={styles.dropdownHover}
          trigger={["click"]}
          onVisibleChange={handleColOptMenuVisibleChange}
          visible={colOptMenuVisible}
          placement="bottomRight"
          overlayClassName={styles.columnSelectorOverlay}><a onClick={e => e.preventDefault()}>
        Column Options <Icon type="down" theme="outlined"/>
          </a></Dropdown>;


  //Collapse all-Expand All button

  const getKeysToExpandFromTable = (dataArr, rowKey, allKeysToExpand:any = [], expanded?) => {

    dataArr.forEach(obj => {
      if (obj.hasOwnProperty("children")) {
        allKeysToExpand.push(obj[rowKey]);
        if ((rowKey === "key" && (!expandedEntityFlag || expanded)) || (rowKey === "rowKey" && (!expandedSourceFlag || expanded))) {
          getKeysToExpandFromTable(obj["children"], rowKey, allKeysToExpand);
        }
      }
    });
    return allKeysToExpand;
  };

  const handleSourceExpandCollapse = (option) => {
    let keys = getKeysToExpandFromTable(sourceData, "rowKey", [], true);
    if (option === "collapse") {
      setSourceExpandedKeys([]);
      setExpandedSourceFlag(false);
    } else {
      setSourceExpandedKeys([...keys]);
      setExpandedSourceFlag(true);
    }
  };

  const handleEntityExpandCollapse = (option) => {
    let keys = getKeysToExpandFromTable(entityTypeProperties, "key", [], true);
    keys.unshift(0);
    if (option === "collapse") {
      setEntityExpandedKeys([]);
      setExpandedEntityFlag(false);
    } else {
      setEntityExpandedKeys([...keys, ...firstRowKeys]);
      setExpandedEntityFlag(true);
    }
  };

  const toggleSourceRowExpanded = (expanded, record, rowKey) => {
    if (!sourceExpandedKeys.includes(record.rowKey)) {
      setSourceExpandedKeys(prevState => {
        let finalKeys = prevState.concat([record["rowKey"]]);

        if (allSourceKeys.every(item => finalKeys.includes(item))) {
          setExpandedSourceFlag(true);
        }
        return finalKeys;
      });

    } else {
      setSourceExpandedKeys(prevState => {
        let finalKeys = prevState.filter(item => item !== record["rowKey"]);
        if (!initialSourceKeys.some(item => finalKeys.includes(item))) {
          setExpandedSourceFlag(false);
        }
        return finalKeys;
      });
    }
  };

  const handleStepSettings = () => {
    OpenStepSettings();
  };

  const UpdateMappingArtifact = async (payload) => {
    // Update local form state
    let mapSavedResult = await updateMappingArtifact(payload);
    if (mapSavedResult) {
      let mapArt = await getMappingArtifactByMapName(payload.targetEntityType, payload.name);
      if (mapArt) {
        updateActiveStepArtifact({...mapArt});
      }
    }
  };

  const OpenStepSettings = () => {
    let stepOpenOptions = {
      isEditing: true,
      openStepSettings: true
    };
    setStepOpenOptions(stepOpenOptions);
  };

  const openStepDetails = (name) => {
    setOpenStepSettings(false);
  };

  return (
    <>
      <CustomPageHeader
        title={<span aria-label={`${curationOptions.activeStep.stepArtifact && curationOptions.activeStep.stepArtifact.name}-details-header`}>{curationOptions.activeStep.stepArtifact && curationOptions.activeStep.stepArtifact.name}</span>}
        handleOnBack={onBack}
      />
      <div className={styles.mapContainer}>
        <div className={styles.stepSettingsLink} onClick={() => handleStepSettings()}>
          <FontAwesomeIcon icon={faCog} type="edit" role="step-settings button" aria-label={"stepSettings"} />
          <span className={styles.stepSettingsLabel}>Step Settings</span>
        </div>
        <div className={styles.legend}>
          <div data-testid="foreignKeyIconLegend" className={styles.legendText}><FontAwesomeIcon className={styles.foreignKeyIcon} icon={faKey}/> Foreign Key Relationship</div>
          <div data-testid="relatedEntityIconLegend" className={styles.legendText}><img className={styles.relatedIcon} src={relatedEntityIcon} alt={""}/> Related Entity</div>
          <div data-testid="multipleIconLegend" className={styles.legendText}><img className={styles.arrayImage} src={arrayIcon} alt={""}/> Multiple</div>
          <div data-testid="structuredIconLegend" className={styles.legendText}><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> Structured Type</div>
        </div>
        <div className={styles.header}>
          {errorInSaving ? success() : <span className={styles.noMessage}></span>}
        </div>
        <br/>
        <br/>
        <hr/>
        <br/>
        <div id="parentContainer" className={styles.parentContainer}>
          <SplitPane
            style={splitStyle}
            paneStyle={splitPaneStyles.pane}
            allowResize={true}
            resizerStyle={resizerStyle}
            pane1Style={splitPaneStyles.pane1}
            pane2Style={splitPaneStyles.pane2}
            split="vertical"
            primary="second"
            defaultSize="70%"
          >
            <div
              id="srcContainer"
              data-testid="srcContainer"
              className={styles.sourceContainer}>
              <div id="srcDetails" data-testid="srcDetails" className={styles.sourceDetails}>
                <div className={styles.sourceTitle}
                ><span className={styles.sourceDataIcon}></span><strong>Source Data</strong>
                  <span className={styles.srcDetails}>{srcDetails}</span></div>
              </div>
              {isLoading === true ? <div className={styles.spinRunning}>
                <MLSpin size={"large"} data-testid="spinTest"/>
              </div>:
                emptyData ?
                  <div id="noData">
                    <br/><br/>
                    <Card className={styles.emptyCard} size="small">
                      <div className={styles.emptyText}>
                        <p>Unable to find source records using the specified collection or query.</p>
                        <p>Load some data that mapping can use as reference and/or edit the step
                                            settings to use a source collection or query that will return some results.</p>
                      </div>
                    </Card>
                  </div>
                  :
                  <div id="dataPresent">
                    <div className={styles.sourceButtons}>
                      <span className={styles.navigationButtons}>{navigationButtons}</span>
                      <span className={styles.sourceCollapseButtons}><ExpandCollapse handleSelection={(id) => handleSourceExpandCollapse(id)} currentSelection={""} /></span>
                    </div>
                    <Table
                      pagination={false}
                      expandIcon={(props) => customExpandIcon(props)}
                      onExpand={(expanded, record) => toggleSourceRowExpanded(expanded, record, "rowKey")}
                      expandedRowKeys={sourceExpandedKeys}
                      className={styles.sourceTable}
                      rowClassName={() => styles.sourceTableRows}
                      scroll={{y: "60vh", x: 300}}
                      indentSize={20}
                      //defaultExpandAllRows={true}
                      //size="small"
                      columns={columns}
                      dataSource={sourceData}
                      tableLayout="unset"
                      rowKey={(record) => record.rowKey}
                      getPopupContainer={() => document.getElementById("srcContainer") || document.body}
                    />
                  </div> }
            </div>
            <div
              id="entityContainer"
              data-testid="entityContainer"
              className={styles.entityContainer}>
              <div className={styles.entityDetails}>
                <span className={styles.entityTypeTitle}><p className={styles.entityTypeText}><span className={styles.entityIcon}></span><strong>Entity Type: {curationOptions.activeStep.entityName}</strong></p></span>
                <span className={styles.clearTestIcons} id="ClearTestButtons">
                  <MLButton id="Clear-btn" mat-raised-button="true" color="primary" disabled={emptyData} onClick={() => onClear()}>
                                Clear
                  </MLButton>
                        &nbsp;&nbsp;
                  <MLButton className={styles.btn_test} id="Test-btn" mat-raised-button="true" type="primary" disabled={emptyData || mapExpTouched} onClick={() => getMapValidationResp(sourceURI)}>
                                Test
                  </MLButton>
                </span>
              </div>
              <div ref={dummyNode}></div>
              <div className={styles.columnOptionsSelectorContainer}>
                <span className={styles.entityCollapseButtons}><ExpandCollapse handleSelection={(id) => handleEntityExpandCollapse(id)} currentSelection={""} /></span>
                <span className={styles.columnOptionsSelector}>{columnOptionsSelector}</span>
              </div>
              <EntityMapTable
                mapResp={mapResp}
                mapData={mapData}
                setMapResp={setMapResp}
                mapExpTouched={mapExpTouched}
                setMapExpTouched={setMapExpTouched}
                handleExpSubmit={handleExpSubmit}
                flatArray={flatArray}
                saveMapping={saveMapping}
                sourceContext={sourceContext}
                setSourceContext={setSourceContext}
                dummyNode={dummyNode}
                getDataForValueField={getDataForValueField}
                getTextForTooltip={getTextForTooltip}
                getTextForValueField={getTextForValueField}
                canReadWrite={canReadWrite}
                entityTypeTitle={curationOptions.activeStep.entityName}
                checkedEntityColumns={checkedEntityColumns}
                entityTypeProperties={entityTypeProperties}
                entityMappingId={""}
                relatedMappings={targetRelatedMappings}
                entityExpandedKeys={entityExpandedKeys}
                setEntityExpandedKeys={setEntityExpandedKeys}
                allEntityKeys={allEntityKeys}
                setExpandedEntityFlag={setExpandedEntityFlag}
                initialEntityKeys={initialEntityKeys}
                tooltipsData={AdvMapTooltips}
                updateStep={UpdateMappingArtifact}
                relatedEntityTypeProperties={relatedEntityTypeProperties}
                relatedEntitiesSelected={relatedEntitiesSelected}
                setRelatedEntitiesSelected={setRelatedEntitiesSelected}
                setRemovedEntities={setRemovedEntities}
                isRelatedEntity={false}
                tableColor="#EAE9EE"
                firstRowTableKeyIndex={firstRowTableKeyIndex++}
              />
              {relatedEntityTypeProperties.map(entity => relatedEntitiesSelected.includes(entity) ?
                <EntityMapTable
                  mapResp={mapResp}
                  mapData={mapData}
                  setMapResp={setMapResp}
                  mapExpTouched={mapExpTouched}
                  setMapExpTouched={setMapExpTouched}
                  handleExpSubmit={handleExpSubmit}
                  flatArray={flatArray}
                  saveMapping={saveMapping}
                  sourceContext={sourceContext}
                  setSourceContext={setSourceContext}
                  dummyNode={dummyNode}
                  getDataForValueField={getDataForValueField}
                  getTextForTooltip={getTextForTooltip}
                  getTextForValueField={getTextForValueField}
                  canReadWrite={canReadWrite}
                  entityTypeTitle={entity["entityLabel"]}
                  checkedEntityColumns={checkedEntityColumns}
                  entityTypeProperties={entity["entityProps"]}
                  entityMappingId={entity["entityMappingId"]}
                  relatedMappings={entity["relatedEntityMappings"]}
                  entityExpandedKeys={entityExpandedKeys}
                  setEntityExpandedKeys={setEntityExpandedKeys}
                  allEntityKeys={allEntityKeys}
                  setExpandedEntityFlag={setExpandedEntityFlag}
                  initialEntityKeys={initialEntityKeys}
                  tooltipsData={AdvMapTooltips}
                  updateStep={UpdateMappingArtifact}
                  relatedEntityTypeProperties={relatedEntityTypeProperties}
                  relatedEntitiesSelected = {relatedEntitiesSelected}
                  setRelatedEntitiesSelected={setRelatedEntitiesSelected}
                  setRemovedEntities={setRemovedEntities}
                  isRelatedEntity={true}
                  tableColor={tableColors.length > 0 ? tableColors.shift() : "#EAE9EE"}
                  firstRowTableKeyIndex={firstRowTableKeyIndex++}
                /> : "")}
            </div>
          </SplitPane>
        </div>
      </div>
      <Steps
        // Basic Settings
        isEditing={mappingOptions.isEditing}
        stepData={mapData}
        canReadOnly={canReadOnly}
        canReadWrite={canReadWrite}
        canWrite={canReadWrite}
        // Advanced Settings
        tooltipsData={AdvMapTooltips}
        openStepSettings={mappingOptions.openStepSettings}
        setOpenStepSettings={setOpenStepSettings}
        updateStep={UpdateMappingArtifact}
        activityType={StepType.Mapping}
        targetEntityType={curationOptions.activeStep.stepArtifact.targetEntityType}
        targetEntityName={curationOptions.activeStep.entityName}
        openStepDetails={openStepDetails}
      />
    </>

  );
};

export default MappingStepDetail;

