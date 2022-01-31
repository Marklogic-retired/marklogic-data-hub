import React, {useState, useEffect, useContext} from "react";
import {ButtonGroup, Dropdown, Modal} from "react-bootstrap";
import {UserContext} from "../../util/user-context";
import {SearchContext} from "../../util/search-context";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faSave, faCopy, faUndo, faWindowClose, faEllipsisV, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import SaveQueryModal from "../../components/queries/saving/save-query-modal/save-query-modal";
import SaveQueriesDropdown from "../../components/queries/saving/save-queries-dropdown/save-queries-dropdown";
import {fetchQueries, creatNewQuery, fetchQueryById, removeQuery} from "../../api/queries";
import styles from "./queries.module.scss";
import EditQueryDetails from "./saving/edit-save-query/edit-query-details";
import SaveChangesModal from "./saving/edit-save-query/save-changes-modal";
import DiscardChangesModal from "./saving/discard-changes/discard-changes-modal";
import {QueryOptions} from "../../types/query-types";
import {HCButton, HCTooltip} from "@components/common";

interface Props {
  queries: any[];
  isSavedQueryUser: boolean;
  columns: string[];
  entities: any[];
  selectedFacets: any[];
  greyFacets: any[];
  isColumnSelectorTouched: boolean;
  entityDefArray: any[];
  setColumnSelectorTouched: (state: boolean) => void;
  setQueries: (state: boolean) => void;
  setIsLoading: (state: boolean) => void;
  database: string;
  setCardView: any;
  cardView: boolean;
  toggleApply: (value: boolean) => void;
  toggleApplyClicked: (value: boolean) => void;
  setCurrentBaseEntities: (entity: any[]) => void;
}

