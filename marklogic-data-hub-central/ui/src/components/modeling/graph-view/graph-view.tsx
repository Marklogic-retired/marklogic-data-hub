import React, { CSSProperties, useContext, useEffect, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { AutoComplete, Dropdown, Icon, Menu } from "antd";
import styles from "./graph-view.module.scss";
import { ModelingTooltips } from "../../../config/tooltips.config";
import { MLTooltip, MLInput, MLButton } from "@marklogic/design-system";
import { DownOutlined } from "@ant-design/icons";
import PublishToDatabaseIcon from "../../../assets/publish-to-database-icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faAmbulance, faFileExport } from "@fortawesome/free-solid-svg-icons";
import SplitPane from "react-split-pane";
import GraphViewSidePanel from "./side-panel/side-panel";
import { ModelingContext } from "../../../util/modeling-context";
import { defaultModelingView } from "../../../config/modeling.config";
import Graph from "react-graph-vis";
import "./graph-view.scss";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";

type Props = {
  entityTypes: any;
};

const GraphView: React.FC<Props> = (props) => {

  const [viewSidePanel, setViewSidePanel] = useState(false);
  const { modelingOptions, setSelectedEntity } = useContext(ModelingContext);
  const [nodePositions, setNodePositions] = useState({});
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [hoveringNode, setHoveringNode] = useState(false);

  //Initializing network instance
  const [network, setNetwork] = useState<any>(null);
  const initNetworkInstance = (networkInstance) => {
    setNetwork(networkInstance);
    networkInstance.redraw();
  }

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
      instances: 5,
      icon: <FontAwesomeIcon icon={faFileExport} aria-label="graph-export" />
    },
    Customer: {
      color: "#ecf7fd",
      instances: 63,
      icon: <FontAwesomeIcon icon={faTrashAlt} aria-label="graph-export" />
    },
    Product: {
      color: "#ded2da",
      instances: 252,
      icon: <FontAwesomeIcon icon={faTrashAlt} aria-label="graph-export" />
    },
    Order: {
      color: "#cfe3e8",
      instances: 50123,
      icon: <FontAwesomeIcon icon={faTrashAlt} aria-label="graph-export" />
    },
    NamespacedCustomer: {
      color: "#dfe2ec",
      instances: 75,
      icon: <FontAwesomeIcon icon={faAddressBook} aria-label="graph-export" />
    },
    Person: {
      color: "#dfe2ec",
      instances: 75,
      icon: <FontAwesomeIcon icon={faAmbulance} aria-label="graph-export" />
    }
  };

  const getLabelIcon = (e) => {
    let icon = e.entityName === "Customer" ?  <FontAwesomeIcon icon={faTrashAlt} aria-label="graph-export" /> : <FontAwesomeIcon icon={faFileExport} aria-label="graph-export" />;
    return ReactDOMServer.renderToString(icon);
  }
  const getNodes = () => {
    let nodes = props.entityTypes && props.entityTypes?.map((e) => {
      return {
        shape: "icon",
        shapeProperties: {
          borderRadius: 2
        },
        id: e.entityName,
        label: e.entityName.concat("\n<b>", "\uf0ce", entityMetadata[e.entityName].instances, "</b>"),
        color: {
          background: entityMetadata[e.entityName].color,
          border: entityMetadata[e.entityName].color,
          hover: {
            //border: '#2B7CE9',
            //background: 'red'
          }
        },
        icon: {
          face: "'Font Awesome 5 Free'",
          weight: 900,
          code: "\uf0ce",
          size: 30,
          color: "#f0a30a",
        },
        // font: {
        //   multi: "html",
        //   align: "left",
        //   bold: {
        //     color: "#6773af",
        //     vadjust: 3,
        //     size: 12
        //   },
        // },
        // margin: 10,
        // widthConstraint: {
        //   minimum: 80
        // },
        // x: nodeP[e.entityName]?.x,
        // y: nodeP[e.entityName]?.y,
        // hidden: false
      }
    });
    return nodes;
  }

  const getEdges = () => {
    let edges: any = [];
    props.entityTypes.forEach((e, i) => {
      let properties: any = Object.keys(e.model.definitions[e.entityName].properties);
      properties.forEach((p, i) => {
        if (e.model.definitions[e.entityName].properties[p].relatedEntityType) {
          let parts = e.model.definitions[e.entityName].properties[p].relatedEntityType.split("/");
          edges.push({
            from: e.entityName,
            to: parts[parts.length - 1],
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

  //   var svg = `<svg width="390" height="105" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

  //    <style type="text/css">
  //     @namespace svg url(http://www.w3.org/2000/svg);

  // svg|a:link, svg|a:visited {
  //   cursor: pointer;
  // }

  // svg { cursor: pointer; border: 1px solid blue;}
  // svg text {
  //   font-family: FontAwesome;
  //   border: 1px solid blue;
  // }

  // svg|a text,
  // text svg|a {
  //   fill: blue;
  //   text-decoration: underline;
  // }

  // text svg|a:hover {
  //   outline: dotted 1px blue;;
  //   cursor: pointer
  // }

  // svg|a:hover, svg|a:active {
  //   outline: dotted 1px blue;
  // }

  // .atext{
  //   fill: #red;
  //   cursor: pointer;
  // }
  // .st0{color: red; border: 1px solid blue;}
  // .cir{fill: brown;}
  // .cir:hover{fill:yellow;}
  // <![CDATA[
  // 			circle {
  // 				stroke: #909;
  // 				stroke-width: 10;
  // 				fill: green;
  //         cursor: pointer;
  //         z-index: 1000;
  // 			};
  //       circle:hover {
  //         fill: red;
  //         cursor: pointer;
  //       };
  //       .st0{border: 1px solid blue; };
  //       .iconFA{
  //         font-size: 25px;
  //         fill: blue;
  //         font-weight: 600;
  //       }
  // 		]]>
  //     </style>
  //     <foreignObject>
  //       <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px;cursor:pointer">
  //         <em>I</em> am <span style="color:white; text-shadow:0 0 20px #000000;">HTML in SVG! </span>
  //       </div>
  //       </foreignObject>

  //   <a xlink:href="/docs/Web/SVG/Element/circle" class="atext">
  //     <circle class="cir" cx="50" cy="40" r="15"/>
  //   </a>
  //   <a href="/docs/Web/SVG/Element/text">
  //     <text x="50" y="90" text-anchor="middle">
  //       &lt;circle&gt;
  //     </text>
  //   </a>
  //   <g><text x="0" y="0">&#xf406;</text></g>
  //   //<image xlink:href="https://google.com" x="0" y="0" height="50" width="50" />
  //   <foreignObject>
  //   ${labelIcon}</foreignObject>
  // </svg>`

  const getEncodedSvg = (e) => {

    let svgImage = `<svg width="400" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <style type="text/css">
    .box{
      fill: ${entityMetadata[e.entityName].color};
    }
    .box::before{
      fill: red;
    }
    <![CDATA[
    .customIcon{
      color: black;
      font-size: 24px;
    };
    ]]>
    </style>
      <rect id="rect-box" class="box" x="0px" y="0px" width="100%" height="200px" />
      <foreignObject x="50" y="10" width="220" height="220" class="customIcon" transform="translate(2,8) scale(0.17,0.17)">
      ${getLabelIcon(e)}
      </foreignObject>
      <foreignObject x="70" y="10" width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" class="label" style="font-size: 30px; font-style: normal; font-family: Arial, Helvetica, sans-serif; font-weight: 600; width: 100%">
      <em>${e.entityName}</em>
      </div>
      </foreignObject>
      <foreignObject x="30" y="45" width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: 23px; font-style: normal; font-family: Arial, Helvetica, sans-serif; color: #6773af;font-weight: 600; width: 100%">
      ${entityMetadata[e.entityName].instances}
      </div>
      </foreignObject>
</svg>`


    return encodeURIComponent(svgImage);
  }



  //Display SVG as a react component

  const getNodeSVGJSX = (e) => {
    return (<svg className="box" width="450" height="100%" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <style type="text/css">
      
    {`@namespace svg url(http://www.w3.org/2000/svg);
    svg|a:link, svg|a:visited {
      cursor: pointer;
    }
    
    svg|a text,
    text svg|a {
      fill: blue; /* Even for text, SVG uses fill over color */
      text-decoration: underline;
    }
    
    .box{
      fill: ${entityMetadata[e.entityName].color};
    }
    .box:hover{
      fill: blue;
    }
    .label{
      font-family: Arial, Helvetica, sans-serif;
      font-size: 35px;
      fill: black;
      width: 100%;
    }
    .instances{
      font-family: Arial, Helvetica, sans-serif;
      font-size: 25px;
      fill: #6773af;
      width: 100%;
      pointer-events: bounding-box;
    }
    `}
    </style>
      <rect id={e.entityName} x="1px" y="1px" width="100%" height="400px" />
      <foreignObject x="30" y="10" width="240" height="260" className={styles.customIcon} style={{fontSize: "12px"}} transform="translate(2,8) scale(0.13,0.13)">
      {entityMetadata[e.entityName].icon}
      </foreignObject>
      <text x="45" y="35" className="label">{e.entityName}</text>
      <defs>
      <a id="alink" href="https://www.w3schools.com/graphics/" target="__blank" className="instances">
      <text className="instances">{entityMetadata[e.entityName].instances}</text>
      </a>
      </defs>
      <use x="20" y="70" xlinkHref="#alink" onClick={() => console.log("clicked the a link to google.com")}></use>
      <foreignObject x="30" y="20" width="100%" height="100%">
        <a href="https://google.com" className="label">CustomLink</a>
      </foreignObject>
</svg>)
  }  

  const getNodeImage = (e) => {
    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(ReactDOMServer.renderToString(getNodeSVGJSX(e)));//getEncodedSvg(e);
    return url;
  }

  const getNodesAsImages = () => {
    let nodes = props.entityTypes && props.entityTypes?.map((e) => {
      return {
        id: e.entityName,
        label: "",
        image: getNodeImage(e),
        shape: "image"
      }
    });
    return nodes;
  }

  const graph = {
    nodes: getNodes(),//getNodesAsImages(),
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
    },
    interaction: {
      hover: true
    },
    manipulation: {
      editNode: (data, callback) => {
        console.log("on node editing", data);
      },
      editEdge: (data, callback) => {
        console.log("on edge editing", data);
      }
    }
  };

  const events = {
    select: (event) => {
      var { nodes, edges } = event;
      console.log('select', event)
      //network.editEdgeMode();
    },
    dragStart: (event) => {
      if (physicsEnabled) {
        setPhysicsEnabled(false);
      }
    },
    dragEnd: (event) => {
      console.log('dragEnd', event, event.pointer.canvas);
      console.log('Testing network functions', network.getPositions(), network.getSelectedNodes())
      setNodePositions({ [event.nodes[0]]: event.pointer.canvas })
    },
    hoverNode: (event) => {
      console.log('on hover node', event.event.target.style);
      event.event.target.style.cursor = "pointer";
      setHoveringNode(true);
    },
    blurNode: (event) => {
      console.log('on blur node', event);
      event.event.target.style.cursor = "";
      event.event.target.style.color = "";
      setHoveringNode(false);
    },
    hoverEdge: (event) => {
      console.log('on hover edge', event.event.target.style.cursor);
      event.event.target.style.cursor = "pointer"
    },
    blurEdge: (event) => {
      console.log('on blur edge', event);
      event.event.target.style.cursor = "";
      //network.disableEditMode();
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
    pane1: { minWidth: "150px" },
    pane2: { minWidth: "140px", maxWidth: "90%" },
    pane: { overflow: "hidden" },
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
          // <ul>{props.entityTypes && props.entityTypes?.map((el) => <li data-testid={`${el.entityName}-entityNode`} key={el.entityName} style={{ color: "blue", cursor: "pointer" }} onClick={(e) => handleEntitySelection(el.entityName)}>{el.entityName}</li>)}
          // </ul>
          //--------------//
          //getNodeSVGJSX()
        }
      </div>
      <div>
        <Graph
          graph={graph}
          options={options}
          events={events}
          getNetwork={initNetworkInstance}
        />
      </div>
    </div>;

if(network){
  network.redraw();
}

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
