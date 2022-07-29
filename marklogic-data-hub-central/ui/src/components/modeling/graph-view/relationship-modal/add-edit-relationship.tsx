import React, {useState, useEffect, useContext, useRef} from "react";
import Select, {components as SelectComponents} from "react-select";
import {Modal, Dropdown, Row, Col, Form, FormLabel, ButtonGroup} from "react-bootstrap";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import styles from "./add-edit-relationship.module.scss";
import "./add-edit-relationship.scss";
import {ModelingContext} from "@util/modeling-context";
// import graphConfig from "@config/graph-vis.config";
import oneToManyIcon from "../../../../assets/one-to-many.svg";
import oneToOneIcon from "../../../../assets/one-to-one.svg";
import {faExclamationCircle, faChevronDown, faChevronRight, faSearch, faList} from "@fortawesome/free-solid-svg-icons";
import {ModelingTooltips} from "@config/tooltips.config";
import ConfirmationModal from "../../../confirmation-modal/confirmation-modal";
import {ConfirmationType} from "../../../../types/common-types";
import {getSystemInfo} from "@api/environment";
import {entityReferences} from "@api/modeling";
import {
  PropertyOptions,
  PropertyType,
  EntityModified
} from "../../../../types/modeling-types";
import {ChevronDown, QuestionCircleFill} from "react-bootstrap-icons";
import {HCButton, HCInput, HCTooltip, HCCard, DynamicIcons, HCDivider, DropDownWithSearch} from "@components/common";
import {themeColors} from "@config/themes.config";
import {defaultIcon, defaultConceptIcon} from "@config/explore.config";
import {getCategoryWithinModel, iconExistsForNode} from "@util/modeling-utils";
import {simulateMouseClick} from "@util/common-utils";

type Props = {
  openRelationshipModal: boolean;
  setOpenRelationshipModal: (boolean) => (void);
  isEditing: boolean;
  relationshipInfo: any;
  dataModel: any;
  relationshipModalVisible: any;
  toggleRelationshipModal: any;
  updateSavedEntity: any;
  canReadEntityModel: any;
  canWriteEntityModel: any;
  hubCentralConfig: any;
  getColor: any;
  mapFunctions: any;
}

const NAME_REGEX = new RegExp("^[A-Za-z][A-Za-z0-9_-]*$");

enum eVisibleSettings {
  EntityToEntity,
  EntityToConceptClass
}

