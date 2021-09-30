import {Modal, Input, Tooltip} from "antd";
import {Form, Row, Col, FormLabel} from "react-bootstrap";
import React, {useState, useEffect} from "react";
import styles from "./new-flow-dialog.module.scss";
import {NewFlowTooltips} from "../../../config/tooltips.config";
import {useHistory} from "react-router-dom";
import {QuestionCircleFill} from "react-bootstrap-icons";
import HCTooltip from "../../common/hc-tooltip/hc-tooltip";
import HCButton from "../../common/hc-button/hc-button";


const NewFlowDialog = (props) => {

  const [flowName, setFlowName] = useState("");
  const [description, setDescription] = useState(props.flowData && props.flowData !== {} ? props.flowData.description : "");

  const [isFlowNameTouched, setFlowNameTouched] = useState(false);

  const [, setIsLoading] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);
  const [invalidChars, setInvalidChars] = useState(false);

  let history = useHistory();
  useEffect(() => {
    if (props.flowData && JSON.stringify(props.flowData) !== JSON.stringify({}) && props.title === "Edit Flow") {
      setFlowName(props.flowData.name);
      setDescription(props.flowData.description);
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

  }, [props.title, props.newFlow]);

  const onCancel = () => {
    props.setNewFlow(false);
    if (props.newStepToFlowOptions && props.newStepToFlowOptions.addingStepToFlow) {
      props.setOpenNewFlow(false);
    }

    //add information about mapping step, load card, load list, pagination.
    if (props.newStepToFlowOptions && !props.newStepToFlowOptions.existingFlow) {
      history.push({
        pathname: `/tiles/${props.newStepToFlowOptions.stepDefinitionType === "ingestion" ? "load" : "curate"}`,
        state: {
          stepDefinitionType: props.newStepToFlowOptions.stepDefinitionType,
          targetEntityType: props.newStepToFlowOptions.targetEntityType,
          viewMode: props.newStepToFlowOptions.viewMode,
          pageSize: props.newStepToFlowOptions.pageSize,
          sortOrderInfo: props.newStepToFlowOptions.sortOrderInfo,
          page: props.newStepToFlowOptions.page
        }
      });
    }
  };

  const onOk = () => {
    props.setNewFlow(false);
    if (props.newStepToFlowOptions && props.newStepToFlowOptions.addingStepToFlow) {
      props.setOpenNewFlow(false);
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
    if (props.title === "Edit Flow") {
      await props.updateFlow(dataPayload, flowName);
    } else {
      await props.createFlow(dataPayload);
      if (props.createAdd && props.newStepToFlowOptions && props.newStepToFlowOptions.addingStepToFlow) {
        props.setAddedFlowName(flowName);
        await props.addStepToFlow(props.newStepToFlowOptions.newStepName, flowName, props.newStepToFlowOptions.stepDefinitionType);
        props.setOpenNewFlow(false);
      }
    }
    props.setNewFlow(false);
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

  return (<Modal visible={props.newFlow}
    title={null}
    width="700px"
    onCancel={() => onCancel()}
    onOk={() => onOk()}
    okText="Save"
    className={styles.modal}
    footer={null}>

    <p className={styles.title}>{props.title || "New Flow"}</p>
    <br />
    <div className={styles.newFlowForm}>
      <Form onSubmit={handleSubmit}>
        <Row className={"mb-3"}>
          <FormLabel column lg={3}>{"Name:"}&nbsp;<span className={styles.asterisk}>*</span></FormLabel>
          <Col>
            <Row>
              <Col className={(flowName || !isFlowNameTouched) ? (invalidChars ? "d-flex has-error" : "d-flex") : "d-flex has-error"}>
                {tobeDisabled ?
                  <Tooltip title={NewFlowTooltips.nameField} placement={"bottom"} >
                    <span className={"w-100"}>
                      <Input
                        id="name"
                        placeholder="Enter name"
                        value={flowName}
                        onChange={handleChange}
                        disabled={tobeDisabled}
                      />
                    </span>
                  </Tooltip> :
                  <Input
                    id="name"
                    placeholder="Enter name"
                    value={flowName}
                    onChange={handleChange}
                    disabled={tobeDisabled}
                  />}
                <div className={"p-2 d-flex"}>
                  <HCTooltip text={NewFlowTooltips.name} id="additional-settings-tooltip" placement="left">
                    <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} />
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
            <Input
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={handleChange}
              disabled={!props.canWriteFlow}
              className={styles.input}
            />
            <div className={"p-2 d-flex"}>
              <HCTooltip text={NewFlowTooltips.description} id="additional-settings-tooltip" placement="left">
                <QuestionCircleFill color="#7F86B5" className={styles.questionCircle} size={13} />
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
              disabled={!props.canWriteFlow}
              onClick={handleSubmit}
            >
              Save
            </HCButton>
          </Col>
        </Row>
      </Form>
    </div>
  </Modal>);
};

export default NewFlowDialog;
