import React from "react";
import {numberConverter} from "../../util/number-conversion";
import styles from "./search-summary.module.scss";

interface Props {
  total: number;
  start: number;
  length: number;
  pageSize: number;
}

const SearchSummary: React.FC<Props> = (props) => {
  const isEndOfPage = () => {
    if (props.length !== props.pageSize || props.length > props.total) {
      return true;
    } else {
      return false;
    }
  };

  const isNoDocuments = () => {
    if (props.total === 0) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className={styles.searchSummaryContainer}>
      <span>Showing </span>
      <span className={styles.summaryValue}>{isNoDocuments() ? 0 : numberConverter(props.start)}-{isEndOfPage() ? numberConverter(props.total) : numberConverter(props.start + props.pageSize -1)}</span> <span>of</span> <span className={styles.summaryValue} data-cy="total-documents">{numberConverter(props.total)}</span>
      <span> results</span>
    </div>
  );
};

export default SearchSummary;
