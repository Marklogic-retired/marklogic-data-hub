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
    const { searchOptions, setQuery, setEntity } = useContext(SearchContext);
    const [ searchString, setSearchString] = useState(searchOptions.query);
    const [dropDownValue, setDropdownValue] = useState('All Entities');
    const dropdownOptions = ['All Entities', ...props.entities];

    const options = dropdownOptions.map((entity, index) => 
      <Option value={entity} key={index} data-cy="entity-option">{entity}</Option>
    );
    const entityMenu = (
      <Select 
        id="entity-select"
        data-testid="entity-select"
        data-cy={searchOptions.entityNames.length ? searchOptions.entityNames[0] : 'All Entities'}
        style={{ width: 180 }} 
        value={dropDownValue} 
        onChange={value => handleOptionSelect(value)} 
      >
        {options}
      </Select>
    );

    const handleOptionSelect = (option: any) => {
      option === 'All Entities' ?  setEntity('') :  setEntity(option);
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
      if( searchOptions.entityNames.length === 1) {
        if (dropDownValue !== searchOptions.entityNames[0]){
          setDropdownValue(searchOptions.entityNames[0]);
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
