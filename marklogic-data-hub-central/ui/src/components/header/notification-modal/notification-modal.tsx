import {Modal} from "react-bootstrap";
import React, {useContext, useEffect} from "react"; // eslint-disable-line @typescript-eslint/no-unused-vars
import {NotificationContext} from "@util/notification-context";
import styles from "./notification-modal.module.scss";
import {TbClipboardText} from "react-icons/tb";

const NotificationModal = (props) => {

  const {notificationOptions} = useContext(NotificationContext); // eslint-disable-line @typescript-eslint/no-unused-vars

  const onCancel = () => {
    props.setNotificationModalVisible(false);
  };

  return (
    <Modal
      show={props.notificationModalVisible}
      onHide={() => onCancel()}
      dialogClassName={styles.notificationModal}
      keyboard={true}
      backdrop="static"
      className={props.notificationModalVisible ? styles.disabledMain : ""}
    >
      <Modal.Body className={styles.notificationModalBody} >
        <Modal.Header className={"bb-none"}>
          {notificationOptions.totalCount < 1 ? null : <span className={"fs-3"} aria-label={"notification-modal-title"}>{"Merge Notifications"}</span>}
          <button type="button" className="btn-close" aria-label="Close" onClick={onCancel} style={{"marginTop": "-30px"}}>
          </button>
        </Modal.Header>
        <div className={styles.notificationModalContainer}>
          {notificationOptions.totalCount < 1 ?
            <div className={styles.emptyList}>
              <i><TbClipboardText className={styles.emptyListIcon} aria-label="icon: empty-list"/></i>
              <div className={styles.emptyText}><strong>No Merge Notifications Present</strong></div>
            </div>
            : null //implement table here
          }
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default NotificationModal;
