import React, {FC} from "react";
import {faProjectDiagram, faTable, faStream} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {HCTooltip} from "@components/common";
import {ViewType} from "../../../types/modeling-types";

interface Props {
  handleViewChange: any;
  selectedView: ViewType;
  snippetView?: boolean;
}


const style = {height: "40px", fontSize: "10px"};
const className = "d-flex justify-content-center align-items-center";

const ViewSwitch: FC<Props> = ({handleViewChange, selectedView, snippetView}) => {

  return (<div id="switch-view-explorer" aria-label="switch-view" >
    <div className={"switch-button-group outline"}>
      <span>
        <input
          type="radio"
          id="switch-view-graph"
          name="switch-view-radiogroup"
          key={"graph-view"}
          value={"graph"}
          checked={selectedView === ViewType.graph}
          onChange={e => handleViewChange(e.target.value)}
        />
        <HCTooltip text="Graph View" id="graph-view-tooltip" placement="top">
          <label aria-label="switch-view-graph" htmlFor="switch-view-graph" className={className} id={"graphView"} style={style}>
            <i data-cy="graph-view">
              <FontAwesomeIcon icon={faProjectDiagram} size={"2x"} />
            </i>
          </label>
        </HCTooltip>
      </span>

      <span>
        <input
          type="radio"
          id="switch-view-table"
          name="switch-view-radiogroup"
          key={ViewType.table}
          value={"table"}
          checked={selectedView === ViewType.table}
          onChange={e => handleViewChange(e.target.value)}
        />
        <HCTooltip text="Table View" id="table-view-tooltip" placement="top">
          <label aria-label="switch-view-table" htmlFor="switch-view-table" className={className} id={"tableView"} style={style}>
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
            name="switch-view-radiogroup"
            value={"snippet"}
            checked={selectedView === ViewType.snippet}
            key={ViewType.snippet}
            onChange={e => handleViewChange(e.target.value)}
          />
          <HCTooltip text="Snippet View" id="snippet-view-tooltip" placement="top">
            <label aria-label="switch-view-snippet" htmlFor="switch-view-snippet" className={className} id={"snippetView"} style={style}>
              <i data-cy="facet-view">
                <FontAwesomeIcon icon={faStream} size={"2x"} />
              </i>
            </label>
          </HCTooltip>
        </span>)}
    </div>
  </div>);
};

export default ViewSwitch;