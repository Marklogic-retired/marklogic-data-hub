import React, {useContext, useEffect, useState} from "react";
import "./DateRangeFacet.scss";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import {InfoCircleFill, Calendar4, XLg} from "react-bootstrap-icons";
import { SearchContext } from "../../store/SearchContext";
import dayjs from "dayjs";
import DateRangePicker from "react-bootstrap-daterangepicker";
import "bootstrap-daterangepicker/daterangepicker.css";

type Props = {
  data?: any;
};

const DateRangeFacet: React.FC<Props> = (props) => {

  useEffect(() => {
    //To display date dateRange values
    for(let item in searchContext.facetStrings) {
      let arr = searchContext.facetStrings[item].split(":")
      if(arr[0] === props.data.facet.name) {
        let dates = arr[1].split(" ~ ")
        setDatePickerValue([dates[0], dates[1]]);
      }
    }
  },[]);

  const ref = React.useRef<any>();
  const searchContext = useContext(SearchContext);
  const initialSettings = {
    parentEl: "#date-range-picker-facet",
    autoApply: true,
  };
  const [showClear, updateShowClear] = React.useState(false);
  const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);

  function onShow(event, picker) {
    const applyButton = document.querySelector(".applyBtn");

    if (applyButton) {
      applyButton.innerHTML = "OK";
    }
  }


  const onChange = (facet) => (startDate, endDate)  => {
    let creationDate = dayjs(startDate).format("YYYY-MM-DD") + " ~ " + dayjs(endDate).format("YYYY-MM-DD");
    const dateArray = [startDate, endDate];

    if (dateArray.length && dateArray[0] && startDate.isValid() && !showClear) {
      searchContext.handleFacetDateRange(facet?.name, creationDate, true);
      (dateArray[0] && dateArray[1]) && setDatePickerValue([dayjs(dateArray[0].format("YYYY-MM-DD")), dayjs(dateArray[1].format("YYYY-MM-DD"))]);
    }
    else {
      searchContext.handleFacetDateRange(facet?.name, creationDate, false);
    }
  };

  // To handle close/calender icon on created on date picker
  const handleMouseOver = (e) => {
    if (datePickerValue.length > 0 && datePickerValue[0]) {
      updateShowClear(true);
    }
  };

  // To handle close/calender icon on created on date picker
  const handleMouseOut = (e) => {
    if (datePickerValue.length > 0 && datePickerValue[0]) {
      updateShowClear(false);
    }
  };

  // Format placeholder for create on date input
  const formatPlaceHolder = (input) => {
    return Array.isArray(input) && input.length > 1 ? input.map(text => text.length > 15 ? text.slice(0, 15) + "..." : text).join(" ~ ") : input;
  };

  //Formats the placeholder text for created on input
  const formatValue = (input, facetData) => {
    if (!Array.isArray(input) || input.length !== 2) {
      return "";
    }

    if (input.some(dateValue => dateValue === null)) {
      return "";
    }

    let dateFormat = "YYYY-MM-DD";

    let placeHolderDate = input.map(dateValue => dayjs(dateValue).format(dateFormat)).join(" ~ ");
    let flag;
    searchContext.facetStrings.map((facet => {
      if(facet.split(":")[0] === facetData?.name) flag=true;
    }))
    if(!flag) setDatePickerValue([null,null]);
    return placeHolderDate;
  };

  // To Reset date range on date range picker
  const  resetValue = (facet) => (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (ref.current) {
      setDatePickerValue([null, null]);
    }

    if (onChange) {
      updateShowClear(false);
      return onChange(facet)(null, null);
    }
  };

  return (<div><div className="title" data-testid={props.data.facet?.name}>
    {props.data.facet?.name}
    <OverlayTrigger
        key={props.data.facet?.name}
        placement="right"
        overlay={<Tooltip data-testid="createdOnTooltip">{props.data.facet?.tooltip}</Tooltip>}
    >
      <InfoCircleFill
          data-testid={"info-" + props.data.facet?.name}
          color="#5d6aaa"
          size={21}
          className="facetInfo"
      />
    </OverlayTrigger>
  </div>
    <span className="dateRangeFacet">
      <DateRangePicker initialSettings={initialSettings} {...{onShow, ref}} onCallback={onChange(props.data.facet)}>
        <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} className="pickerContainer">
          <input type="text" readOnly className="input"
             placeholder={formatPlaceHolder(["Start date", "End date"])}
             value={formatValue(datePickerValue, props.data.facet)}/>
             {!showClear ? <Calendar4 className="calendarIcon" data-testid="calenderIcon"/> :
             <XLg className="clearIcon" data-testid="datetime-picker-reset" onClick={resetValue(props.data.facet)}/>}
        </div>
      </DateRangePicker>
    </span>
  </div>
  );
};

export default DateRangeFacet;
