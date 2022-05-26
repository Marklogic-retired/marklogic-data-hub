import {faCode, faThList} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React, {useContext, useEffect, useState, useRef} from "react";
import {getDetails} from "@api/record";
import {Tab, Tabs} from "react-bootstrap";
import {ChevronRight, XLg, ArrowRightSquare} from "react-bootstrap-icons";
import {Link} from "react-router-dom";
import {SearchContext} from "@util/search-context";
import styles from "./graph-explore-side-panel.module.scss";
import {xmlParser, xmlDecoder, xmlFormatter, jsonFormatter} from "@util/record-parser";
import TableView from "@components/table-view/table-view";
import {HCTable, HCTooltip} from "@components/common";
import {fetchSemanticConceptInfo} from "@api/queries";

type Props = {
    onCloseSidePanel:() => void;
    graphView: boolean,
};

const DEFAULT_TAB = "instance";
const INSTANCE_TITLE =  <span aria-label="instanceTab"><i><FontAwesomeIcon icon={faThList} size="sm" /></i> Instance</span>;

const GraphExploreSidePanel: React.FC<Props> = (props) => {
  const {onCloseSidePanel, graphView} = props;

  const {
    searchOptions,
    savedNode
  } = useContext(SearchContext);
  const  {database, entityTypeIds, selectedFacets, query, sortOrder} = searchOptions;
  const {entityName, group, primaryKey, sources, entityInstance, label, isConcept, id} = savedNode;
  const docUri = savedNode["docURI"] || savedNode["docUri"] || savedNode["uri"];
  const [currentTab, setCurrentTab] = useState(DEFAULT_TAB);
  const [details, setDetails] = useState<any>(null);
  const entityInstanceTitle = group ? group.split("/").pop() : entityName;
  const conceptTitle = id?.split("/").pop();
  const [currentLabel, setCurrentLabel] = useState<string>("");

  //To view record info on graph instance view side panel
  const [content, setContent] = useState<any>(null);
  const [contentType, setContentType] = useState<string>("");
  const [xml, setXml] = useState();
  const data = useRef<any[]>();
  const RECORD_TITLE =  <span aria-label="recordTab">{contentType.toUpperCase()=== "XML" ? <i className={styles.xmlIcon} aria-label="xmlTypeData"><FontAwesomeIcon icon={faCode} size="sm" /></i>
    : <span className={styles.jsonIcon} aria-label="jsonTypeData"></span>}{contentType ? contentType.toUpperCase() : ""}</span>;

  const [semanticConceptInfo, setSemanticConceptInfo] = useState<any []>([]);

  useEffect(() => {
    let uri;
    if (savedNode && !docUri && !label) { // case where exploring from table/snippet
      uri = savedNode["uri"];
    } else {
      uri = docUri;
    }
    if (uri && label !== currentLabel) {
      if (isConcept) {
        getSemanticConceptsInfo();
      } else {
        setCurrentLabel(label);
        const getNodeData = async (uri, database) => {
          try {
            const result = await getDetails(uri, database);
            if (result["status"] === 200) {
              data.current! = result?.data;
              setContentData();
              const {entityInstanceProperties} = result.data;
              setDetails(entityInstanceProperties);
            }
          } catch (err) {
            console.error("Unable to fetch document details.", err, JSON.stringify(savedNode));
          }
        };
        getNodeData(uri, database);
      }
    }

  }, [details, label, currentLabel]);

  const getSemanticConceptsInfo = async () => {
    try {
      let resp = await fetchSemanticConceptInfo(id, database);
      if (resp.status === 200) {
        let conceptInfo = resp.data?.data?.map((item, index) => {
          let infoObject = {
            "key": index,
            "entityType": item.entityTypeIRI.split("/").pop(),
            "relatedInstances": item.total
          };
          return infoObject;
        });
        setSemanticConceptInfo(conceptInfo);
      }
    } catch (err) {
      console.error("Unable to fetch concept info", err);
    }
  };

  const handleTabChange = (key) => {
    setCurrentTab(key);
  };

  //To set the respective record type data(json, xml and text)
  const setContentData = () => {
    const info = data.current!;
    let recordType=info["recordType"];
    if (recordType === "json") {
      setContentType("json");
      setContent(info);
    } else if (recordType === "xml") {
      setContentType("xml");
      let xmlData=info["data"];
      const decodedXml = xmlDecoder(xmlData);
      const document = xmlParser(decodedXml);
      setContent(document);
      setXml(xmlData);
    } else {
      setContentType("text");
      setContent(info["data"]);
    }
  };

  const displayPanelContent = () => {
    let block;
    if (currentTab === DEFAULT_TAB) {
      return (
        <div aria-label="instance-view">
          <TableView document={details} contentType="json" location={{}} isEntityInstance={true} isSidePanel={true}/>
        </div>
      );
    } else {
      if (contentType === "json") {
        block = (content) && <pre data-testid="graphView-json-container">{jsonFormatter(content["data"])}</pre>;
      } else if (contentType === "xml") {
        block = (xml) && <pre data-testid="graphView-xml-container">{xmlFormatter(xml)}</pre>;
      } else {
        block = (content) && <pre data-testid="graphView-text-container">{content}</pre>;
      }
      return block;
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

  const conceptInfoColumns = [
    {
      text: "Related Instances",
      title: "Related Instances",
      dataField: "relatedInstances",
      key: "key",
      width: "40%",
      sort: true,
      formatter: (value, row) => {
        return <span aria-label={`${row.entityType}-relatedInstances`}>{value}</span>;
      }
    },
    {
      text: "Entity Type",
      title: "Entity Type",
      dataField: "entityType",
      key: "key",
      width: "60%",
      sort: true,
      sortFunc: (a: string, b: string, order: string) => order === "asc" ? a.localeCompare(b) : b.localeCompare(a),
      formatter: (value) => {
        return <span aria-label={`${value}-entityType`}>{value}</span>;
      },
    }
  ];

  const conceptInstanceInfo = (
    <div className={styles.conceptInfoContainer}>
      <HCTable columns={conceptInfoColumns}
        className={styles.conceptInfoTable}
        data={semanticConceptInfo}
        nestedParams={{headerColumns: conceptInfoColumns, iconCellList: [], state: []}}
        childrenIndent={true}
        data-cy="document-table"
        rowKey="key"
        showHeader={true}
        baseIndent={20}
      />
    </div>
  );

  return (
    <div data-testid="graphSidePanel" className={styles.sidePanel}>
      <div className={styles.headingContainer}>
        <span>
          {
            !isConcept  ? <span className={styles.selectedEntityHeading}  data-testid="entityHeading">
              {entityInstanceTitle}
              {<ChevronRight className={styles.arrowRight}/>}
              {entityInstanceLabel}
            </span> :
              <div>
                <span className={styles.selectedEntityHeading} aria-label={`${conceptTitle}-conceptHeading`}>{conceptTitle}</span>
                <span className={styles.conceptHeadingInfo} aria-label={`${conceptTitle}-conceptHeadingInfo`}>(Concept)</span>
              </div>
          }
          {!isConcept && <HCTooltip text="View full details" id="processed-data-tooltip" placement="top-end">
            <Link to={{pathname, state}} id="instance" data-cy="instance">
              <ArrowRightSquare className={styles.arrowRightSquare} aria-label="graphViewRightArrow"/>
            </Link>
          </HCTooltip>}
        </span>
        <span>
          <i className={styles.close} aria-label="closeGraphExploreSidePanel" onClick={onCloseSidePanel}>
            <XLg />
          </i>
        </span>
      </div>
      {
        !isConcept ? <><div>
          {docUri && <span className={styles.selectedNodeUri} data-testid="uriLabel" aria-label={docUri}>URI: {docUri}</span>}
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
        {displayPanelContent()}</> :
          conceptInstanceInfo
      }
    </div>
  );
};

export default GraphExploreSidePanel;
