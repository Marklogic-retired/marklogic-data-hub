import {
  Icon,
  Select,
  Table, Tooltip
} from "antd";
import React, {useState, useEffect} from "react";
import styles from "./advanced-target-collections.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faCheck, faTimes, faSquare} from "@fortawesome/free-solid-svg-icons";

export const breakLine = "\u000A";

const events = new Set<string>(["onMerge", "onNoMatch", "onArchive", "onNotification"]);
const eventLabels = {"onMerge": "Merge", "onNoMatch": "No Match", "onArchive": "Archive", "onNotification": "Notification"};

const defaultTargetCollectionHeaders = [
  {
    title: "Event",
    dataIndex: "event",
    key: "event",
    visible: true,
    render: eventPropertyName => eventLabels[eventPropertyName]
  },
  {
    title: <span>Default Collections <Tooltip title={"Collection tags that are added to the resulting records by default."}><Icon type="question-circle" className={styles.questionCircle} theme="filled"/></Tooltip></span>,
    dataIndex: "defaultCollections",
    visible: true,
    render: collectionArray => <div className={styles.preWrap}>{collectionArray.join(breakLine)}</div>
  },
  {
    title: <span>Additional Collections <Tooltip title={"Collection tags that you specify to be added to the resulting records."}><Icon type="question-circle" className={styles.questionCircle} theme="filled"/></Tooltip></span>,
    dataIndex: "additionalCollectionsField",
    visible: true,
    render: additionalCollectionsField => additionalCollectionsField.mode === "edit" ? <Select
      id={`additionalColl-${additionalCollectionsField.event}`}
      mode="tags"
      autoFocus={true}
      autoClearSearchValue={true}
      placeholder="Please add target collections"
      value={additionalCollectionsField.values}
      onSelect={(collection) => additionalCollectionsField.values.push(collection)}
      onDeselect={(collection) => {
        const index = additionalCollectionsField.values.indexOf(collection);
        if (index > -1) {
          additionalCollectionsField.values.splice(index, 1);
        }
        additionalCollectionsField.toggleRefresh();
      }}
      aria-label={"additionalColl-select-" + additionalCollectionsField.event}
    ></Select> : <div className={styles.preWrap}>{additionalCollectionsField.values.join(breakLine)}</div>
  },
  {
    title: "",
    dataIndex: "action",
    key: "action",
    visible: true,
    render: action => {
      if (action.event) {
        if (action.mode === "edit") {
          return <div className={styles.keepDiscard}>
            <span data-testid={action.event+"-keep"} className={styles.iconLink + " fa-layers fa-fw"} onClick={action.save}>
              <FontAwesomeIcon size={"2x"} icon={faSquare}></FontAwesomeIcon>
              <FontAwesomeIcon className={styles.checkIcon} size={"lg"}  icon={faCheck} inverse></FontAwesomeIcon>
            </span>
            <span data-testid={action.event+"-discard"} className={styles.iconLink + " fa-layers fa-fw"} onClick={action.discard}>
              <FontAwesomeIcon size={"2x"} icon={faSquare}></FontAwesomeIcon>
              <FontAwesomeIcon className={styles.timesIcon} size={"lg"}  icon={faTimes} inverse></FontAwesomeIcon>
            </span>
          </div>;
        } else {
          return <Tooltip title={"Edit"} placement="bottom">
            <i role="edit-collections button" key="last">
              <FontAwesomeIcon className={styles.iconLink} size={"lg"} icon={faPencilAlt} data-testid={action.event+"-edit"} onClick={action.toggle}/>
            </i>
          </Tooltip>;
        }
      }
    }
  }
];

const AdvancedTargetCollections = (props) => {
  const [rowDataset, setRowDataset] = useState<any[]>([]);
  const [eventEditModes, setEventEditModes] = useState<any>({});
  const [refresh, setRefresh] = useState<boolean>(false);
  const toggleRefresh = () => setRefresh(!refresh);

  const canReadWrite = props.canWrite;
  const handleEventCollections = (event, additionalCollections, updateTarget = true) => {
    props.targetCollections[event] = props.targetCollections[event] || {};
    props.targetCollections[event].add =  additionalCollections;
    props.defaultTargetCollections[event] = props.defaultTargetCollections[event] || [];
    const defaultCollections = props.defaultTargetCollections[event];
    const eventEditMode = eventEditModes[event];
    const existingIndex = rowDataset.findIndex((r) => r.event === event);
    const existingRow = rowDataset[existingIndex];
    const values = existingRow ? existingRow.additionalCollectionsField.values : [...additionalCollections];
    const additionalCollectionsField = {event, toggleRefresh, mode: eventEditMode, values};
    const toggleEdit = () => {
      eventEditModes[event] === "edit" ? eventEditModes[event] = "view": eventEditModes[event] = "edit";
      setEventEditModes({...eventEditModes});
    };
    const save = () => {
      handleEventCollections(event, additionalCollectionsField.values);
      toggleEdit();
    };
    const discard = () => {
      additionalCollectionsField.values = [...additionalCollections];
      toggleEdit();
    };
    const row = {event, defaultCollections, additionalCollectionsField, action: canReadWrite ? {event, mode: eventEditMode, toggle: toggleEdit, discard, save} : {}};
    if (existingIndex > -1) {
      rowDataset[existingIndex] = row;
    } else {
      rowDataset.push(row);
    }
    if (updateTarget) {
      props.setTargetCollections({...props.targetCollections});
    }
    setRowDataset([...rowDataset]);
  };

  useEffect(() => {
    if (props.targetCollections) {
      events.forEach((event) => {
        const targetCollections = (props.targetCollections[event] && props.targetCollections[event].add) || [];
        handleEventCollections(event, targetCollections, false);
      });
    }
    return () => {};
  }, [props.targetCollections, props.defaultTargetCollections, eventEditModes, refresh]);

  return <div aria-label="advanced-target-collections">
    <Table
      rowKey="event"
      dataSource={rowDataset}
      columns={defaultTargetCollectionHeaders}
      pagination={false}
    />
  </div>;
};

export default AdvancedTargetCollections;
