import React, {useState, useEffect, CSSProperties} from "react";
import styles from "./entity-map-table.module.scss";
import "./entity-map-table.scss";
import {Icon, Table, Popover, Input, Select, Dropdown} from "antd";
import {MLButton, MLTooltip} from "@marklogic/design-system";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import DropDownWithSearch from "../../../common/dropdown-with-search/dropdownWithSearch";
import Highlighter from "react-highlight-words";
import {faList, faSearch} from "@fortawesome/free-solid-svg-icons";
import {getMappingFunctions} from "../../../../api/mapping";
import EntitySettings from "../entity-settings/entity-settings";
import {css} from "@emotion/css";
import {faKey, faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import arrayIcon from "../../../../assets/icon_array.png";

interface Props {
  mapResp: any;
  mapData: any;
  setMapResp: any;
  dummyNode: any;
  flatArray: any;
  saveMapping: any;
  sourceContext: any;
  setSourceContext: any;
  mapExpTouched: any;
  setMapExpTouched: any;
  handleExpSubmit: any;
  getDataForValueField: any;
  getTextForTooltip: any;
  getTextForValueField: any;
  canReadWrite: any;
  entityTypeTitle: any;
  checkedEntityColumns: any;
  entityTypeProperties: any;
  entityMappingId: any;
  relatedMappings: any;
  entityExpandedKeys: any;
  setEntityExpandedKeys: any;
  allEntityKeys: any;
  setExpandedEntityFlag: any;
  initialEntityKeys: any;
  tooltipsData: any;
  updateStep?: any;
  relatedEntityTypeProperties: any;
  relatedEntitiesSelected: any;
  setRelatedEntitiesSelected: any;
  setRemovedEntities: any;
  isRelatedEntity: boolean;
  tableColor: any;
  firstRowTableKeyIndex: any;
}

const EntityMapTable: React.FC<Props> = (props) => {
  const [mapExp, setMapExp] = useState({});

  //Dummy ref node to simulate a click event
  const dummyNode = props.dummyNode;

  const {Option} = Select;
  const {TextArea} = Input;
  let searchInput: any;
  let tempMapExp: any = {};
  let mapExpUI: any = {};
  let tempSourceContext: any = {};

  //Text for Context Icon
  const contextHelp = <div className={styles.contextHelp}>An element in the source data from which to derive the values of this entity property's children. Both the source data element and the entity property must be of the same type (Object or an array of Object instances). Use a slash (&quot;/&quot;) if the source model is flat.</div>;

  //For storing  mapping functions
  const [mapFunctions, setMapFunctions] = useState<any>([]);

  //For Entity table
  const [searchEntityText, setSearchEntityText] = useState("");
  const [searchedEntityColumn, setSearchedEntityColumn] = useState("");

  //For Dropdown menu
  const [propName, setPropName] = useState("");
  const [propListForDropDown, setPropListForDropDown] = useState<any>([]);
  const [displayFuncMenu, setDisplayFuncMenu] = useState(false);
  const [displaySelectList, setDisplaySelectList] = useState(false);
  const [functionValue, setFunctionValue] = useState("");
  const [caretPosition, setCaretPosition] = useState(0);

  const [selectedRow, setSelectedRow] = useState<any>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [sourcePropName, setSourcePropName] = useState("");
  const [sourcePropListForDropDown, setSourcePropListForDropDown] = useState<any>([]);
  const [sourceIndentForDropDown, setSourceIndentForDropDown] = useState<any>([]);
  const [sourceValue, setSourceValue] = useState("");
  const [displaySourceMenu, setDisplaySourceMenu] = useState(false);
  const [displaySourceList, setDisplaySourceList] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);

  //Documentation links for using Xpath expressions
  const xPathDocLinks = <div className={styles.xpathDoc}><span id="doc">Documentation:</span>
    <div><ul className={styles.docLinksUl}>
      <li><a href="https://www.w3.org/TR/xpath/all/" target="_blank" rel="noopener noreferrer" className={styles.docLink}>XPath Expressions</a></li>
      <li><a href="https://docs.marklogic.com/guide/app-dev/TDE#id_99178" target="_blank" rel="noopener noreferrer" className={styles.docLink}>Extraction Functions</a></li>
      <li><a href="https://docs.marklogic.com/datahub/flows/dhf-mapping-functions.html" target="_blank" rel="noopener noreferrer" className={styles.docLink}>Mapping Functions</a></li>
    </ul></div>
  </div>;

  const getColumnsForEntityTable:any = () => {
    return entityColumns.map(el => props.checkedEntityColumns[el.key] ? el : "").filter(item => item);
  };

  const getValue = (object, keys) => keys.split(".").reduce((o, k) => (o || {})[k], object);

  useEffect(() => {
    if (props.entityMappingId || !props.isRelatedEntity) {
      initializeMapExpressions();
    }
    setMappingFunctions();
    return (() => {
      setMapExp({});
      setSearchEntityText("");
      setSearchedEntityColumn("");
    });
  }, [props.entityTypeProperties]);

  const getEntityDataType = (prop) => {
    return prop.startsWith("parent-") ? prop.slice(prop.indexOf("-")+1) : prop;
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

  const initializeMapExpressions = () => {
    if (props.mapData && props.mapData.properties) {
      initializeMapExpForUI(props.mapData.properties);
      setMapExp({...mapExpUI});
      updateSourceContext({...mapExpUI}, props.entityTypeProperties);
      props.setSourceContext({...tempSourceContext});
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

  const checkFieldInErrors = (field) => {
    const finalProp = field.replace(/\//g, ".properties.");
    let record = props.mapResp["properties"];
    let prop = getValue(record, finalProp);
    if (props.mapResp && props.mapResp["properties"]) {
      if (prop && prop["errorMessage"]) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const handleClickInTextArea = async (e) => {
    await setCaretPosition(e.target.selectionStart);
  };

  const displayResp = (propName) => {
    const finalProp = propName.replace(/\//g, ".properties.");
    if (props.mapResp && props.mapResp["properties"]) {
      let field = props.mapResp["properties"];
      let prop = getValue(field, finalProp);
      if (prop && prop["errorMessage"]) {
        return prop["errorMessage"];
      } else if (prop && prop["output"]) {
        return prop["output"];
      }
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

  const toggleRowExpanded = (expanded, record, rowKey) => {

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
      await props.saveMapping(mapExp);
    }
    props.setMapExpTouched(false);
  };

  const handleColSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();

    setSearchEntityText(selectedKeys[0]);
    setSearchedEntityColumn(dataIndex);

    if (props.entityTypeProperties.length === 1 && props.entityTypeProperties[0].hasOwnProperty("children")) {
      props.setEntityExpandedKeys([0, 1, ...getKeysToExpandForFilter(props.entityTypeProperties, "key", selectedKeys[0])]);
    } else {
      props.setEntityExpandedKeys([0, ...getKeysToExpandForFilter(props.entityTypeProperties, "key", selectedKeys[0])]);
    }
  };

  const handleSearchReset = (clearFilters, dataIndex) => {
    clearFilters();
    if (searchEntityText) {
      props.setEntityExpandedKeys([...props.initialEntityKeys]);
    }
    setSearchEntityText("");
    setSearchedEntityColumn("");
  };

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

  const setMappingFunctions = async () => {
    let mappingFuncResponse= await getMappingFunctions();
    if (mappingFuncResponse) {
      setMapFunctions(mappingFuncResponse.data);
    }
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

  const onFunctionSelect = (e) => {
    setFunctionValue(e);
    insertContent(functionsDef(e), propName);
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

  const onSourceSelect = (e) => {
    setSourceValue(e);
    insertSource(e, propName);
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
    if (props.sourceContext[propName]) {
      let len = props.sourceContext[propName].length;
      if (field.substring(0, len+1) === props.sourceContext[propName] + "/") {
        field = field.slice(len+1);
      }
    }

    let newExp = mapExp[propName].substr(0, caretPosition) + field +
            mapExp[propName].substr(caretPosition, mapExp[propName].length);
    await setMapExp({...mapExp, [propName]: newExp});
    tempMapExp = Object.assign({}, mapExp);
    tempMapExp[propName] = newExp;
    props.saveMapping(tempMapExp);
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
    setSelectedRow(row);
    let name = row.name;
    let indentList:any = [];
    setPropName(name);
    //flatArray.forEach(element => propList.push(element.key));
    props.flatArray.forEach(element => indentList.push(20*(element.key.split("/").length - 1)));
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
  };

  const handleMapExp = (name, event) => {
    setCaretPosition(event.target.selectionStart);
    props.setMapExpTouched(true);
    setMapExp({...mapExp, [name]: event.target.value});
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

  const relatedEntitiesFilter = (
    <Select
      mode="multiple"
      allowClear
      style={{width: "98%"}}
      placeholder="Select"
      id={`${props.entityTypeTitle}-entities-filter`}
      onChange={value => handleOptionSelect(value)}
      value={selectedOptions}
      dropdownClassName={styles.entityFilterDropdown}
    >

      {props.relatedEntityTypeProperties?.map((entity, i) => {
        let entityTitle = props.isRelatedEntity ? props.entityTypeTitle.substring(0, props.entityTypeTitle.indexOf(" ")) : props.entityTypeTitle;
        if (/:(.*?)\./.exec(entity["entityMappingId"])![1] === entityTitle) {
          let entityLabel = entity.entityLabel;
          return <Option aria-label={`${entityLabel}-option`} value={entityLabel} key={i}>{entityLabel}</Option>;
        }
      })}
    </Select>
  );

  const topRowDetails = (
    <div>
      <div className = {styles.entityTopRow}>
        <div className={styles.entityTitle}>
          <strong>{props.entityTypeTitle}
          </strong>
        </div>
        <div className={styles.entitySettingsLink}>
          <EntitySettings canReadWrite={props.canReadWrite} tooltipsData={props.tooltipsData} updateStep={props.updateStep} stepData={props.mapData}/>
        </div>
      </div>
      { props.relatedMappings && props.relatedMappings.length > 0 ?
        <div className={styles.entityFilterContainer}>
          <div className={styles.mapRelatedEntitiesText}>Map related entities: </div>
          <div className={styles.entityFilter}>{relatedEntitiesFilter}</div>
        </div>
        :
        ""
      }
    </div>
  );

  const handleOptionSelect = (newlySelectedValues) => {
    let selectedArray: any = [];
    let entityArray = props.relatedEntityTypeProperties;

    if (newlySelectedValues.length !== 0) {
      //in the properties array, push the object that has the key which matches the value of the entity name selected
      newlySelectedValues.forEach(val => {
        let index = entityArray.findIndex(object => object.entityLabel === val);
        if (!props.relatedEntitiesSelected.includes((entityArray[index]))) {
          selectedArray.push(entityArray[index]);
        }
      });
      props.setRelatedEntitiesSelected(prevState => ([...prevState, ...selectedArray]));
    }
    //check for removed values
    if (newlySelectedValues.length < selectedOptions.length) {
      //filter for which value(s) were removed
      let removedOptions = selectedOptions.filter(options => newlySelectedValues.indexOf(options) < 0);
      let removedEntitiesArray : any = [];
      removedOptions.forEach(val => {
        let index = entityArray.findIndex(object => object.entityLabel === val);
        removedEntitiesArray.push(entityArray[index]);
      });
      props.setRemovedEntities(removedEntitiesArray);
    }
    setSelectedOptions(newlySelectedValues);
  };

  const entityColumns = [
    {
      title: <span data-testid="entityTableName">Name</span>,
      dataIndex: "name",
      key: "name",
      width: "18%",
      ...getColumnFilterProps("name"),
      sorter: (a: any, b: any) => a.name?.localeCompare(b.name),
      ellipsis: true,
      render: (text, row, index) => {
        let renderText = text;
        let textToSearchInto = row.key > 100 ? text.split("/").pop() : text;
        let valueToDisplay = textToSearchInto;
        let renderOutput = getRenderOutput(textToSearchInto, valueToDisplay, "name", searchedEntityColumn, searchEntityText, row.key);
        renderText =
          <span> {row.joinPropertyName && row.relatedEntityType ? <i>{renderOutput}</i> : renderOutput}
            {row.joinPropertyName && row.relatedEntityType &&
              <span>
                <MLTooltip title={"Foreign Key Relationship"}>
                  <FontAwesomeIcon className={styles.foreignKeyIcon} icon={faKey} data-testid={"foreign-key-" + text} />
                </MLTooltip>
              </span>
            }
            {row.key > 100 && row.type.includes("[ ]") &&
              <span>
                <MLTooltip title={"Multiple"}>
                  <img className={styles.arrayImage} src={arrayIcon} alt={""} data-testid={"multiple-" + text} />
                </MLTooltip>
              </span>
            }
            {row.key > 100 && row.children &&
              <span>
                <MLTooltip title={"Structured Type"}>
                  <FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup} data-testid={"structured-" + text} />
                </MLTooltip>
              </span>
            }
          </span>;

        return {children: renderText, props: (row.key <= 100 && index === 0) ? {colSpan: 4} : {colSpan: 1}};
      }
    },
    {
      ellipsis: true,
      title: <span data-testid="entityTableType">Type</span>,
      dataIndex: "type",
      key: "type",
      width: "15%",
      sorter: (a: any, b: any) => getEntityDataType(a.type).localeCompare(getEntityDataType(b.type)),
      render: (text, row, index) => {
        const expanded = text.startsWith("parent-");
        const dType = expanded ? text.slice(text.indexOf("-")+1): text;
        return {children: <div className={styles.typeContainer}>
          {expanded ? <div className={styles.typeContextContainer}><span className={styles.typeContext}>Context</span>&nbsp;<Popover
            content={contextHelp}
            trigger="click"
            placement="right"><Icon type="question-circle" className={styles.questionCircle} theme="filled" /></Popover><p className={styles.typeText}>{dType}</p></div> : text}
        </div>, props: (row.key <= 100 && index === 0) ? {colSpan: 0} : {colSpan: 1}};
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
      render: (text, row, index) => {
        if (row.key > 100) {
          return {children: <div className={styles.mapExpParentContainer}><div className={styles.mapExpressionContainer}>
            <TextArea
              id={"mapexpression"+row.name.split("/").pop()}
              data-testid={row.name.split("/").pop()+"-mapexpression"}
              style={mapExpressionStyle(row.name)}
              onClick={handleClickInTextArea}
              value={mapExp[row.name]}
              onChange={(e) => handleMapExp(row.name, e)}
              onBlur={handleExpSubmit}
              autoSize={{minRows: 1}}
              disabled={!props.canReadWrite}></TextArea>&nbsp;&nbsp;
            <span>
              <Dropdown overlay={sourceSearchMenu} trigger={["click"]} disabled={!props.canReadWrite}>
                <i  id="listIcon" data-testid={row.name.split("/").pop()+"-listIcon1"}><FontAwesomeIcon icon={faList} size="lg"  data-testid={row.name.split("/").pop()+"-listIcon"}  className={styles.listIcon} onClick={(e) => handleSourceList(row)}/></i>
              </Dropdown>
            </span>
                    &nbsp;&nbsp;
            <span ><Dropdown overlay={menu} trigger={["click"]} disabled={!props.canReadWrite}><MLButton id="functionIcon" data-testid={`${row.name.split("/").pop()}-${row.key}-functionIcon`} className={styles.functionIcon} size="small" onClick={(e) => handleFunctionsList(row.name)}>fx</MLButton></Dropdown></span></div>
          {checkFieldInErrors(row.name) ? <div id="errorInExp" data-testid={row.name+"-expErr"} className={styles.validationErrors}>{displayResp(row.name)}</div> : ""}</div>, props: {colSpan: 1}};
        } else {
          return {children: null, props: {colSpan: 0}};
        }
      },
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: "20%",
      ellipsis: true,
      sorter: (a: any, b: any) => props.getDataForValueField(a.name)?.localeCompare(props.getDataForValueField(b.name)),
      render: (text, row, index) => {
        if (row.key > 100) {
          return {
            children:
              <div data-testid={row.name.split("/").pop()+"-value"} className={styles.mapValue}>
                <MLTooltip title={props.getTextForTooltip(row.name)}>{props.getTextForValueField(row)}</MLTooltip>
              </div>,
            props: {colSpan: 1}
          };
        } else {
          return {children: null, props: {colSpan: 0}};
        }
      }
    }
  ];

  const tableCSS = css({
    "& thead > tr > th": {
      backgroundColor: props.tableColor,
      paddingTop: "12px",
      paddingBottom: "12px",
      borderColor: "#CCCCCC"
    },
    "& tbody > tr > td": {
      backgroundColor: props.tableColor,
      lineHeight: "2px",
      verticalAlign: "top",
      borderColor: "#CCCCCC"
    },
    "& tbody > tr > .ant-table-column-has-actions": {
      backgroundColor: props.tableColor,
      lineHeight: "2px",
      verticalAlign: "top",
    }
  });

  return (props.entityMappingId || !props.isRelatedEntity) ? (<div id={props.isRelatedEntity? "entityTableContainer" : "rootTableContainer"}>
    <Table
      className={tableCSS}
      pagination={false}
      expandIcon={(props) => customExpandIcon(props)}
      onExpand={(expanded, record) => toggleRowExpanded(expanded, record, "key")}
      expandedRowKeys={props.entityExpandedKeys}
      indentSize={18}
      //defaultExpandAllRows={true}
      columns={getColumnsForEntityTable()}
      scroll={{y: "60vh", x: 1000}}
      dataSource={[{key: props.firstRowTableKeyIndex, name: topRowDetails, type: "", parentVal: "", children: props.entityTypeProperties}]}
      tableLayout="unset"
      rowKey={(record: any) => record.key}
      getPopupContainer={() => document.getElementById("entityTableContainer") || document.body}
      showHeader={!props.isRelatedEntity}
    /></div>)
    :
    null;
};

export default EntityMapTable;