import React from 'react';
import styles from './search-summary.module.scss';

const SearchSummary = (props) => {

  return (
    <div className={styles.searchSummaryContainer}>
      <label>Showing</label> <span className={styles.summaryValue}>{props.start}-{props.length}</span> <label>of</label> <span className={styles.summaryValue}>{props.total}</span> <label>documents</label>
    </div>
  );
}

export default SearchSummary;