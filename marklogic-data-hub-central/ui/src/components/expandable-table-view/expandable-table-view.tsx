import React, {useContext} from "react";
import {Table} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import {SearchContext} from "../../util/search-context";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";

interface Props {
  item: any;
  entityDefArray: any[];
  tableView: boolean;
}


const ExpandableTableView: React.FC<Props> = (props) => {

  const {
    searchOptions,
  } = useContext(SearchContext);

  let primaryKeyValue: any = "-";
  // let primaryKey: any = '-';

  if (props.item.primaryKey && Object.keys(props.item.primaryKey).length !== 0) {
    primaryKeyValue = props.item.primaryKey.propertyValue;
    // primaryKey = props.item.primaryKey.propertyPath;
  }

  let data : any[] = [];
  let counter = 0;
  const parseJson = (obj: Object) => {
    let parsedData : any[] = [];
    for (let i in obj) {
      if (obj[i] !== null && typeof (obj[i]) === "object") {
        parsedData.push({
          key: counter++,
          property: i,
          children: parseJson(obj[i]),
          view: <Link to={{pathname: "/tiles/explore/detail", state: {id: obj[i],
            entity: searchOptions.entityTypeIds,
            pageNumber: searchOptions.pageNumber,
            start: searchOptions.start,
            searchFacets: searchOptions.selectedFacets,
            query: searchOptions.query,
            tableView: props.tableView,
            sortOrder: searchOptions.sortOrder,
            sources: props.item.sources,
            primaryKey: primaryKeyValue,
            uri: props.item.uri,
            entityInstance: props.item.entityInstance,
            targetDatabase: searchOptions.database
          }}} data-cy="nested-instance">
            <HCTooltip text="Show nested detail on a separate page" id="show-nested-tooltip" placement="top">
              <i><FontAwesomeIcon icon={faExternalLinkAlt} size="sm"/></i>
            </HCTooltip>
          </Link>
        });
      } else {
        parsedData.push({
          key: counter++,
          property: i,
          value: typeof obj[i] === "boolean" ? obj[i].toString() : obj[i],
          view: null
        });
      }
    }
    return parsedData;
  };

  data = parseJson(props.item.entityInstance);

  const columns = [
    {
      title: "Property",
      dataIndex: "property",
      width: "20%",
    },
    {
      title: "Value",
      dataIndex: "value",
      width: "20%",
    },
    {
      title: "View",
      dataIndex: "view",
      width: "20%",
    }
  ];

  return (
    <Table
      rowKey="key"
      dataSource={data}
      columns={columns}
      pagination={false}
      data-cy="expandable-table-view"
    />
  );
};

export default ExpandableTableView;
