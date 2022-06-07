import React, {CSSProperties, useContext, useState} from "react";
import styles from "./graph-view-explore.module.scss";
import FormCheck from "react-bootstrap/FormCheck";
import SplitPane from "react-split-pane";
import GraphVisExplore from "./graph-vis-explore/graph-vis-explore";
import {HCCheckbox, HCTooltip} from "@components/common";
import GraphExploreSidePanel from "./graph-explore-side-panel/graph-explore-side-panel";
import {SearchContext} from "@util/search-context";
import {ModelingTooltips} from "@config/tooltips.config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {themeColors} from "@config/themes.config";
import tooltipsConfig from "@config/explorer-tooltips.config";


type Props = {
  entityTypeInstances: any;
  graphView: any;
  setGraphPageInfo: (pageInfo: any) => void;
};

const {graphViewTooltips} = tooltipsConfig;

const GraphViewExplore: React.FC<Props> = (props) => {
  const {entityTypeInstances, graphView, setGraphPageInfo} = props;

  const [viewRelationshipLabels, toggleRelationShipLabels] = useState(true);
  const [exportPngButtonClicked, setExportPngButtonClicked] = useState(false);
  const [viewConcepts, toggleConcepts] = useState(true);

  const {
    savedNode,
    setSavedNode
  } = useContext(SearchContext);

  const headerButtons = <span className={styles.buttons}>
    <HCTooltip text={ModelingTooltips.exportGraph} id="export-graph-icon-tooltip" placement="top">
      <i>{<FontAwesomeIcon className={styles.graphExportIcon} icon={faFileExport} aria-label="graph-export" onClick={() => { setExportPngButtonClicked(true); }}/>}</i>
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

  const splitPaneProps = () => {
    let defaultProps: any = {
      style: splitStyle,
      paneStyle: splitPaneStyles.pane,
      allowResize: true,
      resizerClassName: styles.resizerStyle,
      pane1Style: splitPaneStyles.pane1,
      split: "vertical",
      defaultSize: "100%"
    };
    if (savedNode) {
      defaultProps["primary"] = "first";
      defaultProps["pane2Style"] = splitPaneStyles.pane2;
      defaultProps["defaultSize"] = "70%";
    }
    return defaultProps;
  };

  const handleRelationshipLabelView = (e) => {
    toggleRelationShipLabels(e.target.checked);
  };

  const handleConceptsView = (e) => {
    toggleConcepts(e.target.checked);
    onCloseSidePanel();
  };

  const relationshipLabelsSwitch = <div className={styles.switchContainer}><FormCheck
    id="relationship-label"
    type="switch"
  >
    <HCCheckbox
      id="relationship-label-id"
      label="Relationship names"
      value={viewRelationshipLabels}
      checked={viewRelationshipLabels}
      handleClick={(e) => handleRelationshipLabelView(e)}
      data-testid="viewRelationshipLabels"
    />
  </FormCheck>
  <HCTooltip id="relationship-label" text={graphViewTooltips.relationshipLabel} placement="top">
    <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.infoIcon} />
  </HCTooltip>
  </div>;

  const conceptsSwitch = <div className={styles.switchContainer}><FormCheck
    id="toggle-concepts"
    type="switch"
  >
    <HCCheckbox
      id="concepts-switch"
      label="Concepts"
      value={viewConcepts}
      checked={viewConcepts}
      handleClick={(e) => handleConceptsView(e)}
    />
  </FormCheck>
  <HCTooltip id="concept" text={graphViewTooltips.concept} placement="top">
    <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.infoIcon} />
  </HCTooltip>
  </div>
  ;

  const graphSwitches = <div className={styles.graphSwitches}>
    <span>{relationshipLabelsSwitch}</span>
    <span>{conceptsSwitch}</span>
  </div>;

  const graphViewExploreMainPanel = (
    !Object.keys(entityTypeInstances).length
      ? <span></span>
      : (<div className={styles.graphViewExploreContainer}>
        <div className={styles.graphHeader}>
          {graphSwitches}
          {headerButtons}
        </div>
        <div className={styles.borderBelowHeader}></div>
        <div>
          <GraphVisExplore
            entityTypeInstances={entityTypeInstances}
            graphView={graphView}
            viewRelationshipLabels={viewRelationshipLabels}
            exportPngButtonClicked = {exportPngButtonClicked}
            setExportPngButtonClicked = {setExportPngButtonClicked}
            setGraphPageInfo = {setGraphPageInfo}
            viewConcepts={viewConcepts}
          />
        </div>
      </div>
      )
  );

  const onCloseSidePanel = async () => {
    setSavedNode(undefined);
  };

  const sidePanel = (<div>
    <GraphExploreSidePanel onCloseSidePanel={onCloseSidePanel} graphView={graphView}/>
  </div>);

  return (
    <SplitPane
      {...splitPaneProps()}
    >
      {graphViewExploreMainPanel}
      {savedNode ? sidePanel : <></>}
    </SplitPane>
  );
};

export default GraphViewExplore;
