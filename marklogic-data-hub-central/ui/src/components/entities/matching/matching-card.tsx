import React, {useState, useContext} from "react";
import {Link, useHistory} from "react-router-dom";
import {Row, Col, Modal} from "react-bootstrap";
import Select, {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faCog} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import styles from "./matching-card.module.scss";
import ConfirmationModal from "../../confirmation-modal/confirmation-modal";
import {CurationContext} from "@util/curation-context";
import {convertDateFromISO, getInitialChars, extractCollectionFromSrcQuery} from "@util/conversionFunctions";
import {AdvMapTooltips, SecurityTooltips, RunToolTips} from "@config/tooltips.config";
import {ConfirmationType} from "../../../types/common-types";
import {MatchingStep, StepType} from "../../../types/curation-types";
import {getViewSettings, setViewSettings} from "@util/user-context";
import Steps from "../../steps/steps";
import {PlayCircleFill, PlusCircleFill} from "react-bootstrap-icons";
import {HCCard, HCDivider, HCTooltip, HCButton, HCModal} from "@components/common";

interface Props {
  matchingStepsArray: MatchingStep[];
  flows: any;
  entityName: any;
  entityModel: any;
  canReadMatchMerge: boolean;
  canWriteMatchMerge: boolean;
  deleteMatchingArtifact: (matchName) => void;
  createMatchingArtifact: (matchingObj) => void;
  updateMatchingArtifact: (matchingObj) => void;
  addStepToFlow: any;
  addStepToNew: any;
  canWriteFlow: any;
}

