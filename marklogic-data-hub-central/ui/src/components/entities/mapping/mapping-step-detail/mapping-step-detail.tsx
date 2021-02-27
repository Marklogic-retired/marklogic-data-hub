
import React, {useState, useEffect, CSSProperties, useRef, useContext} from "react";
import {Card, Table, Icon, Popover, Input, Alert, Dropdown, Menu} from "antd";
import styles from "./mapping-step-detail.module.scss";
import "./mapping-step-detail.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faObjectUngroup, faList, faPencilAlt, faSearch, faCog} from "@fortawesome/free-solid-svg-icons";
import {getInitialChars, convertDateFromISO, getLastChars, extractCollectionFromSrcQuery} from "../../../../util/conversionFunctions";
import {getMappingValidationResp, getNestedEntities} from "../../../../util/manageArtifacts-service";
import DropDownWithSearch from "../../../common/dropdown-with-search/dropdownWithSearch";
import SplitPane from "react-split-pane";
import Highlighter from "react-highlight-words";
import {MLButton, MLTooltip, MLCheckbox, MLSpin, MLPageHeader} from "@marklogic/design-system";
import SourceNavigation from "../source-navigation/source-navigation";
import ExpandCollapse from "../../../expand-collapse/expand-collapse";
import {useHistory} from "react-router-dom";
import {getUris, getDoc} from "../../../../util/search-service";
import {xmlParserForMapping} from "../../../../util/record-parser";
import {CurationContext} from "../../../../util/curation-context";
import {AuthoritiesContext} from "../../../../util/authorities";
import {MappingStep, StepType} from "../../../../types/curation-types";
import {getMappingArtifactByMapName, getMappingFunctions, updateMappingArtifact} from "../../../../api/mapping";
import Steps from "../../../steps/steps";
import {AdvMapTooltips} from "../../../../config/tooltips.config";

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
  let mapExpUI: any = {};
  let tempMapExp: any = {};
  let tempSourceContext: any = {};
  let trackUniqueKeys: any = [];
  /*-------------------*/

  //For Dropdown menu
  const [propName, setPropName] = useState("");
  const [propListForDropDown, setPropListForDropDown] = useState<any>([]);
  const [displayFuncMenu, setDisplayFuncMenu] = useState(false);
  const [displaySelectList, setDisplaySelectList] = useState(false);
  const [functionValue, setFunctionValue] = useState("");
  const [caretPosition, setCaretPosition] = useState(0);

  //Dummy ref node to simulate a click event
  const dummyNode: any = useRef();

  /*-------------------*/

  const [mapExpTouched, setMapExpTouched] = useState(false);
  const [editingURI, setEditingUri] = useState(false);
  const [showEditURIOption, setShowEditURIOption] = useState(false);
  const [mapSaved, setMapSaved] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [errorInSaving, setErrorInSaving] = useState("");

  //For source dropdown search menu
  const [flatArray, setFlatArray]   = useState<any[]>([]);
  const [sourcePropName, setSourcePropName] = useState("");
  const [sourcePropListForDropDown, setSourcePropListForDropDown] = useState<any>([]);
  const [sourceIndentForDropDown, setSourceIndentForDropDown] = useState<any>([]);
  const [sourceValue, setSourceValue] = useState("");
  const [displaySourceMenu, setDisplaySourceMenu] = useState(false);
  const [displaySourceList, setDisplaySourceList] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>([]); // eslint-disable-line @typescript-eslint/no-unused-vars

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

  //Documentation links for using Xpath expressions
  const xPathDocLinks = <div className={styles.xpathDoc}><span id="doc">Documentation:</span>
    <div><ul className={styles.docLinksUl}>
      <li><a href="https://www.w3.org/TR/xpath/all/" target="_blank" rel="noopener noreferrer" className={styles.docLink}>XPath Expressions</a></li>
      <li><a href="https://docs.marklogic.com/guide/app-dev/TDE#id_99178" target="_blank" rel="noopener noreferrer" className={styles.docLink}>Extraction Functions</a></li>
      <li><a href="https://docs.marklogic.com/datahub/flows/dhf-mapping-functions.html" target="_blank" rel="noopener noreferrer" className={styles.docLink}>Mapping Functions</a></li>
    </ul></div>
  </div>;

  //Text for Context Icon
  const contextHelp = <div className={styles.contextHelp}>An element in the source data from which to derive the values of this entity property's children. Both the source data element and the entity property must be of the same type (Object or an array of Object instances). Use a slash (&quot;/&quot;) if the source model is flat.</div>;

  const {TextArea} = Input;

  //For Entity table
  const [entityTypeProperties, setEntityTypeProperties] = useState<any[]>([]);
  const [tgtEntityReferences, setTgtEntityReferences] = useState({});
  let EntitYTableKeyIndex = 0;
  let sourceTableKeyIndex = 0;
  let tgtRefs:any = {};

  //For storing docURIs
  const [docUris, setDocUris] = useState<any[]>([]);

  //For storing  mapping functions
  const [mapFunctions, setMapFunctions] = useState<any>([]);

  //For storing namespaces
  const [namespaces, setNamespaces] = useState({});
  let nmspaces: any = {};
  let namespaceString = "";
  const [isLoading, setIsLoading] = useState(false);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [sourceURI, setSourceURI] = useState("");
  const [sourceFormat, setSourceFormat] = useState("");
  const [docNotFound, setDocNotFound] = useState(false);
  const [mapData, setMapData] = useState<any>(DEFAULT_MAPPING_STEP);

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

  const handleCloseEditOption = (srcURI) => {
    setSourceURI(srcURI);
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

  const setMappingFunctions = async () => {
    let mappingFuncResponse= await getMappingFunctions();
    if (mappingFuncResponse) {
      setMapFunctions(mappingFuncResponse.data);
    }
  };

  const extractEntityInfoForTable = async () => {
    let resp = await getNestedEntities(curationOptions.activeStep.entityName);
    if (resp && resp.status === 200) {
      let entProps = resp.data && resp.data.definitions ? resp.data.definitions[curationOptions.activeStep.entityName].properties : {};
      let entEntityTempData: any = [];
      let nestedEntityProps = extractNestedEntityData(entProps, entEntityTempData);
      setEntityTypeProperties([...nestedEntityProps]);
      setTgtEntityReferences({...tgtRefs});
    }
  };


  const extractNestedEntityData = (entProps, nestedEntityData: Array<any>, parentKey = "") => {

    Object.keys(entProps).forEach(key => {
      let val = entProps[key];

      if (val.hasOwnProperty("subProperties")) {
        let dataTp = getDatatype(val);
        parentKey = parentKey ? parentKey + "/" + key : key;
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
        parentKey = (parentKey.indexOf("/")!==-1)?parentKey.substring(0, parentKey.lastIndexOf("/")):"";

      } else {
        let dataTp = getDatatype(val);
        EntitYTableKeyIndex = EntitYTableKeyIndex + 1;
        let propty = {
          key: EntitYTableKeyIndex,
          name: parentKey ? parentKey + "/" + key : key,
          type: dataTp
        };
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
    setMappingFunctions();
  };

  const handleSubmitUri = (uri) => {
    getMappingArtifactByMapName(curationOptions.activeStep.stepArtifact.targetEntityType, curationOptions.activeStep.stepArtifact.name);
    fetchSrcDocFromUri(curationOptions.activeStep.stepArtifact.name, uri);
    if (isTestClicked) {
      getMapValidationResp(uri);
    }
    setEditingUri(false);
  };

  const srcDetails = mapData && mapData["sourceQuery"] && mapData["selectedSource"] ? <div className={styles.xpathDoc}>
    {mapData["selectedSource"] === "collection" ? <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(mapData["sourceQuery"])}</div> : <div className={styles.sourceQuery}>Source Query: {getInitialChars(mapData["sourceQuery"], 32, "...")}</div>}
    {!editingURI ? <div
      onMouseOver={(e) => handleMouseOver(e)}
      onMouseLeave={(e) => setShowEditURIOption(false)} className={styles.uri}>{!showEditURIOption ? <span className={styles.notShowingEditIcon}>URI: <span className={styles.URItext}>&nbsp;{getLastChars(sourceURI, 42, "...")}</span></span> :
        <span className={styles.showingEditContainer}>URI: <span className={styles.showingEditIcon}>{getLastChars(sourceURI, 42, "...")}  <i><FontAwesomeIcon icon={faPencilAlt} size="lg" onClick={handleEditIconClick} className={styles.editIcon}
        /></i></span></span>}</div> : <div className={styles.inputURIContainer}>URI: <span><Input value={sourceURI} onChange={handleURIEditing} className={styles.uriEditing}></Input>&nbsp;<Icon type="close" className={styles.closeIcon} onClick={() => handleCloseEditOption(sourceURI)}/>&nbsp;<Icon type="check" className={styles.checkIcon} onClick={() => handleSubmitUri(sourceURI)}/></span></div>}
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
      setDocUris([]);
      setUriIndex(0);
      setSourceData([]);
      setEntityTypeProperties([]);
    });
  }, [JSON.stringify(curationOptions.activeStep.stepArtifact)]);

  useEffect(() => {
    initializeMapExpressions();
    onClear();
    initializeEntityExpandKeys();
    return (() => {
      setMapExp({});
      setSearchEntityText("");
      setSearchedEntityColumn("");
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
    });
  };
  const onUpdateURINavButtons = async (uri) => {
    await fetchSrcDocFromUri(curationOptions.activeStep.stepArtifact.name, uri);
    if (isTestClicked) {
      getMapValidationResp(uri);
    }
  };

  const navigationButtons = <SourceNavigation currentIndex={uriIndex} startIndex={0} endIndex={docUris && docUris.length - 1} handleSelection={onNavigateURIList} />;

  //Set the mapping expressions, if already exists.
  const initializeMapExpressions = () => {
    if (mapData && mapData["properties"]) {
      initializeMapExpForUI(mapData["properties"]);
      setMapExp({...mapExpUI});
      updateSourceContext({...mapExpUI}, entityTypeProperties);
      setSourceContext({...tempSourceContext});
    }
  };

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

  //Refresh the UI mapExp from the the one saved in the database
  const initializeMapExpForUI  = (mapExp, parentKey = "") => {
    Object.keys(mapExp).forEach(key => {
      let val = mapExp[key];
      if (val.hasOwnProperty("properties")) {
        parentKey = parentKey ? parentKey + "/" + key : key;
        mapExpUI[parentKey] = mapExp[key]["sourcedFrom"];
        initializeMapExpForUI(val.properties, parentKey);
        parentKey = (parentKey.indexOf("/")!==-1) ? parentKey.substring(0, parentKey.lastIndexOf("/")):"";
      } else {
        let tempKey = parentKey ? parentKey + "/" + key : key;
        mapExpUI[tempKey] = mapExp[key]["sourcedFrom"];
      }
    });
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


  const handleMapExp = (name, event) => {
    setCaretPosition(event.target.selectionStart);
    setMapExpTouched(true);
    setMapExp({...mapExp, [name]: event.target.value});
  };

  const handleClickInTextArea = async (e) => {
    await setCaretPosition(e.target.selectionStart);
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

  const mapExpressionStyle = (propName) => {
    const mapStyle: CSSProperties = {
      width: "22vw",
      verticalAlign: "top",
      justifyContent: "top",
      borderColor: checkFieldInErrors(propName) ? "red" : ""
    };
    return mapStyle;
  };

  //For filter search in source table
  let searchInput: any;
  //For Source Table
  const [searchSourceText, setSearchSourceText] = useState("");
  const [searchedSourceColumn, setSearchedSourceColumn] = useState("");
  //For Entity table
  const [searchEntityText, setSearchEntityText] = useState("");
  const [searchedEntityColumn, setSearchedEntityColumn] = useState("");

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

    } else {
      setSearchEntityText(selectedKeys[0]);
      setSearchedEntityColumn(dataIndex);

      if (entityTypeProperties.length === 1 && entityTypeProperties[0].hasOwnProperty("children")) {
        setEntityExpandedKeys([1, ...getKeysToExpandForFilter(entityTypeProperties, "key", selectedKeys[0])]);
      } else {
        setEntityExpandedKeys([...getKeysToExpandForFilter(entityTypeProperties, "key", selectedKeys[0])]);
      }
    }
  };

  const handleSearchReset = (clearFilters, dataIndex) => {
    clearFilters();
    if (dataIndex === "key") {
      if (searchSourceText) {
        setSourceExpandedKeys([...initialSourceKeys]);
      }
      setSearchSourceText("");
      setSearchedSourceColumn("");
    } else {
      if (searchEntityText) {
        setEntityExpandedKeys([...initialEntityKeys]);
      }
      setSearchEntityText("");
      setSearchedEntityColumn("");
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
        <MLButton data-testid={`ResetSearch-${dataIndex}`} onClick={() => handleSearchReset(clearFilters, dataIndex)} size="small" className={styles.resetButton}>
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

  const getRenderOutput = (textToSearchInto, valueToDisplay, columnName, searchedCol, searchTxt) => {
    if (searchedCol === columnName) {
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

  //Get the expandKeys for the tables based on teh applied filter
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
      render: (text) => {
        let textToSearchInto = text?.split(":").length > 1 ? text?.split(":")[0]+": "+text?.split(":")[1] : text;
        let valueToDisplay = <span className={styles.sourceName}>{text?.split(":").length > 1 ? <span><MLTooltip title={text?.split(":")[0]+" = \""+namespaces[text?.split(":")[0]]+"\""}><span className={styles.namespace}>{text?.split(":")[0]+": "}</span></MLTooltip><span>{text?.split(":")[1]}</span></span> : text}</span>;
        return getRenderOutput(textToSearchInto, valueToDisplay, "key", searchedSourceColumn, searchSourceText);
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

  const entityColumns = [
    {
      title: <span data-testid="entityTableName">Name</span>,
      dataIndex: "name",
      key: "name",
      width: "18%",
      ...getColumnFilterProps("name"),
      sorter: (a: any, b: any) => a.name?.localeCompare(b.name),
      ellipsis: true,
      render: (text) => {
        let textToSearchInto = text.split("/").pop();
        let valueToDisplay = <span>{textToSearchInto}</span>;
        return getRenderOutput(textToSearchInto, valueToDisplay, "name", searchedEntityColumn, searchEntityText);
      }
    },
    {
      ellipsis: true,
      title: <span data-testid="entityTableType">Type</span>,
      dataIndex: "type",
      key: "type",
      width: "15%",
      sorter: (a: any, b: any) => getEntityDataType(a.type).localeCompare(getEntityDataType(b.type)),
      render: (text) => {
        const expanded = text.startsWith("parent-");
        const dType = expanded ? text.slice(text.indexOf("-")+1): text;
        return <div className={styles.typeContainer}>
          {expanded ? <div className={styles.typeContextContainer}><span className={styles.typeContext}>Context</span>&nbsp;<Popover
            content={contextHelp}
            trigger="click"
            placement="right"><Icon type="question-circle" className={styles.questionCircle} theme="filled" /></Popover><p className={styles.typeText}>{dType}</p></div> : text}
        </div>;
      }
    },
    {
      title: <span>XPath Expression <Popover
        content={xPathDocLinks}
        trigger="click"
        placement="top"
        getPopupContainer={() => document.getElementById("parentContainer") || document.body}><Icon type="question-circle" className={styles.questionCircle} theme="filled" /></Popover>
      </span>,
      dataIndex: "key",
      key: "key",
      width: "45%",
      render: (text, row) => (<div className={styles.mapExpParentContainer}><div className={styles.mapExpressionContainer}>
        <TextArea
          id={"mapexpression"+row.name.split("/").pop()}
          data-testid={row.name.split("/").pop()+"-mapexpression"}
          style={mapExpressionStyle(row.name)}
          onClick={handleClickInTextArea}
          value={mapExp[row.name]}
          onChange={(e) => handleMapExp(row.name, e)}
          onBlur={handleExpSubmit}
          autoSize={{minRows: 1}}
          disabled={!canReadWrite}></TextArea>&nbsp;&nbsp;
        <span>
          <Dropdown overlay={sourceSearchMenu} trigger={["click"]} disabled={!canReadWrite}>
            <i  id="listIcon" data-testid={row.name.split("/").pop()+"-listIcon1"}><FontAwesomeIcon icon={faList} size="lg"  data-testid={row.name.split("/").pop()+"-listIcon"}  className={styles.listIcon} onClick={(e) => handleSourceList(row)}/></i>
          </Dropdown>
        </span>
                &nbsp;&nbsp;
        <span ><Dropdown overlay={menu} trigger={["click"]} disabled={!canReadWrite}><MLButton id="functionIcon" data-testid={`${row.name.split("/").pop()}-${row.key}-functionIcon`} className={styles.functionIcon} size="small" onClick={(e) => handleFunctionsList(row.name)}>fx</MLButton></Dropdown></span></div>
      {checkFieldInErrors(row.name) ? <div id="errorInExp" data-testid={row.name+"-expErr"} className={styles.validationErrors}>{displayResp(row.name)}</div> : ""}</div>)
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: "20%",
      ellipsis: true,
      sorter: (a: any, b: any) => getDataForValueField(a.name)?.localeCompare(getDataForValueField(b.name)),
      render: (text, row) => (<div data-testid={row.name.split("/").pop()+"-value"} className={styles.mapValue}><MLTooltip title={getTextForTooltip(row.name)}>{getTextForValueField(row)}</MLTooltip></div>)
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

  const getEntityDataType = (prop) => {
    return prop.startsWith("parent-") ? prop.slice(prop.indexOf("-")+1) : prop;
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
    marginLeft: "25vw"
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
    /* Insert Function signature in map expressions */

  const handleFunctionsList = async (name) => {
    let funcArr: any[]= [];
    mapFunctions.forEach(element => {
      funcArr.push({"key": element.functionName, "value": element.functionName});
    });
    setPropListForDropDown(funcArr);

    setPropName(name);
    if (!displaySelectList && !displayFuncMenu) {
      setFunctionValue("");
      await setDisplaySelectList(true);
      await setDisplayFuncMenu(true);
    } else {
      await setDisplaySelectList(false);
      await setDisplayFuncMenu(false);
    }
  };

  const functionsDef = (functionName) => {
    return mapFunctions.find(func => {
      return func.functionName === functionName;
    }).signature;

  };

  const insertContent = async (content, propName) => {
    if (!mapExp[propName]) {
      mapExp[propName] = "";
    }
    let newExp = mapExp[propName].substr(0, caretPosition) + content +
            mapExp[propName].substr(caretPosition, mapExp[propName].length);
    await setMapExp({...mapExp, [propName]: newExp});

    setDisplaySelectList(prev => false);
    setDisplayFuncMenu(prev => false);
    //simulate a click event to handle simultaneous event propagation of dropdown and select
    simulateMouseClick(dummyNode.current);
  };


  //simulate a click event to destroy both dropdown and select on option select
  const simulateMouseClick = (element) => {
    let mouseClickEvents = ["mousedown", "click", "mouseup"];
    mouseClickEvents.forEach(mouseEventType =>
      element.dispatchEvent(
        new MouseEvent(mouseEventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1
        })
      )
    );
  };

  const onFunctionSelect = (e) => {
    setFunctionValue(e);
    insertContent(functionsDef(e), propName);
  };

  const menu = (
    <DropDownWithSearch
      displayMenu={displayFuncMenu}
      setDisplayMenu={setDisplayFuncMenu}
      setDisplaySelectList={setDisplaySelectList}
      displaySelectList={displaySelectList}
      itemValue={functionValue}
      onItemSelect={onFunctionSelect}
      srcData={propListForDropDown}
      propName={propName}
      handleDropdownMenu={handleFunctionsList}
    />
  );
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

  const handleSourceList = async (row) => {
    setSelectedRow(row);
    let name = row.name;
    let indentList:any = [];
    setPropName(name);
    //flatArray.forEach(element => propList.push(element.key));
    flatArray.forEach(element => indentList.push(20*(element.key.split("/").length - 1)));
    setSourcePropListForDropDown(flatArray);
    setSourceIndentForDropDown(indentList);
    setSourcePropName(name);
    if (!displaySourceList && !displaySourceMenu) {
      setSourceValue("");
      await setDisplaySourceList(true);
      await setDisplaySourceMenu(true);
    } else {
      await setDisplaySourceList(false);
      await setDisplaySourceMenu(false);
    }
  };

  const insertSource = async  (content, propName) => {
    if (!mapExp[propName]) {
      mapExp[propName] = "";
    }
    let field = content;//.replace(/[^\/]+\:/g, '');
    if (/(&|>|<|'|"|}|{|\s)/g.test(String(field))) {
      field = "*[local-name(.)='" + escapeXML(field) + "']";
    }
    // Trim context from beginning of fieldName if needed
    if (sourceContext[propName]) {
      let len = sourceContext[propName].length;
      if (field.substring(0, len+1) === sourceContext[propName] + "/") {
        field = field.slice(len+1);
      }
    }

    let newExp = mapExp[propName].substr(0, caretPosition) + field +
            mapExp[propName].substr(caretPosition, mapExp[propName].length);
    await setMapExp({...mapExp, [propName]: newExp});
    tempMapExp = Object.assign({}, mapExp);
    tempMapExp[propName] = newExp;
    saveMapping(tempMapExp);
    setDisplaySourceList(false);
    setDisplaySourceMenu(false);

    //simulate a click event to handle simultaneous event propagation of dropdown and select
    simulateMouseClick(dummyNode.current);
  };

  function escapeXML(input = "") {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/'/g, "&apos;")
      .replace(/"/g, "&quot;")
      .replace(/{/g, "&#123;")
      .replace(/}/g, "&#125;");
  }

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


  const onSourceSelect = (e) => {
    setSourceValue(e);
    insertSource(e, propName);
  };

  const sourceSearchMenu = (
    <DropDownWithSearch
      displayMenu={displaySourceMenu}
      setDisplayMenu={setDisplaySourceMenu}
      setDisplaySelectList={setDisplaySourceList}
      displaySelectList={displaySourceList}
      itemValue={sourceValue}
      onItemSelect={onSourceSelect}
      srcData={sourcePropListForDropDown}
      propName={sourcePropName}
      handleDropdownMenu={handleSourceList}
      indentList = {sourceIndentForDropDown}/>
  );

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

  const getColumnsForEntityTable:any = () => {
    return entityColumns.map(el => checkedEntityColumns[el.key] ? el : "").filter(item => item);
  };

  //Collapse all-Expand All button

  const getKeysToExpandFromTable = (dataArr, rowKey, allKeysToExpand:any = []) => {

    dataArr.forEach(obj => {
      if (obj.hasOwnProperty("children")) {
        allKeysToExpand.push(obj[rowKey]);
        if ((rowKey === "key" && !expandedEntityFlag) || (rowKey === "rowKey" && !expandedSourceFlag)) {
          getKeysToExpandFromTable(obj["children"], rowKey, allKeysToExpand);
        }
      }
    });
    return allKeysToExpand;
  };

  const handleSourceExpandCollapse = (id) => {
    let keys = getKeysToExpandFromTable(sourceData, "rowKey");
    if (id === "collapse") {
      setSourceExpandedKeys([]);
      setExpandedSourceFlag(false);
    } else {
      setSourceExpandedKeys([...keys]);
      setExpandedSourceFlag(true);
    }
  };

  const handleEntityExpandCollapse = (id) => {
    let keys = getKeysToExpandFromTable(entityTypeProperties, "key");
    if (id === "collapse") {
      setEntityExpandedKeys([]);
      setExpandedEntityFlag(false);
    } else {
      setEntityExpandedKeys([...keys]);
      setExpandedEntityFlag(true);
    }
  };

  const toggleRowExpanded = (expanded, record, rowKey) => {

    if (rowKey === "key") {
      if (!entityExpandedKeys.includes(record.key)) {
        setEntityExpandedKeys(prevState => {
          let finalKeys = prevState.concat([record["key"]]);
          if (allEntityKeys.every(item => finalKeys.includes(item))) {
            setExpandedEntityFlag(true);
          }
          return finalKeys;
        });
      } else {
        setEntityExpandedKeys(prevState => {
          let finalKeys = prevState.filter(item => item !== record["key"]);
          if (!initialEntityKeys.some(item => finalKeys.includes(item))) {
            setExpandedEntityFlag(false);
          }
          return finalKeys;
        });
      }
    } else {
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
      <MLPageHeader
        className={styles.pageHeader}
        onBack={onBack}
        title={<span aria-label={`${curationOptions.activeStep.stepArtifact && curationOptions.activeStep.stepArtifact.name}-details-header`}>{curationOptions.activeStep.stepArtifact && curationOptions.activeStep.stepArtifact.name}</span>}
      />
      <div className={styles.mapContainer}>
        <div className={styles.stepSettingsLink} onClick={() => handleStepSettings()}>
          <FontAwesomeIcon icon={faCog} type="edit" role="step-settings button" aria-label={"stepSettings"} />
          <span className={styles.stepSettingsLabel}>Step Settings</span>
        </div>

        <div className={styles.header}>
          {errorInSaving ? success() : <span className={styles.noMessage}></span>}
        </div>
        <br/>
        <span className={styles.btn_icons}>
          <MLButton id="Clear-btn" mat-raised-button="true" color="primary" disabled={emptyData} onClick={() => onClear()}>
                        Clear
          </MLButton>
                &nbsp;&nbsp;
          <MLButton className={styles.btn_test} id="Test-btn" mat-raised-button="true" type="primary" disabled={emptyData || mapExpTouched} onClick={() => getMapValidationResp(sourceURI)}>
                        Test
          </MLButton>
        </span>
        <br/>
        <hr/>
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
                <p className={styles.sourceName}
                ><i><FontAwesomeIcon icon={faList} size="sm" className={styles.sourceDataIcon}
                  /></i> Source Data <Popover
                    content={srcDetails}
                    trigger="click"
                    placement="right"
                    getPopupContainer={() => document.getElementById("parentContainer") || document.body}
                  ><Icon type="question-circle" className={styles.questionCircle} theme="filled" /></Popover></p>
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

                    <div className={styles.navigationCollapseButtons}>
                      <span><ExpandCollapse handleSelection={(id) => handleSourceExpandCollapse(id)} currentSelection={""} /></span>
                      <span>{navigationButtons}</span>
                    </div>
                    <Table
                      pagination={false}
                      expandIcon={(props) => customExpandIcon(props)}
                      onExpand={(expanded, record) => toggleRowExpanded(expanded, record, "rowKey")}
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
                <span className={styles.entityTypeTitle}><p ><i><FontAwesomeIcon icon={faObjectUngroup} size="sm" className={styles.entityIcon} /></i> Entity Type: {curationOptions.activeStep.entityName}</p></span>
              </div>
              <div ref={dummyNode}></div>
              <div className={styles.columnOptionsSelectorContainer}>
                <span><ExpandCollapse handleSelection={(id) => handleEntityExpandCollapse(id)} currentSelection={""} /></span>
                <span className={styles.columnOptionsSelector}>{columnOptionsSelector}</span>
              </div>
              <Table
                pagination={false}
                className={styles.entityTable}
                expandIcon={(props) => customExpandIcon(props)}
                onExpand={(expanded, record) => toggleRowExpanded(expanded, record, "key")}
                expandedRowKeys={entityExpandedKeys}
                indentSize={14}
                //defaultExpandAllRows={true}
                columns={getColumnsForEntityTable()}
                scroll={{y: "60vh", x: 1000}}
                dataSource={entityTypeProperties}
                tableLayout="unset"
                rowKey={(record: any) => record.key}
                getPopupContainer={() => document.getElementById("entityContainer") || document.body}
              />
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

