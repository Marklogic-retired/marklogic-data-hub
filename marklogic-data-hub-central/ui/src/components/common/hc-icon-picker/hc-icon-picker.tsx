import React from "react";
import * as FontIcon from "react-icons/fa";
import {useState, useEffect, useRef} from "react";
import styles from "./hc-icon-picker.module.scss";
import {DynamicIcons} from "@components/common";

const ignoredImport = ["default", "FaInstalod"];

interface HCIconPickerProps {
  identifier?: string,
  value: string
  onChange: (value: any) => void
  hideSearch?: boolean
}

const HCIconPicker: React.FC<HCIconPickerProps> = ({identifier, value, onChange, hideSearch}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [iconList, setIconList] = useState<string[]>([]);
  const [searchString, setSearchString] = useState("");
  useEffect(() => {
    const tmpIconList: string[] = [];
    for (const iconName in FontIcon) {
      if (!ignoredImport.includes(iconName)) {
        tmpIconList.push(iconName);
      }
    }
    setIconList(tmpIconList);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: any) {
      // @ts-ignore
      if (ref.current && !ref.current.contains(event.target)) {
        setIsVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return (
    <div className={styles.pickerWrapper} ref={ref} data-testid={`${identifier}-hc-icon-picker-wrapper`} onClick={() => setIsVisible(isVisible => !isVisible)}>
      <div className={styles.pickerIcon} data-testid={`${identifier}-${value}-icon-selected`}>
        <DynamicIcons name={value} />
        <div tabIndex={0} onFocus={() => setIsVisible(isVisible => !isVisible)}></div>
      </div>
      {isVisible && (
        <div
          data-testid={`${identifier}-hc-icon-picker-list`}
          className={styles.pickerContainer}
          onClick={(e) => e.stopPropagation()}
        >
          {!hideSearch && (
            <input
              data-testid={`${identifier}-hc-icon-picker-input`}
              className={"form-control"}
              onChange={event => setSearchString(event.target.value)}
              value={searchString}
              placeholder="Search"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsVisible(false);
                  setSearchString("");
                  event.preventDefault();
                }
              }}
            />
          )}
          {iconList
            .filter((i: string) =>
              i.toLowerCase().includes(searchString.toLowerCase())
            )
            .map((icon: string) => (
              <div
                data-testid={`${identifier}-${icon}-icon-option`}
                key={icon}
                className={styles.pickerIcon}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsVisible(false);
                    setSearchString("");
                    event.preventDefault();
                  } else if (event.key === "Enter" || event.key === " ") {
                    onChange(icon);
                    setIsVisible(false);
                    setSearchString("");
                  }
                }}
                onClick={() => {
                  onChange(icon);
                  setIsVisible(false);
                  setSearchString("");
                }}
              >
                <DynamicIcons name={icon} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

HCIconPicker.defaultProps = {
  identifier: "default",
  hideSearch: false,
};

export default HCIconPicker;
