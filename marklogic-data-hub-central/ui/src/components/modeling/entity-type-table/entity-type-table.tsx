import React, {useState, useEffect, useContext} from "react";
import {Link} from "react-router-dom";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {faProjectDiagram} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./entity-type-table.module.scss";
import PropertyTable from "../property-table/property-table";
import ConfirmationModal from "../../confirmation-modal/confirmation-modal";
import {entityReferences, deleteEntity} from "@api/modeling";
import {EntityModified, ViewType} from "../../../types/modeling-types";
import {ConfirmationType} from "../../../types/common-types";
import {getViewSettings, setViewSettings, UserContext} from "@util/user-context";
import {ModelingContext} from "@util/modeling-context";
import {queryDateConverter, relativeTimeConverter} from "@util/date-conversion";
import {numberConverter} from "@util/number-conversion";
import {ModelingTooltips, SecurityTooltips} from "@config/tooltips.config";
import {HCTooltip, HCTable, DynamicIcons} from "@components/common";
import {themeColors} from "@config/themes.config";
import {defaultIcon} from "@config/explore.config";

type Props = {
  allEntityTypesData: any[];
  canReadEntityModel: boolean;
  canWriteEntityModel: boolean;
  autoExpand: string;
  editEntityTypeDescription: (entityTypeName: string, entityTypeDescription: string, entityTypeNamespace: string, entityTypePrefix: string, entityTypeVersion: string, entityTypeColor: string, entityTypeIcon: string) => void;
  updateEntities: () => void;
  updateSavedEntity: (entity: EntityModified, errorHandler: Function | undefined) => void;
  hubCentralConfig: any;
}

