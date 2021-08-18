import React, {useState, useContext, useEffect} from "react";
import {Link, withRouter, RouteComponentProps} from "react-router-dom";
import styles from "./search-result.module.scss";
import ReactHtmlParser from "react-html-parser";
import {dateConverter} from "../../util/date-conversion";
import ExpandableTableView from "../expandable-table-view/expandable-table-view";
import {Icon, Tooltip} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLinkAlt, faCode} from "@fortawesome/free-solid-svg-icons";
import {SearchContext} from "../../util/search-context";


interface Props extends RouteComponentProps {
    item: any;
    entityDefArray: any[];
    tableView: boolean;
}

const SearchResult: React.FC<Props> = (props) => {
  const {
    searchOptions,
  } = useContext(SearchContext);
  const [show, toggleShow] = useState(false);

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

  return (
    <div style={{width: "100%"}}>
      <div className={styles.title} onClick={() => showTableEntityProperties()}>
        <Icon className={styles.expandableIcon} data-cy="expandable-icon" data-testid="expandable-icon" type="right" rotate={show ? 90 : undefined} />
        <div className={styles.redirectIcons}>
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
            <Tooltip title={"Show the processed data"} placement="topRight"><FontAwesomeIcon  className={styles.iconHover} icon={faExternalLinkAlt} size="sm" data-testid="instance-icon"/></Tooltip>
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
            <Tooltip title={"Show the complete " + recordTypeVal.toUpperCase()} placement="topRight">
              {recordTypeVal.toUpperCase() === "XML" ?
                <FontAwesomeIcon className={styles.iconHover} icon={faCode} size="sm" data-testid="source-icon"/>
                :
                <span className={styles.jsonIcon} data-testid="source-icon"></span>
              }
            </Tooltip>
          </Link>
        </div>
        <span className={styles.entityName} data-cy="entity-name" data-testid={"entity-name"}>{itemEntityName}</span>
        {primaryKey && <span data-cy="primary-key" data-testid={"primary-key"} className={styles.primaryKey}>{primaryKey}:</span>}
        <span data-cy="primary-key-value"> {primaryKeyValue}</span>
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
  );
};

export default withRouter(SearchResult);
