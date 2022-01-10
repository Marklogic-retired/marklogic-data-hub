import React, {useEffect, useState, useContext} from "react";
import {Form, Icon, Input, Modal} from "antd";
import {MLButton} from "@marklogic/design-system";
import styles from "./structured-type-modal.module.scss";

import {ModelingContext} from "../../../util/modeling-context";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {MLTooltip} from "@marklogic/design-system";
import {UserContext} from "../../../util/user-context";


type Props = {
  isVisible: boolean;
  entityDefinitionsArray: any[];
  toggleModal: (isVisible: boolean) => void;
  updateStructuredTypesAndHideModal: (entityName: string, namespace: string|undefined, namespacePrefix: string|undefined, errorHandler: Function|undefined) => void;
};

const StructuredTypeModal: React.FC<Props> = (props) => {
  const NAME_REGEX = new RegExp("^[A-Za-z][A-Za-z0-9_-]*$");
  const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 18},
  };

  const {modelingOptions} = useContext(ModelingContext);
  const {handleError} = useContext(UserContext);

  const [successfulSubmit, setSuccessfulSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [namespace, setNamespace] = useState("");
  const [prefix, setPrefix] = useState("");
  const [, toggleIsNameDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setName("");
    setNamespace("");
    setPrefix("");
    setErrorMessage("");
  }, [props.isVisible]);

  useEffect(() => {
    if (successfulSubmit && !errorMessage) {
      props.toggleModal(false);
    }
  }, [successfulSubmit, errorMessage]);

  const handleChange = (event) => {
    const targetValue = event.target.value.trim();
    if (event.target.id === "structured-name") {
      if (targetValue === "") {
        toggleIsNameDisabled(true);
      } else {
        toggleIsNameDisabled(false);
        setErrorMessage("");
      }
      setName(targetValue);
    }
    if (event.target.id === "structured-namespace") {
      setNamespace(targetValue);
    }
    if (event.target.id === "structured-prefix") {
      setPrefix(targetValue);
    }
  };

  const isErrorOfType = (type: string) => {
    let result = false;
    if (errorMessage) {
      if (errorMessage.includes("valid absolute URI") || errorMessage.includes("prefix without specifying") || errorMessage.includes("has no namespace property")) {
        result = type === "namespace";
      } else if (errorMessage.includes("reserved pattern") || errorMessage.includes("must specify a prefix") || errorMessage.includes("has no namespacePrefix property")) {
        result = type === "namespacePrefix";
      } else {
        result = type === "name";
      }
    }
    return result;
  };

  const getErrorMessage = () => {
    if (errorMessage) {
      if (errorMessage === "exists-structured-type") {
        return <span className={styles.nameError}  data-testid="same-name-structured-error">A structured type is already using the name <b>{name}</b>.
  A structured type cannot use the same name as an existing structured type.</span>;
      } else if (errorMessage === "exists-property") {
        return <span className={styles.nameError} data-testid="same-name-property-error">A property is already using the name <b>{name}</b>.
              A structured type cannot use the same name as an existing property.</span>;
      } else if (errorMessage.includes("valid absolute URI")) {
        return <span className={styles.namespaceError} data-testid="namespace-error">Invalid syntax: Namespace property must be a valid absolute URI. Example: http://example.org/es/gs</span>;
      } else if (errorMessage.includes("prefix without specifying") || errorMessage.includes("has no namespace property")) {
        return <span className={styles.namespaceError} data-testid="namespace-error">You must define a namespace URI because you defined a prefix.</span>;
      } else if (errorMessage.includes("reserved pattern")) {
        return <span className={styles.namespaceError} data-testid="prefix-error">You cannot use a reserved prefix. Examples: xml, xs, xsi</span>;
      } else if (errorMessage.includes("must specify a prefix") || errorMessage.includes("has no namespacePrefix property")) {
        return <span className={styles.namespaceError} data-testid="prefix-error">You must define a prefix because you defined a namespace URI.</span>;
      }
    }
    return <span className={styles.nameError}>{errorMessage}</span>;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    let entityDefinitionNamesArray = props.entityDefinitionsArray.map(entity => { return entity.name; });

    if (!NAME_REGEX.test(name)) {
      setErrorMessage(ModelingTooltips.nameRegex);
    } else if (entityDefinitionNamesArray.includes(name)) {
      setErrorMessage("exists-structured-type");
    } else if (modelingOptions.entityPropertiesNamesArray.includes(name)) {
      setErrorMessage("exists-property");
    } else {
      let submittedSucceeded = true;
      setIsLoading(true);
      await props.updateStructuredTypesAndHideModal(name, namespace ? namespace: undefined, prefix ? prefix: undefined, async (error) => {
        submittedSucceeded = false;
        if (error.response && error.response.status >= 400) {
          if (error.response.data.hasOwnProperty("details")) {
            setErrorMessage(error.response.data.details);
          }
        } else {
          handleError(error);
        }
      });
      if (submittedSucceeded === true) {
        props.toggleModal(false);
      }
      setSuccessfulSubmit(submittedSucceeded);
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    props.toggleModal(false);
  };

  const modalFooter = <div className={styles.modalFooter}>
    <MLButton
      aria-label="structured-type-modal-cancel"
      size="default"
      onClick={onCancel}
    >Cancel</MLButton>
    <MLButton
      aria-label="structured-type-modal-submit"
      form="pstructured-type-form"
      type="primary"
      htmlType="submit"
      size="default"
      loading={isLoading}
      onClick={onSubmit}
    >Add</MLButton>
  </div>;

  return (
    <Modal
      className={styles.modal}
      width="680px"
      visible={props.isVisible}
      closable={true}
      title={"Add New Structured Property Type"}
      maskClosable={false}
      onCancel={onCancel}
      footer={modalFooter}
    >
      <Form
        {...layout}
        id="structured-type-form"
        onSubmit={onSubmit}
      >
        <Form.Item
          className={styles.formItem}
          label={<span>
            Name:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
          </span>}
          colon={false}
          labelAlign="left"
          validateStatus={isErrorOfType("name") ? "error" : ""}
          help={isErrorOfType("name") ? getErrorMessage(): ""}
        >
          <Input
            id="structured-name"
            placeholder="Enter name"
            aria-label="structured-input-name"
            className={styles.input}
            value={name}
            onChange={handleChange}
            onBlur={handleChange}
          />
          <MLTooltip title={ModelingTooltips.nameRegex}>
            <Icon type="question-circle" className={styles.icon} theme="filled" />
          </MLTooltip>
        </Form.Item>
        <Form.Item
          label="Namespace URI:"
          labelAlign="left"
          style={{marginLeft: 7, marginBottom: 0}}
        >
          <Form.Item
            style={{display: "inline-block"}}
            validateStatus={isErrorOfType("namespace") ? "error" : ""}
            help={isErrorOfType("namespace") || isErrorOfType("namespacePrefix") ? getErrorMessage(): ""}
          >
            <Input
              id="structured-namespace"
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
              id="structured-prefix"
              placeholder="Example: esgs"
              className={styles.input}
              value={prefix}
              onChange={handleChange}
              onBlur={handleChange}
              style={{width: "120px"}}
            />
            <MLTooltip title={ModelingTooltips.namespace}>
              <Icon type="question-circle" className={styles.icon} theme="filled" />
            </MLTooltip>
          </Form.Item>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StructuredTypeModal;
