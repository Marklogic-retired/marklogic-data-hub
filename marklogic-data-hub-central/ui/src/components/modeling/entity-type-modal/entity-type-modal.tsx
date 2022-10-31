import React, {useContext, useEffect, useState} from "react";
import {Row, Col, Modal, Form, FormLabel} from "react-bootstrap";
import styles from "./entity-type-modal.module.scss";
import {UserContext} from "@util/user-context";
import {ModelingTooltips, ErrorTooltips} from "@config/tooltips.config";
import {createEntityType, updateModelInfo} from "@api/modeling";
import {defaultHubCentralConfig} from "@config/modeling.config";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {EntityTypeColorPicker, HCButton, HCInput, HCTooltip, HCIconPicker, HCModal} from "@components/common";
import {themeColors} from "@config/themes.config";
import {defaultIcon} from "@config/explore.config";
import {hubCentralConfig} from "../../../types/modeling-types";

type Props = {
  isVisible: boolean;
  isEditModal: boolean;
  name: string;
  description: string;
  namespace: string;
  prefix: string;
  color: string;
  icon: string;
  version: string;
  toggleModal: (isVisible: boolean) => void;
  updateEntityTypesAndHideModal: (entityName: string, description: string) => void;
  updateHubCentralConfig: (hubCentralConfig: any) => void;
  hubCentralConfig: hubCentralConfig;
  dataModel: Array<any>;
};

