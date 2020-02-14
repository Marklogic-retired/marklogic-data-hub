import React, { useState, useContext } from 'react';
import { Collapse, Menu } from 'antd';
import styles from './entity-tiles.module.scss';
import MappingCard from './mapping/mapping-card';
import { RolesContext } from '../../util/roles';

const EntityTiles: React.FC = () => {

    const [viewType, setViewType] = useState('map')
    const { Panel } = Collapse;
    
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
    const entityArtifacts = [{
        "name": "CustomerRecords",
        "mappings": [{ "name": "Map 1", "description": "Map1 Description", "sourceFormat": "json", "selectedSource": "collection", "sourceQuery": "cts.CollectionQuery('Provider')", "collections": ['Provider','Claims'], "lastUpdated": "2020-02-15T11:25:35.765299-08:00", "fileCount": 3, "filesNeedReuploaded": false },
        { "name": "Customer Mapping - New", "description": "", "sourceFormat": "xml", "selectedSource": "query", "sourceQuery": "cts.uris(null,null,cts.andQuery[cts.CollectionQuery('Customer'),cts.elementAttributeValueQuery()])", "collections": ['Customer'], "lastUpdated": "2020-02-11T11:25:35.765299-08:00", "fileCount": 1, "filesNeedReuploaded": false },
        { "name": "Map 3", "description": "", "sourceFormat": "json", "selectedSource": "collection","sourceQuery": "cts.CollectionQuery('Finance')", "collections": ['Finance'], "lastUpdated": "2020-01-18T11:25:35.765299-08:00", "fileCount": 10, "filesNeedReuploaded": true },
        { "name": "Map 1", "description": "", "sourceFormat": "Delimited Text", "selectedSource": "collection","sourceQuery": "cts.CollectionQuery('AirlineDataCust')", "collections": ['AirlineData'], "lastUpdated": "2020-01-12T11:25:35.765299-08:00", "fileCount": 6, "filesNeedReuploaded": false }
        ]
    },
    {
        "name": "StudentCollegeRecordsNew",
        "mappings": [{ "name": "Map 4", "description": "", "sourceFormat": "json", "selectedSource": "collection", "sourceQuery": "cts.CollectionQuery('Provider')", "collections": ['Provider'], "lastUpdated": "2020-02-15T11:25:35.765299-08:00", "fileCount": 3, "filesNeedReuploaded": false },
        { "name": "StudentRec Mapping - New", "description": "", "sourceFormat": "xml", "selectedSource": "query","sourceQuery": "cts.uris(null,null,cts.andQuery[cts.CollectionQuery('Customer'),cts.elementAttributeValueQuery()])", "collections": ['Customer'], "lastUpdated": "2020-02-11T11:25:35.765299-08:00", "fileCount": 1, "filesNeedReuploaded": false }]
    },
    {
        "name": "ProviderRecords",
        "mappings": [{ "name": "Map 6", "description": "", "sourceFormat": "json", "selectedSource": "collection","sourceQuery": "cts.CollectionQuery('Provider')", "collections": ['Provider'], "lastUpdated": "2020-02-15T11:25:35.765299-08:00", "fileCount": 3, "filesNeedReuploaded": false },
        { "name": "Provider Mapping - New", "description": "", "sourceFormat": "xml","selectedSource": "query", "sourceQuery": "cts.uris(null,null,cts.andQuery[cts.CollectionQuery('Customer'),cts.elementAttributeValueQuery()])", "collections": ['Customer'], "lastUpdated": "2020-02-11T11:25:35.765299-08:00", "fileCount": 1, "filesNeedReuploaded": false }]
    }];

    

    const deleteMappingArtifact = () => {
        console.log('Delete API Called!')
    }

    const createMappingArtifact = () => {
        console.log('Create API Called!')
    }

    const outputCards = (entMaps) => {
        let output;

        if (viewType === 'map') {
            output = <div className={styles.cardView}>
                <MappingCard data={entMaps}
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
            { entityArtifacts.map((map,index) => (
                <Panel header={map.name} key={map.name}>
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
            {outputCards(map.mappings)}
            </Panel>
            ))}
        </Collapse>
        </div>
    );

}

export default EntityTiles;