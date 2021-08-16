import React, {useState, useEffect, useLayoutEffect, useContext} from "react";
import Graph from "react-graph-vis";
import "./graph-vis.scss";
import {ModelingContext} from "../../../../util/modeling-context";
import ReactDOMServer from "react-dom/server";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NodeSvg from "./node-svg";
import graphConfig from "../../../../config/graph-vis.config";
import AddEditRelationship from "../relationship-modal/add-edit-relationship";

type Props = {
  entityTypes: any;
  handleEntitySelection: any;
  filteredEntityTypes: any;
  entitySelected: any;
  isEntitySelected: boolean;
  updateSavedEntity: any;
  toggleRelationshipModal: any;
  relationshipModalVisible: any;
};

// TODO temp hardcoded node data, remove when retrieved from db
let entityMetadata = {
  BabyRegistry: {
    color: "#e3ebbc",
    instances: 5,
    x: 10,
    y: -100
  },
  Customer: {
    color: "#ecf7fd",
    instances: 63,
    x: 10,
    y: 50
  },
  Product: {
    color: "#ded2da",
    instances: 252,
    x: -10,
    y: -100
  },
  Order: {
    color: "#cfe3e8",
    instances: 50123,
    x: -300,
    y: 50
  },
  NamespacedCustomer: {
    color: "#dfe2ec",
    instances: 75,
    x: -600,
    y: -100
  },
  Person: {
    color: "#dfe2ec",
    instances: 75,
    x: -150,
    y: -100
  },
  Client: {
    color: "#dfe2ec",
    instances: 75,
    x: -300,
    y: -100
  },
  Relation: {
    color: "#ded2da",
    instances: 75,
    x: -400,
    y: -100
  },
  Concept: {
    color: "#ded2da",
    instances: 75,
    x: -300,
    y: -200
  }
};

