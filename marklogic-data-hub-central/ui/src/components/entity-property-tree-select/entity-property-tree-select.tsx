import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import {MLTreeSelect} from "@marklogic/design-system";
import styles from "./entity-property-tree-select.module.scss";
import arrayIcon from "../../assets/icon_array.png";

import {Definition, Property} from "../../types/modeling-types";

type Props = {
  propertyDropdownOptions: Property[],
  entityDefinitionsArray: Definition[],
  value: string | undefined,
  onValueSelected: (value: string | undefined) => void;
};

const {MLTreeNode} = MLTreeSelect;

const DEFAULT_ENTITY_DEFINITION: Definition = {
  name: "",
  properties: []
};


const EntityPropertyTreeSelect: React.FC<Props> = (props) => {

  const onChange = (value) => {
    props.onValueSelected(value);
  };

  const renderBasicPropertyTitle = (property: Property) => {
    return property.multiple ? <span aria-label={`${property.name}-option`}>{property.name} <img className={styles.arrayImage} src={arrayIcon}/></span> : <span aria-label={`${property.name}-option`}>{property.name}</span>;
  };

  const renderStrucuturedPropertyOption = (property: Property, entityPropertyName: string) => {
    if (property.ref !== "") {
      let parsedRef = property.ref.split("/");
      let structuredType = parsedRef[parsedRef.length-1];
      let structuredTypeDefinition: Definition = props.entityDefinitionsArray.find(entityDefinition => entityDefinition.name === structuredType) || DEFAULT_ENTITY_DEFINITION;

      let structuredTitle = (
        <span>
          {property.name}
          &nbsp;
          <FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/>
          {property.multiple && <img className={styles.arrayImage} src={arrayIcon}/>}
        </span>
      );

      let structuredProperties =  structuredTypeDefinition.properties.map((structProperty, index) => {
        if (structProperty.datatype === "structured") {
          return renderStrucuturedPropertyOption(structProperty, entityPropertyName);
        } else {
          // TODO remove disabled to support selecting structured properties
          // TODO handle nested structured property's display value when selected
          return (
            <MLTreeNode
              disabled
              key={`${entityPropertyName}-${property.name}-${structProperty.name}-${index}`}
              value={`${entityPropertyName} > ${structProperty.name}`}
              title={renderBasicPropertyTitle(structProperty)}
            />
          );
        }
      });

      return (
        <MLTreeNode
          disabled
          key={`${entityPropertyName}-${property.name}-parent`}
          value={`${entityPropertyName} > ${property.name}`}
          title={structuredTitle}
        >
          {structuredProperties}
        </MLTreeNode>
      );
    }
  };

  const renderPropertyOptions = props.propertyDropdownOptions.map((property, index) => {
    if (property.datatype === "structured") {
      return renderStrucuturedPropertyOption(property, property.name);
    } else {
      return <MLTreeNode key={index} value={property.name} title={renderBasicPropertyTitle(property)}/>;
    }
  });

  return (
    <MLTreeSelect
      aria-label="property-to-match-dropdown"
      className={styles.matchTypeSelect}
      placeholder="Select property"
      size="default"
      onChange={onChange}
      value={props.value}
      treeNodeLabelProp={props.value}
      dropdownStyle={{zIndex: "1000"}}
    >
      {renderPropertyOptions}
    </MLTreeSelect>
  );
};

export default EntityPropertyTreeSelect;
