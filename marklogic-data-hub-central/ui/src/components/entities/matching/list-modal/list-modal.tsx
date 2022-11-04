import React, {/*useState*/} from "react";
import {Modal} from "react-bootstrap";
import {HCButton} from "@components/common";

type Props = {
  isVisible: boolean;
  toggleModal: (isVisible: boolean) => void;
  action: string;
  confirmAction: () => void
};

const ListModal: React.FC<Props> = (props) => {
  let text = "";
  const closeModal = () => {
    props.toggleModal(false);
  };

  const confirmAction = async () => {
    if (props.action === "A") {
      //console.log("create new list");
    } else if (props.action === "C") {
      //console.log("copy list");
    } else if (props.action === "E") {
      //console.log("edit list");
    } else if (props.action === "D") {
      //console.log("delete list");
    }
    props.toggleModal(false);
  };

  if (props.action) {
    if (props.action === "A") {
      text = "add";
    } else if (props.action === "C") {
      text = "copy";
    } else if (props.action === "E") {
      text = "edit";
    } else if (props.action === "D") {
      text = "delete";
    }
  }

  return (
    <Modal
      show={props.isVisible}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0 px-4"}>
        <p aria-label="delete-slider-text" >{`Are you sure you want to ${text} a list`}
          <b></b> ?
        </p>
        <div className={"d-flex justify-content-center pt-4 pb-2"}>
          <HCButton
            aria-label={`confirm-test-no`}
            variant="outline-light"
            className={"me-2"}
            onClick={closeModal}
          >No</HCButton>
          <HCButton
            aria-label={`confirm-test-yes`}
            variant="primary"
            onClick={() => confirmAction()}
          >Yes</HCButton>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ListModal;
