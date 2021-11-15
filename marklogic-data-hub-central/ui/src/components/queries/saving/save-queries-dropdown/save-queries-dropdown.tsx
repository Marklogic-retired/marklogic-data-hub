import React, {useContext, useState} from "react";
import {Select} from "antd";
import {Modal} from "react-bootstrap";
import styles from "./save-queries-dropdown.module.scss";
import {SearchContext} from "../../../../util/search-context";
import {HCButton} from "@components/common";

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

  const {Option} = Select;
  const [showConfirmation, toggleConfirmation] = useState(false);


  const {
    searchOptions
  } = useContext(SearchContext);

  const [switchedQueryName, setSwitchedQueryName] = useState(searchOptions.selectedQuery);

  const savedQueryOptions = props.savedQueryList.map((key) => key.savedQuery.name);

  const options = savedQueryOptions.map((query, index) =>
    <Option value={query} key={index+1} data-cy={`query-option-${query}`}>{query}</Option>
  );

  const checkCurrentQueryChange = (e) => {
    if (props.isSaveQueryChanged() && searchOptions.selectedQuery !== "select a query") {
      toggleConfirmation(true);
      setSwitchedQueryName(e);
    } else {
      onItemSelect(e);
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

  return (
    <div>
      <Select
        id="dropdownList"
        placeholder={"select a query"}
        className={searchOptions.selectedQuery === "select a query" ? styles.dropDownStyle_placeholder : styles.dropDownStyle}
        onChange={checkCurrentQueryChange}
        value={(() => {
          if (props.currentQueryName !== searchOptions.selectedQuery && props.currentQueryName === "select a query") {
            onItemSelect(searchOptions.selectedQuery);
          }
          return searchOptions.selectedQuery;
        })()}
        getPopupContainer={() => document.getElementById("dropdownList") || document.body}
        data-testid="dropdown-list"
      >
        {options}
      </Select>
      <Modal
        show={showConfirmation}
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
      </Modal>
    </div>
  );
};

export default SaveQueriesDropdown;



