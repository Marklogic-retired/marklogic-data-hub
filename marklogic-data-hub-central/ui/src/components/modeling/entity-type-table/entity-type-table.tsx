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
import {HCTooltip, HCTable, DynamicIcons, HCButton} from "@components/common";
import {themeColors} from "@config/themes.config";
import {defaultConceptIcon, defaultIcon} from "@config/explore.config";
import {colorExistsForNode, getCategoryWithinModel, iconExistsForNode} from "@util/modeling-utils";
import {ChevronDown, ChevronRight} from "react-bootstrap-icons";

type Props = {
  allEntityTypesData: any[];
  canReadEntityModel: boolean;
  canWriteEntityModel: boolean;
  autoExpand: string;
  editEntityTypeDescription: (entityTypeName: string, entityTypeDescription: string, entityTypeNamespace: string, entityTypePrefix: string, entityTypeVersion: string, entityTypeColor: string, entityTypeIcon: string) => void;
  updateEntities: () => void;
  updateSavedEntity: (entity: EntityModified, errorHandler: Function | undefined) => void;
  hubCentralConfig: any;
  editConceptClassDescription: (conceptClassName: string, conceptClassDescription: string, conceptClassColor: string, conceptClassIcon: string) => void;
  deleteConceptClass: (conceptClassName: string) => void;
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
      dataField: "nodeName",
      className: styles.tableText,
      width: 400,
      sort: true,
      defaultSortOrder: isSorted("nodeName") ? sortedCol?.order : undefined,
      headerFormatter: (_, $, {sortElement}) => (
        <><span data-testid="entityName">Name</span>{sortElement}</>
      ),
      formatter: (text, row) => {
        let isConceptClass = row.nodeType === "Concept Class";
        let entityName = text;
        let nodeType = row.nodeType === "Concept Class" ? "concept class" : "entity";
        return (
          <>
            {props.canWriteEntityModel && props.canReadEntityModel ? (
              <HCTooltip text={ModelingTooltips.nodeName(nodeType)} id="entity-name-tooltip" placement="top">
                <span data-testid={entityName + "-span"} className={styles.link}
                  onClick={() => {
                    if (!isConceptClass) {
                      props.editEntityTypeDescription(
                        entityName,
                        getEntityTypeProp(entityName, "description", isConceptClass),
                        getEntityTypeProp(entityName, "namespace", isConceptClass),
                        getEntityTypeProp(entityName, "namespacePrefix", isConceptClass),
                        getEntityTypeProp(entityName, "version", isConceptClass),
                        getEntityTypeProp(entityName, "color", isConceptClass),
                        getEntityTypeProp(entityName, "icon", isConceptClass),
                      );
                    } else {
                      props.editConceptClassDescription(
                        entityName,
                        getEntityTypeProp(entityName, "description", isConceptClass),
                        getEntityTypeProp(entityName, "color", isConceptClass),
                        getEntityTypeProp(entityName, "icon", isConceptClass),
                      );
                    }
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
      text: "Entity Type/Concept Class",
      dataField: "nodeType",
      className: styles.tableText,
      width: 400,
      sort: true,
      defaultSortOrder: isSorted("nodeType") ? sortedCol?.order : undefined,
      headerFormatter: (_, $, {sortElement}) => (
        <><span data-testid="nodeType">Entity Type/Concept Class</span>{sortElement}</>
      ),

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
        if (!text) {
          return;
        }
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
        if (!text) {
          return;
        }
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
      formatter: (text, row) => {
        let parseText = text.split(",");
        let entityName = parseText[0];
        let color = parseText[1];
        let nodeType = row.nodeType === "Concept Class" ? "concept class" : "entity";
        return (
          <HCTooltip placement="top" id="color-tooltip" text={<span>This color is associated with the <b>{entityName}</b> {nodeType} throughout your project.</span>}>
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
      formatter: (text, row) => {
        let parseText = text.split(",");
        let entityName = parseText[0];
        let icon = parseText[1];
        let nodeType = row.nodeType === "Concept Class" ? "concept class" : "entity";
        return (
          <HCTooltip placement="top" id="icon-tooltip" text={<span>This icon is associated with the <b>{entityName}</b> {nodeType} throughout your project.</span>}>
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
      formatter: (text, row) => {
        let isConceptClass = row.nodeType === "Concept Class";
        return (
          <div className={styles.iconContainer}>
            <HCTooltip text={ModelingTooltips.viewGraph(isConceptClass)} id="graph-view-tooltip" placement="top">
              <span className="p-2 inline-block cursor-pointer">
                <FontAwesomeIcon
                  data-testid={text + "-graphView-icon"}
                  className={styles.iconViewGraph}
                  icon={faProjectDiagram}
                  onClick={() => navigateToGraphView(text)}
                /></span>
            </HCTooltip>
            <HCTooltip text={props.canWriteEntityModel ? ModelingTooltips.deleteIcon(isConceptClass) : (!isConceptClass ? "Delete Entity: " : "Delete Concept Class: ") + SecurityTooltips.missingPermission} id="trash-icon-tooltip" placement="top">
              <span className="p-2 inline-block cursor-pointer">
                <FontAwesomeIcon
                  data-testid={text + "-trash-icon"}
                  className={!props.canWriteEntityModel && props.canReadEntityModel ? styles.iconTrashReadOnly : styles.iconTrash}
                  icon={faTrashAlt}
                  onClick={(event) => {
                    if (!props.canWriteEntityModel && props.canReadEntityModel) {
                      return event.preventDefault();
                    } else {
                      if (row.nodeType === "Entity Type") {
                        getEntityReferences(text);
                      } else {
                        props.deleteConceptClass(text);
                      }
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

  const getEntityTypeProp = (nodeName: any, prop: string, isConceptClass: boolean) => {
    const node = allEntityTypes.find(e => !isConceptClass ? e.entityName === nodeName : e.conceptName === nodeName);
    if (prop === "color") {
      return getColor(nodeName, isConceptClass);
    }
    if (prop === "icon") {
      return getIcon(nodeName, isConceptClass);
    }
    if (prop === "version") {
      return versionExistsForEntity(node) ? node.model.info[prop] : undefined;
    }
    if (!isConceptClass) {
      return (node.hasOwnProperty("model") &&
      node.model.hasOwnProperty("definitions") &&
      node.model.definitions.hasOwnProperty(node.entityName) &&
      node.model.definitions[node.entityName].hasOwnProperty(prop)) ? node.model.definitions[node.entityName][prop] : "";
    } else {
      return (node.hasOwnProperty("model") &&
      node.model.hasOwnProperty("info") &&
      node.model.info.hasOwnProperty(prop)) ? node.model.info[prop] : "";
    }
  };

  const expandedRowRender = (entity) => {
    let isConcept = entity.nodeType === "Concept Class";
    return !isConcept ? <PropertyTable
      entityName={entity.nodeName.split(",")[0]}
      definitions={entity.definitions}
      canReadEntityModel={props.canReadEntityModel}
      canWriteEntityModel={props.canWriteEntityModel}
      sidePanelView={false}
      updateSavedEntity={props.updateSavedEntity}
    /> : undefined;
  };

  const onExpand = (record, expanded, rowIndex) => {
    let newExpandedRows = [...expandedRows];
    let rowKey = `${record.nodeName}-${record.nodeType}`;

    if (expanded) {
      if (newExpandedRows.indexOf(rowKey) === -1) {
        newExpandedRows.push(rowKey);
      }
    } else {
      newExpandedRows = newExpandedRows.filter(row => row !== rowKey);
    }
    setExpandedRows(newExpandedRows);
  };

  const expandColumnRenderer = ({expanded, rowKey, expandable}) => {
    let rowType = rowKey.toString().includes("-") ? rowKey.toString().split("-").pop() : "";
    if (!expandable || rowType === "Concept Class") {
      return null;
    }

    return <HCButton data-testid={`${rowKey}-expand-icon`} aria-label="Expand row" variant="outline-light" className={styles.expandButtonIndicator}>
      {expanded ?
        <ChevronDown className={styles.iconIndicator} aria-label="down" /> :
        <ChevronRight className={styles.iconIndicator} aria-label="right" />}
    </HCButton>;
  };

  const versionExistsForEntity = (entity) => {
    return (entity.hasOwnProperty("model") && entity.model.hasOwnProperty("info") && entity.model.info.hasOwnProperty("version"));
  };

  const getColor = (nodeName, isConcept: boolean) => {
    let color = themeColors.defaults.entityColor;
    let modelCategory = getCategoryWithinModel(isConcept);
    let colorExistsOnServer = colorExistsForNode(nodeName, isConcept, props.hubCentralConfig);
    if (colorExistsOnServer) {
      color = props.hubCentralConfig.modeling[modelCategory][nodeName]["color"];
    } else {
      color = !isConcept ? themeColors.defaults.entityColor: themeColors.defaults.conceptColor;
    }
    return color;
  };

  const getIcon = (nodeName, isConcept: boolean = false) => {
    let defaultNodeIcon = isConcept ? defaultConceptIcon : defaultIcon;
    let icon = defaultNodeIcon;
    let modelCategory = getCategoryWithinModel(isConcept);
    let iconExistsOnServer = iconExistsForNode(nodeName, isConcept, props.hubCentralConfig);
    if (iconExistsOnServer) {
      icon = props.hubCentralConfig.modeling[modelCategory][nodeName]["icon"];
    } else {
      icon = defaultNodeIcon;
    }
    return icon;
  };

  const renderTableData = allEntityTypes.map((entity, index) => {
    let isConceptClass = entity.hasOwnProperty("conceptName");
    let nodeName = !isConceptClass ? entity.entityName : entity.conceptName;
    let nodeType = !isConceptClass ? "Entity Type" : "Concept Class";
    let result = {
      nodeKey: `${nodeName}-${nodeType}`,
      nodeName: nodeName,
      nodeType: nodeType,
      instances: !isConceptClass ? entity.entityName + "," + parseInt(entity.entityInstanceCount) : "",
      lastProcessed: !isConceptClass ? entity.entityName + "," + entity.latestJobId + "," + entity.latestJobDateTime : "",
      color: nodeName + "," + getColor(nodeName, isConceptClass),
      icon: nodeName + "," + getIcon(nodeName, isConceptClass),
      actions: nodeName,
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
        rowKey="nodeKey"
        className={styles.table}
        columns={columns}
        keyUtil={"key"}
        baseIndent={15}
        expandedRowRender={(node) => node.nodeType === "Entity Type" ? expandedRowRender(node) : undefined}
        onExpand={(node, expanded, rowIndex) => node.nodeType === "Entity Type" ? onExpand(node, expanded, rowIndex) : ""}
        onTableChange={onSort}
        expandedRowKeys={expandedRows}
        data={renderTableData}
        pagination={{defaultPageSize: 20, size: "small", hideOnSinglePage: renderTableData.length <= 20}}
        expandColumnRenderer={expandColumnRenderer}
        showExpandIndicator={{bordered: true}}
        dynamicSortColumns
      />
    </>
  );
};

export default EntityTypeTable;
