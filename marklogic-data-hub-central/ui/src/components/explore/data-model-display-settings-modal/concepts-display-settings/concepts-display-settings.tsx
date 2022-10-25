import React, {useState, useEffect} from "react";
import styles from "../data-model-display-settings-modal.module.scss";
import {EntityTypeColorPicker, HCTable, HCTooltip, HCIconPicker, HCPopoverSearch} from "@components/common";
import {QuestionCircleFill} from "react-bootstrap-icons";
import tooltipsConfig from "@config/explorer-tooltips.config";
import {themeColors} from "@config/themes.config";
import Highlighter from "react-highlight-words";

type Props = {
  conceptsSettingsData: any[];
  onConceptsColumnValueChange: (row, e, column: ConceptsTableColumns) => void;
};

export enum ConceptsTableColumns {
  ConceptType,
  Color,
  Icon
}

const {conceptDisplaySettings} = tooltipsConfig;

const ConceptsDisplaySettings: React.FC<Props> = ({conceptsSettingsData, onConceptsColumnValueChange}) => {
  const [filteredSettingsData, setFilteredSettingsData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [tableExpandedKeys, setTableExpandedKeys] = useState([]);

  useEffect(() => {
    setFilteredSettingsData(prev => {
      return conceptsSettingsData
        .filter(conceptObject => conceptObject.concept.toLowerCase().includes(searchText.toLowerCase()))
        .map((conceptObject) => ({...conceptObject, searchText}));
    });

    return () => {
      setFilteredSettingsData([]);
    };
  }, [conceptsSettingsData, searchText]);

  const columnSorter = (a: any, b: any, order: string) => order === "asc" ? a.localeCompare(b) : b.localeCompare(a);

  const getHeaderLabel = (label, tooltipInfo) => {
    let headerLabel = <span className={styles.labelContainer}>
      <span className={styles.headerLabel}>{label}</span>
      <HCTooltip id="concept-label" text={tooltipInfo} placement="right">
        <QuestionCircleFill aria-label="icon: question-circle" color={themeColors.defaults.questionCircle} size={13} className={styles.infoIcon} />
      </HCTooltip>
    </span>;

    return headerLabel;
  };

  const exploreSettingsColumns: any = [
    {
      text: <span className={styles.labelContainer}>
        <span className={styles.headerLabel}>Concept Name</span>
        <span className="position-absolute end-0 me-3">
          <HCPopoverSearch
            inputValue={searchText}
            onSearch={(value) => {
              setSearchText(value);
            }}
            onReset={() => {
              setSearchText("");
            }}
          />
        </span>
      </span>,
      dataField: "concept",
      headerClassName: "position-relative",
      sort: true,
      width: "40%",
      sortFunc: columnSorter,
      formatter: (text, row) => {
        return (<span aria-label={`${row.concept}-conceptName`}>
          <Highlighter
            highlightClassName={styles.highlightStyle}
            searchWords={[row.searchText]}
            autoEscape
            textToHighlight={row.concept}
          />
        </span>);
      }
    },
    {
      text: getHeaderLabel("Color", conceptDisplaySettings.color),
      width: "30%",
      dataField: "color",
      align: "center" as "center",
      headerAlign: "center",
      formatter: (text, row) => {
        return (<div className="text-center">
          <EntityTypeColorPicker color={row.color} entityType={row.rowKey} handleColorChange={(color, event) => onConceptsColumnValueChange(row, {color, event}, ConceptsTableColumns.Color)} />
        </div>);
      }
    },
    {
      text: getHeaderLabel("Icon", conceptDisplaySettings.icon),
      width: "30%",
      dataField: "icon",
      align: "center" as "center",
      headerAlign: "center",
      formatter: (text, row) => {
        return (<div className={"d-flex justify-content-center align-items-center"} aria-label={`${row.concept}-icon-picker`} id={`${row.rowKey}-icon-picker`} data-icon={row.icon}>
          <HCIconPicker value={row.icon} onChange={value => onConceptsColumnValueChange(row, value, ConceptsTableColumns.Icon)} />
        </div>);
      }
    }
  ];

  return (
    <div className={styles.conceptsTable}>
      <HCTable
        rowKey="rowKey"
        columns={exploreSettingsColumns}
        data={filteredSettingsData}
        component={"property"}
        nestedParams={{headerColumns: exploreSettingsColumns, iconCellList: [], state: [tableExpandedKeys, setTableExpandedKeys]}}
      />
    </div>
  );
};

export default ConceptsDisplaySettings;
