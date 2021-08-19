import React, {useState} from "react";
import styles from "./custom-card.module.scss";
import {Modal, Select} from "antd";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {convertDateFromISO, getInitialChars, extractCollectionFromSrcQuery} from "../../../util/conversionFunctions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import {Link, useHistory} from "react-router-dom";
import {CustomStepTooltips, SecurityTooltips} from "../../../config/tooltips.config";
import HCTooltip from "../../common/hc-tooltip/hc-tooltip";
import HCCard from "../../common/hc-card/hc-card";
import Steps from "../../steps/steps";

const {Option} = Select;

interface Props {
  data: any;
  flows: any;
  entityTypeTitle: any;
  getArtifactProps: any;
  updateCustomArtifact: any;
  canReadOnly: any;
  canReadWrite: any;
  canWriteFlow: any;
  entityModel: any;
  addStepToFlow: any;
  addStepToNew: any;
}

const CustomCard: React.FC<Props> = (props) => {
  const activityType = "custom";
  const [stepData, setStepData] = useState({});
  const [openStepSettings, setOpenStepSettings] = useState(false);

  // show add-to-flow options when hovering
  const [showLinks, setShowLinks] = useState("");
  const [selectVisible, setSelectVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // show confirmation dialog to add step to flow
  const [addDialogVisible, setAddDialogVisible] = useState(false);

  // selected step name and flow name when adding step
  const [stepName, setStepName] = useState("");
  const [flowName, setFlowName] = useState("");
  const [selected, setSelected] = useState({});

  let history = useHistory();

  // helper functions
  const isStepInFlow = (stepName, flowName) => {
    let result = false, flow;
    if (props.flows) flow = props.flows.find(f => f.name === flowName);
    if (flow) result = flow["steps"].findIndex(s => s.stepName === stepName) > -1;
    return result;
  };

  // updates step settings
  const updateCustomArtifact = async (payload) => {
    // Update local form state
    setStepData(prevState => ({...prevState, ...payload}));
    await props.updateCustomArtifact(payload);
  };

  // mouse over/mouse leave events with card body (shows/hides add-to-flow options)
  function handleMouseOver(e, name) {
    setStepName(name);
    setSelectVisible(true);
    setTooltipVisible(true);
    if (typeof e.target.className === "string" &&
            (e.target.className === "card-body" ||
             e.target.className.startsWith("custom-card_cardContainer") ||
             e.target.className.startsWith("custom-card_formatFileContainer") ||
             e.target.className.startsWith("custom-card_sourceQuery") ||
             e.target.className.startsWith("custom-card_lastUpdatedStyle"))
    ) {
      setShowLinks(name);
    }
  }
  function handleMouseLeave() {
    setShowLinks("");
    setSelectVisible(false);
    setTooltipVisible(false);
  }

  const OpenStepSettings = async (name : String) => {
    setStepData(await props.getArtifactProps(name));
    setOpenStepSettings(true);
  };

  // confirmation dialog to add flow to step
  const onAddOk = async (lName, fName) => {
    await props.addStepToFlow(lName, fName, "custom");
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
    setAddDialogVisible(false);
    setSelected({}); // reset menus on cancel
  };
  const addConfirmation = (
    <Modal
      visible={addDialogVisible}
      okText={<div data-testid={`${stepName}-to-${flowName}-Confirm`}>Yes</div>}
      cancelText="No"
      onOk={() => onAddOk(stepName, flowName)}
      onCancel={() => onCancel()}
      width={400}
      maskClosable={false}
    >
      <div aria-label="add-step-confirmation" style={{fontSize: "16px", padding: "10px"}}>
        { isStepInFlow(stepName, flowName) ?
          <p aria-label="step-in-flow">The step <strong>{stepName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance?</p> :
          <p aria-label="step-not-in-flow">Are you sure you want to add the step <strong>{stepName}</strong> to the flow <strong>{flowName}</strong>?</p>
        }
      </div>
    </Modal>
  );

  // select dropdown when adding step
  function handleSelect(obj) {
    let selectedNew = {...selected};
    selectedNew[obj.loadName] = obj.flowName;
    setSelected(selectedNew);
    handleStepAdd(obj.stepName, obj.flowName);
  }
  const handleStepAdd = (stepName, flowName) => {
    setStepName(stepName);
    setFlowName(flowName);
    setAddDialogVisible(true);
  };

  return (
    <div className={styles.customContainer}>
      <Row>
        {
          props && props.data.length > 0 ? props.data.map((elem, index) => (

            <Col xs={"auto"} key={index}>
              <div
                data-testid={`${props.entityTypeTitle}-${elem.name}-step`}
                onMouseOver={(e) => handleMouseOver(e, elem.name)}
                onMouseLeave={handleMouseLeave}
              >
                <HCCard
                  actions={[
                    <HCTooltip text={CustomStepTooltips.viewCustom} id="custom-card-tooltip" placement="bottom">
                      <span className={styles.viewStepSettingsIcon} onClick={() => OpenStepSettings(elem.name)} role="edit-custom button" data-testid={elem.name+"-edit"}><FontAwesomeIcon icon={faCog}/> Edit Step Settings</span>
                    </HCTooltip>,
                  ]}
                  className={styles.cardStyle}
                >
                  <div className={styles.formatFileContainer}>
                    <span aria-label={`${elem.name}-step-label`} className={styles.customNameStyle}>{getInitialChars(elem.name, 27, "...")}</span>
                  </div>
                  <br />
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
                              stepDefinitionType: "custom"
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
                        /** dropdown of flow names to add this custom step to */
                        selectVisible ?
                          <HCTooltip text={"Curate: "+SecurityTooltips.missingPermission} id="select-flow-tooltip" placement="bottom" show={tooltipVisible && !props.canWriteFlow}>
                            <div className={styles.cardLinkSelect} data-testid={`add-${elem.name}-select`}>
                              <Select
                                style={{width: "100%"}}
                                value={selected[elem.name] ? selected[elem.name] : undefined}
                                onChange={(flowName) => handleSelect({flowName: flowName, stepName: elem.name})}
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
                                    : null
                                }
                              </Select>
                            </div>
                          </HCTooltip>
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
      {addConfirmation}
      <Steps
        // Basic Settings
        isEditing={true}
        stepData={stepData}
        canReadWrite={props.canReadWrite}
        canReadOnly={props.canReadOnly}
        // Advanced Settings
        canWrite={props.canReadWrite}
        tooltipsData={CustomStepTooltips}
        updateStep={updateCustomArtifact}
        openStepSettings={openStepSettings}
        setOpenStepSettings={setOpenStepSettings}
        targetEntityType={props.entityModel.entityTypeId}
        targetEntityName={props.entityModel.entityName}
        activityType={activityType}
      />
    </div>
  );
};

export default CustomCard;
