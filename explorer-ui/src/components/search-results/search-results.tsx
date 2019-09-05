import React from 'react';
import { Link } from 'react-router-dom';
import { List, Descriptions } from 'antd';
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
                            title={
                                <Link to={{ pathname: "/detail", state: { uri: item.uri, database: "data-hub-FINAL" }}}>
                                    {"Customer > uri: " + item.uri}
                                </Link>
                            }
                            description={
                                <Descriptions column={4}>
                                    <Descriptions.Item label="Created" className={styles.label}>2019-09-09 12:03:07</Descriptions.Item>
                                    <Descriptions.Item label="Source" className={styles.label}>AdvantageFlow</Descriptions.Item>
                                    <Descriptions.Item label="File Type" className={styles.label}>{item.format}</Descriptions.Item>
                                    <Descriptions.Item label="User" className={styles.label}>admin</Descriptions.Item>
                                    <Descriptions.Item span={4}>{item.matches[0]['match-text'][0]}</Descriptions.Item>
                                </Descriptions>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    )
}

export default SearchResults;
