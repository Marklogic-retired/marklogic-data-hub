import {Modal} from "react-bootstrap";
import React, {useContext, useEffect, useState} from "react";
import {defaultNotificationOptions, NotificationContext} from "@util/notification-context";
import styles from "./notification-modal.module.scss";
import {TbClipboardText} from "react-icons/tb";
import {HCTable, HCTooltip, HCModal} from "@components/common";
import {MdCallMerge} from "react-icons/md";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {dateConverter} from "../../../util/date-conversion";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {themeColors} from "@config/themes.config";
import {AuthoritiesContext} from "@util/authorities";
import ConfirmationModal from "../../confirmation-modal/confirmation-modal";
import {ConfirmationType} from "../../../types/common-types";
import {getNotifications} from "@api/merging";
import {SecurityTooltips} from "@config/tooltips.config";
import {mergeUris, deleteNotification} from "@api/merging";
import {Spinner} from "react-bootstrap";
import {previewMatchingActivity, getDocFromURI, getPreviewFromURIs} from "@api/matching";
import CompareValuesModal from "../../../components/entities/matching/compare-values-modal/compare-values-modal";
import SearchPaginationSimple from "@components/search-pagination-simple/search-pagination-simple";


const NotificationModal = (props) => {

  const {notificationOptions} = useContext(NotificationContext); // eslint-disable-line @typescript-eslint/no-unused-vars
  const authorityService = useContext(AuthoritiesContext);
  const canReadMatchMerge = authorityService.canReadMatchMerge();
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [rowInformation, setRowInformation] = useState<any>({});
  const {setNotificationsObj} = useContext(NotificationContext);
  const [activeUri, setActiveUri] = useState<string>("");
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [activeEntityArray, setActiveEntityArray] = useState<any>([]);
  const [activeEntityUris, setActiveEntityUris] = useState<string[]>([]);
  const [flowName, setFlowname] = useState<string>("");
  const [previewMatchedActivity, setPreviewMatchedActivity] = useState<{}>({sampleSize: 100, uris: [], actionPreview: []});
  const [loading, setToggleLoading] = useState<string>("");
  const [uriInfo, setUriInfo] = useState<any>();


  let idRow = 0, idRowAux = 0, pageLength = notificationOptions.pageLength, totalRowsLastPage = notificationOptions.pageLength;
  const {notifications, totalCount, pageLength: defaultPageLength} = defaultNotificationOptions;

  const checkRowsPerPage = (totalRows) => {
    let totalPages = Math.floor(totalRows / pageLength);
    let rem = totalRows % pageLength;
    if (rem > 0) totalPages = totalPages + 1;
    if (totalPages === pageTableNotification) {
      totalRowsLastPage = totalRows - (pageLength * (totalPages - 1));
    }
  };

  const confirmAction = async () => {
    let uri = rowInformation && rowInformation?.meta?.uri;
    await deleteNotification(uri).then((responseDelete: any) => {
      let totalRows = notificationOptions?.totalCount;
      checkRowsPerPage(totalRows);
      if (responseDelete) fetchNotifications(pageTableNotification, totalRowsLastPage - 1 === 0 ? defaultPageLength : totalRowsLastPage - 1, false);
      //if one notification left on the last page and its merged or deleted
      if (totalRowsLastPage - 1 === 0) {
        updatePage(pageTableNotification - 1);
      }
    });
    toggleConfirmModal(false);
  };

  const fetchNotifications = async (page?, pageLength?, updated?) => {
    await getNotifications((page - 1) * 10 + 1, pageLength)
      .then((resp: any) => {
        if (resp && resp.data) {
          setNotificationsObj(resp.data.notifications, resp.data.total, defaultPageLength, updated);
        } else {
          setNotificationsObj(notifications, totalCount, defaultPageLength, updated);
        }
      })
      .catch((err) => {
        if (err.response) {
          setNotificationsObj(notifications, totalCount, defaultPageLength, updated);
        } else {
          setNotificationsObj(notifications, totalCount, defaultPageLength, updated);
        }
      });
  };

  const columns: any = [
    {
      text: "Label",
      dataField: "meta.label",
      key: "meta.label",
      formatter: (text) => (
        <span className={styles.tableRow}>{text}
        </span>
      ),
    },
    {
      text: "Entity Type",
      dataField: "meta.entityName",
      key: "meta.entityName",
    },
    {
      text: "Matches",
      dataField: "uris.length",
      key: "matches",
    },
    {
      text: "Date",
      dataField: "meta.dateTime",
      key: "meta.dateTime",
      formatter: (text) => (
        <span className={styles.tableRow}>{dateConverter(text)}</span>
      ),
    },
    {
      text: "Actions",
      //dataField: "Actions",
      key: "Actions",
      formatter: (text, row) => (
        <>
          <span className={styles.tableRow}>{text}
            {
              canReadMatchMerge ?
                <HCTooltip text={"Merge"} id={`merge-icon${idRow++}`} placement="top-end">
                  <i><MdCallMerge color={themeColors.info} className={styles.mergeIcon} data-testid={`merge-icon${idRow}`} aria-label={`merge-icon`} onClick={() => openMergeCompare(row)} /></i>
                </HCTooltip>
                :
                <HCTooltip text={SecurityTooltips.missingPermission} id="missing-permission-tooltip" placement="top-end">
                  <i><MdCallMerge color={themeColors.info} className={styles.mergeIconDisabled} data-testid={`disabled-merge-icon`} aria-label={`disabled-merge-icon`} /></i>
                </HCTooltip>
            }
          </span>
          <span className={styles.tableRow}>{text}
            {
              canReadMatchMerge ?
                <HCTooltip text={"Delete"} id={`delete-icon${idRowAux++}`} placement="top-end">
                  <i aria-label={`deleteIcon`}><FontAwesomeIcon icon={faTrashAlt} color={themeColors.info} data-testid={`delete-icon${idRowAux}`} className={styles.deleteRow} onClick={() => onDelete(row)} size="lg" /></i>
                </HCTooltip>
                :
                <HCTooltip text={SecurityTooltips.missingPermission} id="disabled-delete-icon" placement="top-end">
                  <i aria-label={`disabledDeleteIcon`}><FontAwesomeIcon icon={faTrashAlt} color={themeColors.info} data-testid={`delete-icon${idRowAux}-disabled`} className={styles.deleteRowDisabled} size="lg" /></i>
                </HCTooltip>
            }
          </span>
          <span className={styles.tableRow}>{text}
            {
              loading === row.meta.uri ?
                <Spinner
                  data-testid="hc-button-component-spinner"
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className={styles.spinner}
                />
                : null
            }
          </span>
        </>
      ),
      formatExtraData: {loading}
    },
  ];

  const onCancel = () => {
    props.setNotificationModalVisible(false);
  };

  const onDelete = (row) => {
    toggleConfirmModal(true);
    setRowInformation(row);
  };

  const submitMergeUri = async (uri, payload) => {
    const documentsHaveMerged = await mergeUris(payload);
    if (documentsHaveMerged) {
      await deleteNotification(activeUri).then((resp) => {
        let totalRows = notificationOptions?.totalCount;
        checkRowsPerPage(totalRows);
        if (resp) fetchNotifications(pageTableNotification, totalRowsLastPage - 1 === 0 ? defaultPageLength : totalRowsLastPage - 1, false);
        if (totalRowsLastPage - 1 === 0) {
          updatePage(pageTableNotification - 1);
        }
      });
    }
  };

  useEffect(() => {
    if (notificationOptions.runUpdated) {
      updatePage(1);
    }
  }, [notificationOptions]);


  const openMergeCompare = async (item) => {
    let arrayUris = item.uris.map((elem) => { return elem["uri"]; });
    let activeEntityIndex = props.entityDefArray.findIndex((entity) => entity.name === item.meta.entityName);
    setActiveEntityArray([props.entityDefArray[activeEntityIndex]]);
    setActiveEntityUris(arrayUris);
    setActiveUri(item.meta.uri);
    setToggleLoading(item.meta.uri);
    await fetchCompareData(arrayUris, item);
    setCompareModalVisible(true);
  };

  const fetchCompareData = async (array, item) => {
    const result1 = await getDocFromURI(array[0]);
    const result2 = await getDocFromURI(array[1]);
    const flowName = result1.data.recordMetadata.datahubCreatedInFlow;
    const preview = (flowName) ? await getPreviewFromURIs(flowName, array) : null;
    if (result1.status === 200 && result2.status === 200 && preview?.status === 200) {
      let result1Instance = result1.data.data.envelope.instance;
      let result2Instance = result2.data.data.envelope.instance;
      let previewInstance = preview.data.value.envelope.instance;
      setFlowname(result1.data.recordMetadata.datahubCreatedInFlow);
      await setUriInfo([{result1Instance}, {result2Instance}, {previewInstance}]);
    }

    let testMatchData = {
      restrictToUris: true,
      uris: array,
      sampleSize: 100,
      stepName: item.meta.matchStepName
    };

    let previewMatchActivity = await previewMatchingActivity(testMatchData);
    if (previewMatchActivity) {
      setToggleLoading("");
      setPreviewMatchedActivity(previewMatchActivity);
    }
  };

  const [pageTableNotification, setPageTableNotification] = useState(1);

  const updatePage = (p) => {
    setPageTableNotification(p);
  };

  useEffect(() => {
    let totalRows = notificationOptions?.totalCount;
    let totalPages = Math.floor(totalRows / pageLength);
    let rem = totalRows % pageLength;
    if (rem > 0) totalPages = totalPages + 1;
    if (totalPages === pageTableNotification) {
      totalRowsLastPage = totalRows - (pageLength * (totalPages - 1));
    }
    fetchNotifications(pageTableNotification, totalRowsLastPage);
  }, [pageTableNotification]);

  return (
    <div>
      <HCModal
        show={props.notificationModalVisible}
        onHide={onCancel}
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
          <div className={notificationOptions.totalCount < 1 ? styles.emptyNotificationModalContainer : styles.notificationModalContainer}>
            {notificationOptions.totalCount < 1 ?
              <div className={styles.emptyList}>
                <i><TbClipboardText className={styles.emptyListIcon} aria-label="icon: empty-list" /></i>
                <div className={styles.emptyText}><strong>No Merge Notifications Present</strong></div>
              </div>
              :
              notificationOptions?.notifications && <><HCTable
              pagination={false}
              columns={columns}
              data={notificationOptions?.notifications}
              rowKey="notificationsTable"
            />
            <SearchPaginationSimple
              total={notificationOptions?.totalCount}
              pageSize={pageLength}
              pageNumber={pageTableNotification}
              maxRowsPerPage={pageLength}
              updatePage={updatePage}
            />
            </>
            }
          </div>
        </Modal.Body>
      </HCModal>
      <ConfirmationModal
        isVisible={showConfirmModal}
        type={ConfirmationType.DeleteNotificationRow}
        boldTextArray={[]}
        toggleModal={toggleConfirmModal}
        confirmAction={confirmAction}
      />
      <CompareValuesModal
        isVisible={compareModalVisible}
        toggleModal={setCompareModalVisible}
        uriInfo={uriInfo}
        activeStepDetails={activeEntityArray}
        entityProperties={{}}
        uriCompared={activeEntityUris}
        previewMatchActivity={previewMatchedActivity}
        entityDefinitionsArray={activeEntityArray}
        uris={activeEntityUris}
        isPreview={false}
        isMerge={true}
        flowName={flowName}
        mergeUris={async (payload) => submitMergeUri(activeUri, payload)}
        unmergeUri={{}}
        fetchNotifications={fetchNotifications}
        originalUri={activeUri}
      />
    </div>
  );
};

export default NotificationModal;