const EntityTypeTable: React.FC<Props> = (props) => {
  const storage = getViewSettings();
  const expandedRowStorage = storage?.model?.entityExpandedRows;

  const {handleError} = useContext(UserContext);
  const {modelingOptions, setGraphViewOptions} = useContext(ModelingContext);
  const [expandedRows, setExpandedRows] = useState<string[]>(expandedRowStorage ? expandedRowStorage : []);
  const [expandedNewRows, setExpandedNewRows] = useState<number[]>(expandedRowStorage ? expandedRowStorage.map(e => +e) : []);
  const [allEntityTypes, setAllEntityTypes] = useState<any[]>([]);

  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [confirmBoldTextArray, setConfirmBoldTextArray] = useState<string[]>([]);
  const [arrayValues, setArrayValues] = useState<string[]>([]);
  const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.DeleteEntity);
  const [sortedCol, setSortedCol] = useState<{ columnKey?: string, order?: string }>();

  useEffect(() => {
    const sortOrder = getViewSettings().model?.sortOrder;
    setSortedCol(sortOrder);
  }, []);

  useEffect(() => {
    if (props.autoExpand) {
      setExpandedRows([props.autoExpand]);
      setExpandedNewRows([+props.autoExpand]);
    }
  }, [props.autoExpand]);

  useEffect(() => {
    if (expandedRows === null) {
      return;
    }
    if (expandedNewRows === null) {
      return;
    }
    const rowStorage = getViewSettings();
    const newStorage = {...rowStorage, model: {...rowStorage.model, entityExpandedRows: expandedRows}};
    setViewSettings(newStorage);
  }, [expandedRows, expandedNewRows]);

  useEffect(() => {
    // Deep copying props.allEntityTypesData since we dont want the prop to be mutated
    if (props.allEntityTypesData.length > 0) {
      let newEntityTypes = deepCopy(props.allEntityTypesData);

      if (modelingOptions.isModified && modelingOptions.modifiedEntitiesArray.length > 0) {
        let modifiedEntitiesMap = {};
        modelingOptions.modifiedEntitiesArray.forEach(entity => { modifiedEntitiesMap[entity.entityName] = entity.modelDefinition; });

        newEntityTypes.forEach(entity => {
          if (modifiedEntitiesMap.hasOwnProperty(entity.entityName)) {
            // modified entities doesn't update description, use description from payload
            if (entity.model.definitions[entity.entityName].hasOwnProperty("description") &&
              entity.model.definitions[entity.entityName]["description"] !== modifiedEntitiesMap[entity.entityName][entity.entityName]["description"]) {
              modifiedEntitiesMap[entity.entityName][entity.entityName]["description"] = entity.model.definitions[entity.entityName]["description"];
            }
            entity.model.definitions = JSON.parse(JSON.stringify(modifiedEntitiesMap[entity.entityName]));
          }
        });
      }
      setAllEntityTypes(newEntityTypes);
    } else {
      setAllEntityTypes([]);
    }
  }, [JSON.stringify(props.allEntityTypesData), JSON.stringify(modelingOptions.modifiedEntitiesArray)]);

  const deepCopy = (object) => {
    return JSON.parse(JSON.stringify(object));
  };

  const getEntityReferences = async (entityName: string) => {
    try {
      const response = await entityReferences(entityName);
      if (response["status"] === 200) {
        let newConfirmType = ConfirmationType.DeleteEntity;

        if (modelingOptions.isModified) {
          setArrayValues(modelingOptions.modifiedEntitiesArray.map(entity => entity.entityName));
        }
        if (response["data"]["stepNames"].length > 0) {
          newConfirmType = ConfirmationType.DeleteEntityStepWarn;
          setArrayValues(response["data"]["stepNames"]);
        } else if (response["data"]["entityNamesWithForeignKeyReferences"].length > 0) {
          newConfirmType = ConfirmationType.DeleteEntityWithForeignKeyReferences;
          setArrayValues(response["data"]["entityNamesWithForeignKeyReferences"]);
        } else if (response["data"]["entityNames"].length > 0) {
          newConfirmType = ConfirmationType.DeleteEntityRelationshipWarn;
          setArrayValues(modelingOptions.modifiedEntitiesArray.map(entity => entity.entityName));
        }

        setConfirmBoldTextArray([entityName]);
        setConfirmType(newConfirmType);
        toggleConfirmModal(true);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const deleteEntityFromServer = async () => {
    try {
      let entityName = confirmBoldTextArray.length ? confirmBoldTextArray[0] : "";
      const response = await deleteEntity(entityName);
      if (response["status"] === 200) {
        props.updateEntities();
      }
    } catch (error) {
      handleError(error);
    } finally {
      toggleConfirmModal(false);
    }
  };

  const confirmAction = () => {
    deleteEntityFromServer();
  };

  const navigateToGraphView = (entityName) => {
    setGraphViewOptions({view: ViewType.graph, selectedEntity: entityName});
  };

  const isSorted = (dataField) => {
    return sortedCol?.columnKey === dataField;
  };

  const onSort = (type, {columnKey, order}) => {
    if (type === "sort") {
      const previousSettings = getViewSettings();
      const newSortSettings = {
        ...previousSettings,
        model: {
          ...previousSettings.model,
          sortOrder: {columnKey: columnKey, order: order}
        }
      };
      setViewSettings(newSortSettings);
    }
  };

  const columns = [
    {
      text: "Name",
      dataField: "entityName",
      className: styles.tableText,
      width: 400,
      sort: true,
      defaultSortOrder: isSorted("entityName") ? sortedCol?.order : undefined,
      headerFormatter: (_, $, {sortElement}) => (
        <><span data-testid="entityName">Name</span>{sortElement}</>
      ),
      formatter: text => {
        let entityName = text;
        return (
          <>
            {props.canWriteEntityModel && props.canReadEntityModel ? (
              <HCTooltip text={ModelingTooltips.entityTypeName} id="entity-name-tooltip" placement="top">
                <span data-testid={entityName + "-span"} className={styles.link}
                  onClick={() => {
                    props.editEntityTypeDescription(
                      entityName,
                      getEntityTypeProp(entityName, "description"),
                      getEntityTypeProp(entityName, "namespace"),
                      getEntityTypeProp(entityName, "namespacePrefix"),
                      getEntityTypeProp(entityName, "version"),
                      getEntityTypeProp(entityName, "color"),
                      getEntityTypeProp(entityName, "icon"),
                    );
                  }}>
                  {entityName}</span>
              </HCTooltip>
            ) : <span data-testid={entityName + "-span"}>{entityName}</span>}
          </>
        );
      },
      sortFunc: (a, b, order) => {
        return order === "asc" ? a.localeCompare(b) : b.localeCompare(a);
      },
      formatExtraData: {allEntityTypes}
    },
    {
      text: "Instances",
      dataField: "instances",
      className: styles.rightHeader,
      width: 100,
      sort: true,
      defaultSortOrder: isSorted("instances") ? sortedCol?.order : undefined,
      headerFormatter: (_, $, {sortElement}) => (<><span data-testid="Instances">Instances</span>{sortElement}</>),
      formatter: text => {
        let parseText = text.split(",");
        let instanceCount = numberConverter(parseInt(parseText[1]));

        return (
          <>
            {instanceCount === "0" ? <span data-testid={parseText[0] + "-instance-count"}>{instanceCount}</span> : (
              <HCTooltip text={ModelingTooltips.instanceNumber} id="explore-instances-tooltip" placement="top">
                <Link
                  to={{
                    pathname: "/tiles/explore",
                    state: {entity: parseText[0]}
                  }}
                  data-testid={parseText[0] + "-instance-count"}
                  className={styles.iconHover}
                >
                  {instanceCount}
                </Link>
              </HCTooltip>
            )
            }
          </>
        );
      },
      sortFunc: (a, b, order) => {
        let [, splitA] = a.split(",");
        let aCount = parseInt(splitA);
        let [, splitB] = b.split(",");
        let bCount = parseInt(splitB);

        return order === "asc" ? aCount - bCount : bCount - aCount;
      }
    },
    {
      text: "Last Processed",
      dataField: "lastProcessed",
      className: styles.tableText,
      width: 100,
      sort: true,
      defaultSortOrder: isSorted("lastProcessed") ? sortedCol?.order : undefined,
      headerFormatter: (_, $, {sortElement}) => (<><span data-testid="lastProcessed">Last Processed</span>{sortElement}</>),
      formatter: text => {
        let parseText = text.split(",");
        if (parseText[1] === "undefined") {
          return "n/a";
        } else {
          let displayDate = relativeTimeConverter(parseText[2]);
          return (
            <HCTooltip text={queryDateConverter(parseText[2]) + "\n" + ModelingTooltips.lastProcessed} id="explore-last-processed-tooltip" placement="top">
              <Link
                to={{
                  pathname: "/tiles/explore",
                  state: {entityName: parseText[0], jobId: parseText[1]}
                }}
                data-testid={parseText[0] + "-last-processed"}
                className={styles.iconHover}
              >
                {displayDate}
              </Link>
            </HCTooltip>

          );
        }
      },
      sortFunc: (a, b, order) => {
        let [, , splitA] = a.split(",");
        let [, , splitB] = b.split(",");
        return order === "asc" ? splitA.localeCompare(splitB) : splitB.localeCompare(splitA);
      }
    },
    {
      text: "Color",
      dataField: "color",
      className: styles.actions,
      width: 100,
      headerFormatter: () => <span data-testid="color">Color</span>,
      formatter: text => {
        let parseText = text.split(",");
        let entityName = parseText[0];
        let color = parseText[1];
        return (
          <HCTooltip placement="top" id="color-tooltip" text={<span>This color is associated with the <b>{entityName}</b> entity throughout your project.</span>}>
            <div style={{width: "33px", height: "35px", background: color, marginLeft: "3%", borderStyle: "solid", borderWidth: "1px", borderColor: "#eeeeee", borderRadius: "4px"}} data-testid={`${entityName}-${color}-color`} aria-label={`${entityName}-${color}-color`}></div>
          </HCTooltip>
        );
      }
    },
    {
      text: "Icon",
      dataField: "icon",
      className: styles.actions,
      width: 100,
      headerFormatter: () => <span data-testid="icon">Icon</span>,
      formatter: text => {
        let parseText = text.split(",");
        let entityName = parseText[0];
        let icon = parseText[1];
        return (
          <HCTooltip placement="top" id="icon-tooltip" text={<span>This icon is associated with the <b>{entityName}</b> entity throughout your project.</span>}>
            <div style={{width: "30px", height: "32px", marginLeft: "3%", fontSize: "24px", marginTop: "-11%"}} data-testid={`${entityName}-${icon}-icon`} aria-label={`${entityName}-${icon}-icon`}>
              <DynamicIcons name={icon} />
            </div>
          </HCTooltip>
        );
      }
    },
    {
      text: "Actions",
      dataField: "actions",
      className: styles.actions,
      width: 100,
      formatter: text => {
        return (
          <div className={styles.iconContainer}>
            <HCTooltip text={ModelingTooltips.viewGraph} id="graph-view-tooltip" placement="top">
              <span className="p-2 inline-block cursor-pointer">
                <FontAwesomeIcon
                  data-testid={text + "-graphView-icon"}
                  className={styles.iconViewGraph}
                  icon={faProjectDiagram}
                  onClick={() => navigateToGraphView(text)}
                /></span>
            </HCTooltip>
            <HCTooltip text={props.canWriteEntityModel ? ModelingTooltips.deleteIcon : "Delete Entity: " + SecurityTooltips.missingPermission} id="trash-icon-tooltip" placement="top">
              <span className="p-2 inline-block cursor-pointer">
                <FontAwesomeIcon
                  data-testid={text + "-trash-icon"}
                  className={!props.canWriteEntityModel && props.canReadEntityModel ? styles.iconTrashReadOnly : styles.iconTrash}
                  icon={faTrashAlt}
                  onClick={(event) => {
                    if (!props.canWriteEntityModel && props.canReadEntityModel) {
                      return event.preventDefault();
                    } else {
                      getEntityReferences(text);
                    }
                  }}
                  size="2x"
                />
              </span>
            </HCTooltip>
          </div>
        );
      }
    }
  ];

  const getEntityTypeProp = (entityName: any, prop: string) => {
    const entity = allEntityTypes.find(e => e.entityName === entityName);
    if (prop === "color") {
      return colorExistsForEntity(entityName) ? props.hubCentralConfig.modeling.entities[entityName][prop] : themeColors.defaults.entityColor;
    }
    if (prop === "icon") {
      return iconExistsForEntity(entityName) ? props.hubCentralConfig.modeling.entities[entityName][prop] : defaultIcon;
    }
    if (prop === "version") {
      return versionExistsForEntity(entity) ? entity.model.info[prop] : undefined;
    }
    return (entity.hasOwnProperty("model") &&
      entity.model.hasOwnProperty("definitions") &&
      entity.model.definitions.hasOwnProperty(entity.entityName) &&
      entity.model.definitions[entity.entityName].hasOwnProperty(prop)) ? entity.model.definitions[entity.entityName][prop] : "";
  };

  const expandedRowRender = (entity) => {
    return <PropertyTable
      entityName={entity.entityName.split(",")[0]}
      definitions={entity.definitions}
      canReadEntityModel={props.canReadEntityModel}
      canWriteEntityModel={props.canWriteEntityModel}
      sidePanelView={false}
      updateSavedEntity={props.updateSavedEntity}
    />;
  };

  const onExpand = (record, expanded, rowIndex) => {
    let newExpandedRows = [...expandedRows];

    if (expanded) {
      if (newExpandedRows.indexOf(record.entityName) === -1) {
        newExpandedRows.push(record.entityName);
      }
    } else {
      newExpandedRows = newExpandedRows.filter(row => row !== record.entityName);
    }
    setExpandedRows(newExpandedRows);
  };

  const colorExistsForEntity = (entityName) => {
    return (!props.hubCentralConfig?.modeling?.entities[entityName]?.color ? false : true);
  };

  const iconExistsForEntity = (entityName) => {
    return (!props.hubCentralConfig?.modeling?.entities[entityName]?.icon ? false : true);
  };

  const versionExistsForEntity = (entity) => {
    return (entity.hasOwnProperty("model") && entity.model.hasOwnProperty("info") && entity.model.info.hasOwnProperty("version"));
  };

  const renderTableData = allEntityTypes.map((entity, index) => {
    let result = {
      entityName: entity.entityName,
      instances: entity.entityName + "," + parseInt(entity.entityInstanceCount),
      lastProcessed: entity.entityName + "," + entity.latestJobId + "," + entity.latestJobDateTime,
      color: colorExistsForEntity(entity.entityName) ? (entity.entityName + "," + props.hubCentralConfig.modeling.entities[entity.entityName].color) : (entity.entityName + "," + themeColors.defaults.entityColor),
      icon: iconExistsForEntity(entity.entityName) ? (entity.entityName + "," + props.hubCentralConfig.modeling.entities[entity.entityName].icon) : (entity.entityName + "," + defaultIcon),
      actions: entity.entityName,
      definitions: entity.model.definitions,
    };
    return result;
  });

  return (
    <>
      <ConfirmationModal
        isVisible={showConfirmModal}
        type={confirmType}
        boldTextArray={confirmBoldTextArray}
        arrayValues={arrayValues}
        toggleModal={toggleConfirmModal}
        confirmAction={confirmAction}
      />
      <HCTable
        rowKey="entityName"
        className={styles.table}
        columns={columns}
        keyUtil={"key"}
        baseIndent={15}
        expandedRowRender={expandedRowRender}
        onExpand={onExpand}
        onTableChange={onSort}
        expandedRowKeys={expandedRows}
        data={renderTableData}
        pagination={{defaultPageSize: 20, size: "small", hideOnSinglePage: renderTableData.length <= 20}}
        showExpandIndicator={{bordered: true}}
        dynamicSortColumns
      />
    </>
  );
};

export default EntityTypeTable;
