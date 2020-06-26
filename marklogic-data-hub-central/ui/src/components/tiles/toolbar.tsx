import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import styles from './toolbar.module.scss';
import './toolbar.scss';

interface Props {
    tiles: any;
    enabled: any;
}

const Toolbar: React.FC<Props>  = (props) => {

    const tiles = props.tiles; // config/tiles.config.ts

    const getTooltip = (id) => {
        if (props.enabled && props.enabled.includes(id)){
            return tiles[id]['title'];
        } else {
            return `${tiles[id]['title']}: Contact your security administrator to get the roles and permissions required to access this functionality.`;
        }
    }

    const getIconStyle = (id) => {
        let disabled: CSSProperties = {
            color: 'grey',
            opacity: '0.5',
            cursor: 'not-allowed'
        }
        let enabled: CSSProperties = {
            color: tiles[id]['color']
        }
        return (props.enabled && props.enabled.includes(id)) ? enabled : disabled;
    }

    return (
        <div id={styles.toolbar} aria-label={'toolbar'}>
            {Object.keys(tiles).map((id, i) => {
                if (tiles[id]['iconType'] === 'custom') {
                    return (
                        <Link to={ '/tiles/' + id } aria-label={'tool-' + id + '-link'} key={i}>
                            <Tooltip title={getTooltip(id)} placement="leftTop" key={i}>
                                <div
                                    className={tiles[id]['icon']}
                                    aria-label={'tool-' + id}
                                    style={getIconStyle(id)}
                                />
                            </Tooltip>
                        </Link>
                    )
                } else {
                    return (
                        <Tooltip title={getTooltip(id)} placement="leftTop" key={i}>
                            <Link to={ '/tiles/' + id } aria-label={'tool-' + id + '-link'} >
                                <i
                                    className={styles.tool}
                                    aria-label={'tool-' + id}
                                    style={getIconStyle(id)}
                                ><FontAwesomeIcon icon={tiles[id]['icon']} size="lg" />
                                </i>
                            </Link>
                        </Tooltip>
                    )
                }
            })}
        </div>
    );
}

export default Toolbar;
