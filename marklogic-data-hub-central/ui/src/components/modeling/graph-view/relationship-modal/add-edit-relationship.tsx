import React, {useState, useEffect, useContext} from "react";
import Select, {components as SelectComponents} from "react-select";
import {Modal, Dropdown} from "react-bootstrap";
import {ChevronDown, QuestionCircleFill} from "react-bootstrap-icons";
import {DropDownWithSearch, HCButton, HCInput, HCTooltip, HCCard} from "@components/common";
import {faExclamationCircle, faChevronDown, faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import reactSelectThemeConfig from "../../../../config/react-select-theme.config";
import styles from "./add-edit-relationship.module.scss";
import {ModelingContext} from "../../../../util/modeling-context";
// import graphConfig from "../../../../config/graph-vis.config";
import oneToManyIcon from "../../../../assets/one-to-many.svg";
import oneToOneIcon from "../../../../assets/one-to-one.svg";
import {ModelingTooltips} from "../../../../config/tooltips.config";
import ConfirmationModal from "../../../confirmation-modal/confirmation-modal";
import {ConfirmationType} from "../../../../types/common-types";
import {getSystemInfo} from "../../../../api/environment";
import {entityReferences} from "../../../../api/modeling";
import {
  PropertyOptions,
  PropertyType,
  EntityModified
} from "../../../../types/modeling-types";

type Props = {
  openRelationshipModal: boolean;
  setOpenRelationshipModal: (boolean) => (void);
  isEditing: boolean;
  relationshipInfo: any;
  entityTypes: any;
  relationshipModalVisible: any;
  toggleRelationshipModal: any;
  updateSavedEntity: any;
  canReadEntityModel: any;
  canWriteEntityModel: any;
  hubCentralConfig: any;
}

const NAME_REGEX = new RegExp("^[A-Za-z][A-Za-z0-9_-]*$");

const AddEditRelationship: React.FC<Props> = (props) => {

  const headerText = !props.isEditing ? ModelingTooltips.addRelationshipHeader : "";

  const [relationshipName, setRelationshipName] = useState(""); //set default value when editing
  const [joinPropertyValue, setJoinPropertyValue] = useState("");  //set default value when editing
  const [submitClicked, setSubmitClicked] = useState(false);
  const [oneToManySelected, setOneToManySelected] = useState(false); //set default value when editing
  const [errorMessage, setErrorMessage] = useState("");
  const [targetNodeJoinProperties, setTargetNodeJoinProperties] = useState<any[]>([]);
  const {modelingOptions, updateEntityModified} = useContext(ModelingContext);
  const [loading, toggleLoading] = useState(false);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState<ConfirmationType>(ConfirmationType.Identifer);
  const [confirmBoldTextArray, setConfirmBoldTextArray] = useState<string[]>([]);
  const [stepValuesArray, setStepValuesArray] = useState<string[]>([]);
  const [modifiedEntity, setModifiedEntity] = useState({entityName: "", modelDefinition: ""});
  const [targetEntityName, setTargetEntityName] = useState("");
  const [targetEntityColor, setTargetEntityColor] = useState("");
  const [emptyTargetEntity, setEmptyTargetEntity] = useState(false);
  const [displayEntityList, setDisplayEntityList] = useState(false);
  const [displaySourceMenu, setDisplaySourceMenu] = useState(false);
  const [optionalCollapsed, setOptionalCollapsed] = useState(true);
  const [cardinalityToggled, setCardinalityToggled] = useState(false);

  const initRelationship = (sourceEntityIdx) => {
    let sourceEntityDetails = props.entityTypes[sourceEntityIdx];
    if (props.relationshipInfo.relationshipName !== "") {
      setRelationshipName(props.relationshipInfo.relationshipName);
      setErrorMessage("");
    } else {
      setRelationshipName("");
      setErrorMessage(ModelingTooltips.relationshipEmpty);
    }
    if (props.relationshipInfo.joinPropertyName && props.relationshipInfo.joinPropertyName !== "undefined") {
      setJoinPropertyValue(props.relationshipInfo.joinPropertyName);
      setOptionalCollapsed(false);
    } else {
      setJoinPropertyValue("");
    }
    setTargetEntityName(props.relationshipInfo.targetNodeName);
    setTargetEntityColor(props.relationshipInfo.targetNodeColor);
    setOneToManySelected(false);
    if (sourceEntityDetails.model.definitions[props.relationshipInfo.sourceNodeName]?.properties[props.relationshipInfo.relationshipName]?.hasOwnProperty("items")) {
      //set cardinality selection to "multiple"
      setOneToManySelected(true);
    }
  };

  useEffect(() => {
    if (props.entityTypes.length > 0 && JSON.stringify(props.relationshipInfo) !== "{}") {
      let targetEntityIdx = props.entityTypes.findIndex(obj => obj.entityName === props.relationshipInfo.targetNodeName);
      let sourceEntityIdx = props.entityTypes.findIndex(obj => obj.entityName === props.relationshipInfo.sourceNodeName);

      initRelationship(sourceEntityIdx);
      if (props.relationshipInfo.targetNodeName !== "Select target entity type*") {
        setEmptyTargetEntity(false);
        createJoinMenu(targetEntityIdx);
      } else {
        setOptionalCollapsed(true);
        setEmptyTargetEntity(true);
      }
    }
  }, [props.entityTypes, props.relationshipInfo]);

  useEffect(() => {
    if (!props.relationshipModalVisible) {
      toggleLoading(false);
      props.setOpenRelationshipModal(false);
      props.toggleRelationshipModal(true);
    }
  }, [props.relationshipModalVisible]);

  const getPropertyType = (joinPropName, targetNodeName) => {
    let targetEntityIdx = props.entityTypes.findIndex(obj => obj.entityName === targetNodeName);
    let targetEntityDetails = props.entityTypes[targetEntityIdx];
    if (joinPropName && joinPropName !== "") {
      return targetEntityDetails.model.definitions[targetNodeName].properties[joinPropName].datatype;
    } else {
      return "";
    }
  };

  const createPropertyDefinitionPayload = (propertyOptions: PropertyOptions) => {
    let multiple = propertyOptions.multiple === "yes" ? true : false;
    let facetable = propertyOptions.facetable;
    let sortable = propertyOptions.sortable;

    if (propertyOptions.propertyType === PropertyType.RelatedEntity && !multiple) {
      let externalEntity = props.entityTypes.find(entity => entity.entityName === propertyOptions.type);
      if (propertyOptions.joinPropertyType === "") {
        return {
          datatype: "string",
          relatedEntityType: externalEntity.entityTypeId,
          joinPropertyName: propertyOptions.joinPropertyName,
        };
      } else {
        return {
          datatype: propertyOptions.joinPropertyType,
          relatedEntityType: externalEntity.entityTypeId,
          joinPropertyName: propertyOptions.joinPropertyName,
        };
      }

    } else if (propertyOptions.propertyType === PropertyType.RelatedEntity && multiple) {
      let externalEntity = props.entityTypes.find(entity => entity.entityName === propertyOptions.type);
      if (propertyOptions.joinPropertyType === "") {
        return {
          datatype: "array",
          facetable: facetable,
          sortable: sortable,
          items: {
            datatype: "string",
            relatedEntityType: externalEntity.entityTypeId,
            joinPropertyName: propertyOptions.joinPropertyName,
          }
        };
      } else {
        return {
          datatype: "array",
          facetable: facetable,
          sortable: sortable,
          items: {
            datatype: propertyOptions.joinPropertyType,
            relatedEntityType: externalEntity.entityTypeId,
            joinPropertyName: propertyOptions.joinPropertyName,
          }
        };
      }

    } else if (propertyOptions.propertyType === PropertyType.Structured && !multiple) {
      return {
        $ref: "#/definitions/" + propertyOptions.type,
      };

    } else if (propertyOptions.propertyType === PropertyType.Structured && multiple) {
      return {
        datatype: "array",
        facetable: facetable,
        sortable: sortable,
        items: {
          $ref: "#/definitions/" + propertyOptions.type,
        }
      };

    } else if (propertyOptions.propertyType === PropertyType.Basic && multiple) {
      return {
        datatype: "array",
        facetable: facetable,
        sortable: sortable,
        items: {
          datatype: propertyOptions.type,
          collation: "http://marklogic.com/collation/codepoint",
        }
      };
    } else if (propertyOptions.propertyType === PropertyType.Basic && !multiple) {
      return {
        datatype: propertyOptions.type,
        facetable: facetable,
        sortable: sortable,
        collation: "http://marklogic.com/collation/codepoint"
      };
    }
  };

  const editPropertyUpdateDefinition = async (entityIdx: number, definitionName: string, propertyName: string, editPropertyOptions) => {
    let parseName = definitionName.split(",");
    let parseDefinitionName = parseName[parseName.length - 1];
    let updatedDefinitions = {...props.entityTypes[entityIdx].model.definitions};
    let entityTypeDefinition = updatedDefinitions[parseDefinitionName];
    let newProperty = createPropertyDefinitionPayload(editPropertyOptions.propertyOptions);

    entityTypeDefinition["properties"][propertyName] = newProperty;

    if (editPropertyOptions.propertyOptions.identifier === "yes") {
      entityTypeDefinition.primaryKey = editPropertyOptions.name;
    } else if (entityTypeDefinition.hasOwnProperty("primaryKey") && entityTypeDefinition.primaryKey === propertyName) {
      delete entityTypeDefinition.primaryKey;
    }

    if (editPropertyOptions.propertyOptions.pii === "yes") {
      let index = entityTypeDefinition.pii?.indexOf(propertyName);
      if (index > -1) {
        entityTypeDefinition.pii[index] = editPropertyOptions.name;
      } else {
        if (entityTypeDefinition.hasOwnProperty("pii")) {
          entityTypeDefinition.pii.push(editPropertyOptions.name);
        } else {
          entityTypeDefinition.pii = [editPropertyOptions.name];
        }
      }
    } else {
      let index = entityTypeDefinition.pii?.indexOf(propertyName);
      if (index > -1) {
        entityTypeDefinition.pii.splice(index, 1);
      }
    }

    if (propertyName !== editPropertyOptions.name) {
      let reMapDefinition = Object.keys(entityTypeDefinition["properties"]).map((key) => {
        const newKey = key === propertyName ? editPropertyOptions.name : key;
        const value = key === propertyName ? newProperty : entityTypeDefinition["properties"][key];
        return {[newKey]: value};
      });
      entityTypeDefinition["properties"] = reMapDefinition.reduce((a, b) => Object.assign({}, a, b));

      if (entityTypeDefinition.hasOwnProperty("required") && entityTypeDefinition.required.some(value => value === propertyName)) {
        let index = entityTypeDefinition.required.indexOf(propertyName);
        entityTypeDefinition.required[index] = editPropertyOptions.name;
      }
      if (entityTypeDefinition.hasOwnProperty("rangeIndex") && entityTypeDefinition.rangeIndex.some(value => value === propertyName)) {
        let index = entityTypeDefinition.rangeIndex.indexOf(propertyName);
        entityTypeDefinition.rangeIndex[index] = editPropertyOptions.name;
      }
      if (entityTypeDefinition.hasOwnProperty("pathRangeIndex") && entityTypeDefinition.pathRangeIndex.some(value => value === propertyName)) {
        let index = entityTypeDefinition.pathRangeIndex.indexOf(propertyName);
        entityTypeDefinition.pathRangeIndex[index] = editPropertyOptions.name;
      }
      if (entityTypeDefinition.hasOwnProperty("elementRangeIndex") && entityTypeDefinition.elementRangeIndex.some(value => value === propertyName)) {
        let index = entityTypeDefinition.elementRangeIndex.indexOf(propertyName);
        entityTypeDefinition.elementRangeIndex[index] = editPropertyOptions.name;
      }
      if (entityTypeDefinition.hasOwnProperty("wordLexicon") && entityTypeDefinition.wordLexicon.some(value => value === propertyName)) {
        let index = entityTypeDefinition.wordLexicon.indexOf(propertyName);
        entityTypeDefinition.wordLexicon[index] = editPropertyOptions.name;
      }
    }

    updatedDefinitions[parseDefinitionName] = entityTypeDefinition;

    let modifiedEntityStruct: EntityModified = {
      entityName: definitionName,
      modelDefinition: updatedDefinitions
    };
    if (props.updateSavedEntity) {
      await props.updateSavedEntity([modifiedEntityStruct]);
    }

    return modifiedEntityStruct;
  };

  const onCancel = () => {
    if (!loading) {
      setErrorMessage("");
      props.toggleRelationshipModal(true);
      props.setOpenRelationshipModal(false);
      setSubmitClicked(false);
      setTargetEntityName("");
      setTargetEntityColor("");
      setJoinPropertyValue("");
      setRelationshipName("");
      setCardinalityToggled(false);
      setOptionalCollapsed(true);
    }
  };

  const onSubmit = () => {
    setSubmitClicked(true);
    if (errorMessage === "" && !emptyTargetEntity) {
      let sourceEntityIdx = props.entityTypes.findIndex(obj => obj.entityName === props.relationshipInfo.sourceNodeName);
      let sourceProperties = props.entityTypes[sourceEntityIdx].model.definitions[props.relationshipInfo.sourceNodeName].properties;
      let propertyNamesArray = props.isEditing ? Object.keys(sourceProperties).filter(propertyName => propertyName !== props.relationshipInfo.relationshipName) : Object.keys(sourceProperties);
      let joinPropertyVal = joinPropertyValue === "None" ? "" : joinPropertyValue;
      if (propertyNamesArray.includes(relationshipName) || props.relationshipInfo.sourceNodeName === relationshipName) {
        setErrorMessage("name-error");
      } else {

        const newEditPropertyOptions = {
          name: relationshipName,
          isEdit: props.isEditing,
          propertyOptions: {
            facetable: false,
            identifier: "no",
            joinPropertyName: joinPropertyVal,
            joinPropertyType: getPropertyType(joinPropertyVal, targetEntityName),
            multiple: oneToManySelected ? "yes" : "no",
            pii: "no",
            propertyType: "relatedEntity",
            sortable: false,
            type: targetEntityName
          }
        };

        //do not enter loading save if no changes have been made
        if (joinPropertyValue === props.relationshipInfo.joinPropertyName && relationshipName === props.relationshipInfo.relationshipName && !cardinalityToggled) {
          toggleLoading(false);
          props.setOpenRelationshipModal(false);
        } else {
          toggleLoading(true);
          let entityModified: any = editPropertyUpdateDefinition(sourceEntityIdx, props.relationshipInfo.sourceNodeName, props.relationshipInfo.relationshipName, newEditPropertyOptions);
          updateEntityModified(entityModified);
        }
        setCardinalityToggled(false);
        setOptionalCollapsed(true);
        setJoinPropertyValue("");
        setErrorMessage("");
        setSubmitClicked(false);
      }
    }
  };

  const createJoinMenu = (entityIdx) => {
    let targetEntityDetails, entityUpdated, modelUpdated, menuProps, model;
    targetEntityDetails = props.entityTypes[entityIdx];
    model = targetEntityDetails.model.definitions[props.relationshipInfo.targetNodeName];
    entityUpdated = modelingOptions.modifiedEntitiesArray.find(ent => ent.entityName === props.relationshipInfo.targetNodeName);
    // Modified model data (if present)
    if (entityUpdated) {
      modelUpdated = entityUpdated.modelDefinition[props.relationshipInfo.targetNodeName];
    }
    menuProps = getJoinMenuProps(model, modelUpdated);
    menuProps.unshift({value: "None", label: "None", type: "string"});
    if (menuProps) {
      setTargetNodeJoinProperties(menuProps);
    } else {
      setTargetNodeJoinProperties([]);
    }
  };

  const getJoinMenuProps = (model, modelUpdated) => {
    let alreadyAdded: string[] = [], result;
    // Check each property from saved model and build menu items
    if (model) {
      result = Object.keys(model.properties).map(key => {
        alreadyAdded.push(key);
        // Structured property case
        if (model.properties[key].hasOwnProperty("$ref")) {
          return {
            value: key,
            label: key,
            type: "", // TODO
            disabled: true,
            // TODO Support structure properties
            // children: getJoinProps(...)
          };
        } else if (model.properties[key]["datatype"] === "array") {
          // Array property case
          return {
            value: key,
            label: key,
            type: "", // TODO
            disabled: true
          };
        } else {
          // Default case
          return {
            value: key,
            label: key,
            type: model.properties[key].datatype
          };
        }
      });
    }
    // Include any new properties from updated model object
    if (modelUpdated) {
      Object.keys(modelUpdated?.properties).map(key => {
        if (!alreadyAdded.includes(key)) {
          result.push({
            value: key,
            label: key,
            type: modelUpdated.properties[key].datatype,
            disabled: true
          });
        }
      });
    }
    return result;
  };

  const toggleCardinality = () => {
    if (oneToManySelected) {
      setOneToManySelected(false);
    } else {
      setOneToManySelected(true);
    }
    setCardinalityToggled(!cardinalityToggled);
  };

  const handleChange = (event) => {
    if (event.target.id === "relationship") {
      setRelationshipName(event.target.value);
      if (event.target.value === "") {
        setErrorMessage(ModelingTooltips.relationshipEmpty);
      } else if (!NAME_REGEX.test(event.target.value)) {
        setErrorMessage(ModelingTooltips.nameRegex);
      } else {
        setErrorMessage("");
      }
    }
  };

  const handleOptionSelect = (selectedItem) => {
    setJoinPropertyValue(selectedItem.value);
  };

  function handleMenuClick(event) {
    let model, menuProps, entityName, entityIdx;
    setEmptyTargetEntity(false);
    //update join property dropdown with new target entity properties and clear existing value
    entityName = event;
    entityIdx = props.entityTypes.findIndex(entity => entity.entityName === entityName);
    model = props.entityTypes[entityIdx].model.definitions[entityName];
    menuProps = getJoinMenuProps(model, "");
    menuProps.unshift({value: "None", label: "None", type: "string"});
    if (menuProps) {
      setTargetNodeJoinProperties(menuProps);
    } else {
      setTargetNodeJoinProperties([]);
    }
    setJoinPropertyValue("");

    //update target entity name and color,
    setTargetEntityName(entityName);
    if (props.hubCentralConfig.modeling.entities.hasOwnProperty(entityName) && props.hubCentralConfig.modeling.entities[entityName].hasOwnProperty("color")) {
      setTargetEntityColor(props.hubCentralConfig.modeling.entities[entityName].color);
    } else {
      setTargetEntityColor("#EEEFF1"); //assigning default color if entity is not assigned a color yet
    }
    setDisplaySourceMenu(prev => false);
    setDisplayEntityList(prev => false);
  }

  //format entity types to tuples for DropDownWithSearch to work
  const entityTypesToTuples = (entityTypes) => {
    let entityTuples:any = [];
    entityTypes.map(entity => {
      entityTuples.push({value: entity.entityName, key: entity.entityName, struct: false});
    });
    return entityTuples;
  };

  const toggleDropdown = () => {
    setDisplayEntityList(!displayEntityList);
  };

  const toggleOptionalIcon = () => {
    setOptionalCollapsed(!optionalCollapsed);
  };

  const cardinalityTooltipText = ModelingTooltips.cardinalityButton();

  const menu = (
    <DropDownWithSearch
      displayMenu={displaySourceMenu}
      setDisplayMenu={setDisplaySourceMenu}
      setDisplaySelectList={setDisplayEntityList}
      displaySelectList={displayEntityList}
      itemValue={""}
      onItemSelect={handleMenuClick}
      srcData={entityTypesToTuples(props.entityTypes)}
      propName={""}
      handleDropdownMenu={{}}
      indentList={null}
      modelling={true}
    />
  );

  const MenuList  = (props) => (
    <div id="foreignKey-dropdown-MenuList">
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const foreignKeyOptions = targetNodeJoinProperties.length > 0 ? targetNodeJoinProperties.map((prop, index) => ({value: prop.value, label: prop.label, isDisabled: prop.disabled})) : [];

  const foreignKeyDropdown = (
    <Select
      id="foreignKey-dropdown-wrapper"
      inputId="foreignKey-dropdown"
      components={{MenuList}}
      placeholder="Select foreign key"
      value={foreignKeyOptions.find(oItem => oItem.value === joinPropertyValue)}
      onChange={handleOptionSelect}
      isSearchable={false}
      isDisabled={emptyTargetEntity}
      aria-label="foreignKey-dropdown"
      options={foreignKeyOptions}
      styles={reactSelectThemeConfig}
      formatOptionLabel={({value, label}) => {
        return (
          <span aria-label={`${label}-option`}>
            {label === "None" ? "- " + label + " -" : label}
          </span>
        );
      }}
    />
  );

  const deleteEntityProperty= async () => {
    let entityName = props.relationshipInfo.sourceNodeName;
    let propertyName = props.relationshipInfo.relationshipName;
    const response = await entityReferences(entityName, propertyName);
    if (response !== undefined && response["status"] === 200) {
      let newConfirmType = ConfirmationType.DeletePropertyWarn;
      let boldText: string[] = [propertyName];
      if (response["data"]["entityNamesWithForeignKeyReferences"].length > 0) {
        boldText.push(entityName);
        newConfirmType = ConfirmationType.DeleteEntityPropertyWithForeignKeyReferences;
        setStepValuesArray(response["data"]["entityNamesWithForeignKeyReferences"]);
      } else if (response["data"]["stepNames"].length > 0) {
        boldText.push(entityName);
        newConfirmType = ConfirmationType.DeletePropertyStepWarn;
        setStepValuesArray(response["data"]["stepNames"]);
      }
      setConfirmBoldTextArray(boldText);
      setConfirmType(newConfirmType);
      toggleConfirmModal(true);
    }
    let sourceEntityName = props.relationshipInfo.sourceNodeName;
    let entityTypeDefinition;
    let updatedDefinitions;
    for (let i = 0; i < props.entityTypes.length; i++) {
      if (props.entityTypes[i].entityName === sourceEntityName) {
        updatedDefinitions = {...props.entityTypes[i].model};
        entityTypeDefinition = props.entityTypes[i].model.definitions[sourceEntityName];
      }
    }
    delete entityTypeDefinition["properties"][propertyName];
    updatedDefinitions[sourceEntityName] = entityTypeDefinition;
    let entityModifiedInfo: EntityModified = {
      entityName: sourceEntityName,
      modelDefinition: updatedDefinitions.definitions
    };
    setModifiedEntity(entityModifiedInfo);
    updateEntityModified(modifiedEntity);
  };

  const modalFooter = <>
    <div className={styles.deleteTooltip}>
      <HCTooltip text={ModelingTooltips.deleteRelationshipIcon} id="delete-relationship-tooltip" placement="top">
        <i key="last" role="delete-entity button" data-testid={"delete-relationship"}>
          <FontAwesomeIcon className={!props.canWriteEntityModel && props.canReadEntityModel ? styles.iconTrashReadOnly : styles.deleteIcon} size="lg"
            icon={faTrashAlt}
            onClick={(event) => {
              if (!props.canWriteEntityModel && props.canReadEntityModel) {
                return event.preventDefault();
              } else {
                deleteEntityProperty();
              }
            }} />
        </i>
      </HCTooltip>
    </div>
    <div>
      <HCButton
        aria-label="relationship-modal-cancel"
        variant="outline-light"
        className={"ms-auto me-2"}
        onClick={onCancel}
      >Cancel</HCButton>
      <HCButton
        aria-label="relationship-modal-submit"
        // form="property-form"
        variant="primary"
        type="submit"
        loading={loading}
        onClick={onSubmit}
      >{props.isEditing ? "Save" : "Add"}</HCButton>
    </div>
  </>;

  const confirmAction = async () => {
    await props.updateSavedEntity([modifiedEntity]);
    await getSystemInfo();
    toggleConfirmModal(false);
  };

  return (<Modal
    show={props.openRelationshipModal}
    dialogClassName={styles.dialog960w}
  >
    <Modal.Header className={"pe-4"}>
      <span aria-label="relationshipHeader" className={"fs-3"}>{props.isEditing ? "Edit Relationship" : "Add a Relationship"}</span>
      <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
    </Modal.Header>
    <Modal.Body className={"py-4"}>
      <div aria-label="relationshipModal" id="relationshipModal" className={styles.relationshipModalContainer}>
        {
          <div aria-label="header-message">
            {headerText}
          </div>
        }
        <div aria-label="relationshipActions" className={styles.relationshipDisplay}>
          <div className={styles.nodeDisplay}>
            <span className={styles.nodeLabel}>SOURCE</span>
            <HCCard data-testid={"sourceEntityNode"} style={{width: 204, backgroundColor: props.relationshipInfo.sourceNodeColor}} bodyClassName={styles.cardBody} className={styles.cardContainer}>
              <p data-testid={`${props.relationshipInfo.sourceNodeName}-sourceNodeName`} className={styles.entityName}><b>{props.relationshipInfo.sourceNodeName}</b></p>
            </HCCard>
          </div>
          <div className={styles.relationshipInputContainer}>
            <HCInput
              id="relationship"
              placeholder="Relationship*"
              value={relationshipName}
              onChange={handleChange}
              size={"sm"}
              className={styles.relationshipInput}
              ariaLabel="relationship-textarea"
              style={errorMessage && submitClicked ? {border: "solid 1px #C00"} : {}}
            />
            {errorMessage && submitClicked ?
              <HCTooltip text={errorMessage === "name-error" ? ModelingTooltips.duplicatePropertyError(relationshipName) : errorMessage} placement={"bottom"} id="exclamation-tooltip">
                <i data-testid="error-circle"><FontAwesomeIcon icon={faExclamationCircle} size="1x" className={styles.errorIcon} /></i>
              </HCTooltip> : ""}
            <HCTooltip text={ModelingTooltips.relationshipNameInfo(props.relationshipInfo.sourceNodeName)} placement={"bottom"} id="relationship-name-tooltip">
              <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircle} />
            </HCTooltip>
          </div>
          <hr className={styles.horizontalLine}></hr>
          <HCTooltip id="cardinality-tooltip" text={cardinalityTooltipText} placement={"bottom"}>
            <span>
              <HCButton variant="onlined-light" className={styles.cardinalityButton} data-testid="cardinalityButton" onClick={() => toggleCardinality()}>
                {oneToManySelected ? <img data-testid="oneToManyIcon" className={styles.oneToManyIcon} src={oneToManyIcon} alt={""} onClick={() => toggleCardinality()}/> : <img data-testid="oneToOneIcon" className={styles.oneToOneIcon} src={oneToOneIcon} alt={""} onClick={() => toggleCardinality()}/>}
              </HCButton>
            </span>
          </HCTooltip>
          <div className={styles.nodeDisplay}>
            <span className={styles.nodeLabel}>TARGET</span>
            <div className={submitClicked && emptyTargetEntity ? styles.targetEntityErrorContainer : styles.targetEntityContainer}>
              <HCCard data-testid={"targetEntityNode"} style={{width: 204, backgroundColor: targetEntityColor}} bodyClassName={styles.cardBody} className={styles.cardContainer}>
                <p data-testid={`${targetEntityName}-targetNodeName`} className={styles.entityName}>{emptyTargetEntity ? targetEntityName : <b>{targetEntityName}</b>}</p>
              </HCCard>
              {!props.isEditing ?
                <Dropdown placement="bottom" className={styles.dropdown}>
                  <Dropdown.Toggle className={styles.dropdownTrigger} >
                    <span >
                      {
                        <ChevronDown className={styles.dropdownMenuIcon} data-testid={"targetEntityDropdown"} onClick={(e) => toggleDropdown()}/>
                      }
                  </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className={styles.dropdownMenu} >
                    {menu}
                  </Dropdown.Menu>
                </Dropdown>
                : null }
            </div>
            {submitClicked && emptyTargetEntity ? <span className={styles.targetEntityErrorMsg}>{ModelingTooltips.targetEntityEmpty}</span> : null}
          </div>
        </div>
        <div className={styles.toggleOptional}>
          {optionalCollapsed ?
            <FontAwesomeIcon className={styles.optionalIcon} icon={faChevronRight} size={"sm"} onClick = {(e) => toggleOptionalIcon()}/>
            :
            <FontAwesomeIcon className={styles.optionalIcon} icon={faChevronDown} size={"sm"} onClick = {(e) => toggleOptionalIcon()}/>
          }
          <span id={"toggleOptional"} className={styles.optionalText} onClick = {(e) => toggleOptionalIcon()}>Optional</span>
        </div>
        { !optionalCollapsed && (
          <div data-testid={"optionalContent"} className={styles.foreignKeyContainer}>
            <span className={styles.foreignKeyText}>You can select the foreign key now or later:</span>
            <div className={`mx-3 ${styles.foreignKeyDropdownContainer}`}>
              {foreignKeyDropdown}
              <HCTooltip id="foreign-key-tooltip" text={ModelingTooltips.foreignKeyInfo} placement={"right"}>
                <QuestionCircleFill color="#7F86B5" size={13} className={styles.questionCircle}/>
              </HCTooltip>
            </div>
          </div>
        )
        }
        <div className={styles.requiredFootnote}>* Required</div>
      </div>
      <ConfirmationModal
        isVisible={showConfirmModal}
        type={confirmType}
        boldTextArray={confirmBoldTextArray}
        arrayValues={stepValuesArray}
        toggleModal={toggleConfirmModal}
        confirmAction={confirmAction}
      />
    </Modal.Body>
    <Modal.Footer className={"d-flex justify-content-between py-2"}>
      {modalFooter}
    </Modal.Footer>
  </Modal>);

};

export default AddEditRelationship;
