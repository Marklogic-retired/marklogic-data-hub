import React from 'react';
import { Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './toolbar.module.scss';
import './toolbar.scss';

interface Props {
    tiles: any;
    onClick: any;
}

const Toolbar: React.FC<Props>  = (props) => {

    const tiles = props.tiles; // config/tiles.config.ts

    const onClick = (id) => {
        props.onClick(id);
    }
    
    return (
        <div id={styles.toolbar} aria-label={'toolbar'}>
            {Object.keys(tiles).map((id, i) => {
                if (tiles[id]['iconType'] === 'custom') {
                    return (
                        <Tooltip title={tiles[id]['title']} placement="left" key={i}>
                            <div className={tiles[id]['icon']} aria-label={'tool-' + id} style={{color: tiles[id]['color']}} onClick={() => onClick(id)}></div>
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title={tiles[id]['title']} placement="left" key={i}>
                            <i className={styles.tool} aria-label={'tool-' + id} style={{color: tiles[id]['color']}} onClick={() => onClick(id)}>
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
