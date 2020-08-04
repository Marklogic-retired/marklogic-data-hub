import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MLTable, MLTooltip } from '@marklogic/design-system';
import { faUndo, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './entity-type-table.module.scss';

import PropertyTable from '../property-table/property-table';
import ConfirmationModal from '../../confirmation-modal/confirmation-modal';
import { entityReferences, deleteEntity, updateEntityModels } from '../../../api/modeling';
import { ConfirmationType } from '../../../types/modeling-types';
import { UserContext } from '../../../util/user-context';
import { ModelingContext } from '../../../util/modeling-context';
import { queryDateConverter, relativeTimeConverter } from '../../../util/date-conversion';
import { numberConverter } from '../../../util/number-conversion';
import { ModelingTooltips } from '../../../config/tooltips.config';

type Props = {
  allEntityTypesData: any[];
  canReadEntityModel: boolean;
  canWriteEntityModel: boolean;
  autoExpand: string;
  editEntityTypeDescription: (entityTypeName: string, entityTypeDescription: string) => void;
  updateEntities: () => void;
  revertAllEntity: boolean;
  toggleRevertAllEntity: (state: boolean) => void;
  modifiedEntityTypesData: any[];
  useModifiedEntityTypesData: boolean;
  toggleModifiedEntityTypesData: (state: boolean) => void;
}

const EntityTypeTable: React.FC<Props> = (props) => {
  const { handleError } = useContext(UserContext);
  const { modelingOptions, removeEntityModified, clearEntityModified } = useContext(ModelingContext);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [allEntityTypes, setAllEntityTypes] = useState<any[]>([]);

  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [confirmBoldTextArray, setConfirmBoldTextArray] = useState<string[]>([]);
  const [arrayValues, setArrayValues] = useState<string[]>([]);
  const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.DeleteEntity);
  const [isAnyEntityModified, toggleAnyEntityModified] = useState(modelingOptions.isModified);

  useEffect(() => {
    if (props.autoExpand){
      setExpandedRows([props.autoExpand])
    }
  }, [props.autoExpand]);

  useEffect(() => {
    if (!props.useModifiedEntityTypesData) {
      // Deep copying props.allEntityTypesData since we dont want the prop to be mutated
      setAllEntityTypes(deepCopy(props.allEntityTypesData));
    }
  }, [JSON.stringify(props.allEntityTypesData)]);

  useEffect(() => {
    if (props.revertAllEntity) {
      // Deep copying props.allEntityTypesData since we dont want the prop to be mutated
      setAllEntityTypes(deepCopy(props.allEntityTypesData));
      props.toggleRevertAllEntity(false);
    }
  }, [props.revertAllEntity]);

  useEffect(() => {
    toggleAnyEntityModified(modelingOptions.isModified);
  }, [modelingOptions.isModified]);

  useEffect(() => {
    if (props.useModifiedEntityTypesData) {
      setAllEntityTypes(props.modifiedEntityTypesData);
      props.toggleModifiedEntityTypesData(false);
    }
  }, [JSON.stringify(props.modifiedEntityTypesData)]);

  const deepCopy = (object) => {
    return JSON.parse(JSON.stringify(object));
  };

  const getEntityReferences = async (entityName: string) => {
    try {
      const response = await entityReferences(entityName);
      if (response['status'] === 200) {
        let newConfirmType = ConfirmationType.DeleteEntity;

        if (isAnyEntityModified) {
          newConfirmType = ConfirmationType.DeleteEntityNoRelationshipOutstandingEditWarn;
          setArrayValues(modelingOptions.modifiedEntitiesArray.map(entity => entity.entityName));
        }

        if (response['data']['stepAndMappingNames'].length > 0) {
          newConfirmType = ConfirmationType.DeleteEntityStepWarn;
          setArrayValues(response['data']['stepAndMappingNames']);
        } else if (response['data']['entityNames'].length > 0) {
          if (isAnyEntityModified) {
            newConfirmType = ConfirmationType.DeleteEntityRelationshipOutstandingEditWarn;
            setArrayValues(modelingOptions.modifiedEntitiesArray.map(entity => entity.entityName));
          }
          else {
            newConfirmType = ConfirmationType.DeleteEntityRelationshipWarn;
          }
        }

        setConfirmBoldTextArray([entityName]);
        setConfirmType(newConfirmType);
        toggleConfirmModal(true);
      }
    } catch (error) {
      handleError(error)
    }
  }

  const deleteEntityFromServer = async () => {
    try {
      let entityName = confirmBoldTextArray.length ? confirmBoldTextArray[0] : '';
      const response = await deleteEntity(entityName);
      if (response['status'] === 200) {
        props.updateEntities();
      }
    } catch (error) {
      handleError(error)
    } finally {
      toggleConfirmModal(false);
    }
  }

  const saveEntityToServer = async () => {
    try {
      let modifiedEntity = modelingOptions.modifiedEntitiesArray.filter( entity => entity.entityName === confirmBoldTextArray[0])
      const response = await updateEntityModels(modifiedEntity);
      if (response['status'] === 200) {
        removeEntityModified(modifiedEntity[0]);
      }
    } catch (error) {
      handleError(error)
    } finally {
      toggleConfirmModal(false);
    }
  }

  const saveAllEntitiesThenDeleteFromServer = async () => {
    try {
      const response = await updateEntityModels(modelingOptions.modifiedEntitiesArray)
      if (response['status'] === 200) {
        try {
          let entityName = confirmBoldTextArray.length ? confirmBoldTextArray[0] : '';
          await deleteEntity(entityName);
        } catch (error) {
          handleError(error);
        } finally {
          await props.updateEntities();
          clearEntityModified();
          toggleConfirmModal(false);
        }
      }
    } catch (error) {
      handleError(error);
    }
  }

  const confirmSaveEntity = (entityName: string) => {
    setConfirmBoldTextArray([entityName]);
    setArrayValues([]);
    setConfirmType(ConfirmationType.SaveEntity);
    toggleConfirmModal(true);
  }

  const revertEntity = async () => {
    const entityName = confirmBoldTextArray[0];
    const entityNameFilter = (entity) => entity.entityName === entityName;
    const originalEntity = props.allEntityTypesData.find(entityNameFilter);
    const updatedEntity = allEntityTypes.find(entityNameFilter);

    // revert entity model definition
    updatedEntity.model.definitions = originalEntity.model.definitions;

    const modifiedEntity = modelingOptions.modifiedEntitiesArray.filter(entityNameFilter)[0];
    removeEntityModified(modifiedEntity);
    toggleConfirmModal(false);
  }

  const confirmRevertEntity = (entityName: string) => {
    setConfirmBoldTextArray([entityName]);
    setArrayValues([]);
    setConfirmType(ConfirmationType.RevertEntity);
    toggleConfirmModal(true);
  }

  const isEntityModified = (entityName: string) => {
    return modelingOptions.modifiedEntitiesArray.some(entity => entity.entityName === entityName)
  }

  const confirmAction = () => {
    if (confirmType === ConfirmationType.SaveEntity) {
      saveEntityToServer();
    }
    else if (confirmType === ConfirmationType.RevertEntity) {
      revertEntity();
    }
    else if (confirmType === ConfirmationType.DeleteEntityRelationshipOutstandingEditWarn || confirmType === ConfirmationType.DeleteEntityNoRelationshipOutstandingEditWarn) {
      saveAllEntitiesThenDeleteFromServer();
    }
    else {
      deleteEntityFromServer();
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'entityName',
      className: styles.tableText,
      width: 400,
      render: text => {
        let parseText = text.split(',');
        let entityName = parseText[0];
        let entityDescription = parseText[1];

        return (
          <>
            {props.canWriteEntityModel && props.canReadEntityModel ? (
              <MLTooltip title={ModelingTooltips.entityTypeName}>
                <span data-testid={parseText[0] + '-span'} className={styles.link}
                  onClick={() => {
                    props.editEntityTypeDescription(entityName, entityDescription);
                  }}>
                  {entityName}</span>
              </MLTooltip>
            ) : <span data-testid={parseText[0] + '-span'}>{entityName}</span>}
          </>
        )
      },
      sorter: (a, b) => {
        return a['entityName'].split(',')[0].localeCompare(b['entityName'].split(',')[0])
      }
    },
    {
      title: 'Instances',
      dataIndex: 'instances',
      className: styles.rightHeader,
      width: 100,
      render: text => {
        let parseText = text.split(',');
        let instanceCount = numberConverter(parseInt(parseText[1]));

        return (
          <>
            {instanceCount === '0' ? <span data-testid={parseText[0] + '-instance-count'}>{instanceCount}</span> : (
              <MLTooltip title={ModelingTooltips.instanceNumber}>
                <Link
                  to={{
                    pathname: "/tiles/explore",
                    state: { entity: parseText[0] }
                  }}
                  data-testid={parseText[0] + '-instance-count'}
                >
                  {instanceCount}
                </Link>
              </MLTooltip>
              )
            }
         </> 
        )
      },
      sorter: (a, b) => {
        let splitA = a['instances'].split(',');
        let aCount = parseInt(splitA[1]);
        let splitB = b['instances'].split(',');
        let bCount = parseInt(splitB[1]);

        return aCount - bCount;
      }
    },
    {
      title: 'Last Processed',
      dataIndex: 'lastProcessed',
      className: styles.tableText,
      width: 100,
      render: text => {
        let parseText = text.split(',');
        if (parseText[1] === 'undefined') {
          return 'n/a'
        } else {
          let displayDate = relativeTimeConverter(parseText[2]);
          return (
            <MLTooltip title={queryDateConverter(parseText[2]) + "\n" + ModelingTooltips.lastProcessed}>
              <Link
                to={{
                  pathname: "/tiles/explore",
                  state: { entityName: parseText[0], jobId: parseText[1] }
                }}
                data-testid={parseText[0]+ '-last-processed'}
              >
                {displayDate}
              </Link>
            </MLTooltip>

          )
        }
      },
      sorter: (a, b) => {
        let splitA = a['lastProcessed'].split(',');
        let splitB = b['lastProcessed'].split(',');
        return splitA[2].localeCompare(splitB[2])
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      className: styles.actions,
      width: 100,
      render: text => {

        const saveIcon = props.canWriteEntityModel ? (
          <MLTooltip title={ModelingTooltips.saveIcon}>
            <span
              data-testid={text + '-save-icon'}
              className={!isAnyEntityModified || !isEntityModified(text) ? styles.iconSaveReadOnly : styles.iconSave}
              onClick={(event) => {
                if (!props.canWriteEntityModel && props.canReadEntityModel || !isEntityModified(text)) {
                  return event.preventDefault()
                } else {
                  confirmSaveEntity(text)
                }
              }}
            />
          </MLTooltip>
        ) : <span data-testid={text + '-save-icon'} className={styles.iconSaveReadOnly}/>

        return (
          <div className={styles.iconContainer}>
            {saveIcon}
            <MLTooltip title={ModelingTooltips.revertIcon}>
              <FontAwesomeIcon
                data-testid={text + '-revert-icon'} 
                className={(!props.canWriteEntityModel && props.canReadEntityModel) || !isAnyEntityModified || !isEntityModified(text) ? styles.iconRevertReadOnly : styles.iconRevert}
                icon={faUndo}
                onClick={(event) => {
                  if (!props.canWriteEntityModel && props.canReadEntityModel) {
                    return event.preventDefault()
                  } else {
                    confirmRevertEntity(text);
                  }
                }}
                size="2x"
              />
            </MLTooltip>
            <FontAwesomeIcon
              data-testid={text + '-trash-icon'}
              className={!props.canWriteEntityModel && props.canReadEntityModel ? styles.iconTrashReadOnly : styles.iconTrash}
              icon={faTrashAlt}
              onClick={(event) => {
                if (!props.canWriteEntityModel && props.canReadEntityModel) {
                  return event.preventDefault()
                } else {
                  getEntityReferences(text);
                }
              }}
              size="2x"
            />
          </div>
        )
      }
    }
  ];

  const getEntityTypeDescription = (entity: any) => {
    return (entity.hasOwnProperty("model") &&
      entity.model.hasOwnProperty("definitions") &&
      entity.model.definitions.hasOwnProperty(entity.entityName) &&
      entity.model.definitions[entity.entityName].hasOwnProperty("description")) ? entity.model.definitions[entity.entityName].description : '';
  };

  const expandedRowRender = (entity) => {
    return <PropertyTable
              entityName={entity.entityName.split(',')[0]}
              definitions={entity.definitions}
              canReadEntityModel={props.canReadEntityModel}
              canWriteEntityModel={props.canWriteEntityModel}
            />
  };

  const onExpand = (expanded, record) => {
    let newExpandedRows =  [...expandedRows]
    if (expanded) {
      if ( newExpandedRows.indexOf(record.entityName) === -1) {
        newExpandedRows.push(record.entityName);
      }
    } else {
      newExpandedRows = newExpandedRows.filter(row => row !== record.entityName);
    }
    setExpandedRows(newExpandedRows);
  }

  const renderTableData = allEntityTypes.map((entity) => {
    return {
      entityName: entity.entityName + ',' + getEntityTypeDescription(entity),
      instances: entity.entityName + ',' + parseInt(entity.entityInstanceCount),
      lastProcessed: entity.entityName + ',' + entity.latestJobId + ',' + entity.latestJobDateTime,
      actions: entity.entityName,
      definitions: entity.model.definitions
    };
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
      <MLTable
        rowKey="entityName"
        locale={{ emptyText: ' ' }}
        className={styles.table}
        columns={columns}
        expandedRowRender={expandedRowRender}
        onExpand={onExpand}
        expandedRowKeys={expandedRows}
        dataSource={renderTableData}
        pagination={{ defaultPageSize: 20, size: 'small' }}
        size="middle"
      />
    </>
  );
}

export default EntityTypeTable;
