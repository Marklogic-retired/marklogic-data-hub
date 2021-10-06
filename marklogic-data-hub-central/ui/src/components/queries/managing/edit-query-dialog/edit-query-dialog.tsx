import React, {useState, useEffect, useContext} from "react";
import {Modal, Input} from "antd";
import {Row, Col, Form, FormLabel} from "react-bootstrap";
import styles from "./edit-query-dialog.module.scss";
import {UserContext} from "../../../../util/user-context";
import {SearchContext} from "../../../../util/search-context";
import HCButton from "../../../common/hc-button/hc-button";


const EditQueryDialog = (props) => {
  const {
    handleError
  } = useContext(UserContext);

  const {
    searchOptions,
    setSelectedQuery
  } = useContext(SearchContext);

  const [query, setQuery] = useState(props.query);
  const [queryName, setQueryName] = useState("");
  const [queryDescription, setQueryDescription] = useState("");
  const [isQueryNameTouched, setQueryNameTouched] = useState(false);
  const [isQueryDescriptionTouched, setQueryDescriptionTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (props.query && JSON.stringify(props.query) !== JSON.stringify({}) && props.query.hasOwnProperty("savedQuery") && props.query.savedQuery.hasOwnProperty("name")) {
      setQuery(props.query);
      setQueryName(props.query.savedQuery.name);

      if (props.query.savedQuery.hasOwnProperty("description")) {
        setQueryDescription(props.query.savedQuery.description);
      }
    } else {
      setQueryNameTouched(false);
      setQueryDescriptionTouched(false);
    }

  }, [props.query]);

  const onOk = () => {
    props.setEditModalVisibility(false);
  };

  const onCancel = () => {
    setErrorMessage("");
    props.setEditModalVisibility(false);
  };

  const handleChange = (event) => {
    if (event.target.id === "name") {
      if (event.target.value === " ") {
        setQueryNameTouched(false);
      } else {
        setQueryNameTouched(true);
        setQueryName(event.target.value);
      }
    }

    if (event.target.id === "description") {
      if (event.target.value === " ") {
        setQueryDescriptionTouched(false);
      } else {
        setQueryDescriptionTouched(true);
        setQueryDescription(event.target.value);
      }
    }
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();
    query.savedQuery.name = queryName.trim();
    query.savedQuery.description = queryDescription;
    try {
      let status = await props.editQuery(query);
      if (status && status.code === 200) {
        props.setEditModalVisibility(false);
        if (searchOptions.selectedQuery !== "select a query" &&
          query.savedQuery.name !== searchOptions.selectedQuery &&
          props.currentQueryName === searchOptions.selectedQuery) {
          setSelectedQuery(query.savedQuery.name);
        }
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorMessage(error["response"]["data"]["message"]);
        }
      } else {
        handleError(error);
      }
    }
    props.getQueries();
  };

  return (
    <div>
      <Modal
        title={null}
        visible={props.editModalVisibility}
        onOk={onOk}
        onCancel={onCancel}
        width={600}
        footer={null}
        maskClosable={false}
      >
        <p className={styles.title}>{"Edit Query"}</p>
        <Form name="basic" className={"container-fluid"}>
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Query Name:"}<span className={styles.asterisk}>*</span></FormLabel>
            <Col>
              <Row>
                <Col className={errorMessage ? "d-flex has-error" : "d-flex"}>
                  <Input
                    id="name"
                    placeholder="Edit name"
                    value={queryName}
                    onChange={handleChange}
                    className={styles.text}
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
              <Input
                id="description"
                placeholder="Edit description"
                value={queryDescription}
                onChange={handleChange}
                className={styles.text}
              />
            </Col>
          </Row>
          <Row className={`mb-3 ${styles.submitButtonsForm}`}>
            <Col className={"d-flex"}>
              <div className={styles.submitButtons}>
                <HCButton variant="outline-light" id="edit-query-dialog-cancel" onClick={() => onCancel()}>Cancel</HCButton>
                              &nbsp;&nbsp;
                <HCButton variant="primary" type="submit" disabled={(!isQueryNameTouched && !isQueryDescriptionTouched) || queryName.length === 0} onClick={handleSubmit}>Save</HCButton>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default EditQueryDialog;
