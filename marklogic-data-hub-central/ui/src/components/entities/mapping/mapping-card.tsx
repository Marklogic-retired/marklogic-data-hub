import React, {useState, useEffect, useContext} from "react";
import styles from "./mapping-card.module.scss";
import {Card, Icon, Divider, Row, Col, Modal, Select, Tooltip} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {convertDateFromISO, getInitialChars, extractCollectionFromSrcQuery} from "../../../util/conversionFunctions";
import {AdvMapTooltips, SecurityTooltips} from "../../../config/tooltips.config";
import {Link, useHistory} from "react-router-dom";
import {faPencilAlt, faCog} from "@fortawesome/free-solid-svg-icons";
import Steps from "../../steps/steps";
import {CurationContext} from "../../../util/curation-context";
import {StepType} from "../../../types/curation-types";
import {getViewSettings, setViewSettings} from "../../../util/user-context";

const {Option} = Select;

interface Props {
    data: any;
    flows: any;
    entityTypeTitle: any;
    deleteMappingArtifact: any;
    createMappingArtifact: any;
    updateMappingArtifact: any;
    canReadOnly: any;
    canReadWrite: any;
    canWriteFlow: any;
    entityModel: any;
    addStepToFlow: any;
    addStepToNew: any;
    openStep: any;
  }

