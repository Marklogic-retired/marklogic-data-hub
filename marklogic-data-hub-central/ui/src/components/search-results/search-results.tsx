import React, {useContext, useEffect} from "react";
import {ListGroup} from "react-bootstrap";
import SearchResult from "../search-result/search-result";
import styles from "./search-results.module.scss";
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
      setSelectedTableProperties(props.columns);
    }
  }, [props.columns]);

  return (
    <div id="search-results" className={`px-2 ${styles.searchResultsContainer}`}>
      <ListGroup variant="flush">
        {props.data.map((item, index) => (
          <ListGroup.Item key={index} data-cy={`document-list-item-${index}`} className={"px-0 py-3"}>
            <SearchResult
              item={item}
              entityDefArray={props.entityDefArray}
              tableView={props.tableView}
            />
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default SearchResults;
