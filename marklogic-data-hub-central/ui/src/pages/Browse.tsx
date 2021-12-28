import React, {useState, useEffect, useContext, useRef, useLayoutEffect} from "react";
import axios from "axios";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {UserContext} from "../util/user-context";
import {SearchContext} from "../util/search-context";
import AsyncLoader from "../components/async-loader/async-loader";
import Sidebar from "../components/sidebar/sidebar";
import SearchBar from "../components/search-bar/search-bar";
import SearchPagination from "../components/search-pagination/search-pagination";
import SearchSummary from "../components/search-summary/search-summary";
import SearchResults from "../components/search-results/search-results";
import {ExploreToolTips, ModelingMessages} from "../config/tooltips.config";
import {updateUserPreferences, createUserPreferences, getUserPreferences} from "../services/user-preferences";
import {entityFromJSON, entityParser, getTableProperties} from "../util/data-conversion";
import styles from "./Browse.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStream, faTable, faProjectDiagram} from "@fortawesome/free-solid-svg-icons";
import {QuestionCircleFill} from "react-bootstrap-icons";
import Query from "../components/queries/queries";
import {AuthoritiesContext} from "../util/authorities";
import ResultsTabularView from "../components/results-tabular-view/results-tabular-view";
import {QueryOptions} from "../types/query-types";
import Spinner from "react-bootstrap/Spinner";
import RecordCardView from "../components/record-view/record-view";
import SidebarFooter from "../components/sidebar-footer/sidebar-footer";
import {CSSProperties} from "react";
import GraphViewExplore from "../components/explore/graph-view-explore";
import {HCTooltip, HCSider} from "@components/common";
import {graphSearchQuery} from "../api/queries";
import EntitySpecificSidebar from "@components/entity-specific-sidebar/entity-specific-sidebar";
import EntityIconsSidebar from "@components/entity-icons-sidebar/entity-icons-sidebar";

//TODO: remove this, it's just for mocking porpouses and show default data en specif sidebar when non entity was selected
const ADDRESS = {name: "Address", color: "#CEE0ED", amount: 10, filter: 2, icon: "faUser"};
const BACK_ACCOUNT = {name: "Bank Account", color: "#FDC7D4", amount: 10, filter: 2, icon: "faPiggyBank"};
const SPORTS = {name: "Sports", color: "#E3DEEB", amount: 599, icon: "faVolleyballBall"};
const WORK = {name: "Work", color: "#C9EBC4", amount: 9000, icon: "faPrint"};
const CUSTOMERS = {name: "Customers", color: "#D5D3DD", amount: 100, filter: 1, icon: "faShoppingCart"};
const EMPLOYEE = {name: "Employee", color: "#F0F6D9", amount: 340, icon: "faBell"};
const ITEM = {name: "Item", color: "#D9F5F0", amount: 40, icon: "faBox"};
const ORDERS = {name: "Orders", color: "#EDD9C5", amount: 10, filter: 2, icon: "faPaperclip"};

const ENTITIES = [
  {...ADDRESS, relatedEntities: []},
  {...BACK_ACCOUNT, relatedEntities: []},
  {...SPORTS, relatedEntities: []},
  {...WORK, relatedEntities: []},
  {...CUSTOMERS, relatedEntities: [ADDRESS, BACK_ACCOUNT, SPORTS, WORK, EMPLOYEE, ITEM, ORDERS]},
  {...EMPLOYEE, relatedEntities: []},
  {...ITEM, relatedEntities: [ADDRESS, WORK, ORDERS]},
  {...ORDERS, relatedEntities: []}
];


interface Props extends RouteComponentProps<any> {
}

