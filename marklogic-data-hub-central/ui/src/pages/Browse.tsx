import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { Layout } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { UserContext } from '../util/user-context';
import { SearchContext } from '../util/search-context';
import { useScrollPosition } from '../hooks/use-scroll-position';
import AsyncLoader from '../components/async-loader/async-loader';
import Sidebar from '../components/sidebar/sidebar';
import SearchBar from '../components/search-bar/search-bar';
import SearchPagination from '../components/search-pagination/search-pagination';
import SearchSummary from '../components/search-summary/search-summary';
import SearchResults from '../components/search-results/search-results';
import { updateUserPreferences, createUserPreferences, getUserPreferences } from '../services/user-preferences';
import { entityFromJSON, entityParser, getTableProperties } from '../util/data-conversion';
import styles from './Browse.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStream, faTable, faAngleDoubleRight, faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons'
import Query from '../components/queries/queries'
import { AuthoritiesContext } from "../util/authorities";
import ZeroStateExplorer from '../components/zero-state-explorer/zero-state-explorer';
import ResultsTabularView from "../components/results-tabular-view/results-tabular-view";
import { QueryOptions } from '../types/query-types';
import { MLTooltip, MLSpin, MLRadio } from '@marklogic/design-system';
import RawDataCardView from '../components/raw-data/raw-data-card-view/raw-data-card-view';


interface Props extends RouteComponentProps<any> {
}

