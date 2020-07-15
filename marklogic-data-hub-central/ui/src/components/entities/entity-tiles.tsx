import React, { useState, useEffect, useContext} from 'react';
import { useLocation } from "react-router-dom";
import { Collapse, Menu } from 'antd';
import axios from 'axios';
import { UserContext } from '../../util/user-context';
import styles from './entity-tiles.module.scss';
import MappingCard from './mapping/mapping-card';
import MatchingCard from './matching/matching-card';
import CustomCard from "./custom/custom-card";

const EntityTiles = (props) => {
    const { resetSessionTime } = useContext(UserContext);
    const entityModels = props.entityModels || {};
    const location = useLocation<any>();
    const [locationEntityType, setLocationEntityType] = useState<string[]>([]);
    const [activeEntityTypes, setActiveEntityTypes] = useState<string[]>([]);
    const [viewData, setViewData] = useState<string[]>([]);
    const [mappingArtifacts, setMappingArtifacts] = useState<any[]>([]);
    const [matchingArtifacts, setMatchingArtifacts] = useState<any[]>([]);
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
        getCustomArtifacts();
    },[isLoading]);

    useEffect(() =>{
        let view;
        if (location.state && location.state.stepDefinitionType) {
          if (location.state.stepDefinitionType === 'mapping') {
            view = 'map-';
          } else if (location.state.stepDefinitionType === 'custom') {
            view = 'custom-'
          }
          const activeLocationEntityTypes = [location.state.targetEntityType || 'No Entity Type'];
          setLocationEntityType(activeLocationEntityTypes);
          setActiveEntityTypes(activeLocationEntityTypes);
        } else {
          if (props.canReadMapping) {
            view = 'map-';
          } else if (props.canReadCustom) {
            view = 'custom-'
          }
        }

        let tempView: string[] = [];
        Object.keys(props.entityModels).sort().forEach(ent => {
            tempView.push(view + ent);
        })
        setViewData([...tempView])
    }, [props, location])

    const updateView = (index, artifactType, entityType) => {
        let tempView : string[] ;
        tempView = viewData;
        tempView[index] = artifactType + '-' + entityType;
        setViewData([...tempView])
    }

    const getMappingArtifacts = async () => {
        try {
            if (canReadMapping) {
              let response = await axios.get('/api/steps/mapping');

              if (response.status === 200) {
                let mapArtifacts = response.data;
                mapArtifacts.sort((a, b) => (a.entityType > b.entityType) ? 1 : -1)
                setMappingArtifacts([...mapArtifacts]);
              }
            }
          } catch (error) {
              let message = error;
              console.error('Error while fetching the mappings!', message);
            } finally {
              resetSessionTime();
          }
    }

    const getMappingArtifactByMapName = async (entityTypeId,mapName) => {
        try {
            let response = await axios.get(`/api/steps/mapping/${mapName}`);

            if (response.status === 200) {
                let mapArtifacts = response.data;

               if(mapArtifacts.targetEntityType === entityTypeId){
                return mapArtifacts;
               }

            }
          } catch (error) {
              let message = error;
              console.error('Error while fetching the mapping!', message);
          } finally {
            resetSessionTime();
          }
    }

    const deleteMappingArtifact = async (mapName) => {
        try {
            setIsLoading(true);
            let response = await axios.delete(`/api/steps/mapping/${mapName}`);

            if (response.status === 200) {
              setIsLoading(false);
            }
          } catch (error) {
              let message = error.response.data.message;
              console.error('Error while deleting the mapping!', message);
              setIsLoading(false);
          }
    }

    const createMappingArtifact = async (mapping) => {
        try {
            setIsLoading(true);

            let response = await axios.post(`/api/steps/mapping/${mapping.name}`, mapping);
            if (response.status === 200) {
              setIsLoading(false);
              return {code: response.status};
            } else {
                return {code: response.status};
            }
          } catch (error) {
            let message = error;
            let code = error.response.data.code;
            let details = error.response.data.details
            console.error('Error while creating the mapping!', message)
            setIsLoading(false);
            let err={code: code,
                    message: details}
            return err;
          } finally {
            resetSessionTime();
          }
    }

    const updateMappingArtifact = async (mapping) => {
        try {

            let response = await axios.post(`/api/steps/mapping/${mapping.name}`, mapping);
            if (response.status === 200) {
              return true;
            } else {
                return false;
            }
          } catch (error) {
            let message = error;
            console.error('Error while updating the mapping!', message)
            return false;
          } finally {
            resetSessionTime();
          }
    }

    const getMatchingArtifacts = async () => {
        try {
            if (props.canReadMatchMerge) {
              let response = await axios.get('/api/artifacts/matching');
              if (response.status === 200) {
                let entArt = response.data;
                entArt.sort((a, b) => (a.entityType > b.entityType) ? 1 : -1)
                setMatchingArtifacts([...entArt]);
              }
            }
          } catch (error) {
              let message = error;
              console.error('Error while fetching matching artifacts', message);
          } finally {
            resetSessionTime();
          }
    }

    const deleteMatchingArtifact = async (matchingName) => {
        try {
            setIsLoading(true);
            let response = await axios.delete(`/api/artifacts/matching/${matchingName}`);

            if (response.status === 200) {
              setIsLoading(false);
            }
          } catch (error) {
              let message = error.response.data.message;
              console.error('Error while deleting matching artifact.', message);
              setIsLoading(false);
          }
    }

    const createMatchingArtifact = async (matchingObj) => {
        try {
            setIsLoading(true);

            let response = await axios.post(`/api/artifacts/matching/${matchingObj.name}`, matchingObj);
            if (response.status === 200) {
              setIsLoading(false);
            }
          } catch (error) {
            let message = error.response.data.message;
            console.error('Error While creating the matching artifact!', message)
            setIsLoading(false);
          } finally {
            resetSessionTime();
          }
    }

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
        } finally {
            resetSessionTime();
        }
    }

    const outputCards = (index, entityType, mappingCardData, matchingCardData, customCardData) => {
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
                    addStepToNew={props.addStepToNew}/>
            </div>
        }
        else if (viewData[index] === 'matching-' + entityType && mappingCardData){
            output = <div className={styles.cardView}>
            <MatchingCard data={ matchingCardData ? matchingCardData.artifacts : []}
                entityName={entityType}
                deleteMatchingArtifact={deleteMatchingArtifact}
                createMatchingArtifact={createMatchingArtifact}
                canReadMatchMerge={props.canReadMatchMerge}
                canWriteMatchMerge={props.canWriteMatchMerge} />
        </div>
        }
        else if (viewData[index] === 'custom-' + entityType ){
            output = <div className={styles.cardView}>
                <CustomCard data={ customCardData ? customCardData.artifacts : []}
                canReadOnly={props.canReadCustom}
                canReadWrite = {props.canWriteCustom}/>
            </div>
        }
        else {
            output = <div><br/>This functionality implemented yet.</div>
        }
        return output;
    }

    // need special onChange for direct links to entity steps
    const handleCollapseChange = (keys) => Array.isArray(keys) ? setActiveEntityTypes(keys):setActiveEntityTypes([keys]);

    return (
        <div className={styles.entityTilesContainer}>

        <Collapse activeKey={activeEntityTypes} onChange={handleCollapseChange} defaultActiveKey={locationEntityType}>
            { Object.keys(props.entityModels).sort().map((entityType, index) => (
                <Panel header={entityType} key={entityModels[entityType].entityTypeId}>
            <div className={styles.switchMapMaster}>
            <Menu mode="horizontal" defaultSelectedKeys={['map-' + entityType]}>
                {canReadMapping ? <Menu.Item key={`map-${entityType}`} onClick={() => updateView(index,'map', entityType)}>
                    Map
                </Menu.Item>: null}
                {props.canReadCustom ? <Menu.Item key={`custom-${entityType}`} onClick={() => updateView(index,'custom', entityType)}>
                    Custom
                </Menu.Item>: null}
               {props.canReadMatchMerge  ? <Menu.Item key={`match-${entityType}`} onClick={() => updateView(index,'match', entityType)}>
                    Match
                </Menu.Item>: null}
            </Menu>
            </div>
            {outputCards(index, entityType, mappingArtifacts.find((artifact) => artifact.entityTypeId ===  entityModels[entityType].entityTypeId),matchingArtifacts.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId), customArtifactsWithEntity.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId))}
            </Panel>
            ))}
            {requiresNoEntityTypeTile  ?
            <Panel header="No Entity Type" key="No Entity Type">
                <Menu mode="horizontal" defaultSelectedKeys={['custom-NoEntityType']}>
                {props.canReadCustom ? <Menu.Item key='custom-NoEntityType' >
                    Custom
                </Menu.Item>: null}
                </Menu>
                <div className={styles.cardView}>
                    <CustomCard data={customArtifactsWithoutEntity}
                                canReadOnly={props.canReadCustom}
                                canReadWrite = {props.canWriteCustom}/>
                </div>
            </Panel>: null}
        </Collapse>
        </div>
    );

}

export default EntityTiles;
