import { Modal, Form, Input, Button, Tooltip, Icon, Progress, Upload, Select, Collapse, Switch, message } from "antd";
import React, { useState, useEffect, useContext } from "react";
import styles from './load-data-settings-dialog.module.scss';
import { LoadDataSettings } from '../../../config/tooltips.config';
import Axios from "axios";

import { RolesContext } from "../../../util/roles";

import { RolesContext } from "../../../util/roles";

import { RolesContext } from "../../../util/roles";

import { RolesContext } from "../../../util/roles";

const LoadDataSettingsDialog = (props) => {

  //const [settingsArtifact, setSettingsArtifact] = useState({});
  const [tgtDatabase, setgtDatabase] = useState(props.stepData && props.stepData != {} ? 'data-hub-STAGING' : 'data-hub-STAGING');
  const[ additionalCollections, setAdditionalCollections ] = useState<any[]>([]);
  const [isAddCollTouched, setAddCollTouched] = useState(false);
  const [isTgtDatabaseTouched, setTgtDatabaseTouched] = useState(false);
  const [targetPermissions, setTargetPermissions] = useState('rest-reader,read,rest-writer,update');
  const [isTgtPermissionsTouched, setIsTgtPermissionsTouched] = useState(false);
  const [provGranularity, setProvGranularity] = useState('coarse-grained');
  const [isProvGranTouched, setIsProvGranTouched] = useState(false);
  const [module, setModule] = useState('');
  const [isModuleTouched, setIsModuleTouched] = useState(false);
  const [cHparameters, setCHparameters] = useState(JSON.stringify({}, null, 4));
  const [isCHParamTouched, setIsCHParamTouched] = useState(false);
  const [user, setUser] = useState('');
  const [isUserTouched, setIsUserTouched] = useState(false);
  const [runBefore, setRunBefore] = useState(false);
  const [isRunBeforeTouched, setIsRunBeforeTouched] = useState(false);
  //const [mlcpCommand, setMLCPCommand] = useState('');
  const [toExpand, setToExpand] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isLoading,setIsLoading] = useState(false);

  //For Role based access of artifacts
  const roleService = useContext(RolesContext);
  const canReadOnly = roleService.canReadLoadData();
  const canReadWrite = roleService.canWriteLoadData();

  const tgtDatabaseOptions = {
    'data-hub-STAGING': 'data-hub-STAGING',
    'data-hub-FINAL': 'data-hub-FINAL'
  }
  const provGranOptions = ['coarse-grained', 'off'];

  useEffect(() => {

    getSettingsArtifact();

    return () => {
      setTgtDatabaseTouched(false);
      setAddCollTouched(false);
      setIsTgtPermissionsTouched(false);
      setIsModuleTouched(false);
      setIsCHParamTouched(false);
      setIsProvGranTouched(false);
      setIsUserTouched(false);
      setIsRunBeforeTouched(false);
    };
  },[props.openLoadDataSettings  ,isLoading])

//CREATE/POST settings Artifact
const createSettingsArtifact = async (settingsObj) => {
  console.log('settingsObj',settingsObj)

  try {
    setIsLoading(true);
    let response = await Axios.post(`/api/artifacts/loadData/${props.stepData.name}/settings`, settingsObj);
    if (response.status === 200) {
      console.log('Create/Update LoadData Settings Artifact API Called successfully!')
      setIsLoading(false);
    }
  }
  catch (error) {
    let message = error.response.data.message;
    console.log('Error While creating the Load Data settings artifact!', message)
    setIsLoading(false);
  }

}

