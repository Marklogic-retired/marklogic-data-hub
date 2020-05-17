import {Select, Input} from "antd"
import React, {useContext, useEffect, useState} from 'react';
import styles from './save-queries-dropdown.module.scss';
import { UserContext } from "../../../../util/user-context";
import { SearchContext } from "../../../../util/search-context";
import {fetchQueryById} from "../../../../api/queries";


interface Props {
    savedQueryList: any[];
    toggleApply: (clicked:boolean) => void;
    greyFacets: any[];
    currentQueryName: string;
    setCurrentQueryName: (name: string) => void;
    setCurrentQueryFn: (query:object) => void;
    currentQuery: any;
    setSaveNewIconVisibility:(visibility:boolean)=> void;
    setSaveChangesIconVisibility:(visibility:boolean)=> void;
    setDiscardChangesIconVisibility:(visibility:boolean)=> void;
    currentQueryDescription: string;
    setCurrentQueryDescription: (description: string) => void;
};


const SaveQueriesDropdown: React.FC<Props> = (props) => {

    const {Option} = Select;

    const {
        handleError,
        resetSessionTime
    } = useContext(UserContext);
    const {
        applySaveQuery,
        clearAllGreyFacets,
        searchOptions
    } = useContext(SearchContext);

    const savedQueryOptions = props.savedQueryList.map((key) => key.savedQuery.name);

    const options = savedQueryOptions.map((query, index) =>
        <Option value={query} key={index+1} data-cy="query-option">{query}</Option>
    );

    const onItemSelect = (e) => {
        props.setCurrentQueryName(e);

        for(let key of props.savedQueryList)
        {
            if(key.savedQuery.name === e){
                getSaveQueryWithId(key);
                break;
            }
        }
        props.setSaveNewIconVisibility(false);
        props.setDiscardChangesIconVisibility(false);
        props.setSaveChangesIconVisibility(false);
    };

    const getSaveQueryWithId = async (key) => {
        let searchText:string = '';
        let entityTypeIds:string[] = [];
        let selectedFacets:{} = {};
        try {
            const response = await fetchQueryById(key);
            if (response.data) {
                searchText = response.data.savedQuery.query.searchText;
                entityTypeIds = response.data.savedQuery.query.entityTypeIds;
                selectedFacets = response.data.savedQuery.query.selectedFacets;
                applySaveQuery(searchText, entityTypeIds, selectedFacets, response.data.savedQuery.name);
                props.setCurrentQueryFn(key);
                if(props.greyFacets.length > 0){
                    clearAllGreyFacets();
                }
                props.toggleApply(false);
                props.setCurrentQueryDescription(response.data.savedQuery.description);
            }
        } catch (error) {
            handleError(error)
        } finally {
            resetSessionTime()
        }
    }


    return (
        <Select
            id="dropdownList"
            placeholder={'select a query'}
            className={styles.dropDownStyle}
            onChange={onItemSelect}
            data-cy={'drop-down-list'}
            allowClear={true}
            value={(() => {
                    if(props.currentQueryName !== searchOptions.selectedQuery && props.currentQueryName === 'select a query') {
                        onItemSelect(searchOptions.selectedQuery);
                    }
                    return searchOptions.selectedQuery;
                })()
            }
        >
            {options}
        </Select>
    );
}

export default SaveQueriesDropdown;
