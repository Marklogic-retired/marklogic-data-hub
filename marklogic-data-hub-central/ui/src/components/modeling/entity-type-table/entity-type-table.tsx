import React, {useState, useEffect, useContext} from "react";
import {Link} from "react-router-dom";
import {MLTooltip} from "@marklogic/design-system";
import {Tooltip, Table} from "antd";
import {faTrashAlt, faProjectDiagram} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./entity-type-table.module.scss";

import PropertyTable from "../property-table/property-table";
import ConfirmationModal from "../../confirmation-modal/confirmation-modal";
import {entityReferences, deleteEntity} from "../../../api/modeling";
import {EntityModified} from "../../../types/modeling-types";
import {ConfirmationType} from "../../../types/common-types";
import {getViewSettings, setViewSettings, UserContext} from "../../../util/user-context";
import {ModelingContext} from "../../../util/modeling-context";
import {queryDateConverter, relativeTimeConverter} from "../../../util/date-conversion";
import {numberConverter} from "../../../util/number-conversion";
import {ModelingTooltips, SecurityTooltips} from "../../../config/tooltips.config";

type Props = {
  allEntityTypesData: any[];
  canReadEntityModel: boolean;
  canWriteEntityModel: boolean;
  autoExpand: string;
  editEntityTypeDescription: (entityTypeName: string, entityTypeDescription: string, entityTypeNamespace: string, entityTypePrefix: string, entityTypeColor: string) => void;
  updateEntities: () => void;
  updateSavedEntity: (entity: EntityModified) => void;
  hubCentralConfig: any;
}

