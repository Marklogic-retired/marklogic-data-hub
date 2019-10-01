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
    const itemEntityName = Object.keys(props.item.extracted.content[1]);
    const itemEntityProperties = Object.values<any>(props.item.extracted.content[1]);
    const entityDef = props.entityDefArray.length && props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
    const primaryKeyValue = entityDef.primaryKey && itemEntityProperties[0][entityDef.primaryKey];

    // result metadata
    // TODO format createdOnVal using momentjs
    const createdOnVal: string = props.item.extracted.content[0].headers.createdOn.toString().substring(0, 19);
    const sourcesVal: string = props.item.extracted.content[0].headers.sources.map(src => {
        return src.name;
    }).join(', ');
    const fileTypeVal: string = props.item.format;

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
            <div className={styles.title}>
                <span className={styles.entityName}>{itemEntityName}</span>
                {entityDef.primaryKey && <span className={styles.primaryKey}>{entityDef.primaryKey}:</span>}
                <Link to={{
                    pathname: `/detail/${props.item.uri.startsWith('/') && props.item.uri.substring(1)}`,
                    state: { uri: props.item.uri, database: "data-hub-FINAL" }
                }}
                >
                    {entityDef.primaryKey ? primaryKeyValue : props.item.uri}
                </Link>
            </div>
            <div className={styles.snippet}>
                {props.item.matches.length === 1
                    ?
                    props.item.matches[0]['match-text'][0].length > 1 && props.item.matches[0]['match-text'][0]
                    :
                    snippet
                }
            </div>
            <div className={styles.metadata}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Created On</span>
                    <span className={styles.metaValue}>{dateConverter(createdOnVal)}</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Sources</span>
                    <span className={styles.metaValue}>{sourcesVal}</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>File Type</span>
                    <span className={styles.format}>{fileTypeVal}</span>
                </div>
            </div>
        </div>
    )
}

export default withRouter(SearchResult);
