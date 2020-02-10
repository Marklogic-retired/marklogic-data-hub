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

    const loadDataArtifacts = {

    }

    const deleteLoadDataArtifact = () => {

    }

    const createLoadDataArtifact = () => {

    }

    const canReadWrite = true;
    const canReadOnly = true;

    let output;

    if (viewType === 'map') {
        output = <div className={styles.cardView}>
            <MappingCard data={loadDataArtifacts}
                deleteLoadDataArtifact={deleteLoadDataArtifact}
                createLoadDataArtifact={createLoadDataArtifact}
                canReadWrite={canReadWrite}
                canReadOnly={canReadOnly} />
        </div>
    } else {
        output = <div><br/>This funcitonality is not created yet.</div>
    }

    return (
        <div className={styles.entityContainer}>
        <Collapse accordion>
            <Panel header="Entity 1" key="1">
            <Menu mode="horizontal" defaultSelectedKeys={['map']}>
                <Menu.Item key='map' onClick={mappingCardsView}>
                    Mapping
                </Menu.Item>
                <Menu.Item key='master' onClick={masterView}>
                    Master
                </Menu.Item>
            </Menu>
            {output}
            </Panel>
            <Panel header="Entity 2" key="2">
                <p>{text}</p>
            </Panel>
            <Panel header="Entity 3" key="3">
                <p>{text}</p>
            </Panel>
        </Collapse>
        </div>
    );

}

export default EntityTiles;