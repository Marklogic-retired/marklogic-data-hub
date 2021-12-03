import React, {useState, useEffect, useContext} from "react";
import {Icon, Input, Menu, Dropdown, Button, Checkbox} from "antd";
import moment from "moment";
import Facet from "../facet/facet";
import {SearchContext} from "../../util/search-context";
import {facetParser} from "../../util/data-conversion";
import hubPropertiesConfig from "../../config/hub-properties.config";
import tooltipsConfig from "../../config/explorer-tooltips.config";
import styles from "./sidebar.module.scss";
import {faCopy, faEllipsisV, faInfoCircle, faPencilAlt, faSave, faTrashAlt, faUndo, faWindowClose} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NumericFacet from "../numeric-facet/numeric-facet";
import DateFacet from "../date-facet/date-facet";
import DateTimeFacet from "../date-time-facet/date-time-facet";
import {getUserPreferences, updateUserPreferences} from "../../services/user-preferences";
import {UserContext} from "../../util/user-context";
import {Accordion, FormCheck} from "react-bootstrap";
import Select from "react-select";
import reactSelectThemeConfig from "../../config/react-select-theme.config";
import {HCDateTimePicker, HCTooltip} from "@components/common";
import QueriesDropdown from "../queries/saving/queries-dropdown/queries-dropdown";
import BaseEntitiesFacet from "../base-entities-facet/base-entities-facet";
import RelatedEntitiesFacet from "../related-entities-facet/related-entities-facet";

const tooltips = tooltipsConfig.browseDocuments;
const {exploreSidebar} = tooltipsConfig;

interface Props {
  facets: any;
  selectedEntities: string[];
  entityDefArray: any[];
  facetRender: (facets: any) => void;
  checkFacetRender: (facets: any) => void;
  setDatabasePreferences: (option: string) => void;
  greyFacets: any;
  setHubArtifactsVisibilityPreferences: any;
  hideDataHubArtifacts: boolean;
  cardView: boolean;
}

const PLACEHOLDER: string = "Select a saved query";

