import React, {useState, useEffect, useContext} from "react";
import {SearchContext} from "../../util/search-context";
import moment from "moment";
import styles from "./date-time-facet.module.scss";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";
import HCDateTimePicker from "../common/hc-datetime-picker/hc-datetime-picker";

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

  const onChange = (element, picker) => {
    const dateArray = [picker.startDate, picker.endDate];
    let isNested = props.constraint === props.propertyPath ? false : true;
    if (dateArray.length) {
      props.onChange(props.datatype, props.constraint, dateArray, isNested);
      (dateArray[0] && dateArray[1]) && setDateTimePickerValue([moment(dateArray[0].format("YYYY-MM-DDTHH:mm:ss")), moment(dateArray[1].format("YYYY-MM-DDTHH:mm:ss"))]);
    } else {
      props.onChange(props.datatype, props.constraint, dateArray, isNested);
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
      <p className={styles.facetName}><HCTooltip text={props.name.replace(/\./g, " > ")} id={props.name+"-tooltip"} placement="top">{formatTitle()}</HCTooltip></p>
      <HCDateTimePicker key={props.name} name={props.name}
        time={true}
        placeholder={["Start Date Time", "End Date Time"]}
        onOk={onChange}
        value={dateTimePickerValue}
      />
    </div>
  );
};

export default DateTimeFacet;
