import React, {useState, useContext} from "react";
import {Link, useHistory} from "react-router-dom";
import {Card, Icon, Row, Col, Select, Dropdown, Menu, Modal} from "antd";
import {MLTooltip} from "@marklogic/design-system";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faCog} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import styles from "./matching-card.module.scss";

import ConfirmationModal from "../../confirmation-modal/confirmation-modal";

import {CurationContext} from "../../../util/curation-context";
import {convertDateFromISO, getInitialChars, extractCollectionFromSrcQuery} from "../../../util/conversionFunctions";
import {AdvMapTooltips, SecurityTooltips} from "../../../config/tooltips.config";
import {ConfirmationType} from "../../../types/common-types";
import {MatchingStep, StepType} from "../../../types/curation-types";
import Steps from "../../steps/steps";

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

const {Option} = Select;

const MatchingCard: React.FC<Props> = (props) => {
  const history = useHistory<any>();
  const {setActiveStep} = useContext(CurationContext);
  const [selected, setSelected] = useState({}); // track Add Step selections so we can reset on cancel
  const [selectVisible, setSelectVisible] = useState(false);
  const [showLinks, setShowLinks] = useState("");

  const [editStepArtifact, setEditStepArtifact] = useState({});
  const [addToFlowVisible, setAddToFlowVisible] = useState(false);
  const [matchingArtifactName, setMatchingArtifactName] = useState("");
  const [flowName, setFlowName] = useState("");
  const [addRun, setAddRun] = useState(false);

  const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.AddStepToFlow);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [confirmBoldTextArray, setConfirmBoldTextArray] = useState<string[]>([]);

  const [openStepSettings, setOpenStepSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const tooltipOverlayStyle={maxWidth: "200"};
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
      (e.target.className === "ant-card-body" ||
        e.target.className.startsWith("merging-card_cardContainer") ||
        e.target.className.startsWith("merging-card_formatFileContainer") ||
        e.target.className.startsWith("merging-card_sourceQuery") ||
        e.target.className.startsWith("merging-card_lastUpdatedStyle"))
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

  function handleSelectAddRun(obj) {
    let selectedNew = {...selected};
    selectedNew[obj.loadName] = obj.flowName;
    setSelected(selectedNew);
    setAddRun(true);
    handleStepAdd(obj.matchingName, obj.flowName);
  }

  const handleStepAdd = (matchingName, flowName) => {
    setMatchingArtifactName(matchingName);
    setFlowName(flowName);
    setAddToFlowVisible(true);
  };

  const onAddOk = async (lName, fName) => {
    await props.addStepToFlow(lName, fName, "matching");
    setAddToFlowVisible(false);

    if (addRun) {
      history.push({
        pathname: "/tiles/run/add-run",
        state: {
          flowName: fName,
          flowsDefaultKey: [props.flows.findIndex(el => el.name === fName)],
          existingFlow: true,
          addFlowDirty: true,
          stepToAdd: matchingArtifactName,
          stepDefinitionType: "matching"
        }
      });
    } else {
      history.push({
        pathname: "/tiles/run/add",
        state: {
          flowName: fName,
          addFlowDirty: true,
          flowsDefaultKey: [props.flows.findIndex(el => el.name === fName)],
          existingFlow: true
        }
      });
    }
  };

  const onAddCancel = () => {
    setAddToFlowVisible(false);
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
    setActiveStep(matchingStep, props.entityModel["model"]["definitions"], props.entityName);
    history.push({pathname: "/tiles/curate/match"});
  };

  const renderAddConfirmation = (
    <Modal
      visible={addToFlowVisible}
      okText={<div data-testid={`${matchingArtifactName}-to-${flowName}-Confirm`}>Yes</div>}
      cancelText="No"
      onOk={() => onAddOk(matchingArtifactName, flowName)}
      onCancel={() => onAddCancel()}
      width={400}
      maskClosable={false}
    >
      <div aria-label="add-step-confirmation" style={{fontSize: "16px", padding: "10px"}}>
        { isStepInFlow(matchingArtifactName, flowName) ?
          !addRun ? <p aria-label="step-in-flow">The step <strong>{matchingArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance?</p> : <p aria-label="step-in-flow-run">The step <strong>{matchingArtifactName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance and run it?</p>
          : !addRun ? <p aria-label="step-not-in-flow">Are you sure you want to add the step <strong>{matchingArtifactName}</strong> to the flow <strong>{flowName}</strong>?</p> : <p aria-label="step-not-in-flow-run">Are you sure you want to add the step <strong>{matchingArtifactName}</strong> to the flow <strong>{flowName}</strong> and run it?</p>
        }
      </div>
    </Modal>
  );

  const renderRunFlowMenu = (name) => (
    <Menu style={{right: "80px"}}>
      <Menu.Item key="0">
        { <Link data-testid="link" id="tiles-add-run" to={
          {pathname: "/tiles/run/add-run",
            state: {
              stepToAdd: name,
              stepDefinitionType: "matching",
              targetEntityType: props.entityModel.entityTypeId,
              existingFlow: false
            }}}><div className={styles.stepLink} data-testid={`${name}-run-toNewFlow`}>Run step in a new flow</div></Link>}
      </Menu.Item>
      <Menu.Item key="1">
        <div className={styles.stepLinkExisting} data-testid={`${name}-run-toExistingFlow`}>Run step in an existing flow
          <div className={styles.stepLinkSelect} onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
            <Select
              style={{width: "100%"}}
              value={selected[name] ? selected[name] : undefined}
              onChange={(flowName) => handleSelectAddRun({flowName: flowName, matchingName: name})}
              placeholder="Select Flow"
              defaultActiveFirstOption={false}
              disabled={!props.canWriteFlow}
              data-testid={`${name}-run-flowsList`}
            >
              { props.flows && props.flows.length > 0 ? props.flows.map((f, i) => (
                <Option aria-label={`${f.name}-run-option`} value={f.name} key={i}>{f.name}</Option>
              )) : null}
            </Select>
          </div>
        </div>
      </Menu.Item>
    </Menu>
  );

  const renderCardActions = (step, index) => {
    return [
      <MLTooltip title={"Step Details"} placement="bottom">
        <i style={{fontSize: "16px", marginLeft: "-5px", marginRight: "5px"}}>
          <FontAwesomeIcon icon={faPencilAlt} data-testid={`${step.name}-stepDetails`} onClick={() => openStepDetails(step)}/>
        </i>
      </MLTooltip>,
      <MLTooltip title={"Step Settings"} placement="bottom">
        <i className={styles.editIcon} key ="last" role="edit-merging button">
          <FontAwesomeIcon icon={faCog} data-testid={step.name+"-edit"} onClick={() => OpenStepSettings(index)}/>
        </i>
      </MLTooltip>,

      <Dropdown
        data-testid={`${step.name}-dropdown`}
        overlay={renderRunFlowMenu(step.name)}
        trigger={["click"]}
        disabled = {!props.canWriteFlow}
      >
        {props.canWriteMatchMerge ? (
          <MLTooltip title={"Run"} placement="bottom">
            <i aria-label="icon: run">
              <Icon type="play-circle" theme="filled" className={styles.runIcon} data-testid={step.name+"-run"}/></i>
          </MLTooltip>
        ) : (
          <MLTooltip title={"Run: " + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: "200px"}}>
            <i role="disabled-run-matching button" data-testid={step.name+"-disabled-run"}>
              <Icon type="play-circle" theme="filled" onClick={(event) => event.preventDefault()} className={styles.disabledRunIcon}/></i>
          </MLTooltip>
        )}
      </Dropdown>,

      props.canWriteMatchMerge ? (
        <MLTooltip title={"Delete"} placement="bottom">
          <i key ="last" role="delete-merging button" data-testid={step.name+"-delete"} onClick={() => deleteStepClicked(step.name)}>
            <FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg"/>
          </i>
        </MLTooltip>
      ) : (
        <MLTooltip title={"Delete: " + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: "200px"}}>
          <i role="disabled-delete-merging button" data-testid={step.name+"-disabled-delete"} onClick={(event) => event.preventDefault()}>
            <FontAwesomeIcon icon={faTrashAlt} className={styles.disabledDeleteIcon} size="lg"/>
          </i>
        </MLTooltip>
      ),
    ];
  };

  return (
    <div className={styles.matchContainer}>
      <Row gutter={16} type="flex">
        {props.canWriteMatchMerge ? (
          <Col>
            <Card
              size="small"
              className={styles.addNewCard}>
              <div><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={OpenAddNew}/></div>
              <br/>
              <p className={styles.addNewContent}>Add New</p>
            </Card>
          </Col>
        ) : <Col>
          <MLTooltip title={"Curate: "+SecurityTooltips.missingPermission} placement="bottom" overlayStyle={tooltipOverlayStyle}><Card
            size="small"
            className={styles.addNewCardDisabled}>
            <div aria-label="add-new-card-disabled"><Icon type="plus-circle" className={styles.plusIconDisabled} theme="filled"/></div>
            <br/>
            <p className={styles.addNewContent}>Add New</p>
          </Card></MLTooltip>
        </Col>}
        {props.matchingStepsArray.length > 0 ? (
          props.matchingStepsArray.map((step, index) => (
            <Col key={index}>
              <div
                data-testid={`${props.entityName}-${step.name}-step`}
                onMouseOver={(e) => handleMouseOver(e, step.name)}
                onMouseLeave={(e) => handleMouseLeave()}
              >
                <Card
                  actions={renderCardActions(step, index)}
                  className={styles.cardStyle}
                  size="small"
                >
                  <div className={styles.formatFileContainer}>
                    <span aria-label={`${step.name}-step-label`} className={styles.mapNameStyle}>{getInitialChars(step.name, 27, "...")}</span>
                  </div>
                  <br />
                  {step.selectedSource === "collection" ? (
                    <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(step.sourceQuery)}</div>
                  ) : (
                    <div className={styles.sourceQuery}>Source Query: {getInitialChars(step.sourceQuery, 32, "...")}</div>
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
                        <MLTooltip title={"Curate: "+SecurityTooltips.missingPermission} placement={"bottom"} visible={tooltipVisible && !props.canWriteMatchMerge}><div className={styles.cardLinkSelect}>
                          <Select
                            style={{width: "100%"}}
                            value={selected[step.name] ? selected[step.name] : undefined}
                            onChange={(flowName) => handleSelect({flowName: flowName, matchingName: step.name})}
                            placeholder="Select Flow"
                            defaultActiveFirstOption={false}
                            disabled={!props.canWriteMatchMerge}
                            data-testid={`${step.name}-flowsList`}
                          >
                            {props.flows && props.flows.length > 0 ? props.flows.map((f, i) => (
                              <Option aria-label={`${f.name}-option`} value={f.name} key={i}>{f.name}</Option>
                            )) : null}
                          </Select>
                        </div></MLTooltip>
                      ) : null}
                    </div>
                  </div>
                </Card>
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
        targetEntityType={props.entityName}
      />
      {renderAddConfirmation}
    </div>
  );
};

export default MatchingCard;
