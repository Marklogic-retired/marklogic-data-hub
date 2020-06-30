import React, { useState } from 'react';
import { Menu } from 'antd';
import { MLRadio } from '@marklogic/design-system';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faTable } from '@fortawesome/free-solid-svg-icons';
import styles from './switch-view.module.scss';
import './switch-view.scss';

interface Props {
    handleSelection: any,
    defaultView: string,
}

const SwitchView: React.FC<Props> = (props) => {
    let [view, setView] = useState(props.defaultView);

    const onChange = (val) => {
        setView(val);
        props.handleSelection(val);
    }
    
    return (
        <div aria-label="switch-view" className={styles.switchView}>
            <MLRadio.MLGroup
                buttonStyle="outline"
                defaultValue={view}
                name="radiogroup"
                onChange={e => onChange(e.target.value)}
                size="large"
            >
                <MLRadio.MLButton aria-label="switch-view-card" value={'card'}>
                    <i><FontAwesomeIcon icon={faThLarge} className={styles.iconStyle} /></i>
                </MLRadio.MLButton>
                <MLRadio.MLButton aria-label="switch-view-list" value={'list'}>
                    <i><FontAwesomeIcon icon={faTable} className={styles.iconStyle} /></i>
                </MLRadio.MLButton>
            </MLRadio.MLGroup>
        </div>
        
    );
}

export default SwitchView;