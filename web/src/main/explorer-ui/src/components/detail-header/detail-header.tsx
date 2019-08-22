import React from 'react';
import { Typography, Icon } from 'antd';
import styles from './detail-header.module.scss';

const Header = (props) => {
    const { Text } = Typography;

    return (
        <>
            <div id='header'>
                <div id='title' className={styles.title}>
                    <Text>{props.document.envelope.instance.info.title} </Text>
                    <Icon style={{ fontSize: '12px' }} type="right" />
                    <Text type="secondary"> id: </Text>
                    <Text>{props.document.envelope.attachments.envelope.instance.id}</Text>
                </div>
                <div id='summary' className={styles.summary}>
                    <Text type="secondary">Created: </Text>
                    <Text>{props.document.envelope.attachments.envelope.headers.createdOn}</Text>
                    <Text type="secondary">&nbsp; &nbsp; Sources: </Text>
                    <Text>{props.document.envelope.attachments.envelope.headers.sources[0].name}</Text>
                    <Text type="secondary">&nbsp; &nbsp; File Type: </Text>
                    <Text>JSON</Text>
                    <Text type="secondary">&nbsp; &nbsp; User: </Text>
                    <Text>{props.document.envelope.attachments.envelope.headers.createdBy}</Text>
                </div>
            </div>
        </>
    )
}

export default Header;