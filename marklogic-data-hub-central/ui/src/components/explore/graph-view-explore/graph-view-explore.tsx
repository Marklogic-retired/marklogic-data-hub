import {HCCheckbox, HCTooltip} from "@components/common";
import React, {CSSProperties, useEffect, useContext, useState} from "react";
import {getViewSettings, setViewSettings} from "@util/user-context";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import FormCheck from "react-bootstrap/FormCheck";
import GraphExploreSidePanel from "../graph-explore-side-panel/graph-explore-side-panel";
import GraphVisExplore from "../graph-vis-explore/graph-vis-explore";
import {ModelingTooltips} from "@config/tooltips.config";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {SearchContext} from "@util/search-context";
import SplitPane from "react-split-pane";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import styles from "./graph-view-explore.module.scss";
import {themeColors} from "@config/themes.config";
import tooltipsConfig from "@config/explorer-tooltips.config";
import {getEnvironment} from "@util/environment";

type Props = {
  entityTypeInstances: any;
  graphConceptsSearchSupported: boolean;
  graphView: any;
  setViewConcepts: (viewConcepts: boolean) => void;
  setPhysicsAnimation: (physicsAnimation: boolean) => void;
  setGraphPageInfo: (pageInfo: any) => void;
  setIsLoading: (loading: boolean) => void;
  entitiesWithRelatedConcepts: any;
};

const {graphViewTooltips} = tooltipsConfig;

const GraphViewExplore: React.FC<Props> = (props) => {
  const storage = getViewSettings();
  const {entityTypeInstances, graphView, setGraphPageInfo, setIsLoading} = props;

  const [viewRelationshipLabels, toggleRelationShipLabels] = useState(storage.explore?.graphView?.relationshipLabels !== undefined ? storage.explore?.graphView?.relationshipLabels : true);
  const [exportPngButtonClicked, setExportPngButtonClicked] = useState(false);
  const [viewConcepts, toggleConcepts] = useState(storage.explore?.graphView?.concepts !== undefined ? storage.explore?.graphView?.concepts : true);
  const [physicsAnimation, togglePhysicsAnimation] = useState(storage.explore?.graphView?.physicsAnimation !== undefined? storage.explore?.graphView?.physicsAnimation : true);
  const {exploreSidebar} = tooltipsConfig;


  const {
    savedNode,
    setSavedNode
  } = useContext(SearchContext);

  const headerButtons = <span className={styles.buttons}>
    <HCTooltip text={ModelingTooltips.exportGraph} id="export-graph-icon-tooltip" placement="top">
      <i>{<FontAwesomeIcon className={styles.graphExportIcon} icon={faFileExport} aria-label="graph-export" onClick={() => { setExportPngButtonClicked(true); }} />}</i>
    </HCTooltip>
  </span>;

  const splitPaneStyles = {
    pane1: {minWidth: "150px", maxWidth: "99.9%"},
    pane2: {minWidth: "140px", maxWidth: "90%"},
    pane: {overflow: "auto"},
  };

  const splitStyle: CSSProperties = {
    position: "relative",
    height: "none",
    backgroundColor: "#fff",
  };

  useEffect(() => {
    props.setViewConcepts(viewConcepts);
  }, [viewConcepts]);

  useEffect(() => {
    props.setPhysicsAnimation(physicsAnimation);
  }, [physicsAnimation]);

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
    setViewSettings({
      ...storage,
      explore: {
        ...storage.explore,
        graphView: {...storage.explore?.graphView, relationshipLabels: e.target.checked}
      }
    });
    toggleRelationShipLabels(e.target.checked);
  };

  const handleConceptsView = (e) => {
    setViewSettings({
      ...storage,
      explore: {
        ...storage.explore,
        graphView: {...storage.explore?.graphView, concepts: e.target.checked}
      }
    });
    toggleConcepts(e.target.checked);
    onCloseSidePanel();
  };

  const handlePhysicsAnimation = (e) => {
    setViewSettings({
      ...storage,
      explore: {
        ...storage.explore,
        graphView: {...storage.explore?.graphView, physicsAnimation: e.target.checked}
      }
    });
    togglePhysicsAnimation(e.target.checked);
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
    {!props.graphConceptsSearchSupported ?
      <HCCheckbox
        id="concepts-switch"
        label="Concepts"
        ariaLabel="concepts-switch"
        value={false}
        checked={false}
        cursorDisabled={true}
        tooltip={exploreSidebar.versionLimitedConcepts(getEnvironment().marklogicVersion)}
        handleClick={() => { return; }}
      />
      :
      <HCCheckbox
        id="concepts-switch"
        label="Concepts"
        ariaLabel="concepts-switch"
        tooltip={null}
        value={viewConcepts}
        checked={viewConcepts}
        handleClick={(e) => handleConceptsView(e)}
      />
    }
  </FormCheck>
  <HCTooltip id="concept" text={graphViewTooltips.concept} placement="top">
    <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.infoIcon} />
  </HCTooltip>
  </div>;

  const physicsAnimationSwitch = <div className={styles.switchContainer}><FormCheck
    id="physics-animation"
    type="switch"
  >
    <HCCheckbox
      id="physics-animation-id"
      label="Physics animation"
      value={physicsAnimation}
      checked={physicsAnimation}
      handleClick={(e) => handlePhysicsAnimation(e)}
      data-testid="physicsAnimation"
    />
  </FormCheck>
  <HCTooltip id="physics-animation-tooltip" text={graphViewTooltips.physicsAnimation} placement="top">
    <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.infoIcon} />
  </HCTooltip>
  </div>;

  const conceptsExist = () => {
    let hasConcepts = false;
    if (props.entitiesWithRelatedConcepts?.entities) {
      for (let elem of props.entitiesWithRelatedConcepts?.entities) {
        if (elem.relatedConcepts.length) {
          hasConcepts = true;
          break;
        }
      }
    }
    return hasConcepts;
  };

  const graphSwitches = <div className={styles.graphSwitches}>
    <span>{relationshipLabelsSwitch}</span>
    <span className={conceptsExist() ? styles.disabledSwitch : ""}>{conceptsSwitch}</span>
    <span>{physicsAnimationSwitch}</span>
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
            exportPngButtonClicked={exportPngButtonClicked}
            setExportPngButtonClicked={setExportPngButtonClicked}
            setGraphPageInfo={setGraphPageInfo}
            viewConcepts={viewConcepts}
            physicsAnimation={physicsAnimation}
            setIsLoading={setIsLoading}
          />
        </div>
      </div>
      )
  );

  const onCloseSidePanel = async () => {
    setSavedNode(undefined);
  };

  const sidePanel = (<div>
    <GraphExploreSidePanel onCloseSidePanel={onCloseSidePanel} graphView={graphView} />
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
