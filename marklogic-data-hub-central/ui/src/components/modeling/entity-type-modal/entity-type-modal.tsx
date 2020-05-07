import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios'
import { Modal, Form, Input, Tooltip, Icon } from 'antd';
import styles from './entity-type-modal.module.scss'

import { UserContext } from '../../../util/user-context';
import { ModelingTooltips } from '../../../config/tooltips.config';

type Props = {
  isVisible: boolean;
  toggleModal: (isVisible: boolean) => void;
  newEntityAdded: () => void;
};

const EntityTypeModal: React.FC<Props> = (props) => {
  const { handleError, resetSessionTime } = useContext(UserContext);
  const NAME_REGEX = new RegExp('^[A-Za-z][A-Za-z0-9_-]*$');
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

  const [name, setName] = useState('');
  const [isNameDisabled, toggleIsNameDisabled] = useState(true);
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (props.isVisible){
      setName('');
      setDescription('');
      setErrorMessage('');
      toggleIsNameDisabled(true);
    }
  }, [props.isVisible]);

  const handleChange = (event) => {
    if (event.target.id === 'name') {
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
  }

  const onOk = (event) => {
    event.preventDefault();
    if (!NAME_REGEX.test(name)) {
      setErrorMessage('Names must start with a letter, and can contain letters, numbers, hyphens, and underscores.')
    } else {
      createEntityType(name, description);
    }
  };

  const createEntityType = async (name: string, description: string) => {
    try {
      const response = await axios.post('/api/models', { name, description });
      if (response['status'] === 201) {
        props.newEntityAdded();
      }
    } catch (error) {
      if (error.response.status === 400) { 
        if (error.response.data.hasOwnProperty('message')) {
          setErrorMessage(error['response']['data']['message']);
        } 
      } else {
        handleError(error);
      } 
    } finally {
      resetSessionTime();
    }
  }

  const onCancel = () => {
    props.toggleModal(false)
  };

  return (
    <Modal
      className={styles.modal}
      visible={props.isVisible} 
      closable={true}
      title={"Add Entity Type"} 
      cancelText="Cancel"
      onCancel={() => onCancel()} 
      okText="Add"
      onOk={onOk}
      okButtonProps={{ form:'entity-type-form', htmlType: 'submit' }}
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
            Name:&nbsp;<span className={styles.asterisk}>*</span>
            &nbsp;
              </span>}
          colon={false}
          labelAlign="left"

          validateStatus={errorMessage ? 'error' : ''}
          help={errorMessage}
        >
          <Input
            id="name"
            placeholder="Enter name"
            className={styles.input}
            value={name}
            onChange={handleChange}
            onBlur={handleChange}
          />
          <Tooltip title={ModelingTooltips.addEntityName}>
            <Icon type="question-circle" className={styles.icon} theme="filled" />
          </Tooltip> 
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
          <Tooltip title={ModelingTooltips.enitityDescription}>
            <Icon type="question-circle" className={styles.icon} theme="filled" />
          </Tooltip>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EntityTypeModal;