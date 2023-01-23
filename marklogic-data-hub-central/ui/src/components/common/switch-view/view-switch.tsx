import React, {FC} from "react";
import {faProjectDiagram, faTable, faStream, faThLarge} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {HCTooltip} from "@components/common";
import {ViewType} from "../../../types/modeling-types";
import styles from "./view-switch.module.scss";

interface Props {
  handleViewChange: any;
  selectedView: ViewType;
  snippetView?: boolean;
  loadTile?: boolean;
}


const style = {height: "40px", fontSize: "10px"};
const className = "d-flex justify-content-center align-items-center";

const ViewSwitch: FC<Props> = ({handleViewChange, selectedView, snippetView, loadTile}) => {
  return (<div id="switch-view" aria-label="switch-view" >
    {loadTile ? (
      <div className={"switch-button-group outline"}>
        <span>
          <input
            type="radio"
            id="switch-view-card"
            name="switch-view-radiogroup"
            key={ViewType.card}
            value={"card"}
            checked={selectedView === ViewType.card}
            onChange={e => handleViewChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                handleViewChange(ViewType.card);
              }
            }}
          />
          <label aria-label="switch-view-card" htmlFor="switch-view-card" className={`${className} ${styles.leftButton}`} style={{height: "40px", fontSize: "22px"}}>
            <i>{<FontAwesomeIcon icon={faThLarge} />}</i>
          </label>
        </span>
        <span>
          <input
            type="radio"
            id="switch-view-list"
            name="switch-view-radiogroup-list"
            key={ViewType.list}
            value={"list"}
            checked={selectedView === ViewType.list}
            onChange={e => handleViewChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                handleViewChange(ViewType.list);
              }
            }}
          />
          <HCTooltip text="List View" id="list-view-tooltip" placement="top">
            <label aria-label="switch-view-list" htmlFor="switch-view-list" className={`${className} ${styles.rightButton}`} id={"listView"} style={style}>
              <i data-cy="table-view">
                <FontAwesomeIcon icon={faTable} size={"2x"} />
              </i>
            </label>
          </HCTooltip>
        </span>
      </div>
    ) : (<div className={"switch-button-group outline"}>
      <span tabIndex={0} onKeyDown={(event) => {
        if (event.key === "Enter"|| event.key === " ") { handleViewChange("graph"); }
      }}>
        <input
          type="radio"
          id="switch-view-graph"
          name="switch-view-radiogroup-graph"
          key={"graph-view"}
          value={"graph"}
          checked={selectedView === ViewType.graph}
          onChange={e => handleViewChange(e.target.value)}
          tabIndex={-1}
        />
        <HCTooltip text="Graph View" id="graph-view-tooltip" placement="top">
          <label aria-label="switch-view-graph" htmlFor="switch-view-graph" className={`${className} ${styles.leftButton}`} id={"graphView"} style={style}>
            <i data-cy="graph-view">
              <FontAwesomeIcon icon={faProjectDiagram} size={"2x"} />
            </i>
          </label>
        </HCTooltip>
      </span>
      <span tabIndex={0} onKeyDown={(event) => {
        if (event.key === "Enter"|| event.key === " ") { handleViewChange("table"); }
      }}>
        <input
          type="radio"
          id="switch-view-table"
          name="switch-view-radiogroup-table"
          key={ViewType.table}
          value={"table"}
          checked={selectedView === ViewType.table}
          onChange={e => handleViewChange(e.target.value)}
          tabIndex={-1}
        />
        <HCTooltip text="Table View" id="table-view-tooltip" placement="top">
          <label aria-label="switch-view-table" htmlFor="switch-view-table" className={`${className} ${!snippetView && styles.rightButton}`} id={"tableView"} style={style}>
            <i data-cy="table-view">
              <FontAwesomeIcon icon={faTable} size={"2x"} />
            </i>
          </label>
        </HCTooltip>
      </span>

      {snippetView &&
        (<span>
          <input
            type="radio"
            id="switch-view-snippet"
            name="switch-view-radiogroup-sippet"
            value={"snippet"}
            checked={selectedView === ViewType.snippet}
            key={ViewType.snippet}
            onChange={e => handleViewChange(e.target.value)}
          />
          <HCTooltip text="Snippet View" id="snippet-view-tooltip" placement="top">
            <label aria-label="switch-view-snippet" htmlFor="switch-view-snippet" className={`${className} ${styles.rightButton}`} id={"snippetView"} style={style}>
              <i data-cy="facet-view">
                <FontAwesomeIcon icon={faStream} size={"2x"} />
              </i>
            </label>
          </HCTooltip>
        </span>)}
    </div>)}
  </div>);
};

export default ViewSwitch;