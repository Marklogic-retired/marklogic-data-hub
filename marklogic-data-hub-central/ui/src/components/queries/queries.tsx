import React, { useState, useEffect, useContext } from 'react';
import { Tooltip } from 'antd';
import { UserContext } from '../../util/user-context';
import { SearchContext } from '../../util/search-context';
import SelectedFacets from '../../components/selected-facets/selected-facets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPencilAlt, faSave, faCopy} from '@fortawesome/free-solid-svg-icons'
import SaveQueryModal from "../../components/queries/saving/save-query-modal/save-query-modal";
import SaveQueriesDropdown from "../../components/queries/saving/save-queries-dropdown/save-queries-dropdown";
import { fetchQueries, creatNewQuery, updateQuery } from '../../api/queries'
import styles from './queries.module.scss';
import QueryModal from '../../components/queries/managing/manage-query-modal/manage-query';
import { AuthoritiesContext } from "../../util/authorities";
import EditQueryDetails from "./saving/edit-save-query/edit-query-details";
import SaveChangesModal from "./saving/edit-save-query/save-changes-modal";


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
    const [openEditDetail, setOpenEditDetail]= useState(false);
    const [currentQuery, setCurrentQuery]= useState({});
    const [hoverOverDropdown, setHoverOverDropdown]= useState(false);
    const [showSaveNewIcon, toggleSaveNewIcon ]= useState(true);
    const [showSaveChangesIcon, toggleSaveChangesIcon]= useState(false);
    const [openSaveChangesModal, setOpenSaveChangesModal] = useState(false);
    const [openSaveCopyModal, setOpenSaveCopyModal]= useState(false);
    const [currentQueryName, setCurrentQueryName] = useState(searchOptions.selectedQuery);

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
                propertiesToDisplay: [''],
            }
        }
        try {
            props.setIsLoading(true);
            await creatNewQuery(query);
            setOpenSaveModal(false);
            getSaveQueries();
        } catch (error) {
            handleError(error);
        } finally {
            props.setIsLoading(false);
            resetSessionTime();
        }
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
        if(queries.length > 0){
            for(let key of queries) {
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
        if(Object.entries(currentQuery).length !== 0){
            setHoverOverDropdown(true);
        }
    }, [currentQuery]);

    useEffect(() => {
        if(!showSaveNewIcon){
            toggleSaveChangesIcon(true);
        }
    },[props.greyFacets, searchOptions.selectedFacets])

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
                            setSaveNewIconVisibility={(visibility) =>  toggleSaveNewIcon(visibility)}
                            saveNewQuery={saveNewQuery}
                            greyFacets={props.greyFacets}
                            toggleApply={(clicked) => toggleApply(clicked)}
                            toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
                            currentQueryName={currentQueryName}
                            setCurrentQueryName={setCurrentQueryName}
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
                            setSaveNewIconVisibility={(visibility) =>  toggleSaveNewIcon(visibility)}
                            greyFacets={props.greyFacets}
                            toggleApply={(clicked) => toggleApply(clicked)}
                            toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
                            currentQuery={currentQuery}
                            currentQueryName={currentQueryName}
                            setCurrentQueryName={setCurrentQueryName}
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
                    />
                    }
                </div>
            </div>
            {queries.length > 0 && <div style={hoverOverDropdown ? {marginLeft:'192px', marginTop: '-66px'}: {marginLeft:'192px'}}>
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
                    currentQueryName={currentQueryName}
                    setCurrentQueryName={setCurrentQueryName}
                />
                }
            </div>}
            { queries.length > 0 &&
           <div style={{marginLeft:'214px', marginTop: '-23px'}}>
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
                />}
            </div>}
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
                toggleApply={toggleApply}
                currentQueryName={currentQueryName}
                setCurrentQueryName={setCurrentQueryName}
            />

        </div>
    )
}
export default Query;
