import React, {useState, useEffect, useContext, CSSProperties} from "react";
import {Collapse, Icon, DatePicker, Select, Switch, Radio} from "antd";
import moment from "moment";
import Facet from "../facet/facet";
import {SearchContext} from "../../util/search-context";
import {facetParser} from "../../util/data-conversion";
import hubPropertiesConfig from "../../config/hub-properties.config";
import tooltipsConfig from "../../config/explorer-tooltips.config";
import styles from "./sidebar.module.scss";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NumericFacet from "../numeric-facet/numeric-facet";
import DateFacet from "../date-facet/date-facet";
import DateTimeFacet from "../date-time-facet/date-time-facet";
import {getUserPreferences, updateUserPreferences} from "../../services/user-preferences";
import {UserContext} from "../../util/user-context";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";

const {Panel} = Collapse;
const {RangePicker} = DatePicker;
const {Option} = Select;
const tooltips = tooltipsConfig.browseDocuments;

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
  } = useContext(SearchContext);
  const {
    user
  } = useContext(UserContext);
  const [entityFacets, setEntityFacets] = useState<any[]>([]);
  const [hubFacets, setHubFacets] = useState<any[]>([]);
  const [allSelectedFacets, setAllSelectedFacets] = useState<any>(searchOptions.selectedFacets);
  const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);
  const [dateRangeValue, setDateRangeValue] = useState<string>();
  let integers = ["int", "integer", "short", "long"];
  let decimals = ["decimal", "double", "float"];
  const dateRangeOptions = ["Today", "This Week", "This Month", "Custom"];
  const [activeKey, setActiveKey] = useState<any[]>([]);
  const [userPreferences, setUserPreferences] = useState({});

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
        props.selectedEntities.length === 1 ? setActiveKey(["database", "entityProperties"]) : setActiveKey(["database", "hubProperties", "entityProperties"]);
      }

      let entityFacets: any[] = [];
      if (props.selectedEntities.length) {
        let newEntityFacets = parsedFacets.filter(facet => facet.facetName.split(".")[0] === props.selectedEntities[0]);
        const entityDef = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0]);

        if (newEntityFacets) {
          for (let i in newEntityFacets) {
            newEntityFacets[i].referenceType = "path";
            newEntityFacets[i].entityTypeId = entityDef?.info["baseUri"] + entityDef?.info["title"] + "-" + entityDef?.info["version"] + "/" + entityDef?.name;
            newEntityFacets[i].propertyPath = newEntityFacets[i]["facetName"].substring(newEntityFacets[i]["facetName"].indexOf(".")+1);
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
    setDateRangeValue(option);
    if (option === "Custom") {
      setDatePickerValue([null, null]);
    }
    let updateFacets = {...allSelectedFacets};
    updateFacets = {
      ...updateFacets, createdOnRange:
      {
        dataType: "date",
        stringValues: [option, (-1 * new Date().getTimezoneOffset())],
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

  const onDateChange = (dateVal, dateArray) => {
    let updateFacets = {...allSelectedFacets};
    if (dateVal.length > 1) {
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
    if (value.length > 1) {
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

  const facetPanelStyle: CSSProperties = {
    borderBottom: "none",
    backgroundColor: "#F1F2F5"
  };
  const setActive = (key) => {
    setActiveKey(key);
    handleFacetPreferences(key);
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

  return (
    <div className={styles.sideBarContainer} id={"sideBarContainer"}>
      <Collapse
        className={styles.sideBarFacets}
        activeKey={activeKey}
        expandIcon={panelProps => <Icon className={styles.toggleIcon} type="down" rotate={panelProps.isActive ? 0 : -90} data-testid="toggle" />}
        expandIconPosition="right"
        bordered={false}
        onChange={setActive}
      >
        <Panel id="database" header={<div className={styles.title}>Database</div>} key="database" style={facetPanelStyle}>
          <Radio.Group
            style={{}}
            buttonStyle="solid"
            defaultValue={searchOptions.database}
            name="radiogroup"
            onChange={e => props.setDatabasePreferences(e.target.value)}
            // size="medium"
          >
            <Radio.Button aria-label="switch-database-final" value={"final"} className={styles.button}>
              Final
            </Radio.Button>
            <Radio.Button aria-label="switch-database-staging" value={"staging"} className={styles.button}>
              Staging
            </Radio.Button>
          </Radio.Group>
        </Panel>

        {props.cardView ? <div className={styles.toggleDataHubArtifacts}>
          <Switch size="small" defaultChecked={!props.hideDataHubArtifacts} onChange={value => props.setHubArtifactsVisibilityPreferences(!value)} data-testid="toggleHubArtifacts"/>
            Include Data Hub artifacts
          <HCTooltip text={tooltips.includingDataHubArtifacts} id="include-data-artifacts-tooltip" placement="bottom">
            <i><FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" data-testid="info-tooltip-toggleDataHubArtifacts" /></i>
          </HCTooltip>
        </div> : ""}

        {props.selectedEntities.length === 1 && (
          <Panel id="entity-properties" header={<div className={styles.title}>Entity Properties</div>} key="entityProperties" style={facetPanelStyle}>
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
          </Panel>
        )}
        <Panel id="hub-properties" header={<div className={styles.title}>Hub Properties</div>} key="hubProperties" style={facetPanelStyle}>
          <div className={styles.facetName} data-cy="created-on-facet">
            Created On
            <HCTooltip text={tooltips.createdOn} id="created-on-tooltip" placement="top-start">
              <i><FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" /></i>
            </HCTooltip>
          </div>
          <div>
            <Select
              style={{width: 150, paddingTop: "5px", paddingBottom: "5px"}}
              placeholder="Select time"
              id="date-select"
              value={dateRangeValue}
              onChange={value => handleOptionSelect(value)}
              getPopupContainer={() => document.getElementById("date-select") || document.body}
            >{dateRangeOptions.map((timeBucket, index) => {
                return <Option key={index} value={timeBucket} data-testid={`date-select-option-${timeBucket}`}>
                  {timeBucket}
                </Option>;
              })
              }</Select>
          </div>
          <div className={styles.dateTimeWindow} >
            {timeWindow(dateRangeValue)}
          </div>
          {dateRangeValue === "Custom" && <RangePicker
            id="range-picker"
            className={styles.datePicker}
            onChange={onDateChange}
            value={datePickerValue}
            getCalendarContainer={() => document.getElementById("sideBarContainer") || document.body}
          />}
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
        </Panel>
      </Collapse>
    </div>
  );
};

export default Sidebar;
