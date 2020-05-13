import React, {useContext} from 'react';
import { Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AuthoritiesContext } from "../../util/authorities";

import styles from './toolbar.module.scss';
import './toolbar.scss';

interface Props {
    tiles: any;
    onClick: any;
}

const Toolbar: React.FC<Props>  = (props) => {

    const tiles = props.tiles; // config/tiles.config.ts
    const authorityService = useContext(AuthoritiesContext);
    const idToAuthoritiesNeeded = {
        load: () => authorityService.canReadLoadData(),
        model: () => authorityService.canReadEntityModel(),
        curate: () => authorityService.canReadMapping(),
        run: () => authorityService.canReadFlow(),
        explore: () => true
    };

    const hasAuthorityNeeded = (id) => {
        return !idToAuthoritiesNeeded[id] || idToAuthoritiesNeeded[id]();
    };

    const onClick = (id) => {
        if (hasAuthorityNeeded(id)) {
            props.onClick(id);
        }
    }

    return (
        <div id={styles.toolbar} aria-label={'toolbar'}>
            {Object.keys(tiles).map((id, i) => {
                let hasTileAuthority = hasAuthorityNeeded(id);
                let tooltipTitle = tiles[id]['title'] + (!hasTileAuthority ? ': Contact your security administrator to get the roles and permissions required to access this functionality.': '');
                if (tiles[id]['iconType'] === 'custom') {
                    return (
                        <Tooltip title={tooltipTitle} placement="left" key={i}>
                            <div className={tiles[id]['icon']} aria-label={'tool-' + id} style={{color: tiles[id]['color']}} onClick={() => onClick(id)}></div>
                        </Tooltip>
                    )
                } else {
                    return (
                        <Tooltip title={tooltipTitle} placement="left" key={i}>
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
