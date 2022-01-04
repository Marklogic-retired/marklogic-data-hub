import React, {useState, useEffect, useRef, useCallback} from "react";
import Select, {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "../../../config/react-select-theme.config";
import styles from "./dropdownWithSearch.module.scss";
import arrayIcon from "../../../assets/icon_array.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import HCTooltip from "../hc-tooltip/hc-tooltip";

const DropDownWithSearch = (props) => {

  const node: any = useRef();
  const [selList, setSelList] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [eventValid, setEventValid] = useState(false);

  //handle callback from event listeners
  const handleOuterClick = useCallback(
    e => {
      if (node.current && !node.current.contains(e.target)) {
        props.setDisplaySelectList(prev => false);
        props.setDisplayMenu(prev => false);
        setEventValid(prev => false);
      }
    }, []
  );

  const charToPxScalingFactor = 9;
  const maxWidth = 400;
  const minWidth = 168;

  // calculates width of dropdown in 'px' based on length of displayed elements
  const calcDropdownWidth = () => {
    if (props.indentList && props.srcData) {
      let maxStringLengthInPx = 0;
      props.srcData.map((element, index) => maxStringLengthInPx = Math.max(maxStringLengthInPx, element.value.length * charToPxScalingFactor + props.indentList[index]));
      if (maxStringLengthInPx > maxWidth) return maxWidth.toString() + "px";
      if (maxStringLengthInPx < minWidth) return minWidth.toString() + "px";
      return maxStringLengthInPx.toString() + "px";
    }
    if (props.modelling) {
      let cardWidth = "204px";
      return cardWidth;
    }
    return minWidth.toString() + "px";
  };

  // truncates and adds ellipsis for dropdown text
  const formatDropdownText = (text, index) => {
    let indentVal;
    props.indentList ? indentVal = props.indentList[index] : indentVal = 0;
    if ((text.length * charToPxScalingFactor) + indentVal > maxWidth) {
      for (let i = text.length; i > 0; i--) {
        if (((i + 3) * charToPxScalingFactor) + indentVal < maxWidth) return text.substring(0, i) + "...";
      }
    }
    return text;
  };

  useEffect(() => {
    setSelList(prev => props.setDisplaySelectList);
    setMenuVisible(prev => props.setDisplayMenu);
    if (props.setDisplaySelectList) {
      setEventValid(prev => true);
    }
  }, [props.setDisplaySelectList, props.setDisplayMenu]);

  //Handling click event outside the Dropdown Menu
  useEffect(() => {
    if (eventValid) {
      document.addEventListener("click", handleOuterClick);
    }

    return () => {
      document.removeEventListener("click", handleOuterClick);
    };
  });

  const optionsStyle = (index) => {
    if (props.indentList) {
      return {lineHeight: "2vh", textOverflow: "clip", paddingLeft: props.indentList[index]+"px"};
    } else {
      return {lineHeight: "2vh", textOverflow: "clip"};
    }
  };

  const MenuList  = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const DropdownIndicator = innerProps => {
    return (
      <SelectComponents.DropdownIndicator {...innerProps}>
        <FontAwesomeIcon icon={faSearch} size="2x" className={styles.searchIcon}/>
      </SelectComponents.DropdownIndicator>
    );
  };

  const dropdownListOptions = props.srcData.map((element, index) => {
    let value = formatDropdownText(element.value, index);
    return {value: element.key, testId: element.value, label: value, index, struct: element.struct};
  });

  /* props.srcData requires an array of tuple instead of a flat array to handle duplicate values */
  return (
    <div ref={node}>
      {menuVisible && <Select
        id="dropdownList-select-wrapper"
        inputId="dropdownList-select"
        components={{MenuList: props => MenuList("dropdownList", props), DropdownIndicator}}
        menuIsOpen={selList}
        aria-label="dropdownList-select-wrapper"
        isSearchable
        onChange={props.onItemSelect}
        options={dropdownListOptions}
        formatOptionLabel={(element: any) => {
          return (
            <span data-testid={element.testId + "-option"} style={optionsStyle(element.index)} role={"option"}>
              {element.label}
              {<HCTooltip text="Multiple" data-testid={element.testId + "Multiple-option-tooltip"} id="multiple-option-tooltip" placement="top">
                <img data-testid={element.testId + "-optionIcon"} src={element.struct ? arrayIcon : "" } alt={""}/>
              </HCTooltip>}
            </span>
          );
        }}
        styles={{...reactSelectThemeConfig,
          container: (provided, state) => ({
            ...provided,
            width: calcDropdownWidth(),
          }),
        }}
      />}
    </div>
  );
};

export default DropDownWithSearch;
