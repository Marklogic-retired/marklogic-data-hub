import React, {useState, useEffect, useContext, useLayoutEffect, useCallback} from "react";
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
import {defaultHubCentralConfig} from "../../../../config/modeling.config";
import * as _ from "lodash";

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
  setCoordsChanged: any;
  hubCentralConfig: any;
  updateHubCentralConfig: (hubCentralConfig: any) => void;
  getColor: any;
  splitPaneResized: any;
  setSplitPaneResized: any;
};

let entityMetadata = {};
// TODO temp hardcoded node data, remove when retrieved from db
// entityMetadata = graphConfig.sampleMetadata;

const GraphVis: React.FC<Props> = (props) => {

  const graphType = "shape";

  const {modelingOptions, setSelectedEntity} = useContext(ModelingContext);

  const entitiesConfigExist = () => {
    return !props.hubCentralConfig?.modeling?.entities ? false : true;
  };

  const coordinatesExist = () => {
    let coordsExist = false;
    if (entitiesConfigExist()) {
      let allEntityCoordinates = props.hubCentralConfig["modeling"]["entities"];
      for (const entity of Object.keys(allEntityCoordinates)) {
        if (allEntityCoordinates[entity]) {
          if (allEntityCoordinates[entity].graphX && allEntityCoordinates[entity].graphY) {
            coordsExist = true;
            break;
          }
        }
      }
    }
    return coordsExist;
  };
  const [physicsEnabled, setPhysicsEnabled] = useState(!coordinatesExist());
  const [graphData, setGraphData] = useState({nodes: [], edges: []});
  let testingMode = true; // Should be used further to handle testing only in non-production environment
  const [openRelationshipModal, setOpenRelationshipModal] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<any>({});
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [clickedNode, setClickedNode] = useState(undefined);
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
    if (!coordsLoaded && entitiesConfigExist()) {
      let newCoords = {};
      if (entitiesConfigExist()) {
        let allCoordinates = props.hubCentralConfig["modeling"]["entities"];

        Object.keys(allCoordinates).forEach(entity => {
          let entityCoordinates = allCoordinates[entity];
          if (entityCoordinates.graphX && entityCoordinates.graphY) {
            newCoords[entity] = {graphX: entityCoordinates.graphX, graphY: entityCoordinates.graphY};
          }
        });
      }
      setCoords(newCoords);
      setCoordsLoaded(true);
    } else {
      setGraphData({
        nodes: getNodes(),
        edges: getEdges()
      });
    }
  }, [props.hubCentralConfig]);

  useEffect(() => {
    if (modelingOptions.view === "graph") {
      if (network && coordsLoaded) {
        initializeScaleAndViewPosition();
      }
    }
  }, [network, modelingOptions.view]);

  // Initialize or update graph
  useEffect(() => {
    if (props.entityTypes) {
      if (coordinatesExist()) {
        if (physicsEnabled) {
          setPhysicsEnabled(false);
        }
      }

      setGraphData({
        nodes: getNodes(),
        edges: getEdges()
      });

      //Initialize graph zoom scale and view position
      if (network) {
        initializeScaleAndViewPosition();
      }
      //setSaveAllCoords(true);
      return () => {
        setClickedNode(undefined);
        setContextMenuVisible(false);
      };
    }
  }, [props.entityTypes, props.filteredEntityTypes.length, coordsLoaded]);

  useEffect(() => {
    if (props.splitPaneResized) {
      setGraphData({
        nodes: getNodes(),
        edges: getEdges()
      });
      props.setSplitPaneResized(false);
    }
  }, [props.splitPaneResized]);

  const initializeScaleAndViewPosition = () => {
    if (props.hubCentralConfig?.modeling) {
      let model = props.hubCentralConfig.modeling;
      let moveToConfig = {};
      if (model.scale) {
        moveToConfig["scale"] = model.scale;
      }
      if (model.viewPosition && Object.keys(model.viewPosition).length) {
        moveToConfig["position"] = model.viewPosition;
      }
      network.moveTo(moveToConfig);
    }
  };

  const coordsExist = (entityName) => {
    let result = false;
    if (entitiesConfigExist()) {
      let entities = props.hubCentralConfig["modeling"]["entities"];
      if (entities[entityName]) {
        if (entities[entityName].graphX &&
          entities[entityName].graphY) {
          result = true;
        }
      }
    }
    return result;
  };

  const selectedEntityExists = () => {
    return props.entityTypes.some(e => e.entityName === modelingOptions.selectedEntity);
  };

  const saveUnsavedCoords = async () => {
    if (props.entityTypes) {
      let newCoords = {...coords};
      let updatedHubCentralConfig: any = defaultHubCentralConfig;
      props.entityTypes.forEach(ent => {
        if (!coordsExist(ent.entityName)) {
          let positions = network.getPositions([ent.entityName])[ent.entityName];
          newCoords[ent.entityName] = {graphX: positions.x, graphY: positions.y};
          updatedHubCentralConfig["modeling"]["entities"][ent.entityName] = {graphX: positions.x, graphY: positions.y};
        }
      });
      setCoords(newCoords);
      if (props.updateHubCentralConfig && Object.keys(updatedHubCentralConfig["modeling"]["entities"]).length) {
        await props.updateHubCentralConfig(updatedHubCentralConfig);
        props.setCoordsChanged(true);
      }
    }
  };

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
    if (network && props.isEntitySelected) {
      network.focus(props.entitySelected);
    }
  }, [network, props.isEntitySelected]);

  // React to node selection from outside (e.g. new node created)
  useEffect(() => {
    if (network && modelingOptions.selectedEntity) {
      // Ensure entity exists
      if (selectedEntityExists()) {
        // Persist selection and coords
        network.selectNodes([modelingOptions.selectedEntity]);
        if (entitiesConfigExist()) {
          saveUnsavedCoords();
        }
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

  const getDescription = (entityName) => {
    let entityIndex = props.entityTypes.findIndex(obj => obj.entityName === entityName);
    return props.entityTypes[entityIndex].model.definitions[entityName] ?
      props.entityTypes[entityIndex].model.definitions[entityName].description : "";
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
            // "<code>", getNumInstances(e.entityName).toString(), "</code>"
          ),
          color: {
            background: props.getColor(e.entityName),
            border: e.entityName === modelingOptions.selectedEntity && props.entitySelected ? graphConfig.nodeStyles.selectColor : props.getColor(e.entityName),
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
                values.color = props.getColor(id);
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
        if (getDescription(e.entityName) && getDescription(e.entityName).length > 0) {
          tmp.title = getDescription(e.entityName);
        }
        return tmp;
      });
    } else if (graphType === "image") { // TODO for custom SVG node, not currently used
      nodes = props.entityTypes && props.entityTypes?.map((e) => {
        const node = new NodeSvg(e.entityName, props.getColor(e.entityName), getNumInstances(e.entityName), getIcon(e.entityName));
        let tempTitle;
        if (getDescription(e.entityName) && getDescription(e.entityName).length) {
          tempTitle = getDescription(e.entityName);
        }
        return {
          id: e.entityName,
          label: "",
          title: tempTitle,
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
      if (values.toArrowSrc === graphConfig.customEdgeSVG.oneToMany) {
        values.toArrowSrc = graphConfig.customEdgeSVG.oneToManyHover;
      } else {
      //change one to one image
        values.toArrowSrc = graphConfig.customEdgeSVG.oneToOneHover;
      }
    }
  };

  // Handle multiple edges between nodes:
  // 1. Count how many same edges were drawn before current edge
  // 2. Check if previous edge is in same or reversed direction
  //    (so we can draw it the correct way, CW or CCW)
  const getSmoothOpts = (to, from, edges) => {
    let count = 0;
    let reversed;
    edges.forEach((edge, i) => {
      if (to === edge.to && from === edge.from) {
        count++;
        // This works so...
        reversed = (reversed === undefined) ? false : reversed;
      } else if (from === edge.to && to === edge.from) {
        count++;
        reversed = (reversed === undefined) ? true : reversed;
      }
    });
    // Space out same edges using visjs "smooth" options
    let space = 0.16;
    let type = "";
    if (!reversed) {
      type = (count % 2 === 0) ? "curvedCW" : "curvedCCW";
    } else {
      type = (count % 2 === 0) ? "curvedCCW" : "curvedCW";
    }
    return {
      enabled: (count > 0),
      type: type,
      roundness: (count % 2 === 0) ? (space * count / 2) : (space * (count + 1) / 2)
    };
  };

  const getEdges = () => {
    let edges: any = [];
    props.entityTypes.forEach((e, i) => {
      if (!e.model.definitions[e.entityName]) {
        return [];
      }

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
            id: e.entityName + "-" + p + "-" + parts[parts.length - 1] + "-via-" + pObj.joinPropertyName,
            title: !props.canWriteEntityModel && props.canReadEntityModel ? undefined : "Edit Relationship",
            arrows: {
              to: {
                enabled: true,
                src: graphConfig.customEdgeSVG.oneToOne,
                type: "image"
              }
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
            },
            smooth: getSmoothOpts(e.entityName, parts[parts.length - 1], edges)
          });
        //for one to many edges
        } else if (pObj.items?.relatedEntityType) {
          let parts = pObj.items.relatedEntityType.split("/");
          edges.push({
            ...graphConfig.defaultEdgeProps,
            from: e.entityName,
            to: parts[parts.length - 1],
            label: p,
            id: e.entityName + "-" + p + "-" + parts[parts.length - 1] + "-via-" + pObj.items.joinPropertyName,
            title: !props.canWriteEntityModel && props.canReadEntityModel ? undefined : "Edit Relationship",
            arrowStrikethrough: true,
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
            },
            smooth: getSmoothOpts(e.entityName, parts[parts.length - 1], edges)
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
      targetNodeColor = props.getColor(targetNodeName);
    }
    return {
      edgeId: edgeInfo,
      sourceNodeName: sourceNodeName,
      sourceNodeColor: props.getColor(sourceNodeName),
      targetNodeName: targetNodeName,
      targetNodeColor: targetNodeColor,
      relationshipName: edgeInfo.length > 0 ? edgeInfo.split("-")[1] : "",
      joinPropertyName: edgeInfo.length > 0 ? edgeInfo.split("-")[4] : ""
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

  const menuClick = async (event) => {
    setContextMenuVisible(false);
    if (event.key === "1") {
      if (network) {
        await network.focus(clickedNode);
        let viewPosition: any = await network.getViewPosition();
        setClickedNode(undefined);
        let viewPositionPayload = defaultHubCentralConfig;
        viewPositionPayload.modeling["viewPosition"] =  viewPosition;
        props.updateHubCentralConfig(viewPositionPayload);
      }
    }
  };

  const menu = () => {
    return (
      <Menu id="contextMenu" onClick={menuClick}>
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
    if (clickedNode) {
      setContextMenuVisible(true);
    } else {
      setContextMenuVisible(false);
    }
  }, [clickedNode]);

  const handleZoom = _.debounce((event) => {
    let ZoomScalePayload = defaultHubCentralConfig;
    ZoomScalePayload.modeling["scale"] =  event.scale;
    props.updateHubCentralConfig(ZoomScalePayload);
  }, 400);

  const updateConfigOnNavigation = _.debounce(async (event) => {
    let {nodes} = event;
    if (!nodes.length || modelingOptions.selectedEntity) {
      if (entitiesConfigExist()) {
        let scale: any = await network.getScale();
        let viewPosition: any = await network.getViewPosition();
        let updatedHubCentralConfig: any = defaultHubCentralConfig;
        let entitiesConfig = props.hubCentralConfig["modeling"]["entities"];
        Object.keys(entitiesConfig).forEach(entityName => {
          if (coords[entityName]) {
            updatedHubCentralConfig["modeling"]["entities"][entityName] = {graphX: coords[entityName].graphX, graphY: coords[entityName].graphY};
          }
        });
        updatedHubCentralConfig["modeling"]["scale"] = scale;
        updatedHubCentralConfig["modeling"]["viewPosition"] = viewPosition;
        if (props.updateHubCentralConfig && Object.keys(updatedHubCentralConfig["modeling"]["entities"]).length) {
          await props.updateHubCentralConfig(updatedHubCentralConfig);
          props.setCoordsChanged(true);
        }
      }
    }
  }, 400);

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
    dragEnd: async (event) => {
      let {nodes} = event;
      if (nodes.length > 0) {
        let positions = network.getPositions([nodes[0]])[nodes[0]];
        if (positions && positions.x && positions.y) {
          let newCoords = {...coords};
          newCoords[nodes[0]] = {graphX: positions.x, graphY: positions.y};
          setCoords(newCoords);
          let coordsPayload = defaultHubCentralConfig;
          coordsPayload.modeling.entities[nodes[0]] =  {graphX: positions.x, graphY: positions.y};
          props.updateHubCentralConfig(coordsPayload);
        }
      }
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
        // When graph is stabilized, nodePositions no longer empty
        if (positions && Object.keys(positions).length && !Object.keys(coords).length) {
          saveUnsavedCoords();
          setHasStabilized(true);
          if (physicsEnabled) {
            setPhysicsEnabled(false);
            return false;
          }
        }
        if (modelingOptions.selectedEntity && selectedEntityExists()) {
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
        setClickedNode(nodeId);
      } else {
        setClickedNode(undefined);
      }
    },
    dragging: (event) => {
      if (clickedNode) {
        setClickedNode(undefined);
      }
    },
    zoom: (event) => {
      handleZoom(event);
    },
    release: (event) => {
      if (!props.graphEditMode) {
        let targetClassName = event.event.target.className;
        let usingNavigationButtons = targetClassName || event.event.deltaX || event.event.deltaY ? true : false;
        let usingZoomButtons = targetClassName === "vis-button vis-zoomOut" || targetClassName === "vis-button vis-zoomIn";
        if (usingNavigationButtons && !usingZoomButtons) {
          updateConfigOnNavigation(event);
        }
      }
    }
  };

  return (
    <div id="graphVis">
      <Dropdown
        overlay={menu}
        trigger={["contextMenu"]}
        visible={contextMenuVisible}
      >
        <div>
          <Graph
            graph={graphData}
            options={options}
            events={events}
            getNetwork={initNetworkInstance}
          />
        </div>
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
