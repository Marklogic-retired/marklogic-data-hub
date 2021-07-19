import React, { useState, useEffect, useLayoutEffect } from "react";
import Graph from "react-graph-vis";
import "./graph-vis.scss";
import ReactDOMServer from "react-dom/server";
import { faFileExport, faTrashAlt, faAddressBook, faAmbulance } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NodeSvg from "./node-svg";

type Props = {
  entityTypes: any;
  handleEntitySelection: any;
};

const GraphVis: React.FC<Props> = (props) => {

  const [nodePositions, setNodePositions] = useState({});
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [testingMode, setTestingMode] = useState(true); // Should be used further to handle testing only in non-production environment

  //Initializing network instance
  const [network, setNetwork] = useState<any>(null);
  const initNetworkInstance = (networkInstance) => {
    setNetwork(networkInstance)
  }
  const [hoveringNode, setHoveringNode] = useState<string | undefined>(undefined);
  const hoverColor: string = "#E9F7FE";

  // Initialize or update graph
  useEffect(() => {
    setGraphData({
      nodes: getNodes(),
      edges: getEdges()
    });
  }, [props.entityTypes, hoveringNode]);

  useLayoutEffect(() => {
    if(testingMode && network) {
      window.graphVisApi = {
        getGraphNodes: (nodeId) => { return network.getPosition(nodeId); },
        canvasToDOM: (x, y) => { return network.canvasToDOM({x: x, y: y}); },
      }
    }
  },[network])

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
      icon: <FontAwesomeIcon icon={faFileExport} aria-label="BabyRegistry-icon" />
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

  const getIcon = (entityName) => {
    let icon = <FontAwesomeIcon icon={faFileExport} aria-label="node-icon" />;
    if (entityMetadata[entityName] && entityMetadata[entityName].icon) {
      icon = entityMetadata[entityName].icon;
    }
    return ReactDOMServer.renderToString(icon);
  }

  const getColor = (entityName) => {
    let color = "#cfe3e8";
    if (hoveringNode === entityName) {
      color = hoverColor;
    } else if (entityMetadata[entityName] && entityMetadata[entityName].color) {
      color = entityMetadata[entityName].color;
    }
    return color;
  }

  const getNumInstances = (entityName) => {
    let num = 123;
    if (entityMetadata[entityName] && entityMetadata[entityName].instances) {
      num = entityMetadata[entityName].instances;
    }
    return num;
  }

  const getNodes = () => {
    let nodes = props.entityTypes && props.entityTypes?.map((e) => {
      const node = new NodeSvg(e.entityName, getColor(e.entityName), getNumInstances(e.entityName), getIcon(e.entityName));
      return {
        id: e.entityName,
        label: "",
        title: e.model.definitions[e.entityName].description ? e.model.definitions[e.entityName].description : "Description is not available for the entity",
        image: "data:image/svg+xml;charset=utf-8," + node.getSvg(),
        shape: "image"
      };
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
      enabled: false,
      addNode: function (data, callback) {
        // filling in the popup DOM elements
        console.log('add', data);
      },
      editNode: function (data, callback) {
        // filling in the popup DOM elements
        console.log('edit', data);
      },
      addEdge: function (data, callback) {
        //   console.log('add edge', data);
      }
    }
  };

  const events = {
    select: (event) => {
      let { nodes, edges } = event;
      console.log('select', nodes, event);
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
      console.log('dragEnd', event, event.pointer.canvas);
      setNodePositions({ [event.nodes[0]]: event.pointer.canvas })
    },
    hoverNode: (event) => {
      console.log('on hover node', event);
      event.event.target.style.cursor = "pointer"
      setHoveringNode(event.node);
    },
    blurNode: (event) => {
      console.log('on blur node', event);
      event.event.target.style.cursor = ""
      setHoveringNode(undefined);
    },
    hoverEdge: (event) => {
      console.log('on hover edge', event.event.target.style.cursor);
      event.event.target.style.cursor = "pointer"
    },
    blurEdge: (event) => {
      console.log('on blur edge', event);
      event.event.target.style.cursor = ""
    },
    doubleClick: (event) => {
      console.log('doubleClick', event);
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