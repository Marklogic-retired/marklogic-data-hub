import React, {useState, useEffect} from "react";
import {components as SelectComponents} from "react-select";
import CreatableSelect from "react-select/creatable";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import styles from "./advanced-target-collections.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTimes, faSquare, faSave} from "@fortawesome/free-solid-svg-icons";
import {HCTooltip, HCTable} from "@components/common";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {themeColors} from "@config/themes.config";

export const breakLine = "\u000A";

const events = new Set<string>(["onMerge", "onNoMatch", "onArchive", "onNotification"]);
const eventLabels = {
  "onMerge": "Merge",
  "onNoMatch": "No Match",
  "onArchive": "Archive",
  "onNotification": "Notification",
};

const MenuList = (selector, props) => (
  <div id={`${selector}-select-MenuList`} aria-label={"select-MenuList"}>
    <SelectComponents.MenuList {...props} />
  </div>
);
const MultiValueRemove = props => {
  return (
    <SelectComponents.MultiValueRemove {...props}>
      <span aria-label="icon: close">
        <svg height="14" width="14" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z" />
        </svg>
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

const checkEnterPress = (key, func) => {
  if (key === "Enter") {
    func();
  }
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
    headerFormatter: () => (
      <div className={styles.tableHeader}>
        Default Collections{" "}
        <HCTooltip
          text="Collection tags that are added to the resulting records by default."
          id="additional-collections-tooltip"
          placement="top"
        >
          <QuestionCircleFill
            tabIndex={0}
            color={themeColors.defaults.questionCircle}
            size={13}
            className={styles.questionCircle}
          />
        </HCTooltip>
      </div>
    ),
    dataField: "defaultCollections",
    visible: true,
    attrs: (_, row, index) => {
      return {"data-coll-event": row.event};
    },
    formatter: collectionArray => <div className={styles.preWrap}>{collectionArray.join(breakLine)}</div>,
  },
  {
    text: "Additional Collections",
    headerFormatter: () => (
      <div className={styles.tableHeader}>
        Additional Collections{" "}
        <HCTooltip
          text="Collection tags that you specify to be added to the resulting records."
          id="default-collections-tooltip"
          placement="top"
        >
          <QuestionCircleFill
            tabIndex={0}
            color={themeColors.defaults.questionCircle}
            size={13}
            className={styles.questionCircle}
          />
        </HCTooltip>
      </div>
    ),
    dataField: "additionalCollectionsField",
    visible: true,
    attrs: (_, row, index) => {
      return {"data-coll-event": row.event};
    },
    formatter: additionalCollectionsField =>
      additionalCollectionsField.mode === "edit" ? (
        <CreatableSelect
          id={`additionalColl-${additionalCollectionsField.event}-select-wrapper`}
          inputId={`additionalColl-${additionalCollectionsField.event}`}
          components={{
            MultiValueContainer,
            MultiValueRemove,
            MenuList: internProps => MenuList(`additionalColl-${additionalCollectionsField.event}`, internProps),
          }}
          isMulti
          isClearable={false}
          placeholder="Please add target collections"
          value={additionalCollectionsField.values.map(d => ({value: d, label: d}))}
          onChange={values => {
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
            return <span data-testid={`additionalColl-${value}-option`}>{label}</span>;
          }}
        />
      ) : (
        <div className={styles.preWrap}>{additionalCollectionsField.values.join(breakLine)}</div>
      ),
  },
  {
    text: "",
    dataField: "action",
    key: "action",
    visible: true,
    formatter: action => {
      if (action.event) {
        if (action.mode === "edit") {
          return (
            <div className={styles.keepDiscard}>
              <span
                data-testid={action.event + "-keep"}
                className={styles.iconLink + " fa-layers fa-fw"}
                onClick={action.saveEdit}
                onKeyDown={e => {
                  checkEnterPress(e.key, action.saveEdit);
                }}
              >
                <FontAwesomeIcon tabIndex={0} size={"2x"} icon={faSquare} />
                <FontAwesomeIcon className={styles.checkIcon} size={"lg"} icon={faSave} inverse />
              </span>
              <span
                data-testid={action.event + "-discard"}
                className={styles.iconLink + " fa-layers fa-fw"}
                onClick={action.discardEdit}
                onKeyDown={e => {
                  checkEnterPress(e.key, action.discardEdit);
                }}
              >
                <FontAwesomeIcon tabIndex={0} size={"2x"} icon={faSquare} />
                <FontAwesomeIcon className={styles.timesIcon} size={"lg"} icon={faTimes} inverse />
              </span>
            </div>
          );
        } else {
          return (
            <HCTooltip text="Edit" id="edit-tooltip" placement="bottom">
              <i role="edit-collections button" key="last">
                <FontAwesomeIcon
                  tabIndex={0}
                  className={styles.iconLink}
                  size={"lg"}
                  icon={faPencilAlt}
                  data-testid={action.event + "-edit"}
                  onClick={action.toggle}
                  onKeyDown={e => {
                    checkEnterPress(e.key, action.toggle);
                  }}
                />
              </i>
            </HCTooltip>
          );
        }
      }
    },
  },
  {
    text: "Remove Collections",
    headerFormatter: () => (
      <div className={styles.tableHeader}>
        Remove Collections{" "}
        <HCTooltip
          text="Use this column to filter out the collections you do not want to merge."
          id="remove-collections-tooltip"
          placement="top"
        >
          <QuestionCircleFill
            tabIndex={0}
            color={themeColors.defaults.questionCircle}
            size={13}
            className={styles.questionCircle}
          />
        </HCTooltip>
      </div>
    ),
    dataField: "removeCollectionsField",
    key: "removeCollectionsField",
    visible: true,
    attrs: (_, row, index) => {
      return {"data-coll-event": row.event};
    },
    formatter: removeCollectionsField => {
      if (removeCollectionsField.event !== "onNotification" || removeCollectionsField.event === "Notification") {
        if (removeCollectionsField.mode === "remove") {
          return (
            <CreatableSelect
              id={`removeColl-${removeCollectionsField.event}-select-wrapper`}
              inputId={`removeColl-${removeCollectionsField.event}`}
              components={{
                MultiValueContainer,
                MultiValueRemove,
                MenuList: internProps => MenuList(`removeColl-${removeCollectionsField.event}`, internProps),
              }}
              isMulti
              isClearable={false}
              placeholder="Please add target collections"
              value={removeCollectionsField.values.map(d => ({value: d, label: d}))}
              onChange={values => {
                removeCollectionsField.values = values.map(option => option.value);
                removeCollectionsField.toggleRefresh();
              }}
              onCreateOption={values => {
                removeCollectionsField.values = removeCollectionsField.values.concat(values);
                removeCollectionsField.toggleRefresh();
              }}
              aria-label={"removeColl-select-" + removeCollectionsField.event}
              options={removeCollectionsField.values.map(d => ({value: d, label: d}))}
              styles={reactSelectThemeConfig}
              formatOptionLabel={({value, label}) => {
                return <span data-testid={`removeColl-${value}-option`}>{label}</span>;
              }}
            />
          );
        } else {
          return <div className={styles.preWrap}>{removeCollectionsField.values.join(breakLine)}</div>;
        }
      } else {
        return <>N/A</>;
      }
    },
  },
  {
    text: "",
    dataField: "removeAction",
    key: "removeAction",
    visible: true,
    formatter: removeAction => {
      if (removeAction.event !== "onNotification" || removeAction.event === "Notification") {
        if (removeAction.mode === "remove") {
          return (
            <div className={styles.keepDiscard}>
              <span
                data-testid={removeAction.event + "-keepRemoved"}
                className={styles.iconLink + " fa-layers fa-fw"}
                onClick={removeAction.saveRemove}
                onKeyDown={e => {
                  checkEnterPress(e.key, removeAction.saveRemove);
                }}
              >
                <FontAwesomeIcon tabIndex={0} size={"2x"} icon={faSquare} />
                <FontAwesomeIcon className={styles.checkIcon} size={"lg"} icon={faSave} inverse />
              </span>
              <span
                data-testid={removeAction.event + "-discardRemoved"}
                className={styles.iconLink + " fa-layers fa-fw"}
                onClick={removeAction.discardRemove}
                onKeyDown={e => {
                  checkEnterPress(e.key, removeAction.discardRemove);
                }}
              >
                <FontAwesomeIcon tabIndex={0} size={"2x"} icon={faSquare} />
                <FontAwesomeIcon className={styles.timesIcon} size={"lg"} icon={faTimes} inverse />
              </span>
            </div>
          );
        } else {
          return (
            <HCTooltip text="Edit" id="remove-tooltip" placement="bottom">
              <i role="remove-collections button" key="last">
                <FontAwesomeIcon
                  tabIndex={0}
                  className={styles.iconLink}
                  size={"lg"}
                  icon={faPencilAlt}
                  data-testid={removeAction.event + "-remove"}
                  onClick={removeAction.toggle}
                  onKeyDown={e => {
                    checkEnterPress(e.key, removeAction.toggle);
                  }}
                />
              </i>
            </HCTooltip>
          );
        }
      }
    },
  },
];

const AdvancedTargetCollections = props => {
  const [rowDataset, setRowDataset] = useState<any[]>([]);
  const [eventEditModes, setEventEditModes] = useState<any>({});
  const [eventRemoveModes, setEventRemoveModes] = useState<any>({});
  const [refresh, setRefresh] = useState<boolean>(false);
  const toggleRefresh = () => setRefresh(!refresh);

  const canReadWrite = props.canWrite;

  const handleEventCollections = (event, additionalCollections, collectionsRemoved, updateTarget = true) => {
    props.targetCollections[event] = props.targetCollections[event] || {};
    props.targetCollections[event].add = additionalCollections;
    if (event !== "onNotification" && event !== "Notification") {
      props.targetCollections[event].remove = collectionsRemoved;
    }
    props.defaultTargetCollections[event] = props.defaultTargetCollections[event] || [];
    const defaultCollections = props.defaultTargetCollections[event];
    const eventEditMode = eventEditModes[event];
    const eventRemoveMode = eventRemoveModes[event];
    const existingIndex = rowDataset.findIndex(r => r.event === event);
    const existingRow = rowDataset[existingIndex];
    const values = existingRow ? existingRow.additionalCollectionsField.values : [...additionalCollections];
    const additionalCollectionsField = {event, toggleRefresh, mode: eventEditMode, values};
    const removedValues = existingRow ? existingRow.removeCollectionsField.values : [...collectionsRemoved];
    const removeCollectionsField = {event, toggleRefresh, mode: eventRemoveMode, values: removedValues};

    const toggleEdit = () => {
      const newEventEditModes = {...eventEditModes};
      newEventEditModes[event] = "edit";
      setEventEditModes({...newEventEditModes});
    };

    const toggleRemove = () => {
      const eventRemoveModesAux = {...eventRemoveModes};
      eventRemoveModesAux[event] = "remove";
      setEventRemoveModes({...eventRemoveModesAux});
    };

    const saveEdit = () => {
      handleEventCollections(event, additionalCollectionsField.values, removeCollectionsField.values);
      const newEventEditModes = {...eventEditModes};
      newEventEditModes[event] = "view";
      setEventEditModes({...newEventEditModes});
    };

    const saveRemove = () => {
      handleEventCollections(event, additionalCollectionsField.values, removeCollectionsField.values);
      const newEventRemoveModes = {...eventRemoveModes};
      newEventRemoveModes[event] = "view";
      setEventRemoveModes({...newEventRemoveModes});
    };

    const discardEdit = () => {
      additionalCollectionsField.values = [...additionalCollections];
      const newEventEditModes = {...eventEditModes};
      newEventEditModes[event] = "view";
      setEventEditModes({...newEventEditModes});
    };

    const discardRemove = () => {
      removeCollectionsField.values = [...collectionsRemoved];
      const newEventRemoveModes = {...eventRemoveModes};
      newEventRemoveModes[event] = "view";
      setEventRemoveModes({...newEventRemoveModes});
    };

    const row = {
      event,
      defaultCollections,
      additionalCollectionsField,
      action: canReadWrite ? {event, mode: eventEditMode, toggle: toggleEdit, discardEdit, saveEdit} : {},
      removeCollectionsField,
      removeAction: canReadWrite ? {event, mode: eventRemoveMode, toggle: toggleRemove, discardRemove, saveRemove} : {},
    };
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
      events.forEach(event => {
        const targetCollections = (props.targetCollections[event] && props.targetCollections[event].add) || [];
        const removedCollections = (props.targetCollections[event] && props.targetCollections[event].remove) || [];
        handleEventCollections(event, targetCollections, removedCollections, false);
      });
    }
    return () => {};
  }, [props.targetCollections, props.defaultTargetCollections, eventEditModes, refresh, eventRemoveModes]);

  return (
    <div aria-label="advanced-target-collections" className="w-100">
      <HCTable
        rowKey="event"
        data={rowDataset}
        columns={defaultTargetCollectionHeaders}
        pagination={false}
        subTableHeader
      />
    </div>
  );
};

export default AdvancedTargetCollections;
