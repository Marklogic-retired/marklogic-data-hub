import React, {useState, useEffect, useContext, useRef, useLayoutEffect} from "react";
import axios from "axios";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {UserContext} from "../util/user-context";
import {SearchContext} from "../util/search-context";
import AsyncLoader from "../components/async-loader/async-loader";
import Sidebar from "../components/sidebar/sidebar";
import SearchPagination from "../components/search-pagination/search-pagination";
import SearchSummary from "../components/search-summary/search-summary";
import SearchResults from "../components/search-results/search-results";
import {ExploreToolTips, ModelingMessages} from "../config/tooltips.config";
import {updateUserPreferences, createUserPreferences, getUserPreferences} from "../services/user-preferences";
import {entityFromJSON, entityParser, facetParser, getTableProperties} from "../util/data-conversion";
import styles from "./Browse.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStream, faTable, faProjectDiagram, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
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
import {getHubCentralConfig} from "../api/modeling"; // eslint-disable-line @typescript-eslint/no-unused-vars
import SelectedFacets from "@components/selected-facets/selected-facets";
import EntitySpecificSidebar from "@components/explore/entity-specific-sidebar/entity-specific-sidebar";
import EntityIconsSidebar from "@components/explore/entity-icons-sidebar/entity-icons-sidebar";
import {QuestionCircleFill} from "react-bootstrap-icons";


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
    resetSearchOptions,
    applySaveQuery,
    setPageWithEntity,
    setDatabase,
    setEntityDefinitionsArray,
    clearAllGreyFacets,
    setEntityTypeIds,
  } = useContext(SearchContext);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const authorityService = useContext(AuthoritiesContext);
  const [data, setData] = useState<any[]>([]);
  const [currentBaseEntities, setCurrentBaseEntities] = useState<any[]>([]);
  const [currentEntitiesIcons, setCurrentEntitiesIcons] = useState<any[]>([]);
  const [currentRelatedEntities, setCurrentRelatedEntities] = useState<Map<string, any>>(new Map());
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
  const [hideDataHubArtifacts, toggleDataHubArtifacts] = useState(JSON.parse(getUserPreferences(user.name)).query?.hideHubArtifacts);
  const [entitiesData, setEntitiesData] = useState<any[]>([]);
  const [showNoDefinitionAlertMessage, setShowNoDefinitionAlertMessage] = useState(false);
  const [coords, setCoords] = useState<any>(undefined);
  const [entitySpecificPanel, setEntitySpecificPanel] = useState<any>(undefined);
  const [facetsSpecificPanel, setFacetsEntitySpecificPanel] = useState<any>(undefined);
  const [showMainSidebar, setShowMainSidebar] = useState<boolean>(true);
  const [showEntitySpecificPanel, setShowEntitySpecificPanel] = useState<boolean>(false);
  const [graphView, setGraphView] = useState(state && state.graphView ? true : JSON.parse(getUserPreferences(user.name)).graphView);
  const [applyClicked, toggleApplyClicked] = useState(false);
  const [showApply, toggleApply] = useState(false);
  const [updateSpecificFacets, setUpdateSpecificFacets] = useState<boolean>(false);
  const [isAllEntitiesSelected, setIsAllEntitiesSelected] = useState(true);
  const [parsedFacets, setParsedFacets] = React.useState<any[]>([]);


  const isGraphView = () => {
    const isGraph = searchOptions.nextEntityType !== "All Data" && graphView;
    return isGraph;
  };

  const setEntitySpecificFacets = (entity) => {
    const {name} = entity;
    let entityFacets: any[] = [];
    let newEntityFacets = parsedFacets.filter(facet => facet.facetName.split(".")[0] === entity.name);
    const entityDef = entityDefArray.find(entity => entity.name === name);
    if (newEntityFacets) {
      for (let i in newEntityFacets) {
        newEntityFacets[i].referenceType = "path";
        newEntityFacets[i].entityTypeId = entityDef?.info["baseUri"] + entityDef?.info["title"] + "-" + entityDef?.info["version"] + "/" + entityDef?.name;
        newEntityFacets[i].propertyPath = newEntityFacets[i]["facetName"].substring(newEntityFacets[i]["facetName"].indexOf(".") + 1);
      }
    }
    entityFacets = newEntityFacets ? newEntityFacets.filter(item => item !== false) : [];
    return entityFacets;
  };

  const handleEntitySelected = (entity: any) => {
    const entityFacets = setEntitySpecificFacets(entity);
    setEntitySpecificPanel(entity);
    setFacetsEntitySpecificPanel(entityFacets);
    setShowEntitySpecificPanel(true);
    if (currentBaseEntities.length > 0) {
      setCurrentEntitiesIcons(currentBaseEntities);
    } else {
      setCurrentEntitiesIcons(entityDefArray);
    }
  };

  const onSetEntitySpecificPanel = (entity) => {
    const entityFacets = setEntitySpecificFacets(entity);
    setEntitySpecificPanel(entity);
    setFacetsEntitySpecificPanel(entityFacets);
  };

  const updateVisibility = (status: boolean) => {
    setShowMainSidebar(status);
    setShowEntitySpecificPanel(status);
  };

  const closeSpecificSidebar = () => {
    setEntitySpecificPanel(undefined);
    setFacetsEntitySpecificPanel(undefined);
    setShowEntitySpecificPanel(false);
  };

  const [graphSearchData, setGraphSearchData] = useState({});
  const [hubCentralConfig, sethubCentralConfig] = useState({});

  useEffect(() => {
    if (entitySpecificPanel) {
      const entityFacets = setEntitySpecificFacets(entitySpecificPanel);
      setFacetsEntitySpecificPanel(entityFacets);
    }
  }, [parsedFacets]);

  const getGraphSearchResult = async (allEntities: any[]) => {
    try {
      let payload = {
        "database": searchOptions.database,
        "data": {
          "query": {
            "searchText": searchOptions.query,
            "entityTypeIds": allEntities,
            "selectedFacets": searchOptions.selectedFacets,
            "relatedEntityTypeIds": searchOptions.relatedEntityTypeIds
          },
          "start": 0,
          "pageLength": 1000,
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

  const getSearchResults = async (allEntities: string[]) => {
    let searchText = searchOptions.query;
    try {
      handleUserPreferences();
      setIsLoading(true);
      const response = await axios({
        method: "POST",
        url: `/api/entitySearch?database=${searchOptions.database}`,
        data: {
          query: {
            searchText,
            entityTypeIds: searchOptions.nextEntityType === "All Data" ? [] : allEntities,
            selectedFacets: searchOptions.selectedFacets,
            hideHubArtifacts: searchOptions.nextEntityType === "All Data" ? hideDataHubArtifacts : true
          },
          propertiesToDisplay: searchOptions.nextEntityType === "All Data" ? [] : searchOptions.selectedTableProperties,
          start: searchOptions.start,
          pageLength: searchOptions.pageLength,
          sortOrder: searchOptions.sortOrder
        }
      });
      if (!["All Data"].includes(searchOptions.nextEntityType) && searchOptions.nextEntityType !== "") {
        setShowNoDefinitionAlertMessage(titleNoDefinition(searchOptions.nextEntityType));
      } else {
        setShowNoDefinitionAlertMessage(false);
      }
      if (componentIsMounted.current && response.data) {
        if (response.data.entityPropertyDefinitions && graphView) {
          setData(response.data.results);
        } else if (!isGraphView()) {
          setData(response.data.results);
        }
        if (response.data.hasOwnProperty("entityPropertyDefinitions")) {
          setEntityPropertyDefinitions(response.data.entityPropertyDefinitions);
        }
        if (response.data.hasOwnProperty("selectedPropertyDefinitions")) {
          setSelectedPropertyDefinitions(response.data.selectedPropertyDefinitions);
        }

        setFacets(response.data.facets);
        const formatterFacets: any = facetParser(response.data.facets);
        setParsedFacets(formatterFacets);
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
    let entityTypesExist = searchOptions.entityTypeIds.length > 0;
    let defaultOptionsForPageRefresh = !searchOptions.nextEntityType && (searchOptions.entityTypeIds.length > 0 || cardView);
    let selectingAllEntitiesOption = (searchOptions.nextEntityType === "All Entities" && !isColumnSelectorTouched && !entitySpecificPanel);
    let selectingAllDataOption = (searchOptions.nextEntityType === "All Data" && !isColumnSelectorTouched && !entitySpecificPanel);
    let selectingEntityType = (searchOptions.nextEntityType && !["All Entities", "All Data"].includes(searchOptions.nextEntityType) && searchOptions.entityTypeIds[0] === searchOptions.nextEntityType || entitySpecificPanel);
    let notSelectingCardViewWhenNoEntities = !cardView && !searchOptions.entityTypeIds.length;

    if (selectingAllDataOption || (entityTypesExist && (defaultOptionsForPageRefresh || selectingAllEntitiesOption || selectingEntityType))) {
      getSearchResults(searchOptions.entityTypeIds);
    } else {
      if (notSelectingCardViewWhenNoEntities) {
        setData([]);
        setFacets({});
        setTotalDocuments(0);
      }
    }
    if (entitySpecificPanel) {
      setUpdateSpecificFacets(true);
    }
  };

  useEffect(() => {
    initializeUserPreferences();
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let loaded = true;
    (async () => {
      try {
        const modelsResponse = await axios.get(`/api/models`);
        const HubCentralConfigResponse = await getHubCentralConfig();
        const parsedModelData = entityFromJSON(modelsResponse.data);
        let parsedEntityDef = entityParser(parsedModelData).filter(entity => entity.name && entity);
        const entitiesTypeIds = parsedEntityDef.map(entity => entity.name);

        // this block is to add colors an icons to the entities
        let entitiesWithFullProperties = parsedEntityDef;
        if (HubCentralConfigResponse["status"] === 200 && HubCentralConfigResponse.data && Object.keys(HubCentralConfigResponse.data).length > 0) {
          const {data: {modeling: {entities}}} = HubCentralConfigResponse;
          entitiesWithFullProperties = parsedEntityDef.map(entity => {
            if (entities[entity.name]) {
              entity.icon = entities[entity.name].icon;
              entity.color = entities[entity.name].color;
            }
            return entity;
          });
        }


        if (loaded) {
          if (searchOptions.entityTypeIds.length === 0 && searchOptions.nextEntityType !== "All Data") {
            setEntityTypeIds(entitiesTypeIds);
          }
          setEntityDefinitionsArray(parsedEntityDef);
          setEntitiesData(modelsResponse.data);
          sethubCentralConfig(HubCentralConfigResponse.data);
          setEntityDefArray(entitiesWithFullProperties);
          setCurrentBaseEntities(entitiesWithFullProperties);

        }

      } catch (error) {
        handleError(error);
      }
    })();
    return () => {
      loaded = false;
    };
  }, []);

  useEffect(() => {
    //This can be a toggle when nextEntityType is replaced with the All Data/All Entities toggle.
    if (searchOptions.nextEntityType && searchOptions.nextEntityType === "All Entities") {
      if (cardView) setCardView(false);
    } else if (searchOptions.nextEntityType && searchOptions.nextEntityType === "All Data") {
      if (!cardView) setCardView(true);
    }
    fetchUpdatedSearchResults();
  }, [tableView, graphView, searchOptions.database, searchOptions.entityTypeIds, searchOptions.nextEntityType, searchOptions.query, searchOptions.selectedFacets, user.error.type, hideDataHubArtifacts]);

  useEffect(() => {
    let baseEntitiesSelected = searchOptions.entityTypeIds.length > 0;
    if (graphView && baseEntitiesSelected && searchOptions.nextEntityType !== "All Data") {
      getGraphSearchResult(searchOptions.entityTypeIds);
    }
    return () => {
      setGraphSearchData({});
    };
  }, [graphView, searchOptions.entityTypeIds, searchOptions.relatedEntityTypeIds, searchOptions.database, searchOptions.query, searchOptions.selectedFacets, user.error.type, hideDataHubArtifacts]);

  useEffect(() => {
    let state: any = location.state;
    if (state && state["isBackToResultsClicked"]) {
      getSearchResults(searchOptions.entityTypeIds);
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
    } else if (state && state.hasOwnProperty("entity")) {
      if (Array.isArray(state["entity"])) {
        setEntityClearQuery(state["entity"][0]);
      } else {
        setEntityClearQuery(state["entity"]);
      }
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
      graphView: view ? (view === "graph" ? true : false) : graphView,
      database: searchOptions.database,
      baseEntities: searchOptions.baseEntities
    };
    updateUserPreferences(user.name, preferencesObject);
  };

  const handleUserPreferences = () => {
    setUserPreferences();

    if (searchOptions.entityTypeIds.length > 0 && !searchOptions.entityTypeIds.includes(searchOptions.entityTypeIds[0])) {
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
    if (updateSpecificFacets) {
      setUpdateSpecificFacets(false);
    }
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
      <HCTooltip text={graphSearchData["limit"] > 1000 ? ExploreToolTips.largeDatasetWarning : ExploreToolTips.numberOfResults} id="asterisk-help-tooltip" placement="right">
        {graphSearchData["limit"] > 1000 ? <i data-testid="warning-large-data"><FontAwesomeIcon icon={faExclamationTriangle} className={styles.largeDatasetWarning} /></i> :
          <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} />}
      </HCTooltip>
    </span>
  );

  const numberOfResultsBanner = <span className={styles.graphViewSummaryIcon}>Viewing {graphSearchData["limit"]} of {graphSearchData["total"]} results {helpIcon()}</span>;


  return (
    <div className={styles.layout}>
      {showEntitySpecificPanel ?
        <HCSider placement="left" show={showMainSidebar} width="55px">
          <EntityIconsSidebar
            currentBaseEntities={currentEntitiesIcons}
            onClose={closeSpecificSidebar}
            currentRelatedEntities={currentRelatedEntities}
            updateSelectedEntity={onSetEntitySpecificPanel}
          />
        </HCSider>
        : <HCSider placement="left" show={showMainSidebar} footer={<SidebarFooter />}>
          <>
            <div className="p-2">
              <Query queries={queries || []}
                setQueries={setQueries}
                isSavedQueryUser={isSavedQueryUser}
                columns={columns}
                setIsLoading={setIsLoading}
                entities={searchOptions.entityTypeIds}
                selectedFacets={selectedFacets}
                greyFacets={greyFacets}
                isColumnSelectorTouched={isColumnSelectorTouched}
                setColumnSelectorTouched={setColumnSelectorTouched}
                entityDefArray={entityDefArray}
                database={searchOptions.database}
                setCardView={setCardView}
                cardView={cardView}
                toggleApplyClicked={toggleApplyClicked}
                toggleApply={toggleApply}
              />
            </div>
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
              graphView={graphView}
              setEntitySpecificPanel={handleEntitySelected}
              currentBaseEntities={currentBaseEntities}
              setCurrentBaseEntities={setCurrentBaseEntities}
              currentRelatedEntities={currentRelatedEntities}
              setCurrentRelatedEntities={setCurrentRelatedEntities}
              isAllEntitiesSelected={isAllEntitiesSelected}
              setIsAllEntitiesSelected={setIsAllEntitiesSelected}
            />
          </>
        </HCSider>
      }
      {entitySpecificPanel &&
        <HCSider color={entitySpecificPanel.color} placement="left" show={showEntitySpecificPanel} footer={<SidebarFooter />} updateVisibility={updateVisibility}>
          <EntitySpecificSidebar
            entitySelected={entitySpecificPanel}
            entityFacets={facetsSpecificPanel}
            checkFacetRender={updateCheckedFacets}
            facetRender={updateSelectedFacets}
            updateSpecificFacets={updateSpecificFacets}
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
                {showNoDefinitionAlertMessage ? <div aria-label="titleNoDefinition" className={styles.titleNoDefinition}>{ModelingMessages.titleNoDefinition}</div> :
                  <span className="d-flex justify-content-between">
                    {!isGraphView() &&
                      <div className={styles.searchSummaryGraphView}>
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
                        {isGraphView() && <div className={styles.graphViewSearchSummary} aria-label={"graph-view-searchSummary"}>
                          {numberOfResultsBanner}
                        </div>}
                        {isLoading && <div className={styles.spinnerContainer}><Spinner animation="border" data-testid="spinner" variant="primary" /></div>}
                        {!cardView ? <div id="switch-view-explorer" aria-label="switch-view" >
                          <div className={"switch-button-group outline"}>
                            <span>
                              <input
                                type="radio"
                                id="switch-view-graph"
                                name="switch-view-radiogroup"
                                value={"graph"}
                                defaultChecked={graphView}
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
                                defaultChecked={tableView && !graphView}
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
                                defaultChecked={!tableView && !graphView}
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
              <div className="mt-4">
                <SelectedFacets
                  selectedFacets={selectedFacets}
                  greyFacets={greyFacets}
                  applyClicked={applyClicked}
                  showApply={showApply}
                  toggleApply={(clicked) => toggleApply(clicked)}
                  toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
                />
              </div>
            </div>
            {!showNoDefinitionAlertMessage &&
              <div className={isGraphView() ? styles.viewGraphContainer : styles.viewContainer} >
                <div>
                  {cardView ?
                    <RecordCardView
                      data={data}
                      entityPropertyDefinitions={entityPropertyDefinitions}
                      selectedPropertyDefinitions={selectedPropertyDefinitions}
                    />
                    : graphView ?
                      <div>
                        <GraphViewExplore
                          entityTypeInstances={graphSearchData}
                          graphView={graphView}
                          coords={coords}
                          setCoords={setCoords}
                          hubCentralConfig={hubCentralConfig}
                        />
                      </div> :
                      (tableView ?
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
            {!showNoDefinitionAlertMessage && !isGraphView() &&
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
