import React, { useState, useContext } from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import styles from './search-result.module.scss';
import ReactHtmlParser from 'react-html-parser';
import { UserContext } from '../../util/user-context';
import { dateConverter } from '../../util/date-conversion';
import { xmlParser } from '../../util/xml-parser';
import ExpandableTableView from "../expandable-table-view/expandable-table-view";
import { Icon, Tooltip } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faCode } from '@fortawesome/free-solid-svg-icons'

interface Props extends RouteComponentProps {
  item: any;
  entityDefArray: any[];
};

const SearchResult: React.FC<Props> = (props) => {
  const { setAlertMessage } = useContext(UserContext);
  const [show, toggleShow] = useState(false);

  let itemEntityName: string[] = [];
  let itemEntityProperties: any[] = [];
  let entityDef: any = {};
  let primaryKeyValue: any = '-';
  let createdOnVal: string = '';
  let sourcesVal: string = '';
  let fileTypeVal: string = props.item.format;
  let uri: string = encodeURIComponent(props.item.uri);

  if (props.item.format === 'json' && props.item.hasOwnProperty('extracted')) {
    if (props.item.extracted.content.length <= 1) {
          // content data does not exist in payload
          setAlertMessage('Error', 'No instance information in payload');
    } else {
      props.item.extracted.content.forEach(contentObject => {
        if (Object.keys(contentObject)[0] === 'headers') {
          const headerValues = Object.values<any>(contentObject);
          createdOnVal = headerValues[0].hasOwnProperty('createdOn') && headerValues[0].createdOn.toString().substring(0, 19);
          if (headerValues[0].hasOwnProperty('sources')) {
            if (Array.isArray(headerValues[0].sources)) {
              sourcesVal = headerValues[0].sources.map(src => {
                return src.name;
              }).join(', ');
            } else {
              sourcesVal = headerValues[0].sources.name;
            }
          }
        } else {
          itemEntityName = Object.keys(contentObject);
          itemEntityProperties = Object.values<any>(contentObject);
          if (itemEntityName.length && props.entityDefArray.length) {
            entityDef = props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
          }
          if (itemEntityProperties.length && entityDef.primaryKey) {
            if (Array.isArray(itemEntityProperties[0]) && itemEntityProperties[0].length) {
              primaryKeyValue = encodeURIComponent(props.item.uri);
            } else {
              primaryKeyValue = itemEntityProperties[0][entityDef.primaryKey];
            }
          }
        }
      }); 
    }
  } else if (props.item.format === 'xml' && props.item.hasOwnProperty('extracted')) {
    props.item.extracted.content.forEach(contentObject => {
      let obj = xmlParser(contentObject);
      if (obj.hasOwnProperty('headers') || obj.hasOwnProperty('es:headers')) {
        const headerValues = Object.values<any>(obj);
        createdOnVal = headerValues[0].hasOwnProperty('createdOn') && headerValues[0].createdOn.toString().substring(0, 19);
        if (headerValues[0].hasOwnProperty('sources')) {
          if (Array.isArray(headerValues[0].sources)) {
            sourcesVal = headerValues[0].sources.map(src => {
              return src.name;
            }).join(', ');
          } else {
            sourcesVal = headerValues[0].sources.name;
          }
        }
      } else {
        itemEntityName = Object.keys(obj);
        itemEntityProperties = Object.values<any>(obj);
        if (itemEntityName.length && props.entityDefArray.length) {
          entityDef = props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
        }
        if (itemEntityProperties.length && itemEntityProperties[0].hasOwnProperty(entityDef.primaryKey)) {
          if (Array.isArray(itemEntityProperties[0]) && itemEntityProperties[0].length) {
            primaryKeyValue = encodeURIComponent(props.item.uri);
          } else {
            primaryKeyValue = itemEntityProperties[0][entityDef.primaryKey];
          }
        }
      }
    });
  }

  function getSnippet() {
    let str = '';
    props.item.matches.forEach(item => {
      item['match-text'].forEach(element => {
        if (typeof element === 'object') {
          str = str.concat('<b>').concat(element.highlight).concat('</b>')
        } else {
          str = str.concat(element)
        }
      });
      str = str.concat('...')
    })
    return <p>{ReactHtmlParser(str)}</p>;
  }


  const snippet = getSnippet();

  function showTableEntityProperties() {
    toggleShow(!show);
  }

  return (
      <div style={{width: '100%'}}>
        <div className={styles.title} onClick={() => showTableEntityProperties()}>
          <Icon className={styles.expandableIcon} data-cy='expandable-icon' type='right' rotate={show ? 90 : undefined}/>
          <div className={styles.redirectIcons}>
            <Link to={{pathname: `/detail/${primaryKeyValue}/${uri}`,state: {selectedValue:'instance'}}} id={'instance'} data-cy='instance'>
            <Tooltip title={'Show detail on a separate page'}><FontAwesomeIcon  icon={faExternalLinkAlt} size="sm" /></Tooltip>
            </Link>
            <Link to={{pathname: `/detail/${primaryKeyValue}/${uri}`,state: {selectedValue:'source'}}} id={'source'} data-cy='source'>
            <Tooltip title={'Show source on a separate page'}><FontAwesomeIcon  icon={faCode} size="sm" /></Tooltip>
            </Link>
          </div>
          <span className={styles.entityName} data-cy='entity-name'>{itemEntityName}</span>
          {entityDef.primaryKey && <span className={styles.primaryKey}>{entityDef.primaryKey}:</span>}
          <span data-cy='primary-key'> {entityDef.primaryKey ? primaryKeyValue : props.item.uri}</span>
        </div>
        <div className={styles.snippet} data-cy='snipped'>
          {props.item.matches.length >= 1 && snippet}
        </div>
        <div className={styles.metadata}>
          {createdOnVal && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Created On</span>
                <span className={styles.metaValue} data-cy='created-on'>{dateConverter(createdOnVal)}</span>
              </div>
          )}
          {sourcesVal && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Sources</span>
                <span className={styles.metaValue} data-cy='sources'>{sourcesVal}</span>
              </div>
          )}
          {fileTypeVal && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>File Type</span>
                <span className={styles.format} data-cy='file-type'>{fileTypeVal}</span>
              </div>
          )}
        </div>
        <div style={{display: (show) ? 'block' : 'none'}} data-cy='expandable-view'>
          <ExpandableTableView item={props.item} entityDefArray={props.entityDefArray} />
        </div>
      </div>
  )
}

export default withRouter(SearchResult);
