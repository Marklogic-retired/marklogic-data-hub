import React, { useState, useEffect, useContext } from 'react';
import {Button, Modal, Tooltip} from 'antd';
import { UserContext } from '../../util/user-context';
import { SearchContext } from '../../util/search-context';
import SelectedFacets from '../../components/selected-facets/selected-facets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencilAlt, faSave, faCopy, faUndo } from '@fortawesome/free-solid-svg-icons'
import SaveQueryModal from "../../components/queries/saving/save-query-modal/save-query-modal";
import SaveQueriesDropdown from "../../components/queries/saving/save-queries-dropdown/save-queries-dropdown";
import { fetchQueries, creatNewQuery, fetchQueryById } from '../../api/queries'
import styles from './queries.module.scss';
import QueryModal from '../../components/queries/managing/manage-query-modal/manage-query';
import { AuthoritiesContext } from "../../util/authorities";
import EditQueryDetails from "./saving/edit-save-query/edit-query-details";
import SaveChangesModal from "./saving/edit-save-query/save-changes-modal";
import DiscardChangesModal from "./saving/discard-changes/discard-changes-modal";


const Query = (props) => {

    const {
        handleError,
        resetSessionTime
    } = useContext(UserContext);
    const {
        searchOptions,
        applySaveQuery,
        clearAllGreyFacets,
        setEntity,
        setNextEntity
    } = useContext(SearchContext);

    const [openSaveModal, setOpenSaveModal] = useState(false);
    const [queries, setQueries] = useState<any>([]);
    const [showApply, toggleApply] = useState(false);
    const [applyClicked, toggleApplyClicked] = useState(false);
    const [openEditDetail, setOpenEditDetail] = useState(false);
    const [currentQuery, setCurrentQuery] = useState<any>({});
    const [hoverOverDropdown, setHoverOverDropdown] = useState(false);
    const [showSaveNewIcon, toggleSaveNewIcon] = useState(true);
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
                propertiesToDisplay: props.columns,
            }
        }
        props.setIsLoading(true);
        await creatNewQuery(query);
        setOpenSaveModal(false);
        getSaveQueries();
    }

    const getSaveQueries = async () => {
        try {
            const response = await fetchQueries();
            if (response.data) {
               setQueries(response.data);
            }
        } catch (error) {
            handleError(error)
        } finally {
            resetSessionTime()
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
               applySaveQuery(searchText, entityTypeIds, selectedFacets, response.data.savedQuery.name);
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
       } catch (error) {
           handleError(error)
       } finally {
           resetSessionTime()
       }
   }

    const isSaveQueryChanged = () => {
        if (currentQuery && currentQuery.hasOwnProperty('savedQuery') && currentQuery.savedQuery.hasOwnProperty('query')) {
            if ((JSON.stringify(currentQuery.savedQuery.query.selectedFacets) !== JSON.stringify(searchOptions.selectedFacets)) ||
                (currentQuery.savedQuery.query.searchText !== searchOptions.query) || (props.greyFacets.length > 0)) {
                return true;
            }
        }
        return false;
    }

    useEffect(() => {
        if (queries.length > 0) {
            for (let key of queries) {
                if (key.savedQuery.name === currentQueryName) {
                    setCurrentQuery(key);
                }
            }
        }
    }, [queries]);

    useEffect(() => {
        getSaveQueries();
    }, [searchOptions.entityTypeIds]);

    useEffect(() => {
            if(!entityCancelClicked && searchOptions.nextEntityType !== searchOptions.entityTypeIds[0]) {     // TO CHECK IF THERE HAS BEEN A CANCEL CLICKED WHILE CHANGING ENTITY
                if (isSaveQueryChanged()) {
                    toggleEntityConfirmation(true);
                } else {
                    setCurrentQueryOnEntityChange();
                }
            }else{
                toggleEntityCancelClicked(false); // RESETTING THE STATE TO FALSE
            }
    }, [searchOptions.nextEntityType]);


    const onCancel = () => {
        toggleEntityConfirmation(false);
        toggleEntityCancelClicked(true);
        setNextEntity(searchOptions.entityTypeIds[0]);
    }

    const onNoClick  = () => {
        setCurrentQueryOnEntityChange();
    }

    const onOk = () => {
        setOpenSaveChangesModal(true);
        toggleEntityConfirmation(false);
        toggleEntityQueryUpdate(true);
    }

    const setCurrentQueryOnEntityChange = () => {
         setEntity(searchOptions.nextEntityType);
         setCurrentQuery({});
         setCurrentQueryName('select a query');
         setCurrentQueryDescription('');
         toggleEntityConfirmation(false);
    }

    useEffect(() => {
        if (Object.entries(currentQuery).length !== 0 && searchOptions.selectedQuery !== 'select a query') {
            setHoverOverDropdown(true);
        }
        else{
            setHoverOverDropdown(false);
        }
    }, [currentQuery]);


    useEffect(() => {
        if (!showSaveNewIcon && isSaveQueryChanged()) {
            toggleSaveChangesIcon(true);
            toggleDiscardIcon(true);
        }
        else{
            toggleSaveChangesIcon(false);
            toggleDiscardIcon(false);
        }
    }, [searchOptions, props.greyFacets, isSaveQueryChanged()])

    return (
        <div>
            <div>
                {props.isSavedQueryUser && (props.selectedFacets.length > 0 || searchOptions.query) && showSaveNewIcon && searchOptions.entityTypeIds.length > 0 &&
                    <div style={{ marginTop: '-22px' }}>
                        <Tooltip title={'Save the current query'}>
                            <FontAwesomeIcon
                                icon={faSave}
                                title="save-query"
                                onClick={() => setOpenSaveModal(true)}
                                data-testid='save-modal'
                                style={queries.length > 0 ? {
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
                        </Tooltip>
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
                                />}
                        </div>
                    </div>}
                {props.isSavedQueryUser && showSaveChangesIcon && queries.length > 0 &&
                    <div style={{ marginTop: '-22px' }}>
                        <Tooltip title={'Save changes'}>
                            <FontAwesomeIcon
                                icon={faSave}
                                title="save-changes"
                                onClick={() => setOpenSaveChangesModal(true)}
                                data-testid='save-changes-modal'
                                style={queries.length > 0 ? {
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
                        </Tooltip>
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
                                    savedQueryList={queries}
                                    setCurrentQueryOnEntityChange = {setCurrentQueryOnEntityChange}
                                    getSaveQueryWithId={(key)=>getSaveQueryWithId(key)}
                                    isSaveQueryChanged={isSaveQueryChanged}
                                    entityQueryUpdate={entityQueryUpdate}
                                    toggleEntityQueryUpdate={()=>toggleEntityQueryUpdate(false)}
                                />}
                        </div>
                    </div>}
                {props.isSavedQueryUser && showDiscardIcon && queries.length > 0 &&
                    <div style={{ marginTop: '-30px', maxWidth: '100px' }}>
                        <Tooltip title={'Discard changes'}>
                            <FontAwesomeIcon
                                icon={faUndo}
                                title="discard-changes"
                                onClick={() => setOpenDiscardChangesModal(true)}
                                style={queries.length > 0 ? {
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
                        </Tooltip>
                        <div>
                            {openDiscardChangesModal &&
                                <DiscardChangesModal
                                    setDiscardChangesModalVisibility={() => setOpenDiscardChangesModal(false)}
                                    savedQueryList={queries}
                                    toggleApply={(clicked) => toggleApply(clicked)}
                                    toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
                                />}
                        </div>
                    </div>}
                <div className={styles.saveDropdown}>
                    {queries.length > 0 &&
                    <SaveQueriesDropdown
                        savedQueryList={queries}
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
            {props.isSavedQueryUser && queries.length > 0 && <div style={hoverOverDropdown ? { marginLeft: '214px', marginTop: '-66px' } : { marginLeft: '214px' }}>
                <Tooltip title={'Edit query details'}>
                    {hoverOverDropdown && <FontAwesomeIcon
                        icon={faPencilAlt}
                        title="edit-query"
                        size="lg"
                        onClick={() => setOpenEditDetail(true)}
                        style={{ width: '16px', color: '#5b69af', cursor:'pointer' }}
                    />}
                </Tooltip>
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
            {props.isSavedQueryUser && queries.length > 0 &&
                <div style={{ marginLeft: '234px', marginTop: '-23px' }}>
                    <Tooltip title={'Save a copy'}>
                        {hoverOverDropdown && <FontAwesomeIcon
                            icon={faCopy}
                            size="lg"
                            onClick={() => setOpenSaveCopyModal(true)}
                            style={{ width: '15px', color: '#5b69af',  cursor:'pointer' }}
                        />}
                    </Tooltip>
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
                        />}
                </div>}
            <div id="selected-query-description" style={props.isSavedQueryUser ? {marginTop: '10px'} : {marginTop: '-36px'}}
                 className={currentQueryDescription.length > 50 ? styles.longDescription : styles.description}>
                <Tooltip title={currentQueryDescription}>
                    {
                        searchOptions.selectedQuery && searchOptions.selectedQuery !== 'select a query' &&
                            currentQueryDescription.length > 50 ? currentQueryDescription.substring(0, 50).concat("...") : currentQueryDescription
                    }
                </Tooltip>
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
                hasStructured={props.hasStructured}
                canExportQuery={canExportQuery}
                queries={queries}
                setQueries={setQueries}
                columns={props.columns}
                toggleApply={toggleApply}
                currentQueryName={currentQueryName}
                setCurrentQueryName={setCurrentQueryName}
                currentQueryDescription={currentQueryDescription}
                setCurrentQueryDescription={setCurrentQueryDescription}
                isSavedQueryUser={props.isSavedQueryUser}
            />
            <Modal
                visible={showEntityConfirmation}
                title={'Existing Query'}
                onCancel={()=> onCancel()}
                footer={[
                    <Button key='cancel' id='entity-confirmation-cancel-button' onClick={() => onCancel()}>Cancel</Button>,
                    <Button key="back" id='entity-confirmation-no-button' onClick={() => onNoClick()}>
                        No
                    </Button>,
                    <Button key="submit"  id='entity-confirmation-yes-button' type="primary"  onClick={()=> onOk()}>
                        Yes
                    </Button>
                    ]}>
                <p>Changing the entity selection starts a new query. Would you like to save the existing query before changing the selection?</p>
            </Modal>
        </div>
    )

}
export default Query;
