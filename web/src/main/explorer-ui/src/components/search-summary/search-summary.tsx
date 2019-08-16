import React from 'react';
import styles from './search-summary.module.scss';

const SearchSummary = (props) => {

  return (
    <div className={styles.searchSummaryContainer}>
      Showing 1-10 of 1,234
    </div>
  );
}

export default SearchSummary;