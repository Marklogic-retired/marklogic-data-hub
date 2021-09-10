import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import {Form, Input, Modal} from "antd";
import styles from "./entity-type-modal.module.scss";

import {UserContext} from "../../../util/user-context";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {updateModelInfo} from "../../../api/modeling";
import {QuestionCircleFill} from "react-bootstrap-icons";
import HCTooltip from "../../common/hc-tooltip/hc-tooltip";


type Props = {
  isVisible: boolean;
  isEditModal: boolean;
  name: string;
  description: string;
  namespace: string;
  prefix: string;
  toggleModal: (isVisible: boolean) => void;
  updateEntityTypesAndHideModal: (entityName: string, description: string) => void;
};

const EntityTypeModal: React.FC<Props> = (props) => {
  const {handleError} = useContext(UserContext);
  const NAME_REGEX = new RegExp("^[A-Za-z][A-Za-z0-9_-]*$");
  const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 18},
  };

  const [name, setName] = useState("");
  const [errorName, setErrorName] = useState("");
  const [, toggleIsNameDisabled] = useState(true);
  const [description, setDescription] = useState("");
  const [namespace, setNamespace] = useState("");
  const [prefix, setPrefix] = useState("");
  const [errorServer, setErrorServer] = useState(""); // Uncategorized errors from backend
  const [loading, toggleLoading] = useState(false);

  useEffect(() => {
    if (props.isVisible) {
      if (props.isEditModal) {
        setName(props.name);
        setDescription(props.description);
        setNamespace(props.namespace);
        setPrefix(props.prefix);
      } else {
        // Add Modal
        setName("");
        setDescription("");
        setNamespace("");
        setPrefix("");
      }
      setErrorName("");
      setErrorServer("");
      toggleIsNameDisabled(true);
      toggleLoading(false);
    }
  }, [props.isVisible]);

  const handleChange = (event) => {
    if (event.target.id === "entity-name") {
      if (event.target.value === "") {
        toggleIsNameDisabled(true);
      } else {
        toggleIsNameDisabled(false);
        setErrorName("");
      }
      setName(event.target.value);
    }
    if (event.target.id === "description") {
      setDescription(event.target.value);
    }
    if (event.target.id === "namespace") {
      setNamespace(event.target.value);
    }
    if (event.target.id === "prefix") {
      setPrefix(event.target.value);
    }
  };

  // Parse server error message to determine its type
  // TODO Server should categorize the error messages it returns so parsing is not needed
  const isErrorOfType = (type: string) => {
    let result = false;
    if (errorServer) {
      if (errorServer.includes("type already exists")) {
        result = type === "name";
      } else if (errorServer.includes("valid absolute URI")) {
        result = type === "namespace";
      } else if (errorServer.includes("prefix without specifying")) {
        result = type === "namespace";
      } else if (errorServer.includes("reserved pattern")) {
        result = type === "namespacePrefix";
      } else if (errorServer.includes("must specify a prefix")) {
        result = type === "namespacePrefix";
      }
    }
    return result;
  };

  const updateEntityDescription = async (name: string, description: string, namespace: string, prefix: string) => {
    try {
      const response = await updateModelInfo(name, description, namespace, prefix);
      if (response["status"] === 200) {
        props.updateEntityTypesAndHideModal(name, description);
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorServer(error["response"]["data"]["message"]);
        }
      } else {
        handleError(error);
      }
      toggleLoading(false);
    }
  };

  const createEntityType = async (name: string, description: string) => {
    try {
      const payload = {
        name: name,
        description: description,
        namespace: namespace,
        namespacePrefix: prefix
      };
      const response = await axios.post("/api/models", payload);
      if (response["status"] === 201) {
        props.updateEntityTypesAndHideModal(name, description);
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorServer(error["response"]["data"]["message"]);
        }
      } else {
        handleError(error);
      }
      toggleLoading(false);
    }
  };

  const onOk = (event) => {
    setErrorName("");
    setErrorServer("");
    event.preventDefault();
    if (props.isEditModal) {
      toggleLoading(true);
      updateEntityDescription(name, description, namespace, prefix);
    } else {
      if (!NAME_REGEX.test(name)) {
        setErrorName(ModelingTooltips.nameRegex);
      } else {
        toggleLoading(true);
        createEntityType(name, description);
      }
    }
  };

  const onCancel = () => {
    props.toggleModal(false);
  };

  const formItemLayout = {
    labelCol: {span: 5},
    wrapperCol: {span: 18}
  };

  return (
    <Modal
      className={styles.modal}
      visible={props.isVisible}
      closable={true}
      confirmLoading={loading}
      title={props.isEditModal ? "Edit Entity Type" : "Add Entity Type"}
      width="680px"
      cancelText="Cancel"
      cancelButtonProps={{id: "entity-modal-cancel"}}
      onCancel={() => onCancel()}
      okText={props.isEditModal ? "OK" : "Add"}
      onOk={onOk}
      okButtonProps={{id: "entity-modal-add", form: "entity-type-form", htmlType: "submit"}}
      maskClosable={false}
    >
      <Form
        {...layout}
        id="entity-type-form"
        onSubmit={onOk}
      >
        <Form.Item
          className={styles.formItem}
          {...formItemLayout}
          label={<span>
            Name:&nbsp;{props.isEditModal ? null : <span className={styles.asterisk}>*</span>}
            &nbsp;
          </span>}
          colon={false}
          labelAlign="left"
          validateStatus={(errorName || isErrorOfType("name") ? "error" : "")}
          help={errorName}
        >
          {props.isEditModal ? <span>{name}</span> : <Input
            id="entity-name"
            placeholder="Enter name"
            className={styles.input}
            value={name}
            onChange={handleChange}
            onBlur={handleChange}
          />}
          {props.isEditModal ? null : <HCTooltip text={ModelingTooltips.nameRegex} id="entity-name-tooltip" placement="top">
            <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} />
          </HCTooltip>}
        </Form.Item>

        <Form.Item
          label={<span className={styles.label}>Description:</span>}
          {...formItemLayout}
          labelAlign="left"
          className={styles.formItem}
          colon={false}
        >
          <Input
            id="description"
            placeholder="Enter description"
            className={styles.input}
            value={description}
            onChange={handleChange}
            onBlur={handleChange}
          />
          <HCTooltip text={ModelingTooltips.entityDescription} id="description-tooltip" placement="top">
            <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} />
          </HCTooltip>
        </Form.Item>

        <Form.Item
          label="Namespace URI:"
          labelAlign="left"
          style={{marginLeft: 7, marginBottom: 0}}
          {...formItemLayout}
        >
          <Form.Item
            style={{display: "inline-block"}}
            validateStatus={isErrorOfType("namespace") ? "error" : ""}
          >
            <Input
              id="namespace"
              placeholder="Example: http://example.org/es/gs"
              className={styles.input}
              value={namespace}
              onChange={handleChange}
              onBlur={handleChange}
              style={{width: "250px"}}
            />
          </Form.Item>
          <span className={styles.prefixLabel}>Prefix:</span>
          <Form.Item
            className={styles.formItem}
            colon={false}
            style={{display: "inline-block"}}
            validateStatus={isErrorOfType("namespacePrefix") ? "error" : ""}
          >
            <Input
              id="prefix"
              placeholder="Example: esgs"
              className={styles.input}
              value={prefix}
              onChange={handleChange}
              onBlur={handleChange}
              style={{width: "120px"}}
            />
            <HCTooltip text={ModelingTooltips.namespace} id="prefix-tooltip" placement="top">
              <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} />
            </HCTooltip>
          </Form.Item>
          { errorServer ? <p className={styles.errorServer}>{errorServer}</p> : null }
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default EntityTypeModal;