//GET the settings artifact
const getSettingsArtifact = async () => {

  try {
    let response = await Axios.get(`/api/artifacts/loadData/${props.stepData.name}/settings`);
    
    if (response.status === 200) {
      setgtDatabase(response.data.targetDatabase);
      setAdditionalCollections([...response.data.additionalCollections]);
      setTargetPermissions(response.data.permissions);
      setModule(response.data.customHook.module);
      setCHparameters(response.data.customHook.parameters);
      setProvGranularity(response.data.provenanceGranularity);
      setUser(response.data.customHook.user);
      setRunBefore(response.data.customHook.runBefore);
      console.log('GET Load Data Settings Artifacts API Called successfully!',response.data);
    } 
  } catch (error) {
      let message = error.response;
      console.log('Error while fetching load data settings artifacts', message);
  }

}

  const onCancel = () => {
    if(checkDeleteOpenEligibility()){
      setDeleteDialogVisible(true);
    } else {
      props.setOpenLoadDataSettings(false)
    }
  }

  const onOk = () => {
    props.setOpenLoadDataSettings(false)
  }

  //Check if Delete Confirmation dialog should be opened or not.
  const checkDeleteOpenEligibility = () => {
  
      if(!isTgtDatabaseTouched
      && !isAddCollTouched
      && !isTgtPermissionsTouched
      && !isModuleTouched
      && !isCHParamTouched
      && !isProvGranTouched
      && !isUserTouched
      && !isRunBeforeTouched
      ) {
              return false; 
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

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();

    let dataPayload = {
        artifactName : props.stepData.name,
        additionalCollections : additionalCollections,
        targetDatabase : tgtDatabase,
        permissions : targetPermissions,
        provenanceGranularity: provGranularity,
        customHook : {
            module : module,
            parameters : cHparameters,
            user : user,
            runBefore : runBefore
        }
      }
    
    createSettingsArtifact(dataPayload);
    props.setOpenLoadDataSettings(false)
  }

  const handleChange = (event) => {
    
    if (event.target.id === 'targetPermissions') {
      setTargetPermissions(event.target.value);
      setIsTgtPermissionsTouched(true);
    }

    if (event.target.id === 'module') {
      setModule(event.target.value);
      setIsModuleTouched(true);
    }

    if (event.target.id === 'cHparameters') {
      setCHparameters(event.target.value);
      setIsCHParamTouched(true);
    }

    if (event.target.id === 'user') {
      setUser(event.target.value);
      setIsUserTouched(true);
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

  const handleAddColl = (value) => {

    if (value === ' ') {
      setAddCollTouched(false);
    }
    else {
      setAddCollTouched(true);
      setAdditionalCollections(value);
    }
  }

  const handleProvGranularity = (value) => {

    if (value === ' ') {
      setIsProvGranTouched(false);
    }
    else {
      setIsProvGranTouched(true);
      setProvGranularity(value);
    }
  }

  const handleRunBefore = (checked, event) => {
    if (checked) {
      setRunBefore(true);
      setIsRunBeforeTouched(true);
    } else {
      setRunBefore(false);
      setIsRunBeforeTouched(true);
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

    if (event.target.id === 'user') {
      setUser(event.target.value);
      setIsUserTouched(true);
    }
  }

  const handleTgtDatabase = (value) => {

    if (value === ' ') {
      setTgtDatabaseTouched(false);
    }
    else {
      setTgtDatabaseTouched(true);
      setTgtDatabase(value);
    }
  }

  const handleAddColl = (value) => {

    if (value === ' ') {
      setAddCollTouched(false);
    }
    else {
      setAddCollTouched(true);
      setAdditionalCollections(value);
    }
  }

  const handleAddColl = (value) => {

    if (value === ' ') {
      setAddCollTouched(false);
    }
    else {
      setAddCollTouched(true);
      setAdditionalCollections(value);
    }
  }

  const handleProvGranularity = (value) => {

    if (value === ' ') {
      setIsProvGranTouched(false);
    }
    else {
      setIsProvGranTouched(true);
      setProvGranularity(value);
    }
  }

  const handleRunBefore = (checked, event) => {
    if (checked) {
      setRunBefore(true);
      setIsRunBeforeTouched(true);
    } else {
      setRunBefore(false);
      setIsRunBeforeTouched(true);
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

  const toggleCustomHook = () => {
    if (!toExpand) {
      setToExpand(true);
    } else {
      setToExpand(false);
    }
  }

  const customHookProperties = <div><Form.Item label={<span className={styles.cHItemLabel}>
    Module:&nbsp;
  <Tooltip title={LoadDataSettings.module}>
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
  <Tooltip title={LoadDataSettings.cHParameters}>
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
  <Tooltip title={LoadDataSettings.user}>
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
  <Tooltip title={LoadDataSettings.runBefore}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </Tooltip>
      &nbsp;
</span>} labelAlign="left"
      className={styles.formItem}>
      <Switch checked={runBefore} checkedChildren="ON" unCheckedChildren="OFF" onChange={handleRunBefore} disabled={!canReadWrite}/>
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
              <Tooltip title={LoadDataSettings.targetDatabase}>
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
              <Tooltip title={LoadDataSettings.additionalCollections}>
              <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
            </Tooltip>
            &nbsp;
            </span>} labelAlign="left" className={styles.formItem}>
            <Select
              id="additionalColl"
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Please select"
              value={additionalCollections}
              disabled={!canReadWrite}
              onChange={handleAddColl}
            >

            </Select>
          </Form.Item>
          <Form.Item label={<span>
            Target Permissions:&nbsp;
              <Tooltip title={LoadDataSettings.targetPermissions}>
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
              <Tooltip title={LoadDataSettings.provGranularity}>
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