import React, {useContext, useState, useEffect} from "react";
import {Pagination, Form} from "react-bootstrap";
import {SearchContext} from "../../util/search-context";
import styles from "./search-pagination.module.scss";
import {MonitorContext} from "../../util/monitor-context";

interface Props {
  total: number;
  pageNumber: number;
  pageSize: number;
  pageLength: number;
  maxRowsPerPage: number;
}

const SearchPagination: React.FC<Props> = (props) => {
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

  const onPageChange = (pageNumber) => {
    if (pageNumber !== props.pageNumber) searchOptions.tileId === "explore" ? setPage(pageNumber, props.total) : setMonitorPage(pageNumber, props.total);
  };

  const onPageSizeChange = ({target}) => {
    const {value} = target;
    searchOptions.tileId === "explore" ? setPageLength(props.pageNumber, +value) : setMonitorPageLength(props.pageNumber, +value);
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

  let isPageNumberOutOfRange;

  const renderPages = [...new Array(totalPage)].map((_, index) => {
    const {pageNumber: currentPage} = props;
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
          active={props.pageNumber === pageNumber}
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
      return <option key={index} className={+item === +props.pageSize ? styles.optionSelected : ""} value={item}>{item} / page</option>;
    });
    return options;
  };

  const renderPagination = (
    <div className={styles.paginationContainer}>
      <Pagination data-testid="pagination" id="pagination" className={styles.paginationWrapper}>
        <Pagination.Prev onClick={handlePrev} disabled={props.pageNumber === 1} className={`${props.pageNumber === 1 && styles.disable} ${styles.corner}`} />
        {renderPages}
        <Pagination.Next onClick={handleNext} disabled={props.pageNumber === totalPage} className={`${props.pageNumber === totalPage && styles.disable} ${styles.corner}`} />
      </Pagination>
      <Form.Select data-testid="pageSizeSelect" color="secondary" id="pageSizeSelect" value={props.pageSize} onChange={onPageSizeChange} className={styles.select}>
        {renderOptions()}
      </Form.Select>
    </div>
  );


  return (
    <div className={styles.searchPaginationContainer}>
      {props.total > 10 && renderPagination}
    </div>
  );
};

export default SearchPagination;
