import React, {useState, useEffect, useContext} from "react";
import {Modal, Form, Input, Icon, Button, Select, Tooltip} from "antd";
import styles from "./threshold-modal.module.scss";

import ConfirmYesNo from "../../../common/confirm-yes-no/confirm-yes-no";

import {CurationContext} from "../../../../util/curation-context";
import {MatchingStep, Threshold} from "../../../../types/curation-types";
import {NewMatchTooltips} from "../../../../config/tooltips.config";
import {updateMatchingArtifact} from "../../../../api/matching";
import DeleteModal from "../delete-modal/delete-modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons";

type Props = {
  isVisible: boolean;
  editThreshold: any;
  toggleModal: (isVisible: boolean) => void;
};

const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
};

const THRESHOLD_TYPE_OPTIONS = [
  {name: "Merge", value: "merge"},
  {name: "Notify", value: "notify"},
  {name: "Custom", value: "custom"},
];

const {Option} = Select;

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

  const onMatchTypeSelect = (value: string) => {
    setActionTypeErrorMessage("");
    setIsActionTypeTouched(true);
    setActionType(value);
  };

  const hasFormChanged = () => {
    if (actionType ===  "custom") {
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

  const renderThresholdOptions = THRESHOLD_TYPE_OPTIONS.map((matchType, index) => {
    return <Option key={index} value={matchType.value} aria-label={`${matchType.name}-option`}>{matchType.name}</Option>;
  });

  const renderCustomOptions = (
    <>
      <Form.Item
        className={styles.formItem}
        label={<span>
          URI:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
        </span>}
        colon={false}
        labelAlign="left"
        validateStatus={uriErrorMessage ? "error" : ""}
        help={uriErrorMessage}
      >
        <Input
          id="uri-input"
          aria-label="uri-input"
          placeholder="Enter URI"
          className={styles.input}
          value={uriValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <Tooltip title={NewMatchTooltips.uri}>
          <Icon type="question-circle" className={styles.icon} theme="filled" />
        </Tooltip>
      </Form.Item>
      <Form.Item
        className={styles.formItem}
        label={<span>
          Function:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
        </span>}
        colon={false}
        labelAlign="left"
        validateStatus={functionErrorMessage ? "error" : ""}
        help={functionErrorMessage}
      >
        <Input
          id="function-input"
          aria-label="function-input"
          placeholder="Enter a function"
          className={styles.input}
          value={functionValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <Tooltip title={NewMatchTooltips.function}>
          <Icon type="question-circle" className={styles.icon} theme="filled" />
        </Tooltip>
      </Form.Item>
      <Form.Item
        className={styles.formItem}
        label={<span>Namespace:</span>}
        colon={false}
        labelAlign="left"
      >
        <Input
          id="namespace-input"
          aria-label="namespace-input"
          placeholder="Enter a namespace"
          className={styles.input}
          value={namespaceValue}
          onChange={handleInputChange}
          onBlur={handleInputChange}
        />
        <Tooltip title={NewMatchTooltips.namespace}>
          <Icon type="question-circle" className={styles.icon} theme="filled" />
        </Tooltip>
      </Form.Item>
    </>
  );

  const modalFooter = (
    <div className={styles.editFooter}>
      <Button type="link" onClick={() => { toggleDeleteConfirmModal(true); }}>
        <FontAwesomeIcon  className={styles.trashIcon} icon={faTrashAlt} />
      </Button>
      <div className={styles.footer}>
        <Button
          aria-label={`cancel-threshold-modal`}
          onClick={closeModal}
        >Cancel</Button>
        <Button
          className={styles.saveButton}
          aria-label={`confirm-threshold-modal`}
          type="primary"
          onClick={(e) => onSubmit(e)}
        >Save</Button>
      </div>
    </div>
  );

  const confirmAction = () => {
    props.toggleModal(false);
    resetModal();
  };

  return (
    <Modal
      visible={props.isVisible}
      destroyOnClose={true}
      closable={true}
      maskClosable={false}
      title={Object.keys(props.editThreshold).length === 0 ? "Add Match Threshold" : "Edit Match Threshold"}
      footer={null}
      width={700}
      onCancel={closeModal}
    >
      <Form
        {...layout}
        id="match-threshold"
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
          validateStatus={nameErrorMessage ? "error" : ""}
          help={nameErrorMessage}
        >
          <Input
            id="name-input"
            aria-label="name-input"
            placeholder="Enter threshold name"
            className={styles.input}
            value={nameValue}
            onChange={handleInputChange}
            onBlur={handleInputChange}
          />
        </Form.Item>

        <Form.Item
          className={styles.formItem}
          label={<span>
            Action:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
          </span>}
          colon={false}
          labelAlign="left"
          validateStatus={actionTypeErrorMessage ? "error" : ""}
          help={actionTypeErrorMessage}
        >
          <Select
            aria-label={"threshold-select"}
            className={styles.matchTypeSelect}
            size="default"
            placeholder="Select action"
            defaultValue="''"
            onSelect={onMatchTypeSelect}
            value={actionType}
          >
            {renderThresholdOptions}
          </Select>
        </Form.Item>

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
    </Modal>
  );
};

export default ThresholdModal;
