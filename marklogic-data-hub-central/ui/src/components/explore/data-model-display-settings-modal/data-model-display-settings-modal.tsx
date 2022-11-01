import React, {useState, useEffect, useContext} from "react";
import {Alert, Modal, Row, Col, Form} from "react-bootstrap";
import styles from "./data-model-display-settings-modal.module.scss";
import {HCButton, HCDivider, HCModal} from "@components/common";
import {themeColors} from "@config/themes.config";
import {defaultIcon} from "@config/explore.config";
import {UserContext} from "@util/user-context";
import {HubCentralConfigContext} from "@util/hubCentralConfig-context";
import * as _ from "lodash";
import EntityDisplaySettings, {EntityTableColumns} from "./entity-display-settings/entity-display-settings";
import ConceptsDisplaySettings, {ConceptsTableColumns} from "./concepts-display-settings/concepts-display-settings";

type Props = {
  isVisible: boolean;
  toggleModal: (reloadData: boolean) => void;
  entityDefinitionsArray: any;
  entityModels: any;
};

enum eVisibleSettings {
  EntityType,
  Concept
}

const DataModelDisplaySettingsModal: React.FC<Props> = ({isVisible, toggleModal, entityModels, entityDefinitionsArray}) => {
  const {handleError} = useContext(UserContext);
  const [entitiesData, setEntitiesData] = useState({});
  const [entitiesIndexes, setEntitiesIndexes] = useState({});
  const [entityTypeDisplaySettingsData, setEntityTypeDisplaySettingsData] = useState<any[]>([]);
  const [conceptsData, setConceptsData] = useState({});
  const [conceptsIndexes, setConceptsIndexes] = useState({});
  const [conceptDisplaySettingsData, setConceptDisplaySettingsData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [visibleSettings, setVisibleSettings] = useState<eVisibleSettings>(eVisibleSettings.EntityType);

  const {hubCentralConfig, updateHubCentralConfigOnServer} = useContext(HubCentralConfigContext);

  useEffect(() => {
    if (isVisible && hubCentralConfig) {
      if (hubCentralConfig?.modeling?.entities) {
        let tmpEntitiesIndexes = {};
        let tmpEntitiesData = _.clone(hubCentralConfig?.modeling?.entities);
        let entityTypeSettingsData: any = Object.keys(hubCentralConfig?.modeling?.entities).map((entityType, index) => {
          tmpEntitiesIndexes[entityType] = index;
          return {
            entityType: entityType,
            color: hubCentralConfig?.modeling?.entities[entityType]?.color || themeColors.defaults.entityColor,
            icon: hubCentralConfig?.modeling?.entities[entityType]?.icon || defaultIcon,
            label: hubCentralConfig?.modeling?.entities[entityType]?.label,
            propertiesOnHover: hubCentralConfig?.modeling?.entities[entityType]?.propertiesOnHover
          };
        });
        setEntitiesData(tmpEntitiesData);
        setEntitiesIndexes(tmpEntitiesIndexes);
        setEntityTypeDisplaySettingsData(entityTypeSettingsData);
      }
      if (hubCentralConfig?.modeling?.concepts) {
        let tmpConceptIndexes = {};
        let tmpConceptData = _.clone(hubCentralConfig?.modeling?.concepts);
        let conceptSettingsData: any = Object.keys(hubCentralConfig?.modeling?.concepts).map((concept, index) => {
          tmpConceptIndexes[concept] = index;
          return {
            concept,
            rowKey: concept,
            color: hubCentralConfig?.modeling?.concepts[concept]?.color || themeColors.defaults.entityColor,
            icon: hubCentralConfig?.modeling?.concepts[concept]?.icon || defaultIcon,
            children: Object.keys(hubCentralConfig?.modeling?.concepts[concept]?.semanticConcepts || {}).map((semanticConcept, subIndex) => {
              tmpConceptIndexes[`${concept}-${semanticConcept}`] = {
                parent: concept,
                index: subIndex
              };
              return {
                concept: semanticConcept,
                rowKey: `${concept}-${semanticConcept}`,
                color: hubCentralConfig?.modeling?.concepts[concept].semanticConcepts[semanticConcept]?.color || themeColors.defaults.entityColor,
                icon: hubCentralConfig?.modeling?.concepts[concept].semanticConcepts[semanticConcept]?.icon || defaultIcon,
              };
            })
          };
        });
        setConceptsData(tmpConceptData);
        setConceptsIndexes(tmpConceptIndexes);
        setConceptDisplaySettingsData(conceptSettingsData);
      }
    }

    return () => {
      setEntitiesData({});
      setEntitiesIndexes({});
      setEntityTypeDisplaySettingsData([]);

      setConceptsData({});
      setConceptsIndexes({});
      setConceptDisplaySettingsData([]);

      setVisibleSettings(eVisibleSettings.EntityType);
    };
  }, [isVisible, hubCentralConfig]);

  const closeModal = () => {
    toggleModal(false);
  };

  const onEntityColumnValueChange = (row, e, column: EntityTableColumns) => {
    const updateValue = (entityData) => {
      switch (column) {
      case EntityTableColumns.Color:
        entityData.color = e.color.hex;
        break;
      case EntityTableColumns.Icon:
        entityData.icon = e;
        break;
      case EntityTableColumns.EntityLabel:
        entityData.label = e.value;
        break;
      case EntityTableColumns.PropertiesOnHover:
        entityData.propertiesOnHover = e.map(property => property.replaceAll(" > ", "."));
        break;
      }
    };

    setEntitiesData(entitiesData => {
      const tmpEntitiesData = _.cloneDeep(entitiesData);
      updateValue(tmpEntitiesData[row.entityType]);
      return tmpEntitiesData;
    });

    setEntityTypeDisplaySettingsData(entityTypeDisplaySettingsData => {
      const settingsData = entityTypeDisplaySettingsData.map(entityData => Object.assign({}, entityData));
      updateValue(settingsData[entitiesIndexes[row.entityType]]);
      return settingsData;
    });
  };

  const onConceptsColumnValueChange = (row, e, column: ConceptsTableColumns) => {
    const updateValue = (concepts) => {
      switch (column) {
      case ConceptsTableColumns.Color:
        concepts.color = e.color.hex;
        break;
      case ConceptsTableColumns.Icon:
        concepts.icon = e;
        break;
      }
    };

    setConceptsData(conceptsData => {
      const tmpConceptsData = _.cloneDeep(conceptsData);
      if ((typeof conceptsIndexes[row.rowKey]).toString() === "object") {
        updateValue(tmpConceptsData[conceptsIndexes[row.rowKey].parent].semanticConcepts[row.concept]);
      } else {
        updateValue(tmpConceptsData[row.concept]);
      }
      return tmpConceptsData;
    });

    setConceptDisplaySettingsData(conceptDisplaySettingsData => {
      const tmpConceptDisplaySettingsData = conceptDisplaySettingsData.map(conceptData => Object.assign({}, conceptData));
      const conceptIndex = conceptsIndexes[row.rowKey];
      if ((typeof conceptIndex).toString() === "object") {
        updateValue(tmpConceptDisplaySettingsData[conceptsIndexes[conceptIndex.parent]].children[conceptIndex.index]);
      } else {
        updateValue(tmpConceptDisplaySettingsData[conceptIndex]);
      }
      return tmpConceptDisplaySettingsData;
    });
  };

  const handleSave = () => {
    try {
      let updatedPayload = _.cloneDeep(hubCentralConfig);
      updatedPayload.modeling.entities = Object.assign({}, entitiesData);
      updatedPayload.modeling.concepts = Object.assign({}, conceptsData);
      updateHubCentralConfigOnServer(updatedPayload);
      closeModal();
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty("message")) {
          setErrorMessage("name-error");
        } else {
          setErrorMessage(error["response"]["data"]["message"]);
        }
      } else {
        handleError(error);
      }
    }
  };

  const handleSelectedVisibleSetting = ({target: {value}}) => {
    setVisibleSettings(eVisibleSettings[value as keyof typeof eVisibleSettings]);
  };


  const modalFooter = (
    <div className={styles.editFooter}>
      <div
        className={styles.footer}
      >
        <HCButton
          size="sm"
          variant="outline-light"
          id={`cancel-entityType-settings-modal`}
          aria-label={`cancel-entityType-settings-modal`}
          onClick={() => closeModal()}
        >Cancel</HCButton>
        <HCButton
          className={styles.saveButton}
          size="sm"
          id={`save-entityType-settings-modal`}
          aria-label={`save-entityType-settings-modal`}
          variant="primary"
          onClick={handleSave}
        >Save</HCButton>
      </div>
    </div>
  );

  return (
    <HCModal
      show={isVisible}
      dialogClassName={styles.modal1400w}
      onHide={() => closeModal()}
    >
      <Modal.Header className={"bb-none align-items-start"}>
        <span className={"fs-4"}>
          Data model display settings
        </span>
        <button type="button" className="btn-close" aria-label="Close" id={"close-settings-modal"} onClick={() => closeModal()}></button>
      </Modal.Header>
      <Modal.Body>
        {errorMessage &&
          <Alert variant="danger" className="alert">
            {errorMessage}
          </Alert>
        }
        <div id="entityTypeDisplaySettingsContainer" data-testid="entityTypeDisplaySettingsContainer">
          <Row>
            <Col className={"d-flex mb-3 align-items-center"} id="srcType">
              <Form.Check
                inline
                id={"entityType"}
                name={"visibleSettings"}
                type={"radio"}
                checked={visibleSettings === eVisibleSettings.EntityType ? true : false}
                onChange={handleSelectedVisibleSetting}
                label={"Entity Type"}
                value={eVisibleSettings[eVisibleSettings.EntityType]}
                aria-label={"entityType"}
                className={"mb-0"}
              />
              <Form.Check
                inline
                id={"concepts"}
                name={"visibleSettings"}
                type={"radio"}
                checked={visibleSettings === eVisibleSettings.Concept ? true : false}
                onChange={handleSelectedVisibleSetting}
                label={"Concepts"}
                value={eVisibleSettings[eVisibleSettings.Concept]}
                aria-label={"Concepts"}
                className={"mb-0"}
              />
            </Col>
          </Row>

          <HCDivider />
          {visibleSettings === eVisibleSettings.EntityType &&
            <EntityDisplaySettings
              entityModels={entityModels}
              exploreSettingsData={entityTypeDisplaySettingsData}
              entityDefinitionsArray={entityDefinitionsArray}
              onEntityColumnValueChange={onEntityColumnValueChange}
            />
          }
          {visibleSettings === eVisibleSettings.Concept &&
            <ConceptsDisplaySettings
              conceptsSettingsData={conceptDisplaySettingsData}
              onConceptsColumnValueChange={onConceptsColumnValueChange}
            />
          }
        </div>
        {modalFooter}
      </Modal.Body>
    </HCModal>
  );
};

export default DataModelDisplaySettingsModal;
