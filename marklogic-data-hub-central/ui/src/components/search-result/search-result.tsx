import React, {useState, useContext} from "react";
import {Link, withRouter, RouteComponentProps} from "react-router-dom";
import styles from "./search-result.module.scss";
import ReactHtmlParser from "react-html-parser";
import {dateConverter} from "@util/date-conversion";
import ExpandableTableView from "../expandable-table-view/expandable-table-view";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThList, faCode, faProjectDiagram} from "@fortawesome/free-solid-svg-icons";
import {MdCallSplit} from "react-icons/md";
import {SearchContext} from "@util/search-context";
import {ChevronDown, ChevronRight} from "react-bootstrap-icons";
import {HCTooltip} from "@components/common";
import CompareValuesModal from "../entities/matching/compare-values-modal/compare-values-modal";
import {previewMatchingActivity, getDocFromURI, getPreviewFromURIs} from "@api/matching";
import {unmergeUri} from "@api/merging";
import {AuthoritiesContext} from "@util/authorities";
import {AxiosResponse} from "axios";
import {Spinner} from "react-bootstrap";
import {SecurityTooltips} from "@config/tooltips.config";
import {EntityProps} from "types/entity-types";

interface ItemProps {
  confidence: number;
  createdBy: string;
  createdOn: string;
  entityInstance: any; //props needed
  entityName: string[];
  fitness: number;
  format: string;
  href: string;
  identifier: any //props needed
  index: number;
  matches: any; //props needed
  mimetype: string;
  path: string;
  primaryKey: any; //props needed
  score: number;
  sources: any; //props needed
  unmerge: boolean;
  unmergeUris?: any; //unkown so far
  uri: string;
}

interface Props extends RouteComponentProps {
    item: ItemProps;
    entityDefArray: EntityProps[];
    tableView: boolean;
    handleViewChange: (view: string) => void;
    isExpanded?: boolean;
    onExpand: () => void;
}

