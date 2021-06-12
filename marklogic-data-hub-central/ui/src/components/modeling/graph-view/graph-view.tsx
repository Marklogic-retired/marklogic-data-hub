import React, {CSSProperties} from "react";
import {AutoComplete, Dropdown, Icon, Menu} from "antd";
import styles from "./graph-view.module.scss";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {MLTooltip, MLInput, MLButton} from "@marklogic/design-system";
import {DownOutlined} from "@ant-design/icons";
import PublishToDatabaseIcon from "../../../assets/publish-to-database-icon";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";

type Props = {
  entityTypes: any;
};

const GraphView: React.FC<Props> = (props) => {

  const publishIconStyle: CSSProperties = {
    width: "20px",
    height: "20px",
    fill: "currentColor",
  };

  const filter = <AutoComplete
    className={styles.filterInput}
    dataSource={[]}
    aria-label="graph-view-filter-autoComplete"
    placeholder={"Filter"}
  >
    <MLInput aria-label="graph-view-filter-input" suffix={<Icon className={styles.searchIcon} type="search" theme="outlined" />} size="small"></MLInput>
  </AutoComplete>;

  const menu = (
    <Menu>
      <Menu.Item key="addNewEntityType">
        <span aria-label={"addNewEntityTypeOption"}>Add new entity type</span>
      </Menu.Item>
      <Menu.Item key="addNewRelationship">
        <span aria-label={"addNewRelationshipOption"}>Add new relationship</span>
      </Menu.Item>
    </Menu>
  );

  const headerButtons = <span className={styles.buttons}>
    <span>
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        overlayClassName={styles.stepMenu}
        placement="bottomRight"
      >
        <div className={styles.addButtonContainer}>
          <MLButton aria-label="add-entity-type-relationship" size="default" type="primary">
            <span className={styles.addButtonText}>Add</span>
            <DownOutlined className={styles.downArrowIcon}/>
          </MLButton>
        </div>
      </Dropdown>
    </span>
    <MLTooltip title={ModelingTooltips.publish}>
      <MLButton aria-label="publish-to-database" size="default" type="secondary">
        <span className={styles.publishButtonContainer}>
          <PublishToDatabaseIcon style={publishIconStyle}/>
          <span className={styles.publishButtonText}>Publish</span>
        </span>
      </MLButton>
    </MLTooltip>
    <MLTooltip title={ModelingTooltips.exportGraph} placement="topLeft">
      <FontAwesomeIcon className={styles.graphExportIcon} icon={faFileExport} size="2x" aria-label="graph-export" />
    </MLTooltip>
  </span>;

  return (

    <div className={styles.graphViewContainer}>
      <div className={styles.graphHeader}>
        {filter}
        {headerButtons}
      </div>

      {//Just a placeholder for actual graph view. Below code should be removed.
        <ul>{props.entityTypes && props.entityTypes?.map((el) => <li key={el.entityName} style={{color: "blue"}}>{el.entityName}</li>)}
        </ul>
        //--------------//
      }
    </div>

  );
};

export default GraphView;
