import React from 'react';
import { Link } from 'react-router-dom';
import { List } from 'antd';
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
                        <List.Item.Meta
                            title={<Link to="/detail" style={{ color: 'black', fontWeight: 'bold' }}>{item.collection + " > id: " + item.id}</Link>} 
                            description={
                                <p>
                                    <label className={styles.label}>Created: </label>{item.created} 
                                    <label className={styles.label}>&nbsp; &nbsp; Source: </label>{item.source}
                                    <label className={styles.label}>&nbsp; &nbsp; File Type: </label>{item.fileType}
                                    <label className={styles.label}>&nbsp; &nbsp; User: </label>{item.user}
                                    <br />
                                    <label className={styles.label}>Content: </label>{item.content}
                                </p>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    )
}

export default SearchResults;
