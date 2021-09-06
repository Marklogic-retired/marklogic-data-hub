import React from "react";
import {Modal} from "antd";
import styles from "./confirm-yes-no.module.scss";
import {ConfirmYesNoMessages} from "../../../config/messages.config";
import HCButton from "../hc-button/hc-button";

type Props = {
    visible: boolean;
    width?: number;
    type: string;
    onNo: any;
    onYes: any;
    labelNo?: string;
    labelYes?: string;
}

const ConfirmYesNo: React.FC<Props> = (props) => {
  return (
    <Modal
      visible={props.visible}
      bodyStyle={{textAlign: "center"}}
      width={props.width ? props.width : 250}
      maskClosable={false}
      closable={false}
      footer={null}
      destroyOnClose={true}
    >
      <div className={styles.body} aria-label="confirm-body">{ConfirmYesNoMessages[props.type]}</div>
      <div>
        <div className={styles.buttonNo}>
          <HCButton variant="outline-light" aria-label={props.labelNo ? props.labelNo : "No"} onClick={props.onNo}>
            {props.labelNo ? props.labelNo : "No"}
          </HCButton>
        </div>
        <div className={styles.buttonYes}>
          <HCButton aria-label={props.labelYes ? props.labelYes : "Yes"} variant="primary" type="submit" onClick={props.onYes}>
            {props.labelYes ? props.labelYes : "Yes"}
          </HCButton>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmYesNo;
