import {Select} from "antd";
import React, {useContext} from "react";
import styles from "./queries-dropdown.module.scss";
import {SearchContext} from "../../../../util/search-context";

interface Props {
    savedQueryList: any[];
    currentQueryName: string;
}

const PLACEHOLDER: string = "Select a saved query";

const QueriesDropdown: React.FC<Props> = (props) => {

  const {Option} = Select;

  const {
    savedQueryList,
    currentQueryName
  } = props;

  const {
    searchOptions,
    setSidebarQuery,
  } = useContext(SearchContext);

  const {sidebarQuery} = searchOptions;


  const savedQueryOptions = savedQueryList.map((key) => key.name);

  const options = savedQueryOptions.map((query, index) =>
    <Option value={query} key={index+1} aria-label={`query-option-${query}`} data-cy={`query-option-${query}`}>{query}</Option>
  );

  const onItemSelect = (queryName) => {
    setSidebarQuery(queryName);
  };

  return (
    <div>
      <Select
        id="queriesDropdownList"
        placeholder={PLACEHOLDER}
        className={sidebarQuery === PLACEHOLDER ? styles.dropDownStyle_placeholder : styles.dropDownStyle}
        onChange={onItemSelect}
        value={currentQueryName}
        aria-label="queries-dropdown-list"
        dropdownClassName={styles.queriesDropdown}
        dropdownStyle={{backgroundColor: "#e00b0b", color: "#e00b0b"}}>
        {options}
      </Select>
    </div>

  );
};

export default QueriesDropdown;