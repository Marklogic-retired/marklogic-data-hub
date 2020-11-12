import React, { useState, useContext, useEffect } from 'react';
import tiles from '../config/tiles.config';
import Toolbar from '../components/tiles/toolbar';
import Tiles from '../components/tiles/tiles';
import styles from './TilesView.module.scss';
import './TilesView.scss';

import Overview from './Overview';
import Load from './Load';
import Modeling from './Modeling';
import Curate from './Curate';
import Run from './Run';
import Browse from './Browse';
import Detail from "./Detail";
import MatchingDetailStep from '../components/entities/matching/matching-step-detail/matching-step-detail';
import { AuthoritiesContext } from "../util/authorities";
import { SearchContext } from '../util/search-context';
import { useHistory, useLocation } from 'react-router-dom';
import MergingStepDetail from "../components/entities/merging/merging-step-detail/merging-step-detail";
import { ConfigProvider } from 'antd';

export type TileId = 'load' | 'model' | 'curate' | 'run' | 'explore';
export type IconType = 'fa' | 'custom';
interface TileItem {
    title: string;
    iconType: IconType;
    icon: any;
    color: string;
    bgColor: string;
    border: string;
}

const INITIAL_SELECTION = ''; // '' for no tile initially

const TilesView = (props) => {
    const [selection, setSelection] = useState<TileId | string>(INITIAL_SELECTION);
    const [currentNode, setCurrentNode] = useState<any>(INITIAL_SELECTION);
    const [options, setOptions] = useState<TileItem|null>(null);

    const history: any = useHistory();
    const location: any = useLocation();

    const setCurateView = () => {
        if (location.pathname.startsWith('/tiles/curate/match')) {
            return <MatchingDetailStep/>;
        } else if (location.pathname.startsWith('/tiles/curate/merge')) {
            return <MergingStepDetail/>;
        } else {
            return <Curate/>;
        }
    };

    const views: Record<TileId, JSX.Element> = {
        load: <Load />,
        model: <Modeling />,
        curate: setCurateView(),
        run: <Run />,
        explore: location.pathname.startsWith('/tiles/explore/detail') ? <Detail /> : <Browse/>,
    };

    const {
        setManageQueryModal,
        setView,
        searchOptions
    } = useContext(SearchContext);

    const onMenuClick = () => {
        setManageQueryModal(true);
    };

    const onTileClose = () => {
        setSelection(INITIAL_SELECTION);
        setCurrentNode(INITIAL_SELECTION); // TODO Handle multiple with nested objects
        setOptions(null);
        setView(null);
        history.push('/tiles');
    };

    // For role-based privileges
    const auth = useContext(AuthoritiesContext);
    const enabledViews: Record<TileId, boolean> = {
        load: auth.canReadLoad() || auth.canWriteLoad(),
        model: auth.canReadEntityModel() || auth.canWriteEntityModel(),
        curate: auth.canReadMapping() || auth.canWriteMapping() || auth.canReadMatchMerge() || auth.canWriteMatchMerge() || auth.canReadCustom(),
        run: auth.canReadFlow() || auth.canWriteFlow(),
        explore: true,
        // TODO - Needs to be updated if there are any changes in authorities for Explorer
        // explore: auth.canReadFlow() || auth.canWriteFlow(),
    };
    const enabled = Object.keys(enabledViews).filter(key => enabledViews[key]);

    useEffect(() => {
        if (props.id) {
            setSelection(props.id);
            setCurrentNode(props.id); // TODO Handle multiple with nested objects
            setOptions(tiles[props.id]);
            setView(views[props.id], true);
        }
        return (() => {
            setSelection(INITIAL_SELECTION);
            setCurrentNode(INITIAL_SELECTION); // TODO Handle multiple with nested objects
            setOptions(null);
            setView(null);
        });
    }, []);

    const getNewStepToFlowOptions = () => {
        return !props.addingStepToFlow ? { addingStepToFlow: false } : {
            addingStepToFlow: true,
            startRunStep: props.startRunStep,
            flowName : location.state?.flowName,
            newStepName: location.state?.stepToAdd,
            stepDefinitionType: location.state?.stepDefinitionType,
            viewMode: location.state?.viewMode,
            pageSize: location.state?.pageSize,
            page: location.state?.page,
            sortOrderInfo: location.state?.sortOrderInfo,
            targetEntityType: location.state?.targetEntityType,
            existingFlow: location.state?.existingFlow || false,
            flowsDefaultKey: location.state?.flowsDefaultKey || ['-1']
        };
    };

    return (
        <>
            <Toolbar tiles={tiles} enabled={enabled}/>
            { (searchOptions.view !== null) ?  (
                <div className={styles.tilesViewContainer}>
                    { (selection !== '') ?  (
                    <ConfigProvider
                        getPopupContainer={(node) => {
                            if(node) {
                                return node.parentNode ?  node.parentNode as HTMLElement : document.body;
                            }
                             else {
                                return document.body
                            }
                        }}
                    >
                        <Tiles
                            id={selection}
                            view={searchOptions.view}
                            currentNode={currentNode}
                            options={options}
                            onMenuClick={onMenuClick}
                            onTileClose={onTileClose}
                            newStepToFlowOptions={getNewStepToFlowOptions()}
                        />
                    </ConfigProvider>
                    ) : null }
                </div> ) :
                <Overview enabled={enabled}/>
            }

        </>
    );
};

export default TilesView;
