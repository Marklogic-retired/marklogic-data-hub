import React, {useState, useEffect, useContext, useRef, useLayoutEffect} from "react";
import axios from "axios";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {UserContext} from "@util/user-context";
import {SearchContext} from "@util/search-context";
import AsyncLoader from "@components/async-loader/async-loader";
import ViewSwitch from "@components/common/switch-view/view-switch";
import Sidebar from "@components/sidebar/sidebar";
import SearchPagination from "@components/search-pagination/search-pagination";
import SearchSummary from "@components/search-summary/search-summary";
import SearchResults from "@components/search-results/search-results";
import {ExploreToolTips, ModelingMessages} from "@config/tooltips.config";
import {updateUserPreferences, createUserPreferences, getUserPreferences} from "../services/user-preferences";
import {entityFromJSON, entityParser, facetParser, getTableProperties} from "@util/data-conversion";
import styles from "./Browse.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import Query from "@components/queries/queries";
import {AuthoritiesContext} from "@util/authorities";
import ResultsTabularView from "@components/results-tabular-view/results-tabular-view";
import {QueryOptions} from "../types/query-types";
import Spinner from "react-bootstrap/Spinner";
import RecordCardView from "@components/record-view/record-view";
import SidebarFooter from "@components/sidebar-footer/sidebar-footer";
import {CSSProperties} from "react";
import GraphViewExplore from "@components/explore/graph-view-explore/graph-view-explore";
import {HCTooltip, HCSider} from "@components/common";
import {graphSearchQuery, searchResultsQuery} from "@api/queries";
import SelectedFacets from "@components/selected-facets/selected-facets";
import EntitySpecificSidebar from "@components/explore/entity-specific-sidebar/entity-specific-sidebar";
import EntityIconsSidebar from "@components/explore/entity-icons-sidebar/entity-icons-sidebar";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {ViewType} from "../types/modeling-types";
import {themeColors} from "@config/themes.config";
import {HubCentralConfigContext} from "@util/hubCentralConfig-context";
import {baseEntitiesSorting} from "@util/entities-sorting";
import {getRelatedConcepts} from "@api/facets";
import {getEnvironment} from "@util/environment";

interface Props extends RouteComponentProps<any> {
}

