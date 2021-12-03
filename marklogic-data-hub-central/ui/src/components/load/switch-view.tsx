import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThLarge, faTable} from "@fortawesome/free-solid-svg-icons";
import "./switch-view.scss";

interface Props {
    handleSelection: any,
    defaultView: string,
}

const SwitchView: React.FC<Props> = (props) => {
  let [view, setView] = useState(props.defaultView);

  const onChange = (val) => {
    setView(val);
    props.handleSelection(val);
  };

  const radioKeyDownHandler = (event) => {
    if (event.key === "Enter") {
      switch (view) {
      case "list":
        onChange("card");
        break;
      case "card":
        onChange("list");
        break;
      default:
        // should not ever reach this code
        // do nothing
        break;
      }
    }

    if (event.key === "ArrowLeft") {
      // stops default react radio button controls
      event.preventDefault();

      if (view === "list") { onChange("card"); }
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();

      if (view === "card") { onChange("list"); }
    }

    // disable up and down arrow default controls on radio buttons
    if (event.key === "ArrowUp" || event.key === "ArrowDown") { event.preventDefault(); }
  };

  return (
    <div id="switch-view" aria-label="switch-view" onKeyDown={radioKeyDownHandler}>
      <div className={"switch-button-group outline"}>
        <span>
          <input
            type="radio"
            id="switch-view-card"
            name="switch-view-radiogroup"
            value={"card"}
            checked={view === "card"}
            onChange={e => onChange(e.target.value)}
          />
          <label aria-label="switch-view-card" htmlFor="switch-view-card" className={`d-flex justify-content-center align-items-center`} style={{height: "40px", fontSize: "22px"}}>
            <i>{<FontAwesomeIcon icon={faThLarge} />}</i>
          </label>
        </span>

        <span>
          <input
            type="radio"
            id="switch-view-list"
            name="switch-view-radiogroup"
            value={"list"}
            checked={view === "list"}
            onChange={e => onChange(e.target.value)}
          />
          <label aria-label="switch-view-list" htmlFor="switch-view-list" className={`d-flex justify-content-center align-items-center`} style={{height: "40px", fontSize: "24px"}}>
            <i>{<FontAwesomeIcon icon={faTable} />}</i>
          </label>
        </span>
      </div>
    </div>

  );
};

export default SwitchView;
