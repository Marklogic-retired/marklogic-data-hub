import React, {useState, useEffect, useContext} from "react";
import {DatePicker, Tooltip} from "antd";
import {SearchContext} from "../../util/search-context";
import moment from "moment";
import styles from "./date-time-facet.module.scss";

const {RangePicker} = DatePicker;

interface Props {
  name: any
  constraint: string;
  datatype: any
  key: any
  propertyPath: string
  onChange: (datatype: any, facetName: any, value: any[], isNested: boolean) => void;
}

const DateTimeFacet: React.FC<Props> = (props) => {
  const {
    searchOptions,
    greyedOptions,
  } = useContext(SearchContext);
  const [dateTimePickerValue, setDateTimePickerValue] = useState<any[]>([null, null]);

  const onChange = (e) => {
    let isNested = props.constraint === props.propertyPath ? false : true;
    if (e.length) {
      props.onChange(props.datatype, props.constraint, e, isNested);
      (e[0] && e[1]) && setDateTimePickerValue([moment(e[0].format("YYYY-MM-DDTHH:mm:ss")), moment(e[1].format("YYYY-MM-DDTHH:mm:ss"))]);
    } else {
      props.onChange(props.datatype, props.constraint, e, isNested);
    }
  };

  useEffect(() => {
    if (Object.entries(searchOptions.selectedFacets).length !== 0 && searchOptions.selectedFacets.hasOwnProperty(props.constraint)) {
      for (let facet in searchOptions.selectedFacets) {
        if (facet === props.constraint) {
          setDateTimePickerValue([moment(searchOptions.selectedFacets[facet].rangeValues.lowerBound), moment(searchOptions.selectedFacets[facet].rangeValues.upperBound)]);
        }
      }
    } else if (Object.entries(greyedOptions.selectedFacets).length !== 0 && greyedOptions.selectedFacets.hasOwnProperty(props.constraint)) {
      for (let facet in greyedOptions.selectedFacets) {
        if (facet === props.constraint) {
          setDateTimePickerValue([moment(greyedOptions.selectedFacets[facet].rangeValues.lowerBound), moment(greyedOptions.selectedFacets[facet].rangeValues.upperBound)]);
        }
      }
    } else {
      setDateTimePickerValue([null, null]);
    }
  }, [searchOptions, greyedOptions]);

  const formatTitle = () => {
    let objects = props.name.split(".");
    if (objects.length > 2) {
      let first = objects[0];
      let last = objects.slice(-1);
      // returns an array for rendering that looks like "first > ... > last"
      return <p>{first} &gt; ... &gt; <b>{last}</b></p>;
    } else if (objects.length === 2) {
      let first = objects[0];
      let last = objects.slice(-1);
      return <p>{first} &gt; <b>{last}</b></p>;
    }
    return <b>{props.name}</b>;
  };

  return (
    <div className={styles.name} data-testid="facet-date-time-picker">
      <p className={styles.facetName}><Tooltip title={props.name.replace(/\./g, " > ")}>{formatTitle()}</Tooltip></p>
      <RangePicker
        showTime={{format: "HH:mm:ss"}}
        format="YYYY-MM-DD HH:mm:ss"
        placeholder={["Start Date Time", "End Date Time"]}
        onChange={onChange}
        //onOk={onOk}
        value={dateTimePickerValue}
        style={{width: "auto"}}
        key={props.name}
        getCalendarContainer={() => document.getElementById("sideBarContainer") || document.body}
      />
    </div>
  );
};

export default DateTimeFacet;
