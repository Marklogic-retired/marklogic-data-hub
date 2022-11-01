import React, {useContext} from "react";
import {Modal} from "react-bootstrap";
import {updateMatchingArtifact} from "@api/matching";
import {CurationContext} from "@util/curation-context";
import {HCButton, HCModal} from "@components/common";


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

  return (
    <HCModal
      show={props.isVisible}
      onHide={closeModal}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0 px-4"}>
        <p aria-label="delete-slider-text" >Are you sure you want to delete a&nbsp;<span>{props.editRuleset.hasOwnProperty("name") ? "ruleset" : "threshold"}</span>&nbsp;
          <b>{props.editRuleset.hasOwnProperty("name")? props.editRuleset.name : (props.editRuleset.thresholdName + " - " + props.editRuleset.action)} </b> ?
        </p>
        <div className={"d-flex justify-content-center pt-4 pb-2"}>
          <HCButton
            aria-label={props.editRuleset.hasOwnProperty("name")? `confirm-${props.editRuleset.name}-no`: `confirm-${props.editRuleset.thresholdName}-no`}
            variant="outline-light"
            className={"me-2"}
            onClick={closeModal}
          >No</HCButton>
          <HCButton
            aria-label={props.editRuleset.hasOwnProperty("name")? `confirm-${props.editRuleset.name}-yes`: `confirm-${props.editRuleset.thresholdName}-yes`}
            variant="primary"
            onClick={() => confirmAction()}
          >Yes</HCButton>
        </div>
      </Modal.Body>
    </HCModal>
  );
};

export default DeleteModal;
