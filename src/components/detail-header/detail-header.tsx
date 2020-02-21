import React from 'react';
import { Typography, Icon } from 'antd';
import styles from './detail-header.module.scss';
import { dateConverter } from '../../util/date-conversion';

interface Props {
  document: any;
  contentType: string;
  primaryKey: string;
  uri: string;
};

const DetailHeader: React.FC<Props> = (props) => {
  const { Text } = Typography;
  const fileType = props.contentType;
  let envelope: any = {};
  let esEnvelope: any = {};
  let title: string = '';
  let primaryKey: string = '';
  let id: string = '';
  let timestamp: string = '';
  let sources: string = '';

  if (fileType === 'json') {
    if (props.document.envelope) {
      envelope = props.document.envelope;
      if (envelope && envelope.instance) {
        if (envelope.instance.hasOwnProperty('info')) {
          title = envelope.instance.info.hasOwnProperty('title') && envelope.instance.info.title;
        }
        if (envelope.hasOwnProperty('headers')) {
          if (typeof (envelope.headers.createdOn) === 'object') {
            timestamp = envelope.headers.hasOwnProperty('createdOn') && envelope.headers.createdOn[0];
          } else {
            timestamp = envelope.headers.hasOwnProperty('createdOn') && envelope.headers.createdOn;
          }
        }
        if (envelope.headers.hasOwnProperty('sources')) {
          if (Array.isArray(envelope.headers.sources)) {
            sources = envelope.headers.sources[0].name;
          } else {
            sources = envelope.headers.sources.name;
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
      }
    }
  } else if (fileType === 'xml') {
    if (props.document.content.envelope) {
      envelope = props.document.content.envelope;
      if (envelope && envelope.instance) {
        if (envelope.hasOwnProperty('headers')) {
          timestamp = envelope.headers.hasOwnProperty('createdOn') && envelope.headers.createdOn;
          sources = envelope.headers.hasOwnProperty('sources') && envelope.headers.sources.name;
        }
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
    }
    else{
        esEnvelope = props.document.content['es:envelope'];
        if (esEnvelope) {
          if (esEnvelope.hasOwnProperty('es:headers')) {
            timestamp = esEnvelope['es:headers'].hasOwnProperty('createdOn') && esEnvelope['es:headers'].createdOn[0];
            sources = esEnvelope['es:headers'].hasOwnProperty('sources') && esEnvelope['es:headers'].sources[0].name;
          }
          if (esEnvelope['es:instance'].hasOwnProperty('es:info')) {
            title = esEnvelope['es:instance']['es:info'].hasOwnProperty('es:title') && esEnvelope['es:instance']['es:info']['es:title'];
          }
          if (props.primaryKey) {
            Object.keys(esEnvelope['es:instance']).forEach(instance => {
              if (instance !== 'info') {
                Object.keys(esEnvelope['es:instance'][instance]).forEach(function (key) {
                  if (props.primaryKey == esEnvelope['es:instance'][instance][key]) {
                    primaryKey = key;
                    id = esEnvelope['es:instance'][instance][key];
                  }
                });
              }
            });
          } else {
            id = props.uri;
          }
        }
    }
  }

  return (
    <div id='header' className={styles.container}>
      <div id='title' className={styles.title}>

        {primaryKey || id ?
          <>
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
          </>
          : ''
    }

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