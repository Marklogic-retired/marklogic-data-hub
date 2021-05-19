import React, {useState, useEffect} from "react";
import {Form, Input, Icon, Select, Popover} from "antd";
import styles from "./entity-settings.module.scss";
import {MLButton, MLTooltip} from "@marklogic/design-system";
import {AdvancedSettingsTooltips} from "../../../../config/tooltips.config";
import {AdvancedSettingsMessages} from "../../../../config/messages.config";
import StepsConfig from "../../../../config/steps.config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";

const {Option} = Select;

type Props = {
  canReadWrite: any;
  tooltipsData: any;
  updateStep: any
  stepData: any
  entityMappingId: any;
  entityTitle: any;
}

const EntitySettings: React.FC<Props> = (props) => {
  const tooltips = Object.assign({}, AdvancedSettingsTooltips, props.tooltipsData);
  const canReadWrite = props.canReadWrite;
  const validCapabilities = StepsConfig.validCapabilities;
  const defaultTargetPermissions = StepsConfig.defaultTargetPerms;
  const [popoverVisibility, setPopoverVisibilty] = useState(false);
  const [defaultCollections, setDefaultCollections] = useState<any[]>([]);
  const [additionalCollections, setAdditionalCollections] = useState<any[]>([]);
  const [targetPermissions, setTargetPermissions] = useState(defaultTargetPermissions);
  const [targetPermissionsValid, setTargetPermissionsValid] = useState(true);
  const [permissionValidationError, setPermissionValidationError] = useState<any>(null);

  const formItemLayout = {
    labelCol: {
      xs: {span: 24},
      sm: {span: 7},
    },
    wrapperCol: {
      xs: {span: 24},
      sm: {span: 15},
    },
  };

  useEffect(() => {
    getSettings();
  }, [popoverVisibility]);

  const getSettings = async () => {
    if (props.stepData?.relatedEntityMappings && props.entityMappingId?.length) {
      let relatedEntity = props.stepData.relatedEntityMappings.filter(entity => {
        return entity.relatedEntityMappingId === props.entityMappingId;
      })[0];

      if (relatedEntity) {
        if (relatedEntity.collections) {
          setDefaultCollections(relatedEntity.collections);
        }
        if (relatedEntity.additionalCollections) {
          setAdditionalCollections([...relatedEntity.additionalCollections]);
        }
        if (relatedEntity.permissions) {
          setTargetPermissions(relatedEntity.permissions);
        }
      }
    } else {
      if (props.stepData.collections) {
        setDefaultCollections(props.stepData.collections);
      }
      if (props.stepData.additionalCollections) {
        setAdditionalCollections([...props.stepData.additionalCollections]);
      }
      if (props.stepData.permissions) {
        setTargetPermissions(props.stepData.permissions);
      }
    }
  };

  const getPayload = () => {
    return {
      collections: defaultCollections,
      additionalCollections: additionalCollections,
      permissions: targetPermissions,
    };
  };

  const isPermissionsValid = () => {
    if (targetPermissions.trim().length === 0) {
      setPermissionValidationError(AdvancedSettingsMessages.targetPermissions.incorrectFormat);
      return false;
    }

    if (targetPermissions && targetPermissions.trim().length > 0) {
      let permissionArray = targetPermissions.split(",");
      for (let i = 0; i < permissionArray.length; i += 2) {
        let role = permissionArray[i];
        if (i + 1 >= permissionArray.length || (!role || !role.trim())) {
          setPermissionValidationError(AdvancedSettingsMessages.targetPermissions.incorrectFormat);
          return false;
        }
        let capability = permissionArray[i + 1];
        if (!validCapabilities.includes(capability)) {
          setPermissionValidationError(AdvancedSettingsMessages.targetPermissions.invalidCapabilities);
          return false;
        }
      }
    }
    setPermissionValidationError("");
    return true;
  };

  const handleAddColl = (value) => {
    if (value !== " ") {
      setAdditionalCollections(value.filter((col) => !defaultCollections.includes(col)));
    }
  };

  const updateStep = async (payload) => {
    let stepPayload;
    if (props.stepData?.relatedEntityMappings && props.entityMappingId?.length) {
      let relatedEntityIndex = props.stepData.relatedEntityMappings.findIndex(entity => { return entity.relatedEntityMappingId === props.entityMappingId; });
      if (relatedEntityIndex !== -1) {
        props.stepData.relatedEntityMappings[relatedEntityIndex] = Object.assign(props.stepData.relatedEntityMappings[relatedEntityIndex], payload);
        stepPayload = props.stepData;
      }
    } else {
      stepPayload = Object.assign(props.stepData, payload);
    }
    await props.updateStep(stepPayload);
  };

  const handleChange = (event) => {
    if (event.target.id === "targetPermissions") {
      setTargetPermissions(event.target.value);
      if (!targetPermissionsValid && isPermissionsValid()) {
        setTargetPermissionsValid(true);
      }
    }
  };

  const handleBlur = (event) => {
    if (event.target.id === "targetPermissions") {
      setTargetPermissionsValid(isPermissionsValid());
    }
  };

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    if (event) event.preventDefault();
    setPopoverVisibilty(false);
    updateStep(getPayload());
  };

  const onCancel = () => {
    setPopoverVisibilty(false);
    setTargetPermissionsValid(true);
    setPermissionValidationError(null);
    getSettings();
  };

  const togglePopover = () => {
    popoverVisibility ? setPopoverVisibilty(false) : setPopoverVisibilty(true);
  };

  const content = (
    <div id="entity-settings-popover" data-testid="entity-settings-popover" className={styles.entitySettings}>
      <h2 data-testid={`${props.entityTitle}-settings-title`} className={styles.title}>Advanced Settings: {props.entityTitle}</h2>
      <div className={styles.text}>
        <p>Specify additional collections and modify the default permissions for entity instances associated with this entity.</p>
      </div>
      <div className={styles.entitySettingsForm}>
        <Form {...formItemLayout} onSubmit={handleSubmit} colon={true} >
          <Form.Item
            label={<span>Target Collections</span>}
            labelAlign="left"
            className={styles.formItemTargetCollections}
          >
            <Select
              id="additionalColl"
              mode="tags"
              style={{width: "100%"}}
              placeholder="Please add target collections"
              value={additionalCollections}
              disabled={!canReadWrite}
              onChange={handleAddColl}
              className={styles.inputWithTooltip}
              aria-label="additionalColl-select"
            >
              {additionalCollections.map((col) => {
                return <Option value={col} key={col} label={col}>{col}</Option>;
              })}
            </Select>
            <div className={styles.inputTooltip}>
              <MLTooltip title={tooltips.additionalCollections} placement={"right"}>
                <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
              </MLTooltip>
            </div>
          </Form.Item>
          <Form.Item
            label={<span className={styles.defaultCollectionsLabel}>Default Collections</span>}
            labelAlign="left"
            className={styles.formItem}
          >
            <div className={styles.defaultCollections}>{defaultCollections.map((collection, i) => { return <div data-testid={`defaultCollections-${collection}`} key={i}>{collection}</div>; })}</div>
          </Form.Item>
          <Form.Item
            label={<span>Target Permissions</span>}
            labelAlign="left"
            className={styles.formItem}
          >
            <Input
              id="targetPermissions"
              placeholder="Please enter target permissions"
              value={targetPermissions}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!canReadWrite}
              className={styles.inputWithTooltip}
              onPressEnter={(e) => e.key === "Enter" && e.preventDefault()}
            />
            <div className={styles.inputTooltip}>
              <MLTooltip title={tooltips.targetPermissions} placement={"right"}>
                <Icon type="question-circle" className={styles.questionCircle} theme="filled" />
              </MLTooltip>
            </div>
            <div className={styles.validationError} data-testid="validationError">
              {permissionValidationError}
            </div>
          </Form.Item>
          <Form.Item className={styles.submitButtonsForm}>
            <div className={styles.submitButtons}>
              <MLButton data-testid={`cancel-settings`} onClick={() => onCancel()}>Cancel</MLButton>&nbsp;&nbsp;
              {!canReadWrite || !targetPermissionsValid ? <MLTooltip title={tooltips.missingPermission} placement={"bottomRight"}>
                <span className={styles.disabledCursor}>
                  <MLButton id={"saveButton"} className={styles.saveButton} data-testid={`save-settings`} type="primary" htmlType="submit" onClick={handleSubmit} disabled={true}>Save</MLButton>
                </span>
              </MLTooltip> : <MLButton id={"saveButton"} data-testid={`save-settings`} type="primary" htmlType="submit" onClick={handleSubmit} disabled={false}>Save</MLButton>}
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );

  return (
    <div id="entitySettings">
      <div><div className={styles.entitySettingsLink}>
        <FontAwesomeIcon data-testid={`${props.entityTitle}-entity-settings`} icon={faCog} type="edit" role="entity-settings button" aria-label={"entitySettings"} onClick={() => togglePopover()} /></div>
      </div>
      <Popover placement="topLeft" visible={popoverVisibility} content={content} trigger="click" className={styles.entitySettingsPopup} />
    </div>
  );
};

export default EntitySettings;
