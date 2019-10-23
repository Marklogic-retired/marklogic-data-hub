import React, { useContext } from 'react';
import { Pagination } from 'antd';
import { SearchContext } from '../../util/search-context';
import styles from './search-pagination.module.scss';

interface Props {
  total: number;
  currentPage: number;
  pageLength: number;
};


const SearchPagination: React.FC<Props> = (props) => {
  const { setPage, setPageLength } = useContext(SearchContext)

  const onPageChange = (pageNumber) => {
    setPage(pageNumber, props.total);
  }

  const onPageSizeChange = (current, pageSize) => {
    setPageLength(current, pageSize);
  }

  return (
      <div className={styles.searchPaginationContainer}>
          <Pagination 
            size="small" 
            defaultCurrent={1} 
            total={props.total} 
            showSizeChanger
            onChange={onPageChange}
            onShowSizeChange={onPageSizeChange}
            current={props.currentPage}
            pageSize={props.pageLength}
          />
      </div>
  )
}

export default SearchPagination;
