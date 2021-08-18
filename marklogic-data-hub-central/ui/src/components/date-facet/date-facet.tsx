import React, {useState, useEffect, useContext} from "react";
import {DatePicker, Tooltip} from "antd";
import {SearchContext} from "../../util/search-context";
import styles from "./date-facet.module.scss";
import moment from "moment";

const {RangePicker} = DatePicker;

interface Props {
    name: any
    constraint: string;
    datatype: any
    key: any
    propertyPath: string
    onChange: (datatype: any, facetName: any, value: any[], isNested: boolean) => void;
}

const DateFacet: React.FC<Props> = (props) => {
  const {
    searchOptions,
    greyedOptions,
  } = useContext(SearchContext);
  const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);

  const onChange = (e) => {
    let isNested = props.constraint === props.propertyPath ? false : true;
    if (e.length) {
      props.onChange(props.datatype, props.constraint, e, isNested);
      (e[0] && e[1]) && setDatePickerValue([moment(e[0].format("YYYY-MM-DD")), moment(e[1].format("YYYY-MM-DD"))]);
    } else {
      props.onChange(props.datatype, props.constraint, e, isNested);
    }
  };

  useEffect(() => {
    if (Object.entries(searchOptions.selectedFacets).length !== 0 && searchOptions.selectedFacets.hasOwnProperty(props.constraint)) {
      for (let facet in searchOptions.selectedFacets) {
        if (facet === props.constraint) {
          setDatePickerValue([moment(searchOptions.selectedFacets[facet].rangeValues.lowerBound), moment(searchOptions.selectedFacets[facet].rangeValues.upperBound)]);
        }
      }
    } else if (Object.entries(greyedOptions.selectedFacets).length !== 0 && greyedOptions.selectedFacets.hasOwnProperty(props.constraint)) {
      for (let facet in greyedOptions.selectedFacets) {
        if (facet === props.constraint) {
          setDatePickerValue([moment(greyedOptions.selectedFacets[facet].rangeValues.lowerBound), moment(greyedOptions.selectedFacets[facet].rangeValues.upperBound)]);
        }
      }
    } else {
      setDatePickerValue([null, null]);
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
    <div className={styles.name} data-testid="facet-date-picker">
      <p className={styles.name} ><Tooltip title={props.name.replace(/\./g, " > ")}>{formatTitle()}</Tooltip></p>
      <RangePicker
        // className={styles.datePicker}
        onChange={onChange}
        value={datePickerValue}
        key={props.name}
        getCalendarContainer={() => document.getElementById("sideBarContainer") || document.body}
      />
    </div>
  );
};

export default DateFacet;
