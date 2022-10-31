import React, {useContext, useState, useEffect} from "react";
import {Modal} from "react-bootstrap";
import Select, {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import {SearchContext} from "@util/search-context";
import {HCButton, HCModal} from "@components/common";

export const SELECT_QUERY_PLACEHOLDER = "select a query";
interface Props {
    savedQueryList: any[];
    toggleApply: (clicked:boolean) => void;
    getSaveQueryWithId: (key:string) => void;
    greyFacets: any[];
    currentQueryName: string;
    setCurrentQueryName: (name: string) => void;
    currentQuery: any;
    setSaveNewIconVisibility:(visibility:boolean)=> void;
    setSaveChangesIconVisibility:(visibility:boolean)=> void;
    setDiscardChangesIconVisibility:(visibility:boolean)=> void;
    setSaveChangesModal:(visiblity:boolean) => void;
    setNextQueryName: (name: string) => void;
    isSaveQueryChanged:() => boolean;

}

const SaveQueriesDropdown: React.FC<Props> = (props) => {

  const {
    searchOptions
  } = useContext(SearchContext);
  const [showConfirmation, toggleConfirmation] = useState(false);
  const [switchedQueryName, setSwitchedQueryName] = useState(searchOptions.selectedQuery);

  useEffect(() => {
    if (props.currentQueryName !== searchOptions.selectedQuery && props.currentQueryName === SELECT_QUERY_PLACEHOLDER) {
      onItemSelect(searchOptions.selectedQuery);
    }
  }, [searchOptions.selectedQuery, props.currentQueryName]);

  const savedQueryOptions = props.savedQueryList.map((key) => key.savedQuery.name);

  const options = savedQueryOptions.map(query => ({value: query, label: query}));

  const checkCurrentQueryChange = (selectedItem) => {
    if (props.isSaveQueryChanged() && searchOptions.selectedQuery !== SELECT_QUERY_PLACEHOLDER) {
      toggleConfirmation(true);
      setSwitchedQueryName(selectedItem.value);
    } else {
      onItemSelect(selectedItem.value);
    }
  };

  const onItemSelect = (e) => {
    props.setCurrentQueryName(e);
    for (let key of props.savedQueryList) {
      if (key.savedQuery.name === e) {
        props.getSaveQueryWithId(key);
        break;
      }
    }
    props.setSaveNewIconVisibility(false);
    props.setDiscardChangesIconVisibility(false);
    props.setSaveChangesIconVisibility(false);
  };

  const onNoClick = () => {
    toggleConfirmation(false);
    onItemSelect(switchedQueryName);
  };

  const onCancel = () => {
    toggleConfirmation(false);
  };

  const onOk = () => {
    props.setSaveChangesModal(true);
    toggleConfirmation(false);
    props.setNextQueryName(switchedQueryName);
  };

  const MenuList  = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  return (
    <div>
      <Select
        id="dropdownList-select-wrapper"
        inputId="dropdownList"
        components={{MenuList: props => MenuList("query", props)}}
        placeholder={SELECT_QUERY_PLACEHOLDER}
        value={searchOptions.selectedQuery === SELECT_QUERY_PLACEHOLDER ? null : options.find(oItem => oItem.value === searchOptions.selectedQuery)}
        onChange={checkCurrentQueryChange}
        isSearchable={false}
        noOptionsMessage={() => "There are no saved queries"}
        aria-label="dropdownList"
        options={options}
        styles={{...reactSelectThemeConfig,
          container: (provided, state) => ({
            ...provided,
            height: "32px",
            width: "200px",
            marginRight: "15px"
          }),
          control: (provided, state) => ({
            ...provided,
            border: "none",
            borderRadius: "4px 0px 0px 4px",
            borderColor: "none",
            boxShadow: "none",
            minHeight: "32px",
            webkitBoxShadow: "none",
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
        formatOptionLabel={({value, label}) => {
          return (
            <span data-cy={`query-option-${value}`}>
              {label}
            </span>
          );
        }}
      />
      <HCModal
        show={showConfirmation}
        onHide={onCancel}
      >
        <Modal.Header className={"bb-none"}>
          <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
        </Modal.Header>
        <Modal.Body className={"pt-0 px-4"}>
          <p><strong>{props.currentQueryName}</strong> has been edited since it was last saved.</p>
          <p>Would you like to save the changes to <strong>{props.currentQueryName}</strong> before switching to the new query</p>
          <div className={"d-flex justify-content-center"}>
            <HCButton variant="outline-light" key="back" className={"me-2"} id="query-confirmation-no-button" onClick={() => onNoClick()}>
              No
            </HCButton>
            <HCButton key="submit" id="query-confirmation-yes-button" variant="primary"  onClick={() => onOk()}>
              Yes
            </HCButton>
          </div>
        </Modal.Body>
      </HCModal>
    </div>
  );
};

export default SaveQueriesDropdown;



