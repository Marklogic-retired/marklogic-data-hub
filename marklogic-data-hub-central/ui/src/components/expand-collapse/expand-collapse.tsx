import React, {useState} from "react";
import styles from "./expand-collapse.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {FormCheck} from "react-bootstrap";
import {faAngleDoubleDown, faAngleDoubleUp} from "@fortawesome/free-solid-svg-icons";
import {HCTooltip} from "@components/common";

interface Props {
  handleSelection: (option: string) => void;
  currentSelection: string;
}

const ExpandCollapseStyle = {
  height: "32px",
  padding: "8px 12px",
};

const ExpandCollapse: React.FC<Props> = props => {
  let [enabled, setEnabled] = useState(props.currentSelection);

  const onSelect = val => {
    setEnabled(val);
    props.handleSelection(val);
  };

  const cmpRandomData = Math.random().toString(36).substr(2, 5);

  const radioKeyDownHandler = event => {
    if (event.key === "Enter") {
      switch (enabled) {
      case "expand":
        onSelect("collapse");
        break;
      case "collapse":
        onSelect("expand");
        break;
      default:
        onSelect("expand");
        break;
      }
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (enabled === "collapse" || enabled === "") {
        onSelect("expand");
      }
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (enabled === "expand" || enabled === "") {
        onSelect("collapse");
      }
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    }
  };

  return (
    <span id="expand-collapse" aria-label="expand-collapse" onKeyDown={radioKeyDownHandler}>
      <div className={"switch-button-group outline"}>
        <FormCheck
          type="radio"
          id={`expandBtn-${cmpRandomData}`}
          name={`expand-collapse-radiogroup-${cmpRandomData}`}
          defaultChecked={enabled === "expand"}
          className={styles.expandArrow}
        >
          <FormCheck.Input
            type="radio"
            id={`expandBtn-${cmpRandomData}`}
            aria-label={"expandBtn"}
            name={`expand-collapse-radiogroup-${cmpRandomData}`}
            value={"expand"}
            checked={enabled === "expand"}
            onChange={e => onSelect(e.target.value)}
          />
          <HCTooltip text="Expand All" id="collapse-all-tooltip" placement="top">
            <label
              aria-label="radio-button-expand"
              data-testid="expandBtn"
              htmlFor={`expandBtn-${cmpRandomData}`}
              className={`d-flex justify-content-center align-items-center`}
              style={ExpandCollapseStyle}
            >
              <i>
                <FontAwesomeIcon id="expandIcon" icon={faAngleDoubleDown} className={styles.icon} size="xs" />
              </i>
            </label>
          </HCTooltip>
        </FormCheck>
        <FormCheck
          id={`collapseBtn-${cmpRandomData}`}
          name={`collapse-radiogroup-${cmpRandomData}`}
          value={"collapse"}
          checked={enabled === "collapse"}
          className={styles.collapseArrow}
        >
          <FormCheck.Input
            type="radio"
            id={`collapseBtn-${cmpRandomData}`}
            aria-label={"collapseBtn"}
            name={`collapse-radiogroup-${cmpRandomData}`}
            value={"collapse"}
            checked={enabled === "collapse"}
            onChange={e => onSelect(e.target.value)}
          />
          <HCTooltip text="Collapse All" id="collapse-all-tooltip" placement="top">
            <label
              aria-label="radio-button-collapse"
              data-testid="collapseBtn"
              htmlFor={`collapseBtn-${cmpRandomData}`}
              className={`d-flex justify-content-center align-items-center`}
              style={ExpandCollapseStyle}
            >
              <i>
                <FontAwesomeIcon id="collapseIcon" icon={faAngleDoubleUp} className={styles.icon} size="xs" />
              </i>
            </label>
          </HCTooltip>
        </FormCheck>
      </div>
    </span>
  );
};

export default ExpandCollapse;