const EntityTypeModal: React.FC<Props> = (props) => {
  const {handleError} = useContext(UserContext);
  const NAME_REGEX = new RegExp("^[A-Za-z][A-Za-z0-9_-]*$");

  const [name, setName] = useState("");
  const [errorName, setErrorName] = useState("");
  const [, toggleIsNameDisabled] = useState(true);
  const [description, setDescription] = useState("");
  const [descriptionTouched, setisDescriptionTouched] = useState(false);
  const [namespace, setNamespace] = useState("");
  const [namespaceTouched, setisNamespaceTouched] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [prefixTouched, setisPrefixTouched] = useState(false);
  const [versionTouched, setisVersionTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Uncategorized errors from backend
  const [loading, toggleLoading] = useState(false);
  const [colorSelected, setColorSelected] = useState(themeColors.defaults.entityColor);
  const [colorTouched, setisColorTouched] = useState(false);
  const [iconSelected, setIconSelected] = useState<any>("");
  const [iconTouched, setIsIconTouched] = useState<any>("");
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    if (props.isVisible) {
      if (props.isEditModal) {
        setName(props.name);
        setDescription(props.description);
        setNamespace(props.namespace);
        setPrefix(props.prefix);
        setVersion(props.version);
        setColorSelected(props.color);
        setIconSelected(props.icon);
      } else {
        // Add Modal
        setName("");
        setDescription("");
        setVersion("");
        setNamespace("");
        setPrefix("");
        setColorSelected(themeColors.defaults.entityColor);
        setIconSelected(defaultIcon);
      }
      setErrorName("");
      setErrorMessage("");
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
        if (errorMessage) {
          setErrorMessage("");
        }
      }
      setName(event.target.value);
    }
    if (event.target.id === "description") {
      if (event.target.value !== props.description) {
        setisDescriptionTouched(true);
      } else {
        setisDescriptionTouched(false);
      }
      setDescription(event.target.value);
    }
    if (event.target.id === "namespace") {
      if (event.target.value !== props.namespace) {
        setisNamespaceTouched(true);
      } else {
        setisNamespaceTouched(false);
      }
      setNamespace(event.target.value);
    }
    if (event.target.id === "prefix") {
      if (event.target.value !== props.prefix) {
        setisPrefixTouched(true);
      } else {
        setisPrefixTouched(false);
      }
      setPrefix(event.target.value);
    }
    if (event.target.id === "version") {
      if (event.target.value !== props.version) {
        setisVersionTouched(true);
      } else {
        setisVersionTouched(false);
      }
      setVersion(event.target.value);
    }
  };

  const getErrorMessage = () => {
    if (errorMessage) {
      if (errorMessage.includes("valid absolute URI")) {
        return <span data-testid="namespace-error">Invalid syntax: Namespace property must be a valid absolute URI. Example: http://example.org/es/gs</span>;
      } else if (errorMessage.includes("prefix without specifying")) {
        return <span data-testid="namespace-error">You must define a namespace URI because you defined a prefix.</span>;
      } else if (errorMessage.includes("reserved pattern")) {
        return <span data-testid="prefix-error">You cannot use a reserved prefix. Examples: xml, xs, xsi</span>;
      } else if (errorMessage.includes("must specify a prefix")) {
        return <span data-testid="prefix-error">You must define a prefix because you defined a namespace URI.</span>;
      }
    }
    return errorMessage;
  };

  // Parse server error message to determine its type
  // TODO Server should categorize the error messages it returns so parsing is not needed
  const isErrorOfType = (type: string) => {
    let result = false;
    if (errorMessage) {
      if (errorMessage.includes("type already exists")) {
        result = type === "name";
      } else if (errorMessage.includes("valid absolute URI") || errorMessage.includes("prefix without specifying")) {
        result = type === "namespace";
      } else if (errorMessage.includes("reserved pattern") || errorMessage.includes("must specify a prefix")) {
        result = type === "namespacePrefix";
      }
    }
    return result;
  };

  const updateEntityDescription = async (name: string, description: string, namespace: string, prefix: string, version: string) => {
    try {
      const response = await updateModelInfo(name, description, namespace, prefix, version);
      if (response["status"] === 200) {
        props.updateEntityTypesAndHideModal(name, description);
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
  };

  const updateHubCentralConfig = async (entityName, color, icon) => {
    let updatedPayload = props.hubCentralConfig || defaultHubCentralConfig;
    if (Object.keys(updatedPayload.modeling.entities).length > 0 && updatedPayload.modeling.entities.hasOwnProperty(entityName)) {
      updatedPayload.modeling.entities[entityName]["color"] = color;
      updatedPayload.modeling.entities[entityName]["icon"] = icon;
    } else {
      updatedPayload.modeling.entities[entityName] = {color: color, icon: icon};
    }
    props.updateHubCentralConfig(updatedPayload);
  };

  const addNewEntityType = async (name: string, description: string) => {
    try {
      const payload = {
        name: name,
        description: description,
        namespace: namespace,
        namespacePrefix: prefix,
        version: version
      };
      const response = await createEntityType(payload);
      if (response["status"] === 201) {
        props.updateEntityTypesAndHideModal(name, description);
        await updateHubCentralConfig(name, colorSelected, iconSelected);
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message") && error.response.data["message"] === ErrorTooltips.entityErrorServerResp(name)) {
          setErrorMessage("name-error");
        } else {
          setErrorMessage(error["response"]["data"]["message"]);
        }
      } else {
        handleError(error);
      }
      toggleLoading(false);
    }
  };

  const entityPropertiesEdited = () => {
    return (descriptionTouched || namespaceTouched || prefixTouched || versionTouched);
  };

  const handleSubmit = async () => {
    try {
      if (entityPropertiesEdited()) {
        await updateEntityDescription(name, description, namespace, prefix, version);
      }
      if (colorTouched || iconTouched) {
        await updateHubCentralConfig(name, colorSelected, iconSelected);
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorMessage(error["response"]["data"]["message"]);
        }
      } else {
        handleError(error);
      }
    } finally {
      toggleLoading(false);
      if (props.isVisible) {
        props.toggleModal(false);
      }
    }
    setName("");
  };

  const onOk = (event) => {
    setErrorName("");
    setErrorMessage("");
    event.preventDefault();
    if (props.isEditModal) {
      toggleLoading(true);
      handleSubmit();
    } else {
      let existEntityName = false;
      props.dataModel.map((entity) => {
        if (entity?.entityName === name || entity?.conceptName === name) {
          existEntityName = true;
        }
      });
      if (!NAME_REGEX.test(name)) {
        setErrorName(ModelingTooltips.nameRegex);
      } else if (existEntityName) {
        setErrorMessage("name-error");
      } else {
        toggleLoading(true);
        addNewEntityType(name, description);
      }
    }
  };

  const onCancel = () => {
    props.toggleModal(false);
    setName("");
  };

  const handleColorChange = async (color, event) => {
    if (color.hex !== props.color) {
      setisColorTouched(true);
    } else {
      setisColorTouched(false);
    }
    setColorSelected(color.hex);
  };

  const handleIconChange = async (iconSelected) => {
    setIconSelected(iconSelected);
    if (iconSelected !== props.icon) {
      setIsIconTouched(true);
    } else {
      setIsIconTouched(false);
    }
  };

  return (<HCModal
    show={props.isVisible}
    size={"lg"}
    onHide={onCancel}
  >
    <Modal.Header className={"pe-4"}>
      <span className={"fs-3"}>{props.isEditModal ? "Edit Entity Type" : "Add Entity Type"}</span>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
    </Modal.Header>
    <Modal.Body className={"py-4"}>
      <Form
        id="entity-type-form"
        onSubmit={onOk}
        className={"container-fluid"}
        style={{padding: "0px"}}
      >
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Name:"}{props.isEditModal ? null : <span className={styles.asterisk}>*</span>}</FormLabel>
          <Col>
            <Row>
              <Col className={(errorName || isErrorOfType("name") ? "d-flex has-error" : "d-flex")}>
                {props.isEditModal ? <span>{name}</span> : <HCInput
                  id="entity-name"
                  placeholder="Enter name"
                  value={name}
                  onChange={handleChange}
                  onBlur={handleChange}
                />}
                <div className={"p-2 d-flex"}>
                  {props.isEditModal ? null : <HCTooltip text={ModelingTooltips.nameRegex} id="entity-name-tooltip" placement="top">
                    <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} />
                  </HCTooltip>}
                </div>
              </Col>
              <Col xs={12} className={styles.validationError}>
                {errorName || (errorMessage === "name-error" && (<p aria-label="entity-name-error" className={styles.errorServer}>An entity type is already using the name <strong>{name}</strong>. An entity type cannot use the same name as an existing entity type.</p>))}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Description:"}</FormLabel>
          <Col className={"d-flex"}>
            <HCInput
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={handleChange}
              onBlur={handleChange}
            />
            <div className={"p-2 d-flex align-items-center"}>
              <HCTooltip text={ModelingTooltips.entityDescription} id="description-tooltip" placement="top">
                <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} />
              </HCTooltip>
            </div>
          </Col>
        </Row>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Namespace URI:"}</FormLabel>
          <Col>
            <Row>
              <Col className={"d-flex"}>
                <HCInput
                  id="namespace"
                  placeholder="Example: http://example.org/es/gs"
                  value={namespace}
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{width: "90%"}}
                />
                <FormLabel className={"ps-2 pe-2 m-0 d-flex align-items-center"}>{"Prefix:"}</FormLabel>
                <HCInput
                  id="prefix"
                  placeholder="Example: esgs"
                  className={styles.input}
                  value={prefix}
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{width: "170px"}}
                />
                <div className={"p-2 d-flex align-items-center"}>
                  <HCTooltip text={ModelingTooltips.namespace} id="prefix-tooltip" placement="top">
                    <QuestionCircleFill aria-label="icon: question-circle" size={13} className={styles.questionCircle}/>
                  </HCTooltip>
                </div>
              </Col>
              <Col  xs={12} className={styles.validationError}>
                {errorName || ((errorMessage !== "name-error") && (errorMessage !== "")) ? (<p className={styles.errorServer}>{getErrorMessage()}</p>) : null}
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className={"mb-3"}>
          <FormLabel column lg={3} style={{marginTop: "10px"}}>{"Color:"}</FormLabel>
          <Col className={"d-flex"}>
            <div className={styles.colorContainer}>
              <EntityTypeColorPicker color={colorSelected} entityType={name} handleColorChange={handleColorChange} />
            </div>
            <div className={"p-2 ps-3 d-flex align-items-center"}>
              <HCTooltip id="select-color-tooltip" text={props.isEditModal ? <span>The selected color will be associated with the <b>{name}</b> entity throughout your project</span> : <span>The selected color will be associated with this entity throughout your project</span>} placement={"right"}>
                <QuestionCircleFill className={styles.questionCircle} size={13}/>
              </HCTooltip>
            </div>
          </Col>
        </Row>
        <Row className={"mb-3"}>
          <FormLabel column lg={3} style={{marginTop: "11px"}}>{"Icon:"}</FormLabel>
          <Col className={"d-flex align-items-center"}>
            <div className={styles.iconContainer} data-testid={`${name}-icon-selector`} aria-label={`${name}-${iconSelected}-icon`}>
              <HCIconPicker identifier={name} value={iconSelected} onChange={(value) => handleIconChange(value)} />
            </div>
            <div className={"p-2 ps-3 d-flex align-items-center"}>
              <HCTooltip id="icon-selector" text={<span>Select an icon to associate it with the <b>{name}</b> entity throughout your project.</span>} placement="right">
                <QuestionCircleFill aria-label="icon: question-circle" size={13} className={styles.questionCircle} />
              </HCTooltip>
            </div>
          </Col>
        </Row>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Version:"}</FormLabel>
          <Col className={"d-flex align-items-center"}>
            <HCInput
              id="version"
              placeholder="0.0.1"
              value={version}
              onChange={handleChange}
              onBlur={handleChange}
              style={{width: "8.8%"}}
            />
            <div className={"p-2 ps-3 d-flex align-items-center"}>
              <HCTooltip id="version-tooltip" text={ModelingTooltips.versionField} placement="right">
                <QuestionCircleFill aria-label="icon: question-circle" size={13} className={styles.questionCircle} />
              </HCTooltip>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal.Body>
    <Modal.Footer className={"d-flex justify-content-end py-2"}>
      <HCButton className={"me-2"} variant="outline-light" id={"entity-modal-cancel"} aria-label={"Cancel"} onClick={onCancel}>
        {"Cancel"}
      </HCButton>
      <HCButton aria-label={"Yes"} variant="primary" id={"entity-modal-add"} type="submit" onClick={onOk} loading={loading}>
        {props.isEditModal ? "OK" : "Add"}
      </HCButton>
    </Modal.Footer>
  </HCModal>
  );
};

export default EntityTypeModal;
