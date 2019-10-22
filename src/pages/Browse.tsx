import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { AuthContext } from '../util/auth-context';
import { SearchContext } from '../util/search-context';
import Sidebar from '../components/sidebar/sidebar';
import SearchBar from '../components/search-bar/search-bar';
import SearchPagination from '../components/search-pagination/search-pagination';
import { Layout, Spin } from 'antd';
import SearchSummary from '../components/search-summary/search-summary';
import SearchResults from '../components/search-results/search-results';
import { entityFromJSON, entityParser } from '../util/data-conversion';

interface Props extends RouteComponentProps<any> { }

const Browse: React.FC<Props> = ({ location }) => {
  const { Content, Sider } = Layout;
  const componentIsMounted = useRef(true);


  const { userNotAuthenticated } = useContext(AuthContext);
  const {
    searchOptions,
    setPage,
    setPageLength,
    setEntityClearQuery,
    setLatestJobFacet,
  } = useContext(SearchContext);

  const [data, setData] = useState();
  const [entities, setEntites] = useState<any[]>([]);
  const [entityDefArray, setEntityDefArray] = useState<any[]>([]);
  const [facets, setFacets] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [totalDocuments, setTotalDocuments] = useState(0);

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
      // console.log('error', error.response);
      if (error.response.status === 401) {
        userNotAuthenticated();
      }
    }
  }

  const getSearchResults = async (allEntities: string[]) => {
    try {
      setIsLoading(true);
      const response = await axios({
        method: 'POST',
        url: `/datahub/v2/search`,
        data: {
          query: searchOptions.query,
          entityNames: searchOptions.entityNames.length ? searchOptions.entityNames : allEntities,
          start: searchOptions.start,
          pageLength: getPageLength(),
          facets: searchOptions.searchFacets,
        }
      });
      if (componentIsMounted.current) {
        console.log('response.data', response.data);
        setData(response.data.results);
        setFacets(response.data.facets);
        setTotalDocuments(response.data.total);
        setIsLoading(false);
      }
    } catch (error) {
      console.log('error', error.response);
      if (error.response.status === 401) {
        userNotAuthenticated();
      }
    }
  }

  useEffect(() => {
    if (location.state && location.state.entity) {
      setEntityClearQuery(location.state.entity);
    }
    if (location.state && location.state.jobId) {
      setLatestJobFacet(location.state.jobId);
    }

    getEntityModel();

    return () => {
      componentIsMounted.current = false
    }

  }, []);

  useEffect(() => {
    if (entities.length) {
      getSearchResults(entities);
    }
  }, [searchOptions, entities]);

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  }

  const handlePageLengthChange = (current: number, pageSize: number) => {
    setPageLength(current, pageSize);
  }

  const getPageLength = () => {
    return (totalDocuments - ((searchOptions.start - 1) * searchOptions.pageLength) < searchOptions.pageLength) ? (totalDocuments - ((searchOptions.start - 1) * searchOptions.pageLength)) : searchOptions.pageLength;
  }

  return (
    <Layout>
      <Sider width={300} style={{ background: '#f3f3f3' }}>
        <Sidebar
          facets={facets}
          selectedEntities={searchOptions.entityNames}
          entityDefArray={entityDefArray}
        />
      </Sider>
      <Content style={{ background: '#fff', padding: '24px' }}>
        <SearchBar entities={entities} />
        {isLoading ?
          <Spin tip="Loading..." style={{ margin: '100px auto', width: '100%' }} />
          :
          <>
            <SearchSummary total={totalDocuments} start={searchOptions.start} length={searchOptions.pageLength} />
            <SearchPagination
              total={totalDocuments}
              onPageChange={handlePageChange}
              onPageLengthChange={handlePageLengthChange}
              currentPage={searchOptions.start}
              pageLength={searchOptions.pageLength}
            />
            <br />
            <br />
            <SearchResults data={data} entityDefArray={entityDefArray} />
            <br />
            <SearchSummary total={totalDocuments} start={searchOptions.start} length={searchOptions.pageLength} />
            <SearchPagination
              total={totalDocuments}
              onPageChange={handlePageChange}
              onPageLengthChange={handlePageLengthChange}
              currentPage={searchOptions.start}
              pageLength={searchOptions.pageLength}
            />
          </>
        }
      </Content>
    </Layout>
  );
}

export default withRouter(Browse);