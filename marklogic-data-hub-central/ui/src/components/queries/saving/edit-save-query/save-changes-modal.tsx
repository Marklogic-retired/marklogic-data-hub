import React, {useState, useContext, useEffect} from "react";
import {Row, Col, Modal, Form, FormLabel} from "react-bootstrap";
import {SearchContext} from "@util/search-context";
import styles from "../save-query-modal/save-query-modal.module.scss";
import axios from "axios";
import {UserContext} from "@util/user-context";
import {QueryOptions} from "../../../../types/query-types";
import {HCInput, HCButton, HCModal} from "@components/common";

interface Props {
  setSaveChangesModalVisibility: () => void;
  savedQueryList: any[];
  getSaveQueryWithId: (key: {}) => void;
  greyFacets: any[];
  toggleApply: (clicked: boolean) => void;
  toggleApplyClicked: (clicked: boolean) => void;
  setSaveNewIconVisibility: (clicked: boolean) => void;
  currentQuery: any,
  currentQueryName: string;
  setCurrentQueryDescription: (description: string) => void;
  setCurrentQueryName: (name: string) => void;
  nextQueryName: string;
  setCurrentQueryOnEntityChange: () => void;
  isSaveQueryChanged: () => boolean;
  entityQueryUpdate: boolean;
  toggleEntityQueryUpdate: () => void;
  resetYesClicked: boolean
  setColumnSelectorTouched: (state: boolean) => void;
  entityDefArray: any[];
}

