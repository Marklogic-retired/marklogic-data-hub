import {HCTable, HCTooltip, HCModal} from "@components/common";
import React, {useContext, useEffect, useState} from "react";
import {faFileExport, faPencilAlt} from "@fortawesome/free-solid-svg-icons";
import {fetchQueries, removeQuery} from "@api/queries";
import {useHistory, useLocation} from "react-router-dom";

import EditQueryDialog from "../edit-query-dialog/edit-query-dialog";
import ExportQueryModal from "../../../query-export/query-export-modal/query-export-modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import HCButton from "../../../common/hc-button/hc-button";
import {Modal} from "react-bootstrap";
import {QueryOptions} from "../../../../types/query-types";
import {SearchContext} from "@util/search-context";
import {UserContext} from "@util/user-context";
import axios from "axios";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {getExportPreview} from "../../../query-export/export-preview/export-preview";
import {getSavedQueryPreview} from "@api/queries";
import {queryDateConverter} from "@util/date-conversion";
import styles from "./manage-query.module.scss";
import {themeColors} from "@config/themes.config";
import tooltipsConfig from "@config/explorer-tooltips.config";

const QueryModal = (props) => {
  const {
    applySaveQuery,
    searchOptions,
    clearAllGreyFacets,
    setSavedQueries
  } = useContext(SearchContext);

  const {handleError} = useContext(UserContext);
  const [editModalVisibility, setEditModalVisibility] = useState(false);
  const [deleteModalVisibility, setDeleteModalVisibility] = useState(false);
  const [exportModalVisibility, setExportModalVisibility] = useState(false);
  const [recordID, setRecordID] = useState();
  const [tableColumns, setTableColumns] = useState<Object[]>();
  const [tableData, setTableData] = useState<Object[]>();
  const [query, setQuery] = useState({});
  const [hasStructured, setStructured] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [queries, setQueries] = useState<any>([]);
  const [currentQueryDescription, setCurrentQueryDescription] = useState("");
  const [currentQueryName, setCurrentQueryName] = useState("");
  const history: any = useHistory();
  const location: any = useLocation();

  useEffect(() => {
    getQueries();
  }, []);

  useEffect(() => {
    updateTableData();
  }, [queries]);

  const getQueries = async () => {
    try {
      const response = await fetchQueries();
      if (response["data"]) {
        setQueries(response["data"]);
        setSavedQueries(response["data"]);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const editQuery = async (query) => {
    const response = await axios.put(`/api/entitySearch/savedQueries`, query);
    if (response.data) {
      getQueries();
      return {code: response.status};
    }
  };

  const deleteQuery = async (query) => {
    try {
      await removeQuery(query);
    } catch (error) {
      handleError(error);
    }
    getQueries();
  };

  const onEdit = () => {
    setEditModalVisibility(true);
  };

  const onDelete = (row) => {
    setCurrentQueryName(row.name);
    setCurrentQueryDescription(row.description);
    setDeleteModalVisibility(true);
  };

  const onClose = () => {
    props.setManageQueryModal(false);
  };

  const onOk = (query) => {
    deleteQuery(query);
    setDeleteModalVisibility(false);
    clearAllGreyFacets();
    let options: QueryOptions = {
      searchText: "",
      entityTypeIds: searchOptions.entityTypeIds,
      selectedFacets: {},
      selectedQuery: "select a query",
      propertiesToDisplay: [],
      sortOrder: [],
      database: searchOptions.database,
    };
    applySaveQuery(options);
    setCurrentQueryDescription("");
  };

  const onCancel = () => {
    setDeleteModalVisibility(false);
  };

  const onApply = (e) => {
    if (location && location.hasOwnProperty("pathname") && location.pathname === "/tiles/explore/detail") {
      queries && queries.length > 0 && queries.forEach(query => {
        if (e.currentTarget.dataset.id === query["savedQuery"]["name"]) {
          history.push({
            pathname: "/tiles/explore",
            state: {
              savedQuery: query["savedQuery"]
            }
          });
        }
      });
    } else {
      queries && queries.length > 0 && queries.forEach(query => {
        if (e.currentTarget.dataset.id === query["savedQuery"]["name"]) {
          let options: QueryOptions = {
            searchText: query["savedQuery"]["query"]["searchText"],
            entityTypeIds: query["savedQuery"]["query"]["entityTypeIds"],
            selectedFacets: query["savedQuery"]["query"]["selectedFacets"],
            selectedQuery: query["savedQuery"]["name"],
            propertiesToDisplay: query.savedQuery.propertiesToDisplay,
            sortOrder: query.savedQuery.sortOrder,
            database: searchOptions.database,
          };
          applySaveQuery(options);
          setCurrentQueryDescription(query["savedQuery"]["description"]);
        }
      });
    }
    props.setManageQueryModal(false);
  };

  const displayExportModal = (id) => {
    setRecordID(id);
    let query;
    queries.forEach((selectedQuery) => {
      if (selectedQuery["savedQuery"]["id"] === id) {
        query = selectedQuery;
      }
    });
    let arrayProperties: any[] = [];
    props.entityDefArray && props.entityDefArray.forEach(entity => {
      if (entity.name === query.savedQuery.query.entityTypeIds[0]) {
        entity.properties && entity.properties.forEach(prop => {
          if (prop.ref.length === 0 && prop.datatype === "array") {
            arrayProperties.push(prop.name);
          }
        });
      }
    });

    let hasArray = query.savedQuery.propertiesToDisplay.length > 0 && arrayProperties.length > 0 && query.savedQuery.propertiesToDisplay.some((prop => arrayProperties.includes(prop)));
    let isStructured = query && query.savedQuery.propertiesToDisplay && query.savedQuery.propertiesToDisplay.some(column => column.includes("."));
    setStructured(hasArray || isStructured);
    (hasArray || isStructured) && getPreview(id);
    setExportModalVisibility(true);
  };

  const columns: any = [
    {
      text: "Name",
      dataField: "name",
      key: "name",
      sort: true,
      formatter: (text, key) => (
        <span className={styles.tableRow}>
          <a data-id={text} data-testid={text} className={styles.name} onClick={onApply}>{text}</a>
        </span>
      ),
    },
    {
      text: "Description",
      dataField: "description",
      key: "description",
      sort: true,
    },
    {
      text: "Edited",
      dataField: "edited",
      key: "edited",
      sort: true,
    },
    {
      text: "Edit",
      dataField: "edit",
      key: "edit",
      formatter: (text, key) => (
        <span className={styles.tableRow}>{text}<i aria-label="editIcon">
          <FontAwesomeIcon icon={faPencilAlt} color={themeColors.info} className={styles.manageQueryIconsHover} onClick={onEdit} size="lg" /></i>
        </span>
      ),
    },
    {
      // ToDo: Disabled export icon should have tooltip to include in task DHFPROD-8519
      text: "Export",
      dataField: "export",
      key: "export",
      formatter: (text, row) => (
        <span className={styles.tableRow}>
          {text}
          <span aria-label="exportIcon">
            {row.canExport
              ? <FontAwesomeIcon icon={faFileExport} color={themeColors.info} size="lg" className={styles.manageQueryIconsHover} onClick={() => displayExportModal(row.key)} />
              : <HCTooltip text={tooltipsConfig.manageQueries.disabledExport} id={"export-query-disabled-tooltip"} placement="top">
                <span>
                  <FontAwesomeIcon icon={faFileExport} color={themeColors.light} className={"cursor-not-allowed"} size="lg" />
                </span>
              </HCTooltip>
            }
          </span>
        </span>
      ),
    },
    {
      text: "Delete",
      dataField: "delete",
      key: "delete",
      formatter: (text, row) => (
        <span className={styles.tableRow}>{text}<i aria-label="deleteIcon">
          <FontAwesomeIcon icon={faTrashAlt} color={themeColors.info} size="lg" className={styles.manageQueryIconsHover} onClick={() => onDelete(row)} /></i>
        </span>
      ),
    }
  ];

  const editObj = {
    title: "Edit",
    dataIndex: "edit",
    key: "edit",
    align: "center" as "center",
    render: text => <a data-testid={"edit"} onClick={onEdit}>{text}</a>,
    width: 75
  };

  // TODO: Uncomment once link for query is implemented
  // const linkObj = {
  //     title: 'Link',
  //     dataIndex: 'link',
  //     key: 'link',
  //     align: 'center' as 'center',
  //     width: 75,
  //     render: text => <a data-testid={'link'}>{text}</a>
  // };

  const deleteObj = {
    title: "Delete",
    dataIndex: "delete",
    key: "delete",
    align: "center" as "center",
    render: (text, row) => <a data-testid={"delete"} onClick={() => onDelete(row)}>{text}</a>,
    width: 75
  };

  const exportObj = {
    title: "Export",
    dataIndex: "export",
    key: "export",
    align: "center" as "center",
    render: text => <a data-testid={"export"} >{text}</a>,
    onCell: record => {
      return {
        onClick: () => {
          displayExportModal(record.key);
        }
      };
    },
    width: 75
  };

  if (props.isSavedQueryUser) {
    columns.push(editObj);
  }

  if (props.canExportQuery) {
    columns.push(exportObj);
  }

  if (props.isSavedQueryUser) {
    // TODO: Uncomment once link for query is implemented
    // columns.push(linkObj);
    columns.push(deleteObj);
  }

  const updateTableData = () => {
    let data: any[] = [];
    queries && queries.length > 0 && queries.forEach(query => {
      data.push(
        {
          key: query["savedQuery"]["id"],
          name: query["savedQuery"]["name"],
          description: query["savedQuery"]["description"],
          edited: queryDateConverter(query["savedQuery"]["systemMetadata"]["lastUpdatedDateTime"]),
          canExport: query["savedQuery"]["propertiesToDisplay"]?.length !== 0
          //edit: <FontAwesomeIcon icon={faPencilAlt} color={themeColors.info} size="lg" className={styles.manageQueryIconsHover} />,
          //export: <FontAwesomeIcon icon={faFileExport} color={themeColors.info} size="lg" className={styles.manageQueryIconsHover} />,
          // TODO: Uncomment once link for query is implemented
          // link: <FontAwesomeIcon icon={faLink} color={themeColors.info} size='lg' />,
          //delete: <FontAwesomeIcon icon={faTrashAlt} color={themeColors.info} size="lg" className={styles.manageQueryIconsHover} />
        }
      );
    });
    setData(data);
  };

  const deleteConfirmation = <HCModal
    show={deleteModalVisibility}
    onHide={onCancel}
  >
    <Modal.Header className={"bb-none"}>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
    </Modal.Header>
    <Modal.Body className={"pt-0 px-4"}>
      <span style={{fontSize: "16px"}} data-testid="deleteConfirmationText">
        Are you sure you would like to delete the <b>{currentQueryName}</b> query? This action cannot be undone.
      </span>
      <div className={"d-flex justify-content-center pt-4 pb-2"}>
        <HCButton className={"me-2"} variant="outline-light" aria-label={"No"} onClick={onCancel}>
          {"No"}
        </HCButton>
        <HCButton aria-label={"Yes"} variant="primary" type="submit" onClick={() => onOk(query)}>
          {"Yes"}
        </HCButton>
      </div>
    </Modal.Body>
  </HCModal>;

  const getPreview = async (id) => {
    try {
      const response = await getSavedQueryPreview(id, searchOptions.database);
      if (response.data) {
        const preview = getExportPreview(response.data);
        const header = preview[0];
        const body = preview[1];
        setTableColumns(header);
        setTableData(body);
      } else {
        setTableColumns([]);
        setTableData([]);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      queries.forEach((query) => {
        if (query["savedQuery"]["id"] === row.key) {
          setQuery(query);
          setCurrentQueryName(row.name);
        }
      });
    },
  };

  return (
    <div>
      <ExportQueryModal hasStructured={hasStructured} queries={queries} tableColumns={tableColumns} tableData={tableData} recordID={recordID} exportModalVisibility={exportModalVisibility} setExportModalVisibility={setExportModalVisibility} />
      <HCModal
        show={props.modalVisibility}
        size={"lg"}
        dialogClassName={styles.modal1000w}
        onHide={onClose}
      >
        <Modal.Header className={"bb-none"} data-testid="manage-queries-modal">
          <span className={styles.title}>{"Manage Queries"}</span>
          <button type="button" className="btn-close manage-modal-close-icon" aria-label="Close" onClick={onClose}></button>
        </Modal.Header>
        <Modal.Body>
          <HCTable
            columns={columns}
            data={data}
            rowEvents={rowEvents}
            pagination={true}
            rowKey="QueryManageKey"
          />
        </Modal.Body>
      </HCModal>
      <EditQueryDialog
        currentQueryName={currentQueryName}
        setCurrentQueryName={setCurrentQueryName}
        currentQueryDescription={currentQueryDescription}
        setCurrentQueryDescription={setCurrentQueryDescription}
        query={query}
        editQuery={editQuery}
        getQueries={getQueries}
        editModalVisibility={editModalVisibility}
        setEditModalVisibility={setEditModalVisibility}
      />
      {deleteConfirmation}
    </div>
  );
};

export default QueryModal;
