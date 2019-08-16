import React from 'react';
import { List } from 'antd';
import styles from './search-results.module.scss';

const SearchResults = () => {

    const data = [
        {
            collection: 'Customer',
            id: 123,
            detail: 'AdvantageFlow 2019-09-09 John Smith'
        },
        {
            collection: 'Customer',
            id: 234,
            detail: 'AdvantageFlow 2019-06-19 Mary Lou'
        },
        {
            collection: 'MapCust',
            id: 1002,
            detail: 'BedrockFlow 2005-03-22 Some data here...'
        },
        {
            collection: 'Product',
            id: 342,
            detail: 'ProdFlow 2009-03-12 Andrew Deer'
        },
        {
            collection: 'Product',
            id: 5678,
            detail: 'TestFlow 2019-09-09 Test test test'
        },
        {
            collection: 'Customer',
            id: 9008,
            detail: 'AdvantageFlow 2019-11-13 DeAndre Gold'
        },
        {
            collection: 'MapProd',
            id: 2377,
            detail: 'Prod2Flow 2013-05-30 This is the product for ...'
        },
        {
            collection: 'Product',
            id: 4566,
            detail: 'MyProdFlow 2014-03-02 Air Conditioned'
        },
        {
            collection: 'Customer',
            id: 123,
            detail: 'AdvantageFlow 2019-09-11 Stephanie Lauire'
        },
        {
            collection: 'MapCust',
            id: 123,
            detail: 'MappingCustFlow 2014-03-23 Mapping to be done here ...'
        }
      ];

    return (
        <div className={styles.searchResultsContainer}>
            <List
                itemLayout="horizontal"
                dataSource={data}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            title={<a href="/detail">{item.collection} > id: {item.id}</a>}
                            description={item.detail}
                        />
                    </List.Item>
                )}
            />
        </div>
    )
}

export default SearchResults;
