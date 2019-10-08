import React from 'react';
import { Pagination } from 'antd';
import styles from './search-pagination.module.scss';

const SearchPagination = (props) => {

  const onPageChange = (pageNumber) => {
    props.onPageChange(pageNumber);
  }

  const onPageSizeChange = (current, pageSize) => {
    props.onPageLengthChange(current, pageSize);
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
