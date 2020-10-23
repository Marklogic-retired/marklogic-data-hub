import React from 'react';
import { Typography, Icon } from 'antd';
import styles from './detail-header.module.scss';
import { dateConverter } from '../../util/date-conversion';

interface Props {
  document: any;
  contentType: string;
  primaryKey: string;
  uri: string;
  sources: any;
}

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

  if (props.sources && props.sources.length) {
    if (Array.isArray(props.sources)) {
      sources = props.sources.map(src => {
        return src.name;
      }).join(', ');
    } else {
      sources = props.sources.name;
    }
  }
  
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
        if (props.primaryKey && props.primaryKey !== props.uri) {
          Object.keys(props.document.envelope.instance).forEach(instance => {
            if (instance !== 'info') {
              Object.keys(props.document.envelope.instance[instance]).forEach(function (key) {
                if (props.primaryKey.toString() === props.document.envelope.instance[instance][key].toString()) {
                  primaryKey = key;
                  id = props.document.envelope.instance[instance][key];
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
    if (props.document.envelope) {
      envelope = props.document.envelope;
      if (envelope && envelope.instance) {
        if (envelope.hasOwnProperty('headers')) {
          timestamp = envelope.headers.hasOwnProperty('createdOn') && envelope.headers.createdOn;
        }
        if (envelope.instance.hasOwnProperty('info')) {
          title = envelope.instance.info.hasOwnProperty('title') && envelope.instance.info.title;
        }
        if (props.primaryKey && props.primaryKey !== props.uri) {
          Object.keys(props.document.envelope.instance).forEach(instance => {
            if (instance !== 'info') {
              Object.keys(props.document.envelope.instance[instance]).forEach(function (key) {
                if (props.primaryKey.toString() === props.document.envelope.instance[instance][key].toString()) {
                  primaryKey = key;
                  id = props.document.envelope.instance[instance][key];
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
        esEnvelope = props.document['es:envelope'];
        if (esEnvelope) {
          if (esEnvelope.hasOwnProperty('es:headers')) {
            timestamp = esEnvelope['es:headers'].hasOwnProperty('createdOn') && esEnvelope['es:headers'].createdOn[0];
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
            {primaryKey ? (
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
  );
};

export default DetailHeader;