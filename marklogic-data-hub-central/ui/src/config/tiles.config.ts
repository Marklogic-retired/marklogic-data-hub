import { faLongArrowAltRight, faCube, faCubes, faObjectUngroup, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";

export type TileId =  'load' | 'model' | 'curate' | 'run' | 'explore' | 'monitor' | 'detail';
export type IconType = 'fa' | 'custom';
export type ControlType = 'menu' | 'newTab' | 'maximize' | 'minimize' | 'close';
export type Tiles =  Record<TileId, TileItem>;

export interface TileItem {
    title: string;
    iconType: IconType;
    icon: any;
    color: string;
    bgColor: string;
    border: string;
    controlColor: string;
    controls: ControlType[];
    intro?: string;
    toolbar: boolean;
}

const tiles: Tiles = {
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
        toolbar: true
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
        toolbar: true
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
        intro: 'Create and configure steps that curate and refine your data. The Mapping step associates a field in your raw data with a property in your entity model. The Matching step identifies possible duplicate documents. The Merging step combines identified duplicates or performs other actions.',
        toolbar: true
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
        intro: 'Create flows, add your existing steps to flows, and run them.',
        toolbar: true
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
        intro: 'Search, filter, review, and export your data.',
        toolbar: true
    },
    monitor: {
        title: 'Monitor',
        iconType: 'custom',
        icon: 'monitorIcon',
        color: '#f09022',
        bgColor: '#F4F6F8',
        border: '#BFBFBF',
        controlColor: '#777',
        controls: ['menu', 'close'],
        intro: 'Monitor Steps and Flows',
        toolbar: true
    },
    detail: {
        title: 'Explore',
        iconType: 'custom',
        icon: 'exploreIcon',
        color: '#376F63',
        bgColor: '#F4F6F8',
        border: '#BFBFBF',
        controlColor: '#777',
        controls: ['menu', 'close'],
        toolbar: false
    }
};

export default tiles;
