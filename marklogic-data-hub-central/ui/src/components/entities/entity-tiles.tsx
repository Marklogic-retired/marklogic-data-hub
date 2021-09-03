import React, {useState, useEffect, useContext} from "react";
import {useLocation} from "react-router-dom";
import {Menu, Modal} from "antd";
import {Row, Col, Accordion, Card} from "react-bootstrap";
import axios from "axios";
import {createStep, updateStep, getSteps, deleteStep} from "../../api/steps";
import {sortStepsByUpdated} from "../../util/conversionFunctions";
import styles from "./entity-tiles.module.scss";
import MappingCard from "./mapping/mapping-card";
import MatchingCard from "./matching/matching-card";
import CustomCard from "./custom/custom-card";
import "./entity-tiles.scss";
import MergingCard from "./merging/merging-card";
import {CurationContext} from "../../util/curation-context";


const EntityTiles = (props) => {
  const {setActiveStepWarning, setValidateMatchCalled, setValidateMergeCalled} = useContext(CurationContext);
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
  const [requiresNoEntityTypeTile, setRequiresNoEntityTypeTile]  = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openStep, setOpenStep] = useState({});

  useEffect(() => {
    getMappingArtifacts();
    getMatchingArtifacts();
    getMergingArtifacts();
    getCustomArtifacts();
  }, [isLoading]);

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

    let tempView: string[] = [];
    Object.keys(props.entityModels).sort().forEach(ent => {
      tempView.push(view + ent);
    });
    setViewData([...tempView]);
  }, [props, location]);

  const updateView = (index, artifactType, entityType) => {
    let tempView : string[] ;
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
      message.indexOf(mapping.name) > -1 ? Modal.error({
        content: <div className={styles.errorModal}><p aria-label="duplicate-step-error">Unable to create mapping step. A mapping step with the name <b>{mapping.name}</b> already exists.</p></div>,
        okText: <div aria-label="OK">OK</div>
      }) : Modal.error({
        content: message
      });

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
      message.indexOf(matchingObj.name) > -1 ? Modal.error({
        content: <div className={styles.errorModal}><p aria-label="duplicate-step-error">Unable to create matching step. A matching step with the name <b>{matchingObj.name}</b> already exists.</p></div>,
        okText: <div aria-label="OK">OK</div>
      }) : Modal.error({
        content: message
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
      message.indexOf(mergingObj.name) > -1 ? Modal.error({
        content: <div className={styles.errorModal}><p aria-label="duplicate-step-error">Unable to create merging step. A merging step with the name <b>{mergingObj.name}</b> already exists.</p></div>,
        okText: <div aria-label="OK">OK</div>
      }) : Modal.error({
        content: message
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
    }
  };

  const getCustomArtifactProps = async (name : String) => {
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
      return false;
    }
  };

  const outputCards = (index, entityType, mappingCardData, matchingCardData, mergingCardData, customCardData) => {
    let output;
    if (viewData[index] === "map-" + entityType) {
      output = <div className={styles.cardView}>
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
      output = <div className={styles.cardView}>
        <MatchingCard
          matchingStepsArray={ matchingCardData ? sortStepsByUpdated(matchingCardData.artifacts) : []}
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
      output = <div className={styles.cardView}>
        <MergingCard
          mergingStepsArray={ mergingCardData ? sortStepsByUpdated(mergingCardData.artifacts) : []}
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
      output = <div className={styles.cardView}>
        <div className={styles.customEntityTitle} aria-label={"customEntityTitle"}>You can create Custom steps either manually or using Gradle, then deploy them. Deployed Custom steps appear here. Hub Central only allows running Custom steps, not editing or deleting them.</div>
        <CustomCard data={ customCardData ? sortStepsByUpdated(customCardData.artifacts) : []}
          flows={props.flows}
          entityTypeTitle={entityType}
          entityModel={props.entityModels[entityType]}
          getArtifactProps={getCustomArtifactProps}
          updateCustomArtifact={updateCustomArtifact}
          canReadOnly={props.canReadCustom}
          canReadWrite = {props.canWriteCustom}
          addStepToFlow={props.addStepToFlow}
          addStepToNew={props.addStepToNew}
          canWriteFlow={props.canWriteFlow}
        />
      </div>;
    } else {
      output = <div><br/>This functionality implemented yet.</div>;
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

  return (
    <div id="entityTilesContainer" className={styles.entityTilesContainer}>
      { Object.keys(props.entityModels).sort().map((entityType, index) => (
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
                <Menu mode="horizontal" defaultSelectedKeys={[`map-${entityType}`]} selectedKeys={viewData}>
                  {canReadMapping ? <Menu.Item data-testid={`${entityType}-Map`} key={`map-${entityType}`} onClick={() => updateView(index, "map", entityType)}>
                              Map
                  </Menu.Item>: null}
                  {props.canReadMatchMerge ? <Menu.Item data-testid={`${entityType}-Match`} key={`match-${entityType}`} onClick={() => updateView(index, "match", entityType)}>
                              Match
                  </Menu.Item>: null}
                  {props.canReadMatchMerge ? <Menu.Item data-testid={`${entityType}-Merge`} key={`merge-${entityType}`} onClick={() => updateView(index, "merge", entityType)}>
                              Merge
                  </Menu.Item>: null}
                  {props.canReadCustom ? <Menu.Item data-testid={`${entityType}-Custom`} key={`custom-${entityType}`} onClick={() => updateView(index, "custom", entityType)}>
                              Custom
                  </Menu.Item>: null}
                </Menu>
                {outputCards(index, entityType, mappingArtifacts.find((artifact) => artifact.entityTypeId ===  entityModels[entityType].entityTypeId), matchingArtifacts.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId), mergingArtifacts.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId), customArtifactsWithEntity.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId))}
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
                    canReadWrite = {props.canWriteCustom}
                    canWriteFlow={props.canWriteFlow}
                    addStepToFlow={props.addStepToFlow}
                    addStepToNew={props.addStepToNew}
                    getArtifactProps={getCustomArtifactProps}
                  />
                </div>: null}
              </Accordion.Body>
            </Card>
          </Accordion.Item>
        </Accordion> : null}
    </div>
  );

};

export default EntityTiles;
