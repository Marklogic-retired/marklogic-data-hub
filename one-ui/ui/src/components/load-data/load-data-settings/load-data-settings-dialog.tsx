import { Modal, Form, Input, Button, Tooltip, Icon, Progress, Upload, Select, Collapse, Switch } from "antd";
import React, { useState, useEffect } from "react";
import styles from './load-data-settings-dialog.module.scss';
import {NewLoadTooltips} from '../../../config/tooltips.config';
import Axios from "axios";

const LoadDataSettingsDialog = (props) => {

    const [tgtDatabase, setgtDatabase] = useState(props.stepData && props.stepData != {} ? props.stepData.targetFormat : 'data-hub-STAGING');
    const [isTgtDatabaseTouched, setTgtDatabaseTouched] = useState(false);
    const [targetPermissions,setTargetPermissions] = useState('rest-reader,read,rest-writer,update');
    
    const tgtDatabaseOptions = {
      'data-hub-STAGING': 'data-hub-STAGING',
      'data-hub-FINAL': 'data-hub-FINAL'
  }

    const onCancel = () => {
        console.log('On cancel called') 
        props.setOpenLoadDataSettings(false)
    }
    
    const onOk = () => {
        console.log('On Ok called')
        props.setOpenLoadDataSettings(false)
    }

    const handleSubmit = () => {
        console.log('Save button called')
        //props.setOpenLoadDataSettings(false)
    }

    const handleTgtDatabase = (value) => {

      if (value === ' ') {
        setTgtDatabaseTouched(false);
      }
      else {
        setTgtDatabaseTouched(true);
        setgtDatabase(value);
      }
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


      const { Panel } = Collapse;
      const tgtDbOptions = Object.keys(tgtDatabaseOptions).map(d => <Select.Option key={tgtDatabaseOptions[d]}>{d}</Select.Option>);
    return (
        <Modal
        visible={props.openLoadDataSettings}
        title={null}
        width="700px"
        onCancel={() => onCancel()}
        onOk={() => onOk()}
        okText="Save"
        className={styles.SettingsModal}
        footer={null}>
        <p className={styles.title}>Load Data Settings</p>
        <br />
        <div className={styles.newDataLoadForm}>
            <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
            <Form.Item label={<span>
          Target Database:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
              <Tooltip title={NewLoadTooltips.targetDatabase}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
          <Select
            id="targetDatabase"
            placeholder="Enter target database"
            value={tgtDatabase}
            onChange={handleTgtDatabase}
            >
            {tgtDbOptions}
          </Select>
        </Form.Item>
        <Form.Item label={<span>
          Additional Collections:&nbsp;
              <Tooltip title={NewLoadTooltips.additonalCollections}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
            <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Please select"
                defaultValue={['Collection1', 'Collection2']}
                // onChange={handleChange}
                >
            
            </Select>
        </Form.Item>
        <Form.Item label={<span>
          Target Permissions:&nbsp;
              <Tooltip title={NewLoadTooltips.targetPermissions}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
          <Input
            id="targetPermissions"
            placeholder="Enter targetPermissions"
            value={targetPermissions}
            // onChange={handleChange}
          />
        </Form.Item>
        
        <Collapse 
        bordered={false}
        defaultActiveKey={['1']} className={styles.accordian}>
        <Panel header="Custom Hook" key="1" className={styles.accordianPanel}>
        <Form.Item label={<span>
          Module:&nbsp;
              <Tooltip title={NewLoadTooltips.module}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
          <Input
            id="module"
            placeholder="Enter module"
            // value={description}
            // onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label={<span>
          Parameters:&nbsp;
              <Tooltip title={NewLoadTooltips.parameters}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
          <Input
            id="parameters"
            placeholder="Enter parameters"
            // value={description}
            // onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label={<span>
          User:&nbsp;
              <Tooltip title={NewLoadTooltips.user}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
          <Input
            id="user"
            placeholder="Enter user information"
            // value={description}
            // onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label={<span>
          RunBefore:&nbsp;
              <Tooltip title={NewLoadTooltips.runbefore}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
            <Switch checkedChildren="ON" unCheckedChildren="OFF"  />
        </Form.Item>
            </Panel>
        </Collapse>
        <Form.Item label={<span>
          MLCP Command:&nbsp; 
              <Tooltip title={NewLoadTooltips.mlcpcommand}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          <span className={styles.readOnlyLabel}>(Read-only)</span>
          <br style={{ lineHeight: '1px', width: '0px', marginBottom: '-20px' }} />
        </span>} labelAlign="left">
          <p>Example mlcp command</p>

        </Form.Item>
        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <Button onClick={() => onCancel()}>Cancel</Button>
            &nbsp;&nbsp;
            <Button type="primary" htmlType="submit"  onClick={handleSubmit}>Save</Button>
          </div>
        </Form.Item>
        </Form>
    </div>
        </Modal>

    );
}

export default LoadDataSettingsDialog;