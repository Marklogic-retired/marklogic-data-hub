import React, {useContext, useEffect, useState} from "react";
import {facetParser} from "../../util/data-conversion";
import monitorPropertiesConfig from "../../config/monitoring.config";
import MonitorFacet from "../monitor-facet/monitor-facet";
import {MonitorContext} from "../../util/monitor-context";
import {DatePicker, Select} from "antd";
import styles from "../facet/facet.module.scss";
import moment from "moment";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";


interface Props {
    facets: any;
    facetRender: (facets: any) => void;
    checkFacetRender: (facets: any) => void;
}


export const MonitorSidebar:  (React.FC<Props>) = (props) => {
  const {
    monitorOptions,
    monitorGreyedOptions,
    setAllMonitorGreyedOptions,
    clearMonitorFacet,
    clearMonitorGreyFacet,
    clearMonitorConstraint
  } = useContext(MonitorContext);
  const {RangePicker} = DatePicker;
  const {Option} = Select;

  const [allSelectedFacets, setAllSelectedFacets] = useState<any>(monitorOptions.selectedFacets);
  const [facetsList, setFacetsList] = useState<any[]>([]);
  const initialDateRangeValue = monitorOptions.selectedFacets["startTime"] ? monitorOptions.selectedFacets["startTime"][2] : "select time";
  const [dateRangeValue, setDateRangeValue] = useState<string>(initialDateRangeValue);
  const dateRangeOptions = ["Today", "This Week", "This Month", "Custom"];
  const timeFormat = "YYYY-MM-DDTHH:mm:ssZ";
  const dateFormat = "YYYY-MM-DD";
  let initialDatePickerValue = monitorOptions.selectedFacets["startTime"] ? [moment(monitorOptions.selectedFacets["startTime"][0]), moment(monitorOptions.selectedFacets["startTime"][1])] : [null, null];
  const [datePickerValue, setDatePickerValue] = useState<any[]>(initialDatePickerValue);

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

  const handleOptionSelect = (option: any) => {
    setDateRangeValue(option);
    if (option === "Custom") {
      setDatePickerValue([null, null]);
    }
    let updateFacets = {...allSelectedFacets};

    let startDate, endDate;
    if (option === "Today") {
      startDate = moment().startOf("day").format(timeFormat).toString();
    } else if (option === "This Week") {
      startDate = moment().startOf("week").format(timeFormat).toString();
    } else if (option === "This Month") {
      startDate = moment().startOf("month").format(timeFormat).toString();
    }
    endDate = moment().endOf("day").format(timeFormat).toString();

    updateFacets = {
      ...updateFacets, startTime: [startDate, endDate, option]
    };
    setAllSelectedFacets(updateFacets);
    setAllMonitorGreyedOptions(updateFacets);
  };

  const onDateChange = (dateVal, dateArray) => {
    let updateFacets = {...allSelectedFacets};
    if (dateVal.length > 1) {
      updateFacets = {
        ...updateFacets, startTime: [moment(dateArray[0]).format(timeFormat), moment(dateArray[1]).endOf("day").format(timeFormat), "Custom"]
      };
      setDatePickerValue([moment(dateArray[0]), moment(dateArray[1])]);
    } else {
      delete updateFacets.startTime;
      setDatePickerValue([null, null]);
    }
    setAllSelectedFacets(updateFacets);
    setAllMonitorGreyedOptions(updateFacets);
  };


  useEffect(() => {
    if (props.facets) {
      let parsedFacets = facetParser(props.facets);
      const filteredFacets = monitorPropertiesConfig.map(property => {
        let facetValues = parsedFacets.find(facet => facet.facetName === property.facetName);
        return facetValues && {...property, ...facetValues};
      });
      setFacetsList(filteredFacets);

      if (Object.entries(monitorOptions.selectedFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for (let constraint in monitorOptions.selectedFacets) {
          let displayName = "";
          if (constraint === "startTime" && monitorOptions.selectedFacets["startTime"] && monitorOptions.selectedFacets["startTime"].length > 0) {
            if (dateRangeValue === "Custom") {
              let facetValue = "Custom";
              if (datePickerValue[0] && datePickerValue[1]) {
                facetValue = moment(datePickerValue[0]).format(dateFormat).concat(" ~ ").concat(moment(datePickerValue[1]).format(dateFormat));
              }
              selectedFacets.push({constraint, "facet": facetValue, displayName});
            } else {
              selectedFacets.push({constraint, "facet": dateRangeValue, displayName});
            }
          }
          monitorOptions.selectedFacets[constraint].map(facet => {
            if (constraint !== "startTime") {
              selectedFacets.push({constraint, facet, displayName});
            }
          });
        }
        if (!Object.keys(monitorGreyedOptions.selectedFacets).includes("startTime") && !Object.keys(monitorOptions.selectedFacets).includes("startTime")) {
          setDateRangeValue("select time");
        }
        props.facetRender(selectedFacets);
      } else {
        props.facetRender([]);
        setAllSelectedFacets({});
        if (!Object.keys(monitorGreyedOptions.selectedFacets).includes("startTime")) {
          setDateRangeValue("select time");
        }
      }
    }
  }, [props.facets]);

  useEffect(() => {
    if (Object.entries(monitorGreyedOptions.selectedFacets).length !== 0) {
      let checkedFacets: any[] = [];
      for (let constraint in monitorGreyedOptions.selectedFacets) {
        let displayName = "";
        if (constraint === "startTime" && monitorGreyedOptions.selectedFacets["startTime"] && monitorGreyedOptions.selectedFacets["startTime"].length) {
          if (dateRangeValue === "Custom") {
            let facetValue = "Custom";
            if (datePickerValue[0] && datePickerValue[1]) {
              facetValue = moment(datePickerValue[0]).format(dateFormat).concat(" ~ ").concat(moment(datePickerValue[1]).format(dateFormat));
            }
            checkedFacets.push({constraint, "facet": facetValue, displayName});
          } else {
            checkedFacets.push({constraint, "facet": dateRangeValue, displayName});
          }
        }
        monitorGreyedOptions.selectedFacets[constraint].map(facet => {
          if (constraint !== "startTime") {
            checkedFacets.push({constraint, facet, displayName});
          }
        });
      }
      if (!Object.keys(monitorGreyedOptions.selectedFacets).includes("startTime") && !Object.keys(monitorOptions.selectedFacets).includes("startTime")) {
        setDateRangeValue("select time");
      }
      props.checkFacetRender(checkedFacets);

    } else {
      if (Object.entries(monitorOptions.selectedFacets).length === 0) {
        //setAllSearchFacets({});
        setAllSelectedFacets({});
        setDateRangeValue("select time");
      } else {
        setAllSelectedFacets(monitorOptions.selectedFacets);
        if (!Object.keys(monitorOptions.selectedFacets).some(item => item === "startTime")) {
          setDateRangeValue("select time");
        }
      }
      props.checkFacetRender([]);
    }
  }, [monitorGreyedOptions]);

  const updateSelectedFacets = (constraint: string, vals: string[], toDelete = false, toDeleteAll: boolean = false) => {
    let facets = {...allSelectedFacets};
    let greyFacets = {...monitorGreyedOptions.selectedFacets};
    let facetName = constraint;
    if (vals.length > 0) {
      facets = {
        ...facets,
        [facetName]: vals
      };
      greyFacets = {
        ...greyFacets,
        [facetName]: vals
      };
    } else {
      delete facets[facetName];
    }
    if (toDelete) {
      if (Object.entries(monitorOptions.selectedFacets).length > 0 && monitorOptions.selectedFacets.hasOwnProperty(constraint)) {
        clearMonitorFacet(constraint, vals[0]);
      } else if (Object.entries(monitorGreyedOptions.selectedFacets).length > 0 && monitorGreyedOptions.selectedFacets.hasOwnProperty(constraint)) {
        clearMonitorGreyFacet(constraint, vals[0]);
      }
    } else if (toDeleteAll) {
      clearMonitorConstraint(constraint);
    } else {
      setAllSelectedFacets(facets);
      setAllMonitorGreyedOptions(greyFacets);
    }
  };


  const addFacetValues = (constraint: string, vals: string[]) => {
    let newAllSelectedfacets = {...allSelectedFacets};
    let newFacetsList = [...facetsList];
    let index = newFacetsList.findIndex(facet => facet.facetName === constraint);

    if (index !== -1) {
      // add item to facetValues
      let additionalFacetVals = vals.map(item => {
        return {name: item, value: item};
      });

      newAllSelectedfacets = {
        ...newAllSelectedfacets,
        [constraint]: vals
      };
      for (let i = 0; i < additionalFacetVals.length; i++) {
        for (let j = 0; j < newFacetsList[index]["facetValues"].length; j++) {
          if (additionalFacetVals[i].name === newFacetsList[index]["facetValues"][j].name) {
            newFacetsList[index]["facetValues"].splice(j, 1);
            break;
          }
        }
        newFacetsList[index]["facetValues"].unshift(additionalFacetVals[i]);
      }
    }
    setFacetsList(newFacetsList);
    if (vals.length > 0) {
      newAllSelectedfacets = {
        ...newAllSelectedfacets,
        [constraint]: vals
      };
    } else {
      delete newAllSelectedfacets[constraint];
    }

    setAllSelectedFacets(newAllSelectedfacets);
    setAllMonitorGreyedOptions(newAllSelectedfacets);
  };



  return (
    <>
      <div className={styles.facetContainer} style={{"marginLeft": "7px"}}>
        <div className={styles.name} data-testid="start-time-facet">Start Time
          <HCTooltip text="Start time for a step that has run" id="start-time-tooltip" placement="bottom-start">
            <i>
              <FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" />
            </i>
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
              return <Option key={index} value={timeBucket} data-cy={`date-select-option-${timeBucket}`} data-testid={`date-select-option-${timeBucket}`}>
                {timeBucket}
              </Option>;
            })
            }</Select>
        </div>
        <div className={styles.dateTimeWindow}>
          {timeWindow(dateRangeValue)}
        </div>
        {dateRangeValue === "Custom" && <RangePicker
          id="range-picker"
          className={styles.datePicker}
          onChange={onDateChange}
          value={datePickerValue}
        />}
      </div>
      {facetsList.map(facet => {
        return facet && (
          <MonitorFacet
            name={facet.facetName}
            displayName={facet.displayName}
            facetValues={facet.facetValues}
            key={facet.facetName}
            tooltip={facet.tooltip}
            updateSelectedFacets={updateSelectedFacets}
            addFacetValues={addFacetValues}
          />
        );
      })}
    </>);
};


export default MonitorSidebar;
