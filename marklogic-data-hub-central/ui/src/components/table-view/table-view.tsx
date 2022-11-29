import React, {useState, useContext} from "react";
import styles from "./table-view.module.scss";
import {HCTable, HCTooltip} from "@components/common";
import ExpandCollapse from "@components/expand-collapse/expand-collapse";
import {AuthoritiesContext} from "@util/authorities";
import {MdCallSplit} from "react-icons/md";
import {Spinner} from "react-bootstrap";
import {SecurityTooltips} from "@config/tooltips.config";
interface Props {
  document: any;
  contentType: string;
  location: {};
  isEntityInstance: boolean;
  isSidePanel?: boolean;
  data?: any;
  openUnmergeCompare?:(item: object)=>void;
  loadingCompare?:string;
  isUnmergeAvailable?:(nodeid: string) => boolean;
}

const TableView: React.FC<Props> = (props) => {
  const [expandedRows, setExpandedRows] = useState<any[]>([]);
  const [expandedSourceFlag, setExpandedSourceFlag] = useState(false);

  let data: any[] = [];
  let counter = 0;
  let expandRow: number[] = [];
  let currRow: number[] = [];

  const authorityService = useContext(AuthoritiesContext);
  const canReadMatchMerge = authorityService.canReadMatchMerge();

  const parseJson = (obj: Object) => {
    let parsedData: any[] = [];
    for (let i in obj) {
      if (props.location && JSON.stringify(props.location) === JSON.stringify(obj[i])) {
        expandRow = currRow.concat(expandRow);
        expandRow.push(counter);
      }
      if (obj[i] !== null && typeof (obj[i]) === "object") {
        currRow.push(counter);
        parsedData.push({key: counter++, property: i, children: parseJson(obj[i])});
        currRow.pop();
      } else {
        parsedData.push({key: counter++, property: i, value: typeof obj[i] === "boolean" ? obj[i].toString() : obj[i]});
      }
    }
    return parsedData;
  };

  if (props.document) {
    data = parseJson(props.document);
  }


  const columns = [
    {
      text: "Property",
      dataField: "property",
      key: "property",
      width: props.isEntityInstance ? "20%" : "40%",
      formatter: (value) => {
        return <span>{value}</span>;
      }
    },
    {
      text: "Value",
      dataField: "value",
      key: "value",
      formatter: (value) => {
        return <span>{value}</span>;
      },
      width: props.isEntityInstance ? "80%" : "60%",
    }
  ];

  const getKeysToExpandFromTable = (dataArr, rowKey, allKeysToExpand: any = [], expanded?) => {
    dataArr.forEach(obj => {
      if (obj.hasOwnProperty("children")) {
        allKeysToExpand.push(obj[rowKey]);
        if (rowKey === "key" && (!expandedSourceFlag || expanded)) {
          getKeysToExpandFromTable(obj["children"], rowKey, allKeysToExpand);
        }
      }
    });
    return allKeysToExpand;
  };

  const handleSourceExpandCollapse = (option) => {
    let keys = getKeysToExpandFromTable(data, "key", [], true);
    if (option === "collapse") {
      setExpandedRows([]);
      setExpandedSourceFlag(false);
    } else {
      setExpandedRows([...keys]);
      setExpandedSourceFlag(true);
    }
  };

  const onExpand = (record, expanded) => {
    let newExpandedRows = [...expandedRows];

    if (expanded) {
      if (newExpandedRows.indexOf(record.key) === -1) {
        newExpandedRows.push(record.key);
      }
    } else {
      newExpandedRows = newExpandedRows.filter(row => row !== record.key);
    }

    setExpandedRows(newExpandedRows);
  };
  const handleOpenCompare = (docUri) => {
    if (props.openUnmergeCompare && typeof props.openUnmergeCompare === "function") {
      props.openUnmergeCompare(docUri);
    }
  };

  const unmergeIcon= () => {
    if (props.data) {
      if (!props.isUnmergeAvailable?.(props.data.docUri)) return null;
      if (props.data.unmerge) {
        if (canReadMatchMerge) {
          return (
            <div className={styles.unmergeContainer}>
              {props.loadingCompare !== "" ? (
                <Spinner
                  data-testid="hc-button-component-spinner"
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className={styles.spinner}
                />
              ) : null}
              <div className={styles.unMergeIcon}>
                <HCTooltip text={"Unmerge Documents"} id="unmerge-icon-tooltip" placement="top-end">
                  <i>
                    <MdCallSplit
                      className={styles.unMergeIcon}
                      data-testid={`unmergeIcon`}
                      aria-label={`unmerge-icon`}
                      onClick={() =>
                        handleOpenCompare(props.data.docUri)
                      }
                    />
                  </i>
                </HCTooltip>
              </div>
            </div>
          );
        } else {
          return (
            <div className={styles.unMergeIcon}>
              <HCTooltip text={SecurityTooltips.missingPermission} id="missing-permission-tooltip" placement="top-end">
                <i><MdCallSplit className={styles.unMergeIconDisabled} data-testid={`unmergeIcon`} aria-label={`unmerge-icon`}/></i>
              </HCTooltip>
            </div>
          );
        }
      }
    }
    return null;
  };
  return (
    <>
      {props.isSidePanel &&
          <div className={styles.extraButtonContainer}>
            {unmergeIcon()}
            <span>
              <ExpandCollapse handleSelection={(id) => handleSourceExpandCollapse(id)} currentSelection={""} />
            </span>
          </div>
      }
      <HCTable columns={columns}
        className={props.isEntityInstance ? "document-table-demo" : styles.tableViewNonEntity}
        data={data}
        onExpand={onExpand}
        expandedRowKeys={[0, ...expandedRows]}
        showExpandIndicator={{bordered: true}}
        nestedParams={{headerColumns: columns, iconCellList: [], state: [expandedRows, setExpandedRows]}}
        childrenIndent={true}
        data-cy="document-table"
        rowKey="key"
        showHeader={true}
        baseIndent={20}
      />
    </>
  );
};

export default TableView;