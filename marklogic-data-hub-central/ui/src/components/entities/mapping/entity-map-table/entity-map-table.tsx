import React, {useState, useEffect, CSSProperties} from "react";
import styles from "./entity-map-table.module.scss";
import "./entity-map-table.scss";
import Select, {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import {Modal, ButtonGroup, Dropdown, Spinner, FormControl} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Highlighter from "react-highlight-words";
import {faList, faTerminal} from "@fortawesome/free-solid-svg-icons";
import EntitySettings from "../entity-settings/entity-settings";
import {faKey, faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import arrayIcon from "../../../../assets/icon_array.png";
import DocIcon from "../../../../assets/DocIcon.png";
import {css} from "@emotion/css";
import {getParentKey, getKeys, deepCopy} from "@util/data-conversion";
import {paginationMapping} from "@config/mapping.config";
import {ModelingTooltips, MappingDetailsTooltips} from "@config/tooltips.config";
import StepsConfig from "@config/steps.config";
import {QuestionCircleFill, XLg, ChevronDown, ChevronRight} from "react-bootstrap-icons";
import {DropDownWithSearch, HCButton, HCTooltip, HCTable, HCPopoverSearch, HCModal} from "@components/common";
import Popover from "react-bootstrap/Popover";
import {OverlayTrigger, Overlay} from "react-bootstrap";
import {themeColors} from "@config/themes.config";
import {getViewSettings, setViewSettings} from "@util/user-context";

interface Props {
  setScrollRef: any;
  executeScroll: any;
  mapResp: any;
  mapData: any;
  setMapResp: any;
  dummyNode: any;
  flatArray: any;
  saveMapping: any;
  mapExpTouched: any;
  setMapExpTouched: any;
  getInitialChars: any;
  canReadWrite: any;
  entityTypeTitle: any;
  entityModel: any;
  checkedEntityColumns: any;
  checkedEntityColumnsFlag?: string;
  entityTypeProperties: any;
  entityMappingId: any;
  relatedMappings: any;
  entityExpandedKeys: any;
  keysExpandCollapse?: any,
  setEntityExpandedKeys: any;
  allEntityKeys: any;
  setExpandedEntityFlag: any;
  initialEntityKeys: any;
  tooltipsData: any;
  updateStep?: any;
  relatedEntityTypeProperties: any;
  relatedEntitiesSelected: any;
  setRelatedEntitiesSelected: any;
  isRelatedEntity: boolean;
  tableColor: any;
  firstRowTableKeyIndex: any;
  filterStr: any;
  setFilterStr: any;
  allRelatedEntitiesKeys: any;
  setAllRelatedEntitiesKeys: any;
  mapFunctions: any;
  mapRefs: any;
  savedMappingArt: any;
  deleteRelatedEntity: any;
  labelRemoved: any;
  entityLoaded: any;
}

const EntityMapTable: React.FC<Props> = (props) => {
  const storage = getViewSettings();
  const [mapExp, setMapExp] = useState({});
  //Dummy ref node to simulate a click event
  const dummyNode = props.dummyNode;
  let tempMapExp: any = {};
  let mapExpUI: any = {};
  let tempSourceContext: any = {};
  let relatedEntityMapData = props.isRelatedEntity ? props.mapData.relatedEntityMappings?.find(entity => entity.relatedEntityMappingId === props.entityMappingId) : {};

  //Text for Context Icon
  const contextHelp = <Popover id={`popover-emt-related-help`} className={styles.popoverEntityMapTableHelp}><Popover.Body>
    <div className={styles.contextHelp}>{MappingDetailsTooltips.context}</div>
  </Popover.Body></Popover>;
  //Text for URI Icon
  const uriHelp = <Popover id={`popover-emt-urihelp`} className={styles.popoverEntityMapTableUriHelp} style={{minWidth: 300}}><Popover.Body>
    <div className={styles.uriHelp}>{MappingDetailsTooltips.uri}</div>
  </Popover.Body></Popover>;

  //Text for related entities help icon
  const [showDocPopover, setShowDocPopover] = useState(false);
  const [targetDocPopover, setTargetDocPopover] = useState(null);
  const relatedInfo = <Overlay
    show={showDocPopover}
    target={targetDocPopover}
    placement="right"
  >
    <Popover id={`popover-emt-related-info`} className={styles.popoverEntityMapTableRelated}
      style={{paddingLeft: "10px"}}
      onMouseEnter={() => setShowDocPopover(true)}
      onMouseLeave={() => setShowDocPopover(false)}>
      <Popover.Body>
        <div data-testid="relatedInfoContent">Map related entities by selecting them from the dropdown below. <br />Refer to the <a href="https://docs.marklogic.com/datahub/5.5/flows/about-mapping.html" target="_blank">documentation</a> for more details.</div>
      </Popover.Body>
    </Popover>
  </Overlay>;

  //For Entity table
  const [searchEntityText, setSearchEntityText] = useState("");
  const [searchedEntityColumn, setSearchedEntityColumn] = useState("");
  const [sourceContext, setSourceContext] = useState({});
  const [updateContextFlag, setUpdateContextFlag] = useState(false);
  const [expressionContext, setExpressionContext] = useState(relatedEntityMapData?.expressionContext ? relatedEntityMapData.expressionContext : "/");
  const [uriExpression, setUriExpression] = useState("");
  const [tableCollapsed, setTableCollapsed] = useState(false);
  const [tableToggled, setTableToggled] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const [filteredValues, setFilteredValues] = useState<any>([]);
  const [rowExpandedKeys, setRowExpandedKeys] = useState<any>([props.entityExpandedKeys]);
  const [searchedKey, setSearchedKey] = useState<string>("");
  const [filteredEntityProperties, setFilteredEntityProperties] = useState<any[]>([]);

  //For Dropdown menu
  const [propName, setPropName] = useState("");
  const [functionValue, setFunctionValue] = useState("");
  const [refValue, setRefValue] = useState("");
  const [propListForDropDown, setPropListForDropDown] = useState<any>([]);
  const [displaySelectList, setDisplaySelectList] = useState(false);
  const [displayRefList, setDisplayRefList] = useState(false);
  const [displayFuncMenu, setDisplayFuncMenu] = useState(false);
  const [displayRefMenu, setDisplayRefMenu] = useState(false);
  const [caretPosition, setCaretPosition] = useState(0);
  const [sourcePropListForDropDown, setSourcePropListForDropDown] = useState<any>([]);
  const [sourceIndentForDropDown, setSourceIndentForDropDown] = useState<any>([]);
  const [refPropListForDropDown, setRefPropListForDropDown] = useState<any>([]);

  const [selectedRow, setSelectedRow] = useState<any>([]);
  const [sourcePropName, setSourcePropName] = useState("");
  const [sourceValue, setSourceValue] = useState("");
  const [displaySourceMenu, setDisplaySourceMenu] = useState(false);
  const [displaySourceList, setDisplaySourceList] = useState(false);
  const [entityProperties, setEntityProperties] = useState<any[]>(props.entityTypeProperties);
  const [selectedOptions, setSelectedOptions] = useState<any[]>(["default"]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [removedEntity, setRemovedEntity] = useState<any>([]);
  const [entitiesReferencing, setEntitiesReferencing] = useState<any>([]);
  const [pendingOptions, setPendingOptions] = useState<any>([]);

  const [showDocLinksPopover, setShowDocLinksPopover] = useState(false);
  const [targetDocLinksPopover, setTargetDocLinksPopover] = useState(null);
  const [deleteFromTable, setDeleteFromTable] = useState(false);

  const handleShowDocPopover = (event) => {
    setShowDocPopover(!showDocPopover);
    setTargetDocPopover(event.target);
  };
  const handleShowDocLinksPopover = (event) => {
    setShowDocLinksPopover(!showDocLinksPopover);
    setTargetDocLinksPopover(event.target);
  };

  let directRelation = props.isRelatedEntity ? ("(" + props.entityMappingId.split(".")[0]) === props.entityTypeTitle.split(" ")[1] ? true : false : null;

  let firstRowKeys = new Array(100).fill(0).map((_, i) => i);
  //Documentation links for using Xpath expressions
  const xPathDocLinks =
    <Overlay
      show={showDocLinksPopover}
      target={targetDocLinksPopover}
      placement="top"
    >
      <Popover id={`popover-emt-xpathdoclinks`} className={styles.xPathDocLinks} onMouseEnter={() => setShowDocLinksPopover(true)} onMouseLeave={() => setShowDocLinksPopover(false)}>
        <Popover.Body>
          <div className={styles.xpathDoc}><span id="doc">Documentation:</span>
            <div><ul className={styles.docLinksUl}>
              <li><a href="https://docs.marklogic.com/guide/xquery/xpath" target="_blank" rel="noopener noreferrer" className={styles.docLink}>XPath Expressions</a></li>
              <li><a href="https://docs.marklogic.com/datahub/flows/dhf-mapping-functions.html" target="_blank" rel="noopener noreferrer" className={styles.docLink}>Mapping Functions</a></li>
            </ul></div>
          </div>
        </Popover.Body></Popover>
    </Overlay>;

  const getColumnOptions = () => {
    let storageAux = storage?.curateEntityTable;
    if (storageAux?.columnOptions) {
      return storageAux.columnOptions;
    } else return "";
  };

  useEffect(() => {
    let newEntityStorage;
    newEntityStorage = {
      ...storage, curateEntityTable: {
        ...storage.curateEntityTable,
        lowerEntityColumns: lowerEntityColumns,
        entityColumns: entityColumns,
      }
    };
    setViewSettings(newEntityStorage);

  }, [props.checkedEntityColumnsFlag]);

  const getColumnsForEntityTable: any = (type: string) => {
    return type === "upper" ? entityColumns.map(el => (getColumnOptions() !== "" ? getColumnOptions()[el.key] : props.checkedEntityColumns[el.key]) ? el : "").filter(item => item) :
      lowerEntityColumns.map(el => (getColumnOptions() !== "" ? getColumnOptions()[el.key] : props.checkedEntityColumns[el.key]) ? el : "").filter(item => item);
  };

  const getValue = (object, keys) => keys.split(".").reduce((o, k) => (o || {})[k], object);

  const getDefaultEntities = () => {
    let defaultSelected: any = [];
    let entityTitle = props.isRelatedEntity ? props.entityModel.info.title : props.entityTypeTitle;
    props.relatedEntitiesSelected.map(entity => {
      let entityIdSections = entity["entityMappingId"].split(":");
      let entityId = entityIdSections.length > 2 ? /([^.]+)/.exec(entityIdSections[entityIdSections.length - 2])![1] : /([^.]+)/.exec(entityIdSections[0])![1];
      if (entityId && entityId === entityTitle) { defaultSelected.push(entity.entityLabel); }
    });
    return defaultSelected;
  };
  const [filterValues, setFilterValues] = useState<any[]>(getDefaultEntities());

  useEffect(() => {
    if (tableToggled) {
      setMapExp({...mapExp});
    } else if (props.entityMappingId || !props.isRelatedEntity) {
      initializeMapExpressions();
    }
    return (() => {
      setMapExp({});
      setSearchEntityText("");
      setSearchedEntityColumn("");
    });
  }, [entityProperties]);

  useEffect(() => {
    setEntityProperties(props.entityTypeProperties);
    props.setAllRelatedEntitiesKeys([...props.allRelatedEntitiesKeys, ...getKeys(props.entityTypeProperties)]);

    if (!getMainTableCollapsed()) {
      if (!filterApplied) {
        setEntityProperties(props.entityTypeProperties);
      } else {
        setEntityProperties(filteredValues);
      }
      setTableCollapsed(false);
    } else {
      setEntityProperties([]);
      setTableCollapsed(true);
    }

  }, [props.entityTypeProperties]);

  useEffect(() => {
    if (props.filterStr.length > 0) {
      let filteredData = [...getFilteredData(props.filterStr.toLowerCase(), props.entityTypeProperties)];
      setFilterApplied(true);
      setFilteredValues(filteredData);
      setFilteredEntityProperties(filteredData);
      props.setEntityExpandedKeys([...props.entityExpandedKeys, ...props.allRelatedEntitiesKeys]);
    } else {
      setFilterApplied(false);
      setEntityProperties(props.entityTypeProperties);
    }
  }, [props.filterStr]);

  useEffect(() => {
    if (updateContextFlag) {
      tempSourceContext = {};
      updateSourceContext(mapExp, props.entityTypeProperties);
      setSourceContext({...tempSourceContext});
      setUpdateContextFlag(false);
    }
  }, [updateContextFlag]);

  useEffect(() => {
    //when component finishes rendering, set selected options with default entities for filter, necessary to track updates to the filter
    if (selectedOptions[0] === "default" && props.relatedEntityTypeProperties.length > 0) {
      setSelectedOptions(getDefaultEntities());
      setFilterValues(getDefaultEntities());
      if (getSelectedOptionsDrp() !== "") handleOptionSelect("");
    }
  }, [props.relatedEntityTypeProperties]);

  useEffect(() => {
    saveSessionEntityNestedTable();
    setRowExpandedKeys(props.entityExpandedKeys);
  }, [props.entityExpandedKeys]);

  const getStoredFilterMainTable = () => {
    let storageAux = storage?.curateEntityTable;
    let propertyArray = props?.savedMappingArt?.name;
    if (storageAux?.filterMainTable && storageAux?.filterMainTable[propertyArray]) {
      return storageAux.filterMainTable[propertyArray];
    }
  };

  const saveFilterMainTable = (value?) => {
    let newEntityStorage;
    newEntityStorage = {
      ...storage, curateEntityTable: {
        ...storage.curateEntityTable,
        filterMainTable: {...storage.curateEntityTable?.filterMainTable, [props?.savedMappingArt?.name]: value ? "": searchedKey},
      }
    };
    setViewSettings(newEntityStorage);
  };

  useEffect(() => {
    saveFilterMainTable();
  }, [searchedKey]);

  useEffect(() => {
    entityProperties.length > 0 && filterByName("");
  }, [entityProperties]);

  useEffect(() => {
    if (filterValues.includes(props.labelRemoved)) {
      filterValues.splice(filterValues.indexOf(props.labelRemoved), 1);
    }
  }, [props.labelRemoved]);

  const mapExpressionStyle = (propName, isProperty) => {
    const mapStyle: CSSProperties = {
      width: "100%",
      verticalAlign: "top",
      justifyContent: "top",
      borderColor: checkFieldInErrors(propName, isProperty) ? "red" : ""
    };
    return mapStyle;
  };

  /*  The source context is updated when mapping is saved/loaded, this function does a level order traversal of entity
     json and updates the sourceContext for every entity property */

  const updateSourceContext = (mapExp, entityTable) => {

    let queue: any[] = [];
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
          tempSourceContext[name] = props.isRelatedEntity ? expressionContext : "";
          parentVal = expressionContext;
        } else {
          tempSourceContext[name] = props.isRelatedEntity ? expressionContext : parentVal;
        }
        if (mapExp[name]) {
          if (parentVal && parentVal !== "/") {
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
          tempSourceContext[name] = props.isRelatedEntity ? expressionContext : "";
        }
      }
    }
  };

  const initializeMapExpressions = () => {
    let entityMapDataProperties;
    if (!props.isRelatedEntity) {
      entityMapDataProperties = props.mapData.properties;
    } else {
      //find the corresponding related entity from the array that has its map properties
      entityMapDataProperties = relatedEntityMapData?.properties;
    }
    if (props.mapData && entityMapDataProperties) {
      initializeMapExpForUI(entityMapDataProperties);
      setMapExp({...mapExpUI});
    }
    updateSourceContext({...mapExpUI}, props.entityTypeProperties);
    setSourceContext({...tempSourceContext});

    let uriExpr = "";
    if (!props.isRelatedEntity) {
      // For primary entity
      uriExpr = props.mapData.uriExpression ? props.mapData.uriExpression : StepsConfig.defaultPrimaryUri;
    } else {
      // For related entity
      let entName = props.entityModel?.info.title ? props.entityModel?.info.title : "";
      uriExpr = relatedEntityMapData?.uriExpression ? relatedEntityMapData.uriExpression : StepsConfig.defaultRelatedUri(entName);
    }
    setUriExpression(uriExpr);

  };

  //Refresh the UI mapExp from the the one saved in the database
  const initializeMapExpForUI = (mapExp, parentKey = "") => {
    Object.keys(mapExp).forEach(key => {
      let val = mapExp[key];
      if (val.hasOwnProperty("properties")) {
        if (val["sourcedFrom"] === "") {
          val["sourcedFrom"] = "/";
        }
        parentKey = parentKey ? parentKey + "/" + key : key;
        mapExpUI[parentKey] = mapExp[key]["sourcedFrom"];
        initializeMapExpForUI(val.properties, parentKey);
        parentKey = (parentKey.indexOf("/") !== -1) ? parentKey.substring(0, parentKey.lastIndexOf("/")) : "";
      } else {
        let tempKey = parentKey ? parentKey + "/" + key : key;
        mapExpUI[tempKey] = mapExp[key]["sourcedFrom"];
      }
    });
  };


  const handleClickInTextArea = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    await setCaretPosition(e.target.selectionStart);
  };

  const getCurrentPageMainTable = () => {
    let storageAux = storage?.curateEntityTable;
    let propertyArray = props.entityTypeTitle+"_"+props?.savedMappingArt?.name;
    if (storageAux?.pageNumberTable && props?.entityTypeTitle && storageAux.pageNumberTable[propertyArray]) {
      let pageNumberTableAux = storageAux.pageNumberTable[propertyArray];
      return pageNumberTableAux;
    }
  };

  const getCurrentSizeMainTable = () => {
    let storageAux = storage?.curateEntityTable;
    let propertyArray = props?.entityTypeTitle+"_"+props?.savedMappingArt?.name;

    if (storageAux?.pageSizeTable && props?.entityTypeTitle && storageAux?.pageSizeTable[propertyArray]) {
      let pageSizeTableAux = storageAux.pageSizeTable[propertyArray];
      return pageSizeTableAux;
    }
  };

  const saveSessionPageSizeMainTable = (page, size) => {
    let newEntityStorage;
    let propertyArray = props?.entityTypeTitle+"_"+props?.savedMappingArt?.name;
    newEntityStorage = {
      ...storage, curateEntityTable: {
        ...storage.curateEntityTable,
        pageNumberTable: {...storage.curateEntityTable?.pageNumberTable, [propertyArray]: page},
        pageSizeTable: {...storage.curateEntityTable?.pageSizeTable, [propertyArray]: size},
      }
    };
    setViewSettings(newEntityStorage);
  };

  useEffect(() => {
    let newEntityStorage;
    newEntityStorage = {
      ...storage, curateEntityTable: {
        ...storage.curateEntityTable,
        mainTableCollapsed: {...storage?.curateEntityTable?.mainTableCollapsed, [props?.entityTypeTitle+"_"+props?.savedMappingArt?.name]: tableCollapsed},
      }
    };
    setViewSettings(newEntityStorage);
  }, [tableCollapsed]);

  const getMainTableCollapsed = () => {
    let storageAux = storage?.curateEntityTable;
    let propertyArray = props?.entityTypeTitle+"_"+props?.savedMappingArt?.name;

    if (storageAux?.mainTableCollapsed && storageAux?.mainTableCollapsed[propertyArray]) {
      let mainTableCollapsed = storageAux?.mainTableCollapsed[propertyArray];
      return mainTableCollapsed;
    } else return "";
  };

  const saveSessionEntityNestedTable = () => {
    let newEntityStorage;
    newEntityStorage = {
      ...storage, curateEntityTable: {
        ...storage.curateEntityTable,
        expandedTableKeys: {...storage.curateEntityTable?.expandedTableKeys, [props?.savedMappingArt?.name]: props.entityExpandedKeys},
      }
    };
    setViewSettings(newEntityStorage);
  };

  const toggleRowExpanded = (record, expanded, rowKey) => {
    saveSessionEntityNestedTable();

    if (rowKey === "key") {
      if (!props.entityExpandedKeys.includes(record.key)) {
        props.setEntityExpandedKeys(prevState => {
          let finalKeys = prevState.concat([record["key"]]);
          if (props.allEntityKeys.every(item => finalKeys.includes(item))) {
            props.setExpandedEntityFlag(true);
          }
          return finalKeys;
        });
      } else {
        props.setEntityExpandedKeys(prevState => {
          let finalKeys = prevState.filter(item => item !== record["key"]);
          if (!props.initialEntityKeys.some(item => finalKeys.includes(item))) {
            props.setExpandedEntityFlag(false);
          }
          return finalKeys;
        });
      }
    }
  };

  const handleExpSubmit = async () => {
    if (props.mapExpTouched) {
      setUpdateContextFlag(true);
      await props.saveMapping(mapExp, props.entityMappingId, expressionContext, uriExpression, props.entityModel);
    }
    props.setMapExpTouched(false);
  };

  const handleColSearch = (selectedKeys, dataIndex, entityData) => {
    setFilterApplied(true);
    setSearchEntityText(selectedKeys);
    setSearchedEntityColumn(dataIndex);

    let filteredData: any[] = [];
    if (selectedKeys[0].length) {
      props.setFilterStr(selectedKeys);
      filteredData = [...getFilteredData(selectedKeys[0].toLowerCase(), props.entityTypeProperties)];
      setFilteredEntityProperties(filteredData);
    }
    props.setEntityExpandedKeys([...props.entityExpandedKeys, ...firstRowKeys, ...getKeys(props.entityTypeProperties)]);
  };

  const handleSearchReset = () => {
    props.setFilterStr("");
    setTableCollapsed(false);
    setFilterApplied(false);
    setFilteredValues([]);
    // clearFilters();
    if (searchEntityText) {
      props.setEntityExpandedKeys([...props.initialEntityKeys]);
    }
    setSearchedKey("");
    setSearchEntityText("");
    setSearchedEntityColumn("");
    setEntityProperties(props.entityTypeProperties);
    saveFilterMainTable(true);
  };

  const filterByName = (value) => {
    if (!value) if (getStoredFilterMainTable()) value = getStoredFilterMainTable();

    setSearchedKey(value);
    let filterVal = value;
    if (filterVal) {
      let filteredArray;
      setFilterApplied(true);
      //make copy of source data to filter on so as not to mutate the original
      let entityPropertiesDefault: any = entityProperties;
      let entityPropertiesCopy: any = JSON.parse(JSON.stringify(entityPropertiesDefault));

      //recursively filter through properties + children
      filteredArray = entityPropertiesCopy.filter(function f(o) {
        if (o.name.toLowerCase().includes(filterVal.toLowerCase())) {
          return true;
        }
        if (o.children) {
          return (o.children = o.children.filter(f)).length;
        }
      });

      handleColSearch(filterVal, "name", entityPropertiesDefault);
      if (filteredArray.length < 1) {
        // setFilteredSrcProperties(srcPropertiesDefault);
      } else {
        setFilteredEntityProperties(filteredArray);
      }
    } else {
      handleSearchReset();
    }
  };


  /** Return filtered data source array by the value string.
    * @param value
    * @example 'city'
    * Set the filterMatch parameter of the matched element to true.
    * Add the more link objects at the end of the array where the match is found.
    * The more link object contains the parent key of the matched element if exist and searchKey which is the reference to the matched element.
    **/
  const getFilteredData = (value, sourceData) => {
    let filteredArray = deepCopy(sourceData);
    const parser = (data) => {
      let moreRowObj;
      let searchStr = value.toLowerCase();
      for (let i = 0; i < data.length; i++) {
        let name = data[i].filterName.toLowerCase();
        if (!name.includes(searchStr) && (!data[i].hasOwnProperty("children") || (data[i].hasOwnProperty("children") && data[i].children.length === 0))) {
          data.splice(i, 1);
          i--;
        } else if (!name.includes(searchStr) && data[i].hasOwnProperty("children") && data[i].children.length > 0) {
          parser(data[i].children);
        } else if (name.includes(searchStr) && data[i].hasOwnProperty("parentVal") && data[i].name !== data[i].filterName) {
          data[i].filterMatch = true;
          let parentKey = getParentKey(data[i].key, props.entityTypeProperties);
          moreRowObj = {key: parentKey * 10, name: "more", filterName: "more", filterMatch: false, isProperty: false, parentVal: "", type: "", parentKey: parentKey, searchKey: data[i].key};
        }

        if (data[i] && data[i].hasOwnProperty("children") && data[i].children.length === 0) {
          data.splice(i, 1);
          i--;
        }
      }

      if (moreRowObj && data.length > 0) {
        data.push(moreRowObj);
      }
      return filteredArray;
    };
    return parser(filteredArray);
  };

  /** Return children array of the provided parent key object.
    * @param parentKey
    **/
  const getRowSiblings = (parentKey) => {
    let originArray = deepCopy(props.entityTypeProperties);
    let filteredArray = new Array();
    const parser = (data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === parentKey && data[i].hasOwnProperty("children")) {
          filteredArray = [...data[i].children];
        } else if (data[i].hasOwnProperty("children")) {
          parser(data[i].children);
        }
      }
      return filteredArray;
    };
    return parser(originArray);
  };

  /** Return array with siblings as a children array of the provided parent key object.
    * @param parentKey
    * @param siblings
    * Set the filterMatch parameter of the matched element to true.
    * Add the less link objects at the end of the array where the match is found.
    * The less link object contains the parent key of the matched element and searchKey which is the reference to the matched element.
    **/
  const insertRowSiblings = (parentKey, siblings) => {
    let filteredArray = deepCopy(filteredEntityProperties);
    const parser = (data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === parentKey && data[i].hasOwnProperty("children")) {
          let oldMatch = data[i].children.filter(el => { return el.filterMatch === true; })[0];
          data[i].children = [];
          siblings.forEach(el => {
            if (el.filterName === oldMatch.filterName) { el.filterMatch = true; }
          });
          data[i].children = [...siblings];
          let lessRowObj = {key: parentKey * 10, name: "less", filterName: "less", filterMatch: false, isProperty: false, parentVal: "", type: "", parentKey: parentKey, searchKey: data[i].key};
          data[i].children.push(lessRowObj);
        } else if (data[i].hasOwnProperty("children")) {
          parser(data[i].children);
        }
      }
      return filteredArray;
    };
    return parser(filteredArray);
  };

  /** Return array with added peer level elements.
    * @param parentKey
    **/
  const addRowSiblings = (parentKey) => {
    let siblings = getRowSiblings(parentKey);
    let insertedSibligs = insertRowSiblings(parentKey, siblings);
    return insertedSibligs;
  };

  /** Return array with removed peer level elements that don't match 'props.filterStr' string and are children of the provided key object.
    * @param parentKey
    * @param sourceData
    **/
  const removeRowSiblings = (parentKey, sourceData) => {
    let filteredArray = deepCopy(sourceData);
    const parser = (data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === parentKey && data[i].hasOwnProperty("children")) {
          let subTree = getFilteredData(props.filterStr, data[i].children);
          data[i].children = [...subTree];
        } else if (data[i].hasOwnProperty("children")) {
          parser(data[i].children);
        }
      }
      return filteredArray;
    };
    return parser(filteredArray);
  };

  const handleMoreClick = (row) => {
    if (row.parentKey) {
      let siblings = addRowSiblings(row.parentKey);
      setFilteredEntityProperties(siblings);
    }
  };

  const handleLessClick = (row) => {
    if (row.parentKey) {
      let onlyChild = removeRowSiblings(row.parentKey, filteredEntityProperties);
      setFilteredEntityProperties(onlyChild);
    }
  };

  const getRenderOutput = (textToSearchInto, valueToDisplay, columnName, searchedCol, searchTxt, rowNum) => {
    if (rowNum > 100) {
      return <Highlighter
        highlightClassName={styles.highlightStyle}
        searchWords={[props.filterStr]}
        autoEscape
        textToHighlight={textToSearchInto}
      />;
    } else {
      return <div data-testid={`${props.entityTypeTitle}-${valueToDisplay}-name`}>{valueToDisplay}</div>;
    }
  };


  /* Insert Function signature in map expressions */
  const handleFunctionsList = async (name) => {
    let funcArr: any[] = [];
    props.mapFunctions.forEach(element => {
      funcArr.push({"key": element.functionName, "value": element.functionName});
    });
    setPropListForDropDown(funcArr);

    setPropName(name);
    if (!displaySelectList && !displayFuncMenu && !displayRefMenu) {
      setFunctionValue("");
      await setDisplaySelectList(true);
      await setDisplayFuncMenu(true);
      await setDisplayRefMenu(true);
    } else {
      await setDisplaySelectList(false);
      await setDisplayFuncMenu(false);
      await setDisplayRefMenu(false);
    }
  };

  /* Insert reference in map expressions */
  const handleRefList = async (name) => {
    if (props.canReadWrite) {
      let refArr: any[] = [];
      props.mapRefs.forEach(element => {
        refArr.push({"key": element.name, "value": element.name});
      });
      setRefPropListForDropDown(refArr);

      setPropName(name);
      if (!displaySelectList && !displayFuncMenu && !displayRefMenu) {
        setRefValue("");
        await setDisplaySelectList(true);
        await setDisplayFuncMenu(true);
        await setDisplayRefMenu(true);
      } else {
        await setDisplaySelectList(false);
        await setDisplayFuncMenu(false);
        await setDisplayRefMenu(false);
      }
    }
  };

  const functionsDef = (functionName) => {
    return props.mapFunctions.find(func => {
      return func.functionName === functionName;
    }).signature;
  };

  const onFunctionSelect = ({value}) => {
    setFunctionValue(value);
    insertContent(functionsDef(value), propName);
  };

  const onRefSelect = ({value}) => {
    setRefValue(value);
    insertContent(value, propName);
  };

  const insertContent = async (content, propName) => {
    let insertedContext, insertedUri;
    if (!mapExp[propName]) {
      mapExp[propName] = "";
    }
    if (propName === "URI" && !selectedRow.isProperty) {
      insertedUri = uriExpression.substr(0, caretPosition) + content +
        uriExpression.substr(caretPosition, uriExpression.length);
      setUriExpression(insertedUri);
      tempMapExp = mapExp;
    } else {
      let newExp = mapExp[propName].substr(0, caretPosition) + content +
        mapExp[propName].substr(caretPosition, mapExp[propName].length);
      let newMapExp = {...mapExp, [propName]: newExp};
      setMapExp(newMapExp);
      tempMapExp = Object.assign({}, newMapExp);
    }
    await props.saveMapping(tempMapExp, props.entityMappingId, insertedContext, insertedUri, props.entityModel);
    setDisplaySelectList(prev => false);
    setDisplayFuncMenu(prev => false);
    setDisplayRefMenu(prev => false);

    //simulate a click event to handle simultaneous event propagation of dropdown and select
    simulateMouseClick(dummyNode.current);
  };

  const onSourceSelect = ({value}) => {
    setSourceValue(value);
    insertSource(value, propName);
  };

  const insertSource = async (content, propName) => {
    let insertedContext, insertedUri;
    if (!mapExp[propName] && selectedRow.isProperty) {
      mapExp[propName] = "";
    }
    let field = content;//.replace(/[^\/]+\:/g, '');
    if (/(&|>|<|'|"|}|{|\s)/g.test(String(field))) {
      field = "*[local-name(.)='" + escapeXML(field) + "']";
    }

    if (propName === "Context" && !selectedRow.isProperty) {
      insertedContext = expressionContext.substr(0, caretPosition) + field + expressionContext.substr(caretPosition, expressionContext.length);
      setExpressionContext(insertedContext);
      await setMapExp({...mapExp});
      tempMapExp = Object.assign({}, mapExp);
    } else if (propName === "URI" && !selectedRow.isProperty) {
      if (uriExpression) {
        insertedUri = uriExpression.substr(0, caretPosition) + field + uriExpression.substr(caretPosition, uriExpression.length);
      } else {
        insertedUri = field;
      }
      setUriExpression(insertedUri);
      await setMapExp({...mapExp});
      tempMapExp = Object.assign({}, mapExp);
    } else {
      // Trim context from beginning of fieldName if needed
      let contextValue = sourceContext[propName];
      if (contextValue) {
        let len = contextValue.length;
        if (contextValue[0] === "/") {
          if (field.substring(0, len) === contextValue.substring(1, len + 1) + "/") {
            field = field.slice(len);
          }
        } else {
          if (field.substring(0, len + 1) === contextValue + "/") {
            field = field.slice(len + 1);
          }
        }
      }

      let newExp = mapExp[propName].substr(0, caretPosition) + field +
        mapExp[propName].substr(caretPosition, mapExp[propName].length);
      await setMapExp({...mapExp, [propName]: newExp});
      tempMapExp = Object.assign({}, mapExp);
      tempMapExp[propName] = newExp;
    }
    setUpdateContextFlag(true);
    await props.saveMapping(tempMapExp, props.entityMappingId, insertedContext, insertedUri, props.entityModel);
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

  const handleSourceList = async (row) => {
    if (props.canReadWrite) {
      setSelectedRow(row);
      let name = row.name;
      let indentList: any = [];
      setPropName(name);
      //flatArray.forEach(element => propList.push(element.key));
      props.flatArray.forEach(element => indentList.push(20 * (element.key.split("/").length - 1)));
      setSourcePropListForDropDown(props.flatArray);
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
    }
  };

  const handleMapExp = (row, event) => {
    setCaretPosition(event.target.selectionStart);
    props.setMapExpTouched(true);
    setMapExp({...mapExp, [row.name]: event.target.value});
  };

  const handleExpressionContext = (row, event) => {
    setCaretPosition(event.target.selectionStart);
    props.setMapExpTouched(true);
    setExpressionContext(event.target.value);
  };

  const handleUri = (row, event) => {
    setCaretPosition(event.target.selectionStart);
    props.setMapExpTouched(true);
    setUriExpression(event.target.value);
  };

  const checkFieldInErrors = (field, isProperty) => {
    const finalProp = field.replace(/\//g, ".properties.");
    if (!props.isRelatedEntity) {
      if (field === "URI" && !isProperty && props.mapResp && props.mapResp["uriExpression"]) {
        let prop = props.mapResp["uriExpression"];
        if (prop && prop["errorMessage"]) {
          return true;
        } else {
          return false;
        }
      } else if (props.mapResp && props.mapResp["properties"]) {
        let record = props.mapResp["properties"];
        let prop = getValue(record, finalProp);
        if (prop && prop["errorMessage"]) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      let index = props.savedMappingArt.relatedEntityMappings?.findIndex(entity => entity["relatedEntityMappingId"] === props.entityMappingId);
      if (props.mapResp && props.mapResp.relatedEntityMappings && field === "URI" && !isProperty && props.mapResp.relatedEntityMappings[index] && props.mapResp.relatedEntityMappings[index].uriExpression) {
        let prop = props.mapResp.relatedEntityMappings[index].uriExpression;
        if (prop && prop["errorMessage"]) {
          return true;
        } else if (prop && prop["output"]) {
          return false;
        }
      } else if (index > -1 && props.mapResp && props.mapResp.relatedEntityMappings && props.mapResp.relatedEntityMappings[index].properties) {
        let field = props.mapResp.relatedEntityMappings[index].properties;
        let prop = getValue(field, finalProp);
        if (prop && prop["errorMessage"]) {
          return true;
        } else if (prop && prop["output"]) {
          return false;
        }
      }
    }
  };

  const displayResp = (propName, isProperty) => {
    const finalProp = propName.replace(/\//g, ".properties.");
    if (!props.isRelatedEntity) {
      if (props.mapResp && props.mapResp["uriExpression"] && propName === "URI" && !isProperty) { //if value is from the URI and not an actual property
        let prop = props.mapResp["uriExpression"];
        if (prop && prop["errorMessage"]) {
          return prop["errorMessage"];
        } else if (prop["output"]) {
          return prop["output"];
        }
      } else if (props.mapResp && props.mapResp["properties"]) {
        let field = props.mapResp["properties"];
        let prop = getValue(field, finalProp);
        if (prop && prop["errorMessage"]) {
          return prop["errorMessage"];
        } else if (prop && prop["output"]) {
          return prop["output"];
        }
      }
    } else {
      let index = props.savedMappingArt.relatedEntityMappings?.findIndex(entity => entity["relatedEntityMappingId"] === props.entityMappingId);
      if (props.mapResp && props.mapResp.relatedEntityMappings && propName === "URI" && !isProperty && props.mapResp.relatedEntityMappings[index] && props.mapResp.relatedEntityMappings[index].uriExpression) {
        let prop = props.mapResp.relatedEntityMappings[index].uriExpression;
        if (prop && prop["errorMessage"]) {
          return prop["errorMessage"];
        } else if (prop && prop["output"]) {
          return prop["output"];
        }
      } else if (props.mapResp && props.mapResp.relatedEntityMappings && propName === "Context" && !isProperty && props.mapResp.relatedEntityMappings[index] && props.mapResp.relatedEntityMappings[index].expressionContext) {
        let prop = props.mapResp.relatedEntityMappings[index].expressionContext;
        if (prop && prop["output"]) {
          return <b>{prop["output"]}</b>;
        }
      } else if (index > -1 && props.mapResp && props.mapResp.relatedEntityMappings && props.mapResp.relatedEntityMappings[index].properties) {
        let field = props.mapResp.relatedEntityMappings[index].properties;
        let prop = getValue(field, finalProp);
        if (prop && prop["errorMessage"]) {
          return prop["errorMessage"];
        } else if (prop && prop["output"]) {
          return prop["output"];
        }
      }
    }
  };

  const getDataForValueField = (name, isProperty) => {
    return !checkFieldInErrors(name, isProperty) ? displayResp(name, isProperty) : "";
  };

  const getTextForTooltip = (name, isProperty) => {
    if (!checkFieldInErrors(name, isProperty)) {
      let item = displayResp(name, isProperty);
      if (Array.isArray(item)) {
        return item.join(", ");
      } else {
        return item;
      }
    }
  };

  //Response from server already is an array for multiple values, string for single value
  //truncation in case array values
  const getTextForValueField = (row, isProperty) => {
    let respFromServer = getDataForValueField(row.name, isProperty);
    //if array of values and more than 2 values
    if (respFromServer && Array.isArray(respFromServer) && respFromServer.length >= 2) {
      let xMore = <span className="moreVal">{"(" + (respFromServer.length - 2) + " more)"}</span>;
      let itemOne = respFromServer[0].length > 23 ? props.getInitialChars(respFromServer[0], 23, "...\n") : respFromServer[0] + "\n";
      let itemTwo = respFromServer[1].length > 23 ? props.getInitialChars(respFromServer[1], 23, "...\n") : respFromServer[1] + "\n";
      let fullItem = itemOne.concat(itemTwo);
      if (respFromServer.length === 2) {
        return <p>{fullItem}</p>;
      } else {
        return <p>{fullItem}{xMore}</p>;
      }
    } else {
      return props.getInitialChars(respFromServer, 23, "...");
    }
  };

  //simulate a click event to destroy both dropdown and select on option select
  const simulateMouseClick = (element) => {
    if (element) {
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
    }
  };

  const sourceMenu = (
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
      indentList={sourceIndentForDropDown}
      modelling={false} />
  );

  const sourceDropdown = (row) => {
    if (!row.isProperty) {
      // Context and URI version
      return (

        <Dropdown className="ms-2" as={ButtonGroup} autoClose="outside"
          disabled={!props.canReadWrite}>
          <Dropdown.Toggle id="functionIcon" variant="outline-light" className={styles.sourceDrop} disabled={!props.canReadWrite}
            size="sm">
            <HCTooltip id="source-field-tooltip" text={props.canReadWrite && "Source Field"} placement="bottom">
              <i id="listIcon" data-testid={`${props.entityTypeTitle}-${row.name.split("/").pop()}-listIcon1`}>
                <FontAwesomeIcon
                  icon={faList}
                  size="lg"
                  data-testid={`${props.entityTypeTitle}-${row.name.split("/").pop()}-listIcon`}
                  className={props.canReadWrite ? styles.listIcon : styles.disabledListIcon}
                  onClick={(e) => handleSourceList(row)}
                />
              </i>
            </HCTooltip>
          </Dropdown.Toggle>
          <Dropdown.Menu className="p-0 m-0 border-0 bg-transparent rounded-0">
            <Dropdown.Item className={styles.dropdownMenuItem}>
              {sourceMenu}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    } else {
      // Property version (different testid)
      // TODO refactor tests to allow consistent testid values across source menus
      return (
        <Dropdown className="ms-2" as={ButtonGroup} autoClose="outside"
          disabled={!props.canReadWrite}>
          <Dropdown.Toggle id="functionIcon" variant="outline-light" className={styles.sourceDrop} disabled={!props.canReadWrite}
            size="sm">
            <HCTooltip id="source-field-tooltip" text={props.canReadWrite && "Source Field"} placement="bottom">
              <i id="listIcon" data-testid={`${row.name.split("/").pop()}-listIcon1`}>
                <FontAwesomeIcon
                  icon={faList}
                  size="lg"
                  data-testid={`${row.name.split("/").pop()}-listIcon`}
                  className={props.canReadWrite ? styles.listIcon : styles.disabledListIcon}
                  onClick={(e) => handleSourceList(row)}
                />
              </i>
            </HCTooltip>
          </Dropdown.Toggle>
          <Dropdown.Menu className="p-0 m-0 border-0 bg-transparent rounded-0">
            <Dropdown.Item className={styles.dropdownMenuItem}>
              {sourceMenu}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    }
  };

  const functionMenu = (
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

  const functionDropdown = (row) => {
    return (
      <Dropdown className="ms-2" as={ButtonGroup} autoClose="outside"
        onToggle={(show) => {
          show && handleFunctionsList(row.name);
        }}
        disabled={!props.canReadWrite}>

        <Dropdown.Toggle id="functionIcon"
          data-testid={`${row.name.split("/").pop()}-${row.key}-functionIcon`}
          className={styles.functionIcon}
          disabled={!props.canReadWrite}
          size="sm"
          variant="outline-light">
          <HCTooltip id="function-tooltip" text={props.canReadWrite && "Function"} placement="bottom">
            <span>
              fx
            </span>
          </HCTooltip>
        </Dropdown.Toggle>

        <Dropdown.Menu className="p-0 m-0 border-0 bg-transparent rounded-0">
          <Dropdown.Item className={styles.dropdownMenuItem}>
            {functionMenu}
          </Dropdown.Item>
        </Dropdown.Menu>

      </Dropdown>
    );
  };

  const refMenu = (
    <DropDownWithSearch
      displayMenu={displayFuncMenu}
      setDisplayMenu={setDisplayRefMenu}
      setDisplaySelectList={setDisplayRefList}
      displaySelectList={displayRefList}
      itemValue={refValue}
      onItemSelect={onRefSelect}
      srcData={refPropListForDropDown}
      propName={propName}
      handleDropdownMenu={handleRefList}
    />
  );

  const refDropdown = (row) => {
    return (
      <Dropdown className="ms-2" as={ButtonGroup} autoClose="outside"
        disabled={true}>

        <Dropdown.Toggle id="functionIcon" className={styles.refDrop} disabled={!props.canReadWrite}
          size="sm" variant="outline-light">
          <HCTooltip id="reference-tooltip" text={props.canReadWrite && "Reference"} placement="bottom">
            <i id="refIcon" data-testid={`${props.entityTypeTitle}-${row.name.split("/").pop()}-refIcon1`}>
              <FontAwesomeIcon
                icon={faTerminal}
                size="lg"
                data-testid={`${props.entityTypeTitle}-${row.name.split("/").pop()}-refIcon`}
                className={props.canReadWrite ? styles.refIcon : styles.disabledRefIcon}
                onClick={(e) => handleRefList(row.name)}
              />
            </i>
          </HCTooltip>
        </Dropdown.Toggle>

        <Dropdown.Menu className="p-0 m-0 border-0 bg-transparent rounded-0">
          <Dropdown.Item className={styles.dropdownMenuItem}>
            {refMenu}
          </Dropdown.Item>
        </Dropdown.Menu>

      </Dropdown>
    );
  };

  const relatedEntitiesFilterOptions = props.relatedEntityTypeProperties?.filter(entity => {
    let entityTitle = props.isRelatedEntity ? props.entityTypeTitle.substring(0, props.entityTypeTitle.indexOf(" ")) : props.entityTypeTitle;
    let entityIdSections = entity["entityMappingId"].split(":");
    let entityId = entityIdSections.length > 2 ? /([^.]+)/.exec(entityIdSections[entityIdSections.length - 2])![1] : /([^.]+)/.exec(entityIdSections[0])![1];
    return (entityId && entityId === entityTitle);
  }).map((entity, i) => ({value: entity.entityLabel, label: entity.entityLabel}));

  const getSelectedOptionsDrp = (deleteKey?) => {
    let storageAux = storage?.curateEntityTable;
    let propertyArray = deleteKey ? deleteKey+"_"+props?.savedMappingArt?.name :props?.entityTypeTitle+"_"+props?.savedMappingArt?.name;

    if (deleteKey && storageAux?.selectedValues && storageAux.selectedValues[propertyArray]) {
      return storageAux.selectedValues[propertyArray];
    } else if (storageAux?.selectedValues && props?.savedMappingArt?.name && props?.entityTypeTitle &&
      storageAux.selectedValues[propertyArray] && storageAux.selectedValues[propertyArray].length > 0) {
      return storageAux.selectedValues[propertyArray];
    } else return "";
  };

  const saveSelectedOptionsDrp = (newlySelectedValues, removedEntity?, updateSelectedEntities?) => {
    let countRelations = (removedEntity?.entityMappingId?.split(".").length - 1);
    let mainObjectLabel;
    let filteredArray;

    if (deleteFromTable) {
      if (countRelations === 1) {
        mainObjectLabel = removedEntity?.entityMappingId.split(".")[0];
      } else if (countRelations > 1) {
        //Getting the main Entity Type from object to delete and the object father
        let mainRelation = removedEntity?.entityLabel;
        let mainRelationTitle = mainRelation.substring(mainRelation.indexOf("(") + 1, mainRelation.lastIndexOf(" "));
        let mainObject = updateSelectedEntities?.find(item => item.entityType === mainRelationTitle);
        mainObjectLabel = mainObject?.entityLabel;
      }
      //Get array to filter form session storage and save new data
      let arrayToFilter = getSelectedOptionsDrp(mainObjectLabel);
      filteredArray = arrayToFilter && arrayToFilter?.filter(item => item !== removedEntity?.entityLabel);
    }
    let keyArray = deleteFromTable ? mainObjectLabel+"_"+props?.savedMappingArt?.name : props?.entityTypeTitle+"_"+props?.savedMappingArt?.name;
    let valueToSave = deleteFromTable ? filteredArray : newlySelectedValues;

    let newEntityStorage;
    newEntityStorage = {
      ...storage, curateEntityTable: {
        ...storage.curateEntityTable,
        selectedValues: {...storage?.curateEntityTable?.selectedValues, [keyArray]: valueToSave},
      }
    };
    setViewSettings(newEntityStorage);
    setDeleteFromTable(false);
  };

  const handleOptionSelect = (selected) => {
    const newlySelectedValues = selected === "" && getSelectedOptionsDrp() !== "" ?
      getSelectedOptionsDrp(): selected.map(option => option.value);
    let selectedArray: any = [];
    let entityArray = props.relatedEntityTypeProperties;

    //check for removed values
    if (newlySelectedValues?.length < selectedOptions.length) {
      let removedItem = selectedOptions.filter(options => newlySelectedValues.indexOf(options) < 0);
      let index = entityArray.findIndex(object => object.entityLabel === removedItem[0]);
      let entityToRemove = entityArray[index];
      setRemovedEntity(entityToRemove);
      findReferringEntities(entityToRemove?.relatedEntityMappings);
      setPendingOptions(newlySelectedValues);
      setDeleteDialogVisible(true);
      setDeleteFromTable(true);
    } else if (newlySelectedValues?.length !== 0) {
      saveSelectedOptionsDrp(newlySelectedValues);
      //in the properties array, push the object that has the key which matches the value of the entity name selected
      newlySelectedValues.forEach(val => {
        let index = entityArray.findIndex(object => object.entityLabel === val);
        if (!props.relatedEntitiesSelected.includes((entityArray[index]))) {
          selectedArray.push(entityArray[index]);
        }
      });

      props.setRelatedEntitiesSelected(prevState => ([...prevState, ...selectedArray]));
      setSelectedOptions(newlySelectedValues);
      setFilterValues(newlySelectedValues);
    }
  };

  const MenuList = (selector, props) => (
    <div id={`${selector}-select-MenuList`} aria-label={"select-MenuList"}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const MultiValueRemove = props => {
    return (
      <SelectComponents.MultiValueRemove {...props}>
        <span aria-label="icon: close">
          <svg height="14" width="14" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>
        </span>
      </SelectComponents.MultiValueRemove>
    );
  };

  const MultiValueContainer = props => {
    return (
      <span aria-label={"multioption-container"} title={props.data.value}>
        <SelectComponents.MultiValueContainer {...props} />
      </span>
    );
  };

  const relatedEntitiesFilter = (
    <Select
      id={`${props.entityTypeTitle}-entities-filter-select-wrapper`}
      inputId={`${props.entityTypeTitle}-entities-filter-select`}
      components={{MultiValueContainer, MultiValueRemove, MenuList: internProps => MenuList(`${props.entityTypeTitle}-entities-filter`, internProps)}}
      placeholder="Select"
      aria-label={"entities-filter-select"}
      isMulti
      isClearable={false}
      value={filterValues.map(d => ({value: d, label: d}))}
      onChange={handleOptionSelect}
      isSearchable={false}
      options={relatedEntitiesFilterOptions}
      styles={{
        ...reactSelectThemeConfig,
        container: (provided, state) => ({
          ...provided,
          lineHeight: "21px"
        }),
        control: (provided, state) => ({
          ...provided,
          cursor: "default"
        }),
      }}
      formatOptionLabel={(option: { value, label }) => {
        return (
          <span aria-label={`${option.label}-option`} role={"option"}>
            {option.label}
          </span>
        );
      }}
    />
  );

  const expandTableIcon = (
    <a className={styles.expandTableIcon} onClick={() => toggleEntityTable()}>{tableCollapsed && entityProperties.length < 1 ? <ChevronRight /> : <ChevronDown />}</a>
  );

  const topRowDetails = (
    <div>
      <div className={styles.entityTopRow}>
        <div className={styles.entityTitle} aria-label={`${props.entityTypeTitle}-title`}>
          {expandTableIcon}<strong>{props.entityTypeTitle}</strong>
          {props.relatedMappings &&
            <>
              <img className={styles.arrayImage} src={DocIcon} alt={""} data-testid="relatedInfoIcon" onMouseEnter={handleShowDocPopover} onMouseLeave={() => setShowDocPopover(false)} />
              {relatedInfo}
            </>
          }
        </div>
        <div className={styles.entitySettingsLink}>
          <EntitySettings canReadWrite={props.canReadWrite} tooltipsData={props.tooltipsData} stepData={props.savedMappingArt} updateStep={props.updateStep} entityMappingId={props.entityMappingId} entityTitle={props.isRelatedEntity ? props.entityModel.info.title : props.entityTypeTitle} />
        </div>
        {props.isRelatedEntity ?
          <div className={styles.deleteEntityLink}>
            <XLg className={styles.deleteTableIcon} data-testid={props.entityTypeTitle + "-delete"} onClick={(e) => onDelete(props.relatedEntityTypeProperties[props.relatedEntityTypeProperties.findIndex(object => object["entityMappingId"] === props.entityMappingId)])} />
          </div> : ""
        }
      </div>
      {props.relatedMappings && props.relatedMappings.length > 0 ?
        <div className={styles.entityFilterContainer}>
          <div className={styles.mapRelatedEntitiesText}>Map related entities: </div>
          <div className={styles.entityFilter}>{relatedEntitiesFilter}</div>
        </div>
        :
        null
      }
    </div>
  );


  const toggleEntityTable = () => {
    setTableToggled(false);
    if (tableCollapsed) {
      if (!filterApplied) {
        setEntityProperties(props.entityTypeProperties);
      } else {
        setEntityProperties(filteredValues);
      }
      setTableCollapsed(false);
    } else {
      setEntityProperties([]);
      setTableCollapsed(true);
    }
    //saveSessionEntityNestedTable();
  };

  const findReferringEntities = (relatedMappings) => {
    let referringEntities: any = [];
    if (relatedMappings) {
      //find any related mappings to the removed entity that are currently also being mapped/displayed
      props.relatedEntitiesSelected.forEach(entity => {
        relatedMappings.forEach(ent => {
          if (ent["entityMappingId"] === entity["entityMappingId"]) {
            if (!referringEntities.includes(entity)) {
              referringEntities.push(entity);
            }
          }
        });
      });
      setEntitiesReferencing(referringEntities);
    } else {
      setEntitiesReferencing([]);
    }
  };

  const onOk = () => {
    props.deleteRelatedEntity(removedEntity);
    let updateSelectedEntities: any = props.relatedEntitiesSelected.filter(entity => entity["entityMappingId"] !== removedEntity["entityMappingId"]);
    props.setRelatedEntitiesSelected(updateSelectedEntities);
    setFilterValues(pendingOptions);
    setSelectedOptions(pendingOptions);
    setDeleteDialogVisible(false);
    deleteFromTable && saveSelectedOptionsDrp("", removedEntity, updateSelectedEntities);
  };

  const onCancel = () => {
    setDeleteDialogVisible(false);
    setDeleteFromTable(false);
  };

  const onDelete = (deletedEntity) => {
    setRemovedEntity(deletedEntity);
    findReferringEntities(deletedEntity.relatedEntityMappings);
    setDeleteDialogVisible(true);
    setDeleteFromTable(true);
  };

  const deleteConfirmation = <HCModal
    show={deleteDialogVisible}
    onHide={onCancel}
  >
    <Modal.Header className={"bb-none"}>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
    </Modal.Header>
    <Modal.Body className={"pt-0 pb-4"}>
      {entitiesReferencing.length > 0 ?
        <span aria-label={"entity-being-referenced-msg"} style={{fontSize: "16px"}}>The <strong>{removedEntity?.entityLabel}</strong> mapping is referenced by the <strong>{entitiesReferencing[0]?.entityLabel}</strong> mapping. Please delete the <strong>{entitiesReferencing[0]?.entityLabel}</strong> mapping first.</span>
        :
        <span aria-label={"confirm-deletion-msg"} style={{fontSize: "16px"}}>Are you sure you want to delete any mapping expressions associated with the <strong>{removedEntity?.entityLabel}</strong> entity?</span>
      }
      <div className={"d-flex justify-content-center pt-4 pb-2"}>
        {entitiesReferencing.length > 0 ? null : <HCButton className={"me-2"} variant="outline-light" aria-label={"No"} onClick={onCancel}>
          {"No"}
        </HCButton>}
        <HCButton aria-label={entitiesReferencing.length > 0 ? "OK" : "Yes"} variant="primary" type="submit" onClick={() => { entitiesReferencing.length > 0 ? onCancel() : onOk(); }}>
          {entitiesReferencing.length > 0 ? "OK" : "Yes"}
        </HCButton>
      </div>
    </Modal.Body>
  </HCModal>;

  const entityColumns = [
    {
      text: "Name",
      headerFormatter: () => <div>
        <span data-testid="entityTableName" className={styles.nameHeaderText}>
          Name
        </span>
        <HCPopoverSearch
          popoverId={"popover-filter"}
          searchIconId={`filterIcon-${props.entityTypeTitle}-entity`}
          inputId={`searchInput-entity`}
          inputPlaceholder={`Search name`}
          inputValue={searchedKey}
          resetButtonId={`resetSearch-entity`}
          onReset={() => handleSearchReset()}
          searchButtonId={`submitSearch-entity`}
          onSearch={(value) => filterByName(value)}
        />
      </div>,
      dataField: "name",
      key: "name",
      width: "25%",
      attrs: (text, row, index) => {
        if (row.key <= 100 && index === 0) {
          return {colSpan: `4`};
        } else {
          return {colSpan: `1`};
        }
      },
      formatter: (text, row, index, extraData) => {
        let renderText = text;
        let textToSearchInto = row.key > 100 ? text.split("/").pop() : text;
        let valueToDisplay = textToSearchInto;

        if (row.name === "more") {
          return (
            <a className={styles.rowLink} data-testid="moreLink" onClick={() => handleMoreClick(row)}>
              more
            </a>
          );
        } else if (row.name === "less") {
          return (
            <a className={styles.rowLink} data-testid="lessLink" onClick={() => handleLessClick(row)}>
              less
            </a>
          );
        } else {
          let renderOutput = getRenderOutput(textToSearchInto, valueToDisplay, "name", searchedEntityColumn, searchEntityText, row.key);
          renderText =
            <span>
              {props.initialEntityKeys.includes(row.key) || extraData ?
                row.children ?
                  <span onClick={() => toggleRowExpanded(row, "", "key")} className={styles.tableExpandIcon}>
                    {!extraData.rowExpandedKeys?.includes(row.key) ?
                      <span><ChevronRight /></span>
                      : <span><ChevronDown /></span>
                    }
                  </span>
                  : <span className={styles.noTableExpandIcon}>
                    {null}
                  </span>
                : null
              }
              <span data-testid={`${props.entityTypeTitle}-${valueToDisplay}-name`}>
                {row.relatedEntityType ?
                  <i>{renderOutput}</i>
                  : renderOutput
                }
              </span>
              {row.key > 100 && row.type.includes("[ ]") &&
                <span>
                  <HCTooltip text="Multiple" id="multiple-source-tooltip" placement="top">
                    <img className={styles.arrayImage} src={arrayIcon} alt={""} data-testid={"multiple-" + text} />
                  </HCTooltip>
                </span>
              }
              {row.key > 100 && row.children &&
                <span>
                  <HCTooltip text="Structured Type" id="structure-type-tooltip" placement="top">
                    <i><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup} data-testid={"structured-" + text} /></i>
                  </HCTooltip>
                </span>
              }
              {row.key > 100 && row.name === "Context" && !row.isProperty &&
                <span>
                  &nbsp;<OverlayTrigger placement="right" overlay={contextHelp} rootClose trigger="click">
                    <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircle} />
                  </OverlayTrigger>
                </span>
              }
              {row.key > 100 && row.name === "URI" && !row.isProperty &&
                <span>
                  &nbsp;<OverlayTrigger placement="right" overlay={uriHelp} rootClose trigger="click">
                    <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircle} />
                  </OverlayTrigger>
                </span>
              }
            </span>;
          return renderText;
        }
      },
      formatExtraData: {rowExpandedKeys, filterApplied}
    },
    {
      text: "Type",
      headerFormatter: () => <span data-testid="entityTableType">Type</span>,
      dataField: "type",
      key: "type",
      width: "16%",
      attrs: (text, row, index) => {
        if (row.key <= 100 && index === 0) {
          return {hidden: true};
        } else {
          return {colSpan: `1`};
        }
      },
      formatter: (text, row, index, extraData) => {
        let renderText = text;
        const expanded = text.startsWith("parent-");
        const dType = expanded ? text.slice(text.indexOf("-") + 1) : text;
        if (row.relatedEntityType) { //if property is a relationship
          let relatedEntityName = row.relatedEntityType.split("/").pop();
          let completeRelationshipTooltip = ModelingTooltips.completeRelationship(relatedEntityName, props.entityTypeTitle);
          let incompleteRelationshipTooltip = ModelingTooltips.relationshipNoForeignKey(relatedEntityName, props.entityTypeTitle);
          renderText =
            <div className={row.joinPropertyName !== "" || !expanded ? styles.renderContainer : styles.noKeyContainer}>
              {expanded && row.joinPropertyName !== "" ?
                //if multiple and has foreign key, show context help
                <div className={styles.typeContainer} >
                  <div className={styles.typeContextContainer}>
                    <span className={styles.typeContext}>Context</span>&nbsp;
                    <OverlayTrigger placement="right" overlay={contextHelp} rootClose trigger="click">
                      <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircle} />
                    </OverlayTrigger>
                    <p className={styles.typeText}>{dType}</p>
                  </div>
                </div>
                :
                <span className={styles.textTypeContainer}>
                  {row.joinPropertyName !== "" ?
                    renderText //show data type if not multiple but has foreign key
                    :
                    renderText = relatedEntityName //if no foreign key
                  }
                </span>
              }
              {row.joinPropertyName !== "" ?
                //icons if relationship is complete with a foreign key
                <div className={styles.dualIconsContainer}>
                  <HCTooltip className={styles.relationshipTooltip} text={completeRelationshipTooltip} data-testid={"relationship-tooltip"} id={"relationshipTooltip-" + row.name} placement="bottom">
                    <div className={styles.modeledRelationshipIcon} data-testid={"relationship-" + row.name} />
                  </HCTooltip>
                  <HCTooltip text={ModelingTooltips.foreignKeyModeling(relatedEntityName, row.joinPropertyName, props.entityTypeTitle)} id={"tooltip-" + row.name} placement="bottom">
                    <i>
                      <FontAwesomeIcon className={styles.foreignKeyIcon} icon={faKey} data-testid={"foreign-" + row.name} />
                    </i>
                  </HCTooltip>
                </div>
                :
                //icon if relationship but no foreign key
                <div className={styles.singleIconContainer}>
                  <HCTooltip className={styles.relationshipTooltip} text={incompleteRelationshipTooltip} data-testid={"relationship-tooltip"} id={"relationshipTooltip-" + row.name} placement="bottom">
                    <span className={expanded ? styles.modeledRelationshipIcon : styles.modeledRelationshipIconSingle} data-testid={"relationship-" + row.name} />
                  </HCTooltip>
                </div>
              }
            </div>;
        }
        return <div className={styles.typeContainer}>
          {expanded && row.joinPropertyName !== "" && !row.joinPropertyType && !row.relatedEntityType ? <div className={styles.typeContextContainer}><span className={styles.typeContext}>Context</span>&nbsp;
            <OverlayTrigger placement="right" overlay={contextHelp} rootClose trigger="click">
              <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircleContext} />
            </OverlayTrigger>
            <p className={styles.typeText}>{dType}</p></div>
            : renderText}
        </div>;
      }
    },
    {
      text: "XPath Expression",
      headerFormatter: () => <span>XPath Expression
        <img className={styles.arrayImage} src={DocIcon} alt={""} data-testid="XPathInfoIcon" onMouseEnter={handleShowDocLinksPopover} onMouseLeave={() => setShowDocLinksPopover(false)} />
        {xPathDocLinks}
      </span>,
      dataField: "key",
      key: "key",
      width: "40%",
      className: "overflow-visible",
      attrs: (text, row, index) => {
        if (row.key <= 100 && index === 0) {
          return {hidden: true};
        } else {
          return {colSpan: `1`};
        }
      },
      formatter: (text, row, index, extraData) => {
        if (row.relatedEntityType && row.joinPropertyName === "") {
          return null;
        } else {
          if (row.key > 100 && row.name !== "more" && row.name !== "less") {
            if (row.name === "Context" && !row.isProperty) {
              return <div className={!directRelation ? styles.relatedMapExpParentContainer : styles.mapExpParentContainer}><div className={styles.mapExpressionContainer}>
                <FormControl as="textarea"
                  id={"mapexpression" + row.name.split("/").pop()}
                  data-testid={`${props.entityTypeTitle}-` + row.name.split("/").pop() + `-mapexpression`}
                  style={mapExpressionStyle(row.name, false)}
                  onClick={(e) => handleClickInTextArea(e)}
                  value={expressionContext}
                  onChange={(e) => handleExpressionContext(row, e)}
                  onBlur={handleExpSubmit}
                  disabled={!props.canReadWrite}
                  className={styles.genericTextArea}
                />
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{sourceDropdown(row)}</span>
              </div>
              {checkFieldInErrors(row.name, false) ? <div id="errorInExp" data-testid={row.name + "-expErr"} className={styles.validationErrors}>{displayResp(row.name, false)}</div> : ""}</div>;
            } else if (row.name === "URI" && !row.isProperty) {
              return <div className={props.isRelatedEntity && !directRelation ? styles.relatedMapExpParentContainer : styles.mapExpParentContainer}><div className={styles.mapExpressionContainer}>
                <FormControl as="textarea"
                  id={"mapexpression" + row.name.split("/").pop()}
                  data-testid={`${props.entityTypeTitle}-` + row.name.split("/").pop() + `-mapexpression`}
                  style={mapExpressionStyle(row.name, false)}
                  onClick={handleClickInTextArea}
                  value={uriExpression}
                  onChange={(e) => handleUri(row, e)}
                  onBlur={handleExpSubmit}
                  disabled={!props.canReadWrite}
                  className={styles.genericTextArea} />
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{sourceDropdown(row)}</span>
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{functionDropdown(row)}</span>
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{refDropdown(row)}</span>
              </div>
              {checkFieldInErrors(row.name, false) ? <div id="errorInExp" data-testid={row.name + "-expErr"} className={styles.validationErrors}>{displayResp(row.name, false)}</div> : ""}</div>;
            } else {
              return <div className={styles.mapExpParentContainer}><div className={styles.mapExpressionContainer}>
                <FormControl as="textarea"
                  id={"mapexpression" + row.name.split("/").pop()}
                  data-testid={row.name.split("/").pop() + "-mapexpression"}
                  style={mapExpressionStyle(row.name, true)}
                  onClick={handleClickInTextArea}
                  value={mapExp[row.name]}
                  onChange={(e) => handleMapExp(row, e)}
                  onBlur={handleExpSubmit}
                  disabled={!props.canReadWrite}
                  className={styles.genericTextArea}
                />
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{sourceDropdown(row)}</span>
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{functionDropdown(row)}</span>
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{refDropdown(row)}</span>
              </div>
              {checkFieldInErrors(row.name, true) ? <div id="errorInExp" data-testid={row.name + "-expErr"} className={styles.validationErrors}>{displayResp(row.name, true)}</div> : ""}</div>;
            }
          } else if (row.name !== "more" && row.name !== "less") {
            return null;
          }
        }
      }
    },
    {
      text: "Value",
      dataField: "value",
      key: "value",
      width: "20%",
      attrs: (text, row, index) => {
        if (row.key <= 100 && index === 0) {
          return {hidden: true};
        } else {
          return {colSpan: `1`};
        }
      },
      formatter: (text, row, index, extraData) => {
        if (row.key > 100 && row.name !== "more" && row.name !== "less") {
          return <div data-testid={`${props.entityTypeTitle}-` + row.name.split("/").pop() + "-value"} className={styles.mapValue}>
            <HCTooltip id={`${props.entityTypeTitle}-${row.name.split("/").pop()}-value-tooltip`} placement="top" text={getTextForTooltip(row.name, row.isProperty)}><span>{getTextForValueField(row, row.isProperty)}</span></HCTooltip>
          </div>;
        } else if (row.name !== "more" && row.name !== "less") {
          return null;
        }
      }
    }
  ];

  const lowerEntityColumns = [
    {
      text: "Name",
      headerFormatter: () => <span data-testid="entityTableName" className={styles.nameHeaderText}>Name</span>,
      dataField: "name",
      key: "name",
      width: "25%",
      attrs: (text, row, index) => {
        if (row.key <= 100 && index === 0) {
          return {colSpan: `4`};
        } else {
          return {colSpan: `1`};
        }
      },
      formatter: (text, row, index, extraData) => {
        let renderText = text;
        let textToSearchInto = row.key > 100 ? text.split("/").pop() : text;
        let valueToDisplay = textToSearchInto;

        if (row.name === "more") {
          return (
            <a className={styles.rowLink} data-testid="moreLink" onClick={() => handleMoreClick(row)}>
              more
            </a>
          );
        } else if (row.name === "less") {
          return (
            <a className={styles.rowLink} data-testid="lessLink" onClick={() => handleLessClick(row)}>
              less
            </a>
          );
        } else {
          let renderOutput = getRenderOutput(textToSearchInto, valueToDisplay, "name", searchedEntityColumn, searchEntityText, row.key);
          renderText =
            <span>{props.initialEntityKeys.includes(row.key) || extraData ? row.children ? <span onClick={() => toggleRowExpanded(row, "", "key")} className={styles.tableExpandIcon}>{!extraData.rowExpandedKeys?.includes(row.key) ? <span><ChevronRight /></span> : <span><ChevronDown /></span>} </span> : <span className={styles.noTableExpandIcon}>{null}</span> : null}<span data-testid={`${props.entityTypeTitle}-${valueToDisplay}-name`}>{row.relatedEntityType ? <i>{renderOutput}</i> : renderOutput}</span>
              {row.key > 100 && row.type.includes("[ ]") &&
                <span>
                  <HCTooltip text="Multiple" id="multiple-source-tooltip" placement="top">
                    <img className={styles.arrayImage} src={arrayIcon} alt={""} data-testid={"multiple-" + text} />
                  </HCTooltip>
                </span>
              }
              {row.key > 100 && row.children &&
                <span>
                  <HCTooltip text="Structured Type" id="structure-type-tooltip" placement="top">
                    <i><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup} data-testid={"structured-" + text} /></i>
                  </HCTooltip>
                </span>
              }
              {row.key > 100 && row.name === "Context" && !row.isProperty &&
                <span>
                  &nbsp;<OverlayTrigger placement="right" overlay={contextHelp} rootClose trigger="click">
                    <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircle} />
                  </OverlayTrigger>
                </span>
              }
              {row.key > 100 && row.name === "URI" && !row.isProperty &&
                <span>
                  &nbsp;<OverlayTrigger placement="right" overlay={uriHelp} rootClose trigger="click">
                    <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircle} />
                  </OverlayTrigger>
                </span>
              }
            </span>;
          return renderText;
        }
      },
      formatExtraData: {rowExpandedKeys, filterApplied}
    },
    {
      text: "Type",
      headerFormatter: () => <span data-testid="entityTableType">Type</span>,
      dataField: "type",
      key: "type",
      width: "16%",
      attrs: (text, row, index) => {
        if (row.key <= 100 && index === 0) {
          return {hidden: true};
        } else {
          return {colSpan: `1`};
        }
      },
      formatter: (text, row, index, extraData) => {
        let renderText = text;
        const expanded = text.startsWith("parent-");
        const dType = expanded ? text.slice(text.indexOf("-") + 1) : text;
        if (row.relatedEntityType) { //if property is a relationship
          let relatedEntityName = row.relatedEntityType.split("/").pop();
          let completeRelationshipTooltip = ModelingTooltips.completeRelationship(relatedEntityName, props.entityTypeTitle);
          let incompleteRelationshipTooltip = ModelingTooltips.relationshipNoForeignKey(relatedEntityName, props.entityTypeTitle);
          renderText =
            <div className={row.joinPropertyName !== "" || !expanded ? styles.renderContainer : styles.noKeyContainer}>
              {expanded && row.joinPropertyName !== "" ?
                //if multiple and has foreign key, show context help
                <div className={styles.typeContainer} >
                  <div className={styles.typeContextContainer}>
                    <span className={styles.typeContext}>Context</span>&nbsp;
                    <OverlayTrigger placement="right" overlay={contextHelp} rootClose trigger="click">
                      <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircle} />
                    </OverlayTrigger>
                    <p className={styles.typeText}>{dType}</p>
                  </div>
                </div>
                :
                <span className={styles.textTypeContainer}>
                  {row.joinPropertyName !== "" ?
                    renderText //show data type if not multiple but has foreign key
                    :
                    renderText = relatedEntityName //if no foreign key
                  }
                </span>
              }
              {row.joinPropertyName !== "" ?
                //icons if relationship is complete with a foreign key
                <div className={styles.dualIconsContainer}>
                  <HCTooltip className={styles.relationshipTooltip} text={completeRelationshipTooltip} data-testid={"relationship-tooltip"} id={"relationshipTooltip-" + row.name} placement="bottom">
                    <div className={styles.modeledRelationshipIcon} data-testid={"relationship-" + row.name} />
                  </HCTooltip>
                  <HCTooltip text={ModelingTooltips.foreignKeyModeling(relatedEntityName, row.joinPropertyName, props.entityTypeTitle)} id={"tooltip-" + row.name} placement="bottom">
                    <i>
                      <FontAwesomeIcon className={styles.foreignKeyIcon} icon={faKey} data-testid={"foreign-" + row.name} />
                    </i>
                  </HCTooltip>
                </div>
                :
                //icon if relationship but no foreign key
                <div className={styles.singleIconContainer}>
                  <HCTooltip className={styles.relationshipTooltip} text={incompleteRelationshipTooltip} data-testid={"relationship-tooltip"} id={"relationshipTooltip-" + row.name} placement="bottom">
                    <span className={expanded ? styles.modeledRelationshipIcon : styles.modeledRelationshipIconSingle} data-testid={"relationship-" + row.name} />
                  </HCTooltip>
                </div>
              }
            </div>;
        }
        return <div className={styles.typeContainer}>
          {expanded && row.joinPropertyName !== "" && !row.joinPropertyType && !row.relatedEntityType ? <div className={styles.typeContextContainer}><span className={styles.typeContext}>Context</span>&nbsp;
            <OverlayTrigger placement="right" overlay={contextHelp} rootClose trigger="click">
              <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircleContext} />
            </OverlayTrigger>
            <p className={styles.typeText}>{dType}</p></div>
            : renderText}
        </div>;
      }
    },
    {
      text: "XPath Expression",
      headerFormatter: () => <span>XPath Expression
        <img className={styles.arrayImage} src={DocIcon} alt={""} data-testid="XPathInfoIcon" onMouseEnter={handleShowDocLinksPopover} onMouseLeave={() => setShowDocLinksPopover(false)} />
        {xPathDocLinks}
      </span>,
      dataField: "key",
      key: "key",
      width: "40%",
      className: "overflow-visible",
      attrs: (text, row, index) => {
        if (row.key <= 100 && index === 0) {
          return {hidden: true};
        } else {
          return {colSpan: `1`};
        }
      },
      formatter: (text, row, index, extraData) => {
        if (row.relatedEntityType && row.joinPropertyName === "") {
          return null;
        } else {
          if (row.key > 100 && row.name !== "more" && row.name !== "less") {
            if (row.name === "Context" && !row.isProperty) {
              return <div className={!directRelation ? styles.relatedMapExpParentContainer : styles.mapExpParentContainer}><div className={styles.mapExpressionContainer}>
                <FormControl as="textarea"
                  id={"mapexpression" + row.name.split("/").pop()}
                  data-testid={`${props.entityTypeTitle}-` + row.name.split("/").pop() + `-mapexpression`}
                  style={mapExpressionStyle(row.name, false)}
                  onClick={handleClickInTextArea}
                  value={expressionContext}
                  onChange={(e) => handleExpressionContext(row, e)}
                  onBlur={handleExpSubmit}
                  disabled={!props.canReadWrite}
                  className={styles.genericTextArea}
                />
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{sourceDropdown(row)}</span>
              </div>
              {checkFieldInErrors(row.name, false) ? <div id="errorInExp" data-testid={row.name + "-expErr"} className={styles.validationErrors}>{displayResp(row.name, false)}</div> : ""}</div>;
            } else if (row.name === "URI" && !row.isProperty) {
              return <div className={props.isRelatedEntity && !directRelation ? styles.relatedMapExpParentContainer : styles.mapExpParentContainer}><div className={styles.mapExpressionContainer}>
                <FormControl as="textarea"
                  id={"mapexpression" + row.name.split("/").pop()}
                  data-testid={`${props.entityTypeTitle}-` + row.name.split("/").pop() + `-mapexpression`}
                  style={mapExpressionStyle(row.name, false)}
                  onClick={handleClickInTextArea}
                  value={uriExpression}
                  onChange={(e) => handleUri(row, e)}
                  onBlur={handleExpSubmit}
                  disabled={!props.canReadWrite}
                  className={styles.genericTextArea} />
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{sourceDropdown(row)}</span>
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{functionDropdown(row)}</span>
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{refDropdown(row)}</span>
              </div>
              {checkFieldInErrors(row.name, false) ? <div id="errorInExp" data-testid={row.name + "-expErr"} className={styles.validationErrors}>{displayResp(row.name, false)}</div> : ""}</div>;
            } else {
              return <div className={styles.mapExpParentContainer}><div className={styles.mapExpressionContainer}>
                <FormControl as="textarea"
                  id={"mapexpression" + row.name.split("/").pop()}
                  data-testid={row.name.split("/").pop() + "-mapexpression"}
                  style={mapExpressionStyle(row.name, true)}
                  onClick={handleClickInTextArea}
                  value={mapExp[row.name]}
                  onChange={(e) => handleMapExp(row, e)}
                  onBlur={handleExpSubmit}
                  disabled={!props.canReadWrite}
                  className={styles.genericTextArea}
                />
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{sourceDropdown(row)}</span>
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{functionDropdown(row)}</span>
                <span data-cy="dropdown-button" onClick={e => e.stopPropagation()}>{refDropdown(row)}</span>
              </div>
              {checkFieldInErrors(row.name, true) ? <div id="errorInExp" data-testid={row.name + "-expErr"} className={styles.validationErrors}>{displayResp(row.name, true)}</div> : ""}</div>;
            }
          } else if (row.name !== "more" && row.name !== "less") {
            return null;
          }
        }
      }
    },
    {
      text: "Value",
      dataField: "value",
      key: "value",
      width: "20%",
      attrs: (text, row, index) => {
        if (row.key <= 100 && index === 0) {
          return {hidden: true};
        } else {
          return {colSpan: `1`};
        }
      },
      formatter: (text, row, index, extraData) => {
        if (row.key > 100 && row.name !== "more" && row.name !== "less") {
          return <div data-testid={`${props.entityTypeTitle}-` + row.name.split("/").pop() + "-value"} className={styles.mapValue}>
            <HCTooltip id={`${props.entityTypeTitle}-${row.name.split("/").pop()}-value-tooltip`} placement="top" text={getTextForTooltip(row.name, row.isProperty)}><span>{getTextForValueField(row, row.isProperty)}</span></HCTooltip>
          </div>;
        } else if (row.name !== "more" && row.name !== "less") {
          return null;
        }
      }
    }
  ];

  const tableCSS = css({
    minWidth: "1000px",
    "& thead > tr > th": {
      backgroundColor: props.tableColor,
      paddingTop: "12px",
      paddingBottom: "12px",
      borderColor: themeColors.light
    },
    "& tbody > tr > td": {
      backgroundColor: props.tableColor,
      verticalAlign: "top",
      borderColor: themeColors.light,
      lineHeight: "2px"
    },
    "& tbody > tr > .ant-table-column-has-actions": {
      backgroundColor: props.tableColor,
      verticalAlign: "top",
      lineHeight: "2px"
    },
    ".hc-table_row": {
      backgroundColor: props.tableColor
    },
    ".hc-table_header": {
      backgroundColor: props.tableColor
    }
  });

  return (props.entityLoaded ? (props.entityMappingId || !props.isRelatedEntity) ? (<div id={props.isRelatedEntity ? "entityTableContainer" : "rootTableContainer"} data-testid={props.entityTypeTitle.split(" ")[0].toLowerCase() + "-table"}>
    <div className={styles.tableContainer} id={entityProperties.length > 0 ? "upperTable" : "upperTableEmptyProps"} ref={props.setScrollRef(`${props.entityMappingId}-ref`)}>
      <HCTable
        pagination={false}
        className={tableCSS}
        rowClassName={"mappingSettingRow"}
        onExpand={(expanded, record) => toggleRowExpanded(expanded, record, "key")}
        expandedRowKeys={props.entityExpandedKeys}
        columns={getColumnsForEntityTable("upper")}
        data={filterApplied ? [{key: props.firstRowTableKeyIndex, name: topRowDetails, type: "", parentVal: ""}] : entityProperties.length > 1 ? props.isRelatedEntity ? [{key: props.firstRowTableKeyIndex, name: topRowDetails, type: "", parentVal: ""}, entityProperties[0], entityProperties[1]] : [{key: props.firstRowTableKeyIndex, name: topRowDetails, type: "", parentVal: ""}, entityProperties[0]] : [{key: props.firstRowTableKeyIndex, name: topRowDetails, type: "", parentVal: ""}]}
        rowKey={"key"}
        keyUtil={"key"}
        showHeader={!props.isRelatedEntity}
      />
    </div>
    {entityProperties.length ?
      <div className={styles.tableContainer} id="lowerTable">
        <HCTable
          pagination={{
            size: "small",
            hideOnSinglePage: entityProperties.length <= 20,
            showSizeChanger: true,
            pageSizeOptions: paginationMapping.pageSizeOptions,
            defaultCurrent: paginationMapping.start,
            current: getCurrentPageMainTable() ? getCurrentPageMainTable() : paginationMapping.pageNumber,
            pageSize: getCurrentSizeMainTable() ? getCurrentSizeMainTable() : paginationMapping.pageSize,
            onChange: (e, a) => { props.executeScroll(`${props.entityMappingId}-ref`); saveSessionPageSizeMainTable(e, a); },
            onShowSizeChange: (e, a) => { props.executeScroll(`${props.entityMappingId}-ref`); saveSessionPageSizeMainTable(a, e); },
          }}
          className={tableCSS}
          onExpand={(expanded, record) => toggleRowExpanded(expanded, record, "key")}
          expandedRowKeys={props.entityExpandedKeys}
          childrenIndent={true}
          subTableHeader={true}
          baseIndent={70}
          columns={getColumnsForEntityTable("lower")}
          data={filterApplied ? filteredEntityProperties : props.isRelatedEntity ? entityProperties.slice(2, entityProperties.length) : entityProperties.slice(1, entityProperties.length)}
          rowKey={"key"}
          keyUtil={"key"}
          showHeader={false}
          nestedParams={{headerColumns: entityColumns, iconCellList: ["Name", "Type", "XPath Expression", "Value"], state: [props.entityExpandedKeys, props.setEntityExpandedKeys]}}
          component={"entity-map-table"}
        />
      </div>
      : null
    }
    {deleteConfirmation}
  </div>) : null : !props.isRelatedEntity
    ? <div className={styles.spinnerContainer}>
      <Spinner animation="border" variant="primary" data-testid="spinner" />
    </div>
    : null);
};

export default EntityMapTable;
