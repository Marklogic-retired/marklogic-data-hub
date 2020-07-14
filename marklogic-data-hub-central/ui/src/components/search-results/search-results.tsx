import React from 'react';
import { List } from 'antd';
import SearchResult from '../search-result/search-result';
import styles from './search-results.module.scss';

type Props = {
  data: any[];
  entityDefArray:any[];
  tableView: boolean;
};

const SearchResults:React.FC<Props> = (props) => {

  return (
    <div id="search-results" className={styles.searchResultsContainer}>
      <List
        itemLayout="horizontal"
        dataSource={props.data}
        renderItem={(item, index) => (
          <List.Item data-cy={`document-list-item-${index}`}>
            <SearchResult
              item={item}
              entityDefArray={props.entityDefArray}
              tableView={props.tableView}
            />
          </List.Item>
        )}
      />
    </div>
  )
}

export default SearchResults;
