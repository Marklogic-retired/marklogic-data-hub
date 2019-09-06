import React from 'react';
import { Select, Input } from 'antd';
import styles from './search-bar.module.scss';

function handleChange(value) {
    console.log(`selected ${value}`);
}

const SearchBar = () => {
    const { Search } = Input;
    const { Option } = Select;

    const entities = ['All Entities', 'Product', 'Order'];
    const options = entities.map((e, i) => 
        <Option value={e} key={i}>{e}</Option>
    );
    const entityMenu = (
        <Select defaultValue="All Entities" style={{ width: 180 }} onChange={handleChange}>
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
                    onSearch={value => console.log(value)}
                />
            </div>
        </div>
    )
}

export default SearchBar;
