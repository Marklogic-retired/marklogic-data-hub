import React from "react";
import {Modal, Button} from "antd";
import styles from "./confirm-yes-no.module.scss";
import {ConfirmYesNoMessages} from "../../../config/messages.config";

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
          <Button aria-label={props.labelNo ? props.labelNo : "No"} onClick={props.onNo}>
            {props.labelNo ? props.labelNo : "No"}
          </Button>
        </div>
        <div className={styles.buttonYes}>
          <Button aria-label={props.labelYes ? props.labelYes : "Yes"} type="primary" htmlType="submit" onClick={props.onYes}>
            {props.labelYes ? props.labelYes : "Yes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmYesNo;
