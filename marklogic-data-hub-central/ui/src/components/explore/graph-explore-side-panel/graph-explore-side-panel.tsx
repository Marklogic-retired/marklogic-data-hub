import {faCode, faExternalLinkAlt, faThList} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React, {useContext, useEffect, useState} from "react";
import {getDetails} from "../../../api/record";
import {Tab, Tabs} from "react-bootstrap";
import {ChevronRight, XLg} from "react-bootstrap-icons";
import {Link} from "react-router-dom";
import {SearchContext} from "../../../util/search-context";
import styles from "./graph-explore-side-panel.module.scss";
import TableView from "@components/table-view/table-view";

type Props = {
    onCloseSidePanel:() => void;
    graphView: boolean,
};

const DEFAULT_TAB = "instance";
const INSTANCE_TITLE =  <span><i><FontAwesomeIcon icon={faThList} size="sm" /></i> Instance</span>;
const RECORD_TITLE =  <span><i><FontAwesomeIcon icon={faCode} size="sm" /></i> Record</span>;

const GraphExploreSidePanel: React.FC<Props> = (props) => {
  const {onCloseSidePanel, graphView} = props;

  const {
    searchOptions,
    savedNode
  } = useContext(SearchContext);
  const  {database, entityTypeIds, selectedFacets, query, sortOrder} = searchOptions;
  const {entityName, group, primaryKey, docUri, sources, entityInstance, label} = savedNode;
  const [currentTab, setCurrentTab] = useState(DEFAULT_TAB);
  const [details, setDetails] = useState<any>(null);
  const entityInstanceTitle = group ? group.split("/").pop() : entityName;
  const [currentLabel, setCurrentLabel] = useState<string>("");
  useEffect(() => {
    if (docUri && label !== currentLabel) {
      setCurrentLabel(label);
      const getNodeData = async (docUri, database) => {
        const result = await getDetails(docUri, database);
        const {entityInstanceProperties} = result.data;
        setDetails(entityInstanceProperties);
      };
      getNodeData(docUri, database);
    }
  }, [details, label, currentLabel]);

  const handleTabChange = (key) => {
    setCurrentTab(key);
  };

  const displayPanelContent = () => {
    if (currentTab === DEFAULT_TAB) {
      return (
        <div aria-label="instance-view">
          <TableView document={details} contentType="json" location={{}} isEntityInstance={true} isSidePanel={true}/>
        </div>
      );
    } else {
      return <div>Record tab</div>;
    }
  };

  const pathname = "/tiles/explore/detail"
  ;
  let primaryKeyValue;
  if (primaryKey && Object.keys(primaryKey).length) {
    primaryKeyValue = primaryKey.propertyValue;
  }

  const entityInstanceLabel = label ? label : primaryKeyValue;

  const state = {
    selectedValue: "instance",
    entity: entityTypeIds,
    pageNumber: 1,
    start: 1,
    searchFacets: selectedFacets,
    query,
    tableView: false,
    sortOrder,
    sources,
    primaryKey: primaryKeyValue,
    uri: docUri,
    entityInstance,
    targetDatabase: database,
    graphView,
  };

  return (
    <div data-testid="graphSidePanel" className={styles.sidePanel}>
      <div>
        <span className={styles.selectedEntityHeading}  data-testid="entityHeading">
          {entityInstanceTitle}
          <ChevronRight className={styles.arrowRight}/>
          {entityInstanceLabel}
        </span>
        <Link to={{pathname, state}} id="instance" data-cy="instance">
          <i><FontAwesomeIcon icon={faExternalLinkAlt} size="lg" style={{"marginTop": "-10px"}}/></i>
        </Link>
        <span>
          <i className={styles.close} aria-label="closeGraphExploreSidePanel" onClick={onCloseSidePanel}>
            <XLg />
          </i>
        </span>
      </div>
      <div>
        {docUri && <span className={styles.selectedNodeUri} data-testid="uriLabel">URI: {docUri}</span>}
      </div>
      <Tabs defaultActiveKey={DEFAULT_TAB} activeKey={currentTab} onSelect={handleTabChange} className={styles.tabsContainer}>
        <Tab
          eventKey="instance"
          aria-label="instanceTabInSidePanel"
          id="instanceTabInSidePanel"
          title={INSTANCE_TITLE}
          className={styles.instanceTabContainer}/>
        <Tab
          eventKey="record"
          aria-label="recordTabInSidePanel"
          id="recordTabInSidePanel"
          title={RECORD_TITLE}/>
      </Tabs>
      {displayPanelContent()}
    </div>
  );
};

export default GraphExploreSidePanel;
