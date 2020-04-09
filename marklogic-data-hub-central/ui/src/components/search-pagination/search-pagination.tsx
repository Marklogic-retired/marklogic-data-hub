import React, { useContext, useState, useEffect } from 'react';
import { Pagination } from 'antd';
import { SearchContext } from '../../util/search-context';
import styles from './search-pagination.module.scss';

interface Props {
  total: number;
  pageNumber: number;
  pageSize: number;
  pageLength: number;
  maxRowsPerPage: number;
};

const SearchPagination: React.FC<Props> = (props) => {
  const { setPage, setPageLength } = useContext(SearchContext);

  const [pageSizeOptions, setPageSizeOptions] = useState<string[]>([]);

  const setPerPageSelector = (maxRowsPerPage: number) => {
    let pageOptionsDropdown: string[] = [];
    const defaultRows: number = 20;
    let n = 1;
    let pageSize = defaultRows / 2;
    pageOptionsDropdown.push(pageSize.toString());
    pageSize = defaultRows;
    while (pageSize < maxRowsPerPage) {
      pageOptionsDropdown.push(pageSize.toString());
      pageSize = (1 << n) * defaultRows;
      n++;
    }
    setPageSizeOptions(pageOptionsDropdown);
  }


   useEffect(() => {
    setPerPageSelector(props.maxRowsPerPage);
  }, [props.maxRowsPerPage]);

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
            total={props.total} 
            showSizeChanger
            onChange={onPageChange}
            onShowSizeChange={onPageSizeChange}
            current={props.pageNumber}
            pageSize={props.pageSize}
            pageSizeOptions={pageSizeOptions}
          />
      </div>  
  )
}

export default SearchPagination;
