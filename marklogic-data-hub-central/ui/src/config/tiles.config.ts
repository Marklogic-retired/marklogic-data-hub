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
    controlColor: string;
    controls: ControlType[];
    intro: string;
}

const tiles: Record<TileId, TileItem>  = {
    load: { 
        title: 'Load',
        iconType: 'custom',
        icon: 'loadIcon',
        color: '#3D409C',
        bgColor: '#F4F6F8',
        border: '#BFBFBF',
        controlColor: '#777',
        controls: ['close'],
        intro: 'Create and configure steps that ingest raw data from multiple sources.',
    },
    model: { 
        title: 'Model',
        iconType: 'custom',
        icon: 'modelIcon',
        color: '#304F7F',
        bgColor: '#F4F6F8',
        border: '#BFBFBF',
        controlColor: '#777',
        controls: ['close'],
        intro: 'Define the entity models that describe and standardize your data. You need these entity models to curate your data.',
    },
    curate: { 
        title: 'Curate',
        iconType: 'custom',
        icon: 'curateIcon',
        color: '#184B5A',
        bgColor: '#F4F6F8',
        border: '#BFBFBF',
        controlColor: '#777',
        controls: ['close'],
        intro: 'Create and configure steps that curate and refine your data. In the Mapping step, you associate a field in your raw data model with each property in your entity model. When you run a Mapping step, these associations are applied to your data.',
    },
    run: { 
        title: 'Run',
        iconType: 'custom',
        icon: 'runIcon',
        color: '#82388A',
        bgColor: '#F4F6F8',
        border: '#BFBFBF',
        controlColor: '#777',
        controls: ['close'],
        intro: 'Add your step to a flow and run it.',
    },
    explore: { 
        title: 'Explore',
        iconType: 'custom', 
        icon: 'exploreIcon',
        color: '#376F63',
        bgColor: '#F4F6F8',
        border: '#BFBFBF',
        controlColor: '#777',
        controls: ['menu', 'close'],
        intro: 'Search, filter, review, and export your curated data.',
    },
};

export default tiles;
