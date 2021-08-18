import React, {useState, useEffect, useContext} from "react";
import {Modal, Form, Input, Button} from "antd";
import styles from "./edit-query-dialog.module.scss";
import {UserContext} from "../../../../util/user-context";
import {SearchContext} from "../../../../util/search-context";


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

  const layout = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
  };

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
        <Form
          {...layout}
          name="basic"
        >
          <Form.Item
            style={{color: "blue"}}
            colon={false}
            label={<span className={styles.text}>
                            Query Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
            </span>}
            labelAlign="left"
            validateStatus={errorMessage ? "error" : ""}
            help={errorMessage}
          >
            <Input
              id="name"
              placeholder="Edit name"
              value={queryName}
              onChange={handleChange}
              className={styles.text}
            />
          </Form.Item>
          <Form.Item
            colon={false}
            label={<span className={styles.text}>
                            Description:
            </span>} labelAlign="left"
          >
            <Input
              id="description"
              placeholder="Edit description"
              value={queryDescription}
              onChange={handleChange}
              className={styles.text}
            />
          </Form.Item>
          <Form.Item
            className={styles.submitButtonsForm}>
            <div className={styles.submitButtons}>
              <Button id="edit-query-dialog-cancel" onClick={() => onCancel()}>Cancel</Button>
                            &nbsp;&nbsp;
              <Button type="primary" htmlType="submit" disabled={(!isQueryNameTouched && !isQueryDescriptionTouched) || queryName.length === 0} onClick={handleSubmit}>Save</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EditQueryDialog;
