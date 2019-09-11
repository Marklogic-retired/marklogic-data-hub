import React from 'react';
import { Select, Input } from 'antd';
import styles from './search-bar.module.scss';

const SearchBar = ({ searchCallback, optionSelectCallback, entities }) => {
    const { Search } = Input;
    const { Option } = Select;

    entities = ['All Entities', ...entities];

    const options = entities.map((e, i) => 
        <Option value={e} key={i}>{e}</Option>
    );
    const entityMenu = (
        <Select defaultValue="All Entities" style={{ width: 180 }} onChange={value => optionSelectCallback(value)}>
            {options}
        </Select>
    );

    return (
        <div className={styles.searchBar}>
            <div className={styles.searchInput}>
                <Search
                    addonBefore={entityMenu}
                    placeholder="Type search text"
                    enterButton="Search"
                    size="large"
                    onSearch={value => searchCallback(value)}
                />
            </div>
        </div>
    )
}

export default SearchBar;
