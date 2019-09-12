import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../util/auth-context';
import Sidebar from '../components/sidebar/sidebar';
import SearchBar from '../components/search-bar/search-bar';
import SearchPagination from '../components/search-pagination/search-pagination';
import { Layout, Spin } from 'antd';
import SearchSummary from '../components/search-summary/search-summary';
import SearchResults from '../components/search-results/search-results';
import { entityFromJSON } from '../util/data-conversion';

const Browse: React.FC = () => {
  const { Content, Sider } = Layout;

  const { userNotAuthenticated } = useContext(AuthContext);
  const [data, setData] = useState();
  const [entities, setEntites] = useState<any[]>([]);
  const [facets, setFacets] = useState();
  const [searchUrl, setSearchUrl] = useState<any>({ url: `/datahub/v2/search`, method: 'post' });
  const [searchQuery, setSearchQuery] = useState();
  const [searchParams, setSearchParams] = useState({ start: 1, pageLength: 10, entities: entities });
  const [searchFacets, setSearchFacets] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalDocuments, setTotalDocuments] = useState();

  const getEntityModel = async () => {
    try {
      const response = await axios(`/datahub/v2/models`);
      setEntites([ ...entityFromJSON(response.data).map(entity => entity.info.title)]);
    } catch (error) {
      // console.log('error', error.response);
    }
  }

  const getSearchResults = async () => {
    try {
      setIsLoading(true);
      const response = await axios({
        method: searchUrl.method,
        url: searchUrl.url,
        data: {
          query: searchQuery,
          entityNames: searchParams.entities,
          start: searchParams.start,
          pageLength: searchParams.pageLength,
          facets: searchFacets
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
    getEntityModel();
    getSearchResults();
  }, [searchQuery, searchParams, searchFacets]);

  const handleSearch = (searchString: string) => {
    console.log('The user typed string is ' + searchString);
    setSearchQuery(searchString);
    setSearchParams({ ...searchParams, start: 1});
  }
  
  const handlePageChange = (pageNumber: number) => {
    console.log('The user selected page ' + pageNumber);
    setSearchParams({ ...searchParams, start: pageNumber});
  }

  const handlePageLengthChange = (current: number, pageSize: number) => {
    console.log('The user changed page length ' + pageSize);
    setSearchParams({ ...searchParams, pageLength: pageSize, start: 1});
  }

  const handleFacetClick = (constraint, vals) => {
    console.log('Updated a facet ' + constraint + ': ' + vals);
    if (vals.length > 0) {
      setSearchFacets({ ...searchFacets, [constraint]: vals});
    } else {
      let newSearchFacets = { ...searchFacets };
      delete newSearchFacets[constraint];
      setSearchFacets(newSearchFacets);
    }
    setSearchParams({ ...searchParams, start: 1});
  }

  const handleOptionSelect = (option: string) => {
    console.log('Selected Option is ' + option);
    option === 'All Entities' ?  setSearchParams({ ...searchParams, entities: []}) :  setSearchParams({ ...searchParams, entities: [option]});
  }

  return (
    <Layout>
      <Sider width={300} style={{ background: '#f3f3f3' }}>
        <Sidebar 
          facets={facets} 
          onFacetClick={handleFacetClick}
        />
      </Sider>
      <Content style={{ background: '#fff', padding: '24px' }}>
      <SearchBar searchCallback={handleSearch} optionSelectCallback={handleOptionSelect} entities={entities}/>
        {isLoading ? 
          <Spin tip="Loading..." style={{ margin: '100px auto', width: '100%'}} />
          : 
          <>
            <SearchSummary total={totalDocuments} start={searchParams.start} length={searchParams.pageLength} />
            <SearchPagination 
              total={totalDocuments} 
              onPageChange={handlePageChange} 
              onPageLengthChange={handlePageLengthChange} 
              currentPage={searchParams.start}
              pageLength={searchParams.pageLength} 
            />
            <br />
            <br />
            <SearchResults data={data} />
            <br />
            <SearchSummary total={totalDocuments} start={searchParams.start} length={searchParams.pageLength} />
            <SearchPagination 
              total={totalDocuments} 
              onPageChange={handlePageChange} 
              onPageLengthChange={handlePageLengthChange} 
              currentPage={searchParams.start}
              pageLength={searchParams.pageLength} 
            />
          </>
        }
      </Content>
    </Layout>
  );
}

export default Browse;