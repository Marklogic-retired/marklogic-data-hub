import { faLongArrowAltRight, faCube, faCubes, faObjectUngroup, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";

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

const tiles: Record<TileId, TileItem>  = {
    load: { 
        title: 'Load',
        iconType: 'fa', 
        icon: faLongArrowAltRight, 
        color: '#520339',
        bgColor: '#EEE6EB',
        border: '#a8819c',
    },
    model: { 
        title: 'Model',
        iconType: 'fa', 
        icon: faCube, 
        color: '#22075E',
        bgColor: '#E6EBF4',
        border: '#7f9cc5',
    },
    curate: { 
        title: 'Curate',
        iconType: 'fa', 
        icon: faObjectUngroup, 
        color: '#BC811D',
        bgColor: '#F8F2E8',
        border: '#dcbd8a',
    },
    run: { 
        title: 'Run',
        iconType: 'fa', 
        icon: faCubes, 
        color: '#061178',
        bgColor: '#E6E7F2',
        border: '#8288bb',
    },
    explore: { 
        title: 'Explore',
        iconType: 'custom', 
        icon: 'exploreIcon', 
        color: '#00474F',
        bgColor: '#E6EDED',
        border: '#90aeb2',
    },
};

export default tiles;
