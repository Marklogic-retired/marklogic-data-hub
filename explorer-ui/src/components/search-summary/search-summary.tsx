import React from 'react';
import { Typography } from 'antd';
import styles from './search-summary.module.scss';

const SearchSummary = (props) => {
  const { Text } = Typography;

  const isEndOfPage = () => {
    if(props.start * props.length > props.total) {
      return true;
    } else {
      return false;
    }
  }

  const isNoDocuments = () => {
    if(props.total == 0) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <div className={styles.searchSummaryContainer}>
      <Text>Showing</Text> <span className={styles.summaryValue}>{isNoDocuments() ? 0 : (props.start-1) * props.length + 1}-{isEndOfPage() ? props.total : props.start * props.length}</span> <Text>of</Text> <span className={styles.summaryValue}>{props.total}</span> <Text>documents</Text>
    </div>
  );
}

export default SearchSummary;