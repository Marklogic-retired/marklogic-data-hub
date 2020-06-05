import React, { useContext } from 'react';
import { Modal} from 'antd';
import { SearchContext } from "../../../../util/search-context";
import { UserContext } from "../../../../util/user-context";
import axios from "axios";

interface Props {
    setDiscardChangesModalVisibility: () => void;
    savedQueryList: any[];
    toggleApply: (clicked:boolean) => void;
    toggleApplyClicked: (clicked:boolean) => void;
}

const DiscardChangesModal: React.FC<Props> = (props) => {

    const {
        applySaveQuery,
        clearAllGreyFacets,
        searchOptions
    } = useContext(SearchContext);

    const {
        handleError,
        resetSessionTime
    } = useContext(UserContext);


    const onCancel = () => {
        props.setDiscardChangesModalVisibility();
    }

    const onOk = () => {
        for(let key of props.savedQueryList)
        {
            if(key.savedQuery.name === searchOptions.selectedQuery){
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
            const response = await axios.get(`/api/entitySearch/savedQueries/query`, {params: {id: key.savedQuery.id}});
            if (response.data) {
                searchText = response.data.savedQuery.query.searchText;
                entityTypeIds = response.data.savedQuery.query.entityTypeIds;
                selectedFacets = response.data.savedQuery.query.selectedFacets;
                applySaveQuery(searchText, entityTypeIds, selectedFacets, searchOptions.selectedQuery, response.data.savedQuery.propertiesToDisplay);
                clearAllGreyFacets();
            }
            props.setDiscardChangesModalVisibility();
            props.toggleApplyClicked(true);
            props.toggleApply(false);
        } catch (error) {
            handleError(error)
        } finally {
            resetSessionTime();
        }
    }

    return (
        <>
        <Modal
            visible={true}
            title={'Confirmation'}
            onCancel={() => onCancel()}
            onOk={() => onOk()}
            okButtonProps={{ id:'discard-yes-button', htmlType: 'submit' }}
            okText={'Yes'}
            cancelText={'No'}
            cancelButtonProps={{id:'discard-no-button'}}
        >
            <p>Are you sure you want to discard all changes made to <strong>{searchOptions.selectedQuery} ?</strong></p>
        </Modal>
        </>
    )
}

export default DiscardChangesModal;


