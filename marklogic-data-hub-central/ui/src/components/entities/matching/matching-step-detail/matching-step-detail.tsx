import React, { useState, useEffect, useContext } from 'react';
import { Modal } from 'antd';
import { useHistory } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';
import { MLPageHeader, MLButton, MLDropdown, MLMenu } from '@marklogic/design-system';
import styles from './matching-step-detail.module.scss';

import RulesetSingleModal from '../ruleset-single-modal/ruleset-single-modal';
import MultiSlider from "../multi-slider/multi-slider";
import NumberIcon from '../../../number-icon/number-icon';
import ThresholdModal from '../threshold-modal/threshold-modal';

import { CurationContext } from '../../../../util/curation-context';
import { MatchingStep } from '../../../../types/curation-types';
import { MatchingStepDetailText } from '../../../../config/tooltips.config';
import { updateMatchingArtifact } from '../../../../api/matching';

const DEFAULT_MATCHING_STEP: MatchingStep = {
  name: '',
  description: '',
  additionalCollections: [],
  collections: [],
  lastUpdated: '',
  permissions: '',
  provenanceGranularityLevel: '',
  selectedSource: '',
  sourceDatabase: '',
  sourceQuery: '',
  stepDefinitionName: '',
  stepDefinitionType: '',
  stepId: '',
  targetDatabase: '',
  targetEntityType: '',
  targetFormat: '',
  matchRulesets: [],
  thresholds: []
};

