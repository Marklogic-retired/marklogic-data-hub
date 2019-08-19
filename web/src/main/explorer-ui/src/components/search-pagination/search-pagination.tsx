import React from 'react';
import { Pagination } from 'antd';
import styles from './search-pagination.module.scss';

const SearchPagination = () => {
    return (
        <div className={styles.searchPaginationContainer}>
            <Pagination 
                defaultCurrent={6} 
                total={50} 
            />
        </div>
    )
}

export default SearchPagination;
