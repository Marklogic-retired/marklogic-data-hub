import React, {useContext, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import styles from "./entity-property-tree-select.module.scss";
import arrayIcon from "../../assets/icon_array.png";
import {CurationContext} from "@util/curation-context";
import {Definition, Property} from "../../types/modeling-types";
import "rc-tree-select/assets/index.less";
import TreeSelect from "rc-tree-select";
import {ChevronDown, CaretRightFill, CaretDownFill} from "react-bootstrap-icons";
type Props = {
  propertyDropdownOptions: Property[],
  entityDefinitionsArray: Definition[],
  value: string | undefined,
  isForMerge: boolean | undefined,
  onValueSelected: (value: string | undefined) => void;
};

const {TreeNode} = TreeSelect;

const DEFAULT_ENTITY_DEFINITION: Definition = {
  name: "",
  properties: []
};


const EntityPropertyTreeSelect: React.FC<Props> = (props) => {

  const {curationOptions} = useContext(CurationContext);
  let mergeRulesData = curationOptions.activeStep.stepArtifact.mergeRules;
  let newMergeRuleOptions: any[] = curationOptions.activeStep.stepArtifact.hasOwnProperty("mergeRules") && mergeRulesData.map(i => i.entityPropertyPath);
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const [selectedTree, setSelectedTree] = useState<(string|undefined)[]>([]);

  const obtainChildProperties = (propertyOption: Property) => {
    let propertyNames = [propertyOption.name];
    if (propertyOption.datatype === "structured" && propertyOption.ref !== "") {
      let parsedRef = propertyOption.ref.split("/");
      let structuredType = parsedRef[parsedRef.length - 1];
      let structuredTypeDefinition: Definition = props.entityDefinitionsArray.find(entityDefinition => entityDefinition.name === structuredType) || DEFAULT_ENTITY_DEFINITION;
      structuredTypeDefinition.properties.forEach((childPropOption) => {
        propertyNames = propertyNames.concat(obtainChildProperties(childPropOption).map((name) => `${propertyOption.name} > ${name}`));
      });
    }
    return propertyNames;
  };

  useEffect(() => {
    let propOption = props.propertyDropdownOptions.find((propOption) => propOption.name === props.value);
    if (propOption && propOption.datatype === "structured" && propOption.ref !== "") {
      setSelectedTree(obtainChildProperties(propOption));
    } else {
      setSelectedTree([props.value]);
    }
  },
  [props.value]);

  const onChange = (value) => {
    props.onValueSelected(value);
  };

  const renderBasicPropertyTitle = (property: Property) => {
    return property.multiple ? <span aria-label={`${property.name}-option`}>{property.name} <img className={styles.arrayImage} src={arrayIcon} alt="" /></span> : <span aria-label={`${property.name}-option`}>{property.name}</span>;
  };

  const updateExpandedKeys = (nodeKey) => {
    if (!expandedKeys.includes(nodeKey)) {
      setExpandedKeys([...expandedKeys, nodeKey]);
    } else {
      let keys = expandedKeys.filter(key => key !== nodeKey);
      setExpandedKeys([...keys]);
    }
  };

  const renderStructuredPropertyOption = (property: Property, entityPropertyName: string, parentKeys: any) => {
    if (property.ref !== "") {
      let parsedRef = property.ref.split("/");
      let structuredType = parsedRef[parsedRef.length - 1];
      let structuredTypeDefinition: Definition = props.entityDefinitionsArray.find(entityDefinition => entityDefinition.name === structuredType) || DEFAULT_ENTITY_DEFINITION;
      if (!parentKeys.includes(property.name)) {
        parentKeys.push(property.name);
      }

      let getStructuredTitle = (nodeKey) => {
        let title = <span onClick={(e) => updateExpandedKeys(nodeKey)}>
          {property.name}
          &nbsp;
          <FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup} />
          {property.multiple && <img className={styles.arrayImage} src={arrayIcon} alt="" />}
        </span>;
        return title;
      };

      let structuredProperties = structuredTypeDefinition.properties.map((structProperty, index) => {
        if (structProperty.datatype === "structured") {
          return renderStructuredPropertyOption(structProperty, entityPropertyName, parentKeys);
        } else {
          let keys = parentKeys.join(" > ");
          let value = `${keys} > ${structProperty.name}`;
          let isActive = selectedTree.includes(value) || selectedTree.some((selected) => value.startsWith(`${selected} >`));
          return (
            <TreeNode
              active={isActive}
              className={ isActive ? styles.activeTreeNode: ""}
              key={value}
              value={value}
              title={renderBasicPropertyTitle(structProperty)}
              aria-label={`${value}-option`}
            />
          );
        }
      });
      let isFirstLevelProperty = entityPropertyName === property.name;
      let value = isFirstLevelProperty ? entityPropertyName : `${entityPropertyName} > ${property.name}`;
      let label = `${value}-option`;
      let isActive = selectedTree.includes(value) || selectedTree.some((selected) => value.startsWith(`${selected} >`));
      return (
        <TreeNode
          active={isActive}
          className={ isActive ? styles.activeTreeNode: ""}
          selectable={isFirstLevelProperty && props.isForMerge}
          key={value}
          value={value}
          title={getStructuredTitle(value)}
          aria-label={label}
        >
          {structuredProperties}
        </TreeNode>
      );
    }
  };

  const renderPropertyOptions = props.propertyDropdownOptions.map((property, index) => {
    if (property.datatype === "structured") {
      return renderStructuredPropertyOption(property, property.name, []);
    } else if (curationOptions.activeStep.stepArtifact.hasOwnProperty("mergeRules") && newMergeRuleOptions.indexOf(property.name) !== -1) {
      return <TreeNode key={property.name} value={property.name} disabled title={renderBasicPropertyTitle(property)} />;
    } else {
      return <TreeNode key={property.name} value={property.name} title={renderBasicPropertyTitle(property)} />;
    }
  });

  const dropdownStyle = {
    zIndex: 2000,
    maxHeight: "350px",
    overflow: "auto"
  };

  const onTreeNodeExpand = (keys) => {
    setExpandedKeys(keys);
  };

  const handleSwitcherIcon = ({isLeaf, expanded}) => {
    let switcher = expanded ? <CaretDownFill aria-label="icon: caret-down" /> : <CaretRightFill aria-label="icon: caret-down" />;
    const cleanBox = <span className="clean-box" />;
    return !isLeaf ? switcher : cleanBox;
  };

  return (
    <>
      <TreeSelect
        showSearch={false}
        aria-label="property-to-match-dropdown"
        data-testId="property-to-match-dropdown"
        id="property-to-match-dropdown"
        className={styles.matchTypeSelect}
        placeholder="Select property"
        onChange={onChange}
        treeExpandedKeys={expandedKeys}
        onTreeExpand={onTreeNodeExpand}
        value={props.value}
        treeNodeLabelProp={props.value}
        dropdownStyle={dropdownStyle}
        transitionName="rc-tree-select-dropdown-slide-up"
        choiceTransitionName="rc-tree-select-selection__choice-zoom"
        inputIcon={<ChevronDown />}
        switcherIcon={handleSwitcherIcon}
        treeIcon={false}
      >
        {renderPropertyOptions}
      </TreeSelect>
    </>
  );
};

export default EntityPropertyTreeSelect;
