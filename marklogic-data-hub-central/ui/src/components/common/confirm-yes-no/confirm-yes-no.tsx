import React from "react";
import {Modal} from "react-bootstrap";
import {ConfirmYesNoMessages} from "@config/messages.config";
import HCButton from "../hc-button/hc-button";
import {HCModal} from "@components/common";

type Props = {
    visible: boolean;
    type: string;
    onNo: any;
    onYes: any;
    labelNo?: string;
    labelYes?: string;
}

const ConfirmYesNo: React.FC<Props> = (props) => {
  return (
    <HCModal
      show={props.visible}
      size="sm"
      onHide={props.onNo}
    >
      <Modal.Body>
        <div aria-label="confirm-body" className={"text-center"}>{ConfirmYesNoMessages[props.type]}</div>
        <div className={"d-flex justify-content-center pt-4 pb-2"}>
          <HCButton className={"me-2"} variant="outline-light" aria-label={props.labelNo ? props.labelNo : "No"} onClick={props.onNo}>
            {props.labelNo ? (props.labelNo === "DiscardChangesNoButton" ? "No" : props.labelNo) : "No"}
          </HCButton>
          <HCButton aria-label={props.labelYes ? props.labelYes : "Yes"} variant="primary" type="submit" onClick={props.onYes}>
            {props.labelYes ? (props.labelYes === "DiscardChangesYesButton" ? "Yes" : props.labelYes) : "Yes"}
          </HCButton>
        </div>
      </Modal.Body>
    </HCModal>
  );
};

export default ConfirmYesNo;
