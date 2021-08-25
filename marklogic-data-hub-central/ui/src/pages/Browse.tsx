import React, {useState, useEffect, useContext, useRef, useLayoutEffect} from "react";
import axios from "axios";
import {Layout, Radio} from "antd";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {UserContext} from "../util/user-context";
import {SearchContext} from "../util/search-context";
import AsyncLoader from "../components/async-loader/async-loader";
import Sidebar from "../components/sidebar/sidebar";
import SearchBar from "../components/search-bar/search-bar";
import SearchPagination from "../components/search-pagination/search-pagination";
import SearchSummary from "../components/search-summary/search-summary";
import SearchResults from "../components/search-results/search-results";
import {updateUserPreferences, createUserPreferences, getUserPreferences} from "../services/user-preferences";
import {entityFromJSON, entityParser, getTableProperties} from "../util/data-conversion";
import styles from "./Browse.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStream, faTable, faAngleDoubleRight, faAngleDoubleLeft} from "@fortawesome/free-solid-svg-icons";
import Query from "../components/queries/queries";
import {AuthoritiesContext} from "../util/authorities";
import ZeroStateExplorer from "../components/zero-state-explorer/zero-state-explorer";
import ResultsTabularView from "../components/results-tabular-view/results-tabular-view";
import {QueryOptions} from "../types/query-types";
import Spinner from "react-bootstrap/Spinner";
import RecordCardView from "../components/record-view/record-view";
import SidebarFooter from "../components/sidebar-footer/sidebar-footer";
import HCTooltip from "../components/common/hc-tooltip/hc-tooltip";


interface Props extends RouteComponentProps<any> {
}

