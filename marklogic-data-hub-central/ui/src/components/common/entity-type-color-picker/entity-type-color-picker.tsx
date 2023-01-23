import React, {useState, useEffect, useRef, useCallback} from "react";
import styles from "./entity-type-color-picker.module.scss";
import {TwitterPicker} from "react-color";
import graphConfig from "@config/graph-vis.config";

type Props = {
  entityType: string;
  color: string;
  handleColorChange: (row, event, column) => void;
};

const EntityTypeColorPicker: React.FC<Props> = ({entityType, color, handleColorChange}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEventValid, setIsEventValid] = useState(false);
  const colorRef: any = useRef();

  const handleOuterClick = useCallback(
    e => {
      if (colorRef.current && !colorRef.current.contains(e.target)) {
        // Clicked outside the color picker menu
        setIsVisible(prev => false);
        setIsEventValid(prev => false);
      }
    }, []);

  useEffect(() => {
    if (isEventValid) {
      document.addEventListener("click", handleOuterClick);
    }
    return () => {
      document.removeEventListener("click", handleOuterClick);
    };
  });

  const handleEditColorMenu = (e) => {
    if (e?.target?.tagName.toLowerCase() === "input") {
      setIsVisible(prev => true);
    } else {
      setIsVisible(prev => !isVisible);
      setIsEventValid(prev => true);
    }
  };

  const handleChange = (row, event, column) => {
    setIsEventValid(false);
    handleColorChange(row, event, column);
  };

  return <div className={"m-auto d-inline-block"}>
    <div className={`${styles.colorPickerBorder} cursor-pointer`} onClick={handleEditColorMenu} onBlur={() => setIsVisible(false)} id={`${entityType}-color-button`} data-testid={`${entityType}-color-button`} aria-label={`${entityType}-color-button`} data-color={color}>
      <div data-testid={`${entityType}-color`} style={{width: "32px", height: "30px", background: color, margin: "8px"}}>
      </div>
      {isVisible ?
        <div ref={colorRef} id={`${entityType}-color-picker-menu`}
          aria-label={`${entityType}-color-picker-menu`} className={styles.colorPickerContainer}>
          <TwitterPicker colors={graphConfig.colorOptionsArray} color={color} onChangeComplete={handleChange}/>
        </div> : null
      }
    </div>
  </div>;
};

export default EntityTypeColorPicker;