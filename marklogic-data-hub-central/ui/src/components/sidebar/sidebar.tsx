import React, {useState, useEffect, useContext, useRef} from "react";
import moment from "moment";
import Select from "react-select";
import {Accordion, FormCheck} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle, faSearch} from "@fortawesome/free-solid-svg-icons";
import {HCDateTimePicker, HCTooltip, HCInput, HCCheckbox} from "@components/common";
import Facet from "../facet/facet";
import {SearchContext} from "@util/search-context";
import {facetParser, deepCopy, entityFromJSON} from "@util/data-conversion";
import hubPropertiesConfig from "@config/hub-properties.config";
import tooltipsConfig from "@config/explorer-tooltips.config";
import styles from "./sidebar.module.scss";
import {getUserPreferences, updateUserPreferences} from "../../services/user-preferences";
import {UserContext} from "@util/user-context";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import BaseEntitiesFacet from "../base-entities-facet/base-entities-facet";
import RelatedEntitiesFacet from "../related-entities-facet/related-entities-facet";
import {ExploreGraphViewToolTips} from "@config/tooltips.config";
import {HCDivider} from "@components/common";
import {graphSearchQuery, getEntities} from "@api/queries";

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
  graphView: boolean;
  setEntitySpecificPanel: (entity: any) => void;
  currentBaseEntities: any[];
  setCurrentBaseEntities: (entity: any[]) => void;
  currentRelatedEntities: Map<string, any>;
  setCurrentRelatedEntities: (entity: Map<string, any>) => void;
}

const PLACEHOLDER: string = "Select a saved query";