const SearchResult: React.FC<Props> = (props) => {
  const {item, entityDefArray, tableView, handleViewChange, isExpanded, onExpand} = props;

  const {
    searchOptions,
    setGraphViewOptions,
    setSavedNode
  } = useContext(SearchContext);
  const [activeEntityArray, setActiveEntityArray] = useState<any[]>([]);
  const [activeEntityUris, setActiveEntityUris] = useState<string[]>([]);
  const [uriInfo, setUriInfo] = useState<any>();
  const [previewMatchedActivity, setPreviewMatchedActivity] = useState<{}>({sampleSize: 100, uris: [], actionPreview: []});
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [loading, setToggleLoading] = useState("");
  const authorityService = useContext(AuthoritiesContext);
  const canWriteMatchMerge = authorityService.canWriteMatchMerge();

  let itemEntityName: string[] = [];
  let primaryKey: any = "-";
  let primaryKeyValue: any = "-";
  let createdOnVal: string = "";
  let sourcesVal: string = "";
  let recordTypeVal: string = item.format;

  if (item.primaryKey && Object.keys(item.primaryKey).length) {
    primaryKeyValue = item.primaryKey.propertyValue;
    primaryKey = item.primaryKey.propertyPath === "uri" ? "URI": item.primaryKey.propertyPath;
  }

  if (item.hasOwnProperty("entityName")) {
    itemEntityName = item.entityName;
  }

  if (item.hasOwnProperty("createdOn")) {
    createdOnVal = item.createdOn;
  }

  if ((item.format === "json" || item.format === "xml") && item.hasOwnProperty("sources")) {
    sourcesVal = item.sources.map(src => {
      return src.datahubSourceName;
    }).join(", ");
  }

  const submitUnmergeUri = async (payload) => {
    await unmergeUri(payload);
  };

  function getSnippet() {
    let str = "";
    item.matches.forEach(item => {
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

  const navigateToGraphView = (item) => {
    item["navigatingFromOtherView"] = true;
    setSavedNode(item);
    setGraphViewOptions(`${item.entityName}-${primaryKeyValue}`);
    handleViewChange("graph");
  };

  const openUnmergeCompare = async (item, event) => {
    let arrayUris;
    event.stopPropagation();
    event.preventDefault();
    let activeEntityIndex = entityDefArray.findIndex((entity) => entity.name === item["entityName"]);
    setActiveEntityArray([entityDefArray[activeEntityIndex]]);
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
    let uriRequests: Promise<AxiosResponse<any>>[] = [];
    array.forEach((uri) => {
      uriRequests.push(getDocFromURI(uri));
    });
    const results = await Promise.all(uriRequests);
    const result1 = results[0];
    const result2 = results[1];

    const flowName= result1.data.recordMetadata.datahubCreatedInFlow;
    const preview = (flowName) ? await getPreviewFromURIs(flowName, array) : null;

    if (result1.status === 200 && result2.status === 200 && preview?.status === 200) {
      let urisInfo: any[] = [];
      results.forEach((result, index) => {
        const instanceKey = `result${index + 1}Instance`;
        urisInfo.push({
          [instanceKey]: result.data.data.envelope.instance,
        });
      });
      let previewInstance = preview.data.value.envelope.instance;
      urisInfo.push({previewInstance});
      setUriInfo(urisInfo);
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
        <div className={`d-flex align-items-center ${styles.title}`} onClick={() => onExpand()}>
          {isExpanded
            ?<ChevronDown
              className={styles.expandableIcon}
              aria-label="icon: chevron-down"
              data-cy="expandable-icon"
              data-testid="expandable-icon"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  onExpand();
                }
              }}
            />
            :<ChevronRight
              className={styles.expandableIcon}
              aria-label="icon: chevron-right"
              data-cy="expandable-icon"
              data-testid="expandable-icon"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  onExpand();
                }
              }}
            />}
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
              tableView: tableView,
              sortOrder: searchOptions.sortOrder,
              sources: item.sources,
              primaryKey: primaryKeyValue,
              uri: item.uri,
              entityInstance: item.entityInstance,
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
              tableView: tableView,
              sortOrder: searchOptions.sortOrder,
              sources: item.sources,
              primaryKey: primaryKeyValue,
              uri: item.uri,
              entityInstance: item.entityInstance,
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
            <div className={styles.graphIcon} tabIndex={0} onKeyDown={
              (event) => {
                if (event.key === "Enter") {
                  navigateToGraphView(props.item);
                }
              }
            }>
              <HCTooltip text={"View entity in graph view"} id="show-table-graph" placement="top-end">
                <i><FontAwesomeIcon className={styles.iconHover} icon={faProjectDiagram}
                  size="sm"  data-testid="graph-icon" onClick={() => navigateToGraphView(item)}/></i>
              </HCTooltip>
            </div>
            {
              item.unmerge ?
                <div>
                  <div className={styles.unMergeIcon} tabIndex={0} onKeyDown={
                    (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        openUnmergeCompare(props.item, event);
                      }
                    }

                  }>
                    {
                      canWriteMatchMerge ?
                        <HCTooltip text={"Unmerge Documents"} id="unmerge-icon-tooltip" placement="top-end">
                          <i><MdCallSplit className={styles.unMergeIcon} data-testid={`unmerge-icon`} aria-label={`unmerge-icon`} onClick={(e) => openUnmergeCompare(item, e)}/></i>
                        </HCTooltip>
                        :
                        <HCTooltip text={SecurityTooltips.missingPermissionUnMerge} id="missing-permission-tooltip" placement="top-end">
                          <i><MdCallSplit className={styles.unMergeIconDisabled} data-testid={`unmerge-icon`} aria-label={`unmerge-icon`}/></i>
                        </HCTooltip>
                    }

                  </div>
                  {
                    loading === item.uri ?
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
          {item.matches.length >= 1 && snippet}
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
        <div style={{display: (isExpanded) ? "block" : "none"}} data-cy="expandable-view" aria-label={`expandable-view-${primaryKeyValue}`}>
          <ExpandableTableView item={item} entityDefArray={entityDefArray} tableView={tableView}/>
        </div>
      </div>
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
        mergeUris={() => void 0}
        unmergeUri={submitUnmergeUri}
        originalUri={item.uri}
        flowName={""}
      />
    </>
  );
};

export default withRouter(SearchResult);
