import React, { useState, useEffect, useContext } from 'react';
import { Tooltip } from 'antd';
import { UserContext } from '../../util/user-context';
import { SearchContext } from '../../util/search-context';
import SelectedFacets from '../../components/selected-facets/selected-facets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import SaveQueryModal from "../../components/queries/saving/save-query-modal/save-query-modal";
import SaveQueriesDropdown from "../../components/queries/saving/save-queries-dropdown/save-queries-dropdown";
import { fetchQueries, creatNewQuery } from '../../api/queries'
import styles from './queries.module.scss';
import QueryModal from '../../components/queries/managing/manage-query-modal/manage-query';

const Query = (props) => {
    const [openSaveModal, setOpenSaveModal] = useState(false);
    const [queries, setQueries] = useState([]);
    const [showApply, toggleApply] = useState(false);
    const [applyClicked, toggleApplyClicked] = useState(false);

    const {
        handleError,
        resetSessionTime
    } = useContext(UserContext);
    const {
        searchOptions
    } = useContext(SearchContext);
    const [queryName, setQueryName] = useState(searchOptions.selectedQuery);

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
        getSaveQueries();
    }, []);


    return (
        <div>
            <div>
                {props.selectedFacets.length > 0 &&
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
                                    saveNewQuery={saveNewQuery}
                                    greyFacets={props.greyFacets}
                                    toggleApply={(clicked) => toggleApply(clicked)}
                                    toggleApplyClicked={(clicked) => toggleApplyClicked(clicked)}
                                    queryName={queryName}
                                    setQueryName={setQueryName}
                                />}
                        </div>
                    </div>}
            </div>
            <div className={styles.saveDropdown}>
                {queries.length > 0 &&
                    <SaveQueriesDropdown
                        savedQueryList={queries}
                        greyFacets={props.greyFacets}
                        toggleApply={(clicked) => toggleApply(clicked)}
                        queryName={queryName}
                        setQueryName={setQueryName}
                    />
                }
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
            <QueryModal queries={queries} setQueries={setQueries} toggleApply={toggleApply} queryName={queryName} setQueryName={setQueryName} />
        </div>
    )
}
export default Query;