const Browse: React.FC<Props> = ({location}) => {
  const {Content, Sider} = Layout;
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
    setPageQueryOptions,
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
  const [collapse, setCollapsed] = useState(false);
  const [selectedFacets, setSelectedFacets] = useState<any[]>([]);
  const [greyFacets, setGreyFacets] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isSavedQueryUser, setIsSavedQueryUser] = useState<boolean>(authorityService.isSavedQueryUser()); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [queries, setQueries] = useState<any>([]);
  const [entityPropertyDefinitions, setEntityPropertyDefinitions] = useState<any[]>([]);
  const [selectedPropertyDefinitions, setSelectedPropertyDefinitions] = useState<any[]>([]);
  const [isColumnSelectorTouched, setColumnSelectorTouched] = useState(false);
  const [zeroStatePageDatabase, setZeroStatePageDatabase] = useState("final");
  const resultsRef = useRef<HTMLDivElement>(null);
  let state: any = location.state;
  const [cardView, setCardView] = useState(state && state["isEntityInstance"] ? true : JSON.parse(getUserPreferences(user.name)).cardView ? true : false);
  const [hideDataHubArtifacts, toggleDataHubArtifacts] = useState(JSON.parse(getUserPreferences(user.name)).query.hideHubArtifacts);

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
      if (componentIsMounted.current && response.data) {
        setData(response.data.results);
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
  }, [searchOptions, searchOptions.zeroState === false && entities, user.error.type, hideDataHubArtifacts]);

  useEffect(() => {
    let state: any = location.state;
    if (state && state["zeroState"] === false && state["isBackToResultsClicked"]) {
      getSearchResults(entities);
    }
  }, []);

  useEffect(() => {
    let state: any = location.state;

    if (searchOptions.zeroState && Object.keys(greyedOptions.selectedFacets).length) {
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
        zeroState: false,
        sortOrder: savedQuery.sortOrder,
        database: searchOptions.database,
      };
      applySaveQuery(options);
    } else if (state && state.hasOwnProperty("zeroState") && !state["zeroState"]) {
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
      setCardView(false);
      setEntityClearQuery(state["entity"]);
    } else if (state && state.hasOwnProperty("targetDatabase") && state.hasOwnProperty("jobId")) {
      setCardView(true);
      setLatestDatabase(state["targetDatabase"], state["jobId"]);
    }
  }, [searchOptions.zeroState]);

  const setZeroStateQueryOptions = () => {
    let options: QueryOptions = {
      searchText: "",
      entityTypeIds: [],
      selectedFacets: {},
      selectedQuery: "select a query",
      propertiesToDisplay: [],
      zeroState: true,
      sortOrder: [],
      database: "final",
    };
    applySaveQuery(options);
  };

  const initializeUserPreferences = async () => {
    let state: any = location.state;
    let defaultPreferences = getUserPreferences(user.name);
    if (defaultPreferences !== null) {
      let parsedPreferences = JSON.parse(defaultPreferences);
      if (state) {
        if (state["tileIconClicked"]) {
          await setZeroStateQueryOptions();
          let preferencesObject = {
            ...parsedPreferences,
            zeroState: searchOptions.zeroState
          };
          updateUserPreferences(user.name, preferencesObject);
        }
      } else {
        if (!parsedPreferences.zeroState && searchOptions.zeroState) {
          let options: any = {
            searchText: parsedPreferences.query.searchText || "",
            entityTypeIds: parsedPreferences.query.entityTypeIds || [],
            selectedFacets: parsedPreferences.query.selectedFacets || {},
            selectedQuery: searchOptions.selectedQuery || "select a query",
            start: parsedPreferences.start || 1,
            pageNumber: parsedPreferences.pageNumber || 1,
            pageLength: parsedPreferences.pageLength,
            propertiesToDisplay: searchOptions.selectedTableProperties || [],
            zeroState: parsedPreferences.zeroState,
            sortOrder: parsedPreferences.sortOrder || [],
            database: parsedPreferences.database
          };
          await setPageQueryOptions(options);
          if (parsedPreferences.hasOwnProperty("tableView") && parsedPreferences.hasOwnProperty("cardView")) {
            if (parsedPreferences.cardView) {
              setCardView(parsedPreferences.cardView);
            } else {
              toggleTableView(parsedPreferences.tableView);
            }
          }
        } else if (parsedPreferences.zeroState) {
          await setZeroStateQueryOptions();
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
      zeroState: searchOptions.zeroState,
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

  const onCollapse = () => {
    setCollapsed(!collapse);
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
    if (view === "snippet") {
      toggleTableView(false);
      tableView = "snippet";
    } else {
      toggleTableView(true);
      tableView = "table";
    }
    setUserPreferences(tableView);

    if (resultsRef && resultsRef.current) {
      resultsRef.current["style"]["boxShadow"] = "none";
    }
  };

  if (searchOptions.zeroState) {
    return (
      <>
        <Query queries={queries || []} setQueries={setQueries} isSavedQueryUser={isSavedQueryUser} columns={columns} setIsLoading={setIsLoading} entities={entities} selectedFacets={[]} greyFacets={[]} entityDefArray={entityDefArray} isColumnSelectorTouched={isColumnSelectorTouched} setColumnSelectorTouched={setColumnSelectorTouched} database={zeroStatePageDatabase} setCardView={setCardView} cardView={cardView}/>
        <ZeroStateExplorer entities={entities} isSavedQueryUser={isSavedQueryUser} queries={queries} columns={columns} setIsLoading={setIsLoading} tableView={tableView} toggleTableView={toggleTableView} setCardView={setCardView} setDatabasePreferences={setDatabasePreferences} zeroStatePageDatabase={zeroStatePageDatabase} setZeroStatePageDatabase={setZeroStatePageDatabase} toggleDataHubArtifacts={toggleDataHubArtifacts}/>
      </>
    );
  } else {
    return (
      <Layout className={styles.layout}>
        <Sider className={styles.sideBarFacets}
          trigger={null}
          collapsedWidth={0}
          collapsible
          collapsed={collapse}
          width={"20vw"}
        >
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
          />
          <SidebarFooter />
        </Sider>
        <Content className={styles.content} id="browseContainer">

          <div className={styles.collapseIcon} id="sidebar-collapse-icon">
            {collapse ?
              <FontAwesomeIcon aria-label="collapsed" icon={faAngleDoubleRight} onClick={onCollapse} size="lg" style={{fontSize: "16px", color: "#000"}} /> :
              <FontAwesomeIcon aria-label="expanded" icon={faAngleDoubleLeft} onClick={onCollapse} size="lg" style={{fontSize: "16px", color: "#000"}} />}
          </div>
          {user.error.type === "ALERT" ?
            <AsyncLoader />
            :

            <>
              <div className={collapse ? styles.stickyHeaderCollapsed : styles.stickyHeader}>
                {/* TODO Fix searchBar widths, it currently overlaps at narrow browser widths */}
                <div className={styles.searchBar} ref={searchBarRef} >

                  <SearchBar entities={entities} cardView={cardView} setHubArtifactsVisibilityPreferences={setHubArtifactsVisibilityPreferences}/>
                  <SearchSummary
                    total={totalDocuments}
                    start={searchOptions.start}
                    length={searchOptions.pageLength}
                    pageSize={searchOptions.pageSize}
                  />
                  <div id="top-search-pagination-bar">
                    <SearchPagination
                      total={totalDocuments}
                      pageNumber={searchOptions.pageNumber}
                      pageSize={searchOptions.pageSize}
                      pageLength={searchOptions.pageLength}
                      maxRowsPerPage={searchOptions.maxRowsPerPage}
                    />
                  </div>

                  <div className={styles.spinViews}>
                    <div className={styles.switchViews}>
                      {isLoading && <div className={styles.spinnerContainer}><Spinner animation="border" data-testid="spinner" variant="primary" /></div>}
                      {!cardView ? <div id="switch-view-explorer" aria-label="switch-view" >
                        <Radio.Group
                          buttonStyle="outline"
                          name="radiogroup"
                          size="large"
                          defaultValue={tableView ? "table" : "snippet"}
                          onChange={e => handleViewChange(e.target.value)}
                        >
                          <Radio.Button aria-label="switch-view-table" value={"table"} >
                            <HCTooltip text="Table View" id="table-view-tooltip" placement="top">
                              <i data-cy="table-view" id={"tableView"}>
                                <FontAwesomeIcon icon={faTable} />
                              </i>
                            </HCTooltip>
                          </Radio.Button>
                          <Radio.Button aria-label="switch-view-snippet" value={"snippet"} >
                            <HCTooltip text="Snippet View" id="snippet-view-tooltip" placement="top">
                              <i data-cy="facet-view" id={"snippetView"}>
                                <FontAwesomeIcon icon={faStream} />
                              </i>
                            </HCTooltip>
                          </Radio.Button>
                        </Radio.Group>
                      </div> : ""}
                    </div>
                  </div>
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
              <div className={styles.viewContainer} >
                <div>
                  {cardView ?
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
                        />
                      </div>
                      : isLoading ? <></> : <div id="snippetViewResult" className={styles.snippetViewResult} ref={resultsRef} onScroll={onResultScroll}><SearchResults data={data} entityDefArray={entityDefArray} tableView={tableView} columns={columns} /></div>
                    )}
                </div>
                <br />

              </div>
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
              </div>
            </>

          }
        </Content>

      </Layout>
    );
  }
};

export default withRouter(Browse);
