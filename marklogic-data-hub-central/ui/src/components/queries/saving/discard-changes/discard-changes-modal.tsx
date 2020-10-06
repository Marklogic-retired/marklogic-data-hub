import React, { useContext } from 'react';
import { Modal } from 'antd';
import { SearchContext } from "../../../../util/search-context";
import { UserContext } from "../../../../util/user-context";
import axios from "axios";
import { QueryOptions } from '../../../../types/query-types';

interface Props {
    setDiscardChangesModalVisibility: () => void;
    savedQueryList: any[];
    toggleApply: (clicked: boolean) => void;
    toggleApplyClicked: (clicked: boolean) => void;
}

const DiscardChangesModal: React.FC<Props> = (props) => {

    const {
        applySaveQuery,
        clearAllGreyFacets,
        searchOptions
    } = useContext(SearchContext);

    const {
        handleError
    } = useContext(UserContext);


    const onCancel = () => {
        props.setDiscardChangesModalVisibility();
    };

    const onOk = () => {
        for (let key of props.savedQueryList) {
            if (key.savedQuery.name === searchOptions.selectedQuery) {
                getSaveQueryWithId(key);
                break;
            }
        }
    };

    const getSaveQueryWithId = async (key) => {
        try {
            const response = await axios.get(`/api/entitySearch/savedQueries/query`, { params: { id: key.savedQuery.id } });
            if (response.data) {
                let options: QueryOptions = {
                    searchText: response.data.savedQuery.query.searchText,
                    entityTypeIds: response.data.savedQuery.query.entityTypeIds,
                    selectedFacets: response.data.savedQuery.query.selectedFacets,
                    selectedQuery: searchOptions.selectedQuery,
                    propertiesToDisplay: response.data.savedQuery.propertiesToDisplay,
                    zeroState: searchOptions.zeroState,
                    manageQueryModal: searchOptions.manageQueryModal,
                    sortOrder: response.data.savedQuery.sortOrder,
                    database: searchOptions.database,
                };
                applySaveQuery(options);
                clearAllGreyFacets();
            }
            props.setDiscardChangesModalVisibility();
            props.toggleApplyClicked(true);
            props.toggleApply(false);
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <>
            <Modal
                visible={true}
                title={'Confirmation'}
                onCancel={() => onCancel()}
                onOk={() => onOk()}
                okButtonProps={{ id: 'discard-yes-button', htmlType: 'submit' }}
                okText={'Yes'}
                cancelText={'No'}
                cancelButtonProps={{ id: 'discard-no-button' }}
            >
                <p>Are you sure you want to discard all changes made to <strong>{searchOptions.selectedQuery} ?</strong></p>
            </Modal>
        </>
    );
};

export default DiscardChangesModal;


