import React from 'react';
import {Form, Pagination as PaginationBootstrap} from "react-bootstrap";
import "./Pagination.scss";

type Props = {
  total: number;
  pageNumber: number;
  pageLength: number;
  pageLengths: number[];
  setPageNumber: (value: number) => void;
  setPageLength: (value: number) => void;
};

const Pagination: React.FC<Props> = (props) => {
  const {total, pageNumber, pageLengths, setPageNumber, pageLength, setPageLength} = props;
  const totalPage = Math.ceil(total / pageLength);
  const startValue = pageNumber === 1 ? 1 : ((pageNumber - 1) * pageLength) + 1;
  let endValue = pageNumber === 1 ? pageLength : startValue + pageLength - 1;
  if (endValue > total) {
    endValue = total;
  }

  const onPageChange = (pageNumber) => {
    if (pageNumber !== props.pageNumber)
      setPageNumber(pageNumber);
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
        <PaginationBootstrap.Item
          key={pageNumber}
          data-testid={`pagination-item-${pageNumber}`}
          id={`pagination-item-${pageNumber}`}
          active={props.pageNumber === pageNumber}
          onClick={() => onPageChange(pageNumber)}>
          {pageNumber}
        </PaginationBootstrap.Item>
      );
    }

    if (!isPageNumberOutOfRange) {
      isPageNumberOutOfRange = true;
      return <PaginationBootstrap.Ellipsis key={pageNumber} className="muted" />;
    }
    return null;
  });

  const onPageSizeChange = ({target}) => {
    const {value} = target;
    setPageLength(+value);
  };

  const renderOptions = () => {
    const options = pageLengths.map((item, index) => {
      return <option key={index} value={item} data-testid="select-option">{item} / page</option>;
    });
    return options;
  };


  const renderPagination = (
    <PaginationBootstrap data-testid="pagination-component" id="pagination">
      <PaginationBootstrap.Prev onClick={handlePrev} disabled={props.pageNumber === 1} />
      {renderPages}
      <PaginationBootstrap.Next onClick={handleNext} disabled={props.pageNumber === totalPage} />
    </PaginationBootstrap>
  );

  return (
    <div className="Pagination" data-testid="pagination">
      <div>
        <span>Showing <strong>{startValue}-{endValue}</strong> of <strong>{total}</strong> results</span>
      </div>
      <div className="pagination-container">
        {renderPagination}
        <Form.Select data-testid="pageSizeSelect" color="secondary" id="pageSizeSelect" value={pageLength} onChange={onPageSizeChange}>
          {renderOptions()}
        </Form.Select>
      </div>
    </div>
  );
}
export default Pagination;