import React, {useContext} from "react";
import {Modal} from "react-bootstrap";
import {SearchContext} from "@util/search-context";
import {UserContext} from "@util/user-context";
import axios from "axios";
import {QueryOptions} from "../../../../types/query-types";
import {HCButton, HCModal} from "@components/common";

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
      const response = await axios.get(`/api/entitySearch/savedQueries/query`, {params: {id: key.savedQuery.id}});
      if (response.data) {
        let options: QueryOptions = {
          searchText: response.data.savedQuery.query.searchText,
          entityTypeIds: response.data.savedQuery.query.entityTypeIds,
          selectedFacets: response.data.savedQuery.query.selectedFacets,
          selectedQuery: searchOptions.selectedQuery,
          propertiesToDisplay: response.data.savedQuery.propertiesToDisplay,
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
      <HCModal
        show={true}
        onHide={onCancel}
      >
        <Modal.Header className={"bb-none"}>
          <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
        </Modal.Header>
        <Modal.Body className={"pt-0 px-4"}>
          <p data-testid="discard-changes-message">Are you sure you want to discard all changes made to <strong>{searchOptions.selectedQuery}?</strong></p>
          <div className={"d-flex justify-content-center pt-4 pb-2"}>
            <HCButton id={"discard-no-button"} className={"me-2"} variant="outline-light" aria-label={"No"} onClick={onCancel}>
              {"No"}
            </HCButton>
            <HCButton id={"discard-yes-button"} aria-label={"Yes"} variant="primary" type="submit" onClick={onOk}>
              {"Yes"}
            </HCButton>
          </div>
        </Modal.Body>
      </HCModal>
    </>
  );
};

export default DiscardChangesModal;
