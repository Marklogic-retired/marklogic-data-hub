import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { Layout, Tooltip, Spin } from 'antd';
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
import { entityFromJSON, entityParser } from '../util/data-conversion';
import styles from './Browse.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStream, faTable } from '@fortawesome/free-solid-svg-icons'
import Query from '../components/queries/queries'
import {AuthoritiesContext} from "../util/authorities";


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
    resetSearchOptions
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
  const [hasStructured, setStructured] = useState<boolean>(false);
  const [isSavedQueryUser, setIsSavedQueryUser] = useState<boolean>(authorityService.isSavedQueryUser());

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
          start: searchOptions.start,
          pageLength: searchOptions.pageLength,
        }
      });
      if (componentIsMounted.current) {
        setData(response.data.results);
        setFacets(response.data.facets);
        setTotalDocuments(response.data.total);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      resetSessionTime();
    }
  }

  useEffect(() => {
    if (location.state && location.state['entity']) {
      setEntityClearQuery(location.state['entity']);
    }
    if (location.state && location.state['jobId']) {
      setLatestJobFacet(location.state['jobId'], location.state['entityName']);
    }
    // Removed error handling since it's not in one ui
    // if (!user.error.type) {
    //   getEntityModel();
    // }
    getEntityModel();

    return () => {
      componentIsMounted.current = false
    }

  }, []);

  useEffect(() => {
    // if (entities.length && !user.error.type) {
    //   getSearchResults(entities);
    // }
    if (entities.length  && (!searchOptions.nextEntityType || searchOptions.nextEntityType === 'All Entities' || (searchOptions.entityTypeIds[0] == searchOptions.nextEntityType))) {
      getSearchResults(entities);
    }

  }, [searchOptions, entities, user.error.type]);

  useEffect(() => {
    let entity = entityDefArray.filter(e => e.name === searchOptions.entityTypeIds[0])[0];
    if (entity && entity.hasOwnProperty('properties')) {
      let columns = entity.properties.map(e => e.name)
      setColumns(columns)
      setStructured(columns && columns.some(column => column.includes('.')))
    }
  }, [searchOptions.entityTypeIds, entityDefArray]);

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

  useLayoutEffect(() => {
    if (endScroll && data.length) {
      if (searchBarRef.current) {
        searchBarRef.current['style']['boxShadow'] = '0px 8px 4px -4px #999'
      }
    } else if (!endScroll) {
      if (searchBarRef.current) {
        searchBarRef.current['style']['boxShadow'] = 'none'
      }
    }
  }, [endScroll])

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

  return (
    <Layout>
      <Sider className={styles.sideBarFacets} collapsedWidth={0} collapsible onCollapse={onCollapse} width={'20vw'}>
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
            <div className={styles.searchBar} ref={searchBarRef}
              style={{
                width: collapse ? '90vw' : '70.5vw',
                maxWidth: collapse ? '90vw' : '70.5vw'
              }}>
              <SearchBar entities={entities} />
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
              <div className={styles.spinViews}>
                {isLoading && <Spin data-testid="spinner" className={styles.overlay} />}
                <div className={styles.switchViews}>
                  <div className={!tableView ? styles.toggled : styles.toggleView}
                    data-cy="facet-view" id={'snippetView'}
                    onClick={() => toggleTableView(false)}>
                    <Tooltip title={'Snippet View'}><FontAwesomeIcon icon={faStream} size="lg" /></Tooltip>
                  </div>
                  <div className={tableView ? styles.toggled : styles.toggleView}
                    data-cy="table-view" id={'tableView'}
                    onClick={() => toggleTableView(true)}>
                    <Tooltip title={'Table View'}><FontAwesomeIcon className={styles.tableIcon} icon={faTable} size="lg" /></Tooltip>
                  </div>
                </div>
              </div>
              <Query isSavedQueryUser={isSavedQueryUser} hasStructured={hasStructured} columns={columns} setIsLoading={setIsLoading} entities={entities} selectedFacets={selectedFacets} greyFacets={greyFacets} />
            </div>
            <div className={styles.fixedView} >
              {tableView ?
                <div>
                  <ResultTable
                    data={data}
                    entityDefArray={entityDefArray}
                    columns={columns}
                    hasStructured={hasStructured}
                  />
                </div>
                : <SearchResults data={data} entityDefArray={entityDefArray} />
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

export default withRouter(Browse);
