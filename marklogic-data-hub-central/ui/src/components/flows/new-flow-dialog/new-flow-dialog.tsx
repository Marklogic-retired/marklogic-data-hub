import {Form, Row, Col, FormLabel, Modal} from "react-bootstrap";
import React, {useState, useEffect} from "react";
import styles from "./new-flow-dialog.module.scss";
import {NewFlowTooltips} from "@config/tooltips.config";
import {useHistory} from "react-router-dom";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {HCInput, HCButton, HCTooltip, HCModal} from "@components/common";
import {themeColors} from "@config/themes.config";

interface Props {
  newFlow: any;
  title: string;
  setNewFlow: React.Dispatch<React.SetStateAction<boolean>>;
  setAddedFlowName:React.Dispatch<React.SetStateAction<string>>;
  createFlow: (payload: any)=>void;
  createAdd: boolean;
  updateFlow: (name: any, description: any, steps?: any) => Promise<void>;
  flowData: any;
  canWriteFlow: boolean;
  addStepToFlow: (artifactName: any, flowName: string, stepDefinitionType: string)=>void;
  newStepToFlowOptions: any;
  setOpenNewFlow: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewFlowDialog: React.FC<Props> = ({
  newFlow,
  title,
  setNewFlow,
  setAddedFlowName,
  createFlow,
  createAdd,
  updateFlow,
  flowData,
  canWriteFlow,
  addStepToFlow,
  newStepToFlowOptions,
  setOpenNewFlow
}) => {

  const isNewFlow = title === "New Flow";

  const [flowName, setFlowName] = useState(isNewFlow ? "" : flowData?.name);
  const [description, setDescription] = useState(isNewFlow ? "" : flowData?.description);

  const [isFlowNameTouched, setFlowNameTouched] = useState(false);

  const [, setIsLoading] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);
  const [invalidChars, setInvalidChars] = useState(false);

  let history = useHistory();

  useEffect(() => {
    if (flowData && title === "Edit Flow") {
      setFlowName(flowData.name);
      setDescription(flowData.description);
      setIsLoading(true);
      setTobeDisabled(true);
    } else {
      setFlowName("");
      setFlowNameTouched(false);
      setDescription("");
    }
    return (() => {
      setFlowName("");
      setFlowNameTouched(false);
      setDescription("");
      setTobeDisabled(false);
    });
  }, [title, newFlow]);

  const onCancel = () => {
    setNewFlow(false);
    if (newStepToFlowOptions && newStepToFlowOptions.addingStepToFlow) {
      setOpenNewFlow(false);
    }

    //add information about mapping step, load card, load list, pagination.
    if (newStepToFlowOptions && !newStepToFlowOptions.existingFlow) {
      history.push({
        pathname: `/tiles/${newStepToFlowOptions.stepDefinitionType === "ingestion" ? "load" : "curate"}`,
        state: {
          stepDefinitionType: newStepToFlowOptions.stepDefinitionType,
          targetEntityType: newStepToFlowOptions.targetEntityType,
          viewMode: newStepToFlowOptions.viewMode,
          pageSize: newStepToFlowOptions.pageSize,
          sortOrderInfo: newStepToFlowOptions.sortOrderInfo,
          page: newStepToFlowOptions.page
        }
      });
    }
  };

  const handleSubmit = async (event: {preventDefault: () => void;}) => {
    if (!flowName || invalidChars) {
      // missing name
      setFlowNameTouched(true);
      event.preventDefault();
      return;
    }

    if (event) event.preventDefault();
    let dataPayload = {
      name: flowName,
      description: description
    };
    setIsLoading(true);
    if (title === "Edit Flow") {
      await updateFlow(flowName, description);
    } else {
      await createFlow(dataPayload);
      if (createAdd && newStepToFlowOptions && newStepToFlowOptions.addingStepToFlow) {
        setAddedFlowName(flowName);
        await addStepToFlow(newStepToFlowOptions.newStepName, flowName, newStepToFlowOptions.stepDefinitionType);
        setOpenNewFlow(false);
      }
    }
    setNewFlow(false);
  };