const Browse: React.FC<Props> = ({location}) => {
  const componentIsMounted = useRef(true);
  const {
    user,
    handleError
  } = useContext(UserContext);
  const {
    searchOptions,
    greyedOptions,
    setEntityClearQuery,
    setLatestJobFacet,
    resetSearchOptions,
    applySaveQuery,
    setPageWithEntity,
    setDatabase,
    setLatestDatabase,
    setEntityDefinitionsArray,
    clearAllGreyFacets
  } = useContext(SearchContext);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const authorityService = useContext(AuthoritiesContext);
  const [data, setData] = useState<any[]>([]);
  const [entities, setEntites] = useState<any[]>([]);
  const [entityDefArray, setEntityDefArray] = useState<any[]>([]);
  const [facets, setFacets] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [tableView, toggleTableView] = useState(JSON.parse(getUserPreferences(user.name)).tableView);
  const [endScroll, setEndScroll] = useState(false);
  const [selectedFacets, setSelectedFacets] = useState<any[]>([]);
  const [greyFacets, setGreyFacets] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isSavedQueryUser, setIsSavedQueryUser] = useState<boolean>(authorityService.isSavedQueryUser()); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [queries, setQueries] = useState<any>([]);
  const [entityPropertyDefinitions, setEntityPropertyDefinitions] = useState<any[]>([]);
  const [selectedPropertyDefinitions, setSelectedPropertyDefinitions] = useState<any[]>([]);
  const [isColumnSelectorTouched, setColumnSelectorTouched] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  let state: any = location.state;
  const [cardView, setCardView] = useState(state && state["isEntityInstance"] ? true : JSON.parse(getUserPreferences(user.name)).cardView ? true : false);
  const [hideDataHubArtifacts, toggleDataHubArtifacts] = useState(JSON.parse(getUserPreferences(user.name)).query.hideHubArtifacts);
  const [entitiesData, setEntitiesData] = useState<any[]>([]);
  const [showNoDefinitionAlertMessage, setShowNoDefinitionAlertMessage] = useState(false);
  const [coords, setCoords] = useState<any>(undefined);
  const [entitySpecificPanel, setEntitySpecificPanel] = useState<any>(undefined);
  const [showMainSidebar, setShowMainSidebar] = useState<boolean>(true);
  const [showEntitySpecificPanel, setShowEntitySpecificPanel] = useState<boolean>(false);
  const [graphView, setGraphView] = useState(state && state.graphView ? true : false);
  const [currentBaseEntities, setCurrentBaseEntities] = useState<any[]>([]);
  const [currentEntitiesIcons, setCurrentEntitiesIcons] = useState<any[]>([]);
  const [currentRelatedEntities, setCurrentRelatedEntities] = useState<Map<string, any>>(new Map());

  const handleEntitySelected = (entity: any) => {
    setEntitySpecificPanel(entity);
    setShowEntitySpecificPanel(true);
    if (currentBaseEntities.length > 0) {
      setCurrentEntitiesIcons(currentBaseEntities);
    } else {
      setCurrentEntitiesIcons(ENTITIES.slice(0, 5));
    }
  };

  const updateVisibility = (status: boolean) => {
    setShowMainSidebar(status);
    setShowEntitySpecificPanel(status);
  };

  const closeSpecificSidebar = () => {
    setEntitySpecificPanel(undefined);
    setShowEntitySpecificPanel(false);
  };

  const [graphSearchData, setGraphSearchData] = useState<any[]>([]);


  const getGraphSearchResult = async (allEntities: any[]) => {
    try {
      let payload = {
        "database": searchOptions.database,
        "data": {
          "query": {
            "searchText": searchOptions.query,
            "entityTypeIds": searchOptions.entityTypeIds.length ? searchOptions.entityTypeIds : allEntities,
            "selectedFacets": searchOptions.selectedFacets,
          },
          "start": 0,
          "pageLength": 100,
        }
      };
      const response = await graphSearchQuery(payload);
      if (componentIsMounted.current && response.data) {
        setGraphSearchData(response.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getEntityModel = async () => {
    try {
      const response = await axios(`/api/models`);
      if (componentIsMounted.current) {
        const parsedModelData = entityFromJSON(response.data);
        let entityArray = [...entityFromJSON(response.data).map(entity => entity.info.title)];
        let parsedEntityDef = entityParser(parsedModelData);
        setEntites(entityArray);
        setEntityDefArray(parsedEntityDef);
        setEntityDefinitionsArray(parsedEntityDef);
        setEntitiesData(response.data);
        getGraphSearchResult(entityArray);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getSearchResults = async (allEntities: string[]) => {
    try {
      handleUserPreferences();
      setIsLoading(true);
      const response = await axios({
        method: "POST",
        url: `/api/entitySearch?database=${searchOptions.database}`,
        data: {
          query: {
            searchText: searchOptions.query,
            entityTypeIds: cardView ? [] : searchOptions.entityTypeIds.length ? searchOptions.entityTypeIds : allEntities,
            selectedFacets: searchOptions.selectedFacets,
            hideHubArtifacts: cardView ? hideDataHubArtifacts : true
          },
          propertiesToDisplay: searchOptions.selectedTableProperties,
          start: searchOptions.start,
          pageLength: searchOptions.pageLength,
          sortOrder: searchOptions.sortOrder
        }
      });
      if (!["All Data"].includes(searchOptions.nextEntityType)) {
        setShowNoDefinitionAlertMessage(titleNoDefinition(searchOptions.nextEntityType));
      } else {
        setShowNoDefinitionAlertMessage(false);
      }
      if (componentIsMounted.current && response.data) {
        if (response.data.entityPropertyDefinitions && graphView) {
          setData(response.data.results);
        } else if (!graphView) {
          setData(response.data.results);
        }
        if (response.data.hasOwnProperty("entityPropertyDefinitions")) {
          setEntityPropertyDefinitions(response.data.entityPropertyDefinitions);
        }
        if (response.data.hasOwnProperty("selectedPropertyDefinitions")) {
          setSelectedPropertyDefinitions(response.data.selectedPropertyDefinitions);
        }

        setFacets(response.data.facets);
        setTotalDocuments(response.data.total);

        if (response.data.selectedPropertyDefinitions && response.data.selectedPropertyDefinitions.length) {
          if (!["All Data"].includes(searchOptions.nextEntityType)) {
            let properties = getTableProperties(response.data.selectedPropertyDefinitions);
            setColumns(properties);
          } else {
            setColumns([]);
          }
        }
      }
    } catch (error) {
      console.error("error", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if entity name has no matching definition
  const titleNoDefinition = (selectedEntityName) => {
    for (let i = 0; i < entitiesData.length; i++) {
      if (entitiesData[i].info.title === selectedEntityName) {
        if (!entitiesData[i].definitions.hasOwnProperty(selectedEntityName)) return true;
        else return false;
      }
    }
    return false;
  };

  const fetchUpdatedSearchResults = () => {
    let entityTypesExistOrNoEntityTypeIsSelected = (entities.length > 0 || (searchOptions.nextEntityType === "All Data" || searchOptions.nextEntityType === "All Entities" || searchOptions.nextEntityType === undefined));
    let defaultOptionsForPageRefresh = !searchOptions.nextEntityType && (entities.length > 0 || cardView);
    let selectingAllEntitiesOption = (searchOptions.nextEntityType === "All Entities" && !isColumnSelectorTouched && !searchOptions.entityTypeIds.length && !cardView && entities.length > 0);
    let selectingAllDataOption = (searchOptions.nextEntityType === "All Data" && !isColumnSelectorTouched && !searchOptions.entityTypeIds.length && cardView);
    let selectingEntityType = (searchOptions.nextEntityType && !["All Entities", "All Data"].includes(searchOptions.nextEntityType) && searchOptions.entityTypeIds[0] === searchOptions.nextEntityType);
    let notSelectingCardViewWhenNoEntities = !cardView && (!entities.length && !searchOptions.entityTypeIds.length || !searchOptions.nextEntityType);

    if (entityTypesExistOrNoEntityTypeIsSelected &&
            (
              defaultOptionsForPageRefresh ||
                selectingAllEntitiesOption ||
                selectingAllDataOption ||
                selectingEntityType
            )) {
      getSearchResults(entities);
    } else {
      if (notSelectingCardViewWhenNoEntities) {
        setData([]);
        setFacets({});
        setTotalDocuments(0);
      }
    }
  };

  useEffect(() => {
    getEntityModel();
    initializeUserPreferences();
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (searchOptions.nextEntityType && searchOptions.nextEntityType !== "All Data") {
      setCardView(false);
    }
    fetchUpdatedSearchResults();
    getGraphSearchResult(entities);
  }, [searchOptions, entities, user.error.type, hideDataHubArtifacts]);

  useEffect(() => {
    let state: any = location.state;
    if (state && state["isBackToResultsClicked"]) {
      getSearchResults(entities);
    }
  }, []);


  useEffect(() => {
    let state: any = location.state;
    if (Object.keys(greyedOptions.selectedFacets).length) {
      clearAllGreyFacets();
    }
    if (state && state.hasOwnProperty("savedQuery")) {
      let savedQuery = state["savedQuery"];
      let options: QueryOptions = {
        searchText: savedQuery["query"]["searchText"],
        entityTypeIds: savedQuery["query"]["entityTypeIds"],
        selectedFacets: savedQuery["query"]["selectedFacets"],
        selectedQuery: savedQuery["name"],
        propertiesToDisplay: savedQuery.propertiesToDisplay,
        sortOrder: savedQuery.sortOrder,
        database: searchOptions.database,
      };
      applySaveQuery(options);
    } else if (state && state.hasOwnProperty("isBackToResultsClicked") && state["isBackToResultsClicked"]) {
      setPageWithEntity(state["entity"],
        state["pageNumber"],
        state["start"],
        state["searchFacets"],
        state["query"],
        state["sortOrder"],
        state["targetDatabase"]);
      state["tableView"] ? toggleTableView(true) : toggleTableView(false);
    } else if (state && state.hasOwnProperty("uri")) {
      setPageWithEntity(state["entity"],
        state["pageNumber"],
        state["start"],
        state["searchFacets"],
        state["query"],
        state["sortOrder"],
        state["targetDatabase"]);
      state["tableView"] ? toggleTableView(true) : toggleTableView(false);
    } else if (state
            && state.hasOwnProperty("entityName")
            && state.hasOwnProperty("targetDatabase")
            && state.hasOwnProperty("jobId")
            && state.hasOwnProperty("Collection")) {
      setCardView(false);
      setLatestJobFacet(state["jobId"], state["entityName"], state["targetDatabase"], state["Collection"]);
    } else if (state
            && state.hasOwnProperty("entityName")
            && state.hasOwnProperty("targetDatabase")
            && state.hasOwnProperty("jobId")) {
      setCardView(false);
      setLatestJobFacet(state["jobId"], state["entityName"], state["targetDatabase"]);
    } else if (state && state.hasOwnProperty("entityName") && state.hasOwnProperty("jobId")) {
      setCardView(false);
      setLatestJobFacet(state["jobId"], state["entityName"]);
    } else if (state && state.hasOwnProperty("entity")) {
      if (Array.isArray(state["entity"])) {
        setEntityClearQuery(state["entity"][0]);
      } else {
        setEntityClearQuery(state["entity"]);
      }
    } else if (state && state.hasOwnProperty("targetDatabase") && state.hasOwnProperty("jobId")) {
      setCardView(true);
      setLatestDatabase(state["targetDatabase"], state["jobId"]);
    } else if (state && state.hasOwnProperty("tileIconClicked") && state["tileIconClicked"]) {
      resetSearchOptions(true);
    }
  }, [state]);

  const initializeUserPreferences = async () => {
    let state: any = location.state;
    let defaultPreferences = getUserPreferences(user.name);
    if (defaultPreferences !== null) {
      let parsedPreferences = JSON.parse(defaultPreferences);
      if (state) {
        if (state["tileIconClicked"]) {
          let preferencesObject = {
            ...parsedPreferences,
          };
          updateUserPreferences(user.name, preferencesObject);
        }
      }
    }
  };

  const setUserPreferences = (view: string = "") => {
    let preferencesObject = {
      query: {
        searchText: searchOptions.query,
        entityTypeIds: searchOptions.entityTypeIds,
        selectedFacets: searchOptions.selectedFacets,
        hideHubArtifacts: cardView ? hideDataHubArtifacts : true
      },
      pageLength: searchOptions.pageLength,
      pageNumber: searchOptions.pageNumber,
      start: searchOptions.start,
      tableView: view ? (view === "snippet" ? false : true) : tableView,
      selectedQuery: searchOptions.selectedQuery,
      queries: queries,
      propertiesToDisplay: searchOptions.selectedTableProperties,
      sortOrder: searchOptions.sortOrder,
      cardView: cardView,
      database: searchOptions.database
    };
    updateUserPreferences(user.name, preferencesObject);
  };

  const handleUserPreferences = () => {
    setUserPreferences();

    if (searchOptions.entityTypeIds.length > 0 && !entities.includes(searchOptions.entityTypeIds[0])) {
      // entityName is not part of entity model from model payload
      // change user preferences to default user pref.
      createUserPreferences(user.name);
      resetSearchOptions();
    }
  };

  const setDatabasePreferences = (option: string) => {
    setDatabase(option);
    let userPreferences = getUserPreferences(user.name);
    if (userPreferences) {
      let oldOptions = JSON.parse(userPreferences);
      let newOptions = {
        ...oldOptions,
        database: option
      };
      updateUserPreferences(user.name, newOptions);
    }
  };

  const setHubArtifactsVisibilityPreferences = (option: boolean) => {
    toggleDataHubArtifacts(option);
    let userPreferences = getUserPreferences(user.name);
    if (userPreferences) {
      let preferenceOptions = JSON.parse(userPreferences);
      preferenceOptions.query["hideHubArtifacts"] = option;
      updateUserPreferences(user.name, preferenceOptions);
    }
  };

  useLayoutEffect(() => {
    if (endScroll && data.length) {
      if (resultsRef.current) {
        resultsRef.current["style"]["boxShadow"] = "0px 4px 4px -4px #999, 0px -4px 4px -4px #999";
      }
    } else if (!endScroll) {
      if (resultsRef.current) {
        resultsRef.current["style"]["boxShadow"] = "none";
      }
    }
  }, [endScroll]);

  const onResultScroll = (event) => {
    if (resultsRef && resultsRef.current) {
      const bottom = event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight;
      if (resultsRef.current.scrollTop > 0 && !bottom) {
        setEndScroll(true);
      } else if (resultsRef.current.scrollTop === 0 || bottom) {
        setEndScroll(false);
      }
    }
  };

  const updateSelectedFacets = (facets) => {
    setSelectedFacets(facets);
  };

  const updateCheckedFacets = (facets) => {
    setGreyFacets(facets);
  };

  const handleViewChange = (view) => {
    let tableView = "";
    if (view === "graph") {
      toggleTableView(false);
      setGraphView(true);
      tableView = "graph";
    } else if (view === "snippet") {
      setGraphView(false);
      toggleTableView(false);
      tableView = "snippet";
    } else {
      setGraphView(false);
      toggleTableView(true);
      tableView = "table";
    }
    setUserPreferences(tableView);

    if (resultsRef && resultsRef.current) {
      resultsRef.current["style"]["boxShadow"] = "none";
    }
  };

  const switchViewsGraphStyle = () => {
    let style: CSSProperties = {
      width: "100%",
      display: "flex",
      justifyContent: "flex-end"
    };
    if (graphView) {
      style["marginLeft"] = "20px";
      style["marginTop"] = "10px";
      style["justifyContent"] = "space-between";
    }
    return style;
  };

  const helpIcon = () => (
    <span>
      <HCTooltip text={ExploreToolTips.numberOfResults} id="asterisk-help-tooltip" placement="right">
        <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} />
      </HCTooltip>
    </span>
  );

  const numberOfResultsBanner = <span>Viewing 100 of 1000 results {helpIcon()}</span>;


  return (
    <div className={styles.layout}>
      {showEntitySpecificPanel ?
        <HCSider placement="left" show={showMainSidebar} width="55px">
          <EntityIconsSidebar
            currentBaseEntities={currentEntitiesIcons}
            onClose={closeSpecificSidebar}
            currentRelatedEntities={currentRelatedEntities}
            updateSelectedEntity={setEntitySpecificPanel}
          />
        </HCSider>
        : <HCSider placement="left" show={showMainSidebar} footer={<SidebarFooter />}>
          <Sidebar
            facets={facets}
            selectedEntities={searchOptions.entityTypeIds}
            entityDefArray={entityDefArray}
            facetRender={updateSelectedFacets}
            checkFacetRender={updateCheckedFacets}
            setDatabasePreferences={setDatabasePreferences}
            greyFacets={greyFacets}
            setHubArtifactsVisibilityPreferences={setHubArtifactsVisibilityPreferences}
            hideDataHubArtifacts={hideDataHubArtifacts}
            cardView={cardView}
            setEntitySpecificPanel={handleEntitySelected}
            currentBaseEntities={currentBaseEntities}
            setCurrentBaseEntities={setCurrentBaseEntities}
            currentRelatedEntities={currentRelatedEntities}
            setCurrentRelatedEntities={setCurrentRelatedEntities}
          />
        </HCSider>
      }
      {entitySpecificPanel &&
        <HCSider color={entitySpecificPanel.color} placement="left" show={showEntitySpecificPanel} footer={<SidebarFooter />} updateVisibility={updateVisibility}>
          <EntitySpecificSidebar
            entitySelected={entitySpecificPanel}
          />
        </HCSider>
      }
      <div className={styles.content} id="browseContainer">

        {user.error.type === "ALERT" ?
          <AsyncLoader />
          :

          <>
            <div className={styles.stickyHeader}>
              {/* TODO Fix searchBar widths, it currently overlaps at narrow browser widths */}
              <div className={styles.searchBar} ref={searchBarRef} >

                {!graphView ? <SearchBar entities={entities} cardView={cardView} setHubArtifactsVisibilityPreferences={setHubArtifactsVisibilityPreferences} /> : ""}
                {showNoDefinitionAlertMessage ? <div aria-label="titleNoDefinition" className={styles.titleNoDefinition}>{ModelingMessages.titleNoDefinition}</div> :
                  <span>
                    {!graphView &&
                      <div>
                        <SearchSummary
                          total={totalDocuments}
                          start={searchOptions.start}
                          length={searchOptions.pageLength}
                          pageSize={searchOptions.pageSize}
                        />
                      </div>
                    }

                    <div className={styles.spinViews}>
                      <div style={switchViewsGraphStyle()}>
                        {graphView ? numberOfResultsBanner : ""}
                        {isLoading && <div className={styles.spinnerContainer}><Spinner animation="border" data-testid="spinner" variant="primary" /></div>}
                        {!cardView ? <div id="switch-view-explorer" aria-label="switch-view" >
                          <div className={"switch-button-group outline"}>
                            <span>
                              <input
                                type="radio"
                                id="switch-view-graph"
                                name="switch-view-radiogroup"
                                value={"graph"}
                                onChange={e => handleViewChange(e.target.value)}
                              />
                              <HCTooltip text="Graph View" id="graph-view-tooltip" placement="top">
                                <label aria-label="switch-view-graph" htmlFor="switch-view-graph" className={`d-flex justify-content-center align-items-center`} id={"graphView"} style={{height: "40px"}}>
                                  <i data-cy="graph-view">
                                    <FontAwesomeIcon icon={faProjectDiagram} />
                                  </i>
                                </label>
                              </HCTooltip>
                            </span>

                            <span>
                              <input
                                type="radio"
                                id="switch-view-table"
                                name="switch-view-radiogroup"
                                value={"table"}
                                defaultChecked={tableView}
                                onChange={e => handleViewChange(e.target.value)}
                              />
                              <HCTooltip text="Table View" id="table-view-tooltip" placement="top">
                                <label aria-label="switch-view-table" htmlFor="switch-view-table" className={`d-flex justify-content-center align-items-center`} id={"tableView"} style={{height: "40px"}}>
                                  <i data-cy="table-view">
                                    <FontAwesomeIcon icon={faTable} />
                                  </i>
                                </label>
                              </HCTooltip>
                            </span>

                            <span>
                              <input
                                type="radio"
                                id="switch-view-snippet"
                                name="switch-view-radiogroup"
                                value={"snippet"}
                                defaultChecked={!tableView}
                                onChange={e => handleViewChange(e.target.value)}
                              />
                              <HCTooltip text="Snippet View" id="snippet-view-tooltip" placement="top">
                                <label aria-label="switch-view-snippet" htmlFor="switch-view-snippet" className={`d-flex justify-content-center align-items-center`} id={"snippetView"} style={{height: "40px"}}>
                                  <i data-cy="facet-view">
                                    <FontAwesomeIcon icon={faStream} />
                                  </i>
                                </label>
                              </HCTooltip>
                            </span>
                          </div>
                        </div> : ""}
                      </div>
                    </div></span>}
              </div>
              <Query queries={queries || []}
                setQueries={setQueries}
                isSavedQueryUser={isSavedQueryUser}
                columns={columns}
                setIsLoading={setIsLoading}
                entities={entities}
                selectedFacets={selectedFacets}
                greyFacets={greyFacets}
                isColumnSelectorTouched={isColumnSelectorTouched}
                setColumnSelectorTouched={setColumnSelectorTouched}
                entityDefArray={entityDefArray}
                database={searchOptions.database}
                setCardView={setCardView}
                cardView={cardView}
              />
            </div>
            {!showNoDefinitionAlertMessage &&
                <div className={graphView ? styles.viewGraphContainer : styles.viewContainer} >
                  <div>
                    {graphView ?
                      <div>
                        <GraphViewExplore
                          entityTypesInstances={graphSearchData}
                          graphView={graphView}
                          coords={coords}
                          setCoords={setCoords}
                        />
                      </div> :
                      cardView ?
                        <RecordCardView
                          data={data}
                          entityPropertyDefinitions={entityPropertyDefinitions}
                          selectedPropertyDefinitions={selectedPropertyDefinitions}
                        />
                        : (tableView ?
                          <div className={styles.tableViewResult}>
                            <ResultsTabularView
                              data={data}
                              entityPropertyDefinitions={entityPropertyDefinitions}
                              selectedPropertyDefinitions={selectedPropertyDefinitions}
                              entityDefArray={entityDefArray}
                              columns={columns}
                              selectedEntities={searchOptions.entityTypeIds}
                              setColumnSelectorTouched={setColumnSelectorTouched}
                              tableView={tableView}
                              isLoading={isLoading}
                              handleViewChange={handleViewChange}
                            />
                          </div>
                          : isLoading ? <></> : <div id="snippetViewResult" className={styles.snippetViewResult} ref={resultsRef} onScroll={onResultScroll}><SearchResults data={data}
                            handleViewChange={handleViewChange}
                            entityDefArray={entityDefArray} tableView={tableView} columns={columns} /></div>
                        )}
                  </div>
                  <br />
                </div>}
            {!showNoDefinitionAlertMessage && !graphView &&
                <div>
                  <SearchSummary
                    total={totalDocuments}
                    start={searchOptions.start}
                    length={searchOptions.pageLength}
                    pageSize={searchOptions.pageSize}
                  />
                  <SearchPagination
                    total={totalDocuments}
                    pageNumber={searchOptions.pageNumber}
                    pageSize={searchOptions.pageSize}
                    pageLength={searchOptions.pageLength}
                    maxRowsPerPage={searchOptions.maxRowsPerPage}
                  />
                </div>}
          </>
        }
      </div>
    </div>
  );
};

export default withRouter(Browse);
