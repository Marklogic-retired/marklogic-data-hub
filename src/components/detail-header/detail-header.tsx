import React from 'react';
import { Typography, Icon } from 'antd';
import styles from './detail-header.module.scss';
import { dateConverter } from '../../util/date-conversion';

interface Props {
  document: any;
  contentType: string;
  primaryKey: string;
  uri: string
};

const DetailHeader: React.FC<Props> = (props) => {
  const { Text } = Typography;
  const fileType = props.contentType;
  let envelope: any = {};
  let title: string = '';
  let primaryKey: string = '';
  let id: string = '';
  let timestamp: string = '';
  let sources: string = '';
  let document: any = {};

  if (fileType === 'json') {
    envelope = props.document.envelope;
    document = Object.keys(envelope.instance)[0];
    if (envelope.instance.hasOwnProperty('info')) {
      title = envelope.instance.info.hasOwnProperty('title') && envelope.instance.info.title;
    }
    if (envelope.hasOwnProperty('headers')) {
      timestamp = envelope.headers.hasOwnProperty('createdOn') && envelope.headers.createdOn;
      if (envelope.headers.hasOwnProperty('sources')) {
        if (Array.isArray(envelope.headers.sources) && envelope.headers.sources[0].hasOwnProperty('name')) {
          sources = envelope.headers.sources[0].name
        } else if (!Array.isArray(envelope.headers.sources) && envelope.headers.sources.hasOwnProperty('name')) {
          sources = envelope.headers.sources.name
        }
      }
    }
    if (props.primaryKey) {
      Object.keys(props.document.envelope.instance).forEach(instance => {
        if (instance !== 'info') {
          Object.keys(props.document.envelope.instance[instance]).forEach(function (key) {
            if (props.primaryKey === props.document.envelope.instance[instance][key]) {
              primaryKey = key;
              id = props.document.envelope.instance[instance][key]
            }
          });
        }
      });
    } else {
      id = props.uri;
    }
  } else if (fileType === 'xml') {
    envelope = props.document.content.envelope;
    if (envelope.hasOwnProperty('headers')) {
      timestamp = envelope.headers.hasOwnProperty('createdOn') && envelope.headers.createdOn;
      sources = envelope.headers.hasOwnProperty('sources') && envelope.headers.sources.name;
    }
    document = Object.keys(envelope.instance)[1];
    if (envelope.instance.hasOwnProperty('info')) {
      title = envelope.instance.info.hasOwnProperty('title') && envelope.instance.info.title;
    }
    if (props.primaryKey) {
      Object.keys(props.document.content.envelope.instance).forEach(instance => {
        if (instance !== 'info') {
          Object.keys(props.document.content.envelope.instance[instance]).forEach(function (key) {
            if (props.primaryKey == props.document.content.envelope.instance[instance][key]) {
              primaryKey = key;
              id = props.document.content.envelope.instance[instance][key];
            }
          });
        }
      });
    } else {
      id = props.uri;
    }
  }

  return (
    <div id='header' className={styles.container}>
      <div id='title' className={styles.title}>
        <Text data-cy="document-title">{title} </Text>
        <Icon style={{ fontSize: '12px' }} type="right" />
        {props.primaryKey ? (
          <>
            <Text type="secondary"> {primaryKey}: </Text>
            <Text data-cy="document-id">{id}</Text>
          </>
        ) : (
            <>
              <Text type="secondary"> uri: </Text>
              <Text data-cy="document-uri">{id}</Text>
            </>
          )}
      </div>
      <div id='summary' className={styles.summary}>
        {timestamp &&
          <Text className={styles.meta} data-cy="document-timestamp"><Text type="secondary">Created: </Text>{dateConverter(timestamp)}</Text>
        }
        {sources &&
          <Text className={styles.meta} data-cy="document-source"><Text type="secondary">Sources: </Text>{sources}</Text>
        }
        {fileType &&
          <Text className={styles.meta}>
            <Text type="secondary">File Type: </Text>
            <Text className={styles.type} data-cy="document-filetype">{fileType}</Text>
          </Text>
        }
      </div>
    </div>
  )
}

export default DetailHeader;