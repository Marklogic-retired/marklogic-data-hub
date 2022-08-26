import React, {useState, useContext, useEffect} from "react";
import {Link, withRouter, RouteComponentProps} from "react-router-dom";
import styles from "./search-result.module.scss";
import ReactHtmlParser from "react-html-parser";
import {dateConverter} from "@util/date-conversion";
import ExpandableTableView from "../expandable-table-view/expandable-table-view";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThList, faCode, faProjectDiagram} from "@fortawesome/free-solid-svg-icons";
import {RiSplitCellsHorizontal} from "react-icons/ri";
import {SearchContext} from "@util/search-context";
import {ChevronDown, ChevronRight} from "react-bootstrap-icons";
import {HCTooltip} from "@components/common";
import CompareValuesModal from "../entities/matching/compare-values-modal/compare-values-modal";
import {previewMatchingActivity, getDocFromURI} from "@api/matching";
import {unmergeUri} from "@api/merging";
import {AuthoritiesContext} from "@util/authorities";
import {Spinner} from "react-bootstrap";
import {SecurityTooltips} from "@config/tooltips.config";

interface Props extends RouteComponentProps {
    item: any;
    entityDefArray: any[];
    tableView: boolean;
    handleViewChange: any
}

const SearchResult: React.FC<Props> = (props) => {
  const {
    searchOptions,
    setGraphViewOptions,
    setSavedNode
  } = useContext(SearchContext);
  const [show, toggleShow] = useState(false);
  const [activeEntityArray, setActiveEntityArray] = useState<any[]>([]);
  const [activeEntityUris, setActiveEntityUris] = useState<string[]>([]);
  const [uriInfo, setUriInfo] = useState<any>();
  const [previewMatchedActivity, setPreviewMatchedActivity] = useState<{}>({sampleSize: 100, uris: [], actionPreview: []});
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [loading, setToggleLoading] = useState("");
  const authorityService = useContext(AuthoritiesContext);
  const canReadMatchMerge = authorityService.canReadMatchMerge();

  let itemEntityName: string[] = [];
  let primaryKey: any = "-";
  let primaryKeyValue: any = "-";
  let createdOnVal: string = "";
  let sourcesVal: string = "";
  let recordTypeVal: string = props.item.format;

  useEffect(() => {
    toggleShow(false);
  }, [searchOptions.pageNumber, searchOptions.entityTypeIds]);

  if (props.item.primaryKey && Object.keys(props.item.primaryKey).length) {
    primaryKeyValue = props.item.primaryKey.propertyValue;
    primaryKey = props.item.primaryKey.propertyPath === "uri" ? "URI": props.item.primaryKey.propertyPath;
  }

  if (props.item.hasOwnProperty("entityName")) {
    itemEntityName = props.item.entityName;
  }

  if (props.item.hasOwnProperty("createdOn")) {
    createdOnVal = props.item.createdOn;
  }

  if ((props.item.format === "json" || props.item.format === "xml") && props.item.hasOwnProperty("sources")) {
    sourcesVal = props.item.sources.map(src => {
      return src.datahubSourceName;
    }).join(", ");
  }

  const submitUnmergeUri = async (payload) => {
    await unmergeUri(payload);
  };

  function getSnippet() {
    let str = "";
    props.item.matches.forEach(item => {
      item["match-text"].forEach(element => {
        if (typeof element === "object") {
          str = str.concat("<b>").concat(element.highlight).concat("</b>");
        } else {
          str = str.concat(element);
        }
      });
      str = str.concat("...");
    });
    return <p>{ReactHtmlParser(str)}</p>;
  }

  const snippet = getSnippet();

  function showTableEntityProperties() {
    toggleShow(!show);
  }
  const navigateToGraphView = (item) => {
    item["navigatingFromOtherView"] = true;
    setSavedNode(item);
    setGraphViewOptions(`${item.entityName}-${primaryKeyValue}`);
    props.handleViewChange("graph");
  };

  const openUnmergeCompare = async (item, event) => {
    let arrayUris;
    event.stopPropagation();
    event.preventDefault();
    let activeEntityIndex = props.entityDefArray.findIndex((entity) => entity.name === item["entityName"]);
    setActiveEntityArray([props.entityDefArray[activeEntityIndex]]);
    if (typeof item.unmergeUris[0] === "string") {
      arrayUris = item.unmergeUris;
    } else {
      arrayUris = item.unmergeUris.map((obj) => { return obj["document-uri"]; });
    }
    setActiveEntityUris(arrayUris);
    setToggleLoading(item.uri);
    await fetchCompareData(arrayUris, item);
    setCompareModalVisible(true);
  };

  const fetchCompareData = async (array, item) => {
    const result1 = await getDocFromURI(array[0]);
    const result2 = await getDocFromURI(array[1]);

    if (result1.status === 200 && result2.status === 200) {
      let result1Instance = {[item.entityName]: result1.data.entityInstanceProperties};
      let result2Instance = {[item.entityName]: result2.data.entityInstanceProperties};
      await setUriInfo([{result1Instance}, {result2Instance}]);
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

  return (
    <>
      <div className={"w-100"}>
        <div className={`d-flex align-items-center ${styles.title}`} onClick={() => showTableEntityProperties()}>
          {show ? <ChevronDown className={styles.expandableIcon} aria-label="icon: chevron-down" data-cy="expandable-icon" data-testid="expandable-icon"/> : <ChevronRight className={styles.expandableIcon} aria-label="icon: chevron-right" data-cy="expandable-icon" data-testid="expandable-icon" />}
          <span className={styles.entityName} data-cy="entity-name" data-testid={"entity-name"}>{itemEntityName}</span>
          {primaryKey && <span data-cy="primary-key" data-testid={"primary-key"} className={styles.primaryKey}>{primaryKey}:</span>}
          <span data-cy="primary-key-value" aria-label={itemEntityName + "-" + primaryKeyValue}>{primaryKeyValue}</span>
          <div className={`ms-auto ${styles.redirectIcons}`}>
            <Link to={{pathname: "/tiles/explore/detail", state: {selectedValue: "instance",
              entity: searchOptions.entityTypeIds,
              pageNumber: searchOptions.pageNumber,
              start: searchOptions.start,
              searchFacets: searchOptions.selectedFacets,
              query: searchOptions.query,
              tableView: props.tableView,
              sortOrder: searchOptions.sortOrder,
              sources: props.item.sources,
              primaryKey: primaryKeyValue,
              uri: props.item.uri,
              entityInstance: props.item.entityInstance,
              targetDatabase: searchOptions.database
            }}} id={"instance"} data-cy="instance" >
              <HCTooltip text="Show the processed data" id="instance-icon-tooltip" placement="top-start">
                <i><FontAwesomeIcon  className={styles.iconHover} icon={faThList} size="sm" data-testid="instance-icon"/></i>
              </HCTooltip>
            </Link>
            <Link to={{pathname: "/tiles/explore/detail", state: {selectedValue: "source",
              entity: searchOptions.entityTypeIds,
              pageNumber: searchOptions.pageNumber,
              start: searchOptions.start,
              searchFacets: searchOptions.selectedFacets,
              query: searchOptions.query,
              tableView: props.tableView,
              sortOrder: searchOptions.sortOrder,
              sources: props.item.sources,
              primaryKey: primaryKeyValue,
              uri: props.item.uri,
              entityInstance: props.item.entityInstance,
              targetDatabase: searchOptions.database
            }}} id={"source"} data-cy="source" >
              <HCTooltip text={"Show the complete " + recordTypeVal.toUpperCase()} id="source-icon-tooltip" placement="top-start">
                {recordTypeVal.toUpperCase() === "XML" ?
                  <i><FontAwesomeIcon className={styles.iconHover} icon={faCode} size="sm" data-testid="source-icon"/></i>
                  :
                  <span className={styles.jsonIcon} data-testid="source-icon"></span>
                }
              </HCTooltip>
            </Link>
            <div className={styles.graphIcon}>
              <HCTooltip text={"View entity in graph view"} id="show-table-graph" placement="top-end">
                <i><FontAwesomeIcon className={styles.iconHover} icon={faProjectDiagram}
                  size="sm"  data-testid="graph-icon" onClick={() => navigateToGraphView(props.item)}/></i>
              </HCTooltip>
            </div>
            {
              props.item.unmerge ?
                <div>
                  <div className={styles.unMergeIcon}>
                    {
                      canReadMatchMerge ?
                        <HCTooltip text={"Unmerge Documents"} id="unmerge-icon-tooltip" placement="top-end">
                          <i><RiSplitCellsHorizontal className={styles.unMergeIcon} data-testid={`unmerge-icon`} aria-label={`unmerge-icon`} onClick={(e) => openUnmergeCompare(props.item, e)}/></i>
                        </HCTooltip>
                        :
                        <HCTooltip text={SecurityTooltips.missingPermission} id="missing-permission-tooltip" placement="top-end">
                          <i><RiSplitCellsHorizontal className={styles.unMergeIconDisabled} data-testid={`unmerge-icon`} aria-label={`unmerge-icon`}/></i>
                        </HCTooltip>
                    }

                  </div>
                  {
                    loading === props.item.uri ?
                      <Spinner
                        data-testid="hc-button-component-spinner"
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className={styles.spinner}
                      /> : null
                  }
                </div> : null
            }
          </div>
        </div>
        <div className={styles.snippet} data-cy="snippet">
          {props.item.matches.length >= 1 && snippet}
        </div>
        <div className={styles.metadata}>
          {createdOnVal && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Created On</span>
              <span className={styles.metaValue} data-cy="created-on" data-testid={"created-on"}>{dateConverter(createdOnVal)}</span>
            </div>
          )}
          {sourcesVal && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Sources</span>
              <span className={styles.metaValue} data-cy="sources" data-testid={"sources"}>{sourcesVal}</span>
            </div>
          )}
          {recordTypeVal && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Record Type</span>
              <span className={styles.format} data-cy="record-type" data-testid={"record-type"}>{recordTypeVal}</span>
            </div>
          )}
        </div>
        <div style={{display: (show) ? "block" : "none"}} data-cy="expandable-view">
          <ExpandableTableView item={props.item} entityDefArray={props.entityDefArray} tableView={props.tableView}/>
        </div>
      </div>
      <CompareValuesModal
        isVisible={compareModalVisible}
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
        mergeUris={() => void 0}
        unmergeUri={submitUnmergeUri}
        originalUri={props.item.uri}
        flowName={""}
      />
    </>
  );
};

export default withRouter(SearchResult);
