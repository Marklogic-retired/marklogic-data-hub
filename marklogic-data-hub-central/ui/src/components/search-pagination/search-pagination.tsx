import React, {useContext, useState, useEffect} from "react";
import {Pagination, Form} from "react-bootstrap";
import {SearchContext} from "@util/search-context";
import styles from "./search-pagination.module.scss";
import {MonitorContext} from "@util/monitor-context";
import {getViewSettings, setViewSettings} from "@util/user-context";

interface Props {
  total: number;
  pageNumber: number;
  pageSize: number;
  pageLength: number;
  maxRowsPerPage: number;
}

const SearchPagination: React.FC<Props> = props => {
  const {searchOptions, setPage, setPageLength} = useContext(SearchContext);
  const {setMonitorPage, setMonitorPageLength} = useContext(MonitorContext);

  const [pageSizeOptions, setPageSizeOptions] = useState<string[]>([]);
  const totalPage = Math.ceil(props.total / props.pageSize);

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
    setPerPageSelector(props.maxRowsPerPage);
  }, [props.maxRowsPerPage]);

  const onPageChange = pageNumber => {
    if (pageNumber !== props.pageNumber) {
      if (searchOptions.tileId === "explore") setPage(pageNumber, props.total);
      else setMonitorPage(pageNumber, props.total);
      saveCurrentPageSizeSession(pageNumber, "");
    }
  };

  const onPageSizeChange = ({target}) => {
    const {value} = target;
    if (searchOptions.tileId === "explore") setPageLength(props.pageNumber, +value);
    else setMonitorPageLength(props.pageNumber, +value);
    saveCurrentPageSizeSession("", value);
  };

  const handleNext = () => {
    const {pageNumber} = props;
    if (pageNumber < totalPage) {
      onPageChange(pageNumber + 1);
    }
  };
  const handlePrev = () => {
    const {pageNumber} = props;
    if (pageNumber - 1 >= 1) {
      onPageChange(pageNumber - 1);
    }
  };

  const saveCurrentPageSizeSession = (page, size) => {
    const storage = getViewSettings();
    let newDataStorage;
    if (searchOptions.tileId === "monitor") {
      newDataStorage = {
        ...storage,
        monitorStepsFlowsTable: {
          ...storage.monitorStepsFlowsTable,
          pageNumberTable: page !== "" ? page : storage?.monitorStepsFlowsTable?.pageNumberTable,
          pageSizeTable: size !== "" ? size : storage?.monitorStepsFlowsTable?.pageSizeTable,
        },
      };
      setViewSettings(newDataStorage);
    }
  };

  const pageKeyDownHandler = (event, pageNumber) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPageChange(pageNumber);
    }
  };
  const arrowNextKeyDownHandler = event => {
    if (event.key === "Enter" || event.key === " ") {
      handleNext();
    }
  };
  const arrowPreviousKeyDownHandler = event => {
    if (event.key === "Enter" || event.key === " ") {
      handlePrev();
    }
  };

  const renderPages = [...new Array(totalPage)].map((_, index) => {
    const {pageNumber: currentPage} = props;
    const pageNumber = index + 1;
    const isFirstPageActive = currentPage === 1;
    const isSecondPageActive = currentPage === 2;
    const isLastPageActive = currentPage === totalPage;
    const isSecondLastPageActive = currentPage === totalPage - 1;
    const rangeLimit = isFirstPageActive || isLastPageActive ? 4 : isSecondPageActive || isSecondLastPageActive ? 3 : 2;
    const isCurrentPageWithinRangeLimit = Math.abs(pageNumber - currentPage) <= rangeLimit;

    if (isCurrentPageWithinRangeLimit) {
      return (
        <Pagination.Item
          key={pageNumber}
          tabIndex={0}
          data-testid={`pagination-item-${pageNumber}`}
          id={`pagination-item-${pageNumber}`}
          active={props.pageNumber === pageNumber}
          onClick={() => onPageChange(pageNumber)}
          onKeyDown={event => pageKeyDownHandler(event, pageNumber)}
        >
          {pageNumber}
        </Pagination.Item>
      );
    }

    return null;
  });

  const renderOptions = () => {
    const options = pageSizeOptions.map((item, index) => {
      return (
        <option
          key={index}
          tabIndex={0}
          className={+item === +props.pageSize ? styles.optionSelected : ""}
          data-testid={item}
          value={item}
        >
          {item} / page
        </option>
      );
    });
    return options;
  };

  const renderPagination = (
    <div className={styles.paginationContainer}>
      <Pagination data-testid="pagination" id="pagination" className={styles.paginationWrapper}>
        <Pagination.Prev
          onClick={handlePrev}
          onKeyDown={arrowPreviousKeyDownHandler}
          disabled={props.pageNumber === 1}
          tabIndex={0}
          className={`${props.pageNumber === 1 && styles.disable} ${styles.corner}`}
        />
        {renderPages}
        <Pagination.Next
          onClick={handleNext}
          onKeyDown={arrowNextKeyDownHandler}
          disabled={props.pageNumber === totalPage}
          tabIndex={0}
          className={`${props.pageNumber === totalPage && styles.disable} ${styles.corner}`}
        />
      </Pagination>
      <Form.Select
        data-testid="pageSizeSelect"
        color="secondary"
        id="pageSizeSelect"
        tabIndex={0}
        value={props.pageSize}
        onChange={onPageSizeChange}
        className={styles.select}
      >
        {renderOptions()}
      </Form.Select>
    </div>
  );

  return <div className={styles.searchPaginationContainer}>{props.total > 10 && renderPagination}</div>;
};

export default SearchPagination;
