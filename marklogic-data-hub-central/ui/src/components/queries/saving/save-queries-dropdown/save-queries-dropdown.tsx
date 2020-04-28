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
        searchOptions,
        setSelectedQuery,
        setAllSearchFacets
    } = useContext(SearchContext);

    const savedQueryOptions = props.savedQueryList.map((key) => key.savedQuery.name);

    const options = savedQueryOptions.map((query, index) =>
        <Option value={query} key={index+1}>{query}</Option>
    );

    const onItemSelect = (e) => {
        setSelectedQuery(e)
        props.setCurrentQueryName(e)

        for(let key of props.savedQueryList)
        {
            if(key.savedQuery.name === e){
                getSaveQueryWithId(key);
                break;
            }
        }
        props.setSaveNewIconVisibility(false)
    }

    useEffect(() => {
        if (props.currentQueryName !== searchOptions.selectedQuery) {
            setSelectedQuery(props.currentQueryName)
        }
    });

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
                applySaveQuery(searchText, entityTypeIds, selectedFacets);
                props.setCurrentQueryFn(key);
                if(props.greyFacets.length > 0){
                    clearAllGreyFacets();
                }
                setAllSearchFacets(selectedFacets);
                props.toggleApply(false);
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
            value={searchOptions.selectedQuery}
        >
            {options}
        </Select>
    );
}

export default SaveQueriesDropdown;
