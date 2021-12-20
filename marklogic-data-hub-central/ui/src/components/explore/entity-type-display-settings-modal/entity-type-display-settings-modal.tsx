import React, {useState, useEffect} from "react";
import {Modal} from "react-bootstrap";
import Select from "react-select";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt} from "@fortawesome/free-solid-svg-icons";
import styles from "./entity-type-display-settings-modal.module.scss";
import HCTable from "@components/common/hc-table/hc-table";
import HCButton from "@components/common/hc-button/hc-button";
import graphConfig from "../../../config/graph-vis.config";
import HCTooltip from "@components/common/hc-tooltip/hc-tooltip";
import {QuestionCircleFill} from "react-bootstrap-icons";
import tooltipsConfig from "../../../config/explorer-tooltips.config";
import entityIcon from "../../../assets/Entity-Services.png";

type Props = {
  isVisible: boolean;
  toggleModal: (isVisible: boolean) => void;
  hubCentralConfig: any;
  entityDefinitionsArray: any;
};

const {entityTypeDisplaySettings} = tooltipsConfig;

const EntityTypeDisplaySettingsModal: React.FC<Props> = (props) => {
  const [entityLabels, setEntityLabels] = useState({});
  const [propertiesOnHover, setPropertiesOnHover] = useState({});
  const [exploreSettingsData, setExploreSettingsData] = useState<any[]>([]);

  useEffect(() => {
    if (props.isVisible && props.hubCentralConfig && props.hubCentralConfig?.modeling?.entities) {
      let settingsData:any = Object.keys(props.hubCentralConfig?.modeling?.entities).map(entityType => {
        return {
          entityType: entityType,
          color: props.hubCentralConfig?.modeling?.entities[entityType]?.color ? props.hubCentralConfig?.modeling?.entities[entityType]?.color : "grey",
          icon: "icon"
        };
      });
      setExploreSettingsData(settingsData);
    }

  }, [props.isVisible, props.hubCentralConfig]);

  const closeModal = () => {
    props.toggleModal(false);
  };

  const columnSorter = (a: any, b: any, order: string) => order === "asc" ? a.localeCompare(b) : b.localeCompare(a);

  const renderOptions = (entityType) => {
    let entityTypeDef:any = props.entityDefinitionsArray.find(entity => entity.name === entityType);
    const options:any = entityTypeDef?.properties?.map(item => ({value: item?.name, label: item?.name}));
    return options;
  };

  const onEntityLabelChange = (row, e) => {
    setEntityLabels({...entityLabels, [row.entityType]: e});
  };

  const onPropertiesOnHoverChange = (row, e) => {
    setPropertiesOnHover({...propertiesOnHover, [row.entityType]: e});
  };

  const getHeaderLabel = (label, tooltipInfo) => {
    let headerLabel = <span className={styles.labelContainer}>
      <span className={styles.headerLabel}>{label} </span>
      <HCTooltip id="entity-label" text={tooltipInfo} placement="right">
        <QuestionCircleFill aria-label="icon: question-circle" color="#7F86B5" size={13} className={styles.infoIcon} />
      </HCTooltip>
    </span>;

    return headerLabel;
  };

  const exploreSettingsColumns: any = [
    {
      text: <span className={styles.labelContainer}>
        <span className={styles.headerLabel}>Entity Type</span>
      </span>,
      dataField: "entityType",
      sort: true,
      width: "20%",
      sortFunc: columnSorter,
      formatter: (text, row) => {
        return (<span aria-label={`${row.entityType}-entityType`} className={styles.columnData}>{row.entityType}</span>);
      }
    },
    {
      text: getHeaderLabel("Color", entityTypeDisplaySettings.color),
      width: "10%",
      align: "center" as "center",
      headerAlign: "center",
      formatter: (text, row) => {
        return (<div className={styles.valueContainer}>
          <div aria-label={`${row.entityType}-color`} style={{width: "26px", height: "26px", background: "#EEEFF1"}}></div>
          <div className={"d-flex align-items-center"}>
            <span className={styles.editIconContainer}><FontAwesomeIcon icon={faPencilAlt} size="sm" onClick={(e) => { e.preventDefault(); }} className={styles.editIcon} aria-label={`edit-${row.entityType}-color`} /></span>
          </div>
        </div>);
      }
    },
    {
      text: getHeaderLabel("Icon", entityTypeDisplaySettings.icon),
      width: "10%",
      align: "center" as "center",
      headerAlign: "center",
      formatter: (text, row) => {
        let entityInfo = graphConfig.sampleMetadata["modeling"]["entities"][row.entityType];
        let iconsrc = entityInfo && entityInfo.icon ? entityInfo.icon : entityIcon;
        return <span className={styles.valueContainer}><img src={iconsrc} aria-label={`${row.entityType}-icon`}/>
          <span className={styles.editIconContainer}><FontAwesomeIcon icon={faPencilAlt} size="sm" onClick={(e) => { e.preventDefault(); }} className={styles.editIcon} aria-label={`edit-${row.entityType}-icon`} /></span>
        </span>;
      }
    },
    {
      text: getHeaderLabel("Entity Label", entityTypeDisplaySettings.entityLabel),
      width: "25%",
      formatter: (text, row) => {
        return (
          <Select
            value={entityLabels[row.entityType]}
            options={renderOptions(row.entityType)}
            onChange={(e) => onEntityLabelChange(row, e)}
            className={styles.columnData}
            classNamePrefix="select"
            aria-label={`${row.entityType}-label-select-dropdown`}
          />);
      },
    },
    {
      text: getHeaderLabel("Properties on Hover", entityTypeDisplaySettings.propertiesOnHover),
      width: "35%",
      formatter: (text, row) => {
        return (
          <Select
            value={propertiesOnHover[row.entityType]}
            isMulti
            options={renderOptions(row.entityType)}
            className={styles.columnData}
            classNamePrefix="select"
            aria-label={`${row.entityType}-propertiesOnHover`}
            onChange={(e) => onPropertiesOnHoverChange(row, e)}
          />
        );
      }
    }
  ];

  const modalFooter = (
    <div className={styles.editFooter}>
      <div
        className={styles.footer}
      >
        <HCButton
          size="sm"
          variant="outline-light"
          aria-label={`cancel-multiple-ruleset`}
          onClick={closeModal}
        >Cancel</HCButton>
        <HCButton
          className={styles.saveButton}
          size="sm"
          aria-label={`confirm-multiple-ruleset`}
          variant="primary"
        >Save</HCButton>
      </div>
    </div>
  );




  return (
    <Modal
      show={props.isVisible}
      dialogClassName={styles.modal1400w}
    >
      <Modal.Header className={"bb-none align-items-start"}>
        <span className={"fs-4"}>
          Entity Type Display Settings
        </span>
        <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
      </Modal.Header>
      <Modal.Body>
        <div id="entityTypeDisplaySettingsContainer" data-testid="entityTypeDisplaySettingsContainer">
          <HCTable
            rowKey="entityType"
            className={styles.table}
            columns={exploreSettingsColumns}
            data={exploreSettingsData}
          />
        </div>
        {modalFooter}
      </Modal.Body>
    </Modal>
  );
};

export default EntityTypeDisplaySettingsModal;
