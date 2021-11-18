import React, {useState, useEffect, useContext, useRef} from "react";
import axios from "axios";
import moment from "moment";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {UserContext} from "../util/user-context";
import styles from "./Detail.module.scss";
import TableView from "../components/table-view/table-view";
import DetailHeader from "../components/detail-header/detail-header";
import AsyncLoader from "../components/async-loader/async-loader";
import {Tooltip, Table} from "antd";
import {Row, Col, Tabs, Tab} from "react-bootstrap";
import {xmlParser, xmlDecoder, xmlFormatter, jsonFormatter} from "../util/record-parser";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThList, faCode, faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {getUserPreferences, updateUserPreferences} from "../services/user-preferences";
import DetailPageNonEntity from "../components/detail-page-non-entity/detail-page-non-entity";
import {SearchContext} from "../util/search-context";
import {fetchQueries} from "../api/queries";
import {AuthoritiesContext} from "../util/authorities";
import {ArrowLeftShort} from "react-bootstrap-icons";

interface Props extends RouteComponentProps<any> { }



const Detail: React.FC<Props> = ({history, location}) => {
  const {setSavedQueries} = useContext(SearchContext);
  const {user, handleError} = useContext(UserContext);
  const [parentPagePreferences, setParentPagePreferences] = useState({});
  const getPreferences = () => {
    let currentPref = getUserPreferences(user.name);
    if (currentPref !== null) {
      return JSON.parse(currentPref);
    }
    return currentPref;
  };

  const detailPagePreferences = getPreferences(); //Fetching preferences first to be used later everywhere in the component
  let state: any = location.state;
  const uri = state && state["uri"] ? state["uri"] : detailPagePreferences["uri"];
  const database = state && state["database"] ? state["database"] : detailPagePreferences["database"];
  const pkValue = state && state["primaryKey"] ? state["primaryKey"] : detailPagePreferences["primaryKey"];
  const [entityInstance, setEntityInstance] = useState({});
  const [selected, setSelected] = useState("");
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState("");
  const [xml, setXml] = useState();
  const [isEntityInstance, setIsEntityInstance] = useState(false);
  const [sources, setSources] = useState(location && state && state["sources"] ? state["sources"] : []);
  const [documentSize, setDocumentSize] = useState();
  const [entityInstanceDocument, setIsEntityInstanceDocument] = useState<boolean | undefined>(undefined);
  const [sourcesTableData, setSourcesTableData] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const [collections, setCollections] = useState<any>();
  const [recordMetadata, setRecordMetadata] = useState<any>();
  const [recordPermissions, setRecordPermissions] = useState<any>();
  const [documentProperties, setDocumentProperties] = useState<any>();
  const [docQuality, setDocQuality] = useState<any>();

  const componentIsMounted = useRef(true);
  const authorityService = useContext(AuthoritiesContext);
  let tableView = detailPagePreferences.hasOwnProperty("tableView") ? detailPagePreferences["tableView"] : true;
  let graphView= false;
  if (location.state) {
    graphView = !!location.state["graphView"];
  }
  if (graphView) {
    tableView = false;
  }
  const getSaveQueries = async () => {
    try {
      if (authorityService.isSavedQueryUser()) {
        const response = await fetchQueries();
        if (response.data) {
          setSavedQueries(response.data);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      // When Detail URI is undefined, redirect to Explore
      if (!uri) {
        history.push("/tiles/explore");
        return;
      }
      try {
        let encodedUri = encodeURIComponent(uri);
        const result = await axios(`/api/entitySearch?docUri=${encodedUri}&database=${database}`);
        if (!result.data) {
          history.push("/error");
        }

        if (componentIsMounted.current) {
          if (result.data.entityInstanceProperties !== null) {
            setIsEntityInstanceDocument(true);
            setIsEntityInstance(true);
            setEntityInstance(result.data.entityInstanceProperties);
          } else {
            setIsEntityInstanceDocument(false);
            setIsEntityInstance(false);
          }

          const recordType = result.data.recordType;
          if (recordType === "json") {
            setContentType("json");
            setData(result.data.data);
          } else if (recordType === "xml") {
            setContentType("xml");
            const decodedXml = xmlDecoder(result.data.data);
            const document = xmlParser(decodedXml);
            setData(document);
            setXml(result.data.data);
          } else if (recordType === "text") {
            setContentType("text");
            setData(result.data.data);
          }

          //Setting the data for sources metadata table
          setSources(result.data.sources);
          setSourcesTableData(generateSourcesData(result.data.sources));
          setHistoryData(generateHistoryData(result.data.history));
          setDocumentSize(result.data?.documentSize);
          setIsLoading(false);

          setCollections(generateCollections(result.data.collections));
          setRecordMetadata(generateMetadata(result.data.recordMetadata));
          setRecordPermissions(generatePermissions(result.data.permissions));
          setDocumentProperties(result.data.documentProperties);
          setDocQuality(result.data.quality);
        }

        getSaveQueries();

      } catch (error) {
        handleError(error);
      }
    };

    if (!user.error.type) {
      fetchData();
    }

    updateDetailPagePreferences();

    return () => {
      componentIsMounted.current = false;
    };

  }, []);


  useEffect(() => {
    let state: any = location.state;
    if (state && JSON.stringify(state) !== JSON.stringify({})) {
      entityInstanceDocument && state.hasOwnProperty("selectedValue") && state["selectedValue"] === "source" ?
        setSelected("full") : setSelected("instance");
    } else {
      if (state === undefined) {
        state = {};
      }
      entityInstanceDocument && setSelected(detailPagePreferences["selected"] ? detailPagePreferences["selected"] : "instance");
      handleUserPreferences();
    }
  }, [entityInstanceDocument === true || entityInstanceDocument === false]);

  const generateSourcesData = (sourceData) => {
    let parsedData: any[] = [];
    if (sourceData.length) {
      sourceData.forEach((obj, index) => {
        if (obj.constructor.name === "Object") {
          let sourceName = "none";
          let sourceType = "none";
          if (obj.hasOwnProperty("datahubSourceName") && obj.datahubSourceName) {
            sourceName = obj.datahubSourceName;
          }
          if (obj.hasOwnProperty("datahubSourceType") && obj.datahubSourceType) {
            sourceType = obj.datahubSourceType;
          }

          let tableObj = {
            key: index,
            sourceName: sourceName,
            sourceType: sourceType,
          };
          parsedData.push(tableObj);
        }
      });
    } else {
      let tableObj = {
        key: 1,
        sourceName: "none",
        sourceType: "none",
      };
      parsedData.push(tableObj);
    }

    return parsedData;
  };

  const generateHistoryData = (historyData) => {
    let parsedData: any[] = [];

    if (historyData.length === 0) {
      parsedData.push({
        key: 1,
        updatedTime: "none",
        flow: "none",
        step: "none",
        user: "none"
      });
      return parsedData;
    }

    historyData.forEach((dataObject, index) => {
      const tableObj = {};
      tableObj["key"] = index;
      tableObj["updatedTime"] = dataObject.updatedTime ? moment(dataObject.updatedTime).format("yyyy-MM-DD hh:mm") : "none";
      tableObj["flow"] = dataObject.flow ? dataObject.flow : "none";
      tableObj["step"] = dataObject.step ? dataObject.step : "none";
      tableObj["user"] = dataObject.user ? dataObject.user : "none";
      parsedData.push(tableObj);
    });
    return parsedData;
  };

  const collectionColumns = [
    {
      title: "Collection",
      dataIndex: "collection",
      key: "collection",
    }
  ];
  const generateCollections = (collections) => {
    if (collections && collections.length) {
      let dataSource: any = [];
      collections.forEach((collection, index) => {
        let data = {};
        data["key"] = index;
        data["collection"] = collection;
        dataSource.push(data);
      });
      return dataSource;
    }
  };

  const recordMetadataColumns = [
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    }
  ];

  const generateMetadata = (metadata) => {
    if (metadata) {
      let dataSource: any = [];
      Object.keys(metadata).forEach((key, index) => {
        const data = {};
        data["key"] = index;
        data["property"] = key;
        data["value"] = metadata[key];
        dataSource.push(data);
      });
      return dataSource;
    }
  };

  const recordPermissionsColumns = [
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Capability",
      dataIndex: "capability",
      key: "capability",
    }
  ];

  const generatePermissions = (permissions) => {
    if (permissions && permissions.length) {
      let dataSource: any = [];
      permissions.forEach((p, index) => {
        const data = {};
        data["key"] = index;
        data["role"] = p.roleName;
        data["capability"] = p.capability;
        dataSource.push(data);
      });
      return dataSource;
    }
  };

  //Apply user preferences on each page render
  const handleUserPreferences = () => {
    let userPref: any = {
      zeroState: false,
      entity: detailPagePreferences.query["entityTypeIds"] ? detailPagePreferences.query["entityTypeIds"] : "",
      pageNumber: detailPagePreferences["pageNumber"] ? detailPagePreferences["pageNumber"] : 1,
      start: detailPagePreferences["start"] ? detailPagePreferences["start"] : 1,
      searchFacets: detailPagePreferences.query["selectedFacets"] ? detailPagePreferences.query["selectedFacets"] : {},
      query: detailPagePreferences.query["searchText"] ? detailPagePreferences.query["searchText"] : "",
      tableView,
      graphView,
      sortOrder: detailPagePreferences["sortOrder"] ? detailPagePreferences["sortOrder"] : [],
      sources: detailPagePreferences["sources"] ? detailPagePreferences["sources"] : [],
      primaryKey: detailPagePreferences["primaryKey"] ? detailPagePreferences["primaryKey"] : "",
      uri: detailPagePreferences["uri"] ? detailPagePreferences["uri"] : "",
      targetDatabase: detailPagePreferences["database"] ? detailPagePreferences["database"] : ""
    };
    setParentPagePreferences({...userPref});
  };

  const updateDetailPagePreferences = () => {
    let state: any = location.state;
    if (state && (state.hasOwnProperty("sources") || state.hasOwnProperty("uri") || state.hasOwnProperty("primaryKey") || state.hasOwnProperty("entityInstance"))) {
      let sources: any = [];
      let primaryKey: any = "";
      let uri: any = "";
      let entityInstance: any = {};
      let isEntityInstance = true;
      if (state["sources"] && state["sources"].length) {
        sources = state["sources"];
      }
      if (state["primaryKey"]) {
        primaryKey = state["primaryKey"];
      }
      if (state["uri"] && state["uri"].length) {
        uri = state["uri"];
      }
      if (state["entityInstance"] && Object.keys(state["entityInstance"]).length) {
        entityInstance = state["entityInstance"];
      }
      if (state.hasOwnProperty("isEntityInstance") && state["isEntityInstance"]) {
        isEntityInstance = state["isEntityInstance"];
      }

      let preferencesObject = {
        ...detailPagePreferences,
        sources: sources,
        primaryKey: primaryKey,
        uri: uri,
        selected: state["selectedValue"] && state["selectedValue"] === "source" ? "full" : "instance",
        entityInstance: entityInstance,
        isEntityInstance: isEntityInstance
      };
      updateUserPreferences(user.name, preferencesObject);
    }
  };

  const handleClick = (key) => {
    setSelected(key);

    //Set the selected view property in user preferences.
    let preferencesObject = {
      ...detailPagePreferences,
      selected: key
    };
    updateUserPreferences(user.name, preferencesObject);
  };

  const selectedSearchOptions = {
    pathname: "/tiles/explore",
    state: {
      zeroState: false,
      entity: state && state.hasOwnProperty("entity") ? state["entity"] : parentPagePreferences["entity"],
      pageNumber: state && state.hasOwnProperty("pageNumber") ? state["pageNumber"] : parentPagePreferences["pageNumber"],
      start: state && state.hasOwnProperty("start") ? state["start"] : parentPagePreferences["start"],
      searchFacets: state && state.hasOwnProperty("searchFacets") ? state["searchFacets"] : parentPagePreferences["searchFacets"],
      query: state && state.hasOwnProperty("query") ? state["query"] : parentPagePreferences["query"],
      tableView,
      graphView,
      sortOrder: state && state.hasOwnProperty("sortOrder") ? state["sortOrder"] : parentPagePreferences["sortOrder"],
      sources: state && state.hasOwnProperty("sources") ? state["sources"] : parentPagePreferences["sources"],
      isEntityInstance: state && state.hasOwnProperty("isEntityInstance") ? state["isEntityInstance"] : parentPagePreferences["isEntityInstance"],
      targetDatabase: state && state.hasOwnProperty("targetDatabase") ? state["targetDatabase"] : parentPagePreferences["targetDatabase"],
      isBackToResultsClicked: true,
    }
  };

  return (
    entityInstanceDocument === undefined ? <div style={{marginTop: "40px"}}>
      <AsyncLoader />
    </div> :

      entityInstanceDocument ?
        <div>
          <div className={styles.detailContent}>
            <Row id="back-button" className={"py-4 header-heading-title"} onClick={() => history.push(selectedSearchOptions)}>
              <Col>
                <span className={`d-flex align-items-center cursor-pointer ${styles.title}`}><ArrowLeftShort aria-label="Back" className={"d-inline-block me-2 fs-2 header-back-button"} />Back to results</span>
              </Col>
            </Row>
            <div className={styles.header}>
              <div className={styles.heading}>
                {data && <DetailHeader document={data} contentType={contentType} uri={uri} primaryKey={pkValue} sources={sources.length ? sources : parentPagePreferences["sources"]} />}
              </div>
              <div id="menu" className={styles.menu}>
                <Tabs onSelect={(event) => handleClick(event)} variant="tabs" className={styles.tabsContainer}>
                  <Tab eventKey="instance" id="instance" data-cy="instance-view" tabClassName={`${styles.tabActive} ${selected === "instance" && styles.active}`}
                    title={<Tooltip title={"Show the processed data"}>
                      <FontAwesomeIcon icon={faThList} size="lg" />
                      <span className={styles.subMenu}>Instance</span>
                    </Tooltip>}>
                  </Tab>
                  <Tab eventKey="full" id="full" data-cy="source-view" tabClassName={`${styles.tabActive} ${selected === "full" && styles.active}`}
                    title={<Tooltip title={"Show the complete " + contentType.toUpperCase()} >
                      {contentType.toUpperCase() === "XML" ?
                        <FontAwesomeIcon icon={faCode} size="lg" />
                        :
                        <span className={styles.jsonIcon}></span>
                      }
                      <span className={styles.subMenu}>{contentType.toUpperCase()}</span>
                    </Tooltip>}>
                  </Tab>
                  <Tab eventKey="metadata" id="metadata" data-cy="metadata-view" tabClassName={`${styles.tabActive} ${selected === "metadata" && styles.active}`} title={
                    <Tooltip title={"Show the metadata"}>
                      <FontAwesomeIcon icon={faInfoCircle} size="lg" />
                      <span className={styles.subMenu}>Metadata</span>
                    </Tooltip>
                  }>
                  </Tab>
                </Tabs>
              </div>
            </div>
            <div className={styles.documentContainer}>{(() => {
              let block;
              if (isLoading || user.error.type === "ALERT") {
                block =
                  <div style={{marginTop: "40px"}}>
                    <AsyncLoader />
                  </div>;
              } else if (selected === "instance") {
                contentType === "json" ?
                  block = (entityInstance) && <TableView document={isEntityInstance ? entityInstance : {}} contentType={contentType} location={location.state ? location.state["id"] : {}} isEntityInstance={entityInstanceDocument} />
                  :
                  block = (entityInstance) && <TableView document={isEntityInstance ? entityInstance : {}} contentType={contentType} location={location.state ? location.state["id"] : {}} isEntityInstance={entityInstanceDocument} />;
              } else if (selected === "metadata") {
                block =
                  <div id="metadata-view">
                    <div className={styles.docInfoContainer}>
                      <div className={styles.metaItem} data-testid="document-uri">
                        <span className={styles.metaLabel}>Document URI:</span>
                        <span className={styles.metaValue}>{uri}</span>
                      </div>
                      <div className={styles.metaItem} data-testid="document-quality">
                        <span className={styles.metaLabel}>Document Quality:</span>
                        <span className={styles.metaValue}>{docQuality}</span>
                      </div>
                    </div>
                    {
                      (collections) &&
                      <div className={styles.collectionsTableContainer}>
                        <div className={styles.collectionsTableLabel} data-testid="entity-collections-label">Collections</div>
                        <Table bordered dataSource={collections} columns={collectionColumns} className={styles.collectionsTable} data-testid="collections-table" />
                      </div>
                    }
                    {
                      (recordPermissions) &&
                      <div className={styles.recordPermissionsTableContainer}>
                        <div className={styles.recordPermissionsTableLabel} data-testid="entity-record-permissions-label">Permissions</div>
                        <Table bordered dataSource={recordPermissions} columns={recordPermissionsColumns} className={styles.recordPermissionsTable} data-testid="record-permissions-table" />
                      </div>
                    }
                    {
                      (recordMetadata) &&
                      <div className={styles.recordMetadataTableContainer}>
                        <div className={styles.recordMetadataTableLabel} data-testid="entity-record-metadata-label">Metadata Values</div>
                        <Table bordered dataSource={recordMetadata} columns={recordMetadataColumns} className={styles.recordMetadataTable} data-testid="record-metadata-table" />
                      </div>
                    }
                    <div className={styles.documentPropertiesContainer}>
                      <div className={styles.documentPropertiesLabel} data-testid="entity-record-properties-label">Document Properties</div>
                      {
                        (documentProperties) ?
                          <pre data-testid="doc-properties-container">{xmlFormatter(documentProperties)}</pre>
                          : <p data-testid="doc-no-properties-message">This document has no properties.</p>
                      }
                    </div>
                  </div>;
              } else {
                contentType === "json" ?
                  block = (data) && <pre data-testid="json-container">{jsonFormatter(data)}</pre>
                  :
                  block = (xml) && <pre data-testid="xml-container">{xmlFormatter(xml)}</pre>;
              }
              return block;
            })()}</div>
            <div></div>
          </div>
        </div> :
        <DetailPageNonEntity
          uri={uri}
          sourcesTableData={sourcesTableData}
          historyData={historyData}
          selectedSearchOptions={selectedSearchOptions}
          entityInstance={entityInstance}
          isEntityInstance={entityInstanceDocument}
          contentType={contentType}
          data={data}
          xml={xml}
          detailPagePreferences={detailPagePreferences}
          documentSize={documentSize}
          database={database}
          collections={collections}
          recordMetadata={recordMetadata}
          recordPermissions={recordPermissions}
          documentProperties={documentProperties}
          docQuality={docQuality}
        />
  );
};

export default withRouter(Detail);
