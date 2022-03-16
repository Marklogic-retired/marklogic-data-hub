import React, {useState, useEffect} from "react";
import {components as SelectComponents} from "react-select";
import CreatableSelect from "react-select/creatable";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import styles from "./advanced-target-collections.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faCheck, faTimes, faSquare} from "@fortawesome/free-solid-svg-icons";
import {HCTooltip, HCTable} from "@components/common";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {themeColors} from "@config/themes.config";

export const breakLine = "\u000A";

const events = new Set<string>(["onMerge", "onNoMatch", "onArchive", "onNotification"]);
const eventLabels = {"onMerge": "Merge", "onNoMatch": "No Match", "onArchive": "Archive", "onNotification": "Notification"};

const MenuList  = (selector, props) => (
  <div id={`${selector}-select-MenuList`} aria-label={"select-MenuList"}>
    <SelectComponents.MenuList {...props} />
  </div>
);
const MultiValueRemove = props => {
  return (
    <SelectComponents.MultiValueRemove {...props}>
      <span aria-label="icon: close">
        <svg height="14" width="14" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>
      </span>
    </SelectComponents.MultiValueRemove>
  );
};
const MultiValueContainer = props => {
  return (
    <span aria-label={"multioption-container"} title={props.data.value}>
      <SelectComponents.MultiValueContainer {...props} />
    </span>
  );
};

const defaultTargetCollectionHeaders = [
  {
    text: "Event",
    dataField: "event",
    key: "event",
    visible: true,
    formatter: eventPropertyName => eventLabels[eventPropertyName],
    formatExtraData: {eventLabels},
  },
  {
    text: "Default Collections",
    headerFormatter: () => <span>Default Collections <HCTooltip text="Collection tags that are added to the resulting records by default." id="additional-collections-tooltip" placement="top"><QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircle}/></HCTooltip></span>,
    dataField: "defaultCollections",
    visible: true,
    attrs: (_, row, index) => {
      return {"data-coll-event": row.event};
    },
    formatter: collectionArray => <div className={styles.preWrap}>{collectionArray.join(breakLine)}</div>
  },
  {
    text: "Additional Collections",
    headerFormatter: () => <span>Additional Collections <HCTooltip text="Collection tags that you specify to be added to the resulting records." id="default-collections-tooltip" placement="top"><QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircle}/></HCTooltip></span>,
    dataField: "additionalCollectionsField",
    visible: true,
    attrs: (_, row, index) => {
      return {"data-coll-event": row.event};
    },
    formatter: additionalCollectionsField => additionalCollectionsField.mode === "edit" ?
      <CreatableSelect
        id={`additionalColl-${additionalCollectionsField.event}-select-wrapper`}
        inputId={`additionalColl-${additionalCollectionsField.event}`}
        components={{MultiValueContainer, MultiValueRemove, MenuList: internProps => MenuList(`additionalColl-${additionalCollectionsField.event}`, internProps)}}
        isMulti
        isClearable={false}
        placeholder="Please add target collections"
        value={additionalCollectionsField.values.map(d => ({value: d, label: d}))}
        onChange={(values) => {
          additionalCollectionsField.values = values.map(option => option.value);
          additionalCollectionsField.toggleRefresh();
        }}
        onCreateOption={values => {
          additionalCollectionsField.values = additionalCollectionsField.values.concat(values);
          additionalCollectionsField.toggleRefresh();
        }}
        aria-label={"additionalColl-select-" + additionalCollectionsField.event}
        options={additionalCollectionsField.values.map(d => ({value: d, label: d}))}
        styles={reactSelectThemeConfig}
        formatOptionLabel={({value, label}) => {
          return (
            <span data-testid={`additionalColl-${value}-option`}>
              {label}
            </span>
          );
        }}
      /> : <div className={styles.preWrap}>{additionalCollectionsField.values.join(breakLine)}</div>
  },
  {
    text: "",
    dataField: "action",
    key: "action",
    visible: true,
    formatter: action => {
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
          return <HCTooltip text="Edit" id="edit-tooltip" placement="bottom">
            <i role="edit-collections button" key="last">
              <FontAwesomeIcon className={styles.iconLink} size={"lg"} icon={faPencilAlt} data-testid={action.event+"-edit"} onClick={action.toggle}/>
            </i>
          </HCTooltip>;
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
    <HCTable
      rowKey="event"
      data={rowDataset}
      columns={defaultTargetCollectionHeaders}
      pagination={false}
      subTableHeader
    />
  </div>;
};

export default AdvancedTargetCollections;
