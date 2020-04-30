import React, { useState, useContext } from 'react';
import { Modal, Form, Input, Radio, Button } from 'antd';
import { SearchContext } from "../../../../util/search-context";
import styles from './save-query-modal.module.scss';

interface Props {
    setSaveModalVisibility: () => void;
    saveNewQuery: (queryName: string, queryDescription: string, facets: {}) => void;
    greyFacets: any[];
    toggleApply: (clicked: boolean) => void;
    toggleApplyClicked: (clicked: boolean) => void;
    queryName: any;
    setQueryName: (name: string) => void;
}

const SaveQueryModal: React.FC<Props> = (props) => {
    const {
        clearAllGreyFacets,
        greyedOptions,
        setAllSearchFacets,
        searchOptions,
    } = useContext(SearchContext);

    const [queryName, setQueryName] = useState('');
    const [queryDescription, setQueryDescription] = useState('');
    const [radioOptionClicked, setRadioOptionClicked] = useState(0);
    const [queryEmpty, isQueryEmpty] = useState<any>('');

    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };

    const onCancel = () => {
        props.setSaveModalVisibility();
    }

    const onOk = () => {
        let facets = { ...searchOptions.selectedFacets }
        switch (radioOptionClicked) {
            case 1:
                setAllSearchFacets(searchOptions.selectedFacets);
                setAllSearchFacets(greyedOptions.selectedFacets);
                facets = { ...facets, ...greyedOptions.selectedFacets };
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
            props.saveNewQuery(queryName, queryDescription, facets);
        } else {
            isQueryEmpty('error')
        }
        props.setQueryName(queryName)
    }

    const handleChange = (event) => {
        if (event.target.id === 'save-query-name') {
            setQueryName(event.target.value);
        }
        if (event.target.id === 'save-query-description') {
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
            onOk={() => onOk()}
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
                    help={queryEmpty === 'error' ? 'Query name is required' : ''}
                >
                    <Input
                        id="save-query-name"
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
                        id="save-query-description"
                        value={queryDescription}
                        onChange={handleChange}
                        placeholder={'Enter query description'}
                    />
                </Form.Item>
                {props.greyFacets.length > 0 && <Form.Item
                    colon={false}
                    label='Unapplied Facets:'
                    labelAlign="left"
                >
                    <Radio.Group onChange={unAppliedFacets} style={{ 'marginTop': '11px' }}>
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
                            onClick={() => onOk()} id='save-query-button'>Save
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default SaveQueryModal;


