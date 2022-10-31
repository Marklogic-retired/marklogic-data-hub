import React, {useState, useContext} from "react";
import {Row, Col, Modal, Form, FormLabel} from "react-bootstrap";
import {SearchContext} from "@util/search-context";
import styles from "./save-query-modal.module.scss";
import {QueryOptions} from "../../../../types/query-types";
import {HCInput, HCButton, HCModal} from "@components/common";

interface Props {
  setSaveModalVisibility: () => void;
  saveNewQuery: (queryName: string, queryDescription: string, facets: {}) => void;
  greyFacets: any[];
  toggleApply: (clicked: boolean) => void;
  toggleApplyClicked: (clicked: boolean) => void;
  currentQueryName: string;
  setCurrentQueryName: (name: string) => void;
  setSaveNewIconVisibility: (clicked: boolean) => void;
  currentQueryDescription: string;
  setCurrentQueryDescription: (description: string) => void;
  resetYesClicked: boolean;
  setColumnSelectorTouched: (state: boolean) => void;
  existingQueryYesClicked: boolean;
}

const SaveQueryModal: React.FC<Props> = (props) => {

  const {
    clearAllGreyFacets,
    greyedOptions,
    setAllSearchFacets,
    searchOptions,
    applySaveQuery,
    setAllGreyedOptions,
    setEntity
  } = useContext(SearchContext);


  const [queryName, setQueryName] = useState("");
  const [queryDescription, setQueryDescription] = useState("");
  const [radioOptionClicked, setRadioOptionClicked] = useState(0);
  const [errorMessage, setErrorMessage] = useState<any>("");

  const onCancel = () => {
    props.setSaveModalVisibility();
  };
  const onOk = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();
    let facets = {...searchOptions.selectedFacets};
    let selectedFacets = facets;
    let greyedFacets = greyedOptions.selectedFacets;
    switch (radioOptionClicked) {
    case 1:
      facets = {...facets, ...greyedOptions.selectedFacets};
      setAllSearchFacets(facets);
      clearAllGreyFacets();
      props.toggleApplyClicked(true);
      props.toggleApply(false);
      break;
    case 2:
      break;
    case 3:
      clearAllGreyFacets();
      props.toggleApplyClicked(true);
      props.toggleApply(false);
    }
    try {
      await props.saveNewQuery(queryName.trim(), queryDescription, facets);
      props.setSaveNewIconVisibility(false);
      props.setSaveModalVisibility();
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
      props.setCurrentQueryName(queryName);
      props.setCurrentQueryDescription(queryDescription);
      if (props.resetYesClicked) {
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
      props.setColumnSelectorTouched(false);
      props.existingQueryYesClicked && setEntity();
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorMessage(error["response"]["data"]["message"]);
          setAllSearchFacets(selectedFacets);
          setAllGreyedOptions(greyedFacets);
        }
      }
    }
  };

  const handleChange = (event) => {
    if (event.target.id === "save-query-name") {
      setQueryName(event.target.value);
    }
    if (event.target.id === "save-query-description") {
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
            <FormLabel column lg={4}>{"Name:"}<span className={styles.asterisk}>*</span></FormLabel>
            <Col>
              <Row>
                <Col className={errorMessage ? "d-flex has-error" : "d-flex"}>
                  <HCInput
                    id="save-query-name"
                    value={queryName}
                    placeholder={"Enter query name"}
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
            <FormLabel column lg={4}>{"Description:"}</FormLabel>
            <Col className={"d-flex"}>
              <HCInput
                id="save-query-description"
                value={queryDescription}
                onChange={handleChange}
                placeholder={"Enter query description"}
              />
            </Col>
          </Row>
          {props.greyFacets.length > 0 &&
            <Row className={"mb-3"}>
              <FormLabel column lg={4}>{"Unapplied Facets:"}</FormLabel>
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
              <HCButton variant="outline-light" id="save-query-cancel-button" onClick={() => onCancel()}>Cancel</HCButton>
              &nbsp;&nbsp;
              <HCButton variant="primary"
                type="submit"
                disabled={queryName.length === 0}
                onClick={(event) => onOk(event)} id="save-query-button">Save
              </HCButton>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </HCModal>
  );
};

export default SaveQueryModal;


