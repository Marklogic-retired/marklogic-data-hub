import React, {CSSProperties, useContext, useEffect, useState} from "react";
import {AutoComplete, Dropdown, Icon, Menu} from "antd";
import styles from "./graph-view.module.scss";
import {ModelingTooltips} from "../../../config/tooltips.config";
import {MLTooltip, MLInput, MLButton} from "@marklogic/design-system";
import {DownOutlined} from "@ant-design/icons";
import PublishToDatabaseIcon from "../../../assets/publish-to-database-icon";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import SplitPane from "react-split-pane";
import GraphViewSidePanel from "./side-panel/side-panel";
import {ModelingContext} from "../../../util/modeling-context";
import {defaultModelingView} from "../../../config/modeling.config";
import Graph from "react-graph-vis";

type Props = {
  entityTypes: any;
};

const GraphView: React.FC<Props> = (props) => {

  const [viewSidePanel, setViewSidePanel] = useState(false);
  const {modelingOptions, setSelectedEntity} = useContext(ModelingContext);
  const [nodePositions, setNodePositions] = useState({});
  const [physicsEnabled, setPhysicsEnabled] = useState(true);

  //Use these to set specific positions for entity nodes temporarily
  let nodeP = {
    BabyRegistry: {
      x: 134.5, y: -165
    },
    Customer: {
      x: -1.8683534551792256, y: -13.817459136071609
    },
    Product: {
      x: -290.5, y: -57
    },
    Order: {
      x: 311.5, y: 1
    },
    NamespacedCustomer: {
      x: -193.56170318899566, y: 27.318452823974837
    },
    Person: {
      x: -143.5, y: -143
    }
  }

  let entityMetadata = {
    BabyRegistry: {
      color: "#e3ebbc",
      instances: 5
    },
    Customer: {
      color: "#ecf7fd",
      instances: 63
    },
    Product: {
      color: "#ded2da",
      instances: 252
    },
    Order: {
      color: "#cfe3e8",
      instances: 50123
    },
    NamespacedCustomer: {
      color: "#dfe2ec",
      instances: 75
    },
    Person: {
      color: "#dfe2ec",
      instances: 75
    }
  };
  const getNodes = () => {
    let nodes = props.entityTypes && props.entityTypes?.map((e) => {
    return { 
    shape: "box",
    shapeProperties: {
      borderRadius: 2
    },
    id: e.entityName,
    label: e.entityName.concat("\n<b>", entityMetadata[e.entityName].instances, "</b>"),
    color: {
      background: entityMetadata[e.entityName].color,
      border: entityMetadata[e.entityName].color
    },
    icon: {
  face: "Font Awesome",
  code: "\uf0c0",
  size: 50,
  color: "#f0a30a",
},
    font: {
      multi: true,
      align: "left",
      bold: {
        color: "#6773af",
        vadjust: 3,
        size: 12
      }
    },
    margin: 10,
    widthConstraint: {
      minimum: 80
    },
    // x: nodeP[e.entityName]?.x, 
    // y: nodeP[e.entityName]?.y
  }});
  return nodes;
}

  const getEdges = () => {
    let edges:any = [];
    props.entityTypes.forEach((e, i) => {
      let properties:any = Object.keys(e.model.definitions[e.entityName].properties);
      properties.forEach((p, i) => {
        if (e.model.definitions[e.entityName].properties[p].relatedEntityType) {
          let parts = e.model.definitions[e.entityName].properties[p].relatedEntityType.split("/");
          edges.push({
            from: e.entityName,
            to: parts[parts.length-1],
            label: e.model.definitions[e.entityName].properties[p].joinPropertyName,
            arrows: "to",
            color: "#666",
            font: { align: "top" } 
          });
        }
      });
    });
    return edges;
  }

  //Graph view options
  const graph = {
    nodes: getNodes(),
    edges: getEdges()
  }

  const options = {
    layout: {
      //hierarchical: true
      //randomSeed: "0.7696:1625099255200",
    },
    edges: {
      color: "#000000"
    },
    height: "500px",
    physics: {
      enabled: physicsEnabled,
      barnesHut: {
        springLength: 160,
        avoidOverlap: 0.4
      }
    }
  };

  const events = {
    select: function(event) {
      var { nodes, edges } = event;
      console.log('select',event)
    },
    dragStart: (event) => {
      if(physicsEnabled) {
        setPhysicsEnabled(false);
      }
    },
    dragEnd: (event) => {
      console.log('dragEnd',event,event.pointer.canvas);
      setNodePositions({[event.nodes[0]]: event.pointer.canvas})
    }

  };

  useEffect(() => {
    if (modelingOptions.view === defaultModelingView && modelingOptions.selectedEntity) {
      if (!viewSidePanel) {
        setViewSidePanel(true);
      }
    }
  }, [modelingOptions.selectedEntity]);

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
            <DownOutlined className={styles.downArrowIcon} />
          </MLButton>
        </div>
      </Dropdown>
    </span>
    <MLTooltip title={ModelingTooltips.publish}>
      <MLButton aria-label="publish-to-database" size="default" type="secondary">
        <span className={styles.publishButtonContainer}>
          <PublishToDatabaseIcon style={publishIconStyle} />
          <span className={styles.publishButtonText}>Publish</span>
        </span>
      </MLButton>
    </MLTooltip>
    <MLTooltip title={ModelingTooltips.exportGraph} placement="topLeft">
      <FontAwesomeIcon className={styles.graphExportIcon} icon={faFileExport} size="2x" aria-label="graph-export" />
    </MLTooltip>
  </span>;

  const splitPaneStyles = {
    pane1: {minWidth: "150px"},
    pane2: {minWidth: "140px", maxWidth: "90%"},
    pane: {overflow: "hidden"},
  };

  const splitStyle: CSSProperties = {
    position: "relative",
    height: "none",
  };

  const handleEntitySelection = (entityName) => {
    setSelectedEntity(entityName);
  };

  const onCloseSidePanel = () => {
    setViewSidePanel(false);
    setSelectedEntity(undefined);
  };

  const deleteEntityClicked = (selectedEntity) => {
    //Logic will be added here for deletion of entity.
  };

  const graphViewMainPanel =
  <div className={styles.graphViewContainer}>
    <div className={styles.graphHeader}>
      {filter}
      {headerButtons}
    </div>
    <div>
      {//Just a placeholder for actual graph view. Below code should be removed.
        <ul>{props.entityTypes && props.entityTypes?.map((el) => <li data-testid={`${el.entityName}-entityNode`} key={el.entityName} style={{color: "blue", cursor: "pointer"}} onClick={(e) => handleEntitySelection(el.entityName)}>{el.entityName}</li>)}
        </ul>
        //--------------//
      }
    </div>
    <div>
    <Graph
      graph={graph}
      options={options}
      events={events}
      getNetwork={network => {
        
        //  if you want access to vis.js network api you can set the state in a parent component using this property
        console.log("getSeed(): ", network, network.getSeed(), network.getPositions("Customer"))
      }}
    />
    </div>
  </div>;

  return (
    !viewSidePanel ? graphViewMainPanel :
      <SplitPane
        style={splitStyle}
        paneStyle={splitPaneStyles.pane}
        allowResize={true}
        resizerClassName={styles.resizerStyle}
        pane1Style={splitPaneStyles.pane1}
        pane2Style={splitPaneStyles.pane2}
        split="vertical"
        primary="first"
        defaultSize="70%"
      >
        {graphViewMainPanel}
        <GraphViewSidePanel
          entityTypes={props.entityTypes}
          onCloseSidePanel={onCloseSidePanel}
          deleteEntityClicked={deleteEntityClicked}
        />
      </SplitPane>
  );
};

export default GraphView;
