import React, { useContext, useEffect, useState } from 'react';
import {Select, Input, Modal, Divider} from 'antd';
import styles from './search-bar.module.scss';
import { SearchContext } from '../../util/search-context';

interface Props {
  entities: any;
  cardView: boolean;
}

const SearchBar: React.FC<Props> = props => {
    const { Search } = Input;
    const { Option } = Select;
    const { searchOptions, setQuery, setNextEntity } = useContext(SearchContext);
    const [ searchString, setSearchString] = useState(searchOptions.query);
    const [dropDownValue, setDropdownValue] = useState('All Entities');
    const dividerOption = <Divider className={styles.dividerOption}/>;
    const dropdownOptions = ['All Data',dividerOption,'All Entities',dividerOption, ...props.entities];

    const options = dropdownOptions.map((entity, index) =>
      index === 1 || index === 3 ? <Option value={index} key={index} disabled={true} style={{cursor: 'default'}}>{entity}</Option>
      : <Option value={entity} key={index} data-cy={`entity-option-${entity}`}>{entity}</Option>
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
    };

    const handleSearch = (searchString: string) => {
      setQuery(searchString);
    };

    const onChange = (e) => {
      setSearchString(e.target.value);
      if (searchOptions.query !== '' && e.target.value === '') {
        setQuery(e.target.value);
      }
    };

    useEffect(() => {
      if (searchString !== searchOptions.query) {
        setSearchString(searchOptions.query);
      }
      if( searchOptions.entityTypeIds.length === 1) {
        if (dropDownValue !== searchOptions.entityTypeIds[0]){
          setDropdownValue(searchOptions.entityTypeIds[0]);
        }
      } else {
        setDropdownValue(!props.cardView ? 'All Entities' : 'All Data');
      }
    }, [searchOptions]);


    return (
        <div className={styles.searchBar}>
            <div className={styles.searchInput}>
                <Search
                  value={searchString}
                  onChange={onChange}
                  addonBefore={entityMenu}
                  placeholder="Enter text to search for"
                  enterButton="Search"
                  size="large"
                  allowClear
                  onSearch={value => handleSearch(value)}
                  data-cy="search-bar"
                  data-testid="search-bar"
                />
            </div>
        </div>
    );
};

export default SearchBar;
