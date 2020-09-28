import { faLongArrowAltRight, faCube, faCubes, faObjectUngroup, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";

export type TileId =  'load' | 'model' | 'curate' | 'run' | 'explore';
export type IconType = 'fa' | 'custom';
export type ControlType = 'menu' | 'newTab' | 'maximize' | 'minimize' | 'close';

interface TileItem {
    title: string;
    iconType: IconType;
    icon: any;
    color: string;
    bgColor: string;
    border: string;
    controls: ControlType[];
}

const tiles: Record<TileId, TileItem>  = {
    load: { 
        title: 'Load',
        iconType: 'fa', 
        icon: faLongArrowAltRight, 
        color: '#520339',
        bgColor: '#F4F6F8',
        border: '#a8819c',
        controls: ['close'],
    },
    model: { 
        title: 'Model',
        iconType: 'fa', 
        icon: faCube, 
        color: '#22075E',
        bgColor: '#F4F6F8',
        border: '#7f9cc5',
        controls: ['close'],
    },
    curate: { 
        title: 'Curate',
        iconType: 'fa', 
        icon: faObjectUngroup, 
        color: '#BC811D',
        bgColor: '#F4F6F8',
        border: '#dcbd8a',
        controls: ['close'],
    },
    run: { 
        title: 'Run',
        iconType: 'fa', 
        icon: faCubes, 
        color: '#061178',
        bgColor: '#F4F6F8',
        border: '#8288bb',
        controls: ['close'],
    },
    explore: { 
        title: 'Explore',
        iconType: 'custom', 
        icon: 'exploreIcon', 
        color: '#00474F',
        bgColor: '#F4F6F8',
        border: '#90aeb2',
        controls: ['menu', 'close'],
    },
};

export default tiles;
