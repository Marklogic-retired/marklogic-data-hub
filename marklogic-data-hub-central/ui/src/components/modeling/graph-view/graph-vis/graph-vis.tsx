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
  //saveEntityCoords: any;
  setCoordsChanged: any;
  hubCentralConfig: any;
  updateHubCentralConfig: (hubCentralConfig: any) => void;
  getColor: any;
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
    if (!coordsLoaded) {
      if (entitiesConfigExist()) {
        if (Object.keys(props.hubCentralConfig["modeling"]["entities"]).length) {
          let newCoords = {};
          let allCoordinates = props.hubCentralConfig["modeling"]["entities"];
          Object.keys(allCoordinates).forEach(entity => {
            let entityCoordinates = allCoordinates[entity];
            if (entityCoordinates.graphX && entityCoordinates.graphY) {
              newCoords[entity] = {graphX: entityCoordinates.graphX, graphY: entityCoordinates.graphY};
            }
          });
          setCoords(newCoords);
          setCoordsLoaded(true);
        }
      }
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
        initializeZoomScale();
      }
    }
  }, [network, modelingOptions.view]);

  // Initialize or update graph
  useEffect(() => {
    if (props.entityTypes && props.hubCentralConfig) {
      if (coordinatesExist()) {
        if (physicsEnabled) {
          setPhysicsEnabled(false);
        }
      }

      setGraphData({
        nodes: getNodes(),
        edges: getEdges()
      });

      //Initialize graph zoom scale
      if (network) {
        initializeZoomScale();
      }
      //setSaveAllCoords(true);
      return () => {
        setClickedNode(undefined);
        setMenuPosition({});
        setContextMenuVisible(false);
      };
    }
  }, [props.entityTypes, props.filteredEntityTypes.length, coordsLoaded]);

  const initializeZoomScale = () => {
    if (props.hubCentralConfig?.modeling?.scale) {
      network.moveTo({scale: props.hubCentralConfig.modeling["scale"]});
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

  const getDescription = (entityName) => {
    let entityIndex = props.entityTypes.findIndex(obj => obj.entityName === entityName);
    return props.entityTypes[entityIndex].model.definitions[entityName].description;
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
            id: e.entityName + "-" + p + "-" + parts[parts.length - 1] + "-via-" + pObj.items.joinPropertyName,
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

  const handleZoom = _.debounce((event) => {
    let ZoomScalePayload = defaultHubCentralConfig;
    ZoomScalePayload.modeling["scale"] =  event.scale;
    props.updateHubCentralConfig(ZoomScalePayload);
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
    dragEnd: async (event) => {
      let {nodes} = event;
      if (nodes.length > 0) {
        let positions = network.getPositions([nodes[0]])[nodes[0]];
        if (positions && positions.x && positions.y) {
          let newCoords = {...coords};
          newCoords[nodes[0]] = {graphX: positions.x, graphY: positions.y};
          setCoords(newCoords);
          //props.saveEntityCoords(nodes[0], positions.x, positions.y);
          let coordsPayload = defaultHubCentralConfig;
          coordsPayload.modeling.entities[nodes[0]] =  {graphX: positions.x, graphY: positions.y};
          props.updateHubCentralConfig(coordsPayload);
        }
      } else {
        if (entitiesConfigExist()) {
          let updatedHubCentralConfig: any = defaultHubCentralConfig;
          let entitiesConfig = props.hubCentralConfig["modeling"]["entities"];
          Object.keys(entitiesConfig).forEach(entityName => {
            updatedHubCentralConfig["modeling"]["entities"][entityName] = {graphX: coords[entityName].graphX + event.event.deltaX, graphY: coords[entityName].graphY + event.event.deltaY};
          });
          if (props.updateHubCentralConfig && Object.keys(updatedHubCentralConfig["modeling"]["entities"]).length) {
            await props.updateHubCentralConfig(updatedHubCentralConfig);
            props.setCoordsChanged(true);
          }
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
        // console.info("STABILIZED", event, positions);
        // When graph is stabilized, nodePositions no longer empty
        if (positions && Object.keys(positions).length) {
          saveUnsavedCoords();
          setHasStabilized(true);
          if (physicsEnabled) {
            setPhysicsEnabled(false);
            return false;
          }
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
    },
    zoom: (event) => {
      handleZoom(event);
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
