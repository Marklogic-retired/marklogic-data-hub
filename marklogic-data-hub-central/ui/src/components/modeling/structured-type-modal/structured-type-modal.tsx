import React, { useEffect, useState } from 'react';
import { Form, Icon, Input, Modal, Tooltip } from 'antd';
import styles from './structured-type-modal.module.scss'

import { ModelingTooltips } from '../../../config/tooltips.config';

type Props = {
  isVisible: boolean;
  entityDefinitionsArray: any[];
  toggleModal: (isVisible: boolean) => void;
  updateStructuredTypesAndHideModal: (entityName: string) => void;
};

const StructuredTypeModal: React.FC<Props> = (props) => {
  const NAME_REGEX = new RegExp('^[A-Za-z][A-Za-z0-9_-]*$');
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  const [name, setName] = useState('');
  const [isNameDisabled, toggleIsNameDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setName('');
    setErrorMessage('');
  }, [props.isVisible]);

  const handleChange = (event) => {
    if (event.target.id === 'structured-name') {
      if (event.target.value === '') {
        toggleIsNameDisabled(true);
      } else {
        toggleIsNameDisabled(false);
        setErrorMessage('');
      }
      setName(event.target.value);
    }
  };

  const onOk = (event) => {
  event.preventDefault();
  let entityDefinitionNamesArray = props.entityDefinitionsArray.map( entity => { return entity.name })
    if (!NAME_REGEX.test(name)) {
      setErrorMessage(ModelingTooltips.nameRegex)
    } else if (entityDefinitionNamesArray.includes(name)) {
      setErrorMessage(`A structured type already exists with a name of ${name}`)
    } else {
      props.updateStructuredTypesAndHideModal(name);
      props.toggleModal(false);
    }
  };

  const onCancel = () => {
    props.toggleModal(false);
  };

  return (
    <Modal
      className={styles.modal}
      visible={props.isVisible}
      closable={true}
      title={"Add New Structured Property Type"}
      cancelText="Cancel"
      cancelButtonProps={{ id: 'structured-modal-cancel' }}
      onCancel={() => onCancel()} 
      okText={"Add"}
      onOk={onOk}
      okButtonProps={{ id: 'structured-modal-add', form:'structured-type-form', htmlType: 'submit' }}
      maskClosable={false}
    >
      <Form
        {...layout}
        id='structured-type-form'
        onSubmit={onOk}
      >
        <Form.Item
          className={styles.formItem}
          label={<span>
            Name:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
              </span>}
          colon={false}
          labelAlign="left"
          validateStatus={errorMessage ? 'error' : ''}
          help={errorMessage}
        >
          <Input
            id="structured-name"
            placeholder="Enter name"
            aria-label="structured-input-name"
            className={styles.input}
            value={name}
            onChange={handleChange}
            onBlur={handleChange}
          />
          <Tooltip title={ModelingTooltips.nameRegex}>
            <Icon type="question-circle" className={styles.icon} theme="filled" />
          </Tooltip>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default StructuredTypeModal;
