import { Modal, Form, Input, Button, Tooltip, Icon, Progress, Upload, Select } from "antd";
import React, { useState, useEffect } from "react";
import styles from './new-data-load-dialog.module.scss';
import { srcOptions, tgtOptions, fieldSeparatorOptions } from '../../../config/formats.config';
import {NewLoadTooltips} from '../../../config/tooltips.config';
import Axios from "axios";

const NewDataLoadDialog = (props) => {

  const [stepName, setStepName] = useState('');
  const [description, setDescription] = useState(props.stepData && props.stepData != {} ? props.stepData.description : '');
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
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState<any>([]);
  const [previewURI, setPreviewURI] = useState('');
  const [uploadPercent, setUploadPercent] = useState();


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
      setIsLoading(true);
    } else {
      setStepName('');
      setStepNameTouched(false);
      setDescription('');
      setSrcFormat('JSON');
      setFieldSeparator(',');
      setOtherSeparator('');
      setTgtFormat('JSON');
      setOutUriReplacement('');
      setUploadPercent(0);
      setFileList([]);
    }

    return (() => {
      setStepName('');
      setStepNameTouched(false);
      setDescription('');
      setSrcFormat('JSON');
      setFieldSeparator(',');
      setOtherSeparator('');
      setTgtFormat('JSON');
      setOutUriReplacement('');
      setUploadPercent(0);
      setFileList([]);
    })

  }, [props.stepData, props.title]);

  const onCancel = () => {
    props.setNewLoad(false);
    setFileList([]);
    setUploadPercent(0);
  }

  const onOk = () => {
    props.setNewLoad(false);
  }

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();
    
    let dataPayload;
    if(srcFormat === 'Delimited Text'){
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
    setIsLoading(true);

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
      }
    }

    if (event.target.id === 'description') {
      setDescription(event.target.value)
    }

    if (event.target.id === 'outputUriReplacement') {
      setOutUriReplacement(event.target.value)
    }
    if(srcFormat && tgtFormat && (event.target.id === 'name' && event.target.value.length > 0)) {
      setIsLoading(true);
    }
    if(event.target.id === 'name' && event.target.value.length == 0){
      setIsLoading(false);
    }
    if(stepName && srcFormat && tgtFormat && outUriReplacement) {
      buildURIPreview(props.stepData);
    }
  }

  const handleSrcFormat = (value) => {

    if (value === ' ') {
      setSrcFormatTouched(false);
    }
    else {
      setSrcFormatTouched(true);
      setSrcFormat(value);

      if(value === 'Delimited Text'){
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

  // const handleUpload = (info) => {
  //   const url = `/api/artifacts/loadData/${stepName}/setData`;
  //   const formData = new FormData();
  //   fileList.forEach(file => {
  //     formData.append('files[]', file);
  //   });
  // }

  const customRequest = option => {
    const { onSuccess, onError, file, action, onProgress } = option;
    const url = `/api/artifacts/loadData/${stepName}/setData`;
  
  
    let fl  = fileList;
    const formData = new FormData();

    fl.forEach(file => {
      formData.append('files', file);
    }); 

    //API call for 
    Axios.post(url, formData, {
        onUploadProgress: e => {
          onProgress({ percent: (e.loaded / e.total) * 100 });
          let percent=(e.loaded / e.total) * 100
          setUploadPercent(percent);
        },
        headers: {
          'Content-Type': 'multipart/form-data; boundary=${fd._boundary}'
        },
      })
      .then(responses => {
        /*......*/
        onSuccess(responses.status);
        if(stepName && srcFormat && tgtFormat && responses.data.inputFilePath) {
          buildURIPreview(responses.data);
        }
      })
      .catch(err => {
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
      xs: { span: 24 },
      sm: { span: 15 },
    },
  };

  const soptions = Object.keys(srcOptions).map(d => <Select.Option key={srcOptions[d]}>{d}</Select.Option>);
  const fsoptions = Object.keys(fieldSeparatorOptions).map(d => <Select.Option key={fieldSeparatorOptions[d]}>{d}</Select.Option>);
  const toptions = Object.keys(tgtOptions).map(d => <Select.Option key={tgtOptions[d]}>{d}</Select.Option>);

  const buildURIPreview = (stepData) => {
    let uri;
    let input_file_type = stepData.sourceFormat;
    let document_type = stepData.targetFormat.toLowerCase();
    let output_uri_replace = outUriReplacement || stepData.outputURIReplacement;
    let loadDataName = stepData.name;
    var formatMap = new Map();

    formatMap.set("xml", ".xml");
    formatMap.set("json", ".json");
    formatMap.set("text", ".txt");
    formatMap.set("binary", ".pdf");

    uri = "/" + loadDataName;
    

    if(input_file_type !== "Delimited Text") {
      uri = uri + "/example" + formatMap.get(document_type);
    }

    if (output_uri_replace) {
      let replace = output_uri_replace.split(",");
      if (replace.length % 2 !== 0) {
        uri = "Error: Missing one (or more) replacement strings";
        return;
      }
      for (var i = 0; i < replace.length - 1; i++) {
        let replacement = replace[++i].trim();
        if (!replacement.startsWith("'") ||
            !replacement.endsWith("'")) {
          uri = "Error: The replacement string must be enclosed in single quotes";
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

  return (<Modal visible={props.newLoad}
    title={null}
    width="700px"
    onCancel={() => onCancel()}
    onOk={() => onOk()}
    okText="Save"
    className={styles.modal}
    footer={null}>

    <p className={styles.title}>{props.title}</p>
    <br />
    <div className={styles.newDataLoadForm}>
      <Form {...formItemLayout} onSubmit={handleSubmit} colon={false}>
        <Form.Item label={<span>
          Name:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
              <Tooltip title={NewLoadTooltips.name}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left"
          validateStatus={(stepName || !isStepNameTouched) ? '' : 'error'}
          help={(stepName || !isStepNameTouched) ? '' : 'Name is required'}>
          <Input
            id="name"
            placeholder="Enter name"
            value={stepName}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label={<span>
          Description:&nbsp;
              <Tooltip title={NewLoadTooltips.description}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
          <Input
            id="description"
            placeholder="Enter description"
            value={description}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label={<span>
          Files:&nbsp;
              <Tooltip title={NewLoadTooltips.files}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
          <span className={styles.upload}><Upload  
          {...uploadProps}
          multiple={true} 
          customRequest={customRequest} 
          //onChange={handleUpload} 
          >
            <Button>Upload</Button>
          </Upload>&nbsp;&nbsp;
                {uploadPercent != 100 ? <Progress type="circle" percent={uploadPercent} width={50} /> : <span>{fileList.length} files uploaded</span>}</span>
        </Form.Item>
        <Form.Item label={<span>
          Source Format:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
              <Tooltip title={NewLoadTooltips.sourceFormat}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
          <Select
            id="sourceFormat"
            showSearch
            placeholder="Enter source format"
            optionFilterProp="children"
            value={srcFormat}
            onChange={handleSrcFormat}
          >
            {soptions}
          </Select>
        </Form.Item>
         {srcFormat === 'Delimited Text' ? <Form.Item label={<span>
          Field Separator:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
              <Tooltip title={NewLoadTooltips.fieldSeparator}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
          <span><Select
            id="fieldSeparator"
            showSearch
            placeholder="Choose Field Separator"
            optionFilterProp="children"
            value={fieldSeparator}
            onChange={handleFieldSeparator}
            style={{width: 120}}
          >
            {fsoptions}
          </Select></span>
          &nbsp;&nbsp;
          <span>{fieldSeparator === 'Other' ? <Input
            id="otherSeparator"
            value={otherSeparator}
            onChange={handleOtherSeparator}
            style={{width: 75}}
          /> : ''}</span>
        </Form.Item> : ''}
        <Form.Item label={<span>
          Target Format:&nbsp;<span className={styles.asterisk}>*</span>&nbsp;
              <Tooltip title={NewLoadTooltips.targetFormat}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
          <Select
            id="targetFormat"
            placeholder="Enter target format"
            value={tgtFormat}
            onChange={handleTgtFormat}>
            {toptions}
          </Select>
        </Form.Item>
        <Form.Item label={<span>
          Output URI Replacement:&nbsp;
              <Tooltip title={NewLoadTooltips.outputURIReplacement}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          &nbsp;
            </span>} labelAlign="left">
          <Input
            id="outputUriReplacement"
            placeholder="Enter comma-separated list of replacements"
            value={outUriReplacement}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label={<span>
          Target URI Preview:&nbsp;
              <Tooltip title={NewLoadTooltips.targetURIPreview}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip>
          <span className={styles.readOnlyLabel}>(Read-only)</span>
          <br style={{ lineHeight: '1px', width: '0px', marginBottom: '-20px' }} />
        </span>} labelAlign="left">
          <p>{previewURI}</p>

        </Form.Item>
        <Form.Item className={styles.submitButtonsForm}>
          <div className={styles.submitButtons}>
            <Button onClick={() => onCancel()}>Cancel</Button>
            &nbsp;&nbsp;
            <Button type="primary" htmlType="submit" disabled={!isLoading} onClick={handleSubmit}>Save</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  </Modal>)
}

export default NewDataLoadDialog;
