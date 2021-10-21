import React, {useEffect, useState, useContext} from "react";
import {Input, Modal} from "antd";
import {Row, Col, Form, FormLabel} from "react-bootstrap";
import styles from "./structured-type-modal.module.scss";
import {ModelingContext} from "../../../util/modeling-context";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {HCButton, HCTooltip} from "../../common";


type Props = {
  isVisible: boolean;
  entityDefinitionsArray: any[];
  toggleModal: (isVisible: boolean) => void;
  updateStructuredTypesAndHideModal: (entityName: string) => void;
};

const StructuredTypeModal: React.FC<Props> = (props) => {
  const NAME_REGEX = new RegExp("^[A-Za-z][A-Za-z0-9_-]*$");

  const {modelingOptions} = useContext(ModelingContext);

  const [name, setName] = useState("");
  const [, toggleIsNameDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setName("");
    setErrorMessage("");
  }, [props.isVisible]);

  const handleChange = (event) => {
    if (event.target.id === "structured-name") {
      if (event.target.value === "") {
        toggleIsNameDisabled(true);
      } else {
        toggleIsNameDisabled(false);
        setErrorMessage("");
      }
      setName(event.target.value);
    }
  };

  const getErrorMessage = () => {
    if (errorMessage === "exists-structured-type") {
      return <span data-testid="same-name-structured-error">A structured type is already using the name <b>{name}</b>.
A structured type cannot use the same name as an existing structured type.</span>;
    } else if (errorMessage === "exists-property") {
      return <span data-testid="same-name-property-error">A property is already using the name <b>{name}</b>.
            A structured type cannot use the same name as an existing property.</span>;
    }
    return errorMessage;
  };

  const onSubmit = (event) => {
    event.preventDefault();
    let entityDefinitionNamesArray = props.entityDefinitionsArray.map(entity => { return entity.name; });

    if (!NAME_REGEX.test(name)) {
      setErrorMessage(ModelingTooltips.nameRegex);
    } else if (entityDefinitionNamesArray.includes(name)) {
      setErrorMessage("exists-structured-type");
    } else if (modelingOptions.entityPropertiesNamesArray.includes(name)) {
      setErrorMessage("exists-property");
    } else {
      props.updateStructuredTypesAndHideModal(name);
      props.toggleModal(false);
    }
  };

  const onCancel = () => {
    props.toggleModal(false);
  };

  const modalFooter = <div className={styles.modalFooter}>
    <HCButton
      aria-label="structured-type-modal-cancel"
      variant="outline-light"
      onClick={onCancel}
    >Cancel</HCButton>
    <HCButton
      aria-label="structured-type-modal-submit"
      // form="pstructured-type-form"
      variant="primary"
      type="submit"
      onClick={onSubmit}
    >Add</HCButton>
  </div>;

  return (
    <Modal
      className={styles.modal}
      visible={props.isVisible}
      closable={true}
      title={"Add New Structured Property Type"}
      maskClosable={false}
      onCancel={onCancel}
      footer={modalFooter}
    >
      <Form
        id="structured-type-form"
        onSubmit={onSubmit}
        className={"container-fluid"}
      >
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Name:"}<span className={styles.asterisk}>*</span></FormLabel>
          <Col lg={9}>
            <Row>
              <Col className={errorMessage ? "d-flex has-error" : "d-flex"}>
                <Input
                  id="structured-name"
                  placeholder="Enter name"
                  aria-label="structured-input-name"
                  className={styles.input}
                  value={name}
                  onChange={handleChange}
                  onBlur={handleChange}
                />
                <div className={"p-2 d-flex align-items-center"}>
                  <HCTooltip text={ModelingTooltips.nameRegex} id="structured-name-tooltip" placement="top">
                    <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} />
                  </HCTooltip>
                </div>
              </Col>
              <Col xs={12} className={styles.validationError}>
                {getErrorMessage()}
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default StructuredTypeModal;
