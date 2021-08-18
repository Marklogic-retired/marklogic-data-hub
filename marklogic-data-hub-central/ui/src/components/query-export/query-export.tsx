import React, {useState, useContext} from "react";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {SearchContext} from "../../util/search-context";
import styles from "../query-export/query-export.module.scss";
import ExportQueryModal from "./query-export-modal/query-export-modal";
import {UserContext} from "../../util/user-context";
import {getExportPreview} from "../query-export/export-preview/export-preview";
import {getExportQueryPreview} from "../../api/queries";
import {Tooltip} from "antd";


const QueryExport = (props) => {
  const [tableColumns, setTableColumns] = useState<Object[]>([]);
  const [tableData, setTableData] = useState<Object[]>();
  const [exportModalVisibility, setExportModalVisibility] = useState(false);
  const [hasStructured, setStructured] = useState<boolean>();
  const {
    handleError
  } = useContext(UserContext);

  const {
    searchOptions
  } = useContext(SearchContext);

  const displayModal = () => {
    if (props.selectedPropertyDefinitions.some(prop => (prop.hasOwnProperty("properties") || prop.multiple === true))) {
      getPreview();
      setStructured(true);
    } else {
      setStructured(false);
    }
    setExportModalVisibility(true);
  };

  const getPreview = async () => {
    let query = {
      savedQuery: {
        id: "",
        name: "",
        description: "",
        query: {
          searchText: searchOptions.query,
          entityTypeIds: searchOptions.entityTypeIds.length ? searchOptions.entityTypeIds : props.entities,
          selectedFacets: searchOptions.selectedFacets,
        },
        propertiesToDisplay: props.columns,
      }
    };

    try {
      const response = await getExportQueryPreview(query, searchOptions.database);
      if (response) {
        const preview = getExportPreview(response);
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

  return (
    <div>
      <ExportQueryModal hasStructured={hasStructured} getPreview={getPreview} tableColumns={tableColumns} tableData={tableData} exportModalVisibility={exportModalVisibility} setExportModalVisibility={setExportModalVisibility} columns={props.columns} />
      <Tooltip title="Export results with the displayed columns to CSV." placement="topRight">
        <FontAwesomeIcon className={styles.fileExportIcon} icon={faFileExport} size="lg" onClick={displayModal} data-testid="query-export" />
      </Tooltip>
    </div>
  );
};

export default QueryExport;
