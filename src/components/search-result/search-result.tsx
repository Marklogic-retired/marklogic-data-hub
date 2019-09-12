import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import styles from './search-result.module.scss';

const SearchResult = (props) => {

    return (
        <div>
            <div className={styles.title}>
                <span className={styles.entityName}>Customer</span>
                <Link to={{ 
                    pathname: "/detail", 
                    state: { uri: props.item.uri, database: "data-hub-FINAL" }}}
                >
                    {props.item.uri}
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
                    <span className={styles.metaValue}>JSON</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>User</span>
                    <span className={styles.metaValue}>admin</span>
                </div>
            </div>
        </div>
    )
}

export default withRouter(SearchResult);
