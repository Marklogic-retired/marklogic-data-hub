import React, {useState} from "react";
import {MLRadio, MLTooltip} from "@marklogic/design-system";
import styles from "./expand-collapse.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDoubleDown, faAngleDoubleUp} from "@fortawesome/free-solid-svg-icons";

interface Props {
  handleSelection: (option: string) => void;
  currentSelection: string;
}

const ExpandCollapse: React.FC<Props> = (props) => {

  let [enabled, setEnabled] = useState(props.currentSelection);

  const onSelect = (val) => {
    setEnabled(val);
    props.handleSelection(val);
  };

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
      <MLRadio.MLGroup
        buttonStyle="outline"
        className={"radioGroupView"}
        // defaultValue={enabled}
        name="radiogroup"
        onChange={e => onSelect(e.target.value)}
        size="small"
        tabIndex={0}
      >
        <MLRadio.MLButton id="expandBtn" data-testid="expandBtn" aria-label="radio-button-expand" value={"expand"} checked={enabled === "expand"} >
          <MLTooltip title={"Expand All"}>
            {<FontAwesomeIcon
              id="expandIcon"
              icon={faAngleDoubleDown}
              className={styles.icon}
              size="sm" />}
          </MLTooltip>
        </MLRadio.MLButton>
        <MLRadio.MLButton id="collapseBtn" data-testid="collapseBtn" aria-label="radio-button-collapse" value={"collapse"} checked={enabled === "collapse"} >
          <MLTooltip title={"Collapse All"}>
            {<FontAwesomeIcon
              id="collapseIcon"
              icon={faAngleDoubleUp}
              className={styles.icon}
              size="sm" />}
          </MLTooltip>
        </MLRadio.MLButton>
      </MLRadio.MLGroup>
    </span>
  );
};

export default ExpandCollapse;