  const handleChange = (event) => {
    if (event.target.id === "name") {
      if (event.target.value === " ") {
        setFlowNameTouched(false);
      } else {
        setFlowNameTouched(true);
        setFlowName(event.target.value);

        //check value does not contain special chars and leads with a letter
        if (event.target.value !== "" && !(/^[a-zA-Z][a-zA-Z0-9\-_]*$/g.test(event.target.value))) {
          setInvalidChars(true);
        } else {
          setInvalidChars(false);
        }

      }
    }
    if (event.target.id === "name" && event.target.value.length === 0) {
      setIsLoading(false);
    }

    if (event.target.id === "description") {
      setDescription(event.target.value);
    }
  };

  return (<HCModal
    show={newFlow}
    dialogClassName={styles.modal700w}
    onHide={onCancel}
  >
    <Modal.Header className={"bb-none"}>
      <span className={"fs-3"}>{title || "New Flow"}</span>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel} style={{"marginTop": "-30px"}}></button>
    </Modal.Header>
    <Modal.Body className={"py-2"}>
      <div className={styles.newFlowForm}>
        <Form onSubmit={handleSubmit}>
          <Row className={"mb-3"}>
            <FormLabel column lg={3}>{"Name:"}&nbsp;<span className={styles.asterisk}>*</span></FormLabel>
            <Col>
              <Row>
                <Col className={(flowName || !isFlowNameTouched) ? (invalidChars ? "d-flex has-error" : "d-flex") : "d-flex has-error"}>
                  {tobeDisabled ?
                    <HCTooltip id="disabled-namefield-tooltip" text={NewFlowTooltips.nameField} placement={"bottom"} >
                      <span className={"w-100"} tabIndex={0}>
                        <HCInput
                          id="name"
                          placeholder="Enter name"
                          dataTestid={"new-flow-name"}
                          value={flowName}
                          onChange={handleChange}
                          disabled={tobeDisabled}
                        />
                      </span>
                    </HCTooltip> :
                    <HCInput
                      id="name"
                      placeholder="Enter name"
                      dataTestid={"new-flow-name"}
                      value={flowName}
                      onChange={handleChange}
                      disabled={tobeDisabled}
                    />}
                  <div className={"p-2 d-flex"}>
                    <HCTooltip text={NewFlowTooltips.name} id="additional-settings-tooltip" placement="left">
                      <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} tabIndex={0}/>
                    </HCTooltip>
                  </div>
                </Col>
                <Col xs={12} className={styles.validationError}>
                  {invalidChars ? "Names must start with a letter and can contain letters, numbers, hyphens, and underscores only." : (flowName || !isFlowNameTouched) ? "" : "Name is required"}
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
                dataTestid={"new-flow-description"}
                value={description}
                onChange={handleChange}
                disabled={!canWriteFlow}
                className={styles.input}
              />
              <div className={"p-2 d-flex"}>
                <HCTooltip text={NewFlowTooltips.description} id="additional-settings-tooltip" placement="left">
                  <QuestionCircleFill color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} tabIndex={0}/>
                </HCTooltip>
              </div>
            </Col>
          </Row>
          <Row className={"mb-3 mt-5"}>
            <Col className={"w-100 text-end"}>
              <HCButton size={"sm"} aria-label="Cancel" variant="outline-light" onClick={() => onCancel()}>Cancel</HCButton>
                &nbsp;&nbsp;
              <HCButton
                size={"sm"}
                aria-label="Save"
                variant="primary"
                type="submit"
                disabled={!canWriteFlow}
                onClick={handleSubmit}
              >
                Save
              </HCButton>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal.Body>
  </HCModal>);
};

export default NewFlowDialog;
