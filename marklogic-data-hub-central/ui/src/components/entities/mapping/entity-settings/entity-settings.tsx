import React, {useState, useEffect, useRef} from "react";
import {Row, Col, Form, FormLabel, Overlay} from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import styles from "./entity-settings.module.scss";
import {AdvancedSettingsTooltips} from "@config/tooltips.config";
import {AdvancedSettingsMessages} from "@config/messages.config";
import StepsConfig from "@config/steps.config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {HCButton, HCTooltip, HCInput} from "@components/common";
import Popover from "react-bootstrap/Popover";
import {themeColors} from "@config/themes.config";

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

  const [target, setTarget] = useState(null);
  const containerRef = useRef(null);

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
      setAdditionalCollections(value.filter(col => !defaultCollections.includes(col.value)).map(option => option.value));
    }
  };

  const handleCreateAdditionalColl = (value) => {
    if (typeof value === "string") {
      setAdditionalCollections([...additionalCollections, value]);
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

  const handleSubmit = async (event: {preventDefault: () => void;}) => {
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

  const handleOnClick = (event) => {
    setTarget(event.target);
    togglePopover();
  };

  const serviceNameKeyDownHandler = async (event, component) => {
    //Make selection when user presses space or enter key
    if ((event.keyCode === 13) || (event.keyCode === 32)) {
      if (component === "settingsIcon") {
        event.preventDefault();
        setTarget(event.target);
        togglePopover();
      }
    }
    if (event.keyCode === 27 && popoverVisibility) {
      onCancel();
    }
  };

  const togglePopover = () => {
    popoverVisibility ? setPopoverVisibilty(false) : setPopoverVisibilty(true);
  };

  const additionalCollectionsOptions = additionalCollections.map(d => ({value: d, label: d}));

  const content = (

    <Popover id={`popover-overview`} className={styles.popoverEntitySettings} onKeyDown={(event) => {
      if (event.key === "Escape" && popoverVisibility) {
        onCancel();
      }
    }}>
      <Popover.Body>
        <div id="entity-settings-popover" data-testid="entity-settings-popover" className={styles.entitySettings}>
          <h2 data-testid={`${props.entityTitle}-settings-title`} className={styles.title}>Advanced Settings: {props.entityTitle}</h2>
          <div className={styles.text}>
            <p>Specify additional collections and modify the default permissions for entity instances associated with this entity.</p>
          </div>
          <div className={styles.entitySettingsForm}>
            <Form onSubmit={handleSubmit} >
              <Row className={"mb-3"}>
                <FormLabel column lg={4}>{"Target Collections:"}</FormLabel>
                <Col className={"d-flex"}>
                  <CreatableSelect
                    id="additionalColl-select-wrapper"
                    inputId="additionalColl"
                    isMulti
                    isClearable={false}
                    placeholder="Please add target collections"
                    value={additionalCollections.map(d => ({value: d, label: d}))}
                    isDisabled={!canReadWrite}
                    onChange={handleAddColl}
                    onCreateOption={handleCreateAdditionalColl}
                    aria-label="additionalColl-select"
                    options={additionalCollectionsOptions}
                    styles={reactSelectThemeConfig}
                  />
                  <div className={"p-2 d-flex align-items-center"}>
                    <HCTooltip text={tooltips.additionalCollections} id="additional-collection-tooltip" placement="left">
                      <QuestionCircleFill tabIndex={0} color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} />
                    </HCTooltip>
                  </div>
                </Col>
              </Row>
              <Row className={"mb-3"}>
                <FormLabel column lg={4}>{"Default Collections:"}</FormLabel>
                <Col className={"d-flex"}>
                  <div className={styles.defaultCollections}>{defaultCollections.map((collection, i) => { return <div data-testid={`defaultCollections-${collection}`} key={i}>{collection}</div>; })}</div>
                </Col>
              </Row>
              <Row className={"mb-3"}>
                <FormLabel column lg={4}>{"Target Permissions:"}</FormLabel>
                <Col>
                  <Row>
                    <Col className={"d-flex"}>
                      <HCInput
                        id={"targetPermissions"}
                        placeholder="Please enter target permissions"
                        data-testid={`${props.entityTitle}-targetPermissions`}
                        value={targetPermissions}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={!canReadWrite}
                        onPressEnter={(e) => e.key === "Enter" && e.preventDefault()}
                      />
                      <div className={"p-2 d-flex align-items-center"}>
                        <HCTooltip text={tooltips.targetPermissions} id="target-permissions-tooltip" placement="left">
                          <QuestionCircleFill tabIndex={0} color={themeColors.defaults.questionCircle} className={styles.questionCircle} size={13} />
                        </HCTooltip>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className={styles.validationError} aria-label={`${props.entityTitle}-validationError`} data-testid="validationError">
                        {permissionValidationError}
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className={"mb-3"}>
                <Col className={styles.submitButtonsForm}>
                  <div className={styles.submitButtons}>
                    <HCButton variant="outline-light" data-testid={`cancel-settings`} onClick={() => onCancel()}>Cancel</HCButton>&nbsp;&nbsp;
                    {!canReadWrite || !targetPermissionsValid ? <HCTooltip text={tooltips.missingPermission} id="missing-permissions-tooltip" placement="bottom-end">
                      <span className={styles.disabledCursor}>
                        <HCButton id={"saveButton"} className={styles.saveButton} data-testid={`save-settings`} aria-label={`${props.entityTitle}-save-settings`} variant="primary" type="submit" onClick={handleSubmit} disabled={true}>Save</HCButton>
                      </span>
                    </HCTooltip> : <HCButton id={"saveButton"} data-testid={`save-settings`} aria-label={`${props.entityTitle}-save-settings`} variant="primary" type="submit" onClick={handleSubmit} disabled={false}>Save</HCButton>}
                  </div>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <div ref={containerRef}>
      <div id="entitySettings">
        <div>
          <div className={styles.entitySettingsLink}>
            <FontAwesomeIcon
              data-testid={`${props.entityTitle}-entity-settings`}
              icon={faCog}
              type="edit"
              role="entity-settings button"
              aria-label={"entitySettings"}
              tabIndex={0}
              onKeyDown={(e) => serviceNameKeyDownHandler(e, "settingsIcon")}
              onClick={handleOnClick} />
          </div>
        </div>
      </div>
      <Overlay target={target} placement="left-start" show={popoverVisibility} container={containerRef}>
        {content}
      </Overlay>
    </div>
  );
};

export default EntitySettings;
