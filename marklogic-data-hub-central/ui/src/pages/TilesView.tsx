import React, { useState, useContext, useEffect } from 'react';
import tiles from '../config/tiles.config'
import Toolbar from '../components/tiles/toolbar';
import Tiles from '../components/tiles/tiles';
import styles from './TilesView.module.scss';
import './TilesView.scss';

import LoadData from './LoadData';
import Modeling from './Modeling';
import EntityTypes from './EntityTypes';
import Bench from './Bench';
import Browse from './Browse';
import { AuthoritiesContext } from "../util/authorities";

export type TileId =  'load' | 'model' | 'curate' | 'run' | 'explore';
export type IconType = 'fa' | 'custom';
interface TileItem {
    title: string;
    iconType: IconType;
    icon: any;
    color: string;
    bgColor: string;
    border: string;
}

const views: Record<TileId, JSX.Element>  = {
    load: <LoadData/>,
    model: <Modeling/>,
    curate: <EntityTypes/>,
    run: <Bench/>,
    explore: <Browse/>,
};

const INITIAL_SELECTION = ''; // '' for no tile initially

const TilesView: React.FC  = (props) => {
    const [selection, setSelection] = useState<TileId|string>(INITIAL_SELECTION);
    const [currentNode, setCurrentNode] = useState<any>(INITIAL_SELECTION);
    const [options, setOptions] = useState<TileItem|null>(null);
    const [view, setView] = useState<JSX.Element|null>(null);

    // For role-based privileges
    const authorityService = useContext(AuthoritiesContext);
    const canViewLoad = authorityService.canReadLoadData() || authorityService.canWriteLoadData();
    const canViewModel = authorityService.canReadEntityModel() || authorityService.canWriteEntityModel();
    const canViewCurate = authorityService.canReadMapping() || authorityService.canWriteMapping() || authorityService.canReadMatchMerge() || authorityService.canWriteMatchMerge();
    const canViewRun = authorityService.canReadFlow() || authorityService.canWriteFlow();
    //const canViewExplore = authorityService.canReadFlow() || authorityService.canWriteFlow(); //Pending

    const enabledViews = {
        Load: canViewLoad ? 'enabled' : 'disabled',
        Model: canViewModel ? 'enabled' : 'disabled',
        Curate: canViewCurate ? 'enabled' : 'disabled',
        Run: canViewRun ? 'enabled' : 'disabled',
        Explore: 'enabled'
    }; //TODO - Needs to be updated if there are any changes in authorities for Explorer

    const enabled = Object.keys(enabledViews).filter(key => enabledViews[key] === 'enabled');

    const onSelect = (id) => {
        setSelection(id);
        setCurrentNode(id); // TODO Handle multiple with nested objects
        setOptions(tiles[id]);
        setView(views[id]);
    }

    return (
        <>
            <Toolbar tiles={tiles} onClick={onSelect} enabled={enabled}/>
            <div className={styles.tilesViewContainer}>
                { (selection !== '') ?  (
                <Tiles 
                    id={selection}
                    view={view}
                    currentNode={currentNode}
                    controls={[]} // TODO Turn on tile header controls
                    options={options}
                />) : null }
            </div>
        </>
    );
}

export default TilesView;
