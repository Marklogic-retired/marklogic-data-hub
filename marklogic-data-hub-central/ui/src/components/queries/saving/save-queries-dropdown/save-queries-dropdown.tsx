import {Select, Modal, Button} from "antd"
import React, {useContext, useState} from 'react';
import styles from './save-queries-dropdown.module.scss';
import { SearchContext } from "../../../../util/search-context";
import { MLButton } from '@marklogic/design-system';

interface Props {
    savedQueryList: any[];
    toggleApply: (clicked:boolean) => void;
    getSaveQueryWithId: (key:string) => void;
    greyFacets: any[];
    currentQueryName: string;
    setCurrentQueryName: (name: string) => void;
    currentQuery: any;
    setSaveNewIconVisibility:(visibility:boolean)=> void;
    setSaveChangesIconVisibility:(visibility:boolean)=> void;
    setDiscardChangesIconVisibility:(visibility:boolean)=> void;
    setSaveChangesModal:(visiblity:boolean) => void;
    setNextQueryName: (name: string) => void;
    isSaveQueryChanged:() => boolean;

};


const SaveQueriesDropdown: React.FC<Props> = (props) => {

    const {Option} = Select;
    const [showConfirmation, toggleConfirmation] = useState(false);


    const {
        searchOptions
    } = useContext(SearchContext);

    const [switchedQueryName, setSwitchedQueryName] = useState(searchOptions.selectedQuery);

    const savedQueryOptions = props.savedQueryList.map((key) => key.savedQuery.name);

    const options = savedQueryOptions.map((query, index) =>
        <Option value={query} key={index+1} data-cy={`query-option-${query}`}>{query}</Option>
    );

    const checkCurrentQueryChange = (e) => {
        if(props.isSaveQueryChanged()){
           toggleConfirmation(true);
           setSwitchedQueryName(e);
       }
       else{
           onItemSelect(e)
       }
    }

    const onItemSelect = (e) => {
        props.setCurrentQueryName(e);
        for(let key of props.savedQueryList)
        {
            if(key.savedQuery.name === e){
                props.getSaveQueryWithId(key);
                break;
            }
        }
        props.setSaveNewIconVisibility(false);
        props.setDiscardChangesIconVisibility(false);
        props.setSaveChangesIconVisibility(false);
     }

    const onNoClick = () => {
        toggleConfirmation(false);
        onItemSelect(switchedQueryName);
    }

    const onCancel = () => {
        toggleConfirmation(false);
    }

    const onOk = () => {
        props.setSaveChangesModal(true);
        toggleConfirmation(false);
        props.setNextQueryName(switchedQueryName);
    }

    return (
        <div>
        <Select
            id="dropdownList"
            placeholder={'select a query'}
            className={styles.dropDownStyle}
            onChange={checkCurrentQueryChange}
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
            <Modal
                visible={showConfirmation}
                title={'Confirmation'}
                onCancel={()=> onCancel()}
                footer={[
                    <MLButton key='cancel' id='query-confirmation-cancel-button' onClick={() => onCancel()}>Cancel</MLButton>,
                    <MLButton key="back" id='query-confirmation-no-button' onClick={() => onNoClick()}>
                        No
                    </MLButton>,
                    <MLButton key="submit" id='query-confirmation-yes-button' type="primary"  onClick={()=> onOk()}>
                        Yes
                    </MLButton>
                ]}>
            <p><strong>{props.currentQueryName}</strong> has been edited since it was last saved.</p>
                <br/>
                <p>Would you like to save the changes to <strong>{props.currentQueryName}</strong> before switching to the new query</p>
            </Modal>
    </div>

    );
}

export default SaveQueriesDropdown;
