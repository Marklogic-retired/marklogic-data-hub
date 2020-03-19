import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { Layout, Tooltip, Spin } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { UserContext } from '../util/user-context';
import { SearchContext } from '../util/search-context';
import { useInterval } from '../hooks/use-interval';
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


interface Props extends RouteComponentProps<any> {
}

const Browse: React.FC<Props> = ({ location }) => {

  const { Content, Sider } = Layout;
  const componentIsMounted = useRef(true);
  const {
    user,
    handleError,
    setTableView,
    userNotAuthenticated
  } = useContext(UserContext);
  const {
    searchOptions,
    setEntityClearQuery,
    setLatestJobFacet,
    resetSearchOptions
  } = useContext(SearchContext);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<any[]>([]);
  const [entities, setEntites] = useState<any[]>([]);
  const [entityDefArray, setEntityDefArray] = useState<any[]>([]);
  const [facets, setFacets] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [active, setIsActive] = useState(user.tableView);
  const [snippetActive, setIsSnippetActive] = useState(!user.tableView);
  const [endScroll, setEndScroll] = useState(false);
  const [collapse, setCollapsed] = useState(false);
  let sessionCount = 0;

  const getEntityModel = async () => {
    try {
      const response = await axios(`/datahub/v2/models`);
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
        url: `/datahub/v2/search`,
        data: {
          query: {
            searchStr: searchOptions.query,
            entityNames: searchOptions.entityNames.length ? searchOptions.entityNames : allEntities,
            facets: searchOptions.searchFacets,
          },
          start: searchOptions.start,
          pageLength: searchOptions.pageLength,
        }
      });
      if (componentIsMounted.current) {
        setData(response.data.results);
        setFacets(response.data.facets);
        setTotalDocuments(response.data.total);
        sessionCount = 0;
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (location.state && location.state['entity']) {
      setEntityClearQuery(location.state['entity']);
    }
    if (location.state && location.state['jobId']) {
      setLatestJobFacet(location.state['jobId'], location.state['entityName']);
    }
    if (!user.error.type) {
      getEntityModel();
    }

    return () => {
      componentIsMounted.current = false
    }

  }, []);

  useEffect(() => {
    if (entities.length && !user.error.type) {
      getSearchResults(entities);
    }
  }, [searchOptions, entities, user.error.type]);


  const tableSwitch = () => {
    setIsActive(true);
    setIsSnippetActive(false);
    setTableView(true)
  };

  const snippetSwitch = () => {
    setIsActive(false);
    setIsSnippetActive(true);
    setTableView(false)
  };

  const handleUserPreferences = () => {
    let preferencesObject = {
      query: {
        searchStr: searchOptions.query,
        entityNames: searchOptions.entityNames,
        facets: searchOptions.searchFacets
      },
      pageLength: searchOptions.pageLength
    }
    updateUserPreferences(user.name, preferencesObject);

    if ( searchOptions.entityNames.length > 0 && !entities.includes(searchOptions.entityNames[0])) {
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
  },[endScroll])

  useScrollPosition(({ currPos }) => {
    if (currPos.endOfScroll && !endScroll) {
      setEndScroll(true);
    } else if (!currPos.endOfScroll && endScroll) {
      setEndScroll(false);
    }
  }, [endScroll], null );

  useInterval(() => {
    if (sessionCount === user.maxSessionTime) {
      userNotAuthenticated();
    } else {
      sessionCount += 1;
    }
  }, 1000);

  return (
    <>
      <Layout>
        <Sider className={styles.sideBarFacets} collapsedWidth={0} collapsible onCollapse={onCollapse} width={'20vw'}>
          <Sidebar
            facets={facets}
            selectedEntities={searchOptions.entityNames}
            entityDefArray={entityDefArray}
          />
        </Sider>
        <Content className={styles.content}>
          { user.error.type === 'ALERT' ?
            <AsyncLoader />
            :
            <>
              <div className={styles.searchBar} ref={searchBarRef} style={{ width: collapse ? (window.innerWidth - 35) : '75vw',
                  maxWidth: collapse ? (window.innerWidth - 35) : '75vw'}}>
                <SearchBar entities={entities}/>
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
                  { isLoading && <Spin className={styles.overlay}/>}
                  <div className={styles.switchViews}>
                  <div className={snippetActive ? styles.toggled : styles.toggleView}
                    data-cy="facet-view" id={'snippetView'}
                    onClick={() => snippetSwitch()}>
                    <Tooltip title={'Snippet View'}><FontAwesomeIcon icon={faStream} size="lg" /></Tooltip>
                  </div>
                  <div className={active ? styles.toggled : styles.toggleView}
                    data-cy="table-view" id={'tableView'}
                    onClick={() => tableSwitch()}>
                    <Tooltip title={'Table View'}><FontAwesomeIcon className={styles.tableIcon} icon={faTable} size="lg" /></Tooltip>
                  </div>
                  </div>
                </div>
              </div>
              {user.tableView ?
                <div style={{ marginTop: '150px' }}>
                  <ResultTable
                    data={data}
                    entityDefArray={entityDefArray}
                  />
                </div>
                : <SearchResults data={data} entityDefArray={entityDefArray} />
              }
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
    </>
  );
}

export default withRouter(Browse);
