import React, {useState, useEffect} from "react";
import Select, {components as SelectComponents} from "react-select";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import styles from "../data-model-display-settings-modal.module.scss";
import {EntityTypeColorPicker, HCTable, HCTooltip, HCIconPicker, HCPopoverSearch} from "@components/common";
import {QuestionCircleFill} from "react-bootstrap-icons";
import tooltipsConfig from "@config/explorer-tooltips.config";
import {themeColors} from "@config/themes.config";
import {defaultEntityDefinition} from "@config/explore.config";
import Highlighter from "react-highlight-words";
import EntityPropertyTreeSelect from "../../../entity-property-tree-select/entity-property-tree-select";
import {definitionsParser} from "@util/data-conversion";
import {Definition} from "../../../../types/modeling-types";
import {AddTooltipWhenTextOverflow} from "@util/AddTooltipWhenTextOverflow";

type Props = {
  entityModels: any;
  exploreSettingsData: any[];
  entityDefinitionsArray: any;
  onEntityColumnValueChange: (row, e, column: EntityTableColumns) => void;
};

export enum EntityTableColumns {
  EntityType,
  Color,
  Icon,
  EntityLabel,
  PropertiesOnHover,
}

const {entityTypeDisplaySettings} = tooltipsConfig;

const EntityDisplaySettings: React.FC<Props> = ({
  entityModels,
  exploreSettingsData,
  entityDefinitionsArray,
  onEntityColumnValueChange,
}) => {
  const [filteredSettingsData, setFilteredSettingsData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setFilteredSettingsData(prev => {
      return exploreSettingsData
        .filter(entityTypeObject => entityTypeObject.entityType.toLowerCase().includes(searchText.toLowerCase()))
        .map(entityTypeObject => ({...entityTypeObject, searchText}));
    });

    return () => {
      setFilteredSettingsData([]);
    };
  }, [exploreSettingsData, searchText]);

  const columnSorter = (a: any, b: any, order: string) => (order === "asc" ? a.localeCompare(b) : b.localeCompare(a));

  const renderOptions = entityType => {
    let entityTypeDef: any = entityDefinitionsArray.find(entity => entity.name === entityType);
    const options: any = entityTypeDef?.properties
      ?.filter(property => property.ref === "")
      .map(item => ({value: item?.name, label: item?.name}));
    return options;
  };

  const getHeaderLabel = (label, tooltipInfo) => {
    let headerLabel = (
      <span className={styles.labelContainer}>
        <span className={styles.headerLabel}>{label}</span>
        <HCTooltip id="entity-label" text={tooltipInfo} placement="right">
          <QuestionCircleFill
            aria-label="icon: question-circle"
            color={themeColors.defaults.questionCircle}
            size={13}
            className={styles.infoIcon}
          />
        </HCTooltip>
      </span>
    );

    return headerLabel;
  };

  const MenuList = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const exploreSettingsColumns: any = [
    {
      text: (
        <span className={styles.labelContainer}>
          <span className={styles.headerLabel}>Entity Type</span>
          <span className="position-absolute end-0 me-3">
            <HCPopoverSearch
              inputId={`searchInput-settings`}
              inputValue={searchText}
              onSearch={value => {
                setSearchText(value);
              }}
              onReset={() => {
                setSearchText("");
              }}
            />
          </span>
        </span>
      ),
      dataField: "entityType",
      headerClassName: "position-relative",
      sort: true,
      width: "20%",
      sortFunc: columnSorter,
      formatter: (text, row) => {
        return (
          <div aria-label={`${row.entityType}-entityType`} className={styles.entityType}>
            <div className={styles.ghostTextWithTooltip}>
              <AddTooltipWhenTextOverflow text={row.entityType} />
            </div>
            <Highlighter
              highlightClassName={styles.highlightStyle}
              searchWords={[row.searchText]}
              autoEscape
              textToHighlight={row.entityType}
            />
          </div>
        );
      },
    },
    {
      text: getHeaderLabel("Color", entityTypeDisplaySettings.color),
      width: "10%",
      align: "center" as "center",
      headerAlign: "center",
      formatter: (text, row) => {
        return (
          <EntityTypeColorPicker
            color={row.color}
            entityType={row.entityType}
            handleColorChange={(color, event) =>
              onEntityColumnValueChange(row, {color, event}, EntityTableColumns.Color)
            }
          />
        );
      },
    },
    {
      text: getHeaderLabel("Icon", entityTypeDisplaySettings.icon),
      width: "10%",
      align: "center" as "center",
      headerAlign: "center",
      formatter: (text, row) => {
        return (
          <div
            className={"m-auto d-inline-block"}
            aria-label={`${row.entityType}-icon-picker`}
            id={`${row.entityType}-icon-picker`}
            data-icon={row.icon}
          >
            <HCIconPicker
              value={row.icon}
              onChange={value => onEntityColumnValueChange(row, value, EntityTableColumns.Icon)}
            />
          </div>
        );
      },
    },
    {
      text: getHeaderLabel("Record Label", entityTypeDisplaySettings.entityLabel),
      width: "25%",
      formatter: (text, row) => {
        return (
          <Select
            id={`${row.entityType}-entityLabel-select-wrapper`}
            inputId={`${row.entityType}-entityLabel-select`}
            components={{MenuList: props => MenuList(`${row.entityType}-entityLabel`, props)}}
            defaultValue={row.label ? {label: row.label, value: row.label} : null}
            value={row.label ? {label: row.label, value: row.label} : null}
            options={renderOptions(row.entityType)}
            onChange={e => onEntityColumnValueChange(row, e, EntityTableColumns.EntityLabel)}
            classNamePrefix="select"
            aria-label={`${row.entityType}-label-select-dropdown`}
            formatOptionLabel={({value, label}) => {
              return (
                <span
                  data-testid={`${row.entityType}-labelOption-${value}`}
                  aria-label={`${row.entityType}-labelOption-${value}`}
                >
                  {label}
                </span>
              );
            }}
            styles={reactSelectThemeConfig}
          />
        );
      },
    },
    {
      text: getHeaderLabel("Properties on Hover", entityTypeDisplaySettings.propertiesOnHover),
      width: "35%",
      formatter: (text, row) => {
        let definitions: any[] = [];
        if (entityModels[row.entityType]?.model.definitions) {
          definitions = definitionsParser(entityModels[row.entityType]?.model.definitions);
        }
        let entityTypeDefinition: Definition =
          definitions.find(entityDefinition => entityDefinition.name === row.entityType) || defaultEntityDefinition;
        return (
          <EntityPropertyTreeSelect
            isForMerge={true}
            propertyDropdownOptions={entityTypeDefinition.properties}
            entityDefinitionsArray={definitions}
            value={
              row.propertiesOnHover?.length
                ? row.propertiesOnHover.map(property => property.replace(/\./g, " > "))
                : undefined
            }
            onValueSelected={value => {
              onEntityColumnValueChange(row, value, EntityTableColumns.PropertiesOnHover);
            }}
            multiple={true}
            identifier={row.entityType}
          />
        );
      },
    },
  ];

  return (
    <div className={styles.entityTable}>
      <HCTable rowKey="entityType" columns={exploreSettingsColumns} data={filteredSettingsData} />
    </div>
  );
};

export default EntityDisplaySettings;
