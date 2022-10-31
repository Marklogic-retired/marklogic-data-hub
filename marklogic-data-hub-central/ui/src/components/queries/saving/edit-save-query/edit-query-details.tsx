import React, {useState, useEffect, useContext} from "react";
import {Row, Col, Modal, Form, FormLabel} from "react-bootstrap";
import styles from "../save-query-modal/save-query-modal.module.scss";
import axios from "axios";
import {UserContext} from "@util/user-context";
import {SearchContext} from "@util/search-context";
import {HCInput, HCButton, HCModal} from "@components/common";

interface Props {
  setEditQueryDetailVisibility: () => void;
  currentQuery: any;
  currentQueryName: string;
  setCurrentQueryName: (name: string) => void;
  currentQueryDescription: string;
  setCurrentQueryDescription: (name: string) => void;
}

const EditQueryDetails: React.FC<Props> = (props) => {

  const {
    handleError
  } = useContext(UserContext);

  const {
    setSelectedQuery
  } = useContext(SearchContext);


  const [queryName, setQueryName] = useState("");
  const [queryDescription, setQueryDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [previousQueryName, setPreviousQueryName] = useState("");

  useEffect(() => {
    if (props.currentQuery && JSON.stringify(props.currentQuery) !== JSON.stringify({}) && props.currentQuery.hasOwnProperty("savedQuery") && props.currentQuery.savedQuery.hasOwnProperty("name")) {
      setPreviousQueryName(props.currentQuery.savedQuery.name);
      setQueryName(props.currentQuery.savedQuery.name);
      if (props.currentQuery.savedQuery.hasOwnProperty("description")) {
        setQueryDescription(props.currentQuery.savedQuery.description);
      }
    }
  }, [props.currentQuery]);

  const onCancel = () => {
    props.setEditQueryDetailVisibility();
  };

  const onOk = async (event: { preventDefault: () => void; }, queryName, queryDescription, currentQuery) => {
    if (event) event.preventDefault();
    try {
      currentQuery.savedQuery.name = queryName.trim();
      currentQuery.savedQuery.description = queryDescription;
      const response = await axios.put(`/api/entitySearch/savedQueries`, currentQuery);
      if (response.data) {
        props.setEditQueryDetailVisibility();
        setSelectedQuery(queryName);
        props.setCurrentQueryDescription(queryDescription);
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorMessage(error["response"]["data"]["message"]);
          props.currentQuery.savedQuery.name = previousQueryName;
        }
      } else {
        handleError(error);
      }
    }
  };


  const handleChange = (event) => {
    if (event.target.id === "edit-query-detail-name") {
      setQueryName(event.target.value);
    }
    if (event.target.id === "edit-query-detail-description") {
      setQueryDescription(event.target.value);
    }
  };

  return (
    <HCModal
      show={true}
      onHide={onCancel}
    >
      <Modal.Header>
        <span className={"fs-5"}>{"Edit Query Details"}</span>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Form name="basic" className={"container-fluid"} >
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Name:"}<span className={styles.asterisk}>*</span></FormLabel>
            <Col>
              <Row>
                <Col className={errorMessage ? "d-flex has-error" : "d-flex"}>
                  <HCInput
                    id="edit-query-detail-name"
                    value={queryName ? queryName: " "}
                    placeholder={"Enter new query name"}
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
                id="edit-query-detail-description"
                value={queryDescription ? queryDescription: " "}
                onChange={handleChange}
                placeholder={"Enter new query description"}
              />
            </Col>
          </Row>
          <Row className={"mb-3"}>
            <Col className={"d-flex justify-content-end"}>
              <HCButton variant="outline-light" id="edit-query-detail-cancel-button" onClick={() => onCancel()}>Cancel</HCButton>
              &nbsp;&nbsp;
              <HCButton variant="primary"
                type="submit"
                disabled={queryName.length === 0}
                onClick={(event) => onOk(event, queryName, queryDescription, props.currentQuery)}
                id="edit-query-detail-button">Save
              </HCButton>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </HCModal>
  );
};

export default EditQueryDetails;


