import {Select} from "antd";
import React, {useState, useEffect, useRef, useCallback, CSSProperties} from "react";
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

  //CSS Styles for the select list
  const dropDownWidth = calcDropdownWidth();
  const listStyle:CSSProperties = {
    width: dropDownWidth,
  };

  const dropDownStyle: CSSProperties = {
    maxHeight: "200px",
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
      return {lineHeight: "2vh", textOverflow: "clip", textIndent: props.indentList[index]+"px"};
    } else {
      return {lineHeight: "2vh", textOverflow: "clip"};
    }
  };
    /* props.srcData requires an array of tuple instead of a flat array to handle duplicate values */
  return (
    <div ref={node}>
      {menuVisible && <Select
        id="dropdownList"
        open={selList}
        showSearch
        style={listStyle}
        getPopupContainer={triggerNode => triggerNode.parentNode ? triggerNode.parentNode : node.current}
        suffixIcon={<FontAwesomeIcon icon={faSearch} size="2x" className={styles.searchIcon}/>}
        dropdownMenuStyle={dropDownStyle}
        dropdownClassName={styles.dropDownStyle}
        value={null}
        onChange={props.onItemSelect}
      >
        {props.srcData.map((element, index) =>
          <Select.Option
            data-testid = {element.value + "-option"}
            style={optionsStyle(index)}
            key={element.key}
          >
            {formatDropdownText(element.value, index)}
            {<HCTooltip text="Multiple" data-testid={element.value + "Multiple-option-tooltip"} id="multiple-option-tooltip" placement="top">
              <img data-testid={element.value + "-optionIcon"} src={element.struct ? arrayIcon : "" } alt={""}/>
            </HCTooltip>}
          </Select.Option>
        )}
      </Select>  }
    </div>
  );
};

export default DropDownWithSearch;
