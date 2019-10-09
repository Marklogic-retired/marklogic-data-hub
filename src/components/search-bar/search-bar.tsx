import React, { useContext, useEffect, useState } from 'react';
import { Select, Input } from 'antd';
import styles from './search-bar.module.scss';
import { SearchContext } from '../../util/search-context';

interface Props {
  entities: any;
}

const SearchBar: React.FC<Props> = props => {
    const { Search } = Input;
    const { Option } = Select;
    const { searchOptions, setQuery, clearEntity, setEntity } = useContext(SearchContext);
    const [ searchString, setSearchString] = useState(searchOptions.query);
    const dropdownOptions = ['All Entities', ...props.entities];

    const options = dropdownOptions.map((e, i) => 
      <Option value={e} key={i} data-cy="entity-option">{e}</Option>
    );
    const entityMenu = (
      <Select style={{ width: 180 }} value={searchOptions.entityNames[0] || 'All Entities'} onChange={value => handleOptionSelect(value)} id="entity-select" data-cy={searchOptions.entityNames[0] || 'All Entities'}>
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
                    allowClear
                    onSearch={value => handleSearch(value)}
                    data-cy="search-bar"
                />
            </div>
        </div>
    )
}

export default SearchBar;
