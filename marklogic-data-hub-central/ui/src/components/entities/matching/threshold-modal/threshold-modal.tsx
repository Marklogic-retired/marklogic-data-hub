import React, {useState, useEffect, useContext} from "react";
import {Row, Col, Modal, Form, FormLabel} from "react-bootstrap";
import Select from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import styles from "./threshold-modal.module.scss";

import {CurationContext} from "@util/curation-context";
import {MatchingStep, Threshold} from "../../../../types/curation-types";
import {NewMatchTooltips} from "@config/tooltips.config";
import {updateMatchingArtifact} from "@api/matching";
import DeleteModal from "../delete-modal/delete-modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {ConfirmYesNo, HCInput, HCButton, HCTooltip, HCModal} from "@components/common";
import {themeColors} from "@config/themes.config";

type Props = {
  isVisible: boolean;
  editThreshold: any;
  toggleModal: (isVisible: boolean) => void;
};

const THRESHOLD_TYPE_OPTIONS = [
  {name: "Merge", value: "merge"},
  {name: "Notify", value: "notify"},
  {name: "Custom", value: "custom"},
];

const ThresholdModal: React.FC<Props> = (props) => {
  const {curationOptions, updateActiveStepArtifact} = useContext(CurationContext);

  const [nameValue, setNameValue] = useState("");
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [isNameTouched, setIsNameTouched] = useState(false);

  const [actionType, setActionType] = useState<string | undefined>(undefined);
  const [actionTypeErrorMessage, setActionTypeErrorMessage] = useState("");
  const [isActionTypeTouched, setIsActionTypeTouched] = useState(false);

  const [uriValue, setUriValue] = useState("");
  const [uriErrorMessage, setUriErrorMessage] = useState("");
  const [isUriTouched, setIsUriTouched] = useState(false);
  const [functionValue, setFunctionValue] = useState("");
  const [functionErrorMessage, setFunctionErrorMessage] = useState("");
  const [isFunctionTouched, setIsFunctionTouched] = useState(false);
  const [namespaceValue, setNamespaceValue] = useState("");
  const [isNamespaceTouched, setIsNamespaceTouched] = useState(false);
  const [showDeleteConfirmModal, toggleDeleteConfirmModal] = useState(false);

  const [discardChangesVisible, setDiscardChangesVisible] = useState(false);

  useEffect(() => {
    if (Object.keys(props.editThreshold).length !== 0 && props.isVisible) {
      let editThreshold = props.editThreshold;
      setNameValue(editThreshold["thresholdName"]);
      setActionType(editThreshold["action"]);
      if (editThreshold["action"] === "custom") {
        setUriValue(editThreshold["actionModulePath"]);
        if (editThreshold.hasOwnProperty("actionModuleNamespace")) {
          setNamespaceValue(editThreshold["actionModuleNamespace"]);
        }
        if (editThreshold.hasOwnProperty("actionModuleFunction")) {
          setFunctionValue(editThreshold["actionModuleFunction"]);
        }
      }
    }
  }, [props.isVisible]);

  const handleInputChange = (event) => {
    switch (event.target.id) {
    case "name-input":
      if (event.target.value === "") {
        setIsNameTouched(false);
        setNameErrorMessage("A threshold name is required");
      } else {
        setNameErrorMessage("");
      }
      setIsNameTouched(true);
      setNameValue(event.target.value);
      break;

    case "uri-input":
      if (event.target.value === "") {
        setIsUriTouched(false);
        setUriErrorMessage("A URI is required");
      } else {
        setUriErrorMessage("");
      }
      setIsUriTouched(true);
      setUriValue(event.target.value);
      break;

    case "function-input":
      if (event.target.value === "") {
        setIsFunctionTouched(false);
        setFunctionErrorMessage("A function is required");
      } else {
        setFunctionErrorMessage("");
      }
      setIsFunctionTouched(true);
      setFunctionValue(event.target.value);
      break;

    case "namespace-input":
      setIsNamespaceTouched(true);
      setNamespaceValue(event.target.value);
      break;

    default:
      break;
    }
  };

  const closeModal = () => {
    if (hasFormChanged()) {
      setDiscardChangesVisible(true);
    } else {
      resetModal();
      props.toggleModal(false);
    }
  };

  const resetModal = () => {
    setNameValue("");
    setNameErrorMessage("");
    setActionType(undefined);
    setActionTypeErrorMessage("");
    setUriValue("");
    setUriErrorMessage("");
    setFunctionValue("");
    setFunctionErrorMessage("");
    setNamespaceValue("");
    resetTouched();
  };

  const resetTouched = () => {
    setDiscardChangesVisible(false);
    setIsNameTouched(false);
    setIsActionTypeTouched(false);
    setIsUriTouched(false);
    setIsFunctionTouched(false);
    setIsNamespaceTouched(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    let nameErrorMessage = "";
    let actionErrorMessage = "";
    let thresholdName = nameValue || "";
    if (thresholdName === "") {
      nameErrorMessage = "A threshold name is required";
    }

    if (actionType === "" || actionType === undefined) {
      actionErrorMessage = "An action is required";
    }
    switch (actionType) {
    case "merge":
    case "notify":
    {

      if (actionErrorMessage === "" && nameErrorMessage === "" && Object.keys(props.editThreshold).length === 0) {
        let newThreshold: Threshold = {
          thresholdName,
          action: actionType,
          score: 0
        };

        let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
        let duplicateNames = newStepArtifact.thresholds && newStepArtifact.thresholds.filter(threshold => threshold.thresholdName === thresholdName);
        if (duplicateNames && duplicateNames.length > 0) {
          nameErrorMessage = "A duplicate threshold name exists";
        } else {
          if (newStepArtifact.thresholds) {
            newStepArtifact.thresholds.push(newThreshold);
          }
          await updateMatchingArtifact(newStepArtifact);
          updateActiveStepArtifact(newStepArtifact);
          props.toggleModal(false);
          resetModal();
        }

      }

      if (actionErrorMessage === "" && nameErrorMessage === "" && Object.keys(props.editThreshold).length !== 0) {
        let editedThreshold: Threshold = {
          thresholdName,
          action: actionType,
          score: props.editThreshold["score"]
        };

        let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
        let stepArtifactThreshold: Threshold = newStepArtifact.thresholds[props.editThreshold["index"]];
        let duplicateNames = newStepArtifact.thresholds && newStepArtifact.thresholds.filter(threshold => threshold.thresholdName === thresholdName);

        if (duplicateNames && duplicateNames.length > 0 && stepArtifactThreshold.thresholdName !== editedThreshold.thresholdName) {
          nameErrorMessage = "A duplicate threshold name exists";
        } else {
          updateThreshold(editedThreshold);
        }
      }
      break;
    }

    case "custom":
    {
      let uriErrorMessage = "";
      if (uriValue === "") {
        uriErrorMessage = "A URI is required";
      }

      let functionErrorMessage = "";
      if (functionValue === "") {
        functionErrorMessage = "A function is required";
      }

      let thresholdName = nameValue || "";

      let customThreshold: Threshold = {
        thresholdName,
        action: actionType,
        score: 0,
        actionModulePath: uriValue,
        actionModuleFunction: functionValue,
        actionModuleNamespace: namespaceValue
      };

      if (uriErrorMessage === "" && functionErrorMessage === "" && nameErrorMessage === "" && actionErrorMessage === "" && Object.keys(props.editThreshold).length === 0) {
        let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
        let duplicateNames = newStepArtifact.thresholds.filter(threshold => threshold.thresholdName === thresholdName);
        if (duplicateNames.length > 0) {
          nameErrorMessage = "A duplicate threshold name exists";
        } else {
          newStepArtifact.thresholds.push(customThreshold);
          await updateMatchingArtifact(newStepArtifact);
          updateActiveStepArtifact(newStepArtifact);
          props.toggleModal(false);
          resetModal();
        }
      }

      if (uriErrorMessage === "" && functionErrorMessage === "" && actionErrorMessage === "" && nameErrorMessage === "" && Object.keys(props.editThreshold).length !== 0) {
        let customEditedThreshold: Threshold = {
          thresholdName,
          action: actionType,
          score: props.editThreshold["score"],
          actionModulePath: uriValue,
          actionModuleFunction: functionValue,
          actionModuleNamespace: namespaceValue
        };

        let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
        let stepArtifactThreshold: Threshold = newStepArtifact.thresholds[props.editThreshold["index"]];
        let duplicateNames = newStepArtifact.thresholds.filter(threshold => threshold.thresholdName === thresholdName);

        if (duplicateNames.length > 0 && stepArtifactThreshold.thresholdName !== customEditedThreshold.thresholdName) {
          nameErrorMessage = "A duplicate threshold name exists";
        } else {
          updateThreshold(customEditedThreshold);
        }
      }

      setUriErrorMessage(uriErrorMessage);
      setFunctionErrorMessage(functionErrorMessage);
      break;
    }
    default:
      break;
    }
    setNameErrorMessage(nameErrorMessage);
    setActionTypeErrorMessage(actionErrorMessage);
  };

  const updateThreshold = async (threshold) => {
    let newStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;

    newStepArtifact.thresholds[props.editThreshold["index"]] = threshold;
    await updateMatchingArtifact(newStepArtifact);
    updateActiveStepArtifact(newStepArtifact);
    props.toggleModal(false);
    resetModal();
  };

  const onMatchTypeSelect = (selectedItem: any) => {
    setActionTypeErrorMessage("");
    setIsActionTypeTouched(true);
    setActionType(selectedItem.value);
  };

  const hasFormChanged = () => {
    if (actionType === "custom") {
      let checkCustomValues = hasCustomFormValuesChanged();
      if (!isNameTouched
        && !isActionTypeTouched
        && !checkCustomValues
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      if (!isNameTouched && !isActionTypeTouched) {
        return false;
      } else {
        return true;
      }
    }
  };

  const hasCustomFormValuesChanged = () => {
    if (!isUriTouched
      && !isFunctionTouched
      && !isNamespaceTouched
    ) {
      return false;
    } else {
      return true;
    }
  };

  const discardOk = () => {
    resetModal();
    props.toggleModal(false);
  };

  const discardCancel = () => {
    resetTouched();
  };

  const discardChanges = <ConfirmYesNo
    visible={discardChangesVisible}
    type="discardChanges"
    onYes={discardOk}
    onNo={discardCancel}
  />;

  const renderThresholdOptions = THRESHOLD_TYPE_OPTIONS.map((matchType, index) => ({value: matchType.value, label: matchType.name}));

  const renderCustomOptions = (
    <>
      <Row className={"mb-3"}>
        <FormLabel column lg={3}>{"URI:"}<span className={styles.asterisk}>*</span></FormLabel>
        <Col>
          <Row className={"me-3"}>
            <Col className={uriErrorMessage ? "d-flex has-error" : "d-flex"}>
              <HCInput
                id="uri-input"
                ariaLabel="uri-input"
                placeholder="Enter URI"
                className={styles.input}
                value={uriValue}
                onChange={handleInputChange}
                onBlur={handleInputChange}
              />
              <div className={"p-2 d-flex align-items-center"}>
                <HCTooltip text={NewMatchTooltips.uri} id="uri-tooltip" placement="top">
                  <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.icon} size={13} />
                </HCTooltip>
              </div>
            </Col>
            <Col xs={12} className={styles.validationError}>
              {uriErrorMessage}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className={"mb-3"}>
        <FormLabel column lg={3}>{"Function:"}<span className={styles.asterisk}>*</span></FormLabel>
        <Col>
          <Row className={"me-3"}>
            <Col className={functionErrorMessage ? "d-flex has-error" : "d-flex"}>
              <HCInput
                id="function-input"
                ariaLabel="function-input"
                placeholder="Enter a function"
                className={styles.input}
                value={functionValue}
                onChange={handleInputChange}
                onBlur={handleInputChange}
              />
              <div className={"p-2 d-flex align-items-center"}>
                <HCTooltip text={NewMatchTooltips.function} id="function-tooltip" placement="top">
                  <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.icon} size={13} />
                </HCTooltip>
              </div>
            </Col>
            <Col xs={12} className={styles.validationError}>
              {functionErrorMessage}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className={"mb-3"}>
        <FormLabel column lg={3}>{"Namespace:"}</FormLabel>
        <Col>
          <Row className={"me-3"}>
            <Col className={"d-flex"}>
              <HCInput
                id="namespace-input"
                ariaLabel="namespace-input"
                placeholder="Enter a namespace"
                className={styles.input}
                value={namespaceValue}
                onChange={handleInputChange}
                onBlur={handleInputChange}
              />
              <div className={"p-2 d-flex align-items-center"}>
                <HCTooltip text={NewMatchTooltips.namespace} id="function-tooltip" placement="top">
                  <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.icon} size={13} />
                </HCTooltip>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );

  const modalFooter = (
    <div className={styles.editFooter}>
      { (Object.keys(props.editThreshold).length !== 0) && <HCButton aria-label="editThresholdDeleteIcon" size="sm" variant="link" onClick={() => { toggleDeleteConfirmModal(true); }}>
        <FontAwesomeIcon className={styles.trashIcon} icon={faTrashAlt} />
      </HCButton>}
      <div className={(Object.keys(props.editThreshold).length === 0) ? styles.footerNewRuleset : styles.footer}>
        <HCButton
          variant="outline-light"
          size="sm"
          aria-label={`cancel-threshold-modal`}
          onClick={closeModal}
        >Cancel</HCButton>
        <HCButton
          className={styles.saveButton}
          variant="primary"
          size="sm"
          aria-label={`confirm-threshold-modal`}
          onClick={(e) => onSubmit(e)}
        >Save</HCButton>
      </div>
    </div>
  );

  const confirmAction = () => {
    props.toggleModal(false);
    resetModal();
  };

  return (
    <HCModal
      show={props.isVisible}
      size={"lg"}
      data-testid="match-threshold-modal"
      onHide={closeModal}
    >
      <Modal.Header>
        <span className={"fs-5"}>{Object.keys(props.editThreshold).length === 0 ? "Add Match Threshold" : "Edit Match Threshold"}</span>
        <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
      </Modal.Header>
      <Modal.Body>
        <Form
          id="match-threshold"
          onSubmit={onSubmit}
          className={"container-fluid"}
        >
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Name:"}<span className={styles.asterisk}>*</span></FormLabel>
            <Col>
              <Row className={"me-5"}>
                <Col className={nameErrorMessage ? "d-flex has-error" : "d-flex"}>
                  <HCInput
                    id="name-input"
                    ariaLabel="name-input"
                    placeholder="Enter threshold name"
                    className={styles.input}
                    value={nameValue}
                    onChange={handleInputChange}
                    onBlur={handleInputChange}
                  />
                </Col>
                <Col xs={12} className={styles.validationError}>
                  {nameErrorMessage}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Action:"}<span className={styles.asterisk}>*</span></FormLabel>
            <Col>
              <Row className={"me-5"}>
                <Col className={actionTypeErrorMessage ? "d-flex has-error" : "d-flex"}>
                  <Select
                    id="threshold-select-wrapper"
                    inputId="threshold-select"
                    placeholder="Select action"
                    value={renderThresholdOptions.find(oItem => oItem.value === actionType)}
                    onChange={onMatchTypeSelect}
                    aria-label={"threshold-select"}
                    options={renderThresholdOptions}
                    styles={reactSelectThemeConfig}
                    formatOptionLabel={({value, label}) => {
                      return (
                        <span aria-label={`${label}-option`}>
                          {label}
                        </span>
                      );
                    }}
                  />
                </Col>
                <Col xs={12} className={styles.validationError}>
                  {actionTypeErrorMessage}
                </Col>
              </Row>
            </Col>
          </Row>

          {actionType === "custom" && renderCustomOptions}
          {modalFooter}
        </Form>
        {discardChanges}
        <DeleteModal
          isVisible={showDeleteConfirmModal}
          toggleModal={toggleDeleteConfirmModal}
          editRuleset={props.editThreshold}
          confirmAction={confirmAction}
        />
      </Modal.Body>
    </HCModal>
  );
};

export default ThresholdModal;
