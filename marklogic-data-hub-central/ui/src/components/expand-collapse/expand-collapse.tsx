import React, {useState} from "react";
import styles from "./expand-collapse.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDoubleDown, faAngleDoubleUp} from "@fortawesome/free-solid-svg-icons";
import {HCTooltip} from "@components/common";

interface Props {
  handleSelection: (option: string) => void;
  currentSelection: string;
}

const ExpandCollapseStyle = {
  height: "32px",
  padding: "8px 12px"
};

const ExpandCollapse: React.FC<Props> = (props) => {
  let [enabled, setEnabled] = useState(props.currentSelection);

  const onSelect = (val) => {
    setEnabled(val);
    props.handleSelection(val);
  };

  const cmpRandomData = Math.random().toString(36).substr(2, 5);

  const radioKeyDownHandler = (event) => {
    if (event.key === "Enter") {
      switch (enabled) {
      case "expand":
        onSelect("collapse");
        break;
      case "collapse":
        onSelect("expand");
        break;
      default:
        break;
      }
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (enabled === "collapse") { onSelect("expand"); }
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (enabled === "expand") { onSelect("collapse"); }
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") { event.preventDefault(); }
  };

  return (
    <span id="expand-collapse" aria-label="expand-collapse" onKeyDown={radioKeyDownHandler}>
      <div className={"switch-button-group outline"}>
        <span>
          <input
            type="radio"
            id={`expandBtn-${cmpRandomData}`}
            name={`expand-collapse-radiogroup-${cmpRandomData}`}
            value={"expand"}
            checked={enabled === "expand"}
            onChange={e => onSelect(e.target.value)}
          />
          <HCTooltip text="Expand All" id="collapse-all-tooltip" placement="top">
            <label aria-label="radio-button-expand" data-testid="expandBtn" htmlFor={`expandBtn-${cmpRandomData}`} className={`d-flex justify-content-center align-items-center`} style={ExpandCollapseStyle}>
              <i>
                <FontAwesomeIcon
                  id="expandIcon"
                  icon={faAngleDoubleDown}
                  className={styles.icon}
                  size="xs" />
              </i>
            </label>
          </HCTooltip>
        </span>

        <span>
          <input
            type="radio"
            id={`collapseBtn-${cmpRandomData}`}
            name={`expand-collapse-radiogroup-${cmpRandomData}`}
            value={"collapse"}
            checked={enabled === "collapse"}
            onChange={e => onSelect(e.target.value)}
          />
          <HCTooltip text="Collapse All" id="collapse-all-tooltip" placement="top">
            <label aria-label="radio-button-collapse" data-testid="collapseBtn" htmlFor={`collapseBtn-${cmpRandomData}`} className={`d-flex justify-content-center align-items-center`} style={ExpandCollapseStyle}>
              <i>
                <FontAwesomeIcon
                  id="collapseIcon"
                  icon={faAngleDoubleUp}
                  className={styles.icon}
                  size="xs" />
              </i>
            </label>
          </HCTooltip>
        </span>
      </div>
    </span>
  );
};

export default ExpandCollapse;