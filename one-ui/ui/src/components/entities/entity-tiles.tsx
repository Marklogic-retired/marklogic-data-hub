import React, { useState } from 'react';
import { Collapse, Menu, Divider } from 'antd';
import styles from './entity-tiles.module.scss';
import MappingCard from './mapping/mapping-card';

const EntityTiles: React.FC = () => {

    const { Panel } = Collapse;
    const text = 'sample text';
    const [viewType, setViewType] = useState('map')

    const mappingCardsView = () => {
        setViewType('map');
        console.log('Mapping View - In progress')
    }

    const masterView = () => {
        setViewType('master');
        console.log('Master View -- To be Created')
    }

    //Temporary Data - To be removed
    const loadDataArtifacts = [{
        "name": "CustomerRecords",
        "mappings": [{ "name": "Map 1", "description": "", "sourceFormat": "json", "sourceQuery": "cts.CollectionQuery('Provider')", "Collections": ['Provider'], "lastUpdated": "2020-02-15T11:25:35.765299-08:00", "fileCount": 3, "filesNeedReuploaded": false },
        { "name": "Customer Mapping - New", "description": "", "sourceFormat": "xml", "sourceQuery": "cts.uris(null,null,cts.andQuery[cts.CollectionQuery('Customer'),cts.elementAttributeValueQuery()])", "Collections": ['Customer'], "lastUpdated": "2020-02-11T11:25:35.765299-08:00", "fileCount": 1, "filesNeedReuploaded": false },
        { "name": "Map 3", "description": "", "sourceFormat": "json", "sourceQuery": "cts.CollectionQuery('Finance')", "Collections": ['Finance'], "lastUpdated": "2020-01-18T11:25:35.765299-08:00", "fileCount": 10, "filesNeedReuploaded": true },
        { "name": "Map 1", "description": "", "sourceFormat": "Delimited Text", "sourceQuery": "cts.CollectionQuery('AirlineDataCust')", "Collections": ['AirlineData'], "lastUpdated": "2020-01-12T11:25:35.765299-08:00", "fileCount": 6, "filesNeedReuploaded": false }
        ]
    },
    {
        "name": "StudentCollegeRecordsNew",
        "mappings": [{ "name": "Map 4", "description": "", "sourceFormat": "json", "sourceQuery": "cts.CollectionQuery('Provider')", "Collections": ['Provider'], "lastUpdated": "2020-02-15T11:25:35.765299-08:00", "fileCount": 3, "filesNeedReuploaded": false },
        { "name": "StudentRec Mapping - New", "description": "", "sourceFormat": "xml", "sourceQuery": "cts.uris(null,null,cts.andQuery[cts.CollectionQuery('Customer'),cts.elementAttributeValueQuery()])", "Collections": ['Customer'], "lastUpdated": "2020-02-11T11:25:35.765299-08:00", "fileCount": 1, "filesNeedReuploaded": false }]
    },
    {
        "name": "ProviderRecords",
        "mappings": [{ "name": "Map 6", "description": "", "sourceFormat": "json", "sourceQuery": "cts.CollectionQuery('Provider')", "Collections": ['Provider'], "lastUpdated": "2020-02-15T11:25:35.765299-08:00", "fileCount": 3, "filesNeedReuploaded": false },
        { "name": "Provider Mapping - New", "description": "", "sourceFormat": "xml", "sourceQuery": "cts.uris(null,null,cts.andQuery[cts.CollectionQuery('Customer'),cts.elementAttributeValueQuery()])", "Collections": ['Customer'], "lastUpdated": "2020-02-11T11:25:35.765299-08:00", "fileCount": 1, "filesNeedReuploaded": false }]
    }];

    

    const deleteLoadDataArtifact = () => {
        console.log('Delete API Called!')
    }

    const createLoadDataArtifact = () => {
        console.log('Create API Called!')
    }

    const canReadWrite = true;
    const canReadOnly = true;

    const outputCards = (entMaps) => {
        let output;

        if (viewType === 'map') {
            output = <div className={styles.cardView}>
                <MappingCard data={entMaps}
                    deleteLoadDataArtifact={deleteLoadDataArtifact}
                    createLoadDataArtifact={createLoadDataArtifact}
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
        
        <Collapse accordion>
            { loadDataArtifacts.map((map,index) => (
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
            {/* <Panel header="StudentCollegeRecords" key="2">
                <p>{text}</p>
            </Panel>
            <Panel header="ProviderRecords" key="3">
                <p>{text}</p>
            </Panel> */}
        </Collapse>
        </div>
    );

}

export default EntityTiles;