import React, { useState, useEffect } from "react";
import { Form, Input, Icon, Radio } from "antd";
import styles from './view-custom.module.scss';
import { NewCustomTooltips } from '../../../../config/tooltips.config';
import { MLTooltip, MLButton } from '@marklogic/design-system';

type Props = {
  tabKey: string;
  openStepSettings: boolean;
  setOpenStepSettings: any;
  canReadWrite: boolean;
  canReadOnly: boolean;
  stepData: any;
  currentTab: string;
  setIsValid?: any;
  resetTabs?: any;
  setHasChanged?: any;
}

const ViewCustom: React.FC<Props>  = (props) => {

  const [customName, setCustomName] = useState('');
  const [description, setDescription] = useState(props.stepData && props.stepData !== {} ? props.stepData.description : '');
  const [selectedSource, setSelectedSource] = useState(props.stepData && props.stepData !== {} ? props.stepData.selectedSource : 'query');
  const [srcQuery, setSrcQuery] = useState(props.stepData && props.stepData !== {} ? props.stepData.sourceQuery : '');
  const [collections, setCollections] = useState('');

    useEffect(() => {
        if (props.stepData && JSON.stringify(props.stepData) != JSON.stringify({}) ) {
            setCustomName(props.stepData.name);
            setDescription(props.stepData.description);
            setSrcQuery(props.stepData.sourceQuery);
            setSelectedSource(props.stepData.selectedSource);
            if(props.stepData.selectedSource === 'collection'){
                let srcCollection = props.stepData.sourceQuery.substring(
                    props.stepData.sourceQuery.lastIndexOf("[") + 2,
                    props.stepData.sourceQuery.lastIndexOf("]") - 1
                );
                setCollections(srcCollection);
            }
        } else {
            setCustomName('');
            setDescription('');
            setSrcQuery('');
            setCollections('');
        }

        return (() => {
            setCustomName('');
            setDescription('');
            setSelectedSource('query');
        });

    }, [props.stepData]);

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
    props.setOpenStepSettings(false);
    props.resetTabs();
  };

  return (
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
          <MLTooltip title={NewCustomTooltips.name} placement={'right'}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </MLTooltip>
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
          <MLTooltip title={NewCustomTooltips.description} placement={'right'}>
        <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
      </MLTooltip>
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
          </Input>&nbsp;&nbsp;<MLTooltip title={NewCustomTooltips.sourceQuery} placement={'right'}>
            <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
          </MLTooltip></span></div> : <span><TextArea
                id="srcQuery"
                placeholder="Enter Source Query"
                value={srcQuery}
                disabled={!props.canReadWrite}
                className={styles.input}
            ></TextArea>&nbsp;&nbsp;<MLTooltip title={NewCustomTooltips.sourceQuery} placement={'right'}>
          <Icon type="question-circle" className={styles.questionCircleTextArea} theme="filled" />
        </MLTooltip></span>}
        </Form.Item>
        <br />
          <Form.Item className={styles.submitButtonsForm}>
              <div className={styles.submitButtons}>
                  <MLButton data-testid={`${customName}-cancel`} onClick={() => onCancel()}>Cancel</MLButton>
                  &nbsp;&nbsp;
                  <MLButton type="primary" htmlType="submit" disabled={!props.canReadWrite} >Save</MLButton>
              </div>
          </Form.Item>
      </Form>
    </div>
  );
};

export default ViewCustom;

