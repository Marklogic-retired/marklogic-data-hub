import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
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

const Browse: React.FC<Props> = ({location}) => {
  const { Content, Sider } = Layout;

  const { userNotAuthenticated } = useContext(AuthContext);
  const { 
    searchOptions,
    setPage,
    setPageLength,
    setEntityClearQuery,
    setAllEntities,
  } = useContext(SearchContext);

  const [data, setData] = useState();
  const [entities, setEntites] = useState<any[]>([]);
  const [entityDefArray, setEntityDefArray] = useState<any[]>([]);
  const [facets, setFacets] = useState();
  const [searchUrl, setSearchUrl] = useState<any>({ url: `/datahub/v2/search`, method: 'post' });
  const [isLoading, setIsLoading] = useState(false);
  const [entitiesLoaded, setEntitiesLoaded] = useState(false);
  const [totalDocuments, setTotalDocuments] = useState();

  const getEntityModel = async () => {
    try {
      const response = await axios(`/datahub/v2/models`);
      const parsedModelData = entityFromJSON(response.data);
      let entityArray = [ ...entityFromJSON(response.data).map(entity => entity.info.title)];
      setEntites(entityArray);
      setEntityDefArray(entityParser(parsedModelData));
      setEntitiesLoaded(true);
      if (searchOptions.entityNames.length === 0 ) {
        setAllEntities(entityArray)
      }
    } catch (error) {
      // console.log('error', error.response);
      if (error.response.status === 401) {
        userNotAuthenticated();
      }
    }
  }

  const getSearchResults = async () => {
    try {
      setIsLoading(true);
      const response = await axios({
        method: searchUrl.method,
        url: searchUrl.url,
        data: {
          query: searchOptions.query,
          entityNames: searchOptions.entityNames,
          start: searchOptions.start,
          pageLength: searchOptions.pageLength,
          facets: searchOptions.searchFacets
        }
      });
      console.log('response.data', response.data);
      setData(response.data.results);
      setFacets(response.data.facets);
      setTotalDocuments(response.data.total);
      setIsLoading(false);
    } catch (error) {
      // console.log('error', error.response);
      if (error.response.status === 401) {
        userNotAuthenticated();
      }
    }
  }
  useEffect(() => {
    if(location.state && location.state.entity){
      setEntityClearQuery(location.state.entity);
    }
    getEntityModel();
  }, []);

  useEffect(() => {
    if (entitiesLoaded) {
      getSearchResults();
    }
  }, [searchOptions, entitiesLoaded]);
  
  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  }

  const handlePageLengthChange = (current: number, pageSize: number) => {
    setPageLength(current, pageSize);
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
      <SearchBar entities={entities}/>
        {isLoading ? 
          <Spin tip="Loading..." style={{ margin: '100px auto', width: '100%'}} />
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