const GraphVis: React.FC<Props> = (props) => {

  const graphType = "shape";

  // const [nodePositions, setNodePositions] = useState({});
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [graphData, setGraphData] = useState({nodes: [], edges: []});
  const {modelingOptions} = useContext(ModelingContext);
  let testingMode = true; // Should be used further to handle testing only in non-production environment
  const [openRelationshipModal, setOpenRelationshipModal] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<any>({});

  // Get network instance on init
  const [network, setNetwork] = useState<any>(null);
  const initNetworkInstance = (networkInstance) => {
    setNetwork(networkInstance);
  };
  const vis = require("vis-network/standalone/umd/vis-network"); //eslint-disable-line @typescript-eslint/no-unused-vars

  // Initialize or update graph
  useEffect(() => {
    setGraphData({
      nodes: getNodes(),
      edges: getEdges()
    });
  }, [props.entityTypes, props.filteredEntityTypes.length]);

  // Focus on the selected nodes in filter input
  useEffect(() => {
    {
      if (network) {
        network.focus(props.entitySelected);
      }
    }
  }, [network, props.isEntitySelected]);


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
    if (entityMetadata[entityName] && entityMetadata[entityName].color && props.filteredEntityTypes.length > 0 && !props.filteredEntityTypes.includes("a")) {
      if (props.filteredEntityTypes.includes(entityName)) {
        color = entityMetadata[entityName].color;
      } else {
        color = "#F5F5F5";
      }
    } else if (entityMetadata[entityName] && entityMetadata[entityName].color) {
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
            border: e.entityName === modelingOptions.selectedEntity && props.entitySelected ? graphConfig.nodeStyles.selectColor : getColor(e.entityName),
          },
          x: entityMetadata[e.entityName] !== undefined ? entityMetadata[e.entityName].x : getRandomArbitrary(-300, 300),
          y: entityMetadata[e.entityName] !== undefined ? entityMetadata[e.entityName].y : getRandomArbitrary(-300, 300),
          borderWidth: e.entityName === modelingOptions.selectedEntity && props.entitySelected ? 3 : 0,
          physics: {
            enabled: false
          },
          chosen: {
            node: function (values, id, selected, hovering) {
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

  const onChosen = (values, id, selected, hovering) => {
    values.color = "#7FADE3";

    //change one to many image
    if (values.arrowStrikethrough === false) {
      values.toArrowSrc = graphConfig.customEdgeSVG.oneToManyHover;
    } else {
    //change one to one image
      values.toArrowSrc = graphConfig.customEdgeSVG.oneToOneHover;
    }
  };

  const getEdges = () => {
    let edges: any = [];
    props.entityTypes.forEach((e, i) => {
      let properties: any = Object.keys(e.model.definitions[e.entityName].properties);
      properties.forEach((p, i) => {
        let pObj = e.model.definitions[e.entityName].properties[p];
        //for one to one edges
        if (pObj.relatedEntityType) {
          let parts = pObj.relatedEntityType.split("/");
          edges.push({
            ...graphConfig.defaultEdgeProps,
            from: e.entityName,
            to: parts[parts.length - 1],
            label: p,
            id: p + "-" + pObj.joinPropertyName + "-edge",
            title: "Edit Relationship",
            arrows: {
              to: {
                enabled: true,
                src: graphConfig.customEdgeSVG.oneToOne,
                type: "image"
              }
            },
            endPointOffset: {
              from: -500,
              to: -500
            },
            arrowStrikethrough: true,
            color: "#666",
            font: {
              align: "top",
            },
            chosen: {
              label: onChosen,
              edge: onChosen,
              node: false
            }
          });
        //for one to many edges
        } else if (pObj.items?.relatedEntityType) {
          let parts = pObj.items.relatedEntityType.split("/");
          edges.push({
            ...graphConfig.defaultEdgeProps,
            from: e.entityName,
            to: parts[parts.length - 1],
            label: p,
            id: p + "-" + pObj.items.joinPropertyName + "-edge",
            title: "Edit Relationship",
            arrowStrikethrough: false,
            arrows: {
              to: {
                enabled: true,
                src: graphConfig.customEdgeSVG.oneToMany,
                type: "image"
              }
            },
            color: "#666",
            font: {align: "top"},
            chosen: {
              label: onChosen,
              edge: onChosen,
              node: false
            }
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
      enabled: false,
      barnesHut: {
        springLength: 160,
        avoidOverlap: 0.4
      }
    },
    interaction: {
      navigationButtons: true,
      hover: true,
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

  const getRandomArbitrary = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const events = {
    select: (event) => {
      let {nodes} = event;
      if (nodes.length > 0) {
        props.handleEntitySelection(nodes[0]);
      }
    },
    click: (event) => {
      //if click is on an edge
      if (event.edges.length > 0 && event.nodes.length < 1) {
        let connectedNodes = network.getConnectedNodes(event.edges[0]);
        let sourceNodeName = connectedNodes[0];
        let targetNodeName = connectedNodes[1];
        let relationshipInfo = {
          edgeId: event.edges[0],
          sourceNodeName: connectedNodes[0],
          sourceNodeColor: entityMetadata[sourceNodeName] && entityMetadata[sourceNodeName].color ? entityMetadata[sourceNodeName].color : "#cfe3e8",
          targetNodeName: connectedNodes[1],
          targetNodeColor: entityMetadata[targetNodeName] && entityMetadata[targetNodeName].color ? entityMetadata[targetNodeName].color : "#cfe3e8",
          relationshipName: event.edges[0].split("-")[0],
          joinPropertyName: event.edges[0].split("-")[1]
        };
        setSelectedRelationship(relationshipInfo);
        setOpenRelationshipModal(true);
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
      <AddEditRelationship
        openRelationshipModal={openRelationshipModal}
        setOpenRelationshipModal={setOpenRelationshipModal}
        isEditing={true}
        relationshipInfo={selectedRelationship}
        entityTypes={props.entityTypes}
        updateSavedEntity={props.updateSavedEntity}
        relationshipModalVisible={props.relationshipModalVisible}
        toggleRelationshipModal={props.toggleRelationshipModal}
      />
    </div>
  );
};

export default GraphVis;
