import React, {useContext, useState} from "react";
import {TreeSelect} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import styles from "./entity-property-tree-select.module.scss";
import arrayIcon from "../../assets/icon_array.png";
import {CurationContext} from "../../util/curation-context";
import {Definition, Property} from "../../types/modeling-types";

type Props = {
  propertyDropdownOptions: Property[],
  entityDefinitionsArray: Definition[],
  value: string | undefined,
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
  let newMergeRuleOptions:any[] = curationOptions.activeStep.stepArtifact.hasOwnProperty("mergeRules") && mergeRulesData.map(i => i.entityPropertyPath);
  const [expandedKeys, setExpandedKeys] = useState<any []>([]);

  const onChange = (value) => {
    props.onValueSelected(value);
  };

  const renderBasicPropertyTitle = (property: Property) => {
    return property.multiple ? <span aria-label={`${property.name}-option`}>{property.name} <img className={styles.arrayImage} src={arrayIcon} alt=""/></span> : <span aria-label={`${property.name}-option`}>{property.name}</span>;
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
      let structuredType = parsedRef[parsedRef.length-1];
      let structuredTypeDefinition: Definition = props.entityDefinitionsArray.find(entityDefinition => entityDefinition.name === structuredType) || DEFAULT_ENTITY_DEFINITION;
      if (!parentKeys.includes(property.name)) {
        parentKeys.push(property.name);
      }

      let getStructuredTitle = (nodeKey) => {
        let title = <span onClick={(e) => updateExpandedKeys(nodeKey)}>
          {property.name}
        &nbsp;
          <FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/>
          {property.multiple && <img className={styles.arrayImage} src={arrayIcon} alt=""/>}
        </span>;
        return title;
      };

      let structuredProperties =  structuredTypeDefinition.properties.map((structProperty, index) => {
        if (structProperty.datatype === "structured") {
          return renderStructuredPropertyOption(structProperty, entityPropertyName, parentKeys);
        } else {
          let keys = parentKeys.join(" > ");
          return (
            <TreeNode
              key={`${entityPropertyName}-${property.name}-${structProperty.name}-${index}`}
              value={`${keys} > ${structProperty.name}`}
              title={renderBasicPropertyTitle(structProperty)}
              aria-label={`${keys} > ${structProperty.name}-option`}
            />
          );
        }
      });
      let label = "";
      if (entityPropertyName === property.name) {
        label = `${property.name}-option`;
      } else {
        label = `${entityPropertyName} > ${property.name}-option`;
      }
      return (
        <TreeNode
          selectable={false}
          key={`${entityPropertyName}-${property.name}-parent`}
          value={`${entityPropertyName} > ${property.name}`}
          title={getStructuredTitle(`${entityPropertyName}-${property.name}-parent`)}
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
    } else if (curationOptions.activeStep.stepArtifact.hasOwnProperty("mergeRules") && newMergeRuleOptions.indexOf(property.name)!==-1) {
      return <TreeNode key={index} value={property.name} disabled title={renderBasicPropertyTitle(property)}/>;
    } else {
      return <TreeNode key={index} value={property.name} title={renderBasicPropertyTitle(property)}/>;
    }
  });

  const dropdownStyle = {
    zIndex: 1000,
    maxHeight: "350px",
    overflow: "auto"
  };

  const onTreeNodeExpand = (keys) => {
    setExpandedKeys(keys);
  };

  return (
    <TreeSelect
      aria-label="property-to-match-dropdown"
      className={styles.matchTypeSelect}
      placeholder="Select property"
      size="default"
      onChange={onChange}
      treeExpandedKeys={expandedKeys}
      onTreeExpand={onTreeNodeExpand}
      value={props.value}
      treeNodeLabelProp={props.value}
      dropdownStyle={dropdownStyle}
    >
      {renderPropertyOptions}
    </TreeSelect>
  );
};

export default EntityPropertyTreeSelect;
