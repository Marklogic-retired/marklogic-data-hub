import React from 'react';
import { Pagination } from 'antd';
import styles from './search-pagination.module.scss';

const SearchPagination = () => {
    return (
        <div className={styles.searchPaginationContainer}>
            <Pagination 
            	size="small" 
                defaultCurrent={6} 
            	total={50} 
            	showSizeChanger 
            />
        </div>
    )
}

export default SearchPagination;
