import React, {useState} from "react";
import {Radio} from "antd";
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
      <Radio.Group
        buttonStyle="outline"
        className={"radioGroupView"}
        defaultValue={view}
        name="radiogroup"
        onChange={e => onChange(e.target.value)}
        size="large"
        style={{color: "#999"}}
        // tabIndex={0}
      >
        <Radio.Button aria-label="switch-view-card" value={"card"} checked={view === "card"}>
          <i>{<FontAwesomeIcon icon={faThLarge} />}</i>
        </Radio.Button>
        <Radio.Button aria-label="switch-view-list" value={"list"} checked={view === "list"}>
          <i>{<FontAwesomeIcon icon={faTable} />}</i>
        </Radio.Button>
      </Radio.Group>
    </div>

  );
};

export default SwitchView;