const AddEditRelationship: React.FC<Props> = (props) => {

  const [visibleSettings, setVisibleSettings] = useState<eVisibleSettings>(props.relationshipInfo.isConcept ? eVisibleSettings.EntityToConceptClass : eVisibleSettings.EntityToEntity);
  const headerText = !props.isEditing ? visibleSettings === eVisibleSettings.EntityToConceptClass ? ModelingTooltips.addRelationshipHeader("entityToConceptClass") : ModelingTooltips.addRelationshipHeader("entityToEntity") : "";

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
  const [optionalCollapsed, setOptionalCollapsed] = useState(true);
  const [cardinalityToggled, setCardinalityToggled] = useState(false);
  const [filterEntity, setFilterEntity] = useState("");

  const [relationshipExpression, setRelationshipExpression] = useState("");
  const [sourceNodeJoinProperties, setSourceNodeJoinProperties] = useState<any[]>([]);
  const [sourcePropertyValue, setSourcePropertyValue] = useState("");

  //Function and source property dropdowns
  const [functionValue, setFunctionValue] = useState("");
  const [propListForDropDown, setPropListForDropDown] = useState<any>([]);
  const [displaySelectList, setDisplaySelectList] = useState(false);
  const [displayFuncMenu, setDisplayFuncMenu] = useState(false);
  const [caretPosition, setCaretPosition] = useState(0);
  const [displaySourceMenu, setDisplaySourceMenu] = useState(false);
  const [displaySourceList, setDisplaySourceList] = useState(false);
  const [sourceValue, setSourceValue] = useState("");
  const [sourcePropName, setSourcePropName] = useState("");
  //Dummy ref node to simulate a click event
  const dummyNode: any = useRef();

  const initRelationship = (sourceEntityIdx) => {
    let sourceEntityDetails = props.dataModel[sourceEntityIdx];
    if (props.relationshipInfo.relationshipName !== "") {
      setRelationshipName(props.relationshipInfo.relationshipName);
      setErrorMessage("");
    } else {
      setRelationshipName("");
      setErrorMessage(ModelingTooltips.relationshipEmpty);
    }
    if (props.relationshipInfo.joinPropertyName && props.relationshipInfo.joinPropertyName !== "undefined") {
      if (props.relationshipInfo.isConcept) {
        setSourcePropertyValue(props.relationshipInfo.joinPropertyName);
        setRelationshipExpression(props.relationshipInfo.conceptExpression);
      } else {
        setJoinPropertyValue(props.relationshipInfo.joinPropertyName);
        setOptionalCollapsed(false);
      }
    } else {
      setJoinPropertyValue("");
      setSourcePropertyValue("");
      setRelationshipExpression("");
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
    if (props.dataModel.length > 0 && JSON.stringify(props.relationshipInfo) !== "{}") {
      let isConcept = props.relationshipInfo.isConcept;
      setVisibleSettings(!isConcept ? eVisibleSettings.EntityToEntity : eVisibleSettings.EntityToConceptClass);
      let targetEntityIdx = props.dataModel.findIndex(obj => isConcept ? obj.conceptName === props.relationshipInfo.targetNodeName : obj.entityName === props.relationshipInfo.targetNodeName);
      let sourceEntityIdx = props.dataModel.findIndex(obj => obj.entityName === props.relationshipInfo.sourceNodeName);

      initRelationship(sourceEntityIdx);
      if (!isConcept) {
        if (props.relationshipInfo.targetNodeName !== "Select target entity type*") {
          setEmptyTargetEntity(false);
          createJoinMenu(targetEntityIdx);
        } else {
          setOptionalCollapsed(true);
          setEmptyTargetEntity(true);
        }
      } else {
        if (props.relationshipInfo.targetNodeName !== "Select a concept class*") {
          setEmptyTargetEntity(false);
          createJoinMenu(sourceEntityIdx);
        } else {
          setOptionalCollapsed(true);
          setEmptyTargetEntity(true);
        }
      }
    }
  }, [props.dataModel, props.relationshipInfo]);

  useEffect(() => {
    if (visibleSettings === eVisibleSettings.EntityToConceptClass) {
      let sourceEntityIdx = props.dataModel.findIndex(obj => obj.entityName === props.relationshipInfo.sourceNodeName);
      createJoinMenu(sourceEntityIdx);
    }
  }, [visibleSettings]);

  useEffect(() => {
    if (!props.relationshipModalVisible) {
      toggleLoading(false);
      props.setOpenRelationshipModal(false);
      props.toggleRelationshipModal(true);
    }
  }, [props.relationshipModalVisible]);

  const getPropertyType = (joinPropName, targetNodeName) => {
    let targetEntityIdx = props.dataModel.findIndex(obj => obj.entityName === targetNodeName);
    let targetEntityDetails = props.dataModel[targetEntityIdx];
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
      let externalEntity = props.dataModel.find(entity => entity.entityName === propertyOptions.type);
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
      let externalEntity = props.dataModel.find(entity => entity.entityName === propertyOptions.type);
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
    let updatedDefinitions = {...props.dataModel[entityIdx].model.definitions};
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

  const editRelatedConceptUpdateEntityType = async (entityIdx: number, definitionName: string, editRelatedConceptOptions) => {
    let parseName = definitionName.split(",");
    let parseDefinitionName = parseName[parseName.length - 1];
    let updatedDefinitions = {...props.dataModel[entityIdx].model.definitions};
    let entityTypeDefinition = updatedDefinitions[parseDefinitionName];
    let conceptClassName = editRelatedConceptOptions.conceptClass;
    if (entityTypeDefinition.hasOwnProperty("relatedConcepts")) {
      let conceptClassIndex = entityTypeDefinition.relatedConcepts.findIndex(obj => obj.conceptClass === conceptClassName);
      if (conceptClassIndex !== -1) {
        entityTypeDefinition["relatedConcepts"][conceptClassIndex] = editRelatedConceptOptions;
      } else {
        entityTypeDefinition["relatedConcepts"].push(editRelatedConceptOptions);
      }
    } else {
      entityTypeDefinition["relatedConcepts"] = [editRelatedConceptOptions];
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
      setSourcePropertyValue("");
      setCardinalityToggled(false);
      setOptionalCollapsed(true);
    }
  };

  const onSubmit = () => {
    setSubmitClicked(true);
    if (errorMessage === "" && !emptyTargetEntity) {
      let sourceEntityIdx = props.dataModel.findIndex(obj => obj.entityName === props.relationshipInfo.sourceNodeName);
      let sourceProperties = props.dataModel[sourceEntityIdx].model.definitions[props.relationshipInfo.sourceNodeName].properties;
      let propertyNamesArray = props.isEditing ? Object.keys(sourceProperties).filter(propertyName => propertyName !== props.relationshipInfo.relationshipName) : Object.keys(sourceProperties);
      let joinPropertyVal = joinPropertyValue === "None" ? "" : joinPropertyValue;
      if (propertyNamesArray.includes(relationshipName) || props.relationshipInfo.sourceNodeName === relationshipName) {
        setErrorMessage("name-error");
      } else {

        //do not enter loading save if no changes have been made
        if (joinPropertyValue === props.relationshipInfo.joinPropertyName && relationshipName === props.relationshipInfo.relationshipName && !cardinalityToggled) {
          toggleLoading(false);
          props.setOpenRelationshipModal(false);
        } else {
          toggleLoading(true);
          let entityModified: any;
          if (visibleSettings === eVisibleSettings.EntityToEntity) {
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
            entityModified = editPropertyUpdateDefinition(sourceEntityIdx, props.relationshipInfo.sourceNodeName, props.relationshipInfo.relationshipName, newEditPropertyOptions);
          } else {
            let newRelatedConceptPayload = {
              conceptClass: targetEntityName,
              conceptExpression: relationshipExpression,
              context: sourcePropertyValue,
              predicate: relationshipName
            };
            entityModified = editRelatedConceptUpdateEntityType(sourceEntityIdx, props.relationshipInfo.sourceNodeName, newRelatedConceptPayload);
          }
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
    targetEntityDetails = props.dataModel[entityIdx];
    let isConceptClassJoinView = visibleSettings === eVisibleSettings.EntityToConceptClass;
    model = isConceptClassJoinView ? targetEntityDetails.model.definitions[props.relationshipInfo.sourceNodeName] : targetEntityDetails.model.definitions[props.relationshipInfo.targetNodeName];
    entityUpdated = modelingOptions.modifiedEntitiesArray.find(ent => ent.entityName === props.relationshipInfo.targetNodeName);
    // Modified model data (if present)
    if (entityUpdated) {
      modelUpdated = entityUpdated.modelDefinition[props.relationshipInfo.targetNodeName];
    }
    menuProps = getJoinMenuProps(model, modelUpdated);
    //menuProps.unshift({value: "None", label: "None", type: "string"});
    if (menuProps) {
      menuProps.unshift({value: "None", label: "None", type: "string"});
      !isConceptClassJoinView ? setTargetNodeJoinProperties(menuProps) : setSourceNodeJoinProperties(menuProps);
    } else {
      !isConceptClassJoinView ? setTargetNodeJoinProperties([]) : setSourceNodeJoinProperties([]);
    }
  };

  const getJoinMenuProps = (model, modelUpdated) => {
    let alreadyAdded: string[] = [], result;
    // Check each property from saved model and build menu items
    if (model) {
      result = model.properties && Object.keys(model.properties).map(key => {
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

  const handlePropertySelect = (selectedItem) => {
    setSourcePropertyValue(selectedItem.value);
  };

  function handleMenuClick(event) {
    let model, menuProps, entityName, entityIdx;
    setEmptyTargetEntity(false);
    //update join property dropdown with new target entity properties and clear existing value
    entityName = event;
    let isConcept = visibleSettings === eVisibleSettings.EntityToConceptClass;
    let nodeName = !isConcept ? "entityName" : "conceptName";
    if (!isConcept) {
      entityIdx = props.dataModel.findIndex(entity => entity[nodeName] === entityName);
      model = props.dataModel[entityIdx].model.definitions[entityName];
      menuProps = getJoinMenuProps(model, "");
      menuProps.unshift({value: "None", label: "None", type: "string"});
      if (menuProps) {
        setTargetNodeJoinProperties(menuProps);
      } else {
        setTargetNodeJoinProperties([]);
      }
      setJoinPropertyValue("");
    }

    //update target entity name and color,
    setTargetEntityName(entityName);
    let category = !isConcept ? "entities" : "concepts";
    let nodeColor = props.getColor(entityName, isConcept) || props.hubCentralConfig.modeling[category][entityName].color;
    setTargetEntityColor(nodeColor);
  }

  //format entity types to tuples to work
  const entityTypesToTuples = (entityTypes) => {
    let entityTuples:any = [];
    let isConcept = visibleSettings === eVisibleSettings.EntityToConceptClass;
    let nodeName = !isConcept ? "entityName" : "conceptName";
    let entityTypesUpdated = !isConcept ? entityTypes : entityTypes.filter(e => e.hasOwnProperty("conceptName"));
    entityTypesUpdated.forEach(entity => entityTuples.push({value: entity[nodeName], key: entity[nodeName], struct: false}));
    return entityTuples;
  };

  const toggleOptionalIcon = () => {
    setOptionalCollapsed(!optionalCollapsed);
  };

  const cardinalityTooltipText = ModelingTooltips.cardinalityButton();

  const DropdownMenu = <Dropdown.Menu style={{minWidth: "250px"}} align={"end"}>
    <HCInput
      value={filterEntity}
      id="inputEntitySearch"
      className={`mx-2 my-2 w-auto`}
      onChange={(e) => setFilterEntity(e.target.value)}
      suffix={<FontAwesomeIcon icon={faSearch} className={styles.searchIcon}/>}
    />
    {
      entityTypesToTuples(props.dataModel)
        .filter(oElement => !filterEntity || (oElement.value && oElement.value.toLowerCase().includes(filterEntity.toLowerCase())))
        .map((item, index) =>
          <Dropdown.Item
            data-testid={`${item.value}-option`}
            onClick={() => handleMenuClick(item.value)}
            eventKey={index}
            role={"option"}
            key={index}
          >
            {item.value}
          </Dropdown.Item>
        )
    }
  </Dropdown.Menu>;

  const MenuList  = (props) => (
    <div id="foreignKey-dropdown-MenuList">
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const foreignKeyOptions = targetNodeJoinProperties.length > 0 ? targetNodeJoinProperties.map((prop, index) => ({value: prop.value, label: prop.label, isDisabled: prop.disabled})) : [];

  const sourcePropertyOptions = sourceNodeJoinProperties.length > 0 ? sourceNodeJoinProperties.map((prop, index) => ({key: prop.label, value: prop.value, label: prop.label, isDisabled: prop.disabled})) : [];

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

  const propertyDropdown = (
    <Select
      id="property-dropdown-wrapper"
      inputId="property-dropdown"
      components={{MenuList}}
      placeholder="Select property"
      value={sourcePropertyOptions.find(oItem => oItem.value === sourcePropertyValue)}
      onChange={handlePropertySelect}
      isSearchable={false}
      aria-label="property-dropdown"
      options={sourcePropertyOptions}
      className={styles.propertySelectDropdown}
      styles={{...reactSelectThemeConfig,
        control: (provided, state) => ({
          ...provided,
          minHeight: "25px"
        }),
        dropdownIndicator: (provided, state) => ({
          ...provided,
          height: "25px",
          marginTop: "-10px"
        })}}
      formatOptionLabel={({value, label}) => {
        return (
          <span aria-label={`${label}-option`}>
            {label === "None" ? "- " + label + " -" : label}
          </span>
        );
      }}
    />
  );

  const handleRelationshipDeletion = async () => {
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
    for (let i = 0; i < props.dataModel.length; i++) {
      if (props.dataModel[i].entityName === sourceEntityName) {
        updatedDefinitions = {...props.dataModel[i].model};
        entityTypeDefinition = props.dataModel[i].model.definitions[sourceEntityName];
      }
    }
    if (visibleSettings === eVisibleSettings.EntityToEntity) {
      delete entityTypeDefinition["properties"][propertyName];
    } else {
      let itemIndex = entityTypeDefinition["relatedConcepts"].findIndex(obj => obj.predicate === propertyName && obj.conceptClass === targetEntityName);
      entityTypeDefinition["relatedConcepts"].splice(itemIndex, 1);
    }
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
                handleRelationshipDeletion();
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

  const getEntityTypeIcon = (nodeName, isConceptTarget?: boolean) => {
    let defaultNodeIcon = isConceptTarget ? defaultConceptIcon : defaultIcon;
    let icon = defaultNodeIcon;
    let modelCategory = getCategoryWithinModel(isConceptTarget);
    let iconExistsOnServer = iconExistsForNode(nodeName, isConceptTarget, props.hubCentralConfig);
    return iconExistsOnServer ? props.hubCentralConfig.modeling[modelCategory][nodeName].icon
      : icon;
  };

  const handleSelectedVisibleSetting = async ({target: {value}}) => {
    setVisibleSettings(eVisibleSettings[value as keyof typeof eVisibleSettings]);
    setTargetEntityName(value === "EntityToConceptClass" ? "Select a concept class*" : "Select target entity type*");
    setEmptyTargetEntity(true);
    setTargetEntityColor(value === "EntityToConceptClass" ? themeColors.defaults.conceptColor : themeColors.defaults.entityColor);
    setSubmitClicked(false);
  };

  const insertContent = async (content, contentType: string) => {
    let newExpression;
    if (!relationshipExpression) {
      newExpression = "";
    }
    newExpression = relationshipExpression.substr(0, caretPosition) + content +
    relationshipExpression.substr(caretPosition, relationshipExpression.length);
    setRelationshipExpression(newExpression);

    if (contentType === "function") {
      setDisplaySelectList(prev => false);
      setDisplayFuncMenu(prev => false);
      setFunctionValue("");
    } else {
      setDisplaySourceList(false);
      setDisplaySourceMenu(false);
      setSourceValue("");
    }

    //simulate a click event to handle simultaneous event propagation of dropdown and select
    simulateMouseClick(dummyNode.current);
  };

  const functionsDef = (functionName) => {
    return props.mapFunctions.find(func => {
      return func.functionName === functionName;
    }).signature;
  };

  const onFunctionSelect = ({value}) => {
    setFunctionValue(value);
    insertContent(functionsDef(value), "function");
  };

  const onSourcePropertySelect = ({value}) => {
    setSourceValue(value);
    insertContent(value, "sourceProp");
  };

  /* Insert Function signature in expression */
  const handleFunctionsList = async () => {
    let funcArr: any[] = [];
    props.mapFunctions.forEach(element => {
      funcArr.push({"key": element.functionName, "value": element.functionName});
    });
    setPropListForDropDown(funcArr);
    if (!displaySelectList && !displayFuncMenu) {
      setFunctionValue("");
      await setDisplaySelectList(true);
      await setDisplayFuncMenu(true);
    } else {
      await setDisplaySelectList(false);
      await setDisplayFuncMenu(false);
    }
  };

  const handleSourceList = async (e) => {
    let name = e.target.value;
    setSourcePropName(name);
    if (!displaySourceList && !displaySourceMenu) {
      setSourceValue("");
      await setDisplaySourceList(true);
      await setDisplaySourceMenu(true);
    } else {
      await setDisplaySourceList(false);
      await setDisplaySourceMenu(false);
    }
  };

  const functionMenu = (
    <DropDownWithSearch
      displayMenu={displayFuncMenu}
      setDisplayMenu={setDisplayFuncMenu}
      setDisplaySelectList={setDisplaySelectList}
      displaySelectList={displaySelectList}
      itemValue={functionValue}
      onItemSelect={onFunctionSelect}
      srcData={propListForDropDown}
      propName={"relationshipExpression"}
      handleDropdownMenu={handleFunctionsList}
    />
  );

  const functionDropdown = () => {
    return (
      <Dropdown className="ms-1 me-2 mt-2" as={ButtonGroup} autoClose="outside"
        onToggle={(show) => {
          show && handleFunctionsList();
        }}
      >

        <Dropdown.Toggle id="functionIcon"
          data-testid={"optionalExpression-functionIcon"}
          className={styles.functionIcon}
          size="sm"
          variant="outline-light">
          <HCTooltip id="function-tooltip" text={"Function"} placement="bottom">
            <span>
              fx
            </span>
          </HCTooltip>
        </Dropdown.Toggle>

        <Dropdown.Menu className="p-0 m-0 border-0 bg-transparent rounded-0">
          <Dropdown.Item className={styles.dropdownMenuItem}>
            {functionMenu}
          </Dropdown.Item>
        </Dropdown.Menu>

      </Dropdown>
    );
  };

  const sourceMenu = (
    <DropDownWithSearch
      displayMenu={displaySourceMenu}
      setDisplayMenu={setDisplaySourceMenu}
      setDisplaySelectList={setDisplaySourceList}
      displaySelectList={displaySourceList}
      itemValue={sourceValue}
      onItemSelect={onSourcePropertySelect}
      srcData={sourcePropertyOptions}
      propName={sourcePropName}
      handleDropdownMenu={handleSourceList}
      indentList={[]}
      modelling={false} />
  );

  const sourceDropdown = () => {
    return (

      <Dropdown className="mx-2 mt-2" as={ButtonGroup} autoClose="outside"
      >
        <Dropdown.Toggle id="sourcePropertyIcon" variant="outline-light" className={styles.sourceDrop}
          size="sm">
          <HCTooltip id="source-field-tooltip" text={"Source Field"} placement="bottom">
            <i id="listIcon" data-testid={"sourceProperty-listIcon"}>
              <FontAwesomeIcon
                icon={faList}
                size="lg"
                data-testid="sourcePropertylistIcon"
                className={styles.listIcon}
                onClick={(e) => handleSourceList(e)}
              />
            </i>
          </HCTooltip>
        </Dropdown.Toggle>
        <Dropdown.Menu className="p-0 m-0 border-0 bg-transparent rounded-0">
          <Dropdown.Item className={styles.dropdownMenuItem}>
            {sourceMenu}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const handleRelationshipExpression = (event) => {
    setCaretPosition(event.target.selectionStart);
    setRelationshipExpression(event.target.value);
  };

  const optionalExpressionField = <div className={styles.optionalExpressionContainer}>
    <FormLabel column lg={1} className={"pl-2 mt-1"}>{"Expression:"}</FormLabel>
    <HCInput
      value={relationshipExpression}
      id="relationshipExpression"
      className={`mx-2 my-1 w-100`}
      placeholder="Enter the expression to create a custom concept IRI"
      onChange={handleRelationshipExpression}
    />
    <span>{sourceDropdown()}</span>
    <span>{functionDropdown()}</span>
  </div>;

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
        <HCTooltip id="relationshipTypeToggleDisabled-tooltip" text={props.isEditing ? ModelingTooltips.relationshipTypeToggleDisabledInfo : ""} placement={"bottom"}>
          <div id={props.isEditing ? "relationshipTypeToggleDisabled" : "relationshipTypeToggle"} className={props.isEditing ? styles.relationshipTypeToggleDisabled : ""}>
            <Row>
              <Col className={"d-flex mb-2 mt-3 align-items-center"} id="srcType">
                <Form.Check
                  inline
                  id={"entityToEntity"}
                  name={"visibleSettings"}
                  type={"radio"}
                  checked={visibleSettings === eVisibleSettings.EntityToEntity ? true : false}
                  onChange={handleSelectedVisibleSetting}
                  label={"Entity to Entity"}
                  value={eVisibleSettings[eVisibleSettings.EntityToEntity]}
                  aria-label={"entityToEntity"}
                  className={"mb-0"}
                  style={props.isEditing ? {cursor: "not-allowed"} : {cursor: "default"}}
                  //disabled={props.isEditing}
                />
                <Form.Check
                  inline
                  id={"entityToConceptClass"}
                  name={"visibleSettings"}
                  type={"radio"}
                  checked={visibleSettings === eVisibleSettings.EntityToConceptClass ? true : false}
                  onChange={handleSelectedVisibleSetting}
                  label={"Entity to Concept class"}
                  value={eVisibleSettings[eVisibleSettings.EntityToConceptClass]}
                  aria-label={"entityToConceptClass"}
                  className={"mb-0"}
                  style={{cursor: "not-allowed"}}
                  //disabled={props.isEditing}
                />
              </Col>
            </Row>
          </div>
        </HCTooltip>
        <HCDivider />
        <div aria-label="relationshipActions" className={styles.relationshipDisplay}>
          <div ref={dummyNode}></div>
          <div className={styles.nodeDisplay}>
            <span className={styles.nodeLabel}>SOURCE</span>
            <HCCard data-testid={"sourceEntityNode"} style={{width: 240, backgroundColor: props.relationshipInfo.sourceNodeColor}} bodyClassName={styles.cardBody} className={styles.cardContainer}>
              <div className={`${styles.cardText} w-100 h-100 d-flex justify-content-center align-items-center`}>
                <p data-testid={`${props.relationshipInfo.sourceNodeName}-sourceNodeName`} className={"m-0 text-center"}>
                  <DynamicIcons name={getEntityTypeIcon(props.relationshipInfo.sourceNodeName)}/>
                  <b>{props.relationshipInfo.sourceNodeName}</b>
                </p>
              </div>
            </HCCard>
          </div>
          {visibleSettings === eVisibleSettings.EntityToConceptClass && <><div className={`mx-0.75 ${styles.propertyContainer}`}>
            {propertyDropdown}
            <HCTooltip id="sourceProperty-key-tooltip" text={ModelingTooltips.sourcePropertyKeyInfo} placement={"right"}>
              <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircle} style={{marginBottom: "-20px"}} data-testid={"foreign-key-tooltip"}/>
            </HCTooltip>
          </div>
          <hr className={styles.horizontalLineBeforeName}></hr>
          </>}
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
              <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircle} />
            </HCTooltip>
          </div>
          <hr className={styles.horizontalLine} style={{width: visibleSettings === eVisibleSettings.EntityToConceptClass ? "100px" : "185px"}}></hr>
          {visibleSettings === eVisibleSettings.EntityToConceptClass ? <span>
            <HCButton variant="onlined-light" className={styles.cardinalityButtonConcept} data-testid="cardinalityButton">
              <img data-testid="oneToOneIcon" className={styles.oneToOneIcon} style={{marginRight: "-10px"}} src={oneToOneIcon} alt={""}/>
            </HCButton>
          </span> :
            <HCTooltip id="cardinality-tooltip" text={cardinalityTooltipText} placement={"bottom"}>
              <span>
                <HCButton variant="onlined-light" className={styles.cardinalityButton} data-testid="cardinalityButton" onClick={() => toggleCardinality()}>
                  {oneToManySelected ? <img data-testid="oneToManyIcon" className={styles.oneToManyIcon} src={oneToManyIcon} alt={""} onClick={() => toggleCardinality()}/> : <img data-testid="oneToOneIcon" className={styles.oneToOneIcon} src={oneToOneIcon} alt={""} onClick={() => toggleCardinality()}/>}
                </HCButton>
              </span>
            </HCTooltip>}
          <div className={styles.nodeDisplay}>
            <span className={styles.nodeLabel}>TARGET</span>
            <div className={submitClicked && emptyTargetEntity ? styles.targetEntityErrorContainer : styles.targetEntityContainer}>
              <HCCard data-testid={"targetEntityNode"} style={{width: 240, backgroundColor: targetEntityColor}} bodyClassName={styles.cardBody} className={styles.cardContainer}>
                <div className={`${styles.cardText} w-100 h-100 d-flex justify-content-center align-items-center`}>
                  <p data-testid={`${targetEntityName}-targetNodeName`} className={"m-0 text-center"}>
                    <DynamicIcons name={getEntityTypeIcon(targetEntityName, visibleSettings === eVisibleSettings.EntityToConceptClass)}/>{emptyTargetEntity ? targetEntityName : <b>{targetEntityName}</b>}
                  </p>
                </div>
              </HCCard>
              {!props.isEditing ?
                <Dropdown>
                  <Dropdown.Toggle data-testid={"targetEntityDropdown"} className={`p-0 border-none rounded-0 ${styles.dropdownButtonMenu}`}>
                    <ChevronDown />
                  </Dropdown.Toggle>
                  {DropdownMenu}
                </Dropdown>
                : null }
            </div>
            {submitClicked && emptyTargetEntity ? <span className={styles.targetEntityErrorMsg}>{ModelingTooltips.targetEntityEmpty(visibleSettings === eVisibleSettings.EntityToConceptClass ? "concept class" : "entity type")}</span> : null}
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
        { !optionalCollapsed && visibleSettings === eVisibleSettings.EntityToConceptClass && <div data-testid={"optionalContent"} className={styles.expressionContainer}>{optionalExpressionField}</div> }
        { !optionalCollapsed && visibleSettings === eVisibleSettings.EntityToEntity && (<div data-testid={"optionalContent"} className={styles.foreignKeyContainer}>
          <span className={styles.foreignKeyText}>You can select the foreign key now or later:</span>
          <div className={`mx-3 ${styles.foreignKeyDropdownContainer}`}>
            {foreignKeyDropdown}
            <HCTooltip id="foreign-key-tooltip" text={ModelingTooltips.foreignKeyInfo} placement={"right"}>
              <QuestionCircleFill color={themeColors.defaults.questionCircle} size={13} className={styles.questionCircle} data-testid={"foreign-key-tooltip"}/>
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
