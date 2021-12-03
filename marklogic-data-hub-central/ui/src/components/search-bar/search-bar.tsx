import React, {useContext, useEffect, useState} from "react";
import Select, {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "../../config/react-select-theme.config";
import styles from "./search-bar.module.scss";
import {SearchContext} from "../../util/search-context";
import {HCSearch, HCDivider} from "@components/common";

interface Props {
  entities: any;
  cardView: boolean;
  setHubArtifactsVisibilityPreferences: any;
}

const SearchBar: React.FC<Props> = props => {
  const {searchOptions, setQuery, setNextEntity} = useContext(SearchContext);
  const [searchString, setSearchString] = useState(searchOptions.query);
  const [dropDownValue, setDropdownValue] = useState("All Entities");
  const dropdownOptions = ["All Data", "-", "All Entities", "-", ...props.entities];

  const entityOptions = dropdownOptions.map(entity => ({value: entity, label: entity, isDisabled: entity === "-"}));

  const formatOptionLabel = ({value, label}) => {
    let renderEntity = value;
    if (value === "-") {
      return <HCDivider className={styles.dividerOption} />;
    } else if (value === "All Entities") {
      renderEntity = (
        <span className={styles.iconDropdownContainer}>
          <div id="all-entities" className="curateIcon"></div>
          <div>{label}</div>
        </span>
      );
    } else if (value === "All Data") {
      renderEntity = (
        <span className={styles.iconDropdownContainer}>
          <div id="all-data" className="loadIcon"></div>
          <div>{label}</div>
        </span>
      );
    }

    return (
      <span data-cy={`entity-option-${value}`}>
        {renderEntity}
      </span>
    );
  };

  const handleOptionSelect = (option: any) => {
    setNextEntity(option.value);
    if (props.cardView) {
      props.setHubArtifactsVisibilityPreferences(true);
    }
  };

  const MenuList  = (props) => (
    <div id="entity-select-MenuList">
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const entityMenu = (
    <div>
      <Select
        id="entity-select-wrapper"
        inputId="entity-select"
        components={{MenuList}}
        value={entityOptions.find(oItem => oItem.value === dropDownValue)}
        onChange={handleOptionSelect}
        isSearchable={false}
        aria-label="entity-select"
        options={entityOptions}
        formatOptionLabel={formatOptionLabel}
        styles={{...reactSelectThemeConfig,
          container: (provided, state) => ({
            ...provided,
            height: "42px",
            width: "180px",
          }),
          control: (provided, state) => ({
            ...provided,
            border: "none",
            borderRadius: "4px 0px 0px 4px",
            borderColor: "none",
            boxShadow: "none",
            webkitBoxShadow: "none",
            backgroundColor: "#394494",
            minHeight: "42px",
            "&:hover": {
              borderColor: "none",
            },
            ":focus": {
              border: "none",
              boxShadow: "none",
              webkitBoxShadow: "none"
            }
          }),
          singleValue: (provided, state) => ({
            ...provided,
            color: "#ffffff",
          }),
        }}
      />
    </div>
  );

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
        <HCSearch
          value={searchString}
          onChange={onChange}
          addonBefore={entityMenu}
          placeholder="Enter text to search for"
          enterButton="Search"
          size="lg"
          allowClear
          onSearch={value => handleSearch(value)}
          dataCy="search-bar"
          dataTestid="search-bar"
          classNameFull={styles.colors}
          onPressEnter={(enter, value) => enter ? handleSearch(value): false}
        />
      </div>
    </div>
  );
};

export default SearchBar;
