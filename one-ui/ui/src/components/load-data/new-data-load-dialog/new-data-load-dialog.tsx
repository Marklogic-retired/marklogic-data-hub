import { Modal, Form, Input, Button, Tooltip, Icon, Progress, Upload, Select } from "antd";
import React, { useState, useEffect, CSSProperties } from "react";
import styles from './new-data-load-dialog.module.scss';
import { srcOptions, tgtOptions, fieldSeparatorOptions } from '../../../config/formats.config';
import {NewLoadTooltips} from '../../../config/tooltips.config';
import Axios from "axios";

const NewDataLoadDialog = (props) => {

  const [stepName, setStepName] = useState('');
  const [description, setDescription] = useState(props.stepData && props.stepData != {} ? props.stepData.description : '');
  const [inputFilePath, setInputFilePath] = useState(props.stepData && props.stepData.inputFilePath ? props.stepData.inputFilePath : '');
  const [srcFormat, setSrcFormat] = useState(props.stepData && props.stepData != {} ? props.stepData.sourceFormat : 'json');
  const [tgtFormat, setTgtFormat] = useState(props.stepData && props.stepData != {} ? props.stepData.targetFormat : 'json');
  const [outUriReplacement, setOutUriReplacement] = useState(props.stepData && props.stepData != {} ? props.stepData.outputURIReplacement : '');
  const [fieldSeparator, setFieldSeparator] = useState(props.stepData && props.stepData != {} ? props.stepData.fieldSeparator : ',');
  const [otherSeparator, setOtherSeparator] = useState('');



  const [isStepNameTouched, setStepNameTouched] = useState(false);
  const [isSrcFormatTouched, setSrcFormatTouched] = useState(false);
  const [isTgtFormatTouched, setTgtFormatTouched] = useState(false);
  const [isFieldSeparatorTouched, setFieldSeparatorTouched] = useState(false);
  const [isOtherSeparatorTouched, setOtherSeparatorTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [fileList, setFileList] = useState<any>([]);
  const [previewURI, setPreviewURI] = useState('');
  const [uploadPercent, setUploadPercent] = useState();
  const [toDelete, setToDelete] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [tobeDisabled, setTobeDisabled] = useState(false);
  const [displayUploadError, setDisplayUploadError] = useState(false);

  //tooltip text for the upload button help icon
  const uploadButtonTooltip = <p>Click <b>Upload</b> to select the source files. The total size of the files must be 100MB or less.</p>

  useEffect(() => {
    if (props.stepData && JSON.stringify(props.stepData) != JSON.stringify({}) && props.title === 'Edit Data Load') {
      setStepName(props.stepData.name);
      setDescription(props.stepData.description);
      setSrcFormat(props.stepData.sourceFormat);
      if(props.stepData.separator){
        if([',','\\t','|',';'].includes(props.stepData.separator)){
          setFieldSeparator(props.stepData.separator);
        } else {
          setFieldSeparator('Other');
          setOtherSeparator(props.stepData.separator);
        }
      }

      setTgtFormat(props.stepData.targetFormat);
      setOutUriReplacement(props.stepData.outputURIReplacement);
      buildURIPreview(props.stepData);
      setFileList([]);
      setIsValid(true);
      setTobeDisabled(true);
    } else {
      setStepName('');
      setStepNameTouched(false);
      setDescription('');
      setSrcFormat('json');
      setFieldSeparator(',');
      setOtherSeparator('');
      setTgtFormat('json');
      setOutUriReplacement('');
      setUploadPercent(0);
      setFileList([]);
      setPreviewURI('');
      setIsValid(false);
    }

    return (() => {

      setStepName('');
      setStepNameTouched(false);
      setDescription('');
      setSrcFormat('json');
      setFieldSeparator(',');
      setOtherSeparator('');
      setTgtFormat('json');
      setOutUriReplacement('');
      setUploadPercent(0);
      setFileList([]);
      setPreviewURI('');
      setInputFilePath('');
      setTobeDisabled(false);
      setDisplayUploadError(false);
    })

  }, [props.stepData, props.title, props.newLoad]);

  const onCancel = () => {

    if(checkDeleteOpenEligibility()) {
      setDeleteDialogVisible(true);
    } else {
      props.setNewLoad(false);
    setFileList([]);
    setUploadPercent(0);
    }
  }

  const checkDeleteOpenEligibility = () => {
    if (props.stepData && JSON.stringify(props.stepData) != JSON.stringify({}) && props.title === 'Edit Data Load'){

      if(stepName === props.stepData.name
      && description === props.stepData.description
      && srcFormat === props.stepData.sourceFormat
      && tgtFormat === props.stepData.targetFormat
      && outUriReplacement === props.stepData.outputURIReplacement
      ) {

        if((props.stepData.separator && fieldSeparator === 'Other' && otherSeparator === props.stepData.separator) ||
           (props.stepData.separator && fieldSeparator !== 'Other' && fieldSeparator === props.stepData.separator) ||
           (!props.stepData.separator && fieldSeparator === ',' && otherSeparator === '')
           ) {
             if((props.stepData.inputFilePath && inputFilePath !== props.stepData.inputFilePath) ||
                (inputFilePath === '')){

              return false;
             } else {
              return true;
             }

        } else {
          return true;
         }
      } else {
        return true
      }
    } else {
      if(stepName === ''
        && description === ''
        && srcFormat === 'json'
        && tgtFormat === 'json'
        && outUriReplacement === ''
        ) {
          if(fieldSeparator === ',' && otherSeparator === '')
              {
               if(inputFilePath === '' || (props.stepData && props.stepData.inputFilePath && inputFilePath !== props.stepData.inputFilePath)){
                return false;
               } else {
                return true;
               }
          } else {
            return true;
           }
        } else {
          return true;
      }
    }
  }

  const onOk = () => {
    props.setNewLoad(false);
    setToDelete(false);
  }

  const onDelOk = () => {
    props.setNewLoad(false);
    setFileList([]);
    setUploadPercent(0);
    if(toDelete){
      deleteUnusedLoadArtifact(stepName);
      deleteFilesFromDirectory(stepName);
      setToDelete(false);
    }
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
        <span className={styles.ConfirmationMessage}>Discard changes?</span>
        <br/><br/>
        <div >
            <Button onClick={() => onDelCancel()}>No</Button>
            &nbsp;&nbsp;
            <Button type="primary" htmlType="submit" onClick={onDelOk}>Yes</Button>
          </div>
    </Modal>;

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();

    let dataPayload;
    if(inputFilePath === ''){
      if(props.stepData.inputFilePath){
        dataPayload = {
          name: stepName,
          description: description,
          sourceFormat: srcFormat,
          separator: null,
          targetFormat: tgtFormat,
          outputURIReplacement: outUriReplacement,
          inputFilePath: props.stepData.inputFilePath
        };
        // cannot set separator unless using the CSV source format
        if (srcFormat === 'csv') {
            dataPayload.separator = fieldSeparator === 'Other'? otherSeparator : fieldSeparator;
        }
      } else {
        if(srcFormat === 'csv'){
          dataPayload = {
           name: stepName,
           description: description,
           sourceFormat: srcFormat,
           separator: fieldSeparator === 'Other'? otherSeparator : fieldSeparator,
           targetFormat: tgtFormat,
           outputURIReplacement: outUriReplacement
         }
       } else {
          dataPayload = {
           name: stepName,
           description: description,
           sourceFormat: srcFormat,
           targetFormat: tgtFormat,
           outputURIReplacement: outUriReplacement
         }
       }
      }

    } else {
      if(srcFormat === 'csv'){
        dataPayload = {
         name: stepName,
         description: description,
         sourceFormat: srcFormat,
         separator: fieldSeparator === 'Other'? otherSeparator : fieldSeparator,
         targetFormat: tgtFormat,
         outputURIReplacement: outUriReplacement,
         inputFilePath: inputFilePath
       }
     } else {
        dataPayload = {
         name: stepName,
         description: description,
         sourceFormat: srcFormat,
         targetFormat: tgtFormat,
         outputURIReplacement: outUriReplacement,
         inputFilePath: inputFilePath
       }
     }

    }

    setIsValid(true);

    //Call create data load artifact API function

    props.createLoadDataArtifact(dataPayload);

    props.setNewLoad(false);
  }

  const handleChange = (event) => {
    if (event.target.id === 'name') {
      if (event.target.value === ' ') {
        setStepNameTouched(false);
      }
      else {
        setStepNameTouched(true);
        setStepName(event.target.value);
        let dataPayload = {
          name: event.target.value,
          description: description,
          sourceFormat: srcFormat,
          targetFormat: tgtFormat,
          outputURIReplacement: outUriReplacement
        };
        buildURIPreview(dataPayload);

        if (event.target.value.length == 0) {
          setIsValid(false);
        } else if (srcFormat && tgtFormat) {
          setIsValid(true);
        }
      }
    }

    if (event.target.id === 'description') {
      setDescription(event.target.value)
    }

  }

  const handleOutURIReplacement = (event) => {
    if (event.target.id === 'outputUriReplacement') {
      setOutUriReplacement(event.target.value);
      let dataPayload = {
        name: stepName,
        description: description,
        sourceFormat: srcFormat,
        targetFormat: tgtFormat,
        outputURIReplacement: event.target.value
      };

      buildURIPreview(dataPayload);
    }
  }

  const handleSrcFormat = (value) => {

    if (value === ' ') {
      setSrcFormatTouched(false);
    }
    else {
      setSrcFormatTouched(true);
      setSrcFormat(value);

      if(value === 'csv'){
        setFieldSeparator(',');
      }
      let dataPayload = {
        name: stepName,
        description: description,
        sourceFormat: value,
        targetFormat: tgtFormat,
        outputURIReplacement: outUriReplacement
      }

      buildURIPreview(dataPayload);
    }
  }

  const handleFieldSeparator = (value) => {
    if (value === ' ') {
      setFieldSeparatorTouched(false);
    }
    else {
      setFieldSeparatorTouched(true);
      setFieldSeparator(value);

      if(value === 'Other'){
        setOtherSeparator('');
      }
    }
  }

  const handleOtherSeparator = (event) => {
    if (event.target.id === 'otherSeparator') {
      setOtherSeparatorTouched(true);
      setOtherSeparator(event.target.value);
    }
    else {
      setOtherSeparatorTouched(false);
    }
  }

  const handleTgtFormat = (value) => {

    if (value === ' ') {
      setTgtFormatTouched(false);
    }
    else {
      setTgtFormatTouched(true);
      setTgtFormat(value);

      let dataPayload = {
        name: stepName,
        description: description,
        sourceFormat: srcFormat,
        targetFormat: value,
        outputURIReplacement: outUriReplacement
      }

      buildURIPreview(dataPayload);
    }
  }

  const deleteFilesFromDirectory = async (loadDataName) => {
    try {
      let response = await Axios.delete(`/api/artifacts/loadData/${loadDataName}/setData`);

      if (response.status === 200) {
        console.log('DELETE API Called successfully!');
      }
    } catch (error) {
        let message = error.response.data.message;
        console.log('Error while deleting load data artifact.', message);
    }

  }

  const deleteUnusedLoadArtifact = async (loadDataName) => {

    try {
      let response = await Axios.delete(`/api/artifacts/loadData/${loadDataName}`);

      if (response.status === 200) {
        console.log('DELETE API Called successfully!');
      }
    } catch (error) {
        let message = error.response.data.message;
        console.log('Error while deleting load data artifact.', message);
    }
  }
  const createDefaultLoadDataArtifact = async (dataPayload) => {
    try {
      let response = await Axios.post(`/api/artifacts/loadData/${stepName}`, dataPayload);
      if (response.status === 200) {
        console.log('Create default LoadDataArtifact API Called successfully!')
      }
    }
    catch (error) {
      let message = error.response.data.message;
      console.log('Error While creating the default Load Data artifact!', message)
    }
  }
  const customRequest = async option => {
    const { onSuccess, onError, file, action, onProgress } = option;

   try {
    let response = await Axios.get(`/api/artifacts/loadData/${stepName}`);

    if (response.status === 200) {
      console.log('GET API Called in custom request!');
    }
  } catch (error) {
      let errorCode = error.response.data.code;
      let message = error.response.data.message;
      console.log('Error while fetching load data artifacts from custom request', message);

      if(errorCode === 404){
        setToDelete(true);
        let dataPayload = {
          name: stepName,
          description: description,
          sourceFormat: srcFormat,
          targetFormat: tgtFormat,
          outputURIReplacement: outUriReplacement
        }
        await createDefaultLoadDataArtifact(dataPayload);
      }
  }

    let fl  = fileList;
    const formData = new FormData();

    fl.forEach(file => {
      formData.append('files', file);
    });


    //API call for

      const url = `/api/artifacts/loadData/${stepName}/setData`;

      await Axios({
        method: 'post',
        url: url,
        data: formData,
        onUploadProgress: e => {
          onProgress({ percent: (e.loaded / e.total) * 100 });
          let percent=(e.loaded / e.total) * 100;
          percent = Math.round( percent * 100 + Number.EPSILON ) / 100;
          setUploadPercent(percent);
        },
        headers: {
          'Content-Type': 'multipart/form-data; boundary=${formData._boundary}',
          crossorigin:true
        }
      }).then(resp => {
        console.log('responses.status',resp);
        if (resp.data && resp.data.message){
          if(resp.data.message.startsWith('Maximum upload size exceeded') || resp.data.message.includes('Network Error')){
            setDisplayUploadError(true);
          }
        }
        if(resp.data && resp.data.inputFilePath){
          setInputFilePath(resp.data.inputFilePath);
        }
        if(stepName && srcFormat && tgtFormat && resp.data.inputFilePath) {
          buildURIPreview(resp.data);
        }
      }).catch(err => {
        console.log('Error while uploading the files', err)
      if (err.message && (err.message.startsWith('Maximum upload size exceeded') || err.message.includes('Network Error') || err.message.includes('Request failed with status code 500'))){
        setDisplayUploadError(true);
      }
      /*......*/
      onError(err);
      });

  };

  const uploadProps = {
    showUploadList:false,
    onRemove: file => {
      setFileList(prevState => {
        const index = prevState.indexOf(file);
        const newFileList = prevState.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: (file: any) => {
      setFileList(prevState => ([...prevState , file]));
      return true;
    },
    fileList,
  }

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 28 },
      sm: { span: 15 },
    },
  };

  const soptions = Object.keys(srcOptions).map(d => <Select.Option key={srcOptions[d]}>{d}</Select.Option>);
  const fsoptions = Object.keys(fieldSeparatorOptions).map(d => <Select.Option key={fieldSeparatorOptions[d]}>{d}</Select.Option>);
  const toptions = Object.keys(tgtOptions).map(d => <Select.Option key={tgtOptions[d]}>{d}</Select.Option>);

  const uploadButton: CSSProperties = displayUploadError ? {
    border: '1px solid #DB4f59'
  } : {}

  const buildURIPreview = (stepData) => {
    let uri;
    let input_file_type = stepData.sourceFormat;
    let document_type = stepData.targetFormat.toLowerCase();
    let output_uri_replace = stepData.outputURIReplacement;
    let loadDataName = stepData.name;
    var formatMap = new Map();

    formatMap.set("xml", ".xml");
    formatMap.set("json", ".json");
    formatMap.set("text", ".txt");
    formatMap.set("binary", ".pdf");

    uri = "/" + loadDataName;

    if(input_file_type !== "csv") {
      uri = uri + "/example" + formatMap.get(document_type);
    }

    if (output_uri_replace) {
      let replace = output_uri_replace.split(",");
      if (replace.length % 2 !== 0) {
        uri = "Error: Missing one (or more) replacement strings";
        setPreviewURI(uri);
        return;
      }
      for (var i = 0; i < replace.length - 1; i++) {
        let replacement = replace[++i].trim();
        if (!replacement.startsWith("'") ||
            !replacement.endsWith("'") || replacement.split("'").length % 2 === 0) {
          uri = "Error: The replacement string must be enclosed in single quotes";
          setPreviewURI(uri);
          return;
        }
      }
      for (var i = 0; i < replace.length - 1; i += 2) {
        let replacement = replace[i + 1].trim();
        replacement = replacement.substring(1, replacement.length - 1);
        try{
          uri = uri.replace(new RegExp(replace[i], 'g'), replacement);
        }
        catch(ex) {
          uri = ex;
          setPreviewURI(uri);
          return;
        }
      }
    }

    if(input_file_type.toLowerCase() === "delimited text") {
      uri = uri + "/" + uuid() + formatMap.get(document_type);
    }

    setPreviewURI(uri);
  }

  const uuid = () => {
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;

      if (i == 8 || i == 12 || i == 16 || i == 20) {
        uuid += "-"
      }
      uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  }

  const resetUploadError = () => {
    if(displayUploadError) {
      setDisplayUploadError(false);
      setUploadPercent(0);
      setFileList([]);
    }
  }

  return (<Modal visible={props.newLoad}
    title={null}
    width="55em"
    onCancel={() => onCancel()}
    onOk={() => onOk()}
    okText="Save"
    className={styles.modal}
    footer={null}
    maskClosable={false}>

    <p className={styles.title}>{props.title}</p>
    <br/>
    <div className={styles.newDataLoadForm}>
      <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
        <Form.Item label={<span>
          Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;

          &nbsp;
            </span>} labelAlign="left"
          validateStatus={(stepName || !isStepNameTouched) ? '' : 'error'}
          help={(stepName || !isStepNameTouched) ? '' : 'Name is required'}
          >
          <Input
            id="name"
            placeholder="Enter name"
            value={stepName}
            onChange={handleChange}
            disabled={tobeDisabled}
           className={styles.input}
          />&nbsp;&nbsp;<Tooltip title={NewLoadTooltips.name}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
        </Form.Item>
        <Form.Item label={<span>
          Description:&nbsp;
            </span>} labelAlign="left">
          <Input
            id="description"
            placeholder="Enter description"
            value={description}
            onChange={handleChange}
            disabled={props.canReadOnly && !props.canReadWrite}
            className={styles.input}
          />&nbsp;&nbsp;<Tooltip title={NewLoadTooltips.description}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </Tooltip>
        </Form.Item>
        <Form.Item label={<span>
          Files:&nbsp;
            </span>} labelAlign="left">
          <span className={styles.upload}><Upload
          {...uploadProps}
          multiple={true}
          disabled={!props.canReadWrite}
          customRequest={customRequest}
          //onChange={handleUpload}
          >
            <Button disabled={!props.canReadWrite} onClick={resetUploadError} style={uploadButton}>Upload</Button>
          </Upload>&nbsp;&nbsp;<Tooltip title={uploadButtonTooltip}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </Tooltip>&nbsp;&nbsp;
                {props.canReadWrite && !displayUploadError ? (uploadPercent > 0 && uploadPercent < 100 ? <Progress type="circle" percent={uploadPercent} width={50} /> : '') : ''}
                {props.canReadWrite && !displayUploadError ? (uploadPercent === 100 ? <span>{fileList.length} files uploaded</span> : '') : ''}
                </span>
                {displayUploadError ? <div className={styles.fileUploadErrorContainer}> The upload was unsuccessful. </div> : ''}
        </Form.Item>
        <Form.Item label={<span>
          Source Format:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
            </span>} labelAlign="left">
          <Select
            id="sourceFormat"
            showSearch
            placeholder="Enter source format"
            optionFilterProp="children"
            value={srcFormat}
            onChange={handleSrcFormat}
            disabled={props.canReadOnly && !props.canReadWrite}
            style={{width: '95%'}}
          >
            {soptions}
          </Select>
          &nbsp;&nbsp;<Tooltip title={NewLoadTooltips.sourceFormat}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
        </Form.Item>
         {srcFormat === 'csv' ? <Form.Item label={<span>
          Field Separator:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
            </span>} labelAlign="left">
          <span><Select
            id="fieldSeparator"
            showSearch
            placeholder="Choose Field Separator"
            optionFilterProp="children"
            value={fieldSeparator}
            onChange={handleFieldSeparator}
            style={{width: 120}}
            disabled={props.canReadOnly && !props.canReadWrite}
          >
            {fsoptions}
          </Select></span>
          &nbsp;&nbsp;
          <span>{fieldSeparator === 'Other' ? <span><Input
            id="otherSeparator"
            value={otherSeparator}
            onChange={handleOtherSeparator}
            style={{width: 75}}
            disabled={props.canReadOnly && !props.canReadWrite}
          />&nbsp;&nbsp;<Tooltip title={NewLoadTooltips.fieldSeparator}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </Tooltip></span> : <span>&nbsp;&nbsp;<Tooltip title={NewLoadTooltips.fieldSeparator}>
          <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
        </Tooltip></span>}</span>
        </Form.Item> : ''}
        <Form.Item label={<span>
          Target Format:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
            </span>} labelAlign="left">
          <Select
            id="targetFormat"
            placeholder="Enter target format"
            value={tgtFormat}
            onChange={handleTgtFormat}
            disabled={props.canReadOnly && !props.canReadWrite}
            style={{width: '95%'}}>
            {toptions}
          </Select>&nbsp;&nbsp;
              <Tooltip title={NewLoadTooltips.targetFormat}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
        </Form.Item>
        <Form.Item label={<span>
          Output URI Replacement:&nbsp;
            </span>} labelAlign="left">
          <Input
            id="outputUriReplacement"
            placeholder="Enter comma-separated list of replacements"
            value={outUriReplacement}
            onChange={handleOutURIReplacement}
            disabled={props.canReadOnly && !props.canReadWrite}
            className={styles.input}
          />&nbsp;&nbsp;
          <Tooltip title={NewLoadTooltips.outputURIReplacement}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </Tooltip>
        </Form.Item>
        <Form.Item label={<span>
          Target URI Preview:&nbsp;

          <span className={styles.readOnlyLabel}>(Read-only)</span>
          <br className={styles.lineBreak} />
        </span>} labelAlign="left">
          <span>{previewURI}</span>&nbsp;&nbsp;
          <Tooltip title={NewLoadTooltips.targetURIPreview}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
        </Form.Item>
        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <Button onClick={() => onCancel()}>Cancel</Button>
            &nbsp;&nbsp;
            <Button type="primary" htmlType="submit" disabled={!isValid || !props.canReadWrite} onClick={handleSubmit}>Save</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
    {deleteConfirmation}
  </Modal>)
}

export default NewDataLoadDialog;

