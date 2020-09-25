import {
    Modal,
    Form
} from 'antd';
import React, { useState, useContext, useEffect } from 'react';
import styles from './add-merge-rule-dialog.module.scss';
import { MLButton, MLTooltip } from '@marklogic/design-system';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import EntityPropertyTreeSelect from '../../../entity-property-tree-select/entity-property-tree-select';
import { Definition } from '../../../../types/modeling-types';
import { CurationContext } from '../../../../util/curation-context';
import arrayIcon from '../../../../assets/icon_array.png';

type Props = {
    data: any;
    openAddMergeRuleDialog: boolean;
    setOpenAddMergeRuleDialog: (openAddMergeRuleDialog: boolean) => void;
};

const DEFAULT_ENTITY_DEFINITION: Definition = {
    name: '',
    properties: []
};

const AddMergeRuleDialog: React.FC<Props> = (props) => {

    const { curationOptions } = useContext(CurationContext);
    const [entityTypeDefinition, setEntityTypeDefinition] = useState<Definition>(DEFAULT_ENTITY_DEFINITION);
    const [property, setProperty] = useState<string | undefined>(undefined);
    const [propertyTouched, setPropertyTouched] = useState(false);

    const titleLegend = <div className={styles.titleLegend}>
        <div data-testid='multipleIconLegend' className={styles.legendText}><img className={styles.arrayImage} src={arrayIcon}/> Multiple</div>
        <div data-testid='structuredIconLegend' className={styles.legendText}><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> Structured</div>
    </div>

    useEffect(() => {
        if (props.openAddMergeRuleDialog && curationOptions.entityDefinitionsArray.length > 0 && curationOptions.activeStep.entityName !== '') {
            let entityTypeDefinition: Definition = curationOptions.entityDefinitionsArray.find(entityDefinition => entityDefinition.name === curationOptions.activeStep.entityName) || DEFAULT_ENTITY_DEFINITION;
            setEntityTypeDefinition(entityTypeDefinition);
            setProperty(undefined)
        }
    }, [props.openAddMergeRuleDialog]);

    const onCancel = () => {
        props.setOpenAddMergeRuleDialog(false);
    }

    const onOk = () => {
        props.setOpenAddMergeRuleDialog(false);
    }

    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 7 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 15 },
        },
    };

    const handleProperty = (value) => {
        if (value === ' ') {
            setPropertyTouched(false);
        }
        else {
            setPropertyTouched(true);
            setProperty(value);
        }
    }

    const handleSubmit = () => {
        props.setOpenAddMergeRuleDialog(false);
    }

    return (
        <Modal
            visible={props.openAddMergeRuleDialog}
            title={null}
            width="700px"
            onCancel={() => onCancel()}
            onOk={() => onOk()}
            okText="Save"
            className={styles.SettingsModal}
            footer={null}
            maskClosable={false}
            destroyOnClose={true}
        >
            <p className={styles.title}>Add Merge Rule</p>
            <p>Select the property and the merge type for this merge rule. When you select a structured type property, the merge rule is applied to all the properties within that structured type property as well.</p>
            {titleLegend}
            <br />
            <div className={styles.addMergeRuleForm}>
                <Form {...formItemLayout} onSubmit={handleSubmit} colon={true}>
                    <Form.Item
                        label={<span aria-label='formItem-Property'>Property</span>}
                        labelAlign="left"
                        className={styles.formItem}
                    >
                        <EntityPropertyTreeSelect
                            propertyDropdownOptions={entityTypeDefinition.properties}
                            entityDefinitionsArray={curationOptions.entityDefinitionsArray}
                            value={property}
                            onValueSelected={handleProperty}
                        />
                    </Form.Item>
                    <Form.Item className={styles.submitButtonsForm}>
                        <div className={styles.submitButtons}>
                            <MLButton onClick={() => onCancel()}>Cancel</MLButton>&nbsp;&nbsp;
                            <MLButton id={'saveButton'} type="primary" onClick={handleSubmit} >Save</MLButton>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
}

export default AddMergeRuleDialog;