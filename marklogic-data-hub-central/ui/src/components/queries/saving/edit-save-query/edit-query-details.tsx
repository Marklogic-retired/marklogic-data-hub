import React, {useState, useEffect, useContext} from 'react';
import {Modal, Form, Input, Button} from 'antd';
import styles from '../save-query-modal/save-query-modal.module.scss';
import axios from 'axios';
import {UserContext} from "../../../../util/user-context";

interface Props {
    setEditQueryDetailVisibility: () => void;
    currentQuery: any;
    currentQueryName: string;
    setCurrentQueryName: (name: string) => void;
}

const EditQueryDetails: React.FC<Props> = (props) => {

    const {
        handleError,
        resetSessionTime
    } = useContext(UserContext);


    const [queryName, setQueryName] = useState('');
    const [queryDescription, setQueryDescription] = useState('');
    const [queryEmpty, isQueryEmpty] = useState<any>('');


    useEffect(() => {
        if (props.currentQuery && JSON.stringify(props.currentQuery) != JSON.stringify({}) && props.currentQuery.hasOwnProperty('savedQuery') && props.currentQuery.savedQuery.hasOwnProperty('name')) {
            setQueryName(props.currentQuery.savedQuery.name);
            if (props.currentQuery.savedQuery.hasOwnProperty('description')) {
                setQueryDescription(props.currentQuery.savedQuery.description);
            }
        }
    }, [props.currentQuery]);

    const layout = {
        labelCol: {span: 6},
        wrapperCol: {span: 18},
    };


    const onCancel = () => {
        props.setEditQueryDetailVisibility()
    }

    const onOk = async (queryName, queryDescription, currentQuery) => {
        if (queryName.length > 0 && queryName.trim().length !== 0) {
            currentQuery.savedQuery.name = queryName;
            currentQuery.savedQuery.description = queryDescription;
            try {
                //const response = await updateQuery(currentQuery);
                const response = await axios.put(`/api/entitySearch/savedQueries`, currentQuery);
                if (response.data) {
                    props.setEditQueryDetailVisibility()
                }
            } catch (error) {
                handleError(error);
            } finally {
                resetSessionTime();
            }
        } else {
            isQueryEmpty('error')
        }
        props.setCurrentQueryName(queryName)
    }


    const handleChange = (event) => {
        if (event.target.id === 'edit-query-detail-name') {
            setQueryName(event.target.value);
        }
        if (event.target.id === 'edit-query-detail-description') {
            setQueryDescription(event.target.value);
        }
    }


    return (
        <Modal
            visible={true}
            title={'Edit Query Details'}
            closable={true}
            onCancel={() => onCancel()}
            maskClosable={true}
            footer={null}
        >
            <Form
                name="basic"
                {...layout}
            >
                <Form.Item
                    colon={false}
                    label={<span className={styles.text}>
                           Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
                        </span>}
                    labelAlign="left"
                    validateStatus={queryEmpty}
                    help={queryEmpty === 'error' ? 'New query name is required' : ''}
                >
                    <Input
                        id="edit-query-detail-name"
                        value={queryName}
                        placeholder={'Enter new query name'}
                        onChange={handleChange}
                    />
                </Form.Item>
                <Form.Item
                    colon={false}
                    label='Description:'
                    labelAlign="left"
                >
                    <Input
                        id="edit-query-detail-description"
                        value={queryDescription}
                        onChange={handleChange}
                        placeholder={'Enter new query description'}
                    />
                </Form.Item>
                <Form.Item>
                    <div className={styles.submitButtons}>
                        <Button onClick={() => onCancel()}>Cancel</Button>
                        &nbsp;&nbsp;
                        <Button type="primary"
                                htmlType="submit"
                                disabled={queryName.length === 0}
                                onClick={() => onOk(queryName, queryDescription, props.currentQuery)}
                                id='edit-query-detail-button'>Save
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default EditQueryDetails;


