import React from "react";
import {Modal} from "react-bootstrap";
import {HCButton, HCModal} from "@components/common";
import styles from "../merge-strategy-dialog/merge-strategy-dialog.module.scss";


type Props = {
    isVisible: boolean;
    toggleModal: (isVisible: boolean) => void;
    confirmAction:()=> void
    deletePriorityName: string
};

const MergeDeleteModal: React.FC<Props> = (props) => {

  const closeModal = () => {
    props.toggleModal(false);
  };

  const confirmAction = async() => {
    props.toggleModal(false);
    props.confirmAction();
  };

  return (
    <HCModal show={props.isVisible} onHide={closeModal}>
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0 px-4"}>
        <p aria-label="delete-merge-strategy-text" className={styles.deleteMessage}>Are you sure you want to delete <b>{props.deletePriorityName}</b> priority?</p>
      </Modal.Body>
      <div className={"d-flex justify-content-center pt-4 pb-2"}>
        <HCButton
          aria-label="Cancel"
          variant="outline-light"
          className={"me-2"}
          onClick={closeModal}
        >No</HCButton>
        <HCButton
          aria-label="continue-confirm"
          variant="primary"
          onClick={() => confirmAction()}
        >Yes</HCButton>
      </div>
    </HCModal>
  );
};

export default MergeDeleteModal;
