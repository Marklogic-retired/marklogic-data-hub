import { Modal, Form, Input, Button, Tooltip, Icon, Progress, Upload, Select, Collapse, Switch, message } from "antd";
import React, { useState, useEffect, useContext } from "react";
import styles from './load-data-settings-dialog.module.scss';
import { NewLoadTooltips } from '../../../config/tooltips.config';
import Axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { RolesContext } from "../../../util/roles";

const LoadDataSettingsDialog = (props) => {

  const [tgtDatabase, setgtDatabase] = useState(props.stepData && props.stepData != {} ? 'data-hub-STAGING' : 'data-hub-STAGING');
  const[ additionalCollection, setAdditionalCollection ] = useState([])
  const [isTgtDatabaseTouched, setTgtDatabaseTouched] = useState(false);
  const [targetPermissions, setTargetPermissions] = useState('rest-reader,read,rest-writer,update');
  const [provGranularity, setProvGranularity] = useState('Coarse-grained');
  const [module, setModule] = useState('');
  const [cHparameters, setCHparameters] = useState(JSON.stringify({}, null, 4));
  const [user, setUser] = useState('');
  const [runBefore, setRunBefore] = useState(false);
  const [mlcpCommand, setMLCPCommand] = useState('');
  const [toExpand, setToExpand] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  //For Role based access of artifacts
  const roleService = useContext(RolesContext);
  const canReadOnly = roleService.canReadLoadData();
  const canReadWrite = roleService.canWriteLoadData();


  const tgtDatabaseOptions = {
    'data-hub-STAGING': 'data-hub-STAGING',
    'data-hub-FINAL': 'data-hub-FINAL'
  }
  const provGranOptions = ['Coarse-grained', 'OFF'];

  let mlcp = {};

  useEffect(() => {
    if (props.stepData && JSON.stringify(props.stepData) != JSON.stringify({})){
      
      setAdditionalCollection(props.stepData.additionalCollection);
      setTargetPermissions(props.stepData.targetPermissions);
      setModule(props.stepData.module);
      setCHparameters(props.stepData.parameters);
      setProvGranularity(props.stepData.provenanceGranularity);
      setUser(props.stepData.user);
      setRunBefore(props.stepData.runBefore);

    }

    return () => {
      updateMlcpCommand();
    };
  })



  const onCancel = () => {
    console.log('On cancel called')
    if(checkDeleteOpenEligibility()){
      setDeleteDialogVisible(true);
    }
  }

  const onOk = () => {
    console.log('On Ok called')
    props.setOpenLoadDataSettings(false)
  }

  const checkDeleteOpenEligibility = () => {
    if (props.stepData && JSON.stringify(props.stepData) != JSON.stringify({})){
      
      if(tgtDatabase === props.stepData.targetDatabase
      && additionalCollection === props.stepData.additionalCollection
      && targetPermissions === props.stepData.targetPermissions
      && module === props.stepData.module
      && cHparameters === props.stepData.parameters
      && provGranularity === props.stepData.provenanceGranularity
      && user === props.stepData.user
      && runBefore === props.stepData.runBefore
      ) {
              return false; 
        } else {
          return true;
         }  
      
    } else {
          return true;
    }
  }

  const onDelOk = () => {
    props.setOpenLoadDataSettings(false)
    setDeleteDialogVisible(false)
  }

  const onDelCancel = () => {
    setDeleteDialogVisible(false)
  }

  const deleteConfirmation = <Modal
        visible={deleteDialogVisible}
        bodyStyle={{textAlign: 'center'}}
        width={250}
        maskClosable={false}
        closable={false}
        footer={null}
    >
        <span className={styles.ConfirmationMessage}>Discard changes?</span><br/><br/>
      
        <div >
            <Button onClick={() => onDelCancel()}>No</Button>
            &nbsp;&nbsp;
            <Button type="primary" htmlType="submit" onClick={onDelOk}>Yes</Button>
          </div>
    </Modal>;

  const handleSubmit = () => {
    console.log('Save button called')
    //props.setOpenLoadDataSettings(false)
  }
  const handleChange = (event) => {
    if (event.target.id === 'name') {
      if (event.target.value === ' ') {
        //setStepNameTouched(false);
      }
      else {
        //setStepNameTouched(true);
        //setStepName(event.target.value);
      }
    }

    if (event.target.id === 'targetPermissions') {
      setTargetPermissions(event.target.value)
    }

    if (event.target.id === 'module') {
      setModule(event.target.value)
    }

    if (event.target.id === 'cHparameters') {
      setCHparameters(event.target.value)
    }

    if (event.target.id === 'user') {
      setUser(event.target.value)
    }

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

  const handleProvGranularity = (value) => {

    if (value === ' ') {
      //setTgtDatabaseTouched(false);
    }
    else {
      //setTgtDatabaseTouched(true);
      setProvGranularity(value);
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

  const handleRunBefore = (checked, event) => {
    if (checked) {
      setRunBefore(true);
    } else {
      setRunBefore(false);
    }
  }

  //Build MLCP Command from the existing fields
  const buildMlcpOptions = () => {
    const options: Array<any> = [];

    addMlcpOption(options, 'import', null, false, false);
    addMlcpOption(options, 'mode', 'local', false, true);

    const host = 'localhost';
    const port = '8010';
    const username = localStorage.getItem('dataHubUser');
    let input_file_path = props.stepData && props.stepData.inputFilePath ? props.stepData.inputFilePath : '';
    let in_file_tp = props.stepData.sourceFormat;
    let input_file_type = (in_file_tp !== 'csv') ? 'documents' : 'delimited_text';
    let document_type = props.stepData && props.stepData.targetFormat ? props.stepData.targetFormat.toLowerCase() : '';
    let delimiter = props.stepData.separator;
    let output_permissions = targetPermissions;
    let step_number = 1;//String(flow.steps.findIndex(i => i.id === step.id)+1);
    let transform_param = 'flow-name=XYZ,Step=abc';//`flow-name=${encodeURIComponent(flow.name)},step=${encodeURIComponent(step_number)}`
    let collections = 'Collections'; //step.options.collections;
    let output_uri_replace = props.stepData.outputURIReplacement;
    addMlcpOption(options, 'host', host, false, true);
    addMlcpOption(options, 'port', port, false, true);
    addMlcpOption(options, 'username', username, false, true);
    addMlcpOption(options, 'password', '*****', false, true);
    addMlcpOption(options, 'input_file_path', input_file_path, false, true);
    addMlcpOption(options, 'input_file_type', input_file_type, false, true);
    if (input_file_type === 'delimited_text') {
      addMlcpOption(options, 'generate_uri', 'true', false, true);
    };
    if (input_file_type === 'delimited_text' && delimiter !== ',') {
      addMlcpOption(options, 'delimiter', delimiter, false, true);
    };
    addMlcpOption(options, 'output_collections', collections, false, true);
    if (output_permissions) {
      addMlcpOption(options, 'output_permissions', output_permissions, false, true);
    };
    if (output_uri_replace) {
      addMlcpOption(options, 'output_uri_replace', output_uri_replace, false, true);
    };
    addMlcpOption(options, 'document_type', document_type, false, true);
    addMlcpOption(options, 'transform_module', '/data-hub/5/transforms/mlcp-flow-transform.sjs', false, true);
    addMlcpOption(options, 'transform_namespace', 'http://marklogic.com/data-hub/mlcp-flow-transform', false, true);
    addMlcpOption(options, 'transform_param', transform_param, false, true);

    return options;
  }


  const addMlcpOption = (options: any, key: string, value: any, isOtherOption: boolean, appendDash: boolean) => {
    if (appendDash) {
      options.push('-' + key);
    } else {
      options.push(key);
    }

    if (value) {
      if (isOtherOption) {
        mlcp[key] = value;
      }
      if (value.type !== 'boolean' && value.type !== 'number') {
        value = '"' + value + '"';
      }
      options.push(value);
    }
  }

  const updateMlcpCommand = () => {
    let mlcpCommand = 'mlcp';
    mlcpCommand += (navigator.appVersion.indexOf('Win') !== -1) ? '.bat' : '.sh';
    mlcpCommand += ' ' + buildMlcpOptions().join(' ');

    mlcpCommand = mlcpCommand;

    setMLCPCommand(mlcpCommand);
    return mlcpCommand;
  }


  //Copy the MLCP Command to the Clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(mlcpCommand);
    message.success('Copied to the Clipboard!');
  }

  const toggleCustomHook = () => {
    if (!toExpand) {
      setToExpand(true);
    } else {
      setToExpand(false);
    }
  }

  const customHookProperties = <div><Form.Item label={<span className={styles.cHItemLabel}>
    Module:&nbsp;
  <Tooltip title={NewLoadTooltips.module}>
      <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
    </Tooltip>
    &nbsp;
</span>} labelAlign="left"
    className={styles.formItem}>
    <Input
      id="module"
      placeholder="Enter module"
      value={module}
      onChange={handleChange}
      disabled={!canReadWrite}
    />
  </Form.Item>
    <Form.Item label={<span className={styles.cHItemLabel}>
      Parameters:&nbsp;
  <Tooltip title={NewLoadTooltips.parameters}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </Tooltip>
      &nbsp;
</span>} labelAlign="left"
      className={styles.formItem}>
      <Input
        id="cHparameters"
        placeholder="Enter parameters"
        value={cHparameters}
        onChange={handleChange}
        disabled={!canReadWrite}
      />
    </Form.Item>
    <Form.Item label={<span className={styles.cHItemLabel}>
      User:&nbsp;
  <Tooltip title={NewLoadTooltips.user}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </Tooltip>
      &nbsp;
</span>} labelAlign="left"
      className={styles.formItem}>
      <Input
        id="user"
        placeholder="Enter user information"
        value={user}
        onChange={handleChange}
        disabled={!canReadWrite}
      />
    </Form.Item>
    <Form.Item label={<span className={styles.cHItemLabel}>
      RunBefore:&nbsp;
  <Tooltip title={NewLoadTooltips.runbefore}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </Tooltip>
      &nbsp;
</span>} labelAlign="left"
      className={styles.formItem}>
      <Switch checkedChildren="ON" unCheckedChildren="OFF" onChange={handleRunBefore} disabled={!canReadWrite}/>
    </Form.Item></div>


  const tgtDbOptions = Object.keys(tgtDatabaseOptions).map(d => <Select.Option key={tgtDatabaseOptions[d]}>{d}</Select.Option>);
  const provGranOpt = provGranOptions.map(d => <Select.Option key={d}>{d}</Select.Option>);
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
            Target Database:&nbsp;&nbsp;
              <Tooltip title={NewLoadTooltips.targetDatabase}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
            </Tooltip>
            &nbsp;
            </span>} labelAlign="left"
            className={styles.formItem}>
            <Select
              id="targetDatabase"
              placeholder="Enter target database"
              value={tgtDatabase}
              onChange={handleTgtDatabase}
              className={styles.formItem}
              disabled={!canReadWrite}>
              {tgtDbOptions}
            </Select>
          </Form.Item>
          <Form.Item label={<span>
            Additional Collections:&nbsp;
              <Tooltip title={NewLoadTooltips.additonalCollections}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
            </Tooltip>
            &nbsp;
            </span>} labelAlign="left" className={styles.formItem}>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Please select"
              defaultValue={['Collection1', 'Collection2']}
              disabled={!canReadWrite}
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
            </span>} labelAlign="left"
            className={styles.formItem}>
            <Input
              id="targetPermissions"
              placeholder="Enter targetPermissions"
              value={targetPermissions}
              onChange={handleChange}
              disabled={!canReadWrite}
            />
          </Form.Item>
          <Form.Item label={<span>
            Provenance Granularity:&nbsp;&nbsp;
              <Tooltip title={NewLoadTooltips.provGranularity}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
            </Tooltip>
            &nbsp;
            </span>} labelAlign="left"
            className={styles.formItem}>
            <Select
              id="provGranularity"
              value={provGranularity}
              onChange={handleProvGranularity}
              disabled={!canReadWrite}
            >
              {provGranOpt}
            </Select>
          </Form.Item>
          <Form.Item label={<span>
            <span className={styles.cHookLabel} onClick={toggleCustomHook}>Custom Hook</span>&nbsp;&nbsp;
              <Icon type="right" className={styles.rightArrow} onClick={toggleCustomHook} rotate={toExpand ? 90 : 0} />
          </span>} labelAlign="left"
            className={styles.formItem}></Form.Item>
          {toExpand ? customHookProperties : ''}

          <Form.Item label={<span>
            MLCP Command:&nbsp;
              <Tooltip title={NewLoadTooltips.mlcpcommand}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
            </Tooltip>
            <span className={styles.readOnlyLabel}>(Read-only)</span>
            <br style={{ lineHeight: '1px', width: '0px', marginBottom: '-20px' }} />
          </span>} labelAlign="left"
            className={styles.formItem}>
            <div className={styles.mlcpCmd}>
              <p>{mlcpCommand}  <Tooltip title={'Click to copy to the clipboard'} placement="bottom"><i><FontAwesomeIcon icon={faCopy} className={styles.copyIcon} size="2x" onClick={copyToClipboard} /></i></Tooltip></p>
            </div>
          </Form.Item>
          <Form.Item className={styles.submitButtonsForm}>
            <div className={styles.submitButtons}>
              <Button onClick={() => onCancel()}>Cancel</Button>
              &nbsp;&nbsp;
            <Button type="primary" htmlType="submit" onClick={handleSubmit} disabled={!canReadWrite}>Save</Button>
            </div>
          </Form.Item>
        </Form>
      </div>
      {deleteConfirmation}
    </Modal>
  );
}

export default LoadDataSettingsDialog;