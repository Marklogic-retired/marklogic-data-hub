import React from 'react';
import { List, Descriptions } from 'antd';
import SearchResult from '../search-result/search-result';
import styles from './search-results.module.scss';

type Props = {
    data: any[];
};

const SearchResults:React.FC<Props> = (props) => {

    return (
        <div className={styles.searchResultsContainer}>
            <List
                itemLayout="horizontal"
                dataSource={props.data}
                renderItem={item => (
                    <List.Item>
                        <SearchResult
                            item={item}
                        />
                    </List.Item>
                )}
            />
        </div>
    )
}

export default SearchResults;
