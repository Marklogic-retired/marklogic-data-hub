import React from 'react';
import { Typography, Icon } from 'antd';
import styles from './detail-header.module.scss';

const Header = (props) => {
    const { Text } = Typography;
    var envelope = props.document.envelope;
    const innerObject = Object.keys(envelope.instance)[0];
    const title = envelope.instance.info.title; 
    const id = envelope.instance[innerObject].id
    const timestamp = envelope.headers.createdOn;
    const sources = envelope.headers.sources[0].name;
    const fileType = 'JSON';
    const user = envelope.headers.createdBy;

    return (
        <>
            <div id='header'>
                <div id='title' className={styles.title}>
                    <Text>{title} </Text>
                    <Icon style={{ fontSize: '12px' }} type="right" />
                    <Text type="secondary"> id: </Text>
                    <Text>{id}</Text>
                </div>
                <div id='summary' className={styles.summary}>
                    <Text type="secondary">Created: </Text>
                    <Text>{timestamp}</Text>
                    <Text type="secondary">&nbsp; &nbsp; Sources: </Text>
                    <Text>{sources}</Text>
                    <Text type="secondary">&nbsp; &nbsp; File Type: </Text>
                    <Text>{fileType}</Text>
                    <Text type="secondary">&nbsp; &nbsp; User: </Text>
                    <Text>{user}</Text>
                </div>
            </div>
        </>
    )
}

export default Header;