import React, { useState, useContext } from 'react';
import { Tooltip } from 'antd';
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SearchContext } from '../../util/search-context';
import ExportQueryModal from './query-export-modal/query-export-modal'

const QueryExport = (props) => {

    const [exportModalVisibility, setExportModalVisibility] = useState(false);

    const {
        searchOptions
    } = useContext(SearchContext);

    const displayModal = () => {
        setExportModalVisibility(true);
    };

    return (
        <div >
            <ExportQueryModal exportModalVisibility={exportModalVisibility} setExportModalVisibility={setExportModalVisibility} columns={props.columns} />
            {searchOptions.entityTypeIds.length > 0 &&
                <Tooltip title='export this query to CSV'>
                    <FontAwesomeIcon style={{ position: 'fixed', zIndex: 1, cursor: 'pointer' }} icon={faFileExport} size="lg" onClick={displayModal} />
                </Tooltip>
            }
        </div>
    )
}

export default QueryExport;
