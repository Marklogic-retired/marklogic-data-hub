import React from 'react';
import { Typography } from 'antd';
import styles from './search-summary.module.scss';

const SearchSummary = (props) => {
  const { Text } = Typography;

  return (
    <div className={styles.searchSummaryContainer}>
      <Text>Showing</Text> <span className={styles.summaryValue}>{props.start}-{props.length}</span> <Text>of</Text> <span className={styles.summaryValue}>{props.total}</span> <Text>documents</Text>
    </div>
  );
}

export default SearchSummary;