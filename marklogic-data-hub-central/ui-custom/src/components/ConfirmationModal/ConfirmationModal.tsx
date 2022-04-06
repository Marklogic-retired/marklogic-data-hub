import React from "react";
import {Modal} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import "./ConfirmationModal.scss";

type Props = {
  isVisible: boolean;
  toggleModal: (isVisible: boolean) => void;
  confirmAction: () => void;
  bodyContent: string;
  headerContent: string;
  title: string;
};

const ConfirmationModal: React.FC<Props> = (props) => {

  const closeModal = () => {
    props.toggleModal(false);
  };

  const handleYesClicked = () => {
    props.confirmAction();
    props.toggleModal(false);
  }

  return (
    <Modal
      show={props.isVisible}
      data-testid={props.title + "-resetConfirmationModal"}
      className="confirmation-modal"
    >
      {props.headerContent.length !== 0 &&<Modal.Header>props.headerContent</Modal.Header>}
      <Modal.Body>
      <div className="modalBody">
        <FontAwesomeIcon icon={faExclamationTriangle} className="alertIcon"/>
        <span className="bodyContent">{props.bodyContent}</span>
      </div>
    </Modal.Body>
      <Modal.Footer>
        <button className="cancel" onClick={closeModal} data-testid="noButton">No</button>
        <button className="submit" onClick={handleYesClicked} data-testid="yesButton">Yes</button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
