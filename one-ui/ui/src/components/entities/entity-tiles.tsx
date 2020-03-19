import React, { useState, useEffect } from 'react';
import { Collapse, Menu } from 'antd';
import styles from './entity-tiles.module.scss';
import MappingCard from './mapping/mapping-card';
import MatchingCard from './matching/matching-card';
import axios from 'axios'

const EntityTiles = (props) => {

    const [viewType, setViewType] = useState('map');
    const [entityArtifacts, setEntityArtifacts] = useState<any[]>([]);
    const [matchingArtifacts, setMatchingArtifacts] = useState<any[]>([]);
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
            let response = await axios.get('/api/artifacts/mapping');

            if (response.status === 200) {
                let mapArtifacts = response.data;
                mapArtifacts.sort((a, b) => (a.entityType > b.entityType) ? 1 : -1)
                setEntityArtifacts([...mapArtifacts]);
              console.log('GET Mapping Artifacts API Called successfully!',response);
            }
          } catch (error) {
              let message = error;
              console.log('Error while fetching the mappings!', message);
          }
    }

    const getMappingArtifactByMapName = async (entityTypeTitle,mapName) => {
        try {
            let response = await axios.get(`/api/artifacts/mapping/${mapName}`);

            if (response.status === 200) {
                let mapArtifacts = response.data;

               if(mapArtifacts.targetEntity === entityTypeTitle){
                return mapArtifacts;
               }

              console.log('GET Mapping Artifacts API Called successfully!',response);
            }
          } catch (error) {
              let message = error;
              console.log('Error while fetching the mapping!', message);
          }
    }

    const deleteMappingArtifact = async (mapName) => {
        console.log('Delete API Called!')
        try {
            setIsLoading(true);
            let response = await axios.delete(`/api/artifacts/mapping/${mapName}`);

            if (response.status === 200) {
              console.log('DELETE API Called successfully!');
              setIsLoading(false);
            }
          } catch (error) {
              let message = error.response.data.message;
              console.log('Error while deleting the mapping!', message);
              setIsLoading(false);
          }
    }

    const createMappingArtifact = async (mapping) => {
        try {
            setIsLoading(true);

            let response = await axios.post(`/api/artifacts/mapping/${mapping.name}`, mapping);
            if (response.status === 200) {
              console.log('Create MappingArtifact API Called successfully!')
              setIsLoading(false);
              return true;
            } else {
                return false;
            }
          }
          catch (error) {
            let message = error;
            console.log('Error while creating the mapping!', message)
            setIsLoading(false);
            return false;
          }
    }

    const updateMappingArtifact = async (mapping) => {
        try {

            let response = await axios.post(`/api/artifacts/mapping/${mapping.name}`, mapping);
            if (response.status === 200) {
              console.log('Update MappingArtifact API Called successfully!')
              return true;
            } else {
                return false;
            }
          }
          catch (error) {
            let message = error;
            console.log('Error while updating the mapping!', message)
            return false;
          }
    }

    const getMatchingArtifacts = async () => {
        try {
            let response = await axios.get('/api/artifacts/matching');
            if (response.status === 200) {
                let entArt = response.data;
                entArt.sort((a, b) => (a.entityType > b.entityType) ? 1 : -1)
                console.log('entArt',entArt)
                setMatchingArtifacts([...entArt]);
              console.log('GET matching Artifacts API Called successfully!',response);
            }
          } catch (error) {
              let message = error;
              console.log('Error while fetching matching artifacts', message);
              //handleError(error);
          }
    }

    const deleteMatchingArtifact = async (matchingName) => {
        console.log('Delete API Called!')
        try {
            setIsLoading(true);
            let response = await axios.delete(`/api/artifacts/matching/${matchingName}`);

            if (response.status === 200) {
              console.log('DELETE matching Called successfully!');
              setIsLoading(false);
            }
          } catch (error) {
              let message = error.response.data.message;
              console.log('Error while deleting matching artifact.', message);
              setIsLoading(false);
              //handleError(error);
          }
    }

    const createMatchingArtifact = async (matchingObj) => {
        console.log('Create API Called!')
        try {
            setIsLoading(true);

            let response = await axios.post(`/api/artifacts/matching/${matchingObj.name}`, matchingObj);
            if (response.status === 200) {
              console.log('Create/Update matching API Called successfully!')
              setIsLoading(false);
            }
          }
          catch (error) {
            let message = error.response.data.message;
            console.log('Error While creating the matching artifact!', message)
            setIsLoading(false);
            //handleError(error);
          }
    }

    const outputCards = (entityCardData, matchingCardData) => {
        let output;

        if (viewType === 'map') {
            output = <div className={styles.cardView}>
                <MappingCard data={entityCardData.artifacts}
                    entityTypeTitle={entityCardData.entityType}
                    getMappingArtifactByMapName={getMappingArtifactByMapName}
                    deleteMappingArtifact={deleteMappingArtifact}
                    createMappingArtifact={createMappingArtifact}
                    updateMappingArtifact={updateMappingArtifact}
                    canReadWrite={props.canReadWrite}
                    canReadOnly={props.canReadOnly}
                    entityModel={props.entityModels[entityCardData.entityType]} />
            </div>
        }
        else if (viewType === 'matching'){
            output = <div className={styles.cardView}>
            <MatchingCard data={matchingCardData.artifacts}
                entityName={matchingCardData.entityType}
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
        <div className={styles.entityContainer}>

        <Collapse >
            { entityArtifacts.map((ent,index) => (
                <Panel header={ent.entityType} key={ent.entityType}>
            <div className={styles.switchMapMaster}>
            <Menu mode="horizontal" defaultSelectedKeys={['map']}>
                <Menu.Item key='map' onClick={mappingCardsView}>
                    Mapping
                </Menu.Item>
                <Menu.Item key='matching' onClick={matchingCardsView}>
                    Matching
                </Menu.Item>
            </Menu>
            </div>
            {outputCards(ent,matchingArtifacts[index])}
            </Panel>
            ))}
        </Collapse>
        </div>
    );

}

export default EntityTiles;