const Query: React.FC<Props> = (props) => {

  const {
    handleError
  } = useContext(UserContext);
  const {
    searchOptions,
    applySaveQuery,
    clearAllGreyFacets,
    setNextEntity,
    setSavedQueries,
    savedQueries
  } = useContext(SearchContext);

  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [openEditDetail, setOpenEditDetail] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<any>({});
  const [showSaveNewIcon, toggleSaveNewIcon] = useState(false);
  const [showSaveChangesIcon, toggleSaveChangesIcon] = useState(false);
  const [openSaveChangesModal, setOpenSaveChangesModal] = useState(false);
  const [showDiscardIcon, toggleDiscardIcon] = useState(false);
  const [openSaveCopyModal, setOpenSaveCopyModal] = useState(false);
  const [openDiscardChangesModal, setOpenDiscardChangesModal] = useState(false);
  const [currentQueryName, setCurrentQueryName] = useState(searchOptions.selectedQuery);
  const [nextQueryName, setNextQueryName] = useState("");
  const [currentQueryDescription, setCurrentQueryDescription] = useState("");
  const [showEntityConfirmation, toggleEntityConfirmation] = useState(false);
  const [entityQueryUpdate, toggleEntityQueryUpdate] = useState(false);
  const [entityCancelClicked, toggleEntityCancelClicked] = useState(false);
  const [resetQueryIcon, setResetQueryIcon] = useState(true); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showResetQueryNewConfirmation, toggleResetQueryNewConfirmation] = useState(false);
  const [showResetQueryEditedConfirmation, toggleResetQueryEditedConfirmation] = useState(false);
  const [deleteModalVisibility, setDeleteModalVisibility] = useState(false);

  const [existingQueryYesClicked, toggleExistingQueryYesClicked] = useState(false);
  const [resetYesClicked, toggleResetYesClicked] = useState(false);

  const saveNewQuery = async (queryName, queryDescription, facets) => {
    let query = {
      savedQuery: {
        id: "",
        name: queryName,
        description: queryDescription,
        query: {
          searchText: searchOptions.query,
          entityTypeIds: searchOptions.entityTypeIds.length ? searchOptions.entityTypeIds : props.entities,
          selectedFacets: facets,
        },
        propertiesToDisplay: searchOptions.selectedTableProperties,
        sortOrder: searchOptions.sortOrder
      }
    };
    props.setIsLoading(true);
    await creatNewQuery(query);
    setOpenSaveModal(false);
    getSaveQueries();
  };

  const getSaveQueries = async () => {
    try {
      if (props.isSavedQueryUser) {
        const response = await fetchQueries();
        if (response.data) {
          props.setQueries(response.data);
          setSavedQueries(response.data);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };


  const deleteQuery = async () => {
    try {
      await removeQuery(currentQuery);
    } catch (error) {
      handleError(error);
    }
    getSaveQueries();
  };
  const onDeleteQuery = () => {
    setDeleteModalVisibility(true);
  };
  const onDeleteOk = () => {
    deleteQuery();
    resetIconClicked();
    setDeleteModalVisibility(false);
  };
  const menu = (<div className={styles.menuContainer}>
    {props.isSavedQueryUser && searchOptions.selectedQuery !== "select a query" && props.queries.length > 0 &&
      <Dropdown.Item onClick={() => setOpenEditDetail(true)}>
        <span>
          <FontAwesomeIcon icon={faPencilAlt} className={styles.queryMenuItemIcon} />
          Edit query details
        </span>
      </Dropdown.Item>
    }
    {props.isSavedQueryUser && showDiscardIcon && props.queries.length > 0 &&
      <Dropdown.Item onClick={() => setOpenDiscardChangesModal(true)}>
        <span>
          <FontAwesomeIcon icon={faUndo} className={styles.queryMenuItemIcon} />
          Revert query to saved state
        </span>
      </Dropdown.Item>
    }
    {props.isSavedQueryUser && searchOptions.selectedQuery !== "select a query" && props.queries.length > 0 &&
      <Dropdown.Item onClick={() => setOpenSaveCopyModal(true)}>
        <span>
          <FontAwesomeIcon icon={faCopy} className={styles.queryMenuItemIcon} />
          Save query as
        </span>
      </Dropdown.Item>
    }
    <Dropdown.Item onClick={onDeleteQuery}>
      <span style={{color: "#B32424"}}>
        <FontAwesomeIcon icon={faTrashAlt} className={styles.queryMenuItemIcon} />
        Delete query
      </span>
    </Dropdown.Item>
  </div>
  );
  const ellipsisMenu = (
    <Dropdown as={ButtonGroup}>
      <Dropdown.Toggle aria-label="ellipsisButton" className={styles.ellipsisButton}>
        <FontAwesomeIcon className={styles.queryIconsEllipsis} icon={faEllipsisV} size="lg" />
      </Dropdown.Toggle>
      <Dropdown.Menu flip={false} className={styles.dropdownMenu}>
        {menu}
      </Dropdown.Menu>
    </Dropdown>
  );


  const deleteConfirmation = <Modal
    show={deleteModalVisibility}
  >
    <Modal.Header className={"bb-none"}>
      <button type="button" className="btn-close" aria-label="Close" onClick={() => setDeleteModalVisibility(false)}></button>
    </Modal.Header>
    <Modal.Body className={"pt-0 px-4"}>
      <span style={{fontSize: "16px"}} data-testid="deleteConfirmationText">
        Are you sure you would like to delete the <b>{currentQueryName}</b> query? This action cannot be undone.
      </span>
      <div className={"d-flex justify-content-center pt-4 pb-2"}>
        <HCButton className={"me-2"} variant="outline-light" aria-label={"No"} onClick={() => setDeleteModalVisibility(false)}>
          {"No"}
        </HCButton>
        <HCButton aria-label={"Yes"} variant="primary" type="submit" onClick={() => onDeleteOk()}>
          {"Yes"}
        </HCButton>
      </div>
    </Modal.Body>
  </Modal>;


  const getSaveQueryWithId = async (key) => {
    try {
      const response = await fetchQueryById(key);
      if (props.isSavedQueryUser) {
        if (response.data) {
          let options: QueryOptions = {
            searchText: response.data.savedQuery.query.searchText,
            entityTypeIds: response.data.savedQuery.query.entityTypeIds,
            selectedFacets: response.data.savedQuery.query.selectedFacets,
            selectedQuery: response.data.savedQuery.name,
            propertiesToDisplay: response.data.savedQuery.propertiesToDisplay,
            sortOrder: response.data.savedQuery.sortOrder,
            database: searchOptions.database,
          };
          applySaveQuery(options);
          setCurrentQuery(response.data);
          if (props.greyFacets.length > 0) {
            clearAllGreyFacets();
          }
          props.toggleApply(false);
          if (response.data.savedQuery.hasOwnProperty("description") && response.data.savedQuery.description) {
            setCurrentQueryDescription(response.data.savedQuery.description);
          } else {
            setCurrentQueryDescription("");
          }
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const isSaveQueryChanged = () => {
    if (currentQuery && currentQuery.hasOwnProperty("savedQuery") && currentQuery.savedQuery.hasOwnProperty("query")) {
      if (currentQuery.savedQuery.name !== searchOptions.selectedQuery) {
        if (Array.isArray(savedQueries) === false) {
          if (savedQueries.savedQuery.name === searchOptions.selectedQuery) {
            setCurrentQuery(savedQueries.savedQuery);
            setCurrentQueryName(savedQueries.savedQuery.name);
            setCurrentQueryDescription(savedQueries.savedQuery.description);
          }
        } else {
          for (let key of savedQueries) {
            if (key.savedQuery.name === searchOptions.selectedQuery) {
              setCurrentQuery(key);
              setCurrentQueryName(key.savedQuery.name);
              setCurrentQueryDescription(key.savedQuery.description);
            }
          }
        }
      }
      if ((
        (JSON.stringify(currentQuery.savedQuery.query.selectedFacets) !== JSON.stringify(searchOptions.selectedFacets)) ||
        (currentQuery.savedQuery.query.searchText !== searchOptions.query) ||
        (JSON.stringify(currentQuery.savedQuery.sortOrder) !== JSON.stringify(searchOptions.sortOrder)) ||
        (JSON.stringify(currentQuery.savedQuery.propertiesToDisplay) !== JSON.stringify(searchOptions.selectedTableProperties)) ||
        (props.greyFacets.length > 0) || props.isColumnSelectorTouched) &&
        searchOptions.selectedQuery !== "select a query") {
        return true;
      }
    }
    return false;
  };

  const isNewQueryChanged = () => {
    if (currentQuery && Object.keys(currentQuery).length === 0) {
      if (props.isSavedQueryUser && searchOptions.entityTypeIds.length > 0 &&
        (props.selectedFacets.length > 0 || searchOptions.query.length > 0
          || searchOptions.sortOrder.length > 0 || props.isColumnSelectorTouched)
        && searchOptions.selectedQuery === "select a query") {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    setCurrentQuery({});
  }, [searchOptions.database]);

  useEffect(() => {
    if (props.queries.length > 0) {
      for (let key of props.queries) {
        if (key.savedQuery.name === currentQueryName) {
          setCurrentQuery(key);
          // setCurrentQueryDescription(key['savedQuery']['description']);
        }
      }
    }
  }, [props.queries]);

  useEffect(() => {
    if (!searchOptions.relatedToData) {
      getSaveQueries();
    }
  }, [searchOptions.entityTypeIds]);

  useEffect(() => {
    props.setQueries(savedQueries);
  }, [savedQueries]);

  useEffect(() => {
    if (savedQueries && savedQueries.length > 0) {
      for (let key of savedQueries) {
        if (key.savedQuery.name === currentQueryName) {
          setCurrentQuery(key);
        }
      }
    }
    if (searchOptions.selectedQuery === "select a query") {
      setCurrentQueryDescription("");
    }
  }, [savedQueries]);


  useEffect(() => {
    if (searchOptions.nextEntityType === "All Entities" && !entityCancelClicked && searchOptions.entityTypeIds.length > 1 && searchOptions.selectedQuery !== "select a query") {
      // TO CHECK IF THERE HAS BEEN A CANCEL CLICKED WHILE CHANGING ENTITY
      if ((searchOptions.entityTypeIds.length > 1 || isSaveQueryChanged() || isNewQueryChanged())) {
        toggleEntityConfirmation(true);
      } else {
        setCurrentQueryOnEntityChange();
      }
    } else {
      toggleEntityCancelClicked(false); // RESETTING THE STATE TO FALSE
    }
  }, [searchOptions.nextEntityType]);

  // Switching between entity confirmation modal buttons
  const onCancel = () => {
    toggleEntityConfirmation(false);
    toggleEntityCancelClicked(true);
    setNextEntity(searchOptions.entityTypeIds[0]);
  };

  const onNoClick = () => {
    toggleEntityConfirmation(false);
    setCurrentQueryOnEntityChange();
  };

  const onOk = () => {
    if (Object.keys(currentQuery).length === 0) {
      toggleEntityConfirmation(false);
      toggleExistingQueryYesClicked(true);
      setOpenSaveModal(true);
    } else {
      setOpenSaveChangesModal(true);
      toggleEntityConfirmation(false);
      toggleEntityQueryUpdate(true);
    }
  };

  const setCurrentQueryOnEntityChange = () => {
    toggleSaveNewIcon(false);
    props.setColumnSelectorTouched(false);
    setCurrentQuery({});
    setCurrentQueryName("select a query");
    setCurrentQueryDescription("");
  };

  // Reset confirmation modal buttons when making changes to saved query
  const onResetCancel = () => {
    toggleResetQueryNewConfirmation(false);
    toggleResetQueryEditedConfirmation(false);
  };

  const onResetOk = () => {
    if (showResetQueryNewConfirmation) {
      setOpenSaveModal(true);
      toggleResetYesClicked(true);
    } else {
      setOpenSaveChangesModal(true);
      toggleResetYesClicked(true);
    }
    toggleResetQueryNewConfirmation(false);
    toggleResetQueryEditedConfirmation(false);
  };

  const onNoResetClick = () => {
    const {entityDefArray, setCurrentBaseEntities} = props;
    let options: QueryOptions = {
      searchText: "",
      entityTypeIds: [],
      selectedFacets: {},
      selectedQuery: "select a query",
      propertiesToDisplay: [],
      sortOrder: [],
      database: "final",
    };
    if (entityDefArray.length > 0) {
      const entitiesTitles = entityDefArray.map(entity => entity.name);
      options.entityTypeIds = entitiesTitles;
    }
    applySaveQuery(options);
    if (entityDefArray.length > 0) setCurrentBaseEntities(entityDefArray);
    toggleResetQueryEditedConfirmation(false);
    toggleResetQueryNewConfirmation(false);
    props.setColumnSelectorTouched(false);
  };

  const resetIconClicked = () => {
    const {entityDefArray, setCurrentBaseEntities} = props;
    const resetQueryEditedConfirmation = props.isSavedQueryUser && props.queries.length > 0
      && searchOptions.selectedQuery !== "select a query" && isSaveQueryChanged();
    const resetQueryNewConfirmation = props.isSavedQueryUser && props.queries.length > 0 && searchOptions.entityTypeIds.length > 0 &&
      (props.selectedFacets.length > 0 || searchOptions.query.length > 0
        || searchOptions.sortOrder.length > 0)
      && searchOptions.selectedQuery === "select a query";
    if (resetQueryNewConfirmation) {
      toggleResetQueryNewConfirmation(true);
    } else if (resetQueryEditedConfirmation) {
      toggleResetQueryEditedConfirmation(true);
    } else {
      let options: QueryOptions = {
        searchText: "",
        entityTypeIds: [],
        selectedFacets: {},
        selectedQuery: "select a query",
        propertiesToDisplay: [],
        sortOrder: [],
        database: "final",
      };
      if (entityDefArray.length > 0) {
        const entitiesTitles = entityDefArray.map(entity => entity.name);
        options.entityTypeIds = entitiesTitles;
      }
      applySaveQuery(options);
      if (entityDefArray.length > 0) setCurrentBaseEntities(entityDefArray);
      clearAllGreyFacets();
    }
  };

  useEffect(() => {
    if (Object.entries(currentQuery).length !== 0 && searchOptions.selectedQuery !== "select a query") {
      setCurrentQueryName(currentQuery.hasOwnProperty("name") ? currentQuery["name"] : currentQuery["savedQuery"]["name"]);
      setCurrentQueryDescription(currentQuery.hasOwnProperty("description") ? currentQuery["description"] : currentQuery["savedQuery"]["description"]);
    } else {
      setCurrentQueryDescription("");
    }
  }, [currentQuery]);


  useEffect(() => {
    if (isSaveQueryChanged() && searchOptions.selectedQuery !== "select a query") {
      toggleSaveChangesIcon(true);
      toggleDiscardIcon(true);
      toggleSaveNewIcon(false);
    } else {
      toggleSaveChangesIcon(false);
      toggleDiscardIcon(false);
      toggleSaveNewIcon(true);
    }

  }, [searchOptions, props.greyFacets, isSaveQueryChanged()]);

  return (
    <>
      <div>
        {props.cardView === false && <div>
          <div className={styles.queryBar}>
            <div className={styles.saveDropdown}>
              {props.queries.length > 0 &&
                <SaveQueriesDropdown
                  savedQueryList={props.queries}
                  setSaveNewIconVisibility={(visibility) => toggleSaveNewIcon(visibility)}
                  greyFacets={props.greyFacets}
                  toggleApply={(clicked) => props.toggleApply(clicked)}
                  currentQueryName={currentQueryName}
                  setCurrentQueryName={setCurrentQueryName}
                  currentQuery={currentQuery}
                  setSaveChangesIconVisibility={(visibility) => toggleSaveChangesIcon(visibility)}
                  setDiscardChangesIconVisibility={(visibility) => toggleDiscardIcon(visibility)}
                  setSaveChangesModal={(visiblity) => setOpenSaveChangesModal(visiblity)}
                  setNextQueryName={(nextQueryName) => setNextQueryName(nextQueryName)}
                  getSaveQueryWithId={getSaveQueryWithId}
                  isSaveQueryChanged={isSaveQueryChanged}
                />
              }
            </div>

            <div className={styles.iconBar}>
              {(props.selectedFacets.length > 0 || searchOptions.query
                || props.isColumnSelectorTouched || searchOptions.sortOrder.length > 0) &&
                showSaveNewIcon && searchOptions.entityTypeIds?.length === 1 && searchOptions.selectedQuery === "select a query" &&
                <div>
                  <HCTooltip text={props.isSavedQueryUser ? "Save the current query" : "Save Query: Contact your security administrator to get the roles and permissions to access this functionality"} id="save-current-query-tooltip" placement="top">
                    <i><FontAwesomeIcon
                      icon={faSave}
                      onClick={props.isSavedQueryUser ? () => setOpenSaveModal(true) : () => setOpenSaveModal(false)}
                      className={props.isSavedQueryUser ? styles.enabledSaveIcon : styles.disabledSaveIcon}
                      data-testid="save-modal"
                      size="lg"
                      style={{width: "15px", color: "#5b69af", cursor: "pointer"}}
                    /></i>
                  </HCTooltip>
                  <div id={"savedQueries"}>
                    {openSaveModal &&
                      <SaveQueryModal
                        setSaveModalVisibility={() => setOpenSaveModal(false)}
                        setSaveNewIconVisibility={(visibility) => toggleSaveNewIcon(visibility)}
                        saveNewQuery={saveNewQuery}
                        greyFacets={props.greyFacets}
                        toggleApply={(clicked) => props.toggleApply(clicked)}
                        toggleApplyClicked={(clicked) => props.toggleApplyClicked(clicked)}
                        currentQueryName={currentQueryName}
                        setCurrentQueryName={setCurrentQueryName}
                        currentQueryDescription={currentQueryDescription}
                        setCurrentQueryDescription={setCurrentQueryDescription}
                        resetYesClicked={resetYesClicked}
                        setColumnSelectorTouched={props.setColumnSelectorTouched}
                        existingQueryYesClicked={existingQueryYesClicked}
                      />}
                  </div>
                </div>}

              {props.isSavedQueryUser && showSaveChangesIcon && props.queries.length > 0 &&
                <div>
                  <HCTooltip text="Save changes" id="save-changes-tooltip" placement="top">
                    <i><FontAwesomeIcon
                      icon={faSave}
                      className={styles.iconHover}
                      title="save-changes"
                      onClick={() => setOpenSaveChangesModal(true)}
                      data-testid="save-changes-modal"
                      size="lg"
                      style={{width: "15px", color: "#5b69af", cursor: "pointer"}}
                    /></i>
                  </HCTooltip>
                  <div id={"saveChangedQueries"}>
                    {openSaveChangesModal &&
                      <SaveChangesModal
                        entityDefArray={props.entityDefArray}
                        setSaveChangesModalVisibility={() => setOpenSaveChangesModal(false)}
                        setSaveNewIconVisibility={(visibility) => toggleSaveNewIcon(visibility)}
                        greyFacets={props.greyFacets}
                        toggleApply={(clicked) => props.toggleApply(clicked)}
                        toggleApplyClicked={(clicked) => props.toggleApplyClicked(clicked)}
                        currentQuery={currentQuery}
                        currentQueryName={currentQueryName}
                        setCurrentQueryDescription={(description) => setCurrentQueryDescription(description)}
                        setCurrentQueryName={(name) => setCurrentQueryName(name)}
                        nextQueryName={nextQueryName}
                        savedQueryList={props.queries}
                        setCurrentQueryOnEntityChange={setCurrentQueryOnEntityChange}
                        getSaveQueryWithId={(key) => getSaveQueryWithId(key)}
                        isSaveQueryChanged={isSaveQueryChanged}
                        entityQueryUpdate={entityQueryUpdate}
                        toggleEntityQueryUpdate={() => toggleEntityQueryUpdate(false)}
                        resetYesClicked={resetYesClicked}
                        setColumnSelectorTouched={props.setColumnSelectorTouched}
                      />}
                  </div>
                </div>}
              {searchOptions.selectedQuery !== "select a query" &&
                <div>{ellipsisMenu}</div>
              }
              {
                deleteConfirmation
              }
              {props.isSavedQueryUser && showDiscardIcon && props.queries.length > 0 &&
                <div>
                  {openDiscardChangesModal &&
                    <DiscardChangesModal
                      setDiscardChangesModalVisibility={() => setOpenDiscardChangesModal(false)}
                      savedQueryList={props.queries}
                      toggleApply={(clicked) => props.toggleApply(clicked)}
                      toggleApplyClicked={(clicked) => props.toggleApplyClicked(clicked)}
                    />}
                </div>}

              {props.isSavedQueryUser && searchOptions.selectedQuery !== "select a query" && props.queries.length > 0 &&
                <div>
                  {openEditDetail &&
                    <EditQueryDetails
                      setEditQueryDetailVisibility={() => setOpenEditDetail(false)}
                      currentQuery={currentQuery}
                      currentQueryName={currentQueryName}
                      setCurrentQueryName={setCurrentQueryName}
                      currentQueryDescription={currentQueryDescription}
                      setCurrentQueryDescription={setCurrentQueryDescription}
                    />
                  }
                </div>}
              {props.isSavedQueryUser && searchOptions.selectedQuery !== "select a query" && props.queries.length > 0 &&
                <div>
                  {openSaveCopyModal &&
                    <SaveQueryModal
                      setSaveModalVisibility={() => setOpenSaveCopyModal(false)}
                      setSaveNewIconVisibility={(visibility) => toggleSaveNewIcon(visibility)}
                      saveNewQuery={saveNewQuery}
                      greyFacets={props.greyFacets}
                      toggleApply={(clicked) => props.toggleApply(clicked)}
                      toggleApplyClicked={(clicked) => props.toggleApplyClicked(clicked)}
                      currentQueryName={currentQueryName}
                      setCurrentQueryName={setCurrentQueryName}
                      currentQueryDescription={currentQueryDescription}
                      setCurrentQueryDescription={setCurrentQueryDescription}
                      resetYesClicked={resetYesClicked}
                      setColumnSelectorTouched={props.setColumnSelectorTouched}
                      existingQueryYesClicked={existingQueryYesClicked}
                    />}
                </div>}
            </div>
          </div>
          <div id="selected-query-description"
            className={currentQueryDescription.length > 50 ? styles.longDescription : styles.description}>
            <HCTooltip text={currentQueryDescription} id="current-query-description-tooltip" placement="top">
              <span>{
                searchOptions.selectedQuery === "select a query" ? "" : searchOptions.selectedQuery && searchOptions.selectedQuery !== "select a query" &&
                  currentQueryDescription.length > 50 ? currentQueryDescription.substring(0, 50).concat("...") : currentQueryDescription
              }</span>
            </HCTooltip>
          </div>
          {resetQueryIcon && props.isSavedQueryUser && props.queries.length > 0 &&
            <div>
              <span id="reset-changes" className={styles.clearQueryLink} onClick={() => resetIconClicked()}>
                <i><FontAwesomeIcon
                  className={styles.iconHover}
                  icon={faWindowClose}
                  title={"reset-changes"}
                  size="lg"
                  style={{width: "18px", color: "#5b69af", cursor: "pointer"}}
                /></i>
                <span className="text-info ps-2">Clear query</span>
              </span>
              <Modal
                show={showResetQueryEditedConfirmation || showResetQueryNewConfirmation}
              >
                <Modal.Header className={"bb-none"}>
                  <button type="button" className="btn-close" aria-label="Close" onClick={onResetCancel}></button>
                </Modal.Header>
                <Modal.Body className={"pt-0 px-4"}>
                  {showResetQueryEditedConfirmation &&
                    <div><p>Your unsaved changes in the query <strong>{searchOptions.selectedQuery}</strong> will be lost.</p>
                      <p>Would you like to save the changes before switching to another query?</p>
                    </div>}
                  {showResetQueryNewConfirmation && (<p>Would you like to save your search before resetting?</p>)}
                  <div className={"d-flex justify-content-center mt-4 mb-2"}>
                    <HCButton variant="outline-light" key="back" id="reset-confirmation-no-button" className={"me-2"} onClick={() => onNoResetClick()}>
                      No
                    </HCButton>
                    <HCButton key="submit" id="reset-confirmation-yes-button" variant="primary" onClick={() => onResetOk()}>
                      Yes
                    </HCButton>
                  </div>
                </Modal.Body>
              </Modal>
            </div>
          }

        </div>}
        <Modal
          show={showEntityConfirmation}
        >
          <Modal.Header>
            <span className={"fs-5"}>{"Existing Query"}</span>
            <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
          </Modal.Header>
          <Modal.Body>
            <p>Changing the entity selection starts a new query. Would you like to save the existing query before changing the selection?</p>
          </Modal.Body>
          <Modal.Footer className={"d-flex justify-content-center"}>
            <HCButton variant="outline-light" key="back" id="entity-confirmation-no-button" onClick={() => onNoClick()}>
              No
            </HCButton>
            <HCButton key="submit" id="entity-confirmation-yes-button" variant="primary" onClick={() => onOk()}>
              Yes
            </HCButton>
          </Modal.Footer>
        </Modal>
      </div>
      {/* } */}
    </>
  );
};
export default Query;
