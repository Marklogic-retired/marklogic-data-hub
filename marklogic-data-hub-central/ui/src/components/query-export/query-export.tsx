import React, { useState, useContext } from 'react';
import { Tooltip } from 'antd';
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SearchContext } from '../../util/search-context';
import ExportQueryModal from './query-export-modal/query-export-modal'
import { UserContext } from '../../util/user-context';
import { getExportPreview } from '../query-export/export-preview/export-preview'
import { getExportQueryPreview } from '../../api/queries'


const QueryExport = (props) => {
    const [tableColumns, setTableColumns] = useState<Object[]>([]);
    const [tableData, setTableData] = useState<Object[]>();
    const [exportModalVisibility, setExportModalVisibility] = useState(false);
    const [hasStructured, setStructured] = useState<boolean>(false);
    const {
        handleError,
        resetSessionTime
    } = useContext(UserContext);

    const {
        searchOptions
    } = useContext(SearchContext);

    const displayModal = () => {
        props.hasStructured && getPreview();
        let isStructured = props.columns && props.columns.some(column => column.includes('.'));
        setStructured(isStructured);
        isStructured && getPreview();
        setExportModalVisibility(true);
    };


    const getPreview = async () => {
        let query = {
            savedQuery: {
                id: '',
                name: '',
                description: '',
                query: {
                    searchText: searchOptions.query,
                    entityTypeIds: searchOptions.entityTypeIds.length ? searchOptions.entityTypeIds : props.entities,
                    selectedFacets: searchOptions.selectedFacets,
                },
                propertiesToDisplay: props.columns,
            }
        }

        try {
            const response = await getExportQueryPreview(query);
            if (response) {
                const preview = getExportPreview(response);
                const header = preview[0];
                const body = preview[1]
                setTableColumns(header);
                setTableData(body);
            } else {
                setTableColumns([]);
                setTableData([]);
            }
        } catch (error) {
            handleError(error);
        } finally {
            resetSessionTime();
        }

    }

    return (
        <div>
            <ExportQueryModal hasStructured={hasStructured} getPreview={getPreview} tableColumns={tableColumns} tableData={tableData} exportModalVisibility={exportModalVisibility} setExportModalVisibility={setExportModalVisibility} columns={props.columns} />
            {searchOptions.entityTypeIds.length > 0 &&
                <Tooltip title='export this query to CSV'>
                    <FontAwesomeIcon style={{ position: 'fixed', zIndex: 1, cursor: 'pointer' }} icon={faFileExport} size="lg" onClick={displayModal} />
                </Tooltip>
            }
        </div>
    )
}

export default QueryExport;
