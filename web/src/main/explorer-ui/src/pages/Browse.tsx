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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      const result = await axios(
        `/v1/search?format=json&database=data-hub-STAGING`,
      );
      setData(result.data.results);
      console.log('fetch flows', result.data);
      setIsLoading(false);
    };

    fetchData();
  }, []);


  return (
      <Layout>
        <Sider width={300} style={{ background: '#f3f3f3' }}>
          <Sidebar />
        </Sider>
        <Content style={{ background: '#fff', padding: '24px' }}>
          <SearchBar />
          {isLoading ? 
            <Spin tip="Loading..." style={{ margin: '100px auto', width: '100%'}} />
          : 
            <>
            <SearchSummary />
            <SearchPagination />
            <br />
            <br />
            <SearchResults data={data} />
            </>
          }
        </Content>
      </Layout>
  );
}

export default Browse;