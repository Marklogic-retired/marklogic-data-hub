import React from 'react';
import styles from './search-summary.module.scss';

const SearchSummary = (props) => {

  return (
    <div className={styles.searchSummaryContainer}>
      <label>Showing</label> <span className={styles.summaryValue}>1-10</span> <label>of</label> <span className={styles.summaryValue}>1,234</span>
    </div>
  );
}

export default SearchSummary;