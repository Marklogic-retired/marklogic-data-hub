import React from 'react';
import { Input } from 'antd';
import styles from './search-bar.module.scss';

const SearchBar = () => {
    const { Search } = Input;

    return (
        <div className={styles.searchBarContainer}>
            <Search
                placeholder="Type search text"
                enterButton="Search"
                size="large"
                onSearch={value => console.log(value)}
            />
        </div>
    )
}

export default SearchBar;
