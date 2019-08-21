import React from 'react';
import { Link } from 'react-router-dom';
import { List } from 'antd';
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
                            title={<Link to="/detail">{"Customer > uri: " + item.uri}</Link>}
                            description={
                                <p>
                                    <label className={styles.label}>Created: </label>{"2019-2019-09-09T12:03:07.665187-07:00-05"}
                                    <label className={styles.label}>&nbsp; &nbsp; Source: </label>{"AdvantageFlow"}
                                    <label className={styles.label}>&nbsp; &nbsp; File Type: </label>{item.format}
                                    <label className={styles.label}>&nbsp; &nbsp; User: </label>{"admin"}
                                    <br />
                                    {"Lorem ipsum dolor sit amet, eos ei utamur scriptorem, omnesque efficiendi interesset vis an. Illud ullum vim te, sit atqui dolore cu, vix te modus lorem sadipscing."}
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
