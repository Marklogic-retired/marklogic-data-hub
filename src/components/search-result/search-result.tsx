import React from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import styles from './search-result.module.scss';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import { dateConverter } from '../../util/date-conversion';

interface Props extends RouteComponentProps {
    item: any;
    entityDefArray: any[];
};

const SearchResult: React.FC<Props> = (props) => {

  let itemEntityName: string[] = [];
  let itemEntityProperties: any[] = [];
  let entityDef: any = {};
  let primaryKeyValue: string = '';
  let createdOnVal: string = '';
  let sourcesVal: string = '';
  let fileTypeVal: string = '';

  if (props.item.format === 'json') {
    itemEntityName = Object.keys(props.item.extracted.content[1]);
    itemEntityProperties = Object.values<any>(props.item.extracted.content[1]);
    entityDef = props.entityDefArray.length && props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
    primaryKeyValue = entityDef.primaryKey ? itemEntityProperties[0][entityDef.primaryKey] : '';
    // TODO format createdOnVal using momentjs
    createdOnVal = props.item.extracted.content[0].headers.createdOn.toString().substring(0, 19);
    sourcesVal = props.item.extracted.content[0].headers.sources.map(src => {
        return src.name;
    }).join(', ');
    fileTypeVal = props.item.format;
  } else if (props.item.format === 'xml'){
    let parsedContent = JSON.parse(props.item.extracted.content[0]);
    itemEntityName = Object.keys(parsedContent[1]);
    itemEntityProperties = Object.values<any>(parsedContent[1]);
    entityDef = props.entityDefArray.length && props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
    primaryKeyValue = entityDef.primaryKey ? itemEntityProperties[0][entityDef.primaryKey] : '';
    // TODO format createdOnVal using momentjs
    // TODO add createdOn and sourcesVal for XML files
    // createdOnVal = parsedContent[0].headers.createdOn.toString().substring(0, 19);
    // sourcesVal = parsedContent[0].headers.sources.map(src => {
    //     return src.name;
    // }).join(', ');
  }
  fileTypeVal = props.item.format;

  function getSnippet() {
    let str = '';
    props.item.matches.map(item => {
      if (!item.path.includes('attachments')) {
        item['match-text'].forEach(element => {
          if (typeof element === 'object') {
            str = str.concat('<b>').concat(element.highlight).concat('</b>')
          } else {
            str = str.concat(element)
          }
        });
        str = str.concat('...')
      }
    })
    return <p>{ ReactHtmlParser(str) }</p>;
  } 

  const snippet = getSnippet();
        
  return (
    <div>
      <div className={styles.title} >
        <span className={styles.entityName} data-cy='entity-name'>{itemEntityName}</span>
        {entityDef.primaryKey && <span className={styles.primaryKey}>{entityDef.primaryKey}:</span>}
        <Link to={{
            pathname: `/detail/${primaryKeyValue}/${props.item.uri.startsWith('/') && props.item.uri.substring(1)}`
            }} data-cy='primary-key'>
            {entityDef.primaryKey ? primaryKeyValue : props.item.uri}
        </Link>
      </div>
      <div className={styles.snippet} data-cy='snipped'>
        {props.item.matches.length === 1
          ?
          props.item.matches[0]['match-text'][0].length > 1 && props.item.matches[0]['match-text'][0]
          :
          {snippet}
        }
      </div>
      <div className={styles.metadata}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Created On</span>
          <span className={styles.metaValue} data-cy='created-on'>{dateConverter(createdOnVal)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Sources</span>
          <span className={styles.metaValue} data-cy='sources'>{sourcesVal}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>File Type</span>
          <span className={styles.format} data-cy='file-type'>{fileTypeVal}</span>
        </div>
      </div>
    </div>
  )
}

export default withRouter(SearchResult);
