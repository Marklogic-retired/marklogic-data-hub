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
    const auth = useContext(AuthoritiesContext);
    const enabledViews: Record<TileId, boolean> = {
        load: auth.canReadLoadData() || auth.canWriteLoadData(),
        model: auth.canReadEntityModel() || auth.canWriteEntityModel(),
        curate: auth.canReadMapping() || auth.canWriteMapping() || auth.canReadMatchMerge() || auth.canWriteMatchMerge(),
        run: auth.canReadFlow() || auth.canWriteFlow(),
        explore: true, 
        // TODO - Needs to be updated if there are any changes in authorities for Explorer
        // explore: auth.canReadFlow() || auth.canWriteFlow(),
    };
    const enabled = Object.keys(enabledViews).filter(key => enabledViews[key]);

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
