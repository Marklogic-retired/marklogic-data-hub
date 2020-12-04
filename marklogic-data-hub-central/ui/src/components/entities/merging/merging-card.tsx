import React, { useState, useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Card, Icon, Row, Col, Select } from 'antd';
import { MLTooltip } from '@marklogic/design-system';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import styles from './merging-card.module.scss';

import AddMergeRuleDialog from './add-merge-rule/add-merge-rule-dialog';
import ConfirmationModal from '../../confirmation-modal/confirmation-modal';

import { CurationContext } from '../../../util/curation-context';
import {convertDateFromISO, getInitialChars, extractCollectionFromSrcQuery, sortStepsByUpdated} from '../../../util/conversionFunctions';
import { AdvMapTooltips, SecurityTooltips } from '../../../config/tooltips.config';
import { ConfirmationType } from '../../../types/common-types';
import { MergingStep, StepType} from '../../../types/curation-types';
import Steps from "../../steps/steps";

interface Props {
  mergingStepsArray: any;
  flows: any;
  entityName: any;
  entityModel: any;
  canReadMatchMerge: boolean;
  canWriteMatchMerge: boolean;
  deleteMergingArtifact: (mergeName) => void;
  createMergingArtifact: (mergingObj) => void;
  addStepToFlow: any;
  addStepToNew: any;
}

const { Option } = Select;