const MatchingStepDetail: React.FC = () => {
  const history = useHistory<any>();
  const { curationOptions, updateActiveStepArtifact } = useContext(CurationContext);

  const [matchingStep, setMatchingStep] = useState<MatchingStep>(DEFAULT_MATCHING_STEP);
  const [deleteOptions, setDeleteOptions] = useState({});
  const [editThreshold, setEditThreshold] = useState({});

  const [showThresholdModal, toggleShowThresholdModal] = useState(false);
  const [showRulesetSingleModal, toggleShowRulesetSingleModal] = useState(false);

  const [moreThresholdText, toggleMoreThresholdText] = useState(true);
  const [moreRulesetText, toggleMoreRulesetText] = useState(true);

  const [showDeleteModal, toggleShowDeleteModal] = useState(false);

  useEffect(() => {
    if (Object.keys(curationOptions.activeStep.stepArtifact).length !== 0) {
      const matchingStepArtifact: MatchingStep = curationOptions.activeStep.stepArtifact;
      if (matchingStepArtifact.matchRulesets.length > 0 ) {
        toggleMoreRulesetText(false);
      } else {
        toggleMoreRulesetText(true);
      }

      if (matchingStepArtifact.thresholds.length > 0 ) {
        toggleMoreThresholdText(false);
      } else {
        toggleMoreThresholdText(true);
      }

      setMatchingStep(matchingStepArtifact);
    } else {
      history.push('/tiles/curate');
    }
  }, [JSON.stringify(curationOptions.activeStep.stepArtifact)]);

  const matchRuleSetOptions = matchingStep.matchRulesets.map((i) => {
      const matchRuleOptionsObject = {
          props: [{
              prop: i.name,
              type: i.matchRules.length > 0 ? i.matchRules[0]['matchType'] : ''
          }],
          value: i.weight
      };
      return matchRuleOptionsObject;
  });

  const matchThresholdOptions = matchingStep.thresholds.map((i) => {
      const matchThresholdOptionsObject = {
          props: [{
              prop: i.thresholdName,
              type: i.action,
          }],
          value: i.score,
      };
      return matchThresholdOptionsObject;
  });

  const handleSlider = async (values, options) => {
    if (options['sliderType'] === 'threshold') {

      let stepArtifact = curationOptions.activeStep.stepArtifact;
      let stepArtifactThresholds = curationOptions.activeStep.stepArtifact.thresholds;
      let index = stepArtifactThresholds.findIndex( threshold => threshold.thresholdName === options['prop'] );
      let updateThreshold = stepArtifactThresholds.find( threshold => threshold.thresholdName === options['prop'])
      let changedSlider = values.find( item => item['props']['prop'] === options['prop'])

      updateThreshold['score'] = parseInt(changedSlider['value'].toFixed(1));
      stepArtifactThresholds[index] = updateThreshold;
      stepArtifact['thresholds'] = stepArtifactThresholds;

      await updateMatchingArtifact(stepArtifact);
      updateActiveStepArtifact(stepArtifact);
    } else if (options['sliderType'] === 'ruleSet') {

    }
  };

  const handleSliderEdit = (options) => {
    if (options['sliderType'] === 'threshold') {
      let updateStepArtifactThresholds = curationOptions.activeStep.stepArtifact.thresholds;
      let index = updateStepArtifactThresholds.findIndex( threshold => threshold.thresholdName === options['prop'] );
      let editThreshold = updateStepArtifactThresholds[index];
      setEditThreshold({...editThreshold, index });
      toggleShowThresholdModal(true);
    } else if (options['sliderType'] === 'ruleSet') {

    }
  };

  const handleSliderDelete = (options) => {
    setDeleteOptions(options);
    toggleShowDeleteModal(true);
  };

  const deleteConfirm = async () => {
    if (deleteOptions['sliderType'] === 'threshold') {
      let stepArtifact = curationOptions.activeStep.stepArtifact;
      let updateStepArtifactThresholds = curationOptions.activeStep.stepArtifact.thresholds;
      let index = updateStepArtifactThresholds.findIndex( threshold => threshold.thresholdName === deleteOptions['prop'] );

      updateStepArtifactThresholds.splice(index, 1);
      stepArtifact.thresholds = updateStepArtifactThresholds;

      await updateMatchingArtifact(stepArtifact);
      updateActiveStepArtifact(stepArtifact);
      toggleShowDeleteModal(false);
    } else if (deleteOptions['sliderType'] === 'ruleSet') {

    }
  }

  const deleteModal = (
    <Modal
      width={500}
      visible={showDeleteModal}
      destroyOnClose={true}
      closable={false}
      className={styles.confirmModal}
      maskClosable={false}
      footer={null}
    >
      <p className={styles.deleteMessage}>Are you sure you want to delete a threshold <b>{deleteOptions['prop']} - {deleteOptions['type']}</b>?</p>
      <div className={styles.footer}>
        <MLButton
          aria-label={`delete-slider-confirm`}
          size="default"
          onClick={() => toggleShowDeleteModal(false)}
        >No</MLButton>
        <MLButton
          className={styles.saveButton}
          aria-label={`delete-slider-confirm`}
          type="primary"
          size="default"
          onClick={() => deleteConfirm()}
        >Yes</MLButton>
    </div>
    </Modal>
  )

  const renderRulesetMenu = (
    <MLMenu mode="vertical">
      <MLMenu.MLItem aria-label="single-ruleset-menu" onClick={() => toggleShowRulesetSingleModal(true)}>Add ruleset for a single property</MLMenu.MLItem>
      <MLMenu.MLItem aria-label="multiple-ruleset-menu"  >Add ruleset for multiple properties</MLMenu.MLItem>
    </MLMenu>
  );

  return (
    <>
      <MLPageHeader
        className={styles.pageHeader}
        onBack={() => history.push('/tiles/curate')}
        title={matchingStep.name}
      />
      <p className={styles.headerDescription}>{MatchingStepDetailText.description}</p>

      <div className={styles.matchingDetailContainer}>

        <div className={styles.stepNumberContainer}>
          <NumberIcon value={1} />
          <div className={styles.stepText}>Configure your thresholds</div>
        </div>

        <div className={styles.greyContainer}>
          <div className={styles.topHeader}>
            <div className={styles.textContainer}>
              <p aria-label="threshold-text" className={`${moreThresholdText ? styles.showText : styles.hideText}`}>A <span className={styles.italic}>threshold</span> specifies how closely entities have to match before a certain action is triggered.
                The action could be the merging of those entities, the creation of a match notification, or a custom action that is defined programmatically.
                Click the <span className={styles.bold}>Add</span> button to create a threshold. If most of the values in the entities should match to trigger the action associated with your threshold,
                then move the threshold higher on the scale. If some of the values in the entities must match, then move the threshold lower.
                <span aria-label="threshold-less" className={styles.link} onClick={() => toggleMoreThresholdText(!moreThresholdText)}>less</span>
              </p>
              {!moreThresholdText && <span aria-label="threshold-more" className={styles.link} onClick={() => toggleMoreThresholdText(!moreThresholdText)}>more</span> }
            </div>

            <div className={styles.addButtonContainer}>
                <MLButton 
                  aria-label="add-threshold"
                  type="primary"
                  size="default"
                  className={styles.addThresholdButton}
                  onClick={() => {
                    setEditThreshold({});
                    toggleShowThresholdModal(true)
                  }}
                >Add</MLButton>
            </div>
          </div>
            <MultiSlider options={matchingStep.thresholds.length ? matchThresholdOptions : []} handleSlider={handleSlider} handleDelete={handleSliderDelete} handleEdit={handleSliderEdit} type={'threshold'}/>
        </div>

        <div className={styles.stepNumberContainer}>
          <NumberIcon value={2} />
          <div className={styles.stepText}>Place rulesets on a match scale</div>
        </div>

        <div className={styles.greyContainer}>
          <div className={styles.topHeader}>
            <div className={styles.textContainer}>
              <p aria-label="ruleset-text" className={`${moreRulesetText ? styles.showText : styles.hideText}`}>A <span className={styles.italic}>ruleset</span> specifies the criteria for determining whether the values of your entities match.
                The way you define your rulesets, and where you place them on the scale, influences whether the entities are considered a match.
                Click the <span className={styles.bold}>Add</span> button to create a ruleset. If you want the ruleset to have a major influence over whether entities qualify as a "match",
                move it higher on the scale. If you want it to only have some influence, then move the ruleset lower.
                <span aria-label="ruleset-less" className={styles.link} onClick={() => toggleMoreRulesetText(!moreRulesetText)}>less</span>
              </p>
              {!moreRulesetText && <span aria-label="ruleset-more" className={styles.link} onClick={() => toggleMoreRulesetText(!moreRulesetText)}>more</span> }
            </div>

            <div className={styles.addButtonContainer}>
            <MLDropdown
                overlay={renderRulesetMenu}
                trigger={[
                  'click'
                ]}
              >
                <MLButton aria-label="add-ruleset" size="default" type="primary">
                  Add{' '}
                  <DownOutlined />
                </MLButton>
              </MLDropdown>
            </div>
          </div>
            <MultiSlider options={matchingStep.matchRulesets.length ? matchRuleSetOptions : []} handleSlider={handleSlider} handleDelete={handleSliderDelete} handleEdit={handleSliderEdit} type={'ruleSet'}/>
        </div>

      </div>
      <RulesetSingleModal
        isVisible={showRulesetSingleModal}
        toggleModal={toggleShowRulesetSingleModal}
      />
      <ThresholdModal
        isVisible={showThresholdModal}
        editThreshold={editThreshold}
        toggleModal={toggleShowThresholdModal}
      />
      {deleteModal}
    </>
  );
};

export default MatchingStepDetail;