const Browse: React.FC<Props> = ({ location }) => {
  const { Content, Sider } = Layout;
  const componentIsMounted = useRef(true);
  const {
    user,
    handleError
  } = useContext(UserContext);
  const {
    searchOptions,
    setEntityClearQuery,
    setLatestJobFacet,
    resetSearchOptions,
    applySaveQuery,
    setPageWithEntity,
    setPageQueryOptions,
  } = useContext(SearchContext);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const authorityService = useContext(AuthoritiesContext);
  const [data, setData] = useState<any[]>([]);
  const [entities, setEntites] = useState<any[]>([]);
  const [entityDefArray, setEntityDefArray] = useState<any[]>([]);
  const [facets, setFacets] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [tableView, toggleTableView] = useState(JSON.parse(getUserPreferences(user.name)).tableView);
  const [endScroll, setEndScroll] = useState(false);
  const [collapse, setCollapsed] = useState(false);
  const [selectedFacets, setSelectedFacets] = useState<any[]>([]);
  const [greyFacets, setGreyFacets] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isSavedQueryUser, setIsSavedQueryUser] = useState<boolean>(authorityService.isSavedQueryUser());
  const [queries, setQueries] = useState<any>([]);
  const [entityPropertyDefinitions, setEntityPropertyDefinitions] = useState<any[]>([]);
  const [selectedPropertyDefinitions, setSelectedPropertyDefinitions] = useState<any[]>([]);
  const [isColumnSelectorTouched, setColumnSelectorTouched] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [cardView, setCardView] = useState(location && location.state ? false : JSON.parse(getUserPreferences(user.name)).cardView);

  const getEntityModel = async () => {
    try {
      const response = await axios(`/api/models`);
      if (componentIsMounted.current) {
        const parsedModelData = entityFromJSON(response.data);
        let entityArray = [...entityFromJSON(response.data).map(entity => entity.info.title)];
        setEntites(entityArray);
        setEntityDefArray(entityParser(parsedModelData));
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  const getSearchResults = async (allEntities: string[]) => {
    try {
      handleUserPreferences();
      setIsLoading(true);
      const response = await axios({
        method: 'POST',
        url: `/api/entitySearch`,
        data: {
          query: {
            searchText: searchOptions.query,
            entityTypeIds: searchOptions.entityTypeIds.length ? searchOptions.entityTypeIds : allEntities,
            selectedFacets: searchOptions.selectedFacets,
          },
          propertiesToDisplay: searchOptions.selectedTableProperties,
          start: searchOptions.start,
          pageLength: searchOptions.pageLength,
          sortOrder: searchOptions.sortOrder
        }
      });
      if (componentIsMounted.current) {
        setData(response.data.results);
        if (response.data.hasOwnProperty('entityPropertyDefinitions')) {
          setEntityPropertyDefinitions(response.data.entityPropertyDefinitions);
        }
        if (response.data.hasOwnProperty('selectedPropertyDefinitions')) {
          setSelectedPropertyDefinitions(response.data.selectedPropertyDefinitions);
        }
        setFacets(response.data.facets);
        setTotalDocuments(response.data.total);

        if (response.data.selectedPropertyDefinitions && response.data.selectedPropertyDefinitions.length) {
          let properties = getTableProperties(response.data.selectedPropertyDefinitions);
          setColumns(properties)
        }
      }
    } catch (error) {
      console.error('error', error)
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getEntityModel();
    initializeUserPreferences();
    return () => {
      componentIsMounted.current = false
    }
  }, [])  

  useEffect(() => {
    if (entities.length && (!searchOptions.nextEntityType || searchOptions.nextEntityType === 'All Entities' || (searchOptions.entityTypeIds[0] == searchOptions.nextEntityType))) {
    getSearchResults(entities);
    }
  }, [searchOptions, searchOptions.zeroState === false && entities, user.error.type]);

  useEffect(() => {
    if (location.state && location.state.hasOwnProperty('zeroState') && !location.state['zeroState']) {
      setPageWithEntity(location.state['entity'],
        location.state['pageNumber'],
        location.state['start'],
        location.state['searchFacets'],
        location.state['query'],
        location.state['sortOrder'])
      location.state['tableView'] ? toggleTableView(true) : toggleTableView(false);
    }
    else if (location.state && location.state.hasOwnProperty('entityName') && location.state.hasOwnProperty('jobId')) {
      setLatestJobFacet(location.state['jobId'], location.state['entityName']);
    }
    else if (location.state && location.state.hasOwnProperty('entity')) {
      setEntityClearQuery(location.state['entity']);
    }

  }, [searchOptions.zeroState]);

  const setZeroStateQueryOptions = () => {
    let options: QueryOptions = {
      searchText: '',
      entityTypeIds: [],
      selectedFacets: {},
      selectedQuery: 'select a query',
      propertiesToDisplay: [],
      zeroState: true,
      manageQueryModal: false,
      sortOrder: []
    }
    applySaveQuery(options);
  }

  const initializeUserPreferences = async () => {
    let defaultPreferences = getUserPreferences(user.name);
    if (defaultPreferences !== null) {
      let parsedPreferences = JSON.parse(defaultPreferences);
      if (location.state) {
        if (location.state['tileIconClicked']) {
          await setZeroStateQueryOptions();
          let preferencesObject = {
            ...parsedPreferences,
            zeroState: searchOptions.zeroState
          }
          updateUserPreferences(user.name, preferencesObject);
        }
      } else {
        if (!parsedPreferences.zeroState && searchOptions.zeroState) {
          let options: any = {
            searchText: parsedPreferences.query.searchText || '',
            entityTypeIds: parsedPreferences.query.entityTypeIds || [],
            selectedFacets: parsedPreferences.query.selectedFacets || {},
            selectedQuery: searchOptions.selectedQuery || 'select a query',
            start: parsedPreferences.start || 1,
            pageNumber: parsedPreferences.pageNumber || 1,
            pageLength: parsedPreferences.pageLength,
            propertiesToDisplay: searchOptions.selectedTableProperties || [],
            zeroState: parsedPreferences.zeroState,
            manageQueryModal: false,
            sortOrder: parsedPreferences.sortOrder || []
          }
          await setPageQueryOptions(options)
          if (parsedPreferences.hasOwnProperty('tableView') && parsedPreferences.hasOwnProperty('cardView')) {
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
  }

  const setUserPreferences = (view: string = '') => {
    let preferencesObject = {
      query: {
        searchText: searchOptions.query,
        entityTypeIds: searchOptions.entityTypeIds,
        selectedFacets: searchOptions.selectedFacets
      },
      pageLength: searchOptions.pageLength,
      pageNumber: searchOptions.pageNumber,
      start: searchOptions.start,
      tableView: view ? (view === 'snippet' ? false : true) : tableView,
      selectedQuery: searchOptions.selectedQuery,
      queries: queries,
      propertiesToDisplay: searchOptions.selectedTableProperties,
      zeroState: searchOptions.zeroState,
      sortOrder: searchOptions.sortOrder,
      cardView: cardView
    }
    updateUserPreferences(user.name, preferencesObject);
  }

  const handleUserPreferences = () => {
    setUserPreferences();

    if (searchOptions.entityTypeIds.length > 0 && !entities.includes(searchOptions.entityTypeIds[0])) {
      // entityName is not part of entity model from model payload
      // change user preferences to default user pref.
      createUserPreferences(user.name);
      resetSearchOptions();
    }
  };

  const onCollapse = () => {
    setCollapsed(!collapse);
  }

  useLayoutEffect(() => {
    if (endScroll && data.length) {
      if (resultsRef.current) {
        resultsRef.current['style']['boxShadow'] = '0px 4px 4px -4px #999, 0px -4px 4px -4px #999'
      }
    } else if (!endScroll) {
      if (resultsRef.current) {
        resultsRef.current['style']['boxShadow'] = 'none'
      }
    }
  }, [endScroll])

  const onResultScroll = (event) => {
    if (resultsRef && resultsRef.current) {
      const bottom = event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight;
      if (resultsRef.current.scrollTop > 0 && !bottom) {
        setEndScroll(true);
      } else if (resultsRef.current.scrollTop === 0 || bottom) {
        setEndScroll(false);
      }
    }
  }

  const updateSelectedFacets = (facets) => {
    setSelectedFacets(facets);
  }

  const updateCheckedFacets = (facets) => {
    setGreyFacets(facets);
  }

  const handleViewChange = (view) => {
    let tableView = '';
    if (view === 'snippet') {
      toggleTableView(false);
      tableView = 'snippet';
    } else {
      toggleTableView(true);
      tableView = 'table';
    }
    setUserPreferences(tableView);

    if (resultsRef && resultsRef.current) {
      resultsRef.current['style']['boxShadow'] = 'none'
    }
  }

  if (searchOptions.zeroState) {
    return (
      <>
        <Query queries={queries} setQueries={setQueries} isSavedQueryUser={isSavedQueryUser} columns={columns} setIsLoading={setIsLoading} entities={entities} selectedFacets={[]} greyFacets={[]} entityDefArray={entityDefArray} isColumnSelectorTouched={isColumnSelectorTouched} setColumnSelectorTouched={setColumnSelectorTouched} />
        <ZeroStateExplorer entities={entities} isSavedQueryUser={isSavedQueryUser} queries={queries} columns={columns} setIsLoading={setIsLoading} tableView={tableView} toggleTableView={toggleTableView} setCardView={setCardView}/>
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
          width={'20vw'}
        >
          <Sidebar
            facets={facets}
            selectedEntities={searchOptions.entityTypeIds}
            entityDefArray={entityDefArray}
            facetRender={updateSelectedFacets}
            checkFacetRender={updateCheckedFacets}
          />
        </Sider>
        <Content className={styles.content}>

          <div className={styles.collapseIcon} id='sidebar-collapse-icon'>
            {collapse ?
              <FontAwesomeIcon aria-label="collapsed" icon={faAngleDoubleRight} onClick={onCollapse} size="lg" style={{ fontSize: '16px', color: '#000' }} /> :
              <FontAwesomeIcon aria-label="expanded" icon={faAngleDoubleLeft} onClick={onCollapse} size="lg" style={{ fontSize: '16px', color: '#000' }} />}
          </div>

          {user.error.type === 'ALERT' ?
            <AsyncLoader />
            :
            <>
              {/* TODO Fix searchBar widths, it currently overlaps at narrow browser widths */}
              <div className={styles.searchBar} ref={searchBarRef}>
                <SearchBar entities={entities} cardView={cardView} setCardView={setCardView}/>
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
                    {isLoading && <MLSpin data-testid="spinner" className={collapse ? styles.sideBarExpanded : styles.sideBarCollapsed} />}
                    {!cardView ? <div aria-label="switch-view" >
                      <MLRadio.MLGroup
                        buttonStyle="outline"
                        name="radiogroup"
                        size="large"
                        defaultValue={tableView ? 'table' : 'snippet'}
                        onChange={e => handleViewChange(e.target.value)}
                      >
                        <MLRadio.MLButton aria-label="switch-view-snippet" value={'snippet'} >
                          <i data-cy="facet-view" id={'snippetView'}><MLTooltip title={'Snippet View'}>
                            {!tableView ? <FontAwesomeIcon icon={faStream} /> : <FontAwesomeIcon icon={faStream} style={{ color: '#CCC' }} />}
                          </MLTooltip></i>
                        </MLRadio.MLButton>
                        <MLRadio.MLButton aria-label="switch-view-table" value={'table'} >
                          <i data-cy="table-view" id={'tableView'}><MLTooltip title={'Table View'}>{
                            tableView ? <FontAwesomeIcon icon={faTable} /> : <FontAwesomeIcon icon={faTable} style={{ color: '#CCC' }} />}
                          </MLTooltip></i>
                        </MLRadio.MLButton>
                      </MLRadio.MLGroup>
                    </div> : ''}
                  </div>
                </div>
                <Query queries={queries}
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
                />
              </div>
              <div className={styles.viewContainer} >
                <div className={styles.fixedView} >
                  {cardView ?
                    <RawDataCardView
                      data={data}
                      entityPropertyDefinitions={entityPropertyDefinitions}
                      selectedPropertyDefinitions={selectedPropertyDefinitions}
                    />
                    : (tableView ?
                      <div>
                        <ResultsTabularView
                          data={data}
                          entityPropertyDefinitions={entityPropertyDefinitions}
                          selectedPropertyDefinitions={selectedPropertyDefinitions}
                          entityDefArray={entityDefArray}
                          columns={columns}
                          selectedEntities={searchOptions.entityTypeIds}
                          setColumnSelectorTouched={setColumnSelectorTouched}
                          tableView={tableView}
                        />
                      </div>
                      : <div id="snippetViewResult" className={styles.snippetViewResult} ref={resultsRef} onScroll={onResultScroll}><SearchResults data={data} entityDefArray={entityDefArray} tableView={tableView} columns={columns} /></div>
                    )}
                </div>
                <br />
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
              </div>
            </>
          }
        </Content>
      </Layout>
    );
  }
}

export default withRouter(Browse);
