import React from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import styles from './search-result.module.scss';

interface Props extends RouteComponentProps {
  item: any;
  entityDefArray:any[];
};

const SearchResult:React.FC<Props> = (props) => {
  const itemEntityName = Object.keys(props.item.extracted.content[1]);
  const itemEntityProperties = Object.values<any>(props.item.extracted.content[1]);
  const entityDef = props.entityDefArray.length && props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
  const primaryKeyValue = entityDef.primaryKey && itemEntityProperties[0][entityDef.primaryKey];

    return (
        <div>
            <div className={styles.title}>
                <span className={styles.entityName}>{itemEntityName}</span>
                {entityDef.primaryKey && <span className={styles.primaryKey}>{entityDef.primaryKey}:</span> }
                <Link to={{ 
                    pathname: `/detail/${props.item.uri.startsWith('/') && props.item.uri.substring(1)}`, 
                    state: { uri: props.item.uri, database: "data-hub-FINAL" }}}
                >
                    {entityDef.primaryKey ? primaryKeyValue : props.item.uri}
                </Link>
            </div>
            <div className={styles.snippet}>
                { props.item.matches // TODO return snippets in results
                  ? props.item.matches[0]['match-text'][0].length > 1 && props.item.matches[0]['match-text'][0]
                  : ''
                }
            </div>
            <div className={styles.metadata}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Created</span>
                    <span className={styles.metaValue}>2019-09-01 11:01:23</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Sources</span>
                    <span className={styles.metaValue}>AdvantageFlow</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>File Type</span>
                    <span className={styles.format}>{props.item.format}</span>
                </div>
            </div>
        </div>
    )
}

export default withRouter(SearchResult);
