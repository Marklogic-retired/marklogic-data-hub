import React from "react";
import {Modal} from "react-bootstrap";
import {HCButton} from "@components/common";
import styles from "./flows.module.scss";

export const deleteConfirmationModal = (isVisible: boolean, flowName: string, onOk, onCancel) => {
  return (<Modal
    show={isVisible}
  >
    <Modal.Header className={"bb-none"}>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
    </Modal.Header>
    <Modal.Body className={"text-center pt-0 pb-4"}>
      <div className={`mb-4 ${styles.confirmationText}`}>Are you sure you want to delete the <strong>{flowName}</strong> flow?</div>
      <div>
        <HCButton variant="outline-light" aria-label={"No"} className={"me-2"} onClick={onCancel}>
          No
        </HCButton>
        <HCButton aria-label={"Yes"} variant="primary" type="submit" onClick={() => onOk(flowName)}>
          Yes
        </HCButton>
      </div>
    </Modal.Body>
  </Modal>);
};

export const deleteStepConfirmationModal = (isVisible: boolean, stepName, stepNumber, flowName: string, onOk, onCancel) => {
  return (<Modal
    show={isVisible}
  >
    <Modal.Header className={"bb-none"}>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
    </Modal.Header>
    <Modal.Body className={"text-center pt-0 pb-4"}>
      <div className={`mb-4 ${styles.confirmationText}`}>Are you sure you want to remove the <strong>{stepName}</strong> step from the <strong>{flowName}</strong> flow?</div>
      <div>
        <HCButton variant="outline-light" aria-label={"No"} className={"me-2"} onClick={onCancel}>
          No
        </HCButton>
        <HCButton aria-label={"Yes"} variant="primary" type="submit" onClick={() => onOk(flowName, stepNumber)}>
          Yes
        </HCButton>
      </div>
    </Modal.Body>
  </Modal>);
};

export const addStepConfirmationModal = (isVisible: boolean, onOk, onCancel, flowName: string, stepName: string, stepType: string, isStepInFlow) => {
  return (<Modal
    show={isVisible}
  >
    <Modal.Header className={"bb-none"}>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
    </Modal.Header>
    <Modal.Body className={"text-center pt-0 pb-4"}>
      <div className={`mb-4 ${styles.confirmationText}`}>
        {
          isStepInFlow(stepName, flowName)
            ?
            <p>The step <b>{stepName}</b> is already in the flow <b>{flowName}</b>. Would you like to add another instance?</p>
            :
            <p>Are you sure you want to add step <b>{stepName}</b> to flow <b>{flowName}</b>?</p>
        }
      </div>
      <div>
        <HCButton variant="outline-light" aria-label={"No"} className={"me-2"} onClick={onCancel}>
          No
        </HCButton>
        <HCButton aria-label={"Yes"} variant="primary" type="submit" onClick={() => onOk(stepName, flowName, stepType)}>
          Yes
        </HCButton>
      </div>
    </Modal.Body>
  </Modal>);
};

export const addExistingStepConfirmationModal = (isVisible: boolean, stepName, flowName: string, onOk, onCancel,) => {
  return (<Modal
    show={isVisible}
  >
    <Modal.Header className={"bb-none"}>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
    </Modal.Header>
    <Modal.Body className={"text-center pt-0 pb-4"}>
      <div className={`mb-4 ${styles.confirmationText}`}>
        {
          <p>The step <b>{stepName}</b> is already in the flow <b>{flowName}</b>.</p>
        }
      </div>
      <div>
        <HCButton variant="primary" aria-label={"Ok"} type="submit" className={"me-2"} onClick={onOk}>
          OK
        </HCButton>
      </div>
    </Modal.Body>
  </Modal>);
};