import React, { useState, useEffect, useContext } from 'react';
import { Modal, Table } from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faFileExport, faLink, faTrashAlt, faListOl, faTimes } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from '../../../../util/user-context';
import { queryDateConverter } from '../../../../util/date-conversion';
import EditQueryDialog from '../edit-query-dialog/edit-query-dialog';
import { SearchContext } from '../../../../util/search-context';
import styles from './manage-query.module.scss';
import { fetchQueries, removeQuery } from '../../../../api/queries';
import axios from "axios";
import { getSavedQueryPreview } from '../../../../api/queries';
import ExportQueryModal from '../../../query-export/query-export-modal/query-export-modal';
import { getExportPreview } from '../../../query-export/export-preview/export-preview';
import { QueryOptions } from '../../../../types/query-types';

const QueryModal = (props) => {
    const {
        applySaveQuery,
        searchOptions,
        setManageQueryModal,
        clearAllGreyFacets,
        setSavedQueries
    } = useContext(SearchContext);

    const { handleError } = useContext(UserContext);
    const [editModalVisibility, setEditModalVisibility] = useState(false);
    const [deleteModalVisibility, setDeleteModalVisibility] = useState(false);
    const [exportModalVisibility, setExportModalVisibility] = useState(false);
    const [recordID, setRecordID] = useState();
    const [tableColumns, setTableColumns] = useState<Object[]>();
    const [tableData, setTableData] = useState<Object[]>();
    const [query, setQuery] = useState({});
    const [hasStructured, setStructured] = useState<boolean>(false);
    const data = new Array();

    const getQueries = async () => {
        try {
            const response = await fetchQueries();
            if (response['data']) {
                props.setQueries(response['data']);
                setSavedQueries(response['data']);
            }
        } catch (error) {
            handleError(error);
        }
    };

    const editQuery = async (query) => {
        const response = await axios.put(`/api/entitySearch/savedQueries`, query);
        if (response.data) {
            props.setQueries(response.data);
            setSavedQueries(response.data);
            return { code: response.status };
        }
    };

    const deleteQuery = async (query) => {
        try {
            await removeQuery(query);
        } catch (error) {
            handleError(error);
        }
        getQueries();
    };

    const onEdit = () => {
        setEditModalVisibility(true);
    };

    const onDelete = () => {
        setDeleteModalVisibility(true);
    };

    const onClose = () => {
        setManageQueryModal(false);
    };

    const onOk = (query) => {
        deleteQuery(query);
        setDeleteModalVisibility(false);
        clearAllGreyFacets();
        let options: QueryOptions = {
            searchText: '',
            entityTypeIds: query.savedQuery.query.entityTypeIds,
            selectedFacets: {},
            selectedQuery: 'select a query',
            propertiesToDisplay: [],
            zeroState: searchOptions.zeroState,
            manageQueryModal: true,
            sortOrder: [],
            database: searchOptions.database,
        };
        applySaveQuery(options);
        props.setCurrentQueryDescription('');
    };

    const onCancel = () => {
        setDeleteModalVisibility(false);
    };

    const onApply = (e) => {
        props.queries && props.queries.length > 0 && props.queries.forEach(query => {
            if (e.currentTarget.dataset.id === query['savedQuery']['name']) {
                let options: QueryOptions = {
                    searchText: query['savedQuery']['query']['searchText'],
                    entityTypeIds: query['savedQuery']['query']['entityTypeIds'],
                    selectedFacets: query['savedQuery']['query']['selectedFacets'],
                    selectedQuery: query['savedQuery']['name'],
                    propertiesToDisplay: query.savedQuery.propertiesToDisplay,
                    zeroState: query.zeroState,
                    manageQueryModal: query.manageQueryModal,
                    sortOrder: query.savedQuery.sortOrder,
                    database: searchOptions.database,
                };
                applySaveQuery(options);
                props.setCurrentQueryDescription(query['savedQuery']['description']);
            }
        });
        props.toggleApply(false);
    };

    const displayExportModal = (id) => {
        setRecordID(id);
        let query;
        props.queries.map((selectedQuery) => {
            if (selectedQuery['savedQuery']['id'] === id) {
                query = selectedQuery;
            }
        });

        let arrayProperties = new Array();
        props.entityDefArray && props.entityDefArray.forEach(entity => {
            if (entity.name === query.savedQuery.query.entityTypeIds[0]) {
                entity.properties && entity.properties.forEach(prop => {
                    if (prop.ref.length === 0 && prop.datatype === 'array') {
                        arrayProperties.push(prop.name);
                    }
                });
            }
        });

        let hasArray = query.savedQuery.propertiesToDisplay.length > 0 && arrayProperties.length > 0 && query.savedQuery.propertiesToDisplay.some((prop => arrayProperties.includes(prop)));
        let isStructured = query && query.savedQuery.propertiesToDisplay && query.savedQuery.propertiesToDisplay.some(column => column.includes('.'));
        setStructured(hasArray || isStructured);
        (hasArray || isStructured) && getPreview(id);
        setExportModalVisibility(true);
    };

    const columns : any = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            width: 200,
            sortDirections: ["ascend", "descend", "ascend"],
            defaultSortOrder: "ascend",
            render: text => <a data-id={text} data-testid={text} className={styles.name} onClick={onApply}>{text}</a>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortDirections: ["ascend", "descend", "ascend"],
            width: 200,
            render: text => <div className={styles.cell}>{text}</div>,
        },
        {
            title: 'Edited',
            dataIndex: 'edited',
            key: 'edited',
            sortDirections: ["ascend", "descend", "ascend"],
            sorter: (a, b) => a.edited.localeCompare(b.edited),
            width: 200,
            render: text => <div className={styles.cell}>{text}</div>,
        }
    ];

    const editObj = {
        title: 'Edit',
        dataIndex: 'edit',
        key: 'edit',
        align: 'center' as 'center',
        render: text => <a data-testid={'edit'} onClick={onEdit}>{text}</a>,
        width: 75
    };

    // TODO: Uncomment once link for query is implemented
    // const linkObj = {
    //     title: 'Link',
    //     dataIndex: 'link',
    //     key: 'link',
    //     align: 'center' as 'center',
    //     width: 75,
    //     render: text => <a data-testid={'link'}>{text}</a>
    // };

    const deleteObj = {
        title: 'Delete',
        dataIndex: 'delete',
        key: 'delete',
        align: 'center' as 'center',
        render: text => <a data-testid={'delete'} onClick={onDelete}>{text}</a>,
        width: 75
    };

    const exportObj = {
        title: 'Export',
        dataIndex: 'export',
        key: 'export',
        align: 'center' as 'center',
        render: text => <a data-testid={'export'} >{text}</a>,
        onCell: record => {
            return {
                onClick: () => {
                    displayExportModal(record.key);
                }
            };
        },
        width: 75
    };

    if (props.isSavedQueryUser) {
        columns.push(editObj);
    }

    if (props.canExportQuery) {
        columns.push(exportObj);
    }

    if (props.isSavedQueryUser) {
        // TODO: Uncomment once link for query is implemented
        // columns.push(linkObj);
        columns.push(deleteObj);
    }

    props.queries && props.queries.length > 0 && props.queries.forEach(query => {
        data.push(
            {
                key: query['savedQuery']['id'],
                name: query['savedQuery']['name'],
                description: query['savedQuery']['description'],
                edited: queryDateConverter(query['savedQuery']['systemMetadata']['lastUpdatedDateTime']),
                edit: <FontAwesomeIcon icon={faPencilAlt} color='#5B69AF' size='lg' />,
                export: <FontAwesomeIcon icon={faFileExport} color='#5B69AF' size='lg' />,
                // TODO: Uncomment once link for query is implemented
                // link: <FontAwesomeIcon icon={faLink} color='#5B69AF' size='lg' />,
                delete: <FontAwesomeIcon icon={faTrashAlt} color='#B32424' size='lg' />
            }
        );
    });

    const deleteConfirmation = <Modal
        visible={deleteModalVisibility}
        okText='Yes'
        cancelText='No'
        onOk={() => onOk(query)}
        onCancel={() => onCancel()}
        width={400}
        maskClosable={false}
    >
        <span style={{ fontSize: '16px', position: 'relative', top:'10px'}} data-testid='deleteConfirmationText'>
            Are you sure you would like to delete the <b>{props.currentQueryName}</b> query? This action cannot be undone.
        </span>
    </Modal>;

    const getPreview = async (id) => {
        try {
            const response = await getSavedQueryPreview(id, searchOptions.database);
            if (response.data) {
                const preview = getExportPreview(response.data);
                const header = preview[0];
                const body = preview[1];
                setTableColumns(header);
                setTableData(body);
            } else {
                setTableColumns([]);
                setTableData([]);
            }
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <div>
            <ExportQueryModal hasStructured={hasStructured} queries={props.queries} tableColumns={tableColumns} tableData={tableData} recordID={recordID} exportModalVisibility={exportModalVisibility} setExportModalVisibility={setExportModalVisibility} columns={props.columns} />
            <Modal
                title={null}
                visible={props.modalVisibility}
                onCancel={onClose}
                width={1000}
                footer={null}
                maskClosable={false}
                closeIcon={<FontAwesomeIcon icon={faTimes} className={'manage-modal-close-icon'} />}
            >
                <p className={styles.title} data-testid="manage-queries-modal">{"Manage Queries"}</p>
                <Table columns={columns} dataSource={data}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                props.queries.forEach((query) => {
                                    if (query['savedQuery']['id'] === record.key) {
                                        setQuery(query);
                                        props.setCurrentQueryName(record.name);
                                    }
                                });
                            }
                        };
                    }}
                >
                </Table>
            </Modal>
            <EditQueryDialog
                currentQueryName={props.currentQueryName}
                setCurrentQueryName={props.setCurrentQueryName}
                currentQueryDescription={props.currentQueryDescription}
                setCurrentQueryDescription={props.setCurrentQueryDescription}
                query={query}
                editQuery={editQuery}
                getQueries={getQueries}
                editModalVisibility={editModalVisibility}
                setEditModalVisibility={setEditModalVisibility}
            />
            {deleteConfirmation}
        </div>
    );
};

export default QueryModal;
