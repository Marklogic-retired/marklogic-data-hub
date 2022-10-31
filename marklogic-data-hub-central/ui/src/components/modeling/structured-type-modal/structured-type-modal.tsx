import React, {useEffect, useState, useContext} from "react";
import {Row, Col, Modal, Form, FormLabel} from "react-bootstrap";
import styles from "./structured-type-modal.module.scss";
import {ModelingContext} from "@util/modeling-context";
import {ModelingTooltips} from "@config/tooltips.config";
import {UserContext} from "@util/user-context";
import {HCButton, HCInput, HCTooltip, HCModal} from "@components/common";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {themeColors} from "@config/themes.config";

type Props = {
  isVisible: boolean;
  entityDefinitionsArray: any[];
  toggleModal: (isVisible: boolean) => void;
  updateStructuredTypesAndHideModal: (entityName: string, namespace: string|undefined, namespacePrefix: string|undefined, errorHandler: Function|undefined) => void;
};

const StructuredTypeModal: React.FC<Props> = (props) => {
  const NAME_REGEX = new RegExp("^[A-Za-z][A-Za-z0-9_-]*$");

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

  const removeEntityFromList = (entityName: string) => {
    const entityPropertiesNameIndex = modelingOptions.entityPropertiesNamesArray.indexOf(entityName);
    if (entityPropertiesNameIndex >= 0) {
      modelingOptions.entityPropertiesNamesArray.splice(entityPropertiesNameIndex, 1);
    }
    const entityDefinitionsIndex = props.entityDefinitionsArray.findIndex((entity) => entity.name === entityName);
    if (entityDefinitionsIndex >= 0) {
      props.entityDefinitionsArray.splice(entityDefinitionsIndex, 1);
    }
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
        // reset entity name
        removeEntityFromList(name);
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
    <HCButton
      aria-label="structured-type-modal-cancel"
      variant="outline-light"
      className={"me-2"}
      onClick={onCancel}
    >Cancel</HCButton>
    <HCButton
      aria-label="structured-type-modal-submit"
      // form="pstructured-type-form"
      variant="primary"
      type="submit"
      loading={isLoading}
      onClick={onSubmit}
    >Add</HCButton>
  </div>;

  return (<HCModal
    show={props.isVisible}
    onHide={onCancel}
  >
    <Modal.Header className={"pe-4"}>
      <span className={"fs-4"}>{"Add New Structured Property Type"}</span>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
    </Modal.Header>
    <Modal.Body className={"py-4"}>
      <Form
        id="structured-type-form"
        onSubmit={onSubmit}
        className={"container-fluid"}
      >
        <Row>
          <FormLabel column lg={3}>{"Name:"}<span className={styles.asterisk}>*</span></FormLabel>
          <Col lg={9}>
            <Row>
              <Col className={isErrorOfType("name") ? "d-flex has-error" : "d-flex"} style={{paddingRight: 0}}>
                <HCInput
                  id="structured-name"
                  placeholder="Enter name"
                  ariaLabel="structured-input-name"
                  className={styles.input}
                  value={name ? name : " "}
                  onChange={handleChange}
                  onBlur={handleChange}
                />
                <div className={"p-2 d-flex align-items-center"}>
                  <HCTooltip text={ModelingTooltips.nameRegex} id="structured-name-tooltip" placement="top">
                    <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.icon} size={13} />
                  </HCTooltip>
                </div>
              </Col>
              <Col xs={12} className={styles.validationError}>
                {isErrorOfType("name") ? getErrorMessage(): ""}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <FormLabel column lg={3}>{"Namespace URI:"}</FormLabel>
          <Col lg={9}>
            <Row>
              <Col lg={12} className={"d-flex"}>
                <HCInput
                  id="structured-namespace"
                  placeholder="Example: http://example.org/es/gs"
                  value={namespace}
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{width: "90%"}}
                />
                <FormLabel className={"ps-2 pe-2 m-0 d-flex align-items-center"}>{"Prefix:"}</FormLabel>
                <HCInput
                  id="structured-prefix"
                  placeholder="Example: esgs"
                  className={styles.input}
                  value={prefix}
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{width: "170px"}}
                />
                <div className={"p-2 d-flex align-items-center"}>
                  <HCTooltip text={ModelingTooltips.namespace} id="prefix-tooltip" placement="top">
                    <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} />
                  </HCTooltip>
                </div>
              </Col>
              <Col xs={12} className={styles.validationError}>
                {isErrorOfType("namespacePrefix") || isErrorOfType("namespace") ? getErrorMessage(): ""}
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal.Body>
    <Modal.Footer className={"py-2"}>
      {modalFooter}
    </Modal.Footer>
  </HCModal>
  );
};

export default StructuredTypeModal;
