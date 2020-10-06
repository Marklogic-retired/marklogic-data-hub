import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Icon, Input, Modal } from 'antd';
import styles from './entity-type-modal.module.scss';

import { UserContext } from '../../../util/user-context';
import { ModelingTooltips } from '../../../config/tooltips.config';
import { updateModelInfo } from "../../../api/modeling";
import { MLTooltip } from '@marklogic/design-system';


type Props = {
  isVisible: boolean;
  isEditModal: boolean;
  name: string;
  description: string;
  toggleModal: (isVisible: boolean) => void;
  updateEntityTypesAndHideModal: (entityName: string, description: string) => void;
};

const EntityTypeModal: React.FC<Props> = (props) => {
  const { handleError } = useContext(UserContext);
  const NAME_REGEX = new RegExp('^[A-Za-z][A-Za-z0-9_-]*$');
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  const [name, setName] = useState('');
  const [, toggleIsNameDisabled] = useState(true);
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, toggleLoading] = useState(false);

  useEffect(() => {
    if (props.isVisible) {
      if (props.isEditModal) {
        setName(props.name);
        setDescription(props.description);
      } else {
        // Add Modal
        setName('');
        setDescription('');
      }
      setErrorMessage('');
      toggleIsNameDisabled(true);
      toggleLoading(false);
    }
  }, [props.isVisible]);

  const handleChange = (event) => {
    if (event.target.id === 'entity-name') {
      if (event.target.value === '') {
        toggleIsNameDisabled(true);
      } else {
        toggleIsNameDisabled(false);
        setErrorMessage('');
      }
      setName(event.target.value);
    }
    if (event.target.id === 'description') {
      setDescription(event.target.value);
    }
  };

  const updateEntityDescription = async (name: string, description: string) => {
    try {
      const response = await updateModelInfo(name, description);
      if (response['status'] === 200) {
        props.updateEntityTypesAndHideModal(name, description);
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty('message')) {
          setErrorMessage(error['response']['data']['message']);
        }
      } else {
        handleError(error);
      }
    }
  };

  const createEntityType = async (name: string, description: string) => {
    try {
      const response = await axios.post('/api/models', { name, description });
      if (response['status'] === 201) {
        props.updateEntityTypesAndHideModal(name, description);
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.hasOwnProperty('message')) {
          setErrorMessage(error['response']['data']['message']);
        }
      } else {
        handleError(error);
      }
      toggleLoading(false);
    }
  };

  const onOk = (event) => {
    event.preventDefault();
    if (props.isEditModal) {
      updateEntityDescription(name, description);
    } else {
      if (!NAME_REGEX.test(name)) {
        setErrorMessage(ModelingTooltips.nameRegex);
      } else {
        toggleLoading(true);
        createEntityType(name, description);
      }
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
      confirmLoading={props.isEditModal ? false : loading}
      title={props.isEditModal ? "Edit Entity Type" : "Add Entity Type"}
      cancelText="Cancel"
      cancelButtonProps={{ id: 'entity-modal-cancel' }}
      onCancel={() => onCancel()} 
      okText={props.isEditModal ? "OK" : "Add"}
      onOk={onOk}
      okButtonProps={{ id: 'entity-modal-add', form:'entity-type-form', htmlType: 'submit' }}
      maskClosable={false}
    >
      <Form
        {...layout}
        id='entity-type-form'
        onSubmit={onOk}
      >
        <Form.Item
          className={styles.formItem}
          label={<span>
            Name:&nbsp;{props.isEditModal ? null : <span className={styles.asterisk}>*</span>}
            &nbsp;
              </span>}
          colon={false}
          labelAlign="left"
          validateStatus={errorMessage ? 'error' : ''}
          help={errorMessage}
        >
          {props.isEditModal ? <span>{name}</span> : <Input
            id="entity-name"
            placeholder="Enter name"
            className={styles.input}
            value={name}
            onChange={handleChange}
            onBlur={handleChange}
          />}
          {props.isEditModal ? null : <MLTooltip title={ModelingTooltips.nameRegex}>
            <Icon type="question-circle" className={styles.icon} theme="filled" />
          </MLTooltip>}
        </Form.Item>

        <Form.Item
          label={<span className={styles.label}>Description:</span>}
          labelAlign="left"
          className={styles.formItem}
          colon={false}
        >
          <Input
            id="description"
            placeholder="Enter description"
            className={styles.input}
            value={description}
            onChange={handleChange}
            onBlur={handleChange}
          />
          <MLTooltip title={ModelingTooltips.entityDescription}>
            <Icon type="question-circle" className={styles.icon} theme="filled" />
          </MLTooltip>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EntityTypeModal;
