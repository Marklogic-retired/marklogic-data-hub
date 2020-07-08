import React, {useContext, useEffect} from 'react';
import { List } from 'antd';
import SearchResult from '../search-result/search-result';
import styles from './search-results.module.scss';
import {SearchContext} from "../../util/search-context";


type Props = {
  data: any[];
  entityDefArray:any[];
  tableView: boolean;
  columns: any;
};


const SearchResults:React.FC<Props> = (props) => {

    const {
        searchOptions,
        setSelectedTableProperties,
    } = useContext(SearchContext);

    useEffect(() => {
        if (props.columns && props.columns.length > 0 && searchOptions.selectedTableProperties.length === 0) {
            setSelectedTableProperties(props.columns)
        }
    }, [props.columns])

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