const Sidebar: React.FC<Props> = (props) => {

  const componentIsMounted = useRef(true);
  const entitiesArrayRef = useRef<any[]>();

  const {
    searchOptions,
    clearConstraint,
    clearFacet,
    clearGreyFacet,
    greyedOptions,
    setAllGreyedOptions,
    setSidebarQuery,
    setDatasource,
    setQueryGreyedOptions,
    setRelatedEntityTypeIds
  } = useContext(SearchContext);
  const {
    user,
    handleError
  } = useContext(UserContext);
  const [entityFacets, setEntityFacets] = useState<any[]>([]);
  const [hubFacets, setHubFacets] = useState<any[]>([]);
  const [allSelectedFacets, setAllSelectedFacets] = useState<any>(searchOptions.selectedFacets);
  const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);
  const [dateRangeValue, setDateRangeValue] = useState<string>();
  const [searchBox, setSearchBox] = useState(searchOptions.query);
  const [currentQueryName, setCurrentQueryName] = useState(PLACEHOLDER); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [activeRelatedEntities, setActiveRelatedEntities] = useState(true);


  let integers = ["int", "integer", "short", "long"];
  let decimals = ["decimal", "double", "float"];
  const dateRangeOptions = ["Today", "This Week", "This Month", "Custom"];
  const [activeKey, setActiveKey] = useState<any[]>([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [checkAll, setCheckAll] = useState(true);

  useEffect(() => {
    searchOptions.sidebarQuery && setCurrentQueryName(searchOptions.sidebarQuery);
  }, [searchOptions.sidebarQuery]);

  useEffect(() => {
    let facets = {...greyedOptions.selectedFacets};
    if (dateRangeValue && !facets["createdOnRange"]) {
      setDateRangeValue("");
    }
  }, [greyedOptions, searchOptions]);

  useEffect(() => {
    let copyKey = deepCopy(activeKey);
    if (!activeRelatedEntities) {
      if (copyKey.includes("related-entities")) {
        copyKey.splice(copyKey.indexOf("related-entities"), 1);
      }
    } else {
      if (!copyKey.includes("related-entities")) {
        copyKey.push("related-entities");
      }
    }
    setActiveKey(copyKey);
  }, [activeRelatedEntities]);

  useEffect(() => {
    let relatedEntitiesList = new Map();
    if (props.currentBaseEntities.length !== props.entityDefArray.length) {
      props.currentBaseEntities.forEach(base => {
        base.relatedEntities.map(entityName => {
          const relEntity = props.entityDefArray.find(entity => entity.name === entityName);
          relatedEntitiesList.set(entityName, {...relEntity, checked: true});
        });
      });
    }
    const values = Array.from(relatedEntitiesList.values());
    const checkedValues = values.filter(({checked}) => checked);
    setRelatedEntityTypeIds(checkedValues.map(function(i) { return i.name; }));
    props.setCurrentRelatedEntities(relatedEntitiesList);
  }, [props.currentBaseEntities]);


  const onSettingCheckedList = (list) => {
    setCheckAll(list.length === props.currentRelatedEntities.size);
  };

  const onCheckAllChanges = ({target}) => {
    const {checked} = target;
    setCheckAll(checked);
    let relatedEntitiesList = new Map();
    Array.from(props.currentRelatedEntities.values()).forEach(entity => {
      relatedEntitiesList.set(entity.name, {...entity, checked});
    });
    const values = Array.from(relatedEntitiesList.values());
    const checkedValues = values.filter(({checked}) => checked);
    setRelatedEntityTypeIds(checkedValues.map(function(i) { return i.name; }));
    props.setCurrentRelatedEntities(relatedEntitiesList);
  };


  const clearSelectedQuery = () => { // eslint-disable-line @typescript-eslint/no-unused-vars
    setCurrentQueryName(PLACEHOLDER);
    setSidebarQuery(PLACEHOLDER);
  };

  useEffect(() => {
    if (props.facets) {
      setActiveKey(["database", "hubProperties", "baseEntities"]);
      for (let i in hubFacets) {
        if (searchOptions.selectedFacets.hasOwnProperty(hubFacets[i] && hubFacets[i].facetName) || greyedOptions.selectedFacets.hasOwnProperty(hubFacets[i] && hubFacets[i].facetName)) {
          setActiveKey(["database", "hubProperties", "baseEntities"]);
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
        searchOptions.entityTypeIds?.length && activeRelatedEntities && activeKey.includes("related-entities") ?
          setActiveKey(["database", "hubProperties", "baseEntities", "related-entities"])
          : setActiveKey(["database", "hubProperties", "baseEntities"]);
      }

      let entityFacets: any[] = [];
      if (searchOptions.entityTypeIds?.length) {
        let newEntityFacets = parsedFacets.filter(facet => facet.facetName.split(".")[0] === searchOptions.entityTypeIds[0]);
        const entityDef = props.entityDefArray.find(entity => entity.name === searchOptions.entityTypeIds[0]);

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
  }, [searchOptions.entityTypeIds, props.facets]);


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

  //To handle default views for first-time user experience
  useEffect(() => {
    getEntities().then((res) => {
        entitiesArrayRef.current! = ([...entityFromJSON(res.data).map(entity => entity.info.title)]);
        checkGraphData("final").then((countEntityFinalCount) => {
          //By Default entities datasource and final database is selected
          if (countEntityFinalCount === 0) {
            checkGraphData("staging").then((countEntityStagingCount) => {
              if (countEntityStagingCount > 0) {
                //Setting the staging database if there is no data in final database
                props.setDatabasePreferences("staging");
              } else {
                //Setting the All Data datasource with final database at end
                setDatasourcePreferences("all-data");
              }
            });
          }
        });
    })
      .catch((error) => {
        handleError(error);
      });
  }, []);

  const checkGraphData = async (database) => {
    try {
      let payload = {
        "database": database,
        "data": {
          "query": {
            "searchText": "",
            "entityTypeIds": entitiesArrayRef.current!,
            "selectedFacets": searchOptions.selectedFacets,
            "relatedEntityTypeIds": searchOptions.relatedEntityTypeIds
          },
          "start": 0,
          "pageLength": 1,
        }
      };
      const response = await graphSearchQuery(payload);
      if (componentIsMounted.current && response.data) {
        return response.data.total;
      }
    } catch (error) {
      handleError(error);
    }
  };

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
      return;
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


  const panelTitle = (title, tooltipTitle) => {
    let disabled = !props.graphView && tooltipTitle === ExploreGraphViewToolTips.relatedEntities;
    return (
      <div className={styles.panelTitle}>
        {title}
        <HCTooltip text={disabled ? "" : tooltipTitle} id="entities-tooltip" placement="right">
          <i><FontAwesomeIcon className={disabled? styles.disabledEntitiesInfoIcon : styles.entitiesInfoIcon} icon={faInfoCircle} size="sm" /></i>
        </HCTooltip>
      </div>
    );
  };
  const handleToggleDataHubArtifacts = ({target}) => {
    props.setHubArtifactsVisibilityPreferences(!target.checked);
  };

  const selectTimeOptions = dateRangeOptions.map(timeBucket => ({value: timeBucket, label: timeBucket}));

  useEffect(() => {
    setSearchBox(searchOptions.query);
    searchOptions.query && setQueryGreyedOptions(searchOptions.query);
  }, [searchOptions]);

  const handleSearchBox = (e) => {
    setQueryGreyedOptions(e.target.value);
    setSearchBox(e.target.value);
  };

  return (
    <div className={styles.sideBarContainer} id={"sideBarContainer"}>
      <div className={styles.searchInput}>
        <HCInput id="graph-view-filter-input" dataCy="search-bar" dataTestid="search-bar" value={searchBox} onChange={handleSearchBox} suffix={<FontAwesomeIcon icon={faSearch} size="sm" className={styles.searchIcon} />} placeholder="Search" size="sm" />
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
                  <span>Final</span>
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
                  <span>Staging</span>
                </label>
              </span>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <HCDivider className={"mt-1 mb-2"}  style={{backgroundColor: "#ccc"}}/>
      {(searchOptions.datasource && searchOptions.datasource !== "all-data") && <>
        <Accordion id="baseEntities" className={"w-100 accordion-sidebar"} flush activeKey={activeKey.includes("baseEntities") ? "baseEntities" : ""} defaultActiveKey={activeKey.includes("baseEntities") ? "baseEntities" : ""}>
          <Accordion.Item eventKey="baseEntities" className={"bg-transparent"}>
            <div className={"p-0 d-flex"}>
              <Accordion.Button className={`after-indicator ${styles.titleBaseEntities}`} onClick={() => setActiveAccordion("baseEntities")}>{panelTitle(<span>base entities</span>, ExploreGraphViewToolTips.baseEntities)}</Accordion.Button>
            </div>
            <Accordion.Body>
              <BaseEntitiesFacet
                setCurrentBaseEntities={props.setCurrentBaseEntities}
                setEntitySpecificPanel={props.setEntitySpecificPanel}
                currentBaseEntities={props.currentBaseEntities}
                setActiveAccordionRelatedEntities={setActiveAccordion}
                allBaseEntities={props.entityDefArray}
                activeKey={activeKey}
              />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <HCDivider className={"mt-0 mb-2"}  style={{backgroundColor: "#ccc"}}/>
        {props.currentRelatedEntities.size > 0 &&
        <div className={styles.relatedEntityPanel}>
          <HCTooltip text={!props.graphView ? exploreSidebar.disabledRelatedEntities: ""} aria-label="disabled-related-entity-tooltip" id="disabled-related-entity-tooltip" placement="bottom">
            <Accordion id="related-entities" data-testid={"related-entity-panel"} className={"w-100 accordion-sidebar"} flush activeKey={activeKey.includes("related-entities") && props.graphView ? "related-entities" : ""} defaultActiveKey={activeKey.includes("related-entities") ? "related-entities" : ""}>
              <Accordion.Item eventKey="related-entities" className={"bg-transparent"}>
                <div className={"p-0 d-flex"}>
                  <Accordion.Button className={!props.graphView ? `after-indicator ${styles.disabledTitleCheckbox}` : `after-indicator ${styles.titleCheckbox}`} onClick={() =>  setActiveAccordion("related-entities")}>{
                    panelTitle(<span><span className={!activeRelatedEntities ? styles.disabledCheckbox : ""}><HCCheckbox id="check-all" value="check-all" disabled={!props.graphView} cursorDisabled={!activeRelatedEntities} handleClick={activeRelatedEntities ? onCheckAllChanges : () => { return; }} checked={checkAll} /></span>related entities</span>, ExploreGraphViewToolTips.relatedEntities)}
                  </Accordion.Button>
                </div>
                <Accordion.Body>
                  <RelatedEntitiesFacet currentRelatedEntities={props.currentRelatedEntities} setCurrentRelatedEntities={props.setCurrentRelatedEntities} onSettingCheckedList={onSettingCheckedList} setEntitySpecificPanel={props.setEntitySpecificPanel} setActiveRelatedEntities={setActiveRelatedEntities}/>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </HCTooltip>
          <HCDivider className={"mt-0 mb-2"} style={{backgroundColor: "#ccc"}}/>
        </div>
        }
      </>}

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
                value={selectTimeOptions.find(oItem => oItem.value === dateRangeValue) || ""}
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
              onChange={onDateChange}
              parentEl="#date-select-wrapper" />}
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
