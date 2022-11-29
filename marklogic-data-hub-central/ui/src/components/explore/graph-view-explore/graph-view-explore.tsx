import {HCCheckbox, HCTooltip, HCAlert} from "@components/common";
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
import {previewMatchingActivity, getDocFromURI, getPreviewFromURIs} from "@api/matching";
import {unmergeUri} from "@api/merging";
import CompareValuesModal from "@components/entities/matching/compare-values-modal/compare-values-modal";
import {AuthoritiesContext} from "@util/authorities";

type Props = {
  entityTypeInstances: any;
  graphConceptsSearchSupported: boolean;
  graphView: any;
  setViewConcepts: (viewConcepts: boolean) => void;
  setPhysicsAnimation: (physicsAnimation: boolean) => void;
  setGraphPageInfo: (pageInfo: any) => void;
  setIsLoading: (loading: boolean) => void;
  entitiesWithRelatedConcepts: any;
  data:any;
  entityDefArray:any[]
};

const {graphViewTooltips} = tooltipsConfig;

const GraphViewExplore: React.FC<Props> = (props) => {
  const storage = getViewSettings();
  const {entityTypeInstances, graphView, setGraphPageInfo, setIsLoading} = props;

  const [viewRelationshipLabels, toggleRelationShipLabels] = useState(storage.explore?.graphView?.relationshipLabels !== undefined ? storage.explore?.graphView?.relationshipLabels : true);
  const [exportPngButtonClicked, setExportPngButtonClicked] = useState(false);
  const [viewConcepts, toggleConcepts] = useState(storage.explore?.graphView?.concepts !== undefined ? storage.explore?.graphView?.concepts : true);
  const [physicsAnimation, togglePhysicsAnimation] = useState(storage.explore?.graphView?.physicsAnimation !== undefined? storage.explore?.graphView?.physicsAnimation : true);
  const [activeEntityArray, setActiveEntityArray] = useState<any>([]);
  const [activeEntityUris, setActiveEntityUris] = useState<string[]>([]);
  const [uriInfo, setUriInfo] = useState<any>();
  const [loading, setToggleLoading] = useState("");
  const [originalUri, setOriginalUri] = useState<string>("");
  const [previewMatchedActivity, setPreviewMatchedActivity] = useState<{}>({sampleSize: 100, uris: [], actionPreview: []});
  const [compareModalVisible, setCompareModalVisible] = useState(false);

  const {exploreSidebar} = tooltipsConfig;


  const authorityService = useContext(AuthoritiesContext);
  const canReadMatchMerge = authorityService.canReadMatchMerge();

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

  const isUnmergeAvailable = (nodeId) => {
    if (Object.keys(props.entityTypeInstances).length === 0) return false;
    const filteredData= props.entityTypeInstances.nodes.filter((item) => item["id"] === nodeId);
    if (filteredData.length === 0) return false;
    const item = props.data.filter((item) => item.uri === filteredData[0].docUri);
    if (item.length === 0) return false;
    if (filteredData.length >0 && canReadMatchMerge) {
      return filteredData[0].unmerge;
    }
    return false;
  };

  const openUnmergeCompare = async (uri) => {
    const item = props.data.filter((item) => item.uri=== uri)[0];
    let arrayUris;
    let activeEntityIndex = props.entityDefArray.findIndex((entity) => entity.name === item["entityName"]);
    setActiveEntityArray([props.entityDefArray[activeEntityIndex]]);
    if (typeof item.unmergeUris[0] === "string") {
      arrayUris = item.unmergeUris;
    } else {
      arrayUris = item.unmergeUris.map((obj) => { return obj["document-uri"]; });
    }
    setActiveEntityUris(arrayUris);
    setOriginalUri(item.uri);
    setToggleLoading(item.uri);
    await fetchCompareData(arrayUris, item);
    setCompareModalVisible(true);
  };

  const fetchCompareData = async (array, item) => {
    const result1 = await getDocFromURI(array[0]);
    const result2 = await getDocFromURI(array[1]);

    const flowName= result1.data.recordMetadata.datahubCreatedInFlow;
    const preview = (flowName) ? await getPreviewFromURIs(flowName, array) : null;

    if (result1.status === 200 && result2.status === 200 && preview?.status === 200) {
      let result1Instance = result1?.data?.data?.envelope?.instance;
      let result2Instance = result2?.data?.data?.envelope?.instance;
      let previewInstance = preview.data.value.envelope.instance;
      await setUriInfo([{result1Instance}, {result2Instance}, {previewInstance}]);
    }

    let testMatchData = {
      restrictToUris: true,
      uris: array,
      sampleSize: 100,
      stepName: item.matchStepName
    };

    let previewMatchActivity = await previewMatchingActivity(testMatchData);
    if (previewMatchActivity) {
      setToggleLoading("");
      setPreviewMatchedActivity(previewMatchActivity);
    }

  };

  const submitUnmergeUri = async (payload) => {
    await unmergeUri(payload);
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
          <HCAlert
            variant="info"
            aria-label="graph-stabilization-alert"
            showIcon
          >{graphViewTooltips.graphStabilizationMessage}</HCAlert>
          <div className={styles.graphButtons}>
            {graphSwitches}
            {headerButtons}
          </div>
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
            entityDefArray={props.entityDefArray}
            data={props.data}
            openUnmergeCompare={openUnmergeCompare}
            isUnmergeAvailable={isUnmergeAvailable}
          />
        </div>
      </div>
      )
  );

  const onCloseSidePanel = async () => {
    setSavedNode(undefined);
  };

  const sidePanel = (<div>
    <GraphExploreSidePanel
      onCloseSidePanel={onCloseSidePanel}
      graphView={graphView}
      openUnmergeCompare={openUnmergeCompare}
      loadingCompare={loading}
      data={props.data}
      isUnmergeAvailable={isUnmergeAvailable}/>
  </div>);

  return (
    <>
      <SplitPane
        {...splitPaneProps()}
      >
        {graphViewExploreMainPanel}
        {savedNode ? sidePanel : <></>}
      </SplitPane>
      <CompareValuesModal
        isVisible={compareModalVisible}
        fetchNotifications={() => void 0}
        toggleModal={setCompareModalVisible}
        uriInfo={uriInfo}
        activeStepDetails={activeEntityArray}
        entityProperties={{}}
        uriCompared={activeEntityUris}
        previewMatchActivity={previewMatchedActivity}
        entityDefinitionsArray={activeEntityArray}
        uris={activeEntityUris}
        isPreview={false}
        isMerge={false}
        mergeUris={{}}
        unmergeUri={submitUnmergeUri}
        originalUri={originalUri}
        flowName={""}
      />
    </>
  );
};

export default GraphViewExplore;
