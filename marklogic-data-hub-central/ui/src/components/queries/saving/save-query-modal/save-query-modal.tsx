import React, {useState, useContext} from "react";
import {Modal, Radio} from "antd";
import {Row, Col, Form, FormLabel} from "react-bootstrap";
import {SearchContext} from "../../../../util/search-context";
import styles from "./save-query-modal.module.scss";
import {UserContext} from "../../../../util/user-context";
import {QueryOptions} from "../../../../types/query-types";
import HCButton from "../../../common/hc-button/hc-button";
import HCInput from "../../../common/hc-input/hc-input";

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

  const {
    handleError
  } = useContext(UserContext);

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
        zeroState: searchOptions.zeroState,
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
          zeroState: true,
          sortOrder: [],
          database: "final",
        };
        applySaveQuery(options);
      }
      props.setColumnSelectorTouched(false);
      props.existingQueryYesClicked && setEntity(searchOptions.nextEntityType);
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorMessage(error["response"]["data"]["message"]);
          setAllSearchFacets(selectedFacets);
          setAllGreyedOptions(greyedFacets);
        }
      } else {
        handleError(error);
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
    <Modal
      visible={true}
      title={"Save Query"}
      closable={true}
      onCancel={() => onCancel()}
      maskClosable={true}
      footer={null}
    >
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
            <Col className={"d-flex"}>
              <Radio.Group onChange={unAppliedFacets} style={{"marginTop": "11px"}} defaultValue={2}>
                <Radio value={1}> Apply before saving</Radio>
                <Radio value={2}> Save as is, keep unapplied facets</Radio>
                <Radio value={3}> Discard unapplied facets</Radio>
              </Radio.Group>
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
    </Modal>
  );
};

export default SaveQueryModal;


