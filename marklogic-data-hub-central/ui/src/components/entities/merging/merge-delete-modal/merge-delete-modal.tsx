import React from "react";
import {Modal} from "antd";
import {MLButton} from "@marklogic/design-system";
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

  const modalFooter =
      <div className={styles.footer}>
        <MLButton size="default" aria-label={"Cancel"} onClick={closeModal}>No</MLButton>
        <MLButton className={styles.saveButton} aria-label={"continue-confirm"} type="primary" size="default" onClick={confirmAction}>Yes</MLButton>
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
      <p aria-label="delete-merge-strategy-text" className={styles.deleteMessage}>Are you sure you want to delete <b>{props.deletePriorityName}</b> priority?</p>
    </Modal>
  );
};

export default MergeDeleteModal;
