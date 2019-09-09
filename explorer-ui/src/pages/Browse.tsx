import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar/sidebar';
import SearchBar from '../components/search-bar/search-bar';
import SearchPagination from '../components/search-pagination/search-pagination';
import { Layout, Spin } from 'antd';
import SearchSummary from '../components/search-summary/search-summary';
import SearchResults from '../components/search-results/search-results';

const Browse: React.FC = () => {
  const { Content, Sider } = Layout;

  const [data, setData] = useState();
  const [searchUrl, setSearchUrl] = useState({ url: `/v1/search?format=json&database=data-hub-FINAL`, method: 'get' });
  const [searchParams, setSearchParams] = useState({ start: 1, pageLength: 10 });
  const [isLoading, setIsLoading] = useState(false);
  const [totalDocuments, setTotalDocuments] = useState();

  const fetchData = async (method) => {
    method = searchUrl.method
    setIsLoading(true);
    const result = await axios({
      method: method,
      url: searchUrl.url,
      // data: {
      //   pageLength: searchData.pageLength
      // }
    });

    setData(result.data.results);
    setTotalDocuments(result.data.total);
    console.log('fetch flows', result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData(searchUrl.method);
  }, [searchUrl, searchParams]);

  const handleSearch = (searchString: string) => {
    console.log('The user typed string is ' + searchString);
    setSearchUrl({ ...searchUrl, url: `/v1/search?q=${searchString}&format=json&database=data-hub-FINAL`, method: 'post' });
  }
  
  const handlePageChange = (pageNumber: number) => {
    console.log('The user selected page ' + pageNumber);
    setSearchParams({ ...searchParams, start: pageNumber });
    setSearchUrl({ ...searchUrl, url: `/v1/search?format=json&database=data-hub-FINAL&start=${pageNumber}` });
  }

  const handlePageLengthChange = (current: number, pageSize: number) => {
    console.log('The user changed page length ' + pageSize);
    setSearchParams({ ...searchParams, pageLength: pageSize});
    setSearchUrl({ ...searchUrl, url: `/v1/search?format=json&database=data-hub-FINAL&pageLength=${pageSize}` });
  }

  return (
    <Layout>
      <Sider width={300} style={{ background: '#f3f3f3' }}>
        <Sidebar />
      </Sider>
      <Content style={{ background: '#fff', padding: '24px' }}>
        <SearchBar searchCallback={handleSearch} />
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