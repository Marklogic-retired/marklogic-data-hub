import {Select} from "antd"
import React, {useContext, useEffect, useState} from 'react';
import styles from './save-queries-dropdown.module.scss';
import { UserContext } from "../../../../util/user-context";
import { SearchContext } from "../../../../util/search-context";
import {fetchQueryById} from "../../../../api/queries";


interface Props {
    savedQueryList: any[];
    toggleApply: (clicked:boolean) => void;
    greyFacets: any[];
};


const SaveQueriesDropdown: React.FC<Props> = (props) => {

    const {Option} = Select;
    const [dropDownDefaultVal, setDropDownDefaultVal] = useState('select a query');

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
        <Option value={query} key={index+1}>{query}</Option>
    );

    const onItemSelect = (e) => {
        setDropDownDefaultVal(e)
        for(let key of props.savedQueryList)
        {
            if(key.savedQuery.name === e){
                getSaveQueryWithId(key);
                break;
            }
        }
    }

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
                if(props.greyFacets.length > 0){
                    clearAllGreyFacets();
                }
                props.toggleApply(false);
            }
        } catch (error) {
            handleError(error)
        } finally {
            resetSessionTime()
        }
    }

    useEffect(() => {
        if (Object.entries(searchOptions.selectedFacets).length == 0)
            setDropDownDefaultVal('select a query');
    }, [searchOptions.selectedFacets])

    return (
        <Select
            id="dropdownList"
            placeholder={'select a query'}
            className={styles.dropDownStyle}
            onChange={onItemSelect}
            data-cy={'drop-down-list'}
            allowClear={true}
            value={dropDownDefaultVal}
        >
            {options}
        </Select>
    );
}

export default SaveQueriesDropdown;
