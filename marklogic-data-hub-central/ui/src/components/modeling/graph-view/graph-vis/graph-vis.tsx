import React, {useState, useEffect, useContext, useLayoutEffect, CSSProperties, useCallback} from "react";
import Graph from "react-graph-vis";
import "./graph-vis.scss";
import {ModelingContext} from "../../../../util/modeling-context";
import ReactDOMServer from "react-dom/server";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NodeSvg from "./node-svg";
import graphConfig from "../../../../config/graph-vis.config";
import AddEditRelationship from "../relationship-modal/add-edit-relationship";
import {Dropdown, Menu} from "antd";

type Props = {
  entityTypes: any;
  handleEntitySelection: any;
  filteredEntityTypes: any;
  entitySelected: any;
  isEntitySelected: boolean;
  updateSavedEntity: any;
  toggleRelationshipModal: any;
  relationshipModalVisible: any;
  canReadEntityModel: any;
  canWriteEntityModel: any;
  graphEditMode: any;
  setGraphEditMode: any;
  saveEntityCoords: any;
};

let entityMetadata = {};
// TODO temp hardcoded node data, remove when retrieved from db
// entityMetadata = graphConfig.sampleMetadata;

const GraphVis: React.FC<Props> = (props) => {

  const graphType = "shape";

  const {modelingOptions, setSelectedEntity} = useContext(ModelingContext);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  //const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [graphData, setGraphData] = useState({nodes: [], edges: []});
  let testingMode = true; // Should be used further to handle testing only in non-production environment
  const [openRelationshipModal, setOpenRelationshipModal] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<any>({});
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [clickedNode, setClickedNode] = useState(undefined);
  const [menuPosition, setMenuPosition] = useState({});
  const [newRelationship, setNewRelationship] = useState(false);
  const [escKeyPressed, setEscKeyPressed] = useState(false);
  //const [saveAllCoords, setSaveAllCoords] = useState(false);
  const [coordsLoaded, setCoordsLoaded] = useState(false);
  const [coords, setCoords] = useState<any>({});
  const [hasStabilized, setHasStabilized] = useState(false);

  // Get network instance on init
  const [network, setNetwork] = useState<any>(null);
  const initNetworkInstance = (networkInstance) => {
    setNetwork(networkInstance);
  };
  const vis = require("vis-network/standalone/umd/vis-network"); //eslint-disable-line @typescript-eslint/no-unused-vars

  // Load coords *once* on init
  useEffect(() => {
    if (!coordsLoaded && props.entityTypes.length > 0) {
      let newCoords = {};
      props.entityTypes.forEach(e => {
        if (e.model.hubCentral) {
          let opts = e.model.hubCentral.modeling;
          if (opts.graphX && opts.graphY) {
            newCoords[e.entityName] = {graphX: opts.graphX, graphY: opts.graphY};
          }
        }
      });
      setCoords(newCoords);
      setCoordsLoaded(true);
    }
  }, [props.entityTypes]);

  // Initialize or update graph
  useEffect(() => {
    if (props.entityTypes) { // && coordsLoaded) {
      // let counter = 0;
      props.entityTypes.forEach(e => {
        // counter++;
        if (e.model.hubCentral) {
          let opts = e.model.hubCentral.modeling;
          if (opts.graphX && opts.graphY) {
            if (physicsEnabled) {
              setPhysicsEnabled(false);
              // if(counter === props.entityTypes.length) {
              //   setGraphData({
              //     nodes: getNodes(),
              //     edges: getEdges()
              //   });
              // }
              return false;
            }
          }
        }
      });

      setGraphData({
        nodes: getNodes(),
        edges: getEdges()
      });

      //setSaveAllCoords(true);
      return () => {
        setClickedNode(undefined);
        setMenuPosition({});
        setContextMenuVisible(false);
      };
    }
  }, [props.entityTypes, props.filteredEntityTypes.length, coordsLoaded]);

  const coordsExist = (entityName) => {
    let result = false;
    const index = props.entityTypes.map(e => e.entityName).indexOf(entityName);
    if (index >= 0 && props.entityTypes[index].model.hubCentral) {
      if (props.entityTypes[index].model.hubCentral.modeling.graphX &&
          props.entityTypes[index].model.hubCentral.modeling.graphY) {
        result = true;
      }
    }
    return result;
  };

  const saveUnsavedCoords = () => {
    // TODO use endpoint that saves entire updated model at once
    if (props.entityTypes) {
      let newCoords = {...coords};
      props.entityTypes.forEach(ent => {
        if (!coordsExist(ent.entityName)) {
          let positions = network.getPositions([ent.entityName])[ent.entityName];
          newCoords[ent.entityName] = {graphX: positions.x, graphY: positions.y};
          props.saveEntityCoords(ent.entityName, positions.x, positions.y);
        }
      });
      setCoords(newCoords);
    }
  };

  // Save all unsaved coords
  // useEffect(() => {
  //   if (saveAllCoords && network) {
  //     saveUnsavedCoords();
  //   }
  //   setSaveAllCoords(false);
  // }, [saveAllCoords]);

  const escFunction = useCallback((event) => {
    if (event.keyCode === 27) {
      //Detect when esc is pressed, set state to disable edit mode
      setEscKeyPressed(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);

    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, []);

  useEffect(() => {
  //turn off edit mode on escape keydown
    if (network && props.graphEditMode) {
      network.disableEditMode();
      props.setGraphEditMode(false);
    }
    setEscKeyPressed(false);
  }, [escKeyPressed]);

  //turn on edit mode
  useEffect(() => {
    if (props.graphEditMode) {
      network.addEdgeMode();
      // setPhysicsEnabled(false);
    }
  }, [props.graphEditMode]);

  //turn off edit mode on cancel modal
  useEffect(() => {
    if (!openRelationshipModal && props.graphEditMode) {
      network.disableEditMode();
      props.setGraphEditMode(false);
      // network.addEdgeMode();
    }
  }, [openRelationshipModal]);

  // Focus on the selected nodes in filter input
  useEffect(() => {
    if (network) {
      network.focus(props.entitySelected);
    }
  }, [network, props.isEntitySelected]);

  // React to node selection from outside (e.g. new node created)
  useEffect(() => {
    if (network && modelingOptions.selectedEntity) {
      // Ensure entity exists
      if (props.entityTypes.some(e => e.entityName === modelingOptions.selectedEntity)) {
        // Persist selection and coords
        network.selectNodes([modelingOptions.selectedEntity]);
        saveUnsavedCoords();
      } else {
        // Entity type not found, unset in context
        setSelectedEntity(undefined);
      }
    }
  }, [network, modelingOptions.selectedEntity]);

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

  const getColor = (entityName) => {
    let color = "#EEEFF1";
    let entityIndex = props.entityTypes.findIndex(obj => obj.entityName === entityName);
    if (props.entityTypes[entityIndex].model.hubCentral && props.entityTypes[entityIndex].model.hubCentral.modeling["color"]&& props.filteredEntityTypes.length > 0 && !props.filteredEntityTypes.includes("a")) {
      if (props.filteredEntityTypes.includes(entityName)) {
        color = props.entityTypes[entityIndex].model.hubCentral.modeling["color"];
      } else {
        color = "#F5F5F5";
      }
    } else if (props.entityTypes[entityIndex].model.hubCentral && props.entityTypes[entityIndex].model.hubCentral.modeling["color"]) {
      color = props.entityTypes[entityIndex].model.hubCentral.modeling["color"];
    } else {
      color = "#EEEFF1";
    }
    return color;
  };

  // TODO remove when num instances is retrieved from db
  const getNumInstances = (entityName) => {
    let num = -123;
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
        let tmp = {
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
          borderWidth: e.entityName === modelingOptions.selectedEntity && props.entitySelected ? 3 : 0,
          // physics: {
          //   enabled: true
          // },
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
          },
        };
        if (coords[e.entityName] && coords[e.entityName].graphX && coords[e.entityName].graphY) {
          //tmp.physics.enabled = false;
          tmp.x = coords[e.entityName].graphX;
          tmp.y = coords[e.entityName].graphY;
        }
        return tmp;
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
    if (!props.canWriteEntityModel && props.canReadEntityModel) {
      //hide interactions if edit permissinos are missing
    } else {
      values.color = "#7FADE3";

      //change one to many image
      if (values.arrowStrikethrough === false) {
        values.toArrowSrc = graphConfig.customEdgeSVG.oneToManyHover;
      } else {
      //change one to one image
        values.toArrowSrc = graphConfig.customEdgeSVG.oneToOneHover;
      }
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
            title: !props.canWriteEntityModel && props.canReadEntityModel ? undefined : "Edit Relationship",
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
            title: !props.canWriteEntityModel && props.canReadEntityModel ? undefined : "Edit Relationship",
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

  const getRelationshipInfo = (node1, node2, event) => {
    let sourceNodeName = node1;
    let targetNodeName = node2;
    let targetNodeColor;
    let edgeInfo = event && event.edges?.length > 0 ? event.edges[0] : "";
    if (node2 === "Select target entity type*") {
      targetNodeColor = "#ececec";
    } else {
      targetNodeColor = getColor(targetNodeName);
    }
    return {
      edgeId: edgeInfo,
      sourceNodeName: sourceNodeName,
      sourceNodeColor: getColor(sourceNodeName),
      targetNodeName: targetNodeName,
      targetNodeColor: targetNodeColor,
      relationshipName: edgeInfo.split("-")[0],
      joinPropertyName: edgeInfo.split("-")[1]
    };
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
      },
      stabilization: {
        enabled: true,
        iterations: 1,
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
        let relationshipInfo;
        if (data.to === data.from) {  //if node is just clicked on during add edge mode, not dragged
          relationshipInfo = getRelationshipInfo(data.from, "Select target entity type*", "");
        } else { //if edge is dragged
          relationshipInfo = getRelationshipInfo(data.from, data.to, "");
        }
        setSelectedRelationship(relationshipInfo);
        setNewRelationship(true);
        setOpenRelationshipModal(true);
      }
    },
  };

  const menuClick = (event) => {
    // TODO do something useful
    setContextMenuVisible(false);
    if (event.key === "1") {
      if (network) {
        network.focus(clickedNode);
        setClickedNode(undefined);
      }
    }
  };

  const contextMenu: CSSProperties = {
    top: menuPosition["top"],
    left: menuPosition["left"]
  };

  const menu = () => {
    return (
      <Menu id="contextMenu" style={contextMenu} onClick={menuClick}>
        { clickedNode &&
      <Menu.Item key="1" data-testid={`centerOnEntityType-${clickedNode}`}>
        Center on entity type
      </Menu.Item> }
        {/*{ clickedEdge &&
      <Menu.Item key="2">
        {"Edit relationship "}
      </Menu.Item> }
        <Menu.Item key="3"> <Link to={{ pathname: "/tiles/explore", state: {entity: clickedNode}}}>
          {"Explore " + clickedNode + " instances"}
        </Link> </Menu.Item>
      <Menu.Item key="4">3rd menu item</Menu.Item>*/}
      </Menu>
    );
  };

  useEffect(() => {
    if (clickedNode && menuPosition) {
      setContextMenuVisible(true);
    } else {
      setContextMenuVisible(false);
    }
  }, [clickedNode]);

  const events = {
    select: (event) => {
      if (!props.graphEditMode) {
        // console.info("SELECT", event);
        let {nodes} = event;
        if (nodes.length > 0) {
          props.handleEntitySelection(nodes[0]);
        }
      }
    },
    click: (event) => {
      // console.info("CLICK", event);
      //if click is on an edge
      if (event.edges.length > 0 && event.nodes.length < 1 && props.canWriteEntityModel) {
        let connectedNodes = network.getConnectedNodes(event.edges[0]);
        let relationshipInfo = getRelationshipInfo(connectedNodes[0], connectedNodes[1], event);
        setNewRelationship(false);
        setSelectedRelationship(relationshipInfo);
        setOpenRelationshipModal(true);
      }
      if (clickedNode) {
        setClickedNode(undefined);
      }
    },

    dragStart: (event) => {
      if (!props.graphEditMode) {
        if (physicsEnabled) {
          setPhysicsEnabled(false);
        }
      }
    },
    dragEnd: (event) => {
      let {nodes} = event;
      if (nodes.length > 0) {
        let positions = network.getPositions([nodes[0]])[nodes[0]];
        // console.info("NODE dragged", event, positions);
        if (positions && positions.x && positions.y) {
          let newCoords = {...coords};
          newCoords[nodes[0]] = {graphX: positions.x, graphY: positions.y};
          setCoords(newCoords);
          props.saveEntityCoords(nodes[0], positions.x, positions.y);
        }
      }
      // TODO Handle canvas (all nodes, edges) drag
      // else {
      //   // On a canvas drag, getPositions() returns old positions so useless
      //   let positions = network.getPositions();
      //   console.log("CANVAS dragged", event, positions);
      //   let ids = Object.keys(coords);
      //   let newCoords = {};
      //   // Take current positions and update with drag deltas
      //   ids.forEach(id => {
      //     // TODO This gives the wrong results most of the time, unclear why
      //     let newX = coords[id].graphX + event.event.deltaX;
      //     let newY = coords[id].graphY + event.event.deltaY;
      //     newCoords[id] = {graphX: newX, graphY: newY};
      //     props.saveEntityCoords(id, newX, newY); // Save to db
      //   });
      //   setCoords(newCoords);
      //   // TODO handle zooming, nav button clicks
      // }
    },
    hoverNode: (event) => {
      event.event.target.style.cursor = "pointer";
    },
    blurNode: (event) => {
      event.event.target.style.cursor = "";
    },
    hoverEdge: (event) => {
      event.event.target.style.cursor = !props.canWriteEntityModel && props.canReadEntityModel ? "" : "pointer";
    },
    blurEdge: (event) => {
      event.event.target.style.cursor = "";
    },
    doubleClick: (event) => {
    },
    stabilized: (event) => {
      // NOTE if user doesn't manipulate graph on load, stabilize event
      // fires forever. This avoids reacting to infinite events
      if (hasStabilized) return;
      if (network) {
        let positions = network.getPositions();
        // console.info("STABILIZED", event, positions);
        // When graph is stabilized, nodePositions no longer empty
        if (positions && Object.keys(positions).length) {
          saveUnsavedCoords();
          setHasStabilized(true);
        }
        if (modelingOptions.selectedEntity) {
          try { // Visjs might not have new entity yet, catch error
            network.selectNodes([modelingOptions.selectedEntity]);
          } catch (err) {
            console.error(err);
          }
        }
      }
    },
    oncontext: (event) => {
      let nodeId = network.getNodeAt(event.pointer.DOM);
      if (nodeId) {
        event.event.preventDefault();
        let canvasCoord = network.getPosition(nodeId);
        let DOMCoordinates = network.canvasToDOM({x: canvasCoord.x, y: canvasCoord.y});
        //let DOMCoordinates = event.pointer.DOM;
        setMenuPosition({left: DOMCoordinates.x, top: DOMCoordinates.y + 40});
        setClickedNode(nodeId);
      } else {
        setClickedNode(undefined);
        setMenuPosition({});
      }
    },
    dragging: (event) => {
      if (clickedNode) {
        setClickedNode(undefined);
        setMenuPosition({});
      }
    }
  };


  return (
    <div id="graphVis">
      <Dropdown
        overlay={menu}
        trigger={["contextMenu"]}
        visible={contextMenuVisible}
        //placement="topRight"
      >
        <Graph
          graph={graphData}
          options={options}
          events={events}
          getNetwork={initNetworkInstance}
        />
      </Dropdown>
      <AddEditRelationship
        openRelationshipModal={openRelationshipModal}
        setOpenRelationshipModal={setOpenRelationshipModal}
        isEditing={!newRelationship}
        relationshipInfo={selectedRelationship}
        entityTypes={props.entityTypes}
        updateSavedEntity={props.updateSavedEntity}
        relationshipModalVisible={props.relationshipModalVisible}
        toggleRelationshipModal={props.toggleRelationshipModal}
        canReadEntityModel={props.canReadEntityModel}
        canWriteEntityModel={props.canWriteEntityModel}
        entityMetadata={entityMetadata} //passing in for colors, update when colors are retrieved from backend
      />
    </div>
  );
};

export default GraphVis;
