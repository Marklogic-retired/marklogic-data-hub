import React, {useState, useEffect, useContext} from "react";
import {Modal, Form, Input} from "antd";
import styles from "../save-query-modal/save-query-modal.module.scss";
import axios from "axios";
import {UserContext} from "../../../../util/user-context";
import {SearchContext} from "../../../../util/search-context";
import HCButton from "../../../common/hc-button/hc-button";

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

  const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 18},
  };


  const onCancel = () => {
    props.setEditQueryDetailVisibility();
  };

  const onOk = async (queryName, queryDescription, currentQuery) => {
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
    <Modal
      visible={true}
      title={"Edit Query Details"}
      closable={true}
      onCancel={() => onCancel()}
      maskClosable={false}
      footer={null}
      destroyOnClose={true}
    >
      <Form
        name="basic"
        {...layout}
      >
        <Form.Item
          colon={false}
          label={<span className={styles.text}>
            Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
          </span>}
          labelAlign="left"
          validateStatus={errorMessage ? "error" : ""}
          help={errorMessage}
        >
          <Input
            id="edit-query-detail-name"
            value={queryName}
            placeholder={"Enter new query name"}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item
          colon={false}
          label="Description:"
          labelAlign="left"
        >
          <Input
            id="edit-query-detail-description"
            value={queryDescription}
            onChange={handleChange}
            placeholder={"Enter new query description"}
          />
        </Form.Item>
        <Form.Item>
          <div className={styles.submitButtons}>
            <HCButton variant="outline-light" id="edit-query-detail-cancel-button" onClick={() => onCancel()}>Cancel</HCButton>
            &nbsp;&nbsp;
            <HCButton variant="primary"
              type="submit"
              disabled={queryName.length === 0}
              onClick={() => onOk(queryName, queryDescription, props.currentQuery)}
              id="edit-query-detail-button">Save
            </HCButton>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditQueryDetails;


