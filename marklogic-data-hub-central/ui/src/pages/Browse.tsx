import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { Layout, Tooltip, Spin, Select } from 'antd';
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
import ResultTable from '../components/result-table/result-table';
import { updateUserPreferences, createUserPreferences } from '../services/user-preferences';
import { entityFromJSON, entityParser, getTableProperties } from '../util/data-conversion';
import styles from './Browse.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStream, faTable } from '@fortawesome/free-solid-svg-icons'
import Query from '../components/queries/queries'
import { AuthoritiesContext } from "../util/authorities";
import { fetchQueries } from '../api/queries';
import ZeroStateExplorer from '../components/zero-state-explorer/zero-state-explorer';
import ResultsTabularView from "../components/results-tabular-view/results-tabular-view";
import { QueryOptions } from '../types/query-types';
import { MLTooltip, MLSpin } from '@marklogic/design-system';



interface Props extends RouteComponentProps<any> {
}

const Browse: React.FC<Props> = ({ location }) => {

  const { Content, Sider } = Layout;
  const componentIsMounted = useRef(true);
  const {
    user,
    handleError,
    resetSessionTime
  } = useContext(UserContext);
  const {
    searchOptions,
    setEntityClearQuery,
    setLatestJobFacet,
    resetSearchOptions,
    setEntity,
    applySaveQuery,
    setZeroState,
    setPageWithEntity,
    setPage
  } = useContext(SearchContext);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const authorityService = useContext(AuthoritiesContext);
  const [data, setData] = useState<any[]>([]);
  const [entities, setEntites] = useState<any[]>([]);
  const [entityDefArray, setEntityDefArray] = useState<any[]>([]);
  const [facets, setFacets] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [tableView, toggleTableView] = useState(true);
  const [endScroll, setEndScroll] = useState(false);
  const [collapse, setCollapsed] = useState(false);
  const [selectedFacets, setSelectedFacets] = useState<any[]>([]);
  const [greyFacets, setGreyFacets] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>();
  const [isSavedQueryUser, setIsSavedQueryUser] = useState<boolean>(authorityService.isSavedQueryUser());
  const [queries, setQueries] = useState<any>([]);
  const [entityPropertyDefinitions, setEntityPropertyDefinitions] = useState<any[]>([]);
  const [selectedPropertyDefinitions, setSelectedPropertyDefinitions] = useState<any[]>([]);
  const [isColumnSelectorTouched, setColumnSelectorTouched] = useState(false);

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
      resetSessionTime();
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
        console.log('error', error)
      handleError(error);
    } finally {
      setIsLoading(false);
      resetSessionTime();
    }
  }

  useEffect(() => {
    getEntityModel();
    return () => {
      componentIsMounted.current = false
    }
  }, [])


  useEffect(() => {
    if (entities.length && (!searchOptions.nextEntityType || searchOptions.nextEntityType === 'All Entities' || (searchOptions.entityTypeIds[0] == searchOptions.nextEntityType))) {
      getSearchResults(entities);
    }
  }, [searchOptions, entities, user.error.type]);


  useEffect(() => {
    if (searchOptions.zeroState === true ) {
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
    if(location.state && location.hasOwnProperty('zeroState') && !location.state['zeroState']){
        setPageWithEntity(location.state['entity'],
            location.state['pageNumber'],
            location.state['start'],
            location.state['searchFacets'],
            location.state['query'])
        location.state['tableView'] ? toggleTableView(true) : toggleTableView(false);
    }
    if(location.state && location.state['entityName'] && location.state['jobId']){
        setLatestJobFacet(location.state['jobId'], location.state['entityName']);
    }
    if (location.state && location.state['entity']) {
      setEntityClearQuery(location.state['entity']);
    }
    if (location.state && location.state['jobId']) {
      setLatestJobFacet(location.state['jobId'], location.state['entityName']);
    }
  }, [searchOptions.zeroState]);

  const handleUserPreferences = () => {
    let preferencesObject = {
      query: {
        searchText: searchOptions.query,
        entityTypeIds: searchOptions.entityTypeIds,
        selectedFacets: searchOptions.selectedFacets
      },
      pageLength: searchOptions.pageLength,
      tableView: tableView,
      selectedQuery: searchOptions.selectedQuery
    }
    updateUserPreferences(user.name, preferencesObject);

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

  useScrollPosition(({ currPos }) => {
    if (currPos.endOfScroll && !endScroll) {
      setEndScroll(true);
    } else if (!currPos.endOfScroll && endScroll) {
      setEndScroll(false);
    }
  }, [endScroll], null);

  const updateSelectedFacets = (facets) => {
    setSelectedFacets(facets);
  }

  const updateCheckedFacets = (facets) => {
    setGreyFacets(facets);
  }

  if (searchOptions.zeroState) {
    return (
      <>
        <Query queries={queries} setQueries={setQueries} isSavedQueryUser={isSavedQueryUser} columns={columns} setIsLoading={setIsLoading} entities={entities} selectedFacets={[]} greyFacets={[]} />
        <ZeroStateExplorer
            entities={entities}
            setEntity={setEntity}
            queries={queries}
            columns={columns}
            setIsLoading={setIsLoading}
            tableView={tableView}
            toggleTableView={toggleTableView} />
      </>
    );
  } else {
    return (
      <Layout className={styles.layout}>
        <Sider className={styles.sideBarFacets}
               collapsedWidth={0}
               collapsible
               onCollapse={onCollapse}
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
          {user.error.type === 'ALERT' ?
            <AsyncLoader />
            :
            <>
              {/* TODO Fix searchBar widths, it currently overlaps at narrow browser widths */}
              <div className={styles.searchBar} ref={searchBarRef}>
                <SearchBar entities={entities} />
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
                  {isLoading && <MLSpin data-testid="spinner" className={styles.overlay} />}
                  <div className={styles.switchViews}>
                    <div className={!tableView ? styles.toggled : styles.toggleView}
                      data-cy="facet-view" id={'snippetView'}
                      onClick={() => toggleTableView(false)}>
                      <MLTooltip title={'Snippet View'}><FontAwesomeIcon icon={faStream} size="lg" /></MLTooltip>
                    </div>
                    <div className={tableView ? styles.toggled : styles.toggleView}
                      data-cy="table-view" id={'tableView'}
                      onClick={() => toggleTableView(true)}>
                      <MLTooltip title={'Table View'}><FontAwesomeIcon className={styles.tableIcon} icon={faTable} size="lg" /></MLTooltip>
                    </div>
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
                       isColumnSelectorTouched={isColumnSelectorTouched}/>
              </div>
              <div className={styles.fixedView} >
                {tableView ?
                  <div>
                      <ResultsTabularView
                          data={data}
                          entityPropertyDefinitions = {entityPropertyDefinitions}
                          selectedPropertyDefinitions = {selectedPropertyDefinitions}
                          entityDefArray={entityDefArray}
                          columns={columns}
                          selectedEntities={searchOptions.entityTypeIds}
                          setColumnSelectorTouched={setColumnSelectorTouched}
                          tableView={tableView}
                      />
                  </div>
                  : <SearchResults data={data} entityDefArray={entityDefArray}  tableView={tableView} columns={columns}/>
                }
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
            </>
          }
        </Content>
      </Layout>
    );
  }
}

export default withRouter(Browse);
