import React from 'react';
import { Typography, Icon } from 'antd';
import styles from './detail-header.module.scss';

const Header = (props) => {
    const { Text } = Typography;
    const fileType = props.contentType.toUpperCase();
    var envelope, document, title, id, timestamp, sources, user;

    if (fileType === 'JSON') {
        envelope = props.document.envelope;
        document = Object.keys(envelope.instance)[0];
        title = envelope.instance.info.title;
        id = envelope.instance[document].id
        timestamp = envelope.headers.createdOn;
        sources = envelope.headers.sources[0].name;
        user = envelope.headers.createdBy;
    } else if (fileType === 'XML') {
        envelope = props.document.content.envelope;
        document = Object.keys(envelope.instance)[1];
        title = envelope.instance.info.title;
        id = envelope.instance[document].id
        timestamp = props.document.metaData.entry.find(x => x.key === 'datahubCreatedOn').value;
        sources = props.document.metaData.entry.find(x => x.key === 'datahubCreatedInFlow').value;
        user = props.document.metaData.entry.find(x => x.key === 'datahubCreatedBy').value;
    }

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