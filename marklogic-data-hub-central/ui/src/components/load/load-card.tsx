import React, {CSSProperties, useState} from "react";
import styles from "./load-card.module.scss";
import {useHistory} from "react-router-dom";
import {Card, Icon, Modal, Select, Tooltip} from "antd";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import sourceFormatOptions from "../../config/formats.config";
import {convertDateFromISO} from "../../util/conversionFunctions";
import Steps from "../steps/steps";
import {AdvLoadTooltips, SecurityTooltips} from "../../config/tooltips.config";
import {Link} from "react-router-dom";
import HCDivider from "../common/hc-divider/hc-divider";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";
import {PlayCircleFill} from "react-bootstrap-icons";

const {Option} = Select;

interface Props {
    data: any;
    flows: any;
    deleteLoadArtifact: any;
    createLoadArtifact: any;
    updateLoadArtifact: any;
    canReadOnly: any;
    canReadWrite: any;
    canWriteFlow: any;
    addStepToFlow: any;
    addStepToNew: any;
}

const LoadCard: React.FC<Props> = (props) => {
  const activityType = "ingestion";
  const [stepData, setStepData] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [runNoFlowsDialogVisible, setRunNoFlowsDialogVisible] = useState(false);
  const [runOneFlowDialogVisible, setRunOneFlowDialogVisible] = useState(false);
  const [runMultFlowsDialogVisible, setRunMultFlowsDialogVisible] = useState(false);
  const [flowsWithStep, setFlowsWithStep] = useState<any[]>([]);
  const [loadArtifactName, setLoadArtifactName] = useState("");
  const [flowName, setFlowName] = useState("");
  const [showLinks, setShowLinks] = useState("");
  const [selected, setSelected] = useState({}); // track Add Step selections so we can reset on cancel
  const [selectVisible, setSelectVisible] = useState(false);
  const [openStepSettings, setOpenStepSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const tooltipOverlayStyle={maxWidth: "200"};
  const [tooltipVisible, setTooltipVisible] = useState(false);

  //To navigate to bench view with parameters
  let history = useHistory();

  const OpenAddNew = () => {
    setIsEditing(false);
    setOpenStepSettings(true);
  };

  const OpenStepSettings = (index) => {
    setIsEditing(true);
    setStepData(prevState => ({...prevState, ...props.data[index]}));
    setOpenStepSettings(true);
  };

  const createLoadArtifact = (payload) => {
    // Update local form state, then save to db
    setStepData(prevState => ({...prevState, ...payload}));
    props.createLoadArtifact(payload);
  };

  const updateLoadArtifact = (payload) => {
    // Update local form state
    setStepData(prevState => ({...prevState, ...payload}));
    props.updateLoadArtifact(payload);
  };

  // Custom CSS for source Format
  const sourceFormatStyle = (sourceFmt) => {
    let customStyles: CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: "35px",
      width: "35px",
      lineHeight: "35px",
      backgroundColor: sourceFormatOptions[sourceFmt].color,
      fontSize: sourceFmt === "json" ? "12px" : "13px",
      borderRadius: "50%",
      textAlign: "center",
      color: "#ffffff",
      verticalAlign: "middle"
    };
    return customStyles;
  };

  // Truncate a string (Step Name) to desired no. of characters
  const getInitialChars = (str, num, suffix) => {
    suffix = suffix ? suffix : "...";
    let result = str;
    if (typeof str === "string" && str.length > num) {
      result = str.substr(0, num) + suffix;
    }
    return result;
  };

  const handleCardDelete = (name) => {
    setDialogVisible(true);
    setLoadArtifactName(name);
  };

  const onDeleteOk = (name) => {
    props.deleteLoadArtifact(name);
    setDialogVisible(false);
  };

  function handleMouseOver(e, name) {
    // Handle all possible events from mouseover of card body
    setSelectVisible(true);
    setTooltipVisible(true);
    if (typeof e.target.className === "string" &&
            (e.target.className === "ant-card-body" ||
             e.target.className.startsWith("load-card_formatFileContainer") ||
             e.target.className.startsWith("load-card_stepNameStyle"))
    ) {
      setShowLinks(name);
    }
  }
  function handleMouseLeave() {
    // Handle all possible events from mouseleave of card body
    setShowLinks("");
    setSelectVisible(false);
    setTooltipVisible(false);
  }

  function handleSelect(obj) {
    let selectedNew = {...selected};
    selectedNew[obj.loadName] = obj.flowName;
    setSelected(selectedNew);
    handleStepAdd(obj.loadName, obj.flowName);
  }

  const isStepInFlow = (loadName, flowName) => {
    let result = false;
    let flow;
    if (props.flows) flow = props.flows.find(f => f.name === flowName);
    if (flow) result = flow["steps"].findIndex(s => s.stepName === loadName) > -1;
    return result;
  };

  const countStepInFlow = (loadName) => {
    let result : string[] = [];
    if (props.flows) props.flows.forEach(f => f["steps"].findIndex(s => s.stepName === loadName) > -1 ? result.push(f.name) : "");
    return result;
  };

  const handleStepAdd = (loadName, flowName) => {
    setLoadArtifactName(loadName);
    setFlowName(flowName);
    setAddDialogVisible(true);
  };

  const handleStepRun = (loadName) => {
    setLoadArtifactName(loadName);
    let stepInFlows = countStepInFlow(loadName);
    setFlowsWithStep(stepInFlows);
    if (stepInFlows.length > 1) {
      setRunMultFlowsDialogVisible(true);
    } else if (stepInFlows.length === 1) {
      setRunOneFlowDialogVisible(true);
    } else {
      setRunNoFlowsDialogVisible(true);
    }
  };

  const handleAddRun = async (flowName) => {
    await props.addStepToFlow(loadArtifactName, flowName, "ingestion");
    setRunNoFlowsDialogVisible(false);

    history.push({
      pathname: "/tiles/run/add-run",
      state: {
        flowName: flowName,
        flowsDefaultKey: [props.flows.findIndex(el => el.name === flowName)],
        existingFlow: true,
        addFlowDirty: true,
        stepToAdd: loadArtifactName,
        stepDefinitionType: "ingestion"
      }
    });
  };

  const onContinueRun = () => {
    history.push({
      pathname: "/tiles/run/run-step",
      state: {
        flowName: flowsWithStep[0],
        stepToAdd: loadArtifactName,
        stepDefinitionType: "ingestion",
        existingFlow: false,
        flowsDefaultKey: [props.flows.findIndex(el => el.name === flowsWithStep[0])],
      }
    });
  };

  const onAddOk = async (lName, fName) => {
    await props.addStepToFlow(lName, fName);
    setAddDialogVisible(false);
    history.push({
      pathname: "/tiles/run/add",
      state: {
        flowName: fName,
        addFlowDirty: true,
        flowsDefaultKey: [props.flows.findIndex(el => el.name === fName)],
        existingFlow: true
      }
    });
  };

  const onCancel = () => {
    setDialogVisible(false);
    setAddDialogVisible(false);
    setRunNoFlowsDialogVisible(false);
    setRunOneFlowDialogVisible(false);
    setRunMultFlowsDialogVisible(false);
    setSelected({}); // reset menus on cancel
  };

  const deleteConfirmation = (
    <Modal
      visible={dialogVisible}
      okText={<div aria-label="Yes">Yes</div>}
      cancelText={<div aria-label="No">No</div>}
      onOk={() => onDeleteOk(loadArtifactName)}
      onCancel={() => onCancel()}
      width={350}
      maskClosable={false}
      destroyOnClose={true}
    >
      <div style={{fontSize: "16px", padding: "10px"}}>
                Are you sure you want to delete the <strong>{loadArtifactName}</strong> step?
      </div>
    </Modal>
  );

  const addConfirmation = (
    <Modal
      visible={addDialogVisible}
      okText={<div aria-label="Yes" data-testid={`${loadArtifactName}-to-${flowName}-Confirm`}>Yes</div>}
      cancelText={<div aria-label="No">No</div>}
      onOk={() => onAddOk(loadArtifactName, flowName)}
      onCancel={() => onCancel()}
      width={400}
      maskClosable={false}
      destroyOnClose={true}
    >
      <div aria-label="add-step-confirmation" style={{fontSize: "16px", padding: "10px"}}>
        { isStepInFlow(loadArtifactName, flowName) ?
          <p aria-label="step-in-flow">The step <strong>{loadArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance?</p> :
          <p aria-label="step-not-in-flow">Are you sure you want to add the step <strong>{loadArtifactName}</strong> to the flow <strong>{flowName}</strong>?</p>
        }
      </div>
    </Modal>
  );

  const runNoFlowsConfirmation = (
    <Modal
      visible={runNoFlowsDialogVisible}
      cancelText="Cancel"
      okButtonProps={{style: {display: "none"}}}
      onCancel={() => onCancel()}
      width={650}
      maskClosable={false}
    >
      <div aria-label="step-in-no-flows-confirmation" style={{fontSize: "16px"}}>Choose the flow in which to add and run the step <strong>{loadArtifactName}</strong>.</div>
      <Row className={"pt-4"}>
        <Col>
          <div>{props.flows.map((flow, i) => (
            <p className={styles.stepLink} data-testid={`${flow.name}-run-step`} key={i} onClick={() => handleAddRun(flow.name)}>{flow.name}</p>
          ))}</div>
        </Col>
        <Col xs={"auto"}>
          <HCDivider type="vertical" className={styles.verticalDiv}></HCDivider>
        </Col>
        <Col>
          <Link data-testid="link" id="tiles-add-run-new-flow" to={
            {pathname: "/tiles/run/add-run",
              state: {
                stepToAdd: loadArtifactName,
                stepDefinitionType: "ingestion",
                existingFlow: false
              }}}><div className={styles.stepLink} data-testid={`${loadArtifactName}-run-toNewFlow`}><Icon type="plus-circle" className={styles.plusIconNewFlow} theme="filled"/>New flow</div></Link>
        </Col>
      </Row>
    </Modal>
  );

  const runOneFlowConfirmation = (
    <Modal
      visible={runOneFlowDialogVisible}
      okText={<div aria-label="continue-confirm">Continue</div>}
      onOk={() => onContinueRun()}
      cancelText="Cancel"
      onCancel={() => onCancel()}
      width={650}
      maskClosable={false}
    >
      <div aria-label="run-step-one-flow-confirmation" style={{fontSize: "16px", padding: "10px"}}>
        <div>
          <div aria-label="step-in-one-flow">Running the step <strong>{loadArtifactName}</strong> in the flow <strong>{flowsWithStep}</strong></div>
        </div>
      </div>
    </Modal>
  );

  const runMultFlowsConfirmation = (
    <Modal
      visible={runMultFlowsDialogVisible}
      cancelText="Cancel"
      okButtonProps={{style: {display: "none"}}}
      onCancel={() => onCancel()}
      width={650}
      maskClosable={false}
    >
      <div aria-label="run-step-mult-flows-confirmation" style={{fontSize: "16px", padding: "10px"}}>
        <div aria-label="step-in-mult-flows">Choose the flow in which to run the step <strong>{loadArtifactName}</strong>.</div>
        <div className = {styles.flowSelectGrid}>{flowsWithStep.map((flowName, i) => (
          <Link data-testid="link" id="tiles-run-step" key={i} to={
            {pathname: "/tiles/run/run-step",
              state: {
                flowName: flowName,
                stepToAdd: loadArtifactName,
                stepDefinitionType: "ingestion",
                existingFlow: false,
                flowsDefaultKey: [props.flows.findIndex(el => el.name === flowName)],
              }}}><p className={styles.stepLink} data-testid={`${flowName}-run-step`}>{flowName}</p></Link>
        ))}
        </div>
      </div>
    </Modal>
  );

  return (
    <div id="load-card" aria-label="load-card" className={styles.loadCard}>
      <Row>
        {props.canReadWrite ? <Col xs={"auto"}>
          <Card
            size="small"
            className={styles.addNewCard}>
            <div aria-label="add-new-card"><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={OpenAddNew}/></div>
            <br />
            <p className={styles.addNewContent}>Add New</p>
          </Card>
        </Col> : <Col xs={"auto"}>
          <Tooltip title={"Load: "+SecurityTooltips.missingPermission} overlayStyle={tooltipOverlayStyle}><Card
            size="small"
            className={styles.addNewCardDisabled}
            data-testid="disabledAddNewCard">
            <div aria-label="add-new-card-disabled"><Icon type="plus-circle" className={styles.plusIconDisabled} theme="filled"/></div>
            <br />
            <p className={styles.addNewContentDisabled}>Add New</p>
          </Card></Tooltip>
        </Col>}{ props.data && props.data.length > 0 ? props.data.map((elem, index) => (
          <Col xs={"auto"} key={index}>
            <div
              onMouseOver={(e) => handleMouseOver(e, elem.name)}
              onMouseLeave={(e) => handleMouseLeave()}
            >
              <Card
                actions={[
                  <HCTooltip text="Step Settings" id="step-settings-tooltip" placement="bottom">
                    <i key="edit" className={styles.editIcon}>
                      <FontAwesomeIcon icon={faCog} data-testid={elem.name+"-edit"} onClick={() => OpenStepSettings(index)}/>
                    </i>
                  </HCTooltip>,
                  props.canReadWrite ?
                    <HCTooltip text="Run" id="run-tooltip" placement="bottom">
                      <i aria-label="icon: run">
                        <PlayCircleFill data-testid={elem.name+"-run"} size={20} onClick={() => handleStepRun(elem.name)}/>
                      </i>
                    </HCTooltip> :
                    <HCTooltip text={"Run: " + SecurityTooltips.missingPermission} id="run-tooltip" placement="bottom">
                      <i role="disabled-run-load button" data-testid={elem.name+"-disabled-run"}>
                        <PlayCircleFill data-testid={elem.name+"-run"} size={23} onClick={(event) => event.preventDefault()} className={styles.disabledIcon}/>
                      </i>
                    </HCTooltip>,
                  props.canReadWrite ?
                    <HCTooltip text="Delete" id="delete-tooltip" placement="bottom">
                      <i aria-label="icon: delete">
                        <FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg"  data-testid={elem.name+"-delete"} onClick={() => handleCardDelete(elem.name)}/>
                      </i>
                    </HCTooltip> :
                    <HCTooltip text={"Delete: " + SecurityTooltips.missingPermission} id="delete-tooltip" placement="bottom" >
                      <i data-testid={elem.name+"-disabled-delete"}>
                        <FontAwesomeIcon icon={faTrashAlt} onClick={(event) => event.preventDefault()} className={styles.disabledIcon} size="lg"/>
                      </i>
                    </HCTooltip>,
                ]}
                className={styles.cardStyle}
                size="small"
              >
                <div className={styles.formatContainer}>
                  <div className={styles.sourceFormat} style={sourceFormatStyle(elem.sourceFormat)} aria-label={`${elem.name}-sourceFormat`}>{sourceFormatOptions[elem.sourceFormat].label}</div>
                </div>
                <div className={styles.stepNameStyle}>{getInitialChars(elem.name, 25, "...")}</div>
                <div className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</div>
                <div className={styles.cardLinks} style={{display: showLinks === elem.name ? "block" : "none"}}>
                  {props.canWriteFlow ? <Link id="tiles-run-add" to={
                    {pathname: "/tiles/run/add",
                      state: {
                        stepToAdd: elem.name,
                        stepDefinitionType: "ingestion",
                        viewMode: "card",
                        existingFlow: false
                      }}}>
                    <div className={styles.cardLink} data-testid={`${elem.name}-toNewFlow`}>Add step to a new flow</div></Link>:<div className={styles.cardDisabledLink} data-testid={`${elem.name}-toNewFlow`}> Add step to a new flow</div>}
                  <div className={styles.cardNonLink} data-testid={`${elem.name}-toExistingFlow`}>
                                    Add step to an existing flow
                    {selectVisible ? <Tooltip title={"Load: "+SecurityTooltips.missingPermission} placement={"bottom"} visible={tooltipVisible && !props.canWriteFlow}><div className={styles.cardLinkSelect}><div className={styles.cardLinkSelect}>
                      <Select
                        style={{width: "100%"}}
                        value={selected[elem.name] ? selected[elem.name] : undefined}
                        onChange={(flowName) => handleSelect({flowName: flowName, loadName: elem.name})}
                        placeholder="Select Flow"
                        defaultActiveFirstOption={false}
                        data-testid={`${elem.name}-flowsList`}
                        disabled={!props.canWriteFlow}
                      >
                        { props.flows && props.flows.length > 0 ? props.flows.map((f, i) => (
                          <Option aria-label={`${f.name}-option`} value={f.name} key={i}>{f.name}</Option>
                        )) : null}
                      </Select>
                    </div></div></Tooltip> : null}
                  </div>
                </div>
              </Card>
            </div>
          </Col>)) : <span></span> }
      </Row>
      {deleteConfirmation}
      {addConfirmation}
      {runNoFlowsConfirmation}
      {runOneFlowConfirmation}
      {runMultFlowsConfirmation}
      <Steps
        // Basic Settings
        isEditing={isEditing}
        createStep={createLoadArtifact}
        stepData={stepData}
        canReadOnly={props.canReadOnly}
        canReadWrite={props.canReadWrite}
        canWrite={props.canReadWrite}
        // Advanced Settings
        tooltipsData={AdvLoadTooltips}
        openStepSettings={openStepSettings}
        setOpenStepSettings={setOpenStepSettings}
        updateStep={updateLoadArtifact}
        activityType={activityType}
      />
    </div>
  );

};

export default LoadCard;
