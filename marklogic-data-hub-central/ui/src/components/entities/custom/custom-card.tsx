import React, {useState} from "react";
import styles from "./custom-card.module.scss";
import {Row, Col, Modal} from "react-bootstrap";
import Select, {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import {convertDateFromISO, getInitialChars, extractCollectionFromSrcQuery} from "@util/conversionFunctions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import {Link, useHistory} from "react-router-dom";
import {CustomStepTooltips, SecurityTooltips} from "@config/tooltips.config";
import {HCTooltip, HCCard, HCButton, HCModal} from "@components/common";
import Steps from "../../steps/steps";

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
    <HCModal
      show={addDialogVisible}
      onHide={onCancel}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0 pb-4"}>
        <div aria-label="add-step-confirmation" style={{fontSize: "16px"}}>
          { isStepInFlow(stepName, flowName) ?
            <p aria-label="step-in-flow">The step <strong>{stepName}</strong> is already in the flow <strong>{flowName}</strong>. Would you like to add another instance?</p> :
            <p aria-label="step-not-in-flow">Are you sure you want to add the step <strong>{stepName}</strong> to the flow <strong>{flowName}</strong>?</p>
          }
        </div>
        <div className={"d-flex justify-content-center pt-4 pb-2"}>
          <HCButton className={"me-2"} variant="outline-light" aria-label={"No"} onClick={onCancel}>
            {"No"}
          </HCButton>
          <HCButton data-testid={`${stepName}-to-${flowName}-Confirm`} aria-label={"Yes"} variant="primary" type="submit" onClick={() => onAddOk(stepName, flowName)}>
            {"Yes"}
          </HCButton>
        </div>
      </Modal.Body>
    </HCModal>
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

  const flowOptions = props.flows?.length > 0 ? props.flows.map((f, i) => ({value: f.name, label: f.name})) : {};

  const MenuList  = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

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
                          <HCTooltip text={"Curate: "+SecurityTooltips.missingPermission} id="select-flow-tooltip" placement="top" show={tooltipVisible && !props.canWriteFlow}>
                            <div className={styles.cardLinkSelect} data-testid={`add-${elem.name}-select`}>
                              <Select
                                id={`${elem.name}-flowsList-select-wrapper`}
                                inputId={`${elem.name}-flowsList`}
                                components={{MenuList: props => MenuList(`${elem.name}-flowsList`, props)}}
                                placeholder="Select Flow"
                                value={Object.keys(flowOptions).length > 0 ? flowOptions.find(oItem => oItem.value === selected[elem.name]) : undefined}
                                onChange={(option) => handleSelect({flowName: option.value, stepName: elem.name})}
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
