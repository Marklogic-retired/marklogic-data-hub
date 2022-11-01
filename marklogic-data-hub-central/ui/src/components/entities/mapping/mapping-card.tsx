import {AdvMapTooltips, RunToolTips, SecurityTooltips} from "@config/tooltips.config";
import {Col, Modal, Row} from "react-bootstrap";
import {HCButton, HCCard, HCDivider, HCModal, HCTooltip} from "@components/common";
import {Link, useHistory} from "react-router-dom";
import {PlayCircleFill, PlusCircleFill} from "react-bootstrap-icons";
import React, {useContext, useEffect, useState} from "react";
import Select, {components as SelectComponents} from "react-select";
import {convertDateFromISO, extractCollectionFromSrcQuery, getInitialChars} from "@util/conversionFunctions";
import {faCog, faPencilAlt} from "@fortawesome/free-solid-svg-icons";
import {getViewSettings, setViewSettings} from "@util/user-context";

import {CurationContext} from "@util/curation-context";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {StepType} from "../../../types/curation-types";
import Steps from "../../steps/steps";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import styles from "./mapping-card.module.scss";

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
  const {setActiveStep} = useContext(CurationContext);
  const [mapData, setMapData] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [addExistingStepDialogVisible, setAddExistingStepDialogVisible] = useState(false);
  const [runNoFlowsDialogVisible, setRunNoFlowsDialogVisible] = useState(false);
  const [runOneFlowDialogVisible, setRunOneFlowDialogVisible] = useState(false);
  const [runMultFlowsDialogVisible, setRunMultFlowsDialogVisible] = useState(false);
  const [flowsWithStep, setFlowsWithStep] = useState<any[]>([]);
  const [mappingArtifactName, setMappingArtifactName] = useState("");
  const [flowName, setFlowName] = useState("");
  const [showLinks, setShowLinks] = useState("");
  const [selected, setSelected] = useState({}); // track Add Step selections so we can reset on cancel
  const [selectVisible, setSelectVisible] = useState(false);

  const [openStepSettings, setOpenStepSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  //To navigate to bench view with parameters
  let history = useHistory();

  useEffect(() => {
    //open step details when create step is called successfully
    if (props.openStep !== "") {
      openStepDetails(props.openStep?.name);
    }
  }, [props.data]);

  const OpenAddNew = () => {
    setIsEditing(false);
    setOpenStepSettings(true);
  };

  const OpenStepSettings = async (index) => {
    setMapData(prevState => ({...prevState, ...props.data[index]}));
    setIsEditing(true);
    setOpenStepSettings(true);
  };

  const createMappingArtifact = async (payload) => {
    // Update local form state, then save to db
    setMapData(prevState => ({...prevState, ...payload}));
    return await props.createMappingArtifact(payload);
  };

  const updateMappingArtifact = async (payload) => {
    // Update local form state
    setMapData(prevState => ({...prevState, ...payload}));
    return await props.updateMappingArtifact(payload);
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
    setAddExistingStepDialogVisible(false);
    setRunNoFlowsDialogVisible(false);
    setRunOneFlowDialogVisible(false);
    setRunMultFlowsDialogVisible(false);
    setSelected({}); // reset menus on cancel
  };

  function handleMouseOver(e, name) {
    // Handle all possible events from mouseover of card body
    setSelectVisible(true);
    if (typeof e.target.className === "string" &&
      (e.target.className === "card-body" ||
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
  }

  const deleteConfirmation = <HCModal
    show={dialogVisible}
    onHide={onCancel}
  >
    <Modal.Header className={"bb-none"}>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
    </Modal.Header>
    <Modal.Body className={"pt-0 pb-4"}>
      <span style={{fontSize: "16px"}}>Are you sure you want to delete the <strong>{mappingArtifactName}</strong> step?</span>
      <div className={"d-flex justify-content-center pt-4 pb-2"}>
        <HCButton className={"me-2"} variant="outline-light" aria-label={"No"} onClick={onCancel}>
          {"No"}
        </HCButton>
        <HCButton aria-label={"Yes"} variant="primary" type="submit" onClick={() => onOk(mappingArtifactName)}>
          {"Yes"}
        </HCButton>
      </div>
    </Modal.Body>
  </HCModal>;

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
    let result: string[] = [];
    if (props.flows) props.flows.forEach(f => f["steps"].findIndex(s => s.stepName === mappingName) > -1 ? result.push(f.name) : "");
    return result;
  };

  const handleStepAdd = (mappingName, flowName) => {
    setMappingArtifactName(mappingName);
    setFlowName(flowName);
    if (isStepInFlow(mappingName, flowName)) {
      setAddExistingStepDialogVisible(true);
    } else {
      setAddDialogVisible(true);
    }
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

  const onConfirmOk = () => {
    setAddExistingStepDialogVisible(false);
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
    <HCModal
      show={addDialogVisible}
      onHide={onCancel}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0 pb-4 text-center"}>
        <div aria-label="add-step-confirmation" style={{fontSize: "16px"}}>
          {
            <p aria-label="step-not-in-flow">Are you sure you want to add the step <strong>{mappingArtifactName}</strong> to the flow <strong>{flowName}</strong>?</p>
          }
        </div>
        <div className={"d-flex justify-content-center pt-4 pb-2"}>
          <HCButton className={"me-2"} variant="outline-light" aria-label={"No"} onClick={onCancel}>
            {"No"}
          </HCButton>
          <HCButton data-testid={`${mappingArtifactName}-to-${flowName}-Confirm`} aria-label={"Yes"} variant="primary" type="submit" onClick={() => onAddOk(mappingArtifactName, flowName)}>
            {"Yes"}
          </HCButton>
        </div>
      </Modal.Body>
    </HCModal>
  );

  const addExistingStepConfirmation = (
    <HCModal
      show={addExistingStepDialogVisible}
      onHide={onConfirmOk}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body className={"text-center pt-0 pb-4"}>
        <div className={`mb-4`} style={{fontSize: "16px"}}>
          {
            <p aria-label="step-in-flow">The step <strong>{mappingArtifactName}</strong> is already in the flow <strong>{flowName}</strong>.</p>
          }
        </div>
        <div>
          <HCButton variant="primary" data-testid={`${mappingArtifactName}-to-${flowName}-Exists-Confirm`} aria-label={"Ok"} type="submit" className={"me-2"} onClick={onConfirmOk}>
            OK
          </HCButton>
        </div>
      </Modal.Body>
    </HCModal>
  );


  const runNoFlowsConfirmation = (
    <HCModal
      show={runNoFlowsDialogVisible}
      size={"lg"}
      onHide={onCancel}
    >
      <Modal.Header className={"bb-none"}>
        <div aria-label="step-in-no-flows-confirmation" style={{fontSize: "16px"}}>Choose the flow in which to add and run the step <strong>{mappingArtifactName}</strong>.</div>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body className={"pb-2"}>
        <Row>
          <Col>
            <div>{props.flows.length > 0 && props.flows.map((flow, i) => (
              <p className={styles.stepLink} data-testid={`${flow.name}-run-step`} key={i} onClick={() => handleAddRun(flow.name)}>{flow.name}</p>
            ))}</div>
          </Col>
          <Col xs={"auto"}>
            <HCDivider type="vertical" className={styles.verticalDiv}></HCDivider>
          </Col>
          <Col>
            <Link data-testid="link" id="tiles-add-run-new-flow" to={
              {
                pathname: "/tiles/run/add-run",
                state: {
                  stepToAdd: mappingArtifactName,
                  stepDefinitionType: "mapping",
                  targetEntityType: props.entityModel.entityTypeId,
                  existingFlow: false
                }
              }}><div className={styles.stepLink} data-testid={`${mappingArtifactName}-run-toNewFlow`}><PlusCircleFill className={styles.plusIconNewFlow}/>New flow</div></Link>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <HCButton variant="outline-light" aria-label={"Cancel"} onClick={onCancel}>
          Cancel
        </HCButton>
      </Modal.Footer>
    </HCModal>
  );

  const runOneFlowConfirmation = (
    <HCModal
      show={runOneFlowDialogVisible}
      onHide={onCancel}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0"}>
        <div aria-label="run-step-one-flow-confirmation" style={{fontSize: "16px"}}>
          <div>
            <div aria-label="step-in-one-flow">Running the step <strong>{mappingArtifactName}</strong> in the flow <strong>{flowsWithStep}</strong></div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <HCButton variant="outline-light" aria-label={"Cancel"} className={"me-2"} onClick={onCancel}>
          Cancel
        </HCButton>
        <HCButton aria-label={"continue-confirm"} variant="primary" type="submit" onClick={onContinueRun}>
          Continue
        </HCButton>
      </Modal.Footer>
    </HCModal>
  );

  const runMultFlowsConfirmation = (
    <HCModal
      show={runMultFlowsDialogVisible}
      onHide={onCancel}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0"}>
        <div aria-label="run-step-mult-flows-confirmation" style={{fontSize: "16px"}}>
          <div aria-label="step-in-mult-flows">Choose the flow in which to run the step <strong>{mappingArtifactName}</strong>.</div>
          <div className={styles.flowSelectGrid}>{flowsWithStep.map((flowName, i) => (
            <Link data-testid="link" id="tiles-run-step" key={i} to={
              {
                pathname: "/tiles/run/run-step",
                state: {
                  flowName: flowName,
                  stepToAdd: mappingArtifactName,
                  stepDefinitionType: "mapping",
                  targetEntityType: props.entityModel.entityTypeId,
                  existingFlow: false,
                  flowsDefaultKey: [props.flows.findIndex(el => el.name === flowName)],
                }
              }}><p className={styles.stepLink} data-testid={`${flowName}-run-step`}>{flowName}</p></Link>
          ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <HCButton variant="outline-light" aria-label={"Cancel"} onClick={onCancel}>
          Cancel
        </HCButton>
      </Modal.Footer>
    </HCModal>
  );

  const flowOptions = props.flows?.length > 0 ? props.flows.map((f, i) => ({value: f.name, label: f.name})) : {};

  const MenuList  = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  return (
    <div className={styles.loadContainer}>
      <Row>
        {props.canReadWrite ?<Col xs={"auto"}>
          <HCCard
            className={styles.addNewCard}>
            <div><PlusCircleFill aria-label="icon: plus-circle" className={styles.plusIcon} onClick={OpenAddNew}/></div>
            <br />
            <p className={styles.addNewContent}>Add New</p>
          </HCCard>
        </Col> : <Col xs={"auto"}>
          <HCTooltip id="curate-tooltip" text={"Curate: "+SecurityTooltips.missingPermission} placement="bottom" className={styles.tooltipOverlay}><HCCard
            className={styles.addNewCardDisabled}>
            <div aria-label="add-new-card-disabled"><PlusCircleFill className={styles.plusIconDisabled}/></div>
            <br />
            <p className={styles.addNewContent}>Add New</p>
          </HCCard></HCTooltip>
        </Col>}
        {
          props.data && props.data.length > 0 ?
            props.data.map((elem, index) => (
              <Col xs={"auto"} key={index}>
                <div
                  data-testid={`${props.entityTypeTitle}-${elem.name}-step`}
                  onMouseOver={(e) => handleMouseOver(e, elem.name)}
                  onMouseLeave={(e) => handleMouseLeave()}
                >
                  <HCCard
                    actions={[
                      <HCTooltip id="details-tooltip" text={"Step Details"} placement="bottom"><i className={styles.stepDetails}><FontAwesomeIcon icon={faPencilAlt} onClick={() => openMapStepDetails(elem.name, index)} data-testid={`${elem.name}-stepDetails`} /></i></HCTooltip>,
                      <HCTooltip id="settings-tooltip" text={"Step Settings"} placement="bottom"><i className={styles.editIcon} role="edit-mapping button" key="last"><FontAwesomeIcon icon={faCog} data-testid={elem.name + "-edit"} onClick={() => OpenStepSettings(index)} /></i></HCTooltip>,
                      props.canReadWrite ? <HCTooltip id="run-tooltip" text={RunToolTips.runStep} placement="bottom"><i aria-label="icon:run"><PlayCircleFill className={styles.runIcon} data-testid={elem.name + "-run"} onClick={() => handleStepRun(elem.name)} /></i></HCTooltip> : <HCTooltip id="run-disabled-tooltip" text={"Run: " + SecurityTooltips.missingPermission} placement="bottom" className={styles.tooltipOverlay}><i aria-label="icon: run"><PlayCircleFill className={styles.disabledRunIcon} role="disabled-run-mapping button" data-testid={elem.name + "-disabled-run"} onClick={(event) => event.preventDefault()}/></i></HCTooltip>,
                      props.canReadWrite ? <HCTooltip id="delete-tooltip" text={"Delete"} placement="bottom"><i key="last" role="delete-mapping button" data-testid={elem.name + "-delete"} onClick={() => handleCardDelete(elem.name)}><FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg" /></i></HCTooltip> : <HCTooltip id="delete-disabled-tooltip" text={"Delete: " + SecurityTooltips.missingPermission} placement="bottom" className={styles.tooltipOverlay}><i role="disabled-delete-mapping button" data-testid={elem.name + "-disabled-delete"} onClick={(event) => event.preventDefault()}><FontAwesomeIcon icon={faTrashAlt} className={styles.disabledIcon} size="lg" /></i></HCTooltip>,
                    ]}
                    className={styles.cardStyle}
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
                            <HCTooltip id={`${elem.name}curate-disabled-tooltip`} show={props?.canWriteFlow ? !props?.canWriteFlow: undefined} text={"Curate: " + SecurityTooltips.missingPermission} placement={"bottom"} ><div className={styles.cardLinkSelect}>
                              <Select
                                id={`${elem.name}-flowsList-select-wrapper`}
                                inputId={`${elem.name}-flowsList`}
                                components={{MenuList: props => MenuList(`${elem.name}-flowsList`, props)}}
                                placeholder="Select Flow"
                                value={Object.keys(flowOptions).length > 0 ? flowOptions.find(oItem => oItem.value === selected[elem.name]) : undefined}
                                onChange={(option) => handleSelect({flowName: option.value, mappingName: elem.name})}
                                isSearchable={false}
                                isDisabled={!props.canWriteFlow}
                                aria-label={`${elem.name}-flowsList`}
                                options={flowOptions}
                                styles={reactSelectThemeConfig}
                                formatOptionLabel={({value, label}) => {
                                  return (
                                    <span aria-label={`${value}-option`}>
                                      {label}
                                    </span>
                                  );
                                }}
                              />
                            </div></HCTooltip>
                            :
                            null
                        }
                      </div>
                    </div>
                  </HCCard>
                </div>
              </Col>
            ))
            : <span></span>
        }
      </Row>
      {deleteConfirmation}
      {addConfirmation}
      {addExistingStepConfirmation}
      {runNoFlowsConfirmation}
      {runOneFlowConfirmation}
      {runMultFlowsConfirmation}
      <Steps
        // Basic Settings
        isEditing={isEditing}
        createStep={createMappingArtifact}
        stepData={mapData}
        canReadOnly={props.canReadOnly}
        canReadWrite={props.canReadWrite}
        canWrite={props.canReadWrite}
        // Advanced Settings
        tooltipsData={AdvMapTooltips}
        openStepSettings={openStepSettings}
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
