import React, {useEffect} from "react";
import {Pagination} from "react-bootstrap";
import styles from "./search-pagination-simple.module.scss";

interface Props {
  total: number;
  pageNumber: number;
  pageSize: number;
  maxRowsPerPage: number;
  updatePage?: any;
}

const SearchPaginationSimple: React.FC<Props> = props => {
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
  };

  useEffect(() => {
    setPerPageSelector(props.maxRowsPerPage);
  }, [props.maxRowsPerPage]);

  const onPageChange = pageNumber => {
    if (pageNumber !== props.pageNumber) {
      props.updatePage(pageNumber);
    }
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
          data-testid={`pagination-item-${pageNumber}`}
          id={`pagination-item-${pageNumber}`}
          active={props.pageNumber === pageNumber}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Pagination.Item>
      );
    }
    return null;
  });

  const renderPagination = (
    <div className={styles.paginationContainer}>
      <Pagination data-testid="pagination" id="pagination" className={styles.paginationWrapper}>
        <Pagination.Prev
          onClick={handlePrev}
          disabled={props.pageNumber === 1}
          className={`${props.pageNumber === 1 && styles.disable} ${styles.corner}`}
        />
        {renderPages}
        <Pagination.Next
          onClick={handleNext}
          disabled={props.pageNumber === totalPage}
          className={`${props.pageNumber === totalPage && styles.disable} ${styles.corner}`}
        />
      </Pagination>
    </div>
  );

  return <div className={styles.searchPaginationContainer}>{props.total > props.pageSize && renderPagination}</div>;
};

export default SearchPaginationSimple;
