import React, { useState, useContext, useEffect } from 'react';
import { Collapse, Menu } from 'antd';
import styles from './entity-tiles.module.scss';
import MappingCard from './mapping/mapping-card';
import { RolesContext } from '../../util/roles';
import axios from 'axios'

const EntityTiles: React.FC = () => {

    const [viewType, setViewType] = useState('map');
    const [entityArtifacts, setEntityArtifacts] = useState<any[]>([]);
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

    //Temporary Data - To be removed
    // const entityArtifacts = [{
    //     "name": "CustomerRecords",
    //     "mappings": [{ "name": "Map 1", "description": "Map1 Description", "sourceFormat": "json", "selectedSource": "collection", "sourceQuery": "cts.CollectionQuery('Provider')", "collections": ['Provider','Claims'], "lastUpdated": "2020-02-15T11:25:35.765299-08:00", "fileCount": 3, "filesNeedReuploaded": false },
    //     { "name": "Customer Mapping - New", "description": "", "sourceFormat": "xml", "selectedSource": "query", "sourceQuery": "cts.uris(null,null,cts.andQuery[cts.CollectionQuery('Customer'),cts.elementAttributeValueQuery()])", "collections": ['Customer'], "lastUpdated": "2020-02-11T11:25:35.765299-08:00", "fileCount": 1, "filesNeedReuploaded": false },
    //     { "name": "Map 3", "description": "", "sourceFormat": "json", "selectedSource": "collection","sourceQuery": "cts.CollectionQuery('Finance')", "collections": ['Finance'], "lastUpdated": "2020-01-18T11:25:35.765299-08:00", "fileCount": 10, "filesNeedReuploaded": true },
    //     { "name": "Map 1", "description": "", "sourceFormat": "Delimited Text", "selectedSource": "collection","sourceQuery": "cts.CollectionQuery('AirlineDataCust')", "collections": ['AirlineData'], "lastUpdated": "2020-01-12T11:25:35.765299-08:00", "fileCount": 6, "filesNeedReuploaded": false }
    //     ]
    // },
    // {
    //     "name": "StudentCollegeRecordsNew",
    //     "mappings": [{ "name": "Map 4", "description": "", "sourceFormat": "json", "selectedSource": "collection", "sourceQuery": "cts.CollectionQuery('Provider')", "collections": ['Provider'], "lastUpdated": "2020-02-15T11:25:35.765299-08:00", "fileCount": 3, "filesNeedReuploaded": false },
    //     { "name": "StudentRec Mapping - New", "description": "", "sourceFormat": "xml", "selectedSource": "query","sourceQuery": "cts.uris(null,null,cts.andQuery[cts.CollectionQuery('Customer'),cts.elementAttributeValueQuery()])", "collections": ['Customer'], "lastUpdated": "2020-02-11T11:25:35.765299-08:00", "fileCount": 1, "filesNeedReuploaded": false }]
    // },
    // {
    //     "name": "ProviderRecords",
    //     "mappings": [{ "name": "Map 6", "description": "", "sourceFormat": "json", "selectedSource": "collection","sourceQuery": "cts.CollectionQuery('Provider')", "collections": ['Provider'], "lastUpdated": "2020-02-15T11:25:35.765299-08:00", "fileCount": 3, "filesNeedReuploaded": false },
    //     { "name": "Provider Mapping - New", "description": "", "sourceFormat": "xml","selectedSource": "query", "sourceQuery": "cts.uris(null,null,cts.andQuery[cts.CollectionQuery('Customer'),cts.elementAttributeValueQuery()])", "collections": ['Customer'], "lastUpdated": "2020-02-11T11:25:35.765299-08:00", "fileCount": 1, "filesNeedReuploaded": false }]
    // }];

    useEffect(() => {
        getMappingArtifacts();
        console.log('useEffect Called')
        
    },[isLoading]);

    const getMappingArtifacts = async () => {
        try {
            let response = await axios.get('/api/artifacts/mapping');
            
            if (response.status === 200) {
                setEntityArtifacts([...response.data]);
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
              //handleError(error);
          }
    }

    const createMappingArtifact = async (mapObj) => {
        console.log('Create API Called!')
        try {
            setIsLoading(true);
      
            let response = await axios.post(`/api/artifacts/mapping/${mapObj.name}`, mapObj);
            if (response.status === 200) {
              console.log('Create/Update LoadDataArtifact API Called successfully!')
              setIsLoading(false);
            }
          }
          catch (error) {
            let message = error.response.data.message;
            console.log('Error While creating the Load Data artifact!', message)
            setIsLoading(false);
            //handleError(error);
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
                    canReadOnly={canReadOnly} />
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