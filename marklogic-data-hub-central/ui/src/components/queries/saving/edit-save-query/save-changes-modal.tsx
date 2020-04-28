import React, {useState, useContext, useEffect} from 'react';
import {Modal, Form, Input, Radio, Button} from 'antd';
import {SearchContext} from "../../../../util/search-context";
import styles from '../save-query-modal/save-query-modal.module.scss';
import axios from 'axios';
import {UserContext} from "../../../../util/user-context";

interface Props {
    setSaveChangesModalVisibility: () => void;
    greyFacets:any[];
    toggleApply: (clicked:boolean) => void;
    toggleApplyClicked: (clicked:boolean) => void;
    setSaveNewIconVisibility: (clicked:boolean) => void;
    currentQuery: any
    currentQueryName: string;
    setCurrentQueryName: (name: string) => void;
}

const SaveChangesModal: React.FC<Props> = (props) => {

    const {
        clearAllGreyFacets,
        greyedOptions,
        setAllSearchFacets,
        searchOptions,
    } = useContext(SearchContext);

    const {
        handleError,
        resetSessionTime
    } = useContext(UserContext);


    const [queryName, setQueryName] = useState('');
    const [queryDescription, setQueryDescription] = useState('');
    const [radioOptionClicked, setRadioOptionClicked] = useState(0);
    const [queryEmpty, isQueryEmpty] = useState<any>('');

    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };

    const onCancel = () => {
        props.setSaveChangesModalVisibility();
    }

    useEffect(() => {
        if (props.currentQuery && JSON.stringify(props.currentQuery) != JSON.stringify({}) && props.currentQuery.hasOwnProperty('savedQuery') && props.currentQuery.savedQuery.hasOwnProperty('name')) {
            setQueryName(props.currentQuery.savedQuery.name);
            if (props.currentQuery.savedQuery.hasOwnProperty('description')) {
                setQueryDescription(props.currentQuery.savedQuery.description);
            }
        }
    }, [props.currentQuery]);

    const onOk = async (queryName, queryDescription, currentQuery) => {
        let facets = {...searchOptions.selectedFacets}
        switch(radioOptionClicked) {
            case 1:
               // setAllSearchFacets(searchOptions.selectedFacets);
               // setAllSearchFacets(greyedOptions.selectedFacets);
                facets = {...facets,...greyedOptions.selectedFacets};
                setAllSearchFacets(facets)
                clearAllGreyFacets();
                props.toggleApplyClicked(true);
                props.toggleApply(false);
                break;
            case 2:
                break;
            case 3:
                clearAllGreyFacets();
                props.toggleApplyClicked(true);
                props.toggleApply(false);
        }
        if (queryName.length > 0 && queryName.trim().length !== 0) {
            currentQuery.savedQuery.name = queryName;
            currentQuery.savedQuery.description = queryDescription;
            if(currentQuery.hasOwnProperty('savedQuery') && currentQuery.savedQuery.hasOwnProperty('query')){
                currentQuery.savedQuery.query.selectedFacets = facets;
                currentQuery.savedQuery.query.searchText = searchOptions.query;
                currentQuery.savedQuery.query.entityTypeIds = searchOptions.entityTypeIds;
            }
            try {
                //const response = await updateQuery(currentQuery);
                const response = await axios.put(`/api/entitySearch/savedQueries`, currentQuery);
                if (response.data) {
                    props.setSaveChangesModalVisibility()
                }
            } catch (error) {
                handleError(error);
            } finally {
                resetSessionTime();
            }
        } else {
            isQueryEmpty('error')
        }
        props.setCurrentQueryName(queryName);
    }

    const handleChange = (event) => {
        if (event.target.id === 'save-changes-query-name') {
            setQueryName(event.target.value);
        }
        if (event.target.id === 'save-changes-query-description') {
            setQueryDescription(event.target.value);
        }
    }

    const unAppliedFacets = (e) => {
        setRadioOptionClicked(e.target.value)
    }


    return (
        <Modal
            visible={true}
            title={'Save Query'}
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
                    help={ queryEmpty === 'error' ? 'Query name is required' : ''}
                >
                    <Input
                        id="save-changes-query-name"
                        value={queryName}
                        placeholder={'Enter query name'}
                        onChange={handleChange}
                    />
                </Form.Item>
                <Form.Item
                    colon={false}
                    label='Description:'
                    labelAlign="left"
                >
                    <Input
                        id="save-changes-query-description"
                        value={queryDescription}
                        onChange={handleChange}
                        placeholder={'Enter query description'}
                    />
                </Form.Item>
                {props.greyFacets.length > 0  && <Form.Item
                    colon={false}
                    label='Unapplied Facets:'
                    labelAlign="left"
                >
                    <Radio.Group onChange={unAppliedFacets} style={{'marginTop': '11px'}} defaultValue={2}>
                        <Radio value={1}> Apply before saving</Radio>
                        <Radio value={2}> Save as is, keep unapplied facets</Radio>
                        <Radio value={3}> Discard unapplied facets</Radio>
                    </Radio.Group>
                </Form.Item>}
                <Form.Item>
                    <div className={styles.submitButtons}>
                        <Button onClick={() => onCancel()}>Cancel</Button>
                        &nbsp;&nbsp;
                        <Button type="primary"
                                htmlType="submit"
                                disabled={queryName.length === 0}
                                onClick={()=> onOk(queryName, queryDescription, props.currentQuery)} id='edit-save-changes-button'>Save
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default SaveChangesModal;


