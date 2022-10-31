import React, {useContext, useEffect, useState} from "react";
import {Row, Col, Modal, Form, FormLabel} from "react-bootstrap";
import styles from "./concept-class-modal.module.scss";
import {UserContext} from "@util/user-context";
import {ModelingTooltips, ErrorTooltips} from "@config/tooltips.config";
import {createConceptClass, updateConceptClass} from "@api/modeling";
import {defaultHubCentralConfig} from "@config/modeling.config";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {EntityTypeColorPicker, HCButton, HCInput, HCTooltip, HCIconPicker, HCModal} from "@components/common";
import {themeColors} from "@config/themes.config";
import {defaultConceptIcon} from "@config/explore.config";
import {hubCentralConfig} from "../../../types/modeling-types";

type Props = {
  isVisible: boolean;
  isEditModal: boolean;
  name: string;
  description: string;
  color: string;
  icon: string;
  toggleModal: (isVisible: boolean) => void;
  updateConceptClassAndHideModal: (conceptClass: string, description: string) => void;
  updateHubCentralConfig: (hubCentralConfig: any) => void;
  hubCentralConfig: hubCentralConfig;
  dataModel: Array<any>;
};

const ConceptClassModal: React.FC<Props> = (props) => {
  const {
    isVisible,
    isEditModal,
    name,
    description,
    color,
    icon,
    toggleModal,
    updateConceptClassAndHideModal,
    updateHubCentralConfig,
    hubCentralConfig,
    dataModel
  } = props;
  const {handleError} = useContext(UserContext);
  const NAME_REGEX = new RegExp("^[A-Za-z][A-Za-z0-9_-]*$");

  const [conceptName, setConceptName] = useState("");
  const [errorName, setErrorName] = useState("");
  const [, toggleIsNameDisabled] = useState(true);
  const [conceptDescription, setConceptDescription] = useState("");
  const [descriptionTouched, setisDescriptionTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Uncategorized errors from backend
  const [loading, toggleLoading] = useState(false);
  const [colorSelected, setColorSelected] = useState(themeColors.defaults.conceptColor);
  const [colorTouched, setisColorTouched] = useState(false);
  const [iconSelected, setIconSelected] = useState<any>("");
  const [iconTouched, setIsIconTouched] = useState<any>("");

  useEffect(() => {
    if (isVisible) {
      if (isEditModal) {
        setConceptName(name);
        setConceptDescription(description);
        setColorSelected(color);
        setIconSelected(icon);
      } else {
        // Add Modal
        setConceptName("");
        setConceptDescription("");
        setColorSelected(themeColors.defaults.conceptColor);
        setIconSelected(defaultConceptIcon);
      }
      setErrorName("");
      setErrorMessage("");
      toggleIsNameDisabled(true);
      toggleLoading(false);
    }
  }, [isVisible]);

  const handleChange = (event) => {
    if (event.target.id === "concept-class-name") {
      if (event.target.value === "") {
        toggleIsNameDisabled(true);
      } else {
        toggleIsNameDisabled(false);
        setErrorName("");
        if (errorMessage) {
          setErrorMessage("");
        }
      }
      setConceptName(event.target.value);
    }
    if (event.target.id === "description") {
      if (event.target.value !== description) {
        setisDescriptionTouched(true);
      } else {
        setisDescriptionTouched(false);
      }
      setConceptDescription(event.target.value);
    }
  };

  // Parse server error message to determine its type
  // TODO Server should categorize the error messages it returns so parsing is not needed
  const isErrorOfType = (type: string) => {
    let result = false;
    if (errorMessage) {
      if (errorMessage.includes("type already exists")) {
        result = type === "name";
      }
    }
    return result;
  };

  const updateConceptDescription = async (name: string, description: string) => {
    try {
      const response = await updateConceptClass(name, description);
      if (response["status"] === 200) {
        updateConceptClassAndHideModal(name, description);
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

  const setHubCentralConfig = async (conceptClassName, color, icon) => {
    let updatedPayload = hubCentralConfig || defaultHubCentralConfig;
    if (Object.keys(updatedPayload.modeling.concepts).length > 0 && updatedPayload.modeling.concepts.hasOwnProperty(conceptClassName)) {
      updatedPayload.modeling.concepts[conceptClassName]["color"] = color;
      updatedPayload.modeling.concepts[conceptClassName]["icon"] = icon;
    } else {
      updatedPayload.modeling.concepts[conceptClassName] = {color: color, icon: icon};
    }
    updateHubCentralConfig(updatedPayload);
  };

  const addNewConceptClass = async (name: string, description: string) => {
    try {
      const payload = {
        name: name,
        description: description
      };
      const response = await createConceptClass(payload);
      if (response["status"] === 201) {
        updateConceptClassAndHideModal(name, description);
        await setHubCentralConfig(name, colorSelected, iconSelected);
      }
    } catch (error) {
      if (error.response["status"] === 400) {
        if (error.response.data.hasOwnProperty("message") && error.response.data["message"] === ErrorTooltips.conceptClassErrorServerResp(name)) {
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

  const conceptClassEdited = () => {
    return descriptionTouched;
  };

  const handleSubmit = async () => {
    try {
      if (conceptClassEdited()) {
        await updateConceptDescription(conceptName, conceptDescription);
      }
      if (colorTouched || iconTouched) {
        await setHubCentralConfig(conceptName, colorSelected, iconSelected);
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
      if (isVisible) {
        toggleModal(false);
      }
    }
    setConceptName("");
  };

  const onOk = (event) => {
    setErrorName("");
    setErrorMessage("");
    event.preventDefault();
    if (isEditModal) {
      toggleLoading(true);
      handleSubmit();
    } else {
      let existEntityName = false;
      dataModel.map((entity) => {
        if (entity["entityName"] === conceptName || entity["conceptName"] === conceptName) {
          existEntityName = true;
        }
      });
      if (!NAME_REGEX.test(conceptName)) {
        setErrorName(ModelingTooltips.nameConceptClass);
      } else if (existEntityName) {
        setErrorMessage("name-error");
      } else {
        toggleLoading(true);
        addNewConceptClass(conceptName, conceptDescription);
      }
    }
  };

  const onCancel = () => {
    toggleModal(false);
    setConceptName("");
  };

  const handleColorChange = async (color, event) => {
    if (color.hex !== color) {
      setisColorTouched(true);
    } else {
      setisColorTouched(false);
    }
    setColorSelected(color.hex);
  };

  const handleIconChange = async (iconSelected) => {
    setIconSelected(iconSelected);
    if (iconSelected !== icon) {
      setIsIconTouched(true);
    } else {
      setIsIconTouched(false);
    }
  };

  return (<HCModal
    show={isVisible}
    size={"lg"}
    onHide={onCancel}
  >
    <Modal.Header className={"pe-4"}>
      <span className={"fs-3"}>{isEditModal ? "Edit Concept Class" : "Add Concept Class"}</span>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
    </Modal.Header>
    <Modal.Body className={"py-4"}>
      <Form
        id="concept-class-form"
        onSubmit={onOk}
        className={"container-fluid"}
        style={{padding: "0px"}}
      >
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Name:"}{isEditModal ? null : <span className={styles.asterisk}>*</span>}</FormLabel>
          <Col>
            <Row>
              <Col className={(errorName || isErrorOfType("name") ? "d-flex has-error" : "d-flex")}>
                {isEditModal ? <span>{conceptName}</span> : <HCInput
                  id="concept-class-name"
                  placeholder="Enter name"
                  value={conceptName}
                  onChange={handleChange}
                  onBlur={handleChange}
                />}
                <div className={"p-2 d-flex"}>
                  {isEditModal ? null : <HCTooltip text={ModelingTooltips.nameConceptClass} id="concept-class-name-tooltip" placement="top">
                    <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} />
                  </HCTooltip>}
                </div>
              </Col>
              <Col xs={12} className={styles.validationError}>
                {errorName || (errorMessage === "name-error" && (<p aria-label="concept-class-name-error" className={styles.errorServer}>Concept class is already using the name <strong>{conceptName}</strong>. Concept class cannot use the same name as an existing concept class.</p>))}
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
              value={conceptDescription}
              onChange={handleChange}
              onBlur={handleChange}
            />
            <div className={"p-2 d-flex align-items-center"}>
              <HCTooltip text={ModelingTooltips.conceptClassDescription} id="description-tooltip" placement="top">
                <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} />
              </HCTooltip>
            </div>
          </Col>
        </Row>

        <Row className={"mb-3"}>
          <FormLabel column lg={3} style={{marginTop: "10px"}}>{"Color:"}</FormLabel>
          <Col className={"d-flex"}>
            <div className={styles.colorContainer}>
              <EntityTypeColorPicker color={colorSelected} entityType={conceptName} handleColorChange={handleColorChange} />
            </div>
            <div className={"p-2 ps-3 d-flex align-items-center"}>
              <HCTooltip id="select-color-tooltip" text={isEditModal ? <span>The selected color will be associated with the <b>{conceptName}</b> concept class throughout your project</span> : <span>The selected color will be associated with this concept class throughout your project</span>} placement={"right"}>
                <QuestionCircleFill className={styles.questionCircle} size={13} />
              </HCTooltip>
            </div>
          </Col>
        </Row>
        <Row className={"mb-3"}>
          <FormLabel column lg={3} style={{marginTop: "11px"}}>{"Icon:"}</FormLabel>
          <Col className={"d-flex align-items-center"}>
            <div className={styles.iconContainer} data-testid={`${conceptName}-icon-selector`} aria-label={`${conceptName}-${iconSelected}-icon`}>
              <HCIconPicker identifier={conceptName} value={iconSelected} onChange={(value) => handleIconChange(value)} />
            </div>
            <div className={"p-2 ps-3 d-flex align-items-center"}>
              <HCTooltip id="icon-selector" text={<span>Select an icon to associate it with the <b>{conceptName}</b> concept class throughout your project.</span>} placement="right">
                <QuestionCircleFill aria-label="icon: question-circle" size={13} className={styles.questionCircle} />
              </HCTooltip>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal.Body>
    <Modal.Footer className={"d-flex justify-content-end py-2"}>
      <HCButton className={"me-2"} variant="outline-light" id={"concept-class-modal-cancel"} aria-label={"Cancel"} onClick={onCancel}>
        {"Cancel"}
      </HCButton>
      <HCButton aria-label={"Yes"} variant="primary" id={"concept-class-modal-add"} type="submit" onClick={onOk} loading={loading}>
        {isEditModal ? "OK" : "Add"}
      </HCButton>
    </Modal.Footer>
  </HCModal>
  );
};

export default ConceptClassModal;
