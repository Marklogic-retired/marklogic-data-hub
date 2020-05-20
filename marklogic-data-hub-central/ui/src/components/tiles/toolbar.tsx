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

    const onClick = (e,id) => {
        if(props.enabled && props.enabled.includes(tiles[id]['title'])){
            props.onClick(id);
        } else {
            e.preventDefault()
        }
    }

    const getTooltip = (id) => {
        if(props.enabled && props.enabled.includes(tiles[id]['title'])){
            return tiles[id]['title'];
        } else {
            return `${tiles[id]['title']}: Contact your security administrator to get the roles and permissions required to access this functionality.` 
        }
    }

    const getIconStyle = (tileId) => {
        let styleDisabledIcon: CSSProperties = {
                color: 'grey',
                opacity: '0.5',
                cursor: 'not-allowed'
        }

        let styleEnabledIcon: CSSProperties = {
            color: tileId['color']
        }
        if(props.enabled && props.enabled.includes(tileId['title'])){
            return styleEnabledIcon;
        } else {
            return styleDisabledIcon
        }
    }    
    return (
        <div id={styles.toolbar} aria-label={'toolbar'}>
            {Object.keys(tiles).map((id, i) => {
                if (tiles[id]['iconType'] === 'custom') {
                    return (
                        <Tooltip title={getTooltip(id)} placement="left" key={i}>
                            <div className={tiles[id]['icon']} aria-label={'tool-' + id} style={getIconStyle(tiles[id])} 
                            onClick={(e) => onClick(e,id)}></div>
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title={getTooltip(id)} placement="left" key={i}>
                            <i className={styles.tool} aria-label={'tool-' + id} style={getIconStyle(tiles[id])}
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
