import React, {useContext, useEffect} from "react";
import {ListGroup} from "react-bootstrap";
import SearchResult from "../search-result/search-result";
import styles from "./search-results.module.scss";
import {SearchContext} from "@util/search-context";
import {getViewSettings, setViewSettings} from "@util/user-context";
import {EntityProps} from "types/entity-types";


type Props = {
  data: any[];
  entityDefArray: EntityProps[];
  tableView: boolean;
  columns: any[];
  handleViewChange: (view: string) => void;
};


const SearchResults:React.FC<Props> = (props) => {

  const {data, entityDefArray, tableView, handleViewChange, columns} = props;

  const {
    searchOptions,
    setSelectedTableProperties,
  } = useContext(SearchContext);

  const [expandedItems, setExpandedItems] = React.useState<any[]>([]);

  useEffect(() => {
    if (columns && columns.length > 0 && searchOptions.selectedTableProperties.length === 0) {
      setSelectedTableProperties(columns);
    }
  }, [columns]);

  useEffect(() => {
    const items = getViewSettings().explore?.snippetView?.expandedItems || [];
    setExpandedItems(items);
    const viewSettings = getViewSettings();
    const viewSettingsAux = {
      ...viewSettings, explore: {
        ...viewSettings.explore,
        snippetView: {
          ...viewSettings.explore?.snippetView,
          expandedItems: items
        }
      }
    };
    setViewSettings(viewSettingsAux);
  }, [data]);

  const onExpand = (index: number) => {
    let newItems = [...expandedItems];
    if (newItems.find((i) => i === `${index}-${searchOptions.pageNumber}`)) {
      newItems = newItems.filter((i) => (i !== `${index}-${searchOptions.pageNumber}`));
    } else {
      newItems = [...expandedItems, `${index}-${searchOptions.pageNumber}`];
    }
    setExpandedItems(newItems);
    const viewSettings = getViewSettings();
    const viewSettingsAux = {
      ...viewSettings, explore: {
        ...viewSettings.explore,
        snippetView: {
          ...viewSettings.explore?.snippetView,
          expandedItems: newItems
        }
      }
    };
    setViewSettings(viewSettingsAux);
  };

  return (
    <div id="search-results" className={`px-2 ${styles.searchResultsContainer}`}>
      <ListGroup variant="flush">
        {data.map((item, index) => (
          <ListGroup.Item key={index} data-cy={`document-list-item-${index}`} className={"px-0 py-3"}>
            <SearchResult
              item={item}
              entityDefArray={entityDefArray}
              tableView={tableView}
              handleViewChange={handleViewChange}
              isExpanded={expandedItems.find((i) => i === `${index}-${searchOptions.pageNumber}`)}
              onExpand={() => onExpand(index)}
            />
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default SearchResults;
