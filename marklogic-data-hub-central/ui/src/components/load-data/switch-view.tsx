import React, { useState } from 'react';
import { Menu } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faTh } from '@fortawesome/free-solid-svg-icons';
import styles from './switch-view.module.scss';

interface Props {
    handleSelection: any
}

const SwitchView: React.FC<Props> = (props) => {
    let [viewType, setViewType] = useState('table');

    const cardsView = () => {
       viewType = 'card';
       props.handleSelection(viewType)
        
    }

    const tableView = () => {
        setViewType('table')
        props.handleSelection(viewType)
    }
    
    return (
        <div className={styles.switchView}>
            <Menu mode="horizontal" defaultSelectedKeys={['table']}>
                <Menu.Item key='card' className={styles.cardViewOption} >
                    <i><FontAwesomeIcon title='card' icon={faThLarge} onClick={cardsView} className={styles.iconStyle} size="2x" /></i>
                </Menu.Item>
                <Menu.Item key='table' className={styles.tableViewOption}>
                    <i><FontAwesomeIcon title='table' icon={faTh} onClick={tableView} className={styles.iconStyle} size="2x" /></i>
                </Menu.Item>
            </Menu>
        </div>
        
    );
}

export default SwitchView;