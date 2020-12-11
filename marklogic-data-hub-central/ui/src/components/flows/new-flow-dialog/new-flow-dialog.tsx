import {Modal, Form, Input, Icon} from "antd";
import React, {useState, useEffect} from "react";
import styles from "./new-flow-dialog.module.scss";
import {NewFlowTooltips} from "../../../config/tooltips.config";
import {MLButton, MLTooltip} from "@marklogic/design-system";
import {useHistory} from "react-router-dom";


const NewFlowDialog = (props) => {

  const [flowName, setFlowName] = useState("");
  const [description, setDescription] = useState(props.flowData && props.flowData !== {} ? props.flowData.description : "");

  const [isFlowNameTouched, setFlowNameTouched] = useState(false);

  const [, setIsLoading] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);

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
      history.push({pathname: `/tiles/${props.newStepToFlowOptions.stepDefinitionType === "ingestion" ? "load": "curate"}`,
        state: {
          stepDefinitionType: props.newStepToFlowOptions.stepDefinitionType,
          targetEntityType: props.newStepToFlowOptions.targetEntityType,
          viewMode: props.newStepToFlowOptions.viewMode,
          pageSize: props.newStepToFlowOptions.pageSize,
          sortOrderInfo: props.newStepToFlowOptions.sortOrderInfo,
          page: props.newStepToFlowOptions.page
        }});
    }
  };

  const onOk = () => {
    props.setNewFlow(false);
    if (props.newStepToFlowOptions && props.newStepToFlowOptions.addingStepToFlow) {
      props.setOpenNewFlow(false);
    }
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (!flowName) {
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
        await props.addStepToFlow(props.newStepToFlowOptions.newStepName, flowName, props.newStepToFlowOptions.stepDefinitionType);
        props.setOpenNewFlow(false);
        props.setAddedFlowName(flowName);
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
      }
    }
    if (event.target.id === "name" && event.target.value.length === 0) {
      setIsLoading(false);
    }

    if (event.target.id === "description") {
      setDescription(event.target.value);
    }
  };

  const formItemLayout = {
    labelCol: {
      xs: {span: 24},
      sm: {span: 7},
    },
    wrapperCol: {
      xs: {span: 24},
      sm: {span: 15},
    },
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
      <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
        <Form.Item label={<span>
          Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
        </span>} labelAlign="left"
        validateStatus={(flowName || !isFlowNameTouched) ? "" : "error"}
        help={(flowName || !isFlowNameTouched) ? "" : "Name is required"}>
          { tobeDisabled?<MLTooltip title={NewFlowTooltips.nameField} placement={'bottom'}> <Input
            id="name"
            placeholder="Enter name"
            value={flowName}
            onChange={handleChange}
            disabled={tobeDisabled}
            className={styles.input}
          /></MLTooltip>:<Input
          id="name"
          placeholder="Enter name"
          value={flowName}
          onChange={handleChange}
          disabled={tobeDisabled}
          className={styles.input}
        />} &nbsp;
          <MLTooltip title={NewFlowTooltips.name}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip>
        </Form.Item>
        <Form.Item label={<span>
          Description:&nbsp;
        </span>} labelAlign="left">
          <Input
            id="description"
            placeholder="Enter description"
            value={description}
            onChange={handleChange}
            disabled={!props.canWriteFlow}
            className={styles.input}
          />&nbsp;&nbsp;
          <MLTooltip title={NewFlowTooltips.description}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip>
        </Form.Item>
        <br /><br />
        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <><MLButton aria-label="Cancel" onClick={() => onCancel()}>Cancel</MLButton>
            &nbsp;&nbsp;
              <MLButton
                aria-label="Save"
                type="primary"
                htmlType="submit"
                disabled={!props.canWriteFlow}
                onClick={handleSubmit}
              >
              Save
              </MLButton></>
          </div>
        </Form.Item>
      </Form>
    </div>
  </Modal>);
};

export default NewFlowDialog;
