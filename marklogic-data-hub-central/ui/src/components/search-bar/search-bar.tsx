import React, {useContext, useEffect, useState} from "react";
import {Select, Input} from "antd";
import styles from "./search-bar.module.scss";
import {SearchContext} from "../../util/search-context";
import HCDivider from "../common/hc-divider/hc-divider";

interface Props {
  entities: any;
  cardView: boolean;
  setHubArtifactsVisibilityPreferences: any;
}

const SearchBar: React.FC<Props> = props => {
  const {Search} = Input;
  const {Option} = Select;
  const {searchOptions, setQuery, setNextEntity} = useContext(SearchContext);
  const [searchString, setSearchString] = useState(searchOptions.query);
  const [dropDownValue, setDropdownValue] = useState("All Entities");
  const dividerOption = <HCDivider className={styles.dividerOption}/>;
  const dropdownOptions = ["All Data", dividerOption, "All Entities", dividerOption, ...props.entities];

  const options = dropdownOptions.map((entity, index) => {
    let renderEntity = entity;
    if (entity === "All Entities") {
      renderEntity = (
        <span className={styles.iconDropdownContainer}>
          <div id="all-entities" className="curateIcon"></div>
          <div>All Entities</div>
        </span>
      );
    } else if (entity === "All Data") {
      renderEntity = (
        <span className={styles.iconDropdownContainer}>
          <div id="all-data" className="loadIcon"></div>
          <div>All Data</div>
        </span>
      );
    }

    return index === 1 || index === 3 ? <Option key={index} value={index} disabled={true} style={{cursor: "default"}}>
      {entity}
    </Option> : <Option key={index} value={entity} data-cy={`entity-option-${entity}`}>
      {renderEntity}
    </Option>;
  });

  const entityMenu = (
    <div>
      <Select
        id="entity-select"
        style={{width: 180}}
        value={dropDownValue}
        onChange={value => handleOptionSelect(value)}
      >
        {options}
      </Select>
    </div>
  );

  const handleOptionSelect = (option: any) => {
    setNextEntity(option);
    if (props.cardView) {
      props.setHubArtifactsVisibilityPreferences(true);
    }
  };

  const handleSearch = (searchString: string) => {
    setQuery(searchString);
  };

  const onChange = (e) => {
    setSearchString(e.target.value);
    if (searchOptions.query !== "" && e.target.value === "") {
      setQuery(e.target.value);
    }
  };

  useEffect(() => {
    if (searchString !== searchOptions.query) {
      setSearchString(searchOptions.query);
    }
    if (searchOptions.entityTypeIds.length === 1) {
      if (dropDownValue !== searchOptions.entityTypeIds[0]) {
        setDropdownValue(searchOptions.entityTypeIds[0]);
      }
    } else {
      setDropdownValue(!props.cardView ? "All Entities" : "All Data");
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
