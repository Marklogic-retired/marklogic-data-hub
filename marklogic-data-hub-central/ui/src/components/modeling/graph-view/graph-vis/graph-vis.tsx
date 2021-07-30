import React, {useState, useEffect, useLayoutEffect} from "react";
import Graph from "react-graph-vis";
import "./graph-vis.scss";
import ReactDOMServer from "react-dom/server";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NodeSvg from "./node-svg";
import graphConfig from "../../../../config/graph-vis.config";

type Props = {
  entityTypes: any;
  handleEntitySelection: any;
};

// TODO temp hardcoded node data, remove when retrieved from db
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

const GraphVis: React.FC<Props> = (props) => {

  const graphType = "shape";

  // const [nodePositions, setNodePositions] = useState({});
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [graphData, setGraphData] = useState({nodes: [], edges: []});
  let testingMode = true; // Should be used further to handle testing only in non-production environment

  // Get network instance on init
  const [network, setNetwork] = useState<any>(null);
  const initNetworkInstance = (networkInstance) => {
    setNetwork(networkInstance);
  };

  // Initialize or update graph
  useEffect(() => {
    setGraphData({
      nodes: getNodes(),
      edges: getEdges()
    });
  }, [props.entityTypes]);

  useLayoutEffect(() => {
    if (testingMode && network) {
      window.graphVisApi = {
        getNodePositions: (nodeIds?: any) => { return !nodeIds ? network.getPositions() : network.getPositions(nodeIds); },
        canvasToDOM: (xCoordinate, yCoordinate) => { return network.canvasToDOM({x: xCoordinate, y: yCoordinate}); },
      };
    }
  }, [network]);

  // TODO update when icons are implemented
  const getIcon = (entityName) => {
    let icon = <FontAwesomeIcon icon={faFileExport} aria-label="node-icon" />;
    return ReactDOMServer.renderToString(icon);
  };

  // TODO remove when color is retrieved from db
  const getColor = (entityName) => {
    let color = "#cfe3e8";
    if (entityMetadata[entityName] && entityMetadata[entityName].color) {
      color = entityMetadata[entityName].color;
    }
    return color;
  };

  // TODO remove when num instances is retrieved from db
  const getNumInstances = (entityName) => {
    let num = 123;
    if (entityMetadata[entityName] && entityMetadata[entityName].instances) {
      num = entityMetadata[entityName].instances;
    }
    return num;
  };

  const getNodes = () => {
    let nodes;
    if (graphType === "shape") {
      nodes = props.entityTypes && props.entityTypes?.map((e) => {
        let label = "";
        return {
          ...graphConfig.defaultNodeProps,
          id: e.entityName,
          label: label.concat(
            "<b>", e.entityName, "</b>\n",
            "<code>", getNumInstances(e.entityName).toString(), "</code>"
          ),
          title: e.entityName + " tooltip text", // TODO use entity description
          color: {
            background: getColor(e.entityName),
            border: getColor(e.entityName),
          },
          chosen: {
            node: function(values, id, selected, hovering) {
              if (selected && hovering) {
                values.color = graphConfig.nodeStyles.hoverColor;
                values.borderColor = graphConfig.nodeStyles.selectColor;
                values.borderWidth = 3;
              } else if (selected) {
                values.color = getColor(id);
                values.borderColor = graphConfig.nodeStyles.selectColor;
                values.borderWidth = 3;
              } else if (hovering) {
                values.color = graphConfig.nodeStyles.hoverColor;
                values.borderWidth = 0;
              }
            }
          }
        };
      });
    } else if (graphType === "image") { // TODO for custom SVG node, not currently used
      nodes = props.entityTypes && props.entityTypes?.map((e) => {
        const node = new NodeSvg(e.entityName, getColor(e.entityName), getNumInstances(e.entityName), getIcon(e.entityName));
        return {
          id: e.entityName,
          label: "",
          title: e.entityName + " tooltip text",
          image: "data:image/svg+xml;charset=utf-8," + node.getSvg(),
          shape: "image"
        };
      });
    }
    return nodes;
  };

  const getEdges = () => {
    let edges: any = [];
    props.entityTypes.forEach((e, i) => {
      let properties: any = Object.keys(e.model.definitions[e.entityName].properties);
      properties.forEach((p, i) => {
        let pObj = e.model.definitions[e.entityName].properties[p];
        if (pObj.relatedEntityType) {
          let parts = pObj.relatedEntityType.split("/");
          edges.push({
            ...graphConfig.defaultEdgeProps,
            from: e.entityName,
            to: parts[parts.length - 1],
            label: pObj.joinPropertyName
          });
        }
      });
    });
    return edges;
  };

  const options = {
    ...graphConfig.defaultOptions,
    layout: {
      //hierarchical: true
      //randomSeed: "0.7696:1625099255200",
    },
    physics: {
      enabled: physicsEnabled,
      barnesHut: {
        springLength: 160,
        avoidOverlap: 0.4
      }
    },
    manipulation: {
      enabled: false,
      addNode: function (data, callback) {
        // filling in the popup DOM elements
      },
      editNode: function (data, callback) {
        // filling in the popup DOM elements
      },
      addEdge: function (data, callback) {
        // filling in the popup DOM elements
      }
    }
  };

  const events = {
    select: (event) => {
      let {nodes} = event;
      if (nodes.length > 0) {
        props.handleEntitySelection(nodes[0]);
      }
    },
    dragStart: (event) => {
      if (physicsEnabled) {
        setPhysicsEnabled(false);
      }
    },
    dragEnd: (event) => {
      //setNodePositions({[event.nodes[0]]: event.pointer.canvas});
    },
    hoverNode: (event) => {
      event.event.target.style.cursor = "pointer";
    },
    blurNode: (event) => {
      event.event.target.style.cursor = "";
    },
    hoverEdge: (event) => {
      event.event.target.style.cursor = "pointer";
    },
    blurEdge: (event) => {
      event.event.target.style.cursor = "";
    },
    doubleClick: (event) => {
    }
  };


  return (
    <div id="graphVis">
      <Graph
        graph={graphData}
        options={options}
        events={events}
        getNetwork={initNetworkInstance}
      />
    </div>
  );
};

export default GraphVis;