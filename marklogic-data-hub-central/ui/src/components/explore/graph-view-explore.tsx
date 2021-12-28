import React, {CSSProperties, useContext, useState} from "react";
import styles from "./graph-view-explore.module.scss";
import FormCheck from "react-bootstrap/FormCheck";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import SplitPane from "react-split-pane";
import {ModelingTooltips} from "../../config/tooltips.config";
import GraphVisExplore from "./graph-vis-explore/graph-vis-explore";
import {HCTooltip} from "@components/common";
import GraphExploreSidePanel from "./graph-explore-side-panel/graph-explore-side-panel";
import {SearchContext} from "../../util/search-context";


type Props = {
  entityTypesInstances: any;
  graphView: any;
  coords: any[];
  setCoords: (coords: any[]) => void;
};

const GraphViewExplore: React.FC<Props> = (props) => {

  const [splitPaneResized, setSplitPaneResized] = useState(false);
  //const selectedEntityInstance = false; // To be moved to explorer context

  const {
    savedNode,
    setSavedNode
  } = useContext(SearchContext);

  const headerButtons = <span className={styles.buttons}>
    <HCTooltip text={ModelingTooltips.exportGraph} id="export-graph-icon" placement="top">
      <i>{<FontAwesomeIcon className={styles.graphExportIcon} icon={faFileExport} aria-label="graph-export"/>}</i>
    </HCTooltip>
  </span>;

  const splitPaneStyles = {
    pane1: {minWidth: "150px"},
    pane2: {minWidth: "140px", maxWidth: "90%"},
    pane: {overflow: "auto"},
  };

  const splitStyle: CSSProperties = {
    position: "relative",
    height: "none",
  };

  const HCSwitch = <FormCheck
    id="relationship-label"
    type="switch"
    style={{display: "flex", alignItems: "center", gap: "6px"}}
  >
    <FormCheck.Input
      type="checkbox"
      // value={value}
      // checked={checked}
      // onChange={(e) => handleClick(e)}
      // data-testid={dataTestId}
      style={{marginTop: "0", verticalAlign: "middle"}}
    />
  Relationship labels
  </FormCheck>;

  const relationshipsToggle = <span>{HCSwitch}</span>;

  const graphViewExploreMainPanel = (
    Array.isArray(props.entityTypesInstances)
      ? <span></span>
      : (<div className={styles.graphViewExploreContainer}>
        <div className={styles.graphHeader}>
          {relationshipsToggle}
          {headerButtons}
        </div>
        <div className={styles.borderBelowHeader}></div>
        <div>
          <GraphVisExplore
            entityTypeInstances={props.entityTypesInstances}
            splitPaneResized={splitPaneResized}
            setSplitPaneResized={setSplitPaneResized}
            graphView={props.graphView}
            coords={props.coords}
            setCoords={props.setCoords}
          />
        </div>
      </div>
      )
  );

  const handleSplitPaneResize = () => {
    setSplitPaneResized(true);
  };

  const onCloseSidePanel = async () => {
    setSavedNode(undefined);
  };

  return (
    !savedNode ? graphViewExploreMainPanel :
      <SplitPane
        style={splitStyle}
        paneStyle={splitPaneStyles.pane}
        allowResize={true}
        resizerClassName={styles.resizerStyle}
        pane1Style={splitPaneStyles.pane1}
        pane2Style={splitPaneStyles.pane2}
        split="vertical"
        primary="first"
        defaultSize="70%"
        onDragFinished={handleSplitPaneResize}
      >
        {graphViewExploreMainPanel}
        <div>
          {/* add code for side panel here */}
          <GraphExploreSidePanel onCloseSidePanel={onCloseSidePanel} graphView={props.graphView}/>
        </div>
      </SplitPane>
  );
};

export default GraphViewExplore;
