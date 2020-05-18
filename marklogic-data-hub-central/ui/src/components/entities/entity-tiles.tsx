import React, { useState, useEffect, useContext } from 'react';
import { Collapse, Menu } from 'antd';
import axios from 'axios';
import { UserContext } from '../../util/user-context';
import styles from './entity-tiles.module.scss';
import MappingCard from './mapping/mapping-card';
import MatchingCard from './matching/matching-card';

const EntityTiles = (props) => {
    const { resetSessionTime } = useContext(UserContext);
    const [viewType, setViewType] = useState('map');
    const entityModels = props.entityModels || {};
    const [mappingArtifacts, setMappingArtifacts] = useState<any[]>([]);
    const [matchingArtifacts, setMatchingArtifacts] = useState<any[]>([]);
    const { canReadMapping, canWriteMapping } = props;
    //For accordian within entity tiles
    const { Panel } = Collapse;

    const [isLoading, setIsLoading] = useState(false);

    const mappingCardsView = () => {
        setViewType('map');
    }

    const matchingCardsView = () => {
        setViewType('matching');
    }

    useEffect(() => {
        getMappingArtifacts();
        getMatchingArtifacts();
    },[isLoading]);

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

    const outputCards = (entityType, mappingCardData, matchingCardData) => {
        let output;

        if (viewType === 'map') {
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
        else if (viewType === 'matching' && mappingCardData){
            output = <div className={styles.cardView}>
            <MatchingCard data={ matchingCardData ? matchingCardData.artifacts : []}
                entityName={entityType}
                deleteMatchingArtifact={deleteMatchingArtifact}
                createMatchingArtifact={createMatchingArtifact}
                canReadMatchMerge={props.canReadMatchMerge}
                canWriteMatchMerge={props.canWriteMatchMerge} />
        </div>
        }
        else {
            output = <div><br/>This functionality implemented yet.</div>
        }

        return output;
    }


    return (
        <div className={styles.entityTilesContainer}>

        <Collapse >
            { Object.keys(props.entityModels).sort().map((entityType) => (
                <Panel header={entityType} key={entityType}>
            <div className={styles.switchMapMaster}>
            <Menu mode="horizontal" defaultSelectedKeys={['map']}>
                {canReadMapping ? <Menu.Item key='map' onClick={mappingCardsView}>
                    Mapping
                </Menu.Item>: null}
               {props.canReadMatchMerge ? <Menu.Item key='matching' onClick={matchingCardsView}>
                    Matching
                </Menu.Item>: null}
            </Menu>
            </div>
            {outputCards(entityType, mappingArtifacts.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId),matchingArtifacts.find((artifact) => artifact.entityTypeId === entityModels[entityType].entityTypeId))}
            </Panel>
            ))}
        </Collapse>
        </div>
    );

}

export default EntityTiles;
