import {Modal, Form, Input, Tooltip, Icon, Radio, Button} from "antd";
import React, { useState, useEffect } from "react";
import styles from './view-custom-dialog.module.scss';
import {NewCustomTooltips} from '../../../../config/tooltips.config';

const ViewCustomDialog = (props) => {

  const [customName, setCustomName] = useState('');
  const [description, setDescription] = useState(props.customData && props.customData !== {} ? props.customData.description : '');
  const [selectedSource, setSelectedSource] = useState(props.customData && props.customData !== {} ? props.customData.selectedSource : 'query')
  const [srcQuery, setSrcQuery] = useState(props.customData && props.customData !== {} ? props.customData.sourceQuery : '');
  const [collections, setCollections] = useState('');

    useEffect(() => {
        if (props.customData && JSON.stringify(props.customData) != JSON.stringify({}) ) {
            setCustomName(props.customData.name);
            setDescription(props.customData.description);
            setSrcQuery(props.customData.sourceQuery);
            setSelectedSource(props.customData.selectedSource);
            if(props.customData.selectedSource === 'collection'){
                let srcCollection = props.customData.sourceQuery.substring(
                    props.customData.sourceQuery.lastIndexOf("[") + 2,
                    props.customData.sourceQuery.lastIndexOf("]") - 1
                );
                setCollections(srcCollection);
            }
        } else {
            setCustomName('');
            setDescription('');
            setSrcQuery('')
            setCollections('');
        }

        return (() => {
            setCustomName('');
            setDescription('');
            setSelectedSource('query');
        })

    }, [props.customData]);


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

  const srcTypeOptions = [
    { label: 'Collection', value: 'collection' },
    { label: 'Query', value: 'query' }
  ];

  const { TextArea } = Input;

  const onCancel = () => {
      props.setViewCustom(false);
  }

  return (<Modal visible={props.viewCustom}
    title={null}
    width="700px"
    className={styles.modal}
    closable={true}
    footer={null}
    onCancel={() => onCancel()}
    maskClosable={false}>

    <p className={styles.title}>View Custom Step</p>
    <br />
    <div className={styles.newCustomForm}>
      <Form {...formItemLayout} colon={false}>
        <Form.Item label={<span>
          Name:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>} labelAlign="left"
        >
          <Input
            id="name"
            placeholder="Enter name"
            value={customName}
            disabled={!props.canReadWrite}
            className={styles.input}
          />&nbsp;&nbsp;
          <Tooltip title={NewCustomTooltips.name}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </Tooltip>
        </Form.Item>
        <Form.Item label={<span>
          Description:
          &nbsp;
            </span>} labelAlign="left">
          <Input
            id="description"
            placeholder="Enter description"
            value={description}
            disabled={!props.canReadWrite}
            className={styles.input}
          />&nbsp;&nbsp;
          <Tooltip title={NewCustomTooltips.description}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </Tooltip>
        </Form.Item>

        <Form.Item label={<span>
          Source Query:&nbsp;<span className={styles.asterisk}>*</span>
          &nbsp;
            </span>} labelAlign="left"
        >
          <Radio.Group
            id="srcType"
            options={srcTypeOptions}
            value={selectedSource}
          >
          </Radio.Group>
            {selectedSource === 'collection' ? <div ><span className={styles.srcCollectionInput}><Input
                id="collList"
                //mode="tags"
                className={styles.input}
                placeholder="Please select"
                value={collections}
                disabled={!props.canReadWrite}
            >
            {/* {collectionsList} */}
          </Input>&nbsp;&nbsp;<Tooltip title={NewCustomTooltips.sourceQuery}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </Tooltip></span></div> : <span><TextArea
                id="srcQuery"
                placeholder="Enter Source Query"
                value={srcQuery}
                disabled={!props.canReadWrite}
                className={styles.input}
            ></TextArea>&nbsp;&nbsp;<Tooltip title={NewCustomTooltips.sourceQuery}>
          <Icon type="question-circle" className={styles.questionCircleTextArea} theme="filled" />
        </Tooltip></span>}
        </Form.Item>
        <br /><br /><br /><br />
          <Form.Item className={styles.submitButtonsForm}>
              <div className={styles.submitButtons}>
                  <Button data-testid={`${customName}-cancel`} onClick={() => onCancel()}>Cancel</Button>
                  &nbsp;&nbsp;
                  <Button type="primary" htmlType="submit" disabled={!props.canReadWrite} >Save</Button>
              </div>
          </Form.Item>
      </Form>
    </div>

  </Modal>)
}

export default ViewCustomDialog;