const MappingCard: React.FC<Props> = (props) => {
  const storage = getViewSettings();
  const {
    mappingOptions,
    setActiveStep,
    setOpenStepSettings,
    setStepOpenOptions} = useContext(CurationContext);
  const [mapData, setMapData] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [runNoFlowsDialogVisible, setRunNoFlowsDialogVisible] = useState(false);
  const [runOneFlowDialogVisible, setRunOneFlowDialogVisible] = useState(false);
  const [runMultFlowsDialogVisible, setRunMultFlowsDialogVisible] = useState(false);
  const [flowsWithStep, setFlowsWithStep] = useState<any[]>([]);
  const [mappingArtifactName, setMappingArtifactName] = useState("");
  const [flowName, setFlowName] = useState("");
  const [showLinks, setShowLinks] = useState("");
  const [selected, setSelected] = useState({}); // track Add Step selections so we can reset on cancel
  const [selectVisible, setSelectVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipOverlayStyle={maxWidth: "200"};

  //To navigate to bench view with parameters
  let history = useHistory();

  useEffect(() => {
    //open step details when create step is called successfully
    if (props.openStep !== "") {
      openStepDetails(props.openStep?.name);
    }
  }, [props.data]);

  const OpenAddNew = () => {
    let stepOpenOptions = {
      isEditing: false,
      openStepSettings: true
    };
    setStepOpenOptions(stepOpenOptions);
  };

  const OpenStepSettings = async (index) => {
    setMapData(prevState => ({...prevState, ...props.data[index]}));

    let stepOpenOptions = {
      isEditing: true,
      openStepSettings: true
    };
    setStepOpenOptions(stepOpenOptions);
  };

  const createMappingArtifact = async (payload) => {
    // Update local form state, then save to db
    setMapData(prevState => ({...prevState, ...payload}));
    await props.createMappingArtifact(payload);
  };

  const updateMappingArtifact = async (payload) => {
    // Update local form state
    setMapData(prevState => ({...prevState, ...payload}));
    await props.updateMappingArtifact(payload);
  };

  const handleCardDelete = (name) => {
    setDialogVisible(true);
    setMappingArtifactName(name);
  };

  const onOk = (name) => {
    props.deleteMappingArtifact(name);
    setDialogVisible(false);
  };

  const onCancel = () => {
    setDialogVisible(false);
    setAddDialogVisible(false);
    setRunNoFlowsDialogVisible(false);
    setRunOneFlowDialogVisible(false);
    setRunMultFlowsDialogVisible(false);
    setSelected({}); // reset menus on cancel
  };

  function handleMouseOver(e, name) {
    // Handle all possible events from mouseover of card body
    setSelectVisible(true);
    setTooltipVisible(true);
    if (typeof e.target.className === "string" &&
            (e.target.className === "ant-card-body" ||
             e.target.className.startsWith("mapping-card_cardContainer") ||
             e.target.className.startsWith("mapping-card_formatFileContainer") ||
             e.target.className.startsWith("mapping-card_sourceQuery") ||
             e.target.className.startsWith("mapping-card_lastUpdatedStyle"))
    ) {
      setShowLinks(name);
    }
  }
  function handleMouseLeave() {
    setShowLinks("");
    setSelectVisible(false);
    setTooltipVisible(false);
  }

  const deleteConfirmation = <Modal
    visible={dialogVisible}
    okText="Yes"
    cancelText="No"
    onOk={() => onOk(mappingArtifactName)}
    onCancel={() => onCancel()}
    width={350}
    maskClosable={false}
  >
    <span style={{fontSize: "16px"}}>Are you sure you want to delete the <strong>{mappingArtifactName}</strong> step?</span>
  </Modal>;

  const openStepDetails = (name) => {
    // need step's name and array index to option mapping details
    let index = (props.data.findIndex(el => el.name === name) !== -1 ? props.data.findIndex(el => el.name === name) : 0);
    if (props.openStep) {
      if (props.entityModel.entityTypeId === props.openStep.entityType) {
        openMapStepDetails(name, index);
      } else {
        return;
      }
    } else {
      openMapStepDetails(name, index);
    }
  };

  const openMapStepDetails = (name, index) => {
    const stepArtifact = props.data[index];
    const modelDefinition = props.entityModel["model"]["definitions"];
    const entityType = props.entityTypeTitle;

    // need step's name and array index to option mapping details

    setActiveStep(stepArtifact, modelDefinition, entityType);
    setViewSettings({
      ...storage,
      curate: {
        stepArtifact,
        modelDefinition,
        entityType
      }
    });
    history.push({pathname: "/tiles/curate/map"});
  };

  function handleSelect(obj) {
    let selectedNew = {...selected};
    selectedNew[obj.loadName] = obj.flowName;
    setSelected(selectedNew);
    handleStepAdd(obj.mappingName, obj.flowName);
  }

  const isStepInFlow = (mappingName, flowName) => {
    let result = false, flow;
    if (props.flows) flow = props.flows.find(f => f.name === flowName);
    if (flow) result = flow["steps"].findIndex(s => s.stepName === mappingName) > -1;
    return result;
  };

  const countStepInFlow = (mappingName) => {
    let result : string[] = [];
    if (props.flows) props.flows.forEach(f => f["steps"].findIndex(s => s.stepName === mappingName) > -1 ? result.push(f.name) : "");
    return result;
  };

  const handleStepAdd = (mappingName, flowName) => {
    setMappingArtifactName(mappingName);
    setFlowName(flowName);
    setAddDialogVisible(true);
  };

  const handleStepRun = (mappingName) => {
    setMappingArtifactName(mappingName);
    let stepInFlows = countStepInFlow(mappingName);
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
    await props.addStepToFlow(mappingArtifactName, flowName, "mapping");
    setRunNoFlowsDialogVisible(false);

    history.push({
      pathname: "/tiles/run/add-run",
      state: {
        flowName: flowName,
        flowsDefaultKey: [props.flows.findIndex(el => el.name === flowName)],
        existingFlow: true,
        addFlowDirty: true,
        stepToAdd: mappingArtifactName,
        stepDefinitionType: "mapping"
      }
    });
  };

  const onContinueRun = () => {
    history.push({
      pathname: "/tiles/run/run-step",
      state: {
        flowName: flowsWithStep[0],
        stepToAdd: mappingArtifactName,
        stepDefinitionType: "mapping",
        targetEntityType: props.entityModel.entityTypeId,
        existingFlow: false,
        flowsDefaultKey: [props.flows.findIndex(el => el.name === flowsWithStep[0])],
      }
    });
  };


  const onAddOk = async (lName, fName) => {
    await props.addStepToFlow(lName, fName, "mapping");
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

  const addConfirmation = (
    <Modal
      visible={addDialogVisible}
      okText={<div data-testid={`${mappingArtifactName}-to-${flowName}-Confirm`}>Yes</div>}
      cancelText="No"
      onOk={() => onAddOk(mappingArtifactName, flowName)}
      onCancel={() => onCancel()}
      width={400}
      maskClosable={false}
    >
      <div aria-label="add-step-confirmation" style={{fontSize: "16px", padding: "10px"}}>
        { isStepInFlow(mappingArtifactName, flowName) ?
          <p aria-label="step-in-flow">The step <strong>{mappingArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance?</p> :
          <p aria-label="step-not-in-flow">Are you sure you want to add the step <strong>{mappingArtifactName}</strong> to the flow <strong>{flowName}</strong>?</p>
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
      <div aria-label="step-in-no-flows-confirmation" style={{fontSize: "16px"}}>Choose the flow in which to add and run the step <strong>{mappingArtifactName}</strong>.</div>
      <Row className={styles.flowSelectGrid}>
        <Col span={11}>
          <div>{props.flows.map((flow, i) => (
            <p className={styles.stepLink} data-testid={`${flow.name}-run-step`} key={i} onClick={() => handleAddRun(flow.name)}>{flow.name}</p>
          ))}</div>
        </Col>
        <Col span={2}>
          <Divider type="vertical" className={styles.verticalDiv}></Divider>
        </Col>
        <Col span={11}>
          <Link data-testid="link" id="tiles-add-run-new-flow" to={
            {pathname: "/tiles/run/add-run",
              state: {
                stepToAdd: mappingArtifactName,
                stepDefinitionType: "mapping",
                targetEntityType: props.entityModel.entityTypeId,
                existingFlow: false
              }}}><div className={styles.stepLink} data-testid={`${mappingArtifactName}-run-toNewFlow`}><Icon type="plus-circle" className={styles.plusIconNewFlow} theme="filled"/>New flow</div></Link>
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
          <div aria-label="step-in-one-flow">Running the step <strong>{mappingArtifactName}</strong> in the flow <strong>{flowsWithStep}</strong></div>
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
        <div aria-label="step-in-mult-flows">Choose the flow in which to run the step <strong>{mappingArtifactName}</strong>.</div>
        <div className = {styles.flowSelectGrid}>{flowsWithStep.map((flowName, i) => (
          <Link data-testid="link" id="tiles-run-step" key={i} to={
            {pathname: "/tiles/run/run-step",
              state: {
                flowName: flowName,
                stepToAdd: mappingArtifactName,
                stepDefinitionType: "mapping",
                targetEntityType: props.entityModel.entityTypeId,
                existingFlow: false,
                flowsDefaultKey: [props.flows.findIndex(el => el.name === flowName)],
              }}}><p className={styles.stepLink} data-testid={`${flowName}-run-step`}>{flowName}</p></Link>
        ))}
        </div>
      </div>
    </Modal>
  );

  return (
    <div className={styles.loadContainer}>
      <Row gutter={16} type="flex" >
        {props.canReadWrite ? <Col>
          <Card
            size="small"
            className={styles.addNewCard}>
            <div><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={OpenAddNew}/></div>
            <br />
            <p className={styles.addNewContent}>Add New</p>
          </Card>
        </Col> : <Col>
          <Tooltip title={"Curate: "+SecurityTooltips.missingPermission} overlayStyle={tooltipOverlayStyle}><Card
            size="small"
            className={styles.addNewCardDisabled}>
            <div aria-label="add-new-card-disabled"><Icon type="plus-circle" className={styles.plusIconDisabled} theme="filled"/></div>
            <br/>
            <p className={styles.addNewContent}>Add New</p>
          </Card></Tooltip>
        </Col>}
        {
          props.data && props.data.length > 0 ?
            props.data.map((elem, index) => (
              <Col key={index}>
                <div
                  data-testid={`${props.entityTypeTitle}-${elem.name}-step`}
                  onMouseOver={(e) => handleMouseOver(e, elem.name)}
                  onMouseLeave={(e) => handleMouseLeave()}
                >
                  <Card
                    actions={[
                      <Tooltip title={"Step Details"} placement="bottom"><i className={styles.stepDetails}><FontAwesomeIcon icon={faPencilAlt} onClick={() => openMapStepDetails(elem.name, index)} data-testid={`${elem.name}-stepDetails`}/></i></Tooltip>,
                      <Tooltip title={"Step Settings"} placement="bottom"><i className={styles.editIcon} role="edit-mapping button" key ="last"><FontAwesomeIcon icon={faCog} data-testid={elem.name+"-edit"} onClick={() => OpenStepSettings(index)}/></i></Tooltip>,
                      props.canReadWrite ? <Tooltip title={"Run"} placement="bottom"><i aria-label="icon: run"><Icon type="play-circle" theme="filled" className={styles.runIcon} data-testid={elem.name+"-run"} onClick={() => handleStepRun(elem.name)}/></i></Tooltip> : <Tooltip title={"Run: " + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: "200px"}}><i role="disabled-run-mapping button" data-testid={elem.name+"-disabled-run"}><Icon type="play-circle" theme="filled" onClick={(event) => event.preventDefault()} className={styles.disabledIcon}/></i></Tooltip>,
                      props.canReadWrite ? <Tooltip title={"Delete"} placement="bottom"><i key ="last" role="delete-mapping button" data-testid={elem.name+"-delete"} onClick={() => handleCardDelete(elem.name)}><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg"/></i></Tooltip> : <Tooltip title={"Delete: " + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: "200px"}}><i role="disabled-delete-mapping button" data-testid={elem.name+"-disabled-delete"} onClick={(event) => event.preventDefault()}><FontAwesomeIcon icon={faTrashAlt} className={styles.disabledIcon} size="lg"/></i></Tooltip>,
                    ]}
                    className={styles.cardStyle}
                    size="small"
                  >
                    <div className={styles.formatFileContainer}>
                      <span aria-label={`${elem.name}-step-label`} className={styles.mapNameStyle}>{getInitialChars(elem.name, 27, "...")}</span>

                    </div><br />
                    {elem.selectedSource === "collection" ? <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(elem.sourceQuery)}</div> : <div className={styles.sourceQuery}>Source Query: {getInitialChars(elem.sourceQuery, 32, "...")}</div>}
                    <br /><br />
                    <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(elem.lastUpdated)}</p>
                    <div className={styles.cardLinks} style={{display: showLinks === elem.name ? "block" : "none"}}>
                      {
                        props.canWriteFlow ?
                          <Link id="tiles-run-add" to={
                            {
                              pathname: "/tiles/run/add",
                              state: {
                                stepToAdd: elem.name,
                                targetEntityType: props.entityModel.entityTypeId,
                                stepDefinitionType: "mapping"
                              }
                            }
                          }>
                            <div className={styles.cardLink} data-testid={`${elem.name}-toNewFlow`}>
                          Add step to a new flow
                            </div>
                          </Link>
                          :
                          <div className={styles.cardDisabledLink} data-testid={`${elem.name}-disabledToNewFlow`}>
                        Add step to a new flow
                          </div>
                      }
                      <div className={styles.cardNonLink} data-testid={`${elem.name}-toExistingFlow`}>
                      Add step to an existing flow
                        {
                          selectVisible ?
                            <Tooltip title={"Curate: "+SecurityTooltips.missingPermission} placement={"bottom"} visible={tooltipVisible && !props.canWriteFlow}><div className={styles.cardLinkSelect}>
                              <Select
                                style={{width: "100%"}}
                                value={selected[elem.name] ? selected[elem.name] : undefined}
                                onChange={(flowName) => handleSelect({flowName: flowName, mappingName: elem.name})}
                                placeholder="Select Flow"
                                defaultActiveFirstOption={false}
                                disabled={!props.canWriteFlow}
                                data-testid={`${elem.name}-flowsList`}
                                getPopupContainer={() => document.getElementById("entityTilesContainer") || document.body}
                              >
                                {
                                  props.flows && props.flows.length > 0 ?
                                    props.flows.map((f, i) => (
                                      <Option aria-label={`${f.name}-option`} value={f.name} key={i}>{f.name}</Option>
                                    ))
                                    :
                                    null
                                }
                              </Select>
                            </div></Tooltip>
                            :
                            null
                        }
                      </div>
                    </div>
                  </Card>
                </div>
              </Col>
            ))
            : <span></span>
        }
      </Row>
      {deleteConfirmation}
      {addConfirmation}
      {runNoFlowsConfirmation}
      {runOneFlowConfirmation}
      {runMultFlowsConfirmation}
      <Steps
        // Basic Settings
        isEditing={mappingOptions.isEditing}
        createStep={createMappingArtifact}
        stepData={mapData}
        canReadOnly={props.canReadOnly}
        canReadWrite={props.canReadWrite}
        canWrite={props.canReadWrite}
        // Advanced Settings
        tooltipsData={AdvMapTooltips}
        openStepSettings={mappingOptions.openStepSettings}
        setOpenStepSettings={setOpenStepSettings}
        updateStep={updateMappingArtifact}
        activityType={StepType.Mapping}
        targetEntityType={props.entityModel.entityTypeId}
        targetEntityName={props.entityModel.entityName}
        openStepDetails={openStepDetails}
      />
    </div>
  );

};

export default MappingCard;
