import React, {useState, useEffect, useContext} from "react";
import {SearchContext} from "@util/search-context";
import styles from "./date-facet.module.scss";
import dayjs from "dayjs";
import {HCTooltip, HCDateTimePicker} from "@components/common";

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

  const onChange = (startDate, endDate) => {
    const dateArray = [startDate, endDate];
    let isNested = props.constraint === props.propertyPath ? false : true;

    if (dateArray.length && dateArray[0] && startDate.isValid()) {
      props.onChange(props.datatype, props.constraint, dateArray, isNested);
      (dateArray[0] && dateArray[1]) && setDatePickerValue([dayjs(dateArray[0].format("YYYY-MM-DD")), dayjs(dateArray[1].format("YYYY-MM-DD"))]);
    } else {
      props.onChange(props.datatype, props.constraint, !dateArray[0] || !dateArray[0].isValid() ? [] : dateArray, isNested);
    }
  };

  useEffect(() => {
    if (Object.entries(searchOptions.selectedFacets).length !== 0 && searchOptions.selectedFacets.hasOwnProperty(props.constraint)) {
      for (let facet in searchOptions.selectedFacets) {
        if (facet === props.constraint) {
          setDatePickerValue([dayjs(searchOptions.selectedFacets[facet].rangeValues.lowerBound), dayjs(searchOptions.selectedFacets[facet].rangeValues.upperBound)]);
        }
      }
    } else if (Object.entries(greyedOptions.selectedFacets).length !== 0 && greyedOptions.selectedFacets.hasOwnProperty(props.constraint)) {
      for (let facet in greyedOptions.selectedFacets) {
        if (facet === props.constraint) {
          setDatePickerValue([dayjs(greyedOptions.selectedFacets[facet].rangeValues.lowerBound), dayjs(greyedOptions.selectedFacets[facet].rangeValues.upperBound)]);
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
    <div className={styles.name} data-testid="facet-date-picker" id={`${props.name}-facet-date-picker`}>
      <p className={styles.name} ><HCTooltip text={props.name.replace(/\./g, " > ")} id={props.name+"-date-tooltip"} placement="top">{formatTitle()}</HCTooltip></p>
      <HCDateTimePicker
        onChange={onChange}
        key={props.name}
        name="facet-datetime-picker-date"
        value={datePickerValue}
        parentEl={`#${props.name}-facet-date-picker`}
      />
    </div>
  );
};

export default DateFacet;