const MatchingCard: React.FC<Props> = (props) => {
  const storage = getViewSettings();

  const history = useHistory<any>();
  const {setActiveStep} = useContext(CurationContext);
  const [selected, setSelected] = useState({}); // track Add Step selections so we can reset on cancel
  const [selectVisible, setSelectVisible] = useState(false);
  const [showLinks, setShowLinks] = useState("");

  const [editStepArtifact, setEditStepArtifact] = useState({});
  const [addToFlowVisible, setAddToFlowVisible] = useState(false);
  const [addExistingStepDialogVisible, setAddExistingStepDialogVisible] = useState(false);
  const [matchingArtifactName, setMatchingArtifactName] = useState("");
  const [flowName, setFlowName] = useState("");

  const [runNoFlowsDialogVisible, setRunNoFlowsDialogVisible] = useState(false);
  const [runOneFlowDialogVisible, setRunOneFlowDialogVisible] = useState(false);
  const [runMultFlowsDialogVisible, setRunMultFlowsDialogVisible] = useState(false);
  const [flowsWithStep, setFlowsWithStep] = useState<any[]>([]);

  const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.AddStepToFlow);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [confirmBoldTextArray, setConfirmBoldTextArray] = useState<string[]>([]);

  const [openStepSettings, setOpenStepSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [tooltipVisible, setTooltipVisible] = useState(false);

  const OpenAddNew = () => {
    setIsEditing(false);
    setOpenStepSettings(true);
  };

  const OpenStepSettings = (index) => {
    setIsEditing(true);
    setEditStepArtifact(props.matchingStepsArray[index]);
    setOpenStepSettings(true);
  };

  const createMatchingArtifact = async (payload) => {
    // Update local form state, then save to db
    setEditStepArtifact(payload);
    props.createMatchingArtifact(payload);
  };

  const updateMatchingArtifact = async (payload) => {
    // Update local form state
    setEditStepArtifact(payload);
    props.updateMatchingArtifact(payload);
  };

  const deleteStepClicked = (name) => {
    toggleConfirmModal(true);
    setConfirmType(ConfirmationType.DeleteStep);
    setConfirmBoldTextArray([name]);
  };

  function handleMouseOver(e, name) {
    // Handle all possible events from mouseover of card body
    setSelectVisible(true);
    setTooltipVisible(true);
    if (typeof e.target.className === "string" &&
      (e.target.className === "card-body" ||
        e.target.className.startsWith("matching-card_cardContainer") ||
        e.target.className.startsWith("matching-card_formatFileContainer") ||
        e.target.className.startsWith("matching-card_sourceQuery") ||
        e.target.className.startsWith("matching-card_lastUpdatedStyle"))
    ) {
      setShowLinks(name);
    }
  }
  function handleMouseLeave() {
    setShowLinks("");
    setSelectVisible(false);
    setTooltipVisible(false);
  }

  function handleSelect(obj) {
    let selectedNew = {...selected};
    selectedNew[obj.loadName] = obj.flowName;
    setSelected(selectedNew);
    handleStepAdd(obj.matchingName, obj.flowName);
  }

  const countStepInFlow = (matchingName) => {
    let result : string[] = [];
    if (props.flows) props.flows.forEach(f => f["steps"].findIndex(s => s.stepName === matchingName) > -1 ? result.push(f.name) : "");
    return result;
  };

  const handleStepAdd = (matchingName, flowName) => {
    setMatchingArtifactName(matchingName);
    setFlowName(flowName);
    if (isStepInFlow(matchingName, flowName)) {
      setAddExistingStepDialogVisible(true);
    } else {
      setAddToFlowVisible(true);
    }
  };

  const handleStepRun = (matchingName) => {
    setMatchingArtifactName(matchingName);
    let stepInFlows = countStepInFlow(matchingName);
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
    await props.addStepToFlow(matchingArtifactName, flowName, "matching");
    setRunNoFlowsDialogVisible(false);

    history.push({
      pathname: "/tiles/run/add-run",
      state: {
        flowName: flowName,
        flowsDefaultKey: [props.flows.findIndex(el => el.name === flowName)],
        existingFlow: true,
        addFlowDirty: true,
        stepToAdd: matchingArtifactName,
        stepDefinitionType: "matching"
      }
    });
  };

  const onContinueRun = () => {
    history.push({
      pathname: "/tiles/run/run-step",
      state: {
        flowName: flowsWithStep[0],
        stepToAdd: matchingArtifactName,
        stepDefinitionType: "matching",
        existingFlow: false,
        flowsDefaultKey: [props.flows.findIndex(el => el.name === flowsWithStep[0])],
      }
    });
  };

  const onAddOk = async (lName, fName) => {
    await props.addStepToFlow(lName, fName, "matching");
    setAddToFlowVisible(false);
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

  const onConfirmOk = () => {
    setAddExistingStepDialogVisible(false);
  };

  const onAddCancel = () => {
    setAddToFlowVisible(false);
    setRunNoFlowsDialogVisible(false);
    setRunOneFlowDialogVisible(false);
    setRunMultFlowsDialogVisible(false);
    setSelected({});
  };

  const isStepInFlow = (matchingStepName, flowName) => {
    let result = false, flow;
    if (props.flows) flow = props.flows.find(f => f.name === flowName);
    if (flow) result = flow["steps"].findIndex(s => s.stepName === matchingStepName) > -1;
    return result;
  };

  const confirmAction = () => {
    if (confirmType === ConfirmationType.AddStepToFlow) {
      // TODO add step to new flow
    } else if (confirmType === ConfirmationType.DeleteStep) {
      props.deleteMatchingArtifact(confirmBoldTextArray[0]);
      toggleConfirmModal(false);
    }
  };

  const openStepDetails = (matchingStep: MatchingStep) => {
    const stepArtifact = matchingStep;
    const modelDefinition = props.entityModel["model"]["definitions"];
    const entityType = props.entityName;

    setActiveStep(stepArtifact, modelDefinition, entityType);
    setViewSettings({
      ...storage,
      curate: {
        stepArtifact,
        modelDefinition,
        entityType
      }
    });
    history.push({pathname: "/tiles/curate/match"});
  };

  const renderAddConfirmation = (
    <HCModal
      show={addToFlowVisible}
      onHide={onAddCancel}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onAddCancel}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0 pb-4 text-center"}>
        <div aria-label="add-step-confirmation" style={{fontSize: "16px"}}>
          { isStepInFlow(matchingArtifactName, flowName) ?
            <p aria-label="step-in-flow">The step <strong>{matchingArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance of the step?</p> :
            <p aria-label="step-not-in-flow">Are you sure you want to add the step <strong>{matchingArtifactName}</strong> to the flow <strong>{flowName}</strong>?</p>
          }
        </div>
        <div className={"d-flex justify-content-center pt-3 pb-2"}>
          <HCButton className={"me-2"} variant="outline-light" aria-label={"No"} onClick={onAddCancel}>
            {"No"}
          </HCButton>
          <HCButton aria-label={"Yes"} data-testid={`${matchingArtifactName}-to-${flowName}-Confirm`} variant="primary" type="submit" onClick={() => onAddOk(matchingArtifactName, flowName)}>
            {"Yes"}
          </HCButton>
        </div>
      </Modal.Body>
    </HCModal>
  );

  const addExistingStepConfirmation = (
    <HCModal
      show={addExistingStepDialogVisible}
      onHide={onAddCancel}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onAddCancel}></button>
      </Modal.Header>
      <Modal.Body className={"text-center pt-0 pb-4"}>
        <div className={`mb-4`} style={{fontSize: "16px"}}>
          {
            <p aria-label="step-in-flow">The step <strong>{matchingArtifactName}</strong> is already in the flow <strong>{flowName}</strong>.</p>
          }
        </div>
        <div>
          <HCButton variant="primary" aria-label={"Ok"} type="submit" className={"me-2"} onClick={onConfirmOk}>
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
      onHide={onAddCancel}
    >
      <Modal.Header className={"bb-none"}>
        <div aria-label="step-in-no-flows-confirmation" style={{fontSize: "16px"}}>Choose the flow in which to add and run the step <strong>{matchingArtifactName}</strong>.</div>
        <button type="button" className="btn-close" aria-label="Close" onClick={onAddCancel}></button>
      </Modal.Header>
      <Modal.Body className={"pb-2"}>
        <Row>
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
                  stepToAdd: matchingArtifactName,
                  stepDefinitionType: "matching",
                  existingFlow: false
                }}}><div className={styles.stepLink} data-testid={`${matchingArtifactName}-run-toNewFlow`}><PlusCircleFill className={styles.plusIconNewFlow}/>New flow</div></Link>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <HCButton variant="outline-light" aria-label={"Cancel"} onClick={onAddCancel}>
          Cancel
        </HCButton>
      </Modal.Footer>
    </HCModal>
  );

  const runOneFlowConfirmation = (
    <HCModal
      show={runOneFlowDialogVisible}
      onHide={onAddCancel}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onAddCancel}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0"}>
        <div aria-label="run-step-one-flow-confirmation" style={{fontSize: "16px", padding: "10px"}}>
          <div>
            <div aria-label="step-in-one-flow">Running the step <strong>{matchingArtifactName}</strong> in the flow <strong>{flowsWithStep}</strong></div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <HCButton variant="outline-light" aria-label={"Cancel"} className={"me-2"} onClick={onAddCancel}>
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
      onHide={onAddCancel}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onAddCancel}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0"}>
        <div aria-label="run-step-mult-flows-confirmation" style={{fontSize: "16px", padding: "10px"}}>
          <div aria-label="step-in-mult-flows">Choose the flow in which to run the step <strong>{matchingArtifactName}</strong>.</div>
          <div className = {styles.flowSelectGrid}>{flowsWithStep.map((flowName, i) => (
            <Link data-testid="link" id="tiles-run-step" key={i} to={
              {pathname: "/tiles/run/run-step",
                state: {
                  flowName: flowName,
                  stepToAdd: matchingArtifactName,
                  stepDefinitionType: "matching",
                  existingFlow: false,
                  flowsDefaultKey: [props.flows.findIndex(el => el.name === flowName)],
                }}}><p className={styles.stepLink} data-testid={`${flowName}-run-step`}>{flowName}</p></Link>
          ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <HCButton variant="outline-light" aria-label={"Cancel"} onClick={onAddCancel}>
          Cancel
        </HCButton>
      </Modal.Footer>
    </HCModal>
  );

  const renderCardActions = (step, index) => {
    return [
      <HCTooltip id="step-details-tooltip" text={"Step Details"} placement="bottom">
        <i className={styles.stepDetails}>
          <FontAwesomeIcon icon={faPencilAlt} data-testid={`${step.name}-stepDetails`} onClick={() => openStepDetails(step)}/>
        </i>
      </HCTooltip>,
      <HCTooltip id="step-settings-tooltip" text={"Step Settings"} placement="bottom">
        <i className={styles.editIcon} key ="last" role="edit-merging button">
          <FontAwesomeIcon icon={faCog} data-testid={step.name+"-edit"} onClick={() => OpenStepSettings(index)}/>
        </i>
      </HCTooltip>,

      props.canWriteMatchMerge ? (
        <HCTooltip id="run-tooltip" text={RunToolTips.runStep} placement="bottom">
          <i aria-label="icon: run">
            <PlayCircleFill className={styles.runIcon} data-testid={step.name+"-run"} onClick={() => handleStepRun(step.name)}/>
          </i>
        </HCTooltip>
      ) : (
        <HCTooltip id="run-disabled-tooltip" text={"Run: " + SecurityTooltips.missingPermission} placement="bottom" className={styles.tooltipOverlay}>
          <i aria-label="icon: run">
            <PlayCircleFill className={styles.disabledRunIcon} role="disabled-run-matching button" data-testid={step.name+"-disabled-run"} onClick={(event) => event.preventDefault()}/>
          </i>
        </HCTooltip>
      ),

      props.canWriteMatchMerge ? (
        <HCTooltip id="delete-tooltip" text={"Delete"} placement="bottom">
          <i key ="last" role="delete-merging button" data-testid={step.name+"-delete"} onClick={() => deleteStepClicked(step.name)}>
            <FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg"/>
          </i>
        </HCTooltip>
      ) : (
        <HCTooltip id="delete-disabled-tooltip" text={"Delete: " + SecurityTooltips.missingPermission} placement="bottom" className={styles.tooltipOverlay}>
          <i className={styles.deleteIcon} role="disabled-delete-merging button" data-testid={step.name+"-disabled-delete"} onClick={(event) => event.preventDefault()}>
            <FontAwesomeIcon icon={faTrashAlt} className={styles.disabledDeleteIcon} size="lg"/>
          </i>
        </HCTooltip>
      ),
    ];
  };

  const flowOptions = props.flows?.length > 0 ? props.flows.map((f, i) => ({value: f.name, label: f.name})) : {};

  const MenuList  = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  return (
    <div className={styles.matchContainer}>
      <Row>
        {props.canWriteMatchMerge ? (
          <Col xs={"auto"}>
            <HCCard
              className={styles.addNewCard}>
              <div><PlusCircleFill aria-label="icon: plus-circle" className={styles.plusIcon} onClick={OpenAddNew}/></div>
              <br/>
              <p className={styles.addNewContent}>Add New</p>
            </HCCard>
          </Col>
        ) : <Col xs={"auto"}>
          <HCTooltip id="curate-disabled-tooltip" text={"Curate: "+SecurityTooltips.missingPermission} placement="bottom" className={styles.tooltipOverlay}><HCCard
            className={styles.addNewCardDisabled}>
            <div aria-label="add-new-card-disabled"><PlusCircleFill aria-label="icon: plus-circle" className={styles.plusIconDisabled}/></div>
            <br/>
            <p className={styles.addNewContent}>Add New</p>
          </HCCard></HCTooltip>
        </Col>}
        {props.matchingStepsArray.length > 0 ? (
          props.matchingStepsArray.map((step, index) => (
            <Col xs={"auto"} key={index}>
              <div
                data-testid={`${props.entityName}-${step.name}-step`}
                onMouseOver={(e) => handleMouseOver(e, step.name)}
                onMouseLeave={(e) => handleMouseLeave()}
              >
                <HCCard
                  className={styles.cardStyle}
                  actions={renderCardActions(step, index)}
                >
                  <div className={styles.formatFileContainer}>
                    <span aria-label={`${step.name}-step-label`} className={styles.mapNameStyle}>{getInitialChars(step.name, 27, "...")}</span>
                  </div>
                  <br />
                  {step.selectedSource === "collection" ? (
                    <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(step.sourceQuery)}</div>
                  ) : (
                    <div className={styles.sourceQuery}>Source Query: {getInitialChars(step.sourceQuery, 30, "...")}</div>
                  )}
                  <br /><br />
                  <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(step.lastUpdated)}</p>
                  <div className={styles.cardLinks} style={{display: showLinks === step.name ? "block" : "none"}}>
                    {props.canWriteMatchMerge ? (
                      <Link
                        id="tiles-run-add"
                        to={{
                          pathname: "/tiles/run/add",
                          state: {
                            stepToAdd: step.name,
                            stepDefinitionType: "matching"
                          }}}
                      >
                        <div className={styles.cardLink} data-testid={`${step.name}-toNewFlow`}> Add step to a new flow</div>
                      </Link>
                    ) : <div className={styles.cardDisabledLink} data-testid={`${step.name}-disabledToNewFlow`}> Add step to a new flow</div>
                    }
                    <div className={styles.cardNonLink} data-testid={`${step.name}-toExistingFlow`}>
                    Add step to an existing flow
                      {selectVisible ? (
                        <HCTooltip text={"Curate: "+SecurityTooltips.missingPermission} id="add-matching-step-to-flow-tooltip" placement={"top"} show={tooltipVisible && !props.canWriteMatchMerge}><div className={styles.cardLinkSelect}>
                          <Select
                            id={`${step.name}-flowsList-select-wrapper`}
                            inputId={`${step.name}-flowsList`}
                            components={{MenuList: props => MenuList(`${step.name}-flowsList`, props)}}
                            placeholder="Select Flow"
                            value={Object.keys(flowOptions).length > 0 ? flowOptions.find(oItem => oItem.value === selected[step.name]) : undefined}
                            onChange={(option) => handleSelect({flowName: option.value, matchingName: step.name})}
                            isSearchable={false}
                            isDisabled={!props.canWriteFlow}
                            aria-label={`${step.name}-flowsList`}
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
                      ) : null}
                    </div>
                  </div>
                </HCCard>
              </div>
            </Col>
          ))
        ) : null}
      </Row>
      <ConfirmationModal
        isVisible={showConfirmModal}
        type={confirmType}
        boldTextArray={confirmBoldTextArray}
        toggleModal={toggleConfirmModal}
        confirmAction={confirmAction}
      />
      <Steps
        // Basic Settings
        isEditing={isEditing}
        createStep={createMatchingArtifact}
        stepData={editStepArtifact}
        canReadOnly={props.canReadMatchMerge}
        canReadWrite={props.canWriteMatchMerge}
        canWrite={props.canWriteMatchMerge}
        // Advanced Settings
        tooltipsData={AdvMapTooltips}
        openStepSettings={openStepSettings}
        setOpenStepSettings={setOpenStepSettings}
        updateStep={updateMatchingArtifact}
        activityType={StepType.Matching}
        targetEntityType={props.entityModel.entityTypeId}
        targetEntityName={props.entityModel.entityName}
      />
      {renderAddConfirmation}
      {addExistingStepConfirmation}
      {runNoFlowsConfirmation}
      {runOneFlowConfirmation}
      {runMultFlowsConfirmation}
    </div>
  );
};

export default MatchingCard;
