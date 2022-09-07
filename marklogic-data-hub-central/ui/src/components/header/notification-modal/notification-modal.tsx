import {Modal} from "react-bootstrap";
import React, {useContext, useEffect} from "react"; // eslint-disable-line @typescript-eslint/no-unused-vars
import {NotificationContext} from "@util/notification-context";
import styles from "./notification-modal.module.scss";
import {TbClipboardText} from "react-icons/tb";
import {HCTable} from "@components/common";
import {HCTooltip} from "@components/common";
import {RiMergeCellsHorizontal} from "react-icons/ri";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {dateConverter} from "../../../util/date-conversion";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {themeColors} from "@config/themes.config";
import {AuthoritiesContext} from "@util/authorities";

const NotificationModal = (props) => {

  const {notificationOptions} = useContext(NotificationContext); // eslint-disable-line @typescript-eslint/no-unused-vars
  const authorityService = useContext(AuthoritiesContext);
  const canReadMatchMerge = authorityService.canReadMatchMerge();

  const columns: any = [
    {
      text: "Label",
      dataField: "label",
      key: "label",
      sort: true,
      formatter: (text, key) => (
        <span className={styles.tableRow}>{text}
          Sample text
        </span>
      ),
    },
    {
      text: "Entity Type",
      dataField: "meta.entityName",
      key: "meta.entityName",
      sort: true,
    },
    {
      text: "Matches",
      dataField: "uris.length",
      key: "matches",
      sort: true,
    },
    {
      text: "Date",
      dataField: "meta.dateTime",
      key: "meta.dateTime",
      sort: true,
      formatter: (text, key) => (
        <span className={styles.tableRow}>{dateConverter(text)}</span>
      ),
    },
    {
      text: "Actions",
      //dataField: "Actions",
      key: "Actions",
      formatter: (text, row) => (
        <><HCTooltip text={"Merge Documents"} id="merge-icon" placement="top-end">
          <span className={styles.tableRow}>{text}<i aria-label="mergeUnmergeIcon">
            <RiMergeCellsHorizontal color={themeColors.info} className={styles.mergeIcon} data-testid={`merge-icon`} aria-label={`unmerge-icon`} onClick={() => canReadMatchMerge && openMergeCompare(row)} />
          </i>
          </span>
        </HCTooltip>
        <HCTooltip text={"Delete Documents"} id="merge-icon" placement="top-end">
          <span className={styles.tableRow}>{text}<i aria-label="deleteIcon">
            <FontAwesomeIcon icon={faTrashAlt} color={themeColors.info} className={styles.deleteRow} onClick={() => onDelete(row)} size="lg" />
          </i>
          </span>
        </HCTooltip>
        </>
      ),
    },
  ];

  const paginationOptions = {
    defaultCurrent: 1,
    defaultPageSize: 20,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "40", "60"]
  };

  const onCancel = () => {
    props.setNotificationModalVisible(false);
  };

  const onDelete = (row) => {
    // setCurrentQueryName(row.name);
    // setCurrentQueryDescription(row.description);
    // setDeleteModalVisibility(true);
  };

  const openMergeCompare = async (item) => {
    //setCompareModalVisible(true)
    // let arrayUris = item.notifiedDocumentUris;
    // let activeEntityIndex = props.entityDefArray.findIndex((entity) => entity.name === item["entityName"]);
    // setFlowname(item.hubMetadata.lastProcessedByFlow);
    // setActiveEntityArray([props.entityDefArray[activeEntityIndex]]);
    // setActiveEntityUris(arrayUris);
    // setToggleLoading(item.uri);
    // await fetchCompareData(arrayUris, item);
    // setCompareModalVisible(true);
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
            :
            notificationOptions?.notifications && <HCTable
            pagination={paginationOptions}
            columns={columns}
            data={notificationOptions?.notifications}
            rowKey="notificationsTable"
          />
          }
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default NotificationModal;
