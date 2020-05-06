import React, { useState, useContext } from 'react';
import { Modal, Form, Input, Radio } from 'antd';
import styles from './query-export-modal.module.scss';
import { SearchContext } from '../../../util/search-context';
import { UserContext } from '../../../util/user-context';
import { exportQuery, exportSavedQuery } from '../../../api/queries'


const QueryExportModal = (props) => {
    const [value, setValue] = useState<number>(1);
    const [limit, setLimit] = useState<number>(Number.MAX_SAFE_INTEGER);

    const {
        searchOptions
    } = useContext(SearchContext);

    const {
        handleError,
        resetSessionTime
    } = useContext(UserContext);

    const onClose = () => {
        props.setExportModalVisibility(false);
    };

    const onOk = async () => {
        if (props.recordID) {
            exportSavedQuery(props.recordID, limit)
        } else {
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
                await exportQuery(query, limit);
            } catch (error) {
                handleError(error);
            } finally {
                resetSessionTime();
            }
        }

        props.setExportModalVisibility(false);
        setValue(1)
        setLimit(Number.MAX_SAFE_INTEGER)
    }

    const onChange = e => {
        setValue(e.target.value);
    };

    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 16 },
    };

    const layoutInput = {
        labelCol: { span: 11 },
        wrapperCol: { span: 11 },
    };

    const exportConfirmation = <Modal
        title="Export"
        visible={props.exportModalVisibility}
        okText='Export'
        cancelText='Cancel'
        onOk={() => onOk()}
        okButtonProps={{ disabled: limit <= 0 }}
        onCancel={() => onClose()}
        width={500}
        maskClosable={false}
    >
        <Form
            {...layout}
            name="basic"
            data-testid='query-export-form'
        >
            <p className={styles.text}>Export to a CSV file containing the columns of data currently displayed.</p>

            <Form.Item
                colon={false}
                label='Rows:'
                labelAlign="left"
                className={styles.text}
            >
                <Radio.Group className={styles.radio} value={value} onChange={onChange}>
                    <Radio value={1}> All</Radio>
                    <br />
                    <Radio value={2}> Limited set of the first rows returned</Radio>
                </Radio.Group>
            </Form.Item>
        </Form>
        <Form
            {...layoutInput}
            name="basic"
        >
            {value === 2 && <div style={{ marginLeft: '10px', marginBottom: '-25px' }}>
                <Form.Item
                    colon={false}
                    label='Maximum rows:'
                    className={styles.text}
                ><Input data-testid='max-rows-input' className={styles.text} type='number' min='1' onChange={e => setLimit(Number(e.target.value))} style={{ width: 60 }} />
                </Form.Item>
            </div>
            }
        </Form>
    </Modal>

    return (
        <div>
            {exportConfirmation}
        </div>
    )
}

export default QueryExportModal;
