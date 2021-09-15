import React, {useEffect, useState, useContext} from "react";
import {Form, Input, Modal} from "antd";
import styles from "./structured-type-modal.module.scss";

import {ModelingContext} from "../../../util/modeling-context";
import {ModelingTooltips} from "../../../config/tooltips.config";
import HCTooltip from "../../common/hc-tooltip/hc-tooltip";
import {QuestionCircleFill} from "react-bootstrap-icons";
import HCButton from "../../common/hc-button/hc-button";


type Props = {
  isVisible: boolean;
  entityDefinitionsArray: any[];
  toggleModal: (isVisible: boolean) => void;
  updateStructuredTypesAndHideModal: (entityName: string) => void;
};

const StructuredTypeModal: React.FC<Props> = (props) => {
  const NAME_REGEX = new RegExp("^[A-Za-z][A-Za-z0-9_-]*$");
  const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 18},
  };

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

  const onSubmit = (event) => {
    event.preventDefault();
    let entityDefinitionNamesArray = props.entityDefinitionsArray.map(entity => { return entity.name; });

    if (!NAME_REGEX.test(name)) {
      setErrorMessage(ModelingTooltips.nameRegex);
    } else if (entityDefinitionNamesArray.includes(name)) {
      setErrorMessage(`A structured type already exists with a name of ${name}`);
    } else if (modelingOptions.entityPropertiesNamesArray.includes(name)) {
      setErrorMessage(`A property type already exists with a name of ${name}`);
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
          validateStatus={errorMessage ? "error" : ""}
          help={errorMessage}
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
          <HCTooltip text={ModelingTooltips.nameRegex} id="structured-name-tooltip" placement="top">
            <QuestionCircleFill color="#7F86B5" className={styles.icon} size={13} />
          </HCTooltip>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StructuredTypeModal;