const Browse: React.FC<Props> = ({location}) => {
  const componentIsMounted = useRef(true);
  const {
    user,
    handleError
  } = useContext(UserContext);
  const userPreferences = JSON.parse(getUserPreferences(user.name));
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
    savedNode,
    setSavedNode
  } = useContext(SearchContext);
  const {hubCentralConfig} = useContext(HubCentralConfigContext);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const authorityService = useContext(AuthoritiesContext);
  const [data, setData] = useState<any[]>([]);
  const [currentBaseEntities, setCurrentBaseEntities] = useState<any[]>([]);
  const [currentEntitiesIcons, setCurrentEntitiesIcons] = useState<any[]>([]);
  const [currentRelatedEntities, setCurrentRelatedEntities] = useState<Map<string, any>>(new Map());
  const [currentRelatedConcepts, setCurrentRelatedConcepts] = useState<Map<string, any>>(new Map());
  const [entityIndicatorData, setEntityIndicatorData] = useState<any>({});
  const [entityRelationships, setEntityRelationships] = useState<any>({});
  const [entityDefArray, setEntityDefArray] = useState<any[]>([]);
  const [facets, setFacets] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [viewOptions, setViewOptions] = useState({
    graphView: userPreferences.graphView ? userPreferences.graphView : false,
    tableView: userPreferences.tableView ? userPreferences.tableView : false
  });
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
  const [cardView, setCardView] = useState(state && state["isEntityInstance"] ? true : userPreferences.cardView ? true : false);
  const [hideDataHubArtifacts, toggleDataHubArtifacts] = useState(userPreferences.query?.hideHubArtifacts);
  const [entitiesData, setEntitiesData] = useState<any[]>([]);
  const [showNoDefinitionAlertMessage, setShowNoDefinitionAlertMessage] = useState(false);
  const [entitySpecificPanel, setEntitySpecificPanel] = useState<any>(undefined);
  const [facetsSpecificPanel, setFacetsEntitySpecificPanel] = useState<any>(undefined);
  const [showMainSidebar, setShowMainSidebar] = useState<boolean>(true);
  const [showEntitySpecificPanel, setShowEntitySpecificPanel] = useState<boolean>(false);
  const [applyClicked, toggleApplyClicked] = useState(false);
  const [showApply, toggleApply] = useState(false);
  const [updateSpecificFacets, setUpdateSpecificFacets] = useState<boolean>(false);
  const [parsedFacets, setParsedFacets] = React.useState<any[]>([]);
  const [selectedView, setSelectedView] = useState<ViewType>(viewOptions.graphView ? ViewType.graph : (viewOptions.tableView ? ViewType.table : ViewType.snippet));
  const [entitiesWithRelatedConcepts, setEntitiesWithRelatedConcepts] = useState({});
  const [viewConcepts, setViewConcepts] = useState(true);
  const [physicsAnimation, setPhysicsAnimation] = useState(true);
  const [graphLoading, setGraphLoading] = useState(false);
  const conceptsSupport: boolean = getEnvironment().supportConcepts ? getEnvironment().supportConcepts : false;

  const searchResultDependencies = [
    searchOptions.pageLength,
    searchOptions.start,
    searchOptions.pageNumber,
    viewOptions.tableView,
    searchOptions.database,
    searchOptions.selectedTableProperties,
    searchOptions.entityTypeIds,
    searchOptions.nextEntityType,
    searchOptions.query,
    searchOptions.selectedFacets,
    searchOptions.mergeUnmerge,
    user.error.type,
    hideDataHubArtifacts
  ];

  const isGraphView = () => {
    const isGraph = searchOptions.nextEntityType !== "All Data" && viewOptions.graphView;
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

  const [graphSearchData, setGraphSearchData] = useState<any>({});
  const [graphPageInfo, setGraphPageInfo] = useState({});

  useEffect(() => {
    if (entitySpecificPanel) {
      const entityFacets = setEntitySpecificFacets(entitySpecificPanel);
      setFacetsEntitySpecificPanel(entityFacets);
    }
  }, [parsedFacets]);

  useEffect(() => {
    if (!physicsAnimation) {
      setGraphLoading(false);
    }
  }, [physicsAnimation]);

  const getAllFacetsExceptConcepts = () => {
    return Object.fromEntries(Object.entries(searchOptions.selectedFacets).filter(([key, value]) => key !== "RelatedConcepts"));
  };

  const getGraphSearchResult = async (allEntities: any[]) => {
    try {
      let conceptFilterTypeIds: any = [];
      conceptFilterTypeIds = searchOptions.conceptFilterTypeIds;

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
          "pageLength": 100,
        }
      };
      if (conceptFilterTypeIds.length) {
        payload["data"]["query"]["conceptsFilterTypeIds"] = searchOptions.conceptFilterTypeIds;
      }
      const response = await graphSearchQuery(payload);
      if (componentIsMounted.current && response.data) {
        setGraphSearchData(response.data);
        let pageInfo = {
          pageLength: response.data.limit,
          total: response.data.total
        };
        setGraphPageInfo(pageInfo);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getSearchResults = async (allEntities: string[]) => {
    let searchText = searchOptions.query;
    let filteredSelectedFacets = {};
    if (searchOptions.selectedFacets.hasOwnProperty("RelatedConcepts")) {
      filteredSelectedFacets = getAllFacetsExceptConcepts();
    }
    try {
      handleUserPreferences();
      setIsLoading(true);
      let searchPayload = {
        database: searchOptions.database,
        data: {
          query: {
            searchText,
            entityTypeIds: searchOptions.nextEntityType === "All Data" ? [] : allEntities,
            selectedFacets: searchOptions.selectedFacets.hasOwnProperty("RelatedConcepts") ? filteredSelectedFacets : searchOptions.selectedFacets,
            hideHubArtifacts: searchOptions.nextEntityType === "All Data" ? hideDataHubArtifacts : true
          },
          propertiesToDisplay: searchOptions.nextEntityType === "All Data" ? [] : searchOptions.selectedTableProperties,
          start: searchOptions.start,
          pageLength: searchOptions.pageLength,
          sortOrder: searchOptions.sortOrder
        }
      };

      const response = await searchResultsQuery(searchPayload);

      if (!["All Data"].includes(searchOptions.nextEntityType) && searchOptions.nextEntityType !== "") {
        setShowNoDefinitionAlertMessage(titleNoDefinition(searchOptions.nextEntityType));
      } else {
        setShowNoDefinitionAlertMessage(false);
      }
      if (componentIsMounted.current && response && response.data) {
        if (response.data.entityPropertyDefinitions && viewOptions.graphView) {
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
    let selectingColumnsInOneEntity = searchOptions.entityTypeIds.length === 1 && isColumnSelectorTouched;
    let notSelectingCardViewWhenNoEntities = !cardView && !searchOptions.entityTypeIds.length;

    if (selectingAllDataOption || (entityTypesExist && (defaultOptionsForPageRefresh || selectingAllEntitiesOption || selectingEntityType || selectingColumnsInOneEntity))) {
      getSearchResults(searchOptions.entityTypeIds);
      setColumnSelectorTouched(false);
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

  const fetchConceptFacets = async () => {
    try {
      const response =  await getRelatedConcepts(searchOptions.database);
      if (response.status === 200) {
        setEntitiesWithRelatedConcepts(response.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    initializeUserPreferences();
    fetchConceptFacets();
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let loaded = true;
    (async () => {
      try {
        const modelsResponse = await axios.get(`/api/models`);
        const relationships = await axios.get(`/api/entitySearch/relationships?database=final`);
        const parsedModelData = entityFromJSON(modelsResponse.data);
        const parsedEntityDef = entityParser(parsedModelData).filter(entity => entity.name && entity);
        const entitiesTypeIds = parsedEntityDef.map(entity => entity.name);

        // this block is to add colors an icons to the entities
        let entitiesWithFullProperties = parsedEntityDef;
        if (hubCentralConfig && hubCentralConfig.modeling && Object.keys(hubCentralConfig.modeling.entities).length > 0) {
          const {modeling: {entities}} = hubCentralConfig;
          entitiesWithFullProperties = parsedEntityDef.map(entity => {
            let tmpEntity = {...entity};
            if (entities[entity.name]) {
              tmpEntity.icon = entities[entity.name].icon;
              tmpEntity.color = entities[entity.name].color;
            }
            return tmpEntity;
          });
        }

        if (loaded) {
          if (searchOptions.entityTypeIds.length === 0 && searchOptions.nextEntityType !== "All Data") {
            setEntityTypeIds(entitiesTypeIds);
          }
          setEntityRelationships(relationships.data);
          setEntityDefinitionsArray(parsedEntityDef);
          setEntitiesData(modelsResponse.data);
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
  }, [hubCentralConfig]);

  useEffect(() => {
    if (currentBaseEntities.length > 0) {
      setCurrentEntitiesIcons(baseEntitiesSorting(currentBaseEntities));
    } else {
      setCurrentEntitiesIcons(baseEntitiesSorting(entityDefArray));
    }
  }, [currentBaseEntities]);

  useEffect(() => {
    if (entitySpecificPanel) {
      let entitySelectd = {...entitySpecificPanel};
      entitySelectd.color = hubCentralConfig?.modeling?.entities[entitySpecificPanel.name]?.color;
      entitySelectd.icon = hubCentralConfig?.modeling?.entities[entitySpecificPanel.name]?.icon;
      setEntitySpecificPanel(entitySelectd);
    }
  }, [hubCentralConfig]);

  useEffect(() => {
    //This can be a toggle when nextEntityType is replaced with the All Data/All Entities toggle.
    if (searchOptions.nextEntityType && searchOptions.nextEntityType === "All Entities") {
      if (cardView) setCardView(false);
    } else if (searchOptions.nextEntityType && searchOptions.nextEntityType === "All Data") {
      if (!cardView) setCardView(true);
    }
    fetchUpdatedSearchResults();

  }, searchResultDependencies);

  useEffect(() => {
    let baseEntitiesSelected = searchOptions.entityTypeIds.length > 0;
    if (isGraphView() && baseEntitiesSelected) {
      if (savedNode && !savedNode["navigatingFromOtherView"]) {
        setSavedNode(undefined);
      }
      getGraphSearchResult(searchOptions.entityTypeIds);
    }
    if (physicsAnimation) {
      setGraphLoading(true);
    }
    return () => {
      setGraphSearchData({});
    };
  }, [viewOptions.graphView, searchOptions.entityTypeIds, searchOptions.relatedEntityTypeIds, searchOptions.conceptFilterTypeIds, searchOptions.database, searchOptions.datasource, searchOptions.query, searchOptions.selectedFacets, user.error.type, hideDataHubArtifacts, hubCentralConfig]);

  useEffect(() => {
    let state: any = location.state;
    if (state && state["isBackToResultsClicked"]) {
      getSearchResults(searchOptions.entityTypeIds);
    }
  }, []);

  const getClearEnititesObject = entities => Object.keys(entities).reduce((previousValue, entityType) => ({...previousValue, [entityType]: {filter: 0, amount: 0}}), {});
  const getMaxOnEntitiesObject = entities => Object.keys(entities).reduce((previousValue, entityType) => entities && entities.hasOwnProperty(entityType) && previousValue < entities[entityType].amount ? entities[entityType].amount : previousValue, 0);

  useEffect(() => {
    if (hubCentralConfig.modeling && Object.keys(hubCentralConfig.modeling?.entities).length > 0) {
      const tmpEntities = getClearEnititesObject(hubCentralConfig.modeling.entities);
      if (viewOptions.graphView && graphSearchData.nodes) {
        graphSearchData.nodes.forEach(node => {
          if (!node.isConcept) {
            let tmpEntityType = node.group.split("/").pop();
            if (tmpEntities[tmpEntityType]) {
              tmpEntities[tmpEntityType].amount++;
            }
          }
        });
      } else if (data.length > 0) {
        data.forEach(row => {
          if (tmpEntities.hasOwnProperty(row.entityName)) {
            tmpEntities[row.entityName].amount++;
          }
        });
      }
      if (selectedFacets.length > 0) {
        selectedFacets.forEach(facet => {
          const entityTypeName = facet.constraint.split(".")[0];
          if (tmpEntities.hasOwnProperty(entityTypeName)) {
            tmpEntities[entityTypeName].filter++;
          }
        });
      }
      setEntityIndicatorData({
        max: getMaxOnEntitiesObject(tmpEntities),
        entities: tmpEntities
      });
    } else {
      setEntityIndicatorData({
        max: 0,
        entities: {}
      });
    }
  }, [hubCentralConfig, viewOptions, graphSearchData.nodes, data, selectedFacets]);

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
      state["tableView"] ? setViewOptions({...viewOptions, tableView: true}) : setViewOptions({...viewOptions, tableView: false});
    } else if (state && state.hasOwnProperty("uri")) {
      setPageWithEntity(state["entity"],
        state["pageNumber"],
        state["start"],
        state["searchFacets"],
        state["query"],
        state["sortOrder"],
        state["targetDatabase"]);
      state["tableView"] ? setViewOptions({...viewOptions, tableView: true}) : setViewOptions({...viewOptions, tableView: false});
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
      tableView: view ? (view === "table" ? true : false) : viewOptions.tableView,
      selectedQuery: searchOptions.selectedQuery,
      queries: queries,
      propertiesToDisplay: searchOptions.selectedTableProperties,
      sortOrder: searchOptions.sortOrder,
      cardView: cardView,
      graphView: view ? (view === "graph" ? true : false) : viewOptions.graphView,
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
      setViewOptions({graphView: true, tableView: false});
      tableView = "graph";
    } else if (view === "snippet") {
      setViewOptions({graphView: false, tableView: false});
      tableView = "snippet";
    } else {
      setViewOptions({graphView: false, tableView: true});
      tableView = "table";
    }
    setUserPreferences(tableView);
    setSelectedView(ViewType[tableView]);

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
    if (viewOptions.graphView) {
      style["marginLeft"] = "20px";
      style["marginTop"] = "10px";
      style["justifyContent"] = "space-between";
    }
    return style;
  };

  const helpIcon = () => (
    <span>
      <HCTooltip text={graphPageInfo["pageLength"] > 100 ? ExploreToolTips.largeDatasetWarning : ExploreToolTips.numberOfResults} id="asterisk-help-tooltip" placement="right">
        {graphPageInfo["pageLength"] > 100 ? <i data-testid="warning-large-data"><FontAwesomeIcon icon={faExclamationTriangle} className={styles.largeDatasetWarning} /></i> :
          <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} />}
      </HCTooltip>
    </span>
  );

  const numberOfResultsBanner = Object.keys(graphPageInfo).length > 0 && <span aria-label="results-count" className={styles.graphViewSummaryIcon}>Viewing {graphPageInfo["pageLength"]} of {graphPageInfo["total"]} results {helpIcon()}</span>;

  return (
    <div className={styles.layout}>
      {showEntitySpecificPanel ?
        <HCSider placement="left" show={showMainSidebar} width="55px">
          <EntityIconsSidebar
            currentBaseEntities={currentEntitiesIcons}
            onClose={closeSpecificSidebar}
            currentRelatedEntities={currentRelatedEntities}
            updateSelectedEntity={onSetEntitySpecificPanel}
            graphView={viewOptions.graphView}
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
                setCurrentBaseEntities={setCurrentBaseEntities}
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
              graphConceptsSearchSupported={conceptsSupport}
              cardView={cardView}
              viewConcepts={viewConcepts}
              graphView={viewOptions.graphView}
              setEntitySpecificPanel={handleEntitySelected}
              currentBaseEntities={currentBaseEntities}
              setCurrentBaseEntities={setCurrentBaseEntities}
              currentRelatedEntities={currentRelatedEntities}
              setCurrentRelatedEntities={setCurrentRelatedEntities}
              currentRelatedConcepts={currentRelatedConcepts}
              setCurrentRelatedConcepts={setCurrentRelatedConcepts}
              entityIndicatorData={entityIndicatorData}
              entitiesWithRelatedConcepts={entitiesWithRelatedConcepts}
              entityRelationships={entityRelationships}
            />
          </>
        </HCSider>
      }
      {entitySpecificPanel &&
        <HCSider identity={entitySpecificPanel.name} color={entitySpecificPanel.color} placement="left" show={showEntitySpecificPanel} footer={<SidebarFooter />} updateVisibility={updateVisibility}>
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
                        {isLoading && !isGraphView() && <div className={styles.spinnerContainer}><Spinner animation="border" data-testid="spinner" variant="primary" /></div>}
                        {!cardView ? <ViewSwitch handleViewChange={handleViewChange} selectedView={selectedView} snippetView /> : ""}
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
                      entityDefArray={entityDefArray}
                    />
                    : viewOptions.graphView ?
                      <div className="position-relative">
                        {graphLoading && physicsAnimation &&
                          <div className={styles.loadingContainer} aria-label={"spinner-message-container"}>
                            <div className={styles.spinnerContainer}><Spinner animation="border" data-testid="spinner" variant="primary" /></div>
                            <div className={styles.loadingMsg}>Graph Loading...</div>
                            <br/>
                            <div className={styles.loadingMsgSubtext}>(This process may take longer depending on the size of your data)</div>
                          </div>
                        }
                        <div style={{opacity: graphLoading && physicsAnimation ? 0 : 1}}>
                          <GraphViewExplore
                            entityTypeInstances={graphSearchData}
                            graphView={viewOptions.graphView}
                            setViewConcepts={setViewConcepts}
                            setGraphPageInfo={setGraphPageInfo}
                            setIsLoading={setGraphLoading}
                            setPhysicsAnimation={setPhysicsAnimation}
                            entitiesWithRelatedConcepts={entitiesWithRelatedConcepts}
                            graphConceptsSearchSupported={conceptsSupport}
                            data={data}
                            entityDefArray={entityDefArray}
                          />
                        </div>
                      </div> :
                      (viewOptions.tableView ?
                        <div className={styles.tableViewResult}>
                          <ResultsTabularView
                            data={data}
                            entityPropertyDefinitions={entityPropertyDefinitions}
                            selectedPropertyDefinitions={selectedPropertyDefinitions}
                            entityDefArray={entityDefArray}
                            columns={columns}
                            selectedEntities={searchOptions.entityTypeIds}
                            setColumnSelectorTouched={setColumnSelectorTouched}
                            tableView={viewOptions.tableView}
                            isLoading={isLoading}
                            handleViewChange={handleViewChange}
                          />
                        </div>
                        : isLoading ? <></> : <div id="snippetViewResult" className={styles.snippetViewResult} ref={resultsRef} onScroll={onResultScroll}><SearchResults data={data}
                          handleViewChange={handleViewChange}
                          entityDefArray={entityDefArray} tableView={viewOptions.tableView} columns={columns} /></div>
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
