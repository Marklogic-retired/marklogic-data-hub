import "./entity-tiles.scss";

import {Accordion, Card, Col, Modal, Row, Tab, Tabs} from "react-bootstrap";
import React, {useContext, useEffect, useState} from "react";
import {UserContext, getViewSettings, setViewSettings} from "@util/user-context";
import {createStep, deleteStep, getSteps, updateStep} from "@api/steps";

import {CurationContext} from "@util/curation-context";
import CustomCard from "./custom/custom-card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {HCButton, HCModal} from "@components/common";
import MappingCard from "./mapping/mapping-card";
import {MappingStepMessages} from "@config/tooltips.config";
import MatchingCard from "./matching/matching-card";
import MergingCard from "./merging/merging-card";
import axios from "axios";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import {sortStepsByUpdated} from "@util/conversionFunctions";
import styles from "./entity-tiles.module.scss";
import {useLocation} from "react-router-dom";

const EntityTiles = (props) => {
  const {setActiveStepWarning, setValidateMatchCalled, setValidateMergeCalled} = useContext(CurationContext);
  const {handleError} = useContext(UserContext);
  const entityModels = props.entityModels || {};
  const location = useLocation<any>();
  const [locationEntityType, setLocationEntityType] = useState<string[]>([]);
  const [activeEntityTypes, setActiveEntityTypes] = useState<string[]>([]);
  const [viewData, setViewData] = useState<string[]>([]);
  const [mappingArtifacts, setMappingArtifacts] = useState<any[]>([]);
  const [matchingArtifacts, setMatchingArtifacts] = useState<any[]>([]);
  const [mergingArtifacts, setMergingArtifacts] = useState<any[]>([]);
  const [customArtifactsWithEntity, setCustomArtifactsWithEntity] = useState<any[]>([]);
  const [customArtifactsWithoutEntity, setCustomArtifactsWithoutEntity] = useState<any[]>([]);
  const {canReadMapping, canWriteMapping} = props;
  //For accordian within entity tiles
  const [requiresNoEntityTypeTile, setRequiresNoEntityTypeTile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openStep, setOpenStep] = useState({});
  const tabsToStorage = getViewSettings();
  const dataHubViewSettings: any = getViewSettings()?.curateTile;
  interface ModalError {
    isVisible: boolean,
    message: string | JSX.Element
  }

  const [modalError, setModalError] = useState<ModalError>({
    isVisible: false,
    message: ""
  });

  const updateSelection = () => {
    if (dataHubViewSettings) {
      setViewData(dataHubViewSettings?.activeTabs);
      setActiveEntityTypes(dataHubViewSettings?.activeAccordeon ? dataHubViewSettings?.activeAccordeon : []);
    }
  };

  useEffect(() => {
    getMappingArtifacts();
    getMatchingArtifacts();
    getMergingArtifacts();
    getCustomArtifacts();
  }, [isLoading]);

  useEffect(() => {
    updateSelection();
  }, []);

  useEffect(() => {
    const newStorage = {...tabsToStorage, curateTile: {...tabsToStorage.curateTile, activeAccordeon: activeEntityTypes, activeTabs: viewData}};
    setViewSettings(newStorage);
  }, [activeEntityTypes, viewData]);

  useEffect(() => {
    let view;
    if (location.state && location.state.stepDefinitionType) {
      if (location.state.stepDefinitionType === "mapping") {
        view = "map-";
      } else if (location.state.stepDefinitionType === "custom") {
        view = "custom-";
      } else if (location.state.stepDefinitionType === "matching") {
        view = "match-";
      } else if (location.state.stepDefinitionType === "merging") {
        view = "merge-";
      }
      const activeLocationEntityTypes = [location.state.targetEntityType || "No Entity Type"];
      setLocationEntityType(activeLocationEntityTypes);
      setActiveEntityTypes(activeLocationEntityTypes);
    } else {
      if (props.canReadMapping) {
        view = "map-";
      } else if (props.canReadCustom) {
        view = "custom-";
      } else if (props.canReadMatchMerge) {
        view = "match-";
      }
    }

    if (dataHubViewSettings && dataHubViewSettings?.activeTabs?.length) {
      setViewData(dataHubViewSettings?.activeTabs);
    } else {
      let tempView: string[] = [];
      Object.keys(props.entityModels).sort().forEach(ent => {
        tempView.push(view + ent);
      });
      setViewData([...tempView]);
    }
  }, [props, location]);

  const updateView = (index, artifactType, entityType) => {
    let tempView: string[];
    tempView = viewData;
    tempView[index] = artifactType + "-" + entityType;
    setViewData([...tempView]);
  };

  const updateIsLoadingFlag = () => {
    if (isLoading) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  };

  const getMappingArtifacts = async () => {
    try {
      if (canReadMapping) {
        let response = await getSteps("mapping");
        if (response.status === 200) {
          let mapArtifacts = response.data;
          mapArtifacts.sort((a, b) => (a.entityType > b.entityType) ? 1 : -1);
          setMappingArtifacts([...mapArtifacts]);
        }
      }
    } catch (error) {
      let message = error;
      console.error("Error while fetching the mappings!", message);
      handleError(error);
    }
  };

  const deleteMappingArtifact = async (mapName) => {
    try {
      let response = await deleteStep(mapName, "mapping");
      if (response.status === 200) {
        updateIsLoadingFlag();
      }
    } catch (error) {
      let message = error.response.data.message;
      console.error("Error deleting mapping", message);
      handleError(error);
    }
  };

  const createMappingArtifact = async (mapping) => {
    try {
      let response = await createStep(mapping.name, "mapping", mapping);
      if (response.status === 200) {
        updateIsLoadingFlag();
        setOpenStep({name: mapping.name, entityType: mapping.targetEntityType});
        return {code: response.status};
      } else {
        return {code: response.status};
      }
    } catch (error) {
      let message = error.response.data.message;
      console.error("Error creating mapping", message);
      if (message.includes("already exists")) {
        message.indexOf(mapping.name) > -1 ? setModalError({
          isVisible: true,
          message: <p aria-label="duplicate-step-error">Unable to create mapping step. A mapping step with the name <b>{mapping.name}</b> already exists.</p>
        }) : setModalError({
          isVisible: true,
          message
        });
      }
    }
  };

  const updateMappingArtifact = async (mapping) => {
    try {
      let response = await updateStep(mapping.name, "mapping", mapping);
      if (response.status === 200) {
        updateIsLoadingFlag();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      let message = error;
      console.error("Error updating mapping", message);
      return false;
    }
  };

  const getMatchingArtifacts = async () => {
    try {
      if (props.canReadMatchMerge) {
        let response = await axios.get("/api/steps/matching");
        if (response.status === 200) {
          let entArt = response.data;
          entArt.sort((a, b) => (a.entityType > b.entityType) ? 1 : -1);
          setMatchingArtifacts([...entArt]);
        }
      }
    } catch (error) {
      let message = error;
      console.error("Error while fetching matching artifacts", message);
      handleError(error);
    }
  };

  const deleteMatchingArtifact = async (matchingName) => {
    try {
      let response = await axios.delete(`/api/steps/matching/${matchingName}`);
      if (response.status === 200) {
        updateIsLoadingFlag();
      }
    } catch (error) {
      let message = error.response.data.message;
      console.error("Error while deleting matching artifact.", message);
      handleError(error);
    }
  };

  const createMatchingArtifact = async (matchingObj) => {
    try {
      let response = await axios.post("/api/steps/matching", matchingObj);
      if (response.status === 200) {
        let warningResponse = await axios.get(`/api/steps/matching/${matchingObj.name}/validate`);
        if (warningResponse.status === 200) {
          await setActiveStepWarning(warningResponse["data"]);
          setValidateMatchCalled(true);
        }
        updateIsLoadingFlag();
      }
    } catch (error) {
      setValidateMatchCalled(true);
      let message = error.response.data.message;
      console.error("Error while creating the matching artifact!", message);
      message.indexOf(matchingObj.name) > -1 ? setModalError({
        isVisible: true,
        message: <p aria-label="duplicate-step-error">Unable to create matching step. A matching step with the name <b>{matchingObj.name}</b> already exists.</p>
      }) : setModalError({
        isVisible: true,
        message
      });
    }
  };

  const updateMatchingArtifact = async (matchingObj) => {
    try {
      let response = await axios.put(`/api/steps/matching/${matchingObj.name}`, matchingObj);
      if (response.status === 200) {
        let warningResponse = await axios.get(`/api/steps/matching/${matchingObj.name}/validate`);
        if (warningResponse.status === 200) {
          await setActiveStepWarning(warningResponse["data"]);
          setValidateMatchCalled(true);
        }
        updateIsLoadingFlag();
      }
    } catch (error) {
      setValidateMatchCalled(true);
      let message = error;
      console.error("Error updating matching", message);
      handleError(error);
      return false;
    }
  };

  const getMergingArtifacts = async () => {
    if (props.canReadMatchMerge) {
      try {
        let response = await axios.get("/api/steps/merging");
        if (response.status === 200) {
          setMergingArtifacts(response.data);
        }
      } catch (error) {
        let message = error;
        console.error("Error while fetching matching artifacts", message);
        handleError(error);
      }
    }
  };

  const deleteMergingArtifact = async (mergeName) => {
    try {
      let response = await axios.delete(`/api/steps/merging/${mergeName}`);
      if (response.status === 200) {
        updateIsLoadingFlag();
      }
    } catch (error) {
      let message = error.response.data.message;
      console.error("Error while deleting matching artifact.", message);
      handleError(error);
    }
  };

  const createMergingArtifact = async (mergingObj) => {
    try {
      let response = await axios.post("/api/steps/merging", mergingObj);
      if (response.status === 200) {
        let warningResponse = await axios.get(`/api/steps/merging/${mergingObj.name}/validate`);
        if (warningResponse.status === 200) {
          await setActiveStepWarning(warningResponse["data"]);
          setValidateMergeCalled(true);
        }
        updateIsLoadingFlag();
      }
    } catch (error) {
      setValidateMergeCalled(true);
      let message = error.response.data.message;
      console.error("Error while creating the merging artifact!", message);
      message.indexOf(mergingObj.name) > -1 ? setModalError({
        isVisible: true,
        message: <p aria-label="duplicate-step-error">Unable to create merging step. A merging step with the name <b>{mergingObj.name}</b> already exists.</p>
      }) : setModalError({
        isVisible: true,
        message
      });
    }
  };

  const updateMergingArtifact = async (mergingObj) => {
    try {
      let response = await axios.put(`/api/steps/merging/${mergingObj.name}`, mergingObj);
      if (response.status === 200) {
        let warningResponse = await axios.get(`/api/steps/merging/${mergingObj.name}/validate`);
        if (warningResponse.status === 200) {
          await setActiveStepWarning(warningResponse["data"]);
          setValidateMergeCalled(true);
        }
        updateIsLoadingFlag();
      }
    } catch (error) {
      setValidateMergeCalled(true);
      let message = error;
      console.error("Error updating merging", message);
      handleError(error);
      return false;

    }
  };

  const getCustomArtifacts = async () => {
    try {
      if (props.canReadCustom) {
        let response = await axios.get("/api/steps/custom");
        if (response.status === 200) {
          let entArt = response.data;
          setCustomArtifactsWithEntity([...entArt.stepsWithEntity]);
          if (entArt.stepsWithoutEntity.length > 0) {
            setRequiresNoEntityTypeTile(true);
          }
          setCustomArtifactsWithoutEntity([...entArt.stepsWithoutEntity]);
        }
      }
    } catch (error) {
      let message = error;
      console.error("Error while fetching custom artifacts", message);
      handleError(error);
    }
  };

  const getCustomArtifactProps = async (name: String) => {
    try {
      if (props.canReadCustom) {
        let response = await axios.get("/api/steps/custom/" + name);
        if (response.status === 200) {
          return response.data;
        }
      }
    } catch (error) {
      let message = error;
      console.error("Error while fetching custom artifacts", message);
      handleError(error);
    }
  };

  const updateCustomArtifact = async (payload) => {
    try {
      let response = await updateStep(payload.name, "custom", payload);
      if (response.status === 200) {
        updateIsLoadingFlag();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      let message = error;
      console.error("Error updating custom step", message);
      handleError(error);
      return false;
    }
  };

  // Check if entity name has no matching definition
  const titleNoDefinition = (selectedEntityName) => {
    let entityModels = props.entityModels;
    return selectedEntityName && !entityModels[selectedEntityName]?.model?.definitions?.hasOwnProperty(selectedEntityName);
  };

  const outputCards = (index, entityType, mappingCardData, matchingCardData, mergingCardData, customCardData) => {
    let output;
    if (viewData[index] === "map-" + entityType) {
      output = (titleNoDefinition(entityType)) ? <div className={styles.NoMatchDefTitle} aria-label={"mappingNoTitleDisplay"}>{MappingStepMessages.titleNoDefinition}</div>
        : <div className={styles.cardView}>
          <MappingCard data={mappingCardData ? sortStepsByUpdated(mappingCardData.artifacts) : []}
            flows={props.flows}
            entityTypeTitle={entityType}
            deleteMappingArtifact={deleteMappingArtifact}
            createMappingArtifact={createMappingArtifact}
            updateMappingArtifact={updateMappingArtifact}
            canReadWrite={canWriteMapping}
            canReadOnly={canReadMapping}
            openStep={openStep}
            entityModel={props.entityModels[entityType]}
            canWriteFlow={props.canWriteFlow}
            addStepToFlow={props.addStepToFlow}
            addStepToNew={props.addStepToNew}
          />
        </div>;
    } else if (viewData[index] === "match-" + entityType) {
      output = (titleNoDefinition(entityType)) ? <div className={styles.NoMatchDefTitle} aria-label={"matchingNoTitleDisplay"}>{MappingStepMessages.titleNoDefinition}</div>
        : <div className={styles.cardView}>
          <MatchingCard
            matchingStepsArray={matchingCardData ? sortStepsByUpdated(matchingCardData.artifacts) : []}
            flows={props.flows}
            entityName={entityType}
            deleteMatchingArtifact={deleteMatchingArtifact}
            createMatchingArtifact={createMatchingArtifact}
            updateMatchingArtifact={updateMatchingArtifact}
            canReadMatchMerge={props.canReadMatchMerge}
            canWriteMatchMerge={props.canWriteMatchMerge}
            entityModel={props.entityModels[entityType]}
            canWriteFlow={props.canWriteFlow}
            addStepToFlow={props.addStepToFlow}
            addStepToNew={props.addStepToNew}
          />
        </div>;
      //TODO:- Enhance below code for merging when working on DHFPROD-4328
    } else if (viewData[index] === "merge-" + entityType) {
      output = (titleNoDefinition(entityType)) ? <div className={styles.NoMatchDefTitle} aria-label={"mergingNoTitleDisplay"}>{MappingStepMessages.titleNoDefinition}</div>
        : <div className={styles.cardView}>
          <MergingCard
            mergingStepsArray={mergingCardData ? sortStepsByUpdated(mergingCardData.artifacts) : []}
            flows={props.flows}
            entityName={entityType}
            entityModel={props.entityModels[entityType]}
            canReadMatchMerge={props.canReadMatchMerge}
            canWriteMatchMerge={props.canWriteMatchMerge}
            deleteMergingArtifact={deleteMergingArtifact}
            createMergingArtifact={createMergingArtifact}
            updateMergingArtifact={updateMergingArtifact}
            addStepToFlow={props.addStepToFlow}
            addStepToNew={props.addStepToNew}
            canWriteFlow={props.canWriteFlow}
          />
        </div>;
    } else if (viewData[index] === "custom-" + entityType) {
      output = (titleNoDefinition(entityType)) ? <div className={styles.NoMatchDefTitle} aria-label={"customNoTitleDisplay"}>{MappingStepMessages.titleNoDefinition}</div>
        : <div className={styles.cardView}>
          <div className={styles.customEntityTitle} aria-label={"customEntityTitle"}>You can create Custom steps either manually or using Gradle, then deploy them. Deployed Custom steps appear here. Hub Central only allows running Custom steps, not editing or deleting them.</div>
          <CustomCard data={customCardData ? sortStepsByUpdated(customCardData.artifacts) : []}
            flows={props.flows}
            entityTypeTitle={entityType}
            entityModel={props.entityModels[entityType]}
            getArtifactProps={getCustomArtifactProps}
            updateCustomArtifact={updateCustomArtifact}
            canReadOnly={props.canReadCustom}
            canReadWrite={props.canWriteCustom}
            addStepToFlow={props.addStepToFlow}
            addStepToNew={props.addStepToNew}
            canWriteFlow={props.canWriteFlow}
          />
        </div>;
    } else {
      output = <div><br />This functionality implemented yet.</div>;
    }
    return output;
  };

  // need special onChange for direct links to entity steps
  const handleAccordionChange = (key) => {
    const tmpActiveEntityTypes = [...activeEntityTypes];
    const index = tmpActiveEntityTypes.indexOf(key);
    index !== -1 ? tmpActiveEntityTypes.splice(index, 1) : tmpActiveEntityTypes.push(key);
    setActiveEntityTypes(tmpActiveEntityTypes);
    setOpenStep("");
  };

  const checkDefaultActiveKey = (index) => {
    let returnValue = "map";
    if (dataHubViewSettings && dataHubViewSettings?.activeTabs?.length) {
      //Check session storage tabs
      let strAux = dataHubViewSettings.activeTabs[index]?.substring(0, 3);
      if (strAux === "mat") returnValue = "match";
      else if (strAux === "mer") returnValue = "merge";
      else if (strAux === "cus") returnValue = "custom";
    }
    return returnValue;
  };

  const mappingArtifactsAux = (entityType: string, returnCount: boolean) => {
    let artifacts = mappingArtifacts.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId);
    if (returnCount) { return artifacts?.artifacts ? artifacts.artifacts.length : 0; } else { return artifacts; }
  };
  const matchingArtifactsAux = (entityType: string, returnCount: boolean) => {
    let artifacts = matchingArtifacts.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId);
    if (returnCount) { return artifacts?.artifacts ? artifacts.artifacts.length : 0; } else { return artifacts; }
  };

  const mergingArtifactsAux = (entityType: string, returnCount: boolean) => {
    let artifacts = mergingArtifacts.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId);
    if (returnCount) { return artifacts?.artifacts ? artifacts.artifacts.length : 0; } else { return artifacts; }
  };
  const customArtifactsAux = (entityType: string, returnCount: boolean) => {
    let artifacts =customArtifactsWithEntity.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId);
    if (returnCount) { return artifacts?.artifacts ? artifacts.artifacts.length : 0; } else { return artifacts; }
  };

  return (
    <div id="entityTilesContainer" className={styles.entityTilesContainer}>
      {Object.keys(props.entityModels).sort().map((entityType, index) => (
        <Accordion
          id={entityType}
          flush
          className={"w-100"}
          key={entityModels[entityType].entityTypeId}
          activeKey={activeEntityTypes.includes(entityModels[entityType].entityTypeId) ? entityModels[entityType].entityTypeId : ""}
          defaultActiveKey={locationEntityType.includes(entityModels[entityType].entityTypeId) ? entityModels[entityType].entityTypeId : ""}
        >
          <Accordion.Item eventKey={entityModels[entityType].entityTypeId}>
            <Card>
              <Card.Header className={"p-1 d-flex bg-white"}>
                <Accordion.Button data-testid={entityType} onClick={() => handleAccordionChange(entityModels[entityType].entityTypeId)}>
                  {entityType}
                </Accordion.Button>
              </Card.Header>
              <Accordion.Body>
                <Tabs defaultActiveKey={checkDefaultActiveKey(index)} onSelect={(eventKey) => updateView(index, eventKey, entityType)} className={styles.entityTabs}>
                  {canReadMapping ? <Tab id={`${entityType}-Map`} data-testid={`${entityType}-Map`} eventKey={`map`} key={`map-${entityType}`} title={`Mapping (${mappingArtifactsAux(entityType, true)})`} tabClassName={`curateTab`} /> : null}
                  {props.canReadMatchMerge ? <Tab id={`${entityType}-Match`} data-testid={`${entityType}-Match`} eventKey="match" key={`match-${entityType}`} title={`Matching (${matchingArtifactsAux(entityType, true)})`} tabClassName={`curateTab`} /> : null}
                  {props.canReadMatchMerge ? <Tab id={`${entityType}-Merge`} data-testid={`${entityType}-Merge`} eventKey="merge" key={`merge-${entityType}`} title={`Merging (${mergingArtifactsAux(entityType, true)})`} tabClassName={`curateTab`} /> : null}
                  {props.canReadCustom ? <Tab id={`${entityType}-Custom`} data-testid={`${entityType}-Custom`} eventKey="custom" key={`custom-${entityType}`} title={`Custom (${customArtifactsAux(entityType, true)})`} tabClassName={`curateTab`} /> : null}
                </Tabs>
                {outputCards(index, entityType, mappingArtifactsAux(entityType, false), matchingArtifactsAux(entityType, false), mergingArtifactsAux(entityType, false), customArtifactsAux(entityType, false))}
              </Accordion.Body>
            </Card>
          </Accordion.Item>
        </Accordion>
      ))}
      {requiresNoEntityTypeTile ?
        <Accordion
          flush
          id="customNoEntity"
          className={"w-100"}
          key={"No Entity Type"}
          activeKey={activeEntityTypes.includes("No Entity Type") ? "No Entity Type" : ""}
          defaultActiveKey={locationEntityType.includes("No Entity Type") ? "No Entity Type" : ""}
        >
          <Accordion.Item eventKey={"No Entity Type"}>
            <Card>
              <Card.Header className={"p-1 d-flex bg-white"}>
                <Accordion.Button data-testid={"noEntityType"} onClick={() => handleAccordionChange("No Entity Type")}>
                  No Entity Type
                </Accordion.Button>
              </Card.Header>
              <Accordion.Body>
                <Row>
                  <Col xs={12} className={"px-5"} aria-label={"customNoEntityTitle"}>
                    Steps that are created outside Hub Central and are not associated with any entity type appear here. Hub Central only allows running these steps, not editing or deleting them.
                  </Col>
                </Row>
                {props.canReadCustom ? <div className={styles.cardView}>
                  <CustomCard data={customArtifactsWithoutEntity}
                    flows={props.flows}
                    entityTypeTitle={/** entityType */""}
                    entityModel={/** props.entityModels[entityType] */""}
                    updateCustomArtifact={updateCustomArtifact}
                    canReadOnly={props.canReadCustom}
                    canReadWrite={props.canWriteCustom}
                    canWriteFlow={props.canWriteFlow}
                    addStepToFlow={props.addStepToFlow}
                    addStepToNew={props.addStepToNew}
                    getArtifactProps={getCustomArtifactProps}
                  />
                </div> : null}
              </Accordion.Body>
            </Card>
          </Accordion.Item>
        </Accordion> : null}
      <HCModal
        show={modalError.isVisible}
        onHide={() => setModalError({isVisible: false, message: ""})}
      >
        <Modal.Body className={"pt-5 pb-4"}>
          <div className={"d-flex align-items-start justify-content-center"}>
            <FontAwesomeIcon icon={faTimesCircle} className={"text-danger me-4 fs-3"} />{modalError.message}
          </div>
          <div className={"d-flex justify-content-end pt-4 pb-2"}>
            <HCButton aria-label={"Ok"} variant="primary" type="submit" onClick={() => setModalError({isVisible: false, message: ""})}>
              Ok
            </HCButton>
          </div>
        </Modal.Body>
      </HCModal>
    </div>
  );

};

export default EntityTiles;
