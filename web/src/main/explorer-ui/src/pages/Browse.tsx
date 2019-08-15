import React from 'react';
import Sidebar from '../components/sidebar/sidebar';
import SearchBar from '../components/search-bar/search-bar';
import SearchPagination from '../components/search-pagination/search-pagination';

const Browse: React.FC = () => {
  return (
    <div>
      <Sidebar />
      <SearchBar />
      <SearchPagination />
    </div>
  );
}

export default Browse;