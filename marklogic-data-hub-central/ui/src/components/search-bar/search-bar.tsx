import React, { useContext, useEffect, useState } from 'react';
import {Select, Input, Modal} from 'antd';
import styles from './search-bar.module.scss';
import { SearchContext } from '../../util/search-context';

interface Props {
  entities: any;
}

const SearchBar: React.FC<Props> = props => {
    const { Search } = Input;
    const { Option } = Select;
    const { searchOptions, setQuery, setEntity, setNextEntity } = useContext(SearchContext);
    const [ searchString, setSearchString] = useState(searchOptions.query);
    const [dropDownValue, setDropdownValue] = useState('All Entities');
    const dropdownOptions = ['All Entities', ...props.entities];


    const options = dropdownOptions.map((entity, index) =>
      <Option value={entity} key={index} data-cy={`entity-option-${entity}`}>{entity}</Option>
    );

    const entityMenu = (
        <div>
      <Select
        id="entity-select"
        style={{ width: 180 }}
        value={dropDownValue}
        onChange={value => handleOptionSelect(value)}
      >
        {options}
      </Select>
      </div>
    );

    const handleOptionSelect = (option: any) => {
        setNextEntity(option);
    }

    const handleSearch = (searchString: string) => {
      setQuery(searchString);
    }

    const onChange = (e) => {
      setSearchString(e.target.value);
      if (searchOptions.query !== '' && e.target.value === '') {
        setQuery(e.target.value);
      }
    }

    useEffect(() => {
      if (searchString !== searchOptions.query) {
        setSearchString(searchOptions.query);
      }
      if( searchOptions.entityTypeIds.length === 1) {
        if (dropDownValue !== searchOptions.entityTypeIds[0]){
          setDropdownValue(searchOptions.entityTypeIds[0]);
        }
      } else {
        setDropdownValue('All Entities');
      }
    }, [searchOptions]);

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
                  data-testid="search-bar"
                />
            </div>
        </div>
    )
}

export default SearchBar;