const EntityTypeTable: React.FC<Props> = (props) => {
  const storage = getViewSettings();
  const expandedRowStorage = storage?.model?.entityExpandedRows;

  const {handleError} = useContext(UserContext);
  const {modelingOptions, setGraphViewOptions} = useContext(ModelingContext);
  const [expandedRows, setExpandedRows] = useState<string[]>(expandedRowStorage ? expandedRowStorage : []);
  const [allEntityTypes, setAllEntityTypes] = useState<any[]>([]);

  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [confirmBoldTextArray, setConfirmBoldTextArray] = useState<string[]>([]);
  const [arrayValues, setArrayValues] = useState<string[]>([]);
  const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.DeleteEntity);


  useEffect(() => {
    if (props.autoExpand) {
      setExpandedRows([props.autoExpand]);
    }
  }, [props.autoExpand]);

  useEffect(() => {
    if (expandedRows === null) {
      return;
    }
    const rowStorage = getViewSettings();
    const newStorage = {...rowStorage, model: {...rowStorage.model, entityExpandedRows: expandedRows}};
    setViewSettings(newStorage);
  }, [expandedRows]);

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
    setGraphViewOptions({view: "graph", selectedEntity: entityName});
  };

  const columns = [
    {
      title: <span data-testid="entityName">Name</span>,
      dataIndex: "entityName",
      className: styles.tableText,
      width: 400,
      render: text => {
        let entityName = text;
        return (
          <>
            {props.canWriteEntityModel && props.canReadEntityModel ? (
              <Tooltip title={ModelingTooltips.entityTypeName}>
                <span data-testid={entityName + "-span"} className={styles.link}
                  onClick={() => {
                    props.editEntityTypeDescription(
                      entityName,
                      getEntityTypeProp(entityName, "description"),
                      getEntityTypeProp(entityName, "namespace"),
                      getEntityTypeProp(entityName, "namespacePrefix"),
                      getEntityTypeProp(entityName, "color")
                    );
                  }}>
                  {entityName}</span>
              </Tooltip>
            ) : <span data-testid={entityName + "-span"}>{entityName}</span>}
          </>
        );
      },
      //sortDirections: ["ascend", "descend", "ascend"], // DHFPROD-7711 MLTable -> Table
      sorter: (a, b) => {
        return a["entityName"].localeCompare(b["entityName"]);
      }
    },
    {
      title: <span data-testid="Instances">Instances</span>,
      dataIndex: "instances",
      className: styles.rightHeader,
      width: 100,
      render: text => {
        let parseText = text.split(",");
        let instanceCount = numberConverter(parseInt(parseText[1]));

        return (
          <>
            {instanceCount === "0" ? <span data-testid={parseText[0] + "-instance-count"}>{instanceCount}</span> : (
              <Tooltip title={ModelingTooltips.instanceNumber}>
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
              </Tooltip>
            )
            }
          </>
        );
      },
      // sortDirections: ["ascend", "descend", "ascend"], // DHFPROD-7711 MLTable -> Table
      sorter: (a, b) => {
        let splitA = a["instances"].split(",");
        let aCount = parseInt(splitA[1]);
        let splitB = b["instances"].split(",");
        let bCount = parseInt(splitB[1]);

        return aCount - bCount;
      }
    },
    {
      title: <span data-testid="lastProcessed">Last Processed</span>,
      dataIndex: "lastProcessed",
      className: styles.tableText,
      width: 100,
      render: text => {
        let parseText = text.split(",");
        if (parseText[1] === "undefined") {
          return "n/a";
        } else {
          let displayDate = relativeTimeConverter(parseText[2]);
          return (
            <Tooltip title={queryDateConverter(parseText[2]) + "\n" + ModelingTooltips.lastProcessed}>
              <Link
                to={{
                  pathname: "/tiles/explore",
                  state: {entityName: parseText[0], jobId: parseText[1]}
                }}
                data-testid={parseText[0]+ "-last-processed"}
                className={styles.iconHover}
              >
                {displayDate}
              </Link>
            </Tooltip>

          );
        }
      },
      //sortDirections: ["ascend", "descend", "ascend"], // DHFPROD-7711 MLTable -> Table
      //defaultSortOrder: "descend", // DHFPROD-7711 MLTable -> Table
      sorter: (a, b) => {
        let splitA = a["lastProcessed"].split(",");
        let splitB = b["lastProcessed"].split(",");
        return splitA[2].localeCompare(splitB[2]);
      }
    },
    {
      title: <span data-testid="color">Color</span>,
      dataIndex: "color",
      className: styles.actions,
      width: 100,
      render: text => {
        let parseText = text.split(",");
        let entityName = parseText[0];
        let color = parseText[1];
        return (
          <MLTooltip title={<span>This color is associated with the <b>{entityName}</b> entity type throughout your project.</span>}>
            <div style={{width: "24px", height: "26px", background: color, marginLeft: "45%"}} data-testid={`${entityName}-${color}-color`}></div>
          </MLTooltip>
        );
      }
    },
    {
      title: "Actions",
      dataIndex: "actions",
      className: styles.actions,
      width: 100,
      render: text => {
        return (
          <div className={styles.iconContainer}>
            <Tooltip title={ModelingTooltips.viewGraph} overlayStyle={{maxWidth: "225px"}}>
              <FontAwesomeIcon
                data-testid={text + "-graphView-icon"}
                className={styles.iconViewGraph}
                icon={faProjectDiagram}
                onClick={() => navigateToGraphView(text)}
              />
            </Tooltip>
            <Tooltip title={props.canWriteEntityModel ? ModelingTooltips.deleteIcon : "Delete Entity: " + SecurityTooltips.missingPermission} overlayStyle={{maxWidth: "225px"}}>
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
            </Tooltip>
          </div>
        );
      }
    }
  ];

  const getEntityTypeProp = (entityName: any, prop: string) => {
    const entity = allEntityTypes.find(e => e.entityName === entityName);
    if (prop === "color") {
      return colorExistsForEntity(entityName) ? props.hubCentralConfig.modeling.entities[entityName][prop]: "#EEEFF1";
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

  const onExpand = (expanded, record) => {
    let newExpandedRows =  [...expandedRows];
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

  const renderTableData = allEntityTypes.map((entity) => {
    let result = {
      entityName: entity.entityName,
      instances: entity.entityName + "," + parseInt(entity.entityInstanceCount),
      lastProcessed: entity.entityName + "," + entity.latestJobId + "," + entity.latestJobDateTime,
      color: colorExistsForEntity(entity.entityName) ? (entity.entityName + "," + props.hubCentralConfig.modeling.entities[entity.entityName].color) : (entity.entityName + "," + "#EEEEFF1"),
      actions: entity.entityName,
      definitions: entity.model.definitions
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
      <Table
        rowKey="entityName"
        locale={{emptyText: " "}}
        className={styles.table}
        columns={columns}
        expandedRowRender={expandedRowRender}
        onExpand={onExpand}
        expandedRowKeys={expandedRows}
        dataSource={renderTableData}
        pagination={{defaultPageSize: 20, size: "small", hideOnSinglePage: renderTableData.length <= 20}}
        size="middle"
      />
      {/* sortDirections: ["ascend", "descend", "ascend"], */}
    </>
  );
};

export default EntityTypeTable;