const Sidebar: React.FC<Props> = (props) => {
  const {
    searchOptions,
    clearConstraint,
    clearFacet,
    clearGreyFacet,
    clearRangeFacet,
    clearGreyRangeFacet,
    greyedOptions,
    setAllGreyedOptions,
    setSidebarQuery,
    setDatasource,
  } = useContext(SearchContext);
  const {
    user
  } = useContext(UserContext);
  const [entityFacets, setEntityFacets] = useState<any[]>([]);
  const [hubFacets, setHubFacets] = useState<any[]>([]);
  const [allSelectedFacets, setAllSelectedFacets] = useState<any>(searchOptions.selectedFacets);
  const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);
  const [dateRangeValue, setDateRangeValue] = useState<string>();
  const [currentQueryName, setCurrentQueryName] = useState(searchOptions.sidebarQuery);
  const [currentBaseEntities, setCurrentBaseEntities] = useState<any[]>([]);
  const [currentRelatedEntities, setCurrentRelatedEntities] = useState<Map<string, any>>(new Map());

  let integers = ["int", "integer", "short", "long"];
  let decimals = ["decimal", "double", "float"];
  const dateRangeOptions = ["Today", "This Week", "This Month", "Custom"];
  const [activeKey, setActiveKey] = useState<any[]>([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [indeterminate, setIndeterminate] = React.useState(false);
  const [checkAll, setCheckAll] = React.useState(true);

  useEffect(() => {
    setCurrentQueryName(searchOptions.sidebarQuery);
  }, [searchOptions.sidebarQuery]);

  useEffect(() => {
    let final = new Map();
    currentBaseEntities.forEach(base => {
      base.relatedEntities.map(entity => {
        final.set(entity.name, {...entity, checked: true});
      });
    });
    setCurrentRelatedEntities(final);
  }, [currentBaseEntities]);


  const onSettingCheckedList = (list) => {
    setIndeterminate(!!list.length && list.length < currentRelatedEntities.size);
    setCheckAll(list.length === currentRelatedEntities.size);
  };

  const onCheckAllChanges = ({target}) => {
    const {checked} = target;
    setIndeterminate(false);
    setCheckAll(checked);
    let final = new Map();
    Array.from(currentRelatedEntities.values()).forEach(entity => {
      final.set(entity.name, {...entity, checked});
    });
    setCurrentRelatedEntities(final);
  };


  const clearSelectedQuery = () => {
    setCurrentQueryName(PLACEHOLDER);
    setSidebarQuery(PLACEHOLDER);
  };

  useEffect(() => {
    if (props.facets) {
      props.selectedEntities.length === 1 ? setActiveKey(["database", "entityProperties"]) : setActiveKey(["database", "hubProperties", "entityProperties"]);
      for (let i in hubFacets) {
        if (searchOptions.selectedFacets.hasOwnProperty(hubFacets[i] && hubFacets[i].facetName) || greyedOptions.selectedFacets.hasOwnProperty(hubFacets[i] && hubFacets[i].facetName)) {
          setActiveKey(["database", "hubProperties", "entityProperties"]);
        }
      }
      const parsedFacets = facetParser(props.facets);
      const filteredHubFacets = hubPropertiesConfig.map(hubFacet => {
        let hubFacetValues = parsedFacets.find(facet => facet.facetName === hubFacet.facetName);
        return hubFacetValues && {...hubFacet, ...hubFacetValues};
      });

      setHubFacets(filteredHubFacets);

      let selectedHubFacets: any = [];
      for (let facet in searchOptions.selectedFacets) {
        let hubFacetValue = filteredHubFacets.find(hubFacet => hubFacet && hubFacet.facetName === facet);
        if (hubFacetValue) {
          selectedHubFacets.push(hubFacetValue);
        }
      }

      if (selectedHubFacets.length) {
        initializeFacetPreferences();
      } else {
        props.selectedEntities.length === 1 ? setActiveKey(["database", "entityProperties"]) : setActiveKey(["database", "hubProperties", "entityProperties", "baseEntities"]);
      }

      let entityFacets: any[] = [];
      if (props.selectedEntities.length) {
        let newEntityFacets = parsedFacets.filter(facet => facet.facetName.split(".")[0] === props.selectedEntities[0]);
        const entityDef = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0]);

        if (newEntityFacets) {
          for (let i in newEntityFacets) {
            newEntityFacets[i].referenceType = "path";
            newEntityFacets[i].entityTypeId = entityDef?.info["baseUri"] + entityDef?.info["title"] + "-" + entityDef?.info["version"] + "/" + entityDef?.name;
            newEntityFacets[i].propertyPath = newEntityFacets[i]["facetName"].substring(newEntityFacets[i]["facetName"].indexOf(".") + 1);
          }
        }
        entityFacets = newEntityFacets ? newEntityFacets.filter(item => item !== false) : [];
        setEntityFacets(entityFacets);
      }

      if (Object.entries(searchOptions.selectedFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for (let constraint in searchOptions.selectedFacets) {
          let displayName = "";
          let entityFacet = entityFacets && entityFacets.find(facet => facet.facetName === constraint);
          if (entityFacet && entityFacet.propertyPath !== constraint) {
            displayName = entityFacet.propertyPath;
          }
          if (constraint === "createdOnRange") {
            if (searchOptions.selectedFacets && searchOptions.selectedFacets[constraint]) {
              setDateRangeValue(searchOptions.selectedFacets[constraint]["stringValues"][0]);
            }
            selectedFacets.push({constraint, facet: searchOptions.selectedFacets[constraint], displayName});
          } else {
            setDateRangeValue("select time");
            let datatype = searchOptions.selectedFacets[constraint].dataType;
            if (datatype === "xs:string" || datatype === "string") {
              searchOptions.selectedFacets[constraint]["stringValues"].forEach(facet => {
                selectedFacets.push({constraint, facet, displayName});
              });
            } else if (integers.includes(datatype) || decimals.includes(datatype)) {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues;
              selectedFacets.push({constraint, rangeValues, displayName});
            } else if (datatype === "xs:date" || datatype === "date") {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues;
              selectedFacets.push({constraint, rangeValues, displayName});
            } else if (datatype === "xs:dateTime" || datatype === "dateTime") {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues;
              selectedFacets.push({constraint, rangeValues, displayName});
            }
          }
          props.facetRender(selectedFacets);
        }
        if (!selectedFacets.some(item => item.constraint === "createdOnRange")) {
          setDatePickerValue([null, null]);
        }
      } else {
        setDateRangeValue("select time");
        props.facetRender([]);
        setAllSelectedFacets({});
        setDatePickerValue([null, null]);
      }
    }
  }, [props.selectedEntities, props.facets]);


  useEffect(() => {
    if (Object.entries(greyedOptions.selectedFacets).length !== 0) {
      let checkedFacets: any[] = [];
      for (let constraint in greyedOptions.selectedFacets) {
        let displayName = "";
        let entityFacet = entityFacets && entityFacets.find(facet => facet.facetName === constraint);
        if (entityFacet && entityFacet.propertyPath !== constraint) {
          displayName = entityFacet.propertyPath;
        }
        if (constraint === "createdOnRange") {
          checkedFacets.push({constraint, facet: greyedOptions.selectedFacets[constraint], displayName});
        } else {
          let datatype = greyedOptions.selectedFacets[constraint].dataType;
          if (datatype === "xs:string" || datatype === "string") {
            greyedOptions.selectedFacets[constraint]["stringValues"].map(facet => {
              checkedFacets.push({constraint, facet, displayName});
            });
          } else if (integers.includes(datatype) || decimals.includes(datatype)) {
            let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues;
            checkedFacets.push({constraint, rangeValues, displayName});
          } else if (datatype === "xs:date" || datatype === "date") {
            let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues;
            checkedFacets.push({constraint, rangeValues, displayName});
          } else if (datatype === "xs:dateTime" || datatype === "dateTime") {
            let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues;
            checkedFacets.push({constraint, rangeValues, displayName});
          }
        }
        props.checkFacetRender(checkedFacets);
      }
      if (!checkedFacets.some(item => item.constraint === "createdOnRange")) {
        setDatePickerValue([null, null]);
      }
    } else {
      if (Object.entries(searchOptions.selectedFacets).length === 0) {
        //setAllSearchFacets({});
        setAllSelectedFacets({});
        setDateRangeValue("select time");
      } else {
        setAllSelectedFacets(searchOptions.selectedFacets);
        if (!Object.keys(searchOptions.selectedFacets).some(item => item === "createdOnRange")) {
          setDateRangeValue("select time");
        }
      }
      props.checkFacetRender([]);
    }
  }, [greyedOptions]);

  const updateSelectedFacets = (constraint: string, vals: string[], datatype: string, isNested: boolean, toDelete = false, toDeleteAll: boolean = false) => {
    let facets = {...allSelectedFacets};
    let greyFacets = {...greyedOptions.selectedFacets};
    let type = "";
    let valueKey = "";
    let facetName = constraint;

    switch (datatype) {
    case "xs:string":
    case "collection": {
      type = "xs:string";
      valueKey = "stringValues";
      break;
    }
    case "xs:integer": {
      type = "xs:integer";
      valueKey = "rangeValues";
      break;
    }
    case "xs:decimal": {
      type = "xs:decimal";
      valueKey = "rangeValues";
      break;
    }
    default:
      break;
    }

    if (vals.length > 0) {
      facets = {
        ...facets,
        [facetName]: {
          dataType: type,
          [valueKey]: vals
        }
      };
      greyFacets = {
        ...greyFacets,
        [facetName]: {
          dataType: type,
          [valueKey]: vals
        }
      };
    } else {
      delete facets[facetName];
    }
    if (toDelete) {
      if (Object.entries(searchOptions.selectedFacets).length > 0 && searchOptions.selectedFacets.hasOwnProperty(constraint)) {
        clearFacet(constraint, vals[0]);
      } else if (Object.entries(greyedOptions.selectedFacets).length > 0 && greyedOptions.selectedFacets.hasOwnProperty(constraint)) {
        clearGreyFacet(constraint, vals[0]);
      }
    } else if (toDeleteAll) {
      clearConstraint(constraint);
    } else {
      setAllSelectedFacets(facets);
      setAllGreyedOptions(greyFacets);
    }
  };

  const addFacetValues = (constraint: string, vals: string[], dataType: string, facetCategory: string) => {
    let newAllSelectedfacets = {...allSelectedFacets};
    let valueKey = "stringValues";
    // TODO add support for non string facets

    if (dataType === "xs:string") {
      valueKey = "stringValues";
    }

    if (facetCategory === "entity") {
      let newEntityFacets = [...entityFacets];
      let index = newEntityFacets.findIndex(facet => facet.facetName === constraint);

      if (index !== -1) {
        // add item to facetValues
        let additionalFacetVals = vals.map(item => {
          return {name: item, count: 0, value: item};
        });
        // facet value doesn't exist
        newAllSelectedfacets = {
          ...newAllSelectedfacets,
          [constraint]: {
            dataType,
            [valueKey]: vals
          }
        };
        for (let i = 0; i < additionalFacetVals.length; i++) {
          for (let j = 0; j < newEntityFacets[index]["facetValues"].length; j++) {
            if (additionalFacetVals[i].name === newEntityFacets[index]["facetValues"][j].name) {
              newEntityFacets[index]["facetValues"].splice(j, 1);
              break;
            }
          }
          newEntityFacets[index]["facetValues"].unshift(additionalFacetVals[i]);
        }
      }
      setEntityFacets(newEntityFacets);
    } else if (facetCategory === "hub") {
      let newHubFacets = [...hubFacets];
      let index = newHubFacets.findIndex(facet => facet.facetName === constraint);

      if (index !== -1) {
        // add item to facetValues
        let additionalFacetVals = vals.map(item => {
          return {name: item, count: 0, value: item};
        });

        newAllSelectedfacets = {
          ...newAllSelectedfacets,
          [constraint]: {
            dataType,
            [valueKey]: vals
          }
        };
        for (let i = 0; i < additionalFacetVals.length; i++) {
          for (let j = 0; j < newHubFacets[index]["facetValues"].length; j++) {
            if (additionalFacetVals[i].name === newHubFacets[index]["facetValues"][j].name) {
              newHubFacets[index]["facetValues"].splice(j, 1);
              break;
            }
          }
          newHubFacets[index]["facetValues"].unshift(additionalFacetVals[i]);
        }
      }
      setHubFacets(newHubFacets);
    }
    let type = "";
    switch (dataType) {
    case "xs:string":
    case "collection": {
      type = "xs:string";
      valueKey = "stringValues";
      break;
    }
    case "xs:integer": {
      type = "xs:integer";
      valueKey = "rangeValues";
      break;
    }
    case "xs:decimal": {
      type = "xs:decimal";
      valueKey = "rangeValues";
      break;
    }
    default:
      break;
    }
    if (vals.length > 0) {
      newAllSelectedfacets = {
        ...newAllSelectedfacets,
        [constraint]: {
          dataType: type,
          [valueKey]: vals
        }
      };
    } else {
      delete newAllSelectedfacets[constraint];
    }

    setAllSelectedFacets(newAllSelectedfacets);
    setAllGreyedOptions(newAllSelectedfacets);
  };

  const handleOptionSelect = (option: any) => {
    setDateRangeValue(option.value);
    if (option.value === "Custom") {
      setDatePickerValue([null, null]);
    }
    let updateFacets = {...allSelectedFacets};
    updateFacets = {
      ...updateFacets, createdOnRange:
      {
        dataType: "date",
        stringValues: [option.value, (-1 * new Date().getTimezoneOffset())],
        rangeValues: {lowerBound: "", upperBound: ""}
      }
    };
    setAllSelectedFacets(updateFacets);
    setAllGreyedOptions(updateFacets);
  };

  const timeWindow = (selectedDateRangeValue) => {
    let date = "";
    if (selectedDateRangeValue === "This Week") {
      const startOfWeek = moment().startOf("week").format("MMM DD");
      const endOfWeek = moment().format("MMM DD");
      date = "(" + startOfWeek + " - " + endOfWeek + ")";
    }

    if (selectedDateRangeValue === "This Month") {
      const startOfMonth = moment().startOf("month").format("MMM DD");
      const endOfMonth = moment().format("MMM DD");
      date = "(" + startOfMonth + " - " + endOfMonth + ")";
    }

    return date;
  };

  const onDateChange = (startDate, endDate) => {
    const dateArray = [startDate, endDate];

    let updateFacets = {...allSelectedFacets};
    if (endDate && endDate.isValid()) {
      updateFacets = {
        ...updateFacets, createdOnRange:
        {
          dataType: "date",
          stringValues: ["Custom", (-1 * new Date().getTimezoneOffset())],
          rangeValues: {lowerBound: moment(dateArray[0]).format(), upperBound: moment(dateArray[1]).format()}
        }
      };

      setDatePickerValue([moment(dateArray[0]), moment(dateArray[1])]);
    } else {
      delete updateFacets.createdOnRange;
      setDatePickerValue([null, null]);
    }
    setAllSelectedFacets(updateFacets);
    setAllGreyedOptions(updateFacets);
  };

  const onNumberFacetChange = (datatype, facet, value, isNested) => {
    let updateFacets = {...allSelectedFacets};
    //let facetName = setFacetName(facet, isNested);
    if (value.length > 1) {
      updateFacets = {...updateFacets, [facet]: {dataType: datatype, rangeValues: {lowerBound: value[0].toString(), upperBound: value[1].toString()}}};
    }
    setAllSelectedFacets(updateFacets);
    setAllGreyedOptions(updateFacets);
  };

  const onDateFacetChange = (datatype, facet, value, isNested) => {
    let updateFacets = {...allSelectedFacets};
    //let facetName = setFacetName(facet, isNested);
    if (value.length > 1 && value[0]) {
      updateFacets = {...updateFacets, [facet]: {dataType: datatype, rangeValues: {lowerBound: moment(value[0]).format("YYYY-MM-DD"), upperBound: moment(value[1]).format("YYYY-MM-DD")}}};
      setAllGreyedOptions(updateFacets);
      setAllSelectedFacets(updateFacets);
    } else if (value.length === 0) {
      clearRangeFacet(facet);
      clearGreyRangeFacet(facet);
    }
  };

  const onDateTimeFacetChange = (datatype, facet, value, isNested) => {
    let updateFacets = {...allSelectedFacets};
    //let facetName = setFacetName(facet, isNested);
    if (value.length > 1) {
      updateFacets = {...updateFacets, [facet]: {dataType: datatype, rangeValues: {lowerBound: moment(value[0]).format("YYYY-MM-DDTHH:mm:ss"), upperBound: moment(value[1]).format("YYYY-MM-DDTHH:mm:ss")}}};
      setAllGreyedOptions(updateFacets);
      setAllSelectedFacets(updateFacets);
    } else if (value.length === 0) {
      clearRangeFacet(facet);
      clearGreyRangeFacet(facet);
    }
  };

  // const setFacetName = (facet: string, isNested: boolean) => {
  //   let name = facet;
  //   if (isNested) {
  //     let splitFacet = facet.split('.');
  //     name = splitFacet.pop() || '';
  //   }
  //   return name;
  // }

  const setActiveAccordion = (key) => {
    const tmpActiveKeys = [...activeKey];
    const index = tmpActiveKeys.indexOf(key);
    index !== -1 ? tmpActiveKeys.splice(index, 1) : tmpActiveKeys.push(key);
    setActiveKey(tmpActiveKeys);
    handleFacetPreferences(tmpActiveKeys);
  };

  const setDatasourcePreferences = (datasource) => {
    setDatasource(datasource);
  };

  const initializeFacetPreferences = () => {
    let defaultPreferences = getUserPreferences(user.name);
    if (defaultPreferences !== null) {
      let parsedPreferences = JSON.parse(defaultPreferences);
      if (parsedPreferences.activeFacets) {
        setUserPreferences({...parsedPreferences});
        setActiveKey([...parsedPreferences.activeFacets]);
      } else {
        props.selectedEntities.length === 1 ? setActiveKey(["database", "entityProperties"]) : setActiveKey(["database", "hubProperties", "entityProperties"]);
      }
    }
  };

  const handleFacetPreferences = (key) => {
    let options = {
      ...userPreferences,
      activeFacets: key
    };
    updateUserPreferences(user.name, options);
  };

  const menu = (
    <Menu>
      <Menu.Item key="0">
        <span>
          <FontAwesomeIcon icon={faPencilAlt} className={styles.queryMenuItemIcon} />
          Edit query details
        </span>
      </Menu.Item>
      <Menu.Item key="1">
        <span>
          <FontAwesomeIcon icon={faUndo} className={styles.queryMenuItemIcon} />
          Revert query to saved state
        </span>
      </Menu.Item>
      <Menu.Item key="2">
        <span>
          <FontAwesomeIcon icon={faCopy} className={styles.queryMenuItemIcon} />
          Save query as
        </span>
      </Menu.Item>
      <Menu.Item key="3">
        <span style={{color: "#B32424"}}>
          <FontAwesomeIcon icon={faTrashAlt} className={styles.queryMenuItemIcon} />
          Delete query
        </span>
      </Menu.Item>
    </Menu>
  );


  const panelTitle = (title, tooltipTitle) => {
    return (
      <div className={styles.panelTitle}>
        {title}
        <HCTooltip text={tooltipTitle} id="entities-tooltip" placement="right">
          <i><FontAwesomeIcon className={styles.entitiesInfoIcon} icon={faInfoCircle} size="sm"  /></i>
        </HCTooltip>
      </div>
    );
  };
  const handleToggleDataHubArtifacts = ({target}) => {
    props.setHubArtifactsVisibilityPreferences(!target.checked);
  };

  const selectTimeOptions = dateRangeOptions.map(timeBucket => ({value: timeBucket, label: timeBucket}));

  return (
    <div className={styles.sideBarContainer} id={"sideBarContainer"}>
      <div className={`d-flex ms-2 me-3 mb-3 ${styles.query}`}>
        <QueriesDropdown
          savedQueryList={[{name: "active clients"}, {name: "disabled customers"}]}
          currentQueryName={currentQueryName}
        />
        {currentQueryName !== PLACEHOLDER &&
          <div className={`d-flex ms-5`}>
            <FontAwesomeIcon className={styles.queryIconsSave} icon={faSave} title={"reset-changes"} size="lg" id="save-query"/>
            <Dropdown overlay={menu} trigger={["click"]}>
              <FontAwesomeIcon className={styles.queryIconsEllipsis} icon={faEllipsisV} size="lg" />
            </Dropdown>
          </div>
        }
      </div>
      {currentQueryName !== PLACEHOLDER &&
        <div className={styles.clearQuery}>
          <Button size="small" type={"link"} onClick={clearSelectedQuery} >
            <FontAwesomeIcon icon={faWindowClose} size="sm" />
            Clear query
          </Button>
        </div>
      }
      <div className={styles.searchInput}>
        <Input aria-label="graph-view-filter-input" suffix={<Icon className={styles.searchIcon} type="search" theme="outlined" />} placeholder="Search" size="small" />
      </div>
      <div className={"m-3 switch-button-group"}>
        <span>
          <input
            type="radio"
            id="switch-datasource-entities"
            name="switch-datasource"
            value={"entities"}
            checked={searchOptions.datasource === "entities"}
            onChange={e => setDatasourcePreferences(e.target.value)}
          />
          <label aria-label="switch-datasource-entities" htmlFor="switch-datasource-entities" className={"d-flex align-items-center justify-content-center"} style={{width: "110px"}}>
            <span id="all-entities" className="curateIcon"></span>
            <span>Entities</span>
          </label>
        </span>

        <span>
          <input
            type="radio"
            id="switch-datasource-all-data"
            name="switch-datasource"
            value={"all-data"}
            checked={searchOptions.datasource === "all-data"}
            onChange={e => setDatasourcePreferences(e.target.value)}
          />
          <label aria-label="switch-datasource-all-data" htmlFor="switch-datasource-all-data" className={"d-flex align-items-center justify-content-center"} style={{width: "110px"}}>
            <span id="all-data" className="loadIcon"></span>
            <span>All Data</span>
          </label>
        </span>
      </div>
      <Accordion aria-label="switch-database" id="database" className={"w-100 accordion-sidebar"} flush activeKey={activeKey.includes("database") ? "database" : ""} defaultActiveKey={activeKey.includes("database") ? "database" : ""}>
        <Accordion.Item eventKey="database" className={"bg-transparent"}>
          <div className={"p-0 d-flex"}>
            <Accordion.Button className={`after-indicator ${styles.title}`} onClick={() => setActiveAccordion("database")}>Database</Accordion.Button>
          </div>
          <Accordion.Body>
            <div className={"switch-button-group"}>
              <span>
                <input
                  type="radio"
                  id="switch-database-final"
                  name="switch-database"
                  value={"final"}
                  checked={searchOptions.database === "final"}
                  onChange={e => props.setDatabasePreferences(e.target.value)}
                />
                <label aria-label="switch-database-final" htmlFor="switch-database-final" className={`d-flex justify-content-center align-items-center ${styles.button}`}>
                  Final
                </label>
              </span>

              <span>
                <input
                  type="radio"
                  id="switch-database-staging"
                  name="switch-database"
                  value={"staging"}
                  checked={searchOptions.database === "staging"}
                  onChange={e => props.setDatabasePreferences(e.target.value)}
                />
                <label aria-label="switch-database-staging" htmlFor="switch-database-staging" className={`d-flex justify-content-center align-items-center ${styles.button}`}>
                  Staging
                </label>
              </span>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion id="baseEntities" className={"w-100 accordion-sidebar"} flush activeKey={activeKey.includes("baseEntities") ? "baseEntities" : ""} defaultActiveKey={activeKey.includes("baseEntities") ? "baseEntities" : ""}>
        <Accordion.Item eventKey="baseEntities" className={"bg-transparent"}>
          <div className={"p-0 d-flex"}>
            <Accordion.Button className={`after-indicator ${styles.titleBaseEntities}`} onClick={() => setActiveAccordion("baseEntities")}>{panelTitle(<span>base entities</span>, exploreSidebar.baseEntities)}</Accordion.Button>
          </div>
          <Accordion.Body>
            <BaseEntitiesFacet setCurrentBaseEntities={setCurrentBaseEntities} setActiveAccordionRelatedEntities={setActiveAccordion} activeKey={activeKey}/>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      {currentRelatedEntities.size > 0 &&
        <Accordion id="related-entities" className={"w-100 accordion-sidebar"} flush activeKey={activeKey.includes("related-entities") ? "related-entities" : ""} defaultActiveKey={activeKey.includes("related-entities") ? "related-entities" : ""}>
          <Accordion.Item eventKey="related-entities" className={"bg-transparent"}>
            <div className={"p-0 d-flex"}>
              <Accordion.Button className={`after-indicator ${styles.titleCheckbox}`} onClick={() =>  setActiveAccordion("related-entities")}>{
                panelTitle(<Checkbox indeterminate={indeterminate} onChange={onCheckAllChanges} checked={checkAll}> related entities types </Checkbox>, exploreSidebar.relatedEntities)}</Accordion.Button>
            </div>
            <Accordion.Body>
              <RelatedEntitiesFacet currentRelatedEntities={currentRelatedEntities} setCurrentRelatedEntities={setCurrentRelatedEntities} onSettingCheckedList={onSettingCheckedList} />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      }

      {props.cardView ? <div className={styles.toggleDataHubArtifacts}>
        <FormCheck
          type="switch"
          data-testid="toggleHubArtifacts"
          defaultChecked={!props.hideDataHubArtifacts}
          onChange={handleToggleDataHubArtifacts}
          className={styles.switchToggleDataHubArtifacts}
          label={
            <div>
              <span>Include Data Hub artifacts</span>
              <HCTooltip text={tooltips.includingDataHubArtifacts} id="include-data-artifacts-tooltip" placement="bottom">
                <i><FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" data-testid="info-tooltip-toggleDataHubArtifacts" /></i>
              </HCTooltip>
            </div>
          }
        />
      </div> : ""}
      {props.selectedEntities.length === 1 && (
        <Accordion id="entity-properties" className={"w-100 accordion-sidebar"} flush activeKey={activeKey.includes("entityProperties") ? "entityProperties" : ""} defaultActiveKey={activeKey.includes("entityProperties") ? "entityProperties" : ""}>
          <Accordion.Item eventKey="entityProperties" className={"bg-transparent"}>
            <div className={"p-0 d-flex"}>
              <Accordion.Button className={`after-indicator ${styles.title}`} onClick={() => setActiveAccordion("entityProperties")}>Entity Properties</Accordion.Button>
            </div>
            <Accordion.Body>
              {entityFacets.length ? entityFacets.map((facet, index) => {
                let datatype = "";
                let step;
                switch (facet.type) {
                case "xs:string": {
                  return Object.entries(facet).length !== 0 && facet.facetValues.length > 0 && (
                    <Facet
                      name={facet.propertyPath}
                      constraint={facet.facetName}
                      facetValues={facet.facetValues}
                      key={facet.facetName}
                      tooltip=""
                      facetType={facet.type}
                      facetCategory="entity"
                      referenceType={facet.referenceType}
                      entityTypeId={facet.entityTypeId}
                      propertyPath={facet.propertyPath}
                      updateSelectedFacets={updateSelectedFacets}
                      addFacetValues={addFacetValues}
                    />
                  );
                }
                case "xs:date": {
                  datatype = "date";
                  return Object.entries(facet).length !== 0 && (
                    <DateFacet
                      constraint={facet.facetName}
                      name={facet.propertyPath}
                      datatype={datatype}
                      key={facet.facetName}
                      propertyPath={facet.propertyPath}
                      onChange={onDateFacetChange}
                    />
                  );
                }
                case "xs:dateTime": {
                  datatype = "dateTime";
                  return Object.entries(facet).length !== 0 && (
                    <DateTimeFacet
                      constraint={facet.facetName}
                      name={facet.propertyPath}
                      datatype={datatype}
                      key={facet.facetName}
                      propertyPath={facet.propertyPath}
                      onChange={onDateTimeFacetChange}
                    />
                  );
                }
                case "xs:int": {
                  datatype = "int";
                  step = 1;
                  break;
                }
                case "xs:integer": {
                  datatype = "integer";
                  step = 1;
                  break;
                }
                case "xs:short": {
                  datatype = "short";
                  step = 1;
                  break;
                }
                case "xs:long": {
                  datatype = "long";
                  step = 1;
                  break;
                }
                case "xs:decimal": {
                  datatype = "decimal";
                  step = 0.1;
                  break;
                }
                case "xs:double": {
                  datatype = "double";
                  step = 0.1;
                  break;
                }
                case "xs:float": {
                  datatype = "float";
                  step = 0.1;
                  break;
                }
                //add date type cases

                default:
                  break;
                }

                if (step && facet.facetValues.length) {
                  return (
                    <div key={index}>
                      <NumericFacet
                        constraint={facet.facetName}
                        name={facet.propertyPath}
                        step={step}
                        referenceType={facet.referenceType}
                        entityTypeId={facet.entityTypeId}
                        propertyPath={facet.propertyPath}
                        datatype={datatype}
                        key={facet.facetName}
                        onChange={onNumberFacetChange}
                      />
                    </div>
                  );
                }
              }) :
                <div>No Facets</div>
              }
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
      <Accordion id="hub-properties" className={"w-100 accordion-sidebar"} flush activeKey={activeKey.includes("hubProperties") ? "hubProperties" : ""} defaultActiveKey={activeKey.includes("hubProperties") ? "hubProperties" : ""}>
        <Accordion.Item eventKey="hubProperties" className={"bg-transparent"}>
          <div className={"p-0 d-flex"}>
            <Accordion.Button className={`after-indicator ${styles.title}`} onClick={() => setActiveAccordion("hubProperties")}>Hub Properties</Accordion.Button>
          </div>
          <Accordion.Body>
            <div className={styles.facetName} data-cy="created-on-facet">
              Created On
              <HCTooltip text={tooltips.createdOn} id="created-on-tooltip" placement="top-start">
                <i><FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" /></i>
              </HCTooltip>
            </div>
            <div className={"my-3"}>
              <Select
                id="date-select-wrapper"
                inputId="date-select"
                placeholder="Select time"
                value={selectTimeOptions.find(oItem => oItem.value === dateRangeValue)}
                onChange={handleOptionSelect}
                isSearchable={false}
                aria-label="date-select"
                options={selectTimeOptions}
                styles={reactSelectThemeConfig}
              />
            </div>
            <div className={styles.dateTimeWindow} >
              {timeWindow(dateRangeValue)}
            </div>
            {dateRangeValue === "Custom" && <HCDateTimePicker
              name="range-picker"
              className={styles.datePicker}
              value={datePickerValue}
              onChange={onDateChange} />}
            {hubFacets.map(facet => {
              return facet && (
                <Facet
                  name={facet.hasOwnProperty("displayName") ? facet.displayName : facet.facetName}
                  constraint={facet.facetName}
                  facetValues={facet.facetValues}
                  key={facet.facetName}
                  tooltip={facet.tooltip}
                  facetType={facet.type}
                  facetCategory="hub"
                  updateSelectedFacets={updateSelectedFacets}
                  addFacetValues={addFacetValues}
                  referenceType={facet.referenceType}
                  entityTypeId={facet.entityTypeId}
                  propertyPath={facet.propertyPath}
                />
              );
            })}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default Sidebar;
