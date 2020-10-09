import React, { useState, useEffect, useContext } from 'react';
import {Button, Modal, Tooltip} from 'antd';
import { UserContext } from '../../util/user-context';
import { SearchContext } from '../../util/search-context';
import SelectedFacets from '../../components/selected-facets/selected-facets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencilAlt, faSave, faCopy, faUndo, faWindowClose } from '@fortawesome/free-solid-svg-icons'
import SaveQueryModal from "../../components/queries/saving/save-query-modal/save-query-modal";
import SaveQueriesDropdown from "../../components/queries/saving/save-queries-dropdown/save-queries-dropdown";
import { fetchQueries, creatNewQuery, fetchQueryById } from '../../api/queries'
import styles from './queries.module.scss';
import QueryModal from '../../components/queries/managing/manage-query-modal/manage-query';
import { AuthoritiesContext } from "../../util/authorities";
import EditQueryDetails from "./saving/edit-save-query/edit-query-details";
import SaveChangesModal from "./saving/edit-save-query/save-changes-modal";
import DiscardChangesModal from "./saving/discard-changes/discard-changes-modal";
import { QueryOptions } from '../../types/query-types';
import { MLButton, MLTooltip } from '@marklogic/design-system';
import { getUserPreferences } from '../../services/user-preferences';

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
};

