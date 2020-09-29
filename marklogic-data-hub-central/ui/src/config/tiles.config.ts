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
    intro: string;
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
        intro: 'Create and configure steps that ingest raw data from multiple sources.',
    },
    model: { 
        title: 'Model',
        iconType: 'fa', 
        icon: faCube, 
        color: '#22075E',
        bgColor: '#F4F6F8',
        border: '#7f9cc5',
        controls: ['close'],
        intro: 'Define the entity models that describe and standardize your data. You need these entity models to curate your data.',
    },
    curate: { 
        title: 'Curate',
        iconType: 'fa', 
        icon: faObjectUngroup, 
        color: '#BC811D',
        bgColor: '#F4F6F8',
        border: '#dcbd8a',
        controls: ['close'],
        intro: 'Create and configure steps that curate and refine your data. In the Mapping step, you associate a field in your raw data model with each property in your entity model. When you run a Mapping step, these associations are applied to your data.',
    },
    run: { 
        title: 'Run',
        iconType: 'fa', 
        icon: faCubes, 
        color: '#061178',
        bgColor: '#F4F6F8',
        border: '#8288bb',
        controls: ['close'],
        intro: 'Run your step. Add your step to a flow and run it.',
    },
    explore: { 
        title: 'Explore',
        iconType: 'custom', 
        icon: 'exploreIcon', 
        color: '#00474F',
        bgColor: '#F4F6F8',
        border: '#90aeb2',
        controls: ['menu', 'close'],
        intro: 'Search, filter, review, and export your curated data.',
    },
};

export default tiles;
