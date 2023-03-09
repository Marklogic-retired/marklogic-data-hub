import React from "react";
import {Modal, ModalProps} from "react-bootstrap";

const HCModal: React.FC<ModalProps> = props => {
  return (
    <>
      <Modal
        keyboard
        {...props}
        data-testid={props["data-testid"] || "hc-modal-component"}
        scrollable={props.scrollable ? props.scrollable : false}
      >
        {props.children}
      </Modal>
    </>
  );
};

export default HCModal;
