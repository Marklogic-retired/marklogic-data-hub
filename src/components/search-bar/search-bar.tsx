import React, { useContext, useEffect, useState } from 'react';
import { Select, Input } from 'antd';
import styles from './search-bar.module.scss';
import { SearchContext } from '../../util/search-context';

const SearchBar = ({ entities }) => {
    const { Search } = Input;
    const { Option } = Select;
    const { searchOptions, setQuery, clearEntity, setEntity } = useContext(SearchContext);
    const [ searchString, setSearchString] = useState(searchOptions.query);
    entities = ['All Entities', ...entities];

    const options = entities.map((e, i) => 
        <Option value={e} key={i}>{e}</Option>
    );
    const entityMenu = (
        <Select style={{ width: 180 }} value={searchOptions.entityNames[0] || 'All Entities'} onChange={value => handleOptionSelect(value)}>
            {options}
        </Select>
    );

    const handleOptionSelect = (option: any) => {
      option === 'All Entities' ?  clearEntity() :  setEntity(option);
    }

    const handleSearch = (searchString: string) => {
      setQuery(searchString);
    }

    const onChange = (e) => {
      setSearchString(e.target.value);
    }

    useEffect(() => {
      if (searchString !== searchOptions.query) {
        setSearchString(searchOptions.query);
      }
    }, [searchOptions.query]);

    return (
        <div className={styles.searchBar}>
            <div className={styles.searchInput}>
                <Search   
                    value={searchString}
                    onChange={onChange}
                    addonBefore={entityMenu}
                    placeholder="Type search text"
                    enterButton="Search"
                    size="large"
                    onSearch={value => handleSearch(value)}
                />
            </div>
        </div>
    )
}

export default SearchBar;
