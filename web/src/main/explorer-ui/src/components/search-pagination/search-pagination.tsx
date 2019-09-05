import React from 'react';
import { Pagination } from 'antd';
import styles from './search-pagination.module.scss';

const SearchPagination = (props) => {
    
    const onPageChange = (pageNumber) => {
        props.onPageChange(pageNumber);
    }

    return (
        <div className={styles.searchPaginationContainer}>
            <Pagination 
            	size="small" 
                defaultCurrent={1} 
            	total={props.total} 
                showSizeChanger
                onChange={onPageChange}
                current={props.currentPage}
            />
        </div>
    )
}

export default SearchPagination;