const MergingCard: React.FC<Props> = (props) => {
  const history = useHistory<any>();
  const { setActiveStep } = useContext(CurationContext);
  const [selected, setSelected] = useState({}); // track Add Step selections so we can reset on cancel
  const [selectVisible, setSelectVisible] = useState(false);
  const [showLinks, setShowLinks] = useState('');
  const [stepArtifact, setStepArtifact] = useState({});

  const [showCreateEditStepModal, toggleCreateEditStepModal] = useState(false);
  const [editStepArtifact, setEditStepArtifact] = useState({});

  const [showStepSettings, toggleStepSettings] = useState(false);

  const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.AddStepToFlow);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [confirmBoldTextArray, setConfirmBoldTextArray] = useState<string[]>([]);
  const [sortedMergingSteps, setSortedMergingSteps] = useState(props.mergingStepsArray);

  const tooltipOverlayStyle={maxWidth: '200'};
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    let sortedArray = props.mergingStepsArray.length > 1 ? sortStepsByUpdated(props.mergingStepsArray) : props.mergingStepsArray;
    setSortedMergingSteps(sortedArray);
  },[props.mergingStepsArray]);

  const [openStepSettings, setOpenStepSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const OpenAddNew = () => {
    setIsEditing(false);
    setOpenStepSettings(true);
  }

  const OpenStepSettings = (index) => {
    setIsEditing(true);
    setEditStepArtifact(props.mergingStepsArray[index]);
    setOpenStepSettings(true);
    toggleCreateEditStepModal(true);
  }

  const stepSettingsClicked = (index) => {
    setStepArtifact(props.mergingStepsArray[index]);
    toggleStepSettings(true);
  }

  const openStepDetails = (mergingStep: MergingStep) => {
    setActiveStep(mergingStep, props.entityModel['model']['definitions'], props.entityName);
    history.push({ pathname: '/tiles/curate/merge'});
   };

   const createMergingArtifact = async (payload) => {
    // Update local form state, then save to db
    setEditStepArtifact(payload);
    props.createMergingArtifact(payload);
  }

  const updateMergingArtifact = (payload) => {
      // Update local form state
      setEditStepArtifact(payload);
  }

  const deleteStepClicked = (name) => {
    toggleConfirmModal(true);
    setConfirmType(ConfirmationType.DeleteStep)
    setConfirmBoldTextArray([name]);
  };

  function handleMouseOver(e, name) {
    // Handle all possible events from mouseover of card body
    setSelectVisible(true);
    setTooltipVisible(true);
    if (typeof e.target.className === 'string' &&
      (e.target.className === 'ant-card-body' ||
        e.target.className.startsWith('merging-card_cardContainer') ||
        e.target.className.startsWith('merging-card_formatFileContainer') ||
        e.target.className.startsWith('merging-card_sourceQuery') ||
        e.target.className.startsWith('merging-card_lastUpdatedStyle'))
    ) {
      setShowLinks(name);
    }
  }
  function handleMouseLeave() {
    setShowLinks('');
    setSelectVisible(false);
    setTooltipVisible(false);
  }

  function handleSelect(obj) {
    let selectedNew = {...selected};
    selectedNew[obj.loadName] = obj.flowName;
    setSelected(selectedNew);
    // TODO handle adding step to existing flow
    //handleStepAdd(obj.mappingName, obj.flowName);
  }

  const confirmAction = () => {
    if (confirmType === ConfirmationType.AddStepToFlow) {
      // TODO add step to new flow
    } else if (confirmType === ConfirmationType.DeleteStep) {
        props.deleteMergingArtifact(confirmBoldTextArray[0]);
        toggleConfirmModal(false);
    }
  };

  const renderCardActions = (step, index) => {
    return [
      <MLTooltip title={'Edit'} placement="bottom">
        <Icon
          className={styles.editIcon}
          type="edit"
          key ="last"
          role="edit-merging button"
          data-testid={step.name+'-edit'}
          onClick={() => OpenStepSettings(index)}
        />
      </MLTooltip>,

      <MLTooltip title={'Step Details'} placement="bottom">
        <i style={{ fontSize: '16px', marginLeft: '-5px', marginRight: '5px'}}>
          <FontAwesomeIcon icon={faSlidersH} data-testid={`${step.name}-stepDetails`} onClick={() => openStepDetails(step)}/>
        </i>
      </MLTooltip>,

      // <MLTooltip title={'Settings'} placement="bottom">
      //   <Icon
      //     type="setting"
      //     key="setting"
      //     role="settings-merging button"
      //     data-testid={step.name+'-settings'}
      //     onClick={() => stepSettingsClicked(index)}
      //     />
      // </MLTooltip>,

      props.canWriteMatchMerge ? (
      <MLTooltip title={'Delete'} placement="bottom">
        <i key ="last" role="delete-merging button" data-testid={step.name+'-delete'} onClick={() => deleteStepClicked(step.name)}>
          <FontAwesomeIcon icon={faTrashAlt} className={styles.deleteIcon} size="lg"/>
        </i>
      </MLTooltip>
      ) : (
      <MLTooltip title={'Delete: ' + SecurityTooltips.missingPermission} placement="bottom" overlayStyle={{maxWidth: '200px'}}>
        <i role="disabled-delete-merging button" data-testid={step.name+'-disabled-delete'} onClick={(event) => event.preventDefault()}>
          <FontAwesomeIcon icon={faTrashAlt} className={styles.disabledDeleteIcon} size="lg"/>
        </i>
      </MLTooltip>
      ),
    ]
  }

  return (
    <div className={styles.mergeContainer}>
      <Row gutter={16} type="flex">
        {props.canWriteMatchMerge ? (
          <Col>
            <Card
              size="small"
              className={styles.addNewCard}>
              <div><Icon type="plus-circle" className={styles.plusIcon} theme="filled" onClick={OpenAddNew}/></div>
              <br />
              <p className={styles.addNewContent}>Add New</p>
            </Card>
          </Col>
        ) : <Col>
            <MLTooltip title={'Curate: '+SecurityTooltips.missingPermission} placement="bottom" overlayStyle={tooltipOverlayStyle}><Card
                size="small"
                className={styles.addNewCardDisabled}>
                <div aria-label="add-new-card-disabled"><Icon type="plus-circle" className={styles.plusIconDisabled} theme="filled"/></div>
                <br />
                <p className={styles.addNewContent}>Add New</p>
            </Card></MLTooltip>
        </Col>}
        {sortedMergingSteps && sortedMergingSteps.length > 0 ? (
          sortedMergingSteps.map((step, index) => (
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
                    <span aria-label={`${step.name}-step-label`} className={styles.mapNameStyle}>{getInitialChars(step.name, 27, '...')}</span>
                  </div>
                  <br />
                  {step.selectedSource === 'collection' ? (
                    <div className={styles.sourceQuery}>Collection: {extractCollectionFromSrcQuery(step.sourceQuery)}</div>
                  ): (
                    <div className={styles.sourceQuery}>Source Query: {getInitialChars(step.sourceQuery,32,'...')}</div>
                  )}
                  <br /><br />
                  <p className={styles.lastUpdatedStyle}>Last Updated: {convertDateFromISO(step.lastUpdated)}</p>
                  <div className={styles.cardLinks} style={{display: showLinks === step.name ? 'block' : 'none'}}>
                  {props.canWriteMatchMerge ? (
                    <Link
                      id="tiles-run-add"
                      to={{
                        pathname: '/tiles/run/add',
                        state: {
                          stepToAdd : step.name,
                          stepDefinitionType : 'merging'
                      }}}
                    >
                      <div className={styles.cardLink} data-testid={`${step.name}-toNewFlow`}> Add step to a new flow</div>
                    </Link>
                  ) : <div className={styles.cardDisabledLink} data-testid={`${step.name}-disabledToNewFlow`}> Add step to a new flow</div>
                  }
                  <div className={styles.cardNonLink} data-testid={`${step.name}-toExistingFlow`}>
                    Add step to an existing flow
                    {selectVisible ? (
                        <MLTooltip title={'Curate: '+SecurityTooltips.missingPermission} placement={'bottom'} visible={tooltipVisible && !props.canWriteMatchMerge}><div className={styles.cardLinkSelect}>
                        <Select
                          style={{ width: '100%' }}
                          value={selected[step.name] ? selected[step.name] : undefined}
                          onChange={(flowName) => handleSelect({flowName: flowName, mappingName: step.name})}
                          placeholder="Select Flow"
                          defaultActiveFirstOption={false}
                          disabled={!props.canWriteMatchMerge}
                          data-testid={`${step.name}-flowsList`}
                        >
                          {props.flows && props.flows.length > 0 ? props.flows.map((f,i) => (
                            <Option aria-label={`${f.name}-option`} value={f.name} key={i}>{f.name}</Option>
                          )) : null}
                        </Select>
                        </div></MLTooltip>
                    ): null}
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
        createStep={createMergingArtifact}
        stepData={editStepArtifact}
        canReadOnly={props.canReadMatchMerge}
        canReadWrite={props.canWriteMatchMerge}
        canWrite={props.canWriteMatchMerge}
        // Advanced Settings
        tooltipsData={AdvMapTooltips}
        openStepSettings={openStepSettings}
        setOpenStepSettings={setOpenStepSettings}
        updateStep={updateMergingArtifact}
        activityType={StepType.Merging}
        targetEntityType={props.entityName}
      />

    </div>
  )
};

export default MergingCard;
