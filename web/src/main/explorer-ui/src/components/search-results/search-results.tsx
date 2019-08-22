import React from 'react';
import { Link } from 'react-router-dom';
import { List, Descriptions } from 'antd';
import styles from './search-results.module.scss';

type Props = {
    data: any[];
};

const SearchResults:React.FC<Props> = (props) => {
    console.log(props.data);

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
                                <Descriptions column={2}>
                                    <Descriptions.Item label="Created" className={styles.label}>2019-09-09T12:03:07.665187-07:00</Descriptions.Item>
                                    <Descriptions.Item label="Source" className={styles.label}>AdvantageFlow</Descriptions.Item>
                                    <Descriptions.Item label="File Type" className={styles.label}>{item.format}</Descriptions.Item>
                                    <Descriptions.Item label="User" className={styles.label}>admin</Descriptions.Item>
                                    <Descriptions.Item span={2}>Lorem ipsum dolor sit amet, eos ei utamur scriptorem, omnesque efficiendi interesset vis an. Illud ullum vim te, sit atqui dolore cu, vix te modus lorem sadipscing.</Descriptions.Item>
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