const SaveChangesModal: React.FC<Props> = (props) => {

  const {
    clearAllGreyFacets,
    greyedOptions,
    setAllSearchFacets,
    searchOptions,
    applySaveQuery,
    setAllGreyedOptions
  } = useContext(SearchContext);

  const {
    handleError
  } = useContext(UserContext);


  const [queryName, setQueryName] = useState("");
  const [queryDescription, setQueryDescription] = useState("");
  const [radioOptionClicked, setRadioOptionClicked] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [previousQueryName, setPreviousQueryName] = useState("");

  const onCancel = () => {
    props.setSaveChangesModalVisibility();
  };

  // TO EXTRACT NAME AND DESCRIPTION FROM CURRENT QUERY
  useEffect(() => {
    if (props.currentQuery && JSON.stringify(props.currentQuery) !== JSON.stringify({}) && props.currentQuery.hasOwnProperty("savedQuery") && props.currentQuery.savedQuery.hasOwnProperty("name")) {
      setPreviousQueryName(props.currentQuery.savedQuery.name);
      setQueryName(props.currentQuery.savedQuery.name);
      if (props.currentQuery.savedQuery.hasOwnProperty("description")) {
        setQueryDescription(props.currentQuery.savedQuery.description);
      }
    }
  }, [props.currentQuery, props.nextQueryName]);

  const onOk = async (event: { preventDefault: () => void; }, queryName, queryDescription, currentQuery) => {
    if (event) event.preventDefault();
    let facets = {...searchOptions.selectedFacets};
    let selectedFacets = {...searchOptions.selectedFacets};
    let greyedFacets = greyedOptions.selectedFacets;
    switch (radioOptionClicked) {
    case 1:
      facets = {...facets, ...greyedOptions.selectedFacets};
      clearAllGreyFacets();
      props.toggleApplyClicked(true);
      props.toggleApply(false);
      break;
    case 2:
      setAllGreyedOptions(greyedFacets);
      break;
    case 3:
      clearAllGreyFacets();
      props.toggleApplyClicked(true);
      props.toggleApply(false);
    }
    props.setColumnSelectorTouched(false);
    try {
      currentQuery.savedQuery.name = queryName.trim();
      currentQuery.savedQuery.description = queryDescription;
      if (currentQuery.hasOwnProperty("savedQuery") && currentQuery.savedQuery.hasOwnProperty("query")) {
        currentQuery.savedQuery.query.selectedFacets = facets;
        currentQuery.savedQuery.query.searchText = searchOptions.query;
        currentQuery.savedQuery.query.entityTypeIds = searchOptions.entityTypeIds;
      }
      currentQuery.savedQuery.propertiesToDisplay = searchOptions.selectedTableProperties;
      currentQuery.savedQuery.sortOrder = searchOptions.sortOrder;

      const response = await axios.put(`/api/entitySearch/savedQueries`, currentQuery);
      if (response.data) {
        props.setSaveChangesModalVisibility();
        if (props.currentQueryName && !props.entityQueryUpdate) {
          let options: QueryOptions = {
            searchText: searchOptions.query,
            entityTypeIds: searchOptions.entityTypeIds,
            selectedFacets: facets,
            selectedQuery: queryName,
            propertiesToDisplay: searchOptions.selectedTableProperties,
            sortOrder: searchOptions?.sortOrder || [],
            database: searchOptions.database,
          };
          applySaveQuery(options);
        }
        if (props.nextQueryName && !props.entityQueryUpdate) {
          for (let key of props.savedQueryList) {
            if (key.savedQuery.name === props.nextQueryName) {
              props.getSaveQueryWithId(key);
              break;
            }
          }
          props.setCurrentQueryName(props.nextQueryName);
        }
        if (props.entityQueryUpdate && !props.resetYesClicked) {
          props.setCurrentQueryOnEntityChange();
          props.toggleEntityQueryUpdate();
        }
        if (props.resetYesClicked && !props.entityQueryUpdate) {
          let options: QueryOptions = {
            searchText: "",
            entityTypeIds: [],
            selectedFacets: {},
            selectedQuery: "select a query",
            propertiesToDisplay: [],
            sortOrder: [],
            database: "final",
          };
          applySaveQuery(options);
        }
        props.setCurrentQueryDescription(queryDescription);
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorMessage(error["response"]["data"]["message"]);
          setAllSearchFacets(selectedFacets);
          setAllGreyedOptions(greyedFacets);
          props.currentQuery.savedQuery.name = previousQueryName;
        }
      } else {
        handleError(error);
      }
    }
  };

  const handleChange = (event) => {
    if (event.target.id === "save-changes-query-name") {
      setQueryName(event.target.value);
    }
    if (event.target.id === "save-changes-query-description") {
      setQueryDescription(event.target.value);
    }
  };

  const unAppliedFacets = (e) => {
    setRadioOptionClicked(e.target.value);
  };

  return (
    <HCModal
      show={true}
      onHide={onCancel}
    >
      <Modal.Header>
        <span className={"fs-5"}>{"Save Query"}</span>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Form name="basic" className={"container-fluid"}>
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Name:"}<span className={styles.asterisk}>*</span></FormLabel>
            <Col>
              <Row>
                <Col className={errorMessage ? "d-flex has-error" : "d-flex"}>
                  <HCInput
                    id="save-changes-query-name"
                    value={queryName ? queryName: " "}
                    placeholder={"Enter query name"}
                    className={styles.input}
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={12} className={styles.validationError}>
                  {errorMessage}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Description:"}</FormLabel>
            <Col className={"d-flex"}>
              <HCInput
                id="save-changes-query-description"
                value={queryDescription ? queryDescription: " "}
                onChange={handleChange}
                placeholder={"Enter query description"}
              />
            </Col>
          </Row>
          {props.greyFacets.length > 0 &&
            <Row className={"mb-3"}>
              <FormLabel column lg={3}>{"Unapplied Facets:"}</FormLabel>
              <Col>
                <Form.Check
                  id={"unapplied-facets-1"}
                  name={"unapplied-facets"}
                  type={"radio"}
                  onChange={unAppliedFacets}
                  label={"Apply before saving"}
                  value={1}
                  aria-label={"Apply before saving"}
                />
                <Form.Check
                  id={"unapplied-facets-2"}
                  name={"unapplied-facets"}
                  type={"radio"}
                  onChange={unAppliedFacets}
                  label={"Save as is, keep unapplied facets"}
                  defaultChecked={true}
                  value={2}
                  aria-label={"Save as is, keep unapplied facets"}
                  className={"mt-2"}
                />
                <Form.Check
                  id={"unapplied-facets-3"}
                  name={"unapplied-facets"}
                  type={"radio"}
                  onChange={unAppliedFacets}
                  label={"Discard unapplied facets"}
                  value={3}
                  aria-label={"Discard unapplied facets"}
                  className={"mt-2"}
                />
              </Col>
            </Row>
          }
          <Row className={"mb-3"}>
            <Col className={"d-flex justify-content-end"}>
              <div>
                <HCButton variant="outline-light" id="edit-save-changes-cancel-button" onClick={() => onCancel()}>Cancel</HCButton>
                &nbsp;&nbsp;
                <HCButton variant="primary"
                  type="submit"
                  disabled={queryName.length === 0}
                  onClick={(event) => onOk(event, queryName, queryDescription, props.currentQuery)} id="edit-save-changes-button">Save
                </HCButton>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </HCModal>
  );
};

export default SaveChangesModal;


