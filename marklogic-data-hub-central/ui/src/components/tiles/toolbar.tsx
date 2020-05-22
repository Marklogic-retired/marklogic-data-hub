import React, { CSSProperties } from 'react';
import { Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import styles from './toolbar.module.scss';
import './toolbar.scss';

interface Props {
    tiles: any;
    onClick: any;
    enabled: any;
}

const Toolbar: React.FC<Props>  = (props) => {

    const tiles = props.tiles; // config/tiles.config.ts

    const onClick = (e, id) => {
        if (props.enabled && props.enabled.includes(id)){
            props.onClick(id);
        } else {
            e.preventDefault();
        }
    }

    const getTooltip = (id) => {
        if (props.enabled && props.enabled.includes(id)){
            return tiles[id]['title'];
        } else {
            return `${tiles[id]['title']}: Contact your security administrator to get the roles and permissions required to access this functionality.`;
        }
    }

    const getIconStyle = (tileId) => {
        let disabled: CSSProperties = {
                color: 'grey',
                opacity: '0.5',
                cursor: 'not-allowed'
        }
        let enabled: CSSProperties = {
            color: tiles[tileId]['color']
        }
        return (props.enabled && props.enabled.includes(tileId)) ? enabled : disabled;
    }    
    return (
        <div id={styles.toolbar} aria-label={'toolbar'}>
            {Object.keys(tiles).map((id, i) => {
                if (tiles[id]['iconType'] === 'custom') {
                    return (
                        <Tooltip title={getTooltip(id)} placement="left" key={i}>
                            <div className={tiles[id]['icon']} aria-label={'tool-' + id} style={getIconStyle(id)} 
                            onClick={(e) => onClick(e,id)}></div>
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title={getTooltip(id)} placement="left" key={i}>
                            <i className={styles.tool} aria-label={'tool-' + id} style={getIconStyle(id)}
                            onClick={(e) => onClick(e,id)}>
                                <FontAwesomeIcon icon={tiles[id]['icon']} size="lg" />
                            </i>
                        </Tooltip>
                    )
                }
            })}
        </div>
    );
}

export default Toolbar;