const Query: React.FC<Props> = (props) => {

    const {
        user,
        handleError
    } = useContext(UserContext);
    const {
        searchOptions,
        applySaveQuery,
        clearAllGreyFacets,
        setEntity,
        setNextEntity,
        setZeroState,
        setQuery
    } = useContext(SearchContext);

    const [openSaveModal, setOpenSaveModal] = useState(false);
    const [showApply, toggleApply] = useState(false);
    const [applyClicked, toggleApplyClicked] = useState(false);
    const [openEditDetail, setOpenEditDetail] = useState(false);
    const [currentQuery, setCurrentQuery] = useState<any>({});
    const [hoverOverDropdown, setHoverOverDropdown] = useState(false);
    const [showSaveNewIcon, toggleSaveNewIcon] = useState(false);
    const [showSaveChangesIcon, toggleSaveChangesIcon] = useState(false);
    const [openSaveChangesModal, setOpenSaveChangesModal] = useState(false);
    const [showDiscardIcon, toggleDiscardIcon] = useState(false);
    const [openSaveCopyModal, setOpenSaveCopyModal] = useState(false);
    const [openDiscardChangesModal, setOpenDiscardChangesModal] = useState(false);
    const [currentQueryName, setCurrentQueryName] = useState(searchOptions.selectedQuery);
    const [nextQueryName, setNextQueryName] = useState('');
    const [currentQueryDescription, setCurrentQueryDescription] = useState('');
    const [showEntityConfirmation, toggleEntityConfirmation] = useState(false);
    const [entityQueryUpdate, toggleEntityQueryUpdate] = useState(false);
    const [entityCancelClicked, toggleEntityCancelClicked] = useState(false);
    const [resetQueryIcon, setResetQueryIcon] = useState(true);
    const [showResetQueryNewConfirmation, toggleResetQueryNewConfirmation] = useState(false);
    const [showResetQueryEditedConfirmation, toggleResetQueryEditedConfirmation] = useState(false);

    const [existingQueryYesClicked, toggleExistingQueryYesClicked] = useState(false);
    const [resetYesClicked, toggleResetYesClicked] = useState(false);
    const authorityService = useContext(AuthoritiesContext);
    const canExportQuery = authorityService.canExportEntityInstances();

    const saveNewQuery = async (queryName, queryDescription, facets) => {
        let query = {
            savedQuery: {
                id: '',
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
        }
        props.setIsLoading(true);
        await creatNewQuery(query);
        setOpenSaveModal(false);
        getSaveQueries();
    }

    const getSaveQueries = async () => {
        try {
            if(props.isSavedQueryUser) {
                const response = await fetchQueries();
                if (response.data) {
                    props.setQueries(response.data);
                }
            }
        } catch (error) {
            handleError(error)
        }
    }

    const getSaveQueryWithId = async (key) => {
       try {
           const response = await fetchQueryById(key);
           if(props.isSavedQueryUser) {
               if (response.data) {
                   let options: QueryOptions = {
                       searchText: response.data.savedQuery.query.searchText,
                       entityTypeIds: response.data.savedQuery.query.entityTypeIds,
                       selectedFacets: response.data.savedQuery.query.selectedFacets,
                       selectedQuery: response.data.savedQuery.name,
                       propertiesToDisplay: response.data.savedQuery.propertiesToDisplay,
                       zeroState: searchOptions.zeroState,
                       manageQueryModal: searchOptions.manageQueryModal,
                       sortOrder: response.data.savedQuery.sortOrder
                   }
                   applySaveQuery(options);
                   setCurrentQuery(response.data);
                   if(props.greyFacets.length > 0){
                       clearAllGreyFacets();
                   }
                   toggleApply(false);
                   if(response.data.savedQuery.hasOwnProperty('description') && response.data.savedQuery.description){
                       setCurrentQueryDescription(response.data.savedQuery.description);
                   } else{
                       setCurrentQueryDescription('');
                   }
               }
           }
       } catch (error) {
           handleError(error)
       }
   }

    const isSaveQueryChanged = () => {
        if (currentQuery && currentQuery.hasOwnProperty('savedQuery') && currentQuery.savedQuery.hasOwnProperty('query')) {
            if (((JSON.stringify(currentQuery.savedQuery.query.selectedFacets) !== JSON.stringify(searchOptions.selectedFacets)) ||
                (currentQuery.savedQuery.query.searchText !== searchOptions.query) ||
                (JSON.stringify(currentQuery.savedQuery.sortOrder) !== JSON.stringify(searchOptions.sortOrder)) ||
                (JSON.stringify(currentQuery.savedQuery.propertiesToDisplay) !== JSON.stringify(searchOptions.selectedTableProperties)) ||
                (props.greyFacets.length > 0) || props.isColumnSelectorTouched) &&
                searchOptions.selectedQuery !== 'select a query')   {
                return true;
            }
        }
        return false;
    }

    const isNewQueryChanged = () => {
        if (currentQuery && Object.keys(currentQuery).length === 0) {
            if (props.isSavedQueryUser && searchOptions.entityTypeIds.length > 0 &&
                (props.selectedFacets.length > 0 || searchOptions.query.length > 0
                    || searchOptions.sortOrder.length > 0 || props.isColumnSelectorTouched)
                && searchOptions.selectedQuery === 'select a query') {
                return true;
            }
        }
        return false;
    }

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
        getSaveQueries();
    }, [searchOptions.entityTypeIds]);

    useEffect(() => {
        initializeUserPreferences();
    },[])

    useEffect(() => {
            if(!entityCancelClicked && searchOptions.nextEntityType !== searchOptions.entityTypeIds[0]) {
                // TO CHECK IF THERE HAS BEEN A CANCEL CLICKED WHILE CHANGING ENTITY
                if ((isSaveQueryChanged() || isNewQueryChanged()) && !searchOptions.zeroState) {
                    toggleEntityConfirmation(true);
                } else {
                    setCurrentQueryOnEntityChange();
                }
            }else{
                toggleEntityCancelClicked(false); // RESETTING THE STATE TO FALSE
            }
    }, [searchOptions.nextEntityType]);

    const initializeUserPreferences = async () => {

        let defaultPreferences = getUserPreferences(user.name);
        if (defaultPreferences !== null) {
            let parsedPreferences = JSON.parse(defaultPreferences);
            if (parsedPreferences.selectedQuery !== 'select a query' && JSON.stringify(parsedPreferences) !== JSON.stringify([])) {
                if (parsedPreferences.queries && Array.isArray(parsedPreferences.queries)) {
                    let queryObject = parsedPreferences.queries.find(obj => parsedPreferences.selectedQuery === obj.savedQuery?.name);
                    if (queryObject?.savedQuery && queryObject.savedQuery.hasOwnProperty('description') && queryObject.savedQuery.description) {
                        setCurrentQueryDescription(queryObject?.savedQuery.description);
                    }
                }
            }
        }
    }

    // Switching between entity confirmation modal buttons
    const onCancel = () => {
        toggleEntityConfirmation(false);
        toggleEntityCancelClicked(true);
        setNextEntity(searchOptions.entityTypeIds[0]);
    }

    const onNoClick  = () => {
        toggleEntityConfirmation(false);
        setCurrentQueryOnEntityChange();
    }

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
    }

    const setCurrentQueryOnEntityChange = () => {
        setEntity(searchOptions.nextEntityType);
        toggleSaveNewIcon(false);
        props.setColumnSelectorTouched(false)
        setCurrentQuery({});
        setCurrentQueryName('select a query');
        setCurrentQueryDescription('');
    }

   // Reset confirmation modal buttons when making changes to saved query
    const onResetCancel = () => {
        toggleResetQueryNewConfirmation(false);
        toggleResetQueryEditedConfirmation(false);
    }

    const onResetOk = () => {
        if(showResetQueryNewConfirmation){
          setOpenSaveModal(true);
          toggleResetYesClicked(true);
        }
        else{
          setOpenSaveChangesModal(true);
          toggleResetYesClicked(true);
        }
        toggleResetQueryNewConfirmation(false);
        toggleResetQueryEditedConfirmation(false);
    }

    const onNoResetClick = () => {
        setZeroState(true);
        let options: QueryOptions = {
            searchText: '',
            entityTypeIds: [],
            selectedFacets: {},
            selectedQuery: 'select a query',
            propertiesToDisplay: [],
            zeroState: true,
            manageQueryModal: false,
            sortOrder: []
        }
        applySaveQuery(options);
        toggleResetQueryEditedConfirmation(false);
        toggleResetQueryNewConfirmation(false);
        props.setColumnSelectorTouched(false);
    }

    const resetIconClicked = () => {
        const resetQueryEditedConfirmation = props.isSavedQueryUser && props.queries.length > 0
                                            && searchOptions.selectedQuery !== 'select a query' && isSaveQueryChanged()
        const resetQueryNewConfirmation = props.isSavedQueryUser && props.queries.length > 0 && searchOptions.entityTypeIds.length > 0 &&
                                          (props.selectedFacets.length > 0 || searchOptions.query.length > 0
                                          || searchOptions.sortOrder.length > 0)
                                          && searchOptions.selectedQuery === 'select a query'
        if (resetQueryNewConfirmation) {
            toggleResetQueryNewConfirmation(true)
        } else if (resetQueryEditedConfirmation) {
            toggleResetQueryEditedConfirmation(true)
        } else {
            setZeroState(true);
            let options: QueryOptions = {
                searchText: '',
                entityTypeIds: [],
                selectedFacets: {},
                selectedQuery: 'select a query',
                propertiesToDisplay: [],
                zeroState: true,
                manageQueryModal: false,
                sortOrder: []
            }
            applySaveQuery(options);
            clearAllGreyFacets();
        }
    }

    useEffect(() => {
        if (Object.entries(currentQuery).length !== 0 && searchOptions.selectedQuery !== 'select a query') {
            setHoverOverDropdown(true);
            setCurrentQueryDescription(currentQuery['savedQuery']['description']);
        }
        else{
            setHoverOverDropdown(false);
            setCurrentQueryDescription('');
        }
    }, [currentQuery]);


    useEffect(() => {
        if (isSaveQueryChanged() && searchOptions.selectedQuery !== 'select a query') {
            toggleSaveChangesIcon(true);
            toggleDiscardIcon(true);
            toggleSaveNewIcon(false);
        }
        else{
            toggleSaveChangesIcon(false);
            toggleDiscardIcon(false);
            toggleSaveNewIcon(true);
        }

    }, [searchOptions, props.greyFacets, isSaveQueryChanged()])

    return (
        <div>
            <div>
                {props.isSavedQueryUser && (props.selectedFacets.length > 0 || searchOptions.query
                    || props.isColumnSelectorTouched || searchOptions.sortOrder.length > 0) &&
                showSaveNewIcon && searchOptions.entityTypeIds.length > 0 && searchOptions.selectedQuery === 'select a query' &&
                    <div style={{ marginTop: '-22px' }}>
                        <MLTooltip title={'Save the current query'}>
                            <FontAwesomeIcon
                                icon={faSave}
                                title="save-query"
                                onClick={() => setOpenSaveModal(true)}
                                data-testid='save-modal'
                                style={props.queries.length > 0 ? {
                                    color: '#5b69af',
                                    marginLeft: '170px',
                                    marginBottom: '9px',
                                    cursor:'pointer'
                                } : {
                                        color: '#5b69af', marginLeft: '18px',
                                        marginBottom: '9px',
                                        cursor:'pointer'
                                    }}
                                size="lg" />
                        </MLTooltip>
                        <div id={'savedQueries'}>
                            {openSaveModal &&
                                <SaveQueryModal
                                    setSaveModalVisibility={() => setOpenSaveModal(false)}
                                    setSaveNewIconVisibility={(visibility) => toggleSaveNewIcon(visibility)}
                                    saveNewQuery={saveNewQuery}
                                    greyFacets={props.greyFacets}
                                    toggleApply={(clicked) => toggleApply(clicked)}
                                    toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
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
                    <div style={{ marginTop: '-22px' }}>
                        <MLTooltip title={'Save changes'}>
                            <FontAwesomeIcon
                                icon={faSave}
                                title="save-changes"
                                onClick={() => setOpenSaveChangesModal(true)}
                                data-testid='save-changes-modal'
                                style={props.queries.length > 0 ? {
                                    color: '#5b69af',
                                    marginLeft: '170px',
                                    marginBottom: '9px',
                                    cursor:'pointer'
                                } : {
                                        color: '#5b69af', marginLeft: '18px',
                                        marginBottom: '9px',
                                        cursor:'pointer'
                                    }}
                                size="lg" />
                        </MLTooltip>
                        <div id={'saveChangedQueries'}>
                            {openSaveChangesModal  &&
                                <SaveChangesModal
                                    setSaveChangesModalVisibility={() => setOpenSaveChangesModal(false)}
                                    setSaveNewIconVisibility={(visibility) => toggleSaveNewIcon(visibility)}
                                    greyFacets={props.greyFacets}
                                    toggleApply={(clicked) => toggleApply(clicked)}
                                    toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
                                    currentQuery={currentQuery}
                                    currentQueryName={currentQueryName}
                                    setCurrentQueryDescription={(description) => setCurrentQueryDescription(description)}
                                    setCurrentQueryName={(name) => setCurrentQueryName(name)}
                                    nextQueryName = {nextQueryName}
                                    savedQueryList={props.queries}
                                    setCurrentQueryOnEntityChange = {setCurrentQueryOnEntityChange}
                                    getSaveQueryWithId={(key)=>getSaveQueryWithId(key)}
                                    isSaveQueryChanged={isSaveQueryChanged}
                                    entityQueryUpdate={entityQueryUpdate}
                                    toggleEntityQueryUpdate={()=>toggleEntityQueryUpdate(false)}
                                    resetYesClicked={resetYesClicked}
                                    setColumnSelectorTouched={props.setColumnSelectorTouched}
                                />}
                        </div>
                    </div>}
                {props.isSavedQueryUser && showDiscardIcon && props.queries.length > 0 &&
                    <div style={{ marginTop: '-30px', maxWidth: '100px' }}>
                        <MLTooltip title={'Discard changes'}>
                            <FontAwesomeIcon
                                icon={faUndo}
                                title="discard-changes"
                                onClick={() => setOpenDiscardChangesModal(true)}
                                style={props.queries.length > 0 ? {
                                    color: '#5b69af',
                                    marginLeft: '192px',
                                    marginBottom: '9px',
                                    cursor:'pointer'
                                } : {
                                        color: '#5b69af', marginLeft: '192px',
                                        marginBottom: '9px',
                                        cursor:'pointer'
                                    }}
                                size="lg" />
                        </MLTooltip>
                        <div>
                            {openDiscardChangesModal &&
                                <DiscardChangesModal
                                    setDiscardChangesModalVisibility={() => setOpenDiscardChangesModal(false)}
                                    savedQueryList={props.queries}
                                    toggleApply={(clicked) => toggleApply(clicked)}
                                    toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
                                />}
                        </div>
                    </div>}
                <div className={styles.saveDropdown}>
                    {props.queries.length > 0 &&
                    <SaveQueriesDropdown
                        savedQueryList={props.queries}
                        setSaveNewIconVisibility={(visibility) =>  toggleSaveNewIcon(visibility)}
                        greyFacets={props.greyFacets}
                        toggleApply={(clicked) => toggleApply(clicked)}
                        currentQueryName={currentQueryName}
                        setCurrentQueryName={setCurrentQueryName}
                        currentQuery={currentQuery}
                        setSaveChangesIconVisibility={(visibility) =>  toggleSaveChangesIcon(visibility)}
                        setDiscardChangesIconVisibility={(visibility) =>  toggleDiscardIcon(visibility)}
                        setSaveChangesModal={(visiblity)=> setOpenSaveChangesModal(visiblity)}
                        setNextQueryName={(nextQueryName) => setNextQueryName(nextQueryName)}
                        getSaveQueryWithId={getSaveQueryWithId}
                        isSaveQueryChanged={isSaveQueryChanged}
                    />
                    }
                </div>
            </div>
            {props.isSavedQueryUser && props.queries.length > 0 && <div style={hoverOverDropdown ? { marginLeft: '214px', marginTop: '-66px' } : { marginLeft: '214px' }}>
                <MLTooltip title={'Edit query details'}>
                    {hoverOverDropdown && <FontAwesomeIcon
                        icon={faPencilAlt}
                        title="edit-query"
                        size="lg"
                        onClick={() => setOpenEditDetail(true)}
                        style={{ width: '16px', color: '#5b69af', cursor:'pointer' }}
                    />}
                </MLTooltip>
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
            {props.isSavedQueryUser && props.queries.length > 0 &&
                <div style={{ marginLeft: '234px', marginTop: '-23px' }}>
                    <MLTooltip title={'Save a copy'}>
                        {hoverOverDropdown && <FontAwesomeIcon
                            icon={faCopy}
                            size="lg"
                            onClick={() => setOpenSaveCopyModal(true)}
                            style={{ width: '15px', color: '#5b69af',  cursor:'pointer' }}
                        />}
                    </MLTooltip>
                    {openSaveCopyModal &&
                        <SaveQueryModal
                            setSaveModalVisibility={() => setOpenSaveCopyModal(false)}
                            setSaveNewIconVisibility={(visibility) => toggleSaveNewIcon(visibility)}
                            saveNewQuery={saveNewQuery}
                            greyFacets={props.greyFacets}
                            toggleApply={(clicked) => toggleApply(clicked)}
                            toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
                            currentQueryName={currentQueryName}
                            setCurrentQueryName={setCurrentQueryName}
                            currentQueryDescription={currentQueryDescription}
                            setCurrentQueryDescription={setCurrentQueryDescription}
                            resetYesClicked={resetYesClicked}
                            setColumnSelectorTouched={props.setColumnSelectorTouched}
                            existingQueryYesClicked={existingQueryYesClicked}
                        />}
                </div>}
            { resetQueryIcon && props.isSavedQueryUser && props.queries.length > 0 &&
            <div style={searchOptions.selectedQuery !== 'select a query' ? {
                marginLeft: '256px',
                marginTop: '-21px',
            } : {
                marginLeft: '192px',
                marginTop: '-66px',
            }}>
                <Tooltip title={'Clear query'}>
                   <FontAwesomeIcon
                        icon={faWindowClose}
                        title={'reset-changes'}
                        size="lg"
                        onClick={() => resetIconClicked()}
                        style={{ width: '18px', color: '#5b69af',  cursor:'pointer' }}
                        id='reset-changes'
                    />
                </Tooltip>
                <Modal
                    visible={showResetQueryEditedConfirmation || showResetQueryNewConfirmation}
                    title={'Confirmation'}
                    onCancel={()=> onResetCancel()}
                    footer={[
                        <Button key='cancel' id='reset-confirmation-cancel-button' onClick={() => onResetCancel()}>Cancel</Button>,
                        <Button key="back" id='reset-confirmation-no-button' onClick={() => onNoResetClick()}>
                            No
                        </Button>,
                        <Button key="submit"  id='reset-confirmation-yes-button' type="primary"  onClick={()=> onResetOk()}>
                            Yes
                        </Button>
                    ]}>
                    {showResetQueryEditedConfirmation &&
                    <div><p>Your unsaved changes in the query <strong>{searchOptions.selectedQuery}</strong> will be lost.</p>
                    <br/>
                    <p>Would you like to save the changes before switching to another query?</p>
                    </div>}
                    {showResetQueryNewConfirmation && (<p>Would you like to save your search before resetting?</p>)}
                </Modal>
            </div>}
            <div id="selected-query-description" style={props.isSavedQueryUser ? {marginTop: '10px'} : {marginTop: '-36px'}}
                 className={currentQueryDescription.length > 50 ? styles.longDescription : styles.description}>
                <MLTooltip title={currentQueryDescription}>
                    {
                        searchOptions.selectedQuery && searchOptions.selectedQuery !== 'select a query' &&
                            currentQueryDescription.length > 50 ? currentQueryDescription.substring(0, 50).concat("...") : currentQueryDescription
                    }
                </MLTooltip>
            </div>
            <div className={styles.selectedFacets}>
                <SelectedFacets
                    selectedFacets={props.selectedFacets}
                    greyFacets={props.greyFacets}
                    applyClicked={applyClicked}
                    showApply={showApply}
                    toggleApply={(clicked) => toggleApply(clicked)}
                    toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
                />
            </div>
            <QueryModal
                canExportQuery={canExportQuery}
                queries={props.queries}
                setQueries={props.setQueries}
                columns={props.columns}
                toggleApply={toggleApply}
                currentQueryName={currentQueryName}
                setCurrentQueryName={setCurrentQueryName}
                currentQueryDescription={currentQueryDescription}
                setCurrentQueryDescription={setCurrentQueryDescription}
                isSavedQueryUser={props.isSavedQueryUser}
                modalVisibility={searchOptions.manageQueryModal}
                entityDefArray={props.entityDefArray}
                database={props.database}
            />
            <Modal
                visible={showEntityConfirmation}
                title={'Existing Query'}
                onCancel={()=> onCancel()}
                footer={[
                    <MLButton key='cancel' id='entity-confirmation-cancel-button' onClick={() => onCancel()}>Cancel</MLButton>,
                    <MLButton key="back" id='entity-confirmation-no-button' onClick={() => onNoClick()}>
                        No
                    </MLButton>,
                    <MLButton key="submit"  id='entity-confirmation-yes-button' type="primary"  onClick={()=> onOk()}>
                        Yes
                    </MLButton>
                    ]}>
                <p>Changing the entity selection starts a new query. Would you like to save the existing query before changing the selection?</p>
            </Modal>
        </div>
    )
}
export default Query;
