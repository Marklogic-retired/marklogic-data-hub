import React, { useState, useContext, useEffect } from 'react';
import { Collapse, Menu } from 'antd';
import styles from './entity-tiles.module.scss';
import MappingCard from './mapping/mapping-card';
import { RolesContext } from '../../util/roles';
import axios from 'axios'

const EntityTiles: React.FC = () => {

    const [viewType, setViewType] = useState('map');
    const [entityArtifacts, setEntityArtifacts] = useState<any[]>([]);
    const [entitiesInfo, setEntitiesInfo] = useState<any[]>([]);

    const { Panel } = Collapse;

    const [isLoading, setIsLoading] = useState(false);
    
    //Role based access
    const roleService = useContext(RolesContext);
    const canReadOnly = roleService.canReadMappings();
    const canReadWrite = roleService.canWriteMappings();

    const mappingCardsView = () => {
        setViewType('map');
    }

    const masterView = () => {
        setViewType('master');
        console.log('Master View -- To be Created')
    }

    useEffect(() => {
        getMappingArtifacts();
        getEntityInfo();
    },[isLoading]);

    const getEntityInfo = async () => {
        try {
        let response = await axios.get(`/api/entities`);
        if(response.status === 200) {
            let entData:any = {};
            response.data.map(ent => {
                entData[ent.info.title] = ent
            });
            setEntitiesInfo({...entData});
        }
            
              console.log('GET Entities Info API Called successfully!');
             
          } catch (error) {
              let message = error;
              console.log('Error while fetching entities Info', message);
          }

    }

    const getMappingArtifacts = async () => {
        try {
            let response = await axios.get('/api/artifacts/mapping');
            
            if (response.status === 200) {
                let entArt = response.data;
                entArt.sort((a, b) => (a.entityType > b.entityType) ? 1 : -1)
                console.log('entArt',entArt)
                setEntityArtifacts([...entArt]);
              console.log('GET Mapping Artifacts API Called successfully!',response);
            } 
          } catch (error) {
              let message = error;
              console.log('Error while fetching mapping artifacts', message);
              //handleError(error);
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
              console.log('Error while deleting load data artifact.', message);
              setIsLoading(false);
          }
    }

    const createMappingArtifact = async (mapObj) => {
        try {
            setIsLoading(true);
      
            let response = await axios.post(`/api/mapping/${mapObj.name}`, mapObj);
            if (response.status === 200) {
              console.log('Create/Update MappingArtifact API Called successfully!')
              setIsLoading(false);
            }
          }
          catch (error) {
            let message = error.response.data.message;
            console.log('Error While creating the Mapping artifact!', message)
            setIsLoading(false);
          }
    }

    const outputCards = (entMaps) => {
        let output;

        if (viewType === 'map') {
            output = <div className={styles.cardView}>
                <MappingCard data={entMaps.artifacts}
                    entityName={entMaps.entityType}
                    deleteMappingArtifact={deleteMappingArtifact}
                    createMappingArtifact={createMappingArtifact}
                    canReadWrite={canReadWrite}
                    canReadOnly={canReadOnly}
                    entitiesInfo={entitiesInfo[entMaps.entityType]} />
            </div>
        } else {
            output = <div><br/>This functionality is not implemented yet.</div>
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
                <Menu.Item key='master' onClick={masterView}>
                    Master
                </Menu.Item>
            </Menu>
            </div>
            {outputCards(ent)}
            </Panel>
            ))}
        </Collapse>
        </div>
    );

}

export default EntityTiles;