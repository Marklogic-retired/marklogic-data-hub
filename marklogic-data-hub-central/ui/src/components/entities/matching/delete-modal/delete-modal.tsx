import React, {useContext} from "react";
import {Modal} from "antd";
import {updateMatchingArtifact} from "../../../../api/matching";
import {CurationContext} from "../../../../util/curation-context";
import HCButton from "../../../common/hc-button/hc-button";


type Props = {
    isVisible: boolean;
    toggleModal: (isVisible: boolean) => void;
    editRuleset: any;
    confirmAction:()=> void
};

const DeleteModal: React.FC<Props> = (props) => {
  const {curationOptions, updateActiveStepArtifact} = useContext(CurationContext);

  const closeModal = () => {
    props.toggleModal(false);
  };

  const confirmAction = async() => {
    if (props.editRuleset.hasOwnProperty("name")) {
      let stepArtifact = curationOptions.activeStep.stepArtifact;
      let stepArtifactRulesets = curationOptions.activeStep.stepArtifact.matchRulesets;
      let index = parseInt(props.editRuleset["index"]);
      stepArtifactRulesets.splice(index, 1);
      stepArtifact.matchRulesets = stepArtifactRulesets;
      await updateMatchingArtifact(stepArtifact);
      updateActiveStepArtifact(stepArtifact);
    } else {
      let stepArtifact = curationOptions.activeStep.stepArtifact;
      let stepArtifactThresholds = curationOptions.activeStep.stepArtifact.thresholds;
      let index = parseInt(props.editRuleset["index"]);
      stepArtifactThresholds.splice(index, 1);
      stepArtifact.thresholds = stepArtifactThresholds;
      await updateMatchingArtifact(stepArtifact);
      updateActiveStepArtifact(stepArtifact);
    }
    props.toggleModal(false);
    props.confirmAction();
  };


  const modalFooter = <div >
    <HCButton
      aria-label={props.editRuleset.hasOwnProperty("name")? `confirm-${props.editRuleset.name}-no`: `confirm-${props.editRuleset.thresholdName}-no`}
      variant="outline-light"
      onClick={closeModal}
    >No</HCButton>
    <HCButton
      aria-label={props.editRuleset.hasOwnProperty("name")? `confirm-${props.editRuleset.name}-yes`: `confirm-${props.editRuleset.thresholdName}-yes`}
      variant="primary"
      onClick={() => confirmAction()}
    >Yes</HCButton>
  </div>;

  return (
    <Modal
      width={500}
      visible={props.isVisible}
      destroyOnClose={true}
      closable={false}
      maskClosable={false}
      footer={modalFooter}
    >
      <p aria-label="delete-slider-text" >Are you sure you want to delete a&nbsp;<span>{props.editRuleset.hasOwnProperty("name") ? "ruleset" : "threshold"}</span>&nbsp;
        <b>{props.editRuleset.hasOwnProperty("name")? props.editRuleset.name : (props.editRuleset.thresholdName + " - " + props.editRuleset.action)} </b> ?
      </p>
    </Modal>
  );
};

export default DeleteModal;
