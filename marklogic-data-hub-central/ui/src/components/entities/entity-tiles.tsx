import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Collapse, Menu } from 'antd';
import axios from 'axios';
import { createStep, getSteps, getStep, deleteStep } from '../../api/steps';
import styles from './entity-tiles.module.scss';
import MappingCard from './mapping/mapping-card';
import MatchingCard from './matching/matching-card';
import CustomCard from "./custom/custom-card";
import './entity-tiles.scss'
import MergingCard from './merging/merging-card';

import { matchingStep } from '../../assets/mock-data/curation/matching';
import { mergingStep } from '../../assets/mock-data/curation/merging'

const EntityTiles = (props) => {
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
    const { canReadMapping, canWriteMapping } = props;
    //For accordian within entity tiles
    const { Panel } = Collapse;
    const [requiresNoEntityTypeTile, setRequiresNoEntityTypeTile]  = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getMappingArtifacts();
        getMatchingArtifacts();
        getMergingArtifacts();
        getCustomArtifacts();
    },[isLoading]);

    useEffect(() =>{
        let view;
        if (location.state && location.state.stepDefinitionType) {
          if (location.state.stepDefinitionType === 'mapping') {
            view = 'map-';
          } else if (location.state.stepDefinitionType === 'custom') {
            view = 'custom-';
          } else if (location.state.stepDefinitionType === 'matching') {
            view = 'match-';
          } else if (location.state.stepDefinitionType === 'merging') {
            view = 'merge-';
          }
          const activeLocationEntityTypes = [location.state.targetEntityType || 'No Entity Type'];
          setLocationEntityType(activeLocationEntityTypes);
          setActiveEntityTypes(activeLocationEntityTypes);
        } else {
          if (props.canReadMapping) {
            view = 'map-';
          } else if (props.canReadCustom) {
            view = 'custom-';
          } else if (props.canReadMatchMerge) {
            view = 'match-';
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
        tempView[index] = artifactType + '-' + entityType;
        setViewData([...tempView]);
    };

    const updateIsLoadingFlag = () => {
      if(isLoading){
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    };

    const getMappingArtifacts = async () => {
        try {
            if (canReadMapping) {
              let response = await getSteps('mapping');
              if (response.status === 200) {
                let mapArtifacts = response.data;
                mapArtifacts.sort((a, b) => (a.entityType > b.entityType) ? 1 : -1);
                setMappingArtifacts([...mapArtifacts]);
              }
            }
          } catch (error) {
              let message = error;
              console.error('Error while fetching the mappings!', message);
            }
    };

    const getMappingArtifactByMapName = async (entityTypeId, mapName) => {
        try {
            let response = await getStep(mapName, 'mapping');
            if (response.status === 200) {
                let mapArtifacts = response.data;

               if(mapArtifacts.targetEntityType === entityTypeId){
                return mapArtifacts;
               }

            }
          } catch (error) {
              let message = error;
              console.error('Error getting mapping', message);
          }
    };

    const deleteMappingArtifact = async (mapName) => {
        try {
            let response = await deleteStep(mapName, 'mapping');
            if (response.status === 200) {
              updateIsLoadingFlag();
            }
          } catch (error) {
              let message = error.response.data.message;
              console.error('Error deleting mapping', message);
          }
    };

    const createMappingArtifact = async (mapping) => {
        try {
            let response = await createStep(mapping.name, 'mapping', mapping);
            if (response.status === 200) {
              updateIsLoadingFlag();
              return {code: response.status};
            } else {
                return {code: response.status};
            }
          } catch (error) {
            let message = error;
            let code = error.response.data.code;
            let details = error.response.data.details;
            console.error('Error creating mapping', message);
            let err={code: code,
                    message: details};
            return err;
          }
    };

    const updateMappingArtifact = async (mapping) => {
        try {
            let response = await createStep(mapping.name, 'mapping', mapping);
            if (response.status === 200) {
              return true;
            } else {
                return false;
            }
          } catch (error) {
            let message = error;
            console.error('Error updating mapping', message);
            return false;
          }
    };

    const getMatchingArtifacts = async () => {
      try {
        if (props.canReadMatchMerge) {
            let response = await axios.get('/api/steps/matching');
            if (response.status === 200) {
                let entArt = response.data;
                entArt.sort((a, b) => (a.entityType > b.entityType) ? 1 : -1)
                setMatchingArtifacts([...entArt]);
            }
        }
      } catch (error) {
        let message = error;
        console.error('Error while fetching matching artifacts', message);
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
          console.error('Error while deleting matching artifact.', message);
        }
    };

    const createMatchingArtifact = async (matchingObj) => {
      try {
        let response = await axios.post(`/api/steps/matching/${matchingObj.name}`, matchingObj);
        if (response.status === 200) {
          updateIsLoadingFlag();
        }
      } catch (error) {
        let message = error.response.data.message;
        console.error('Error While creating the matching artifact!', message);
      }
    };

    const getMergingArtifacts = async () => {
      if (props.canReadMatchMerge) {
        try {
            let response = await axios.get('/api/steps/merging');
            if (response.status === 200) {
                setMergingArtifacts(response.data);
            }
        } catch (error) {
            let message = error;
            console.error('Error while fetching matching artifacts', message);
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
            console.error('Error while deleting matching artifact.', message);
        }
    };

    const createMergingArtifact = async (mergingObj) => {
        try {
            let response = await axios.post(`/api/steps/merging/${mergingObj.name}`, mergingObj);
            if (response.status === 200) {
              updateIsLoadingFlag();
            }
          } catch (error) {
            let message = error.response.data.message;
            console.error('Error While creating the matching artifact!', message);
          }
    };

    const getCustomArtifacts = async () => {
        try {
            if(props.canReadCustom){
                let response = await axios.get('/api/steps/custom');
                if (response.status === 200) {
                    let entArt = response.data;
                    setCustomArtifactsWithEntity([...entArt.stepsWithEntity]);
                    if (entArt.stepsWithoutEntity.length > 0){
                        setRequiresNoEntityTypeTile(true);
                    }
                    setCustomArtifactsWithoutEntity([...entArt.stepsWithoutEntity]);
                }
            }
        } catch (error) {
            let message = error;
            console.error('Error while fetching custom artifacts', message);
        }
    };

    const outputCards = (index, entityType, mappingCardData, matchingCardData, mergingCardData, customCardData) => {
        let output;
        if (viewData[index] === 'map-' + entityType) {
            output = <div className={styles.cardView}>
                <MappingCard data={mappingCardData ? mappingCardData.artifacts : []}
                    flows={props.flows}
                    entityTypeTitle={entityType}
                    getMappingArtifactByMapName={getMappingArtifactByMapName}
                    deleteMappingArtifact={deleteMappingArtifact}
                    createMappingArtifact={createMappingArtifact}
                    updateMappingArtifact={updateMappingArtifact}
                    canReadWrite={canWriteMapping}
                    canReadOnly={canReadMapping}
                    entityModel={props.entityModels[entityType]}
                    canWriteFlow={props.canWriteFlow}
                    addStepToFlow={props.addStepToFlow}
                    addStepToNew={props.addStepToNew}
                />
            </div>;
        }
        else if (viewData[index] === 'match-' + entityType){
            output = <div className={styles.cardView}>
            <MatchingCard
                matchingStepsArray={ matchingCardData ? matchingCardData.artifacts : []}
                flows={props.flows}
                entityName={entityType}
                deleteMatchingArtifact={deleteMatchingArtifact}
                createMatchingArtifact={createMatchingArtifact}
                canReadMatchMerge={props.canReadMatchMerge}
                canWriteMatchMerge={props.canWriteMatchMerge}
                entityModel={props.entityModels[entityType]}
                canWriteFlow={props.canWriteFlow}
                addStepToFlow={props.addStepToFlow}
                addStepToNew={props.addStepToNew}
            />
        </div>;
        }
        //TODO:- Enhance below code for merging when working on DHFPROD-4328
        else if(viewData[index] === 'merge-' + entityType) {
          output = <div className={styles.cardView}>
                <MergingCard
                  mergingStepsArray={ mergingCardData ? mergingCardData.artifacts : []}
                  flows={props.flows}
                  entityName={entityType}
                  entityModel={props.entityModels[entityType]}
                  canReadMatchMerge={props.canReadMatchMerge}
                  canWriteMatchMerge={props.canWriteMatchMerge}
                  deleteMergingArtifact={deleteMergingArtifact}
                  createMergingArtifact={createMergingArtifact}
                  addStepToFlow={props.addStepToFlow}
                  addStepToNew={props.addStepToNew}
                />
        </div>;
        }
        else if (viewData[index] === 'custom-' + entityType ){
            output = <div className={styles.cardView}>
                <div className={styles.customEntityTitle} aria-label={'customEntityTitle'}>You can create Custom steps either manually or using Gradle, then deploy them. Deployed Custom steps appear here. Hub Central only allows running Custom steps, not editing or deleting them.</div>
                <CustomCard data={ customCardData ? customCardData.artifacts : []}
                canReadOnly={props.canReadCustom}
                canReadWrite = {props.canWriteCustom}/>
            </div>;
        }
        else {
            output = <div><br/>This functionality implemented yet.</div>;
        }
        return output;
    };

    // need special onChange for direct links to entity steps
    const handleCollapseChange = (keys) => Array.isArray(keys) ? setActiveEntityTypes(keys):setActiveEntityTypes([keys]);

    return (
        <div id="entityTilesContainer" className={styles.entityTilesContainer}>

        <Collapse activeKey={activeEntityTypes} onChange={handleCollapseChange} defaultActiveKey={locationEntityType}>
            { Object.keys(props.entityModels).sort().map((entityType, index) => (
                <Panel header={<span data-testid={entityType}>{entityType}</span>} key={entityModels[entityType].entityTypeId}>
                    <div className={styles.switchMapMaster}>
                    <Menu mode="horizontal" defaultSelectedKeys={['map-' + entityType]}>
                      {canReadMapping ? <Menu.Item data-testid={`${entityType}-Map`} key={`map-${entityType}`} onClick={() => updateView(index,'map', entityType)}>
                            Map
                        </Menu.Item>: null}
                      {props.canReadMatchMerge  ? <Menu.Item data-testid={`${entityType}-Match`} key={`match-${entityType}`} onClick={() => updateView(index,'match', entityType)}>
                            Match
                        </Menu.Item>: null}
                      {props.canReadMatchMerge  ? <Menu.Item data-testid={`${entityType}-Merge`} key={`merge-${entityType}`} onClick={() => updateView(index,'merge', entityType)}>
                            Merge
                        </Menu.Item>: null}
                      {props.canReadCustom ? <Menu.Item data-testid={`${entityType}-Custom`} key={`custom-${entityType}`} onClick={() => updateView(index,'custom', entityType)}>
                            Custom
                        </Menu.Item>: null}
                    </Menu>
                    </div>
                    {outputCards(index, entityType, mappingArtifacts.find((artifact) => artifact.entityTypeId ===  entityModels[entityType].entityTypeId),matchingArtifacts.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId), mergingArtifacts.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId), customArtifactsWithEntity.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId))}
                </Panel>
            ))}
            {requiresNoEntityTypeTile  ?
                <Panel id="customNoEntity" header={<span data-testid={"noEntityType"}>No Entity Type</span>} key="No Entity Type">
                <div className={styles.customNoEntityTitle} aria-label={'customNoEntityTitle'}>Steps that are created outside Hub Central and are not associated with any entity type appear here. Hub Central only allows running these steps, not editing or deleting them.</div>
                {props.canReadCustom ? <div className={styles.cardView}>
                    <CustomCard data={customArtifactsWithoutEntity}
                                canReadOnly={props.canReadCustom}
                                canReadWrite = {props.canWriteCustom}/>
                </div>: null}
            </Panel>: null}
        </Collapse>
        </div>
    );

};

export default EntityTiles;
