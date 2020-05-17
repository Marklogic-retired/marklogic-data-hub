import React, { useState, useEffect, useContext } from 'react';
import { Tooltip } from 'antd';
import { UserContext } from '../../util/user-context';
import { SearchContext } from '../../util/search-context';
import SelectedFacets from '../../components/selected-facets/selected-facets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPencilAlt, faSave, faCopy, faUndo} from '@fortawesome/free-solid-svg-icons'
import SaveQueryModal from "../../components/queries/saving/save-query-modal/save-query-modal";
import SaveQueriesDropdown from "../../components/queries/saving/save-queries-dropdown/save-queries-dropdown";
import { fetchQueries, creatNewQuery, updateQuery } from '../../api/queries'
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
        searchOptions
    } = useContext(SearchContext);

    const [openSaveModal, setOpenSaveModal] = useState(false);
    const [queries, setQueries] = useState<any>([]);
    const [showApply, toggleApply] = useState(false);
    const [applyClicked, toggleApplyClicked] = useState(false);
    const [openEditDetail, setOpenEditDetail] = useState(false);
    const [currentQuery, setCurrentQuery] = useState({});
    const [hoverOverDropdown, setHoverOverDropdown] = useState(false);
    const [showSaveNewIcon, toggleSaveNewIcon] = useState(true);
    const [showSaveChangesIcon, toggleSaveChangesIcon] = useState(false);
    const [openSaveChangesModal, setOpenSaveChangesModal] = useState(false);
    const [showDiscardIcon, toggleDiscardIcon] = useState(false);
    const [openSaveCopyModal, setOpenSaveCopyModal]= useState(false);
    const [openDiscardChangesModal, setOpenDiscardChangesModal]= useState(false);
    const [currentQueryName, setCurrentQueryName] = useState(searchOptions.selectedQuery);
    const [currentQueryDescription, setCurrentQueryDescription] = useState('');

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

    useEffect(() => {
        if (queries.length > 0) {
            for (let key of queries) {
                if (key.savedQuery.name === currentQueryName) {
                    setCurrentQuery(key);
                    break;
                }
            }
        }
    }, [queries]);

    useEffect(() => {
        getSaveQueries();
    }, []);

    useEffect(() => {
        if (Object.entries(currentQuery).length !== 0) {
            setHoverOverDropdown(true);
        }
    }, [currentQuery]);

    useEffect(() => {
        if (!showSaveNewIcon) {
            toggleSaveChangesIcon(true);
            toggleDiscardIcon(true);
        }
    }, [props.greyFacets, searchOptions.query])

    return (
        <div>
            <div>
                {props.selectedFacets.length > 0 && showSaveNewIcon &&
                    <div style={{ marginTop: '-22px' }}>
                        <Tooltip title={'Save the current query'}>
                            <FontAwesomeIcon
                                icon={faSave}
                                onClick={() => setOpenSaveModal(true)}
                                data-testid='save-modal'
                                style={queries.length > 0 ? {
                                    color: '#5b69af',
                                    marginLeft: '170px',
                                    marginBottom: '9px'
                                } : {
                                        color: '#5b69af', marginLeft: '18px',
                                        marginBottom: '9px'
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
                {showSaveChangesIcon && queries.length > 0 &&
                    <div style={{ marginTop: '-22px' }}>
                        <Tooltip title={'Save changes'}>
                            <FontAwesomeIcon
                                icon={faSave}
                                onClick={() => setOpenSaveChangesModal(true)}
                                data-testid='save-changes-modal'
                                style={queries.length > 0 ? {
                                    color: '#5b69af',
                                    marginLeft: '170px',
                                    marginBottom: '9px'
                                } : {
                                        color: '#5b69af', marginLeft: '18px',
                                        marginBottom: '9px'
                                    }}
                                size="lg" />
                        </Tooltip>
                        <div id={'saveChangedQueries'}>
                            {openSaveChangesModal &&
                                <SaveChangesModal
                                    setSaveChangesModalVisibility={() => setOpenSaveChangesModal(false)}
                                    setSaveNewIconVisibility={(visibility) => toggleSaveNewIcon(visibility)}
                                    greyFacets={props.greyFacets}
                                    toggleApply={(clicked) => toggleApply(clicked)}
                                    toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
                                    currentQuery={currentQuery}
                                    setCurrentQuery={setCurrentQuery}
                                    currentQueryName={currentQueryName}
                                    setCurrentQueryName={setCurrentQueryName}
                                    currentQueryDescription={currentQueryDescription}
                                    setCurrentQueryDescription={setCurrentQueryDescription}
                                />}
                        </div>
                    </div>}
                {showDiscardIcon && queries.length > 0 &&
                <div style={{ marginTop: '-30px', maxWidth:'100px' }}>
                    <Tooltip title={'Discard changes'}>
                        <FontAwesomeIcon
                            icon={faUndo}
                            onClick={() => setOpenDiscardChangesModal(true)}
                            style={queries.length > 0 ? {
                                color: '#5b69af',
                                marginLeft: '192px',
                                marginBottom: '9px'
                            } : {
                                color: '#5b69af', marginLeft: '192px',
                                marginBottom: '9px'
                            }}
                            size="lg" />
                    </Tooltip>
                    <div>
                        {openDiscardChangesModal &&
                        <DiscardChangesModal
                            currentQueryName={currentQueryName}
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
                        setCurrentQueryFn={(query)=> setCurrentQuery(query)}
                        currentQuery={currentQuery}
                        currentQueryDescription={currentQueryDescription}
                        setCurrentQueryDescription={setCurrentQueryDescription}
                        setSaveChangesIconVisibility={(visibility) =>  toggleSaveChangesIcon(visibility)}
                        setDiscardChangesIconVisibility={(visibility) =>  toggleDiscardIcon(visibility)}
                    />
                    }
                </div>
            </div>
            {queries.length > 0 && <div style={hoverOverDropdown ? {marginLeft:'214px', marginTop: '-66px'}: {marginLeft:'214px'}}>
                <Tooltip title={'Edit query details'}>
                    {hoverOverDropdown && <FontAwesomeIcon
                        icon={faPencilAlt}
                        size="lg"
                        onClick={()=>setOpenEditDetail(true)}
                        style={{width: '16px',color: '#5b69af'}}
                    />}
                </Tooltip>
                {openEditDetail &&
                <EditQueryDetails
                    setEditQueryDetailVisibility={() => setOpenEditDetail(false)}
                    currentQuery={currentQuery}
                    setCurrentQuery={setCurrentQuery}
                    currentQueryName={currentQueryName}
                    setCurrentQueryName={setCurrentQueryName}
                    currentQueryDescription={currentQueryDescription}
                    setCurrentQueryDescription={setCurrentQueryDescription}
                />
                }
            </div>}
            { queries.length > 0 &&
            <div style={{marginLeft:'234px', marginTop: '-23px'}}>
                <Tooltip title={'Save a copy'}>
                    {hoverOverDropdown && <FontAwesomeIcon
                        icon={faCopy}
                        size="lg"
                        onClick={()=>setOpenSaveCopyModal(true)}
                        style={{width: '15px',color: '#5b69af'}}
                    />}
                </Tooltip>
                {openSaveCopyModal &&
                <SaveQueryModal
                    setSaveModalVisibility={() => setOpenSaveCopyModal(false)}
                    setSaveNewIconVisibility={(visibility) =>  toggleSaveNewIcon(visibility)}
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
            <div id="selected-query-description" className= {currentQueryDescription.length > 50 ? styles.longDescription : styles.description}>
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
                canExportQuery={canExportQuery}
                queries={queries}
                setQueries={setQueries}
                columns={props.columns}
                toggleApply={toggleApply}
                currentQueryName={currentQueryName}
                setCurrentQueryName={setCurrentQueryName}
                currentQueryDescription={currentQueryDescription}
                setCurrentQueryDescription={setCurrentQueryDescription}
            />
        </div>
    )

}
export default Query;
