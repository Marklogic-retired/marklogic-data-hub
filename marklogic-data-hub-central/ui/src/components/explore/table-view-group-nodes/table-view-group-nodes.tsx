import React, {useState, useEffect, useContext, useRef} from "react";
import {Form, Modal, Pagination} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import styles from "./table-view-group-nodes.module.scss";
import {HCButton} from "@components/common";
import ResultsTabularView from "@components/results-tabular-view/results-tabular-view";
import {searchResultsQuery} from "@api/queries";
import {SearchContext} from "@util/search-context";
import {getTableProperties} from "@util/data-conversion";
import {UserContext} from "@util/user-context";
import {expandThresholdExceededWarning, graphViewConfig} from "@config/explore.config";
import {pagePropertiesType} from "types/query-types";
import {HCModal} from "@components/common";

type Props = {
  isVisible: boolean;
  toggleTableViewForGroupNodes: (isVisible: boolean) => void;
  relatedToData: any;
};

const TableViewGroupNodes: React.FC<Props> = (props) => {
  const {isVisible, toggleTableViewForGroupNodes, relatedToData} = props;

  const {
    handleError
  } = useContext(UserContext);
  const {
    searchOptions
  } = useContext(SearchContext);
  const [isLoading, setIsLoading] = useState(false);
  const componentIsMounted = useRef(true);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [entityPropertyDefinitions, setEntityPropertyDefinitions] = useState<any[]>([]);
  const [selectedPropertyDefinitions, setSelectedPropertyDefinitions] = useState<any[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);

  // Pagination
  const defaultPageProperties: pagePropertiesType = graphViewConfig.groupNodeTableView.defaultPageProperties;
  const [pageSizeOptions, setPageSizeOptions] = useState<string[]>([]);
  const [pageProperties, setPageProperties] = useState(defaultPageProperties);
  const {pageSize} = pageProperties;
  const totalPage = Math.ceil(totalDocuments / pageSize);

  useEffect(() => {
    if (isVisible && relatedToData) {
      getSearchResultsForGroupNode(relatedToData, defaultPageProperties);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && relatedToData && pageProperties) {
      getSearchResultsForGroupNode(relatedToData, pageProperties);
    }
  }, [pageProperties]);

  useEffect(() => {
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  const getSearchResultsForGroupNode = async (relatedTableData: any, pageProperties) => {
    try {
      setIsLoading(true);
      let searchPayload = {
        database: searchOptions?.database,
        data: {
          query: {
            entityTypeIds: [relatedTableData.entityTypeId],
            selectedFacets: {},
            hideHubArtifacts: true,
            relatedDocument: !relatedTableData ? null : {
              docIRI: relatedTableData.parentNode,
              predicate: relatedTableData.predicateFilter
            }
          },
          propertiesToDisplay: searchOptions.selectedTableProperties,
          start: pageProperties.start,
          pageLength: pageProperties.pageLength,
          sortOrder: searchOptions?.sortOrder
        }
      };
      const response = await searchResultsQuery(searchPayload);
      if (componentIsMounted.current && response.data) {
        if (response.data.entityPropertyDefinitions) {
          setData(response.data.results);
        }
        if (response.data.hasOwnProperty("entityPropertyDefinitions")) {
          setEntityPropertyDefinitions(response.data.entityPropertyDefinitions);
        }
        if (response.data.hasOwnProperty("selectedPropertyDefinitions")) {
          setSelectedPropertyDefinitions(response.data.selectedPropertyDefinitions);
        }

        setTotalDocuments(response.data.total);

        if (response.data.selectedPropertyDefinitions && response.data.selectedPropertyDefinitions.length) {
          let properties = getTableProperties(response.data.selectedPropertyDefinitions);
          setColumns(properties);
        }
      }
    } catch (error) {
      console.error("error", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const modalTitle = () => {
    const {entityTypeId, parentNode} = relatedToData;
    let parentNodeURIParts = parentNode?.split("/");
    let baseEntity = parentNodeURIParts && parentNodeURIParts[parentNodeURIParts.length-2];
    let baseRecordLabel = parentNodeURIParts && parentNodeURIParts[parentNodeURIParts.length-1];
    return (
      <div className={styles.modalTitleContainer}>
        <div className={styles.modalTitle} aria-label={`title-${entityTypeId}`}>{`Group of ${entityTypeId} records`}</div>
        <div>Base Entity: <span className={styles.baseEntity} aria-label={`baseEntity-${baseEntity}`}>{baseEntity}</span></div>
        <div>Base Record Label: <span className={styles.baseEntity} aria-label={`baseRecordLabel-${baseRecordLabel}`}>{baseRecordLabel}</span></div>
      </div>
    );
  };

  const exceededThresholdWarning = (
    <div className={styles.exceededThresholdWarning} aria-label="exceededThresholdWarning">
      <span><i data-testid="warning-large-data"><FontAwesomeIcon icon={faExclamationTriangle} className={styles.largeDatasetWarning} /></i></span> {expandThresholdExceededWarning(relatedToData.entityTypeId)}
    </div>
  );

  const closeModal = () => {
    toggleTableViewForGroupNodes(false);
  };

  const setPerPageSelector = (maxRowsPerPage: number) => {
    let pageOptionsDropdown: string[] = [];
    const defaultRows: number = 20;
    let n = 1;
    let pageSize = defaultRows / 2;
    pageOptionsDropdown.push(pageSize.toString());
    pageSize = defaultRows;
    while (pageSize < maxRowsPerPage) {
      pageOptionsDropdown.push(pageSize.toString());
      pageSize = (1 << n) * defaultRows;
      n++;
    }
    setPageSizeOptions(pageOptionsDropdown);
  };

  useEffect(() => {
    setPerPageSelector(pageProperties.maxRowsPerPage);
  }, [pageProperties.maxRowsPerPage]);

  const setPage = (pageNumber: number, totalDocuments: number) => {
    let pageLength = pageProperties.pageSize;
    let start = pageNumber === 1 ? 1 : (pageNumber - 1) * pageProperties.pageSize + 1;

    if ((totalDocuments - ((pageNumber - 1) * pageProperties.pageSize)) < pageProperties.pageSize) {
      pageLength = (totalDocuments - ((pageNumber - 1) * pageProperties.pageLength));
    }
    setPageProperties({
      ...pageProperties,
      start,
      pageNumber,
      pageLength,
    });
  };

  const setPageLength = (pageSize: number) => {
    setPageProperties({
      ...pageProperties,
      start: 1,
      pageNumber: 1,
      pageLength: pageSize,
      pageSize,
    });
  };

  const onPageChange = (pageNumber) => {
    setPage(pageNumber, totalDocuments);
  };

  const onPageSizeChange = ({target}) => {
    const {value} = target;
    setPageLength(+value);
  };

  const handleNext = () => {
    const {pageNumber} = pageProperties;
    if (pageNumber < totalPage) {
      onPageChange(pageNumber + 1);
    }
  };
  const handlePrev = () => {
    const {pageNumber} = pageProperties;
    if (pageNumber - 1 >= 1) {
      onPageChange(pageNumber - 1);
    }
  };

  let isPageNumberOutOfRange;

  const renderPages = [...new Array(totalPage)].map((_, index) => {
    const {pageNumber: currentPage} = pageProperties;
    const pageNumber = index + 1;
    const isPageNumberFirst = pageNumber === 1;
    const isPageNumberLast = pageNumber === totalPage;
    const isCurrentPageWithinTwoPageNumbers =
      Math.abs(pageNumber - currentPage) <= 2;

    if (
      isPageNumberFirst ||
      isPageNumberLast ||
      isCurrentPageWithinTwoPageNumbers
    ) {
      isPageNumberOutOfRange = false;
      return (
        <Pagination.Item
          key={pageNumber}
          data-testid={`pagination-item-${pageNumber}`}
          id={`pagination-item-${pageNumber}`}
          active={pageProperties.pageNumber === pageNumber}
          onClick={() => onPageChange(pageNumber)}>
          {pageNumber}
        </Pagination.Item>
      );
    }

    if (!isPageNumberOutOfRange) {
      isPageNumberOutOfRange = true;
      return <Pagination.Ellipsis key={pageNumber} className="muted" />;
    }

    return null;
  });

  const renderOptions = () => {
    const options = pageSizeOptions.map((item, index) => {
      return <option key={index} className={+item === +pageProperties.pageSize ? styles.optionSelected : ""} value={item}>{item} / page</option>;
    });
    return options;
  };

  const renderPagination = (
    <div className={styles.paginationContainer}>
      <Pagination data-testid="pagination" id="pagination" className={styles.paginationWrapper}>
        <Pagination.Prev onClick={handlePrev} disabled={pageProperties.pageNumber === 1} className={`${pageProperties.pageNumber === 1 && styles.disable} ${styles.corner}`} />
        {renderPages}
        <Pagination.Next onClick={handleNext} disabled={pageProperties.pageNumber === totalPage} className={`${pageProperties.pageNumber === totalPage && styles.disable} ${styles.corner}`} />
      </Pagination>
      <Form.Select data-testid="pageSizeSelect" color="secondary" id="pageSizeSelect" value={pageProperties.pageSize} onChange={onPageSizeChange} className={styles.select}>
        {renderOptions()}
      </Form.Select>
    </div>
  );

  const modalFooter = (
    <div className={styles.editFooter}>
      <div className={styles.footer}>
        <HCButton
          size="sm"
          variant="primary"
          aria-label={`closeGroupNodeModal`}
          onClick={closeModal}
        >Close</HCButton>
      </div>
    </div>
  );

  const displayWarning = () => {
    return !!relatedToData?.exceededThreshold;
  };

  return (
    <HCModal
      show={isVisible}
      size={"lg"}
      dialogClassName={styles.modalDialog}
      onHide={closeModal}
    >
      <div className={styles.modalInfoContainer}>
        <Modal.Header className={"bb-none align-items-start"}>
          {modalTitle()}
          <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
        </Modal.Header>
        {displayWarning() && exceededThresholdWarning}
      </div>
      <Modal.Body>

        <div className={styles.tableViewResult}>
          <ResultsTabularView
            data={data}
            entityPropertyDefinitions={entityPropertyDefinitions}
            selectedPropertyDefinitions={selectedPropertyDefinitions}
            columns={columns}
            selectedEntities={searchOptions.entityTypeIds}
            isLoading={isLoading}
            groupNodeTableView={true}
          />
        </div>
        <div className={styles.searchPaginationContainer}>
          {totalDocuments > 20 && renderPagination}
        </div>
        {modalFooter}
      </Modal.Body>
    </HCModal>
  );
};

export default TableViewGroupNodes;
