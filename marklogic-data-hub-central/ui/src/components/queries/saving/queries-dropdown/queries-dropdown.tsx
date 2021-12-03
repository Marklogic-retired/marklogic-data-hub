import Select, {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "../../../../config/react-select-theme.config";
import React, {useContext} from "react";
import {SearchContext} from "../../../../util/search-context";

interface Props {
    savedQueryList: any[];
    currentQueryName: string;
}

const PLACEHOLDER: string = "Select a saved query";

const QueriesDropdown: React.FC<Props> = (props) => {

  const {
    savedQueryList,
    currentQueryName
  } = props;

  const {
    setSidebarQuery,
  } = useContext(SearchContext);


  const savedQueryOptions = savedQueryList.map((key) => key.name);

  const options = savedQueryOptions.map(query => ({value: query, label: query}));

  const onItemSelect = (selectedItem) => {
    setSidebarQuery(selectedItem.value);
  };

  const MenuList  = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  return (
    <Select
      id="queriesDropdownList-select-wrapper"
      inputId="queriesDropdownList"
      components={{MenuList: props => MenuList("queriesDropdownList", props)}}
      placeholder={PLACEHOLDER}
      value={currentQueryName === PLACEHOLDER ? null : options.find(oItem => oItem.value === currentQueryName)}
      onChange={onItemSelect}
      aria-label="queries-dropdown-list"
      options={options}
      formatOptionLabel={({value, label}) => {
        return (
          <span aria-label={`query-option-${value}`} data-cy={`query-option-${value}`}>
            {label}
          </span>
        );
      }}
      styles={{...reactSelectThemeConfig,
        container: (provided, state) => ({
          ...provided,
          height: "32px",
          width: "250px",
        }),
        control: (provided, state) => ({
          ...provided,
          border: "none",
          borderRadius: "4px 0px 0px 4px",
          borderColor: "none",
          boxShadow: "none",
          webkitBoxShadow: "none",
          backgroundColor: "#f1f2f5",
          minHeight: "34px",
          "&:hover": {
            borderColor: "none",
          },
          ":focus": {
            border: "none",
            boxShadow: "none",
            webkitBoxShadow: "none"
          }
        }),
      }}
    />
  );
};

export default QueriesDropdown;